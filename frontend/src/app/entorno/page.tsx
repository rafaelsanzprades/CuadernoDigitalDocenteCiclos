"use client";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle, Cloud, Database, Download, FileDown, FileJson, FileText, FolderDown, FolderOpen, Lightbulb, LogIn, Power, PowerOff, RefreshCw, Save, Server, ServerOff, Shield, ShieldAlert, Sparkles, Target, Upload, Users, Zap, CheckCircle2, Copy } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { fileManager, DataSourceType } from "@/services/fileManager";
import { initialGroups } from "@/store/initialData";
import toast from "react-hot-toast";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";

export default function EntornoTrabajoPage() {
  const {
    activeModuleId, setActiveModuleId,
    activeCursoId, setActiveCursoId,
    setModuleData, setCursoData
  } = useAppStore();

  const [dataSource, setDataSource] = useState<DataSourceType>('demo');
  const [activeTab, setActiveTab] = useState<"demo" | "real" | "backup">("demo");
  const [db, setDb] = useState<Record<string, any>>({});
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Cloud mock states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState("");
  const [onedriveConnected, setOnedriveConnected] = useState(false);
  const [onedriveUser, setOnedriveUser] = useState("");
  const [syncing, setSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state from fileManager and localStorage
  useEffect(() => {
    const currentDataSource = fileManager.getDataSourceType();
    setDataSource(currentDataSource);

    // Helper to load data from backend when in local mode with empty cache
    const loadFromBackend = async () => {
      try {
        const [pdRes, cursoRes] = await Promise.all([
          fetchWithTimeout('/api/module/0237-ictve-pd'),
          fetchWithTimeout('/api/module/0237-ictve-curso-2025-26')
        ]);
        const pdData = await pdRes.json();
        const cursoData = await cursoRes.json();
        const db: Record<string, any> = {};
        if (pdData.status === 'success') {
          db['0237-ictve-pd'] = pdData.data;
          setActiveModuleId('0237-ictve-pd');
          setModuleData(pdData.data);
        }
        if (cursoData.status === 'success') {
          db['0237-ictve-curso-2025-26'] = cursoData.data;
          setActiveCursoId('0237-ictve-curso-2025-26');
          setCursoData(cursoData.data);
        }
        fileManager.saveDb(db);
        setDb(db);
      } catch (err) {
        console.error("Error fetching backend data on mount:", err);
      }
    };

    const currentDb = fileManager.getDb();
    const hasLocalData = Object.keys(currentDb).some(k => k.endsWith('-pd') || k.includes('-curso-'));

    if (currentDataSource === 'local' && !hasLocalData) {
      loadFromBackend();
    } else {
      setDb(currentDb);
      const pds = Object.keys(currentDb).filter(k => k.endsWith('-pd'));
      const cursos = Object.keys(currentDb).filter(k => k.includes('-curso-'));
      if (pds.length > 0) {
        setActiveModuleId(pds[0]);
        setModuleData(currentDb[pds[0]]);
      }
      if (cursos.length > 0) {
        setActiveCursoId(cursos[0]);
        setCursoData(currentDb[cursos[0]]);
      }
    }

    setGoogleConnected(fileManager.isGoogleConnected());
    setGoogleUser(fileManager.getGoogleUser());
    setOnedriveConnected(fileManager.isOneDriveConnected());
    setOnedriveUser(fileManager.getOneDriveUser());

    const handleChanged = () => {
      const type = fileManager.getDataSourceType();
      const currentDb = fileManager.getDb();
      setDataSource(type);
      setDb(currentDb);
      setGoogleConnected(fileManager.isGoogleConnected());
      setGoogleUser(fileManager.getGoogleUser());
      setOnedriveConnected(fileManager.isOneDriveConnected());
      setOnedriveUser(fileManager.getOneDriveUser());

      // Update active states in Zustand store if they exist in the new DB
      const pds = Object.keys(currentDb).filter(k => k.endsWith('-pd'));
      const cursos = Object.keys(currentDb).filter(k => k.includes('-curso-'));

      if (pds.length > 0 && !currentDb[activeModuleId]) {
        setActiveModuleId(pds[0]);
        setModuleData(currentDb[pds[0]]);
      } else if (pds.length > 0 && currentDb[activeModuleId]) {
        setModuleData(currentDb[activeModuleId]);
      }
      if (cursos.length > 0 && !currentDb[activeCursoId]) {
        setActiveCursoId(cursos[0]);
        setCursoData(currentDb[cursos[0]]);
      } else if (cursos.length > 0 && currentDb[activeCursoId]) {
        setCursoData(currentDb[activeCursoId]);
      }
    };

    window.addEventListener('cdd-datasource-changed', handleChanged);
    return () => window.removeEventListener('cdd-datasource-changed', handleChanged);
  }, [activeModuleId, activeCursoId, setActiveModuleId, setActiveCursoId, setModuleData, setCursoData]);

  // Handle data source toggle
  const handleSourceChange = async (type: DataSourceType) => {
    fileManager.setDataSourceType(type);

    if (type === 'local') {
      // Fetch real data from the backend API
      try {
        const [pdRes, cursoRes] = await Promise.all([
          fetchWithTimeout('/api/module/0237-ictve-pd'),
          fetchWithTimeout('/api/module/0237-ictve-curso-2025-26')
        ]);
        const pdData = await pdRes.json();
        const cursoData = await cursoRes.json();

        // Build a DB object and save it to fileManager's local storage
        const db: Record<string, any> = {};
        if (pdData.status === 'success') {
          db['0237-ictve-pd'] = pdData.data;
          setActiveModuleId('0237-ictve-pd');
          setModuleData(pdData.data);
        }
        if (cursoData.status === 'success') {
          db['0237-ictve-curso-2025-26'] = cursoData.data;
          setActiveCursoId('0237-ictve-curso-2025-26');
          setCursoData(cursoData.data);
        }
        fileManager.saveDb(db);
      } catch (err) {
        console.error("Error fetching data from backend:", err);
        toast.error("No se pudo conectar con el backend");
        setActiveModuleId("");
        setModuleData(null);
        setActiveCursoId("");
        setCursoData(null);
      }
    } else {
      const newDb = fileManager.getDb();
      const pds = Object.keys(newDb).filter(k => k.endsWith('-pd'));
      const cursos = Object.keys(newDb).filter(k => k.includes('-curso-'));

      if (pds.length > 0) {
        setActiveModuleId(pds[0]);
        setModuleData(newDb[pds[0]]);
      } else {
        setActiveModuleId("");
        setModuleData(null);
      }

      if (cursos.length > 0) {
        setActiveCursoId(cursos[0]);
        setCursoData(newDb[cursos[0]]);
      } else {
        setActiveCursoId("");
        setCursoData(null);
      }
    }

    toast.success(`Cargados datos en modo: ${type === 'demo' ? 'DEMOSTRACIÓN' : 'LOCAL'}`);
  };

  // Export JSON file
  const handleExport = () => {
    fileManager.exportToJsonFile();
    toast.success(<>Copia de seguridad descargada correctamente <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>);
  };

  // Trigger file input
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      // Auto switch to local mode when importing user data
      fileManager.setDataSourceType('local');

      const success = fileManager.importFromJson(content);
      if (success) {
        toast.success(<>Base de datos importada correctamente <span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></>);
      } else {
        toast.error("Error al importar: el archivo no tiene un formato válido");
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };


  // Simulated Google connection
  const handleConnectGoogle = () => {
    if (googleConnected) {
      fileManager.setGoogleConnected(false, "");
      toast.success("Desconectado de Google Drive");
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      fileManager.setGoogleConnected(true, "rafael.sanz@educa.aragon.es");
      setSyncing(false);
      // Auto switch to local when connecting a cloud drive
      fileManager.setDataSourceType('local');
      toast.success("Conectado con éxito a Google Drive corporativo");
    }, 1500);
  };

  // Simulated OneDrive connection
  const handleConnectOneDrive = () => {
    if (onedriveConnected) {
      fileManager.setOneDriveConnected(false, "");
      toast.success("Desconectado de Microsoft OneDrive");
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      fileManager.setOneDriveConnected(true, "rafael.sanz@ceip-ies-aragon.onmicrosoft.com");
      setSyncing(false);
      // Auto switch to local when connecting a cloud drive
      fileManager.setDataSourceType('local');
      toast.success("Conectado con éxito a Microsoft OneDrive");
    }, 1500);
  };

  const pdKeys = Object.keys(db).filter(k => k.endsWith('-pd'));
  const cursoKeys = Object.keys(db).filter(k => k.includes('-curso-'));

  const getFriendlyPdName = (pdKey: string) => {
    const code = pdKey.split('-')[0];
    for (const group of initialGroups) {
      const m = group.modules.find(mod => mod.code === code);
      if (m) {
        return `${m.name} (${code})`;
      }
    }
    return pdKey;
  };

  const getFriendlyCursoName = (cursoKey: string) => {
    const parts = cursoKey.split('-');
    const code = parts[0];
    const year = parts[parts.length - 1];
    for (const group of initialGroups) {
      const hasModule = group.modules.some(m => m.code === code);
      if (hasModule) {
        return `${group.name} (${year})`;
      }
    }
    return `Curso ${year} (${cursoKey})`;
  };

  const handlePdChange = (pdKey: string) => {
    setActiveModuleId(pdKey);
    setModuleData(db[pdKey] || null);

    const prefix = pdKey.replace('-pd', '');
    const matchingCursos = cursoKeys.filter(k => k.startsWith(prefix + '-curso-'));
    if (matchingCursos.length > 0) {
      setActiveCursoId(matchingCursos[0]);
      setCursoData(db[matchingCursos[0]] || null);
    } else {
      setActiveCursoId("");
      setCursoData(null);
    }
    toast.success("Programación activa actualizada");
  };

  const handleCursoChange = (cursoKey: string) => {
    setActiveCursoId(cursoKey);
    setCursoData(db[cursoKey] || null);
    toast.success("Curso activo actualizado");
  };

  const selectedPdPrefix = activeModuleId ? activeModuleId.replace('-pd', '') : '';
  const filteredCursoKeys = cursoKeys.filter(k => k.startsWith(selectedPdPrefix + '-curso-'));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <AIWizardModal 
        isOpen={aiModalOpen} 
        onClose={() => setAiModalOpen(false)} 
        onSuccess={(data) => {
          console.log("Datos recibidos de la IA:", data);
          toast.success("Estructura guardada. Asegúrate de seleccionarla en el desplegable.");
          // Aquí se integraría la lógica para mezclar 'data' con la store local.
        }} 
      />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix="Ajustes de datos" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          {/* Changed container to full width w-full */}
          <MotionWrapper className="w-full space-y-8 pb-12">

            {/* Title */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-accent" /> Entorno de trabajo
              </h1>
              <p className="text-muted mt-2 text-lg">
                Elige dónde residen tus datos: trabájalo en local o sincronízalo en tu Google Drive / OneDrive personal.
              </p>
            </div>



            {/* Tabs para conmutar modos de almacenamiento */}
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="mb-2 max-w-full">
                <TabsTrigger value="demo" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" /> Modos de trabajo
                </TabsTrigger>
                <TabsTrigger value="backup" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-info" /> Respaldo y sincronización
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className={`mt-2 mb-6 p-3 rounded-xl border flex items-center justify-center font-semibold text-sm shadow-md transition-colors ${
              dataSource === 'demo' 
                ? 'bg-warning/10 border-warning/30 text-warning shadow-amber-500/5'
                : 'bg-info/10 border-info/30 text-info shadow-blue-500/5'
            }`}>
              {dataSource === 'demo' ? (
                <><AlertTriangle className="w-4 h-4 mr-2" /> ACTIVADO. Datos ficticios</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" /> ACTIVADO. Datos reales en local</>
              )}
            </div>

            {/* Pestaña: Demostración */}
            {activeTab === "demo" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Grid 2 columnas: Demo | Local */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel Demo */}
                  <Card className="p-6 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg space-y-4 flex flex-col">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">Modo Datos ficticios</h3>
                      {dataSource === 'demo' ? (
                        <Badge variant="warning" className="bg-warning/10 text-warning border-warning/30">Activo</Badge>
                      ) : (
                        <Badge variant="default" className="bg-white/10 text-muted border-white/5">Inactivo</Badge>
                      )}
                    </div>
                    {dataSource === 'demo' ? (
                      <div className="w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-3 border border-warning/30 bg-warning/10 text-warning shadow-md">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        Este es tu modo actual
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSourceChange('demo')}
                        className="w-full py-3 px-6 rounded-xl font-bold flex items-center gap-3 border border-warning/30 bg-warning/10 text-warning hover:bg-warning/10 transition-all shadow-md shadow-amber-500/5"
                      >
                        <Zap className="w-5 h-5 shrink-0" />
                        Cambiar a modo Datos ficticios
                      </Button>
                    )}
                    <p className="text-sm text-muted mt-auto">
                      Permite explorar la aplicación usando Datos ficticios de alumnado y asignaciones sin afectar tu información.
                    </p>
                  </Card>

                  {/* Panel Local */}
                  <Card className="p-6 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg space-y-4 flex flex-col">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">Datos reales en local</h3>
                      {dataSource === 'local' ? (
                        <Badge variant="info" className="bg-info/10 text-info border-info/30">Activo</Badge>
                      ) : (
                        <Badge variant="default" className="bg-white/10 text-muted border-white/5">Inactivo</Badge>
                      )}
                    </div>
                    {dataSource === 'local' ? (
                      <div className="w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-3 border border-info/30 bg-info/10 text-info shadow-md">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        Este es tu modo actual
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSourceChange('local')}
                        className="w-full py-3 px-6 rounded-xl font-bold flex items-center gap-3 border border-info/30 bg-info/10 text-info hover:bg-info/10 transition-all shadow-md shadow-blue-500/5"
                      >
                        <Power className="w-5 h-5 shrink-0" />
                        Cambiar a Datos reales en local
                      </Button>
                    )}
                    <p className="text-sm text-muted mt-auto">
                      Trabaja de forma totalmente segura con datos reales de tu Centro, alumnado y evaluaciones cargados en local o respaldados en la nube.
                    </p>
                  </Card>
                </div>

                {/* Sección: Selección */}
                <div className={`space-y-4 transition-all duration-300 ${dataSource === 'demo' ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                  <Card className="p-8 border border-accent/25 rounded-2xl bg-accent/5 shadow-lg space-y-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" /> Selección de Programación y Curso activos
                        {dataSource === 'demo' && (
                          <span className="text-[10px] bg-white/10 text-muted px-2.5 py-1 rounded-full font-bold tracking-wider ml-2">
                            No disponible en modo Datos ficticios
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        Elige la Programación didáctica y el Curso académico activo sobre los que deseas trabajar en las distintas secciones del cuaderno.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Programming Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-info" /> Programación
                        </label>
                        <select
                          disabled={pdKeys.length === 0}
                          value={activeModuleId || ""}
                          onChange={(e) => handlePdChange(e.target.value)}
                          className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pdKeys.length > 0 ? (
                            <>
                              <option value="" disabled>Selecciona una programación...</option>
                              {pdKeys.map(k => (
                                <option key={k} value={k}>
                                  {getFriendlyPdName(k)}
                                </option>
                              ))}
                            </>
                          ) : (
                            <option value="">No hay programaciones cargadas.</option>
                          )}
                        </select>
                      </div>

                      {/* Course Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-info" /> Curso
                        </label>
                        <select
                          disabled={filteredCursoKeys.length === 0}
                          value={activeCursoId || ""}
                          onChange={(e) => handleCursoChange(e.target.value)}
                          className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {filteredCursoKeys.length > 0 ? (
                            <>
                              <option value="" disabled>Selecciona un curso...</option>
                              {filteredCursoKeys.map(k => (
                                <option key={k} value={k}>
                                  {getFriendlyCursoName(k)}
                                </option>
                              ))}
                            </>
                          ) : (
                            <option value="">{activeModuleId
                                ? "No hay cursos asociados."
                                : "Selecciona primero una programación."}</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Sección de Ajustes de IA */}
                <div className="space-y-4">
                  <AISettingsPanel />
                </div>

                {/* Aviso de Seguridad y RGPD al final (centrado) */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 pt-8 border-t border-[var(--glass-border)] max-w-2xl mx-auto">
                  <ShieldAlert className="w-8 h-8 text-info" />
                  <h3 className="text-xl font-extrabold text-foreground">Seguridad y RGPD garantizados</h3>
                  <div className="text-base text-muted space-y-2">
                    <p>Esta aplicación procesa toda la información confidencial en tu propio entorno.</p>
                    <p>Ningún dato de tu alumnado se envía a servidores externos ni es accesible por el administrador.</p>
                    <p className="font-semibold text-info">Asegúrate de hacer backup de tu programación didáctica y cursos para no perderlos al hacer cambios.</p>
                  </div>
                </div>

              </div>
            )}

            {/* Pestaña: Respaldo y sincronización */}
            {activeTab === "backup" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Rejilla de Copias de seguridad y Nube */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  {/* Copias de seguridad */}
                  <Card
                    className={`p-8 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg flex flex-col justify-between gap-6 transition-all duration-300 ${dataSource !== 'local' ? 'opacity-40 pointer-events-none select-none' : ''
                      }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <FileText className="w-5 h-5 text-info" /> Respaldar tus datos reales en local
                        </h3>
                        {dataSource !== 'local' && (
                          <span className="text-[10px] bg-white/10 text-muted px-2.5 py-1 rounded-full font-bold tracking-wider">
                            No disponible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1">
                        Descarga tu Base de datos (.cdd) para hacer copias de seguridad o usar tu cuaderno en otro dispositivo.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".cdd"
                        className="hidden"
                      />

                      <Button
                        onClick={triggerImport}
                        className="text-sm font-semibold flex items-center gap-2 bg-foreground/10 hover:bg-foreground/15 text-foreground border border-white/5 px-5 py-3 rounded-xl transition-all w-full justify-center"
                      >
                        <Upload className="w-4 h-4 text-info" /> Importar Base de datos (.cdd)
                      </Button>

                      <Button
                        onClick={() => setAiModalOpen(true)}
                        className="text-sm font-semibold flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-5 py-3 rounded-xl transition-all w-full justify-center relative overflow-hidden"
                      >
                        <Sparkles className="w-4 h-4 text-accent" /> Importar Currículo con Asistente IA (PDF)
                        <span className="flex items-center gap-1 bg-warning/20 text-warning px-1.5 py-0.5 ml-2 rounded text-[10px] font-bold uppercase border border-warning/30"><AlertTriangle className="w-3 h-3" /> En obra</span>
                      </Button>

                      <Button
                        onClick={handleExport}
                        className="text-sm font-semibold flex items-center gap-2 bg-info/10 hover:bg-info/10 text-info border border-info/30 px-5 py-3 rounded-xl transition-all w-full justify-center"
                      >
                        <Download className="w-4 h-4 text-info" /> Exportar Base de datos (.cdd)
                      </Button>

                    </div>
                  </Card>

                  {/* Sincronización en tu nube */}
                  <Card
                    className={`p-8 border rounded-2xl shadow-lg space-y-6 transition-all duration-300 ${dataSource === 'local' && (googleConnected || onedriveConnected)
                      ? 'border-success/30 bg-success/10 shadow-md shadow-green-500/5'
                      : 'border-white/5 bg-foreground/5'
                      } ${dataSource !== 'local' ? 'opacity-40 pointer-events-none select-none' : ''}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-accent" /> Sincronizar tus datos locales en tu nube
                        <span className="flex items-center gap-1 ml-2 bg-warning/20 text-warning px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-warning/30"><AlertTriangle className="w-3 h-3" /> En obra</span>
                      </h2>
                        {dataSource === 'local' && (googleConnected || onedriveConnected) && (
                          <Badge variant="success">Activo</Badge>
                        )}
                        {dataSource !== 'local' && (
                          <span className="text-[10px] bg-white/10 text-muted px-2.5 py-1 rounded-full font-bold tracking-wider">
                            No disponible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1">
                        Conecta tus nubes corporativas para guardar tu base de datos directamente en tu almacenamiento de confianza.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Google Drive Card */}
                      <div className="border border-white/5 bg-background/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xl text-foreground">
                            g
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground">Google Drive</h3>
                            {googleConnected ? (
                              <p className="text-sm text-success truncate font-mono mt-0.5">{googleUser}</p>
                            ) : (
                              <p className="text-sm text-muted mt-0.5">No conectado</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {googleConnected ? (
                            <Badge variant="success">Sincronizado</Badge>
                          ) : (
                            <Badge variant="default">Desconectado</Badge>
                          )}

                          <Button
                            onClick={handleConnectGoogle}
                            disabled={syncing}
                            className={`text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1 ${googleConnected
                              ? 'bg-danger/10 text-danger hover:bg-danger/10 border border-danger/30'
                              : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
                              }`}
                          >
                            {syncing ? 'Conectando...' : googleConnected ? 'Desconectar' : 'Conectar'}
                          </Button>
                        </div>
                      </div>

                      {/* OneDrive Card */}
                      <div className="border border-white/5 bg-background/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xl text-foreground">
                            m
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground">Microsoft OneDrive</h3>
                            {onedriveConnected ? (
                              <p className="text-sm text-info truncate font-mono mt-0.5">{onedriveUser}</p>
                            ) : (
                              <p className="text-sm text-muted mt-0.5">No conectado</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {onedriveConnected ? (
                            <Badge variant="info">Sincronizado</Badge>
                          ) : (
                            <Badge variant="default">Desconectado</Badge>
                          )}

                          <Button
                            onClick={handleConnectOneDrive}
                            disabled={syncing}
                            className={`text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1 ${onedriveConnected
                              ? 'bg-danger/10 text-danger hover:bg-danger/10 border border-danger/30'
                              : 'bg-info/10 text-info hover:bg-info/10 border border-info/30'
                              }`}
                          >
                            {syncing ? 'Conectando...' : onedriveConnected ? 'Desconectar' : 'Conectar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Aviso de Seguridad de RGPD al final (centrado) */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 pt-4 max-w-2xl mx-auto">
                  <ShieldAlert className="w-8 h-8 text-info" />
                  <h3 className="text-xl font-extrabold text-foreground">Seguridad y RGPD garantizados</h3>
                  <div className="text-base text-muted space-y-2">
                    <p>Esta aplicación procesa toda la información confidencial en tu propio entorno.</p>
                    <p>Ningún dato de tu alumnado se envía a servidores externos ni es accesible por el administrador.</p>
                    <p className="font-semibold text-info">Asegúrate de hacer backup de tu programación didáctica y cursos para no perderlos al hacer cambios.</p>
                  </div>
                </div>
              </div>
            )}



          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
