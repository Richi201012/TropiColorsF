import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  MessageSquareQuote,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReferences } from "@/hooks/useReferences";
import {
  deleteReference,
  setReferenceStatus,
} from "@/services/reference-service";
import type { SiteReference } from "@/types/reference";

function formatReferenceDate(value: string): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReferencesView() {
  const { references, isLoading, error } = useReferences(true, true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingDelete, setPendingDelete] = useState<SiteReference | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingReferenceId, setUpdatingReferenceId] = useState<string | null>(
    null,
  );

  const filteredReferences = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return references.filter((reference) => {
      if (!searchValue) {
        return true;
      }

      return [
        reference.name,
        reference.company,
        reference.role,
        reference.location,
        reference.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
    });
  }, [references, searchTerm]);

  const averageRating = useMemo(() => {
    if (references.length === 0) {
      return 0;
    }

    const total = references.reduce(
      (sum, reference) => sum + reference.rating,
      0,
    );

    return Number((total / references.length).toFixed(1));
  }, [references]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteReference(pendingDelete.id);
      toast({
        title: "Referencia eliminada",
        description: "La referencia ya no se mostrará en el sitio.",
      });
      setPendingDelete(null);
    } catch (deleteError) {
      console.error("[ReferencesView] Error al eliminar:", deleteError);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la referencia. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (reference: SiteReference) => {
    if (updatingReferenceId) return;

    const nextStatus = reference.status === "active" ? "draft" : "active";
    setUpdatingReferenceId(reference.id);
    try {
      await setReferenceStatus(reference.id, nextStatus);
      toast({
        title: nextStatus === "active" ? "Referencia publicada" : "Referencia oculta",
        description:
          nextStatus === "active"
            ? "La referencia ya aparece en el sitio."
            : "La referencia quedó en revisión y ya no es pública.",
      });
    } catch (statusError) {
      console.error("[ReferencesView] Error al cambiar estado:", statusError);
      toast({
        title: "No se pudo actualizar",
        description: "Intenta nuevamente en unos momentos.",
        variant: "destructive",
      });
    } finally {
      setUpdatingReferenceId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-slate-950">
          Referencias
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa, publica u oculta los testimonios antes de mostrarlos en el sitio.
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Totales
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-950">
            {references.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Promedio
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-amber-600">
            {averageRating.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-2.5 shadow-sm">
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Buscar referencias"
            placeholder="Buscar por nombre, empresa, ubicación o texto..."
            className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda de referencias"
              className="text-muted-foreground transition-colors hover:text-slate-900"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl border border-border/50 bg-white px-5 py-12 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
          Cargando referencias...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
          {error}
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-white px-5 py-12 text-center text-sm text-muted-foreground">
          {references.length === 0
            ? "Todavía no hay referencias enviadas desde el sitio."
            : "No hay referencias que coincidan con la búsqueda."}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredReferences.map((reference) => (
            <div
              key={reference.id}
              className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <MessageSquareQuote size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-display font-bold text-slate-950">
                        {reference.name}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ${
                          reference.status === "active"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {reference.status === "active" ? "Visible en sitio" : "En revisión"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {[reference.role, reference.company]
                        .filter(Boolean)
                        .join(" · ") || "Sin empresa o rol"}
                    </p>
                    {reference.location ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {reference.location}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`${reference.id}-star-${index}`}
                      size={14}
                      className={
                        index < reference.rating ? "fill-current" : "text-slate-200"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                “{reference.message}”
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
                <div className="text-xs text-muted-foreground">
                  Creada el {formatReferenceDate(reference.createdAt)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleStatusChange(reference)}
                    disabled={updatingReferenceId === reference.id}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-wait disabled:opacity-60"
                  >
                    {updatingReferenceId === reference.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Star size={14} />
                    )}
                    {reference.status === "active" ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(reference)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => !isDeleting && setPendingDelete(null)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-reference-title"
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl shadow-slate-900/20"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
                <div>
                  <h3
                    id="delete-reference-title"
                    className="text-xl font-display font-bold text-slate-950"
                  >
                    Eliminar referencia
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta acción la quitará del sitio y no se puede deshacer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => !isDeleting && setPendingDelete(null)}
                  disabled={isDeleting}
                  aria-label="Cerrar confirmación"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-white text-slate-600 transition hover:bg-muted/30 hover:text-slate-950 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm text-slate-700">
                  Se eliminará la referencia de{" "}
                  <span className="font-semibold text-slate-950">
                    {pendingDelete.name}
                  </span>
                  .
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-border/50 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  disabled={isDeleting}
                  className="rounded-2xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Eliminar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
