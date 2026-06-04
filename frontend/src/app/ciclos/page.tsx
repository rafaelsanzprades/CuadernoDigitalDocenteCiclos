"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Clock,
  ListChecks,
  Layers,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  curriculos,
  type CurriculumTitulo,
  type CurriculumModulo,
  type CurriculumRA,
  type CurriculumCE,
} from "@/data/curriculos";

type Tab = "familias" | "titulo" | "cursos" | "modulos";

const familias = Array.from(new Set(Object.values(curriculos).map((t) => t.familia))).sort();
const titulosPorFamilia: Record<string, CurriculumTitulo[]> = {};
for (const t of Object.values(curriculos)) {
  if (!titulosPorFamilia[t.familia]) titulosPorFamilia[t.familia] = [];
  titulosPorFamilia[t.familia].push(t);
}

export default function CiclosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CiclosContent />
    </React.Suspense>
  );
}

function CiclosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ["familias", "titulo", "cursos", "modulos"].includes(tabParam) ? tabParam : "familias"
  );

  const [globalSelection, setGlobalSelection] = useState({
    familia: "Electricidad y Electrónica",
    tituloCodigo: "ELE203",
    moduloCodigo: "0237"
  });

  const updateGlobalSelection = (updates: Partial<typeof globalSelection>) => {
    setGlobalSelection((prev) => ({ ...prev, ...updates }));
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/ciclos?tab=${tab}`, { scroll: false });
  };

  const handleSelectTitulo = (familiaName: string, tituloCodigo: string) => {
    updateGlobalSelection({ familia: familiaName, tituloCodigo });
    setActiveTab("cursos");
    router.replace(`/ciclos?tab=cursos`, { scroll: false });
  };

  const handleSelectFamiliaToTitulo = (familiaName: string, tituloCodigo: string) => {
    updateGlobalSelection({ familia: familiaName, tituloCodigo });
    setActiveTab("titulo");
    router.replace(`/ciclos?tab=titulo`, { scroll: false });
  };

  const handleSelectModulo = (familia: string, tituloCodigo: string, moduloCodigo: string) => {
    updateGlobalSelection({ familia, tituloCodigo, moduloCodigo });
    setActiveTab("modulos");
    router.replace(`/ciclos?tab=modulos`, { scroll: false });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Ciclos formativos" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                Ciclos formativos
              </h1>
              <p className="text-muted mt-2 text-lg">
                Catálogo oficial de Familias profesionales, Títulos y desglose de módulos del BOE/BOA.
              </p>
            </div>

            <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
              {(
                [
                  { id: "familias" as Tab, label: "Familias profesionales" },
                  { id: "titulo" as Tab, label: "Título" },
                  { id: "cursos" as Tab, label: "Cursos" },
                  { id: "modulos" as Tab, label: "Módulos RA\u2192CE" },
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`px-6 py-4 font-bold text-base border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === t.id
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "familias" && <TabFamilias onSelectTitulo={handleSelectFamiliaToTitulo} />}
            {activeTab === "titulo" && <TabTitulo onSelectTitulo={handleSelectTitulo} globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} />}
            {activeTab === "cursos" && <TabCursos globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} onSelectModulo={handleSelectModulo} />}
            {activeTab === "modulos" && <TabModulos globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── TAB 1: Familias profesionales ─────────────────────────────────────────────

type Degree = { id: number; name: string; code: string | null; level: string; boa_articles?: Record<string, string> | null };
type Family = { id: number; code: string; name: string; icon_url: string; color_hex: string; degrees: Degree[] };

function TabFamilias({ onSelectTitulo }: { onSelectTitulo: (familiaName: string, tituloCodigo: string) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          const order: Record<string, number> = { BASICA: 1, MEDIO: 2, SUPERIOR: 3, ESPECIALIZACION: 4 };
          const sorted = json.data.map((f: Family) => ({
            ...f,
            degrees: [...f.degrees].sort((a, b) => (order[a.level] || 99) - (order[b.level] || 99)),
          }));
          setFamilies(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {families.map((family) => (
          <div
            key={family.id}
            className="glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300"
          >
            <div
              className="p-6 flex flex-col items-center text-center relative border-b border-white/5"
              style={{ background: `linear-gradient(to bottom, ${family.color_hex}15, transparent)` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: family.color_hex }} />

              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3"
                style={{ backgroundColor: `${family.color_hex}20`, border: `1px solid ${family.color_hex}40` }}
              >
                {family.icon_url.startsWith("fas fa-") ? (
                  <i className={`${family.icon_url} text-4xl`} style={{ color: family.color_hex }} />
                ) : (
                  <img src={family.icon_url} alt={family.code} className="w-full h-full object-contain filter drop-shadow-md" />
                )}
              </div>

              <div
                className="text-xs font-bold px-2 py-1 rounded-md mb-2"
                style={{ backgroundColor: `${family.color_hex}30`, color: family.color_hex }}
              >
                {family.code}
              </div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{family.name}</h2>
            </div>

            <div className="p-5 bg-foreground/10">
              <h3 className="text-xs font-semibold text-muted tracking-wider mb-3">
                Ciclos Formativos ({family.degrees.length})
              </h3>
              {family.degrees.length > 0 ? (
                <div className="space-y-2">
                  {family.degrees.map((degree) => {
                    const badgeMap: Record<string, string> = { BASICA: "GB", MEDIO: "GM", SUPERIOR: "GS", ESPECIALIZACION: "CE" };
                    const badge = badgeMap[degree.level] || degree.level;
                    return (
                      <button
                        key={degree.id}
                        onClick={() => onSelectTitulo(family.name, degree.code ?? degree.name)}
                        className="w-full text-left text-sm bg-foreground/5 rounded-lg p-2.5 border border-[var(--glass-border)] hover:bg-foreground/10 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="text-foreground/80 font-medium leading-tight flex-1 group-hover:text-foreground transition-colors">
                          {degree.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-foreground bg-foreground/20 border border-[var(--glass-border)] px-2 py-1 rounded shadow-inner tracking-wider">
                            {badge}
                          </span>
                          <ChevronDown className="w-3 h-3 -rotate-90 text-muted group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted italic text-center py-4">No hay ciclos formativos registrados.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 2: Título ─────────────────────────────────────────────────────────────

function TabTitulo({ onSelectTitulo, globalSelection, updateGlobalSelection }: { onSelectTitulo: (familiaName: string, tituloCodigo: string) => void; globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [famLoading, setFamLoading] = useState(true);

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  const selectedFamilia = globalSelection.familia;
  const selectedTituloCodigo = globalSelection.tituloCodigo;

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];
  const selectedTituloObj = degreesFromApi.find((d) => (d.code ?? d.name) === selectedTituloCodigo);

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const articleTitles: Record<string, string> = {
    article_2: "Artículo 2. Identificación del título.",
    article_3: "Artículo 3. Perfil profesional del título.",
    article_4: "Artículo 4. Competencia general.",
    article_5: "Artículo 5. Competencias profesionales, personales y sociales.",
    article_6: "Artículo 6. Relación de cualificaciones y unidades de competencia del Catálogo Nacional de Cualificaciones Profesionales incluidas en el título.",
    article_7: "Artículo 7. Entorno profesional en el que el profesional va a ejercer su actividad.",
    article_8: "Artículo 8. Prospectiva del título en el sector o sectores."
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => {
              updateGlobalSelection({ familia: e.target.value, tituloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTituloCodigo}
            disabled={!selectedFamilia}
            onChange={(e) => updateGlobalSelection({ tituloCodigo: e.target.value })}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d) => (
              <option key={d.id} value={d.code ?? d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>


      {selectedTituloObj && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-xl border border-[var(--glass-border)]">
             <div>
               <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                 {selectedTituloObj.name}
                 {selectedTituloObj.code && <Badge variant="default" className="font-mono">{selectedTituloObj.code}</Badge>}
               </h2>
               <p className="text-sm text-muted mt-1">Detalles del currículo del BOA</p>
             </div>
             <Button variant="primary" onClick={() => onSelectTitulo(selectedFamilia, selectedTituloObj.code ?? selectedTituloObj.name)}>
               <BookOpen className="w-4 h-4 mr-2" />
               Ver Módulos
             </Button>
          </div>

          {selectedTituloObj.boa_articles && Object.keys(selectedTituloObj.boa_articles).length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {['article_2', 'article_3', 'article_4', 'article_5', 'article_6', 'article_7', 'article_8'].map((artKey) => {
                const content = selectedTituloObj.boa_articles?.[artKey];
                if (!content) return null;
                return (
                  <Card key={artKey} className="overflow-hidden">
                    <div className="bg-foreground/5 px-6 py-4 border-b border-[var(--glass-border)]">
                      <h3 className="text-base font-bold text-foreground">{articleTitles[artKey] || artKey}</h3>
                    </div>
                    <div className="p-6 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {content}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
              <Layers className="w-12 h-12" />
              <p className="text-lg">Este título aún no tiene los artículos del currículo cargados en la base de datos.</p>
            </Card>
          )}
        </div>
      )}

      {selectedFamilia && selectedFamilyObj?.degrees.length === 0 && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4 mt-6">
          <Layers className="w-12 h-12" />
          <p className="text-lg">No hay títulos registrados para esta familia.</p>
        </Card>
      )}

      {!selectedFamilia && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4 mt-6">
          <GraduationCap className="w-12 h-12" />
          <p className="text-lg">Selecciona una familia profesional para ver sus títulos.</p>
        </Card>
      )}
    </div>
  );
}

// ─── TAB 3: Cursos ────────────────────────────────────────────────────────────

function TabCursos({ globalSelection, updateGlobalSelection, onSelectModulo }: { globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void; onSelectModulo: (familia: string, tituloCodigo: string, moduloCodigo: string) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [famLoading, setFamLoading] = useState(true);

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  const selectedFamilia = globalSelection.familia;
  const selectedTitulo = globalSelection.tituloCodigo; // value for <select>, matches option value
  const curriculoCodigo = selectedTitulo; // curriculum code for data lookup

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];
  const titulo = curriculoCodigo ? curriculos[curriculoCodigo] : undefined;

  const modulosPrimero = titulo ? titulo.modulos.filter((m) => m.curso === "1º") : [];
  const modulosSegundo = titulo ? titulo.modulos.filter((m) => m.curso === "2º") : [];

  const [cursosAbiertos, setCursosAbiertos] = useState<Set<string>>(new Set(["1º", "2º"]));

  const toggleCurso = (curso: string) => {
    setCursosAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(curso)) next.delete(curso);
      else next.add(curso);
      return next;
    });
  };

  const renderCursoBlock = (mods: CurriculumModulo[], cursoLabel: string) => {
    if (mods.length === 0) return null;
    const abierto = cursosAbiertos.has(cursoLabel);
    const totalHoras = mods.reduce((s, m) => s + m.horas, 0);

    return (
      <Card key={cursoLabel} className="overflow-hidden">
        <button
          onClick={() => toggleCurso(cursoLabel)}
          className="w-full p-5 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">{cursoLabel} Curso</h2>
            <Badge variant="info">{mods.length} módulos</Badge>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />{totalHoras}h
            </span>
          </div>
          {abierto ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
        </button>

        {abierto && (
          <div className="border-t border-[var(--glass-border)] animate-in slide-in-from-top-1 duration-200">
            {mods.map((mod) => (
              <button
                key={mod.codigo}
                onClick={() => onSelectModulo(titulo!.familia, curriculoCodigo, mod.codigo)}
                className="w-full p-5 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-foreground/5 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded shrink-0">
                      {mod.codigo}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{mod.nombre}</h3>
                      <span className="flex items-center gap-1 text-xs text-muted mt-1">
                        <Clock className="w-3 h-3" />
                        {mod.horas}h
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-muted shrink-0" />
                </div>

                {mod.unidades_formativas && mod.unidades_formativas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <p className="text-xs font-semibold text-muted tracking-wider mb-3 flex items-center gap-1">
                      <FolderTree className="w-3 h-3" />
                      Unidades Formativas ({mod.unidades_formativas.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mod.unidades_formativas.map((uf, i) => (
                        <div key={i} className="bg-foreground/5 rounded-lg p-3 border border-[var(--glass-border)]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-accent">{uf.codigo}</span>
                            <span className="text-xs font-semibold text-foreground/70">{uf.horas}h</span>
                          </div>
                          <p className="text-xs text-foreground/70 mt-1">{uf.nombre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => { updateGlobalSelection({ familia: e.target.value, tituloCodigo: "", moduloCodigo: "" }); }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTitulo}
            disabled={!selectedFamilia}
            onChange={(e) => {
              const val = e.target.value;
              updateGlobalSelection({ tituloCodigo: val, moduloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d) => (
              <option key={d.id} value={d.code ?? d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {!selectedTitulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-12 h-12" />
          <p className="text-lg">Selecciona una Familia y un Título para ver los módulos organizados por curso.</p>
        </Card>
      )}

      {selectedTitulo && !titulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <Layers className="w-12 h-12" />
          <p className="text-lg">Este título aún no tiene datos curriculares cargados.</p>
          <p className="text-sm">Los módulos se mostrarán cuando esté disponible el currículo oficial.</p>
        </Card>
      )}

      {selectedTitulo && titulo && (
        <div className="space-y-10">
          {renderCursoBlock(modulosPrimero, "1º")}
          {renderCursoBlock(modulosSegundo, "2º")}
          {modulosPrimero.length === 0 && modulosSegundo.length === 0 && (
            <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
              <Layers className="w-12 h-12" />
              <p className="text-lg">No hay módulos para este título.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: Módulos RA->CE ────────────────────────────────────────────────────

function TabModulos({ globalSelection, updateGlobalSelection }: { globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [famLoading, setFamLoading] = useState(true);
  const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  const selectedFamilia = globalSelection.familia;
  const selectedTitulo = globalSelection.tituloCodigo;
  const curriculoCodigo = selectedTitulo;
  const selectedModuloCodigo = globalSelection.moduloCodigo;

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];
  const titulo = curriculoCodigo ? curriculos[curriculoCodigo] : undefined;
  const modulo = titulo
    ? titulo.modulos.find((m) => m.codigo === selectedModuloCodigo)
    : undefined;

  const toggleRA = (id: string) => {
    setExpandedRAs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => { updateGlobalSelection({ familia: e.target.value, tituloCodigo: "", moduloCodigo: "" }); }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTitulo}
            disabled={!selectedFamilia}
            onChange={(e) => {
              const val = e.target.value;
              updateGlobalSelection({ tituloCodigo: val, moduloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d) => (
              <option key={d.id} value={d.code ?? d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Módulo</label>
          <select
            value={selectedModuloCodigo}
            disabled={!selectedTitulo || !titulo}
            onChange={(e) => updateGlobalSelection({ moduloCodigo: e.target.value })}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Módulo --</option>
            {titulo?.modulos.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.codigo} — {m.nombre} ({m.curso})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedTitulo && !titulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <Layers className="w-12 h-12" />
          <p className="text-lg">Este título aún no tiene datos curriculares cargados.</p>
          <p className="text-sm">Los módulos se mostrarán cuando esté disponible el currículo oficial.</p>
        </Card>
      )}

      {!selectedModuloCodigo && titulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <ListChecks className="w-12 h-12" />
          <p className="text-lg">Selecciona un módulo para ver los resultados de aprendizaje.</p>
        </Card>
      )}

      {modulo && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded">
                {modulo.codigo}
              </span>
              <h2 className="text-lg font-bold text-foreground">{modulo.nombre}</h2>
              <Badge variant="info">{modulo.horas}h</Badge>
              <Badge>{modulo.curso} Curso</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {modulo.resultados_aprendizaje.map((ra) => {
              const isExpanded = expandedRAs.has(ra.id);
              return (
                <Card key={ra.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleRA(ra.id)}
                    className="w-full p-4 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded shrink-0">
                        {ra.id}
                      </span>
                      <p className="text-sm text-foreground leading-snug">{ra.descripcion}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted">{ra.criterios_evaluacion.length} CE</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--glass-border)] p-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      <p className="text-xs font-semibold text-muted tracking-wider">Criterios de Evaluación</p>
                      {ra.criterios_evaluacion.map((ce) => (
                        <div key={ce.id} className="flex items-start gap-2 text-sm bg-foreground/5 rounded-lg p-3 border border-[var(--glass-border)]">
                          <span className="text-xs font-bold text-accent shrink-0 mt-0.5">{ce.id}</span>
                          <span className="text-foreground/80">{ce.descripcion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => console.log("Cargar módulo en programación:", modulo.codigo, modulo.nombre)}
            >
              Cargar en mi programación
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
