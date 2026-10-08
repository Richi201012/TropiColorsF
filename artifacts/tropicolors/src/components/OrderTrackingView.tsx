import { useMemo, type ReactNode } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Copy,
  ExternalLink,
  PackageCheck,
  PackageOpen,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import {
  TRACKING_STEPS,
  buildOrderTrackingUrl,
  getTrackingStatusDescription,
  getTrackingStatusLabel,
  normalizeTrackingStatus,
  type TrackingStatus,
} from "@/lib/order-tracking";
import { useToast } from "@/hooks/use-toast";
import type { OrderTrackingData } from "@/pages/OrderTracking";

type StatusPresentation = {
  eyebrow: string;
  title: string;
  nextStep: string;
  image: string;
  imageAlt: string;
  heroGradient: string;
  badgeBackground: string;
  badgeText: string;
  badgeBorder: string;
  softBackground: string;
  softText: string;
  softBorder: string;
  accent: string;
};

const STATUS_PRESENTATION: Record<TrackingStatus, StatusPresentation> = {
  pendiente: {
    eyebrow: "Pedido recibido",
    title: "Ya tenemos tu pedido",
    nextStep: "Ahora validaremos tu pago para comenzar la preparación.",
    image: "/email/order-status/pending.png",
    imageAlt: "Mascota TropiColors revisando el pedido",
    heroGradient: "linear-gradient(135deg, #071b42 0%, #5f4306 52%, #b66e00 100%)",
    badgeBackground: "#fff7d6",
    badgeText: "#6b3f00",
    badgeBorder: "#f8d573",
    softBackground: "#fff8df",
    softText: "#6b3f00",
    softBorder: "#f8d573",
    accent: "#d18a00",
  },
  pagado: {
    eyebrow: "Pago confirmado",
    title: "Todo está correcto",
    nextStep:
      "Estamos preparando tus colores antes de entregarlos a paquetería.",
    image: "/email/order-status/paid.png",
    imageAlt: "Mascota TropiColors confirmando el pago",
    heroGradient: "linear-gradient(135deg, #071b42 0%, #075c3d 52%, #149459 100%)",
    badgeBackground: "#ecfdf3",
    badgeText: "#105c2b",
    badgeBorder: "#a7e9be",
    softBackground: "#f0fcf4",
    softText: "#105c2b",
    softBorder: "#a7e9be",
    accent: "#16803b",
  },
  enviado: {
    eyebrow: "Pedido enviado",
    title: "Tu pedido va en camino",
    nextStep:
      "Consulta la guía y la paquetería; te avisaremos cuando sea entregado.",
    image: "/email/order-status/shipped.png",
    imageAlt: "Mascota TropiColors llevando un paquete",
    heroGradient: "linear-gradient(135deg, #071b42 0%, #005fa8 52%, #00a8b5 100%)",
    badgeBackground: "#e7fafc",
    badgeText: "#075c66",
    badgeBorder: "#9fe1e7",
    softBackground: "#effcfd",
    softText: "#075c66",
    softBorder: "#9fe1e7",
    accent: "#007e8c",
  },
  entregado: {
    eyebrow: "Entrega completada",
    title: "¡Tu pedido fue entregado!",
    nextStep:
      "Esperamos que disfrutes tus productos. Gracias por elegir TropiColors.",
    image: "/email/order-status/delivered.png",
    imageAlt: "Mascota TropiColors agradeciendo la compra",
    heroGradient: "linear-gradient(135deg, #071b42 0%, #176342 52%, #66a817 100%)",
    badgeBackground: "#f2fbe9",
    badgeText: "#365f0b",
    badgeBorder: "#c8e9a5",
    softBackground: "#f6fceF",
    softText: "#365f0b",
    softBorder: "#c8e9a5",
    accent: "#548d12",
  },
  cancelado: {
    eyebrow: "Pedido cancelado",
    title: "Estamos para ayudarte",
    nextStep:
      "Si deseas aclarar la cancelación o hacer otra compra, escríbenos.",
    image: "/email/order-status/cancelled.png",
    imageAlt: "Mascota de soporte TropiColors lista para ayudar",
    heroGradient: "linear-gradient(135deg, #071b42 0%, #692044 52%, #c81e4f 100%)",
    badgeBackground: "#fff0f5",
    badgeText: "#8f153c",
    badgeBorder: "#f5b8ca",
    softBackground: "#fff4f7",
    softText: "#8f153c",
    softBorder: "#f5b8ca",
    accent: "#c81e4f",
  },
};

