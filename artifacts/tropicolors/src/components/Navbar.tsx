import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Productos", href: "#productos" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Beneficios", href: "#beneficios" },
    { name: "Contacto", href: "#contacto" },
  ];

  const handleNavClick = (href: string) => {
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
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-white py-4"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} alt="TropicColors" className="h-12 w-auto object-contain" />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-foreground/80 hover:text-primary font-medium transition-colors text-sm"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/525551146856"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-accent text-primary rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm"
              >
                <MessageCircle size={17} />
                Cotizar por WhatsApp
              </a>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-foreground">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <img src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} alt="TropicColors" className="h-10 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground">
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-6 text-xl font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </button>
            ))}
            <a
              href="https://wa.me/525551146856"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 px-8 py-4 bg-accent text-primary rounded-full font-bold shadow-xl text-base"
            >
              <MessageCircle size={22} />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
