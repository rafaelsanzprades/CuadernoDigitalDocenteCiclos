import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Download, Table, Layers, ArrowRight } from 'lucide-react';
import { Alumnadodo } from '@/types';

export const TutoriaMatrixTab = () => {
  const { cursoData, moduleData } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const df_al = cursoData?.df_al || [];
  const activeStudents = df_al.filter((al: Alumnadodo) => al.Estado !== 'Baja');
  // Sort alphabetically
  activeStudents.sort((a, b) => (a.Apellidos || '').localeCompare(b.Apellidos || ''));

  const tutoriaLedger = cursoData?.tutoria_ledger || {};

  // Filter students based on search query
  const filteredStudents = activeStudents.filter((al) => {
    const fullName = `${al.Nombre} ${al.Apellidos}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || (al.ID || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    { id: 'todos', label: '📋 Todas las variables' },
    { id: 'vulnerabilidad', label: '👤 Datos y Vulnerabilidad' },
    { id: 'acneae', label: '⚠️ ACNEAE y Diversidad' },
    { id: 'intervenciones', label: '🛠️ Intervenciones y Apoyos' },
    { id: 'historial', label: '📈 Historial Académico' },
    { id: 'orientacion', label: '🧭 Actividades y Orientación' }
  ];

  // Define columns mapping for each category
  const columnsByCategory: Record<string, { key: string; label: string }[]> = {
    vulnerabilidad: [
      { key: 'SEXO', label: 'Sexo' },
      { key: 'ORIGEN FAMILIAR. Nacionalidad', label: 'Nacionalidad' },
      { key: 'REPETICIONES', label: 'Repeticiones' },
      { key: 'TOTAL VULNERABILIDAD', label: 'Vuln. Gral' },
      { key: 'REPITE CURSO', label: 'Repite' },
      { key: 'MATERIAS PENDIENTES', label: 'Pendientes' },
      { key: 'BECA MATERIALES', label: 'Beca Mat.' },
      { key: 'BECA AMPA MATERIALES BANCO LIBROS', label: 'Bco Libros' },
      { key: 'BECA ACNEAES', label: 'Beca ACNEAE' },
      { key: 'BECA GENERAL MEC', label: 'Beca MEC' },
      { key: 'SOCIOECONÓMICO, SS', label: 'SS / Soc.Econ' },
      { key: 'DIFICULTADES FAMILIARES', label: 'Dif. Fam' },
      { key: 'AUNA, OZANAM, YMCA', label: 'Apoyo Ext' }
    ],
    acneae: [
      { key: 'ACNEAE', label: 'ACNEAE' },
      { key: 'TIPO', label: 'Tipo' },
      { key: 'OTRAS DIFICULTADES APRENDIZAJE', label: 'Otras Dif. Aprend.' },
      { key: 'ABSENTISMO', label: 'Absentismo' },
      { key: 'ABSENTISMO 10%', label: 'Absentismo >10%' },
      { key: 'SALUD', label: 'Salud' },
      { key: 'ACS', label: 'Tiene ACS' },
      { key: 'Lengua', label: 'ACS Lengua' },
      { key: 'Matemáticas', label: 'ACS Mates' },
      { key: 'CC Sociales', label: 'ACS Sociales' },
      { key: 'Naturales ', label: 'ACS Naturales' },
      { key: 'Inglés', label: 'ACS Inglés' },
      { key: 'Otras', label: 'ACS Otras' }
    ],
    intervenciones: [
      { key: 'INTERVENCIÓN EDUCATIVA', label: 'Interv. Educativa' },
      { key: 'CERTIF DISCAP', label: 'Discapacidad' },
      { key: 'FECHA INFORME', label: 'F. Informe' },
      { key: 'FECHA RESOLUCIÓN', label: 'F. Resolución' },
      { key: 'AEE', label: 'AEE' },
      { key: 'MENTORÍA', label: 'Mentoría' },
      { key: 'REFUERZO AUNA PROA+', label: 'AUNA PROA+' },
      { key: 'REFUERZO ESPAÑOL PROA+', label: 'Español PROA+' },
      { key: 'REFUERZO CORRESPONSABLES', label: 'Corresponsables' },
      { key: 'REFUERZO OZANAM/YMCA', label: 'Ozanam/YMCA' },
      { key: 'FISIO', label: 'Fisio' },
      { key: 'Observaciones', label: 'Observaciones' }
    ],
    historial: [
      { key: 'CENTRO EDUCATIVO EP', label: 'Colegio EP' },
      { key: 'PROMOCIONA A 1º ESO CON SUSPENSOS', label: 'Promoc. Susp.' },
      { key: 'NOTA MEDIA 6º PRIMARIA', label: 'N.Med 6º EP' },
      { key: 'NOTA MEDIA 1º ESO', label: 'N.Med 1º ESO' },
      { key: 'NOTA MEDIA 2º ESO', label: 'N.Med 2º' },
      { key: 'NOTA MEDIA 3º ESO', label: 'N.Med 3º' },
      { key: 'NOTA MEDIA 4º ESO', label: 'N.Med 4º' },
      { key: 'NOTA MEDIA 1º BACH', label: 'N.Med 1ºBach' },
      { key: 'NOTA MEDIA 2º BACH', label: 'N.Med 2ºBach' },
      { key: 'SUSPENSOS 1º ESO', label: 'Susp. 1ºESO' },
      { key: 'SUSPENSOS 2º ESO', label: 'Susp. 2º' },
      { key: 'SUSPENSOS 3º ESO', label: 'Susp. 3º' },
      { key: 'SUSPENSOS 4º ESO', label: 'Susp. 4º' },
      { key: 'SUSPENSOS 1º BACH', label: 'Susp. 1ºBach' },
      { key: 'SUSPENSOS 2º BACH', label: 'Susp. 2ºBach' },
      { key: 'NOTA LENGUA 6º EP', label: 'Len 6ºEP' },
      { key: 'NOTA LENGUA 1º ESO', label: 'Len 1º' },
      { key: 'NOTA LENGUA 2º ESO', label: 'Len 2º' },
      { key: 'NOTA MATES 6º EP', label: 'Mat 6ºEP' },
      { key: 'NOTA MATES 1º ESO', label: 'Mat 1º' },
      { key: 'NOTA MATES 2º ESO', label: 'Mat 2º' }
    ],
    orientacion: [
      { key: 'ERASMUS+ Y OTROS VIAJES', label: 'Erasmus+' },
      { key: 'ENGLISH WEEK 1º ESO', label: 'English W.' },
      { key: 'ENTORNO ARAGÓN', label: 'Aragón' },
      { key: '2º ESO ESLOVAQUIA/FRANCIA', label: 'Eslovaquia/Fr.' },
      { key: '3º ESO MUNICH', label: 'Munich' },
      { key: 'PORTUGAL AULA ABIERTA-DO', label: 'Portugal' },
      { key: 'VIAJE FIN DE CURSO 4º ESO', label: 'Fin C. 4º' },
      { key: 'PROPUESTAS', label: 'Propuestas' },
      { key: 'PROMOCIÓN', label: 'Promoción' },
      { key: 'REPETICIÓNDECURSO', label: 'Repite' },
      { key: 'PROMOCIÓN CON ACS', label: 'Promo ACS' },
      { key: 'ORGANIZACIÓN 2º ESO', label: 'Org 2ºESO' },
      { key: 'FPGB/CSL', label: 'FPGB / CSL' },
      { key: '3º DIVERSIFICACIÓN', label: '3º Diver' },
      { key: '4º DIVERSIFICACIÓN', label: '4º Diver' },
      { key: 'BACHILLERATO', label: 'Bachillerato' },
      { key: 'FP GRADO MEDIO', label: 'FP Grado Medio' }
    ]
  };

  // Get active columns based on selected category
  const getActiveColumns = () => {
    if (selectedCategory === 'todos') {
      // Merge all categories columns
      return Object.values(columnsByCategory).flat();
    }
    return columnsByCategory[selectedCategory] || [];
  };

  const activeColumns = getActiveColumns();

  // Export to CSV Function
  const handleExportCSV = () => {
    if (activeStudents.length === 0) return;
    
    // Collect all headers
    const headers = ['ID', 'Apellidos', 'Nombre', 'Estado', ...activeColumns.map(c => c.label)];
    
    const rows = filteredStudents.map((al) => {
      const studentTutoria = tutoriaLedger[al.ID || ''] || {};
      const dataRow = activeColumns.map(col => {
        const val = studentTutoria[col.key] || '';
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [
        `"${al.ID}"`,
        `"${al.Apellidos || ''}"`,
        `"${al.Nombre || ''}"`,
        `"${al.Estado || 'Alta'}"`,
        ...dataRow
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `matriz_tutoria_${moduleData?.info_modulo?.curso || 'grupo'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-foreground/5 p-4 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-3 bg-foreground/15 border border-[var(--glass-border)] rounded-xl px-3 py-1.5 w-full md:w-80">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-muted w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white border-blue-400'
                  : 'bg-foreground/5 text-muted border-white/5 hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          onClick={handleExportCSV}
          className="text-xs font-bold flex items-center gap-1.5 shrink-0 bg-accent/15 text-accent hover:bg-accent/25 border border-accent/30 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      {/* Grid Matrix Table */}
      <Card className="overflow-hidden border border-white/5 rounded-2xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-foreground/10 text-muted border-b border-[var(--glass-border)] sticky top-0 z-20">
                <th className="p-3 font-bold border-r border-[var(--glass-border)] bg-[#0d1525] sticky left-0 z-30">Alumnadodo</th>
                <th className="p-3 font-bold border-r border-[var(--glass-border)] bg-[#0d1525] sticky left-[150px] z-30">ID</th>
                {activeColumns.map((col, idx) => (
                  <th key={idx} className="p-3 font-bold border-r border-white/5 text-center min-w-[100px]" title={col.key}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((al) => {
                const studentTutoria = tutoriaLedger[al.ID || ''] || {};
                
                return (
                  <tr key={al.ID} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                    {/* Student Name Sticky */}
                    <td className="p-3 font-bold border-r border-[var(--glass-border)] bg-[#0f172a] sticky left-0 z-10 truncate max-w-[150px]">
                      {al.Apellidos}, {al.Nombre}
                    </td>
                    {/* Student ID Sticky */}
                    <td className="p-3 font-mono text-muted border-r border-[var(--glass-border)] bg-[#0f172a] sticky left-[150px] z-10 w-16">
                      {al.ID}
                    </td>
                    {/* Values columns */}
                    {activeColumns.map((col, colIdx) => {
                      const rawVal = studentTutoria[col.key];
                      const displayVal = rawVal === 'X' || rawVal === true ? '✅' : (rawVal || '-');
                      
                      return (
                        <td key={colIdx} className="p-3 border-r border-white/5 text-center text-foreground/80">
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={2 + activeColumns.length} className="p-8 text-center text-muted">
                    No se encontraron alumnadodo que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
