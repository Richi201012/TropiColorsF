import { getPiecesFromPresentationLabel } from "@/lib/commerce";
import { NARANJA_850_NOTE, PRESENTATIONS } from "./data";
import type {
  Concentration,
  ContactForm,
  ContactFormErrors,
  Product,
} from "./types";

export function getPresentationOptions(
  product: Product,
  concentration: Concentration,
): Array<{ label: string; price: number }> {
  const overridden = product.presentationOverrides?.[concentration];
  if (overridden?.length) {
    return overridden.filter((presentation) => presentation.price > 0);
  }

  const prices = product.prices[concentration];
  if (!prices) {
    return [];
  }

  return PRESENTATIONS.map((label, index) => ({
    label,
    price: prices[index],
  })).filter((presentation) => presentation.price > 0);
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

export function isNaranja850Product(product: Pick<Product, "id" | "name">): boolean {
  return (
    product.id === "naranja-850" ||
    product.name.trim().toLowerCase() === "naranja 850"
  );
}

export function getProductNote(
  product: Pick<Product, "id" | "name" | "note">,
): string {
  if (isNaranja850Product(product)) {
    return NARANJA_850_NOTE;
  }

  return product.note?.trim() || "";
}

export function getProductBadgeNote(
  product: Pick<Product, "id" | "name" | "note">,
): string {
  if (isNaranja850Product(product)) {
    return "";
  }

  return product.note?.trim() || "";
}

export function formatProductNote(note: string): string {
  const trimmed = note.trim();
  if (!trimmed) {
    return "";
  }

  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function validateContactForm(form: ContactForm): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (form.name.length < 2) {
    errors.name = "Nombre requerido";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Correo inválido";
  }

  if (form.message.length < 10) {
    errors.message = "Mensaje requerido";
  }

  return errors;
}

export function getProductDescription(product: Product): string {
  if (product.industrial) {
    return "Pigmento de alto rendimiento para procesos exigentes.";
  }

  const productNote = getProductNote(product);
  if (productNote) {
    return formatProductNote(productNote);
  }

  return "Color intenso y uniforme para aplicaciones exigentes.";
}

export function getProductHighlights(product: Product): string[] {
  if (product.industrial) {
    return ["Alta intensidad", "Uso profesional", "Aplicacion industrial"];
  }

  if (getProductNote(product)) {
    return ["Uso alimentario", "Alta intensidad", "Color estable"];
  }

  return ["Alta intensidad", "Uso profesional", "Color estable"];
}

export function isPieceEligibleLabel(label?: string): boolean {
  return Boolean(getPiecesFromPresentationLabel(label || "")) || /gram/i.test(label || "");
}
