import { motion } from "framer-motion";
import {
  Award,
  CheckCircle,
  Clock,
  Droplet,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Droplet,
    title: "Alta Concentración",
    desc: "Rinde más, logrando colores intensos con poca cantidad.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Sparkles,
    title: "100% Soluble",
    desc: "Se integra perfectamente en mezclas base agua, sin grumos.",
    color: "from-cyan-400 to-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "Grado Alimenticio",
    desc: "Totalmente seguro e inocuo para el consumo humano.",
    color: "from-violet-400 to-violet-600",
  },
  {
    icon: Clock,
    title: "Larga Vida Útil",
    desc: "Excelente estabilidad y conservación en anaquel.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: Award,
    title: "Colores Brillantes",
    desc: "Tonos vivos y consistentes para resultados profesionales.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Star,
    title: "Fácil de Usar",
    desc: "Se disuelve rápidamente en agua caliente o fría.",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: CheckCircle,
    title: "Precios de Mayoreo",
    desc: "Tarifas especiales por volumen, cajas completas.",
    color: "from-teal-400 to-teal-600",
  },
  {
    icon: MessageCircle,
    title: "Asesoría Personalizada",
    desc: "Te ayudamos a encontrar el color exacto que necesitas.",
    color: "from-indigo-400 to-indigo-600",
  },
];

export default function BenefitsSection() {
  return (
    <motion.section
      id="beneficios"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="page-snap-section bg-gradient-to-br from-[#00A8B5] via-[#00A8B5] to-[#007B7F] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFCD00]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            ¿Por qué elegir TropiColors?
          </h2>
          <p className="text-white/70 text-base max-w-2xl mx-auto">
            Calidad, rendimiento y seguridad en cada gota de color.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 hover:border-white/20 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <benefit.icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">
                {benefit.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
