// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function DescargasPage() {
  const { activeModuleId, moduleData, activeCursoId, cursoData } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((activeModuleId && !moduleData) || (activeCursoId && !cursoData)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  const handleDownload = async (type: string, al_id?: string) => {
    // This calls the FastAPI backend endpoint to generate the PDF
    // Since the API might take a few seconds, we could show a toast or loading state here
    try {
      let url = `/api/pdf?type=${type}&pd_id=${activeModuleId}&curso_id=${activeCursoId}`;
      if (al_id) url += `&al_id=${al_id}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error generating PDF");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const modName = moduleData?.info_modulo?.modulo || "Modulo";
      
      let filename = `${type}_${modName}.pdf`;
      if (al_id) filename = `Boletin_${al_id}_${modName}.pdf`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error al generar el PDF. Asegúrate de que el backend está configurado.");
    }
  };

  if (!activeCursoId || !activeModuleId) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de Archivos y asegúrate de cargar ambos.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-red-400 animate-pulse">Preparando descargas...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const activeAlumnos = df_al.filter((al: any) => al.Estado !== "Baja");
  activeAlumnos.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              📥 Descargas PDF
            </h1>
            <p className="text-gray-400 mt-2">Genera y descarga los documentos oficiales de tu cuaderno digital.</p>
          </div>

          <section className="glass-card p-6 border-t-4 border-t-red-500">
            <h2 className="text-2xl font-bold mb-6">📅 Documentos de Planificación</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">📆 Calendario Académico</h3>
                  <p className="text-sm text-gray-400 mb-6">Vista global del curso con fechas, sesiones y eventos.</p>
                </div>
                <button onClick={() => handleDownload('calendario')} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar PDF Calendario
                </button>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">📝 Seguimiento Diario</h3>
                  <p className="text-sm text-gray-400 mb-6">Registro detallado de la planificación del día a día.</p>
                </div>
                <button onClick={() => handleDownload('seguimiento')} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar Seguimiento Diario
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-blue-500">
            <h2 className="text-2xl font-bold mb-6">📊 Boletines de Calificaciones Grupales</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between text-center">
                <div>
                  <h3 className="text-lg font-bold mb-2">👥 1er Trimestre</h3>
                  <p className="text-xs text-gray-400 mb-6">Boletín grupal 1T.</p>
                </div>
                <button onClick={() => handleDownload('grupal_1t')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar 1T
                </button>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between text-center">
                <div>
                  <h3 className="text-lg font-bold mb-2">👥 2º Trimestre</h3>
                  <p className="text-xs text-gray-400 mb-6">Boletín grupal 2T.</p>
                </div>
                <button onClick={() => handleDownload('grupal_2t')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar 2T
                </button>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between text-center">
                <div>
                  <h3 className="text-lg font-bold mb-2">👥 3er Trimestre</h3>
                  <p className="text-xs text-gray-400 mb-6">Boletín grupal 3T.</p>
                </div>
                <button onClick={() => handleDownload('grupal_3t')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar 3T
                </button>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col justify-between text-center border-l-4 border-l-yellow-400">
                <div>
                  <h3 className="text-lg font-bold mb-2">🎓 Eval. Final</h3>
                  <p className="text-xs text-gray-400 mb-6">Boletín grupal final.</p>
                </div>
                <button onClick={() => handleDownload('grupal_final')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold transition-colors">
                  Generar Final
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-purple-500">
            <h2 className="text-2xl font-bold mb-6">👤 Boletines Individuales</h2>
            {activeAlumnos.length > 0 ? (
              <div className="flex items-end gap-6 bg-black/20 border border-white/10 rounded-xl p-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">📄 Informe de Estudiante</h3>
                  <p className="text-sm text-gray-400 mb-4">Genera un informe detallado de un estudiante específico.</p>
                  <select id="alumno_select" className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none font-bold">
                    {activeAlumnos.map((al: any) => (
                      <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre} ({al.ID})</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => {
                    const sel = document.getElementById('alumno_select') as HTMLSelectElement;
                    if (sel && sel.value) handleDownload('individual', sel.value);
                  }} 
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-bold transition-colors h-[50px]"
                >
                  Generar Informe Individual
                </button>
              </div>
            ) : (
              <p className="text-gray-400 italic">No hay estudiantes activos para generar informes individuales.</p>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
