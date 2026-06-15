import { Gift, Hand, Rocket } from "lucide-react";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { fileManager } from "@/services/fileManager";
import toast from "react-hot-toast";

interface WelcomeWizardProps {
  onComplete: () => void;
  fetchModules: () => void;
  setActiveModuleId: (id: string) => void;
  setActiveCursoId: (id: string) => void;
}

export function WelcomeWizard({ onComplete, fetchModules, setActiveModuleId, setActiveCursoId }: WelcomeWizardProps) {
  const [step, setStep] = useState<"CHOICE" | "CREATE_FORM" | "LOADING">("CHOICE");
  const [newPdName, setNewPdName] = useState("");
  const [newCursoName, setNewCursoName] = useState("");

  const handleLoadDemo = async () => {
    setStep("LOADING");
    const toastId = toast.loading("Inyectando entorno de demostración...");
    try {
      fileManager.resetActiveDb();
      await fetchModules();
      setActiveModuleId("0237-ictve-pd");
      setActiveCursoId("0237-ictve-curso-2025-26");
      toast.success("Entorno de demostración cargado!", { id: toastId });
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al cargar demo: ${message}`, { id: toastId });
      setStep("CHOICE");
    }
  };

  const handleCreateNew = async () => {
    if (!newPdName || !newCursoName) {
      toast.error("Por favor, rellena ambos campos.");
      return;
    }

    setStep("LOADING");
    const toastId = toast.loading("Creando tu nuevo entorno...");
    
    const pdId = `${newPdName}-pd`;
    const cursoId = `${newPdName}-curso-${newCursoName}`;

    try {
      // 1. Crear PD
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${pdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      // 2. Crear Curso
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${cursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      await fetchModules();
      setActiveModuleId(pdId);
      setActiveCursoId(cursoId);
      toast.success("¡Entorno creado con éxito!", { id: toastId });
      onComplete();

    } catch (error: any) {
      toast.error("Error al crear el entorno.", { id: toastId });
      setStep("CREATE_FORM");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
      <MotionWrapper className="w-full max-w-2xl">
        <Card className="p-10 shadow-2xl border-t-4 border-t-accent bg-card/95 backdrop-blur-lg">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-foreground mb-4 flex items-center justify-center gap-3">
              <span className="text-5xl"><span className="inline-flex"><Hand className="w-[1.2em] h-[1.2em] mr-1" /></span></span> ¡Bienvenido a Cuaderno FP!
            </h2>
            <p className="text-lg text-muted">
              Parece que es tu primera vez aquÁ­. Vamos a preparar tu entorno de trabajo para que puedas empezar a volar.
            </p>
          </div>

          {step === "LOADING" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
              <p className="text-xl font-bold text-foreground animate-pulse">Preparando motores...</p>
            </div>
          )}

          {step === "CHOICE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div 
                onClick={handleLoadDemo}
                className="group cursor-pointer border-2 border-[var(--glass-border)] hover:border-info rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 bg-background/50 hover:bg-info/10 flex flex-col items-center text-center gap-4"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform"><span className="inline-flex"><Gift className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                <h3 className="text-[1.1rem] font-bold text-foreground">Cargar Demo</h3>
                <p className="text-sm text-muted">
                  Inyecta un entorno ficticio completo con Resultados de Aprendizaje, Unidades y Alumnado para ver cómo funciona todo al instante.
                </p>
                <Button className="w-full mt-auto bg-info hover:bg-info">
                  Explorar Demo
                </Button>
              </div>

              <div 
                onClick={() => setStep("CREATE_FORM")}
                className="group cursor-pointer border-2 border-[var(--glass-border)] hover:border-accent rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 bg-background/50 hover:bg-accent/5 flex flex-col items-center text-center gap-4"
              >
                <span className="text-6xl group-hover:scale-110 transition-transform"><span className="inline-flex"><Rocket className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                <h3 className="text-[1.1rem] font-bold text-foreground">Empezar de Cero</h3>
                <p className="text-sm text-muted">
                  Crea tu propio Módulo vacÁ­o y empieza a introducir tus rúbricas y alumnado desde cero.
                </p>
                <Button className="w-full mt-auto bg-accent hover:bg-accent/80 text-background">
                  Crear mi Módulo
                </Button>
              </div>
            </div>
          )}

          {step === "CREATE_FORM" && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nombre de tu Módulo (La Programación)</label>
                <div className="relative">
                  <Input 
                    value={newPdName}
                    onChange={(e) => setNewPdName(e.target.value)}
                    placeholder="Ej: sistemas-informaticos"
                    className="text-lg py-6"
                  />
                  <span className="absolute right-4 top-4 text-muted font-mono">-pd</span>
                </div>
                <p className="text-xs text-muted">Este será el "Padre" donde definirás tus RAs y UDs.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Año de tu primer Curso (El Aula Real)</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-muted font-mono z-10 opacity-50 pr-2 border-r border-[var(--glass-border)]">
                    {newPdName || "modulo"}-curso-
                  </span>
                  <Input 
                    value={newCursoName}
                    onChange={(e) => setNewCursoName(e.target.value)}
                    placeholder="Ej: 2026-27"
                    className="text-lg py-6 pl-[180px]"
                  />
                </div>
                <p className="text-xs text-muted">AquÁ­ matricularás a tus alumnado reales para este año.</p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="secondary" onClick={() => setStep("CHOICE")} className="w-1/3">
                  Volver
                </Button>
                <Button onClick={handleCreateNew} disabled={!newPdName || !newCursoName} className="w-2/3 bg-accent hover:bg-accent/80 text-background text-lg py-6">
                   Crear mi Entorno
                </Button>
              </div>
            </div>
          )}

        </Card>
      </MotionWrapper>
    </div>
  );
}
