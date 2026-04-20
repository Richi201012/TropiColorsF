import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  lazy,
  useMemo,
  startTransition,
  useState,
  type FormEvent,
} from "react";
import { useCart } from "@/context/CartContext";
import CatalogSection from "@/components/home/CatalogSection";
import HomeBackground from "@/components/home/HomeBackground";
import {
  DEFERRED_CATALOG_DELAY_MS,
  DEFERRED_FIREBASE_DELAY_MS,
  DEFERRED_SECTIONS_DELAY_MS,
  HOME_BLOBS,
  INITIAL_CATALOG_ITEMS,
  NARANJA_850_NOTE,
  PRODUCTS,
  initialContactForm,
  initialReferenceForm,
} from "@/components/home/data";
import type {
  ContactForm,
  ContactFormErrors,
  Product,
  ReferenceFormData,
} from "@/components/home/types";
import {
  isNaranja850Product,
  validateContactForm,
} from "@/components/home/utils";
import { useReferences } from "@/hooks/useReferences";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const AboutSection = lazy(() => import("@/components/home/AboutSection"));
const BenefitsSection = lazy(() => import("@/components/home/BenefitsSection"));
const ContactSection = lazy(() => import("@/components/home/ContactSection"));
const GelSection = lazy(() => import("@/components/home/GelSection"));
const ReferencesSection = lazy(
  () => import("@/components/home/ReferencesSection"),
);
const WhatsAppCtaSection = lazy(
  () => import("@/components/home/WhatsAppCtaSection"),
);

