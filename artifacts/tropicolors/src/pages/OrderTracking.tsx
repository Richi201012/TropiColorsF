import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { AlertCircle, Clock3 } from "lucide-react";
import { db } from "@/lib/firebase";
import { ORDER_TRACKING_COLLECTION } from "@/lib/order-tracking";
import {
  OrderTrackingView,
  TrackingPageActions,
} from "@/components/OrderTrackingView";

export type TrackingItem = {
  productName?: string;
  quantity?: number;
  size?: string;
  subtotal?: number;
};

export type TrackingHistoryEntry = {
  estado?: string;
  label?: string;
  description?: string;
  fecha?: Timestamp | string | Date;
  motivo?: string | null;
};

export type OrderTrackingData = {
  orderId?: string;
  orderNumber?: string;
  trackingToken?: string;
  status?: string;
  statusLabel?: string;
  description?: string;
  subtotal?: number;
  shippingFee?: number;
  total?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items?: TrackingItem[];
  historial?: TrackingHistoryEntry[];
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  cancellationReason?: string;
  createdAt?: Timestamp | string | Date;
  updatedAt?: Timestamp | string | Date;
};

export default function OrderTracking() {
  const [, params] = useRoute<{ trackingToken: string }>(
    "/pedido/:trackingToken",
  );
  const trackingToken = params?.trackingToken || "";
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackingToken) {
      setIsLoading(false);
      setError("Link de seguimiento inválido.");
      return;
    }

    const trackingRef = doc(db, ORDER_TRACKING_COLLECTION, trackingToken);

    return onSnapshot(
      trackingRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setError("Este pedido no existe o fue eliminado.");
          setIsLoading(false);
          return;
        }

        setOrder(snapshot.data() as OrderTrackingData);
        setError(null);
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error(
          "[OrderTracking] Error al leer seguimiento:",
          snapshotError,
        );
        setError("No pudimos cargar el seguimiento del pedido.");
        setIsLoading(false);
      },
    );
  }, [trackingToken]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Clock3
            className="h-10 w-10 animate-pulse text-sky-700"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Cargando pedido
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Estamos consultando el estado actual.
          </p>
          <TrackingPageActions className="mt-6" compact />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[28px] border border-rose-100 bg-white p-10 text-center shadow-sm">
          <AlertCircle
            className="h-11 w-11 text-rose-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Seguimiento no disponible
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            {error}
          </p>
          <TrackingPageActions className="mt-6" compact />
        </div>
      </main>
    );
  }

  return <OrderTrackingView order={order} trackingToken={trackingToken} />;
}
