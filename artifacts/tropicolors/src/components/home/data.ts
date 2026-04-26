import type {
  CategoryColor,
  ContactForm,
  HomeBlob,
  Product,
  ProductPrices,
  ReferenceFormData,
} from "./types";

export const INITIAL_CATALOG_ITEMS = {
  mobile: 6,
  desktop: 9,
} as const;

export const DEFERRED_CATALOG_DELAY_MS = 450;
export const DEFERRED_SECTIONS_DELAY_MS = 700;
export const DEFERRED_FIREBASE_DELAY_MS = 1100;

export const initialContactForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export const initialReferenceForm: ReferenceFormData = {
  name: "",
  company: "",
  role: "",
  location: "",
  message: "",
  rating: 5,
};

export const PRESENTATIONS = [
  "Caja chica (24 pz)",
  "Caja mediana (24 pz)",
  "Caja grande (6 pz)",
  "Cubeta 6 KG",
  "Cubeta 20 KG",
];

export const NARANJA_850_NOTE =
  "Color intenso y uniforme para aplicaciones exigentes.";

export const PRODUCTS: Product[] = [
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
      "Este producto solamente se vende por caja de 18 o 32 piezas",
    onlyWholesale: true,
    presentationOverrides: {
      250: [{ label: "250 gramos", price: 160 }],
    },
    specialWholesaleBoxes: {
      250: [18, 32],
    },
    specialWholesaleBoxPrices: {
      250: {
        18: 2880,
        32: 5120,
      },
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

export const GEL_COLORS = [
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

export const GEL_PRODUCTS: Product[] = GEL_COLORS.map((color) => ({
  id: `gel-${color.name.toLowerCase().replace(/\s+/g, "-")}`,
  name: `${color.name} Gel`,
  hex: color.hex,
  hex2: color.hex2,
  textColor: color.textColor,
  category: "Gel",
  prices: GEL_PRICES,
  note: "Colorante en gel",
}));

export const CATEGORY_ORDER = [
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

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
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

export const STORE_HIGHLIGHTS = [
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

export const HOME_BLOBS: HomeBlob[] = [
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
