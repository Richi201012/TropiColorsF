import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, MessageCircle, Droplet, CheckCircle, ShieldCheck,
  Sparkles, Clock, Award, Star, FlaskConical, ChevronDown
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
};

const PRESENTATIONS = [
  "Caja chica (24 pz)",
  "Caja mediana (24 pz)",
  "Caja grande (6 pz)",
  "Cubeta 6 KG",
  "Cubeta 20 KG",
];

const PRODUCTS: Product[] = [
  { id: "amarillo-canario",   name: "Amarillo Canario",   hex: "#FFD700", hex2: "#FFC400", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500],   250: [33, 68, 235, 1300, 4200] } },
  { id: "amarillo-huevo",     name: "Amarillo Huevo",     hex: "#FFA500", hex2: "#FF8C00", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500],   250: [33, 68, 235, 1300, 4200] } },
  { id: "amarillo-limon",     name: "Amarillo Limón",     hex: "#E8E800", hex2: "#CCCC00", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500],   250: [33, 68, 235, 1300, 2500] } },
  { id: "amarillo-naranja",   name: "Amarillo Naranja",   hex: "#FF8C00", hex2: "#FF6600", textColor: "#fff",    category: "Amarillos", prices: { 125: [27, 50, 165, 900, 3000],   250: [42, 80, 280, 1560, 5000] } },
  { id: "azul",               name: "Azul",               hex: "#0051C8", hex2: "#003F91", textColor: "#fff",    category: "Azul",      prices: { 125: [35, 72, 260, 1500, 5000], 250: [64, 150, 450, 2640, 8100] } },
  { id: "cafe-caramelo",      name: "Café Caramelo",      hex: "#D4944A", hex2: "#C68642", textColor: "#fff",    category: "Cafés",     prices: { 125: [26, 55, 180, 1000, 3300], 250: [37, 87, 306, 1774, 5800] } },
  { id: "cafe-chocolate",     name: "Café Chocolate",     hex: "#7B4A2D", hex2: "#5C3317", textColor: "#fff",    category: "Cafés",     prices: { 125: [31, 63, 220, 1250, 4100], 250: [43, 111, 400, 2340, 7200] } },
  { id: "naranja-pastor",     name: "Naranja Pastor",     hex: "#FF7000", hex2: "#FF5500", textColor: "#fff",    category: "Naranja",   prices: { 125: [27, 50, 165, 900, 3000],   250: [33, 63, 234, 1260, 4000] } },
  { id: "negro",              name: "Negro",              hex: "#2A2A2A", hex2: "#111111", textColor: "#fff",    category: "Negro",     prices: { 125: [74, 175, 680, 4000, 12500], 250: [74, 175, 680, 4000, 12500] } },
  { id: "rojo-cochinilla",    name: "Rojo Cochinilla",    hex: "#E01B3C", hex2: "#C01030", textColor: "#fff",    category: "Rojos",     prices: { 125: [38, 76, 265, 1530, 4800],  250: [60, 130, 480, 2646, 8400] } },
  { id: "rojo-fresa",         name: "Rojo Fresa",         hex: "#FF2E63", hex2: "#E01050", textColor: "#fff",    category: "Rojos",     prices: { 125: [33, 76, 217, 1240, 3950],  250: [57, 125, 370, 2150, 6500] } },
  { id: "rojo-grosella",      name: "Rojo Grosella",      hex: "#C71585", hex2: "#A01070", textColor: "#fff",    category: "Rojos",     prices: { 125: [38, 76, 265, 1530, 4800],  250: [60, 130, 450, 2640, 8100] } },
  { id: "rojo-purpura",       name: "Rojo Púrpura",       hex: "#8B1A35", hex2: "#6B1025", textColor: "#fff",    category: "Rojos",     prices: { 125: [33, 76, 217, 1240, 3950],  250: [57, 125, 370, 2150, 6500] } },
  { id: "rojo-uva",           name: "Rojo Uva",           hex: "#7D2D3C", hex2: "#5E1F2A", textColor: "#fff",    category: "Rojos",     prices: { 125: [38, 76, 265, 1530, 4800],  250: [60, 130, 450, 2640, 8100] } },
  { id: "verde-esmeralda",    name: "Verde Esmeralda",    hex: "#1E8A44", hex2: "#166832", textColor: "#fff",    category: "Verdes",    prices: { 125: [32, 63, 200, 1130, 3700],  250: [56, 111, 354, 2060, 6370] } },
  { id: "verde-limon",        name: "Verde Limón",        hex: "#8EC600", hex2: "#72A000", textColor: "#fff",    category: "Verdes",    prices: { 125: [24.5, 49, 152, 830, 2700], 250: [33, 63, 234, 1340, 4000] } },
  { id: "violeta-alimentos",  name: "Violeta Alimentos",  hex: "#7B00E0", hex2: "#5800A8", textColor: "#fff",    category: "Especiales", prices: { 125: [78, 0, 575, 0, 0] }, note: "Uso alimentario" },
  { id: "rosa-alimentos",     name: "Rosa Alimentos",     hex: "#FF70B8", hex2: "#E0509A", textColor: "#fff",    category: "Especiales", prices: { 125: [78, 0, 680, 0, 0] }, note: "Uso alimentario" },
  { id: "violeta-industrial", name: "Violeta Industrial", hex: "#6A0DB8", hex2: "#4E0A8A", textColor: "#fff",    category: "Industriales", industrial: true, prices: { 125: [78, 154, 575, 3350, 10500] } },
  { id: "rosa-brillante",     name: "Rosa Brillante",     hex: "#FF0099", hex2: "#CC0077", textColor: "#fff",    category: "Industriales", industrial: true, prices: { 125: [36, 72, 260, 1480, 4700], 250: [64, 147, 440, 2580, 7920] } },
];

