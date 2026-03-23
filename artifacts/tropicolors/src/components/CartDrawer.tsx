import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowRight,
  Package2,
  Truck,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  MapPinHouse,
  MapPinned,
  Building2,
  Landmark,
} from "lucide-react";
import { useCart, type CartItem } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { usePostalCodeLookup } from "@/hooks/use-postal-code-lookup";

function VaciarCarritoModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Vaciar el carrito</h3>
              <p className="mb-6 text-sm text-gray-500">
                Esta accion eliminara todos los productos de tu carrito. Estas seguro de continuar?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                  }}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Si, vaciar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function VaciarCarritoModalButton({
  clearCart,
  setIsCartOpen,
}: {
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    clearCart();
    setTimeout(() => {
      setIsCartOpen(false);
    }, 500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 py-2 text-sm text-red-500 transition-colors hover:text-red-700 hover:underline"
      >
        <Trash2 className="h-4 w-4" />
        Vaciar Carrito
      </button>
      <VaciarCarritoModal open={isOpen} onOpenChange={setIsOpen} onConfirm={handleConfirm} />
    </>
  );
}

const fakeCheckout = () => {
  return new Promise<{ success: boolean; orderId: string; sessionUrl: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        sessionUrl: "/?order_success=true&order=ORD-123456",
      });
    }, 1500);
  });
};

type CheckoutFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingNeighborhood: string;
  shippingMunicipality: string;
  shippingState: string;
};

type CheckoutFieldName = keyof CheckoutFormData;
type CheckoutFormErrors = Partial<Record<CheckoutFieldName, string>>;
type CheckoutValidationContext = {
  hasPostalCodeData: boolean;
  modeManual: boolean;
};

const initialCheckoutValues: CheckoutFormData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  shippingPostalCode: "",
  shippingNeighborhood: "",
  shippingMunicipality: "",
  shippingState: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCheckoutField(
  field: CheckoutFieldName,
  values: CheckoutFormData,
  context: CheckoutValidationContext,
): string | null {
  switch (field) {
    case "customerName":
      if (!values.customerName.trim()) return "Ingresa tu nombre.";
      if (values.customerName.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
      return null;
    case "customerEmail":
      if (!values.customerEmail.trim()) return "Ingresa tu correo electronico.";
      if (!emailRegex.test(values.customerEmail.trim())) return "Ingresa un correo electronico valido.";
      return null;
    case "customerPhone":
      if (!values.customerPhone.trim()) return "Ingresa tu telefono.";
      if (!/^\d+$/.test(values.customerPhone)) return "El telefono solo debe contener numeros.";
      if (values.customerPhone.length !== 10) return "El telefono debe tener exactamente 10 digitos.";
      return null;
    case "shippingAddress":
      if (!values.shippingAddress.trim()) return "Ingresa tu direccion.";
      if (values.shippingAddress.trim().length < 10) return "La direccion debe tener al menos 10 caracteres.";
      return null;
    case "shippingPostalCode":
      if (!values.shippingPostalCode.trim()) return "Ingresa tu codigo postal.";
      if (!/^\d+$/.test(values.shippingPostalCode)) return "El codigo postal solo debe contener numeros.";
      if (values.shippingPostalCode.length !== 5) return "El codigo postal debe tener exactamente 5 digitos.";
      return null;
    case "shippingNeighborhood":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingNeighborhood.trim()) return context.modeManual ? "Ingresa la colonia." : "Selecciona una colonia.";
      return null;
    case "shippingMunicipality":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingMunicipality.trim()) {
        return context.modeManual ? "Ingresa el municipio o alcaldia." : "No se pudo autocompletar el municipio.";
      }
      return null;
    case "shippingState":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingState.trim()) return context.modeManual ? "Ingresa el estado." : "No se pudo autocompletar el estado.";
      return null;
  }
}

function validateCheckoutForm(
  values: CheckoutFormData,
  context: CheckoutValidationContext,
): CheckoutFormErrors {
  const nextErrors: CheckoutFormErrors = {};

  (
    [
      "customerName",
      "customerEmail",
      "customerPhone",
      "shippingAddress",
      "shippingPostalCode",
      "shippingNeighborhood",
      "shippingMunicipality",
      "shippingState",
    ] as CheckoutFieldName[]
  ).forEach((field) => {
    const error = validateCheckoutField(field, values, context);
    if (error) {
      nextErrors[field] = error;
    }
  });

  return nextErrors;
}

