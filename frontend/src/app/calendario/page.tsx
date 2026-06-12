"use client";
import { Calendar, Circle, ClipboardList, Search, Settings, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import DatePicker from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const toDate = (s: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const inRange = (d: Date, s: Date | null, e: Date | null) =>
  !!(s && e && d >= s && d <= e);

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAY_NAMES_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

// ── Notes Table Component ─────────────────────────────────────────────────────
function NotesTable({ calendar_notes, onUpdateNote }: { calendar_notes: Record<string, string>; onUpdateNote: (key: string, val: string) => void }) {
  const [newDate, setNewDate]     = useState("");
  const [newType, setNewType]     = useState<"f" | "r">("f");
  const [newText, setNewText]     = useState("");

  function addNote() {
    if (!newDate || !newText) return;
    // Convert from YYYY-MM-DD to DD/MM/YYYY for the key
    const [y, m, d] = newDate.split("-");
    const key = `${newType}_${d}/${m}/${y}`;
    onUpdateNote(key, newText);
    setNewDate(""); setNewText("");
  }

  const entries = Object.entries(calendar_notes)
    .filter(([, v]) => v)
    .sort(([a], [b]) => {
      // sort by date portion DD/MM/YYYY → convert to comparable
      const toSortable = (k: string) => {
        const parts = k.substring(2).split("/");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };
      return toSortable(a).localeCompare(toSortable(b));
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--glass-border)] text-muted">
            <th className="p-2 w-36">Fecha</th>
            <th className="p-2 w-24">Tipo</th>
            <th className="p-2">Descripción</th>
            <th className="p-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v]) => {
            const isF   = k.startsWith("f_");
            const dateStr = k.substring(2);
            return (
              <tr key={k} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                <td className="p-2 font-mono text-foreground/80">{dateStr}</td>
                <td className="p-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isF ? "bg-danger/10 text-danger" : "bg-info/10 text-info"
                  }`}>
                    {isF ? <><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> Festivo</> : <><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> Evento</>}
                  </span>
                </td>
                <td className="p-2 text-foreground/90">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => onUpdateNote(k, "")}
                    className="text-muted/80 hover:text-danger font-bold text-lg leading-none transition-colors"
                  >×</button>
                </td>
              </tr>
            );
          })}

          {/* Add new row */}
          <tr className="border-t border-[var(--glass-border)] bg-white/3">
            <td className="p-2">
              <DatePicker
                value={newDate}
                onChange={v => setNewDate(v)}
                className="w-full"
              />
            </td>
            <td className="p-2">
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as "f" | "r")}
                className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-1 text-sm text-foreground focus:border-warning focus:outline-none"
              >
                <option value="f">Festivo</option>
                <option value="r">Evento</option>
              </select>
            </td>
            <td className="p-2">
              <input
                type="text"
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="Descripción..."
                className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-1 text-sm text-foreground focus:border-warning focus:outline-none"
              />
            </td>
            <td className="p-2">
              <button
                onClick={addNote}
                disabled={!newDate || !newText}
                className="text-warning hover:text-warning font-bold text-lg leading-none disabled:text-gray-700 transition-colors"
              >+</button>
            </td>
          </tr>
        </tbody>
      </table>
      {entries.length === 0 && (
        <p className="text-center text-muted/80 text-sm py-4">
          Sin festivos ni eventos aún. Añade uno arriba o haz clic en el calendario.
        </p>
      )}
    </div>
  );
}

// ── Interactive Calendar Component ────────────────────────────────────────────

function InteractiveCalendar({ info_fechas, horario, calendar_notes, onUpdateNote }: { info_fechas: Record<string, string>; horario: Record<string, any>; calendar_notes: Record<string, string>; onUpdateNote: (key: string, val: string) => void }) {
  const [popup, setPopup] = useState<{ key: string; x: number; y: number } | null>(null);
  const [noteType, setNoteType] = useState<"f" | "r">("f");
  const [noteText, setNoteText] = useState("");

  const t1s = toDate(info_fechas.ini_1t), t1e = toDate(info_fechas.fin_1t);
  const t2s = toDate(info_fechas.ini_2t), t2e = toDate(info_fechas.fin_2t);
  const t3s = toDate(info_fechas.ini_3t), t3e = toDate(info_fechas.fin_3t);
  const cs  = toDate(info_fechas.ini_curso), ce = toDate(info_fechas.fin_curso);
  const feoS = toDate(info_fechas.ini_feoe), feoE = toDate(info_fechas.fin_feoe);
  const dgenS = toDate(info_fechas.ini_dual_gen), dgenE = toDate(info_fechas.fin_dual_gen);
  const dintS = toDate(info_fechas.ini_dual_int), dintE = toDate(info_fechas.fin_dual_int);

  // Months to show: from course start to course end (default Sep–Jun)
  const refYear = cs ? cs.getFullYear() : new Date().getFullYear();
  const startMonth = cs ? new Date(cs.getFullYear(), cs.getMonth(), 1)
                        : new Date(refYear, 8, 1);
  const endMonth   = ce ? new Date(ce.getFullYear(), ce.getMonth(), 1)
                        : new Date(refYear + 1, 5, 1);

  const months: Date[] = [];
  const cur = new Date(startMonth);
  while (cur <= endMonth) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  function getDayStyle(date: Date) {
    const dow = date.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const dkey = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    const isFestivo = !!calendar_notes[`f_${dkey}`];
    const isEvento  = !!calendar_notes[`r_${dkey}`];

    if (isFestivo)            return "bg-danger/10 text-foreground font-bold ring-1 ring-danger";
    if (isEvento)             return "bg-info/10 text-foreground font-bold ring-1 ring-info";
    if (isWeekend)            return "bg-foreground/5 text-muted/80 cursor-default";
    if (inRange(date, dintS, dintE)) return "bg-orange-500/20 text-orange-600 hover:bg-orange-500/30 font-semibold cursor-pointer";
    if (inRange(date, dgenS, dgenE)) return "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 font-semibold cursor-pointer";
    if (inRange(date, feoS, feoE)) return "bg-warning/10 text-warning hover:bg-warning/10 cursor-pointer";
    if (inRange(date, t1s, t1e))   return "bg-info/10 text-info hover:bg-info/10 cursor-pointer";
    if (inRange(date, t2s, t2e))   return "bg-success/10 text-success hover:bg-success/10 cursor-pointer";
    if (inRange(date, t3s, t3e))   return "bg-info/10 text-info hover:bg-info/10 cursor-pointer";
    if (inRange(date, cs, ce))     return "bg-foreground/5 text-muted hover:bg-foreground/10 cursor-pointer";
    return "text-gray-700 cursor-default";
  }

  function openPopup(e: React.MouseEvent, date: Date) {
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return;
    const dkey = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    // Toggle off if already marked
    if (calendar_notes[`f_${dkey}`]) { onUpdateNote(`f_${dkey}`, ""); return; }
    if (calendar_notes[`r_${dkey}`]) { onUpdateNote(`r_${dkey}`, ""); return; }
    setNoteText("");
    setNoteType("f");
    setPopup({ key: dkey, x: e.clientX, y: e.clientY });
  }

  function saveNote() {
    if (!popup) return;
    onUpdateNote(`${noteType}_${popup.key}`, noteText || (noteType === "f" ? "Festivo" : "Evento"));
    setPopup(null);
  }

  const noteEntries = Object.entries(calendar_notes).filter(([, v]) => v);

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        {[
          { cls: "bg-info/10 border-info/30",      label: "1er trimestre" },
          { cls: "bg-success/10 border-success/30", label: "2º trimestre" },
          { cls: "bg-info/10 border-info/30",  label: "3er trimestre" },
          { cls: "bg-yellow-500/20 border-yellow-500/30 text-yellow-600",  label: "FP Dual General" },
          { cls: "bg-orange-500/20 border-orange-500/30 text-orange-600",  label: "FP Dual Intensiva" },
          { cls: "bg-danger/10 border-danger/30",        label: "Festivo" },
          { cls: "bg-info/10 border-info/30",      label: "Evento" },
        ].map(l => (
          <span key={l.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${l.cls}`}>
            <span className="text-foreground/80">{l.label}</span>
          </span>
        ))}
      </div>

      {/* Month grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {months.map(month => {
          const y = month.getFullYear(), m = month.getMonth();
          const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0
          const daysInMonth = new Date(y, m + 1, 0).getDate();
          const cells: (number | null)[] = [
            ...Array(firstDow).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div key={`${y}-${m}`} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4">
              <h3 className="text-center font-semibold text-sm mb-3 text-foreground/90">
                {MONTH_NAMES[m]} {y}
              </h3>
              <div className="grid grid-cols-7 gap-0.5">
                {DAY_NAMES_SHORT.map(d => (
                  <div key={d} className="text-center text-[10px] text-muted/80 font-bold pb-1">{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const date = new Date(y, m, day);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={day}
                      onClick={(e) => openPopup(e, date)}
                      className={`text-center text-[11px] rounded py-1 transition-all ${getDayStyle(date)} ${isToday ? "ring-1 ring-warning ring-offset-1 ring-offset-black/50" : ""}`}
                      title={`${pad(day)}/${pad(m + 1)}/${y}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes list */}
      {noteEntries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted mb-3"><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span> Notas registradas ({noteEntries.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {noteEntries
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => {
                const isF = k.startsWith("f_");
                return (
                  <div
                    key={k}
                    className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${
                      isF ? "bg-danger/10 border-danger/30 text-danger"
                          : "bg-info/10 border-info/30 text-info"
                    }`}
                  >
                    <span className="flex-1 truncate">
                      <span className="text-muted mr-1">{k.substring(2)}</span>
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                    <button
                      onClick={() => onUpdateNote(k, "")}
                      className="text-muted/80 hover:text-danger font-bold text-base leading-none"
                    >×</button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopup(null)} />
          <div
            className="fixed z-50 bg-gray-900 border border-[var(--glass-border)] rounded-xl p-4 shadow-2xl w-64"
            style={{
              left: Math.min(popup.x + 8, (typeof window !== "undefined" ? window.innerWidth : 800) - 270),
              top:  Math.min(popup.y + 8, (typeof window !== "undefined" ? window.innerHeight : 600) - 170),
            }}
          >
            <p className="text-sm font-semibold mb-3 text-foreground/90"> {popup.key}</p>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setNoteType("f")}
                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                  noteType === "f"
                    ? "bg-danger/10 text-danger border border-danger/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> Festivo</button>
              <button
                onClick={() => setNoteType("r")}
                className={`flex-1 text-xs py-1.5 rounded transition-all ${
                  noteType === "r"
                    ? "bg-info/10 text-info border border-info/30"
                    : "bg-foreground/5 text-muted border border-[var(--glass-border)] hover:bg-foreground/10"
                }`}
              ><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> Evento</button>
            </div>
            <input
              autoFocus
              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded p-2 text-sm text-foreground mb-3 focus:border-info focus:outline-none"
              placeholder={noteType === "f" ? "Nombre del festivo..." : "Descripción del evento..."}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") saveNote();
                if (e.key === "Escape") setPopup(null);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                className="flex-1 bg-info/10 hover:bg-info/10 text-info text-xs py-1.5 rounded border border-info/30 transition-all"
              >Añadir</button>
              <button
                onClick={() => setPopup(null)}
                className="text-muted text-xs py-1.5 px-3 rounded hover:text-foreground/80 transition-all"
              >Cancelar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CalendarioPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData, activeModuleId, moduleData, setModuleData } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("fechas");

  // Load data if not in store
  useEffect(() => {
    if (activeCursoId && !cursoData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`)
        .then(r => r.json())
        .then(json => { if (json.status === "success") setCursoData(json.data); })
        .catch(console.error);
    }
    if (activeModuleId && !moduleData) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`)
        .then(r => r.json())
        .then(json => { if (json.status === "success") setModuleData(json.data); })
        .catch(console.error);
    }
  }, [activeCursoId, cursoData, setCursoData, activeModuleId, moduleData, setModuleData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <Calendar className="w-12 h-12 text-muted" />
                <h2 className="text-2xl font-bold">No hay Curso Activo seleccionado</h2>
                <p className="text-muted">Ve a Entorno y selecciona un Curso.</p>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (!cursoData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-info animate-pulse">Cargando calendario...</div>
          </main>
        </div>
      </div>
    );
  }

  const info_fechas   = cursoData?.info_fechas   || {};
  const horario       = cursoData?.horario       || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const calendar_notes = cursoData?.calendar_notes || {};

  const handleUpdateFechas = (field: string, value: string | number) =>
    updateCursoData("info_fechas", { ...info_fechas, [field]: value });

  const handleUpdateNote = (key: string, val: string) =>
    updateCursoData("calendar_notes", { ...calendar_notes, [key]: val });

  const TABS = [
    { id: "fechas", label: <><span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> Configuración de fechas</>, cleanLabel: "Configuración de fechas" },
    { id: "eventos", label: <span className="flex items-center gap-2"><Flag className="w-[1.2em] h-[1.2em] mr-1 shrink-0" /> Eventos y festivos</span>, cleanLabel: "Eventos y festivos" },
    { id: "visual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario visual</>, cleanLabel: "Calendario visual" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            {/* Page heading */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Calendar className="w-6 h-6 text-accent" /> Calendario académico
              </h1>
              <p className="text-muted mt-2 text-base">Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso.</p>
            </div>

          {/* Save message */}
          {saveMessage && (
            <p className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
              {saveMessage}
            </p>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeTab === "fechas" && (
            <div className="space-y-8">
              {/* Fechas generales */}
              <Card className="p-6 border-t-4 border-t-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Fechas generales</h2>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ledger = cursoData?.planning_ledger || {};
                      const dates = Object.keys(ledger)
                        .map(d => { const [dd,mm,yyyy] = d.split("/"); return `${yyyy}-${mm}-${dd}`; })
                        .sort();
                      if (dates.length > 0) {
                        handleUpdateFechas("ini_curso", dates[0]);
                        handleUpdateFechas("fin_curso", dates[dates.length - 1]);
                      }
                    }}
                    className="text-xs text-info hover:text-info"
                  >
                    <span className="inline-flex"><Search className="w-[1.2em] h-[1.2em] mr-1" /></span> Autodetectar desde Planning
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Inicio de curso",   field: "ini_curso" },
                    { label: "Inicio clases (1T)", field: "ini_1t"   },
                    { label: "Fin clases (3T)",    field: "fin_3t"   },
                    { label: "Fin de curso",       field: "fin_curso" },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="text-sm text-muted mb-1 block">{label}</label>
                      <DatePicker
                        value={typeof info_fechas[field] === 'string' ? info_fechas[field] : ""}
                        onChange={v => handleUpdateFechas(field, v)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trimestres */}
              <Card className="p-6 border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Trimestres</h2>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: "1er trimestre", ini: "ini_1t", fin: "fin_1t" },
                    { title: "2º trimestre",  ini: "ini_2t", fin: "fin_2t" },
                    { title: "3er trimestre", ini: "ini_3t", fin: "fin_3t" },
                  ].map(t => (
                    <div key={t.title} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4">
                      <h3 className="text-center font-bold mb-4">{t.title}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted">Inicio</label>
                          <DatePicker value={typeof info_fechas[t.ini] === 'string' ? info_fechas[t.ini] : ""} onChange={v => handleUpdateFechas(t.ini, v)} />
                        </div>
                        <div>
                          <label className="text-xs text-muted">Fin</label>
                          <DatePicker value={typeof info_fechas[t.fin] === 'string' ? info_fechas[t.fin] : ""} onChange={v => handleUpdateFechas(t.fin, v)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* FP Dual / FEOE - 4 columnas */}
              <Card className="p-6 border-t-4 border-t-orange-500">
                <h2 className="text-xl font-bold mb-6">FP Dual (FEOE)</h2>
                <div className="grid grid-cols-4 gap-4 items-end">
                  {/* Col 1: Selector de tipo */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Tipo de Dual</label>
                    <select
                      value={info_fechas.tipo_dual || "general"}
                      onChange={e => handleUpdateFechas("tipo_dual", e.target.value)}
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none"
                    >
                      <option value="general">Dual General</option>
                      <option value="intensiva">Dual Intensiva</option>
                    </select>
                  </div>
                  {/* Col 2: Inicio */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Inicio FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.ini_feoe === 'string' ? info_fechas.ini_feoe : ""}
                      onChange={v => handleUpdateFechas("ini_feoe", v)}
                    />
                  </div>
                  {/* Col 3: Fin */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Fin FEOE</label>
                    <DatePicker
                      value={typeof info_fechas.fin_feoe === 'string' ? info_fechas.fin_feoe : ""}
                      onChange={v => handleUpdateFechas("fin_feoe", v)}
                    />
                  </div>
                  {/* Col 4: Horas/día */}
                  <div>
                    <label className="text-sm text-muted mb-2 block font-semibold">Horas/día FEOE</label>
                    <input
                      type="number"
                      value={Number(info_fechas.h_sem_feoe) || 8}
                      onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))}
                      className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:border-orange-500 focus:outline-none text-center"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "eventos" && (
            <Card className="p-6 border-t-4 border-t-yellow-500">
              <h2 className="text-xl font-bold mb-2"> Festivos y eventos</h2>
              <p className="text-muted text-sm mb-4">
                Introduce manualmente o haz clic en el calendario. Los festivos excluyen horas del cómputo real.
              </p>
              {/* Manual entry table */}
              <NotesTable calendar_notes={calendar_notes} onUpdateNote={handleUpdateNote} />
            </Card>
          )}

          {activeTab === "visual" && (
            <Card className="p-6 border-t-4 border-t-purple-500">
              <h3 className="text-lg font-bold mb-4 text-foreground/80"><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario visual</h3>
              <InteractiveCalendar
                info_fechas={info_fechas}
                horario={horario}
                calendar_notes={calendar_notes}
                onUpdateNote={handleUpdateNote}
              />
            </Card>
          )}
          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
