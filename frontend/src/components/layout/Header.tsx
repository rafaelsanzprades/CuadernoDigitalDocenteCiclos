"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Sun, Moon, ChevronRight } from "lucide-react";
import { navGroups } from "@/config/navigation";
import { initialGroups } from "@/store/initialData";
import { showRichToast } from "@/utils/toast";
import { motion } from "framer-motion";
import { fileManager } from "@/services/fileManager";


export default function Header({ title, breadcrumbSuffix }: { title?: string; breadcrumbSuffix?: string }) {
  const { activeModuleId, activeCursoId, moduleData, cursoData, saveModuleData, saveCursoData, isSidebarOpen, toggleSidebar } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

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
  for (const group of navGroups) {
    const found = group.items.find(item => item.href === pathname);
    if (found) {
      currentGroup = group.title;
      currentItem = found.label;
      break;
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

  const handleSave = async () => {
    setIsSaving(true);
    let ok = false;
    if (moduleData && activeModuleId) {
      ok = await saveModuleData();
    }
    if (cursoData && activeCursoId) {
      const cursoOk = await saveCursoData();
      ok = ok || cursoOk;
    }
    if (ok) {
      showRichToast.success(`Guardado con éxito`, `Datos actualizados.`);
    } else {
      showRichToast.error("Error al guardar", "Revisa la conexión o los datos.");
    }
    setIsSaving(false);
  };

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
          {navGroups.map(group => {
            let badgeText = "";
            let badgeColor = "";
            if (group.title === "Centro educativo" || group.title === "Centro") {
              badgeText = "ciclos-fp";
              badgeColor = "text-purple-300 bg-purple-500/10 border-purple-500/30";
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
              badgeColor = "text-[#14a085] bg-[#14a085]/10 border-[#14a085]/30";
            } else if (group.title === "Curso y alumnadodo" || group.title === "Curso") {
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
              badgeColor = "text-blue-300 bg-blue-500/10 border-blue-500/30";
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
                      <div className={`px-2 py-0.5 rounded text-[0.65rem] border font-semibold tracking-wider uppercase leading-none ${badgeColor}`}>
                        {badgeText}
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded text-[0.65rem] border border-transparent font-semibold tracking-wider uppercase leading-none opacity-0 select-none">
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
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-foreground/5 transition-colors ${isActive ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-400' : 'border-l-2 border-transparent'}`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className={`text-[0.85rem] ${isActive ? 'text-foreground font-bold' : 'text-foreground/80 font-medium'}`}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón Guardar + Login/Logout + Tema (Derecha) */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <div className="mr-1">
            <Link href="/entorno" className="inline-block transition-transform hover:scale-105">
              {sourceType === 'demo' ? (
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  ⚠️ MODO DEMO
                </span>
              ) : cloudSynced ? (
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase border border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  🛡️ LOCAL + NUBE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase border border-blue-500/30 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 cursor-pointer flex items-center gap-1 transition-all" title="Haz clic para configurar tu Entorno de Trabajo">
                  🛡️ DATOS LOCALES
                </span>
              )}
            </Link>
          </div>

          {moduleData && (
            <div className="mr-2 flex items-center">
              {autosaveStatus === "saved" && <span className="text-green-500 text-sm font-medium">☁️ Guardado</span>}
              {autosaveStatus === "saving" && <span className="text-amber-500 text-sm font-medium animate-pulse">⏳ Guardando...</span>}
              {autosaveStatus === "error" && <span className="text-red-500 text-sm font-medium">❌ Error al guardar</span>}
              {autosaveStatus === "idle" && <span className="text-[var(--text-muted)] text-sm font-medium">☁️ Sincronizado</span>}
            </div>
          )}

          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-button text-gray-300 hover:text-amber-400 p-2 rounded-lg flex items-center justify-center transition-colors"
              title="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="glass-button bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/30 hover:bg-[var(--accent-color)]/20 font-semibold py-1.5 px-4 text-sm rounded-lg flex items-center gap-2 transition-all"
          >
            <span>{isSaving ? "⏳" : "💾"}</span>
            {isSaving ? "Guardando..." : "Guardar"}
          </motion.button>
        </div>
      </nav>

      {currentGroup && currentItem && (
        <div className="w-full px-6 py-1.5 bg-white/[0.02] border-t border-[var(--glass-border)] flex items-center gap-1.5 text-[0.8rem] text-muted tracking-wide">
          <span className="font-medium text-muted uppercase text-[0.7rem]">{currentGroup}</span>
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
