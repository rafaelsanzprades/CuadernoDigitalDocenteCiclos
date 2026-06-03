"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Folder, FileText, File, Download, ChevronRight, CornerLeftUp, FileSpreadsheet, Search, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { Alumno } from "@/types";

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

export default function DocumentosPage() {
  const [activeTab, setActiveTab] = useState<"legislacion" | "varios">("legislacion");

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
    fetch(`/api/documents/list?path=${encodeURIComponent(path)}`)
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
    fetchDocuments(activeTab === "legislacion" ? "Legislación general" : "Varios");
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`/api/module/${activeCursoId}`);
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
      alert("Error al cargar la previsualización del documento.");
    } finally {
      setDownloadingStr(null);
    }
  };

  // Descargas Handlers
  const handleDownloadPdf = async (type: string, al_id?: string) => {
    try {
      setDownloadingStr(type);
      let url = `/api/pdf?type=${type}&pd_id=${activeModuleId}&curso_id=${activeCursoId}`;
      if (al_id) url += `&al_id=${al_id}`;

      const response = await fetch(url);
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
      alert("Error al generar el PDF. Asegúrate de que el backend está configurado.");
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
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-400" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-8 h-8 text-blue-400" />;
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
  const activeAlumnos = df_al.filter((al: Alumno) => al.Estado !== "Baja");
  activeAlumnos.sort((a: Alumno, b: Alumno) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span className="text-3xl">📄</span> Documentos
                </h1>
                <p className="text-muted mt-2 text-lg">Explorador de archivos oficiales, legislación y otros documentos.</p>
              </div>
            </div>

            <div className="flex border-b border-[var(--glass-border)] mb-6 overflow-x-auto scrollbar-hide">
              <button
                className={`py-3 px-6 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'legislacion' ? 'border-blue-500 text-blue-400' : 'border-transparent text-muted hover:text-foreground'}`}
                onClick={() => setActiveTab('legislacion')}
              >
                ⚖️ Legislación general
              </button>
              <button
                className={`py-3 px-6 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'varios' ? 'border-blue-500 text-blue-400' : 'border-transparent text-muted hover:text-foreground'}`}
                onClick={() => setActiveTab('varios')}
              >
                📂 Varios
              </button>
            </div>

            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Buscar archivo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-foreground/15 border border-[var(--glass-border)] text-foreground pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-64 placeholder-gray-500"
                    />
                  </div>
                  <button 
                    onClick={() => alert("Función de subida próximamente.")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-foreground font-bold py-2 px-5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>Subir documento</span>
                  </button>
                </div>

                <Card className="p-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap bg-foreground/5 border border-[var(--glass-border)] rounded-xl shadow-lg">
                  {currentPath && (
                    <button
                      onClick={handleGoUp}
                      className="flex items-center justify-center p-2 mr-2 text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg transition-colors"
                      title="Subir un nivel"
                    >
                      <CornerLeftUp className="w-5 h-5" />
                    </button>
                  )}
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.path}>
                      <button
                        onClick={() => handleNavigate(crumb.path)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${idx === breadcrumbs.length - 1
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'text-muted hover:text-foreground hover:bg-foreground/10'
                          }`}
                      >
                        {crumb.label}
                      </button>
                      {idx < breadcrumbs.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted/80 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </Card>

                <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                  {loadingDocs ? (
                    <div className="p-12 text-center text-muted flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Cargando documentos...</p>
                    </div>
                  ) : error ? (
                    <div className="p-12 text-center">
                      <div className="text-red-400 mb-2">⚠️ Error</div>
                      <p className="text-foreground/80">{error}</p>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="p-16 text-center text-muted">
                      <div className="text-4xl mb-4">📂</div>
                      <p className="text-lg">El directorio está vacío.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                      {filteredItems.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-muted">
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No se encontraron resultados para "{searchQuery}"</p>
                        </div>
                      ) : filteredItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="group flex flex-col items-center p-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[var(--glass-border)] rounded-xl transition-all cursor-pointer duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative"
                          onClick={() => item.is_dir ? handleNavigate(item.path) : handleDownloadDoc(item.path, item.name)}
                        >
                          <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 relative">
                            {downloadingStr === item.path ? (
                              <div className="w-12 h-12 flex items-center justify-center animate-spin border-4 border-accent border-t-transparent rounded-full" />
                            ) : item.is_dir ? (
                              <Folder className="w-12 h-12 text-blue-400 drop-shadow-md" />
                            ) : (
                              getFileIcon(item.name)
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground text-center line-clamp-2 w-full break-words">
                            {item.name}
                          </h3>

                          {!item.is_dir && (
                            <p className="text-xs text-muted mt-2 font-mono">
                              {formatSize(item.size)}
                            </p>
                          )}

                          {!item.is_dir && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1.5 bg-accent/20 text-accent rounded-md hover:bg-accent hover:text-foreground transition-colors"
                                onClick={(e) => { e.stopPropagation(); handleDownloadDoc(item.path, item.name); }}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


          </div>
        </div>

        {/* Modal de Previsualización (Compartido para ambos) */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
            <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <span>📄</span> {previewFilename}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = previewUrl;
                    a.download = previewFilename || "documento.pdf";
                    a.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  ⬇️ Descargar
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setPreviewFilename(null);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  ❌ Cerrar
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
