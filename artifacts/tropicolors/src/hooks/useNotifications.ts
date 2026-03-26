import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Notification = {
  id: string;
  orderId: string;
  customerName: string;
  total: number;
  estado: "no_leida" | "leida";
  createdAt: string;
};

type FirestoreNotification = {
  orderId?: string;
  customerName?: string;
  total?: number;
  estado?: string;
  createdAt?: Timestamp | string;
  [key: string]: unknown;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState<Notification | null>(
    null,
  );
  const isFirstLoad = useRef(true);
  const prevCount = useRef(0);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Notification[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as FirestoreNotification;
          let fecha = "";
          if (data.createdAt instanceof Timestamp) {
            fecha = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === "string") {
            fecha = data.createdAt;
          }

          return {
            id: docSnap.id,
            orderId: String(data.orderId || ""),
            customerName: String(data.customerName || "Cliente"),
            total: Number(data.total) || 0,
            estado: data.estado === "leida" ? "leida" : "no_leida",
            createdAt: fecha,
          };
        });

        if (!isFirstLoad.current && items.length > prevCount.current) {
          const newest = items[0];
          if (newest && newest.estado === "no_leida") {
            setNewNotification(newest);
          }
        }

        prevCount.current = items.length;
        isFirstLoad.current = false;
        setNotifications(items);
        setIsLoading(false);
      },
      (err) => {
        console.error("[useNotifications] Error:", err);
        setError("No se pudieron cargar las notificaciones.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(
    (n) => n.estado === "no_leida",
  ).length;

  const clearNewNotification = () => setNewNotification(null);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    newNotification,
    clearNewNotification,
  };
}
