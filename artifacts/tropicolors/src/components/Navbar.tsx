import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("inicio");
  const { setIsCartOpen, cartCount, triggerCartBounce, items } = useCart();
  const [, setTick] = useState(0);
  useEffect(() => { setTick(t => t + 1); }, [items.length, cartCount, triggerCartBounce]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      
      // Update active link based on scroll position
      const sections = ["inicio", "productos", "nosotros", "beneficios", "contacto"];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveLink(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#inicio", id: "inicio" },
    { name: "Productos", href: "#productos", id: "productos" },
    { name: "Nosotros", href: "#nosotros", id: "nosotros" },
    { name: "Beneficios", href: "#beneficios", id: "beneficios" },
    { name: "Contacto", href: "#contacto", id: "contacto" },
  ];

  const handleNavClick = (href: string, id: string) => {
    setActiveLink(id);
    setMobileMenuOpen(false);
    if (href === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 py-3" 
            : "bg-white/70 backdrop-blur-md py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer px-2 py-1 rounded-xl transition-all duration-300 ${
                  isScrolled 
                    ? "bg-white/90 shadow-lg shadow-black/5" 
                    : "bg-white/60 backdrop-blur-sm shadow-md shadow-black/5"
                }`}
              >
                <img 
                  src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} 
                  alt="TropicColors" 
                  className="h-12 w-auto object-contain"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavClick(link.href, link.id)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors"
                  style={{ color: activeLink === link.id ? "#003F91" : "#6b7280" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">{link.name}</span>
                  {/* Animated underline */}
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#003F91]"
                    initial={false}
                    animate={{ 
                      opacity: activeLink === link.id ? 1 : 0,
                      scaleX: activeLink === link.id ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: "center" }}
                  />
                  {/* Hover underline */}
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#003F91]/30"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              ))}
            </div>

            {/* CTA & Cart */}
            <div className="flex items-center gap-2">
              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#20BD5A] text-white rounded-full font-semibold text-sm shadow-lg shadow-green-500/20"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 8px 25px rgba(37, 211, 102, 0.35)"
                }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle size={16} strokeWidth={2.5} />
                <span>WhatsApp</span>
              </motion.a>

              {/* Cart Button */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-600 hover:text-[#003F91] transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={triggerCartBounce ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag size={22} strokeWidth={2} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[22px] h-5 flex items-center justify-center bg-gradient-to-r from-[#FF2E63] to-[#C71585] text-white text-[11px] font-bold rounded-full px-1.5 shadow-lg shadow-pink-500/40"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2.5 text-gray-600 hover:text-[#003F91] bg-gray-50 hover:bg-gray-100 rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={22} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="px-3 py-1.5 bg-white rounded-xl shadow-md">
                <img 
                  src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} 
                  alt="TropicColors" 
                  className="h-10 w-auto" 
                />
              </div>
              <motion.button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-gray-600 bg-gray-50 rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} />
              </motion.button>
            </div>
            
            {/* Links */}
            <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavClick(link.href, link.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`w-full max-w-xs py-4 text-center text-lg font-semibold rounded-2xl transition-all ${
                    activeLink === link.id 
                      ? "bg-[#003F91] text-white shadow-lg shadow-blue-500/30" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </motion.button>
              ))}
              
              {/* WhatsApp CTA - Mobile */}
              <motion.a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#20BD5A] text-white rounded-2xl font-bold shadow-xl shadow-green-500/25"
              >
                <MessageCircle size={22} />
                Contáctanos por WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
