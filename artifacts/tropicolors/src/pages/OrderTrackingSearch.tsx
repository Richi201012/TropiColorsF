import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { doc, getDoc } from "firebase/firestore";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  PackageSearch,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  ORDER_TRACKING_COLLECTION,
  ORDER_TRACKING_LOOKUP_COLLECTION,
  normalizeOrderNumberForLookup,
} from "@/lib/order-tracking";
import { isFirestorePermissionDenied } from "@/lib/firebase-errors";

type TrackingLookup = {
  trackingToken?: string;
  orderNumber?: string;
};

export default function OrderTrackingSearch() {
  const [, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const lookupId = normalizeOrderNumberForLookup(orderNumber);
    if (!lookupId) {
      setError("Ingresa tu numero de pedido.");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const lookupRef = doc(db, ORDER_TRACKING_LOOKUP_COLLECTION, lookupId);
      const lookupSnapshot = await getDoc(lookupRef);

      if (!lookupSnapshot.exists()) {
        setError("No encontramos un seguimiento con ese numero de pedido.");
        return;
      }

      const lookupData = lookupSnapshot.data() as TrackingLookup;
      if (!lookupData.trackingToken) {
        setError("Este pedido aun no tiene seguimiento disponible.");
        return;
      }

      const trackingSnapshot = await getDoc(
        doc(db, ORDER_TRACKING_COLLECTION, lookupData.trackingToken),
      );

      if (!trackingSnapshot.exists()) {
        setError("Este pedido no existe o fue eliminado.");
        return;
      }

      setLocation(`/pedido/${lookupData.trackingToken}`);
    } catch (searchError) {
      console.error(
        "[OrderTrackingSearch] Error al buscar pedido:",
        searchError,
      );
      setError(
        isFirestorePermissionDenied(searchError)
          ? "No se pudo consultar el seguimiento por permisos. Publica las reglas de Firestore actualizadas y vuelve a intentar."
          : "No pudimos buscar el pedido. Intenta nuevamente.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_44%,#f1fbfd_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            Ver el sitio
          </Link>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[linear-gradient(135deg,#003f91_0%,#006fb7_52%,#00a8b5_100%)] px-6 py-10 text-white sm:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                <PackageSearch className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                  Seguimiento de pedido
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Consulta el estado de tu compra
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50">
                  Escribe el numero de pedido que recibiste al finalizar tu
                  compra, por ejemplo ORD-KAYONLJL. El estado se actualiza
                  automaticamente cuando Tropicolors modifica el pedido.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="order-number"
                  className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400"
                >
                  Numero de pedido
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="order-number"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                    placeholder="Ej. ORD-12345678 o TC-M..."
                    className="min-h-[54px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-sky-700 px-6 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(3,105,161,0.22)] transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isSearching ? "Buscando..." : "Ver seguimiento"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </form>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoBox label="Paso 1" value="Ingresa tu numero de pedido." />
              <InfoBox label="Paso 2" value="Abrimos tu seguimiento privado." />
              <InfoBox label="Paso 3" value="La pantalla se actualiza sola." />
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                Si no tienes tu numero de pedido
              </p>
              <p className="mt-1 leading-relaxed">
                Revisa la pantalla de confirmacion de compra o contactanos por
                WhatsApp para ayudarte a localizarlo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
        {value}
      </p>
    </div>
  );
}
