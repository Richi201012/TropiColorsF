import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  normalizeReference,
  type FirestoreReference,
  type SiteReference,
} from "@/types/reference";

export function useReferences() {
  const [references, setReferences] = useState<SiteReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const referencesQuery = query(collection(db, "references"));

    const unsubscribe = onSnapshot(
      referencesQuery,
      (snapshot) => {
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
        console.error("[useReferences] Error:", snapshotError);
        setError("No se pudieron cargar las referencias.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    references,
    isLoading,
    error,
  };
}
