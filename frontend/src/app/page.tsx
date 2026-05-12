// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function FileManagement() {
  const { activeModuleId, setActiveModuleId, activeCursoId, setActiveCursoId, moduleData } = useAppStore();
  
  const [modules, setModules] = useState<{ centro_modules: string[], pd_modules: string[], curso_modules: string[] }>({ centro_modules: [], pd_modules: [], curso_modules: [] });
  const [loading, setLoading] = useState(true);

  const [selectedCentro, setSelectedCentro] = useState("ciclos-fp");
  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  
  const [newCentroName, setNewCentroName] = useState("ciclos-fp");
  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nuevo-modulo");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-modulo-curso");

  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'error', message: string } | null>(null);

  const fetchModules = () => {
    setLoading(true);
    fetch("/api/modules")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          const data = {
             centro_modules: json.data.centro_modules || ["ciclos-fp"],
             pd_modules: json.data.pd_modules || [],
             curso_modules: json.data.curso_modules || []
          };
          setModules(data);
          
          if (!selectedCentro && data.centro_modules.length > 0) setSelectedCentro(data.centro_modules[0]);
          
          if (!selectedPd && data.pd_modules.length > 0) {
            setSelectedPd(activeModuleId || data.pd_modules[0]);
          } else if (selectedPd && !data.pd_modules.includes(selectedPd)) {
             setSelectedPd(data.pd_modules[0] || "");
          }

          if (!selectedCurso && data.curso_modules.length > 0) {
            setSelectedCurso(activeCursoId || data.curso_modules[0]);
          } else if (selectedCurso && !data.curso_modules.includes(selectedCurso)) {
             setSelectedCurso(data.curso_modules[0] || "");
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

  const handleLoadCentro = () => {
    if (selectedCentro) {
      setNewCentroName(selectedCentro);
      showNotification('success', `Centro ${selectedCentro} cargado correctamente`);
    }
  };

  const handleLoadPd = () => {
    if (selectedPd) {
      setActiveModuleId(selectedPd);
      setNewPdName(selectedPd.replace("-pd", ""));
      showNotification('success', `Módulo ${selectedPd} cargado correctamente`);
    }
  };

  const handleLoadCurso = () => {
    if (selectedCurso) {
      setActiveCursoId(selectedCurso);
      setNewCursoName(selectedCurso);
      showNotification('success', `Curso ${selectedCurso} cargado correctamente`);
    }
  };

  const handleSaveCentro = () => {
    showNotification('warning', 'Guardar Centro global no implementado todavía en esta vista.');
  };

  const handleSavePd = () => {
    if (!newPdName) return;
    const saveName = newPdName.endsWith("-pd") ? newPdName : `${newPdName}-pd`;
    
    if (!moduleData) {
      showNotification('error', 'No hay datos de Módulo en memoria para guardar.');
      return;
    }

    fetch(`/api/module/${saveName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moduleData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setActiveModuleId(saveName);
          showNotification('success', `✅ Módulo guardado como: ${saveName}`);
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
    showNotification('warning', 'Guardar Curso no implementado todavía en esta vista.');
  };

  if (loading && modules.pd_modules.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a085] mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        {notification && (
          <div className={`absolute top-20 right-8 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 transform transition-all duration-300 translate-y-0 opacity-100 ${
            notification.type === 'success' ? 'bg-emerald-500/90 border border-emerald-400' :
            notification.type === 'warning' ? 'bg-amber-500/90 border border-amber-400' :
            'bg-red-500/90 border border-red-400'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex-1 p-8 pt-4">
          <div className="space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">📁 Gestión de archivos</h1>
              <p className="text-gray-400">Carga, guarda y administra los archivos de configuración Global, Módulos y Cursos.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Tarjeta de Centro */}
              <div className="glass-card p-6 border-t-4 border-t-purple-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>🏢</span> Centro educativo
                  </h4>
                  <p className="text-sm text-gray-400">
                    Contiene la información global del centro, profesorado y calendario general.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Centro</label>
                    <select 
                      value={selectedCentro} 
                      onChange={(e) => setSelectedCentro(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                    >
                      {modules.centro_modules.length === 0 && <option value="">No hay archivos de Centro</option>}
                      {modules.centro_modules.map((m) => (
                        <option key={m} value={m} className="bg-[#111827] text-white">{m}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleLoadCentro}
                    disabled={!selectedCentro}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                  >
                    <span>📂</span> Cargar Centro
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Centro</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newCentroName} 
                        onChange={(e) => setNewCentroName(e.target.value)}
                        placeholder="Nombre del archivo de Centro"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveCentro}
                    disabled={!newCentroName}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar Centro
                  </button>
                </div>
              </div>

              {/* Tarjeta de Módulo (PD) */}
              <div className="glass-card p-6 border-t-4 border-t-[#14a085] flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-[#14a085]/10">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>⚙️</span> Módulo didáctico
                  </h4>
                  <p className="text-sm text-gray-400">
                    Contiene la estructura del módulo: RAs, CEs, UDs e instrumentos de evaluación.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Módulo</label>
                    <select 
                      value={selectedPd} 
                      onChange={(e) => setSelectedPd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14a085] transition-colors appearance-none cursor-pointer"
                    >
                      {modules.pd_modules.length === 0 && <option value="">No hay archivos de Módulo disponibles</option>}
                      {modules.pd_modules.map((m) => (
                        <option key={m} value={m} className="bg-[#111827] text-white">{m}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleLoadPd}
                    disabled={!selectedPd}
                    className="w-full bg-gradient-to-r from-[#14a085] to-[#1abc9c] hover:from-[#1abc9c] hover:to-[#14a085] text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                  >
                    <span>📂</span> Cargar Módulo
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Módulo</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newPdName} 
                        onChange={(e) => setNewPdName(e.target.value)}
                        placeholder="Nombre del archivo de Módulo"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-mono text-sm">-pd</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSavePd}
                    disabled={!newPdName || !moduleData}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar Módulo
                  </button>
                </div>
              </div>

              {/* Tarjeta de Curso */}
              <div className="glass-card p-6 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>📅</span> Curso y alumnado
                  </h4>
                  <p className="text-sm text-gray-400">
                    Contiene la matrícula del alumnado, calificaciones, y faltas de asistencia.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Curso</label>
                    <select 
                      value={selectedCurso} 
                      onChange={(e) => setSelectedCurso(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      {modules.curso_modules.length === 0 && <option value="">No hay archivos de Curso disponibles</option>}
                      {modules.curso_modules.map((m) => (
                        <option key={m} value={m} className="bg-[#111827] text-white">{m}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={handleLoadCurso}
                    disabled={!selectedCurso}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                  >
                    <span>📂</span> Cargar Curso
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Curso</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newCursoName} 
                        onChange={(e) => setNewCursoName(e.target.value)}
                        placeholder="Nombre del archivo de Curso"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                      />
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
          </div>
        </div>
      </main>
    </div>
  );
}
