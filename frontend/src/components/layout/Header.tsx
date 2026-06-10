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
  const { activeModuleId, activeCursoId, moduleData, cursoData, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sourceType, setSourceType] = useState<"demo" | "local">("demo");
  const [cloudSynced, setCloudSynced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateStates = () => {
      setSourceType(fileManager.getDataSourceType());
      setCloudSynced(fileManager.isGoogleConnected() || fileManager.isOneDriveConnected());
    };
    updateStates();
    window.addEventListener('cdd-datasource-changed', updateStates);
    return () => window.removeEventListener('cdd-datasource-changed', updateStates);
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



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown-group")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Menú superior (Dropdowns) */}
      <nav className="w-full px-6 py-2 flex items-center justify-between">
        {/* Menús */}
        <div className="flex justify-start items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted hover:text-foreground p-2 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          <Link
            href="/agenda"
            className={`px-5 py-2.5 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-3 cursor-pointer group ${pathname === '/agenda' ? 'bg-accent/10 border-accent/30 shadow-[0_0_15px_rgba(var(--accent-color-rgb),0.3)]' : ''}`}
          >
            <div className="flex flex-col items-start gap-1">
              <span className={`text-[0.95rem] font-bold tracking-wide leading-none ${pathname === '/agenda' ? 'text-accent' : 'text-foreground group-hover:text-accent'}`}>Agenda</span>
              <div className="px-2 py-0.5 rounded text-[0.65rem] border font-semibold tracking-wider leading-none text-accent bg-accent/10 border-accent/30">
                {sourceType === 'demo' ? '2/may' : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </Link>

          {navGroups.map(group => {
            let badgeText = "";
            const badgeColor = "text-accent bg-accent/10 border-accent/30";
            
            if (group.title === "Centro educativo" || group.title === "Centro") {
              badgeText = "ciclos-fp";
            } else if (group.title === "Programación" || group.title === "Módulo") {
              let friendlyName = "—";
              if (activeModuleId) {
                const code = activeModuleId.split('-')[0];
                let foundName = "";
                for (const g of initialGroups) {
                  const m = g.modules.find(mod => mod.code === code);
                  if (m) { foundName = m.name; break; }
                }
                friendlyName = foundName ? `${code} - ${foundName.slice(0, 15)}...` : activeModuleId;
              }
              badgeText = friendlyName;
            } else if (group.title === "Curso y alumnado" || group.title === "Curso") {
              let friendlyName = "—";
              if (activeCursoId) {
                const parts = activeCursoId.split('-');
                const code = parts[0];
                const year = parts[parts.length - 1];
                let foundName = "";
                for (const g of initialGroups) {
                  if (g.modules.some(m => m.code === code)) { foundName = g.name; break; }
                }
                friendlyName = foundName ? `${foundName.slice(0, 15)}... (${year})` : activeCursoId;
              }
              badgeText = friendlyName;
            }

            const isOpen = activeDropdown === group.title;

            return (
              <div key={group.title} className="relative dropdown-group">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : group.title)}
                  className="px-5 py-2.5 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[0.95rem] font-bold tracking-wide text-foreground leading-none">{group.title}</span>
                    {badgeText ? (
                      <div className={`px-2 py-0.5 rounded text-[0.65rem] border font-semibold tracking-wider leading-none ${badgeColor}`}>
                        {badgeText}
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded text-[0.65rem] border border-transparent font-semibold tracking-wider leading-none opacity-0 select-none">
                        -
                      </div>
                    )}
                  </div>
                  <span className={`text-[0.55rem] text-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-foreground' : ''}`}>▼</span>
                </button>

                {/* Dropdown menu */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-background border border-[var(--glass-border)] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] py-2 z-50 transition-all duration-200 ${isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
                  }`}>
                  {group.items.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors ${isActive ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-info' : 'border-l-2 border-transparent'}`}
                      >
                        <span className="flex items-center justify-center w-5 h-5"><item.icon className="w-5 h-5" strokeWidth={1.75} /></span>
                        <span className={`text-[0.85rem] ${isActive ? 'text-foreground font-bold' : 'text-foreground/80 font-medium'}`}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Guardar + Undo/Redo + Tema (Derecha) */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {sourceType !== 'demo' && (
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

          {moduleData && sourceType !== 'demo' && (
            <div className="flex items-center">
              {autosaveStatus === "saved" && <span className="text-success text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Guardado</span>}
              {autosaveStatus === "saving" && <span className="text-warning text-sm font-medium animate-pulse">⏳ Guardando...</span>}
              {autosaveStatus === "error" && <span className="text-danger text-sm font-medium"><span className="inline-flex"><XCircle className="w-[1.2em] h-[1.2em] mr-1" /></span> Error al guardar</span>}
              {autosaveStatus === "idle" && <span className="text-[var(--text-muted)] text-sm font-medium"><span className="inline-flex"><Cloud className="w-[1.2em] h-[1.2em] mr-1" /></span> Sincronizado</span>}
            </div>
          )}

          <div>
            <Link href="/entorno" className="inline-block transition-transform hover:scale-105">
              {sourceType === 'demo' ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-warning/30 text-warning bg-warning/10 hover:bg-warning/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos ficticios
                </span>
              ) : cloudSynced ? (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-success/30 text-success bg-success/10 hover:bg-success/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos reales en nube
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wider border border-info/30 text-info bg-info/10 hover:bg-info/10 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  <span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> Datos reales en local
                </span>
              )}
            </Link>
          </div>

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
