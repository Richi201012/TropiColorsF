import { Timestamp } from "firebase/firestore";

export type ReferenceStatus = "active" | "draft";

export type SiteReference = {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  message: string;
  rating: number;
  status: ReferenceStatus;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreReference = {
  name?: string;
  company?: string;
  role?: string;
  location?: string;
  message?: string;
  rating?: number;
  status?: string;
  createdAt?:
    | Timestamp
    | string
    | Date
    | { seconds: number; nanoseconds?: number }
    | { _seconds: number; _nanoseconds?: number };
  updatedAt?:
    | Timestamp
    | string
    | Date
    | { seconds: number; nanoseconds?: number }
    | { _seconds: number; _nanoseconds?: number };
  [key: string]: unknown;
};

export function normalizeReferenceDate(input: unknown): string {
  if (!input) return "";

  if (input instanceof Timestamp) {
    return input.toDate().toISOString();
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  if (
    typeof input === "object" &&
    input !== null &&
    "seconds" in input &&
    typeof (input as Record<string, unknown>).seconds === "number"
  ) {
    return new Date(
      ((input as Record<string, unknown>).seconds as number) * 1000,
    ).toISOString();
  }

  if (
    typeof input === "object" &&
    input !== null &&
    "_seconds" in input &&
    typeof (input as Record<string, unknown>)._seconds === "number"
  ) {
    return new Date(
      ((input as Record<string, unknown>)._seconds as number) * 1000,
    ).toISOString();
  }

  if (typeof input === "string") {
    return input;
  }

  return "";
}

export function normalizeReference(
  id: string,
  data: FirestoreReference,
): SiteReference {
  const createdAt = normalizeReferenceDate(data.createdAt);
  const updatedAt =
    normalizeReferenceDate(data.updatedAt) || createdAt || new Date().toISOString();

  return {
    id,
    name: String(data.name || "Cliente"),
    company: String(data.company || ""),
    role: String(data.role || ""),
    location: String(data.location || ""),
    message: String(data.message || ""),
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    status: data.status === "draft" ? "draft" : "active",
    createdAt,
    updatedAt,
  };
}
