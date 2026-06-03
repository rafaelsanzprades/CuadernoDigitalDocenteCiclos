"use client";

import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function LegalNoticePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Aviso Legal" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="max-w-4xl mx-auto space-y-8 pb-12">
            
            {/* Header Title */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight">
                ⚖️ Información Legal y Privacidad
              </h1>
              <p className="text-muted mt-2 text-lg">
                Cumplimiento del RGPD, condiciones de uso y protección de datos.
              </p>
            </div>

            {/* Aviso Legal */}
            <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. Aviso Legal</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos del titular:
              </p>
              <div className="text-xs text-muted space-y-1 bg-background/40 p-4 rounded-xl border border-white/5 font-mono">
                <p><strong>Titular:</strong> Rafael Sanz Prades</p>
                <p><strong>Contacto:</strong> [Tu Correo de Contacto]</p>
                <p><strong>Sitio Web:</strong> [Tu URL de Producción]</p>
                <p><strong>Actividad:</strong> Herramienta de productividad docente para ciclos formativos.</p>
              </div>
            </Card>

            {/* Política de Privacidad & RGPD */}
            <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">2. Política de Privacidad y RGPD</h2>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-start gap-3">
                <span className="text-lg">🛡️</span>
                <div>
                  <strong className="block mb-1">Modelo de Privacidad Local-First</strong>
                  Esta aplicación ha sido diseñada bajo el principio de <strong>privacidad absoluta</strong>. Los datos personales de tus alumnos (nombres, calificaciones, tutorías) no se envían, transmiten ni almacenan en ningún servidor ajeno al control del docente.
                </div>
              </div>

              <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Responsable del Tratamiento de Datos (RGPD)</h3>
                  <p>
                    Dado que la aplicación web es estática y el procesamiento de datos se realiza de manera interna en tu navegador web:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-muted">
                    <li>El <strong>Docente</strong> o su <strong>Centro Educativo</strong> actúa como el único <strong>Responsable del Tratamiento</strong> de los datos personales de los alumnos.</li>
                    <li>El desarrollador de esta herramienta (Rafael Sanz Prades) <strong>no actúa como Encargado del Tratamiento</strong>, ya que carece de acceso técnico a los datos introducidos en la aplicación.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">¿Dónde se guardan los datos?</h3>
                  <p>
                    Los datos se almacenan exclusivamente en las ubicaciones que el docente determine de forma privada:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-muted">
                    <li>En el disco duro local, dispositivo USB externo o pendrive del usuario (en formato de archivo cifrado o texto plano).</li>
                    <li>En la nube privada corporativa del docente (Google Drive o Microsoft OneDrive), bajo su cuenta institucional regulada por la Consejería de Educación o Centro Educativo correspondiente.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">Seguridad</h3>
                  <p>
                    Es responsabilidad del docente custodiar de manera segura el archivo de base de datos generado y el acceso a su cuenta personal de Google/Microsoft. Se recomienda proteger el ordenador y dispositivo de almacenamiento con contraseñas seguras y bloqueos automáticos.
                  </p>
                </div>
              </div>
            </Card>

            {/* Política de Cookies */}
            <Card className="p-8 border border-white/5 rounded-2xl bg-foreground/5 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Política de Cookies y Almacenamiento Local</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Esta aplicación web no utiliza cookies de rastreo, publicidad ni analíticas de terceros.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Únicamente se utiliza el almacenamiento local del navegador (<code>localStorage</code> e <code>IndexedDB</code>) para guardar las preferencias visuales del usuario (como el tema oscuro o el curso seleccionado en pantalla) y garantizar una navegación óptima. Estas tecnologías no recopilan datos personales de navegación.
              </p>
            </Card>

            {/* Back Link */}
            <div className="text-center">
              <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 font-semibold underline">
                Volver al Inicio
              </Link>
            </div>

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
