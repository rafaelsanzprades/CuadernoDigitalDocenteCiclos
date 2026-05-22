"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, CheckCircle, BarChart3, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function FileManagement() {
  const { activeModuleId, setActiveModuleId, activeCursoId, setActiveCursoId, moduleData, setModuleData, cursoData, setCursoData } = useAppStore();

  const [modules, setModules] = useState<{ centro_modules: string[], pd_modules: string[], curso_modules: string[] }>({ centro_modules: [], pd_modules: [], curso_modules: [] });
  const [loading, setLoading] = useState(true);

  const [selectedCentro, setSelectedCentro] = useState("ciclos-fp");
  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const [newCentroName, setNewCentroName] = useState("ciclos-fp");
  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nuevo-modulo");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-modulo-curso");

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

  useEffect(() => {
    if (activeModuleId) {
      fetch(`/api/module/${activeModuleId}`).then(res => res.json()).then(data => {
        if (data.status === "success") setModuleData(data.data);
      });
    }
  }, [activeModuleId, setModuleData]);

  useEffect(() => {
    if (activeCursoId) {
      fetch(`/api/module/${activeCursoId}`).then(res => res.json()).then(data => {
        if (data.status === "success") setCursoData(data.data);
      });
    }
  }, [activeCursoId, setCursoData]);

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast(message, { icon: '⚠️' });
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
    showNotification('warning', 'Guardar Centro educativo no implementado todavía en esta vista.');
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
    showNotification('warning', 'Guardar Curso y alumnado no implementado todavía en esta vista.');
  };

  if (loading && modules.pd_modules.length === 0) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-[var(--foreground)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a085] mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 pt-4">
          <div className="space-y-8 pb-12">

            {/* --- DASHBOARD INICIAL --- */}
            {moduleData || cursoData ? (
              <section className="space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-3 mb-2">
                    <BarChart3 className="w-10 h-10 text-[var(--accent-color)]" /> Resumen general
                  </h1>
                  <p className="text-[var(--text-muted)]">Panel de control con las métricas clave de tu módulo y curso activos.</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-card p-6 border-l-4 border-l-blue-500 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-semibold">Alumnado</p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">{cursoData?.df_al?.length || 0}</p>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-[#14a085] flex items-center gap-4">
                    <div className="p-3 bg-[#14a085]/20 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-[#14a085]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)] font-semibold">Progreso</p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">
                        {(() => {
                          const sgmtData = cursoData?.df_sgmt || [];
                          let hPlan = 0; let hImp = 0;
                          sgmtData.forEach((ud: any) => { hPlan += Number(ud.horas_ud || 0); hImp += Number(ud.Total_Imp || 0); });
                          return hPlan > 0 ? Math.round((hImp / hPlan) * 100) : 0;
                        })()}%
                      </p>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-purple-500 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Clock className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)] font-semibold">Impartidas</p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">
                        {(() => {
                          let hImp = 0;
                          (cursoData?.df_sgmt || []).forEach((ud: any) => hImp += Number(ud.Total_Imp || 0));
                          return hImp;
                        })()} <span className="text-sm font-normal text-gray-400">h</span>
                      </p>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-amber-500 flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)] font-semibold">Tareas</p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">{moduleData?.df_tareas?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Bar Chart */}
                  <div className="glass-card p-6 lg:col-span-2 flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Progreso por Unidad Didáctica</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={(cursoData?.df_sgmt || []).map((ud: any) => ({
                            name: ud.id_ud,
                            Planificadas: Number(ud.horas_ud || 0),
                            Impartidas: Number(ud.Total_Imp || 0),
                          }))}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar dataKey="Planificadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Impartidas" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="glass-card p-6 flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Alta y baja de alumnado</h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(() => {
                              const estadoAlumnado: Record<string, number> = {};
                              (cursoData?.df_al || []).forEach((al: any) => {
                                const estado = al.Estado || "Desconocido";
                                estadoAlumnado[estado] = (estadoAlumnado[estado] || 0) + 1;
                              });
                              return Object.keys(estadoAlumnado).map(key => ({ name: key, value: estadoAlumnado[key] }));
                            })()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {(() => {
                              const COLORS = ['#14a085', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
                              const estadoAlumnado: Record<string, number> = {};
                              (cursoData?.df_al || []).forEach((al: any) => {
                                const estado = al.Estado || "Desconocido";
                                estadoAlumnado[estado] = (estadoAlumnado[estado] || 0) + 1;
                              });
                              return Object.keys(estadoAlumnado).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ));
                            })()}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--glass-border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400/20 to-transparent my-10"></div>
              </section>
            ) : (
              <section className="glass-card p-8 border-l-4 border-l-purple-500 flex flex-col items-center justify-center text-center space-y-4 mb-12">
                <div className="p-4 bg-purple-500/20 rounded-full">
                  <BarChart3 className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">¡Bienvenido a tu Cuaderno Digital!</h2>
                <p className="text-[var(--text-muted)] max-w-2xl">
                  Para visualizar tu panel de control con métricas y gráficos interactivos, por favor, <strong className="text-[var(--foreground)]">carga un Módulo didáctico o un archivo de Curso</strong> desde la sección de Gestión de archivos que encontrarás justo aquí abajo.
                </p>
              </section>
            )}

            {/* --- GESTIÓN DE ARCHIVOS --- */}
            <div>
              <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-3 mb-2">
                📁 Gestión de archivos
              </h2>
              <p className="text-[var(--text-muted)] mb-6">Carga y guarda los datos de Centro educativo; módulo didáctico; y curso y alumnado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Tarjeta de Centro educativo*/}
              <div className="glass-card p-6 border-t-4 border-t-purple-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div>
                  <h4 className="text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <span>🏢</span> Centro educativo
                  </h4>
                  <p className="text-sm text-gray-400">
                    Información del Centro educativo, presentación, planes, calendario académico y descargar PDF.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Centro educativo</label>
                    <select
                      value={selectedCentro}
                      onChange={(e) => setSelectedCentro(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
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
                    <span>📂</span> Cargar Centro educativo
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Centro educativo</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newCentroName}
                        onChange={(e) => setNewCentroName(e.target.value)}
                        placeholder="Nombre del archivo de Centro"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveCentro}
                    disabled={!newCentroName}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-[var(--foreground)] font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar Centro educativo
                  </button>
                </div>
              </div>

              {/* Tarjeta de Módulo (PD) */}
              <div className="glass-card p-6 border-t-4 border-t-[#14a085] flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-[#14a085]/10">
                <div>
                  <h4 className="text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <span>⚙️</span> Módulo didáctico
                  </h4>
                  <p className="text-sm text-gray-400">
                    Programación del módulo didáctico, matrices RA→CE→UD, instrumentos de evaluación, programación de aula y seguimiento diario.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Módulo didáctico</label>
                    <select
                      value={selectedPd}
                      onChange={(e) => setSelectedPd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[#14a085] transition-colors appearance-none cursor-pointer"
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
                    <span>📂</span> Cargar Módulo didáctico
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Módulo didáctico</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newPdName}
                        onChange={(e) => setNewPdName(e.target.value)}
                        placeholder="Nombre del archivo de Módulo"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[#14a085] transition-colors"
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-mono text-sm">-pd</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSavePd}
                    disabled={!newPdName || !moduleData}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-[var(--foreground)] font-bold py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Guardar Módulo didáctico
                  </button>
                </div>
              </div>

              {/* Tarjeta de Curso */}
              <div className="glass-card p-6 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <div>
                  <h4 className="text-xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <span>📅</span> Curso y alumnado
                  </h4>
                  <p className="text-sm text-gray-400">
                    Curso actual: Matrícula alumnado, calificación académica, calificación FEOE, evaluación continua, análisis grupal y portal alumnado.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Seleccionar Curso y alumnado</label>
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
                    <span>📂</span> Cargar Curso y alumnado
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Guardar Curso y alumnado</label>
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
                    <span>💾</span> Guardar Curso y alumnado
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
