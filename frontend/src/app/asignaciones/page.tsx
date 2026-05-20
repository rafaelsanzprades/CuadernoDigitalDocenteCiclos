"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSearchParams } from "next/navigation";
import { Search, Save, Filter, BookOpen, Clock, Users, ShieldAlert, CheckCircle2, Plus, X } from "lucide-react";

type Teacher = {
  id: number;
  name: string;
};

type Module = {
  id: number;
  code: string;
  name: string;
  hours: number;
  isDual: boolean;
  assignedTeacherId: number | null;
  ras?: { raNumber: number; description: string }[];
};

type CourseGroup = {
  id: number;
  name: string;
  degreeName: string;
  level: string;
  modules: Module[];
};

export default function AsignacionesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <AsignacionesContent />
    </React.Suspense>
  );
}

function AsignacionesContent() {
  const searchParams = useSearchParams();
  const initialFamilyId = searchParams.get("familyId");
  const initialDegreeId = searchParams.get("degreeId");

  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedDegreeId, setSelectedDegreeId] = useState("");

  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");

  useEffect(() => {
    if (initialFamilyId) setViewFamilyId(initialFamilyId);
    if (initialDegreeId) setViewDegreeId(initialDegreeId);
  }, [initialFamilyId, initialDegreeId]);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          const formattedTeachers = json.data.map((u: any) => ({
            id: u.id,
            name: u.name
          }));
          setTeachers(formattedTeachers);
        }
      });

    fetch("/api/families")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          setFamilies(json.data);
        }
      });

    fetch("/api/learning_outcomes")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          const rasMap = json.data;
          setGroups(prevGroups => prevGroups.map(g => ({
            ...g,
            modules: g.modules.map(m => ({
              ...m,
              ras: rasMap[m.code] || m.ras || []
            }))
          })));
        }
      });
  }, []);

  // Grupos y Módulos mockeados
  const [groups, setGroups] = useState<CourseGroup[]>([
    {
      id: 1,
      name: "1º Instalaciones de Telecomunicaciones",
      degreeName: "Técnico en Instalaciones de Telecomunicaciones",
      level: "Grado Medio",
      modules: [
        { id: 101, code: "0237", name: "Infra. comunes de teleco en viviendas y edificios", hours: 167, isDual: false, assignedTeacherId: 2, ras: [
          { raNumber: 1, description: "Identifica los elementos de las infraestructuras..." },
          { raNumber: 2, description: "Configura pequeñas instalaciones de infraestructuras..." },
          { raNumber: 3, description: "Monta instalaciones de infraestructuras comunes..." }
        ]},
        { id: 102, code: "0359", name: "Electrónica aplicada", hours: 167, isDual: false, assignedTeacherId: 3, ras: [
          { raNumber: 1, description: "Reconoce los principios básicos de la electrónica..." },
          { raNumber: 2, description: "Monta circuitos electrónicos básicos..." }
        ]},
        { id: 103, code: "0360", name: "Equipos microinformáticos", hours: 100, isDual: false, assignedTeacherId: 4 },
        { id: 104, code: "0361", name: "Infra. de redes de datos y sistemas de telefonía", hours: 133, isDual: true, assignedTeacherId: 5 },
        { id: 105, code: "0362", name: "Instalaciones eléctricas básicas", hours: 200, isDual: true, assignedTeacherId: 6 },
        { id: 106, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", hours: 33, isDual: false, assignedTeacherId: 4 },
        { id: 107, code: "A997", name: "Tutoría I", hours: 33, isDual: false, assignedTeacherId: 2 },
        { id: 108, code: "0156", name: "Inglés Profesional (GM)", hours: 67, isDual: false, assignedTeacherId: 7 },
        { id: 109, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 100, isDual: false, assignedTeacherId: 8 }
      ]
    },
    {
      id: 2,
      name: "2º Instalaciones de Telecomunicaciones",
      degreeName: "Técnico en Instalaciones de Telecomunicaciones",
      level: "Grado Medio",
      modules: [
        { id: 201, code: "0238", name: "Instalaciones domóticas", hours: 133, isDual: true, assignedTeacherId: 2 },
        { id: 202, code: "0363", name: "Instalaciones de megafonía y sonorización", hours: 200, isDual: true, assignedTeacherId: 6 },
        { id: 203, code: "0364", name: "Circuito cerrado de televisión y seguridad electrónica", hours: 200, isDual: true, assignedTeacherId: 9 },
        { id: 204, code: "0365", name: "Instalaciones de radiocomunicaciones", hours: 167, isDual: true, assignedTeacherId: 3 },
        { id: 205, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 33, isDual: false, assignedTeacherId: 5 },
        { id: 206, code: "A172", name: "Ofimática avanzada", hours: 100, isDual: true, assignedTeacherId: 4 },
        { id: 207, code: "1713", name: "Proyecto intermodular", hours: 67, isDual: false, assignedTeacherId: 7 },
        { id: 208, code: "A996", name: "Tutoría II", hours: 33, isDual: false, assignedTeacherId: 3 },
        { id: 209, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 67, isDual: false, assignedTeacherId: 8 }
      ]
    },
    {
      id: 3,
      name: "1º Sistemas de Telecomunicaciones e Informáticos",
      degreeName: "Técnico Superior en Sistemas de Telecomunicaciones e Informáticos",
      level: "Grado Superior",
      modules: [
        { id: 301, code: "0525", name: "Configuración de infraestructuras de sistemas de tele", hours: 133, isDual: false, assignedTeacherId: 9 },
        { id: 302, code: "0551", name: "Elementos de sistemas de telecomunicaciones", hours: 133, isDual: false, assignedTeacherId: 3 },
        { id: 303, code: "0552", name: "Sistemas informáticos y redes locales", hours: 133, isDual: true, assignedTeacherId: 2 },
        { id: 304, code: "0554", name: "Sistemas de producción audiovisual", hours: 200, isDual: true, assignedTeacherId: 4 },
        { id: 305, code: "0601", name: "Gestión de proyectos de instalaciones de teleco", hours: 67, isDual: false, assignedTeacherId: 9 },
        { id: 306, code: "0713", name: "Sistemas de telefonía fija y móvil", hours: 133, isDual: false, assignedTeacherId: 6 },
        { id: 307, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", hours: 33, isDual: false, assignedTeacherId: 6 },
        { id: 308, code: "0179", name: "Inglés Profesional", hours: 67, isDual: false, assignedTeacherId: 7 },
        { id: 309, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 100, isDual: false, assignedTeacherId: 8 }
      ]
    },
    {
      id: 4,
      name: "2º Sistemas de Telecomunicaciones e Informáticos",
      degreeName: "Técnico Superior en Sistemas de Telecomunicaciones e Informáticos",
      level: "Grado Superior",
      modules: [
        { id: 401, code: "0553", name: "Técnicas y procesos en infraestructuras de teleco", hours: 133, isDual: true, assignedTeacherId: 4 },
        { id: 402, code: "0555", name: "Redes telemáticas", hours: 233, isDual: true, assignedTeacherId: 5 },
        { id: 403, code: "0556", name: "Sistemas de radiocomunicaciones", hours: 200, isDual: true, assignedTeacherId: 5 },
        { id: 404, code: "0557", name: "Sistemas integrados y hogar digital", hours: 167, isDual: true, assignedTeacherId: 9 },
        { id: 405, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 33, isDual: false, assignedTeacherId: 3 },
        { id: 406, code: "1713", name: "Proyecto intermodular", hours: 67, isDual: false, assignedTeacherId: 2 }
      ]
    },
    {
      id: 5,
      name: "1º Gestión Administrativa",
      degreeName: "ADG201 - Técnico en Gestión Administrativa",
      level: "Grado Medio",
      modules: [
        { id: 501, code: "0437", name: "Comunicación empresarial y atención al cliente", hours: 160, isDual: false, assignedTeacherId: null },
        { id: 502, code: "0438", name: "Operaciones administrativas de compra-venta", hours: 160, isDual: false, assignedTeacherId: null },
        { id: 503, code: "0439", name: "Empresa y administración", hours: 96, isDual: false, assignedTeacherId: null },
        { id: 504, code: "0440", name: "Tratamiento informático de la información", hours: 224, isDual: false, assignedTeacherId: null },
        { id: 505, code: "0441", name: "Técnica contable", hours: 96, isDual: false, assignedTeacherId: null },
        { id: 506, code: "0156", name: "Inglés Profesional (GM)", hours: 64, isDual: false, assignedTeacherId: null },
        { id: 507, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", hours: 32, isDual: false, assignedTeacherId: null },
        { id: 508, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 96, isDual: false, assignedTeacherId: null }
      ]
    },
    {
      id: 6,
      name: "2º Gestión Administrativa",
      degreeName: "ADG201 - Técnico en Gestión Administrativa",
      level: "Grado Medio",
      modules: [
        { id: 601, code: "0446", name: "Empresa en el aula", hours: 147, isDual: true, assignedTeacherId: null },
        { id: 602, code: "0448", name: "Operaciones auxiliares de gestión de tesorería", hours: 147, isDual: true, assignedTeacherId: null },
        { id: 603, code: "0442", name: "Operaciones administrativas de recursos humanos", hours: 105, isDual: true, assignedTeacherId: null },
        { id: 604, code: "0443", name: "Tratamiento de la documentación contable", hours: 105, isDual: true, assignedTeacherId: null },
        { id: 605, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 96, isDual: false, assignedTeacherId: null },
        { id: 606, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 32, isDual: false, assignedTeacherId: null }
      ]
    },
    {
      id: 7,
      name: "1º Administración y Finanzas",
      degreeName: "ADG301 - Técnico Superior en Administración y Finanzas",
      level: "Grado Superior",
      modules: [
        { id: 701, code: "0647", name: "Gestión de la documentación jurídica y empresarial", hours: 96, isDual: false, assignedTeacherId: null },
        { id: 702, code: "0648", name: "Recursos humanos y responsabilidad social corporativa", hours: 64, isDual: false, assignedTeacherId: null },
        { id: 703, code: "0649", name: "Ofimática y proceso de la información", hours: 192, isDual: false, assignedTeacherId: null },
        { id: 704, code: "0650", name: "Proceso integral de la actividad comercial", hours: 192, isDual: false, assignedTeacherId: null },
        { id: 705, code: "0651", name: "Comunicación y atención al cliente", hours: 160, isDual: false, assignedTeacherId: null },
        { id: 706, code: "0179", name: "Inglés Profesional (GS)", hours: 64, isDual: false, assignedTeacherId: null },
        { id: 707, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", hours: 32, isDual: false, assignedTeacherId: null },
        { id: 708, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 96, isDual: false, assignedTeacherId: null }
      ]
    },
    {
      id: 8,
      name: "2º Administración y Finanzas",
      degreeName: "ADG301 - Técnico Superior en Administración y Finanzas",
      level: "Grado Superior",
      modules: [
        { id: 801, code: "0652", name: "Gestión de recursos humanos", hours: 84, isDual: true, assignedTeacherId: null },
        { id: 802, code: "0653", name: "Gestión financiera", hours: 126, isDual: true, assignedTeacherId: null },
        { id: 803, code: "0654", name: "Contabilidad y fiscalidad", hours: 126, isDual: true, assignedTeacherId: null },
        { id: 804, code: "0655", name: "Gestión logística y comercial", hours: 105, isDual: true, assignedTeacherId: null },
        { id: 805, code: "0656", name: "Simulación empresarial", hours: 126, isDual: true, assignedTeacherId: null },
        { id: 806, code: "0657", name: "Proyecto de administración y finanzas", hours: 30, isDual: false, assignedTeacherId: null },
        { id: 807, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 96, isDual: false, assignedTeacherId: null },
        { id: 808, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 32, isDual: false, assignedTeacherId: null }
      ]
    }
  ]);

  const handleAssignTeacher = (groupId: number, moduleId: number, teacherId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        modules: g.modules.map(m => {
          if (m.id !== moduleId) return m;
          return { ...m, assignedTeacherId: teacherId ? Number(teacherId) : null };
        })
      };
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1000);
  };

  const calculateHours = (teacherId: number) => {
    let total = 0;
    groups.forEach(g => {
      g.modules.forEach(m => {
        if (m.assignedTeacherId === teacherId) total += m.hours;
      });
    });
    return total;
  };

  const handleAddGroup = () => {
    if (!newGroupName || !selectedDegreeId) return;
    const family = families.find(f => f.id.toString() === selectedFamilyId);
    const degree = family?.degrees.find((d: any) => d.id.toString() === selectedDegreeId);

    const newGroup: CourseGroup = {
      id: Date.now(),
      name: newGroupName,
      degreeName: degree ? degree.name : "Desconocido",
      level: degree ? degree.level : "Grado",
      modules: [] // Módulos vacíos por ahora
    };

    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
    setNewGroupName("");
    setSelectedFamilyId("");
    setSelectedDegreeId("");
    setHasChanges(true);
  };

  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find((d: any) => d.id.toString() === viewDegreeId);

  const displayedGroups = viewDegree
    ? groups.filter(g => g.degreeName.toLowerCase() === viewDegree.name.toLowerCase())
    : [];

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">📋</span> Asignación de módulos
                </h1>
                <p className="text-gray-400">Jefatura de Estudios: Asigna el profesorado a los módulos de cada ciclo formativo.</p>
              </div>
              <button 
                onClick={handleSave}
                disabled={!hasChanges && saveStatus !== "saved"}
                className={`glass-button font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg ${
                  saveStatus === "saved" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  hasChanges ? "bg-accent/20 text-accent border-accent/50 hover:bg-accent/30" : 
                  "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed"
                }`}
              >
                {saveStatus === "saving" ? (
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : saveStatus === "saved" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>
                  {saveStatus === "saving" ? "Guardando..." : 
                   saveStatus === "saved" ? "¡Guardado!" : 
                   "Guardar Cambios"}
                </span>
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="glass-button bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Añadir Grupo</span>
              </button>
            </div>

            {/* Filtros Superiores */}
            <div className="glass-card p-5 flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Familia Profesional</label>
                <select 
                  className="w-full bg-[#0b1120] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                  value={viewFamilyId}
                  onChange={(e) => {
                    setViewFamilyId(e.target.value);
                    setViewDegreeId("");
                  }}
                >
                  <option value="">-- Selecciona Familia --</option>
                  {families.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Grado y Título</label>
                <select 
                  className="w-full bg-[#0b1120] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
                  value={viewDegreeId}
                  onChange={(e) => setViewDegreeId(e.target.value)}
                  disabled={!viewFamilyId}
                >
                  <option value="">-- Selecciona Título --</option>
                  {viewFamily?.degrees.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.level} - {d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Panel Izquierdo: Lista de Grupos */}
              <div className="lg:col-span-3 space-y-6">
                {!viewDegreeId ? (
                  <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <Filter className="w-12 h-12 mb-4 text-white/20" />
                    <p className="text-lg">Selecciona una Familia y un Título para ver sus módulos.</p>
                  </div>
                ) : displayedGroups.length === 0 ? (
                  <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 mb-4 text-white/20" />
                    <p className="text-lg">No hay grupos registrados para este Título.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-accent hover:text-accent/80 transition-colors">Añadir un nuevo grupo</button>
                  </div>
                ) : (
                  displayedGroups.map(group => (
                    <div key={group.id} className="glass-card overflow-hidden">
                    {/* Cabecera del Grupo */}
                    <div className="bg-white/5 border-b border-white/10 p-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-accent" />
                          {group.name}
                        </h2>
                        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-xs">{group.level}</span>
                          <span>{group.degreeName}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-400">Total Módulos</div>
                        <div className="text-xl font-bold text-white">{group.modules.length}</div>
                      </div>
                    </div>

                    {/* Lista de Módulos (Diseño de tarjetas compactas) */}
                    <div className="p-4 space-y-3">
                      {group.modules.map(module => (
                        <div key={module.id} className="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-1.5">
                          {/* Primera línea: Código + Módulo y Horas */}
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-accent font-mono text-sm font-bold">{module.code}</span>
                              <h3 className="text-base font-medium text-white">{module.name}</h3>
                              {module.isDual && (
                                <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  FEOE
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm font-semibold shrink-0">
                              {module.hours}h
                            </div>
                          </div>

                          {/* Segunda línea: Profesor asignado (Indentado) */}
                          <div className="pl-10">
                            <div className={`relative rounded transition-colors w-full sm:w-2/3 md:w-1/2 max-w-xs ${!module.assignedTeacherId ? 'border border-red-500/50 bg-red-500/10' : 'border border-transparent hover:border-white/10 hover:bg-white/5'}`}>
                              {!module.assignedTeacherId && (
                                <div className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Falta asignación" />
                              )}
                              <select 
                                value={module.assignedTeacherId || ""}
                                onChange={(e) => handleAssignTeacher(group.id, module.id, e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-sm text-gray-300 focus:ring-0 p-1 appearance-none cursor-pointer"
                              >
                                <option value="" className="text-gray-500">Sin profesor/a asignado</option>
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Tercera línea: RA Collapsible */}
                          {module.ras && module.ras.length > 0 && (
                            <details className="group pl-10 mt-1">
                              <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-between list-none select-none transition-colors py-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="group-open:rotate-90 transition-transform text-[8px] bg-white/10 p-0.5 rounded flex items-center justify-center">▶</span>
                                  Resultados de aprendizaje
                                </div>
                                <span className="text-accent text-xs">{module.ras.length} RA</span>
                              </summary>
                              <div className="mt-1.5 space-y-1.5 bg-black/40 p-2.5 rounded border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                                {module.ras.map((ra, idx) => (
                                  <div key={idx} className="text-xs text-gray-400 flex gap-2 w-full leading-tight">
                                    <span className="font-bold text-accent shrink-0">RA{ra.raNumber}.</span> 
                                    <span>{ra.description}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              </div>

              {/* Panel Derecho: Resumen de Carga Lectiva */}
              <div className="space-y-6">
                <div className="glass-card p-6 sticky top-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Carga Horaria
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Monitor de reparto de horas por profesorado. Avisos en caso de excesos.</p>
                  
                  <div className="space-y-4">
                    {teachers.map(teacher => {
                      const hours = calculateHours(teacher.id);
                      // Simulación de alertas (por ejemplo, max 600h anuales)
                      const isOverloaded = hours > 500;
                      
                      return (
                        <div key={teacher.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{teacher.name}</span>
                            <span className={`font-mono font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
                              {hours}h
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full transition-all duration-1000 ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (hours / 600) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Añadir Grupo */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#111827] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Nuevo Grupo Escolar
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Familia Profesional</label>
                  <select 
                    value={selectedFamilyId} 
                    onChange={e => {
                      setSelectedFamilyId(e.target.value);
                      setSelectedDegreeId("");
                    }} 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona Familia...</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id} className="bg-gray-900">{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Grados / Ciclos</label>
                  <select 
                    value={selectedDegreeId} 
                    onChange={e => setSelectedDegreeId(e.target.value)} 
                    disabled={!selectedFamilyId}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">Selecciona Ciclo Formativo...</option>
                    {selectedFamilyId && families.find(f => f.id.toString() === selectedFamilyId)?.degrees.map((d: any) => (
                      <option key={d.id} value={d.id} className="bg-gray-900">{d.name} ({d.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre del Grupo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 1º DAW - Grupo A"
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddGroup}
                    disabled={!newGroupName || !selectedDegreeId}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crear Grupo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
