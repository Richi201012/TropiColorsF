export type PurchaseType = "pieza" | "mayoreo";

export const PRICE_MARKUP_RATE = 0.3;
export const SHIPPING_FEE = 150;

export type CommerceCartItem = {
  cartKey: string;
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  hexCode: string;
  imageUrl?: string;
  concentration?: string;
  purchaseType: PurchaseType;
  priceBase: number;
  unitPrice: number;
  subtotal: number;
  piecesPerBox?: number | null;
  quantityBoxes?: number;
  totalPieces?: number;
  warningMessage?: string;
};

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function applyMarkup(value: number): number {
  return roundCurrency(value * (1 + PRICE_MARKUP_RATE));
}

export function getPiecesFromPresentationLabel(label: string): number | null {
  const match = label.match(/\((\d+)\s*pz\)/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function calculatePiecePrice(priceBase: number): number {
  return applyMarkup(priceBase);
}

export function calculateWholesalePrice(baseAmount: number): number {
  return applyMarkup(baseAmount);
}

export function calculateMayoreoUnitTotal(
  priceBase: number,
  piecesPerBox?: number | null,
): number {
  const baseAmount =
    !piecesPerBox || piecesPerBox <= 0 ? priceBase : priceBase * piecesPerBox;

  return calculateWholesalePrice(baseAmount);
}

export function calculateOrderShipping(itemCount: number): number {
  return itemCount > 0 ? SHIPPING_FEE : 0;
}

export function calculateOrderTotal(
  subtotal: number,
  shippingFee: number,
): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return 0;
  }

  return roundCurrency(subtotal + shippingFee);
}

export function buildCartItemKey(
  item: Pick<
    CommerceCartItem,
    "productId" | "concentration" | "size" | "purchaseType" | "piecesPerBox"
  >,
): string {
  return [
    item.productId,
    item.concentration || "",
    item.size,
    item.purchaseType,
    item.piecesPerBox ?? "na",
  ].join("::");
}

export function calculateCartItemSubtotal(item: {
  subtotal?: number;
  price?: number;
  quantity?: number;
}): number {
  if (typeof item.subtotal === "number" && Number.isFinite(item.subtotal)) {
    return roundCurrency(item.subtotal);
  }

  return roundCurrency((item.price || 0) * (item.quantity || 0));
}

export function formatCartItemPurchaseType(type: PurchaseType): string {
  return type === "pieza" ? "Compra por pieza" : "Compra por mayoreo";
}

export function formatCartItemQuantity(item: CommerceCartItem): string {
  if (item.purchaseType === "pieza") {
    return `${item.quantity} ${item.quantity === 1 ? "pieza" : "piezas"}`;
  }

  if (item.piecesPerBox && item.piecesPerBox > 0) {
    return `${item.quantity} ${item.quantity === 1 ? "caja" : "cajas"} de ${item.piecesPerBox} piezas`;
  }

  return `${item.quantity} ${item.quantity === 1 ? "volumen" : "volumenes"}`;
}

export function formatCartItemPriceLabel(item: CommerceCartItem): string {
  if (item.purchaseType === "pieza") {
    return `$${roundCurrency(item.unitPrice).toLocaleString("es-MX")} c/u`;
  }

  if (item.piecesPerBox && item.piecesPerBox > 0) {
    return `$${roundCurrency(item.price).toLocaleString("es-MX")} por caja`;
  }

  return `$${roundCurrency(item.price).toLocaleString("es-MX")} por volumen`;
}

export function normalizeCartItem(raw: unknown): CommerceCartItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<CommerceCartItem> & {
    productId?: string;
    productName?: string;
    size?: string;
    price?: number;
    quantity?: number;
    hexCode?: string;
  };

  if (!item.productId || !item.productName || !item.size) {
    return null;
  }

  const quantity = Math.max(1, Number(item.quantity) || 1);
  const piecesPerBox =
    typeof item.piecesPerBox === "number"
      ? item.piecesPerBox
      : getPiecesFromPresentationLabel(item.size);
  const purchaseType: PurchaseType =
    item.purchaseType === "pieza" || item.purchaseType === "mayoreo"
      ? item.purchaseType
      : "mayoreo";
  const legacyPrice = roundCurrency(Number(item.price) || 0);
  const legacyUnitPrice = roundCurrency(Number(item.unitPrice) || legacyPrice);
  const priceBase =
    typeof item.priceBase === "number" && Number.isFinite(item.priceBase)
      ? roundCurrency(item.priceBase)
      : purchaseType === "pieza"
        ? roundCurrency(legacyPrice / (1 + PRICE_MARKUP_RATE))
        : piecesPerBox && piecesPerBox > 0
          ? roundCurrency(
              legacyUnitPrice / piecesPerBox / (1 + PRICE_MARKUP_RATE),
            )
          : roundCurrency(legacyUnitPrice / (1 + PRICE_MARKUP_RATE));
  const unitPrice =
    typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice)
      ? roundCurrency(item.unitPrice)
      : purchaseType === "pieza"
        ? calculatePiecePrice(priceBase)
        : calculateMayoreoUnitTotal(priceBase, piecesPerBox);
  const price =
    purchaseType === "pieza"
      ? unitPrice
      : calculateMayoreoUnitTotal(priceBase, piecesPerBox);

  const normalized: CommerceCartItem = {
    cartKey:
      item.cartKey ||
      buildCartItemKey({
        productId: item.productId,
        concentration: item.concentration,
        size: item.size,
        purchaseType,
        piecesPerBox,
      }),
    productId: item.productId,
    productName: item.productName,
    size: item.size,
    price,
    quantity,
    hexCode: item.hexCode || "#003F91",
    imageUrl: item.imageUrl,
    concentration: item.concentration,
    purchaseType,
    priceBase,
    unitPrice,
    subtotal: roundCurrency(price * quantity),
    piecesPerBox,
    quantityBoxes:
      purchaseType === "mayoreo"
        ? Number(item.quantityBoxes) || quantity
        : undefined,
    totalPieces:
      typeof item.totalPieces === "number" && Number.isFinite(item.totalPieces)
        ? item.totalPieces
        : purchaseType === "mayoreo" && piecesPerBox
          ? piecesPerBox * quantity
          : quantity,
    warningMessage: item.warningMessage,
  };

  normalized.subtotal = calculateCartItemSubtotal({
    price: normalized.price,
    quantity: normalized.quantity,
  });
  return normalized;
}
