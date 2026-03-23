import { useEffect, useState } from "react";
import { fetchPostalCodeLookup, type PostalCodeLookupResponse } from "@/services/postal-code-service";

type UsePostalCodeLookupOptions = {
  postalCode: string;
  enabled?: boolean;
};

export function usePostalCodeLookup({ postalCode, enabled = true }: UsePostalCodeLookupOptions) {
  const [data, setData] = useState<PostalCodeLookupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedPostalCode = postalCode.trim();

    if (!enabled || normalizedPostalCode.length !== 5) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchPostalCodeLookup(normalizedPostalCode);
        setData(response);
      } catch (lookupError) {
        setData(null);
        setError(
          lookupError instanceof Error
            ? lookupError.message
            : "No fue posible consultar el codigo postal.",
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, postalCode]);

  return {
    data,
    isLoading,
    error,
  };
}
