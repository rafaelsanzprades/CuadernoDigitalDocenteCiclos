import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

interface FileManagementPanelProps {
  modules: { centro_modules: string[], pd_modules: string[], curso_modules: string[] };
  selectedPd: string;
  setSelectedPd: (v: string) => void;
  selectedCurso: string;
  setSelectedCurso: (v: string) => void;
  newPdName: string;
  setNewPdName: (v: string) => void;
  newCursoName: string;
  setNewCursoName: (v: string) => void;
  handleLoadPd: () => void;
  handleLoadCurso: () => void;
  handleSavePd: () => void;
  handleSaveCurso: () => void;
  moduleData: any;
}

export function FileManagementPanel({
  modules,
  selectedPd, setSelectedPd,
  selectedCurso, setSelectedCurso,
  newPdName, setNewPdName,
  newCursoName, setNewCursoName,
  handleLoadPd, handleLoadCurso,
  handleSavePd, handleSaveCurso,
  moduleData
}: FileManagementPanelProps) {

  // Filtramos los cursos para que solo se muestren los hijos de la PD seleccionada
  const pdPrefix = selectedPd ? selectedPd.replace("-pd", "") : "";
  const filteredCursos = modules.curso_modules.filter(c => pdPrefix && c.startsWith(`${pdPrefix}-curso-`));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Tarjeta de Programación */}
        <Card className="h-full p-6 border-t-4 border-t-accent flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10">
          <div>
            <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-2">
<span>⚙️</span> Programación
</h2>
            <p className="text-sm text-muted">
              Activa la Programación Didáctica maestra (RAs, UDs, Tareas, etc.) que servirá de plantilla.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Programación"
              value={selectedPd}
              onChange={(e) => {
                setSelectedPd(e.target.value);
                // Reseteamos el curso seleccionado al cambiar de PD
                setSelectedCurso("");
              }}
            >
              {modules.pd_modules.length === 0 && <option value="">No hay Programaciones disponibles</option>}
              {modules.pd_modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadPd}
              disabled={!selectedPd}
              className="w-full bg-gradient-to-r from-accent to-[#1abc9c] hover:from-[#1abc9c] hover:to-accent"
            >
              <span>✅</span> Activar Programación
            </Button>
          </div>

          <div className="h-px bg-foreground/10 w-full my-2"></div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Clonar/Crear nueva Programación"
                value={newPdName}
                onChange={(e) => setNewPdName(e.target.value)}
                placeholder="Ej: nuevo-modulo"
              />
              <span className="absolute right-4 top-10 text-muted font-mono text-sm">-pd</span>
            </div>
            <Button
              onClick={handleSavePd}
              disabled={!newPdName || !moduleData}
              variant="secondary"
              className="w-full"
            >
              <span>✨</span> Crear nueva Programación
            </Button>
          </div>
        </Card>

        {/* Tarjeta de Curso */}
        <Card className="h-full p-6 border-t-4 border-t-blue-500 flex flex-col gap-6 transform transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div>
            <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-2">
<span>📅</span> Curso
</h2>
            <p className="text-sm text-muted">
              Activa el Curso escolar real (Alumnado, Notas, Seguimiento diario) de la Programación seleccionada.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label="Seleccionar Curso"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              {filteredCursos.length === 0 && <option value="">No hay Cursos para esta Programación</option>}
              {filteredCursos.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
            <Button
              onClick={handleLoadCurso}
              disabled={!selectedCurso}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
            >
              <span>✅</span> Activar Curso
            </Button>
          </div>

          <div className="h-px bg-foreground/10 w-full my-2"></div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Crear nuevo Curso para la Programación"
                value={newCursoName}
                onChange={(e) => setNewCursoName(e.target.value)}
                placeholder="Ej: 2026-27"
              />
              <span className="absolute left-4 top-10 text-muted font-mono text-sm pr-2 border-r border-[var(--glass-border)] opacity-50 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                {pdPrefix}-curso-
              </span>
            </div>
            <Button
              onClick={handleSaveCurso}
              disabled={!newCursoName || !selectedPd}
              variant="secondary"
              className="w-full"
            >
              <span>📅</span> Crear nuevo Curso
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