export default function Home() {
  const { addToCart, addFlyingItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogReady, setCatalogReady] = useState(false);
  const [secondarySectionsReady, setSecondarySectionsReady] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [contactErrors, setContactErrors] = useState<ContactFormErrors>({});
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [referenceSent, setReferenceSent] = useState(false);
  const [isSubmittingReference, setIsSubmittingReference] = useState(false);
  const [referenceForm, setReferenceForm] =
    useState<ReferenceFormData>(initialReferenceForm);
  const [gelVisible, setGelVisible] = useState(false);
  const [firebaseProducts, setFirebaseProducts] = useState<Product[] | null>(
    null,
  );
  const { references } = useReferences(secondarySectionsReady);

  useEffect(() => {
    const catalogTimerId = window.setTimeout(() => {
      startTransition(() => {
        setCatalogReady(true);
      });
    }, DEFERRED_CATALOG_DELAY_MS);
    const sectionsTimerId = window.setTimeout(() => {
      startTransition(() => {
        setSecondarySectionsReady(true);
      });
    }, DEFERRED_SECTIONS_DELAY_MS);

    return () => {
      window.clearTimeout(catalogTimerId);
      window.clearTimeout(sectionsTimerId);
    };
  }, []);

  const handleContactFieldChange = useCallback(
    (field: keyof ContactForm, value: string) => {
      setContactForm((current) => ({
        ...current,
        [field]: value,
      }));
      setContactErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    },
    [],
  );

  const onContactSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedForm: ContactForm = {
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
        message: contactForm.message.trim(),
      };
      const nextErrors = validateContactForm(normalizedForm);

      setContactErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setIsSubmittingContact(true);

      try {
        const { enviarMensajeContacto } = await import("@/lib/email-service");
        const result = await enviarMensajeContacto({
          nombre: normalizedForm.name,
          email: normalizedForm.email,
          telefono: normalizedForm.phone,
          mensaje: normalizedForm.message,
        });

        if (!result.success) {
          toast({
            title: "No se pudo enviar el mensaje",
            description:
              result.error ||
              "Hubo un problema al enviar tu mensaje. Intenta de nuevo.",
            variant: "destructive",
          });
          return;
        }

        setContactSent(true);
        setContactForm(initialContactForm);
        setContactErrors({});
      } catch (error) {
        console.error("[Home] Error al enviar mensaje de contacto:", error);
        toast({
          title: "No se pudo enviar el mensaje",
          description:
            "Hubo un problema al enviar tu mensaje. Intenta de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsSubmittingContact(false);
      }
    },
    [contactForm, toast],
  );

  const handleReferenceFieldChange = useCallback(
    (field: keyof ReferenceFormData, value: string | number) => {
      setReferenceSent(false);
      setReferenceForm((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleReferenceSubmit = useCallback(async () => {
    if (isSubmittingReference) {
      return;
    }

    if (
      !referenceForm.name.trim() ||
      !referenceForm.company.trim() ||
      !referenceForm.message.trim()
    ) {
      toast({
        title: "Completa tu referencia",
        description:
          "Nombre, empresa y mensaje son obligatorios para enviar tu referencia.",
        variant: "destructive",
      });
      return;
    }

    if (referenceForm.message.trim().length < 24) {
      toast({
        title: "Mensaje muy corto",
        description:
          "Comparte un poco más de contexto para poder revisar y publicar tu referencia.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReference(true);

    try {
      const { createReference } = await import("@/services/reference-service");

      await createReference({
        name: referenceForm.name,
        company: referenceForm.company,
        role: referenceForm.role,
        location: referenceForm.location,
        message: referenceForm.message,
        rating: referenceForm.rating,
        status: "active",
      });

      setReferenceForm(initialReferenceForm);
      setReferenceSent(true);
      toast({
        title: "Referencia enviada",
        description: "Gracias. Ya quedó publicada en el sitio.",
      });
    } catch (error) {
      console.error("[Home] Error al enviar referencia:", error);
      toast({
        title: "No se pudo enviar",
        description:
          "Ocurrió un problema al registrar tu referencia. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReference(false);
    }
  }, [isSubmittingReference, referenceForm, toast]);

  useEffect(() => {
    if (!referenceSent) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setReferenceSent(false);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [referenceSent]);

  useEffect(() => {
    let isCancelled = false;
    let unsubscribeSettings: (() => void) | undefined;

    const timerId = window.setTimeout(() => {
      void (async () => {
        try {
          const [{ db }, firestore] = await Promise.all([
            import("@/lib/firebase"),
            import("firebase/firestore"),
          ]);
          const { collection, doc, getDocs, onSnapshot } = firestore;

          if (isCancelled) {
            return;
          }

          try {
            const snapshot = await getDocs(collection(db, "products"));

            if (!isCancelled) {
              if (!snapshot.empty) {
                const loaded: Product[] = snapshot.docs.map((docSnapshot) => {
                  const data = docSnapshot.data();
                  return {
                    id: docSnapshot.id,
                    name: data.name || "",
                    hex: data.hex || "#000000",
                    hex2: data.hex2 || undefined,
                    textColor: data.textColor || "#ffffff",
                    category: data.category || "",
                    prices: data.prices || {},
                    industrial: data.industrial || false,
                    note: data.note || undefined,
                    purchaseWarning: data.purchaseWarning || undefined,
                    onlyWholesale: Boolean(data.onlyWholesale),
                    presentationOverrides: data.presentationOverrides || undefined,
                    specialWholesaleBoxes: data.specialWholesaleBoxes || undefined,
                  };
                });
                startTransition(() => {
                  setFirebaseProducts(loaded);
                });
              } else {
                startTransition(() => {
                  setFirebaseProducts(null);
                });
              }
            }
          } catch (error) {
            if (!isCancelled) {
              console.error("[Home] Error loading products from Firebase:", error);
              startTransition(() => {
                setFirebaseProducts(null);
              });
            }
          }

          if (isCancelled) {
            return;
          }

          const settingsDocRef = doc(db, "settings", "home");
          unsubscribeSettings = onSnapshot(
            settingsDocRef,
            (settingsSnapshot) => {
              if (isCancelled) {
                return;
              }

              if (settingsSnapshot.exists()) {
                startTransition(() => {
                  setGelVisible(Boolean(settingsSnapshot.data()?.gelVisible));
                });
                return;
              }

              startTransition(() => {
                setGelVisible(false);
              });
            },
            (error) => {
              if (isCancelled) {
                return;
              }

              console.error("[Home] No se pudo cargar settings/home:", error);
              toast({
                title: "No se pudo cargar la configuración del sitio",
                description:
                  "La sección de gel permanecerá desactivada por seguridad.",
                variant: "destructive",
              });
              startTransition(() => {
                setGelVisible(false);
              });
            },
          );
        } catch (error) {
          if (!isCancelled) {
            console.error("[Home] No se pudo inicializar Firebase en Home:", error);
            startTransition(() => {
              setFirebaseProducts(null);
              setGelVisible(false);
            });
          }
        }
      })();
    }, DEFERRED_FIREBASE_DELAY_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timerId);
      unsubscribeSettings?.();
    };
  }, [toast]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearch = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  );
  const products = useMemo(() => {
    const sourceProducts = firebaseProducts || PRODUCTS;
    const hasNaranja850 = sourceProducts.some((product) =>
      isNaranja850Product(product),
    );
    const normalizedProducts = hasNaranja850
      ? sourceProducts
      : [...sourceProducts, PRODUCTS.find((product) => product.id === "naranja-850")!];

    return normalizedProducts
      .map((product) =>
        isNaranja850Product(product)
          ? {
              ...product,
              note: NARANJA_850_NOTE,
            }
          : product,
      )
      .filter((product) => gelVisible || product.category !== "Gel");
  }, [firebaseProducts, gelVisible]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          activeCategory === "Todos" || product.category === activeCategory;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          product.name.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      }),
    [activeCategory, normalizedSearch, products],
  );
  const initialCatalogItems = isMobile
    ? INITIAL_CATALOG_ITEMS.mobile
    : INITIAL_CATALOG_ITEMS.desktop;
  const shouldRenderFullCatalog =
    catalogReady || normalizedSearch.length > 0 || activeCategory !== "Todos";
  const visibleProducts = useMemo(
    () =>
      shouldRenderFullCatalog
        ? filteredProducts
        : filteredProducts.slice(0, initialCatalogItems),
    [filteredProducts, initialCatalogItems, shouldRenderFullCatalog],
  );
  const visibleHomeBlobs = useMemo(
    () => (isMobile ? HOME_BLOBS.slice(0, 3) : HOME_BLOBS),
    [isMobile],
  );

  const handleCategoryChange = useCallback((category: string) => {
    startTransition(() => {
      setActiveCategory((currentCategory) =>
        currentCategory === category ? currentCategory : category,
      );
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div
      id="inicio"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#fffdf8_32%,#ffffff_68%,#f8fbff_100%)]"
    >
      <HomeBackground blobs={visibleHomeBlobs} />

      <CatalogSection
        activeCategory={activeCategory}
        filteredProductsCount={filteredProducts.length}
        searchQuery={searchQuery}
        visibleProducts={visibleProducts}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        addToCart={addToCart}
        addFlyingItem={addFlyingItem}
      />

      {secondarySectionsReady ? (
        <Suspense fallback={null}>
          <GelSection
            gelVisible={gelVisible}
            addToCart={addToCart}
            addFlyingItem={addFlyingItem}
          />
          <AboutSection />
          <BenefitsSection />
          <ReferencesSection
            references={references}
            referenceForm={referenceForm}
            referenceSent={referenceSent}
            isSubmittingReference={isSubmittingReference}
            onReferenceFieldChange={handleReferenceFieldChange}
            onReferenceSubmit={handleReferenceSubmit}
          />
          <WhatsAppCtaSection />
          <ContactSection
            contactSent={contactSent}
            contactForm={contactForm}
            contactErrors={contactErrors}
            isSubmittingContact={isSubmittingContact}
            onFieldChange={handleContactFieldChange}
            onSubmit={onContactSubmit}
            onReset={() => setContactSent(false)}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
