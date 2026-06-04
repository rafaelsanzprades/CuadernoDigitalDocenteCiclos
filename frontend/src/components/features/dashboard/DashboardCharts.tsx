import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/Card";

interface DashboardChartsProps {
  cursoData: any;
}

export function DashboardCharts({ cursoData }: DashboardChartsProps) {
  const barData = (cursoData?.df_sgmt || []).map((ud: any) => ({
    name: ud.id_ud,
    Planificadas: Number(ud.horas_ud || 0),
    Impartidas: Number(ud.Total_Imp || 0),
  }));

  const COLORS = ['#14a085', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  const estadoAlumnado: Record<string, number> = {};
  (cursoData?.df_al || []).forEach((al: any) => {
    const estado = al.Estado || "Desconocido";
    estadoAlumnado[estado] = (estadoAlumnado[estado] || 0) + 1;
  });
  
  const pieData = Object.keys(estadoAlumnado).map(key => ({ name: key, value: estadoAlumnado[key] }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Bar Chart */}
      <Card className="p-6 lg:col-span-2 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-foreground mb-4">Progreso por Unidad Didáctica</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1120', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Planificadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Impartidas" fill="#14a085" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pie Chart */}
      <Card className="p-6 flex flex-col h-[400px]">
        <h3 className="text-lg font-bold text-foreground mb-4">Alta y baja de alumnado</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
