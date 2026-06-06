"use client";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { fileManager } from "@/services/fileManager";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Crashed:", error);
  }, [error]);

  const handleReset = () => {
    // If the app crashed due to corrupted local data, safely revert to demo mode
    fileManager.setDataSourceType('demo');
    window.location.href = '/entorno';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-danger/10 rounded-full">
            <ShieldAlert className="w-12 h-12 text-danger" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Ups! Algo ha fallado</h2>
          <p className="text-muted text-sm leading-relaxed">
            Hemos encontrado un dato inesperado que ha bloqueado la interfaz. No te preocupes, tus datos en local están a salvo.
          </p>
        </div>
        <div className="bg-foreground/15 p-3 rounded text-left overflow-x-auto text-xs text-danger font-mono">
          {error.message || "Error desconocido"}
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full bg-accent hover:bg-accent/80 text-foreground font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Intentar recuperar la página
          </button>
          
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold py-3 px-4 rounded-lg border border-white/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar a modo Demo
          </button>
        </div>
      </div>
    </div>
  );
}
