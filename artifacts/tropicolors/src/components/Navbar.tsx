import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("inicio");
  const { setIsCartOpen, cartCount, triggerCartBounce, items } = useCart();
  const [, setTick] = useState(0);
  useEffect(() => { setTick(t => t + 1); }, [items.length, cartCount, triggerCartBounce]);

  useEffect(() => {
    const handleScroll = () => {
      const isAtTop = window.scrollY <= 10;
      setIsScrolled(window.scrollY > 30);
      setIsNavbarVisible(isAtTop);
      
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
        animate={{ y: isNavbarVisible ? 0 : -140 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "py-3" 
            : "py-5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-[28px] border transition-all duration-500 ${
              isScrolled
                ? "border-white/70 bg-white/88 shadow-[0_20px_60px_rgba(0,63,145,0.12)] backdrop-blur-2xl"
                : "border-white/60 bg-white/76 shadow-[0_18px_48px_rgba(0,63,145,0.08)] backdrop-blur-xl"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,63,145,0),rgba(0,63,145,0.35),rgba(0,168,181,0.28),rgba(255,205,0,0.42),rgba(0,63,145,0))]" />
            <div className="pointer-events-none absolute -left-12 top-0 h-24 w-24 rounded-full bg-[#003F91]/10 blur-3xl" />
            <div className="pointer-events-none absolute right-[18%] top-[-22px] h-24 w-24 rounded-full bg-[#FFCD00]/14 blur-3xl" />
            <div className="pointer-events-none absolute left-[44%] top-[-18px] h-20 w-28 rounded-full bg-[#00A8B5]/10 blur-3xl" />

            <div className="relative flex items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-2 py-1.5 transition-all duration-300 hover:border-[#003F91]/10 hover:bg-white/45"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.92),rgba(255,255,255,0.58)_72%,rgba(255,255,255,0.18)_100%)] shadow-[0_12px_24px_rgba(0,63,145,0.08)]">
                  <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(0,63,145,0.06),rgba(255,205,0,0.08),rgba(0,168,181,0.06))]" />
                  <img 
                    src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} 
                    alt="TropicColors" 
                    className="relative h-12 w-auto object-contain drop-shadow-[0_8px_18px_rgba(255,255,255,0.9)]"
                  />
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="font-display text-lg font-black tracking-[-0.04em] text-[#003F91]">
                    TropiColors
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Color para la industria
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center rounded-full border border-slate-200/80 bg-white/62 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
              {navLinks.map((link) => (
                <motion.button
                  key={link.name}
                  onClick={() => handleNavClick(link.href, link.id)}
                  className="relative px-4 py-2.5 text-sm font-semibold transition-colors lg:px-5"
                  style={{ color: activeLink === link.id ? "#003F91" : "#667085" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeLink === link.id && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(0,63,145,0.10),rgba(0,168,181,0.10),rgba(255,205,0,0.16))] shadow-[0_8px_22px_rgba(0,63,145,0.08)]"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                  <motion.div
                    className="absolute bottom-[7px] left-4 right-4 h-[2px] rounded-full bg-[#003F91]/25"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeLink === link.id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: "center" }}
                  />
                </motion.button>
              ))}
            </div>

            {/* CTA & Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp CTA */}
              <motion.a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 rounded-full border border-white/40 bg-[linear-gradient(135deg,#25D366_0%,#20BD5A_45%,#1db954_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,211,102,0.28)]"
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
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/76 text-gray-600 transition-colors hover:border-[#003F91]/20 hover:text-[#003F91]"
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
                className="md:hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/76 text-gray-600 hover:text-[#003F91]"
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={22} strokeWidth={2} />
              </motion.button>
            </div>
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
              <div>
                <img 
                  src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} 
                  alt="TropicColors" 
                  className="h-12 w-auto object-contain drop-shadow-[0_8px_18px_rgba(255,255,255,0.9)]" 
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
