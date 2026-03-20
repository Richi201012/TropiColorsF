import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
  shortName: string;
  hex: string;
  textColor: string;
  category: string;
  prices: ProductPrices;
  industrial?: boolean;
  note?: string;
};

const PRESENTATIONS = ["Caja 24 pz (chica)", "Caja 24 pz (mediana)", "Caja 6 pz (grande)", "Cubeta 6 KG", "Cubeta 20 KG"];

const PRODUCTS: Product[] = [
  { id: "amarillo-canario", name: "Amarillo Canario", shortName: "Amarillo Canario", hex: "#FFD700", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500], 250: [33, 68, 235, 1300, 4200] } },
  { id: "amarillo-huevo", name: "Amarillo Huevo", shortName: "Amarillo Huevo", hex: "#FFA500", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500], 250: [33, 68, 235, 1300, 4200] } },
  { id: "amarillo-limon", name: "Amarillo Limón", shortName: "Amarillo Limón", hex: "#E6E600", textColor: "#1a1a1a", category: "Amarillos", prices: { 125: [23, 47, 140, 760, 2500], 250: [33, 68, 235, 1300, 2500] } },
  { id: "amarillo-naranja", name: "Amarillo Naranja", shortName: "Amarillo Naranja", hex: "#FF8C00", textColor: "#fff", category: "Amarillos", prices: { 125: [27, 50, 165, 900, 3000], 250: [42, 80, 280, 1560, 5000] } },
  { id: "azul", name: "Azul", shortName: "Azul", hex: "#003F91", textColor: "#fff", category: "Azul", prices: { 125: [35, 72, 260, 1500, 5000], 250: [64, 150, 450, 2640, 8100] } },
  { id: "cafe-caramelo", name: "Café Caramelo", shortName: "Café Caramelo", hex: "#C68642", textColor: "#fff", category: "Cafés", prices: { 125: [26, 55, 180, 1000, 3300], 250: [37, 87, 306, 1774, 5800] } },
  { id: "cafe-chocolate", name: "Café Chocolate", shortName: "Café Chocolate", hex: "#5C3317", textColor: "#fff", category: "Cafés", prices: { 125: [31, 63, 220, 1250, 4100], 250: [43, 111, 400, 2340, 7200] } },
  { id: "naranja-pastor", name: "Naranja Pastor", shortName: "Naranja Pastor", hex: "#FF6600", textColor: "#fff", category: "Naranja", prices: { 125: [27, 50, 165, 900, 3000], 250: [33, 63, 234, 1260, 4000] } },
  { id: "negro", name: "Negro", shortName: "Negro", hex: "#1A1A1A", textColor: "#fff", category: "Negro", prices: { 125: [74, 175, 680, 4000, 12500], 250: [74, 175, 680, 4000, 12500] } },
  { id: "rojo-cochinilla", name: "Rojo Cochinilla", shortName: "Rojo Cochinilla", hex: "#DC143C", textColor: "#fff", category: "Rojos", prices: { 125: [38, 76, 265, 1530, 4800], 250: [60, 130, 480, 2646, 8400] } },
  { id: "rojo-fresa", name: "Rojo Fresa", shortName: "Rojo Fresa", hex: "#FF2E63", textColor: "#fff", category: "Rojos", prices: { 125: [33, 76, 217, 1240, 3950], 250: [57, 125, 370, 2150, 6500] } },
  { id: "rojo-grosella", name: "Rojo Grosella", shortName: "Rojo Grosella", hex: "#C71585", textColor: "#fff", category: "Rojos", prices: { 125: [38, 76, 265, 1530, 4800], 250: [60, 130, 450, 2640, 8100] } },
  { id: "rojo-purpura", name: "Rojo Púrpura", shortName: "Rojo Púrpura", hex: "#800020", textColor: "#fff", category: "Rojos", prices: { 125: [33, 76, 217, 1240, 3950], 250: [57, 125, 370, 2150, 6500] } },
  { id: "rojo-uva", name: "Rojo Uva", shortName: "Rojo Uva", hex: "#722F37", textColor: "#fff", category: "Rojos", prices: { 125: [38, 76, 265, 1530, 4800], 250: [60, 130, 450, 2640, 8100] } },
  { id: "verde-esmeralda", name: "Verde Esmeralda", shortName: "Verde Esmeralda", hex: "#1A7A3A", textColor: "#fff", category: "Verdes", prices: { 125: [32, 63, 200, 1130, 3700], 250: [56, 111, 354, 2060, 6370] } },
  { id: "verde-limon", name: "Verde Limón", shortName: "Verde Limón", hex: "#8DB600", textColor: "#fff", category: "Verdes", prices: { 125: [24.5, 49, 152, 830, 2700], 250: [33, 63, 234, 1340, 4000] } },
  { id: "violeta-alimentos", name: "Violeta Alimentos", shortName: "Violeta", hex: "#8B00FF", textColor: "#fff", category: "Especiales", prices: { 125: [78, 0, 575, 0, 0] }, note: "Uso alimentario" },
  { id: "rosa-alimentos", name: "Rosa Alimentos", shortName: "Rosa", hex: "#FF69B4", textColor: "#1a1a1a", category: "Especiales", prices: { 125: [78, 0, 680, 0, 0] }, note: "Uso alimentario" },
  { id: "violeta-industrial", name: "Violeta I (Industrial)", shortName: "Violeta Industrial", hex: "#6A0DAD", textColor: "#fff", category: "Industriales", industrial: true, prices: { 125: [78, 154, 575, 3350, 10500] } },
  { id: "rosa-brillante", name: "Rosa Brillante (Industrial)", shortName: "Rosa Brillante", hex: "#FF1493", textColor: "#fff", category: "Industriales", industrial: true, prices: { 125: [36, 72, 260, 1480, 4700], 250: [64, 147, 440, 2580, 7920] } },
];

