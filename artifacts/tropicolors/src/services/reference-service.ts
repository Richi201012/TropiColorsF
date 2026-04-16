import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ReferenceStatus } from "@/types/reference";

export type ReferenceInput = {
  name: string;
  company?: string;
  role?: string;
  location?: string;
  message: string;
  rating: number;
  status: ReferenceStatus;
};

function buildReferencePayload(input: ReferenceInput) {
  return {
    name: input.name.trim(),
    company: input.company?.trim() || "",
    role: input.role?.trim() || "",
    location: input.location?.trim() || "",
    message: input.message.trim(),
    rating: Math.min(5, Math.max(1, Number(input.rating) || 5)),
    status: input.status,
    updatedAt: serverTimestamp(),
  };
}

export async function createReference(input: ReferenceInput) {
  const payload = {
    ...buildReferencePayload(input),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "references"), payload);
  return docRef.id;
}

export async function updateReference(referenceId: string, input: ReferenceInput) {
  await setDoc(doc(db, "references", referenceId), buildReferencePayload(input), {
    merge: true,
  });
}

export async function deleteReference(referenceId: string) {
  await deleteDoc(doc(db, "references", referenceId));
}
