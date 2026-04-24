import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const ABOUT_ITEMS = [
  "Uso alimentario e industrial",
  "Dos concentraciones disponibles",
  "Envíos a todo México",
  "Atención a Mayoristas",
];

export default function AboutSection() {
  return (
    <motion.section
      id="nosotros"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="page-snap-section bg-slate-50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-7 border border-[#003F91]/15">
              Sobre Nosotros
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#003F91] mb-7 tracking-tight">
              Expertos en <span className="text-[#00A8B5]">Color</span>
              <br />
              para la industria
            </h2>
            <p className="text-base text-muted-foreground mb-5 leading-relaxed">
              En <strong className="text-[#003F91]">TropicColors</strong> nos
              especializamos en colorantes artificiales para la industria
              alimentaria y también para aplicaciones industriales en México.
              Además de alimentos, nuestros colorantes se utilizan en
              formulaciones para productos de limpieza que requieren tonos
              intensos, uniformes y consistentes.
            </p>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              Contamos con dos tipos de concentración para adaptarnos mejor a
              cada uso: opciones orientadas a aplicaciones de grado alimenticio
              para panadería, confitería, bebidas y lácteos, de igual forma contamos con opciones para
              uso industrial en productos de limpieza y otras preparaciones
              técnicas. Todos nuestros productos son 100% solubles en agua y
              están pensados para ofrecer rendimiento, estabilidad y color
              uniforme en cada mezcla.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ABOUT_ITEMS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CheckCircle
                    size={16}
                    className="text-[#00A8B5] flex-shrink-0"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img
                src={`${import.meta.env.BASE_URL}images/color-splash.png`}
                alt="Colorantes Tropicolors"
                loading="lazy"
                decoding="async"
                className="mx-auto h-full w-full max-w-[1200px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#FFCD00] rounded-2xl px-7 py-5 shadow-2xl">
              <p className="text-[#003F91] font-black text-3xl leading-none">
                +20
              </p>
              <p className="text-[#003F91] text-xs font-bold mt-0.5">
                colores disponibles
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
