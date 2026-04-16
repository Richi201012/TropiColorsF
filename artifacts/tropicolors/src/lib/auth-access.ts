export const INVENTORY_USER_EMAIL = "m_tropicolorsinv@hotmail.com";

export function normalizeAuthEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

export function isInventoryUserEmail(email?: string | null): boolean {
  return normalizeAuthEmail(email) === INVENTORY_USER_EMAIL;
}
