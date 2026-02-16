export default function LoadingScreen() {
  return (
    <div className="concrete-texture min-h-screen bg-background relative flex flex-col items-center justify-center">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pulsing logo */}
        <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
          FRESHR
        </span>

        {/* Spinner */}
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-accent animate-spin" />
      </div>
    </div>
  );
}
