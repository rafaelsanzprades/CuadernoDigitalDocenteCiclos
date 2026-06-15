"use client";
import { AlertTriangle, BookOpen, CheckCircle, Cloud, Database, Download, FileJson, FolderOpen, Save, Shield, ShieldAlert, Sparkles, Upload, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fileManager } from "@/services/fileManager";
import toast from "react-hot-toast";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { GoogleDriveSyncPanel } from "@/components/features/cloud/GoogleDriveSyncPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { initialGroups } from "@/store/initialData";

export default function EntornoTrabajoPage() {
  const {
    activeModuleId, activeCursoId, moduleData, cursoData, dataSource, setDataSource
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("datos");

  const pdInputRef = useRef<HTMLInputElement>(null);
  const cursoInputRef = useRef<HTMLInputElement>(null);

  const isDemoLoaded = dataSource === 'demo';

  // Si estamos en modo demo y no hay datos cargados (por ejemplo, primer inicio), los cargamos.
  useEffect(() => {
    if (dataSource === 'demo' && (!moduleData || !cursoData)) {
      fileManager.loadDemoData();
    }
  }, [dataSource, moduleData, cursoData]);

  const switchToDemo = () => {
    setDataSource("demo");
    fileManager.loadDemoData();
    toast.success("Cambiado a Datos DEMO.");
  };

  const switchToLocal = () => {
    if (dataSource === 'demo') {
      // Clear demo data to provide a clean workspace
      useAppStore.getState().setModuleData(null);
      useAppStore.getState().setCursoData(null);
      useAppStore.getState().setActiveModuleId("");
      useAppStore.getState().setActiveCursoId("");
    }
    setDataSource("local");
    toast.success("Cambiado a Datos Reales en local. Puedes abrir tus archivos.");
  };

  const handleLoadDemo = () => {
    fileManager.loadDemoData();
    toast.success("Datos de demostración cargados correctamente.");
  };

  const triggerImportPd = () => pdInputRef.current?.click();
  const triggerImportCurso = () => cursoInputRef.current?.click();

  const handleImportPd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = fileManager.importProgramacion(content, file.name);
      if (success) {
        if (dataSource === 'demo') setDataSource('local');
        toast.success(<>Programación importada correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></>);
      } else {
        toast.error("Error al importar: el archivo no tiene un formato válido de Programación.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportCurso = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = fileManager.importCurso(content, file.name);
      if (success) {
        if (dataSource === 'demo') setDataSource('local');
        toast.success(<>Curso importado correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></>);
      } else {
        toast.error("Error al importar: el archivo no tiene un formato válido de Curso.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportPd = () => {
    if (!moduleData) {
      toast.error("No hay ninguna Programación cargada para exportar.");
      return;
    }
    fileManager.exportProgramacion();
    toast.success("Programación guardada en tu dispositivo.");
  };

  const handleExportCurso = () => {
    if (!cursoData) {
      toast.error("No hay ningún Curso cargado para exportar.");
      return;
    }
    fileManager.exportCurso();
    toast.success("Curso guardado en tu dispositivo.");
  };

  const getFriendlyPdName = (pdKey: string) => {
    if (pdKey === "imported-pd") return "Programación Importada";
    const code = pdKey.split('-')[0];
    for (const group of initialGroups) {
      const m = group.modules.find(mod => mod.code === code);
      if (m) return `${m.name} (${code})`;
    }
    return pdKey;
  };

  const getFriendlyCursoName = (cursoKey: string) => {
    if (cursoKey === "imported-curso") return "Curso Importado";
    const parts = cursoKey.split('-');
    const code = parts[0];
    const year = parts[parts.length - 1];
    for (const group of initialGroups) {
      const hasModule = group.modules.some(m => m.code === code);
      if (hasModule) return `${group.name} (${year})`;
    }
    return `Curso ${year} (${cursoKey})`;
  };

  const TABS = [
    { id: "datos", label: <span className="flex items-center gap-2"><Database className="w-4 h-4 shrink-0" /> Gestor de archivos</span> },
    ...(dataSource !== 'demo' ? [{ id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Sincronización con Google Drive</span> }] : [])
  ];

  const breadcrumbSuffixMap: Record<string, string> = {
    "datos": "Gestor de archivos",
    "nube": "Sincronización con Google Drive"
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix={breadcrumbSuffixMap[activeTab] || "Gestor de archivos"} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-8 pb-12">

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-accent" /> Entorno
                </h1>
                <p className="text-muted mt-2 text-lg">
                  CuadernoFP funciona directamente en tu navegador sin requerir base de datos externa. Abre tus ficheros de Programación y Curso para trabajar con ellos, y guárdalos cuando termines.
                </p>
              </div>

              {/* PESTAÑA: NUBE (solo en modo datos reales) */}
              {activeTab === "nube" && dataSource !== 'demo' && (
                <GoogleDriveSyncPanel />
              )}

              {/* Aviso de Seguridad y RGPD (SÁ³lo en Datos Locales) */}
              {activeTab === "datos" && (
                <div className="flex items-start gap-4 pt-12 max-w-2xl mx-auto">
                  <span className="text-info mt-1 shrink-0"><ShieldAlert className="w-6 h-6" /></span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Seguridad y RGPD garantizados</h3>
                    <div className="text-sm text-foreground/80 space-y-2 leading-relaxed">
                      <p>CuadernoFP procesa toda tu información confidencial exclusivamente en tu navegador.</p>
                      <p>Ningún dato de tu alumnado se envÁ­a a la nube (salvo que uses la Sincronización autorizada). <strong>Tú eres el dueño de tus archivos</strong>.</p>
                      <p className="font-semibold text-info mt-2">Asegúrate de pulsar "Guardar" al finalizar tu sesión de trabajo para no perder los últimos cambios.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
