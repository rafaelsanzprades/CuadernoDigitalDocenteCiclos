"use client";

import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export default function Header({ title }: { title?: string }) {
  const { activeModuleId, moduleData } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saved" | "error">("idle");

  const handleSave = async () => {
    if (!moduleData) return;
    setIsSaving(true);
    setSavedStatus("idle");
    try {
      const res = await fetch(`/api/module/${activeModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData)
      });
      const data = await res.json();
      if (data.status === "success") {
        setSavedStatus("saved");
        setTimeout(() => setSavedStatus("idle"), 3000);
      } else {
        setSavedStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSavedStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="w-full flex items-center justify-between p-8 pb-4 gap-4">
      <div className="hidden lg:block flex-1"></div>
      
      {title && (
        <div className="flex-shrink-0 flex justify-center">
          <div className="border-2 border-[#14a085] rounded-xl px-8 py-3 shadow-[0_4px_15px_rgba(20,160,133,0.1)]">
            <h2 className="text-3xl whitespace-nowrap font-extrabold tracking-tight primary-gradient-text m-0 leading-none">
              {title}
            </h2>
          </div>
        </div>
      )}

      <div className="flex-1 flex justify-end items-center gap-3">
        {savedStatus === "error" && <span className="text-red-400 text-sm font-bold">❌ Error</span>}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`glass-button ${savedStatus === "saved" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-[#14a085]/10 text-[#14a085] border-[#14a085]/30 hover:bg-[#14a085]/20"} font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all`}>
          <span>{isSaving ? "⏳" : (savedStatus === "saved" ? "✅" : "💾")}</span> 
          {isSaving ? "Guardando..." : (savedStatus === "saved" ? "¡Guardado!" : "Guardar")}
        </button>
        <button className="glass-button text-gray-300 font-semibold py-2.5 px-6 rounded-lg flex items-center gap-2">
          <span>🔓</span> Activado
        </button>
      </div>
    </header>
  );
}
