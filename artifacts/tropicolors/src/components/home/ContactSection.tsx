import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { ContactForm, ContactFormErrors } from "./types";

const CONTACT_DETAILS = [
  { label: "Teléfono / WhatsApp", value: "+52 55 5114 6856" },
  { label: "Lada sin costo", value: "01 800 8 36 74 68" },
  {
    label: "Correo electrónico",
    value: "m_tropicolors1@hotmail.com",
  },
  {
    label: "Dirección",
    value:
      "Abedules Mz.1 Lt.36, Ejército del Trabajo II, Ecatepec, Edo. Mex. C.P. 55238",
  },
];

type ContactSectionProps = {
  contactSent: boolean;
  contactForm: ContactForm;
  contactErrors: ContactFormErrors;
  isSubmittingContact: boolean;
  onFieldChange: (field: keyof ContactForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function ContactSection({
  contactSent,
  contactForm,
  contactErrors,
  isSubmittingContact,
  onFieldChange,
  onSubmit,
  onReset,
}: ContactSectionProps) {
  return (
    <motion.section
      id="contacto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="page-snap-section bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2">
            <span className="inline-block py-1.5 px-5 rounded-full bg-[#003F91]/8 text-[#003F91] text-[11px] font-bold uppercase tracking-widest mb-7 border border-[#003F91]/15">
              Contáctanos
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#003F91] mb-5 tracking-tight">
              Hablemos de
              <br />
              tu proyecto
            </h2>
            <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
              Déjanos tus datos y te responderemos a la brevedad con la mejor
              asesoría.
            </p>
            <div className="space-y-5">
              {CONTACT_DETAILS.map((item) => (
                <div
                  key={item.label}
                  className="border-l-2 border-[#003F91]/20 pl-4"
                >
                  <p className="text-[10px] font-extrabold text-[#003F91]/50 uppercase tracking-widest mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {contactSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#003F91]/4 border border-[#003F91]/12 rounded-3xl p-16 text-center"
              >
                <div className="w-16 h-16 bg-[#00A8B5]/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-[#00A8B5]" />
                </div>
                <h3 className="text-xl font-black text-[#003F91] mb-2">
                  ¡Mensaje recibido!
                </h3>
                <p className="text-muted-foreground text-sm mb-7">
                  Nos pondremos en contacto contigo muy pronto.
                </p>
                <button
                  onClick={onReset}
                  className="text-sm text-[#003F91] font-semibold underline underline-offset-4"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="bg-slate-50/80 border border-border/40 p-8 rounded-3xl space-y-5 shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                      Nombre
                    </label>
                    <input
                      value={contactForm.name}
                      onChange={(event) =>
                        onFieldChange("name", event.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                      placeholder="Tu nombre"
                    />
                    {contactErrors.name ? (
                      <p className="text-red-500 text-xs mt-1">
                        {contactErrors.name}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                      Correo
                    </label>
                    <input
                      value={contactForm.email}
                      onChange={(event) =>
                        onFieldChange("email", event.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                      placeholder="correo@ejemplo.com"
                    />
                    {contactErrors.email ? (
                      <p className="text-red-500 text-xs mt-1">
                        {contactErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                    Teléfono (opcional)
                  </label>
                  <input
                    value={contactForm.phone}
                    onChange={(event) => onFieldChange("phone", event.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm transition-all"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-foreground mb-1.5 uppercase tracking-widest">
                    Mensaje o Producto de Interés
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(event) =>
                      onFieldChange("message", event.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-[#003F91]/20 focus:border-[#003F91] outline-none text-sm resize-none transition-all"
                    placeholder="Me interesa cotizar Azul 125 en cubeta de 6 KG..."
                  />
                  {contactErrors.message ? (
                    <p className="text-red-500 text-xs mt-1">
                      {contactErrors.message}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-4 bg-[#003F91] text-white rounded-xl font-extrabold text-sm hover:bg-[#002d6e] transition-colors shadow-lg disabled:opacity-60"
                >
                  {isSubmittingContact ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
