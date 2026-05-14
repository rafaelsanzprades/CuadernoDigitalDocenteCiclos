"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { UserPlus, Search, Filter, MoreVertical, Edit2, Shield, Trash2, CheckCircle2, X } from "lucide-react";

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
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">👥</span> Gestión de Usuarios
                </h1>
                <p className="text-gray-400">Administra el claustro, asigna perfiles RBAC y define los contextos de actuación de cada docente.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="glass-button bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-accent/10">
                <UserPlus className="w-5 h-5" />
                <span>Añadir Profesorado</span>
              </button>
            </div>

            {/* Filtros */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[250px]">
                <Filter className="text-gray-500 w-5 h-5" />
                <select 
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
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
            </div>

            {/* Tabla de Usuarios */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-sm text-gray-400">
                      <th className="p-4 font-semibold">Profesorado</th>
                      <th className="p-4 font-semibold">Centro Asignado</th>
                      <th className="p-4 font-semibold">Perfiles y Contextos (RBAC)</th>
                      <th className="p-4 font-semibold text-center">Estado</th>
                      <th className="p-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow-inner border border-white/10">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {user.centers.map((c, i) => (
                              <span key={i} className="text-sm text-gray-300 flex items-center gap-1.5">
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
                            <button className="w-7 h-7 rounded-md border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 flex items-center justify-center transition-colors">
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
                            <button className="p-2 text-gray-400 hover:text-accent rounded-lg hover:bg-accent/10 transition-colors" title="Editar Perfiles">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors" title="Dar de baja">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No se han encontrado usuarios con esos filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal Nuevo Profesorado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                Añadir Profesorado
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nombre</label>
                  <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Apellidos</label>
                  <input type="text" required value={newUserSurname} onChange={e => setNewUserSurname(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent" placeholder="profesorado@educa.aragon.es" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Centro educativo</label>
                <select required value={newUserCenterId} onChange={e => setNewUserCenterId(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent">
                  <option value="" disabled>Selecciona un centro...</option>
                  {dbCenters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">Roles y permisos</label>
                <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent">
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

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
                  Guardar Profesorado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
