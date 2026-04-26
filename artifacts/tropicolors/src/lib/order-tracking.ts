export const ORDER_TRACKING_COLLECTION = "order_tracking";
export const ORDER_TRACKING_LOOKUP_COLLECTION = "order_tracking_lookup";

export type TrackingStatus =
  | "pendiente"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

export type TrackingStep = {
  status: TrackingStatus;
  label: string;
  description: string;
};

export const TRACKING_STEPS: TrackingStep[] = [
  {
    status: "pendiente",
    label: "Pedido recibido",
    description: "Recibimos tu pedido y estamos esperando la validacion.",
  },
  {
    status: "pagado",
    label: "Pago confirmado",
    description: "Tu pago fue confirmado y el pedido pasa a preparacion.",
  },
  {
    status: "enviado",
    label: "En camino",
    description: "Tu pedido ya salio y va rumbo a tu direccion.",
  },
  {
    status: "entregado",
    label: "Entregado",
    description: "Tu pedido fue entregado correctamente.",
  },
];

const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const TRACKING_STATUS_DESCRIPTIONS: Record<TrackingStatus, string> = {
  pendiente:
    "Tu pedido esta registrado. Validaremos tu pago y datos para comenzar a prepararlo.",
  pagado:
    "Tu pago ya fue confirmado. Estamos preparando los productos de tu pedido.",
  enviado:
    "Tu pedido ya fue enviado. Revisa los datos de paqueteria y guia cuando esten disponibles.",
  entregado: "Tu pedido ya fue entregado. Gracias por comprar en Tropicolors.",
  cancelado:
    "Este pedido fue cancelado. Si tienes dudas, contactanos por WhatsApp.",
};

export function normalizeTrackingStatus(status?: string): TrackingStatus {
  const normalized = status?.toLowerCase();

  if (
    normalized === "pendiente" ||
    normalized === "pending" ||
    normalized === "paid" ||
    normalized === "pagado" ||
    normalized === "shipped" ||
    normalized === "enviado" ||
    normalized === "delivered" ||
    normalized === "entregado" ||
    normalized === "cancelled" ||
    normalized === "cancelado"
  ) {
    const statusMap: Record<string, TrackingStatus> = {
      pending: "pendiente",
      pendiente: "pendiente",
      paid: "pagado",
      pagado: "pagado",
      shipped: "enviado",
      enviado: "enviado",
      delivered: "entregado",
      entregado: "entregado",
      cancelled: "cancelado",
      cancelado: "cancelado",
    };

    return statusMap[normalized];
  }

  return "pendiente";
}

export function getTrackingStatusLabel(status?: string): string {
  return TRACKING_STATUS_LABELS[normalizeTrackingStatus(status)];
}

export function getTrackingStatusDescription(status?: string): string {
  return TRACKING_STATUS_DESCRIPTIONS[normalizeTrackingStatus(status)];
}

export function generateTrackingToken(): string {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID().replace(/-/g, "");
  }

  const randomPart = Math.random().toString(36).slice(2, 14);
  const timePart = Date.now().toString(36);
  return `${timePart}${randomPart}`;
}

function getPublicSiteUrl(): string {
  const configuredSiteUrl = (
    import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined
  )?.trim();

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/, "");
  }

  const basePath = import.meta.env.BASE_URL || "/";
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;

  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalizedBasePath}`.replace(/\/+$/, "");
  }

  return "https://tropicolors.netlify.app";
}

export function buildOrderTrackingUrl(token: string): string {
  return `${getPublicSiteUrl()}/pedido/${token}`;
}

export function buildOrderTrackingSearchUrl(): string {
  return `${getPublicSiteUrl()}/seguimiento_de_pedido`;
}

export function normalizeOrderNumberForLookup(orderNumber: string): string {
  return orderNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "-");
}
