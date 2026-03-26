import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un Timestamp de Firebase, string ISO o Date a formato legible en español.
 * Maneja todos los formatos posibles de Firestore:
 * - Timestamp de Firebase (instancia de Timestamp)
 * - Objeto serializado con { seconds, nanoseconds }
 * - String ISO
 * - Date nativo
 * - null/undefined
 */
export function formatFecha(
  timestamp:
    | Timestamp
    | string
    | Date
    | { seconds: number; nanoseconds?: number }
    | null
    | undefined,
  options?: { includeTime?: boolean },
): string {
  if (!timestamp) return "Sin fecha";

  const includeTime = options?.includeTime ?? true;
  let date: Date | null = null;

  // Timestamp de Firebase (instancia)
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  }
  // Date nativo
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  // String ISO
  else if (typeof timestamp === "string") {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }
  // Objeto serializado con seconds (Firestore Timestamp sin importar clase)
  else if (
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    typeof timestamp.seconds === "number"
  ) {
    date = new Date(timestamp.seconds * 1000);
  }

  if (!date || Number.isNaN(date.getTime())) return "Sin fecha";

  if (includeTime) {
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
