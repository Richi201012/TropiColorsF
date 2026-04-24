import { useMemo } from "react";
import { useOrders, AdminOrder } from "./useOrders";

/**
 * Tipo de cliente agrupado desde pedidos
 */
export type ClienteAgrupado = {
  id: string;
  nombre: string;
  email: string;
  pedidos: number;
  ultimoPedido?: string;
};

export function buildClientesFromOrders(
  orders: AdminOrder[],
): ClienteAgrupado[] {
  console.log("[useClientesFromOrders] 🔄 Agrupando pedidos por cliente...");
  console.log(
    `[useClientesFromOrders] 📦 Total de pedidos recibidos: ${orders.length}`,
  );

  if (!orders || orders.length === 0) {
    console.log("[useClientesFromOrders] ⚠️ No hay pedidos para procesar");
    return [];
  }

  const clientesMap = new Map<
    string,
    {
      nombre: string;
      email: string;
      count: number;
      ultimoPedido?: string;
    }
  >();

  orders.forEach((order: AdminOrder) => {
    const emailKey = (order.email || order.customer || `cliente-${order.id}`)
      .toLowerCase()
      .trim();

    if (!emailKey) {
      console.warn(`[useClientesFromOrders] ⚠️ Pedido sin cliente: ${order.id}`);
      return;
    }

    if (clientesMap.has(emailKey)) {
      const cliente = clientesMap.get(emailKey)!;
      cliente.count += 1;

      if (
        order.createdAt &&
        (!cliente.ultimoPedido || order.createdAt > cliente.ultimoPedido)
      ) {
        cliente.ultimoPedido = order.createdAt;
      }
      return;
    }

    clientesMap.set(emailKey, {
      nombre: order.customer || "Cliente sin nombre",
      email: order.email || "",
      count: 1,
      ultimoPedido: order.createdAt,
    });
  });

  const clientesAgrupados: ClienteAgrupado[] = Array.from(
    clientesMap.values(),
  ).map((cliente, index) => ({
    id: `CL-${String(index + 1).padStart(3, "0")}`,
    nombre: cliente.nombre,
    email: cliente.email,
    pedidos: cliente.count,
    ultimoPedido: cliente.ultimoPedido,
  }));

  clientesAgrupados.sort((a, b) => b.pedidos - a.pedidos);

  console.log(
    `[useClientesFromOrders] ✅ Clientes agrupados: ${clientesAgrupados.length}`,
  );
  console.log("[useClientesFromOrders] 📋 Lista de clientes:", clientesAgrupados);

  return clientesAgrupados;
}

/**
 * Hook para obtener clientes agrupados desde la colección "orders" de Firestore
 *
 * Funcionamiento:
 * 1. Obtiene todos los pedidos en tiempo real (onSnapshot)
 * 2. Agrupa los pedidos por cliente (usando email como identificador único)
 * 3. Cuenta cuántos pedidos tiene cada cliente
 * 4. Genera un array de clientes únicos con su información
 *
 * @returns { clientes, isLoading, error }
 */
export function useClientesFromOrders() {
  const { orders, isLoading, error } = useOrders();

  const clientes = useMemo(() => {
    return buildClientesFromOrders(orders);
  }, [orders]);

  return {
    clientes,
    isLoading,
    error,
  };
}

/**
 * Función utilitaria para filtrar clientes por término de búsqueda
 * Compatible con el buscador existente del componente
 */
export function filtrarClientes(clientes: ClienteAgrupado[], busqueda: string): ClienteAgrupado[] {
  if (!busqueda.trim()) return clientes;

  const termino = busqueda.toLowerCase().trim();
  
  return clientes.filter((cliente) => {
    return (
      cliente.nombre.toLowerCase().includes(termino) ||
      cliente.email.toLowerCase().includes(termino) ||
      cliente.id.toLowerCase().includes(termino)
    );
  });
}
