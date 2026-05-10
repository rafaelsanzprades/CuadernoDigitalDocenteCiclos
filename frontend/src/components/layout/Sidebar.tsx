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

      <nav className="flex-1 overflow-y-auto mt-4 px-4 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Menú principal</div>
        <Link href="/" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/' ? 'bg-white/10 text-white font-semibold border-l-4 border-l-white' : 'text-gray-300 hover:bg-white/5'}`}>
          Gestión de archivos
        </Link>
        <Link href="/modulo" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/modulo' ? 'bg-[#14a085]/20 text-[#14a085] font-semibold border-l-4 border-l-[#14a085]' : 'text-gray-300 hover:bg-white/5'}`}>
          Módulo didáctico
        </Link>
        <Link href="/matrices" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/matrices' ? 'bg-white/10 text-white font-semibold border-l-4 border-l-white' : 'text-gray-300 hover:bg-white/5'}`}>
          Matrices
        </Link>
        <Link href="/seguimiento" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/seguimiento' ? 'bg-white/10 text-white font-semibold border-l-4 border-l-white' : 'text-gray-300 hover:bg-white/5'}`}>
          Seguimiento diario
        </Link>
        <Link href="/evaluacion" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/evaluacion' ? 'bg-white/10 text-white font-semibold border-l-4 border-l-white' : 'text-gray-300 hover:bg-white/5'}`}>
          Evaluación continua
        </Link>
        <Link href="/instrumentos" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/instrumentos' ? 'bg-[#14a085]/20 text-[#14a085] font-semibold border-l-4 border-l-[#14a085]' : 'text-gray-300 hover:bg-white/5'}`}>
          Instrumentos de evaluación
        </Link>
        <Link href="/programacion" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/programacion' ? 'bg-[#14a085]/20 text-[#14a085] font-semibold border-l-4 border-l-[#14a085]' : 'text-gray-300 hover:bg-white/5'}`}>
          Programación de aula
        </Link>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-2">Gestión del Curso</div>
        <Link href="/matricula" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/matricula' ? 'bg-blue-500/20 text-blue-400 font-semibold border-l-4 border-l-blue-400' : 'text-gray-300 hover:bg-white/5'}`}>
          Matrícula alumnado
        </Link>
        <Link href="/calificacion" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/calificacion' ? 'bg-blue-500/20 text-blue-400 font-semibold border-l-4 border-l-blue-400' : 'text-gray-300 hover:bg-white/5'}`}>
          Calificación académica
        </Link>
        <Link href="/calificacion-feoe" className={`block px-4 py-3 text-sm rounded-lg transition-colors ${pathname === '/calificacion-feoe' ? 'bg-blue-500/20 text-blue-400 font-semibold border-l-4 border-l-blue-400' : 'text-gray-300 hover:bg-white/5'}`}>
          Calificación FEOE
        </Link>
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
