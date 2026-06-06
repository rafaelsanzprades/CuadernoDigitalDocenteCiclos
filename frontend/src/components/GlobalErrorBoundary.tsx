"use client";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-danger/10 border border-danger/30 p-6 rounded-2xl max-w-lg shadow-xl shadow-red-500/5 backdrop-blur-md">
        <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">¡Ups! Algo ha fallado</h2>
        <p className="text-muted text-sm mb-6">
          Parece que hemos encontrado un problema al cargar esta vista, probablemente debido a datos incompletos.
          El resto de tu cuaderno está a salvo.
        </p>
        <div className="bg-background/50 p-4 rounded-lg text-left overflow-auto text-xs text-danger font-mono mb-6 max-h-32">
          {error instanceof Error ? error.message : String(error)}
        </div>
        <button
          onClick={resetErrorBoundary}
          className="bg-danger hover:bg-danger text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          Intentar recargar
        </button>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Here we could clear some problematic state if needed
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
