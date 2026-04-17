import type { PurchaseType } from "@/lib/commerce";

export type ContactForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactForm, string>>;

export type ReferenceFormData = {
  name: string;
  company: string;
  role: string;
  location: string;
  message: string;
  rating: number;
};

export type Concentration = "125" | "250";

export type ProductPrices = {
  125?: [number, number, number, number, number];
  250?: [number, number, number, number, number];
};

export type Product = {
  id: string;
  name: string;
  hex: string;
  hex2?: string;
  textColor: string;
  category: string;
  prices: ProductPrices;
  industrial?: boolean;
  note?: string;
  purchaseWarning?: string;
  onlyWholesale?: boolean;
  presentationOverrides?: Partial<
    Record<Concentration, Array<{ label: string; price: number }>>
  >;
  specialWholesaleBoxes?: Partial<Record<Concentration, number[]>>;
};

export type CategoryColor = {
  bg: string;
  text: string;
};

export type HomeBlob = {
  className: string;
  animationDelay?: string;
};

export type AddToCartItem = {
  cartKey: string;
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  hexCode: string;
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

export type AddToCartFn = (item: AddToCartItem) => void;

export type AddFlyingItem = {
  productId: string;
  imageUrl?: string;
  hexCode?: string;
  startX: number;
  startY: number;
};

export type AddFlyingItemFn = (item: AddFlyingItem) => void;
