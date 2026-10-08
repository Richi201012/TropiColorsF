import { Router, type Request, type Response, type NextFunction } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { logger } from "../lib/logger";

const router = Router();
const DEFAULT_API_URL = "https://inventario-tropicolors.onrender.com/api";
const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 60_000;

type JsonRecord = Record<string, unknown>;

class InventoryIntegrationError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

let sessionToken: { value: string; expiresAt: number } | null = null;
let inventoryCache: { data: InventoryResponse; expiresAt: number } | null = null;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === "false" || value === 0) return false;
  if (value === "true" || value === 1) return true;
  return fallback;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function apiBaseUrl(): string {
  return (process.env.INVENTORY_API_BASE_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

function allowedAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS || "m_tropicolors1@hotmail.com")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function adminAuth() {
  const name = "tropicolors-inventory-proxy";
  const app =
    getApps().find((candidate) => candidate.name === name) ??
    initializeApp(
      { projectId: process.env.FIREBASE_PROJECT_ID || "tropicolors2-67b4a" },
      name,
    );
  return getAuth(app);
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ code: "authentication_required", message: "Inicia sesión para consultar el inventario." });
    return;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    const email = decoded.email?.toLowerCase() || "";
    if (decoded.admin !== true && !allowedAdminEmails().has(email)) {
      res.status(403).json({ code: "admin_required", message: "Tu cuenta no tiene acceso al inventario administrativo." });
      return;
    }
    next();
  } catch {
    res.status(401).json({ code: "invalid_session", message: "Tu sesión venció. Vuelve a iniciar sesión." });
  }
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<{ status: number; data: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => null);
    return { status: response.status, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new InventoryIntegrationError(504, "inventory_timeout", "El inventario tardó demasiado en responder.");
    }
    throw new InventoryIntegrationError(502, "inventory_unreachable", "No fue posible conectar con el inventario central.");
  } finally {
    clearTimeout(timeout);
  }
}

async function getInventoryToken(forceRefresh = false): Promise<string> {
  const fixedToken = text(process.env.INVENTORY_API_TOKEN);
  if (fixedToken) return fixedToken;

  if (!forceRefresh && sessionToken && sessionToken.expiresAt > Date.now()) {
    return sessionToken.value;
  }

  const email = text(process.env.INVENTORY_API_EMAIL);
  const password = text(process.env.INVENTORY_API_PASSWORD);
  if (!email || !password) {
    throw new InventoryIntegrationError(
      503,
      "inventory_not_configured",
      "Faltan las credenciales del inventario en el servidor.",
    );
  }

  const result = await fetchJson(`${apiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = record(result.data);
  const accessToken = text(payload.access_token);
  if (result.status < 200 || result.status >= 300 || !accessToken) {
    throw new InventoryIntegrationError(502, "inventory_login_failed", "El inventario rechazó las credenciales configuradas.");
  }

  const expiresIn = Math.max(number(payload.expires_in) || 3_600, 120);
  sessionToken = {
    value: accessToken,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1_000,
  };
  return accessToken;
}

async function inventoryRequest(path: string, retry = true): Promise<unknown> {
  const token = await getInventoryToken();
  const result = await fetchJson(`${apiBaseUrl()}${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });

  if (result.status === 401 && retry && !process.env.INVENTORY_API_TOKEN) {
    sessionToken = null;
    await getInventoryToken(true);
    return inventoryRequest(path, false);
  }
  if (result.status < 200 || result.status >= 300) {
    throw new InventoryIntegrationError(502, "inventory_request_failed", "El inventario no pudo entregar la información solicitada.");
  }
  return result.data;
}

async function fetchAll(path: string, pageSize: number): Promise<unknown[]> {
  const all: unknown[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const batch = await inventoryRequest(`${path}${separator}page=${page}&page_size=${pageSize}`);
    if (!Array.isArray(batch)) {
      throw new InventoryIntegrationError(502, "inventory_invalid_response", "El inventario respondió con un formato inesperado.");
    }
    all.push(...batch);
    if (batch.length < pageSize) break;
  }
  return all;
}

type NormalizedProduct = {
  id: string;
  productId: string;
  variantId: string;
  presentationId: string;
  productName: string;
  brand: string;
  description: string;
  category: string;
  imageUrl: string;
  variant: string;
  color: string;
  productFormat: string;
  presentation: string;
  sku: string;
  barcodes: string[];
  salePrice: number;
  purchasePrice: number;
  quantity: number;
  baseUnits: number;
  packageType: string;
  minimumStock: number;
  status: string;
  active: boolean;
};

type InventoryResponse = {
  products: NormalizedProduct[];
  summary: {
    totalProducts: number;
    totalPresentations: number;
    totalUnits: number;
    lowStock: number;
    outOfStock: number;
    active: number;
  };
  syncedAt: string;
  source: string;
  cached?: boolean;
  stale?: boolean;
  warning?: string;
};

