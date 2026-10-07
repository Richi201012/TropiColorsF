import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    mass: 0.25,
  });

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      data-scroll-progress="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 origin-left bg-[linear-gradient(90deg,#003F91_0%,#00A8B5_48%,#FFCD00_78%,#FF2E63_100%)] shadow-[0_1px_8px_rgba(0,168,181,0.35)]"
      style={{ scaleX }}
    />
  );
}