const STATUS_ICONS: Record<TrackingStatus, typeof Clock3> = {
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
  const labels: Record<string, string> = {
    transfer: "Transferencia",
    card: "Tarjeta",
    oxxo: "OXXO",
  };
  return labels[method?.toLowerCase() || ""] || "Por confirmar";
}

export function OrderTrackingView({
  order,
  trackingToken,
}: {
  order: OrderTrackingData;
  trackingToken: string;
}) {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const status = normalizeTrackingStatus(order.status);
  const presentation = STATUS_PRESENTATION[status];
  const StatusIcon = STATUS_ICONS[status];
  const currentStepIndex = Math.max(
    0,
    TRACKING_STEPS.findIndex((step) => step.status === status),
  );
  const timelineProgress =
    status === "cancelado"
      ? 0
      : (currentStepIndex / (TRACKING_STEPS.length - 1)) * 100;
  const completionPercent =
    status === "cancelado"
      ? 0
      : ((currentStepIndex + 1) / TRACKING_STEPS.length) * 100;
  const trackingUrl = useMemo(
    () => buildOrderTrackingUrl(trackingToken),
    [trackingToken],
  );
  const orderSubtotal = useMemo(() => {
    if (
      typeof order.subtotal === "number" &&
      Number.isFinite(order.subtotal)
    ) {
      return order.subtotal;
    }
    return (order.items || []).reduce(
      (sum, item) => sum + (Number(item.subtotal) || 0),
      0,
    );
  }, [order]);
  const orderTotal = useMemo(() => {
    if (typeof order.total === "number" && Number.isFinite(order.total)) {
      return order.total;
    }
    return orderSubtotal + (Number(order.shippingFee) || 0);
  }, [order, orderSubtotal]);
  const visibleHistory =
    order.historial && order.historial.length > 0
      ? [...order.historial].reverse()
      : [
          {
            estado: status,
            label: order.statusLabel || getTrackingStatusLabel(status),
            description:
              order.description || getTrackingStatusDescription(status),
            fecha: order.updatedAt || order.createdAt,
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

  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(0,168,181,0.10),transparent_28%),linear-gradient(180deg,#f7fbff_0%,#ffffff_48%,#f1fbfd_100%)] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <TrackingPageActions className="mb-4 sm:mb-5" />

        <motion.div
          {...enter}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:rounded-[34px]"
        >
          <div
            className="relative overflow-hidden px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10"
            style={{ backgroundImage: presentation.heroGradient }}
          >
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-5 lg:grid-cols-3 lg:gap-8">
              <div className="min-w-0 lg:col-span-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold"
                    style={{
                      backgroundColor: presentation.badgeBackground,
                      borderColor: presentation.badgeBorder,
                      color: presentation.badgeText,
                    }}
                  >
                    <StatusIcon className="h-4 w-4" aria-hidden="true" />
                    {order.statusLabel || getTrackingStatusLabel(status)}
                  </span>
                  {order.updatedAt ? (
                    <span className="text-xs font-semibold text-white/75">
                      Actualizado {formatDate(order.updatedAt)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/70">
                  {presentation.eyebrow}
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  {presentation.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                  {order.description || getTrackingStatusDescription(status)}
                </p>
                <div className="mt-5 inline-flex max-w-2xl items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: "#ffcd00" }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/65">
                      Lo que sigue
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-white">
                      {presentation.nextStep}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-48 items-center justify-center lg:min-h-64 lg:justify-end">
                <div className="absolute h-44 w-44 rounded-full bg-white/15 blur-2xl sm:h-56 sm:w-56" />
                <AnimatePresence mode="wait">
                  <motion.img
                    key={status}
                    src={presentation.image}
                    alt={presentation.imageAlt}
                    width={480}
                    height={480}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.82, x: 18 }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.92, x: -12 }
                    }
                    transition={{
                      duration: 0.42,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative h-auto w-48 drop-shadow-[0_18px_25px_rgba(2,18,48,0.25)] sm:w-56 lg:w-64"
                  />
                </AnimatePresence>
              </div>
            </div>
            <div className="relative mt-5 flex flex-col gap-1 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                Número de pedido
              </span>
              <span className="font-mono text-base font-black tracking-wide text-white [overflow-wrap:anywhere] sm:text-lg">
                {order.orderNumber || "Pedido TropiColors"}
              </span>
            </div>
          </div>

          <div className="grid gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.7fr_0.95fr] lg:gap-8 lg:px-10">
            <div className="min-w-0 space-y-6">
              <motion.section
                {...enter}
                transition={{
                  duration: 0.42,
                  delay: reduceMotion ? 0 : 0.08,
                }}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
                aria-labelledby="tracking-progress-title"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                      Avance del pedido
                    </p>
                    <h2
                      id="tracking-progress-title"
                      className="mt-1 text-xl font-black text-slate-950"
                    >
                      {status === "cancelado"
                        ? "El proceso se detuvo"
                        : `Etapa ${currentStepIndex + 1} de ${TRACKING_STEPS.length}`}
                    </h2>
                  </div>
                  {status !== "cancelado" ? (
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
                      {Math.round(completionPercent)}%
                    </span>
                  ) : null}
                </div>

                {status === "cancelado" ? (
                  <div
                    className="mt-5 rounded-2xl border p-4"
                    style={{
                      backgroundColor: presentation.softBackground,
                      borderColor: presentation.softBorder,
                      color: presentation.softText,
                    }}
                  >
                    <div className="flex gap-3">
                      <XCircle
                        className="mt-0.5 h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-black">Pedido cancelado</p>
                        <p className="mt-1 text-sm leading-relaxed">
                          {order.cancellationReason ||
                            getTrackingStatusDescription("cancelado")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-6 hidden pt-1 sm:block">
                      <div className="absolute left-[12.5%] right-[12.5%] top-[21px] h-1 rounded-full bg-slate-200" />
                      <motion.div
                        className="absolute left-[12.5%] top-[21px] h-1 rounded-full"
                        style={{ backgroundColor: presentation.accent }}
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: `${timelineProgress * 0.75}%` }}
                        transition={{
                          duration: 0.65,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                      <div className="relative grid grid-cols-4 gap-4">
                        {TRACKING_STEPS.map((step, index) => (
                          <ProgressStep
                            key={step.status}
                            step={step}
                            index={index}
                            isComplete={currentStepIndex >= index}
                            isCurrent={currentStepIndex === index}
                            accent={presentation.accent}
                            reduceMotion={Boolean(reduceMotion)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative mt-6 space-y-5 sm:hidden">
                      <div className="absolute bottom-5 left-[19px] top-5 w-0.5 bg-slate-200" />
                      {TRACKING_STEPS.map((step, index) => (
                        <MobileProgressStep
                          key={step.status}
                          step={step}
                          index={index}
                          isComplete={currentStepIndex >= index}
                          isCurrent={currentStepIndex === index}
                          accent={presentation.accent}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.section>

              {status === "enviado" || order.paqueteria || order.guia ? (
                <ContentCard
                  icon={Truck}
                  title="Datos de envío"
                  description="Información disponible para rastrear el paquete."
                  iconClass="bg-cyan-50 text-cyan-800"
                >
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Paquetería" value={order.paqueteria} />
                    <InfoTile label="Tipo de envío" value={order.tipoEnvio} />
                    <InfoTile label="Guía" value={order.guia} strong />
                  </div>
                </ContentCard>
              ) : null}

              <ContentCard
                icon={PackageOpen}
                title="Tu compra"
                description="Productos registrados en este pedido."
                iconClass="bg-amber-50 text-amber-800"
              >
                <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                  {(order.items || []).length > 0 ? (
                    order.items?.map((item, index) => (
                      <div
                        key={`${item.productName}-${index}`}
                        className="flex items-start justify-between gap-4 bg-white px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {item.productName || "Producto"}
                          </p>
                          {item.size ? (
                            <p className="mt-1 text-xs text-slate-600">
                              {item.size}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black text-slate-900">
                            x{item.quantity || 1}
                          </p>
                          {typeof item.subtotal === "number" ? (
                            <p className="mt-1 text-xs font-semibold text-slate-600">
                              {formatMoney(item.subtotal, order.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="bg-white px-4 py-4 text-sm text-slate-600">
                      No hay productos visibles para este seguimiento.
                    </p>
                  )}
                </div>
              </ContentCard>
            </div>

            <aside className="min-w-0 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                    Resumen
                  </p>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-800">
                    MXN
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <SummaryRow
                    label="Pedido"
                    value={order.orderNumber || "-"}
                    mono
                  />
                  <SummaryRow
                    label="Pago"
                    value={paymentMethodLabel(order.paymentMethod)}
                  />
                  <SummaryRow
                    label="Subtotal"
                    value={
                      formatMoney(orderSubtotal, order.currency) || "-"
                    }
                  />
                  {typeof order.shippingFee === "number" &&
                  order.shippingFee > 0 ? (
                    <SummaryRow
                      label="Envío"
                      value={
                        formatMoney(order.shippingFee, order.currency) || "-"
                      }
                    />
                  ) : null}
                  <SummaryRow
                    label="Total"
                    value={formatMoney(orderTotal, order.currency) || "-"}
                    total
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Compartir seguimiento
                </p>
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
                  {trackingUrl}
                </p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTrackingUrl}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copiar link
                  </button>
                  <a
                    href={`https://wa.me/525551146856?text=${encodeURIComponent(
                      `Hola, tengo una duda sobre mi pedido ${order.orderNumber || ""}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
                  Historial
                </p>
                <div className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
                  {visibleHistory.length > 0 ? (
                    visibleHistory.map((entry, index) => {
                      const entryStatus = normalizeTrackingStatus(
                        entry.estado,
                      );
                      return (
                        <div
                          key={`${entry.estado}-${index}`}
                          className="relative flex gap-3"
                        >
                          <div
                            className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-white shadow-sm"
                            style={{
                              backgroundColor:
                                STATUS_PRESENTATION[entryStatus].accent,
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900">
                              {entry.label ||
                                getTrackingStatusLabel(entryStatus)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              {formatDate(entry.fecha)}
                            </p>
                            {entry.motivo ? (
                              <p className="mt-1 text-xs font-semibold text-rose-700">
                                {entry.motivo}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-600">
                      Sin movimientos registrados.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function ProgressStep({
  step,
  index,
  isComplete,
  isCurrent,
  accent,
  reduceMotion,
}: {
  step: (typeof TRACKING_STEPS)[number];
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  accent: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className="relative text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.12 + index * 0.06 }}
    >
      <div
        className="relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white shadow-sm"
        style={{
          borderColor: isComplete ? accent : "#cbd5e1",
          color: isComplete ? accent : "#94a3b8",
        }}
      >
        {isComplete ? (
          <Check className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Circle className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </div>
      <p
        className={`mt-3 text-sm font-black ${isCurrent ? "text-sky-800" : "text-slate-900"}`}
      >
        {step.label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        {step.description}
      </p>
      {isCurrent ? (
        <span
          className="mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"
          style={{ backgroundColor: accent }}
        >
          Ahora
        </span>
      ) : null}
    </motion.div>
  );
}

function MobileProgressStep({
  step,
  index,
  isComplete,
  isCurrent,
  accent,
}: {
  step: (typeof TRACKING_STEPS)[number];
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  accent: string;
}) {
  return (
    <div className="relative flex gap-4">
      <div
        className="z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-white shadow-sm"
        style={{
          borderColor: isComplete ? accent : "#cbd5e1",
          color: isComplete ? accent : "#94a3b8",
        }}
      >
        {isComplete ? (
          <Check className="h-5 w-5" aria-hidden="true" />
        ) : (
          <span className="text-xs font-black">{index + 1}</span>
        )}
      </div>
      <div className="min-w-0 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-sm font-black ${isCurrent ? "text-sky-800" : "text-slate-900"}`}
          >
            {step.label}
          </p>
          {isCurrent ? (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: accent }}
            >
              Ahora
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {step.description}
        </p>
      </div>
    </div>
  );
}

function ContentCard({
  icon: Icon,
  title,
  description,
  iconClass,
  children,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  iconClass: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function TrackingPageActions({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
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
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Regresar
      </button>
      {!compact ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/seguimiento_de_pedido"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-sky-900 transition-colors hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar otro pedido
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
          >
            Ver el sitio
          </Link>
        </div>
      ) : null}
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
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm ${strong ? "font-black text-sky-800" : "font-semibold text-slate-800"}`}
      >
        {value || "Pendiente"}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
  total = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  total?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 ${total ? "pt-1" : ""}`}
    >
      <span className={total ? "font-bold text-slate-900" : "text-slate-600"}>
        {label}
      </span>
      <span
        className={`min-w-0 text-right font-black text-slate-950 [overflow-wrap:anywhere] ${mono ? "font-mono text-xs" : ""} ${total ? "text-lg text-sky-800" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
