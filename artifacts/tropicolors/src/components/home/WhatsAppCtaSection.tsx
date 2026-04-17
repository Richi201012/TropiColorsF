import { MessageCircle } from "lucide-react";

export default function WhatsAppCtaSection() {
  return (
    <section className="page-snap-section relative overflow-hidden bg-[linear-gradient(135deg,#082f49_0%,#003F91_48%,#00A8B5_100%)] text-white">
      <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#FFCD00]/20 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/8 px-6 py-10 shadow-[0_30px_80px_rgba(8,47,73,0.28)] backdrop-blur-xl sm:px-10">
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.24em] text-cyan-100">
            Atención comercial
          </p>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
            ¿Necesitas una cotización?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/74">
            Contáctanos directamente para precios de mayoreo, envíos a todo
            México y asesoría especializada.
          </p>
          <a
            href="https://wa.me/525551146856?text=Hola%2C%20quiero%20cotizar%20colorantes%20Tropicolors"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-10 py-4.5 text-base font-bold text-[#003F91] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/30"
          >
            <MessageCircle size={22} />
            Escríbenos por WhatsApp
          </a>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              +52 55 5114 6856
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">
              Respuesta comercial directa
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
