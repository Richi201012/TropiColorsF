import { useMemo } from "react";
import { useOrders, AdminOrder, OrderProduct } from "./useOrders";
import { InvoiceData, InvoiceItem, buildInvoiceNumber } from "../types/invoice";

/**
 * Hook para obtener facturas generadas automáticamente desde la colección "orders" de Firestore
 * 
 * Funcionamiento:
 * 1. Obtiene todos los pedidos en tiempo real (onSnapshot)
 * 2. Transforma cada pedido en formato InvoiceData
 * 3. Mapea correctamente: customerName, customerEmail, customerPhone, metodoPago
 * 4. Calcula el total usando reduce
 * 5. Genera folio único (FAC-0001, FAC-0002, etc.)
 * 
 * @returns { facturas, isLoading, error }
 */
export function useFacturasFromOrders() {
  const { orders, isLoading, error } = useOrders();

  // Función para mapear un pedido a formato InvoiceData
  const mapOrderToInvoice = (order: AdminOrder, index: number): InvoiceData => {
    console.log(`[useFacturasFromOrders] 📝 Mapeando pedido: ${order.id}`);
    
    // Calcular total usando reduce
    const calculatedTotal = order.items.reduce((sum: number, item: OrderProduct) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);

    console.log(`[useFacturasFromOrders] 💰 Total calculado: ${calculatedTotal}`);

    // Mapear items al formato de factura
    const mappedItems: InvoiceItem[] = order.items.map((item, i) => ({
      id: `item-${i}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: (item.price || 0) * (item.quantity || 1),
    }));

    // Generar folio único
    const numeroFolio = index + 1;
    const invoiceNumber = buildInvoiceNumber(numeroFolio, order.createdAt);

    // Mapear método de pago
    const paymentMethod = mapPaymentMethod(order.paymentMethod || order.metodoPago || "efectivo");

    // Mapear estado
    const status = mapInvoiceStatus(order.status);

    // Mapear fecha
    const issueDate = order.createdAt || new Date().toISOString();

    console.log(`[useFacturasFromOrders] 📧 Email: ${order.email}`);
    console.log(`[useFacturasFromOrders] 📱 Teléfono: ${order.phone}`);
    console.log(`[useFacturasFromOrders] 💳 Método de pago: ${paymentMethod}`);

    // Retornar InvoiceData completo
    return {
      invoiceNumber,
      invoiceNumberFormatted: invoiceNumber,
      issueDate,
      paymentMethod,
      status,
      company: {
        name: "Tropicolors",
        address: "Av. Principal 123, Ciudad de México",
        phone: "+52 55 1234 5678",
        email: "contacto@tropicolors.com",
        rfc: "TRO123456ABC",
      },
      customer: {
        name: order.customer || "Cliente sin nombre",
        email: order.email || "sin-email@ejemplo.com",
        phone: order.phone || "",
        address: order.address || "Sin dirección",
      },
      items: mappedItems,
      subtotal: calculatedTotal,
      taxRate: 0, // Ajustar según necesidad
      taxAmount: 0,
      total: calculatedTotal,
      orderId: order.id,
    };
  };

  // Usar useMemo para evitar cálculos innecesarios
  const facturas = useMemo(() => {
    console.log("[useFacturasFromOrders] 🔄 Transformando pedidos en facturas...");
    console.log(`[useFacturasFromOrders] 📦 Total de pedidos: ${orders.length}`);

    if (!orders || orders.length === 0) {
      console.log("[useFacturasFromOrders] ⚠️ No hay pedidos");
      return [];
    }

    const facturasTransformadas = orders.map((order, index) => mapOrderToInvoice(order, index));

    console.log(`[useFacturasFromOrders] ✅ Facturas generadas: ${facturasTransformadas.length}`);
    return facturasTransformadas;
  }, [orders]);

  return {
    facturas,
    isLoading,
    error,
  };
}

/**
 * Mapea el método de pago al formato esperado por InvoiceData
 */
function mapPaymentMethod(method?: string): InvoiceData['paymentMethod'] {
  const methodMap: Record<string, InvoiceData['paymentMethod']> = {
    "efectivo": "efectivo",
    "cash": "efectivo",
    "transferencia": "transferencia",
    "transfer": "transferencia",
    "bank_transfer": "transferencia",
    "tarjeta": "tarjeta",
    "card": "tarjeta",
    "credit_card": "tarjeta",
    "debito": "tarjeta",
    "mercadopago": "mercadopago",
    "oxxo": "oxxo",
    "other": "other",
  };
  return methodMap[method?.toLowerCase() || ""] || "efectivo";
}

/**
 * Mapea el estado del pedido al estado de factura
 */
function mapInvoiceStatus(status: string): InvoiceData['status'] {
  const statusMap: Record<string, InvoiceData['status']> = {
    "pagado": "paid",
    "paid": "paid",
    "entregado": "paid",
    "delivered": "paid",
    "pendiente": "pending",
    "pending": "pending",
    "enviado": "pending",
    "shipped": "pending",
  };
  return statusMap[status?.toLowerCase() || ""] || "pending";
}

/**
 * Función utilitaria para convertir un pedido a InvoiceData
 * Útil para previsualización de facturas
 */
export function crearFacturaDesdePedido(order: AdminOrder): InvoiceData {
  const mapper = new InvoiceMapper();
  return mapper.mapOrderToInvoice(order, 0);
}

/**
 * Clase para mapeo de pedidos a facturas
 */
class InvoiceMapper {
  mapOrderToInvoice(order: AdminOrder, index: number): InvoiceData {
    // Calcular total
    const total = order.items.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);

    // Mapear items
    const items: InvoiceItem[] = order.items.map((item, i) => ({
      id: `item-${i}`,
      name: item.name,
      quantity: item.quantity || 1,
      unitPrice: item.price || 0,
      subtotal: (item.price || 0) * (item.quantity || 1),
    }));

    // Folio
    const invoiceNumber = buildInvoiceNumber(index + 1, order.createdAt);

    // Método de pago
    const paymentMethod = mapPaymentMethod(order.paymentMethod || order.metodoPago);

    // Estado
    const status = mapInvoiceStatus(order.status);

    return {
      invoiceNumber,
      invoiceNumberFormatted: invoiceNumber,
      issueDate: order.createdAt || new Date().toISOString(),
      paymentMethod,
      status,
      company: {
        name: "Tropicolors",
        address: "Av. Principal 123, Ciudad de México",
        phone: "+52 55 1234 5678",
        email: "contacto@tropicolors.com",
        rfc: "TRO123456ABC",
      },
      customer: {
        name: order.customer || "Cliente sin nombre",
        email: order.email || "sin-email@ejemplo.com",
        phone: order.phone || "",
        address: order.address || "Sin dirección",
      },
      items,
      subtotal: total,
      taxRate: 0,
      taxAmount: 0,
      total,
      orderId: order.id,
    };
  }
}
