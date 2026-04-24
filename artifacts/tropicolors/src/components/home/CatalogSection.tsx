import { memo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductCard from "./ProductCard";
import { CATEGORY_COLORS, CATEGORY_ORDER, STORE_HIGHLIGHTS } from "./data";
import type { AddFlyingItemFn, AddToCartFn, Product } from "./types";

type CatalogSectionProps = {
  activeCategory: string;
  filteredProductsCount: number;
  searchQuery: string;
  visibleProducts: Product[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
  addToCart: AddToCartFn;
  addFlyingItem: AddFlyingItemFn;
};

const CatalogSection = memo(function CatalogSection({
  activeCategory,
  filteredProductsCount,
  searchQuery,
  visibleProducts,
  onCategoryChange,
  onSearchChange,
  addToCart,
  addFlyingItem,
}: CatalogSectionProps) {
  const activeCategoryConfig = CATEGORY_COLORS[activeCategory];
  const isMobile = useIsMobile();

  return (
    <section
      id="productos"
      className="page-snap-section relative overflow-hidden bg-gradient-to-b from-slate-50 to-white !pt-3 sm:!pt-16"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#003F91]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[6%] top-[-4%] h-[260px] w-[260px] rounded-full bg-[#003F91]/14 blur-[90px] sm:h-[340px] sm:w-[340px] lg:h-[420px] lg:w-[420px]" />
        <div className="absolute left-1/2 top-[0%] h-[220px] w-[320px] -translate-x-1/2 rounded-full bg-[#00A8B5]/12 blur-[82px] sm:h-[280px] sm:w-[420px] lg:h-[340px] lg:w-[560px]" />
        <div className="absolute right-[8%] top-[1%] h-[250px] w-[250px] rounded-full bg-[#FFCD00]/20 blur-[90px] sm:h-[320px] sm:w-[320px] lg:h-[390px] lg:w-[390px]" />
        <div className="absolute left-[18%] top-[18%] h-[180px] w-[300px] rotate-[-10deg] rounded-full bg-[linear-gradient(135deg,rgba(255,46,99,0.12),rgba(255,205,0,0.04))] blur-[76px] sm:w-[380px] lg:w-[460px]" />
        <div className="absolute right-[16%] top-[20%] h-[170px] w-[280px] rotate-[12deg] rounded-full bg-[linear-gradient(135deg,rgba(0,63,145,0.1),rgba(0,168,181,0.03))] blur-[72px] sm:w-[360px] lg:w-[430px]" />
        <div className="absolute inset-x-0 top-0 h-[48%] bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.72)_60%,rgba(255,255,255,0.98)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-4 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24">
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
              Venta Menudeo y Mayoreo
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFCD00]" />
              Envío por cuenta del cliente
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#12DE44]" />
              Pago solo por transferencia electronica
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
                  {CATEGORY_ORDER.map((category, index) => {
                    const isActive = activeCategory === category;
                    const colors = CATEGORY_COLORS[category];

                    return (
                      <motion.button
                        key={category}
                        onClick={() => onCategoryChange(category)}
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
                        {category}
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
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar color, familia o tono..."
                    className="w-full border-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    aria-label={`Buscar color dentro de ${activeCategoryConfig ? activeCategory : "todos los productos"}`}
                  />
                  <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 sm:inline-flex">
                    {filteredProductsCount} resultados
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
                    {filteredProductsCount} opciones visibles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredProductsCount > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              <Carousel
                opts={{ align: "start", loop: visibleProducts.length > 1 }}
                className="w-full"
              >
                <CarouselContent className="-ml-3">
                  {visibleProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="basis-[86%] pl-3 min-[480px]:basis-[72%]"
                    >
                      <div className="mx-auto h-full w-full max-w-[440px]">
                        <ProductCard
                          product={product}
                          addToCart={addToCart}
                          addFlyingItem={addFlyingItem}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {visibleProducts.length > 1 ? (
                <p className="text-center text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                  Desliza para ver más productos
                </p>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 min-[480px]:gap-7 md:grid-cols-2 md:gap-8 2xl:grid-cols-3">
              {visibleProducts.map((product) => (
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
          )
        ) : null}

        {filteredProductsCount === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No hay productos disponibles con esos filtros.
          </div>
        ) : null}
      </div>
    </section>
  );
});

export default CatalogSection;
