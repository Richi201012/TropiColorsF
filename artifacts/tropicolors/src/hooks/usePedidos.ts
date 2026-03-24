import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  QuerySnapshot,
  DocumentData 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Tipos que coinciden con Admin.tsx
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
};

// Tipo de dato desde Firestore (puede variar según cómo guardes los datos)
type FirestoreOrder = {
  customer?: string;
  customerName?: string; // alternativa
  email?: string;
  address?: string;
  shippingAddress?: string; // alternativa
  total?: number;
  amount?: number; // alternativa
  status?: string;
  items?: OrderProduct[];
  products?: OrderProduct[]; // alternativa
  createdAt?: string;
  created?: number; // timestamp
};

// Hook para obtener pedidos en tiempo real desde Firestore
export function usePedidos() {
  const [pedidos, setPedidos] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[usePedidos] Inicializando escucha de Firestore...");

    // Referencia a la colección "pedidos"
    const pedidosRef = collection(db, "pedidos");
    
    // Query para ordenar por fecha (opcional - ajusta según tu estructura)
    const q = query(pedidosRef, orderBy("createdAt", "desc"));

    // Escucha en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        console.log(`[usePedidos] Recibidos ${snapshot.size} documentos de Firestore`);

        const pedidosData: AdminOrder[] = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreOrder;
          
          // Transformar datos de Firestore al formato AdminOrder
          return {
            id: doc.id,
            // customer: intenta ambos campos
            customer: data.customer || data.customerName || "Cliente sin nombre",
            // email
            email: data.email || "sin-email@ejemplo.com",
            // address: intenta ambos campos
            address: data.address || data.shippingAddress || "Dirección no especificada",
            // total: intenta ambos campos
            total: data.total ?? data.amount ?? 0,
            // status: asegura que sea un valor válido
            status: validarStatus(data.status),
            // items: intenta ambos campos
            items: data.items || data.products || [],
          };
        });

        setPedidos(pedidosData);
        setIsLoading(false);
        setError(null);
        
        console.log("[usePedidos] Pedidos procesados:", pedidosData);
      },
      (err) => {
        console.error("[usePedidos] Error de Firestore:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    // Cleanup: cancelar suscripción al desmontar componente
    return () => {
      console.log("[usePedidos] Limpiando suscripción...");
      unsubscribe();
    };
  }, []);

  return { pedidos, isLoading, error };
}

// Función auxiliar para validar el status
function validarStatus(status?: string): OrderStatus {
  const estadosValidos: OrderStatus[] = ["pendiente", "pagado", "enviado", "entregado"];
  
  if (status && estadosValidos.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  
  return "pendiente"; // valor por defecto
}

export default usePedidos;