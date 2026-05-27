"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { BarChart3 } from "lucide-react";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import toast from "react-hot-toast";
import { FileManagementPanel } from "@/components/features/dashboard/FileManagementPanel";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";

export default function Dashboard() {
  const { 
    activeModuleId, setActiveModuleId, 
    activeCursoId, setActiveCursoId, 
    moduleData, setModuleData, 
    cursoData, setCursoData,
    isWizardOpen, setWizardOpen 
  } = useAppStore();

  const { data: modulesList, isLoading: loadingModules, mutate: fetchModules } = useModulesList();

  const modules = {
    centro_modules: modulesList?.centro_modules || ["ciclos-fp"],
    pd_modules: modulesList?.pd_modules || [],
    curso_modules: modulesList?.curso_modules || []
  };

  const [selectedCentro, setSelectedCentro] = useState("ciclos-fp");
  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const [newCentroName, setNewCentroName] = useState("ciclos-fp");
  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nuevo-modulo");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-modulo-curso");

  const [activeTab, setActiveTab] = useState("resumen");

  useEffect(() => {
    if (modulesList) {
      if (modules.pd_modules.length === 0 && !activeModuleId) {
        setWizardOpen(true);
      } else {
        setWizardOpen(false);
      }

      if (!selectedCentro && modules.centro_modules.length > 0) setSelectedCentro(modules.centro_modules[0]);

      if (!selectedPd && modules.pd_modules.length > 0) {
        setSelectedPd(activeModuleId || modules.pd_modules[0]);
      } else if (selectedPd && !modules.pd_modules.includes(selectedPd)) {
        setSelectedPd(modules.pd_modules[0] || "");
      }

      if (!selectedCurso && modules.curso_modules.length > 0) {
        setSelectedCurso(activeCursoId || modules.curso_modules[0]);
      } else if (selectedCurso && !modules.curso_modules.includes(selectedCurso)) {
        setSelectedCurso(modules.curso_modules[0] || "");
      }
    }
  }, [modulesList, activeModuleId, activeCursoId]);

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
    if (!newCursoName || !activeModuleId) {
      showNotification('error', 'Selecciona un módulo activo y un nombre para el nuevo curso.');
      return;
    }
    
    // newCursoName is just the suffix, e.g. "2026-27".
    // We construct the full ID: e.g. "0237-ictve-curso-2026-27"
    const pdPrefix = activeModuleId.replace("-pd", "");
    const saveName = newCursoName.includes("-curso-") ? newCursoName : `${pdPrefix}-curso-${newCursoName}`;

    fetch(`/api/module/${saveName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) // Empezamos con el curso vacío, heredará del padre
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setActiveCursoId(saveName);
          showNotification('success', `✅ Nuevo curso creado y activado: ${saveName}`);
          fetchModules();
        } else {
          showNotification('error', `Error al crear curso: ${data.detail || 'Desconocido'}`);
        }
      })
      .catch(err => {
        showNotification('error', 'Fallo al conectar con el servidor.');
      });
  };

  if (loadingModules && modules.pd_modules.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  const TABS = [
    { id: "resumen", label: "📊 Resumen", cleanLabel: "Resumen" },
    { id: "entorno", label: "📂 Entorno de trabajo", cleanLabel: "Entorno de trabajo" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background relative">
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={fetchModules}
          setActiveModuleId={setActiveModuleId}
          setActiveCursoId={setActiveCursoId}
        />
      )}
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          <div className="space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2">
                <BarChart3 className="w-10 h-10 text-accent" /> Inicio
              </h1>
              <p className="text-muted">Selecciona el Módulo y el Curso en el que vas a trabajar.</p>
            </div>

            <div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "resumen" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span>📊</span> Resumen
                </h2>
                {moduleData || cursoData ? (
                  <MotionWrapper className="space-y-6">
                    <DashboardKPIs cursoData={cursoData} moduleData={moduleData} />
                    <DashboardCharts cursoData={cursoData} />
                  </MotionWrapper>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="¡Bienvenido a tu Cuaderno Digital!"
                    description={
                      <>
                        Para visualizar tu panel de control con métricas y gráficos interactivos, por favor, <strong className="text-foreground">activa un Módulo didáctico o un Curso</strong> desde la pestaña Entorno de trabajo.
                      </>
                    }
                    action={
                      <button onClick={() => setActiveTab("entorno")} className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                        Ir a Entorno de trabajo <span className="text-xl">⚙️</span>
                      </button>
                    }
                  />
                )}
              </div>
            )}

            {activeTab === "entorno" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <span>⚙️</span> Entorno de trabajo
                  </h2>
                </div>
                <FileManagementPanel
                  modules={modules}
                  selectedCentro={selectedCentro}
                  setSelectedCentro={setSelectedCentro}
                  selectedPd={selectedPd}
                  setSelectedPd={setSelectedPd}
                  selectedCurso={selectedCurso}
                  setSelectedCurso={setSelectedCurso}
                  newCentroName={newCentroName}
                  setNewCentroName={setNewCentroName}
                  newPdName={newPdName}
                  setNewPdName={setNewPdName}
                  newCursoName={newCursoName}
                  setNewCursoName={setNewCursoName}
                  handleLoadCentro={handleLoadCentro}
                  handleLoadPd={handleLoadPd}
                  handleLoadCurso={handleLoadCurso}
                  handleSaveCentro={handleSaveCentro}
                  handleSavePd={handleSavePd}
                  handleSaveCurso={handleSaveCurso}
                  moduleData={moduleData}
                />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
