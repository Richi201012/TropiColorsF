import { useState, useEffect } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  X,
  Loader2,
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  AlertTriangle,
  Printer,
  Clock,
} from "lucide-react";

type OrderDetailItem = {
  name: string;
  quantity: number;
  price: number;
};

type HistorialEntry = {
  estado: string;
  fecha: string;
};

type OrderDetail = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: OrderDetailItem[];
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  historial: HistorialEntry[];
};

type FirestoreOrderData = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingAddress?: string;
  shippingExteriorNumber?: string;
  shippingInteriorNumber?: string;
  shippingNeighborhood?: string;
  shippingMunicipality?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  status?: string;
  paymentMethod?: string;
  metodoPago?: string;
  total?: number;
  createdAt?: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
  historial?: Array<{
    estado?: string;
    fecha?: Timestamp | string | Date;
  }>;
  items?: Array<{
    name?: string;
    productName?: string;
    quantity?: number;
    price?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

function mapStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendiente",
    pendiente: "Pendiente",
    pagado: "Pagado",
    paid: "Pagado",
    enviado: "Enviado",
    shipped: "Enviado",
    entregado: "Entregado",
    delivered: "Entregado",
  };
  return map[status] || status;
}

function statusClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "pendiente" || s === "pending")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "pagado" || s === "paid")
    return "bg-sky-50 text-sky-700 border-sky-200";
  if (s === "enviado" || s === "shipped")
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "entregado" || s === "delivered")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function formatDate(input: Timestamp | string | Date | undefined): string {
  if (!input) return "Fecha no disponible";
  // Server timestamp no resuelto (sentinel de Firestore)
  if (
    typeof input === "object" &&
    input !== null &&
    "_methodName" in input &&
    (input as Record<string, unknown>)._methodName === "serverTimestamp"
  ) {
    return "Fecha no disponible";
  }
  let date: Date;
  if (input instanceof Timestamp) {
    date = input.toDate();
  } else if (typeof input === "string") {
    date = new Date(input);
  } else if (input instanceof Date) {
    date = input;
  } else if (
    typeof input === "object" &&
    "seconds" in input &&
    typeof (input as Record<string, unknown>).seconds === "number"
  ) {
    date = new Date(
      ((input as Record<string, unknown>).seconds as number) * 1000,
    );
  } else if (
    typeof input === "object" &&
    "_seconds" in input &&
    typeof (input as Record<string, unknown>)._seconds === "number"
  ) {
    date = new Date(
      ((input as Record<string, unknown>)._seconds as number) * 1000,
    );
  } else {
    return "Fecha no disponible";
  }
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildAddress(data: FirestoreOrderData): string {
  const parts: string[] = [];
  if (data.shippingAddress) parts.push(data.shippingAddress);
  else if (data.customerAddress) parts.push(data.customerAddress);
  if (data.shippingExteriorNumber) parts.push(`Ext. ${data.shippingExteriorNumber}`);
  if (data.shippingInteriorNumber) parts.push(`Int. ${data.shippingInteriorNumber}`);
  if (data.shippingNeighborhood) parts.push(data.shippingNeighborhood);
  if (data.shippingMunicipality) parts.push(data.shippingMunicipality);
  if (data.shippingState) parts.push(data.shippingState);
  if (data.shippingPostalCode) parts.push(`C.P. ${data.shippingPostalCode}`);
  return parts.length > 0 ? parts.join(", ") : "Sin dirección";
}

export function OrderDetailModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      console.log("[OrderDetailModal] Buscando orderId:", orderId);
      try {
        const docRef = doc(db, "orders", orderId);
        const snapshot = await getDoc(docRef);
        console.log("[OrderDetailModal] snapshot.exists:", snapshot.exists());

        if (!snapshot.exists()) {
          console.warn("[OrderDetailModal] No existe:", orderId);
          if (!cancelled) {
            setError("El pedido no fue encontrado.");
            setIsLoading(false);
          }
          return;
        }

        const data = snapshot.data() as FirestoreOrderData;
        console.log("[OrderDetailModal] data cruda:", JSON.stringify(data));

        const items: OrderDetailItem[] = (data.items || []).map((item) => ({
          name: item.name || item.productName || "Producto",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        }));
        console.log(
          "[OrderDetailModal] items mapeados:",
          JSON.stringify(items),
        );

        const totalFromData = Number(data.total) || 0;
        const totalFromItems = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const calculatedTotal =
          totalFromData > 0 ? totalFromData : totalFromItems;
        console.log("[OrderDetailModal] total:", calculatedTotal);

        if (!cancelled) {
          const mappedHistorial: HistorialEntry[] = (data.historial || []).map(
            (entry) => ({
              estado: mapStatus(entry.estado || "pendiente"),
              fecha: formatDate(entry.fecha),
            }),
          );

          setOrder({
            id: snapshot.id,
            customer: data.customerName || data.customerEmail || "Cliente",
            email: data.customerEmail || "",
            phone: data.customerPhone || "",
            address: buildAddress(data),
            items,
            total: calculatedTotal,
            status: mapStatus(data.status || "pendiente"),
            paymentMethod: data.paymentMethod || data.metodoPago || "N/A",
            createdAt: (() => {
              const created = formatDate(data.createdAt);
              if (created !== "Fecha no disponible") return created;
              const updated = formatDate(data.updatedAt);
              return updated !== "Fecha no disponible" ? updated : created;
            })(),
            historial: mappedHistorial,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[OrderDetailModal] Error completo:", err);
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Error al cargar el pedido.";
          setError(`Error: ${msg}`);
          setIsLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl shadow-slate-900/20 transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Detalle del pedido
              </h3>
              <p className="text-xs text-white/60">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando pedido...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <p className="text-xs text-muted-foreground font-mono bg-slate-100 px-3 py-1.5 rounded-lg">
                ID: {orderId}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          )}

          {order && !isLoading && !error && (
            <div className="space-y-5">
              {/* Customer + Status Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Cliente
                    </span>
                  </div>
                  <p className="text-base font-bold text-slate-950">
                    {order.customer}
                  </p>
                  {order.email && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  )}
                  {order.phone && (
                    <p className="text-xs text-muted-foreground">
                      {order.phone}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Fecha
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">
                    {order.createdAt}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Estado:
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address + Payment */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Dirección de envío
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {order.address}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Método de pago
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-950 capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="bg-slate-950 px-5 py-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Productos
                  </h4>
                </div>

                <div className="divide-y divide-border/40">
                  {/* Header */}
                  <div className="grid grid-cols-[2fr_0.7fr_0.8fr_0.8fr] gap-3 bg-slate-50 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Producto</span>
                    <span className="text-center">Cantidad</span>
                    <span className="text-right">Precio</span>
                    <span className="text-right">Total</span>
                  </div>

                  {/* Items */}
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="grid grid-cols-[2fr_0.7fr_0.8fr_0.8fr] gap-3 px-5 py-3 text-sm transition-colors hover:bg-primary/5"
                    >
                      <span className="font-medium text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-center text-slate-600">
                        {item.quantity}
                      </span>
                      <span className="text-right text-slate-600">
                        ${item.price.toLocaleString("es-MX")}
                      </span>
                      <span className="text-right font-semibold text-slate-950">
                        ${(item.price * item.quantity).toLocaleString("es-MX")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Historial Timeline */}
                {order.historial.length > 0 && (
                  <div className="rounded-2xl border border-border/50 bg-white p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={14} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Historial de estados
                      </span>
                    </div>
                    <div className="space-y-0">
                      {order.historial.map((entry, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full shrink-0 ${
                                index === order.historial.length - 1
                                  ? "bg-primary ring-4 ring-primary/20"
                                  : "bg-slate-300"
                              }`}
                            />
                            {index < order.historial.length - 1 && (
                              <div className="w-0.5 h-8 bg-slate-200" />
                            )}
                          </div>
                          <div
                            className={
                              index < order.historial.length - 1 ? "pb-4" : ""
                            }
                          >
                            <p className="text-sm font-semibold text-slate-950">
                              {entry.estado}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.fecha}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-border/50 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-950">
                      Total del pedido
                    </span>
                    <span className="text-2xl font-display font-bold text-primary">
                      ${order.total.toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {order && !isLoading && !error && (
          <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
            >
              <Printer size={15} />
              Ver pedido completo
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
