import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { enviarMensajeContacto } from "@/lib/email-service";
import { db } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  MessageCircle,
  Droplet,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  Award,
  Star,
  FlaskConical,
  ChevronDown,
  Search,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, getDocs, collection, onSnapshot } from "firebase/firestore";
import {
  buildCartItemKey,
  calculateMayoreoUnitTotal,
  calculatePiecePrice,
  getPiecesFromPresentationLabel,
  type PurchaseType,
} from "@/lib/commerce";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  phone: z.string().optional(),
  message: z.string().min(10, "Mensaje requerido"),
});
type ContactForm = z.infer<typeof contactSchema>;

type Concentration = "125" | "250";

type ProductPrices = {
  125?: [number, number, number, number, number];
  250?: [number, number, number, number, number];
};

type Product = {
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

const PRESENTATIONS = [
  "Caja chica (24 pz)",
  "Caja mediana (24 pz)",
  "Caja grande (6 pz)",
  "Cubeta 6 KG",
  "Cubeta 20 KG",
];

const NARANJA_850_NOTE = 
  "Color intenso y uniforme para aplicaciones exigentes.";

const PRODUCTS: Product[] = [
  {
    id: "amarillo-canario",
    name: "Amarillo Canario",
    hex: "#FFD700",
    hex2: "#FFC400",
    textColor: "#1a1a1a",
    category: "Amarillos",
    prices: {
      125: [21.6, 44, 131.9, 720, 2400],
      250: [31.5, 65.2, 224, 1179, 4200],
    },
  },
  {
    id: "amarillo-huevo",
    name: "Amarillo Huevo",
    hex: "#FFA500",
    hex2: "#FF8C00",
    textColor: "#1a1a1a",
    category: "Amarillos",
    prices: {
      125: [21.6, 44, 131.9, 720, 2400],
      250: [31.5, 65.2, 224, 1179, 4200],
    },
  },
  {
    id: "amarillo-limon",
    name: "Amarillo Limón",
    hex: "#E8E800",
    hex2: "#CCCC00",
    textColor: "#1a1a1a",
    category: "Amarillos",
    prices: {
      125: [21.6, 44, 131.9, 720, 2400],
      250: [31.5, 65.2, 224, 1179, 4200],
    },
  },
  {
    id: "amarillo-naranja",
    name: "Amarillo Naranja",
    hex: "#FF8C00",
    hex2: "#FF6600",
    textColor: "#fff",
    category: "Amarillos",
    prices: {
      125: [25.7, 47.4, 154.8, 858, 2850],
      250: [40.3, 76, 267, 1420, 5000],
    },
  },
  {
    id: "azul",
    name: "Azul",
    hex: "#0051C8",
    hex2: "#003F91",
    textColor: "#fff",
    category: "Azul",
    prices: {
      125: [34.6, 68, 251.5, 1440, 4800],
      250: [63.4, 145, 514.8, 3025, 10080],
    },
  },
  {
    id: "cafe-caramelo",
    name: "Café Caramelo",
    hex: "#D4944A",
    hex2: "#C68642",
    textColor: "#fff",
    category: "Cafés",
    prices: {
      125: [24.5, 51.9, 169.9, 950, 3150],
      250: [35.5, 82.9, 292, 1690, 5800],
    },
  },
  {
    id: "cafe-chocolate",
    name: "Café Chocolate",
    hex: "#7B4A2D",
    hex2: "#5C3317",
    textColor: "#fff",
    category: "Cafés",
    prices: {
      125: [29, 59, 208, 1180, 3900],
      250: [41, 106, 390, 2114, 7200],
    },
  },
  {
    id: "naranja-pastor",
    name: "Naranja Pastor",
    hex: "#FF7000",
    hex2: "#FF5500",
    textColor: "#fff",
    category: "Naranja",
    prices: {
      125: [24.3, 51.8, 147.8, 817, 2700],
      250: [31.5, 60.3, 223.5, 1200, 4000],
    },
  },
  {
    id: "naranja-850",
    name: "Naranja 850",
    hex: "#FF6B00",
    hex2: "#FF4500",
    textColor: "#fff",
    category: "Naranja",
    prices: { 250: [160, 0, 0, 0, 0] },
    note: NARANJA_850_NOTE,
    purchaseWarning:
      "Este producto solamente se vende por caja de 18 o 32 pieza",
    onlyWholesale: true,
    presentationOverrides: {
      250: [{ label: "250 gramos", price: 160 }],
    },
    specialWholesaleBoxes: {
      250: [18, 32],
    },
  },
  {
    id: "negro",
    name: "Negro",
    hex: "#2A2A2A",
    hex2: "#111111",
    textColor: "#fff",
    category: "Negro",
    prices: {
      250: [69.6, 176, 640, 3780, 12500],
    },
  },
  {
    id: "rojo-cochinilla",
    name: "Rojo Cochinilla",
    hex: "#E01B3C",
    hex2: "#C01030",
    textColor: "#fff",
    category: "Rojos",
    prices: {
      125: [36, 71.7, 252, 1440, 4800],
      250: [57.1, 125, 464, 2520, 8390],
    },
  },
  {
    id: "rojo-fresa",
    name: "Rojo Fresa",
    hex: "#FF2E63",
    hex2: "#E01050",
    textColor: "#fff",
    category: "Rojos",
    prices: {
      125: [31, 62.2, 205, 1160, 3850],
      250: [51.8, 122.5, 465, 2700, 9094],
    },
  },
  {
    id: "rojo-grosella",
    name: "Rojo Grosella",
    hex: "#C71585",
    hex2: "#A01070",
    textColor: "#fff",
    category: "Rojos",
    prices: {
      125: [36, 71.7, 252, 1440, 4800],
      250: [57.1, 125, 464, 2520, 8390],
    },
  },
  {
    id: "rojo-purpura",
    name: "Rojo Púrpura",
    hex: "#8B1A35",
    hex2: "#6B1025",
    textColor: "#fff",
    category: "Rojos",
    prices: {
      125: [31, 62.2, 205, 1160, 3850],
      250: [54.6, 114, 417, 2440, 8130],
    },
  },
  {
    id: "rojo-uva",
    name: "Rojo Uva",
    hex: "#7D2D3C",
    hex2: "#5E1F2A",
    textColor: "#fff",
    category: "Rojos",
    prices: {
      125: [36, 71.7, 252, 1440, 4800],
      250: [54.6, 114, 417, 2440, 8130],
    },
  },
  {
    id: "verde-esmeralda",
    name: "Verde Esmeralda",
    hex: "#1E8A44",
    hex2: "#166832",
    textColor: "#fff",
    category: "Verdes",
    prices: {
      125: [29.7, 54.9, 188.2, 1060, 3500],
      250: [53.4, 106, 353.2, 2055, 6850],
    },
  },
  {
    id: "verde-limon",
    name: "Verde Limón",
    hex: "#8EC600",
    hex2: "#72A000",
    textColor: "#fff",
    category: "Verdes",
    prices: {
      125: [22.9, 46.5, 143, 789, 2600],
      250: [31.5, 60.4, 223, 1200, 4000],
    },
  },
  {
    id: "violeta-alimentos",
    name: "Violeta Alimentos",
    hex: "#7B00E0",
    hex2: "#5800A8",
    textColor: "#fff",
    category: "Especiales",
    prices: { 125: [73.4, 144.7, 540, 0, 0] },
    note: "Uso alimentario",
  },
  {
    id: "rosa-alimentos",
    name: "Rosa Alimentos",
    hex: "#FF70B8",
    hex2: "#E0509A",
    textColor: "#fff",
    category: "Especiales",
    prices: { 125: [78, 0, 680, 0, 0] },
    note: "Uso alimentario",
  },
  {
    id: "violeta-industrial",
    name: "Violeta Industrial",
    hex: "#6A0DB8",
    hex2: "#4E0A8A",
    textColor: "#fff",
    category: "Industriales",
    industrial: true,
    prices: { 125: [74.3, 144.7, 540, 3170, 10500] },
  },
  {
    id: "rosa-brillante",
    name: "Rosa Brillante",
    hex: "#FF0099",
    hex2: "#CC0077",
    textColor: "#fff",
    category: "Industriales",
    industrial: true,
    prices: {
      125: [34.2, 66.7, 242.6, 1388, 4600],
      250: [61, 140, 521.8, 3066, 10220],
    },
  },
];

const GEL_COLORS = [
  { name: "Amarillo", hex: "#FFD700", hex2: "#FFC200", textColor: "#1a1a1a" },
  { name: "Naranja", hex: "#FF7000", hex2: "#FF5500", textColor: "#fff" },
  { name: "Azul", hex: "#0051C8", hex2: "#003F91", textColor: "#fff" },
  { name: "Rojo", hex: "#E01B3C", hex2: "#C01030", textColor: "#fff" },
  { name: "Verde", hex: "#1E8A44", hex2: "#166832", textColor: "#fff" },
  { name: "Rosa", hex: "#FF70B8", hex2: "#E050A0", textColor: "#fff" },
  { name: "Morado", hex: "#7B00E0", hex2: "#5800A8", textColor: "#fff" },
  { name: "Café", hex: "#7B4A2D", hex2: "#5C3317", textColor: "#fff" },
  { name: "Negro", hex: "#2A2A2A", hex2: "#111111", textColor: "#fff" },
  { name: "Turquesa", hex: "#00A8B5", hex2: "#007E8A", textColor: "#fff" },
];

const GEL_PRICES: ProductPrices = {
  125: [180, 380, 1200, 6500, 21000],
  250: [280, 580, 1800, 9800, 32000],
};

const GEL_PRODUCTS: Product[] = GEL_COLORS.map((color) => ({
  id: `gel-${color.name.toLowerCase().replace(/\s+/g, "-")}`,
  name: `${color.name} Gel`,
  hex: color.hex,
  hex2: color.hex2,
  textColor: color.textColor,
  category: "Gel",
  prices: GEL_PRICES,
  note: "Colorante en gel",
}));

const CATEGORY_ORDER = [
  "Todos",
  "Amarillos",
  "Azul",
  "Cafés",
  "Naranja",
  "Negro",
  "Rojos",
  "Verdes",
  "Especiales",
  "Industriales",
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Todos: { bg: "#FFCD00", text: "#003F91" },
  Amarillos: { bg: "#FFD700", text: "#1a1a1a" },
  Azul: { bg: "#003F91", text: "#ffffff" },
  Cafés: { bg: "#7B4A2D", text: "#ffffff" },
  Naranja: { bg: "#FF7000", text: "#ffffff" },
  Negro: { bg: "#1A1A1A", text: "#ffffff" },
  Rojos: { bg: "#E01B3C", text: "#ffffff" },
  Verdes: { bg: "#1E8A44", text: "#ffffff" },
  Especiales: { bg: "#7B00E0", text: "#ffffff" },
  Industriales: { bg: "#4A4A8A", text: "#ffffff" },
};

const STORE_HIGHLIGHTS = [
  {
    label: "Entrega comercial",
    value: "Mayoristas y pedidos directos",
  },
  {
    label: "Tonos disponibles",
    value: "+20 colores en polvo",
  },
  {
    label: "Respuesta",
    value: "Atención por WhatsApp y correo",
  },
];

type HomeBlob = {
  className: string;
  animationDelay?: string;
};

const HOME_BLOBS: HomeBlob[] = [
  {
    className:
      "animate-ambient-blob absolute left-[-8%] top-[4%] h-[420px] w-[420px] rounded-full bg-[#003F91]/16 blur-[120px] sm:h-[520px] sm:w-[520px]",
  },
  {
    className:
      "animate-ambient-blob absolute left-[28%] top-[10%] h-[360px] w-[420px] rounded-full bg-[#00A8B5]/13 blur-[115px] sm:h-[460px] sm:w-[560px]",
    animationDelay: "-6s",
  },
  {
    className:
      "animate-ambient-blob absolute right-[-8%] top-[6%] h-[420px] w-[420px] rounded-full bg-[#FFCD00]/18 blur-[120px] sm:h-[520px] sm:w-[520px]",
    animationDelay: "-10s",
  },
  {
    className:
      "animate-ambient-blob absolute left-[12%] top-[34%] h-[320px] w-[420px] rounded-full bg-[#FF2E63]/10 blur-[120px] sm:h-[420px] sm:w-[540px]",
    animationDelay: "-14s",
  },
  {
    className:
      "animate-ambient-blob absolute right-[10%] top-[42%] h-[320px] w-[420px] rounded-full bg-[#003F91]/10 blur-[120px] sm:h-[420px] sm:w-[540px]",
    animationDelay: "-18s",
  },
  {
    className:
      "animate-ambient-blob absolute left-[22%] bottom-[12%] h-[360px] w-[460px] rounded-full bg-[#00A8B5]/10 blur-[125px] sm:h-[460px] sm:w-[620px]",
    animationDelay: "-8s",
  },
];

type AddToCartFn = (item: {
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
}) => void;

type AddFlyingItemFn = (item: {
  productId: string;
  imageUrl?: string;
  hexCode?: string;
  startX: number;
  startY: number;
}) => void;

export default function Home() {
  const { addToCart, addFlyingItem } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [gelVisible, setGelVisible] = useState(false);
  const [firebaseProducts, setFirebaseProducts] = useState<Product[] | null>(
    null,
  );
  const [productsLoading, setProductsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onContactSubmit = async (data: ContactForm) => {
    const result = await enviarMensajeContacto({
      nombre: data.name.trim(),
      email: data.email.trim(),
      telefono: data.phone?.trim() || "",
      mensaje: data.message.trim(),
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
    reset();
  };

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "products"));
        if (!snapshot.empty) {
          const loaded: Product[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
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
          setFirebaseProducts(loaded);
        } else {
          setFirebaseProducts(null);
        }
      } catch (error) {
        console.error("[Home] Error loading products from Firebase:", error);
        setFirebaseProducts(null);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const settingsDocRef = doc(db, "settings", "home");
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (settingsSnapshot) => {
        if (settingsSnapshot.exists()) {
          setGelVisible(Boolean(settingsSnapshot.data()?.gelVisible));
          return;
        }

        setGelVisible(false);
      },
      (error) => {
        console.error("[Home] No se pudo cargar settings/home:", error);
        toast({
          title: "No se pudo cargar la configuración del sitio",
          description:
            "La sección de gel permanecerá desactivada por seguridad.",
          variant: "destructive",
        });
        setGelVisible(false);
      },
    );

    return () => unsubscribe();
  }, [toast]);

  const normalizedSearch = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery],
  );
  const activeCategoryConfig = useMemo(
    () => CATEGORY_COLORS[activeCategory],
    [activeCategory],
  );
  const products = useMemo(() => {
    const sourceProducts = firebaseProducts || PRODUCTS;
    const hasNaranja850 = sourceProducts.some(
      (product) => isNaranja850Product(product),
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
  const visibleHomeBlobs = useMemo(
    () => (isMobile ? HOME_BLOBS.slice(0, 3) : HOME_BLOBS),
    [isMobile],
  );
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory((currentCategory) =>
      currentCategory === category ? currentCategory : category,
    );
  }, []);
  const categoryHandlers = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_ORDER.map((category) => [
          category,
          () => handleCategoryChange(category),
        ]),
      ) as Record<string, () => void>,
    [handleCategoryChange],
  );
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [],
  );

  return (
    <div
      id="inicio"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#fffdf8_32%,#ffffff_68%,#f8fbff_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {visibleHomeBlobs.map((blob) => (
          <div
            key={blob.className}
            className={blob.className}
            style={
              blob.animationDelay
                ? { animationDelay: blob.animationDelay }
                : undefined
            }
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_24%,rgba(255,255,255,0.02)_46%,rgba(255,255,255,0.1)_100%)]" />
      {/* El hero ya no está aquí - está en App.tsx como parte del flujo de scroll */}

      {/* ── CATÁLOGO ── */}
      <section
        id="productos"
        className="page-snap-section relative overflow-hidden bg-gradient-to-b from-slate-50 to-white"
      >
        {/* Premium subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#003F91]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[6%] top-[-4%] h-[260px] w-[260px] rounded-full bg-[#003F91]/14 blur-[90px] sm:h-[340px] sm:w-[340px] lg:h-[420px] lg:w-[420px]" />
          <div className="absolute left-1/2 top-[0%] h-[220px] w-[320px] -translate-x-1/2 rounded-full bg-[#00A8B5]/12 blur-[82px] sm:h-[280px] sm:w-[420px] lg:h-[340px] lg:w-[560px]" />
          <div className="absolute right-[8%] top-[1%] h-[250px] w-[250px] rounded-full bg-[#FFCD00]/20 blur-[90px] sm:h-[320px] sm:w-[320px] lg:h-[390px] lg:w-[390px]" />
          <div className="absolute left-[18%] top-[18%] h-[180px] w-[300px] rotate-[-10deg] rounded-full bg-[linear-gradient(135deg,rgba(255,46,99,0.12),rgba(255,205,0,0.04))] blur-[76px] sm:w-[380px] lg:w-[460px]" />
          <div className="absolute right-[16%] top-[20%] h-[170px] w-[280px] rotate-[12deg] rounded-full bg-[linear-gradient(135deg,rgba(0,63,145,0.1),rgba(0,168,181,0.03))] blur-[72px] sm:w-[360px] lg:w-[430px]" />
          <div className="absolute inset-x-0 top-0 h-[48%] bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.72)_60%,rgba(255,255,255,0.98)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24">
          {/* Heading */}
          <div className="mx-auto mb-10 max-w-6xl rounded-[32px] border border-white/70 bg-white/75 px-6 py-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mb-12 sm:px-10 sm:py-10">
            <h2 className="mt-4 px-2 text-4xl font-black tracking-tight text-[#003F91] sm:text-5xl lg:text-4xl">
              Color sin límites{" "}
              <span
                className="relative"
                style={{
                  background:
                    "linear-gradient(135deg, #FFCD00 0%, #FF8C00 50%, #FF2E63 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 2px 8px rgba(255,205,0,0.24))",
                }}
              >
                TROPICOLORS
              </span>{" "}
              en cada aplicación.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-base">
              Desde alimentos hasta procesos industriales, precisión, intensidad
              y consistencia en cada resultado.
            </p>
            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-4 gap-y-2 px-2 text-sm leading-relaxed text-slate-500">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#003F91]" />
                Precios + IVA 16%
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00A8B5]" />
                Cajas completas
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFCD00]" />
                Envío por cuenta del cliente
              </span>
            </div>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {STORE_HIGHLIGHTS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="relative mb-14 rounded-[32px] border border-white/70 bg-white/70 px-4 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:mb-16 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-[-18%] h-28 w-40 rounded-full bg-[#003F91]/12 blur-3xl" />
              <div className="absolute left-1/2 top-[-10%] h-24 w-44 -translate-x-1/2 rounded-full bg-[#00A8B5]/12 blur-3xl" />
              <div className="absolute right-[10%] top-[-14%] h-28 w-44 rounded-full bg-[#FFCD00]/20 blur-3xl" />
            </div>
            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Explora por familia
                  </p>
                  <div className="mt-4 flex w-full flex-wrap gap-3">
                    {CATEGORY_ORDER.map((cat, index) => {
                      const isActive = activeCategory === cat;
                      const colors = CATEGORY_COLORS[cat];
                      return (
                        <motion.button
                          key={cat}
                          onClick={categoryHandlers[cat]}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.04,
                            ease: "easeOut",
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 sm:px-5 sm:py-2.5"
                          style={{
                            backgroundColor: isActive
                              ? colors.bg
                              : "rgba(243,244,246,0.9)",
                            color: isActive ? colors.text : "#6b7280",
                            boxShadow: isActive
                              ? `0 10px 24px ${colors.bg}33`
                              : "0 1px 3px rgba(0,0,0,0.05)",
                            border: `1.5px solid ${isActive ? colors.bg : "rgba(229,231,235,0.8)"}`,
                          }}
                        >
                          {cat}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative z-10 w-full">
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Buscar color
                  </label>
                  <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white/95 px-4 py-3 shadow-sm">
                    <Search size={18} className="shrink-0 text-slate-400" />
                    <input
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Buscar color, familia o tono..."
                      className="w-full border-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                      aria-label={`Buscar color dentro de ${activeCategoryConfig ? activeCategory : "todos los productos"}`}
                    />
                    <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 sm:inline-flex">
                      {filteredProducts.length} resultados
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-[linear-gradient(145deg,#0f172a_0%,#0b3b8c_52%,#0ea5b7_100%)] px-5 py-5 text-white shadow-[0_25px_70px_rgba(15,23,42,0.2)]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#FFCD00]/25 blur-3xl" />
                  <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#FF2E63]/20 blur-3xl" />
                </div>
                <p className="relative text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-100/80">
                  Selección activa
                </p>
                <h3 className="relative mt-3 text-2xl font-black tracking-tight">
                  {activeCategory}
                </h3>
                <p className="relative mt-2 max-w-xs text-sm leading-relaxed text-slate-200">
                  Navega una colección más clara, encuentra más rápido el tono
                  ideal y cotiza sin salir del catálogo.
                </p>
                <div className="relative mt-5 flex items-center gap-3">
                  <div
                    className="h-14 w-14 rounded-2xl border border-white/20 shadow-[0_12px_30px_rgba(15,23,42,0.2)]"
                    style={{
                      background: `linear-gradient(145deg, ${activeCategoryConfig?.bg ?? "#FFCD00"}, ${activeCategoryConfig?.bg ?? "#003F91"})`,
                    }}
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      Curaduría
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {filteredProducts.length} opciones visibles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Grid ── */}
          <div className="grid grid-cols-1 gap-6 min-[480px]:gap-7 md:grid-cols-2 md:gap-8 2xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="mx-auto h-full w-full max-w-[440px]"
              >
                <ProductCard
                  product={product}
                  addToCart={addToCart}
                  addFlyingItem={addFlyingItem}
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No hay productos disponibles con esos filtros.
            </div>
          )}
        </div>
      </section>

      {/* ── PRÓXIMAMENTE GEL ── */}
      <motion.section
        id="gel"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="page-snap-section bg-white overflow-visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {gelVisible ? (
            <>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#003F91] mb-4 tracking-tight leading-[1.15] px-2 pb-2">
                  Colorante en{" "}
                  <span
                    className="inline-block pr-[0.08em]"
                    style={{
                      background: "linear-gradient(135deg,#FF2E63,#C71585)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Gel
                  </span>
                </h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                  Colorantes en gel listos para compra. Ideales para betunes,
                  fondants, chocolates y decoración profesional.
                </p>
              </div>

              <motion.div
                layout
                className="grid grid-cols-1 gap-6 min-[480px]:gap-7 md:grid-cols-2 md:gap-8 2xl:grid-cols-3"
              >
                <AnimatePresence>
                  {GEL_PRODUCTS.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      layout
                      className="mx-auto h-full w-full max-w-[440px]"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: idx * 0.05,
                      }}
                    >
                      <ProductCard
                        product={product}
                        addToCart={addToCart}
                        addFlyingItem={addFlyingItem}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              <div className="mt-12 text-center">
                <a
                  href="https://wa.me/525551146856?text=Hola%20quiero%20comprar%20colorante%20en%20gel%20de%20Tropicolors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-10 py-4.5 bg-[#003F91] text-white rounded-full font-extrabold hover:bg-[#002d6e] transition-all hover:scale-105 shadow-2xl shadow-[#003F91]/30 text-base"
                >
                  <MessageCircle size={20} />
                  Comprar ahora
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-16">
                <span className="inline-block py-1.5 px-5 rounded-full bg-[#FF2E63]/10 text-[#FF2E63] text-[11px] font-extrabold uppercase tracking-widest mb-5 border border-[#FF2E63]/20">
                  Próximamente
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#003F91] mb-4 tracking-tight leading-[1.15] px-2 pb-2">
                  Colorante en{" "}
                  <span
                    className="inline-block pr-[0.08em]"
                    style={{
                      background: "linear-gradient(135deg,#FF2E63,#C71585)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Gel
                  </span>
                </h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                  Estamos trabajando en una nueva línea de colorantes en gel de
                  alta concentración. Perfectos para betunes, fondants,
                  chocolates y decoración profesional.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 mb-14">
                {GEL_COLORS.map((color, i) => (
                  <motion.div
                    key={color.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group relative rounded-2xl overflow-hidden cursor-default aspect-square shadow-xl"
                    style={{
                      background: `linear-gradient(145deg, ${color.hex}, ${color.hex2})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />

                    <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                        style={{
                          background: "rgba(255,255,255,0.18)",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      >
                        <FlaskConical size={24} color={color.textColor} />
                      </div>
                      <span
                        className="text-sm font-extrabold text-center leading-tight"
                        style={{ color: color.textColor }}
                      >
                        {color.name}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: color.textColor,
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        En desarrollo
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href="https://wa.me/525551146856?text=Hola%20me%20interesa%20el%20colorante%20en%20gel%20de%20Tropicolors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-10 py-4.5 bg-[#003F91] text-white rounded-full font-extrabold hover:bg-[#002d6e] transition-all hover:scale-105 shadow-2xl shadow-[#003F91]/30 text-base"
                >
                  <MessageCircle size={20} />
                  Notificarme cuando esté disponible
                </a>
                <p className="mt-4 text-sm text-muted-foreground">
                  Escríbenos por WhatsApp y te avisamos al lanzamiento
                </p>
              </div>
            </>
          )}
        </div>
      </motion.section>

      {/* ── NOSOTROS ── */}
      <motion.section
        id="nosotros"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="page-snap-section bg-slate-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-7 border border-[#003F91]/15">
                Sobre Nosotros
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-[#003F91] mb-7 tracking-tight">
                Expertos en <span className="text-[#00A8B5]">Color</span>
                <br />
                para la industria
              </h2>
              <p className="text-base text-muted-foreground mb-5 leading-relaxed">
                En <strong className="text-[#003F91]">TropicColors</strong> nos
                especializamos en colorantes artificiales para la industria
                alimentaria en México. Sabemos que el color es el primer
                atractivo de cualquier alimento, y garantizamos tonos
                brillantes, vivos y consistentes.
              </p>
              <p className="text-base text-muted-foreground mb-10 leading-relaxed">
                Nuestros productos son 100% solubles en agua, de grado
                alimenticio y cumplen con todos los estándares de seguridad para
                su uso en panadería, confitería, bebidas, lácteos y mucho más.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Grado Alimenticio Certificado",
                  "Alta Concentración de Pigmento",
                  "Envíos a todo México",
                  "Atención a Mayoristas",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CheckCircle
                      size={16}
                      className="text-[#00A8B5] flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src={`${import.meta.env.BASE_URL}images/color-splash.png`}
                  alt="Colorantes Tropicolors"
                  loading="lazy"
                  decoding="async"
                  className="mx-auto h-full w-full max-w-[1200px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FFCD00] rounded-2xl px-7 py-5 shadow-2xl">
                <p className="text-[#003F91] font-black text-3xl leading-none">
                  +20
                </p>
                <p className="text-[#003F91] text-xs font-bold mt-0.5">
                  colores disponibles
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── BENEFICIOS ── */}
      <motion.section
        id="beneficios"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="page-snap-section bg-gradient-to-br from-[#00A8B5] via-[#00A8B5] to-[#007B7F] text-white relative overflow-hidden"
      >
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFCD00]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              ¿Por qué elegir TropiColors?
            </h2>
            <p className="text-white/70 text-base max-w-2xl mx-auto">
              Calidad, rendimiento y seguridad en cada gota de color.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Droplet,
                title: "Alta Concentración",
                desc: "Rinde más, logrando colores intensos con poca cantidad.",
                color: "from-emerald-400 to-emerald-600",
              },
              {
                icon: Sparkles,
                title: "100% Soluble",
                desc: "Se integra perfectamente en mezclas base agua, sin grumos.",
                color: "from-cyan-400 to-cyan-600",
              },
              {
                icon: ShieldCheck,
                title: "Grado Alimenticio",
                desc: "Totalmente seguro e inocuo para el consumo humano.",
                color: "from-violet-400 to-violet-600",
              },
              {
                icon: Clock,
                title: "Larga Vida Útil",
                desc: "Excelente estabilidad y conservación en anaquel.",
                color: "from-blue-400 to-blue-600",
              },
              {
                icon: Award,
                title: "Colores Brillantes",
                desc: "Tonos vivos y consistentes para resultados profesionales.",
                color: "from-amber-400 to-orange-500",
              },
              {
                icon: Star,
                title: "Fácil de Usar",
                desc: "Se disuelve rápidamente en agua caliente o fría.",
                color: "from-pink-400 to-rose-500",
              },
              {
                icon: CheckCircle,
                title: "Precios de Mayoreo",
                desc: "Tarifas especiales por volumen, cajas completas.",
                color: "from-teal-400 to-teal-600",
              },
              {
                icon: MessageCircle,
                title: "Asesoría Personalizada",
                desc: "Te ayudamos a encontrar el color exacto que necesitas.",
                color: "from-indigo-400 to-indigo-600",
              },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 hover:border-white/20 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <b.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{b.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── WHATSAPP CTA ── */}
      <section className="page-snap-section relative overflow-hidden bg-[linear-gradient(135deg,#082f49_0%,#003F91_48%,#00A8B5_100%)] text-white">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#FFCD00]/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/8 px-6 py-10 shadow-[0_30px_80px_rgba(8,47,73,0.28)] backdrop-blur-xl sm:px-10">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-100">
              Atención comercial
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              ¿Necesitas una cotización?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/74">
              Contáctanos directamente para precios de mayoreo, envíos a todo
              México y asesoría especializada.
            </p>
            <a
              href="https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20colorantes%20Tropicolors"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-10 py-4.5 text-base font-bold text-[#003F91] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30"
            >
              <MessageCircle size={22} />
              Escríbenos por WhatsApp
            </a>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                +52 55 5114 6856
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                01 800 8 36 74 68
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                Respuesta comercial directa
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <motion.section
        id="contacto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="page-snap-section bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-7 border border-[#003F91]/15">
                Contáctanos
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#003F91] mb-5 tracking-tight">
                Hablemos de
                <br />
                tu proyecto
              </h2>
              <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
                Déjanos tus datos y te responderemos a la brevedad con la mejor
                asesoría.
              </p>
              <div className="space-y-5">
                {[
                  { label: "Teléfono / WhatsApp", value: "+52 55 5114 6856" },
                  { label: "Lada sin costo", value: "01 800 8 36 74 68" },
                  {
                    label: "Correo electrónico",
                    value: "m_tropicolors1@hotmail.com",
                  },
                  {
                    label: "Dirección",
                    value:
                      "Abedules Mz.1 Lt.36, Ejército del Trabajo II, Ecatepec, Edo. Mex. C.P. 55238",
                  },
                ].map((c, i) => (
                  <div key={i} className="border-l-2 border-[#003F91]/20 pl-4">
                    <p className="text-[10px] font-extrabold text-[#003F91]/50 uppercase tracking-widest mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              {contactSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#003F91]/4 border border-[#003F91]/12 rounded-3xl p-16 text-center"
                >
                  <div className="w-16 h-16 bg-[#00A8B5]/15 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-[#00A8B5]" />
                  </div>
                  <h3 className="text-xl font-black text-[#003F91] mb-2">
                    ¡Mensaje recibido!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-7">
                    Nos pondremos en contacto contigo muy pronto.
                  </p>
                  <button
                    onClick={() => setContactSent(false)}
                    className="text-sm text-[#003F91] font-semibold underline underline-offset-4"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit(onContactSubmit)}
                  className="bg-slate-50/80 border border-border/40 p-8 rounded-3xl space-y-5 shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                        Nombre
                      </label>
                      <input
                        {...register("name")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                        placeholder="Tu nombre"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                        Correo
                      </label>
                      <input
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                      Teléfono (opcional)
                    </label>
                    <input
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                      Mensaje o Producto de Interés
                    </label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm resize-none transition-all"
                      placeholder="Me interesa cotizar Azul 125 en cubeta de 6 KG..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#003F91] text-white rounded-xl font-extrabold text-sm hover:bg-[#002d6e] transition-colors shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function getPresentationOptions(
  product: Product,
  concentration: Concentration,
): Array<{ label: string; price: number }> {
  const overridden = product.presentationOverrides?.[concentration];
  if (overridden?.length) {
    return overridden.filter((presentation) => presentation.price > 0);
  }

  const prices = product.prices[concentration];
  if (!prices) {
    return [];
  }

  return PRESENTATIONS.map((label, index) => ({
    label,
    price: prices[index],
  })).filter((presentation) => presentation.price > 0);
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function isNaranja850Product(product: Pick<Product, "id" | "name">): boolean {
  return (
    product.id === "naranja-850" ||
    product.name.trim().toLowerCase() === "naranja 850"
  );
}

function getProductNote(product: Pick<Product, "id" | "name" | "note">): string {
  if (isNaranja850Product(product)) {
    return NARANJA_850_NOTE;
  }

  return product.note?.trim() || "";
}

function getProductBadgeNote(
  product: Pick<Product, "id" | "name" | "note">,
): string {
  if (isNaranja850Product(product)) {
    return "";
  }

  return product.note?.trim() || "";
}

function formatProductNote(note: string): string {
  const trimmed = note.trim();
  if (!trimmed) {
    return "";
  }

  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function getProductDescription(product: Product): string {
  if (product.industrial) {
    return "Pigmento de alto rendimiento para procesos exigentes.";
  }

  const productNote = getProductNote(product);
  if (productNote) {
    return formatProductNote(productNote);
  }

  return "Color intenso y uniforme para aplicaciones exigentes.";
}

function getProductHighlights(product: Product): string[] {
  if (product.industrial) {
    return ["Alta intensidad", "Uso profesional", "Aplicacion industrial"];
  }

  if (getProductNote(product)) {
    return ["Uso alimentario", "Alta intensidad", "Color estable"];
  }

  return ["Alta intensidad", "Uso profesional", "Color estable"];
}

/* ── Glass Product Card ── */
const ProductCard = React.memo(function ProductCard({
  product,
  addToCart,
  addFlyingItem,
}: {
  product: Product;
  addToCart: AddToCartFn;
  addFlyingItem: AddFlyingItemFn;
}) {
  const { toast } = useToast();
  const availableConcentrations = useMemo(
    () => (["125", "250"] as Concentration[]).filter((value) => {
      const options = getPresentationOptions(product, value);
      return options.length > 0;
    }),
    [product],
  );
  const [selectedConcentration, setSelectedConcentration] =
    useState<Concentration>(availableConcentrations[0] || "125");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("mayoreo");
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [wholesaleQuantity, setWholesaleQuantity] = useState(1);
  const [selectedWholesalePieces, setSelectedWholesalePieces] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!availableConcentrations.includes(selectedConcentration)) {
      setSelectedConcentration(availableConcentrations[0] || "125");
      setSelectedIdx(0);
    }
  }, [availableConcentrations, selectedConcentration]);

  const availablePresentations = useMemo(
    () => getPresentationOptions(product, selectedConcentration),
    [product, selectedConcentration],
  );
  const pieceReferencePresentation = useMemo(
    () =>
      availablePresentations.find((presentation) => {
        const pieces = getPiecesFromPresentationLabel(presentation.label);
        return Boolean(pieces) || /gram/i.test(presentation.label);
      }) ?? availablePresentations[0],
    [availablePresentations],
  );

  useEffect(() => {
    setSelectedIdx(0);
    setPieceQuantity(1);
    setWholesaleQuantity(1);
  }, [selectedConcentration]);

  const selected = useMemo(
    () => availablePresentations[selectedIdx] ?? availablePresentations[0],
    [availablePresentations, selectedIdx],
  );
  const piecesPerBoxFromPresentation = useMemo(
    () => (selected ? getPiecesFromPresentationLabel(selected.label) : null),
    [selected],
  );
  const specialWholesaleBoxes = useMemo(
    () => product.specialWholesaleBoxes?.[selectedConcentration] || [],
    [product.specialWholesaleBoxes, selectedConcentration],
  );
  const wholesalePiecesOptions = useMemo(() => {
    if (specialWholesaleBoxes.length > 0) {
      return specialWholesaleBoxes;
    }

    if (piecesPerBoxFromPresentation) {
      return [piecesPerBoxFromPresentation];
    }

    return [];
  }, [piecesPerBoxFromPresentation, specialWholesaleBoxes]);

  useEffect(() => {
    const defaultWholesalePieces = wholesalePiecesOptions[0] ?? null;
    setSelectedWholesalePieces(defaultWholesalePieces);
  }, [wholesalePiecesOptions]);

  const priceBase = selected?.price ?? 0;
  const piecePriceBase = pieceReferencePresentation?.price ?? 0;
  const isOnlyWholesale = Boolean(product.onlyWholesale);
  const isPieceEligiblePresentation =
    Boolean(pieceReferencePresentation) &&
    (Boolean(
      pieceReferencePresentation
        ? getPiecesFromPresentationLabel(pieceReferencePresentation.label)
        : null,
    ) ||
      /gram/i.test(pieceReferencePresentation?.label || "") ||
      specialWholesaleBoxes.length > 0);
  const allowsPiece =
    !isOnlyWholesale && piecePriceBase > 0 && isPieceEligiblePresentation;
  const allowsMayoreo = priceBase > 0;

  useEffect(() => {
    if (isOnlyWholesale && purchaseType !== "mayoreo") {
      setPurchaseType("mayoreo");
      return;
    }

    if (purchaseType === "pieza" && !allowsPiece) {
      setPurchaseType("mayoreo");
      return;
    }

    if (purchaseType === "mayoreo" && !allowsMayoreo) {
      setPurchaseType("pieza");
    }
  }, [allowsMayoreo, allowsPiece, isOnlyWholesale, purchaseType]);

  const notAvailable = useMemo(
    () => availablePresentations.length === 0,
    [availablePresentations.length],
  );
  const productDescription = useMemo(
    () => getProductDescription(product),
    [product],
  );
  const productNoteLabel = useMemo(
    () => getProductBadgeNote(product),
    [product],
  );
  const productHighlights = useMemo(
    () => getProductHighlights(product),
    [product],
  );
  const piecePrice = useMemo(
    () => calculatePiecePrice(piecePriceBase),
    [piecePriceBase],
  );
  const wholesaleUnitTotal = useMemo(
    () => calculateMayoreoUnitTotal(priceBase, selectedWholesalePieces),
    [priceBase, selectedWholesalePieces],
  );
  const currentSubtotal =
    purchaseType === "pieza"
      ? piecePrice * pieceQuantity
      : wholesaleUnitTotal * wholesaleQuantity;
  const handleAddToCart = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!selected || priceBase <= 0) {
        return;
      }

      if (purchaseType === "mayoreo" && !allowsMayoreo) {
        toast({
          title: "Compra no disponible",
          description:
            "Esta presentación no admite mayoreo por caja en la configuración actual.",
          variant: "destructive",
        });
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top;
      const effectiveQuantity =
        purchaseType === "pieza" ? pieceQuantity : wholesaleQuantity;
      const effectivePiecesPerBox =
        purchaseType === "mayoreo" ? selectedWholesalePieces : null;
      const effectiveUnitPrice =
        purchaseType === "pieza" ? piecePrice : wholesaleUnitTotal;
      const effectivePriceBase =
        purchaseType === "pieza" ? piecePriceBase : priceBase;
      const effectiveSubtotal = effectiveUnitPrice * effectiveQuantity;

      addFlyingItem({
        productId: product.id,
        imageUrl: undefined,
        hexCode: product.hex,
        startX,
        startY,
      });

      addToCart({
        cartKey: buildCartItemKey({
          productId: product.id,
          concentration: selectedConcentration,
          size: selected.label,
          purchaseType,
          piecesPerBox: effectivePiecesPerBox,
        }),
        productId: product.id,
        productName: `${product.name} C-${selectedConcentration}`,
        size: selected.label,
        price: effectiveUnitPrice,
        quantity: effectiveQuantity,
        hexCode: product.hex,
        concentration: selectedConcentration,
        purchaseType,
        priceBase: effectivePriceBase,
        unitPrice: effectiveUnitPrice,
        subtotal: effectiveSubtotal,
        piecesPerBox: effectivePiecesPerBox,
        quantityBoxes:
          purchaseType === "mayoreo" ? effectiveQuantity : undefined,
        totalPieces:
          purchaseType === "mayoreo" && effectivePiecesPerBox
            ? effectivePiecesPerBox * effectiveQuantity
            : effectiveQuantity,
        warningMessage: product.purchaseWarning,
      });
    },
    [
      addFlyingItem,
      addToCart,
      allowsMayoreo,
      piecePrice,
      piecePriceBase,
      pieceQuantity,
      priceBase,
      product,
      purchaseType,
      selected,
      selectedConcentration,
      selectedWholesalePieces,
      toast,
      wholesaleQuantity,
      wholesaleUnitTotal,
    ],
  );

  return (
    <motion.div
      layout
      className="relative h-full overflow-hidden rounded-[26px] border border-white/80 bg-[radial-gradient(circle_at_top,rgba(255,208,74,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,249,255,0.98)_100%)] transition-all duration-300 will-change-transform hover:-translate-y-1 min-[480px]:rounded-[28px] lg:min-h-[640px]"
      style={{
        boxShadow:
          "0 18px 50px rgba(15,23,42,0.10), 0 2px 10px rgba(15,23,42,0.05)",
      }}
    >
      {/* Subtle color glow */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ backgroundColor: product.hex }}
      />

      <div
        className="h-[8px] w-full"
        style={{
          background: `linear-gradient(90deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
        }}
      />

      <div className="relative flex h-full flex-col p-4 min-[400px]:p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.18em] text-slate-500 shadow-sm min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-[9px]">
            {product.category}
          </span>
          {(product.industrial || productNoteLabel) && (
            <span className="inline-flex rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 shadow-sm min-[400px]:px-3 min-[400px]:py-1.5 min-[400px]:text-[9px]">
              {product.industrial ? "Industrial" : productNoteLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 min-[400px]:mt-5 min-[400px]:gap-5">
          <div className="grid min-h-[112px] items-center gap-3 min-[500px]:grid-cols-[92px_minmax(0,1fr)] min-[500px]:gap-5 min-[400px]:min-h-[126px]">
            <div
              className="mx-auto mt-1 h-[68px] w-[68px] shrink-0 rounded-full border-[4px] border-white shadow-[0_16px_28px_rgba(255,205,0,0.22)] min-[400px]:h-[78px] min-[400px]:w-[78px] min-[500px]:h-[92px] min-[500px]:w-[92px]"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), transparent 28%), linear-gradient(135deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
                boxShadow: `0 12px 28px ${product.hex}36`,
              }}
            />
            <div className="min-w-0 text-center min-[500px]:text-left">
              <h3 className="text-[1.4rem] font-black leading-[0.94] tracking-tight text-[#0b2d6b] min-[400px]:text-[1.65rem] min-[500px]:text-[2.05rem]">
                {product.name}
              </h3>
              <p className="mx-auto mt-2 max-w-sm min-h-[2.6rem] overflow-hidden text-[12px] leading-relaxed text-slate-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] min-[400px]:mt-2.5 min-[400px]:min-h-[3rem] min-[400px]:text-[13px] min-[500px]:mx-0 min-[500px]:text-[14px]">
                {productDescription}
              </p>
            </div>
          </div>

          <div className="grid min-h-[86px] grid-cols-1 gap-2 min-[400px]:gap-2.5 min-[500px]:grid-cols-2">
            {productHighlights.slice(0, 3).map((highlight, index) => (
              <span
                key={`${product.id}-${highlight}`}
                className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm min-[400px]:gap-1.5 min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-[11px] min-[500px]:justify-start ${
                  index === 2 ? "min-[500px]:col-span-1" : ""
                }`}
              >
                {index === 0 ? (
                  <Star
                    size={12}
                    className="shrink-0 fill-[#FFCD00] text-[#FFCD00]"
                  />
                ) : index === 1 ? (
                  <CheckCircle size={12} className="shrink-0 text-[#E0B100]" />
                ) : (
                  <CheckCircle size={12} className="shrink-0 text-[#5b6b8c]" />
                )}
                <span className="truncate text-center min-[500px]:text-left">
                  {highlight}
                </span>
              </span>
            ))}
          </div>
        </div>

        {notAvailable ? (
          <div className="mt-auto flex min-h-[168px] items-center py-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              No disponible en la concentración seleccionada. Elige otra si está
              disponible.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-auto rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] min-[400px]:rounded-[24px] min-[400px]:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Elige concentración
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {availableConcentrations.map((value) => {
                  const isActive = selectedConcentration === value;
                  return (
                    <button
                      key={`selector-${value}`}
                      type="button"
                      onClick={() => setSelectedConcentration(value)}
                      className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-all min-[400px]:px-4 min-[400px]:text-[11px] ${
                        isActive
                          ? "bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/20"
                          : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      C-{value}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-200/80 pt-4 min-[400px]:mt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    {isOnlyWholesale && wholesalePiecesOptions.length > 1
                      ? "Elige caja"
                      : "Elige presentación"}
                  </p>
                  <span className="rounded-full bg-[#0b2d6b]/6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b2d6b]">
                    C-{selectedConcentration}
                  </span>
                </div>
              </div>

              {isOnlyWholesale && wholesalePiecesOptions.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2 min-[400px]:mt-4">
                  {wholesalePiecesOptions.map((pieces) => {
                    const isActive = selectedWholesalePieces === pieces;
                    return (
                      <button
                        key={`${product.id}-box-${pieces}`}
                        type="button"
                        onClick={() => setSelectedWholesalePieces(pieces)}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          isActive
                            ? "bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/20"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        Caja de {pieces} piezas
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative mt-3 min-[400px]:mt-4">
                  <select
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-xs font-semibold text-gray-700 shadow-sm transition-all focus:border-[#003F91]/30 focus:outline-none focus:ring-2 focus:ring-[#003F91]/15 min-[400px]:py-3 min-[400px]:text-sm"
                    value={selectedIdx}
                    onChange={(e) => setSelectedIdx(Number(e.target.value))}
                  >
                    {availablePresentations.map((p, i) => (
                      <option key={i} value={i}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              )}

              <div className="mt-4 space-y-4 min-[400px]:mt-5">
                <div className={`grid gap-2 ${allowsPiece ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                  {allowsPiece ? (
                    <button
                      type="button"
                      onClick={() => setPurchaseType("pieza")}
                      disabled={!allowsPiece}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        purchaseType === "pieza"
                          ? "border-[#0b2d6b] bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/15"
                          : "border-slate-200 bg-white text-slate-700"
                      } ${!allowsPiece ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                        Precio por pieza
                      </p>
                      <p className="mt-2 text-lg font-black">
                        ${piecePrice.toLocaleString("es-MX")}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          purchaseType === "pieza"
                            ? "text-white/75"
                            : "text-slate-500"
                        }`}
                      >
                        
                      </p>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPurchaseType("mayoreo")}
                    disabled={!allowsMayoreo}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      purchaseType === "mayoreo"
                        ? "border-[#0b2d6b] bg-[#0b2d6b] text-white shadow-lg shadow-[#0b2d6b]/15"
                        : "border-slate-200 bg-white text-slate-700"
                    } ${!allowsMayoreo ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]">
                      Compra por mayoreo
                    </p>
                    <p className="mt-2 text-lg font-black">
                      $
                      {(
                        selectedWholesalePieces
                          ? calculateMayoreoUnitTotal(priceBase, selectedWholesalePieces)
                          : priceBase
                      ).toLocaleString("es-MX")}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        purchaseType === "mayoreo"
                          ? "text-white/75"
                          : "text-slate-500"
                      }`}
                    >
                      {selectedWholesalePieces
                        ? `Total por caja de ${selectedWholesalePieces} piezas`
                        : "Total por volumen"}
                    </p>
                  </button>
                </div>

                {product.purchaseWarning ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                    {product.purchaseWarning}
                  </div>
                ) : null}

                {purchaseType === "mayoreo" &&
                specialWholesaleBoxes.length > 1 &&
                !isOnlyWholesale ? (
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Caja de mayoreo
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {specialWholesaleBoxes.map((pieces) => {
                        const isActive = selectedWholesalePieces === pieces;
                        return (
                          <button
                            key={`${product.id}-${pieces}`}
                            type="button"
                            onClick={() => setSelectedWholesalePieces(pieces)}
                            className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition ${
                              isActive
                                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-200"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            Caja de {pieces} piezas
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3">
                  <div className="relative z-10">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      {purchaseType === "pieza"
                        ? "Cantidad de piezas"
                        : selectedWholesalePieces
                          ? "Cantidad de cajas"
                          : "Cantidad"}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                      <button
                        type="button"
                        onClick={() =>
                          purchaseType === "pieza"
                            ? setPieceQuantity((current) => clampQuantity(current - 1))
                            : setWholesaleQuantity((current) => clampQuantity(current - 1))
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-[3rem] text-center text-lg font-black text-[#0b2d6b]">
                        {purchaseType === "pieza" ? pieceQuantity : wholesaleQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          purchaseType === "pieza"
                            ? setPieceQuantity((current) => clampQuantity(current + 1))
                            : setWholesaleQuantity((current) => clampQuantity(current + 1))
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {purchaseType === "pieza"
                        ? `${pieceQuantity} ${pieceQuantity === 1 ? "pieza" : "piezas"}`
                        : selectedWholesalePieces
                          ? `${wholesaleQuantity} ${wholesaleQuantity === 1 ? "caja" : "cajas"} de ${selectedWholesalePieces} piezas`
                          : `${wholesaleQuantity} volumen`}
                    </p>
                  </div>

                  <div className="min-w-0 px-1 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      {purchaseType === "pieza"
                        ? "Subtotal por pieza"
                        : selectedWholesalePieces
                          ? "Total por caja / volumen"
                          : "Total por volumen"}
                    </span>
                    <div className="mt-1 flex flex-wrap items-end gap-x-1.5 gap-y-1 leading-[0.95]">
                      <span className="break-all text-[1.45rem] font-bold tracking-tight text-[#0b4a92] min-[400px]:text-[1.6rem] min-[500px]:text-[1.8rem]">
                        ${currentSubtotal.toLocaleString("es-MX")}
                      </span>
                      <span className="pb-0.5 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-slate-400 min-[400px]:text-xs">
                        MXN
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {purchaseType === "pieza"
                        ? `${piecePrice.toLocaleString("es-MX")} por pieza`
                        : selectedWholesalePieces
                          ? `${wholesaleUnitTotal.toLocaleString("es-MX")} por caja`
                          : `${priceBase.toLocaleString("es-MX")} base por volumen`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 min-[400px]:mt-4 min-[400px]:space-y-2.5">
              <button
                onClick={handleAddToCart}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#FFE34B_0%,#FFD400_55%,#F7C900_100%)] px-4 py-3 text-center text-sm font-extrabold text-[#202531] shadow-[0_18px_30px_rgba(255,205,0,0.30)] transition-all duration-200 hover:brightness-[1.02] active:scale-[0.99] min-[400px]:min-h-[54px] min-[400px]:gap-2.5 min-[400px]:rounded-[22px] min-[400px]:text-base"
              >
                <ShoppingCart
                  size={18}
                  className="min-[400px]:h-5 min-[400px]:w-5"
                />
                Agregar al carrito
                <ArrowRight
                  size={16}
                  className="min-[400px]:h-[18px] min-[400px]:w-[18px]"
                />
              </button>

              <a
                href={`https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20Conc.%20${selectedConcentration}%20-%20${encodeURIComponent(selected?.label ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs font-semibold text-slate-500 transition hover:text-[#003F91] min-[400px]:text-sm"
                title="Cotizar por WhatsApp"
              >
                <MessageCircle size={15} />
                Compra directa
                <ArrowRight size={14} />
              </a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});
