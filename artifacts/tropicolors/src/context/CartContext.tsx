import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import {
  type CommerceCartItem,
  buildCartItemKey,
  calculateCartItemSubtotal,
  normalizeCartItem,
} from "@/lib/commerce";

export type CartItem = CommerceCartItem;

export type FlyingItem = {
  id: string;
  productId: string;
  imageUrl?: string;
  hexCode?: string;
  startX: number;
  startY: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem, imageUrl?: string) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
  flyingItems: FlyingItem[];
  addFlyingItem: (item: Omit<FlyingItem, "id">) => void;
  removeFlyingItem: (id: string) => void;
  triggerCartBounce: boolean;
  setTriggerCartBounce: (value: boolean) => void;
  recentlyAddedItem: CartItem | null;
  recentlyAddedToken: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "tropicolors-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [triggerCartBounce, setTriggerCartBounce] = useState(false);
  const [recentlyAddedItem, setRecentlyAddedItem] = useState<CartItem | null>(
    null,
  );
  const [recentlyAddedToken, setRecentlyAddedToken] = useState(0);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!storedCart) {
        return;
      }

      const parsedCart = JSON.parse(storedCart) as unknown[];
      if (Array.isArray(parsedCart)) {
        setItems(
          parsedCart
            .map((item) => normalizeCartItem(item))
            .filter((item): item is CartItem => Boolean(item)),
        );
      }
    } catch (error) {
      console.error("[CartContext] No se pudo restaurar el carrito:", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (items.length === 0) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("[CartContext] No se pudo guardar el carrito:", error);
    }
  }, [items]);

  const addToCart = useCallback((newItem: CartItem) => {
    const normalizedItem = normalizeCartItem({
      ...newItem,
      cartKey:
        newItem.cartKey ||
        buildCartItemKey({
          productId: newItem.productId,
          concentration: newItem.concentration,
          size: newItem.size,
          purchaseType: newItem.purchaseType,
          piecesPerBox: newItem.piecesPerBox,
        }),
    });

    if (!normalizedItem) {
      return;
    }

    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.cartKey === normalizedItem.cartKey,
      );

      if (existingItemIndex >= 0) {
        const updated = [...currentItems];
        const existingItem = updated[existingItemIndex];
        const nextQuantity = existingItem.quantity + normalizedItem.quantity;
        const nextTotalPieces =
          existingItem.purchaseType === "mayoreo"
            ? (existingItem.piecesPerBox || 0) * nextQuantity
            : nextQuantity;

        updated[existingItemIndex] = {
          ...existingItem,
          quantity: nextQuantity,
          quantityBoxes:
            existingItem.purchaseType === "mayoreo" ? nextQuantity : undefined,
          totalPieces: nextTotalPieces || nextQuantity,
          subtotal: calculateCartItemSubtotal({
            subtotal: existingItem.price * nextQuantity,
          }),
        };
        return updated;
      }

      return [...currentItems, normalizedItem];
    });

    setRecentlyAddedItem(normalizedItem);
    setRecentlyAddedToken((current) => current + 1);
  }, []);

  const addFlyingItem = useCallback((item: Omit<FlyingItem, "id">) => {
    const newItem: FlyingItem = {
      ...item,
      id: `fly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setFlyingItems((prev) => [...prev, newItem]);

    setTriggerCartBounce(true);
    setTimeout(() => setTriggerCartBounce(false), 600);
  }, []);

  const removeFlyingItem = useCallback((id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeFromCart = useCallback((cartKey: string) => {
    setItems((current) =>
      current.filter((item) => item.cartKey !== cartKey),
    );
  }, []);

  const updateQuantity = useCallback(
    (cartKey: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(cartKey);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity,
                quantityBoxes:
                  item.purchaseType === "mayoreo" ? quantity : undefined,
                totalPieces:
                  item.purchaseType === "mayoreo" && item.piecesPerBox
                    ? item.piecesPerBox * quantity
                    : quantity,
                subtotal: calculateCartItemSubtotal({
                  subtotal: item.price * quantity,
                }),
              }
            : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    setItems([]);
  }, []);

  const cartTotal = useMemo(
    () =>
      items.reduce((total, item) => total + calculateCartItemSubtotal(item), 0),
    [items],
  );
  const cartCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
        flyingItems,
        addFlyingItem,
        removeFlyingItem,
        triggerCartBounce,
        setTriggerCartBounce,
        recentlyAddedItem,
        recentlyAddedToken,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
