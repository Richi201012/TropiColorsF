import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import desktopHeroImage from "@assets/fondochido.png";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroLandingProps {
  onComplete?: () => void;
}

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const heroImageSrc = isMobile
    ? `${import.meta.env.BASE_URL}hero-banner.png`
    : desktopHeroImage;
  const heroAspectRatio = isMobile ? "853 / 1280" : "1536 / 1024";
  const shouldRenderEditorialCopy = isMobile;

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
    [isMobile ? 0.88 : 0.62, isMobile ? 0.96 : 0.76],
  );
  const contentStagger = prefersReducedMotion ? 0.04 : 0.12;

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
      style={{
        scrollSnapAlign: "start",
        aspectRatio: heroAspectRatio,
      }}
    >
      <motion.img
        src={heroImageSrc}
        alt="TropiColors - Colorantes Alimentarios"
        fetchPriority="high"
        decoding="async"
        className="block h-full w-full object-cover"
        style={prefersReducedMotion ? undefined : { y: imageY }}
      />

      <motion.div
        className={
          isMobile
            ? "absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_42%,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.34)_42%,rgba(2,6,23,0.72)_100%),linear-gradient(180deg,rgba(2,6,23,0.72)_0%,rgba(2,6,23,0.42)_34%,rgba(2,6,23,0.74)_100%)]"
            : "absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_30%,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.18)_40%,rgba(2,6,23,0.52)_100%),linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.08)_30%,rgba(2,6,23,0.6)_100%)]"
        }
        style={prefersReducedMotion ? { opacity: 0.92 } : { opacity: overlayOpacity }}
      />

      <motion.div
        className={`absolute inset-0 z-10 flex px-5 py-20 text-center sm:px-8 lg:px-10 ${
          isMobile ? "items-center justify-center" : "items-end justify-center pb-10"
        }`}
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
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: contentStagger,
                delayChildren: prefersReducedMotion ? 0.05 : 0.18,
              },
            },
          }}
          className="mx-auto flex max-w-4xl flex-col items-center"
        >
          {shouldRenderEditorialCopy ? (
            <>
              <motion.p
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                    scale: 0.94,
                    filter: "blur(10px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: {
                      duration: prefersReducedMotion ? 0.35 : 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/76 shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:text-[11px]"
              >
                Colorantes alimentarios premium
              </motion.p>

              <motion.h1
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 56,
                    scale: 0.88,
                    filter: "blur(16px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: prefersReducedMotion
                      ? {
                          duration: 0.4,
                          ease: "easeOut",
                        }
                      : {
                          type: "spring",
                          stiffness: 150,
                          damping: 16,
                          mass: 0.9,
                        },
                  },
                }}
                className="mt-6 text-5xl font-black tracking-[-0.065em] text-white drop-shadow-[0_10px_36px_rgba(0,0,0,0.45)] sm:text-6xl md:mt-7 md:text-7xl lg:text-[6.1rem]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                TropiColors
              </motion.h1>

              <motion.p
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 40,
                    filter: "blur(12px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: prefersReducedMotion ? 0.35 : 0.72,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className="mt-5 max-w-3xl text-lg font-medium leading-[1.35] text-white/92 drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)] sm:text-xl md:mt-6 md:text-[1.7rem]"
              >
                Colorantes alimentarios premium que transforman cada creacion
              </motion.p>

              <motion.p
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                    filter: "blur(10px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: prefersReducedMotion ? 0.3 : 0.68,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base md:mt-5 md:text-lg"
              >
                Color que se nota. Calidad que se siente.
              </motion.p>
            </>
          ) : (
            <h1 className="sr-only">TropiColors</h1>
          )}

          {shouldRenderEditorialCopy ? (
            <motion.button
              type="button"
              onClick={handleViewProducts}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 36,
                  scale: 0.92,
                  filter: "blur(10px)",
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: prefersReducedMotion
                    ? {
                        duration: 0.35,
                        ease: "easeOut",
                      }
                    : {
                        type: "spring",
                        stiffness: 210,
                        damping: 15,
                        mass: 0.8,
                      },
                },
              }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.28)] transition-colors hover:bg-slate-100 sm:mt-10 sm:px-7 sm:py-3.5 sm:text-base"
            >
              <span>Ver productos</span>
            </motion.button>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