function FieldShell({
  icon,
  children,
  hasError,
  isValid,
  disabled = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  hasError: boolean;
  isValid: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border bg-white/90 px-4 py-1 shadow-sm transition duration-200 ${
        hasError
          ? "border-red-500 ring-2 ring-red-100"
          : isValid
            ? "border-emerald-500 ring-2 ring-emerald-100"
            : "border-slate-200 hover:border-sky-200 hover:shadow-md focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100"
      } ${disabled ? "bg-slate-100/90" : ""}`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition ${
          hasError
            ? "bg-red-50 text-red-500"
            : isValid
              ? "bg-emerald-50 text-emerald-500"
              : "bg-sky-50 text-sky-600 group-focus-within:bg-sky-100"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function CheckoutModal({
  open,
  items,
  cartTotal,
  isProcessing,
  onSubmit,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  cartTotal: number;
  isProcessing: boolean;
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [formValues, setFormValues] = useState<CheckoutFormData>(initialCheckoutValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CheckoutFieldName, boolean>>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [modeManual, setModeManual] = useState(false);
  const [postalCodeWarning, setPostalCodeWarning] = useState<string | null>(null);
  const [colonias, setColonias] = useState<Array<{ name: string; type: string | null }>>([]);

  const postalCode = formValues.shippingPostalCode;
  const { data: postalCodeData, isLoading: isPostalCodeLoading, error: postalCodeError } =
    usePostalCodeLookup({ postalCode, enabled: open });

  const validationContext = useMemo<CheckoutValidationContext>(
    () => ({
      hasPostalCodeData: Boolean(postalCodeData && !postalCodeError && !modeManual),
      modeManual,
    }),
    [modeManual, postalCodeData, postalCodeError],
  );

  const nextFormErrors = useMemo(
    () => validateCheckoutForm(formValues, validationContext),
    [formValues, validationContext],
  );
  const hasBlockingErrors = Object.keys(nextFormErrors).length > 0;
  const isPostalCodeReady = validationContext.hasPostalCodeData;
  const shouldDisableLocationFields = (!isPostalCodeReady && !modeManual) || isPostalCodeLoading;

  const updateFieldError = (field: CheckoutFieldName, values: CheckoutFormData) => {
    const error = validateCheckoutField(field, values, validationContext);
    setErrors((currentErrors) => {
      if (!error && !currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      if (error) {
        nextErrors[field] = error;
      } else {
        delete nextErrors[field];
      }
      return nextErrors;
    });
  };

  const applyValidationVisibility = (values: CheckoutFormData) => {
    if (hasAttemptedSubmit) {
      setErrors(validateCheckoutForm(values, validationContext));
      return;
    }

    const visibleErrors: CheckoutFormErrors = {};
    (Object.keys(touched) as CheckoutFieldName[]).forEach((field) => {
      if (!touched[field]) return;
      const error = validateCheckoutField(field, values, validationContext);
      if (error) {
        visibleErrors[field] = error;
      }
    });
    setErrors(visibleErrors);
  };

  useEffect(() => {
    if (!open) {
      setFormValues(initialCheckoutValues);
      setErrors({});
      setTouched({});
      setHasAttemptedSubmit(false);
      setModeManual(false);
      setPostalCodeWarning(null);
      setColonias([]);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    setFormValues((currentValues) => {
      let nextValues = currentValues;

      if (!postalCode.trim()) {
        setModeManual(false);
        setPostalCodeWarning(null);
        setColonias([]);
        nextValues = {
          ...currentValues,
          shippingNeighborhood: "",
          shippingMunicipality: "",
          shippingState: "",
        };
      } else if (postalCode.length !== 5) {
        setModeManual(false);
        setPostalCodeWarning(null);
        setColonias([]);
        nextValues = {
          ...currentValues,
          shippingNeighborhood: "",
          shippingMunicipality: "",
          shippingState: "",
        };
      } else if (postalCodeError && !postalCodeData) {
        const notFound = postalCodeError === "No se encontro informacion para ese codigo postal.";
        setModeManual(notFound);
        setPostalCodeWarning(
          notFound ? "Codigo postal no encontrado. Ingresa los datos manualmente." : null,
        );
        setColonias([]);
        nextValues = notFound
          ? currentValues
          : {
              ...currentValues,
              shippingNeighborhood: "",
              shippingMunicipality: "",
              shippingState: "",
            };
      } else if (!postalCodeData) {
        setModeManual(false);
        setPostalCodeWarning(null);
        setColonias([]);
        nextValues = {
          ...currentValues,
          shippingNeighborhood: "",
          shippingMunicipality: "",
          shippingState: "",
        };
      } else {
        setModeManual(false);
        setPostalCodeWarning(null);
        setColonias(postalCodeData.neighborhoods);
        const neighborhoodExists = postalCodeData.neighborhoods.some(
          (neighborhood) => neighborhood.name === currentValues.shippingNeighborhood,
        );

        nextValues = {
          ...currentValues,
          shippingState: postalCodeData.state,
          shippingMunicipality: postalCodeData.municipality,
          shippingNeighborhood:
            postalCodeData.neighborhoods.length === 1
              ? postalCodeData.neighborhoods[0]?.name || ""
              : neighborhoodExists
                ? currentValues.shippingNeighborhood
                : "",
        };
      }

      const valuesDidChange =
        nextValues.shippingNeighborhood !== currentValues.shippingNeighborhood ||
        nextValues.shippingMunicipality !== currentValues.shippingMunicipality ||
        nextValues.shippingState !== currentValues.shippingState;

      if (valuesDidChange) {
        applyValidationVisibility(nextValues);
        return nextValues;
      }

      return currentValues;
    });
  }, [postalCode, postalCodeData, postalCodeError]);

  const handleFieldChange = (field: CheckoutFieldName, value: string) => {
    let nextValue = value;
    if (field === "customerPhone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }
    if (field === "shippingPostalCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 5);
    }

    const nextValues = {
      ...formValues,
      [field]: nextValue,
    };
    setFormValues(nextValues);

    if (field === "shippingPostalCode" && nextValue.length < 5) {
      nextValues.shippingNeighborhood = "";
      nextValues.shippingMunicipality = "";
      nextValues.shippingState = "";
      setModeManual(false);
      setPostalCodeWarning(null);
      setColonias([]);
      setFormValues({ ...nextValues });
    }

    if (touched[field] || hasAttemptedSubmit) {
      updateFieldError(field, nextValues);
      if (field === "shippingPostalCode" || field === "shippingNeighborhood") {
        applyValidationVisibility(nextValues);
      }
    }
  };

  const handleFieldBlur = (field: CheckoutFieldName) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));
    updateFieldError(field, formValues);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    const validationErrors = validateCheckoutForm(formValues, validationContext);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || isProcessing || isPostalCodeLoading) {
      return;
    }

    await onSubmit(formValues);
  };

  const isFieldValid = (field: CheckoutFieldName) => Boolean(touched[field] && !errors[field] && formValues[field].trim());
  const showNeighborhoodSelect = !modeManual && colonias.length > 1;
  const neighborhoodLockedByLookup = !modeManual && colonias.length === 1;
  const brandLogoSrc = `${import.meta.env.BASE_URL}logo-tropicolors.png`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]"
            >
              <div className="grid max-h-[88vh] grid-cols-1 overflow-hidden lg:grid-cols-[1.02fr_1.18fr]">
                <div className="relative overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),linear-gradient(160deg,#082f49_0%,#0f172a_38%,#111827_100%)] px-6 py-6 text-white sm:px-8">
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="absolute -left-10 bottom-20 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
                    <img
                      src={brandLogoSrc}
                      alt=""
                      className="absolute bottom-6 right-0 w-48 opacity-[0.06] saturate-0 brightness-200"
                    />
                  </div>

                  <div className="relative mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(34,211,238,0.22)]">
                          <img src={brandLogoSrc} alt="Tropicolors" className="h-8 w-auto object-contain" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Checkout</p>
                          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">Tropicolors</h3>
                        </div>
                      </div>
                      <div className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <Package2 className="h-5 w-5 text-cyan-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">Resumen del pedido</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-300">
                            Revisa tus productos antes de confirmar el envio.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="relative mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                    {[
                      { label: "Carrito", icon: ShoppingBag, active: true },
                      { label: "Envio", icon: Truck, active: true },
                      { label: "Confirmacion", icon: ShieldCheck, active: false },
                    ].map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={step.label}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                            step.active ? "bg-white/12 text-white" : "text-slate-400"
                          }`}
                        >
                          <StepIcon className="h-4 w-4" />
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/8 p-4 shadow-lg shadow-slate-950/10 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/10 hover:shadow-xl"
                      >
                        <div
                          className="h-14 w-14 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_10px_30px_rgba(15,23,42,0.25)]"
                          style={{ backgroundColor: item.hexCode || "#003F91" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{item.productName}</p>
                          <p className="mt-1 text-xs text-slate-300">{item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">x{item.quantity}</p>
                          <p className="mt-1 text-sm text-cyan-300">${item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Productos</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-base font-medium text-white">Total</span>
                      <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-200 bg-clip-text text-4xl font-black tracking-tight text-transparent">
                        ${cartTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f5f9ff_100%)] px-6 py-6 sm:px-8">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-200">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700/80">Envio</p>
                        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Datos de entrega</h3>
                      </div>
                    </div>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500">
                      Completa los datos para confirmar tu pedido con una experiencia rapida y segura.
                    </p>
                  </div>

                  <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FieldShell
                          icon={<UserRound className="h-4 w-4" />}
                          hasError={Boolean(errors.customerName)}
                          isValid={isFieldValid("customerName")}
                        >
                          <input
                            value={formValues.customerName}
                            onChange={(event) => handleFieldChange("customerName", event.target.value)}
                            onBlur={() => handleFieldBlur("customerName")}
                            placeholder="Nombre"
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
                      </div>

                      <div>
                        <FieldShell
                          icon={<Mail className="h-4 w-4" />}
                          hasError={Boolean(errors.customerEmail)}
                          isValid={isFieldValid("customerEmail")}
                        >
                          <input
                            value={formValues.customerEmail}
                            onChange={(event) => handleFieldChange("customerEmail", event.target.value)}
                            onBlur={() => handleFieldBlur("customerEmail")}
                            type="email"
                            placeholder="Email"
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>}
                      </div>

                      <div>
                        <FieldShell
                          icon={<Phone className="h-4 w-4" />}
                          hasError={Boolean(errors.customerPhone)}
                          isValid={isFieldValid("customerPhone")}
                        >
                          <input
                            value={formValues.customerPhone}
                            onChange={(event) => handleFieldChange("customerPhone", event.target.value)}
                            onBlur={() => handleFieldBlur("customerPhone")}
                            placeholder="Telefono"
                            inputMode="numeric"
                            maxLength={10}
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <FieldShell
                          icon={<MapPinHouse className="h-4 w-4" />}
                          hasError={Boolean(errors.shippingAddress)}
                          isValid={isFieldValid("shippingAddress")}
                        >
                          <input
                            value={formValues.shippingAddress}
                            onChange={(event) => handleFieldChange("shippingAddress", event.target.value)}
                            onBlur={() => handleFieldBlur("shippingAddress")}
                            placeholder="Direccion"
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        {errors.shippingAddress && <p className="mt-1 text-xs text-red-500">{errors.shippingAddress}</p>}
                      </div>

                      <div>
                        <FieldShell
                          icon={<MapPinned className="h-4 w-4" />}
                          hasError={Boolean(errors.shippingPostalCode)}
                          isValid={isFieldValid("shippingPostalCode")}
                        >
                          <input
                            value={formValues.shippingPostalCode}
                            onChange={(event) => handleFieldChange("shippingPostalCode", event.target.value)}
                            onBlur={() => handleFieldBlur("shippingPostalCode")}
                            placeholder="Codigo postal"
                            inputMode="numeric"
                            maxLength={5}
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        {postalCode.length > 0 && postalCode.length < 5 && (
                          <p className="mt-1 text-xs text-amber-600">Ingresa los 5 digitos del codigo postal.</p>
                        )}
                        {isPostalCodeLoading && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Consultando codigo postal...
                          </p>
                        )}
                        {postalCodeWarning && (
                          <p className="mt-1 text-xs text-amber-600">{postalCodeWarning}</p>
                        )}
                        {errors.shippingPostalCode && <p className="mt-1 text-xs text-red-500">{errors.shippingPostalCode}</p>}
                      </div>

                      <div>
                        {showNeighborhoodSelect ? (
                          <FieldShell
                            icon={<Building2 className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingNeighborhood)}
                            isValid={isFieldValid("shippingNeighborhood")}
                            disabled={shouldDisableLocationFields}
                          >
                            <select
                              value={formValues.shippingNeighborhood}
                              onChange={(event) => handleFieldChange("shippingNeighborhood", event.target.value)}
                              onBlur={() => handleFieldBlur("shippingNeighborhood")}
                              disabled={shouldDisableLocationFields}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none"
                            >
                              <option value="" disabled>
                                Selecciona una colonia
                              </option>
                              {colonias.map((neighborhood) => (
                                <option key={`${neighborhood.name}-${neighborhood.type || "na"}`} value={neighborhood.name}>
                                  {neighborhood.type ? `${neighborhood.name} (${neighborhood.type})` : neighborhood.name}
                                </option>
                              ))}
                            </select>
                          </FieldShell>
                        ) : (
                          <FieldShell
                            icon={<Building2 className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingNeighborhood)}
                            isValid={isFieldValid("shippingNeighborhood")}
                            disabled={shouldDisableLocationFields || neighborhoodLockedByLookup}
                          >
                            <input
                              value={formValues.shippingNeighborhood}
                              onChange={(event) => handleFieldChange("shippingNeighborhood", event.target.value)}
                              onBlur={() => handleFieldBlur("shippingNeighborhood")}
                              placeholder="Colonia"
                              disabled={shouldDisableLocationFields || neighborhoodLockedByLookup}
                              readOnly={neighborhoodLockedByLookup}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                        )}
                        {showNeighborhoodSelect && (
                          <p className="mt-1 text-xs text-slate-500">Se encontraron varias colonias para este codigo postal.</p>
                        )}
                        {modeManual && <p className="mt-1 text-xs text-amber-600">Completa la colonia manualmente.</p>}
                        {!postalCode && <p className="mt-1 text-xs text-slate-500">Ingresa un codigo postal para habilitar la colonia.</p>}
                        {errors.shippingNeighborhood && <p className="mt-1 text-xs text-red-500">{errors.shippingNeighborhood}</p>}
                      </div>

                      <div>
                        <FieldShell
                          icon={<Landmark className="h-4 w-4" />}
                          hasError={Boolean(errors.shippingMunicipality)}
                          isValid={isFieldValid("shippingMunicipality")}
                          disabled={!modeManual}
                        >
                          <input
                            value={formValues.shippingMunicipality}
                            onChange={(event) => handleFieldChange("shippingMunicipality", event.target.value)}
                            onBlur={() => handleFieldBlur("shippingMunicipality")}
                            placeholder="Municipio / Alcaldia"
                            disabled={!modeManual}
                            readOnly={!modeManual}
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        <p className="mt-1 text-xs text-slate-500">
                          {modeManual ? "Ingresa el municipio o alcaldia manualmente." : "Autocompletado por codigo postal."}
                        </p>
                        {errors.shippingMunicipality && <p className="mt-1 text-xs text-red-500">{errors.shippingMunicipality}</p>}
                      </div>

                      <div>
                        <FieldShell
                          icon={<Landmark className="h-4 w-4" />}
                          hasError={Boolean(errors.shippingState)}
                          isValid={isFieldValid("shippingState")}
                          disabled={!modeManual}
                        >
                          <input
                            value={formValues.shippingState}
                            onChange={(event) => handleFieldChange("shippingState", event.target.value)}
                            onBlur={() => handleFieldBlur("shippingState")}
                            placeholder="Estado"
                            disabled={!modeManual}
                            readOnly={!modeManual}
                            className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </FieldShell>
                        <p className="mt-1 text-xs text-slate-500">
                          {modeManual ? "Ingresa el estado manualmente." : "Autocompletado por codigo postal."}
                        </p>
                        {errors.shippingState && <p className="mt-1 text-xs text-red-500">{errors.shippingState}</p>}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing || isPostalCodeLoading || hasBlockingErrors}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-200/80 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {isProcessing ? "Procesando..." : "Confirmar pedido"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen && !isCheckoutModalOpen) {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, isCheckoutModalOpen, setIsCartOpen]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      const response = await fakeCheckout();

      toast({
        title: "Pedido realizado con exito",
        description: "Tu pedido ha sido procesado correctamente.",
      });

      console.log("Order ID:", response.orderId, data);
      clearCart();
      setIsCheckoutModalOpen(false);
      setIsCartOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col rounded-l-2xl bg-white shadow-2xl"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between rounded-tl-2xl border-b bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-bold text-gray-800">Tu Carrito</span>
                <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-gray-400">
                  <ShoppingBag className="mb-4 h-20 w-20 text-gray-300" />
                  <p className="mb-2 font-medium text-gray-500">Tu carrito esta vacio</p>
                  <p className="mb-6 text-sm text-gray-400">Agrega productos para comenzar</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors active:scale-95 hover:bg-blue-700"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
                  >
                    <div
                      className="h-16 w-16 flex-shrink-0 rounded-xl shadow-md"
                      style={{ backgroundColor: item.hexCode || "#003F91" }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-gray-800">{item.productName}</h4>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded transition-all hover:bg-white hover:shadow-sm"
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded transition-all hover:bg-white hover:shadow-sm"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">${item.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="rounded-lg p-1.5 text-red-500 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t bg-gray-50 p-4">
                <VaciarCarritoModalButton clearCart={clearCart} setIsCartOpen={setIsCartOpen} />
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${cartTotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Envio</span>
                  <span>Se confirma en el modal</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-blue-600">${cartTotal}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors active:scale-95 hover:bg-blue-700"
                >
                  Finalizar Pedido
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>

          <CheckoutModal
            open={isCheckoutModalOpen}
            items={items}
            cartTotal={cartTotal}
            isProcessing={isProcessing}
            onSubmit={onSubmit}
            onClose={() => setIsCheckoutModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
