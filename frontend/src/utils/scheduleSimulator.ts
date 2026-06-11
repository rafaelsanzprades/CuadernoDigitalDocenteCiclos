export interface DaySchedule {
  dateStr: string; // "dd/MM/yyyy"
  date: Date;
  dayOfWeekName: string; // "Lun", "Mar", "Mié", "Jue", "Vie"
  hours: number;
  isFestivo: boolean;
  festivoName?: string;
  isEvent: boolean;
  eventName?: string;
  udId?: string;
  udDesc?: string;
  sessions: {
    ID: string;
    Num_Orden: number;
    Tipo_Actividad: string;
    Contenidos: string;
    Recursos: string;
    Horas: number;
  }[];
}

export function simulateSchedule(moduleData: any, cursoData: any, startDateStr?: string): Record<string, DaySchedule> {
  const simulation: Record<string, DaySchedule> = {};
  if (!moduleData || !cursoData) return simulation;

  const info_fechas = cursoData.info_fechas || {};
  const horario = cursoData.horario || {};
  const calendar_notes = cursoData.calendar_notes || {};
  const planning_ledger = cursoData.planning_ledger || {};
  const df_sesiones = moduleData.df_sesiones || [];
  const df_ud = moduleData.df_ud || [];

  const dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  const parseDate = (s: string) => {
    if (!s) return null;
    if (String(s).includes("-")) {
      const parts = String(s).split("-").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return null;
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      const parts = String(s).split("/").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return null;
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  };

  const termRanges = [
    { ini: parseDate(info_fechas.inicio || info_fechas.ini_1t), fin: parseDate(info_fechas.evaluacion_1 || info_fechas.fin_1t) },
    { ini: parseDate(info_fechas.evaluacion_1 || info_fechas.ini_2t), fin: parseDate(info_fechas.evaluacion_2 || info_fechas.fin_2t) },
    { ini: parseDate(info_fechas.evaluacion_2 || info_fechas.ini_3t), fin: parseDate(info_fechas.fin || info_fechas.evaluacion_final || info_fechas.fin_3t) }
  ];

  // 1. Gather all calendar dates in sorted order across the terms
  const datesList: Date[] = [];
  termRanges.forEach(({ ini, fin }) => {
    if (!ini || !fin) return;
    let curr = new Date(ini);
    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        datesList.push(new Date(curr));
      }
      curr.setDate(curr.getDate() + 1);
    }
  });

  // Sort dates chronologically
  datesList.sort((a, b) => a.getTime() - b.getTime());

  // 2. Prepare session tracker (remaining hours)
  const udSessionTracker: Record<string, any[]> = {};
  df_sesiones.forEach((ses: any) => {
    const udId = String(ses.id_ud || "");
    if (!udSessionTracker[udId]) {
      udSessionTracker[udId] = [];
    }
    udSessionTracker[udId].push({
      ID: ses.ID,
      Num_Orden: Number(ses.Num_Orden) || 0,
      Tipo_Actividad: ses.Tipo_Actividad || "",
      Contenidos: ses.Contenidos || "",
      Recursos: ses.Recursos || "",
      Horas: Number(ses.Horas) || 1,
      h_rem: Math.max(1, Number(ses.Horas) || 1)
    });
  });

  // Sort each UD's sessions by order
  Object.keys(udSessionTracker).forEach(udId => {
    udSessionTracker[udId].sort((a, b) => a.Num_Orden - b.Num_Orden);
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  // 3. Process each date in order
  datesList.forEach((d) => {
    const rawDay = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayIndex = rawDay - 1; // 0 = Lun, ..., 4 = Vie
    const dayOfWeekName = dias_semana_list[dayIndex] || "Lun";
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const lookupDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const isFestivo = !!calendar_notes[`f_${lookupDateStr}`];
    const festivoName = calendar_notes[`f_${lookupDateStr}`] || undefined;
    const isEvent = !!calendar_notes[`r_${lookupDateStr}`];
    const eventName = calendar_notes[`r_${lookupDateStr}`] || undefined;

    const dayKeyMap = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const dayKey = dayKeyMap[dayIndex] || "lunes";
    const horarioStr = horario[dayKey] || "";
    
    let hours = 0;
    if (horarioStr) {
      const [start, end] = horarioStr.split("-");
      if (start && end) {
        const startParts = start.split(":");
        const endParts = end.split(":");
        if (startParts.length === 2 && endParts.length === 2) {
          const startH = Number(startParts[0]) + Number(startParts[1]) / 60;
          const endH = Number(endParts[0]) + Number(endParts[1]) / 60;
          hours = Math.max(0, Math.round(endH - startH));
        }
      }
    }
    if (isFestivo) hours = 0;

    const udsToday = planning_ledger[lookupDateStr] || [];
    const udId = udsToday[0] ? String(udsToday[0]) : undefined;
    const udDesc = udId ? (df_ud.find((u: any) => String(u.id_ud) === udId)?.desc_ud || udId) : undefined;

    const todaySessions: any[] = [];

    if (!isFestivo && udId && hours > 0) {
      let hoursLeft = hours;
      // Consume sessions for this UD
      while (hoursLeft > 0 && udSessionTracker[udId] && udSessionTracker[udId].length > 0) {
        const ses = udSessionTracker[udId][0];
        
        // Add to today's sessions list
        if (!todaySessions.some(ts => ts.ID === ses.ID)) {
          todaySessions.push({
            ID: ses.ID,
            Num_Orden: ses.Num_Orden,
            Tipo_Actividad: ses.Tipo_Actividad,
            Contenidos: ses.Contenidos,
            Recursos: ses.Recursos,
            Horas: ses.Horas
          });
        }

        if (ses.h_rem > hoursLeft) {
          ses.h_rem -= hoursLeft;
          hoursLeft = 0;
        } else {
          hoursLeft -= ses.h_rem;
          udSessionTracker[udId].shift(); // Fully consumed
        }
      }
    }

    simulation[dateStr] = {
      dateStr,
      date: d,
      dayOfWeekName,
      hours,
      isFestivo,
      festivoName,
      isEvent,
      eventName,
      udId,
      udDesc,
      sessions: todaySessions
    };
  });

  return simulation;
}
