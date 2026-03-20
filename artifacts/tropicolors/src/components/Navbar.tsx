import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "#productos" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Beneficios", href: "#beneficios" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-white py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} alt="TropicColors Logo" className="h-10 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href.startsWith('#') ? link.href : undefined}
                  onClick={(e) => {
                    if (link.href === "/") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-foreground/80 hover:text-primary font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Link href="/admin" className="text-foreground/50 hover:text-primary text-sm font-medium transition-colors">Admin</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/525551146856" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-accent text-primary rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <MessageCircle size={18} />
                <span>Cotizar por WhatsApp</span>
              </a>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground hover:text-primary transition-colors"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white text-xs font-bold flex items-center justify-center rounded-full animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-foreground"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 flex justify-end">
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground">
              <X size={32} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8 text-2xl font-display font-bold">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-foreground/50 hover:text-primary">Admin</Link>
            <a 
              href="https://wa.me/525551146856" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 flex items-center gap-3 px-8 py-4 bg-accent text-primary rounded-full font-bold shadow-xl"
            >
              <MessageCircle size={24} />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
