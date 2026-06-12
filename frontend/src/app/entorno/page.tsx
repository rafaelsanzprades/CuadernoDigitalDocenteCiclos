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
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";
import { GoogleDriveSyncPanel } from "@/components/features/cloud/GoogleDriveSyncPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { initialGroups } from "@/store/initialData";

export default function EntornoTrabajoPage() {
  const {
    activeModuleId, activeCursoId, moduleData, cursoData, dataSource, setDataSource
  } = useAppStore();

  const [aiModalOpen, setAiModalOpen] = useState(false);
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
    toast.success("Cambiado a Datos Ficticios.");
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
    { id: "ia", label: <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 shrink-0" /> Inteligencia artificial</span> },
    { id: "nube", label: <span className="flex items-center gap-2"><Cloud className="w-4 h-4 shrink-0" /> Sincronización con Google Drive</span> }
  ];

  const breadcrumbSuffixMap: Record<string, string> = {
    "datos": "Gestor de archivos",
    "ia": "Inteligencia artificial",
    "nube": "Sincronización con Google Drive"
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <AIWizardModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSuccess={(data) => {
          console.log("Datos recibidos de la IA:", data);
          toast.success("Estructura guardada.");
        }}
      />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix={breadcrumbSuffixMap[activeTab] || "Gestor de archivos"} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-8 pb-12">

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-accent" /> Entorno de trabajo
                </h1>
                <p className="text-muted mt-2 text-lg">
                  CuadernoFP funciona directamente en tu navegador sin requerir base de datos externa. Abre tus ficheros de Programación y Curso para trabajar con ellos, y guárdalos cuando termines.
                </p>
              </div>

              {/* Selector de Modo */}
              {activeTab === "datos" && (
                <div className="bg-foreground/5 p-1 rounded-xl flex border border-white/10 shadow-inner">
                  <button
                    onClick={switchToDemo}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isDemoLoaded
                        ? 'bg-warning/20 text-warning shadow-md'
                        : 'text-muted hover:text-foreground hover:bg-foreground/5'
                      }`}
                  >
                    <Zap className="w-4 h-4" /> Datos ficticios
                  </button>
                  <button
                    onClick={switchToLocal}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isDemoLoaded
                        ? 'bg-info/20 text-info shadow-md'
                        : 'text-muted hover:text-foreground hover:bg-foreground/5'
                      }`}
                  >
                    <Shield className="w-4 h-4" /> Datos reales
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide border-b border-[var(--glass-border)] rounded-none bg-transparent">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap shrink-0">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="space-y-8 animate-in fade-in duration-300 pt-4">
              {/* PESTAÑA: DATOS LOCALES */}
              {activeTab === "datos" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Panel Programación */}
                <Card className={`p-8 border rounded-2xl shadow-lg space-y-6 flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-info/20'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 relative z-10">
                        <BookOpen className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-info'}`} /> Archivo de Programación (.cddp)
                      </h3>
                      {moduleData && <Badge variant={isDemoLoaded ? 'warning' : 'info'}>Cargada</Badge>}
                    </div>
                    <p className="text-sm text-muted mt-1 relative z-10">
                      Contiene tu currículo, unidades didácticas, instrumentos de evaluación y criterios.
                    </p>
                  </div>

                  {moduleData ? (
                    <div className={`${isDemoLoaded ? 'bg-warning/10 border-warning/30' : 'bg-info/10 border-info/30'} border rounded-xl p-4 flex flex-col gap-2 relative z-10`}>
                      <span className={`text-xs font-bold ${isDemoLoaded ? 'text-warning' : 'text-info'} uppercase tracking-wider`}>Activa actualmente:</span>
                      <span className="text-lg font-medium text-foreground">{getFriendlyPdName(activeModuleId)}</span>
                    </div>
                  ) : (
                    <div className="bg-info/5 border border-info/20 rounded-xl p-4 flex flex-col gap-2 items-center justify-center text-info/80 relative z-10 shadow-inner">
                      <span className="font-medium">Ninguna programación cargada</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-auto relative z-10">
                    {isDemoLoaded ? (
                      <Button onClick={handleLoadDemo} className="flex-1 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                        <Zap className="w-4 h-4 mr-2" /> Recargar Datos ficticios
                      </Button>
                    ) : (
                      <>
                        <input type="file" ref={pdInputRef} onChange={handleImportPd} accept=".cddp,.json" className="hidden" />
                        <Button onClick={triggerImportPd} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all">
                          <FolderOpen className="w-4 h-4 mr-2" /> Abrir
                        </Button>
                        <Button onClick={handleExportPd} disabled={!moduleData} className="flex-1 border bg-info/20 hover:bg-info/30 text-info border-info/40 disabled:opacity-40 disabled:hover:bg-info/20 transition-all">
                          <Save className="w-4 h-4 mr-2" /> Guardar
                        </Button>
                      </>
                    )}
                  </div>
                </Card>

                {/* Panel Curso */}
                <Card className={`p-8 border rounded-2xl shadow-lg space-y-6 flex flex-col relative overflow-hidden group ${isDemoLoaded ? 'bg-foreground/5 border-warning/20' : 'bg-foreground/5 border-success/20'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className={`w-24 h-24 ${isDemoLoaded ? 'text-warning' : 'text-success'}`} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2 relative z-10">
                        <Users className={`w-5 h-5 ${isDemoLoaded ? 'text-warning' : 'text-success'}`} /> Archivo de Curso (.cddc)
                      </h3>
                      {cursoData && <Badge variant={isDemoLoaded ? 'warning' : 'success'}>Cargado</Badge>}
                    </div>
                    <p className="text-sm text-muted mt-1 relative z-10">
                      Contiene tu lista de alumnado, calificaciones, partes de asistencia y anotaciones diarias.
                    </p>
                  </div>

                  {cursoData ? (
                    <div className={`${isDemoLoaded ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30'} border rounded-xl p-4 flex flex-col gap-2 relative z-10`}>
                      <span className={`text-xs font-bold ${isDemoLoaded ? 'text-warning' : 'text-success'} uppercase tracking-wider`}>Activo actualmente:</span>
                      <span className="text-lg font-medium text-foreground">{getFriendlyCursoName(activeCursoId)}</span>
                    </div>
                  ) : (
                    <div className="bg-info/5 border border-info/20 rounded-xl p-4 flex flex-col gap-2 items-center justify-center text-info/80 relative z-10 shadow-inner">
                      <span className="font-medium">Ningún curso cargado</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-auto relative z-10">
                    {isDemoLoaded ? (
                      <Button onClick={handleLoadDemo} className="flex-1 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                        <Zap className="w-4 h-4 mr-2" /> Recargar Datos ficticios
                      </Button>
                    ) : (
                      <>
                        <input type="file" ref={cursoInputRef} onChange={handleImportCurso} accept=".cddc,.json" className="hidden" />
                        <Button onClick={triggerImportCurso} className="flex-1 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all">
                          <FolderOpen className="w-4 h-4 mr-2" /> Abrir
                        </Button>
                        <Button onClick={handleExportCurso} disabled={!cursoData} className="flex-1 border bg-info/20 hover:bg-info/30 text-info border-info/40 disabled:opacity-40 disabled:hover:bg-info/20 transition-all">
                          <Save className="w-4 h-4 mr-2" /> Guardar
                        </Button>
                      </>
                    )}
                  </div>
                </Card>

              </div>
              )}

              {/* PESTAÑA: INTELIGENCIA ARTIFICIAL */}
              {activeTab === "ia" && (
                <div className="space-y-8 w-full max-w-6xl mx-auto">
                  {/* Botón de Creación Asistida */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setAiModalOpen(true)}
                      className="text-base font-semibold flex items-center justify-center gap-3 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-8 py-6 h-auto rounded-xl transition-all relative overflow-hidden w-full max-w-lg"
                    >
                      <Sparkles className="w-6 h-6 text-accent shrink-0" /> 
                      <span className="flex-1 text-left">Crear Nueva Programación con IA (PDF)</span>
                      <span className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded text-[10px] font-bold uppercase border border-warning/30 shrink-0"><AlertTriangle className="w-3 h-3" /> Beta</span>
                    </Button>
                  </div>

                  {/* Sección de Ajustes de IA (Dos Columnas) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Configuración */}
                    <div>
                      <AISettingsPanel />
                    </div>

                    {/* Columna Derecha: Instrucciones */}
                    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-info/5 border border-info/20 text-foreground">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-info" /> ¿Cómo obtengo mi API Key?
                      </h3>
                      <p className="text-muted text-sm">
                        CuadernoFP utiliza un modelo "Bring Your Own Key" (Trae tu propia clave) para garantizar que tus datos no pasan por servidores intermedios y mantener la herramienta 100% gratuita.
                      </p>
                      
                      <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/90 font-medium">
                        <li>
                          Entra en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>.
                        </li>
                        <li>
                          Inicia sesión con tu cuenta de Google habitual.
                        </li>
                        <li>
                          Pulsa el botón azul <strong>"Create API key"</strong>.
                        </li>
                        <li>
                          Copia la larga cadena de texto (tu clave secreta) y pégala en la caja de la izquierda.
                        </li>
                      </ol>

                      <div className="mt-auto pt-4 flex items-start gap-3 text-sm text-warning/80 bg-warning/5 p-4 rounded-xl border border-warning/10">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>
                          <strong>Importante:</strong> Esta clave es personal e intransferible. Da acceso al motor de IA usando tu cupo gratuito de desarrollador de Google.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA: NUBE */}
              {activeTab === "nube" && (
                <GoogleDriveSyncPanel />
              )}

              {/* Aviso de Seguridad y RGPD (Sólo en Datos Locales) */}
              {activeTab === "datos" && (
                <div className="flex flex-col items-center justify-center text-center space-y-3 pt-12 max-w-2xl mx-auto">
                  <ShieldAlert className="w-8 h-8 text-info" />
                  <h3 className="text-xl font-extrabold text-foreground">Seguridad y RGPD garantizados</h3>
                  <div className="text-base text-muted space-y-2">
                    <p>CuadernoFP procesa toda tu información confidencial exclusivamente en tu navegador.</p>
                    <p>Ningún dato de tu alumnado se envía a la nube (salvo que uses la Sincronización autorizada). **Tú eres el dueño de tus archivos**.</p>
                    <p className="font-semibold text-info">Asegúrate de pulsar "Guardar" al finalizar tu sesión de trabajo para no perder los últimos cambios.</p>
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
