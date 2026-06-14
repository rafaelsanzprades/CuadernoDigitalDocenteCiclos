"use client";
import { ChevronLeft, ChevronRight, CalendarDays, FolderOpen } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { navGroups } from '@/config/navigation';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeModuleId, activeCursoId, isSidebarOpen, toggleSidebar, dataSource } = useAppStore();
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

  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const isDemo = useAppStore.getState().activeModuleId === '0237-ictve-pd';
      const realNow = new Date();
      const currentYear = realNow.getFullYear();
      
      let day, monthStr, year;
      if (isDemo) {
        day = 2;
        monthStr = "mayo";
        year = currentYear;
      } else {
        day = realNow.getDate();
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        monthStr = months[realNow.getMonth()];
        year = currentYear;
      }
      
      const hours = String(realNow.getHours()).padStart(2, '0');
      const minutes = String(realNow.getMinutes()).padStart(2, '0');
      
      setDateStr(`${day} de ${monthStr} de ${year}`);
      setTimeStr(`${hours}:${minutes} h`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [activeModuleId]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
  };

  const sidebarContent = (
    <>
      <div className={`px-4 pt-4 pb-2 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-start`}>
        {isSidebarOpen && (
          <div className="flex flex-col mb-3">
            <Link href="/inicio" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
              <h1 className="text-[1.3rem] font-extrabold leading-tight text-foreground hover:text-info transition-colors tracking-tight whitespace-nowrap cursor-pointer">
                Cuaderno FP
              </h1>
            </Link>
            <span className="text-sm text-muted/80 font-mono mt-0.5 ml-0.5">{timeStr}</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-muted hover:text-foreground p-1 rounded-md hover:bg-foreground/10 transition-colors mb-4">
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav 
        aria-label="Navegación principal"
        onScroll={handleScroll}
        className={`sidebar-scroll-container flex-1 ${isSidebarOpen ? 'px-3' : 'px-2'} py-2 space-y-4 overflow-x-hidden overflow-y-auto scrollbar-hide`}
      >
        <div className="flex flex-col gap-0.5 mb-4">
          {(() => {
            const linkContent = (
              <Link
                href="/agenda"
                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`flex items-center ${isSidebarOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-3 rounded-lg transition-all duration-150 group shadow-md bg-gradient-to-r ${dataSource === 'demo' ? 'from-warning/20 to-warning/5 border border-warning/40 text-foreground hover:bg-warning/20' : 'from-accent/20 to-accent/5 border border-accent/40 text-foreground hover:bg-accent/20'}`}
              >
                <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === '/agenda' ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : (dataSource === 'demo' ? 'text-warning group-hover:scale-110' : 'text-accent group-hover:scale-110')}`}>
                  <CalendarDays className="w-5 h-5" strokeWidth={2} />
                </span>
                {isSidebarOpen && (
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`text-[0.95rem] leading-tight whitespace-nowrap font-bold ${pathname === '/agenda' ? (dataSource === 'demo' ? 'text-warning' : 'text-accent') : ''}`}>
                      Agenda
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs border font-semibold tracking-wider leading-none ${dataSource === 'demo' ? 'text-warning bg-warning/10 border-warning/30' : 'text-accent bg-accent/10 border-accent/30'}`}>
                      {dateStr}
                    </span>
                  </div>
                )}
              </Link>
            );
            return !isSidebarOpen ? (
              <Tooltip content="Agenda" position="right" delay={0.1}>
                {linkContent}
              </Tooltip>
            ) : linkContent;
          })()}
        </div>

        {navGroups.map((group, idx) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            {group.title && isSidebarOpen && (
              <div className="text-base font-bold text-foreground tracking-wide px-3 mb-2 mt-2">
                {group.title}
              </div>
            )}
            {!isSidebarOpen && idx > 0 && group.title && (
              <div className="w-8 h-px bg-foreground/10 mx-auto my-2" />
            )}
            {group.title === "" && idx > 0 && isSidebarOpen && (
              <div className="w-full h-px bg-foreground/10 my-2" />
            )}
            {group.title === "" && idx > 0 && !isSidebarOpen && (
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
                      ? (dataSource === 'demo' ? 'bg-warning/10 border border-warning/30 text-foreground shadow-sm shadow-warning/10' : 'bg-accent/10 border border-accent/30 text-foreground shadow-sm shadow-accent/10')
                      : 'text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent'
                    }`}
                >
                  <span className={`flex items-center justify-center transition-transform duration-150 ${pathname === item.href ? (dataSource === 'demo' ? 'scale-110 text-warning' : 'scale-110 text-accent') : 'group-hover:scale-110'}`}>
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {isSidebarOpen && (
                    <>
                      <span className={`text-sm leading-tight font-medium whitespace-nowrap ${pathname === item.href ? 'text-foreground font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {pathname === item.href && (
                        <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${dataSource === 'demo' ? 'bg-warning shadow-[0_0_6px_var(--warning-color)]' : 'bg-accent shadow-[0_0_6px_var(--accent-color)]'}`} />
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

      <div className={`px-4 py-3 border-t border-[var(--glass-border)] flex flex-col items-center gap-1.5`}>
        {isSidebarOpen && (
          <>
            <p className="text-center text-sm font-medium text-muted/90 mt-1 whitespace-nowrap">
              © {new Date().getFullYear()} Rafael Sanz Prades
            </p>
            <div className="flex items-center justify-center w-full">
              <Link href="/legal" className="text-sm font-semibold text-info hover:text-info hover:underline" onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                Legal
              </Link>
            </div>
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
