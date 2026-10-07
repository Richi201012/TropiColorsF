import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { calculatePiecePrice, calculateWholesalePrice } from "@/lib/commerce";
import { MOTION_EASE_OUT } from "@/lib/motion";
import type { Concentration, Product } from "./types";
import {
  getPresentationOptions,
  getProductBadgeNote,
  getProductDescription,
  getProductHighlights,
} from "./utils";

type CompactProductCardProps = {
  product: Product;
  onConfigure: (product: Product) => void;
};

const CONCENTRATIONS: Concentration[] = ["125", "250"];

const CompactProductCard = memo(function CompactProductCard({
  product,
  onConfigure,
}: CompactProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const availableConcentrations = useMemo(
    () =>
      CONCENTRATIONS.filter(
        (concentration) =>
          getPresentationOptions(product, concentration).length > 0,
      ),
    [product],
  );
  const priceSummary = useMemo(() => {
    const wholesalePrices = Object.values(
      product.specialWholesaleBoxPrices ?? {},
    ).flatMap((prices) => Object.values(prices ?? {}));

    if (product.onlyWholesale && wholesalePrices.length > 0) {
      return {
        amount: calculateWholesalePrice(Math.min(...wholesalePrices)),
        label: "por caja",
      };
    }

    const presentationPrices = availableConcentrations.flatMap(
      (concentration) =>
        getPresentationOptions(product, concentration).map(
          (presentation) => presentation.price,
        ),
    );

    return {
      amount:
        presentationPrices.length > 0
          ? calculatePiecePrice(Math.min(...presentationPrices))
          : 0,
      label: "precio inicial",
    };
  }, [availableConcentrations, product]);
  const productNoteLabel = getProductBadgeNote(product);
  const highlights = getProductHighlights(product).slice(0, 2);

  return (
    <motion.article
      layout
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: MOTION_EASE_OUT }}
      className="group relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-white/90 bg-white shadow-[0_16px_46px_rgba(15,23,42,0.09)] transition-[border-color,box-shadow] hover:border-[#003F91]/15 hover:shadow-[0_22px_54px_rgba(15,23,42,0.14)]"
    >
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
        }}
      />

      <div
        className="pointer-events-none absolute -right-12 top-10 h-36 w-36 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: product.hex }}
      />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
            {product.category}
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {availableConcentrations.map((concentration) => (
              <span
                key={concentration}
                className="rounded-full bg-[#003F91]/7 px-2.5 py-1 text-[9px] font-extrabold text-[#003F91]"
              >
                C-{concentration}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div
            className="h-20 w-20 shrink-0 rounded-full border-4 border-white shadow-[0_14px_28px_rgba(15,23,42,0.15)]"
            style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.42), transparent 28%), linear-gradient(135deg, ${product.hex}, ${product.hex2 ?? product.hex})`,
              boxShadow: `0 14px 28px ${product.hex}35`,
            }}
          />
          <div className="min-w-0">
            <h3 className="text-[1.45rem] font-black leading-none tracking-tight text-[#0b2d6b]">
              {product.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {getProductDescription(product)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-600"
            >
              <CheckCircle size={12} className="text-[#00A8B5]" />
              {highlight}
            </span>
          ))}
          {product.industrial || productNoteLabel ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700">
              {product.industrial ? "Uso industrial" : productNoteLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              Desde
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums text-[#0b4a92]">
              ${priceSummary.amount.toLocaleString("es-MX")}
              <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                MXN
              </span>
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">
              {priceSummary.label}
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => onConfigure(product)}
            whileTap={{ scale: 0.97 }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#003F91] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_12px_24px_rgba(0,63,145,0.22)] transition-[background-color,box-shadow] hover:bg-[#002f6c] hover:shadow-[0_16px_30px_rgba(0,63,145,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003F91]/35 focus-visible:ring-offset-2"
            aria-label={`Comprar ${product.name}`}
          >
            Comprar
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

export default CompactProductCard;
