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

  // Usar useMemo para evitar cálculos innecesarios en cada render
  const clientes = useMemo(() => {
    console.log("[useClientesFromOrders] 🔄 Agrupando pedidos por cliente...");
    console.log(`[useClientesFromOrders] 📦 Total de pedidos recibidos: ${orders.length}`);

    // Si no hay pedidos, retornar array vacío
    if (!orders || orders.length === 0) {
      console.log("[useClientesFromOrders] ⚠️ No hay pedidos para procesar");
      return [];
    }

    // Objeto para agrupar clientes (clave = email, valor = datos del cliente)
    const clientesMap = new Map<string, {
      nombre: string;
      email: string;
      count: number;
      ultimoPedido?: string;
    }>();

    // Iterar sobre cada pedido y agrupar por cliente
    orders.forEach((order: AdminOrder) => {
      // Usar email como identificador único del cliente
      // Si no hay email, usar un ID temporal
      const emailKey = (order.email || order.customer || `cliente-${order.id}`).toLowerCase().trim();
      
      if (!emailKey || emailKey === "") {
        console.warn(`[useClientesFromOrders] ⚠️ Pedido sin cliente: ${order.id}`);
        return;
      }

      // Si el cliente ya existe, incrementar contador de pedidos
      if (clientesMap.has(emailKey)) {
        const cliente = clientesMap.get(emailKey)!;
        cliente.count += 1;
        
        // Actualizar último pedido si es más reciente
        if (order.createdAt && (!cliente.ultimoPedido || order.createdAt > cliente.ultimoPedido)) {
          cliente.ultimoPedido = order.createdAt;
        }
      } else {
        // Crear nuevo cliente
        clientesMap.set(emailKey, {
          nombre: order.customer || "Cliente sin nombre",
          email: order.email || "",
          count: 1,
          ultimoPedido: order.createdAt,
        });
      }
    });

    // Convertir el Map a array de clientes
    const clientesAgrupados: ClienteAgrupado[] = Array.from(clientesMap.values()).map((cliente, index) => ({
      id: `CL-${String(index + 1).padStart(3, "0")}`,
      nombre: cliente.nombre,
      email: cliente.email,
      pedidos: cliente.count,
      ultimoPedido: cliente.ultimoPedido,
    }));

    // Ordenar por número de pedidos (más pedidos primero)
    clientesAgrupados.sort((a, b) => b.pedidos - a.pedidos);

    console.log(`[useClientesFromOrders] ✅ Clientes agrupados: ${clientesAgrupados.length}`);
    console.log("[useClientesFromOrders] 📋 Lista de clientes:", clientesAgrupados);

    return clientesAgrupados;
  }, [orders]); // Solo recalcular cuando cambie orders

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