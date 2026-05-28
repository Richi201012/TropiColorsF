import { BadgeInfo, LayoutPanelTop } from "lucide-react";
import { cn } from "@/lib/utils";

type AdSlotShellProps = {
  title: string;
  description: string;
  slotName: string;
  className?: string;
  canvasClassName?: string;
};

const shouldPreviewAds =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_AD_PLACEHOLDERS === "true";

export default function AdSlotShell({
  title,
  description,
  slotName,
  className,
  canvasClassName,
}: AdSlotShellProps) {
  if (!shouldPreviewAds) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className={cn("relative px-4 py-6 sm:px-6 lg:px-8", className)}
    >
      <div className="mx-auto max-w-5xl">
        <div className="ad-slot-shell">
          <div className="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Vista de anuncio
              </p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">
                {title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#003F91]/10 bg-[#003F91]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#003F91]">
              <BadgeInfo size={14} />
              Solo visible en desarrollo
            </div>
          </div>

          <div
            className={cn(
              "ad-slot-canvas mx-4 my-4 flex items-center justify-center rounded-[24px] sm:mx-6",
              canvasClassName,
            )}
          >
            <div className="flex flex-col items-center gap-3 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#003F91_0%,#00A8B5_100%)] text-white shadow-[0_16px_30px_rgba(0,63,145,0.18)]">
                <LayoutPanelTop size={26} />
              </div>
              <div>
                <p className="text-sm font-extrabold tracking-tight text-slate-900">
                  Slot responsivo preparado
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {slotName}
                </p>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                Mantén los anuncios en cortes naturales del contenido, fuera de
                tarjetas, carruseles y formularios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
