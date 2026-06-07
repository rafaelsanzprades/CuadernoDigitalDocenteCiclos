"use client";
import { BarChart, ClipboardList, Compass, FolderOpen, GraduationCap, Map, Save } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrientacionTab } from "@/components/features/profesional/OrientacionTab";
import { ResumenTab } from "@/components/features/profesional/ResumenTab";
import { TendenciasTab } from "@/components/features/profesional/TendenciasTab";
import { PanoramaTab } from "@/components/features/profesional/PanoramaTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const TABS = [
  { id: "perfil",     label:  <span className="flex items-center gap-2"><Compass className="w-4 h-4 shrink-0" /> Perfil individual</span>,    cleanLabel: "Perfil individual" },
  { id: "resumen",    label:  <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 shrink-0" /> Resumen del alumnado</span>,  cleanLabel: "Resumen del alumnado" },
  { id: "tendencias", label:  <span className="flex items-center gap-2"><BarChart className="w-4 h-4 shrink-0" /> Mapa de tendencias</span>,    cleanLabel: "Mapa de tendencias" },
  { id: "panorama",   label:  <span className="flex items-center gap-2"><Map className="w-4 h-4 shrink-0" /> Panorama profesional</span>, cleanLabel: "Panorama profesional" },
];

export default function ProfesionalPage() {
  const { activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");

  const activeTabCleanLabel = TABS.find((t) => t.id === activeTab)?.cleanLabel;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeCursoId && !cursoData) {
          const res = await fetch(`/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching curso data:", err);
      }
      setLoading(false);
    };
    if (activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeCursoId, cursoData]);

  const handleSave = async () => {
    if (!activeCursoId || !cursoData) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/module/${activeCursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cursoData),
      });
      const result = await res.json();
      if (result.status === "success") {
        setSaveMessage("Guardado correctamente");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  // ── No curso selected ─────────────────────────────────────────────────────
  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <span className="text-5xl"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
                <h2 className="text-2xl font-bold text-foreground">No hay Curso activo seleccionado</h2>
                <p className="text-muted max-w-md">
                  Ve a <strong><span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Entorno de trabajo</strong> y selecciona un Curso activo para acceder a las fichas de orientación profesional.
                </p>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || !cursoData) {
    return <LoadingSpinner text="Cargando datos de orientación..." />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 overflow-y-auto scrollbar-hide content-area">
          <MotionWrapper className="space-y-6 pb-12">

          {/* Page header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><Compass className="w-[1.2em] h-[1.2em] mr-1" /></span> Orientación profesional
              </h1>
              <p className="text-muted mt-2 text-lg">
                Ficha individual de orientación, intereses, aspiraciones e inserción laboral por alumnado.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {saveMessage && (
                <span
                  className={`text-sm font-semibold ${
                    saveMessage.includes("Error") ? "text-danger" : "text-success"
                  }`}
                >
                  {saveMessage}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : <>Guardar cambios <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Tab content */}
          {activeTab === "perfil"     && <OrientacionTab />}
          {activeTab === "resumen"    && <ResumenTab />}
          {activeTab === "tendencias" && <TendenciasTab />}
          {activeTab === "panorama"   && <PanoramaTab />}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