const GEL_COLORS = [
  { name: "Amarillo",  hex: "#FFD700", hex2: "#FFC200", textColor: "#1a1a1a" },
  { name: "Naranja",   hex: "#FF7000", hex2: "#FF5500", textColor: "#fff" },
  { name: "Azul",      hex: "#0051C8", hex2: "#003F91", textColor: "#fff" },
  { name: "Rojo",      hex: "#E01B3C", hex2: "#C01030", textColor: "#fff" },
  { name: "Verde",     hex: "#1E8A44", hex2: "#166832", textColor: "#fff" },
  { name: "Rosa",      hex: "#FF70B8", hex2: "#E050A0", textColor: "#fff" },
  { name: "Morado",    hex: "#7B00E0", hex2: "#5800A8", textColor: "#fff" },
  { name: "Café",      hex: "#7B4A2D", hex2: "#5C3317", textColor: "#fff" },
  { name: "Negro",     hex: "#2A2A2A", hex2: "#111111", textColor: "#fff" },
  { name: "Turquesa",  hex: "#00A8B5", hex2: "#007E8A", textColor: "#fff" },
];

const CATEGORY_ORDER = ["Todos", "Amarillos", "Azul", "Cafés", "Naranja", "Negro", "Rojos", "Verdes", "Especiales", "Industriales"];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Todos":        { bg: "#FFCD00", text: "#003F91" },
  "Amarillos":    { bg: "#FFD700", text: "#1a1a1a" },
  "Azul":         { bg: "#003F91", text: "#ffffff" },
  "Cafés":        { bg: "#7B4A2D", text: "#ffffff" },
  "Naranja":      { bg: "#FF7000", text: "#ffffff" },
  "Negro":        { bg: "#1A1A1A", text: "#ffffff" },
  "Rojos":        { bg: "#E01B3C", text: "#ffffff" },
  "Verdes":       { bg: "#1E8A44", text: "#ffffff" },
  "Especiales":   { bg: "#7B00E0", text: "#ffffff" },
  "Industriales": { bg: "#4A4A8A", text: "#ffffff" },
};

