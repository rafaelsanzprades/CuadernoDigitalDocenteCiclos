"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Shield, 
  Building2, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Briefcase, 
  School,
  Database,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "arquitectura">("roles");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoggedIn, login, logout } = useAppStore();

  const roles = [
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: "Superadmin",
      scope: "Global (Plataforma completa)",
      description: "Control absoluto. Gestiona tablas maestras (CCAA, Familias Profesionales, Currículos) y licencias de centros.",
      color: "border-purple-500/30 bg-purple-500/10"
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      title: "Admin de Centro (COFOTAP)",
      scope: "Centro Educativo",
      description: "Configuración integral del centro. Define el calendario, crea departamentos, importa alumnado y gestiona asignaciones del profesorado.",
      color: "border-blue-500/30 bg-blue-500/10"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      title: "Jefe de Estudios",
      scope: "Centro Educativo + Curso Académico",
      description: "Visión global académica. Supervisa todos los equipos docentes, horarios, y actas del curso actual o históricos.",
      color: "border-emerald-500/30 bg-emerald-500/10"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-amber-400" />,
      title: "Tutor Dual Coordinador",
      scope: "Centro Educativo + Curso Académico",
      description: "Visión global de la Dual en el centro. Supervisa convenios, normativas y coordina la estrategia FP Dual con Jefatura.",
      color: "border-amber-500/30 bg-amber-500/10"
    },
    {
      icon: <School className="w-6 h-6 text-cyan-400" />,
      title: "Jefe de Dpto. Didáctico",
      scope: "Departamento + Curso Académico",
      description: "Coordina a los profesores de un departamento concreto. Accede a las programaciones de su área.",
      color: "border-cyan-500/30 bg-cyan-500/10"
    },
    {
      icon: <Briefcase className="w-6 h-6 text-yellow-500" />,
      title: "Tutor Dual General",
      scope: "Centro (o Familia Prof.) + Curso Acad.",
      description: "Prospector de empresas. Tiene acceso transversal a todas las horas FEOE de los módulos dualizados para negociar convenios.",
      color: "border-yellow-500/30 bg-yellow-500/10"
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: "Tutor de Grupo",
      scope: "Grupo + Curso Académico",
      description: "Gestiona un grupo concreto (ej. 1º DAW). Centraliza notas, actas de evaluación y coordinación de su equipo docente.",
      color: "border-pink-500/30 bg-pink-500/10"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-orange-400" />,
      title: "Tutor Dual (Seguimiento)",
      scope: "Grupo/Alumno + Curso Académico",
      description: "El docente en la 'trinchera'. Gestiona los planes formativos y evalúa junto con el instructor de la empresa.",
      color: "border-orange-500/30 bg-orange-500/10"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: "Profesorado",
      scope: "Módulo + Grupo + Curso Académico",
      description: "Rol base en el aula. Accede exclusivamente a sus cuadernos docentes para calificar a sus alumnos.",
      color: "border-indigo-500/30 bg-indigo-500/10"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-green-400" />,
      title: "Alumnado",
      scope: "Matrícula (N Módulos + N FEOE)",
      description: "Acceso como estudiante para consultar sus calificaciones por Resultados de Aprendizaje, horarios, y seguimiento Dual.",
      color: "border-green-500/30 bg-green-500/10"
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="min-h-screen p-8 w-full space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">🛡️ Acceso usuarios</h1>
            <p className="text-gray-400">
              Sistema de Roles Basado en Contextos (RBAC). Los permisos no son estáticos, dependen del contexto geográfico, organizativo y temporal.
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="max-w-md mx-auto glass-card p-8 animate-in fade-in slide-in-from-top-4 duration-500 mb-12 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 text-center py-2 text-lg font-bold border-b-2 transition-all ${isLoginMode ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 text-center py-2 text-lg font-bold border-b-2 transition-all ${!isLoginMode ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  Registro
                </button>
              </div>

              <div className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors" placeholder="Tu nombre" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors" placeholder="usuario@educa.aragon.es" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent transition-colors" placeholder="••••••••" />
                </div>

                <button 
                  onClick={() => login()}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_4px_15px_rgba(20,160,133,0.3)] mt-6"
                >
                  {isLoginMode ? 'Acceder' : 'Crear Cuenta'}
                </button>

                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">o continuar con</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => login()} className="flex items-center justify-center gap-2 glass-button py-2.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-200">Google</span>
                  </button>
                  <button onClick={() => login()} className="flex items-center justify-center gap-2 glass-button py-2.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                    <img src="https://www.svgrepo.com/show/475667/microsoft-color.svg" alt="Microsoft" className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-200">Microsoft</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto glass-card p-6 flex items-center justify-between mb-12 animate-in fade-in duration-500 border-l-4 border-accent shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold border border-accent/30">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sesión Iniciada</h3>
                  <p className="text-sm text-gray-400">Autenticado correctamente en el sistema</p>
                </div>
              </div>
              <button 
                onClick={() => logout()}
                className="glass-button px-6 py-2.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all font-semibold flex items-center gap-2"
              >
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}

      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("roles")}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'roles' ? 'bg-accent/20 border-accent/50 text-accent border' : 'glass-button text-muted'}`}
        >
          Catálogo de Perfiles
        </button>
        <button 
          onClick={() => setActiveTab("arquitectura")}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'arquitectura' ? 'bg-accent/20 border-accent/50 text-accent border' : 'glass-button text-muted'}`}
        >
          <Database className="w-4 h-4" />
          Modelo Relacional
        </button>
      </div>

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {roles.map((role, idx) => (
            <div key={idx} className={`glass-card p-6 border-t-4 ${role.color.split(' ')[0]} hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${role.color.split(' ')[1]}`}>
                  {role.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted mb-4">
                Contexto: {role.scope}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "arquitectura" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Cascade Explanation */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-accent" />
              Efecto Cascada y Relaciones
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              El diseño relacional garantiza que cualquier cambio estructural a nivel superior (Centro) se propague automáticamente hacia abajo. Esto se logra mediante llaves foráneas (`Foreign Keys`) estrictas.
            </p>

            <div className="space-y-6">
              
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Building2 className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-300">Nivel Centro (COFOTAP modifica Calendario)</h4>
                  <p className="text-sm text-gray-400">Si se altera el calendario escolar, los días lectivos se recalculan automáticamente en la tabla <code className="text-accent bg-black/30 px-1 rounded">AcademicCalendar</code> asociada al Centro.</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-500 hidden md:block" />
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 ml-0 md:ml-8">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-300">Nivel Módulo (Profesorado)</h4>
                  <p className="text-sm text-gray-400">El Cuaderno Digital Docente (<code className="text-accent bg-black/30 px-1 rounded">Module</code>) recalcula instantáneamente las horas disponibles para impartir los RAs, ya que su cálculo depende del calendario del centro.</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-500 hidden md:block" />
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 ml-0 md:ml-16">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg"><GraduationCap className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-300">Nivel Alumnado (Estudiante matriculado)</h4>
                  <p className="text-sm text-gray-400">Sus fechas de evaluación y períodos de FEOE (<code className="text-accent bg-black/30 px-1 rounded">Enrollment</code>) se ajustan para reflejar los nuevos festivos, sin que el Tutor Dual tenga que reconfigurar uno por uno.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Database Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-accent">
              <h3 className="text-lg font-bold mb-4">Entidades Clave en BBDD (SQLAlchemy)</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-mono text-accent">CenterStaff</span>
                  <span>Enlaza User ↔ Center (Roles COFOTAP)</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-mono text-accent">TeachingAssignment</span>
                  <span>Enlaza Profesor ↔ Módulo ↔ Grupo ↔ Curso</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-mono text-accent">Enrollment</span>
                  <span>Enlaza Alumno ↔ Módulo ↔ Grupo (Matrícula)</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span className="font-mono text-accent">DualAgreement</span>
                  <span>Enlaza Alumno ↔ Empresa ↔ Tutor ↔ FEOE</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-6 bg-gradient-to-br from-accent/5 to-transparent border border-accent/20">
              <h3 className="text-lg font-bold mb-4 text-accent">Integración de Alumnado</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                El Alumno requiere su propia tabla o flag en la tabla `User` (ej: <code className="bg-black/30 px-1 text-white">is_student=True</code>). 
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                A través de la entidad <strong>Matrícula (Enrollment)</strong>, un alumno se vincula a N Módulos. Esto le da acceso a su propio dashboard ("Mi Cuaderno") donde ve el progreso de sus RA, su horario, y sus anexos de FP Dual, todo sincronizado con lo que introducen sus N profesores.
              </p>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </main>
    </div>
  );
}
