"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Sun, Moon } from "lucide-react";

const navGroups = [
  {
    title: "Centro educativo",
    items: [
      { href: "/", label: "Gestión de archivos", icon: "📁" },
      { href: "/introduccion", label: "Introducción. Planes", icon: "📝" },
      { href: "/calendario", label: "Calendario académico", icon: "🗓️" },
      { href: "/descargas", label: "Descargas PDF", icon: "📥" }
    ]
  },
  {
    title: "Módulo didáctico",
    items: [
      { href: "/modulo", label: "Configuración. Datos", icon: "⚙️" },
      { href: "/matrices", label: "Matrices RA→CE→UD", icon: "🧮" },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: "🛠️" },
      { href: "/programacion", label: "Programación de aula", icon: "📚" },
      { href: "/seguimiento", label: "Seguimiento diario", icon: "📍" }
    ]
  },
  {
    title: "Curso y alumnado",
    items: [
      { href: "/matricula", label: "Matrícula alumnado", icon: "👥" },
      { href: "/calificacion", label: "Calificación académica", icon: "📊" },
      { href: "/calificacion-feoe", label: "Calificación FEOE", icon: "🏢" },
      { href: "/evaluacion", label: "Evaluación por RA", icon: "📈" },
      { href: "/analisis", label: "Análisis grupal", icon: "📉" },
      { href: "/portal", label: "Portal alumnado", icon: "🎓" }
    ]
  }
];

export default function Header({ title }: { title?: string }) {
  const { activeModuleId, activeCursoId, moduleData, isLoggedIn, logout } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef<boolean>(true);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown-group")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Autosave Effect
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
      try {
        const res = await fetch(`/api/module/${activeModuleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moduleData)
        });
        const data = await res.json();
        if (data.status === "success") {
          setAutosaveStatus("saved");
          setTimeout(() => setAutosaveStatus("idle"), 2000);
        } else {
          setAutosaveStatus("error");
        }
      } catch (err) {
        setAutosaveStatus("error");
      }
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [moduleData]); // Solo vigilar cambios en moduleData

  const handleSave = async () => {
    if (!moduleData) {
      toast.error("No hay módulo cargado para guardar");
      return;
    }
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/module/${activeModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData)
      });
      const data = await res.json();
      if (data.status === "success") {
        toast.success(`Módulo ${activeModuleId} guardado con éxito`);
      } else {
        toast.error("Error al guardar el módulo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Fallo de conexión al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col z-40 sticky top-0 bg-[#0b1120]/95 backdrop-blur-xl border-b border-[var(--glass-border)] pb-2 shadow-md">
      {/* Menú superior (Dropdowns) */}
      <nav className="w-full px-6 py-2 flex items-center justify-between">
        {/* Menús */}
        <div className="flex justify-start items-center gap-4">
          {navGroups.map(group => {
            let badgeText = "";
            let badgeColor = "";
            if (group.title === "Centro educativo" || group.title === "Centro") {
              badgeText = "ciclos-fp";
              badgeColor = "text-purple-300 bg-purple-500/10 border-purple-500/30";
            } else if (group.title === "Módulo didáctico" || group.title === "Módulo") {
              badgeText = activeModuleId || "—";
              badgeColor = "text-[#14a085] bg-[#14a085]/10 border-[#14a085]/30";
            } else if (group.title === "Curso y alumnado" || group.title === "Curso") {
              badgeText = activeCursoId || "—";
              badgeColor = "text-blue-300 bg-blue-500/10 border-blue-500/30";
            }

            const isOpen = activeDropdown === group.title;

            return (
              <div key={group.title} className="relative dropdown-group">
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : group.title)}
                  className="text-[1.1rem] font-bold tracking-wide text-white px-5 py-2.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-3 cursor-pointer"
                >
                  {group.title}
                  {badgeText && (
                    <div className={`px-2 py-0.5 rounded text-[0.65rem] border font-semibold tracking-wider uppercase ${badgeColor}`}>
                      {badgeText}
                    </div>
                  )}
                  <span className={`text-[0.55rem] text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`}>▼</span>
                </button>

                {/* Dropdown menu */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-[#0b1120] border border-[var(--glass-border)] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] py-2 z-50 transition-all duration-200 ${isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
                  }`}>
                  {group.items.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${isActive ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-400' : 'border-l-2 border-transparent'}`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className={`text-[0.85rem] ${isActive ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{item.label}</span>
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
          
          {moduleData && (
            <div className="mr-2 flex items-center">
              {autosaveStatus === "saved" && <span className="text-green-500 text-sm font-medium">☁️ Guardado</span>}
              {autosaveStatus === "saving" && <span className="text-amber-500 text-sm font-medium animate-pulse">⏳ Guardando...</span>}
              {autosaveStatus === "error" && <span className="text-red-500 text-sm font-medium">❌ Error al guardar</span>}
              {autosaveStatus === "idle" && <span className="text-[var(--text-muted)] text-sm font-medium">☁️ Sincronizado</span>}
            </div>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-button text-gray-300 hover:text-amber-400 p-2 rounded-lg flex items-center justify-center transition-colors"
              title="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="glass-button bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/30 hover:bg-[var(--accent-color)]/20 font-semibold py-1.5 px-4 text-sm rounded-lg flex items-center gap-2 transition-all"
          >
            <span>{isSaving ? "⏳" : "💾"}</span>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={() => {
              if (isLoggedIn) {
                logout();
                toast("Sesión cerrada", { icon: "👋" });
              } else {
                router.push("/perfiles");
              }
            }}
            className="glass-button text-[var(--foreground)] font-semibold py-1.5 px-4 text-sm rounded-lg flex items-center gap-2 hover:bg-black/10 transition-colors"
          >
            <span>{isLoggedIn ? "🔒" : "👤"}</span>
            {isLoggedIn ? "Cerrar" : "Sesión"}
          </button>
        </div>
      </nav>

      {title && (
        <header className="w-full flex items-center justify-center px-8 pt-4 pb-2">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-[#0b1120]/50 backdrop-blur-sm">
            <h2 className="text-3xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </header>
      )}
    </div>
  );
}
