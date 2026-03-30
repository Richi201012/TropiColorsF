import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type OrderItemInput = {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
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
  paymentStatus: "paid";
  orderStatus: "pending";
  total: number;
  items: OrderItemInput[];
  paymentDetails?: {
    last4?: string;
    cardholderName?: string;
  } | null;
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

export async function createOrder(input: CreateOrderInput) {
  const payload = stripUndefined({
    ...input,
    currency: "MXN",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(collection(db, "orders"), payload);

  return docRef.id;
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
  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    historial: arrayUnion({
      estado: status,
      fecha: new Date().toISOString(),
      motivo: shippingData?.cancellationReason || null,
    }),
  };

  if (shippingData) {
    if (shippingData.paqueteria) payload.paqueteria = shippingData.paqueteria;
    if (shippingData.tipoEnvio) payload.tipoEnvio = shippingData.tipoEnvio;
    if (shippingData.guia) payload.guia = shippingData.guia;
    if (shippingData.cancellationReason) {
      payload.cancellationReason = shippingData.cancellationReason;
    }
  }

  await updateDoc(orderRef, payload);

  // Log activity
  try {
    await logActivity(`Pedido ${statusLabel(status)}`, orderId);
  } catch {
    // Silently fail - activity log is non-critical
  }
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
