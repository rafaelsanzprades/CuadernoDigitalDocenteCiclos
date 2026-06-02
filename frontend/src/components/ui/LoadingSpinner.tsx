export function LoadingSpinner({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[var(--glass-border)] border-t-accent rounded-full animate-spin" />
        <p className="text-lg text-muted animate-pulse">{text}</p>
      </div>
    </div>
  );
}
