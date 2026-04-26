import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  ExternalLink,
  PackageCheck,
  PackageOpen,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  ORDER_TRACKING_COLLECTION,
  TRACKING_STEPS,
  buildOrderTrackingUrl,
  getTrackingStatusDescription,
  getTrackingStatusLabel,
  normalizeTrackingStatus,
  type TrackingStatus,
} from "@/lib/order-tracking";
import { useToast } from "@/hooks/use-toast";

type TrackingItem = {
  productName?: string;
  quantity?: number;
  size?: string;
  subtotal?: number;
};

type TrackingHistoryEntry = {
  estado?: string;
  label?: string;
  description?: string;
  fecha?: Timestamp | string | Date;
  motivo?: string | null;
};

type OrderTrackingData = {
  orderId?: string;
  orderNumber?: string;
  trackingToken?: string;
  status?: string;
  statusLabel?: string;
  description?: string;
  total?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items?: TrackingItem[];
  historial?: TrackingHistoryEntry[];
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  cancellationReason?: string;
  createdAt?: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
};

const statusClasses: Record<TrackingStatus, string> = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-800",
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-800",
  enviado: "border-sky-200 bg-sky-50 text-sky-800",
  entregado: "border-teal-200 bg-teal-50 text-teal-800",
  cancelado: "border-rose-200 bg-rose-50 text-rose-800",
};

const statusIcons: Record<TrackingStatus, typeof Clock3> = {
  pendiente: Clock3,
  pagado: PackageCheck,
  enviado: Truck,
  entregado: CheckCircle2,
  cancelado: XCircle,
};

function formatDate(value?: Timestamp | string | Date): string {
  if (!value) return "";

  const date =
    value instanceof Timestamp
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value?: number, currency = "MXN"): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(value);
}

function paymentMethodLabel(method?: string): string {
  const normalized = method?.toLowerCase();
  const labels: Record<string, string> = {
    transfer: "Transferencia",
    card: "Tarjeta",
    oxxo: "OXXO",
  };

  return labels[normalized || ""] || "Por confirmar";
}

