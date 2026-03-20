import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  // Get cart icon position - adjust based on navbar
  const cartTargetX = window.innerWidth - 60;
  const cartTargetY = 60;

  // Calculate a curved path with arc
  const midX = (item.startX + cartTargetX) / 2;
  const midY = Math.min(item.startY, cartTargetY) - 100; // Arc upward

  return (
    <motion.div
      initial={{
        position: "fixed",
        left: item.startX - 30, // Center the element
        top: item.startY - 30,
        width: 60,
        height: 60,
        borderRadius: "50%",
        zIndex: 9999,
        opacity: 1,
      }}
      animate={{
        left: [item.startX - 30, midX - 10, cartTargetX - 10],
        top: [item.startY - 30, midY, cartTargetY - 10],
        width: [60, 50, 24],
        height: [60, 50, 24],
        opacity: [1, 1, 0.9],
        scale: [1, 1.1, 0.6],
        rotate: [0, 180, 360],
      }}
      exit={{
        opacity: 0,
        scale: 0.1,
      }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onAnimationComplete={onComplete}
      style={{
        backgroundColor: item.hexCode || "#003F91",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35), 0 0 30px rgba(0,91,145,0.3)",
        border: "3px solid white",
      }}
    />
  );
}

export default FlyToCart;
