import React, { useMemo, useState } from "react";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

type StripeEmbeddedPaymentProps = {
  publishableKey: string;
  clientSecret: string;
  amount: number;
  orderId: string;
  onPaymentConfirmed: (sessionId: string, orderId: string) => Promise<void>;
};

type InnerPaymentFormProps = {
  amount: number;
  orderId: string;
  onPaymentConfirmed: (sessionId: string, orderId: string) => Promise<void>;
};

function InnerPaymentForm({
  amount,
  orderId,
  onPaymentConfirmed,
}: InnerPaymentFormProps) {
  const checkoutState = useCheckout();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (checkoutState.type === "loading" || isSubmitting) {
      return;
    }

    if (checkoutState.type === "error") {
      setSubmitError(checkoutState.error.message);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await checkoutState.checkout.confirm({
        redirect: "if_required",
      });

      if (result.type === "error") {
        setSubmitError(result.error.message);
        return;
      }

      await onPaymentConfirmed(result.session.id, orderId);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el pago con Stripe.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutState.type === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50/80">
        <div className="text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
          Cargando formulario seguro de Stripe...
        </div>
      </div>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {checkoutState.error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
        <PaymentElement />
      </div>

      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-700">
        Stripe captura los datos de la tarjeta. Tu sistema solo guarda el tipo
        de pago y el estado del pedido.
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-200/80 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {isSubmitting ? "Procesando pago..." : `Pagar $${amount}`}
      </button>
    </div>
  );
}

export const StripeEmbeddedPayment = React.memo(function StripeEmbeddedPayment({
  publishableKey,
  clientSecret,
  amount,
  orderId,
  onPaymentConfirmed,
}: StripeEmbeddedPaymentProps) {
  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-600">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Pago seguro con Stripe</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            El formulario real de Stripe se muestra aqui mismo. No se guardan
            datos de tarjeta en tu base.
          </p>
        </div>
      </div>

      <CheckoutElementsProvider
        stripe={stripePromise}
        options={{
          clientSecret,
          elementsOptions: {
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#0284c7",
                colorBackground: "#ffffff",
                colorText: "#0f172a",
                colorDanger: "#dc2626",
                borderRadius: "16px",
              },
            },
          },
        }}
      >
        <InnerPaymentForm
          amount={amount}
          orderId={orderId}
          onPaymentConfirmed={onPaymentConfirmed}
        />
      </CheckoutElementsProvider>
    </div>
  );
});
