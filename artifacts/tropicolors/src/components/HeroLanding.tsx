import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import desktopHeroImage from "@assets/fondochido.png";

interface HeroLandingProps {
  onComplete?: () => void;
}

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
    [0, 18],
  );
  const imageMotionStyle = prefersReducedMotion ? undefined : { y: imageY };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      onComplete?.();
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [onComplete]);

  return (
    <section
      ref={containerRef}
      aria-label="Presentacion TropiColors"
      className="relative overflow-hidden bg-[#040816] lg:flex lg:min-h-screen lg:justify-center"
      style={{ scrollSnapAlign: "start" }}
    >
      <motion.img
        src={desktopHeroImage}
        alt="TropiColors - Colorantes Alimentarios"
        fetchPriority="high"
        decoding="async"
        className="block h-auto w-full object-contain lg:w-auto lg:max-h-screen lg:max-w-full"
        style={imageMotionStyle}
      />
      <h1 className="sr-only">TropiColors</h1>
    </section>
  );
}
