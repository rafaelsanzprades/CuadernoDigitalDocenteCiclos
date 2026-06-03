"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fileManager, DataSourceType } from "@/services/fileManager";
import { initialGroups } from "@/store/initialData";
import {
  FileText, Download, Upload,
  Cloud, RefreshCw, CheckCircle, AlertTriangle,
  ArrowRight, ShieldAlert, Sparkles, LogIn
} from "lucide-react";
import toast from "react-hot-toast";

export default function EntornoTrabajoPage() {
  const {
    activeModuleId, setActiveModuleId,
    activeCursoId, setActiveCursoId,
    setModuleData, setCursoData
  } = useAppStore();

  const [dataSource, setDataSource] = useState<DataSourceType>('demo');
  const [activeTab, setActiveTab] = useState<"demo" | "real" | "backup">("demo");
  const [db, setDb] = useState<Record<string, any>>({});

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
    setActiveTab(currentDataSource === 'demo' ? 'demo' : 'real');

    // Helper to load data from backend when in local mode with empty cache
    const loadFromBackend = async () => {
      try {
        const [pdRes, cursoRes] = await Promise.all([
          fetch('/api/module/0237-ictve-pd'),
          fetch('/api/module/0237-ictve-curso-2025-26')
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
      if (type === 'demo') {
        setActiveTab('demo');
      } else {
        setActiveTab(prev => prev === 'demo' ? 'real' : prev);
      }
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
          fetch('/api/module/0237-ictve-pd'),
          fetch('/api/module/0237-ictve-curso-2025-26')
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
    toast.success("Copia de seguridad descargada correctamente 💾");
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
        toast.success("Base de datos importada correctamente 📂");
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
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix="Ajustes de datos" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          {/* Changed container to full width w-full */}
          <div className="w-full space-y-8 pb-12">

            {/* Title */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                📂 Entorno de trabajo
              </h1>
              <p className="text-muted mt-2 text-lg">
                Elige dónde residen tus datos: trabájalo en local o sincronízalo en tu Google Drive / OneDrive personal.
              </p>
            </div>



            {/* Tabs para conmutar modos de almacenamiento */}
            <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("demo")}
                className={`px-6 py-4 font-bold text-base border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "demo"
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
                  }`}
              >
                💡 Datos ficticios (demo)
              </button>
              <button
                onClick={() => setActiveTab("real")}
                className={`px-6 py-4 font-bold text-base border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "real"
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
                  }`}
              >
                🛡️ Datos reales en local
              </button>
              <button
                onClick={() => setActiveTab("backup")}
                className={`px-6 py-4 font-bold text-base border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === "backup"
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-foreground'
                  }`}
              >
                🔄 Respaldo y sincronización
              </button>
            </div>

            {/* Pestaña: Demostración */}
            {activeTab === "demo" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Panel de Activación de Modo Demostración */}
                <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">Modo Datos ficticios (demo)</h3>
                      {dataSource === 'demo' ? (
                        <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30">Activo</Badge>
                      ) : (
                        <Badge variant="default" className="bg-white/10 text-muted border-white/5">Inactivo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted max-w-xl">
                      Permite explorar la aplicación usando datos ficticios y preconfigurados de alumnadodo y asignaciones sin afectar tu información real.
                    </p>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {dataSource === 'demo' ? (
                      <Button
                        onClick={() => handleSourceChange('local')}
                        className="w-full md:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shadow-md"
                      >
                        🛑 Desactivar Datos ficticios (demo) y activar Datos reales en local
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSourceChange('demo')}
                        className="w-full md:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all shadow-md shadow-amber-500/5"
                      >
                        💡 Activar Datos ficticios (demo)
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Rejilla de Información del Modo Demo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Qué incluye */}
                  <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" /> ¿Qué incluye el entorno de demostración?
                    </h3>

                    <ul className="space-y-4 text-sm text-muted">
                      <li className="flex items-start gap-3">
                        <span className="text-amber-400 font-bold shrink-0">✓</span>
                        <div>
                          <strong className="text-foreground block">Módulo de Telecomunicaciones</strong>
                          Infraestructuras de telecomunicación en viviendas y edificios (0237).
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-400 font-bold shrink-0">✓</span>
                        <div>
                          <strong className="text-foreground block">Módulo de Sistemas Informáticos</strong>
                          Módulo didáctico y curso completo del ciclo de Sistemas Informáticos.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-400 font-bold shrink-0">✓</span>
                        <div>
                          <strong className="text-foreground block">Alumnadodo y Asistencia Completa</strong>
                          Fichas de alumnadodo de prueba cargadas con fotos simuladas, datos de contacto y registros históricos de asistencia.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-400 font-bold shrink-0">✓</span>
                        <div>
                          <strong className="text-foreground block">Matriz de Evaluación Completa</strong>
                          Criterios de evaluación y resultados de aprendizaje (RA) vinculados con unidades didácticas y actividades.
                        </div>
                      </li>
                    </ul>
                  </Card>

                  {/* Notas de almacenamiento */}
                  <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      📝 Información del almacenamiento demo
                    </h3>
                    <div className="space-y-4 text-sm text-muted leading-relaxed">
                      <p>
                        * En el modo demostración, todos los cambios que realices en el plano de clase, las notas o las programaciones se guardan de forma temporal en la memoria interna de tu navegador.
                      </p>
                      <p className="text-amber-400/90 font-semibold">
                        * Al cambiar de modo, tus datos reales se conservan de forma totalmente intacta y privada, y podrás volver a verlos cuando desees.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Pestaña: Datos Reales */}
            {activeTab === "real" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Panel de Activación de Datos Reales */}
                <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">Modo Datos reales en local</h3>
                      {dataSource === 'local' ? (
                        <Badge variant="info" className="bg-blue-500/10 text-blue-300 border-blue-500/30">Activo</Badge>
                      ) : (
                        <Badge variant="default" className="bg-white/10 text-muted border-white/5">Inactivo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted max-w-xl">
                      Trabaja de forma totalmente segura con datos reales de tu centro, alumnadodo y evaluaciones cargados en local o respaldados en la nube.
                    </p>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    {dataSource === 'local' ? (
                      <Button
                        onClick={() => handleSourceChange('demo')}
                        className="w-full md:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shadow-md"
                      >
                        🛑 Desactivar Datos reales en local y activar Datos ficticios (demo)
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSourceChange('local')}
                        className="w-full md:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all shadow-md shadow-blue-500/5"
                      >
                        🛡️ Activar Datos reales en local
                      </Button>
                    )}
                  </div>
                </Card>
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
                          <FileText className="w-5 h-5 text-blue-400" /> Respaldar tus datos reales en local
                        </h3>
                        {dataSource !== 'local' && (
                          <span className="text-[10px] bg-white/10 text-muted px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
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
                        className="text-sm font-bold flex items-center gap-2 bg-foreground/10 hover:bg-foreground/15 text-foreground border border-white/5 px-5 py-3 rounded-xl transition-all w-full justify-center"
                      >
                        <Upload className="w-4 h-4 text-blue-400" /> Importar Base de datos (.cdd)
                      </Button>

                      <Button
                        onClick={handleExport}
                        className="text-sm font-bold flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 px-5 py-3 rounded-xl transition-all w-full justify-center"
                      >
                        <Download className="w-4 h-4 text-blue-400" /> Exportar Base de datos (.cdd)
                      </Button>

                    </div>
                  </Card>

                  {/* Sincronización en tu nube */}
                  <Card
                    className={`p-8 border rounded-2xl shadow-lg space-y-6 transition-all duration-300 ${dataSource === 'local' && (googleConnected || onedriveConnected)
                      ? 'border-green-500/50 bg-green-500/5 shadow-md shadow-green-500/5'
                      : 'border-white/5 bg-foreground/5'
                      } ${dataSource !== 'local' ? 'opacity-40 pointer-events-none select-none' : ''}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Cloud className="w-5 h-5 text-accent" /> Sincronizar tus datos locales en tu nube
                        </h2>
                        {dataSource === 'local' && (googleConnected || onedriveConnected) && (
                          <Badge variant="success">Activo</Badge>
                        )}
                        {dataSource !== 'local' && (
                          <span className="text-[10px] bg-white/10 text-muted px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
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
                            G
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground">Google Drive</h3>
                            {googleConnected ? (
                              <p className="text-sm text-green-400/90 truncate font-mono mt-0.5">{googleUser}</p>
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
                            className={`text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1 ${googleConnected
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
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
                            M
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground">Microsoft OneDrive</h3>
                            {onedriveConnected ? (
                              <p className="text-sm text-blue-400/90 truncate font-mono mt-0.5">{onedriveUser}</p>
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
                            className={`text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1 ${onedriveConnected
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                              : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20'
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
                  <ShieldAlert className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-extrabold text-foreground">Seguridad y RGPD garantizados</h3>
                  <div className="text-base text-muted space-y-2">
                    <p>Esta aplicación procesa toda la información confidencial en tu propio entorno.</p>
                    <p>Ningún dato de tu alumnadodo se envía a servidores externos ni es accesible por el administrador.</p>
                    <p className="font-semibold text-blue-300">Asegúrate de hacer backup de tu programación didáctica y cursos para no perderlos al hacer cambios.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Selección y Aviso de Seguridad (solo visibles en pestaña Datos Reales) */}
            {activeTab === "real" && (
              <>
                {/* Sección: Selección */}
                <div className="space-y-4">
                  <Card className="p-8 border border-accent/25 rounded-2xl bg-accent/5 shadow-lg space-y-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                        🎯 Selección de Programación y Curso activos
                      </h3>
                      <p className="text-sm text-muted mt-1">
                        Elige la Programación didáctica y el Curso académico activo sobre los que deseas trabajar en las distintas secciones del cuaderno.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Programming Selector */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-foreground">
                          📚 Programación
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
                        <label className="text-sm font-semibold text-foreground">
                          👥 Curso
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
                            <option value="">
                              {activeModuleId
                                ? "No hay cursos asociados."
                                : "Selecciona primero una programación."}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Aviso de Seguridad y RGPD al final (centrado) */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 pt-8 border-t border-[var(--glass-border)] max-w-2xl mx-auto">
                  <ShieldAlert className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-extrabold text-foreground">Seguridad y RGPD garantizados</h3>
                  <div className="text-base text-muted space-y-2">
                    <p>Esta aplicación procesa toda la información confidencial en tu propio entorno.</p>
                    <p>Ningún dato de tu alumnadodo se envía a servidores externos ni es accesible por el administrador.</p>
                    <p className="font-semibold text-blue-300">Asegúrate de hacer backup de tu programación didáctica y cursos para no perderlos al hacer cambios.</p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
