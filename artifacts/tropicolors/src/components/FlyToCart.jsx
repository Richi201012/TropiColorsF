import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export function FlyToCart() {
  const { flyingItems, removeFlyingItem } = useCart();

  return (
    <AnimatePresence>
      {flyingItems.map((item) => (
        <FlyingProduct
          key={item.id}
          item={item}
          onComplete={() => removeFlyingItem(item.id)}
        />
      ))}
    </AnimatePresence>
  );
}

function FlyingProduct({ item, onComplete }) {
  const prefersReducedMotion = useReducedMotion();
  const cartTarget = document.querySelector('[data-cart-target="true"]');
  const cartRect = cartTarget?.getBoundingClientRect();
  const size = 56;
  const startLeft = item.startX - size / 2;
  const startTop = item.startY - size / 2;
  const targetX = cartRect
    ? cartRect.left + cartRect.width / 2
    : window.innerWidth - 36;
  const targetY = cartRect ? cartRect.top + cartRect.height / 2 : 36;
  const deltaX = targetX - item.startX;
  const deltaY = targetY - item.startY;
  const arcHeight = Math.min(84, Math.max(36, window.innerHeight * 0.08));
  const fullMotion = {
    x: [0, deltaX * 0.5, deltaX],
    y: [0, deltaY * 0.5 - arcHeight, deltaY],
    opacity: [1, 1, 0],
    scale: [1, 0.88, 0.36],
    rotate: [0, 10, 20],
  };

  return (
    <motion.div
      initial={{
        position: "fixed",
        left: startLeft,
        top: startTop,
        width: size,
        height: size,
        borderRadius: "50%",
        zIndex: 9999,
        opacity: 1,
      }}
      animate={prefersReducedMotion ? { opacity: 0, scale: 0.92 } : fullMotion}
      exit={{
        opacity: 0,
        scale: 0.2,
      }}
      transition={{
        duration: prefersReducedMotion ? 0.16 : 0.58,
        ease: [0.16, 1, 0.3, 1],
      }}
      onAnimationComplete={onComplete}
      style={{
        backgroundColor: item.hexCode || "#003F91",
        backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35), 0 0 30px rgba(0,91,145,0.3)",
        border: "3px solid white",
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}
    />
  );
}

export default FlyToCart;
