import React from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Logo + Descripción */}
          <div className="flex flex-col">
            <img 
              src={`${import.meta.env.BASE_URL}logo-tropicolors.png`} 
              alt="TropicColors Logo" 
              className="h-16 w-auto object-contain mb-4" 
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Dale vida y color a tus creaciones con los mejores colorantes artificiales de grado alimenticio en México.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a 
                href="https://www.facebook.com/share/1c23hr7sLP/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://www.instagram.com/tropicolors_mx?igsh=MTBnZDNmenBjMTRzeA==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Inicio</a></li>
              <li><a href="#productos" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Nuestros Productos</a></li>
              <li><a href="#nosotros" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Sobre Nosotros</a></li>
              <li><a href="#beneficios" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Beneficios</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <MapPin size={18} className="shrink-0 mt-0.5 text-blue-600" />
                <span>Ciudad de México, México</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Phone size={18} className="shrink-0 text-blue-600" />
                <span>+52 55 5114 6856</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail size={18} className="shrink-0 text-blue-600" />
                <span>ventas@tropicolors.com</span>
              </li>
            </ul>
          </div>

          {/* Boletín */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Boletín</h3>
            <p className="text-gray-500 text-sm mb-4">Recibe nuestras ofertas y novedades directamente en tu correo.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Tu email" 
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Unirse
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TropiColors. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-blue-600 transition-colors">Términos y Condiciones</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
