"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function FileManagement() {
  const { activeModuleId, setActiveModuleId, activeCursoId, setActiveCursoId, moduleData } = useAppStore();
  
  const [modules, setModules] = useState<{ pd_modules: string[], curso_modules: string[] }>({ pd_modules: [], curso_modules: [] });
  const [loading, setLoading] = useState(true);

  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  
  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nuevo-modulo");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-modulo-curso");

  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error', message: string } | null>(null);

  const fetchModules = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/modules")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setModules(json.data);
          
          if (!selectedPd && json.data.pd_modules.length > 0) {
            setSelectedPd(activeModuleId || json.data.pd_modules[0]);
          } else if (selectedPd && !json.data.pd_modules.includes(selectedPd)) {
             setSelectedPd(json.data.pd_modules[0] || "");
          }

          if (!selectedCurso && json.data.curso_modules.length > 0) {
            setSelectedCurso(activeCursoId || json.data.curso_modules[0]);
          } else if (selectedCurso && !json.data.curso_modules.includes(selectedCurso)) {
             setSelectedCurso(json.data.curso_modules[0] || "");
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch modules", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchModules();
  }, [activeModuleId, activeCursoId]);

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoadPd = () => {
    if (selectedPd) {
      setActiveModuleId(selectedPd);
      setNewPdName(selectedPd.replace("-pd", ""));
      showNotification('success', `PD ${selectedPd} cargada correctamente`);
    }
  };

  const handleLoadCurso = () => {
    if (selectedCurso) {
      setActiveCursoId(selectedCurso);
      setNewCursoName(selectedCurso);
      showNotification('success', `Curso ${selectedCurso} cargado correctamente`);
    }
  };

  const handleSavePd = () => {
    if (!newPdName) return;
    const saveName = newPdName.endsWith("-pd") ? newPdName : `${newPdName}-pd`;
    
    if (!moduleData) {
      showNotification('error', 'No hay datos de PD en memoria para guardar.');
      return;
    }

    fetch(`http://localhost:8000/api/module/${saveName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moduleData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setActiveModuleId(saveName);
          showNotification('success', `✅ PD guardada como: ${saveName}.json`);
          fetchModules();
        } else {
          showNotification('error', `Error al guardar: ${data.detail || 'Desconocido'}`);
        }
      })
      .catch(err => {
        showNotification('error', 'Fallo al conectar con el servidor.');
      });
  };

  const handleSaveCurso = () => {
    showNotification('warning', 'Guardar curso no implementado todavía.');
  };

  if (loading && modules.pd_modules.length === 0) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a085] mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Gestión de Módulos" />
        
        {notification && (
          <div className={`absolute top-20 right-8 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 transform transition-all duration-300 translate-y-0 opacity-100 ${
            notification.type === 'success' ? 'bg-emerald-500/90 border border-emerald-400' :
            notification.type === 'warning' ? 'bg-amber-500/90 border border-amber-400' :
            'bg-red-500/90 border border-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 pt-4">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">📚 Gestión de Módulos y Archivos</h3>
              <p className="text-gray-400">Carga, guarda y administra los archivos de programación y curso.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              
              {/* Tarjeta de PD */}
              <div className="glass-card p-8 border-t-4 border-t-[#14a085] flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-[#14a085]/10">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>🗒️</span> Programación Didáctica (PD)
                  </h4>
                  <p className="text-sm text-gray-400">
                    La PD contiene la estructura del módulo: RAs, CEs, UDs e instrumentos.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar archivo PD</label>
                    <select 
                      value={selectedPd} 
                      onChange={(e) => setSelectedPd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14a085] transition-colors appearance-none cursor-pointer"
                    >
                      {modules.pd_modules.length === 0 && <option value="">No hay archivos PD disponibles</option>}
                      {modules.pd_modules.map((m) => (
                        <option key={m} value={m} className="bg-[#111827] text-white">{m}.json</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleLoadPd}
                    disabled={!selectedPd}
                    className="w-full bg-gradient-to-r from-[#14a085] to-[#1abc9c] hover:from-[#1abc9c] hover:to-[#14a085] text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📂 Cargar PD
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar PD actual</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newPdName} 
                        onChange={(e) => setNewPdName(e.target.value)}
                        placeholder="Nombre del archivo PD"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-mono text-sm">-pd.json</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSavePd}
                    disabled={!newPdName || !moduleData}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar PD
                  </button>
                </div>
              </div>

              {/* Tarjeta de Curso */}
              <div className="glass-card p-8 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>📅</span> Datos del Curso
                  </h4>
                  <p className="text-sm text-gray-400">
                    El archivo de curso contiene el alumnado, notas, seguimiento diario y faltas.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar archivo de Curso</label>
                    <select 
                      value={selectedCurso} 
                      onChange={(e) => setSelectedCurso(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      {modules.curso_modules.length === 0 && <option value="">No hay archivos de Curso disponibles</option>}
                      {modules.curso_modules.map((m) => (
                        <option key={m} value={m} className="bg-[#111827] text-white">{m}.json</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleLoadCurso}
                    disabled={!selectedCurso}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📂 Cargar Curso
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Curso actual</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newCursoName} 
                        onChange={(e) => setNewCursoName(e.target.value)}
                        placeholder="Nombre del archivo de Curso"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-mono text-sm">.json</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveCurso}
                    disabled={!newCursoName}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar Curso
                  </button>
                </div>
              </div>

            </div>

            {/* Validador de Coherencia */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🛡️</span> Validador de Coherencia
              </h3>
              
              <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-white font-semibold text-lg">Estado óptimo</h5>
                  <p className="text-gray-400 text-sm">La programación es coherente con el calendario actual (Función de validación en desarrollo).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
