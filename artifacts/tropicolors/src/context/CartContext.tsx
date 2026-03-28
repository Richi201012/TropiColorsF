import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  hexCode: string;
  imageUrl?: string;
};

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
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [triggerCartBounce, setTriggerCartBounce] = useState(false);
  const [recentlyAddedItem, setRecentlyAddedItem] = useState<CartItem | null>(
    null,
  );
  const [recentlyAddedToken, setRecentlyAddedToken] = useState(0);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.productId === newItem.productId && item.size === newItem.size,
      );

      if (existingItemIndex >= 0) {
        const updated = [...currentItems];
        updated[existingItemIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...currentItems, newItem];
    });

    setRecentlyAddedItem(newItem);
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

  const removeFromCart = useCallback((productId: string, size: string) => {
    setItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, size);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const cartTotal = useMemo(
    () =>
      items.reduce((total, item) => total + item.price * item.quantity, 0),
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
