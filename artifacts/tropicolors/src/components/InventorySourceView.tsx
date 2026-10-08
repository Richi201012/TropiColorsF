import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  RefreshCw,
  Search,
  ServerCog,
} from "lucide-react";
import {
  useInventorySource,
  type InventorySourceProduct,
} from "@/hooks/useInventorySource";

const PAGE_SIZE = 8;
const integer = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

type ProductGroup = {
  id: string;
  name: string;
  category: string;
  brand: string;
  imageUrl: string;
  quantity: number;
  status: string;
  presentations: InventorySourceProduct[];
};

function statusClass(status: string) {
  if (status === "Disponible") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "Existencia baja") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "Agotado") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function groupStatus(presentations: InventorySourceProduct[], quantity: number) {
  if (presentations.every((item) => item.status === "Sin registro")) {
    return "Sin registro";
  }
  if (quantity <= 0) return "Agotado";
  if (presentations.some((item) => item.status === "Existencia baja")) {
    return "Existencia baja";
  }
  return "Disponible";
}

function ProductThumb({ group }: { group: ProductGroup }) {
  const [failed, setFailed] = useState(false);
  if (!group.imageUrl || failed) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
        <Boxes size={19} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={group.imageUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover"
    />
  );
}

function StockBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClass(status)}`}
    >
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo<ProductGroup[]>(() => {
    const grouped = new Map<string, ProductGroup>();

    for (const product of data?.products || []) {
      const id = product.productId || product.productName;
      const current = grouped.get(id) || {
        id,
        name: product.productName,
        category: product.category,
        brand: product.brand,
        imageUrl: product.imageUrl,
        quantity: 0,
        status: "Sin registro",
        presentations: [],
      };
      current.quantity += product.quantity;
      current.presentations.push(product);
      grouped.set(id, current);
    }

    return [...grouped.values()]
      .map((group) => ({
        ...group,
        status: groupStatus(group.presentations, group.quantity),
        presentations: group.presentations.sort((first, second) =>
          `${first.variant} ${first.presentation}`.localeCompare(
            `${second.variant} ${second.presentation}`,
            "es",
          ),
        ),
      }))
      .sort((first, second) => first.name.localeCompare(second.name, "es"));
  }, [data?.products]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return groups.filter((group) => {
      const searchable = [
        group.name,
        group.category,
        group.brand,
        ...group.presentations.flatMap((item) => [
          item.variant,
          item.presentation,
          item.sku,
          ...item.barcodes,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!normalized || searchable.includes(normalized)) &&
        (status === "todos" || group.status === status)
      );
    });
  }, [groups, query, status]);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const changePage = (nextPage: number) => {
    setExpandedId(null);
    setPage(nextPage);
  };

  if (loading) {
    return (
      <div className="grid min-h-[280px] place-items-center rounded-3xl border border-slate-200 bg-slate-50/70">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-sky-600"
            size={28}
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-bold text-slate-800">
            Cargando inventario
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    const needsSetup = error.code === "inventory_not_configured";
    return (
      <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 bg-amber-50 px-5 py-5 sm:px-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
            <ServerCog size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-slate-950">
              {needsSetup
                ? "Falta conectar Render"
                : "No se pudo abrir el inventario"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{error.message}</p>
          </div>
        </div>
        <div className="px-5 py-5 sm:px-6">
          {needsSetup && (
            <p className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              Agrega <code>INVENTORY_API_EMAIL</code> y{" "}
              <code>INVENTORY_API_PASSWORD</code> al servicio API de Render.
            </p>
          )}
          <button
            type="button"
            onClick={() => void refresh(true)}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
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
  const productsWithStock = groups.filter((group) => group.quantity > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
            <Database size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-950">Inventario sincronizado</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                Solo lectura
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">
              {syncedAt} · {groups.length} productos ·{" "}
              {integer.format(data.summary.totalUnits)} unidades ·{" "}
              {productsWithStock} con stock
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh(true)}
          disabled={refreshing}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        >
          <RefreshCw
            className={refreshing ? "animate-spin" : ""}
            size={15}
            aria-hidden="true"
          />
          {refreshing ? "Actualizando" : "Actualizar"}
        </button>
      </div>

      {(data.warning || data.stale) && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          <AlertTriangle
            className="mt-0.5 shrink-0"
            size={17}
            aria-hidden="true"
          />
          <span>
            {data.warning || "Se muestran los últimos datos disponibles."}
          </span>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto o SKU..."
              aria-label="Buscar en el inventario"
              className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus-visible:border-sky-400 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filtrar por estado de inventario"
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <option value="todos">Todos</option>
            <option value="Disponible">Con stock</option>
            <option value="Existencia baja">Stock bajo</option>
            <option value="Agotado">Agotados</option>
            <option value="Sin registro">Sin registro</option>
          </select>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${safePage}-${query}-${status}`}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="divide-y divide-slate-100"
          >
            {visible.map((group) => {
              const expanded = expandedId === group.id;
              return (
                <article key={group.id}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(expanded ? null : group.id)}
                    className="flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-sky-50/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100 sm:px-5"
                  >
                    <ProductThumb group={group} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {group.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {group.category} · {group.presentations.length}{" "}
                        {group.presentations.length === 1
                          ? "presentación"
                          : "presentaciones"}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-display text-lg font-bold text-slate-950">
                        {integer.format(group.quantity)}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        unidades
                      </p>
                    </div>
                    <StockBadge status={group.status} />
                    <ChevronDown
                      size={17}
                      aria-hidden="true"
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                          <div className="grid gap-2 md:grid-cols-2">
                            {group.presentations.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-slate-800">
                                    {item.variant} · {item.presentation}
                                  </p>
                                  <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
                                    {item.sku || "Sin SKU"}
                                    {item.salePrice > 0
                                      ? ` · ${currency.format(item.salePrice)}`
                                      : ""}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-bold text-slate-950">
                                    {integer.format(item.quantity)}
                                  </p>
                                  <p className="text-[9px] text-slate-400">
                                    en stock
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="px-5 py-12 text-center">
            <Search
              className="mx-auto text-slate-300"
              size={28}
              aria-hidden="true"
            />
            <p className="mt-3 font-bold text-slate-900">
              No encontramos productos
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Prueba otra búsqueda o cambia el filtro.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold text-slate-500">
            {filtered.length === 0
              ? "0 productos"
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safePage * PAGE_SIZE,
                  filtered.length,
                )} de ${filtered.length} productos`}
          </p>
          {pageCount > 1 && (
            <nav
              className="flex items-center gap-1.5"
              aria-label="Paginación del inventario"
            >
              <button
                type="button"
                onClick={() => changePage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                aria-label="Página anterior"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-14 text-center text-[11px] font-bold text-slate-600">
                {safePage}/{pageCount}
              </span>
              <button
                type="button"
                onClick={() => changePage(Math.min(pageCount, safePage + 1))}
                disabled={safePage === pageCount}
                aria-label="Página siguiente"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
