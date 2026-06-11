"use client";
import { Calendar, FileEdit, Receipt, Scale, School, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Family } from "@/types";
import { fileManager } from "@/services/fileManager";

export function DatosTab() {
  const {
    moduleData,
    setModuleData,
    updateInfoModulo,
    updateModuleData,
    cursoData,
    updateCursoData,
    groups
  } = useAppStore();

  useEffect(() => {
    // Force reload of new demo values if they are missing
    if (moduleData?.info_modulo?.centro !== "IES Andalán" || (moduleData?.df_act && moduleData.df_act.length < 21)) {
      const db = fileManager.getDb();
      if (db['0237-ictve-pd']) {
        setModuleData(db['0237-ictve-pd']);
      }
    }
  }, [moduleData?.info_modulo?.centro, moduleData?.df_act?.length, setModuleData]);

  // --- States for Módulo didáctico ---
  const [families, setFamilies] = useState<Family[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState("");

  useEffect(() => {
    fetch("/api/families")
      .then(r => r.json())
      .then(json => { if (json.status === "success") setFamilies(json.data); });
  }, []);

  useEffect(() => {
    if (families.length > 0 && moduleData?.info_modulo) {
      const { familia, ciclo, codigo } = moduleData.info_modulo;
      
      const cleanStr = (s: string) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

      if (familia && !viewFamilyId) {
        const fam = families.find(f => cleanStr(f.name) === cleanStr(familia));
        if (fam) {
          setViewFamilyId(fam.id.toString());
          if (ciclo) {
            const deg = fam.degrees.find(d => cleanStr(d.name) === cleanStr(ciclo) || cleanStr(d.name).includes(cleanStr(ciclo)));
            if (deg) {
              setViewDegreeId(deg.id.toString());
            }
          }
        }
      }
      
      if (codigo && !selectedModuleCode) {
        setSelectedModuleCode(codigo);
      }
    }
  }, [families, moduleData, viewFamilyId, selectedModuleCode]);

  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find(d => d.id.toString() === viewDegreeId);

  const clean = (str: string) =>
    str.toLowerCase()
      .replace(/^[a-z0-9]+\s*-\s*/i, "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();

  const displayedGroups = viewDegree
    ? groups.filter(g => clean(g.degreeName) === clean(viewDegree.name))
    : [];

  const handleSelectModule = (code: string) => {
    setSelectedModuleCode(code);
    if (!code) return;

    const mod = displayedGroups.flatMap(g => g.modules).find(m => m.code === code);
    if (!mod) return;

    const group = displayedGroups.find(g => g.modules.some(m => m.code === code));
    const is2nd = group?.name.startsWith("2");
    const h_feoe = is2nd ? 360 : 140;

    const h_sem = mod.hours ? Math.round(mod.hours / 30) : 0;
    const curso = is2nd ? "2º" : "1º";

    updateInfoModulo("modulo", `${mod.code} - ${mod.name}`);
    updateInfoModulo("h_boa", mod.hours);
    updateInfoModulo("h_sem", h_sem);
    updateInfoModulo("p_ev", 15);
    updateInfoModulo("h_feoe", h_feoe);
    updateInfoModulo("curso", curso);

    fetch("/api/learning_outcomes")
      .then(r => r.json())
      .then(json => {
        if (json.status === "success" && json.data[code]) {
          const ras = json.data[code].map((ra: any) => ({
            id_ra: `RA${ra.raNumber}`,
            desc_ra: ra.description,
            peso_ra: Math.round(100 / json.data[code].length)
          }));
          updateModuleData("df_ra", ras);
        }
      })
      .catch(() => { });
  };

  // --- Data Extraction ---
  const data = moduleData?.info_modulo || {};
  const horario = cursoData?.horario || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const info_fechas = cursoData?.info_fechas || {};
  const calendar_notes = cursoData?.calendar_notes || {};

  // --- Horarios / Trimestres ---
  const handleUpdateHorario = (day: string, val: number) =>
    updateCursoData("horario", { ...horario, [day]: val });

  const h_sem = Number(data.h_sem) || 0;
  const suma_horario = ["Lun", "Mar", "Mié", "Jue", "Vie"].reduce((acc, day) => acc + (Number(horario[day]) || 0), 0);
  const pad = (n: number) => String(n).padStart(2, "0");

  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      let total = 0, curr = new Date(start);
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch { return 0; }
  };

  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;
  const h_boa = Number(data.h_boa) || 0;
  const p_ev = Number(data.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_real);

  // --- Evaluación ---
  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);
  const sumaCriterios =
    (data.criterio_conocimiento || 0) +
    (data.criterio_procedimiento_practicas || 0) +
    (data.criterio_procedimiento_ejercicios || 0) +
    (data.criterio_tareas || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Centro y docente */}
      <Card className="p-6">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-5">
<span>‍<span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Centro y docente
</h2>
        <div className="grid grid-cols-2 gap-6">
          <Input 
            label="Centro educativo"
            type="text"
            value={data.centro || ""}
            onChange={e => updateInfoModulo('centro', e.target.value)}
          />
          <Input 
            label="Profesorado"
            type="text"
            value={data.profesorado || data.profesor || ""}
            onChange={e => updateInfoModulo('profesorado', e.target.value)}
          />
        </div>
      </Card>

      {/* 2. Módulo didáctico */}
      <Card className="p-6">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-5">
<span><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Módulo didáctico
</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label="Familia Profesional"
            value={viewFamilyId}
            onChange={e => { setViewFamilyId(e.target.value); setViewDegreeId(""); setSelectedModuleCode(""); }}
          >
            <option value="">-- Selecciona Familia --</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
          <Select
            label="Título"
            value={viewDegreeId}
            onChange={e => { setViewDegreeId(e.target.value); setSelectedModuleCode(""); }}
            disabled={!viewFamilyId}
          >
            <option value="">-- Selecciona Título --</option>
            {viewFamily?.degrees.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-5">
          <div className="col-span-4">
            <Select
              label="Módulo didáctico"
              value={selectedModuleCode}
              onChange={e => handleSelectModule(e.target.value)}
              disabled={!viewDegreeId}
            >
              <option value="">-- Selecciona Módulo --</option>
              {displayedGroups.flatMap(g => g.modules).map(mod => (
                <option key={mod.id} value={mod.code}>
                  {mod.code} · {mod.name}
                </option>
              ))}
            </Select>
          </div>
          <Input 
            label="Curso"
            type="text"
            value={data.curso || ""}
            onChange={e => updateInfoModulo('curso', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Input 
            label="Nº de trimestres"
            type="text"
            className="text-muted cursor-not-allowed"
            disabled 
            value="3"
          />
          <Input 
            label="Horas/semana clase"
            type="number"
            value={data.h_sem || 0}
            onChange={e => updateInfoModulo('h_sem', Number(e.target.value))}
          />
          <Input 
            label="Horas BOA"
            type="number"
            value={data.h_boa || 0}
            onChange={e => updateInfoModulo('h_boa', Number(e.target.value))}
          />
          <Input 
            label="% P.Ev.Continua"
            type="number"
            value={data.p_ev || 15}
            onChange={e => updateInfoModulo('p_ev', Number(e.target.value))}
          />
          <Input 
            label={`Horas P.Ev. (${p_ev}%)`}
            type="text"
            className="text-warning cursor-not-allowed text-center font-bold"
            disabled 
            value={`${h_p_ev} h`}
          />
        </div>
      </Card>

      {/* 3. Sesiones semanales */}
      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground">
<span></span> Sesiones semanales
</h2>
          <div className="bg-foreground/15 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm">
            Desfase con H/Semanal:{" "}
            <span className={`font-bold ${suma_horario === h_sem ? "text-success" : "text-warning"}`}>
              {suma_horario - h_sem} h
            </span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
            <Input 
              key={day}
              label={day}
              type="number" min="0" max="8"
              value={Number(horario[day]) || 0}
              onChange={e => handleUpdateHorario(day, Number(e.target.value))}
              className="text-center text-xl font-mono"
            />
          ))}
        </div>
      </Card>

      {/* 4. Sesiones trimestrales */}
      <Card className="p-6 border-l-4 border-l-emerald-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-6">
<span><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Sesiones trimestrales
</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "1er trimestre", value: h1 },
            { label: "2º trimestre", value: h2 },
            { label: "3er trimestre", value: h3 },
          ].map(t => (
            <div key={t.label}>
              <label className="block text-sm font-semibold text-muted mb-2 text-center">{t.label}</label>
              <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                <div className="text-[1.1rem] font-bold text-success font-mono">{t.value} h</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6 mt-4">
          {[
            { label: "Horas BOA", value: `${h_boa} h`, cls: "text-foreground" },
            { label: "Horas clases real", value: `${h_real} h`, cls: "text-success" },
            { label: `Horas P.Ev. (${p_ev}%)`, value: `${h_p_ev} h`, cls: "text-warning" },
          ].map(s => (
            <div key={s.label}>
              <label className="block text-sm font-semibold text-muted mb-2 text-center">{s.label}</label>
              <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-4 text-center">
                <div className={`text-[1.1rem] font-bold ${s.cls}`}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. Evaluación */}
      <Card className="p-6 border-l-4 border-l-accent">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Scale className="w-[1.2em] h-[1.2em] mr-1" /></span></span> % Ponderación por trimestres</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
            {sumaTrimestres}% {sumaTrimestres !== 100 && "(Debe sumar 100%)"}
          </span>
        </h4>
        <div className="grid grid-cols-3 gap-6">
          {[['pond_1t', '1er trimestre (%)'], ['pond_2t', '2º trimestre (%)'], ['pond_3t', '3er trimestre (%)']].map(([k, label]) => (
            <Input 
              key={k}
              label={label}
              type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
              className="text-center" 
            />
          ))}
        </div>
      </Card>

      <Card className="p-6 border-l-4 border-l-purple-500">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Receipt className="w-[1.2em] h-[1.2em] mr-1" /></span></span> % Instrumentos de evaluación</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sumaCriterios === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
            {sumaCriterios}% {sumaCriterios !== 100 && "(Debe sumar 100%)"}
          </span>
        </h4>
        <div className="grid grid-cols-4 gap-6">
          {[
            ['criterio_conocimiento', 'Exámenes teóricos'],
            ['criterio_procedimiento_practicas', 'Exámenes prácticos'],
            ['criterio_procedimiento_ejercicios', 'Informes de ejercicios'],
            ['criterio_tareas', 'Cuaderno de tareas'],
          ].map(([k, label]) => (
            <Input 
              key={k}
              label={label}
              type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
              className="text-center" 
            />
          ))}
        </div>
      </Card>

    </div>
  );
}
