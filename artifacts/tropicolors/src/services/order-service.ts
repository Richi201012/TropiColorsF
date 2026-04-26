import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  setDoc,
  arrayUnion,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ORDER_TRACKING_COLLECTION,
  ORDER_TRACKING_LOOKUP_COLLECTION,
  buildOrderTrackingUrl,
  generateTrackingToken,
  getTrackingStatusDescription,
  getTrackingStatusLabel,
  normalizeOrderNumberForLookup,
} from "@/lib/order-tracking";

type OrderItemInput = {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  purchaseType: "pieza" | "mayoreo";
  priceBase: number;
  unitPrice: number;
  subtotal: number;
  piecesPerBox?: number | null;
  quantityBoxes?: number;
  totalPieces?: number;
  concentration?: string;
  hexCode?: string;
  imageUrl?: string;
};

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requiresInvoice?: boolean;
  customerRfc?: string;
  shippingAddress: string;
  shippingExteriorNumber: string;
  shippingInteriorNumber?: string;
  shippingPostalCode: string;
  shippingNeighborhood: string;
  shippingMunicipality: string;
  shippingState: string;
  paymentMethod: "card" | "oxxo" | "transfer";
  paymentStatus: "paid" | "pending";
  orderStatus: "pending";
  paymentReference?: string;
  total: number;
  items: OrderItemInput[];
  paymentDetails?: {
    last4?: string;
    cardholderName?: string;
  } | null;
};

export type CreateOrderResult = {
  orderId: string;
  displayOrderId: string;
  trackingToken: string;
  trackingUrl?: string;
};

export type DeleteOrderInput = {
  orderId: string;
  orderNumber?: string;
  trackingToken?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry)) as T;
  }

  if (isPlainObject(value)) {
    const cleanedEntries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([entryKey, entryValue]) => [entryKey, stripUndefined(entryValue)]);

    return Object.fromEntries(cleanedEntries) as T;
  }

  return value;
}

