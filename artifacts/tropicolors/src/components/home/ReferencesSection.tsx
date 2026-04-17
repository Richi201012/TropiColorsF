import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { SiteReference } from "@/types/reference";
import type { ReferenceFormData } from "./types";

type ReferencesSectionProps = {
  references: SiteReference[];
  referenceForm: ReferenceFormData;
  referenceSent: boolean;
  isSubmittingReference: boolean;
  onReferenceFieldChange: (
    field: keyof ReferenceFormData,
    value: string | number,
  ) => void;
  onReferenceSubmit: () => Promise<void> | void;
};

export default function ReferencesSection({
  references,
  referenceForm,
  referenceSent,
  isSubmittingReference,
  onReferenceFieldChange,
  onReferenceSubmit,
}: ReferencesSectionProps) {
  const [referencesCarouselApi, setReferencesCarouselApi] =
    useState<CarouselApi>();
  const activeReferences = useMemo(() => references.slice(0, 6), [references]);

  useEffect(() => {
    if (!referencesCarouselApi || activeReferences.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      referencesCarouselApi.scrollNext();
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [activeReferences.length, referencesCarouselApi]);

  return (
    <motion.section
      id="referencias"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="page-snap-section bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[#003F91]/10 bg-[#003F91]/5 px-5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#003F91]">
            Referencias
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-[#003F91] md:text-5xl">
            Tus opiniones nos ayudan a ser mejores
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Cada experiencia cuenta. Comparte la tuya o descubre lo que otros
            clientes ya han dicho sobre nosotros.
          </p>
        </div>

        <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
          <div className="min-w-0 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Carrusel de referencias
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Lo que dicen nuestros clientes
                </h3>
              </div>
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline-flex">
                {activeReferences.length > 0
                  ? `${activeReferences.length} compartidas`
                  : "Sin referencias aún"}
              </div>
            </div>

            <div className="mt-6 px-8 sm:px-14">
              {activeReferences.length > 0 ? (
                <Carousel
                  setApi={setReferencesCarouselApi}
                  opts={{ align: "start", loop: activeReferences.length > 1 }}
                  className="w-full"
                >
                  <CarouselContent>
                    {activeReferences.map((reference) => (
                      <CarouselItem key={reference.id} className="basis-full">
                        <article className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:min-h-[300px] sm:p-8">
                          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#00A8B5]/10 blur-2xl" />
                          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[#FFCD00]/10 blur-2xl" />

                          <div className="relative">
                            <div className="flex items-center justify-between gap-3">
                              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#003F91_0%,#00A8B5_100%)] text-white shadow-lg shadow-cyan-500/15">
                                <MessageCircle size={18} />
                              </div>
                              <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, ratingIndex) => (
                                  <Star
                                    key={`${reference.id}-rating-${ratingIndex}`}
                                    size={14}
                                    className={
                                      ratingIndex < reference.rating
                                        ? "fill-current"
                                        : "text-slate-200"
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="mt-6 break-words text-base leading-8 text-slate-600">
                              “{reference.message}”
                            </p>

                            <div className="mt-8 border-t border-slate-200/80 pt-5">
                              <p className="break-words text-base font-bold text-slate-950">
                                {reference.name}
                              </p>
                              <p className="mt-1 break-words text-sm font-medium text-[#003F91]">
                                {[reference.role, reference.company]
                                  .filter(Boolean)
                                  .join(" · ") || "Cliente Tropicolors"}
                              </p>
                              {reference.location ? (
                                <p className="mt-1 break-words text-xs uppercase tracking-[0.18em] text-slate-400">
                                  {reference.location}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0 h-10 w-10 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 sm:-left-2" />
                  <CarouselNext className="right-0 h-10 w-10 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 sm:-right-2" />
                </Carousel>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    Todavía no hay referencias publicadas
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    La primera puede ser la tuya. Envíala desde el formulario y
                    aparecerá aquí automáticamente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-full rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:p-8 xl:sticky xl:top-24">
            <p className="inline-flex rounded-full border border-[#00A8B5]/15 bg-[#00A8B5]/8 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#007b86]">
              Enviar referencia
            </p>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
              Comparte tu experiencia
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Cuéntanos cómo usas Tropicolors. Tu referencia se publica al
              momento y luego puede administrarse desde el panel.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onReferenceSubmit();
              }}
              className="mt-6 space-y-4"
            >
              {referenceSent ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Referencia enviada
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                      Ya quedó visible en el sitio.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                    Nombre
                  </label>
                  <input
                    value={referenceForm.name}
                    onChange={(event) =>
                      onReferenceFieldChange("name", event.target.value)
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#003F91] focus:ring-2 focus:ring-[#003F91]/15"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                    Empresa o negocio
                  </label>
                  <input
                    value={referenceForm.company}
                    onChange={(event) =>
                      onReferenceFieldChange("company", event.target.value)
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#003F91] focus:ring-2 focus:ring-[#003F91]/15"
                    placeholder="Nombre de tu negocio"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                    Rol
                  </label>
                  <input
                    value={referenceForm.role}
                    onChange={(event) =>
                      onReferenceFieldChange("role", event.target.value)
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#003F91] focus:ring-2 focus:ring-[#003F91]/15"
                    placeholder="Pastelería, distribuidor, repostera..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                    Ubicación
                  </label>
                  <input
                    value={referenceForm.location}
                    onChange={(event) =>
                      onReferenceFieldChange("location", event.target.value)
                    }
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#003F91] focus:ring-2 focus:ring-[#003F91]/15"
                    placeholder="Ciudad o estado"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Tu referencia
                </label>
                <textarea
                  rows={5}
                  value={referenceForm.message}
                  onChange={(event) =>
                    onReferenceFieldChange("message", event.target.value)
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#003F91] focus:ring-2 focus:ring-[#003F91]/15"
                  placeholder="Cuéntanos cómo te ayudó Tropicolors en tu negocio o producción."
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Calificación
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={`reference-form-rating-${value}`}
                        type="button"
                        onClick={() => onReferenceFieldChange("rating", value)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={18}
                          className={
                            value <= referenceForm.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReference}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#003F91] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-[#003F91]/20 transition hover:bg-[#002d6e] disabled:opacity-60"
              >
                {isSubmittingReference ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando referencia...
                  </>
                ) : (
                  "Enviar referencia"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
