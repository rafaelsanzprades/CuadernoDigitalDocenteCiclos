"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { UserPlus, Search, Filter, MoreVertical, Edit2, Shield, Trash2, CheckCircle2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type RoleTag = {
  type: string;
  context: string;
  colorClass: string;
};

type UserData = {
  id: number;
  name: string;
  email: string;
  centers: string[];
  roles: RoleTag[];
  status: "active" | "inactive";
};

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("Todos los centros");
  const [dbCenters, setDbCenters] = useState<{id: number, name: string}[]>([]);

  const [users, setUsers] = useState<UserData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserSurname, setNewUserSurname] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCenterId, setNewUserCenterId] = useState<number | "">("");
  const [newUserRole, setNewUserRole] = useState("Profesorado");

  const fetchUsers = () => {
    fetch("/api/users")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setUsers(json.data);
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetch("/api/centers")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setDbCenters(json.data);
        }
      })
      .catch(err => console.error("Error fetching centers:", err));
      
    fetchUsers();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserCenterId || !newUserName || !newUserSurname || !newUserEmail) return;
    
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUserName,
        surname: newUserSurname,
        email: newUserEmail,
        centers: [Number(newUserCenterId)],
        roles: [newUserRole]
      })
    })
    .then(res => res.json())
    .then(json => {
      if(json.status === "success") {
        setIsModalOpen(false);
        setNewUserName("");
        setNewUserSurname("");
        setNewUserEmail("");
        fetchUsers();
      }
    });
  };

  const filteredUsers = users.filter(u => 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCenter === "Todos los centros" || u.centers.includes(selectedCenter))
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span className="text-3xl">👥</span> Gestión de usuarios
                </h1>
                <p className="text-muted mt-2 text-lg">Administra el claustro, asigna perfiles RBAC y define los contextos de actuación de cada docente.</p>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="py-3 px-6 shadow-lg shadow-accent/10"
              >
                <UserPlus className="w-5 h-5" />
                <span>Añadir Profesorado</span>
              </Button>
            </div>

            {/* Filtros */}
            <Card className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5 z-10" />
                <Input 
                  type="text" 
                  placeholder="Buscar por nombre o email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[250px]">
                <Filter className="text-muted w-5 h-5" />
                <select 
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option>Todos los centros</option>
                  {dbCenters.length > 0 ? (
                    dbCenters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                  ) : (
                    <>
                      <option>IES Fray Luis de León</option>
                      <option>Centro San Valero</option>
                    </>
                  )}
                </select>
              </div>
            </Card>

            {/* Tabla de Usuarios */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-foreground/5 border-b border-[var(--glass-border)] text-sm text-muted">
                      <th className="p-4 font-semibold">Profesorado</th>
                      <th className="p-4 font-semibold">Centro Asignado</th>
                      <th className="p-4 font-semibold">Perfiles y Contextos (RBAC)</th>
                      <th className="p-4 font-semibold text-center">Estado</th>
                      <th className="p-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.05] transition-all duration-200 group hover:scale-[1.005] hover:shadow-lg relative">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-foreground font-bold shadow-inner border border-[var(--glass-border)]">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{user.name}</div>
                              <div className="text-xs text-muted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {user.centers.map((c, i) => (
                              <span key={i} className="text-sm text-foreground/80 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role, i) => (
                              <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${role.colorClass}`}>
                                <Shield className="w-3 h-3" />
                                <span>{role.type}</span>
                                <span className="opacity-50">|</span>
                                <span className="opacity-80">{role.context}</span>
                              </div>
                            ))}
                            <button className="w-7 h-7 rounded-md border border-dashed border-[var(--glass-border)] text-muted hover:text-foreground hover:border-white/50 flex items-center justify-center transition-colors">
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {user.status === 'active' && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-colors" title="Editar Perfiles">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-muted hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors" title="Dar de baja">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted">
                          No se han encontrado usuarios con esos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>
      </main>

      {/* Slide-over Nuevo Profesorado */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer" 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-[var(--glass-border)] shadow-2xl flex flex-col"
            >
              <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                Añadir Profesorado
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Nombre</label>
                  <Input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Apellidos</label>
                  <Input type="text" required value={newUserSurname} onChange={e => setNewUserSurname(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <Input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="profesorado@educa.aragon.es" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Centro educativo</label>
                <select required value={newUserCenterId} onChange={e => setNewUserCenterId(Number(e.target.value))} className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent">
                  <option value="" disabled>Selecciona un centro...</option>
                  {dbCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Roles y permisos</label>
                <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent">
                  <option value="Profesorado">Profesor/a</option>
                  <option value="Tutor Grupo">Tutor/a de Curso/Grupo</option>
                  <option value="Jefe Departamento">Jefe/a de Dpto. Didáctico</option>
                  <option value="Jefe Estudios">Jefe/a de Estudios</option>
                  <option value="COFOTAP">Administrador de Centro (COFOTAP)</option>
                  <option value="Tutor Dual Coordinador">Tutor/a Dual Coordinador</option>
                  <option value="Tutor Dual General">Tutor/a Dual General (Prospector Empresas)</option>
                  <option value="Tutor Dual Seguimiento">Tutor/a Dual (Seguimiento alumnado)</option>
                  <option value="Superadmin">Superadmin Plataforma</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 mt-6 border-t border-[var(--glass-border)]">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 hover:bg-foreground/5 mt-4">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 shadow-lg shadow-accent/20 mt-4">
                  Guardar Profesorado
                </Button>
              </div>
            </form>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
