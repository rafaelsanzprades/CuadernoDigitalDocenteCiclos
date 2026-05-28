"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSession } from "next-auth/react";
import { useUsers, useAdminModules, useAssignments, saveAssignments } from "@/hooks/useApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserCog, Save, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AsignacionesPage() {
  const { data: session, status } = useSession();
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  const { data: modulesData, isLoading: loadingModules } = useAdminModules();
  const { data: assignmentsData, mutate: mutateAssignments } = useAssignments();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [localAssignments, setLocalAssignments] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const users = usersData || [];
  const modules = modulesData || [];
  const assignments = assignmentsData || {};

  const isSuperadmin = session?.user && (session.user as any).roles === "Superadmin";

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setLocalAssignments(assignments[userId] || []);
    setSuccessMsg("");
  };

  const handleToggleModule = (moduleId: number) => {
    setLocalAssignments(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setIsSaving(true);
    try {
      await saveAssignments(selectedUserId, localAssignments);
      await mutateAssignments();
      setSuccessMsg("Asignaciones guardadas correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || loadingUsers || loadingModules) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center text-foreground">
        Cargando Panel de Administración...
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <div className="flex-1 p-8 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md border-red-500/30 bg-red-500/5">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Acceso Restringido</h2>
              <p className="text-muted">Esta página es exclusiva para Superadministradores y equipos directivos.</p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const selectedUser = users.find((u: any) => u.id === parseInt(selectedUserId || "0") || u.id === selectedUserId);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <UserCog className="w-10 h-10 text-accent" />
              Asignación de Módulos
            </h1>
            <p className="text-muted mt-2 text-lg">
              Selecciona un profesor y asínale los módulos que va a impartir este curso.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lista de Profesores */}
            <Card className="p-4 lg:w-1/3 border-accent/20 bg-foreground/10">
              <h3 className="text-lg font-bold text-foreground mb-4 px-2">Profesores</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {users.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${selectedUserId == u.id ? 'bg-accent/20 border border-accent/50 text-foreground' : 'bg-foreground/5 border border-transparent text-foreground/80 hover:bg-foreground/10'}`}
                  >
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-muted mt-1">{u.email}</div>
                    <div className="text-xs text-accent mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {(assignments[u.id] || []).length} módulos asignados
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Panel de Asignaciones */}
            <Card className="p-6 lg:w-2/3 border-white/5 bg-foreground/10 flex flex-col">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center text-muted">
                  Selecciona un profesor a la izquierda para gestionar sus módulos
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6 border-b border-[var(--glass-border)] pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
                      <p className="text-sm text-muted">{selectedUser.email}</p>
                    </div>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Guardando..." : "Guardar Asignaciones"}
                    </Button>
                  </div>
                  
                  {successMsg && (
                    <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-6 border border-green-500/30 flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-5 h-5" />
                      {successMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                    {modules.map((m: any) => {
                      const isAssigned = localAssignments.includes(m.id);
                      return (
                        <div 
                          key={m.id}
                          onClick={() => handleToggleModule(m.id)}
                          className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 ${isAssigned ? 'bg-accent/10 border-accent/50' : 'bg-foreground/5 border-white/5 hover:bg-foreground/10'}`}
                        >
                          <div className={`mt-1 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border ${isAssigned ? 'bg-accent border-accent text-black' : 'border-gray-500'}`}>
                            {isAssigned && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${isAssigned ? 'text-foreground' : 'text-foreground/80'}`}>
                              {m.code}
                            </div>
                            <div className={`text-xs mt-1 ${isAssigned ? 'text-foreground/90' : 'text-muted'}`}>
                              {m.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
