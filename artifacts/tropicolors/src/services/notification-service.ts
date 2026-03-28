import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CreateNotificationInput = {
  orderId: string;
  customerName: string;
  total: number;
  requiresInvoice?: boolean;
  customerRfc?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const payload = {
    orderId: input.orderId,
    customerName: input.customerName,
    total: input.total,
    requiresInvoice: Boolean(input.requiresInvoice),
    customerRfc: input.customerRfc || null,
    estado: "no_leida",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "notifications"), payload);
  return docRef.id;
}

export async function markNotificationAsRead(notificationId: string) {
  const notifRef = doc(db, "notifications", notificationId);
  await updateDoc(notifRef, { estado: "leida" });
}

export async function markAllNotificationsAsRead() {
  const q = query(
    collection(db, "notifications"),
    where("estado", "==", "no_leida"),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { estado: "leida" });
  });
  await batch.commit();
}

export async function deleteNotification(notificationId: string) {
  const notifRef = doc(db, "notifications", notificationId);
  await deleteDoc(notifRef);
}
