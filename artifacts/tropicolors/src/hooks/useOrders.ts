import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Tipo de dato desde Firestore (estructura real del proyecto)
type FirestoreOrder = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  currency?: string;
  createdAt?: Timestamp | string;
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
  address: string;
  total: number;
  status: OrderStatus;
  items: OrderProduct[];
  createdAt: string;
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
        console.log(`[useOrders] ✅ Recibidos ${snapshot.size} documentos de Firestore`);
        
        if (snapshot.empty) {
          console.warn("[useOrders] ⚠️ No hay documentos en la colección 'orders'");
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
          const mappedItems: OrderProduct[] = (data.items || []).map((item) => ({
            name: item.productName || "Producto sin nombre",
            quantity: item.quantity || 1,
            price: item.price || 0,
          }));

          // Transformar createdAt a string
          const createdAtString = formatearFecha(data.createdAt);

          return {
            id: doc.id,
            customer: data.customerName || "Cliente sin nombre",
            email: data.customerEmail || "sin-email@ejemplo.com",
            address: data.customerPhone || "Sin teléfono", // nota: podría ser diferente
            total: calculatedTotal,
            status: "pendiente" as OrderStatus, // valor por defecto - ajustar según campo de status
            items: mappedItems,
            createdAt: createdAtString,
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
      }
    );

    // Cleanup: cancelar suscripción al desmontar componente
    return () => {
      console.log("[useOrders] 🧹 Limpiando suscripción...");
      unsubscribe();
    };
  }, []);

  return { orders, isLoading, error };
}

/**
 * Calcula el total del pedido a partir del array de items
 */
function calcularTotal(items?: Array<{ price?: number; quantity?: number }>): number {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
}

/**
 * Convierte el campo createdAt a string legible
 * Soporta Timestamp de Firebase o string
 */
function formatearFecha(createdAt?: Timestamp | string): string {
  if (!createdAt) {
    return new Date().toISOString();
  }

  // Si es un Timestamp de Firebase
  if (createdAt instanceof Timestamp) {
    return createdAt.toDate().toISOString();
  }

  // Si ya es un string
  if (typeof createdAt === "string") {
    return createdAt;
  }

  return new Date().toISOString();
}

// Export por defecto
export default useOrders;