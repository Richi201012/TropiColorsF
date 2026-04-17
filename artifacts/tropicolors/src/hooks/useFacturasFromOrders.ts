import { useMemo } from "react";
import { useOrders, AdminOrder, OrderProduct } from "./useOrders";
import {
  InvoiceData,
  InvoiceItem,
  buildInvoiceNumber,
} from "../types/invoice";
import { calculateCartItemSubtotal } from "@/lib/commerce";
import { TROPICOLORS_COMPANY_INFO } from "@/lib/company-info";

/**
 * Hook para obtener facturas generadas automaticamente desde la coleccion
 * "orders" de Firestore.
 */
export function useFacturasFromOrders() {
  const { orders, isLoading, error } = useOrders();

  const mapOrderToInvoice = (order: AdminOrder, index: number): InvoiceData => {
    const calculatedTotal = order.items.reduce(
      (sum: number, item: OrderProduct) => {
        return sum + calculateCartItemSubtotal(item);
      },
      0,
    );

    const mappedItems: InvoiceItem[] = order.items.map((item, itemIndex) => ({
      id: `item-${itemIndex}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: calculateCartItemSubtotal(item),
      description: item.description,
    }));

    const invoiceNumber = buildInvoiceNumber(index + 1, order.createdAt);
    const paymentMethod = mapPaymentMethod(
      order.paymentMethod || order.metodoPago || "efectivo",
    );
    const status = mapInvoiceStatus(order.status);
    const issueDate = order.createdAt || new Date().toISOString();

    return {
      invoiceNumber,
      invoiceNumberFormatted: invoiceNumber,
      issueDate,
      paymentMethod,
      status,
      company: TROPICOLORS_COMPANY_INFO,
      customer: {
        name: order.customer || "Cliente sin nombre",
        email: order.email || "sin-email@ejemplo.com",
        phone: order.phone || "",
        address: order.address || "Sin direccion",
        exteriorNumber: order.exteriorNumber || "",
        interiorNumber: order.interiorNumber || "",
        city: order.municipality || "",
        state: order.state || "",
        postalCode: order.postalCode || "",
        rfc: order.requiresInvoice ? order.customerRfc || "" : "",
      },
      items: mappedItems,
      subtotal: calculatedTotal,
      taxRate: 0,
      taxAmount: 0,
      total: calculatedTotal,
      orderId: order.id,
    };
  };

  const facturas = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    return orders.map((order, index) => mapOrderToInvoice(order, index));
  }, [orders]);

  return {
    facturas,
    isLoading,
    error,
  };
}

function mapPaymentMethod(method?: string): InvoiceData["paymentMethod"] {
  const methodMap: Record<string, InvoiceData["paymentMethod"]> = {
    efectivo: "efectivo",
    cash: "efectivo",
    transferencia: "transferencia",
    transfer: "transferencia",
    bank_transfer: "transferencia",
    tarjeta: "tarjeta",
    card: "tarjeta",
    credit_card: "tarjeta",
    debito: "tarjeta",
    mercadopago: "mercadopago",
    oxxo: "oxxo",
    other: "other",
  };

  return methodMap[method?.toLowerCase() || ""] || "efectivo";
}

function mapInvoiceStatus(status: string): InvoiceData["status"] {
  const statusMap: Record<string, InvoiceData["status"]> = {
    pagado: "paid",
    paid: "paid",
    entregado: "paid",
    delivered: "paid",
    pendiente: "pending",
    pending: "pending",
    enviado: "pending",
    shipped: "pending",
  };

  return statusMap[status?.toLowerCase() || ""] || "pending";
}

export function crearFacturaDesdePedido(order: AdminOrder): InvoiceData {
  const mapper = new InvoiceMapper();
  return mapper.mapOrderToInvoice(order, 0);
}

class InvoiceMapper {
  mapOrderToInvoice(order: AdminOrder, index: number): InvoiceData {
    const total = order.items.reduce((sum, item) => {
      return sum + calculateCartItemSubtotal(item);
    }, 0);

    const items: InvoiceItem[] = order.items.map((item, itemIndex) => ({
      id: `item-${itemIndex}`,
      name: item.name,
      quantity: item.quantity || 1,
      unitPrice: item.price || 0,
      subtotal: calculateCartItemSubtotal(item),
      description: item.description,
    }));

    const invoiceNumber = buildInvoiceNumber(index + 1, order.createdAt);
    const paymentMethod = mapPaymentMethod(
      order.paymentMethod || order.metodoPago,
    );
    const status = mapInvoiceStatus(order.status);

    return {
      invoiceNumber,
      invoiceNumberFormatted: invoiceNumber,
      issueDate: order.createdAt || new Date().toISOString(),
      paymentMethod,
      status,
      company: TROPICOLORS_COMPANY_INFO,
      customer: {
        name: order.customer || "Cliente sin nombre",
        email: order.email || "sin-email@ejemplo.com",
        phone: order.phone || "",
        address: order.address || "Sin direccion",
        exteriorNumber: order.exteriorNumber || "",
        interiorNumber: order.interiorNumber || "",
        city: order.municipality || "",
        state: order.state || "",
        postalCode: order.postalCode || "",
        rfc: order.requiresInvoice ? order.customerRfc || "" : "",
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
