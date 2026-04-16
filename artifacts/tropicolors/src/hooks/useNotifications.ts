import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Notification = {
  id: string;
  orderId: string;
  customerName: string;
  total: number;
  requiresInvoice: boolean;
  customerRfc?: string;
  estado: "no_leida" | "leida";
  createdAt: string;
};

type FirestoreNotification = {
  orderId?: string;
  customerName?: string;
  total?: number;
  requiresInvoice?: boolean;
  customerRfc?: string | null;
  estado?: string;
  createdAt?: Timestamp | string | { seconds: number; nanoseconds?: number };
  [key: string]: unknown;
};

type SnapshotNotificationDoc = {
  id: string;
  data: () => FirestoreNotification;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState<Notification | null>(
    null,
  );
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Query SIN orderBy para evitar fallos si algún documento no tiene createdAt
    const q = query(collection(db, "notifications"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mapNotificationDoc = (
          docSnap: SnapshotNotificationDoc,
        ): Notification => {
          const data = docSnap.data() as FirestoreNotification;
          let fecha = "";

          // Timestamp de Firebase (instancia)
          if (data.createdAt instanceof Timestamp) {
            fecha = data.createdAt.toDate().toISOString();
          }
          // Objeto serializado con seconds (Firestore Timestamp)
          else if (
            data.createdAt &&
            typeof data.createdAt === "object" &&
            "seconds" in data.createdAt &&
            typeof (data.createdAt as Record<string, unknown>).seconds ===
              "number"
          ) {
            fecha = new Date(
              ((data.createdAt as Record<string, unknown>).seconds as number) *
                1000,
            ).toISOString();
          }
          // String ISO
          else if (typeof data.createdAt === "string") {
            fecha = data.createdAt;
          }

          return {
            id: docSnap.id,
            orderId: String(data.orderId || ""),
            customerName: String(data.customerName || "Cliente"),
            total: Number(data.total) || 0,
            requiresInvoice: Boolean(data.requiresInvoice),
            customerRfc: data.customerRfc
              ? String(data.customerRfc)
              : undefined,
            estado: data.estado === "leida" ? "leida" : "no_leida",
            createdAt: fecha,
          };
        };

        const items: Notification[] = snapshot.docs.map(mapNotificationDoc);

        // Ordenar localmente por fecha (más recientes primero)
        items.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        if (!isFirstLoad.current) {
          const addedUnread = snapshot.docChanges()
            .filter((change) => change.type === "added")
            .map((change) => mapNotificationDoc(change.doc))
            .filter((notification) => notification.estado === "no_leida")
            .sort((a, b) => {
              if (!a.createdAt && !b.createdAt) return 0;
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              return (
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });

          if (addedUnread[0]) {
            setNewNotification(addedUnread[0]);
          }
        }

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
