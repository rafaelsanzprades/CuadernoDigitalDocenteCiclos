"use client";

import React, { useState } from "react";
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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signIn, signOut, useSession } from "next-auth/react";

export function AccesoUsuariosTab() {
  const [activeTab, setActiveTab] = useState<"roles" | "arquitectura">("roles");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      description: "Configuración integral del centro. Define el calendario, crea departamentos, importa alumnadodo y gestiona asignaciones del profesorado.",
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
      scope: "Grupo/Alumnadodo + Curso Académico",
      description: "El docente en la 'trinchera'. Gestiona los planes formativos y evalúa junto con el instructor de la empresa.",
      color: "border-orange-500/30 bg-orange-500/10"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: "Profesorado",
      scope: "Módulo + Grupo + Curso Académico",
      description: "Rol base en el aula. Accede exclusivamente a sus cuadernos docentes para calificar a sus alumnadodo.",
      color: "border-indigo-500/30 bg-indigo-500/10"
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-green-400" />,
      title: "Alumnadodo",
      scope: "Matrícula (N Módulos + N FEOE)",
      description: "Acceso como estudiante para consultar sus calificaciones por Resultados de Aprendizaje, horarios, y seguimiento Dual.",
      color: "border-green-500/30 bg-green-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[1.1rem] font-bold text-foreground tracking-tight flex items-center gap-3">🛡️ Acceso usuarios</h2>
        <p className="text-muted mt-2">
          Sistema de Roles Basado en Contextos (RBAC). Los permisos no son estáticos, dependen del contexto geográfico, organizativo y temporal.
        </p>
      </div>

      {status === "unauthenticated" ? (
        <Card className="max-w-md mx-auto p-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 text-center py-2 text-lg font-bold border-b-2 transition-all ${isLoginMode ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground/90'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 text-center py-2 text-lg font-bold border-b-2 transition-all ${!isLoginMode ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground/90'}`}
            >
              Registro
            </button>
          </div>

          <div className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Nombre Completo</label>
                <Input type="text" placeholder="Tu nombre" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Correo Electrónico</label>
              <Input type="email" placeholder="usuario@educa.aragon.es" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Contraseña</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <Button 
              onClick={() => signIn('credentials', { email, password, callbackUrl: '/' })}
              className="w-full mt-6"
            >
              {isLoginMode ? 'Acceder' : 'Crear Cuenta'}
            </Button>

            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-[var(--glass-border)]"></div>
              <span className="flex-shrink-0 mx-4 text-muted text-sm">o continuar con</span>
              <div className="flex-grow border-t border-[var(--glass-border)]"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="ghost" onClick={() => signIn('google')} className="flex items-center justify-center gap-2 border border-[var(--glass-border)]">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-medium text-foreground/90">Google</span>
              </Button>
              <Button variant="ghost" onClick={() => signIn('microsoft')} className="flex items-center justify-center gap-2 border border-[var(--glass-border)]">
                <img src="https://www.svgrepo.com/show/475667/microsoft-color.svg" alt="Microsoft" className="w-5 h-5" />
                <span className="text-sm font-medium text-foreground/90">Microsoft</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : status === "loading" ? (
        <div className="text-center text-muted py-12">Verificando sesión...</div>
      ) : (
        <Card className="max-w-3xl mx-auto p-6 flex items-center justify-between animate-in fade-in duration-500 border-l-4 border-accent shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold border border-accent/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Sesión Iniciada</h3>
              <p className="text-sm text-muted">Autenticado como {session?.user?.email}</p>
            </div>
          </div>
          <Button 
            variant="danger"
            onClick={() => signOut()}
            className="px-6"
          >
            <span>Cerrar Sesión</span>
          </Button>
        </Card>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant={activeTab === 'roles' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab("roles")}
          className="rounded-full px-6"
        >
          Catálogo de perfiles
        </Button>
        <Button 
          variant={activeTab === 'arquitectura' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab("arquitectura")}
          className="rounded-full px-6 flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Modelo relacional
        </Button>
      </div>

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {roles.map((role, idx) => (
            <Card key={idx} className={`p-6 border-t-4 ${role.color.split(' ')[0]} hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${role.color.split(' ')[1]}`}>
                  {role.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-foreground/5 border border-[var(--glass-border)] text-xs font-mono text-muted mb-4">
                Contexto: {role.scope}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {role.description}
              </p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "arquitectura" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8">
            <h2 className="text-[1.1rem] font-bold mb-6 flex items-center gap-3">
              <Database className="w-6 h-6 text-accent" />
              Efecto Cascada y Relaciones
            </h2>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              El diseño relacional garantiza que cualquier cambio estructural a nivel superior (Centro) se propague automáticamente hacia abajo. Esto se logra mediante llaves foráneas (`Foreign Keys`) estrictas.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-xl border border-[var(--glass-border)]">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Building2 className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-300">Nivel Centro (COFOTAP modifica Calendario)</h4>
                  <p className="text-sm text-muted">Si se altera el calendario escolar, los días lectivos se recalculan automáticamente en la tabla <code className="text-accent bg-foreground/15 px-1 rounded">AcademicCalendar</code> asociada al Centro.</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted hidden md:block" />
              </div>

              <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-xl border border-[var(--glass-border)] ml-0 md:ml-8">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-indigo-300">Nivel Módulo (Profesorado)</h4>
                  <p className="text-sm text-muted">El Cuaderno Digital Docente (<code className="text-accent bg-foreground/15 px-1 rounded">Module</code>) recalcula instantáneamente las horas disponibles para impartir los RAs, ya que su cálculo depende del calendario del centro.</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted hidden md:block" />
              </div>

              <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-xl border border-[var(--glass-border)] ml-0 md:ml-16">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg"><GraduationCap className="w-6 h-6" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-300">Nivel Alumnadodo (Estudiante matriculado)</h4>
                  <p className="text-sm text-muted">Sus fechas de evaluación y períodos de FEOE (<code className="text-accent bg-foreground/15 px-1 rounded">Enrollment</code>) se ajustan para reflejar los nuevos festivos, sin que el Tutor Dual tenga que reconfigurar uno por uno.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-l-4 border-l-accent">
              <h3 className="text-lg font-bold mb-4">Entidades Clave en BBDD (SQLAlchemy)</h3>
              <ul className="space-y-3 text-sm text-foreground/80">
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
                  <span>Enlaza Alumnadodo ↔ Módulo ↔ Grupo (Matrícula)</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span className="font-mono text-accent">DualAgreement</span>
                  <span>Enlaza Alumnadodo ↔ Empresa ↔ Tutor ↔ FEOE</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/5 to-transparent border border-accent/20">
              <h3 className="text-lg font-bold mb-4 text-accent">Integración de Alumnadodo</h3>
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                El Alumnadodo requiere su propia tabla o flag en la tabla `User` (ej: <code className="bg-foreground/15 px-1 text-foreground">is_student=True</code>). 
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                A través de la entidad <strong>Matrícula (Enrollment)</strong>, un alumnadodo se vincula a N Módulos. Esto le da acceso a su propio dashboard ("Mi Cuaderno") donde ve el progreso de sus RA, su horario, y sus anexos de FP Dual, todo sincronizado con lo que introducen sus N profesores.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
