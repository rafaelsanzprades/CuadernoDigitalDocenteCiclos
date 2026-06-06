"use client";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { navGroups } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function InicioPage() {
  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Inicio" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-12 pb-12">

            {/* Header / Hero */}
            <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-4">
                Bienvenido al Cuaderno Ciclos FP
              </h1>
              <p className="text-xl text-muted max-w-3xl mx-auto">
                Accede rápidamente a todas las herramientas para la gestión de tus módulos, alumnado y evaluación.
              </p>
            </div>

            {/* Menus Grid */}
            <div className="space-y-12">
              {navGroups.map((group, groupIdx) => (
                <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                      {group.title}
                    </h2>
                    {group.sectionDescription && (
                      <p className="text-muted text-base max-w-4xl pb-4 border-b border-[var(--glass-border)]">
                        {group.sectionDescription}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                      {group.items.map((item, itemIdx) => (
                        <Link key={item.href} href={item.href} className="block group">
                          <Card className="h-full p-5 flex flex-col gap-3 border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors leading-tight">
                                {item.label}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted mt-auto">
                                {item.description}
                              </p>
                            )}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </MotionWrapper>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
