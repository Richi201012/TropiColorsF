import { ArrowUpRight, ArrowDownLeft, Clock, Package } from "lucide-react";

interface Movimiento {
  id: string;
  producto_id: string;
  nombre: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: any;
}

interface MovimientoListProps {
  movimientos: Movimiento[];
  limit?: number;
}

function formatDate(date: any): string {
  if (!date) return "Sin fecha";

  let dateObj: Date;

  if (date.toDate) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) return "Sin fecha";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return dateObj.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MovimientoList({
  movimientos,
  limit = 10,
}: MovimientoListProps) {
  const sortedMovimientos = [...movimientos]
    .sort((a, b) => {
      const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha || 0);
      const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);

  if (sortedMovimientos.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700/30">
        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">Sin movimientos recientes</p>
        <p className="text-slate-500 text-xs mt-1">
          Los registros aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedMovimientos.map((mov) => {
        const isEntrada = mov.tipo === "entrada";

        return (
          <div
            key={mov.id}
            className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isEntrada
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-red-500/20 border border-red-500/30"
              }`}
            >
              {isEntrada ? (
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-red-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-sm font-medium text-white truncate">
                  {mov.nombre}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(mov.fecha)}
              </p>
            </div>

            <div
              className={`text-right shrink-0 ${
                isEntrada ? "text-green-400" : "text-red-400"
              }`}
            >
              <p className="text-lg font-bold">
                {isEntrada ? "+" : "-"}
                {mov.cantidad}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {isEntrada ? "Entrada" : "Salida"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
