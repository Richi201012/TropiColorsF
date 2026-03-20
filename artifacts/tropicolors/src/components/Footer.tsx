import React from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="bg-white inline-block p-4 rounded-2xl">
               <img src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} alt="TropicColors Logo" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Dale vida y color a tus creaciones con los mejores colorantes artificiales de grado alimenticio en México.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-display font-bold mb-6 text-accent">Enlaces Rápidos</h3>
            <ul className="space-y-4">
              <li><a href="/" className="text-white/80 hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#productos" className="text-white/80 hover:text-white transition-colors">Nuestros Productos</a></li>
              <li><a href="#nosotros" className="text-white/80 hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#beneficios" className="text-white/80 hover:text-white transition-colors">Beneficios</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-display font-bold mb-6 text-accent">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/80">
                <MapPin size={20} className="text-secondary shrink-0 mt-1" />
                <span>Ciudad de México, México</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <Phone size={20} className="text-secondary shrink-0" />
                <span>+52 55 5114 6856</span>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <Mail size={20} className="text-secondary shrink-0" />
                <span>ventas@tropicolors.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-display font-bold mb-6 text-accent">Boletín</h3>
            <p className="text-white/80 mb-4">Recibe nuestras ofertas y novedades directamente en tu correo.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Tu email" 
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <button className="px-4 py-2 bg-accent text-primary font-bold rounded-lg hover:bg-accent/90 transition-colors">
                Unirse
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} TropicColors. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="#" className="hover:text-white transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
