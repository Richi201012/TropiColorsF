import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { apiUrl } from "@/lib/api";

export type InventorySourceProduct = {
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
  status: "Disponible" | "Existencia baja" | "Agotado" | "Sin registro" | string;
  active: boolean;
};

export type InventorySourceData = {
  products: InventorySourceProduct[];
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

export type InventorySourceError = {
  code: string;
  message: string;
};

export function useInventorySource() {
  const [data, setData] = useState<InventorySourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<InventorySourceError | null>(null);

  const refresh = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw { code: "authentication_required", message: "Inicia sesión nuevamente para consultar el inventario." };
      }
      const idToken = await user.getIdToken();
      const response = await fetch(apiUrl(`/api/inventory-source/products${force ? "?refresh=1" : ""}`), {
        headers: { authorization: `Bearer ${idToken}` },
      });
      const payload = (await response.json().catch(() => null)) as
        | InventorySourceData
        | InventorySourceError
        | null;

      if (!response.ok) {
        const apiError = payload as InventorySourceError | null;
        throw {
          code: apiError?.code || "inventory_error",
          message: apiError?.message || "No fue posible consultar el inventario.",
        };
      }
      setData(payload as InventorySourceData);
    } catch (reason) {
      const apiError = reason as Partial<InventorySourceError>;
      setError({
        code: apiError.code || "inventory_error",
        message: apiError.message || "No fue posible consultar el inventario.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refreshing, error, refresh };
}
