import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartAddNotice() {
  const {
    recentlyAddedItem,
    recentlyAddedToken,
    setIsCartOpen,
    cartCount,
  } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!recentlyAddedItem || recentlyAddedToken === 0) return;

    setIsVisible(true);

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [recentlyAddedItem, recentlyAddedToken]);

  if (!recentlyAddedItem) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, x: -24, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -18, y: 18 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed bottom-5 left-5 z-[65] w-[calc(100vw-2.5rem)] max-w-sm"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.96)_0%,rgba(245,250,255,0.94)_48%,rgba(255,248,231,0.96)_100%)] p-4 shadow-[0_22px_55px_rgba(0,63,145,0.18)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-[#00A8B5]/18 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#FFCD00]/22 blur-3xl" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#003F91_0%,#00A8B5_100%)] text-white shadow-[0_14px_30px_rgba(0,63,145,0.28)]">
                <CheckCircle2 size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Agregado
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {cartCount} en carrito
                  </span>
                </div>

                <p className="truncate text-sm font-extrabold text-[#003F91]">
                  {recentlyAddedItem.productName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Presentación {recentlyAddedItem.size} · Cantidad{" "}
                  {recentlyAddedItem.quantity}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Continuar comprando
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisible(false);
                      setIsCartOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#003F91_0%,#0059c7_45%,#00A8B5_100%)] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_28px_rgba(0,63,145,0.22)] transition hover:scale-[1.02]"
                  >
                    <ShoppingBag size={14} />
                    Ir al carrito
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default CartAddNotice;