export default function OrderTracking() {
  const [, params] = useRoute<{ trackingToken: string }>(
    "/pedido/:trackingToken",
  );
  const trackingToken = params?.trackingToken || "";
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!trackingToken) {
      setIsLoading(false);
      setError("Link de seguimiento invalido.");
      return;
    }

    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, trackingToken);

    return onSnapshot(
      trackingRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setError("No encontramos informacion para este pedido.");
          setIsLoading(false);
          return;
        }

        setOrder(snapshot.data() as OrderTrackingData);
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error(
          "[OrderTracking] Error al leer seguimiento:",
          snapshotError,
        );
        setError("No pudimos cargar el seguimiento del pedido.");
        setIsLoading(false);
      },
    );
  }, [trackingToken]);

  const status = normalizeTrackingStatus(order?.status);
  const StatusIcon = statusIcons[status];
  const currentStepIndex = TRACKING_STEPS.findIndex(
    (step) => step.status === status,
  );
  const safeCurrentStepIndex = Math.max(0, currentStepIndex);
  const trackingUrl = useMemo(
    () => (trackingToken ? buildOrderTrackingUrl(trackingToken) : ""),
    [trackingToken],
  );
  const visibleHistory =
    order?.historial && order.historial.length > 0
      ? [...order.historial].reverse()
      : [
          {
            estado: status,
            label: order?.statusLabel || getTrackingStatusLabel(status),
            description:
              order?.description || getTrackingStatusDescription(status),
            fecha: order?.updatedAt || order?.createdAt,
          },
        ];

  const handleCopyTrackingUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast({
        title: "Link copiado",
        description: "Ya puedes compartir el seguimiento del pedido.",
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: trackingUrl,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Clock3 className="h-10 w-10 animate-pulse text-sky-700" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Cargando pedido
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Estamos consultando el estado actual.
          </p>
          <TrackingActions className="mt-6" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-2xl border border-rose-100 bg-white p-10 text-center shadow-sm">
          <AlertCircle className="h-11 w-11 text-rose-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Seguimiento no disponible
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {error}
          </p>
          <TrackingActions className="mt-6" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f1fbfd_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <TrackingActions className="mb-5" />
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(135deg,#003f91_0%,#006fb7_50%,#00a8b5_100%)] px-5 py-8 text-white sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                  Seguimiento de pedido
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {order.orderNumber || "Pedido Tropicolors"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50">
                  {order.description || getTrackingStatusDescription(status)}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <span
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusClasses[status]}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {order.statusLabel || getTrackingStatusLabel(status)}
                </span>
                {order.updatedAt ? (
                  <span className="text-xs font-medium text-cyan-50">
                    Actualizado: {formatDate(order.updatedAt)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.7fr_0.95fr] lg:px-10">
            <div className="space-y-8">
              <div
                className={`rounded-2xl border p-5 sm:p-6 ${statusClasses[status]}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/75">
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-80">
                        Estado actual
                      </p>
                      <h2 className="mt-1 text-2xl font-black">
                        {order.statusLabel || getTrackingStatusLabel(status)}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed opacity-90">
                        {order.description ||
                          getTrackingStatusDescription(status)}
                      </p>
                    </div>
                  </div>
                  {status === "pendiente" ? (
                    <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold leading-relaxed">
                      Tu compra ya esta registrada. El siguiente paso es validar
                      el pago y preparar el pedido.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Avance del pedido
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Esta linea se actualiza automaticamente cuando Tropicolors
                    cambia el estado.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  {TRACKING_STEPS.map((step, index) => {
                    const isComplete =
                      status !== "cancelado" && safeCurrentStepIndex >= index;
                    const isCurrent =
                      status !== "cancelado" && safeCurrentStepIndex === index;

                    return (
                      <div key={step.status} className="relative">
                        <div className="flex items-center gap-3 sm:block">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                              isComplete
                                ? "border-sky-700 bg-sky-700 text-white"
                                : "border-slate-300 bg-white text-slate-400"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 sm:mt-3">
                            <p
                              className={`text-sm font-bold ${
                                isCurrent ? "text-sky-800" : "text-slate-900"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {index < TRACKING_STEPS.length - 1 ? (
                          <div
                            className={`left-5 top-12 hidden h-0.5 w-[calc(100%+1rem)] sm:absolute sm:block ${
                              safeCurrentStepIndex > index &&
                              status !== "cancelado"
                                ? "bg-sky-700"
                                : "bg-slate-200"
                            }`}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {status === "cancelado" ? (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    <p className="font-bold">Pedido cancelado</p>
                    <p className="mt-1 leading-relaxed">
                      {order.cancellationReason ||
                        getTrackingStatusDescription("cancelado")}
                    </p>
                  </div>
                ) : null}
              </div>

              {status === "enviado" || order.paqueteria || order.guia ? (
                <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">
                        Datos de envio
                      </h2>
                      <p className="text-sm text-slate-500">
                        Informacion disponible para rastrear el paquete.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Paqueteria" value={order.paqueteria} />
                    <InfoTile label="Tipo de envio" value={order.tipoEnvio} />
                    <InfoTile label="Guia" value={order.guia} strong />
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <PackageOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      Compra
                    </h2>
                    <p className="text-sm text-slate-500">
                      Productos registrados en este pedido.
                    </p>
                  </div>
                </div>
                <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                  {(order.items || []).length > 0 ? (
                    order.items?.map((item, index) => (
                      <div
                        key={`${item.productName}-${index}`}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.productName || "Producto"}
                          </p>
                          {item.size ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.size}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            x{item.quantity || 1}
                          </p>
                          {typeof item.subtotal === "number" ? (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatMoney(item.subtotal, order.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-4 text-sm text-slate-500">
                      No hay productos visibles para este seguimiento.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Resumen
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <SummaryRow label="Pedido" value={order.orderNumber || "-"} />
                  <SummaryRow
                    label="Pago"
                    value={paymentMethodLabel(order.paymentMethod)}
                  />
                  <SummaryRow
                    label="Total"
                    value={formatMoney(order.total, order.currency) || "-"}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Link
                </p>
                <p className="mt-3 break-all rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  {trackingUrl}
                </p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTrackingUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar link
                  </button>
                  <a
                    href={`https://wa.me/525551146856?text=${encodeURIComponent(
                      `Hola, tengo una duda sobre mi pedido ${order.orderNumber || ""}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Historial
                </p>
                <div className="mt-4 space-y-4">
                  {visibleHistory.length > 0 ? (
                    visibleHistory.map((entry, index) => {
                      const entryStatus = normalizeTrackingStatus(entry.estado);
                      return (
                        <div
                          key={`${entry.estado}-${index}`}
                          className="flex gap-3"
                        >
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-700" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {entry.label ||
                                getTrackingStatusLabel(entryStatus)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(entry.fecha)}
                            </p>
                            {entry.motivo ? (
                              <p className="mt-1 text-xs text-rose-700">
                                {entry.motivo}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">
                      Sin movimientos registrados.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrackingActions({ className = "" }: { className?: string }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  };

  return (
    <div
      className={`mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <button
        type="button"
        onClick={goBack}
        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Regresar
      </button>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/seguimiento_de_pedido"
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
        >
          <Search className="h-4 w-4" />
          Buscar otro pedido
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
        >
          Ver el sitio
        </Link>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  strong = false,
}: {
  label: string;
  value?: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm ${
          strong ? "font-black text-sky-800" : "font-semibold text-slate-800"
        }`}
      >
        {value || "Pendiente"}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-900">{value}</span>
    </div>
  );
}
