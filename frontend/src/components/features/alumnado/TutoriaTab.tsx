import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  User, ShieldAlert, Award, Stethoscope, FileText, Compass, 
  ChevronDown, ChevronUp, CheckSquare, Square, Save, HelpCircle 
} from 'lucide-react';
import { Alumno } from '@/types';

export const TutoriaTab = () => {
  const { cursoData, updateCursoData } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    vulnerabilidad: true,
    acneae: false,
    adaptaciones: false,
    intervencion: false,
    historial: false,
    orientacion: false
  });

  const df_al = cursoData?.df_al || [];
  const activeStudents = df_al.filter((al: Alumno) => al.Estado !== 'Baja');
  // Sort alphabetically
  activeStudents.sort((a, b) => (a.Apellidos || '').localeCompare(b.Apellidos || ''));

  const tutoriaLedger = cursoData?.tutoria_ledger || {};
  const currentStudent = activeStudents.find(s => s.ID === selectedStudentId);
  const studentData = selectedStudentId ? (tutoriaLedger[selectedStudentId] || {}) : {};

  // Auto-select first student if none selected
  React.useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || '');
    }
  }, [activeStudents, selectedStudentId]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (field: string, value: any) => {
    if (!selectedStudentId) return;
    const newLedger = { ...tutoriaLedger };
    if (!newLedger[selectedStudentId]) {
      newLedger[selectedStudentId] = {};
    }
    newLedger[selectedStudentId][field] = value;
    updateCursoData('tutoria_ledger', newLedger);
  };

  const renderSectionHeader = (id: string, title: string, icon: React.ReactNode, isOpen: boolean) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-white/5 transition-all text-left font-bold text-base"
    >
      <div className="flex items-center gap-3 text-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {isOpen ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
    </button>
  );

  const renderCheckbox = (field: string, label: string) => {
    const isChecked = studentData[field] === 'X' || studentData[field] === true;
    return (
      <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer hover:text-foreground transition-colors py-1.5 select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => updateField(field, e.target.checked ? 'X' : '')}
          className="w-4.5 h-4.5 rounded bg-foreground/15 border-[var(--glass-border)] text-accent accent-accent focus:ring-0 focus:outline-none cursor-pointer"
        />
        <span>{label}</span>
      </label>
    );
  };

  const renderInput = (field: string, label: string, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={studentData[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-blue-500 focus:outline-none focus:bg-background/40 transition-all"
      />
    </div>
  );

  const renderSelect = (field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted uppercase tracking-wider">{label}</label>
      <select
        value={studentData[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-blue-500 focus:outline-none focus:bg-background/40 transition-all cursor-pointer"
      >
        <option value="" className="bg-[#0f172a] text-muted">-- Seleccionar --</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Falta Alumnado</h2>
        <p className="text-foreground/80">
          Primero debes registrar alumnos en la pestaña 👥 Registro de Alumnado.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Student List Sidebar */}
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">
            Alumnos Activos ({activeStudents.length})
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeStudents.map((al) => {
            const isSelected = al.ID === selectedStudentId;
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedStudentId(al.ID || '')}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-accent text-background font-bold shadow-md shadow-accent/15'
                    : 'text-foreground/80 hover:bg-foreground/5'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-sm truncate">
                    {al.Apellidos}, {al.Nombre}
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-background/80' : 'text-muted'} font-mono`}>
                    {al.ID}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tutoring File Form */}
      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {currentStudent ? (
          <>
            {/* Student File Header */}
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  Ficha de {currentStudent.Nombre} {currentStudent.Apellidos}
                </h3>
                <div className="text-xs text-muted font-mono mt-1">
                  ID: {currentStudent.ID} &bull; Edad: {currentStudent.Edad || '-'} años &bull; Nacimiento: {currentStudent.Nacimiento || '-'}
                </div>
              </div>
            </div>

            {/* Sections Accordion */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* SECTION 1: Datos y Vulnerabilidad */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'vulnerabilidad', 
                  'Sección 1: Datos y Vulnerabilidad', 
                  <User className="w-5 h-5 text-blue-400" />,
                  openSections.vulnerabilidad
                )}
                {openSections.vulnerabilidad && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderSelect('SEXO', 'Sexo', [{ value: 'H', label: 'Hombre' }, { value: 'M', label: 'Mujer' }])}
                    {renderInput('ORIGEN FAMILIAR. Nacionalidad', 'Nacionalidad (Origen)', 'text', 'Ej. ESP, COLOM, MARR')}
                    {renderInput('REPETICIONES', 'Historial de repeticiones', 'text', 'Ej. R1, RP6')}
                    
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                      {renderCheckbox('TOTAL VULNERABILIDAD', 'Vulnerabilidad General')}
                      {renderCheckbox('REPITE CURSO', 'Repite curso actual')}
                      {renderCheckbox('MATERIAS PENDIENTES', 'Materias pendientes')}
                      {renderCheckbox('SOCIOECONÓMICO, SS', 'Riesgo Socioeconómico / SS')}
                      {renderCheckbox('DIFICULTADES FAMILIARES', 'Dificultades familiares')}
                      {renderCheckbox('AUNA, OZANAM, YMCA', 'Apoyo externo (AUNA/YMCA)')}
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                      <div className="col-span-2 md:col-span-4 text-xs font-bold text-muted uppercase tracking-wider">Becas Concedidas</div>
                      {renderCheckbox('BECA MATERIALES', 'Beca Materiales')}
                      {renderCheckbox('BECA AMPA MATERIALES BANCO LIBROS', 'Banco de Libros')}
                      {renderCheckbox('BECA ACNEAES', 'Beca ACNEAE')}
                      {renderCheckbox('BECA GENERAL MEC', 'Beca General MEC')}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ACNEAE y Dificultades */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'acneae', 
                  'Sección 2: ACNEAE y Dificultades', 
                  <ShieldAlert className="w-5 h-5 text-orange-400" />,
                  openSections.acneae
                )}
                {openSections.acneae && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderInput('ACNEAE', 'ACNEAE (Código/Categoría)', 'text', 'Ej. IT, DEA, NEE, TDAH')}
                    {renderInput('TIPO', 'Tipo de dificultad', 'text', 'Ej. Discalculia, TEA, Disc. cognitiva')}
                    {renderInput('OTRAS DIFICULTADES APRENDIZAJE', 'Otras Dificultades de aprendizaje', 'text', 'Ej. Dislexia, Flexibilización')}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {renderCheckbox('ABSENTISMO', 'Problemas absentismo')}
                      {renderSelect('ABSENTISMO 10%', 'Absentismo > 10%', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Registrado' }])}
                      {renderCheckbox('SALUD', 'Afección médica/salud')}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Adaptaciones y ACS */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'adaptaciones', 
                  'Sección 3: Adaptaciones y ACS', 
                  <Award className="w-5 h-5 text-emerald-400" />,
                  openSections.adaptaciones
                )}
                {openSections.adaptaciones && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="col-span-3 flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-sm font-bold text-foreground">Adaptaciones Curriculares Significativas (ACS)</span>
                      {renderCheckbox('ACS', 'Tiene ACS')}
                    </div>
                    <div className="col-span-3 text-xs font-bold text-muted uppercase tracking-wider mb-2">ACS específicas por materia:</div>
                    {renderCheckbox('Lengua', 'ACS Lengua')}
                    {renderCheckbox('Matemáticas', 'ACS Matemáticas')}
                    {renderCheckbox('CC Sociales', 'ACS Ciencias Sociales')}
                    {renderCheckbox('Naturales ', 'ACS Ciencias Naturales')}
                    {renderCheckbox('Inglés', 'ACS Inglés')}
                    {renderCheckbox('Otras', 'ACS Otras asignaturas')}
                  </div>
                )}
              </div>

              {/* SECTION 4: Intervención y Apoyos */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'intervencion', 
                  'Sección 4: Intervención y Apoyos', 
                  <Stethoscope className="w-5 h-5 text-teal-400" />,
                  openSections.intervencion
                )}
                {openSections.intervencion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderInput('INTERVENCIÓN EDUCATIVA', 'Intervención educativa activa', 'text', 'Ej. PSC, PT, AL, DIVER')}
                    {renderSelect('CERTIF DISCAP', 'Certificado de discapacidad', [{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }, { value: 'X', label: 'Sí (no verif)' }])}
                    {renderInput('FECHA INFORME', 'Fecha de informe psicopedagógico', 'date')}
                    {renderInput('FECHA RESOLUCIÓN', 'Fecha de resolución de apoyos', 'date')}
                    
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                      <div className="col-span-2 md:col-span-4 text-xs font-bold text-muted uppercase tracking-wider">Reinforcements & Supports</div>
                      {renderCheckbox('AEE', 'Acompañamiento (AEE)')}
                      {renderCheckbox('MENTORÍA', 'Tiene Mentoría')}
                      {renderCheckbox('REFUERZO AUNA PROA+', 'Refuerzo AUNA PROA+')}
                      {renderCheckbox('REFUERZO ESPAÑOL PROA+', 'Refuerzo Español PROA+')}
                      {renderCheckbox('REFUERZO CORRESPONSABLES', 'Refuerzo Corresponsables')}
                      {renderCheckbox('REFUERZO OZANAM/YMCA', 'Refuerzo Ozanam / YMCA')}
                      {renderCheckbox('FISIO', 'Fisioterapeuta')}
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1.5 pt-3 border-t border-white/5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Observaciones de orientación</label>
                      <textarea
                        value={studentData['Observaciones'] || ''}
                        onChange={(e) => updateField('Observaciones', e.target.value)}
                        placeholder="Escribe aquí observaciones y anotaciones clave de orientación y tutoría..."
                        rows={3}
                        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-blue-500 focus:outline-none focus:bg-background/40 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Historial Académico */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'historial', 
                  'Sección 5: Historial Académico (Evolución)', 
                  <FileText className="w-5 h-5 text-purple-400" />,
                  openSections.historial
                )}
                {openSections.historial && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderInput('CENTRO EDUCATIVO EP', 'Centro educativo Primaria (EP)', 'text', 'Ej. ALM, PTA S, OTRO')}
                      {renderInput('PROMOCIONA A 1º ESO CON SUSPENSOS', 'Nº Suspensos promoción a 1º ESO', 'number')}
                    </div>

                    {/* Notas Medias */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Notas Medias del Historial</div>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                        {renderInput('NOTA MEDIA 6º PRIMARIA', '6º Prim', 'number')}
                        {renderInput('NOTA MEDIA 1º ESO', '1º ESO', 'number')}
                        {renderInput('NOTA MEDIA 2º ESO', '2º ESO', 'number')}
                        {renderInput('NOTA MEDIA 3º ESO', '3º ESO', 'number')}
                        {renderInput('NOTA MEDIA 4º ESO', '4º ESO', 'number')}
                        {renderInput('NOTA MEDIA 1º BACH', '1º Bach', 'number')}
                        {renderInput('NOTA MEDIA 2º BACH', '2º Bach', 'number')}
                      </div>
                    </div>

                    {/* Materias Suspensas */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Nº Materias Suspensas por Curso</div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {renderInput('SUSPENSOS 1º ESO', '1º ESO', 'number')}
                        {renderInput('SUSPENSOS 2º ESO', '2º ESO', 'number')}
                        {renderInput('SUSPENSOS 3º ESO', '3º ESO', 'number')}
                        {renderInput('SUSPENSOS 4º ESO', '4º ESO', 'number')}
                        {renderInput('SUSPENSOS 1º BACH', '1º Bach', 'number')}
                        {renderInput('SUSPENSOS 2º BACH', '2º Bach', 'number')}
                      </div>
                    </div>

                    {/* Calificaciones Lengua y Matemáticas */}
                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Historial Calificaciones Lengua</div>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                        {renderInput('NOTA LENGUA 6º EP', '6º EP', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 1º ESO', '1º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 2º ESO', '2º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 3º ESO', '3º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 4º ESO', '4º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 1º BACH', '1º Bach', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA LENGUA 2º BACH', '2º Bach', 'text', 'Nº o BI/NT')}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Historial Calificaciones Matemáticas</div>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                        {renderInput('NOTA MATES 6º EP', '6º EP', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 1º ESO', '1º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 2º ESO', '2º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 3º ESO', '3º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 4º ESO', '4º ESO', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 1º BACH', '1º Bach', 'text', 'Nº o BI/NT')}
                        {renderInput('NOTA MATES 2º BACH', '2º Bach', 'text', 'Nº o BI/NT')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6: Viajes, Actividades y Orientación */}
              <div className="space-y-3">
                {renderSectionHeader(
                  'orientacion', 
                  'Sección 6: Actividades, Viajes y Orientación', 
                  <Compass className="w-5 h-5 text-pink-400" />,
                  openSections.orientacion
                )}
                {openSections.orientacion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="col-span-2 md:col-span-3 text-xs font-bold text-muted uppercase tracking-wider">Actividades y Viajes Escolares</div>
                      {renderCheckbox('ERASMUS+ Y OTROS VIAJES', 'Erasmus+ / Viajes')}
                      {renderCheckbox('ENGLISH WEEK 1º ESO', 'English Week 1º ESO')}
                      {renderCheckbox('ENTORNO ARAGÓN', 'Entorno Aragón')}
                      {renderCheckbox('2º ESO ESLOVAQUIA/FRANCIA', '2º ESO Eslovaquia/Francia')}
                      {renderCheckbox('3º ESO MUNICH', '3º ESO Munich')}
                      {renderCheckbox('PORTUGAL AULA ABIERTA-DO', 'Portugal Aula Abierta')}
                      {renderCheckbox('VIAJE FIN DE CURSO 4º ESO', 'Viaje Fin Curso 4º ESO')}
                      {renderCheckbox('MOVIIDADES INDIVIDUALES', 'Movilidades Indiv.')}
                      {renderCheckbox('MOVILIDAD BACHILLERATO', 'Movilidad Bach.')}
                    </div>

                    <div className="border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1 md:col-span-3 text-xs font-bold text-muted uppercase tracking-wider">Propuestas de Orientación de Futuro</div>
                      {renderInput('PROPUESTAS', 'Propuesta general')}
                      {renderInput('PROMOCIÓN', 'Decisión promoción')}
                      {renderSelect('REPETICIÓN DE CURSO', 'Repetición de Curso', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('PROMOCIÓN CON ACS', 'Promoción con ACS', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('ORGANIZACIÓN 2º ESO', 'Organización 2º ESO', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('FPGB/CSL', 'FPGB / CSL', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('3º DIVERSIFICACIÓN', '3º Diversificación', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('4º DIVERSIFICACIÓN', '4º Diversificación', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('BACHILLERATO', 'Bachillerato', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('ADAPTACIÓN PAU', 'Adaptación PAU', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                      {renderSelect('FP GRADO MEDIO', 'FP Grado Medio', [{ value: 'Sí', label: 'Sí' }, { value: 'X', label: 'Confirmado' }, { value: '?', label: 'Dudoso' }])}
                    </div>

                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-lg">No hay alumno seleccionado</p>
            <p className="text-sm opacity-80">Por favor, selecciona un alumno de la lista de la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
