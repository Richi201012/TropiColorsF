import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Barcode,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Database,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  ServerCog,
} from "lucide-react";
import { useInventorySource, type InventorySourceProduct } from "@/hooks/useInventorySource";

const PAGE_SIZE = 12;

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

function statusClass(status: string) {
  if (status === "Disponible") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Existencia baja") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Agotado") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function ProductThumb({ product }: { product: InventorySourceProduct }) {
  const [failed, setFailed] = useState(false);
  if (!product.imageUrl || failed) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
        <Boxes size={20} aria-hidden="true" />
      </span>
    );
  }
  return (
    <img
      src={product.imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover"
    />
  );
}

function StockBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass(status)}`}>
      {status}
    </span>
  );
}

export function InventorySourceView() {
  const { data, loading, refreshing, error, refresh } = useInventorySource();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.products || []).filter((product) => {
      const matchesQuery =
        !normalized ||
        [product.productName, product.variant, product.presentation, product.sku, ...product.barcodes]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesQuery && (status === "todos" || product.status === status);
    });
  }, [data?.products, query, status]);

  useEffect(() => setPage(1), [query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-slate-200 bg-slate-50/70">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-sky-600" size={30} aria-hidden="true" />
          <p className="mt-3 text-sm font-bold text-slate-800">Conectando con el inventario central</p>
          <p className="mt-1 text-xs text-slate-500">La primera consulta puede tardar unos segundos.</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    const needsSetup = error.code === "inventory_not_configured";
    return (
      <div className="overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50 px-5 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <ServerCog size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-950">
                {needsSetup ? "Falta conectar Render" : "No se pudo abrir el inventario"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{error.message}</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-6 sm:px-7">
          {needsSetup && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Variables que debes agregar al servicio API en Render</p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-slate-700">
                <code className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">INVENTORY_API_EMAIL</code>
                <code className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">INVENTORY_API_PASSWORD</code>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Usa el mismo acceso del sistema de inventario. También puedes configurar <code>INVENTORY_API_TOKEN</code> en lugar de correo y contraseña.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => void refresh(true)}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const syncedAt = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(data.syncedAt));

  const metrics = [
    { label: "Productos", value: data.summary.totalProducts, icon: PackageCheck, tone: "text-sky-700 bg-sky-50" },
    { label: "Presentaciones", value: data.summary.totalPresentations, icon: Boxes, tone: "text-indigo-700 bg-indigo-50" },
    { label: "Existencias", value: integer.format(data.summary.totalUnits), icon: Database, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Stock bajo", value: data.summary.lowStock, icon: AlertTriangle, tone: "text-amber-700 bg-amber-50" },
    { label: "Agotados", value: data.summary.outOfStock, icon: CircleOff, tone: "text-rose-700 bg-rose-50" },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#071a3d_0%,#0b4b8c_58%,#00a9c5_100%)] text-white shadow-[0_18px_45px_rgba(15,76,129,0.2)]">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em]">Inventario conectado</span>
                <span className="rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-950">Solo lectura</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">Existencias reales, en un solo lugar</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">
                Datos sincronizados desde {data.source}. Los cambios se administran en el sistema de inventario original.
              </p>
              <p className="mt-3 text-xs font-semibold text-white/70">Última sincronización: {syncedAt}</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white px-4 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} aria-hidden="true" />
              {refreshing ? "Actualizando" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      {(data.warning || data.stale) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          <span>{data.warning || "Se muestran los últimos datos disponibles."}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={18} aria-hidden="true" /></span>
            <p className="mt-3 text-2xl font-display font-bold text-slate-950">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative flex-1 sm:max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto, variante, SKU o código..."
              aria-label="Buscar en el inventario"
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filtrar por estado de inventario"
            className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <option value="todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Existencia baja">Existencia baja</option>
            <option value="Agotado">Agotado</option>
            <option value="Sin registro">Sin registro</option>
          </select>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3.5">Producto</th>
                <th className="px-4 py-3.5">SKU / presentación</th>
                <th className="px-4 py-3.5 text-right">Precio</th>
                <th className="px-4 py-3.5 text-right">Existencia</th>
                <th className="px-5 py-3.5">Estado</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait" initial={false}>
              <motion.tbody
                key={`${safePage}-${query}-${status}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {visible.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 last:border-0 hover:bg-sky-50/40">
                    <td className="px-5 py-4">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <ProductThumb product={product} />
                        <div>
                          <p className="font-bold text-slate-950">{product.productName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{product.category}{product.brand ? ` · ${product.brand}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs font-bold text-slate-700">{product.sku || "Sin SKU"}</p>
                      <p className="mt-1 max-w-[230px] text-xs text-slate-500">{product.variant} · {product.presentation}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">{currency.format(product.salePrice)}</td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-display text-lg font-bold text-slate-950">{integer.format(product.quantity)}</p>
                      <p className="text-[11px] text-slate-500">mín. {integer.format(product.minimumStock)}</p>
                    </td>
                    <td className="px-5 py-4"><StockBadge status={product.status} /></td>
                  </tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`mobile-${safePage}-${query}-${status}`}
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-slate-100 md:hidden"
          >
            {visible.map((product) => (
              <article key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <ProductThumb product={product} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold leading-5 text-slate-950">{product.productName}</h4>
                        <p className="mt-1 text-xs text-slate-500">{product.variant} · {product.presentation}</p>
                      </div>
                      <StockBadge status={product.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">SKU</p>
                        <p className="mt-1 truncate font-mono text-[11px] font-bold text-slate-700">{product.sku || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Existencia</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">{integer.format(product.quantity)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Precio</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">{currency.format(product.salePrice)}</p>
                      </div>
                    </div>
                    {product.barcodes[0] && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Barcode size={14} aria-hidden="true" />{product.barcodes[0]}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="px-5 py-14 text-center">
            <Search className="mx-auto text-slate-300" size={30} aria-hidden="true" />
            <p className="mt-3 font-bold text-slate-900">No encontramos coincidencias</p>
            <p className="mt-1 text-sm text-slate-500">Prueba otra búsqueda o cambia el filtro.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs font-semibold text-slate-500">
            {filtered.length === 0 ? "0 resultados" : `Mostrando ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
          </p>
          {pageCount > 1 && (
            <nav className="flex items-center gap-2" aria-label="Paginación del inventario">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1} aria-label="Página anterior" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-35"><ChevronLeft size={17} /></button>
              <span className="min-w-20 text-center text-xs font-bold text-slate-700">{safePage} de {pageCount}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={safePage === pageCount} aria-label="Página siguiente" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-35"><ChevronRight size={17} /></button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
