"use client";
import { Scale, Shield, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState("aviso");

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Legal" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-8 pb-12">
            
            {/* Header Title */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Scale className="w-[1.2em] h-[1.2em] mr-1 text-accent" /> Legal
              </h1>
              <p className="text-muted mt-2 text-lg">
                Aviso legal, privacidad, licencia y términos de uso.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 max-w-full">
                <TabsTrigger value="aviso">Aviso legal</TabsTrigger>
                <TabsTrigger value="licencia">Licencia y términos</TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "aviso" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* Aviso Legal - Edge to edge, no cards/borders */}
                <div className="space-y-4">
                  <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">1. Aviso Legal</h2>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos del titular:
                  </p>
                  <div className="text-sm text-muted space-y-1 mt-2">
                    <p><strong>Titular:</strong> Rafael Sanz Prades</p>
                    <p><strong>Contacto:</strong> <a href="mailto:rafaelsanzprades@gmail.com" className="text-info hover:underline">rafaelsanzprades@gmail.com</a></p>
                    <p><strong>Sitio Web:</strong> <a href="https://cuadernofp.web.app/" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">https://cuadernofp.web.app/</a></p>
                    <p><strong>Actividad:</strong> Herramienta de productividad docente para ciclos formativos.</p>
                  </div>
                </div>

                {/* Política de Privacidad & RGPD */}
                <div className="space-y-6">
                  <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">2. Política de Privacidad y RGPD</h2>
                  
                  <div className="flex items-start gap-3 mb-6">
                    <span className="text-success mt-1"><Shield className="w-5 h-5" /></span>
                    <div>
                      <strong className="block mb-1 text-foreground">Modelo de Privacidad Local-First</strong>
                      <span className="text-sm text-foreground/80">Esta aplicación ha sido diseñada bajo el principio de <strong>privacidad absoluta</strong>. Los datos personales de tus alumnado (nombres, calificaciones, tutorías) no se envían, transmiten ni almacenan en ningún servidor ajeno al control del docente.</span>
                    </div>
                  </div>

                  <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">Responsable del Tratamiento de Datos (RGPD)</h3>
                      <p>
                        Dado que la aplicación web es estática y el procesamiento de datos se realiza de manera interna en tu navegador web:
                      </p>
                      <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-muted">
                        <li>El <strong>Docente</strong> o su <strong>Centro Educativo</strong> actúa como el único <strong>Responsable del Tratamiento</strong> de los datos personales de los alumnado.</li>
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
                </div>

                {/* Política de Cookies */}
                <div className="space-y-4">
                  <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">3. Política de Cookies y Almacenamiento Local</h2>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Esta aplicación web no utiliza cookies de rastreo, publicidad ni analíticas de terceros.
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Únicamente se utiliza el almacenamiento local del navegador (<code>localStorage</code> e <code>IndexedDB</code>) para guardar las preferencias visuales del usuario (como el tema oscuro o el curso seleccionado en pantalla) y garantizar una navegación óptima. Estas tecnologías no recopilan datos personales de navegación.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "licencia" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="space-y-4 pb-4">
                  <p className="text-foreground/80 text-base">
                    Filosofía abierta, gratuita y accesible para el profesorado de Formación Profesional.
                  </p>
                  <a 
                    href="https://github.com/rafaelsanzprades/CuadernoFP/blob/main/LICENSE.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-info hover:underline text-sm font-medium"
                  >
                    Verificar licencia original en GitHub
                    <ExternalLink className="ml-1 w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-10">
                  <section className="space-y-4">
                    <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">1. Código Fuente (Software)</h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      El código fuente de esta aplicación web es de código abierto. Se distribuye bajo los términos de la <strong>Licencia Pública General de GNU versión 3 (GNU GPLv3)</strong>.
                    </p>
                    <div className="space-y-2 mt-4 text-sm text-foreground/80">
                      <h3 className="font-semibold text-foreground">¿Qué implica esto?</h3>
                      <ul className="list-disc list-inside text-muted space-y-1 ml-2">
                        <li><strong>Usar</strong> y ejecutar la aplicación para cualquier propósito, incluido su uso en cualquier centro educativo.</li>
                        <li><strong>Estudiar</strong> cómo funciona el código y modificarlo para adaptarlo a tus necesidades específicas.</li>
                        <li><strong>Distribuir</strong> copias del código original o de tus versiones modificadas.</li>
                      </ul>
                    </div>
                    <div className="mt-6 flex gap-3 text-sm">
                      <span className="text-info mt-1"><ShieldCheck className="w-5 h-5" /></span>
                      <div>
                        <strong className="block text-foreground mb-1">Condición obligatoria (Copyleft): Compartir Igual</strong>
                        <p className="text-foreground/80">
                          Si modificas este código y publicas o distribuyes una nueva versión basada en él, <strong>estás obligado/a a publicar esa nueva versión bajo esta misma licencia libre (GNU GPLv3)</strong> y facilitar su código fuente. Esto garantiza que el proyecto y sus futuras mejoras pertenezcan siempre a la comunidad y evita que una empresa pueda apropiarse del código para convertirlo en un producto de pago (privativo).
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">2. Contenido, Interfaz y Materiales Didácticos</h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Todos los textos, guías explicativas, estructura visual de la interfaz, logotipos y materiales de ayuda incluidos en esta web están protegidos bajo una licencia <strong>Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)</strong>.
                    </p>
                    <div className="space-y-2 mt-4 text-sm text-foreground/80">
                      <h3 className="font-semibold text-foreground">Resumen amigable de la licencia CC BY-NC-SA:</h3>
                      <ul className="list-disc list-inside text-muted space-y-1 ml-2">
                        <li><strong>Atribución (BY):</strong> Debes reconocer adecuadamente la autoría original del proyecto (Rafael Sanz Prades), proporcionar un enlace a la licencia e indicar si se han realizado cambios.</li>
                        <li><strong>No Comercial (NC):</strong> No puedes utilizar este material, la interfaz, ni sus derivados, con fines comerciales o lucrativos.</li>
                        <li><strong>Compartir Igual (SA):</strong> Si remezclas, transformas o creas a partir de este material, debes distribuir tus contribuciones bajo la misma licencia que el original.</li>
                      </ul>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-[1.1rem] font-bold text-foreground border-b border-[var(--glass-border)] pb-2">3. Resumen Práctico para el Profesorado</h2>
                    <div className="mt-4">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-foreground/90 border-b border-[var(--glass-border)]">
                          <tr>
                            <th className="py-3 font-semibold w-1/2 pr-4">Lo que SÍ PUEDES hacer</th>
                            <th className="py-3 font-semibold w-1/2 pl-4">Lo que NO PUEDES hacer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glass-border)] text-foreground/80">
                          <tr>
                            <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Usar la web de forma gratuita con tu alumnado y módulos en tu día a día.</td>
                            <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Vender el acceso a esta plataforma o a sus derivados a terceros.</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Sugerir mejoras o adaptar el código de forma local para tu centro educativo.</td>
                            <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Apropiarte del trabajo, cerrar su código o eliminar la autoría original.</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Compartir la herramienta con el resto del profesorado.</td>
                            <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Utilizar el diseño visual, el código o los textos para crear productos de pago.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* Back Link */}
            <div className="text-center pt-8 border-t border-[var(--glass-border)] mt-12">
              <Link href="/" className="text-sm text-info hover:text-info font-semibold underline">
                Volver al Inicio
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
