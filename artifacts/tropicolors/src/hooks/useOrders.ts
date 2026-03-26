import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type HistorialEntry = {
  estado: string;
  fecha: string;
};

// Tipo de dato desde Firestore (estructura real del proyecto)
type FirestoreOrder = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  // Campos de dirección - aceptar ambos formatos
  customerAddress?: string; // Formato legacy
  shippingAddress?: string; // Formato nuevo desde CartDrawer
  shippingPostalCode?: string;
  shippingNeighborhood?: string;
  shippingMunicipality?: string;
  shippingState?: string;
  currency?: string;
  createdAt?: Timestamp | string;
  paymentMethod?: string; // Nuevo campo para método de pago
  metodoPago?: string; // Alternativa para método de pago
  status?: string; // Estado del pedido
  historial?: Array<{
    estado?: string;
    fecha?: Timestamp | string;
  }>;
  items?: Array<{
    productName?: string;
    price?: number;
    hexCode?: string;
    quantity?: number;
    [key: string]: unknown; // permite campos adicionales
  }>;
  // cualquier otro campo
  [key: string]: unknown;
};

// Tipo que espera el componente Admin.tsx
export type OrderStatus = "pendiente" | "pagado" | "enviado" | "entregado";

export type OrderProduct = {
  name: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  address: string;
  neighborhood?: string;
  municipality?: string;
  state?: string;
  total: number;
  status: OrderStatus;
  items: OrderProduct[];
  createdAt?: string;
  createdAtRaw?: Timestamp | string;
  paymentMethod?: string;
  metodoPago?: string;
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  historial?: HistorialEntry[];
};

/**
 * Hook para obtener pedidos en tiempo real desde Firebase Firestore
 * Colección: "orders"
 * Usa onSnapshot para actualizaciones en tiempo real
 */
export function useOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useOrders] 🔄 Iniciando conexión con Firestore...");
    console.log("[useOrders] 📁 Colección: 'orders'");

    // Referencia a la colección "orders"
    const ordersRef = collection(db, "orders");

    // Query para ordenar por fecha de creación (más recientes primero)
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    // Escucha en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        console.log(
          `[useOrders] ✅ Recibidos ${snapshot.size} documentos de Firestore`,
        );

        if (snapshot.empty) {
          console.warn(
            "[useOrders] ⚠️ No hay documentos en la colección 'orders'",
          );
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const ordersData: AdminOrder[] = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreOrder;

          console.log(`[useOrders] 📄 Procesando documento: ${doc.id}`, data);

          // Calcular total desde el array de items
          const calculatedTotal = calcularTotal(data.items);

          // Mapear items al formato que espera el UI
          const mappedItems: OrderProduct[] = (data.items || []).map(
            (item) => ({
              name: item.productName || "Producto sin nombre",
              quantity: item.quantity || 1,
              price: item.price || 0,
            }),
          );

          // Transformar createdAt a string
          const createdAtString = formatearFecha(data.createdAt);

          // Mapear historial
          const mappedHistorial: HistorialEntry[] = (data.historial || []).map(
            (entry) => ({
              estado: entry.estado || "pendiente",
              fecha: formatearFecha(entry.fecha),
            }),
          );

          // Construir dirección completa desde campos de envío
          const buildAddress = (): string => {
            const parts: string[] = [];

            // Usar shippingAddress (prioridad) o customerAddress (fallback)
            if (data.shippingAddress) {
              parts.push(data.shippingAddress);
            } else if (data.customerAddress) {
              parts.push(data.customerAddress);
            }

            // Agregar colonia si existe
            if (data.shippingNeighborhood) {
              parts.push(data.shippingNeighborhood);
            }

            // Agregar municipio/ciudad si existe
            if (data.shippingMunicipality) {
              parts.push(data.shippingMunicipality);
            }

            // Agregar estado si existe
            if (data.shippingState) {
              parts.push(data.shippingState);
            }

            // Agregar código postal si existe
            if (data.shippingPostalCode) {
              parts.push(`C.P. ${data.shippingPostalCode}`);
            }

            return parts.length > 0 ? parts.join(", ") : "Sin dirección";
          };

          return {
            id: doc.id,
            customer: data.customerName || "Cliente sin nombre",
            email: data.customerEmail || "sin-email@ejemplo.com",
            phone: data.customerPhone || "",
            address: buildAddress(),
            total: calculatedTotal,
            status: mapOrderStatus(data.status),
            items: mappedItems,
            createdAt: createdAtString,
            createdAtRaw: data.createdAt,
            paymentMethod: data.paymentMethod || data.metodoPago || "efectivo",
            metodoPago: data.metodoPago || data.paymentMethod || "efectivo",
            paqueteria: data.paqueteria as string | undefined,
            tipoEnvio: data.tipoEnvio as string | undefined,
            guia: data.guia as string | undefined,
            historial: mappedHistorial,
          };
        });

        console.log("[useOrders] 📊 Pedidos procesados:", ordersData);
        setOrders(ordersData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("[useOrders] ❌ Error de Firestore:", err);
        console.error("[useOrders] Código de error:", err.code);
        setError(err.message);
        setIsLoading(false);
      },
    );

    // Cleanup: cancelar suscripción al desmontar componente
    return () => {
      console.log("[useOrders] 🧹 Limpiando suscripción...");
      unsubscribe();
    };
  }, []);

  return { orders, setOrders, isLoading, error };
}

/**
 * Calcula el total del pedido a partir del array de items
 */
function calcularTotal(
  items?: Array<{ price?: number; quantity?: number }>,
): number {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + price * quantity;
  }, 0);
}

/**
 * Mapea el estado del pedido desde Firestore al tipo local
 */
function mapOrderStatus(status?: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    pagado: "pagado",
    paid: "pagado",
    enviado: "enviado",
    shipped: "enviado",
    entregado: "entregado",
    delivered: "entregado",
    pendiente: "pendiente",
    pending: "pendiente",
    cancelado: "pendiente",
    cancelled: "pendiente",
  };
  return statusMap[status?.toLowerCase() || ""] || "pendiente";
}

/**
 * Convierte el campo createdAt a string legible
 * Soporta Timestamp de Firebase o string
 */
function formatearFecha(createdAt?: Timestamp | string | null): string {
  if (!createdAt) {
    return "";
  }

  // Si es un Timestamp de Firebase
  if (createdAt instanceof Timestamp) {
    return createdAt.toDate().toISOString();
  }

  // Si es un objeto con seconds (Timestamp serializado)
  if (
    typeof createdAt === "object" &&
    "seconds" in createdAt &&
    typeof (createdAt as Record<string, unknown>).seconds === "number"
  ) {
    return new Date(
      ((createdAt as Record<string, unknown>).seconds as number) * 1000,
    ).toISOString();
  }

  // Si ya es un string
  if (typeof createdAt === "string") {
    return createdAt;
  }

  return "";
}

// Export por defecto
export default useOrders;
