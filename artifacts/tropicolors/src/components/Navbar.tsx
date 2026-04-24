import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("inicio");
  const { setIsCartOpen, cartCount, triggerCartBounce } = useCart();

  useEffect(() => {
    const sectionIds = [
      "inicio",
      "productos",
      "nosotros",
      "beneficios",
      "referencias",
      "contacto",
    ] as const;
    let frameId: number | null = null;

    const updateNavbarState = () => {
      frameId = null;
      const scrollY = window.scrollY;
      const nextIsScrolled = scrollY > 30;
      let nextActiveLink = "inicio";

      for (let index = sectionIds.length - 1; index >= 0; index -= 1) {
        const sectionId = sectionIds[index];
        const section = document.getElementById(sectionId);

        if (section && section.getBoundingClientRect().top <= 150) {
          nextActiveLink = sectionId;
          break;
        }
      }

      setIsScrolled((current) =>
        current === nextIsScrolled ? current : nextIsScrolled,
      );
      setActiveLink((current) =>
        current === nextActiveLink ? current : nextActiveLink,
      );
    };

    const queueNavbarStateUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateNavbarState);
    };

    queueNavbarStateUpdate();
    window.addEventListener("scroll", queueNavbarStateUpdate, { passive: true });
    window.addEventListener("resize", queueNavbarStateUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", queueNavbarStateUpdate);
      window.removeEventListener("resize", queueNavbarStateUpdate);
    };
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#inicio", id: "inicio" },
    { name: "Productos", href: "#productos", id: "productos" },
    { name: "Nosotros", href: "#nosotros", id: "nosotros" },
    { name: "Beneficios", href: "#beneficios", id: "beneficios" },
    { name: "Referencias", href: "#referencias", id: "referencias" },
    { name: "Contacto", href: "#contacto", id: "contacto" },
  ];

  const handleNavClick = (href: string, id: string) => {
    setActiveLink(id);
    setDesktopSidebarOpen(false);
    setMobileMenuOpen(false);

    if (href === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setDesktopSidebarOpen((current) => !current)}
        className="fixed left-5 top-5 z-50 hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-white/88 text-[#003F91] shadow-[0_18px_44px_rgba(0,63,145,0.16)] backdrop-blur-xl transition-colors hover:bg-white lg:flex"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,63,145,0.1),rgba(0,168,181,0.08),rgba(255,205,0,0.14))]">
          {desktopSidebarOpen ? (
            <X size={20} strokeWidth={2.2} />
          ) : (
            <Menu size={20} strokeWidth={2.2} />
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {desktopSidebarOpen ? (
          <motion.button
            type="button"
            aria-label="Cerrar navegacion lateral"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDesktopSidebarOpen(false)}
            className="fixed inset-0 z-40 hidden bg-slate-950/18 backdrop-blur-[2px] lg:block"
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: desktopSidebarOpen ? 0 : -320,
          opacity: desktopSidebarOpen ? 1 : 0.96,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-screen w-[304px] p-5 lg:block"
      >
        <div
          className={`relative flex h-full flex-col overflow-hidden rounded-[34px] border transition-all duration-500 ${
            isScrolled
              ? "border-white/70 bg-white/88 shadow-[0_24px_70px_rgba(0,63,145,0.14)] backdrop-blur-2xl"
              : "border-white/60 bg-white/82 shadow-[0_18px_56px_rgba(0,63,145,0.10)] backdrop-blur-xl"
          } pointer-events-auto`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,63,145,0),rgba(0,63,145,0.35),rgba(0,168,181,0.26),rgba(255,205,0,0.4),rgba(0,63,145,0))]" />
          <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-[#003F91]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-[-18px] top-24 h-28 w-28 rounded-full bg-[#FFCD00]/14 blur-3xl" />
          <div className="pointer-events-none absolute left-8 bottom-20 h-28 w-28 rounded-full bg-[#00A8B5]/10 blur-3xl" />

          <div className="relative flex h-full flex-col px-5 py-6">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 rounded-[28px] border border-white/70 bg-white/70 px-3 py-3 shadow-[0_12px_34px_rgba(0,63,145,0.08)]"
              >
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.95),rgba(255,255,255,0.65)_72%,rgba(255,255,255,0.18)_100%)]">
                  <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(0,63,145,0.06),rgba(255,205,0,0.08),rgba(0,168,181,0.06))]" />
                  <img
                    src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
                    alt="TropicColors"
                    decoding="async"
                    className="relative h-12 w-auto object-contain drop-shadow-[0_8px_18px_rgba(255,255,255,0.9)]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl font-black tracking-[-0.04em] text-[#003F91]">
                    TropiColors
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Color para la industria
                  </p>
                </div>
              </motion.div>
            </Link>

            <div className="mt-8 flex flex-1 flex-col gap-2">
              {navLinks.map((link) => (
                <motion.button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.href, link.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-left"
                  style={{
                    color: activeLink === link.id ? "#003F91" : "#667085",
                  }}
                >
                  {activeLink === link.id ? (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(0,63,145,0.12),rgba(0,168,181,0.08),rgba(255,205,0,0.14))] shadow-[0_10px_28px_rgba(0,63,145,0.10)]"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10 text-sm font-semibold">
                    {link.name}
                  </span>
                  <span
                    className={`relative z-10 h-2.5 w-2.5 rounded-full transition-colors ${
                      activeLink === link.id ? "bg-[#003F91]" : "bg-slate-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <motion.a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 16px 32px rgba(37, 211, 102, 0.28)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/40 bg-[linear-gradient(135deg,#25D366_0%,#20BD5A_45%,#1db954_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,211,102,0.26)]"
              >
                <MessageCircle size={17} strokeWidth={2.4} />
                <span>WhatsApp</span>
              </motion.a>

              <motion.button
                type="button"
                onClick={() => setIsCartOpen(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                animate={triggerCartBounce ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="relative flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/82 px-4 py-3.5 text-left text-gray-700 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-colors hover:border-[#003F91]/20 hover:text-[#003F91]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-[#003F91]">
                    <ShoppingBag size={20} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Carrito</span>
                    <span className="block text-xs text-slate-400">
                      {cartCount > 0
                        ? `${cartCount} producto${cartCount === 1 ? "" : "s"}`
                        : "Sin productos"}
                    </span>
                  </span>
                </span>
                <AnimatePresence>
                  {cartCount > 0 ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="min-w-[28px] rounded-full bg-gradient-to-r from-[#FF2E63] to-[#C71585] px-2 py-1 text-center text-[11px] font-bold text-white shadow-lg shadow-pink-500/35"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.aside>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 top-0 z-50 px-4 py-4 transition-all duration-500 lg:hidden ${
          isScrolled ? "sm:px-5" : "sm:px-6"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl rounded-[28px] border transition-all duration-500 ${
            isScrolled
              ? "border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(0,63,145,0.12)] backdrop-blur-2xl"
              : "border-white/60 bg-white/80 shadow-[0_18px_48px_rgba(0,63,145,0.08)] backdrop-blur-xl"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link href="/">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.92),rgba(255,255,255,0.58)_72%,rgba(255,255,255,0.18)_100%)]">
                  <img
                    src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
                    alt="TropicColors"
                    decoding="async"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-black tracking-[-0.04em] text-[#003F91]">
                    TropiColors
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Color para la industria
                  </p>
                </div>
              </motion.div>
            </Link>

            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/76 text-gray-600 transition-colors hover:border-[#003F91]/20 hover:text-[#003F91]"
                whileTap={{ scale: 0.95 }}
                animate={triggerCartBounce ? { scale: [1, 1.14, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag size={22} strokeWidth={2} />
                <AnimatePresence>
                  {cartCount > 0 ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 min-w-[22px] rounded-full bg-gradient-to-r from-[#FF2E63] to-[#C71585] px-1.5 py-0.5 text-[11px] font-bold text-white shadow-lg shadow-pink-500/35"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/76 text-gray-600 hover:text-[#003F91]"
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={22} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <img
                src={`${import.meta.env.BASE_URL}logo-tropicolors.png`}
                alt="TropicColors"
                decoding="async"
                className="h-12 w-auto object-contain"
              />
              <motion.button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-gray-50 p-2.5 text-gray-600"
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.href, link.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`w-full max-w-xs rounded-2xl py-4 text-center text-lg font-semibold transition-all ${
                    activeLink === link.id
                      ? "bg-[#003F91] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </motion.button>
              ))}

              <motion.a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#20BD5A] px-8 py-4 font-bold text-white shadow-xl shadow-green-500/25"
              >
                <MessageCircle size={22} />
                Contáctanos por WhatsApp
              </motion.a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
