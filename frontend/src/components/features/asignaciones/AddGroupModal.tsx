import React from 'react';
import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: any[];
  selectedFamilyId: string;
  setSelectedFamilyId: (id: string) => void;
  selectedDegreeId: string;
  setSelectedDegreeId: (id: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  handleAddGroup: () => void;
}

export function AddGroupModal({
  isOpen,
  onClose,
  families,
  selectedFamilyId,
  setSelectedFamilyId,
  selectedDegreeId,
  setSelectedDegreeId,
  newGroupName,
  setNewGroupName,
  handleAddGroup
}: AddGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[var(--glass-border)] p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-6">
<BookOpen className="w-6 h-6 text-blue-400" />
          Nuevo Grupo Escolar
</h2>

        <div className="space-y-4">
          <Select 
            label="Familia Profesional"
            value={selectedFamilyId} 
            onChange={e => {
              setSelectedFamilyId(e.target.value);
              setSelectedDegreeId("");
            }}
          >
            <option value="">Selecciona Familia...</option>
            {families?.map(f => (
              <option key={f.id} value={f.id} className="bg-gray-900">{f.name}</option>
            ))}
          </Select>

          <Select 
            label="Grados / Ciclos"
            value={selectedDegreeId} 
            onChange={e => setSelectedDegreeId(e.target.value)} 
            disabled={!selectedFamilyId}
          >
            <option value="">Selecciona Ciclo Formativo...</option>
            {selectedFamilyId && families?.find(f => f.id.toString() === selectedFamilyId)?.degrees.map((d: any) => (
              <option key={d.id} value={d.id} className="bg-gray-900">{d.name} ({d.level})</option>
            ))}
          </Select>

          <Input 
            label="Nombre del Grupo"
            placeholder="Ej: 1º DAW - Grupo A"
            value={newGroupName} 
            onChange={e => setNewGroupName(e.target.value)} 
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="secondary"
              onClick={handleAddGroup}
              disabled={!newGroupName || !selectedDegreeId}
            >
              Crear Grupo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
