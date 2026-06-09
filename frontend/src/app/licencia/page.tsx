import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export default function LicenciaPage() {
  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Licencia y Términos" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-8 pb-12">
            
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center text-info">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground">Licencia y Términos de Uso</h1>
              <p className="text-muted text-lg max-w-2xl">
                Filosofía abierta, gratuita y accesible para el profesorado de Formación Profesional.
              </p>
              
              <a 
                href="https://github.com/rafaelsanzprades/CuadernoCiclosFP/blob/main/LICENSE.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                Verificar licencia original en GitHub
                <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">1. Código Fuente (Software)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  El código fuente de esta aplicación web es de código abierto. Se distribuye bajo los términos de la <strong>Licencia Pública General de GNU versión 3 (GNU GPLv3)</strong>.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">¿Qué implica esto?</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li><strong>Usar</strong> y ejecutar la aplicación para cualquier propósito, incluido su uso en cualquier centro educativo.</li>
                    <li><strong>Estudiar</strong> cómo funciona el código y modificarlo para adaptarlo a tus necesidades específicas.</li>
                    <li><strong>Distribuir</strong> copias del código original o de tus versiones modificadas.</li>
                  </ul>
                </div>
                <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-info mb-2">Condición obligatoria (Copyleft):</h3>
                  <p className="text-sm text-info/90">
                    <strong>Compartir Igual:</strong> Si modificas este código y publicas o distribuyes una nueva versión basada en él, <strong>estás obligado/a a publicar esa nueva versión bajo esta misma licencia libre (GNU GPLv3)</strong> y facilitar su código fuente. Esto garantiza que el proyecto y sus futuras mejoras pertenezcan siempre a la comunidad y evita que una empresa pueda apropiarse del código para convertirlo en un producto de pago (privativo).
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">2. Contenido, Interfaz y Materiales Didácticos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Todos los textos, guías explicativas, estructura visual de la interfaz, logotipos y materiales de ayuda incluidos en esta web están protegidos bajo una licencia <strong>Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)</strong>.
                </p>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Resumen amigable de la licencia CC BY-NC-SA:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li><strong>Atribución (BY):</strong> Debes reconocer adecuadamente la autoría original del proyecto (Rafael Sanz Prades), proporcionar un enlace a la licencia e indicar si se han realizado cambios.</li>
                    <li><strong>No Comercial (NC):</strong> No puedes utilizar este material, la interfaz, ni sus derivados, con fines comerciales o lucrativos.</li>
                    <li><strong>Compartir Igual (SA):</strong> Si remezclas, transformas o creas a partir de este material, debes distribuir tus contribuciones bajo la misma licencia que el original.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">3. Resumen Práctico para el Profesorado</h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold border-b border-border">Lo que SÍ PUEDES hacer</th>
                        <th className="px-4 py-3 font-semibold border-b border-border">Lo que NO PUEDES hacer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-success">✔️ Usar la web de forma gratuita con tu alumnado y módulos en tu día a día.</td>
                        <td className="px-4 py-3 text-destructive">❌ Vender el acceso a esta plataforma o a sus derivados a terceros.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-success">✔️ Sugerir mejoras o adaptar el código de forma local para tu centro educativo.</td>
                        <td className="px-4 py-3 text-destructive">❌ Apropiarte del trabajo, cerrar su código o eliminar la autoría original.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-success">✔️ Compartir la herramienta con el resto del profesorado.</td>
                        <td className="px-4 py-3 text-destructive">❌ Utilizar el diseño visual, el código o los textos para crear productos de pago.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
