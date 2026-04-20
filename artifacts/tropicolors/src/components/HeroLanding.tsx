import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroLandingProps {
  onComplete?: () => void;
}

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const heroImageSrc = `${import.meta.env.BASE_URL}${isMobile ? "hero-banner.png" : "hero-landing.png"}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.24,
  });

  const imageY = useTransform(
    smoothProgress,
    [0, 1],
    [0, isMobile ? 14 : 36],
  );
  const contentY = useTransform(
    smoothProgress,
    [0, 1],
    [0, isMobile ? -18 : -42],
  );
  const contentOpacity = useTransform(
    smoothProgress,
    [0, 0.78, 1],
    [1, 0.94, 0.8],
  );
  const overlayOpacity = useTransform(
    smoothProgress,
    [0, 1],
    [0.88, isMobile ? 0.96 : 0.94],
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      onComplete?.();
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [onComplete]);

  const handleViewProducts = useCallback(() => {
    const productsSection = document.getElementById("productos");

    if (!productsSection) {
      return;
    }

    const top = productsSection.getBoundingClientRect().top + window.scrollY - 88;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Presentacion TropiColors"
      className="relative overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <motion.img
        src={heroImageSrc}
        alt="TropiColors - Colorantes Alimentarios"
        fetchPriority="high"
        decoding="async"
        className="block h-auto w-full"
        style={prefersReducedMotion ? undefined : { y: imageY }}
      />

      <motion.div
        className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_42%,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.34)_42%,rgba(2,6,23,0.72)_100%),linear-gradient(180deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.42)_34%,rgba(2,6,23,0.74)_100%)]"
        style={prefersReducedMotion ? { opacity: 0.92 } : { opacity: overlayOpacity }}
      />

      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center px-5 py-20 text-center sm:px-8 lg:px-10"
        style={
          prefersReducedMotion
            ? undefined
            : {
                y: contentY,
                opacity: contentOpacity,
              }
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto flex max-w-4xl flex-col items-center"
        >
          <p className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/76 shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:text-[11px]">
            Colorantes alimentarios premium
          </p>

          <h1
            className="mt-6 text-5xl font-black tracking-[-0.065em] text-white drop-shadow-[0_10px_36px_rgba(0,0,0,0.45)] sm:text-6xl md:mt-7 md:text-7xl lg:text-[6.1rem]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            TropiColors
          </h1>

          <p className="mt-5 max-w-3xl text-lg font-medium leading-[1.35] text-white/92 drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)] sm:text-xl md:mt-6 md:text-[1.7rem]">
            Colorantes alimentarios premium que transforman cada creacion
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base md:mt-5 md:text-lg">
            Color que se nota. Calidad que se siente.
          </p>

          <motion.button
            type="button"
            onClick={handleViewProducts}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.28)] transition-colors hover:bg-slate-100 sm:mt-10 sm:px-7 sm:py-3.5 sm:text-base"
          >
            <span>Ver productos</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