const GEL_COLORS = [
  { name: "Amarillo", hex: "#FFD700", textColor: "#1a1a1a" },
  { name: "Naranja", hex: "#FF8C00", textColor: "#fff" },
  { name: "Azul", hex: "#003F91", textColor: "#fff" },
  { name: "Rojo", hex: "#DC143C", textColor: "#fff" },
  { name: "Verde", hex: "#1A7A3A", textColor: "#fff" },
  { name: "Rosa", hex: "#FF69B4", textColor: "#1a1a1a" },
  { name: "Morado", hex: "#6A0DAD", textColor: "#fff" },
  { name: "Café", hex: "#5C3317", textColor: "#fff" },
  { name: "Negro", hex: "#1A1A1A", textColor: "#fff" },
  { name: "Turquesa", hex: "#00A8B5", textColor: "#fff" },
];

const ALL_CATEGORIES = ["Todos", "Amarillos", "Azul", "Cafés", "Naranja", "Negro", "Rojos", "Verdes", "Especiales", "Industriales"];

export default function Home() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [concentration, setConcentration] = useState<Concentration>("125");
  const [contactSent, setContactSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onContactSubmit = async (data: ContactForm) => {
    await new Promise(r => setTimeout(r, 800));
    setContactSent(true);
    reset();
    toast({ title: "¡Mensaje enviado!", description: "Nos pondremos en contacto pronto." });
  };

  const filtered = PRODUCTS.filter(p => activeCategory === "Todos" || p.category === activeCategory);

  return (
    <div className="min-h-screen pt-20" id="inicio">

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}hero-banner.png`}
            alt="Colorantes Tropicolors"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003F91]/96 via-[#003F91]/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#FFCD00] text-[#003F91] text-xs font-extrabold tracking-widest uppercase mb-6 shadow-lg">
              Calidad Premium · Grado Alimenticio
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6">
              Dale vida y <br />color a tus{" "}
              <span className="text-[#FFCD00]">creaciones</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-lg">
              Colorantes artificiales de grado alimenticio. Alta concentración, colores brillantes y la mejor calidad para la industria de alimentos en México.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.querySelector("#productos")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 rounded-full bg-[#FFCD00] text-[#003F91] font-extrabold text-base hover:bg-yellow-300 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Ver Catálogo Completo
              </button>
              <a
                href="https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-bold text-base text-center hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Cotizar por WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 animate-bounce"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* PRODUCTS */}
      <section id="productos" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block py-1 px-4 rounded-full bg-[#003F91]/10 text-[#003F91] text-xs font-bold uppercase tracking-widest mb-4">Catálogo 2026</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#003F91] mb-4">Colorantes en Polvo</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Disponibles en concentración 125 y 250. Precios + IVA 16%. Solo se venden cajas completas. La mercancía viaja a cuenta del comprador.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
            {/* Concentration Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1 shadow-sm border border-border/50 self-start">
              {(["125", "250"] as Concentration[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setConcentration(c)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${concentration === c ? "bg-[#003F91] text-white shadow" : "text-muted-foreground hover:text-[#003F91]"}`}
                >
                  Concentración {c}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${activeCategory === cat ? "bg-[#FFCD00] text-[#003F91] shadow" : "bg-white border border-border/60 text-muted-foreground hover:border-[#003F91]/30"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, idx) => {
              const availablePrices = product.prices[concentration];
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  prices={availablePrices}
                  concentration={concentration}
                  addToCart={addToCart}
                  index={idx}
                />
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No hay productos disponibles en esta categoría con concentración {concentration}.
            </div>
          )}

          {/* Note */}
          <div className="mt-10 p-6 bg-[#003F91]/5 border border-[#003F91]/10 rounded-2xl text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-[#003F91]">Nota:</strong> Precios más IVA 16% · Los precios pueden cambiar sin previo aviso · Solo se venden cajas completas
            </p>
          </div>
        </div>
      </section>

      {/* PRÓXIMAMENTE - GEL */}
      <section id="gel" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block py-1 px-4 rounded-full bg-[#FF2E63]/10 text-[#FF2E63] text-xs font-extrabold uppercase tracking-widest mb-4">
              Próximamente
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#003F91] mb-4">
              Colorante en <span className="text-[#FF2E63]">Gel</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Estamos trabajando en una nueva línea de colorantes en gel de alta concentración. Perfectos para betunes, fondants, chocolates y decoración profesional.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
            {GEL_COLORS.map((color, i) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative group"
              >
                <div
                  className="rounded-2xl aspect-square flex flex-col items-center justify-center shadow-lg relative overflow-hidden cursor-default"
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 text-[#003F91] text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest shadow">
                      Próx.
                    </span>
                  </div>
                  <FlaskConical size={36} color={color.textColor} className="opacity-80 mb-2" />
                  <span
                    className="text-sm font-bold text-center px-2 leading-tight"
                    style={{ color: color.textColor }}
                  >
                    {color.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/525551146856?text=Hola%20me%20interesa%20el%20colorante%20en%20gel%20de%20Tropicolors"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#003F91] text-white rounded-full font-bold hover:bg-[#002d6e] transition-all hover:scale-105 shadow-xl"
            >
              <MessageCircle size={20} />
              Avisar cuando esté disponible
            </a>
            <span className="text-sm text-muted-foreground">Regístrate y te avisamos al lanzamiento</span>
          </div>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <span className="inline-block py-1 px-4 rounded-full bg-[#003F91]/10 text-[#003F91] text-xs font-bold uppercase tracking-widest mb-6">Sobre Nosotros</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#003F91] mb-6">
                Expertos en <span className="text-[#00A8B5]">Color</span> desde hace años
              </h2>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                En <strong>TropicColors</strong> nos especializamos en colorantes artificiales para la industria alimentaria en México. Sabemos que el color es el primer atractivo de cualquier alimento, y garantizamos tonos brillantes, vivos y consistentes.
              </p>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Nuestros productos son 100% solubles en agua, de grado alimenticio y cumplen con todos los estándares de seguridad para su uso en panadería, confitería, bebidas, lácteos y más.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Grado Alimenticio Certificado",
                  "Alta Concentración de Pigmento",
                  "Envíos a todo México",
                  "Atención a Mayoristas",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-border/50 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#00A8B5]/10 flex items-center justify-center text-[#00A8B5] flex-shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
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
              <div className="absolute -bottom-6 -left-6 bg-[#FFCD00] rounded-2xl px-6 py-4 shadow-xl">
                <p className="text-[#003F91] font-extrabold text-2xl leading-none">+20</p>
                <p className="text-[#003F91] text-xs font-semibold">Colores disponibles</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-24 bg-[#003F91] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">¿Por qué elegir TropicColors?</h2>
            <p className="text-white/70 text-base max-w-2xl mx-auto">Calidad, rendimiento y seguridad en cada gota de color.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Droplet, title: "Alta Concentración", desc: "Rinde más, logrando colores intensos con poca cantidad de producto." },
              { icon: Sparkles, title: "100% Soluble", desc: "Se integra perfectamente en mezclas base agua, sin dejar grumos." },
              { icon: ShieldCheck, title: "Grado Alimenticio", desc: "Totalmente seguro e inocuo para el consumo humano." },
              { icon: Clock, title: "Larga Vida Útil", desc: "Excelente estabilidad y conservación en anaquel." },
              { icon: Award, title: "Colores Brillantes", desc: "Tonos vivos y consistentes para resultados profesionales." },
              { icon: Star, title: "Fácil de Usar", desc: "Se disuelve rápidamente en agua caliente o fría." },
              { icon: CheckCircle, title: "Precios de Mayoreo", desc: "Tarifas especiales por volumen. Cajas completas con mejor precio." },
              { icon: MessageCircle, title: "Asesoría Personalizada", desc: "Te ayudamos a encontrar el color exacto que necesitas." },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFCD00] text-[#003F91] flex items-center justify-center mb-5">
                  <b.icon size={24} />
                </div>
                <h3 className="text-base font-bold mb-2">{b.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP BANNER */}
      <section className="py-20 bg-[#FFCD00] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#003F91] mb-5">¿Necesitas una cotización?</h2>
          <p className="text-lg text-[#003F91]/80 mb-10 max-w-2xl mx-auto">
            Contáctanos directamente para precios de mayoreo, envíos a todo México y asesoría especializada en colores.
          </p>
          <a
            href="https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20colorantes%20Tropicolors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#003F91] text-white rounded-full font-extrabold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
          >
            <MessageCircle size={26} />
            Escríbenos por WhatsApp
          </a>
          <p className="mt-6 text-sm text-[#003F91]/60">
            +52 55 5114 6856 · Lada sin costo: 01 800 8 36 74 68
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block py-1 px-4 rounded-full bg-[#003F91]/10 text-[#003F91] text-xs font-bold uppercase tracking-widest mb-5">Contacto</span>
              <h2 className="text-4xl font-extrabold text-[#003F91] mb-5">Hablemos de tu proyecto</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Déjanos tus datos y te responderemos en breve con la información que necesitas.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MessageCircle, label: "WhatsApp / Teléfono", value: "+52 55 5114 6856" },
                  { icon: MessageCircle, label: "Lada sin costo", value: "01 800 8 36 74 68" },
                  { icon: Award, label: "Correo", value: "m_tropicolors@hotmail.com" },
                  { icon: CheckCircle, label: "Dirección", value: "Abedules Mz.1 Lt.36, Ejército del Trabajo II, Ecatepec, Edo. de México C.P. 55238" },
                ].map((c, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#003F91]/10 flex items-center justify-center text-[#003F91] flex-shrink-0 mt-0.5">
                      <c.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.label}</p>
                      <p className="text-sm font-medium text-foreground">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {contactSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#003F91]/5 border border-[#003F91]/20 rounded-3xl p-12 text-center"
                >
                  <div className="w-16 h-16 bg-[#00A8B5]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-[#00A8B5]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#003F91] mb-2">¡Mensaje recibido!</h3>
                  <p className="text-muted-foreground text-sm mb-6">Nos pondremos en contacto contigo muy pronto.</p>
                  <button onClick={() => setContactSent(false)} className="text-sm text-[#003F91] font-semibold underline underline-offset-4">
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onContactSubmit)} className="bg-slate-50 p-8 rounded-3xl border border-border/50 space-y-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Nombre</label>
                      <input
                        {...register("name")}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm bg-white"
                        placeholder="Tu nombre"
                      />
                      {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Correo</label>
                      <input
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm bg-white"
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Teléfono (opcional)</label>
                    <input
                      {...register("phone")}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm bg-white"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Mensaje o Producto de Interés</label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm bg-white resize-none"
                      placeholder="Me interesa cotizar Azul 125 en caja grande..."
                    />
                    {errors.message && <p className="text-destructive text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#003F91] text-white rounded-xl font-bold text-sm hover:bg-[#002d6e] transition-colors shadow-lg disabled:opacity-60"
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

function ProductCard({
  product,
  prices,
  concentration,
  addToCart,
  index,
}: {
  product: Product;
  prices: [number, number, number, number, number] | undefined;
  concentration: Concentration;
  addToCart: (item: any) => void;
  index: number;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { toast } = useToast();

  const availablePresentations = prices
    ? PRESENTATIONS.map((label, i) => ({ label, price: prices[i] })).filter(p => p.price > 0)
    : [];

  const selected = availablePresentations[selectedIdx] ?? availablePresentations[0];
  const notAvailable = !prices || availablePresentations.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
    >
      {/* Color header */}
      <div
        className="h-36 relative flex items-end justify-between p-4 overflow-hidden"
        style={{ backgroundColor: product.hex }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20" />
        {product.industrial && (
          <span className="relative z-10 text-[9px] font-extrabold uppercase tracking-widest bg-white/90 text-[#003F91] px-2 py-0.5 rounded-full">
            Industrial
          </span>
        )}
        {product.note && (
          <span className="relative z-10 text-[9px] font-extrabold uppercase tracking-widest bg-white/90 text-[#003F91] px-2 py-0.5 rounded-full">
            {product.note}
          </span>
        )}
        {!product.industrial && !product.note && <span />}
        <span
          className="relative z-10 text-[10px] font-bold px-2 py-1 rounded-lg bg-black/20 backdrop-blur-sm"
          style={{ color: product.textColor === "#fff" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)" }}
        >
          C-{concentration}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-foreground leading-tight">{product.name}</h3>

        {notAvailable ? (
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-xs text-muted-foreground text-center">
              No disponible en concentración {concentration}.
              <br />Consultar concentración alternativa.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Presentación</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-50 border border-border rounded-xl px-3 py-2.5 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#003F91]/20"
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(Number(e.target.value))}
                >
                  {availablePresentations.map((p, i) => (
                    <option key={i} value={i}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end justify-between pt-2 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground font-medium">Precio + IVA</span>
              <div className="text-right">
                <span className="text-xl font-extrabold text-[#003F91]">${selected?.price.toLocaleString("es-MX")}</span>
                <span className="text-[10px] text-muted-foreground ml-1">MXN</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    productName: `${product.name} C-${concentration}`,
                    size: selected?.label,
                    price: selected?.price,
                    quantity: 1,
                    hexCode: product.hex,
                  });
                  toast({ title: "¡Agregado!", description: `${product.name} añadido al carrito.` });
                }}
                className="flex-1 bg-[#003F91] text-white font-bold py-2.5 rounded-xl hover:bg-[#002d6e] flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <ShoppingCart size={14} />
                Agregar
              </button>
              <a
                href={`https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20Concentración%20${concentration}%20en%20${encodeURIComponent(selected?.label ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 flex-shrink-0 bg-[#FFCD00] text-[#003F91] flex items-center justify-center rounded-xl hover:bg-yellow-300 transition-colors"
                title="Cotizar por WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
