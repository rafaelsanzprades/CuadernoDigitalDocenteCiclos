"use client";
import { AlertTriangle, ChevronRight, Cloud, Hourglass, Moon, Redo2, Save, Shield, Sun, Undo2, XCircle, CalendarDays } from "lucide-react";
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStates.length, futureStates.length, handleSave]);

  let friendlyModuleName = "—";
  if (activeModuleId) {
    const code = activeModuleId.split('-')[0];
    let foundName = "";
    for (const g of initialGroups) {
      const m = g.modules.find(mod => mod.code === code);
      if (m) { foundName = m.name; break; }
    }
    friendlyModuleName = foundName ? `${code} - ${foundName}` : activeModuleId;
  }

  let friendlyCursoName = "—";
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
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Botón Datos Reales/Ficticios */}
          <div className="shrink-0">
            <Link href="/entorno" className="inline-block transition-transform hover:scale-105">
              {dataSource === 'demo' ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-warning/30 text-warning bg-warning/10 hover:bg-warning/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos ficticios
                </span>
              ) : cloudSynced ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-success/30 text-success bg-success/10 hover:bg-success/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos reales en nube
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-info/30 text-info bg-info/10 hover:bg-info/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos reales
                </span>
              )}
            </Link>
          </div>

          {/* Nombres del módulo y curso (Oculto en pantallas muy pequeñas, con ellipsis si es muy largo) */}
          <div className="hidden sm:flex flex-col border-l border-foreground/10 pl-4 py-1 min-w-0">
            <span className="text-[0.85rem] font-bold text-foreground leading-tight tracking-wide truncate max-w-[200px] md:max-w-[300px] lg:max-w-[450px]" title={friendlyModuleName}>
              {friendlyModuleName}
            </span>
            <span className="text-[0.75rem] text-muted font-medium leading-tight truncate max-w-[200px] md:max-w-[300px] lg:max-w-[450px]" title={friendlyCursoName}>
              {friendlyCursoName}
            </span>
          </div>
        </div>

        {/* Right Side: Guardar + Undo/Redo + Tema */}
        <div className="flex justify-end items-center gap-3 shrink-0">
          {dataSource !== 'demo' && (
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
          )}

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
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className={`p-2 rounded-md transition-colors ${futureStates.length > 0 ? 'text-foreground hover:bg-foreground/10 cursor-pointer' : 'text-muted opacity-50 cursor-not-allowed'}`}
              title="Rehacer (Ctrl+Y)"
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
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center gap-1.5 text-[0.8rem] text-muted tracking-wide">
          <span className="font-medium text-muted text-[0.7rem]">{currentGroup}</span>
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
