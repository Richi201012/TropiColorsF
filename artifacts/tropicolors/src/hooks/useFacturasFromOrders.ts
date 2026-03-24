import { useMemo } from "react";
import { useOrders, AdminOrder, OrderProduct } from "./useOrders";

/**
 * Tipo de factura transformada desde pedidos
 */
export type FacturaFromOrder = {
  id: string;           // ID único de la factura (folio)
  orderId: string;      // ID del pedido original
  customer: string;     // Nombre del cliente (customerName)
  total: number;        // Total calculado desde items
  status: "pagada" | "pendiente";
  items: OrderProduct[];
  createdAt: string;    // Fecha del pedido
};

/**
 * Hook para obtener facturas generadas automáticamente desde la colección "orders" de Firestore
 * 
 * Funcionamiento:
 * 1. Obtiene todos los pedidos en tiempo real (onSnapshot)
 * 2. Transforma cada pedido en una factura
 * 3. Calcula el total sumando los precios de los items (usando reduce)
 * 4. Genera un folio único (FAC-0001, FAC-0002, etc.)
 * 5. Determina el estado basado en el estado del pedido
 * 
 * @returns { facturas, isLoading, error }
 */
export function useFacturasFromOrders() {
  const { orders, isLoading, error } = useOrders();

  // Usar useMemo para evitar cálculos innecesarios en cada render
  const facturas = useMemo(() => {
    console.log("[useFacturasFromOrders] 🔄 Transformando pedidos en facturas...");
    console.log(`[useFacturasFromOrders] 📦 Total de pedidos recibidos: ${orders.length}`);

    // Si no hay pedidos, retornar array vacío
    if (!orders || orders.length === 0) {
      console.log("[useFacturasFromOrders] ⚠️ No hay pedidos para transformar en facturas");
      return [];
    }

    // Transformar cada pedido en una factura
    const facturasTransformadas = orders.map((order: AdminOrder, index: number) => {
      console.log(`[useFacturasFromOrders] 📝 Procesando pedido: ${order.id}`);

      // Calcular el total usando reduce
      const totalCalculado = order.items.reduce((suma: number, item: OrderProduct) => {
        const precio = item.price || 0;
        const cantidad = item.quantity || 1;
        return suma + (precio * cantidad);
      }, 0);

      console.log(`[useFacturasFromOrders] 💰 Total calculado: ${totalCalculado}`);

      // Determinar estado de la factura basado en el estado del pedido
      // "pagado" -> "pagada", cualquier otro -> "pendiente"
      const estadoFactura: "pagada" | "pendiente" = 
        order.status === "pagado" ? "pagada" : "pendiente";

      console.log(`[useFacturasFromOrders] 📊 Estado de factura: ${estadoFactura}`);

      // Generar folio único (FAC-0001, FAC-0002, etc.)
      const numeroFolio = index + 1;
      const folio = `FAC-${String(numeroFolio).padStart(4, "0")}`;

      console.log(`[useFacturasFromOrders] 🆔 Folio generado: ${folio}`);

      // Retornar la factura transformada
      return {
        id: folio,
        orderId: order.id,
        customer: order.customer,
        total: totalCalculado,
        status: estadoFactura,
        items: order.items,
        createdAt: order.createdAt,
      };
    });

    console.log(`[useFacturasFromOrders] ✅ Facturas generadas: ${facturasTransformadas.length}`);
    console.log("[useFacturasFromOrders] 📋 Lista de facturas:", facturasTransformadas);

    return facturasTransformadas;
  }, [orders]);

  return {
    facturas,
    isLoading,
    error,
  };
}

/**
 * Función utilitaria para calcular el total desde un array de items
 * Utiliza reduce para sumar precio * cantidad de cada item
 */
export function calcularTotalDesdeItems(items: OrderProduct[]): number {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((suma, item) => {
    const precio = item.price || 0;
    const cantidad = item.quantity || 1;
    return suma + (precio * cantidad);
  }, 0);
}

/**
 * Función para formatear un número como moneda
 */
export function formatearMoneda(amount: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Función para convertir fecha de Timestamp a string legible
 */
export function formatearFecha(timestamp: string | Date): string {
  if (!timestamp) return "";
  
  try {
    const fecha = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return fecha.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(timestamp);
  }
}