import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroLandingProps {
  onComplete?: () => void;
}

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();
  const hasDismissed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(true);
    }, 1500);

    const handleScroll = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const progress = Math.min(scrollPosition / (windowHeight * 1.2), 1);
        setScrollProgress(progress);

        if (!hasDismissed.current && scrollPosition > windowHeight * 0.5) {
          hasDismissed.current = true;

          window.setTimeout(() => {
            setIsVisible(false);
            setShowScrollIndicator(false);
            onComplete?.();
          }, 300);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onComplete]);

  const opacity = Math.max(0, 1 - scrollProgress * 1.2);
  const y = scrollProgress * (isMobile ? -16 : -30);
  const scale = 1 + scrollProgress * (isMobile ? 0.02 : 0.05);
  const blur = isMobile ? 0 : scrollProgress * 4;
  const heroImageSrc = `${import.meta.env.BASE_URL}${isMobile ? "hero-banner.png" : "hero-landing.png"}`;

  if (!isVisible) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.4, ease: "easeInOut" }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ 
        height: "100vh",
        scrollSnapAlign: 'start',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
      }}
    >
      <motion.div
        animate={{ 
          y: y, 
          scale: scale,
          opacity: opacity,
          filter: blur ? `blur(${blur}px)` : "none",
        }}
        transition={{ ease: "easeOut", duration: 0.1 }}
        className="absolute inset-0 will-change-transform"
        style={{ willChange: isMobile ? "transform, opacity" : "transform, opacity, filter" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <img
          src={heroImageSrc}
          alt="TropiColors - Colorantes Alimentarios"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </motion.div>
          
          {/* Content with entrance animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg"
              style={{ 
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                fontFamily: "'Playfair Display', Georgia, serif"
              }}
            >
              TropiColors
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow-md"
            >
              Colorantes Alimentarios de Calidad Premium 
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 text-lg text-white/80"
            >
              Dale vida y color a tus creaciones culinarias
            </motion.p>
          </motion.div>
          
          {/* Scroll indicator */}
          <AnimatePresence>
            {showScrollIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
              >
                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex flex-col items-center text-white/80 cursor-pointer"
                  onClick={() => {
                    window.scrollTo({ 
                      top: window.innerHeight * 0.5, 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  <span className="text-sm mb-2 font-medium">Descubre más</span>
                  <ChevronDown className="w-8 h-8" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </motion.div>
  );
}
