"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Cloud, CloudOff, Info, RefreshCw, XCircle, Key } from "lucide-react";
import toast from "react-hot-toast";
import { driveService } from "@/services/driveService";
import { Input } from "@/components/ui/Input";

export function GoogleDriveSyncPanel() {
  const { 
    isDriveConnected, driveUserEmail, autoSyncDrive, googleClientId,
    setDriveConnected, setDriveUserEmail, setAutoSyncDrive, setGoogleClientId
  } = useAppStore();

  const handleConnect = async () => {
    if (!googleClientId) {
      toast.error("Por favor, introduce tu Google Client ID primero.");
      return;
    }
    
    toast.loading("Conectando con Google Drive...", { id: "drive-connect" });
    const result = await driveService.login(googleClientId);
    
    if (result.success) {
      setDriveUserEmail(result.email || "Usuario de Drive");
      setDriveConnected(true);
      toast.success("Google Drive conectado correctamente", { id: "drive-connect" });
    } else {
      toast.error("Fallo al conectar con Google Drive", { id: "drive-connect" });
    }
  };

  const handleDisconnect = () => {
    driveService.logout();
    setDriveConnected(false);
    setDriveUserEmail(null);
    setAutoSyncDrive(false);
    toast("Desconectado de Google Drive", { icon: "👋" });
  };

  const toggleAutoSync = () => {
    if (!isDriveConnected) {
      toast.error("Debes conectar tu cuenta de Google Drive primero.");
      return;
    }
    const newVal = !autoSyncDrive;
    setAutoSyncDrive(newVal);
    if (newVal) {
      toast.success("Autoguardado en la nube activado.");
    } else {
      toast("Autoguardado en la nube desactivado.");
    }
  };

  return (
    <Card className="p-8 border border-[var(--glass-border)] rounded-2xl bg-foreground/5 shadow-lg relative overflow-hidden group max-w-3xl mx-auto">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Cloud className="w-32 h-32 text-info" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cloud className="w-6 h-6 text-info" /> Sincronización con Google Drive
          </h2>
          <p className="text-muted mt-2">
            Guarda tus archivos .cddp y .cddc automáticamente en la nube de Google para acceder a ellos desde cualquier dispositivo sin necesidad de descargarlos manualmente.
          </p>
        </div>

        {/* Estado de conexión */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isDriveConnected ? "bg-success/20 text-success" : "bg-muted/20 text-muted"}`}>
              {isDriveConnected ? <CheckCircle2 className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-bold text-foreground">
                {isDriveConnected ? "Conectado" : "No conectado"}
              </p>
              <p className="text-sm text-muted">
                {isDriveConnected ? `Sincronizando con ${driveUserEmail}` : "Inicia sesión con tu cuenta de Google"}
              </p>
            </div>
          </div>
          <div>
            {isDriveConnected ? (
              <Button onClick={handleDisconnect} variant="ghost" className="text-danger hover:bg-danger/10">
                Desconectar
              </Button>
            ) : (
              <Button onClick={handleConnect} className="bg-info/20 text-info hover:bg-info/30 border border-info/30">
                Conectar cuenta
              </Button>
            )}
          </div>
        </div>

        {/* Auto-sync Switch */}
        <div className={`p-5 rounded-xl border transition-colors ${autoSyncDrive ? "border-success/40 bg-success/5" : "border-[var(--glass-border)] bg-background/50"} flex items-center justify-between`}>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${autoSyncDrive ? "text-success animate-spin-slow" : "text-muted"}`} />
              Autoguardado Automático
            </h3>
            <p className="text-sm text-muted">
              Sube automáticamente a Drive cada vez que pulses "Guardar" en la app.
            </p>
          </div>
          <button
            onClick={toggleAutoSync}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${autoSyncDrive ? "bg-success" : "bg-muted/30"}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${autoSyncDrive ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>

        {/* Configuración de Client ID */}
        {!isDriveConnected && (
          <div className="flex flex-col gap-3 p-5 rounded-xl border bg-background/50 border-[var(--glass-border)]">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-info" /> Credenciales OAuth
            </h3>
            <p className="text-sm text-muted">
              Introduce el <strong>Client ID</strong> de tu proyecto de Google Cloud para autorizar la aplicación. Este dato se guarda en tu navegador de forma segura.
            </p>
            <Input
              type="password"
              placeholder="Ej: 123456789-abcde.apps.googleusercontent.com"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        )}

      </div>
    </Card>
  );
}
