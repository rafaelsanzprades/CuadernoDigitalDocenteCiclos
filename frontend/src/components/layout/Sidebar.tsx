"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeModuleId, activeCursoId } = useAppStore();

  return (
    <aside className="w-80 h-screen border-r border-[var(--glass-border)] bg-[#0b1120] flex flex-col flex-shrink-0">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-extrabold leading-tight text-white mb-6 tracking-tight">
          Cuaderno Digital Docente Ciclos
        </h1>
        
        {/* Module Active Indicator */}
        <div className="glass-card p-4 mb-2">
          <div className="text-[0.68rem] text-[#14a085] font-semibold tracking-wide mb-1 uppercase">
            🗒️ PD Activa
          </div>
          <div className="text-sm text-white font-bold truncate">
            {activeModuleId || "Ninguna PD seleccionada"}
          </div>
        </div>

        {/* Curso Active Indicator */}
        <div className="glass-card p-4 border-t-2 border-t-blue-500/50">
          <div className="text-[0.68rem] text-blue-400 font-semibold tracking-wide mb-1 uppercase">
            📅 Curso Activo
          </div>
          <div className="text-sm text-white font-bold truncate">
            {activeCursoId || "Ningún Curso seleccionado"}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${pathname === item.href 
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
          >
            <span className={`text-xl transition-transform duration-200 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className={`font-medium ${pathname === item.href ? 'text-white font-semibold' : ''}`}>
              {item.label}
            </span>
            {pathname === item.href && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-[var(--glass-border)] mt-auto">
        <button className="w-full glass-button text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2">
          <span>🚪</span> Cerrar sesión
        </button>
        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} Rafael Sanz Prades
        </p>
      </div>
    </aside>
  );
}