export default function Home() {
  const { addToCart, addFlyingItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [concentration, setConcentration] = useState<Concentration>("125");
  const [contactSent, setContactSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onContactSubmit = async (_data: ContactForm) => {
    await new Promise(r => setTimeout(r, 800));
    setContactSent(true);
    reset();
  };

  const filtered = PRODUCTS.filter(p => activeCategory === "Todos" || p.category === activeCategory);

  return (
    <div className="min-h-screen pt-20" id="inicio">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}hero-banner.png`}
            alt="Colorantes Tropicolors"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001F50]/97 via-[#003F91]/85 to-[#003F91]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#FFCD00] text-[#003F91] text-[11px] font-extrabold tracking-widest uppercase mb-8 shadow-lg">
              <Sparkles size={12} />
              Calidad Premium · Grado Alimenticio
            </span>
            <h1 className="text-5xl md:text-[5.5rem] font-black leading-[1.05] mb-7 tracking-tight">
              Dale vida y<br />
              color a tus{" "}
              <span className="text-[#FFCD00] italic">creaciones</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-12 leading-relaxed max-w-lg font-light">
              Colorantes artificiales de grado alimenticio. Alta concentración, colores brillantes y la mejor calidad para la industria de alimentos en México.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.querySelector("#productos")?.scrollIntoView({ behavior: "smooth" })}
                className="px-9 py-4.5 rounded-full bg-[#FFCD00] text-[#003F91] font-extrabold text-base hover:bg-yellow-300 hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#FFCD00]/30"
              >
                Ver Catálogo Completo
              </button>
              <a
                href="https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors"
                target="_blank"
                rel="noopener noreferrer"
                className="px-9 py-4.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white font-bold text-base text-center hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle size={19} />
                Cotizar por WhatsApp
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 animate-bounce"
        >
          <ChevronDown size={30} />
        </motion.div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section id="productos" className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-5 border border-[#003F91]/12">
              Lista de Precios 2026
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-[#003F91] mb-5 tracking-tight">
              Colorantes en <span className="text-[#FFCD00]" style={{ WebkitTextStroke: "1px #d4a800" }}>Polvo</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              Precios + IVA 16% · Solo se venden cajas completas · La mercancía viaja a cuenta del comprador
            </p>
          </div>

          {/* ── Filter Bar ── */}
          <div className="flex flex-col items-center gap-5 mb-12">

            {/* Fila 1: Categorías de color */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORY_ORDER.map((cat) => {
                const isActive = activeCategory === cat;
                const colors = CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap hover:scale-105 active:scale-95"
                    style={
                      isActive
                        ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.bg, boxShadow: `0 4px 12px ${colors.bg}55` }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280", borderColor: "#e5e7eb" }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">Concentración</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Fila 2: Concentraciones — centradas */}
            <div className="flex items-center bg-white border border-gray-200 rounded-full p-1.5 gap-1 shadow-sm">
              {(["125", "250"] as Concentration[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setConcentration(c)}
                  className="px-7 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 whitespace-nowrap hover:scale-105 active:scale-95"
                  style={
                    concentration === c
                      ? { backgroundColor: "#003F91", color: "#ffffff", boxShadow: "0 2px 8px rgba(0,63,145,0.35)" }
                      : { backgroundColor: "transparent", color: "#9ca3af" }
                  }
                >
                  Conc. {c}
                </button>
              ))}
            </div>

          </div>

          {/* ── Product Grid ── */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  prices={product.prices[concentration]}
                  concentration={concentration}
                  addToCart={addToCart}
                  addFlyingItem={addFlyingItem}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No hay productos disponibles en esta categoría con concentración {concentration}.
            </div>
          )}
        </div>
      </section>

      {/* ── PRÓXIMAMENTE GEL ── */}
      <section id="gel" className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-5 rounded-full bg-[#FF2E63]/10 text-[#FF2E63] text-[11px] font-extrabold uppercase tracking-widest mb-5 border border-[#FF2E63]/20">
              Próximamente
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-[#003F91] mb-5 tracking-tight">
              Colorante en{" "}
              <span
                className="italic"
                style={{ background: "linear-gradient(135deg,#FF2E63,#C71585)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                Gel
              </span>
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
              Estamos trabajando en una nueva línea de colorantes en gel de alta concentración. Perfectos para betunes, fondants, chocolates y decoración profesional.
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
                style={{ background: `linear-gradient(145deg, ${color.hex}, ${color.hex2})` }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {/* Shine */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />

                <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    <FlaskConical size={24} color={color.textColor} />
                  </div>
                  <span className="text-sm font-extrabold text-center leading-tight" style={{ color: color.textColor }}>
                    {color.name}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)", color: color.textColor, border: "1px solid rgba(255,255,255,0.25)" }}
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
            <p className="mt-4 text-sm text-muted-foreground">Escríbenos por WhatsApp y te avisamos al lanzamiento</p>
          </div>
        </div>
      </section>

      {/* ── NOSOTROS ── */}
      <section id="nosotros" className="py-28 bg-slate-50 overflow-hidden">
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
                Expertos en <span className="text-[#00A8B5]">Color</span><br />para la industria
              </h2>
              <p className="text-base text-muted-foreground mb-5 leading-relaxed">
                En <strong className="text-[#003F91]">TropicColors</strong> nos especializamos en colorantes artificiales para la industria alimentaria en México. Sabemos que el color es el primer atractivo de cualquier alimento, y garantizamos tonos brillantes, vivos y consistentes.
              </p>
              <p className="text-base text-muted-foreground mb-10 leading-relaxed">
                Nuestros productos son 100% solubles en agua, de grado alimenticio y cumplen con todos los estándares de seguridad para su uso en panadería, confitería, bebidas, lácteos y mucho más.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Grado Alimenticio Certificado",
                  "Alta Concentración de Pigmento",
                  "Envíos a todo México",
                  "Atención a Mayoristas",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle size={16} className="text-[#00A8B5] flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{item}</span>
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
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#FFCD00] rounded-2xl px-7 py-5 shadow-2xl">
                <p className="text-[#003F91] font-black text-3xl leading-none">+20</p>
                <p className="text-[#003F91] text-xs font-bold mt-0.5">colores disponibles</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ── */}
      <section id="beneficios" className="py-28 bg-[#003F91] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-18">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">¿Por qué elegir TropicColors?</h2>
            <p className="text-white/55 text-base max-w-2xl mx-auto">Calidad, rendimiento y seguridad en cada gota de color.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Droplet,       title: "Alta Concentración",    desc: "Rinde más, logrando colores intensos con poca cantidad." },
              { icon: Sparkles,      title: "100% Soluble",          desc: "Se integra perfectamente en mezclas base agua, sin grumos." },
              { icon: ShieldCheck,   title: "Grado Alimenticio",     desc: "Totalmente seguro e inocuo para el consumo humano." },
              { icon: Clock,         title: "Larga Vida Útil",       desc: "Excelente estabilidad y conservación en anaquel." },
              { icon: Award,         title: "Colores Brillantes",    desc: "Tonos vivos y consistentes para resultados profesionales." },
              { icon: Star,          title: "Fácil de Usar",         desc: "Se disuelve rápidamente en agua caliente o fría." },
              { icon: CheckCircle,   title: "Precios de Mayoreo",    desc: "Tarifas especiales por volumen, cajas completas." },
              { icon: MessageCircle, title: "Asesoría Personalizada",desc: "Te ayudamos a encontrar el color exacto que necesitas." },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/8 backdrop-blur border border-white/10 rounded-2xl p-7 hover:bg-white/14 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFCD00] text-[#003F91] flex items-center justify-center mb-5">
                  <b.icon size={22} />
                </div>
                <h3 className="text-sm font-extrabold mb-2">{b.title}</h3>
                <p className="text-white/55 text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP CTA ── */}
      <section className="py-24 bg-[#FFCD00]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#003F91] mb-5 tracking-tight">¿Necesitas una cotización?</h2>
          <p className="text-[#003F91]/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Contáctanos directamente para precios de mayoreo, envíos a todo México y asesoría especializada.
          </p>
          <a
            href="https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20colorantes%20Tropicolors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-12 py-5 bg-[#003F91] text-white rounded-full font-extrabold text-base hover:scale-105 hover:shadow-2xl hover:shadow-[#003F91]/40 transition-all duration-300"
          >
            <MessageCircle size={24} />
            Escríbenos por WhatsApp
          </a>
          <p className="mt-6 text-[#003F91]/50 text-sm">+52 55 5114 6856 · Lada sin costo: 01 800 8 36 74 68</p>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-7 border border-[#003F91]/15">
                Contáctanos
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#003F91] mb-5 tracking-tight">Hablemos de<br />tu proyecto</h2>
              <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
                Déjanos tus datos y te responderemos a la brevedad con la mejor asesoría.
              </p>
              <div className="space-y-5">
                {[
                  { label: "Teléfono / WhatsApp", value: "+52 55 5114 6856" },
                  { label: "Lada sin costo",       value: "01 800 8 36 74 68" },
                  { label: "Correo electrónico",   value: "m_tropicolors@hotmail.com" },
                  { label: "Dirección",             value: "Abedules Mz.1 Lt.36, Ejército del Trabajo II, Ecatepec, Edo. Mex. C.P. 55238" },
                ].map((c, i) => (
                  <div key={i} className="border-l-2 border-[#003F91]/20 pl-4">
                    <p className="text-[10px] font-extrabold text-[#003F91]/50 uppercase tracking-widest mb-0.5">{c.label}</p>
                    <p className="text-sm font-semibold text-foreground">{c.value}</p>
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
                  <h3 className="text-xl font-black text-[#003F91] mb-2">¡Mensaje recibido!</h3>
                  <p className="text-muted-foreground text-sm mb-7">Nos pondremos en contacto contigo muy pronto.</p>
                  <button
                    onClick={() => setContactSent(false)}
                    className="text-sm text-[#003F91] font-semibold underline underline-offset-4"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onContactSubmit)} className="bg-slate-50/80 border border-border/40 p-8 rounded-3xl space-y-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">Nombre</label>
                      <input
                        {...register("name")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                        placeholder="Tu nombre"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">Correo</label>
                      <input
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">Teléfono (opcional)</label>
                    <input
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">Mensaje o Producto de Interés</label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm resize-none transition-all"
                      placeholder="Me interesa cotizar Azul 125 en cubeta de 6 KG..."
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
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
      </section>

    </div>
  );
}

/* ── Glass Product Card ── */
function ProductCard({
  product,
  prices,
  concentration,
  addToCart,
  addFlyingItem,
  index,
}: {
  product: Product;
  prices: [number, number, number, number, number] | undefined;
  concentration: Concentration;
  addToCart: (item: any) => void;
  addFlyingItem: (item: { productId: string; imageUrl?: string; hexCode?: string; startX: number; startY: number }) => void;
  index: number;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const availablePresentations = prices
    ? PRESENTATIONS.map((label, i) => ({ label, price: prices[i] })).filter(p => p.price > 0)
    : [];

  const selected = availablePresentations[selectedIdx] ?? availablePresentations[0];
  const notAvailable = !prices || availablePresentations.length === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: (index % 8) * 0.04 }}
      className="relative rounded-2xl overflow-hidden flex flex-col group bg-white hover:-translate-y-1 transition-all duration-300"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Subtle color glow */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ backgroundColor: product.hex }}
      />

      {/* Top color stripe */}
      <div
        className="h-[5px] w-full"
        style={{ background: `linear-gradient(90deg, ${product.hex}, ${product.hex2 ?? product.hex})` }}
      />

      <div className="p-5 flex-1 flex flex-col gap-4 relative">
        {/* Color dot + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
              boxShadow: `0 4px 12px ${product.hex}55`,
            }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-[#003F91] leading-tight">{product.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#003F91", color: "#fff" }}
              >
                Conc. {concentration}
              </span>
              {(product.industrial || product.note) && (
                <span className="text-[10px] text-gray-400 font-semibold">
                  {product.industrial ? "Industrial" : product.note}
                </span>
              )}
            </div>
          </div>
        </div>

        {notAvailable ? (
          <div className="flex-1 flex items-center py-2">
            <p className="text-xs text-gray-400 leading-relaxed">
              No disponible en concentración {concentration}. Consulta la otra concentración.
            </p>
          </div>
        ) : (
          <>
            {/* Presentation select */}
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">
                Presentación
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003F91]/15 focus:border-[#003F91]/30 transition-all"
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(Number(e.target.value))}
                >
                  {availablePresentations.map((p, i) => (
                    <option key={i} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-slate-50 border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Precio + IVA</span>
              <span className="text-xl font-black text-[#003F91]">
                ${selected?.price.toLocaleString("es-MX")}{" "}
                <span className="text-[10px] font-normal text-gray-400">MXN</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  // Get click position for fly animation
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  const startX = rect.left + rect.width / 2;
                  const startY = rect.top;

                  // Trigger fly animation with product color
                  addFlyingItem({
                    productId: product.id,
                    imageUrl: undefined,
                    hexCode: product.hex,
                    startX,
                    startY,
                  });

                  // Add to cart
                  addToCart({
                    productId: product.id,
                    productName: `${product.name} C-${concentration}`,
                    size: selected?.label,
                    price: selected?.price,
                    quantity: 1,
                    hexCode: product.hex,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: product.hex, color: product.textColor }}
              >
                <ShoppingCart size={13} />
                Agregar
              </button>
              <a
                href={`https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20Conc.%20${concentration}%20-%20${encodeURIComponent(selected?.label ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-[1.05] active:scale-95 bg-[#FFCD00]/15 border border-[#FFCD00]/40 hover:bg-[#FFCD00]/25"
                title="Cotizar por WhatsApp"
              >
                <MessageCircle size={15} className="text-[#003F91]" />
              </a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
