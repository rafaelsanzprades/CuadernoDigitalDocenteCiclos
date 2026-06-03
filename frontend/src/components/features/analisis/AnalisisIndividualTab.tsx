import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";

export const AnalisisIndividualTab = () => {
  const { moduleData, cursoData } = useAppStore();
  const [selectedAlId, setSelectedAlId] = useState<string>("");
  const [simVals, setSimVals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (cursoData?.df_al && cursoData.df_al.length > 0 && !selectedAlId) {
      const activos = cursoData.df_al.filter((al: any) => al.Estado !== "Baja");
      if (activos.length > 0) setSelectedAlId(activos[0].ID || "");
    }
  }, [cursoData, selectedAlId]);

  const df_al = cursoData?.df_al || [];
  const activeAlumnado = df_al.filter((al: any) => al.Estado !== "Baja");
  activeAlumnado.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];

  if (activeAlumnado.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Faltan Datos</h2>
        <p className="text-foreground/80">No hay alumnadodo activos para analizar.</p>
      </Card>
    );
  }

  const getSigadInfo = (nota: number) => {
    let n = nota < 5 ? Math.floor(nota) : Math.floor(nota + 0.5);
    n = Math.max(1, Math.min(10, n));
    if (nota < 5) return { n, cod: "IN", txt: "Insuficiente", col: "#e74c3c" };
    if (nota < 6) return { n, cod: "SU", txt: "Suficiente", col: "#e67e22" };
    if (nota < 7) return { n, cod: "BI", txt: "Bien", col: "#3498db" };
    if (nota < 9) return { n, cod: "NT", txt: "Notable", col: "#2ecc71" };
    return { n, cod: "SB", txt: "Sobresaliente", col: "#1abc9c" };
  };

  const calcularNotas = (evRow: any, overrides: Record<string, number> = {}) => {
    const peso_ra: Record<string, number> = {};
    df_ra.forEach((ra: any) => {
      if (ra.id_ra) peso_ra[ra.id_ra] = Number(ra.peso_ra) || 0;
    });

    const peso_ce: Record<string, number> = {};
    const ra_of_ce: Record<string, string> = {};
    df_ce.forEach((ce: any) => {
      if (ce.id_ce && ce.id_ra) {
        peso_ce[ce.id_ce] = Number(ce.peso_ce) || 0;
        ra_of_ce[ce.id_ce] = ce.id_ra;
      }
    });

    const notas_ce: Record<string, number> = {};
    Object.keys(peso_ce).forEach(ce_id => {
      const act_vals: number[] = [];
      df_act.forEach((act: any) => {
        if (act[ce_id] === true || act[ce_id] === "true") {
          const act_id = act.id_act;
          const val = overrides[act_id] !== undefined ? overrides[act_id] : Number(evRow[act_id]);
          if (!isNaN(val)) act_vals.push(val);
        }
      });
      notas_ce[ce_id] = act_vals.length > 0 ? act_vals.reduce((a, b) => a + b, 0) / act_vals.length : 0;
    });

    const notas_ra: Record<string, number> = {};
    Object.entries(notas_ce).forEach(([ce_id, n_ce]) => {
      const r_id = ra_of_ce[ce_id];
      if (r_id) {
        if (!notas_ra[r_id]) notas_ra[r_id] = 0;
        notas_ra[r_id] += n_ce * (peso_ce[ce_id] / 100);
      }
    });

    df_ra.forEach((ra: any) => {
      if (ra.is_dual && df_feoe.length > 0 && selectedAlId) {
        const fe_row = df_feoe.find((fe: any) => fe.ID === selectedAlId);
        if (fe_row && Number(fe_row[ra.id_ra]) >= 1) {
          const val_feoe = Number(fe_row[ra.id_ra]);
          const conv: any = { 1: 3.0, 2: 5.0, 3: 7.5, 4: 10.0 };
          const nota_emp = conv[val_feoe] || 0;
          if (notas_ra[ra.id_ra] !== undefined) {
            notas_ra[ra.id_ra] = (notas_ra[ra.id_ra] + nota_emp) / 2.0;
          }
        }
      }
    });

    let nota_final = 0;
    Object.entries(notas_ra).forEach(([r_id, n_ra]) => {
      nota_final += n_ra * ((peso_ra[r_id] || 0) / 100);
    });

    return { notas_ra, nota_final, notas_ce };
  };

  const currentAl = activeAlumnado.find((al: any) => al.ID === selectedAlId) || {};
  const currentEv = df_eval.find((e: any) => e.ID === selectedAlId) || {};
  
  // Real Note
  const realCalc = calcularNotas(currentEv);
  const realSigad = getSigadInfo(realCalc.nota_final);

  // Simulated Note
  const simCalc = calcularNotas(currentEv, simVals);
  const simSigad = getSigadInfo(simCalc.nota_final);

  // Group activities by trimester for the simulator
  const acts_by_tri: Record<string, any[]> = { "1T": [], "2T": [], "3T": [] };
  df_act.forEach((act: any) => {
    if (act.id_act && String(act.id_act).trim() !== "") {
      const tri = act.tri_act || "1T";
      if (acts_by_tri[tri]) acts_by_tri[tri].push(act);
    }
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <div className="flex items-center gap-3 bg-foreground/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 w-fit mt-6">
          <span className="text-muted text-sm font-semibold">Viendo como:</span>
          <select 
            value={selectedAlId} 
            onChange={e => {
              setSelectedAlId(e.target.value);
              setSimVals({}); // Reset sim on student change
            }}
            className="bg-transparent border-none p-0 text-foreground focus:outline-none font-bold text-lg cursor-pointer hover:text-teal-400 transition-colors pr-8"
            style={{ appearance: 'auto' }}
          >
            {activeAlumnado.map((al: any) => (
              <option key={al.ID} value={al.ID} className="bg-[#0d1726]">
                {al.Nombre} {al.Apellidos}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-teal-500 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📊</div>
          <span className="text-muted text-sm uppercase font-bold tracking-wider mb-2">Nota Media Actual</span>
          <span className="text-5xl font-black text-teal-400">{realCalc.nota_final.toFixed(2)}</span>
        </Card>
        <Card className="p-6 border-l-4 border-l-blue-500 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🎯</div>
          <span className="text-muted text-sm uppercase font-bold tracking-wider mb-2">Estado</span>
          <span className="text-4xl font-black text-blue-400">{realCalc.nota_final >= 5 ? 'Apto' : 'En Proceso'}</span>
        </Card>
        <Card className="p-6 border-l-4" style={{ borderLeftColor: realSigad.col }}>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-muted text-sm uppercase font-bold tracking-wider mb-2">Calificación Oficial</span>
            <div className="text-4xl font-black" style={{ color: realSigad.col }}>{realSigad.n} · {realSigad.cod}</div>
            <div className="text-sm mt-1 text-foreground/80 font-semibold">{realSigad.txt}</div>
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-[1.1rem] font-bold mb-6">🎯 Adquisición de competencias (RA)</h2>
        <div className="grid grid-cols-2 gap-6">
          {df_ra.map((ra: any) => {
            if (!ra.id_ra) return null;
            const n_ra = realCalc.notas_ra[ra.id_ra] || 0;
            const progress = Math.min(100, (n_ra / 10) * 100);
            
            return (
              <div key={ra.id_ra} className="bg-foreground/10 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-teal-400">{ra.id_ra}</h3>
                    <p className="text-xs text-muted truncate max-w-xs">{ra.desc_ra}</p>
                  </div>
                  <div className="font-mono font-bold">{n_ra.toFixed(2)} / 10</div>
                </div>
                <div className="w-full bg-foreground/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 border-t-4 border-t-purple-500">
        <h2 className="text-[1.1rem] font-bold mb-2">🎮 Simulador de calificaciones</h2>
        <p className="text-muted mb-6 text-sm">Experimenta con tus notas para proyectar tu resultado final.</p>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["1T", "2T", "3T"].map(tri => (
                <div key={tri} className="bg-foreground/10 rounded-xl p-4 border border-white/5">
                  <h3 className="font-bold text-center mb-4 border-b border-[var(--glass-border)] pb-2">{tri}</h3>
                  <div className="space-y-4">
                    {acts_by_tri[tri].map(act => {
                      const act_id = act.id_act;
                      const actual_val = Number(currentEv[act_id]) || 0;
                      const sim_val = simVals[act_id] !== undefined ? simVals[act_id] : actual_val;
                      
                      return (
                        <div key={act_id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground/80 truncate w-32" title={act.desc_act}>{act.desc_act || act_id}</span>
                            <span className="font-mono text-purple-400 font-bold">{sim_val.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="10" step="0.1" 
                            value={sim_val}
                            onChange={(e) => setSimVals(prev => ({ ...prev, [act_id]: Number(e.target.value) }))}
                            className="w-full accent-purple-500"
                          />
                        </div>
                      );
                    })}
                    {acts_by_tri[tri].length === 0 && <p className="text-xs text-muted text-center">Sin actividades</p>}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost"
              onClick={() => setSimVals({})} 
              className="text-sm flex items-center gap-1"
            >
              🔄 Restaurar a notas reales
            </Button>
          </div>

          <div className="w-80">
            <div 
              className="rounded-2xl p-8 text-center text-foreground relative overflow-hidden h-full flex flex-col justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(20,160,133,0.8), rgba(41,128,185,0.8))',
                boxShadow: '0 10px 30px rgba(20,160,133,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div className="text-sm uppercase tracking-widest font-bold opacity-80 mb-4">Nota Proyectada</div>
              <div className="text-7xl font-black mb-4 drop-shadow-lg">{simCalc.nota_final.toFixed(2)}</div>
              <div className="text-[1.1rem] font-bold mb-1">{simSigad.txt}</div>
              <div className="text-lg opacity-80">({simSigad.cod})</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
