import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ShoppingCart, MessageCircle, Droplet, CheckCircle, ShieldCheck, Sparkles, Clock, PenTool } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  message: z.string().min(10, "Mensaje requerido"),
});
type ContactForm = z.infer<typeof contactSchema>;

const PRODUCTS = [
  { id: 'p1', name: 'Colorante Azul', hex: '#003F91' },
  { id: 'p2', name: 'Colorante Rosa / Magenta', hex: '#FF2E63' },
  { id: 'p3', name: 'Colorante Verde', hex: '#00A8B5' },
  { id: 'p4', name: 'Colorante Amarillo', hex: '#FFCD00' },
  { id: 'p5', name: 'Colorante Naranja', hex: '#FF8C00' },
  { id: 'p6', name: 'Colorante Rojo', hex: '#E60000' },
  { id: 'p7', name: 'Colorante Negro', hex: '#111111' },
  { id: 'p8', name: 'Colorante Morado', hex: '#800080' },
];

const SIZES = [
  { label: '25g', price: 35 },
  { label: '100g', price: 85 },
  { label: '500g', price: 250 },
  { label: '1kg', price: 450 },
  { label: '5kg (Cubeta)', price: 1800 },
];

export default function Home() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { mutate: submitContact, isPending: isSubmittingContact } = useSubmitContact();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onContactSubmit = (data: ContactForm) => {
    submitContact({ data }, {
      onSuccess: () => {
        toast({ title: "¡Mensaje enviado!", description: "Nos pondremos en contacto pronto." });
        reset();
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo enviar el mensaje.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen pt-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}hero-banner.png`} 
            alt="Colorantes Tropicolors" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-accent text-primary text-sm font-bold tracking-wider mb-6">CALIDAD PREMIUM</span>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6">
              Dale vida y color a tus <span className="text-accent">creaciones</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
              Colorantes artificiales de grado alimenticio. Alta concentración, colores vibrantes y la mejor calidad para la industria de alimentos en México.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#productos" 
                className="px-8 py-4 rounded-full bg-accent text-primary font-bold text-center hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-accent/20"
              >
                Ver Productos
              </a>
              <a 
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white font-bold text-center hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Cotizar por WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="productos" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Nuestro Catálogo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Selecciona el color y la presentación que necesitas. Añade al carrito o contáctanos para cotizaciones especiales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((product, idx) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="nosotros" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">Expertos en <span className="text-secondary">Color</span></h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                En <strong>TropicColors</strong> nos dedicamos a proporcionar los mejores colorantes artificiales para la industria alimentaria. Entendemos que el color es el primer atractivo de cualquier alimento, por eso garantizamos tonos brillantes, vivos y consistentes.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Nuestros productos son 100% solubles en agua, de grado alimenticio y cumplen con todos los estándares de seguridad para su uso en panadería, confitería, bebidas y más.
              </p>
              <ul className="space-y-4">
                {[
                  "Grado Alimenticio Certificado",
                  "Alta Concentración de Pigmento",
                  "Atención Personalizada a Mayoristas"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:h-[600px]">
                <img 
                  src={`${import.meta.env.BASE_URL}images/color-splash.png`} 
                  alt="Food Coloring Splash" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative blob */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-destructive rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float" style={{ animationDelay: "2s" }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="beneficios" className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">¿Por qué elegir TropicColors?</h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Calidad, rendimiento y seguridad en cada gota de color.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Droplet, title: "Alta Concentración", desc: "Rinde más, logrando colores intensos con poca cantidad." },
              { icon: Sparkles, title: "100% Soluble", desc: "Se integra perfectamente en mezclas base agua sin grumos." },
              { icon: ShieldCheck, title: "Grado Alimenticio", desc: "Totalmente seguro e inocuo para el consumo humano." },
              { icon: Clock, title: "Larga Vida Útil", desc: "Excelente estabilidad y conservación en anaquel." }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center mb-6">
                  <benefit.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-white/80 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP BANNER */}
      <section className="py-20 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80')] bg-cover bg-center"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">¿Necesitas precios de mayoreo?</h2>
          <p className="text-xl text-primary/80 mb-10">Contáctanos directamente para cotizaciones de volumen, envíos a todo México y asesoría personalizada.</p>
          <a 
            href="https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20volumen%20de%20colorantes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-bold text-xl hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
          >
            <MessageCircle size={28} />
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contacto" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-primary mb-4">Contáctanos</h2>
            <p className="text-lg text-muted-foreground">Déjanos tus datos y nos comunicaremos contigo a la brevedad.</p>
          </div>

          <form onSubmit={handleSubmit(onContactSubmit)} className="bg-slate-50 p-8 rounded-3xl shadow-lg border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre completo</label>
                <input 
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                  placeholder="Juan Pérez"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Correo electrónico</label>
                <input 
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                  placeholder="juan@ejemplo.com"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Mensaje o Cotización</label>
              <textarea 
                {...register("message")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white resize-none"
                placeholder="Me interesa cotizar..."
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button 
              type="submit"
              disabled={isSubmittingContact}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
            >
              {isSubmittingContact ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}

// Sub-component for product card
function ProductCard({ product, addToCart, index }: { product: typeof PRODUCTS[0], addToCart: any, index: number }) {
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Default 100g

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg border border-border/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
    >
      {/* Product Image / Color Area */}
      <div 
        className="h-48 w-full relative flex items-center justify-center p-6 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${product.hex} 0%, ${product.hex}dd 100%)` }}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
          <Droplet size={40} className="text-white" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-foreground mb-4">{product.name}</h3>
        
        <div className="mt-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Presentación</label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-slate-50 border border-border rounded-xl px-4 py-3 pr-10 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedSize.label}
                onChange={(e) => setSelectedSize(SIZES.find(s => s.label === e.target.value) || SIZES[1])}
              >
                {SIZES.map(size => (
                  <option key={size.label} value={size.label}>{size.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/50">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between py-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground font-medium">Precio</span>
            <span className="text-2xl font-bold text-primary">${selectedSize.price} <span className="text-sm font-normal text-muted-foreground">MXN</span></span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => addToCart({
                productId: product.id,
                productName: product.name,
                size: selectedSize.label,
                price: selectedSize.price,
                quantity: 1,
                hexCode: product.hex
              })}
              className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart size={18} />
              Agregar
            </button>
            <a 
              href={`https://wa.me/525551146856?text=Hola%20quiero%20comprar%20${product.name}%20en%20presentación%20de%20${selectedSize.label}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 flex-shrink-0 bg-accent text-primary flex items-center justify-center rounded-xl hover:bg-yellow-400 transition-colors"
              title="Cotizar por WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
