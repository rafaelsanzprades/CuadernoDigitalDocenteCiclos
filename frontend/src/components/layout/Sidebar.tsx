"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { navGroups } from '@/config/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'} sticky top-0 h-screen border-r border-[var(--glass-border)] bg-background flex flex-col flex-shrink-0 transition-all duration-300 z-50`}>
      {/* Header compacto */}
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-center`}>
        {isSidebarOpen && (
          <Link href="/">
            <h1 className="text-[1.3rem] font-extrabold leading-tight text-foreground hover:text-blue-400 transition-colors mb-4 tracking-tight whitespace-nowrap cursor-pointer">
              Cuaderno Ciclos FP
            </h1>
          </Link>
        )}
        <button onClick={toggleSidebar} className="text-muted hover:text-foreground p-1 rounded-md hover:bg-foreground/10 transition-colors mb-3">
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Botón Hoy */}
      {isSidebarOpen && (
        <div className="px-4 pb-3">
          <Link href="/hoy" className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 hover:border-accent/40 rounded-md text-sm font-bold transition-all shadow-[0_0_10px_rgba(26,188,156,0.1)] hover:shadow-[0_0_15px_rgba(26,188,156,0.2)]">
            <span>📅</span> Tu día y semana
          </Link>
        </div>
      )}


      {/* Nav sin overflow */}
      <nav className={`flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-4 overflow-x-hidden overflow-y-auto scrollbar-hide`}>
        {navGroups.map((group, idx) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            {isSidebarOpen && (
              <div className="text-[0.95rem] font-bold text-foreground tracking-wide px-3 mb-2 mt-2">
                {group.title}
              </div>
            )}
            {!isSidebarOpen && idx > 0 && (
              <div className="w-8 h-px bg-foreground/10 mx-auto my-2" />
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href === "#wizard") {
                    e.preventDefault();
                    useAppStore.getState().setWizardOpen(true);
                  }
                }}
                title={!isSidebarOpen ? item.label : undefined}
                className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-150 group
                  ${pathname === item.href
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-foreground shadow-sm shadow-blue-500/10'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                  }`}
              >
                <span className={`text-base leading-none transition-transform duration-150 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <>
                    <span className={`text-[0.8rem] leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-foreground font-semibold' : ''}`}>
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
        {isSidebarOpen && (
          <p className="text-center text-[0.65rem] text-muted/80 mt-1 whitespace-nowrap">
            © {new Date().getFullYear()} Rafael Sanz Prades
          </p>
        )}
      </div>
    </aside>
  );
}
