"use client";
import { Building2, Check, ClipboardList, Edit, Mail, MapPin, Phone, Trash2, UserPlus, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { fileManager } from "@/services/fileManager";
import { demoSeed, CRM_SEED_VERSION } from "@/services/demo-ele203-0237ictve-curso202526";
import type { CrmEmpresa, CrmInteraccion, CursoData } from "@/types";

const TIPO_INTERACCION: Record<string, string> = { llamada: "Llamada", email: "Email", visita: "Visita", otro: "Otro" };

function emptyEmpresa(): CrmEmpresa {
  return { id: "", nombre: "", contacto_nombre: "", contacto_cargo: "", telefono: "", email: "", direccion: "", ciudad: "Zaragoza", codigo_postal: "50001", provincia: "Zaragoza", sector: "", notas: "", estado: "pendiente", interacciones: [], alumnado_asignados: [] };
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function FeoePage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("empresas");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!activeCursoId) { setLoading(false); return; }
      
      const seedEmpresas = (Object.values(demoSeed).find((d: any) => d?.crm_empresas) as any)?.crm_empresas || [];
      
      if (cursoData) { 
        if (!cursoData.crm_empresas || cursoData.crm_empresas.length === 0) {
          updateCursoData("crm_empresas", seedEmpresas);
        }
        setLoading(false); 
        return; 
      }
      setLoading(true);
      try {

        // Try fileManager first
        const db = fileManager.getDb();
        const cursos = Object.keys(db).filter(k => k.includes('-curso-'));
        if (cursos.length > 0 && db[cursos[0]]) {
          const data = { ...db[cursos[0]], crm_empresas: seedEmpresas };
          if (!cancelled) setCursoData(data as CursoData);
        } else {
          // Try API with activeCursoId first, then fallback to seed keys
          const seedKeys = Object.keys(demoSeed).filter(k => k.includes('-curso-'));
          const tryKeys = [activeCursoId, ...seedKeys.filter(k => k !== activeCursoId)];
          for (const k of tryKeys) {
            if (cancelled) break;
            try {
              const res = await fetch(`/api/module/${k}`);
              const data = await res.json();
              if (data.status === "success") {
                setCursoData({ ...data.data, crm_empresas: seedEmpresas } as CursoData);
                break;
              }
            } catch { /* try next key */ }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      if (!cancelled) setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [activeCursoId, cursoData]);

  const TABS = [
    { id: "empresas", label: <span className="flex items-center gap-2"><Building2 className="w-4 h-4"/> Empresas FEOE</span>, cleanLabel: "Empresas FEOE" },
    { id: "alumnado", label: <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Asignación Alumnado</span>, cleanLabel: "Asignación Alumnado" },
    { id: "seguimiento", label: <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Seguimiento Dual/FCT</span>, cleanLabel: "Seguimiento Dual/FCT" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterAlumnado, setFilterAlumnado] = useState("");
  const [expandId, setExpandId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CrmEmpresa>(emptyEmpresa());

  const [interEmpresa, setInterEmpresa] = useState<string | null>(null);
  const [editIntId, setEditIntId] = useState<string | null>(null);
  const [interForm, setInterForm] = useState<{ fecha: string; tipo: "llamada" | "email" | "visita" | "otro"; descripcion: string; contacto: string }>({ fecha: formatDate(new Date()), tipo: "llamada", descripcion: "", contacto: "" });

  const [asignEmpresa, setAsignEmpresa] = useState<string | null>(null);

  const empresas = (cursoData?.crm_empresas || []) as CrmEmpresa[];
  const alumnado = (cursoData?.df_al || []).filter((a: any) => a.Estado !== "Baja");

  const nextId = () => {
    const nums = empresas.map((e: CrmEmpresa) => parseInt(e.id.replace("EMP", ""), 10) || 0);
    return `EMP${String(Math.max(0, ...nums) + 1).padStart(2, "0")}`;
  };

  const nextIntId = (empId: string) => {
    if (!empId) return "INT01";
    const emp = empresas.find((e: CrmEmpresa) => e.id === empId);
    if (!emp) return "INT01";
    const nums = emp.interacciones.map((i: CrmInteraccion) => parseInt(i.id.replace("INT", ""), 10) || 0);
    return `INT${String(Math.max(0, ...nums) + 1).padStart(2, "0")}`;
  };

  const filtered = useMemo(() => {
    return empresas.filter((e: CrmEmpresa) => {
      if (search && !e.nombre.toLowerCase().includes(search.toLowerCase()) && !e.contacto_nombre.toLowerCase().includes(search.toLowerCase()) && !e.ciudad.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSector && e.sector !== filterSector) return false;
      if (filterAlumnado && !e.alumnado_asignados.includes(filterAlumnado)) return false;
      return true;
    });
  }, [empresas, search, filterSector, filterAlumnado]);

  const sectores = useMemo(() => Array.from(new Set(empresas.map((e: CrmEmpresa) => e.sector))).sort(), [empresas]);

  function setEmpresas(list: CrmEmpresa[]) {
    updateCursoData("crm_empresas", list);
  }

  function handleSave() {
    if (!editId) {
      form.id = nextId();
      setEmpresas([...empresas, { ...form }]);
    } else {
      setEmpresas(empresas.map((e: CrmEmpresa) => (e.id === editId ? { ...form } : e)));
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyEmpresa());
  }

  function handleDelete(id: string) {
    if (confirm("¿Eliminar esta empresa?")) setEmpresas(empresas.filter((e: CrmEmpresa) => e.id !== id));
  }

  function openEdit(emp: CrmEmpresa) {
    setForm({ ...emp });
    setEditId(emp.id);
    setShowForm(true);
  }

  function saveInteraccion() {
    if (!interEmpresa) return;
    setEmpresas(empresas.map((e: CrmEmpresa) => {
      if (e.id !== interEmpresa) return e;
      if (editIntId) return { ...e, interacciones: e.interacciones.map((i: CrmInteraccion) => (i.id === editIntId ? { id: editIntId, ...interForm } : i)) };
      return { ...e, interacciones: [...e.interacciones, { id: nextIntId(interEmpresa), ...interForm }] };
    }));
    setInterEmpresa(null);
    setEditIntId(null);
    setInterForm({ fecha: formatDate(new Date()), tipo: "llamada", descripcion: "", contacto: "" });
  }

  function deleteInteraccion(empId: string, intId: string) {
    if (!confirm("¿Eliminar esta interacción?")) return;
    setEmpresas(empresas.map((e: CrmEmpresa) => (e.id === empId ? { ...e, interacciones: e.interacciones.filter((i: CrmInteraccion) => i.id !== intId) } : e)));
  }

  function toggleStudent(empId: string, studentId: string) {
    setEmpresas(empresas.map((e: CrmEmpresa) => {
      if (e.id !== empId) return e;
      const has = e.alumnado_asignados.includes(studentId);
      return { ...e, alumnado_asignados: has ? e.alumnado_asignados.filter((s: string) => s !== studentId) : [...e.alumnado_asignados, studentId] };
    }));
  }

  const estadoColor: Record<string, string> = {
    activo: "bg-success/10 text-success border-success/30",
    inactivo: "bg-danger/10 text-danger border-danger/30",
    pendiente: "bg-warning/10 text-warning border-warning/30",
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Building2 className="w-6 h-6 text-accent" /> Prácticas FEOE
              </h1>
              <p className="text-muted mt-2 text-lg">Gestión de empresas colaboradoras, asignación de alumnado y seguimiento de prácticas duales y FCT.</p>
            </div>

            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Tab 1: Empresas FEOE */}
            {activeTab === "empresas" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Catálogo de empresas colaboradoras</h2>
                  <Button onClick={() => { setForm(emptyEmpresa()); setEditId(null); setShowForm(true); }} variant="primary">+ Nueva empresa</Button>
                </div>

                {showForm && (
                  <Card className="p-6 border border-[var(--glass-border)] bg-foreground/5">
                    <h3 className="text-lg font-bold text-foreground mb-4">{editId ? "Editar empresa" : "Nueva empresa"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><Input label="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                      <Input label="Contacto" value={form.contacto_nombre} onChange={e => setForm({ ...form, contacto_nombre: e.target.value })} />
                      <Input label="Cargo" value={form.contacto_cargo} onChange={e => setForm({ ...form, contacto_cargo: e.target.value })} />
                      <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                      <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      <div className="col-span-2"><Input label="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
                      <Input label="Ciudad" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} />
                      <Input label="CP" value={form.codigo_postal} onChange={e => setForm({ ...form, codigo_postal: e.target.value })} />
                      <Input label="Provincia" value={form.provincia} onChange={e => setForm({ ...form, provincia: e.target.value })} />
                      <Input label="Sector" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
                      <Select label="Estado" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as "activo" | "inactivo" | "pendiente" })}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="pendiente">Pendiente</option>
                      </Select>
                      <div className="col-span-2"><Input label="Notas" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyEmpresa()); }}>Cancelar</Button>
                      <Button onClick={handleSave} variant="primary" disabled={!form.nombre || !form.contacto_nombre}>{editId ? "Guardar cambios" : "Crear empresa"}</Button>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end mb-4">
                  <Input label="Buscar" placeholder="Nombre, contacto o ciudad..." value={search} onChange={e => setSearch(e.target.value)} />
                  <Select label="Sector" value={filterSector} onChange={e => setFilterSector(e.target.value)}>
                    <option value="">Todos</option>
                    {sectores.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <Select label="Alumnado" value={filterAlumnado} onChange={e => setFilterAlumnado(e.target.value)}>
                    <option value="">Todos</option>
                    {alumnado.map((a: any) => <option key={a.ID} value={a.ID}>{a.Apellidos}, {a.Nombre}</option>)}
                  </Select>
                  <div className="mb-1">
                    <Button variant="ghost" onClick={() => { setSearch(""); setFilterSector(""); setFilterAlumnado(""); }} className="text-xs">Limpiar</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filtered.length === 0 && (
                    <Card className="p-12 text-center text-muted">No hay empresas que coincidan con los filtros.</Card>
                  )}
                  {filtered.map((emp: CrmEmpresa) => {
                    const isOpen = expandId === emp.id;
                    return (
                      <Card key={emp.id} className="overflow-hidden">
                        <div className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-foreground/5 transition-colors" onClick={() => setExpandId(isOpen ? null : emp.id)}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-foreground">{emp.nombre}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${estadoColor[emp.estado] || estadoColor.pendiente}`}>{emp.estado}</span>
                            </div>
                            <p className="text-sm text-muted">{emp.contacto_nombre} · {emp.telefono} · {emp.email}</p>
                            <p className="text-xs text-muted/70 mt-0.5">{emp.sector} · {emp.ciudad}</p>
                            {emp.alumnado_asignados.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {emp.alumnado_asignados.map((sid: string) => {
                                  const al = alumnado.find((a: any) => a.ID === sid);
                                  return <span key={sid} className="text-[10px] bg-info/10 text-info border border-info/30 px-2 py-0.5 rounded-full">{al ? `${al.Apellidos}, ${al.Nombre}` : sid}</span>;
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted">{emp.interacciones.length} int. · {emp.alumnado_asignados.length} al.</span>
                            <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="border-t border-[var(--glass-border)] p-5 space-y-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div><span className="text-muted text-xs">Dirección</span><p className="text-foreground">{emp.direccion}</p></div>
                              <div><span className="text-muted text-xs">Ciudad</span><p className="text-foreground">{emp.ciudad} ({emp.codigo_postal})</p></div>
                              <div><span className="text-muted text-xs">Contacto</span><p className="text-foreground">{emp.contacto_nombre} · {emp.contacto_cargo}</p></div>
                              <div><span className="text-muted text-xs">Email / Teléfono</span><p className="text-foreground">{emp.email} · {emp.telefono}</p></div>
                            </div>
                            {emp.notas && <p className="text-sm text-foreground/80 italic flex items-start gap-2"><ClipboardList className="w-4 h-4 text-muted shrink-0" /> {emp.notas}</p>}

                            {/* Student assignment inline */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium text-muted ">Alumnado asignados</h4>
                                <Button variant="ghost" className="text-xs flex items-center gap-1.5" onClick={() => setAsignEmpresa(asignEmpresa === emp.id ? null : emp.id)}>
                                  {asignEmpresa === emp.id ? "Cerrar" : <><UserPlus className="w-3.5 h-3.5" /> Asignar / desasignar</>}
                                </Button>
                              </div>
                              {asignEmpresa === emp.id && (
                                <div className="bg-foreground/5 rounded-xl p-4 border border-[var(--glass-border)] mb-3 space-y-2 max-h-48 overflow-y-auto">
                                  {alumnado.length === 0 && <p className="text-muted text-sm italic">No hay alumnado activos.</p>}
                                  {alumnado.map((al: any) => {
                                    const selected = emp.alumnado_asignados.includes(al.ID);
                                    const assignedTo = empresas.filter((e: CrmEmpresa) => e.id !== emp.id && e.alumnado_asignados.includes(al.ID));
                                    return (
                                      <div key={al.ID} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selected ? "bg-info/10 border-info/30" : "bg-transparent border-[var(--glass-border)] hover:bg-foreground/10"}`} onClick={() => toggleStudent(emp.id, al.ID)}>
                                        <span className="text-sm text-foreground">{al.Apellidos}, {al.Nombre}{assignedTo.length > 0 ? <span className="text-[10px] text-warning ml-2">(también en {assignedTo.map((e: CrmEmpresa) => e.nombre).join(", ")})</span> : ""}</span>
                                        <span className={`text-lg ${selected ? "text-info" : "text-muted"}`}>{selected ? <><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></> : "+"}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {emp.alumnado_asignados.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {emp.alumnado_asignados.map((sid: string) => {
                                    const al = alumnado.find((a: any) => a.ID === sid);
                                    return (
                                      <span key={sid} className="flex items-center gap-1 text-xs bg-info/10 text-info border border-info/30 px-2 py-1 rounded-full">
                                        {al ? `${al.Apellidos}, ${al.Nombre}` : sid}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Interactions inline */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-medium text-muted ">Historial de interacciones</h4>
                                <div className="flex gap-2">
                                  <Button variant="ghost" className="text-xs flex items-center gap-1.5" onClick={() => handleDelete(emp.id)}><Trash2 className="w-3.5 h-3.5 text-danger" /> Empresa</Button>
                                  <Button variant="ghost" className="text-xs flex items-center gap-1.5" onClick={() => openEdit(emp)}><Edit className="w-3.5 h-3.5" /> Editar</Button>
                                  <Button variant="ghost" className="text-xs flex items-center gap-1.5" onClick={() => { setInterEmpresa(interEmpresa === emp.id ? null : emp.id); setEditIntId(null); setInterForm({ fecha: formatDate(new Date()), tipo: "llamada", descripcion: "", contacto: emp.contacto_nombre }); }}>
                                    <Phone className="w-3.5 h-3.5" /> Nueva interacción
                                  </Button>
                                </div>
                              </div>

                              {/* Interaction form inline */}
                              {interEmpresa === emp.id && (
                                <div className="bg-foreground/5 rounded-xl p-4 border border-[var(--glass-border)] space-y-3">
                                  <h5 className="text-sm font-semibold text-foreground">{editIntId ? "Editar interacción" : "Nueva interacción"}</h5>
                                  <div className="grid grid-cols-3 gap-3">
                                    <Input label="Fecha" value={interForm.fecha} onChange={e => setInterForm({ ...interForm, fecha: e.target.value })} />
                                    <Select label="Tipo" value={interForm.tipo} onChange={e => setInterForm({ ...interForm, tipo: e.target.value as "llamada" | "email" | "visita" | "otro" })}>
                                      <option value="llamada">Llamada</option>
                                      <option value="email">Email</option>
                                      <option value="visita">Visita</option>
                                      <option value="otro">Otro</option>
                                    </Select>
                                    <Input label="Contacto" value={interForm.contacto} onChange={e => setInterForm({ ...interForm, contacto: e.target.value })} />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted mb-1 block">Descripción</label>
                                    <textarea value={interForm.descripcion} onChange={e => setInterForm({ ...interForm, descripcion: e.target.value })} rows={2} className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" className="text-xs" onClick={() => { setInterEmpresa(null); setEditIntId(null); }}>Cancelar</Button>
                                    <Button onClick={saveInteraccion} variant="primary" disabled={!interForm.descripcion}>{editIntId ? "Guardar" : "Añadir"}</Button>
                                  </div>
                                </div>
                              )}

                              {emp.interacciones.length === 0 ? (
                                <p className="text-sm text-muted italic">Sin interacciones registradas.</p>
                              ) : (
                                <div className="space-y-2">
                                  {[...emp.interacciones].sort((a: CrmInteraccion, b: CrmInteraccion) => b.fecha.localeCompare(a.fecha)).map((int: CrmInteraccion) => (
                                    <div key={int.id} className="flex items-start gap-3 text-sm bg-foreground/5 rounded-lg p-3 border border-[var(--glass-border)]">
                                      <span className="text-base shrink-0">{TIPO_INTERACCION[int.tipo]?.split(" ")[0]}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs text-muted">{int.fecha}</span>
                                          <span className="text-xs font-medium text-foreground/80">{TIPO_INTERACCION[int.tipo]}</span>
                                          <span className="text-xs text-muted">— {int.contacto}</span>
                                        </div>
                                        <p className="text-foreground/80 mt-1">{int.descripcion}</p>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => { setInterEmpresa(emp.id); setEditIntId(int.id); setInterForm({ fecha: int.fecha, tipo: int.tipo, descripcion: int.descripcion, contacto: int.contacto }); }} className="text-xs text-muted hover:text-accent transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteInteraccion(emp.id, int.id)} className="text-xs text-muted hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Asignación Alumnado */}
            {activeTab === "alumnado" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Asignación de alumnado a empresas</h2>
                {empresas.length === 0 ? (
                  <Card className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                    <p>No hay empresas registradas. Añade empresas en la pestaña "Empresas FEOE".</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {empresas.filter((e: CrmEmpresa) => e.alumnado_asignados.length > 0).length === 0 && (
                      <Card className="p-8 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                        <p>Aún no hay alumnado asignados a ninguna empresa. Usa el panel de cada empresa para asignarlos.</p>
                      </Card>
                    )}
                    {empresas.filter((e: CrmEmpresa) => e.alumnado_asignados.length > 0).map((emp: CrmEmpresa) => (
                      <Card key={emp.id} className="p-5 border border-[var(--glass-border)]">
                        <h3 className="text-lg font-bold text-foreground mb-3">{emp.nombre}</h3>
                        <div className="flex flex-wrap gap-2">
                          {emp.alumnado_asignados.map((sid: string) => {
                            const al = alumnado.find((a: any) => a.ID === sid);
                            return (
                              <span key={sid} className="text-sm bg-info/10 text-info border border-info/30 px-3 py-1 rounded-full">
                                {al ? `${al.Apellidos}, ${al.Nombre}` : sid}
                              </span>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                    {alumnado.length > 0 && (
                      <Card className="p-5 border border-[var(--glass-border)]">
                        <h3 className="text-lg font-bold text-foreground mb-3">Alumnado sin asignar</h3>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const asignados = new Set(empresas.flatMap((e: CrmEmpresa) => e.alumnado_asignados));
                            return alumnado.filter((a: any) => !asignados.has(a.ID)).map((al: any) => (
                              <span key={al.ID} className="text-sm bg-warning/10 text-warning border border-warning/30 px-3 py-1 rounded-full">
                                {al.Apellidos}, {al.Nombre}
                              </span>
                            ));
                          })()}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Seguimiento */}
            {activeTab === "seguimiento" && (
              <Card className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Seguimiento FCT / Dual</h2>
                <p className="max-w-xl mx-auto">
                  Esta sección estará disponible próximamente para registrar las horas realizadas por los alumnado, las visitas de seguimiento y la valoración final de las prácticas.
                </p>
              </Card>
            )}
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
