import { Package, Tag, Warehouse } from "lucide-react";

interface ProductoCardProps {
  nombre: string;
  precio: number;
  stock: number;
  barcode?: string;
}

export function ProductoCard({
  nombre,
  precio,
  stock,
  barcode,
}: ProductoCardProps) {
  const stockClass =
    stock > 10
      ? "text-green-400"
      : stock > 0
        ? "text-amber-400"
        : "text-red-400";
  const stockBg =
    stock > 10
      ? "bg-green-500/10"
      : stock > 0
        ? "bg-amber-500/10"
        : "bg-red-500/10";

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700/50 shadow-xl">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Producto
            </span>
          </div>
          <h3 className="text-xl font-bold text-white truncate">{nombre}</h3>
          {barcode && (
            <p className="text-xs text-slate-500 mt-1">Código: {barcode}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Precio
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${precio.toLocaleString("es-MX")}
          </p>
        </div>

        <div
          className={`${stockBg} rounded-2xl p-3 border border-slate-700/30`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Warehouse className={`w-3.5 h-3.5 ${stockClass}`} />
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
              Stock
            </span>
          </div>
          <p className={`text-2xl font-bold ${stockClass}`}>{stock}</p>
        </div>
      </div>

      {stock === 0 && (
        <div className="mt-3 px-3 py-2 bg-red-500/20 rounded-xl border border-red-500/30">
          <p className="text-xs text-red-300 font-medium text-center">
            Sin stock disponible
          </p>
        </div>
      )}
      {stock > 0 && stock <= 5 && (
        <div className="mt-3 px-3 py-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
          <p className="text-xs text-amber-300 font-medium text-center">
            Stock bajo
          </p>
        </div>
      )}
    </div>
  );
}
