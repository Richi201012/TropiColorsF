import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href="https://wa.me/525551146856?text=Hola%20quiero%20cotizar%20colorantes%20Tropicolors"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: 0.35, type: "spring", stiffness: 320, damping: 26 }}
      className="fixed right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#25D366]/40 sm:right-6 bottom-[calc(env(safe-area-inset-bottom)+var(--tc-floating-clearance))]"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
      </span>
    </motion.a>
  );
}
