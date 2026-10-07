import { useEffect, useRef, useState, type PointerEventHandler } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { MOTION_EASE_OUT } from "@/lib/motion";

interface HeroLandingProps {
  onComplete?: () => void;
}

type ColorFamily = {
  id: string;
  name: string;
  statement: string;
  hex: string;
  soft: string;
};

const COLOR_FAMILIES: ColorFamily[] = [
  {
    id: "amarillo",
    name: "Amarillo",
    statement: "Luminosidad limpia",
    hex: "#FFCD00",
    soft: "rgba(255,205,0,0.28)",
  },
  {
    id: "rojo",
    name: "Rojo",
    statement: "Impacto visual",
    hex: "#FF2E63",
    soft: "rgba(255,46,99,0.26)",
  },
  {
    id: "azul",
    name: "Azul",
    statement: "Profundidad intensa",
    hex: "#13A8FF",
    soft: "rgba(19,168,255,0.28)",
  },
  {
    id: "verde",
    name: "Verde",
    statement: "Frescura estable",
    hex: "#8BCF35",
    soft: "rgba(139,207,53,0.25)",
  },
];

const TRUST_POINTS = ["Grado alimenticio", "+20 colores", "Menudeo y mayoreo"];

const COLOR_MOTES = [
  { left: "7%", top: "19%", size: 8, delay: 0.1 },
  { left: "17%", top: "8%", size: 5, delay: 0.6 },
  { left: "85%", top: "16%", size: 7, delay: 0.35 },
  { left: "91%", top: "38%", size: 5, delay: 0.8 },
  { left: "9%", top: "68%", size: 6, delay: 1 },
  { left: "81%", top: "76%", size: 9, delay: 0.2 },
];

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [activeFamily, setActiveFamily] = useState(COLOR_FAMILIES[0]);
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.24,
  });
  const smoothPointerX = useSpring(pointerX, {
    stiffness: 180,
    damping: 24,
    mass: 0.35,
  });
  const smoothPointerY = useSpring(pointerY, {
    stiffness: 180,
    damping: 24,
    mass: 0.35,
  });

  const contentY = useTransform(smoothProgress, [0, 1], [0, 24]);
  const visualY = useTransform(smoothProgress, [0, 1], [0, 52]);
  const rotateX = useTransform(smoothPointerY, [-0.5, 0.5], [2.4, -2.4]);
  const rotateY = useTransform(smoothPointerX, [-0.5, 0.5], [-3.2, 3.2]);
  const productX = useTransform(smoothPointerX, [-0.5, 0.5], [-7, 7]);
  const productY = useTransform(smoothPointerY, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      onComplete?.();
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [onComplete]);

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (prefersReducedMotion || event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const scrollToCatalog = () => {
    document.getElementById("productos")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      ref={containerRef}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#030817] px-4 pb-12 pt-24 text-white sm:px-8 sm:pb-16 sm:pt-28 lg:px-10 lg:py-20"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(0,63,145,0.34),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(0,168,181,0.16),transparent_30%),linear-gradient(135deg,#020612_0%,#06112b_54%,#020611_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#13A8FF,#FF2E63,#FFCD00,#8BCF35,transparent)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeFamily.id}
          aria-hidden="true"
          className="pointer-events-none absolute -right-[12%] top-[8%] h-[68vw] max-h-[820px] w-[68vw] max-w-[820px] rounded-full blur-[110px]"
          style={{ backgroundColor: activeFamily.soft }}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.78 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65 }}
        />
      </AnimatePresence>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 xl:gap-14">
        <motion.div
          className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left"
          style={prefersReducedMotion ? undefined : { y: contentY }}
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE_OUT }}
            className="flex flex-col items-center gap-4 lg:items-start"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
              alt="TropiColors"
              fetchPriority="high"
              decoding="async"
              className="h-20 w-20 object-contain drop-shadow-[0_12px_30px_rgba(19,168,255,0.24)] sm:h-24 sm:w-24"
            />
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/14 bg-white/[0.07] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-100 backdrop-blur-md sm:text-xs">
              <Sparkles size={14} className="text-[#FFCD00]" />
              Colorantes en polvo y gel · México
            </p>
          </motion.div>

          <motion.h1
            id="hero-title"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: MOTION_EASE_OUT }}
            className="mt-6 text-[clamp(3.1rem,7.2vw,5.7rem)] font-black leading-[0.91] tracking-[-0.055em] text-white"
          >
            Color que
            <span className="mt-1 block bg-[linear-gradient(100deg,#FFCD00_5%,#FF7A00_28%,#FF2E63_53%,#13A8FF_80%,#8BCF35_100%)] bg-clip-text pb-1 text-transparent">
              transforma.
            </span>
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: MOTION_EASE_OUT }}
            className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg lg:mx-0"
          >
            Colorantes de alta intensidad para alimentos, limpieza y procesos
            industriales. Consistencia profesional desde la primera mezcla.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.24, ease: MOTION_EASE_OUT }}
            className="mt-7 flex flex-col justify-center gap-3 min-[420px]:flex-row lg:justify-start"
          >
            <motion.button
              type="button"
              onClick={scrollToCatalog}
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-[#003F91] shadow-[0_16px_40px_rgba(255,255,255,0.13)] transition-[transform,box-shadow,background-color] hover:bg-cyan-50 hover:shadow-[0_20px_48px_rgba(19,168,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#030817]"
            >
              Explorar colores
              <ArrowDownRight size={18} />
            </motion.button>
            <motion.a
              href="https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors"
              target="_blank"
              rel="noreferrer"
              whileTap={{ scale: 0.98 }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/16 bg-white/[0.07] px-6 py-3 text-sm font-extrabold text-white backdrop-blur-md transition-[background-color,border-color] hover:border-white/28 hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030817]"
            >
              <MessageCircle size={18} />
              Cotizar por WhatsApp
            </motion.a>
          </motion.div>

          <motion.ul
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: MOTION_EASE_OUT }}
            className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-slate-300 lg:justify-start"
          >
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#00A8B5]" />
                {point}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={
            prefersReducedMotion ? false : { opacity: 0, x: 28, scale: 0.98 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.78, delay: 0.12, ease: MOTION_EASE_OUT }}
          className="relative mx-auto w-full max-w-[680px]"
          style={prefersReducedMotion ? undefined : { y: visualY }}
        >
          <motion.div
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
            className="relative aspect-[1.07/1] overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.025))] shadow-[0_36px_100px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:rounded-[42px]"
            style={
              prefersReducedMotion
                ? undefined
                : { rotateX, rotateY, transformPerspective: 1200 }
            }
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_56%,rgba(255,255,255,0.14),transparent_45%)]" />
            <div className="pointer-events-none absolute left-[8%] top-[10%] h-[76%] w-[84%] rounded-full bg-[conic-gradient(from_215deg,#13A8FF,#FF2E63,#FF7A00,#FFCD00,#8BCF35,#13A8FF)] opacity-35 blur-[58px]" />

            <AnimatePresence initial={false}>
              <motion.div
                key={`visual-${activeFamily.id}`}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[48%] h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[64px]"
                style={{ backgroundColor: activeFamily.soft }}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.72 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.52 }}
              />
            </AnimatePresence>

            {COLOR_MOTES.map((mote, index) => (
              <motion.span
                key={`${mote.left}-${mote.top}`}
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full shadow-[0_0_20px_currentColor]"
                style={{
                  left: mote.left,
                  top: mote.top,
                  width: mote.size,
                  height: mote.size,
                  color: COLOR_FAMILIES[index % COLOR_FAMILIES.length].hex,
                  backgroundColor:
                    COLOR_FAMILIES[index % COLOR_FAMILIES.length].hex,
                }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [-4, 7, -4], opacity: [0.35, 0.85, 0.35] }
                }
                transition={{
                  duration: 3.8 + index * 0.35,
                  delay: mote.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            <motion.img
              src={`${import.meta.env.BASE_URL}images/hero-products-v2.png`}
              alt="Presentaciones de colorantes TropiColors en polvo"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-x-[-5%] bottom-[8%] z-10 h-auto w-[110%] max-w-none object-contain drop-shadow-[0_28px_34px_rgba(0,0,0,0.42)]"
              style={
                prefersReducedMotion ? undefined : { x: productX, y: productY }
              }
            />

            <motion.div
              className="absolute left-4 top-4 z-20 rounded-2xl border border-white/16 bg-[#061027]/72 px-3.5 py-2.5 text-left shadow-xl backdrop-blur-xl sm:left-6 sm:top-6 sm:px-4 sm:py-3"
              animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-cyan-200">
                Fórmula versátil
              </p>
              <p className="mt-1 text-xs font-black text-white sm:text-sm">
                Polvo y gel
              </p>
            </motion.div>

            <motion.div
              className="absolute right-3 top-20 z-20 rounded-2xl border border-white/16 bg-white/90 px-3.5 py-2.5 text-left text-[#0b2d6b] shadow-xl backdrop-blur-xl sm:right-5 sm:top-6 sm:px-4 sm:py-3"
              animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
              transition={{
                duration: 4.9,
                delay: 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#00A8B5]">
                Cobertura
              </p>
              <p className="mt-1 text-xs font-black sm:text-sm">
                En todo México
              </p>
            </motion.div>

            <div className="absolute inset-x-3 bottom-3 z-30 rounded-[24px] border border-white/14 bg-[#040a1c]/78 p-2.5 shadow-2xl backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:rounded-[28px] sm:p-3">
              <div className="flex items-center justify-between gap-3 px-1 pb-2">
                <div className="min-w-0 text-left">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Familia activa
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={activeFamily.statement}
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, y: 4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="mt-0.5 truncate text-xs font-bold text-white sm:text-sm"
                    >
                      {activeFamily.statement}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-500" />
              </div>

              <div
                role="group"
                aria-label="Explorar familias de color"
                className="grid grid-cols-4 gap-1.5 sm:gap-2"
              >
                {COLOR_FAMILIES.map((family) => {
                  const isActive = family.id === activeFamily.id;

                  return (
                    <button
                      key={family.id}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={`Mostrar familia ${family.name}`}
                      onClick={() => setActiveFamily(family)}
                      className={`group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-2 text-[9px] font-extrabold transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-[10px] ${
                        isActive
                          ? "border-white/24 bg-white text-[#071226] shadow-lg"
                          : "border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.11] hover:text-white"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{
                          color: family.hex,
                          backgroundColor: family.hex,
                        }}
                      />
                      <span className="hidden min-[390px]:inline">
                        {family.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={scrollToCatalog}
        aria-label="Ir al catálogo"
        className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:inline-flex"
        animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        Descubre el catálogo
        <ArrowDownRight size={14} />
      </motion.button>
    </section>
  );
}
