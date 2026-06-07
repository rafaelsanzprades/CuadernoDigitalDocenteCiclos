"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { navGroups } from '@/config/navigation';
import { useEffect, useRef } from 'react';
import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar } = useAppStore();
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll) {
      const elements = document.querySelectorAll('.sidebar-scroll-container');
      elements.forEach(el => {
        el.scrollTop = parseInt(savedScroll, 10);
      });
    }
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
  };

  const sidebarContent = (
    <>
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-center`}>
        {isSidebarOpen && (
          <Link href="/inicio" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
            <h1 className="text-[1.3rem] font-extrabold leading-tight text-foreground hover:text-info transition-colors mb-4 tracking-tight whitespace-nowrap cursor-pointer">
              Cuaderno Ciclos FP
            </h1>
          </Link>
        )}
        <button onClick={toggleSidebar} className="text-muted hover:text-foreground p-1 rounded-md hover:bg-foreground/10 transition-colors mb-3">
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav 
        aria-label="Navegación principal"
        onScroll={handleScroll}
        className={`sidebar-scroll-container flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-4 overflow-x-hidden overflow-y-auto scrollbar-hide`}
      >
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
            {group.items.map((item) => {
              const linkContent = (
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === "#wizard") {
                      e.preventDefault();
                      useAppStore.getState().setWizardOpen(true);
                    }
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2 rounded-lg transition-all duration-150 group
                    ${pathname === item.href
                      ? 'bg-accent/10 border border-accent/30 text-foreground shadow-sm shadow-accent/10'
                      : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href ? 'scale-110 text-accent' : 'group-hover:scale-110'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span className={`text-[0.8rem] leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-foreground font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {pathname === item.href && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent-color)] flex-shrink-0" />
                      )}
                    </>
                  )}
                </Link>
              );

              return !isSidebarOpen ? (
                <Tooltip key={item.href} content={item.label} position="right" delay={0.1}>
                  {linkContent}
                </Tooltip>
              ) : (
                <React.Fragment key={item.href}>
                  {linkContent}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`px-4 py-3 border-t border-[var(--glass-border)] flex flex-col items-center gap-1`}>
        {isSidebarOpen && (
          <>
            <p className="text-center text-[0.65rem] text-muted/80 mt-1 whitespace-nowrap">
              © {new Date().getFullYear()} Rafael Sanz Prades
            </p>
            <Link href="/avisolegal" className="text-[0.6rem] text-info hover:text-info hover:underline" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
              Aviso Legal y Privacidad
            </Link>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex ${isSidebarOpen ? 'w-64' : 'w-[4.5rem]'} sticky top-0 h-screen border-r border-[var(--glass-border)] bg-background flex-col flex-shrink-0 transition-all duration-300 z-50`}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (overlay) */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 border-r border-[var(--glass-border)] bg-background flex flex-col transition-transform duration-300`}>
        {sidebarContent}
      </aside>
    </>
  );
}
