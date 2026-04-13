import { Smartphone, ShieldAlert } from "lucide-react";

interface MobileBlockProps {
  message?: string;
}

export function MobileBlock({ message }: MobileBlockProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/30 mb-6">
          <Smartphone className="w-10 h-10 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Acceso restringido
        </h1>

        <p className="text-slate-400 mb-6">
          {message ||
            "Este módulo de inventario solo está disponible en dispositivos móviles"}
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Usa tu celular o tablet</span>
        </div>
      </div>
    </div>
  );
}
