"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

export default function ResultadosPage() {
  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Resultados AP. RAs" />
        <main className="flex-1 p-8 content-area space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-1">
              🎯 Resultados AP. RAs
            </h1>
            <p className="text-muted mt-1">Definición de los Resultados de Aprendizaje y su contribución a los objetivos generales.</p>
          </div>
          
          <Card className="p-8 text-center border-t-4 border-t-blue-500">
            <h2 className="text-2xl font-bold mb-4">Módulo en Construcción</h2>
            <p className="text-muted">Esta sección está siendo desarrollada. Pronto podrás visualizar y ponderar los RAs aquí.</p>
          </Card>
        </main>
      </div>
    </div>
  );
}
