"use client";
import { AlertTriangle, ChevronRight, Cloud, Hourglass, Moon, Redo2, Save, Shield, Sun, Undo2, XCircle, CalendarDays, FolderOpen } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore, useTemporalStore } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { navGroups } from "@/config/navigation";
import { initialGroups } from "@/store/initialData";
import { showRichToast } from "@/utils/toast";
import { motion } from "framer-motion";
import { fileManager } from "@/services/fileManager";
import { searchGlobal, type SearchResult } from "@/services/searchService";


export default function Header({ title, breadcrumbSuffix }: { title?: React.ReactNode; breadcrumbSuffix?: React.ReactNode }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  
  // Estado para búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateStates = () => {
      setCloudSynced(fileManager.isGoogleConnected() || fileManager.isOneDriveConnected());
    };
    updateStates();
  }, []);

  let currentGroup = "";
  let currentItem = "";
  if (pathname === '/agenda') {
    currentGroup = "Agenda";
    currentItem = "Agenda de clase";
  } else {
    for (const group of navGroups) {
      const found = group.items.find(item => item.href === pathname);
      if (found) {
        currentGroup = group.title;
        currentItem = found.label;
        break;
      }
    }
  }


  // Autosave Effect for moduleData
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (!moduleData || !activeModuleId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setAutosaveStatus("idle");

    saveTimeoutRef.current = setTimeout(async () => {
      setAutosaveStatus("saving");
      const ok = await saveModuleData();
      if (ok) {
        setAutosaveStatus("saved");
        setTimeout(() => setAutosaveStatus("idle"), 2000);
      } else {
        setAutosaveStatus("error");
      }
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [moduleData, activeModuleId, saveModuleData]);

  // Autosave Effect for cursoData
  useEffect(() => {
    if (!cursoData || !activeCursoId) return;

    if (cursoSaveTimeoutRef.current) {
      clearTimeout(cursoSaveTimeoutRef.current);
    }

    cursoSaveTimeoutRef.current = setTimeout(async () => {
      await saveCursoData();
    }, 3000);

    return () => {
      if (cursoSaveTimeoutRef.current) clearTimeout(cursoSaveTimeoutRef.current);
    };
  }, [cursoData, activeCursoId, saveCursoData]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    let ok: boolean | "conflict" = false;
    let cursoOk: boolean | "conflict" = false;
    
    if (moduleData && activeModuleId) {
      ok = await saveModuleData();
    }
    if (cursoData && activeCursoId) {
      cursoOk = await saveCursoData();
      ok = (ok === true || cursoOk === true) ? true : (ok === "conflict" || cursoOk === "conflict" ? "conflict" : false);
    }
    
    if (ok === "conflict") {
      showRichToast.error("Conflicto de versiones", "Los datos están obsoletos. Por favor, recarga la página.");
    } else if (ok === true) {
      showRichToast.success(`Guardado con éxito`, `Datos actualizados.`);
    } else {
      showRichToast.error("Error al guardar", "Revisa la conexión o los datos.");
    }
    setIsSaving(false);
  }, [moduleData, activeModuleId, cursoData, activeCursoId, saveModuleData, saveCursoData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (futureStates.length > 0) redo();
        } else {
          if (pastStates.length > 0) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (futureStates.length > 0) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[placeholder="Buscar..." aria-label="Buscar en la aplicación" role="searchbox"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Navigate to help
        router.push('/ayuda');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle command palette (placeholder)
        toast('Comando palette no implementado aún');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStates.length, futureStates.length, handleSave]);

  let friendlyModuleName = "xxxx - Nombre módulo";
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    let foundName = "";
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m) { foundName = m.name; break; }
    }
    friendlyModuleName = foundName ? `${code} - ${foundName}` : activeModuleId;
  }

  let friendlyCursoName = "xº Título";
  if (activeCursoId) {
    const parts = activeCursoId.split('-');
    const code = parts[0];
    const year = parts[parts.length - 1];
    let foundName = "";
    for (const g of initialGroups) {
      if (g.modules.some(m => m.code === code)) { foundName = g.name; break; }
    }
    friendlyCursoName = foundName ? `${foundName} (${year})` : activeCursoId;
  }

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Menú superior */}
      <nav className="w-full px-6 py-2 flex items-center justify-between">
        {/* Left Side: Mobile Hamburger + Datos Reales/Ficticios + Module Info */}
        <div className="flex justify-start items-center gap-4 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted hover:text-foreground p-2 rounded-lg hover:bg-foreground/5 transition-colors shrink-0"
            aria-label="Toggle sidebar" aria-expanded={isSidebarOpen} aria-controls="sidebar" tabIndex={0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Botón Datos Reales/Ficticios (Entorno de trabajo) */}
          <div className="shrink-0 flex items-center gap-3">
            <Link 
              href="/entorno" 
              className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-150 group shadow-sm border ${
                dataSource === 'demo' 
                  ? 'bg-warning/10 border-warning/40 text-foreground hover:bg-warning/20' 
                  : cloudSynced 
                    ? 'bg-success/10 border-success/40 text-foreground hover:bg-success/20'
                    : 'bg-info/10 border-info/40 text-foreground hover:bg-info/20'
              }`}
              title="Haz clic para configurar tu Entorno de Trabajo"
            >
              <span className={`flex items-center justify-center transition-transform duration-150 ${
                pathname === '/entorno' 
                  ? (dataSource === 'demo' ? 'scale-110 text-warning' : cloudSynced ? 'scale-110 text-success' : 'scale-110 text-info') 
                  : (dataSource === 'demo' ? 'text-warning group-hover:scale-110' : cloudSynced ? 'text-success group-hover:scale-110' : 'text-info group-hover:scale-110')
              }`}>
                <FolderOpen className="w-5 h-5" strokeWidth={2} />
              </span>
              <div className="flex flex-col gap-1 items-start">
                <span className={`text-base leading-tight whitespace-nowrap font-extrabold ${
                  pathname === '/entorno' 
                    ? (dataSource === 'demo' ? 'text-warning' : cloudSynced ? 'text-success' : 'text-info') 
                    : ''
                }`}>
                  Entorno
                </span>
                <span className={`px-2.5 py-1 rounded text-sm border font-bold tracking-wide leading-none ${
                  dataSource === 'demo' 
                    ? 'text-warning bg-warning/10 border-warning/30' 
                    : cloudSynced
                      ? 'text-success bg-success/10 border-success/30'
                      : 'text-info bg-info/10 border-info/30'
                }`}>
                  {dataSource === 'demo' ? 'Datos DEMO' : cloudSynced ? 'Datos en nube' : 'Datos Reales'}
                </span>
              </div>
            </Link>
          </div>

          {/* Nombres del módulo y curso (Oculto en pantallas muy pequeñas, con ellipsis si es muy largo) */}
          <div className="hidden sm:flex flex-col border-l border-foreground/10 pl-4 py-1 min-w-0">
            <span className="text-[0.95rem] font-bold text-foreground leading-tight tracking-wide truncate max-w-[200px] md:max-w-[300px] lg:max-w-[450px]" title={friendlyModuleName}>
              {friendlyModuleName}
            </span>
            <span className="text-[0.85rem] text-muted font-medium leading-tight truncate max-w-[200px] md:max-w-[300px] lg:max-w-[450px]" title={friendlyCursoName}>
              {friendlyCursoName}
            </span>
          </div>
        </div>

          {/* Botón Guardar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="glass-button bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/30 hover:bg-[var(--accent-color)]/20 font-semibold py-1.5 px-4 text-sm rounded-lg flex items-center gap-2 transition-all"
          >
            <span>{isSaving ? <><span className="inline-flex"><Hourglass className="w-[1.2em] h-[1.2em] mr-1" /></span></> : <><span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}</span>
            {isSaving ? "Guardando..." : "Guardar"}
          </motion.button>

          {/* Búsqueda global - ocupa todo el espacio disponible */}
          <div className="relative flex-1 min-w-0 mx-4">
            <input
              type="text"
              placeholder="Buscar..."
              aria-label="Buscar en la aplicación"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                const results = searchGlobal(query);
                setSearchResults(results);
                setShowResults(results.length > 0);
              }}
              onFocus={() => setShowResults(searchResults.length > 0)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-accent/50 w-full"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-foreground/10 cursor-pointer text-sm"
                    onClick={() => {
                      if (result.href) {
                        router.push(result.href);
                        setSearchQuery("");
                        setShowResults(false);
                      }
                    }}
                  >
                    <div className="font-medium text-[var(--text-primary)]">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-[var(--text-muted)]">{result.subtitle}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        {/* Right Side: Undo/Redo + Tema */}
        <div className="flex justify-end items-center gap-3 shrink-0">
          {moduleData && dataSource !== 'demo' && (
            <div className="hidden md:flex items-center">
              {autosaveStatus === "saved" && <span className="text-success text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Guardado</span>}
              {autosaveStatus === "saving" && <span className="text-warning text-sm font-medium animate-pulse">⏳ Guardando...</span>}
              {autosaveStatus === "error" && <span className="text-danger text-sm font-medium"><span className="inline-flex"><XCircle className="w-[1.2em] h-[1.2em] mr-1" /></span> Error al guardar</span>}
              {autosaveStatus === "idle" && <span className="text-[var(--text-muted)] text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Sincronizado</span>}
            </div>
          )}

          <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-lg">
            <button
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className={`p-2 rounded-md transition-colors ${pastStates.length > 0 ? 'text-foreground hover:bg-foreground/10 cursor-pointer' : 'text-muted opacity-50 cursor-not-allowed'}`}
              title="Deshacer (Ctrl+Z)" aria-label="Deshacer" tabIndex={0}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className={`p-2 rounded-md transition-colors ${futureStates.length > 0 ? 'text-foreground hover:bg-foreground/10 cursor-pointer' : 'text-muted opacity-50 cursor-not-allowed'}`}
              title="Rehacer (Ctrl+Y)" aria-label="Rehacer" tabIndex={0}
            >
              <Redo2 size={16} />
            </button>
          </div>


          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-button text-gray-300 hover:text-warning p-2 rounded-lg flex items-center justify-center transition-colors"
              title="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          )}
        </div>
      </nav>

      {currentGroup && currentItem && (
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center gap-1.5 text-sm text-muted tracking-wide">
          <span className="font-medium text-muted text-xs">{currentGroup}</span>
          <ChevronRight className="w-3 h-3 text-muted/80" />
          <span className="text-foreground/90 font-semibold">{currentItem}</span>
          {breadcrumbSuffix && (
            <>
              <ChevronRight className="w-3 h-3 text-muted/80" />
              <span className="text-foreground/90 font-semibold">{breadcrumbSuffix}</span>
            </>
          )}
        </div>
      )}

      {title && (
        <header className="w-full flex items-center justify-center px-8 pt-4 pb-2">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-background/50 backdrop-blur-sm">
            <h2 className="text-3xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </header>
      )}
    </div>
  );
}
