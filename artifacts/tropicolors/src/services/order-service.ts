import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
  shippingAddress: string;
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

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefined(entry)) as T;
  }

  if (value && typeof value === "object") {
    const cleanedEntries = Object.entries(value as Record<string, unknown>)
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
