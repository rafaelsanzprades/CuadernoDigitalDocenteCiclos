"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

const navGroups = [
  {
    title: "Centro",
    items: [
      { href: "/", label: "Gestión de archivos", icon: "📁" },
      { href: "/introduccion", label: "Introducción y planes", icon: "📝" },
      { href: "/calendario", label: "Calendario académico", icon: "🗓️" },
      { href: "/descargas", label: "Descargas PDF", icon: "📥" }
    ]
  },
  {
    title: "Módulo",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: "⚙️" },
      { href: "/matrices", label: "Matrices RA→CE→UD", icon: "🧮" },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: "🛠️" },
      { href: "/programacion", label: "Programación de aula", icon: "📚" },
      { href: "/seguimiento", label: "Seguimiento diario", icon: "📍" }
    ]
  },
  {
    title: "Curso",
    items: [
      { href: "/matricula", label: "Matrícula alumnado", icon: "👥" },
      { href: "/calificacion", label: "Calificación académica", icon: "📊" },
      { href: "/calificacion-feoe", label: "Calificación FEOE", icon: "🏢" },
      { href: "/evaluacion", label: "Evaluación continua", icon: "📈" },
      { href: "/analisis", label: "Análisis de grupo", icon: "📉" },
      { href: "/portal", label: "Portal alumnado", icon: "🎓" }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'} h-screen border-r border-[var(--glass-border)] bg-[#0b1120] flex flex-col flex-shrink-0 transition-all duration-300 z-50`}>
      {/* Header compacto */}
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-center`}>
        {isSidebarOpen && (
          <h1 className="text-base font-extrabold leading-tight text-white mb-3 tracking-tight whitespace-nowrap">
            Cuaderno Digital<br/>
            <span className="text-[#14a085]">Docente Ciclos</span>
          </h1>
        )}
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors mb-3">
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="px-4 pb-2">
          {/* Badges apilados verticalmente */}
          <div className="flex flex-col gap-1.5 mb-1">
            <div className="bg-white/5 border border-[#14a085]/30 rounded-lg px-2 py-1.5">
              <div className="text-[0.6rem] text-[#14a085] font-bold tracking-wide mb-0.5">Programación didáctica</div>
              <div className="text-xs text-white font-semibold truncate">{activeModuleId || "—"}</div>
            </div>
            <div className="bg-white/5 border border-blue-500/30 rounded-lg px-2 py-1.5">
              <div className="text-[0.6rem] text-blue-400 font-bold tracking-wide mb-0.5">Curso y alumnado</div>
              <div className="text-xs text-white font-semibold truncate">{activeCursoId || "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav sin overflow */}
      <nav className={`flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-4 overflow-x-hidden overflow-y-auto scrollbar-hide`}>
        {navGroups.map((group, idx) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            {isSidebarOpen && (
              <div className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1 mt-1">
                {group.title}
              </div>
            )}
            {!isSidebarOpen && idx > 0 && (
              <div className="w-8 h-px bg-white/10 mx-auto my-2" />
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-150 group
                  ${pathname === item.href
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-sm shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <span className={`text-base leading-none transition-transform duration-150 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <>
                    <span className={`text-[0.8rem] leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-white font-semibold' : ''}`}>
                      {item.label}
                    </span>
                    {pathname === item.href && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)] flex-shrink-0" />
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer compacto */}
      <div className={`px-4 py-3 border-t border-[var(--glass-border)] flex flex-col items-center`}>
        <button title={!isSidebarOpen ? "Cerrar sesión" : undefined} className={`w-full glass-button text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-2 ${isSidebarOpen ? 'px-3' : 'px-0'}`}>
          <span className="text-base">🚪</span> {isSidebarOpen && <span>Cerrar sesión</span>}
        </button>
        {isSidebarOpen && (
          <p className="text-center text-[0.65rem] text-gray-600 mt-2 whitespace-nowrap">
            © {new Date().getFullYear()} Rafael Sanz Prades
          </p>
        )}
      </div>
    </aside>
  );
}