function buildTrackingLookupPayload({
  orderId,
  orderNumber,
  trackingToken,
}: {
  orderId: string;
  orderNumber: string;
  trackingToken: string;
}) {
  return stripUndefined({
    orderId,
    orderNumber,
    orderNumberLookup: normalizeOrderNumberForLookup(orderNumber),
    trackingToken,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function getLookupAliases(orderId: string, orderNumber: string) {
  return Array.from(new Set([orderNumber, orderId].filter(Boolean)));
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const orderRef = doc(collection(db, "orders"));
  const trackingToken = generateTrackingToken();
  const displayOrderId = `ORD-${orderRef.id.slice(0, 8).toUpperCase()}`;
  const initialStatus: OrderStatus = "pendiente";
  const historyDate = new Date().toISOString();

  const payload = stripUndefined({
    ...input,
    orderNumber: displayOrderId,
    status: initialStatus,
    trackingToken,
    currency: "MXN",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    historial: [
      {
        estado: initialStatus,
        fecha: historyDate,
      },
    ],
  });

  const trackingPayload = stripUndefined({
    orderId: orderRef.id,
    orderNumber: displayOrderId,
    trackingToken,
    status: initialStatus,
    statusLabel: getTrackingStatusLabel(initialStatus),
    description: getTrackingStatusDescription(initialStatus),
    total: input.total,
    currency: "MXN",
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    items: buildTrackingItems(input.items),
    historial: [
      {
        estado: initialStatus,
        label: getTrackingStatusLabel(initialStatus),
        description: getTrackingStatusDescription(initialStatus),
        fecha: historyDate,
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(orderRef, payload);

  const trackingUrl = buildOrderTrackingUrl(trackingToken);

  try {
    await setDoc(
      doc(db, ORDER_TRACKING_COLLECTION, trackingToken),
      trackingPayload,
    );

    try {
      await Promise.all(
        getLookupAliases(orderRef.id, displayOrderId).map((alias) =>
          setDoc(
            doc(
              db,
              ORDER_TRACKING_LOOKUP_COLLECTION,
              normalizeOrderNumberForLookup(alias),
            ),
            buildTrackingLookupPayload({
              orderId: orderRef.id,
              orderNumber: alias,
              trackingToken,
            }),
          ),
        ),
      );
    } catch (lookupError) {
      console.error(
        "[order-service] No se pudo crear el indice de busqueda:",
        lookupError,
      );
    }
  } catch (error) {
    console.error(
      "[order-service] No se pudo crear el tracking publico:",
      error,
    );
  }

  return {
    orderId: orderRef.id,
    displayOrderId,
    trackingToken,
    trackingUrl,
  };
}

export async function deleteOrderAndTracking({
  orderId,
  orderNumber,
  trackingToken,
}: DeleteOrderInput) {
  const orderRef = doc(db, "orders", orderId);
  let resolvedOrderNumber = orderNumber;
  let resolvedTrackingToken = trackingToken;

  if (!resolvedOrderNumber || !resolvedTrackingToken) {
    const orderSnapshot = await getDoc(orderRef);

    if (orderSnapshot.exists()) {
      const orderData = orderSnapshot.data() as Record<string, unknown>;
      resolvedOrderNumber ||= getString(orderData.orderNumber);
      resolvedTrackingToken ||= getString(orderData.trackingToken);
    }
  }

  const batch = writeBatch(db);
  batch.delete(orderRef);

  if (resolvedTrackingToken) {
    batch.delete(doc(db, ORDER_TRACKING_COLLECTION, resolvedTrackingToken));
  }

  for (const alias of getLookupAliases(orderId, resolvedOrderNumber || "")) {
    const lookupId = normalizeOrderNumberForLookup(alias);
    if (!lookupId) continue;
    batch.delete(doc(db, ORDER_TRACKING_LOOKUP_COLLECTION, lookupId));
  }

  await batch.commit();
}

export type OrderStatus =
  | "pendiente"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  shippingData?: {
    paqueteria?: string;
    tipoEnvio?: string;
    guia?: string;
    cancellationReason?: string;
  },
) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnapshot = await getDoc(orderRef);

  if (!orderSnapshot.exists()) {
    throw new Error("Pedido no encontrado.");
  }

  const currentOrder = orderSnapshot.data() as Record<string, unknown>;
  const historyEntry = stripUndefined({
    estado: status,
    fecha: new Date().toISOString(),
    motivo: shippingData?.cancellationReason || null,
  });

  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    historial: arrayUnion(historyEntry),
  };

  if (shippingData) {
    if (shippingData.paqueteria) payload.paqueteria = shippingData.paqueteria;
    if (shippingData.tipoEnvio) payload.tipoEnvio = shippingData.tipoEnvio;
    if (shippingData.guia) payload.guia = shippingData.guia;
    if (shippingData.cancellationReason) {
      payload.cancellationReason = shippingData.cancellationReason;
    }
  }

  const batch = writeBatch(db);
  batch.update(orderRef, payload);

  const trackingToken = getString(currentOrder.trackingToken);

  if (trackingToken) {
    const orderNumber =
      getString(currentOrder.orderNumber) ||
      `ORD-${orderId.slice(0, 8).toUpperCase()}`;
    const trackingPayload = stripUndefined({
      orderId,
      orderNumber: orderNumber,
      trackingToken,
      status,
      statusLabel: getTrackingStatusLabel(status),
      description: getTrackingStatusDescription(status),
      total: getNumber(currentOrder.total),
      currency: getString(currentOrder.currency) || "MXN",
      paymentMethod:
        getString(currentOrder.paymentMethod) ||
        getString(currentOrder.metodoPago),
      paymentStatus:
        status === "pagado" ? "paid" : getString(currentOrder.paymentStatus),
      items: buildTrackingItems(currentOrder.items),
      paqueteria:
        shippingData?.paqueteria || getString(currentOrder.paqueteria),
      tipoEnvio: shippingData?.tipoEnvio || getString(currentOrder.tipoEnvio),
      guia: shippingData?.guia || getString(currentOrder.guia),
      cancellationReason:
        shippingData?.cancellationReason ||
        getString(currentOrder.cancellationReason),
      historial: arrayUnion(
        stripUndefined({
          ...historyEntry,
          label: getTrackingStatusLabel(status),
          description: getTrackingStatusDescription(status),
        }),
      ),
      updatedAt: serverTimestamp(),
    });

    batch.set(
      doc(db, ORDER_TRACKING_COLLECTION, trackingToken),
      trackingPayload,
      { merge: true },
    );

    for (const alias of getLookupAliases(orderId, orderNumber)) {
      batch.set(
        doc(
          db,
          ORDER_TRACKING_LOOKUP_COLLECTION,
          normalizeOrderNumberForLookup(alias),
        ),
        buildTrackingLookupPayload({
          orderId,
          orderNumber: alias,
          trackingToken,
        }),
        { merge: true },
      );
    }
  }

  await batch.commit();

  // Log activity
  try {
    await logActivity(`Pedido ${statusLabel(status)}`, orderId);
  } catch {
    // Silently fail - activity log is non-critical
  }
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function buildTrackingItems(items: unknown) {
  if (!Array.isArray(items)) return [];

  return items.slice(0, 30).map((item) => {
    if (!isPlainObject(item)) {
      return {
        productName: "Producto",
        quantity: 1,
      };
    }

    return stripUndefined({
      productName:
        getString(item.productName) || getString(item.name) || "Producto",
      quantity: getNumber(item.quantity) || 1,
      size: getString(item.size),
      subtotal: getNumber(item.subtotal),
    });
  });
}

function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pendiente: "creado",
    pagado: "marcado como pagado",
    enviado: "marcado como enviado",
    entregado: "marcado como entregado",
    cancelado: "cancelado",
  };
  return labels[status] || status;
}

export async function logActivity(accion: string, orderId?: string) {
  await addDoc(collection(db, "activity_logs"), {
    accion,
    orderId: orderId || null,
    fecha: serverTimestamp(),
  });
}

export type ProductInput = {
  nombre: string;
  stock: number;
  precio: number;
};

export async function createProduct(input: ProductInput) {
  const docRef = await addDoc(collection(db, "products"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}
