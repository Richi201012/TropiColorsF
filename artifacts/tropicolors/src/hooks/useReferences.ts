import { useEffect, useState } from "react";
import {
  normalizeReference,
  type FirestoreReference,
  type SiteReference,
} from "@/types/reference";

export function useReferences(enabled = true) {
  const [references, setReferences] = useState<SiteReference[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    let unsubscribe: (() => void) | undefined;

    setIsLoading(true);

    void (async () => {
      try {
        const [{ collection, onSnapshot, query }, { db }] = await Promise.all([
          import("firebase/firestore"),
          import("@/lib/firebase"),
        ]);

        if (isCancelled) {
          return;
        }

        const referencesQuery = query(collection(db, "references"));

        unsubscribe = onSnapshot(
          referencesQuery,
          (snapshot) => {
            if (isCancelled) {
              return;
            }

            const items = snapshot.docs
              .map((docSnap) =>
                normalizeReference(
                  docSnap.id,
                  docSnap.data() as FirestoreReference,
                ),
              )
              .sort((a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return (
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              });

            setReferences(items);
            setIsLoading(false);
            setError(null);
          },
          (snapshotError) => {
            if (isCancelled) {
              return;
            }

            console.error("[useReferences] Error:", snapshotError);
            setError("No se pudieron cargar las referencias.");
            setIsLoading(false);
          },
        );
      } catch (snapshotError) {
        if (isCancelled) {
          return;
        }

        console.error("[useReferences] Error:", snapshotError);
        setError("No se pudieron cargar las referencias.");
        setIsLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
      unsubscribe?.();
    };
  }, [enabled]);

  return {
    references,
    isLoading,
    error,
  };
}
