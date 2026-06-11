"use client";
import { AlertTriangle, BarChart, BookOpen, Calculator, Calendar, CalendarDays, ChevronRight, Construction, CornerLeftUp, Download, DownloadCloud, File, FileEdit, FileSpreadsheet, FileText, Folder, FolderOpen, GraduationCap, MapPin, Play, Scale, Search, Settings, UploadCloud, User, Users, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { Alumnado } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

export default function DocumentosPage() {
  const [activeTab, setActiveTab] = useState<"inicio" | "seguimiento" | "evaluacion">("inicio");

  // State for Explorador
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [downloadingStr, setDownloadingStr] = useState<string | null>(null);

  // State for Descargas
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loadingData, setLoadingData] = useState(true);

  const fetchDocuments = (path: string) => {
    setLoadingDocs(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?path=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al acceder a los documentos");
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setItems(json.data);
          setCurrentPath(path);
        } else {
          setError(json.detail || "Error desconocido");
        }
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setError(err.message);
      })
      .finally(() => setLoadingDocs(false));
  };



  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoadingData(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoadingData(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

  // Explorador Handlers
  const handleNavigate = (newPath: string) => {
    fetchDocuments(newPath);
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const parentPath = parts.join("/");
    fetchDocuments(parentPath);
  };

  const handleDownloadDoc = async (filePath: string, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const previewable = ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'docx'].includes(ext);

    if (!previewable) {
      window.open(`/api/documents/download?file_path=${encodeURIComponent(filePath)}`, "_blank");
      return;
    }

    try {
      setDownloadingStr(filePath);
      const url = `/api/documents/preview?file_path=${encodeURIComponent(filePath)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error fetching document");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      setPreviewUrl(objectUrl);
      const displayFilename = ext === 'docx' ? filename.replace(/\.docx$/i, '.pdf') : filename;
      setPreviewFilename(displayFilename);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar la previsualización del documento.");
    } finally {
      setDownloadingStr(null);
    }
  };

  // Descargas Handlers
  const handleDownloadPdf = async (type: string, al_id?: string) => {
    try {
      setDownloadingStr(type);
      let url = `/api/pdf?type=${type}`;
      if (al_id) url += `&al_id=${al_id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          module_data: moduleData || {},
          curso_data: cursoData || {}
        })
      });
      if (!response.ok) throw new Error("Error generating PDF");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const modName = moduleData?.info_modulo?.modulo || "Modulo";

      let filename = `${type}_${modName}.pdf`;
      if (al_id) filename = `Boletin_${al_id}_${modName}.pdf`;

      setPreviewUrl(downloadUrl);
      setPreviewFilename(filename);
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el PDF. Asegúrate de que el backend está configurado.");
    } finally {
      setDownloadingStr(null);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-danger" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="w-8 h-8 text-success" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-8 h-8 text-info" />;
    return <File className="w-8 h-8 text-muted" />;
  };

  const pathParts = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [
    { label: "Raíz", path: "" },
    ...pathParts.map((part, idx) => ({
      label: part,
      path: pathParts.slice(0, idx + 1).join("/")
    }))
  ];

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const df_al = cursoData?.df_al || [];
  const activeAlumnado = df_al.filter((al: Alumnado) => al.Estado !== "Baja");
  activeAlumnado.sort((a: Alumnado, b: Alumnado) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-6 pb-12">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span className="text-3xl text-info"><FileText className="w-8 h-8" strokeWidth={2.5} /></span> Descargas .PDF
                </h1>
                <p className="text-muted mt-2 text-lg">Generación de reportes y boletines en PDF.</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="mb-6 max-w-full">
                <TabsTrigger value="inicio">
                  <div className="flex items-center gap-2"><Play className="w-4 h-4" /> PDF Inicio</div>
                </TabsTrigger>
                <TabsTrigger value="seguimiento">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> PDF Seguimiento</div>
                </TabsTrigger>
                <TabsTrigger value="evaluacion">
                  <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> PDF Evaluación</div>
                </TabsTrigger>
              </TabsList>
            </Tabs>



            {['inicio', 'seguimiento', 'evaluacion'].includes(activeTab) && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {(!activeCursoId || !activeModuleId) ? (
                  <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
                    <FileText className="w-16 h-16 text-muted-foreground opacity-50" />
                    <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
                    <p className="text-muted">Por favor, ve a la sección de Datos y asegúrate de cargar ambos para generar PDFs.</p>
                  </Card>
                ) : (loadingData || !cursoData || !moduleData) ? (
                  <Card className="p-12">
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-1/4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                    {activeTab === 'inicio' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <Card className="p-6 border-t-4 border-t-purple-500">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Gestión temporal global</h2>
                          <p className="text-sm text-muted mb-6">Planificación del módulo</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><CalendarDays className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario académico</h3>
                                <p className="text-sm text-muted mb-6">Vista global del curso con fechas, sesiones y eventos.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('calendario')} disabled={downloadingStr === 'calendario'} className="w-full">
                                {downloadingStr === 'calendario' ? '⏳ Generando PDF...' : 'PDF Calendario'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Planificación mensual</h3>
                                <p className="text-sm text-muted mb-6">Horas previstas frente a impartidas por UD y mes.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('planificacion')} disabled={downloadingStr === 'planificacion'} className="w-full">
                                {downloadingStr === 'planificacion' ? '⏳ Generando PDF...' : 'PDF Planificación'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-6 border-t-4 border-t-accent">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> Gestión del aprendizaje</h2>
                          <p className="text-sm text-muted mb-6">Matrices y programación del módulo</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><Calculator className="w-[1.2em] h-[1.2em] mr-1" /></span> Matrices RA → UD</h3>
                                <p className="text-sm text-muted mb-6">Relación y ponderación entre RA y UD del módulo.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('matrices')} disabled={downloadingStr === 'matrices'} className="w-full">
                                {downloadingStr === 'matrices' ? '⏳ Generando PDF...' : 'PDF Matrices'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {activeTab === 'seguimiento' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <Card className="p-6 border-t-4 border-t-emerald-500">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Clases mensual - por UD</h2>
                          <p className="text-sm text-muted mb-6">Registro detallado de clases impartidas y secuenciación por unidad didáctica.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Seguimiento diario</h3>
                                <p className="text-sm text-muted mb-6">Registro detallado de la planificación del día a día.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('seguimiento')} disabled={downloadingStr === 'seguimiento'} className="w-full">
                                {downloadingStr === 'seguimiento' ? '⏳ Generando PDF...' : 'PDF Seguimiento'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Clases por UD</h3>
                                <p className="text-sm text-muted mb-6">Secuenciación de sesiones de cada Unidad Didáctica.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('clases_ud')} disabled={downloadingStr === 'clases_ud'} className="w-full">
                                {downloadingStr === 'clases_ud' ? '⏳ Generando PDF...' : 'PDF Clases por UD'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {activeTab === 'evaluacion' && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <Card className="p-6 border-t-4 border-t-blue-500">
                          <h2 className="text-2xl font-bold mb-6"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletines de calificaciones grupales</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 1er trimestre</h3>
                              </div>
                              <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_1t')} disabled={downloadingStr === 'grupal_1t'} className="w-full">
                                {downloadingStr === 'grupal_1t' ? '⏳' : 'PDF Boletín grupal 1T'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 2º trimestre</h3>
                              </div>
                              <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_2t')} disabled={downloadingStr === 'grupal_2t'} className="w-full">
                                {downloadingStr === 'grupal_2t' ? '⏳' : 'PDF Boletín grupal 2T'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 3er trimestre</h3>
                              </div>
                              <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_3t')} disabled={downloadingStr === 'grupal_3t'} className="w-full">
                                {downloadingStr === 'grupal_3t' ? '⏳' : 'PDF Boletín grupal 3T'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center border-l-4 border-l-yellow-400">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span> Eval. Final</h3>
                              </div>
                              <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_final')} disabled={downloadingStr === 'grupal_final'} className="w-full">
                                {downloadingStr === 'grupal_final' ? '⏳' : 'PDF Boletín Final'}
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6 border-t-4 border-t-blue-500">
                          <h2 className="text-2xl font-bold mb-6"><span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletines individuales</h2>
                          {activeAlumnado.length > 0 ? (
                            <div className="flex flex-col md:flex-row md:items-end gap-6 bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletín de alumnado</h3>
                                <p className="text-sm text-muted mb-4">Genera un boletín detallado de un alumnado específico.</p>
                                <select id="alumnado_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold">
                                  {activeAlumnado.map((al: Alumnado) => (
                                    <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre} ({al.ID})</option>
                                  ))}
                                </select>
                              </div>
                              <Button variant="secondary" onClick={() => {
                                  const sel = document.getElementById('alumnado_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf('individual', sel.value);
                                }}
                                disabled={downloadingStr === 'individual'} className="px-8 py-3 h-[50px] w-full md:w-auto"
                              >
                                {downloadingStr === 'individual' ? '⏳ Generando boletín...' : 'PDF Boletín individual'}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-muted italic">No hay estudiantes activos para generar boletines individuales.</p>
                          )}
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


          </MotionWrapper>
        </div>

        {/* Modal de Previsualización (Compartido para ambos) */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
            <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                <FileText className="w-6 h-6 text-info" /> {previewFilename}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = previewUrl;
                    a.download = previewFilename || "documento.pdf";
                    a.click();
                  }}
                  className="bg-info hover:bg-info text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  <DownloadCloud className="w-5 h-5" /> Descargar
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setPreviewFilename(null);
                  }}
                  className="bg-danger hover:bg-danger text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" /> Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full p-4 bg-[#525659]">
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded-lg shadow-2xl" title="PDF Preview" />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
