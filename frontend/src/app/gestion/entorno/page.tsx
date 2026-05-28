"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { FileManagementPanel } from "@/components/features/dashboard/FileManagementPanel";
import { useModulesList } from "@/hooks/useApi";
import toast from "react-hot-toast";

export default function EntornoTrabajoPage() {
  const { 
    activeModuleId, setActiveModuleId, 
    activeCursoId, setActiveCursoId, 
    moduleData, setModuleData, 
    cursoData, setCursoData
  } = useAppStore();

  const { data: modulesList, isLoading: loadingModules, mutate: fetchModules } = useModulesList();

  const modules = {
    centro_modules: modulesList?.centro_modules || ["ciclos-fp"],
    pd_modules: modulesList?.pd_modules || [],
    curso_modules: modulesList?.curso_modules || []
  };

  const [selectedPd, setSelectedPd] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const [newPdName, setNewPdName] = useState(activeModuleId ? activeModuleId.replace("-pd", "") : "nueva-programacion");
  const [newCursoName, setNewCursoName] = useState(activeCursoId || "nuevo-curso");

  useEffect(() => {
    if (modulesList) {
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

  const handleLoadPd = () => {
    if (selectedPd) {
      setActiveModuleId(selectedPd);
      setNewPdName(selectedPd.replace("-pd", ""));
      showNotification('success', `Programación ${selectedPd} cargada correctamente`);
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
      showNotification('error', 'No hay datos de Programación en memoria para guardar.');
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
          showNotification('success', `✅ Programación guardada como: ${saveName}`);
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
      showNotification('error', 'Selecciona una programación activa y un nombre para el nuevo curso.');
      return;
    }
    
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

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix="Gestor de archivos" />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="w-full mx-auto space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2 animate-in slide-in-from-left-4 duration-500">
                📂 Entorno de trabajo
              </h1>
              <p className="text-muted text-lg">
                Selecciona, crea o clona Programaciones y Cursos para comenzar a trabajar.
              </p>
            </div>

            <FileManagementPanel
              modules={modules}
              selectedPd={selectedPd} setSelectedPd={setSelectedPd}
              selectedCurso={selectedCurso} setSelectedCurso={setSelectedCurso}
              newPdName={newPdName} setNewPdName={setNewPdName}
              newCursoName={newCursoName} setNewCursoName={setNewCursoName}
              handleLoadPd={handleLoadPd} handleLoadCurso={handleLoadCurso}
              handleSavePd={handleSavePd} handleSaveCurso={handleSaveCurso}
              moduleData={moduleData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
