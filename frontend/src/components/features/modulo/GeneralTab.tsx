"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Family, Degree } from "@/types";

export function GeneralTab() {
  const {
    moduleData,
    updateInfoModulo,
    updateModuleData,
    groups
  } = useAppStore();

  const [families, setFamilies] = useState<Family[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState("");

  useEffect(() => {
    fetch("/api/families")
      .then(r => r.json())
      .then(json => { if (json.status === "success") setFamilies(json.data); });
  }, []);

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

  const data = moduleData?.info_modulo || {};
  const p_ev = Number(data.p_ev) || 15;
  const h_real = Number(data.h_real) || 0; // Se calcula en Horarios, pero lo ponemos temporal o referenciamos después si hace falta
  const h_p_ev = Math.round((p_ev / 100) * h_real);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="p-6">
        <h4 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span>📝</span> Selección del Módulo didáctico
        </h4>

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
            label="Grado y Título"
            value={viewDegreeId}
            onChange={e => { setViewDegreeId(e.target.value); setSelectedModuleCode(""); }}
            disabled={!viewFamilyId}
          >
            <option value="">-- Selecciona Título --</option>
            {viewFamily?.degrees.map(d => (
              <option key={d.id} value={d.id}>{d.level} · {d.name}</option>
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

        <div className="grid grid-cols-6 gap-4">
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
            className="text-yellow-400 cursor-not-allowed text-center font-bold"
            disabled 
            value={`${h_p_ev} h`}
          />
          <Input 
            label="Horas FEOE"
            type="number"
            value={data.h_feoe || 0}
            onChange={e => updateInfoModulo('h_feoe', Number(e.target.value))}
          />
        </div>
      </Card>


      <Card className="p-6">
        <h4 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span>🧑‍🏫</span> Datos del docente
        </h4>
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
    </div>
  );
}
