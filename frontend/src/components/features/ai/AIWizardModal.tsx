"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Bot, FileText, UploadCloud, X, Loader2, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface AIWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function AIWizardModal({ isOpen, onClose, onSuccess }: AIWizardModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg("Solo se admiten archivos PDF por el momento.");
      return;
    }

    const apiKey = localStorage.getItem("cdd_ai_api_key");
    const provider = localStorage.getItem("cdd_ai_provider") || "gemini";

    if (!apiKey) {
      setErrorMsg("No hay API Key. Configúrala primero en la pestaña 'Respaldo y sincronización' del Entorno de trabajo.");
      return;
    }

    setErrorMsg("");
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("provider", provider);

      // Llama a tu backend pasándole el texto extraído y el modelo
      const res = await fetch("/api/ai/parse-curriculum", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || "Error al procesar el documento con IA");
      }

      toast.success("¡Documento procesado mágicamente!");
      onSuccess(json.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error de conexión con el Asistente");
    } finally {
      setIsProcessing(false);
    }
  }, [onClose, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-[var(--glass-border)] rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Asistente Mágico IA</h2>
              <p className="text-sm text-muted">Sube tu currículo en PDF para extraer la programación</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6 overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {!isProcessing ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/50 hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragActive ? "text-accent" : "text-muted"}`} />
              <h3 className="text-lg font-bold text-foreground mb-2">
                {isDragActive ? "Suelta el PDF aquí" : "Arrastra tu currículo (BOE/BOA) en PDF"}
              </h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                O haz clic para seleccionar el archivo. La Inteligencia Artificial lo leerá y extraerá automáticamente todos los RAs, Criterios de Evaluación y Unidades Didácticas.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
                <Bot className="w-6 h-6 text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-foreground animate-pulse">Analizando documento...</h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  La IA está leyendo y estructurando la información. Esto puede tardar unos 20-30 segundos. Por favor, no cierres la ventana.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
