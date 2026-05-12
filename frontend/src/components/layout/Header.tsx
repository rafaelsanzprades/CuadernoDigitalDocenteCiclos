"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    title: "GENERAL",
    items: [
      { href: "/", label: "Gestión de archivos", icon: "📁" },
      { href: "/descargas", label: "Descargas PDF", icon: "📥" }
    ]
  },
  {
    title: "CENTRO",
    items: [
      { href: "/introduccion", label: "Introducción y planes", icon: "📝" },
      { href: "/calendario", label: "Calendario académico", icon: "🗓️" }
    ]
  },
  {
    title: "APRENDIZAJE",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: "⚙️" },
      { href: "/matrices", label: "Matrices RA → CE → UD", icon: "🧮" },
      { href: "/matricula", label: "Matrícula alumnado", icon: "👥" },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: "🛠️" }
    ]
  },
  {
    title: "CLASES",
    items: [
      { href: "/programacion", label: "Programación de aula", icon: "📚" },
      { href: "/seguimiento", label: "Seguimiento diario", icon: "📍" }
    ]
  },
  {
    title: "EVALUACIÓN",
    items: [
      { href: "/calificacion", label: "Calificación académica", icon: "📊" },
      { href: "/calificacion-feoe", label: "Calificación FEOE", icon: "🏢" },
      { href: "/evaluacion", label: "Evaluación continua", icon: "📈" },
      { href: "/analisis", label: "Análisis de grupo", icon: "📉" },
      { href: "/portal", label: "Portal alumnado", icon: "🎓" }
    ]
  }
];

export default function Header({ title }: { title?: string }) {
  const { activeModuleId, moduleData } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saved" | "error">("idle");
  const pathname = usePathname();

  const handleSave = async () => {
    if (!moduleData) return;
    setIsSaving(true);
    setSavedStatus("idle");
    try {
      const res = await fetch(`/api/module/${activeModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData)
      });
      const data = await res.json();
      if (data.status === "success") {
        setSavedStatus("saved");
        setTimeout(() => setSavedStatus("idle"), 3000);
      } else {
        setSavedStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSavedStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col z-40 relative">
      {/* Menú superior (Dropdowns) */}
      <nav className="w-full bg-[#0b1120]/80 backdrop-blur-md border-b border-[var(--glass-border)] px-6 py-2 flex justify-center items-center gap-4">
        {navGroups.map(group => (
          <div key={group.title} className="relative group">
            <button className="text-[0.7rem] font-bold tracking-widest text-gray-400 hover:text-white px-5 py-2.5 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 uppercase">
              {group.title}
              <span className="text-[0.55rem] text-gray-500 group-hover:text-white transition-colors">▼</span>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible w-64 bg-[#0b1120] border border-[var(--glass-border)] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] py-2 z-50 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 before:absolute before:top-[-10px] before:left-0 before:w-full before:h-[10px] before:content-['']">
              {group.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${isActive ? 'bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-400' : 'border-l-2 border-transparent'}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-[0.85rem] ${isActive ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <header className="w-full flex items-center justify-between p-8 pb-4 gap-4">
        <div className="hidden lg:block flex-1"></div>
        
        {title && (
          <div className="flex-shrink-0 flex justify-center">
            <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)] bg-[#0b1120]/50 backdrop-blur-sm">
              <h2 className="text-3xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
                {title}
              </h2>
            </div>
          </div>
        )}

        <div className="flex-1 flex justify-end items-center gap-3">
          {savedStatus === "error" && <span className="text-red-400 text-sm font-bold">❌ Error</span>}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`glass-button ${savedStatus === "saved" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-[#14a085]/10 text-[#14a085] border-[#14a085]/30 hover:bg-[#14a085]/20"} font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all`}>
            <span>{isSaving ? "⏳" : (savedStatus === "saved" ? "✅" : "💾")}</span> 
            {isSaving ? "Guardando..." : (savedStatus === "saved" ? "¡Guardado!" : "Guardar")}
          </button>
          <button className="glass-button text-gray-300 font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2">
            <span>🔓</span> Activado
          </button>
        </div>
      </header>
    </div>
  );
}