function normalizedSku(value: unknown): string {
  return text(value).toUpperCase().replace(/\s+/g, "");
}

function barcodeValues(value: unknown): string[] {
  return array(value)
    .map((item) => {
      const itemRecord = record(item);
      return text(itemRecord.barcode || itemRecord.code || item);
    })
    .filter(Boolean);
}

function stockStatus(quantity: number, minimum: number, hasStockRecord: boolean): string {
  if (!hasStockRecord) return "Sin registro";
  if (quantity <= 0) return "Agotado";
  if (minimum > 0 && quantity <= minimum) return "Existencia baja";
  return "Disponible";
}

export function normalizeInventory(productsPayload: unknown[], stockPayload: unknown[]): InventoryResponse {
  const stockBySku = new Map<string, { quantity: number; minimumStock: number; baseUnits: number; packageType: string }>();

  for (const rawStock of stockPayload) {
    const stock = record(rawStock);
    const sku = normalizedSku(stock.sku);
    if (!sku) continue;
    const current = stockBySku.get(sku) || { quantity: 0, minimumStock: 0, baseUnits: 0, packageType: "" };
    current.quantity += number(stock.quantity);
    current.minimumStock = Math.max(current.minimumStock, number(stock.minimum_stock));
    current.baseUnits += number(stock.base_units);
    current.packageType ||= text(stock.package_type);
    stockBySku.set(sku, current);
  }

  const products: NormalizedProduct[] = [];
  for (const rawProduct of productsPayload) {
    const product = record(rawProduct);
    const category = record(product.category);
    for (const rawVariant of array(product.variants)) {
      const variant = record(rawVariant);
      for (const rawPresentation of array(variant.presentations)) {
        const presentation = record(rawPresentation);
        const sku = text(presentation.sku);
        const stock = stockBySku.get(normalizedSku(sku));
        const minimumStock = stock?.minimumStock || number(presentation.minimum_stock);
        const quantity = stock?.quantity || 0;
        const presentationId = text(presentation.id);
        products.push({
          id: presentationId || `${text(product.id)}-${text(variant.id)}-${sku}`,
          productId: text(product.id),
          variantId: text(variant.id),
          presentationId,
          productName: text(product.name) || "Producto sin nombre",
          brand: text(product.brand),
          description: text(product.description),
          category: text(category.name) || text(product.category_name) || "Sin categoría",
          imageUrl: text(product.image_url),
          variant: text(variant.variant_name) || "Presentación general",
          color: text(variant.color),
          productFormat: text(variant.product_format),
          presentation: text(presentation.presentation_name) || "Sin presentación",
          sku,
          barcodes: barcodeValues(presentation.barcodes),
          salePrice: number(presentation.sale_price),
          purchasePrice: number(presentation.purchase_price),
          quantity,
          baseUnits: stock?.baseUnits || number(presentation.base_units),
          packageType: stock?.packageType || text(presentation.package_type),
          minimumStock,
          status: stockStatus(quantity, minimumStock, Boolean(stock)),
          active: boolean(product.active) && boolean(variant.active) && boolean(presentation.active),
        });
      }
    }
  }

  const totalUnits = [...stockBySku.values()].reduce((total, item) => total + item.quantity, 0);
  return {
    products,
    summary: {
      totalProducts: productsPayload.length,
      totalPresentations: products.length,
      totalUnits,
      lowStock: products.filter((item) => item.status === "Existencia baja").length,
      outOfStock: products.filter((item) => item.status === "Agotado").length,
      active: products.filter((item) => item.active).length,
    },
    syncedAt: new Date().toISOString(),
    source: new URL(apiBaseUrl()).hostname,
  };
}

router.get("/inventory-source/products", requireAdmin, async (req, res) => {
  const forceRefresh = req.query.refresh === "1";
  if (!forceRefresh && inventoryCache && inventoryCache.expiresAt > Date.now()) {
    res.json({ ...inventoryCache.data, cached: true });
    return;
  }

  try {
    const [products, stock] = await Promise.all([
      fetchAll("/products", 100),
      fetchAll("/inventory/stock", 200),
    ]);
    const data = normalizeInventory(products, stock);
    inventoryCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(data);
  } catch (error) {
    const integrationError =
      error instanceof InventoryIntegrationError
        ? error
        : new InventoryIntegrationError(500, "inventory_unknown_error", "Ocurrió un error al consultar el inventario.");
    logger.warn({ code: integrationError.code }, "No se pudo sincronizar el inventario externo");

    if (inventoryCache) {
      res.json({
        ...inventoryCache.data,
        stale: true,
        warning: "El inventario no respondió; se muestran los últimos datos sincronizados.",
      });
      return;
    }
    res.status(integrationError.status).json({ code: integrationError.code, message: integrationError.message });
  }
});

export default router;
