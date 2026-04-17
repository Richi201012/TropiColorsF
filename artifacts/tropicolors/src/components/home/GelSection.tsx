import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, MessageCircle } from "lucide-react";
import { GEL_COLORS, GEL_PRODUCTS } from "./data";
import ProductCard from "./ProductCard";
import type { AddFlyingItemFn, AddToCartFn } from "./types";

type GelSectionProps = {
  gelVisible: boolean;
  addToCart: AddToCartFn;
  addFlyingItem: AddFlyingItemFn;
};

export default function GelSection({
  gelVisible,
  addToCart,
  addFlyingItem,
}: GelSectionProps) {
  return (
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
                {GEL_PRODUCTS.map((product, index) => (
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
                      delay: index * 0.05,
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
              {GEL_COLORS.map((color, index) => (
                <motion.div
                  key={color.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
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
  );
}
