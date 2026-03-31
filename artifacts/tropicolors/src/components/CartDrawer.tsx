import React, { useEffect, useMemo, useRef, useState } from "react";
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
  CreditCard,
  Store,
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
import { createOrder } from "@/services/order-service";
import { createNotification } from "@/services/notification-service";
import { enviarCorreoConfirmacion } from "@/lib/email-service";

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
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                Vaciar el carrito
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Esta accion eliminara todos los productos de tu carrito. Estas
                seguro de continuar?
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
      <VaciarCarritoModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleConfirm}
      />
    </>
  );
}

type CheckoutFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requiresInvoice: boolean;
  customerRfc: string;
  shippingAddress: string;
  shippingExteriorNumber: string;
  shippingInteriorNumber: string;
  shippingPostalCode: string;
  shippingNeighborhood: string;
  shippingMunicipality: string;
  shippingState: string;
};

type CheckoutFieldName = keyof CheckoutFormData;
type CheckoutFormErrors = Partial<Record<CheckoutFieldName, string>>;
type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = "card" | "oxxo" | "transfer";
type CardFormData = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
};
type CardFieldName = keyof CardFormData;
type CardFormErrors = Partial<Record<CardFieldName, string>>;
type CheckoutValidationContext = {
  hasPostalCodeData: boolean;
  modeManual: boolean;
};

type StripeCheckoutOrder = {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  requiresInvoice?: boolean;
  customerRfc?: string;
  total?: number;
  shippingAddress?: string;
  shippingExteriorNumber?: string;
  shippingInteriorNumber?: string;
  shippingNeighborhood?: string;
  shippingMunicipality?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  items?: Array<{
    productName?: string;
    price?: number;
    quantity?: number;
  }>;
};

type CheckoutSubmitResponse = {
  success: boolean;
  orderId: string;
  sessionUrl: string;
};

const initialCheckoutValues: CheckoutFormData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  requiresInvoice: false,
  customerRfc: "",
  shippingAddress: "",
  shippingExteriorNumber: "",
  shippingInteriorNumber: "",
  shippingPostalCode: "",
  shippingNeighborhood: "",
  shippingMunicipality: "",
  shippingState: "",
};

const initialCardValues: CardFormData = {
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rfcRegex = /^([A-Z&Ñ]{3}|[A-Z&Ñ]{4})\d{6}[A-Z0-9]{3}$/;

function buildShippingAddress(data: {
  shippingAddress?: string;
  shippingExteriorNumber?: string;
  shippingInteriorNumber?: string;
  shippingNeighborhood?: string;
  shippingMunicipality?: string;
  shippingState?: string;
  shippingPostalCode?: string;
}): string {
  return [
    data.shippingAddress || "",
    data.shippingExteriorNumber?.trim()
      ? `Ext. ${data.shippingExteriorNumber.trim()}`
      : "",
    data.shippingInteriorNumber?.trim()
      ? `Int. ${data.shippingInteriorNumber.trim()}`
      : "",
    data.shippingNeighborhood || "",
    data.shippingMunicipality || "",
    data.shippingState || "",
    data.shippingPostalCode ? `C.P. ${data.shippingPostalCode}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

function validateCheckoutField(
  field: CheckoutFieldName,
  values: CheckoutFormData,
  context: CheckoutValidationContext,
): string | null {
  switch (field) {
    case "customerName":
      if (!values.customerName.trim()) return "Ingresa tu nombre.";
      if (values.customerName.trim().length < 3)
        return "El nombre debe tener al menos 3 caracteres.";
      return null;
    case "customerEmail":
      if (!values.customerEmail.trim()) return "Ingresa tu correo electronico.";
      if (!emailRegex.test(values.customerEmail.trim()))
        return "Ingresa un correo electronico valido.";
      return null;
    case "customerPhone":
      if (!values.customerPhone.trim()) return "Ingresa tu telefono.";
      if (!/^\d+$/.test(values.customerPhone))
        return "El telefono solo debe contener numeros.";
      if (values.customerPhone.length !== 10)
        return "El telefono debe tener exactamente 10 digitos.";
      return null;
    case "customerRfc":
      if (!values.requiresInvoice) return null;
      if (!values.customerRfc.trim()) return "Ingresa tu RFC.";
      if (!rfcRegex.test(values.customerRfc.trim().toUpperCase()))
        return "Ingresa un RFC valido.";
      return null;
    case "shippingAddress":
      if (!values.shippingAddress.trim()) return "Ingresa tu direccion.";
      if (values.shippingAddress.trim().length < 10)
        return "La direccion debe tener al menos 10 caracteres.";
      return null;
    case "shippingExteriorNumber":
      if (!values.shippingExteriorNumber.trim())
        return "Ingresa el numero exterior.";
      return null;
    case "shippingInteriorNumber":
      return null;
    case "shippingPostalCode":
      if (!values.shippingPostalCode.trim()) return "Ingresa tu codigo postal.";
      if (!/^\d+$/.test(values.shippingPostalCode))
        return "El codigo postal solo debe contener numeros.";
      if (values.shippingPostalCode.length !== 5)
        return "El codigo postal debe tener exactamente 5 digitos.";
      return null;
    case "shippingNeighborhood":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingNeighborhood.trim())
        return context.modeManual
          ? "Ingresa la colonia."
          : "Selecciona una colonia.";
      return null;
    case "shippingMunicipality":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingMunicipality.trim()) {
        return context.modeManual
          ? "Ingresa el municipio o alcaldia."
          : "No se pudo autocompletar el municipio.";
      }
      return null;
    case "shippingState":
      if (!context.hasPostalCodeData && !context.modeManual) return null;
      if (!values.shippingState.trim())
        return context.modeManual
          ? "Ingresa el estado."
          : "No se pudo autocompletar el estado.";
      return null;
  }

  return null;
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
      "customerRfc",
      "shippingAddress",
      "shippingExteriorNumber",
      "shippingInteriorNumber",
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

function validateCardField(
  field: CardFieldName,
  values: CardFormData,
): string | null {
  switch (field) {
    case "cardNumber":
      if (!values.cardNumber.trim()) return "Ingresa el numero de tarjeta.";
      if (values.cardNumber.replace(/\s/g, "").length < 16)
        return "Ingresa una tarjeta valida de 16 digitos.";
      return null;
    case "expiryDate":
      if (!values.expiryDate.trim()) return "Ingresa la fecha MM/YY.";
      if (!/^\d{2}\/\d{2}$/.test(values.expiryDate))
        return "Usa el formato MM/YY.";
      return null;
    case "cvv":
      if (!values.cvv.trim()) return "Ingresa el CVV.";
      if (!/^\d{3,4}$/.test(values.cvv))
        return "El CVV debe tener 3 o 4 digitos.";
      return null;
    case "cardholderName":
      if (!values.cardholderName.trim())
        return "Ingresa el nombre del titular.";
      if (values.cardholderName.trim().length < 3)
        return "El nombre del titular debe tener al menos 3 caracteres.";
      return null;
  }
}

function validateCardForm(values: CardFormData): CardFormErrors {
  const nextErrors: CardFormErrors = {};

  (
    ["cardNumber", "expiryDate", "cvv", "cardholderName"] as CardFieldName[]
  ).forEach((field) => {
    const error = validateCardField(field, values);
    if (error) {
      nextErrors[field] = error;
    }
  });

  return nextErrors;
}

function CheckoutModal({
  open,
  items,
  cartTotal,
  isProcessing,
  onSubmit,
  onFinalize,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  cartTotal: number;
  isProcessing: boolean;
  onSubmit: (
    data: CheckoutFormData,
    paymentMethod: PaymentMethod,
    cardData: CardFormData | null,
  ) => Promise<CheckoutSubmitResponse>;
  onFinalize: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [formValues, setFormValues] = useState<CheckoutFormData>(
    initialCheckoutValues,
  );
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<CheckoutFieldName, boolean>>
  >({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [modeManual, setModeManual] = useState(false);
  const [postalCodeWarning, setPostalCodeWarning] = useState<string | null>(
    null,
  );
  const [colonias, setColonias] = useState<
    Array<{ name: string; type: string | null }>
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("card");
  const [cardValues, setCardValues] = useState<CardFormData>(initialCardValues);
  const [cardErrors, setCardErrors] = useState<CardFormErrors>({});
  const [cardTouched, setCardTouched] = useState<
    Partial<Record<CardFieldName, boolean>>
  >({});
  const [paymentResult, setPaymentResult] = useState<{
    orderId: string;
  } | null>(null);

  const postalCode = formValues.shippingPostalCode;
  const {
    data: postalCodeData,
    isLoading: isPostalCodeLoading,
    error: postalCodeError,
  } = usePostalCodeLookup({ postalCode, enabled: open });

  const validationContext = useMemo<CheckoutValidationContext>(
    () => ({
      hasPostalCodeData: Boolean(
        postalCodeData && !postalCodeError && !modeManual,
      ),
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
  const shouldDisableLocationFields =
    (!isPostalCodeReady && !modeManual) || isPostalCodeLoading;

  const updateFieldError = (
    field: CheckoutFieldName,
    values: CheckoutFormData,
  ) => {
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
      setStep(1);
      setFormValues(initialCheckoutValues);
      setErrors({});
      setTouched({});
      setHasAttemptedSubmit(false);
      setModeManual(false);
      setPostalCodeWarning(null);
      setColonias([]);
      setSelectedPaymentMethod("card");
      setCardValues(initialCardValues);
      setCardErrors({});
      setCardTouched({});
      setPaymentResult(null);
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
        const notFound =
          postalCodeError ===
          "No se encontro informacion para ese codigo postal.";
        setModeManual(notFound);
        setPostalCodeWarning(
          notFound
            ? "Codigo postal no encontrado. Ingresa los datos manualmente."
            : null,
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
          (neighborhood) =>
            neighborhood.name === currentValues.shippingNeighborhood,
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
        nextValues.shippingNeighborhood !==
          currentValues.shippingNeighborhood ||
        nextValues.shippingMunicipality !==
          currentValues.shippingMunicipality ||
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
    if (field === "customerRfc") {
      nextValue = value.toUpperCase().replace(/[^A-Z0-9&Ñ]/g, "").slice(0, 13);
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

    const validationErrors = validateCheckoutForm(
      formValues,
      validationContext,
    );
    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0 ||
      isProcessing ||
      isPostalCodeLoading
    ) {
      return;
    }

    setStep(2);
  };

  const isFieldValid = (field: CheckoutFieldName) => {
    if (field === "requiresInvoice") return false;

    const fieldValue = formValues[field];
    return (
      typeof fieldValue === "string" &&
      Boolean(touched[field] && !errors[field] && fieldValue.trim())
    );
  };
  const showNeighborhoodSelect = !modeManual && colonias.length > 1;
  const neighborhoodLockedByLookup = !modeManual && colonias.length === 1;
  const brandLogoSrc = `${import.meta.env.BASE_URL}logo-tropicolors.png`;
  const cardFormHasErrors =
    Object.keys(validateCardForm(cardValues)).length > 0;

  const handleCardFieldChange = (field: CardFieldName, value: string) => {
    let nextValue = value;

    if (field === "cardNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      nextValue = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    }
    if (field === "expiryDate") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      nextValue =
        digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (field === "cvv") {
      nextValue = value.replace(/\D/g, "").slice(0, 4);
    }

    const nextValues = {
      ...cardValues,
      [field]: nextValue,
    };
    setCardValues(nextValues);

    if (cardTouched[field]) {
      const error = validateCardField(field, nextValues);
      setCardErrors((currentErrors) => ({
        ...currentErrors,
        [field]: error || "",
      }));
    }
  };

  const handleCardFieldBlur = (field: CardFieldName) => {
    setCardTouched((currentTouched) => ({
      ...currentTouched,
      [field]: true,
    }));

    const error = validateCardField(field, cardValues);
    setCardErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      if (error) {
        nextErrors[field] = error;
      } else {
        delete nextErrors[field];
      }
      return nextErrors;
    });
  };

  const isCardFieldValid = (field: CardFieldName) =>
    Boolean(
      cardTouched[field] && !cardErrors[field] && cardValues[field].trim(),
    );

  const handlePaymentSubmit = async () => {
    if (selectedPaymentMethod === "card") {
      const validationErrors = validateCardForm(cardValues);
      setCardErrors(validationErrors);
      setCardTouched({
        cardNumber: true,
        expiryDate: true,
        cvv: true,
        cardholderName: true,
      });

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    const response = await onSubmit(
      formValues,
      selectedPaymentMethod,
      selectedPaymentMethod === "card" ? cardValues : null,
    );

    if (response.success) {
      if (response.sessionUrl) {
        window.location.assign(response.sessionUrl);
        return;
      }

      setPaymentResult({ orderId: response.orderId });
      setStep(3);
    }
  };

  const paymentOptions: Array<{
    id: PaymentMethod;
    title: string;
    description: string;
    icon: typeof CreditCard;
  }> = [
    {
      id: "card",
      title: "Tarjeta bancaria",
      description: "Visa, Mastercard y debito",
      icon: CreditCard,
    },
    {
      id: "oxxo",
      title: "Pago con OXXO",
      description: "Referencia generada al confirmar",
      icon: Store,
    },
    {
      id: "transfer",
      title: "Transferencia",
      description: "SPEI o deposito bancario",
      icon: Landmark,
    },
  ];

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
              onWheel={(e) => e.stopPropagation()}
              className="flex max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]"
            >
              <div className="grid min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-[1.02fr_1.18fr]">
                <div className="relative min-h-0 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),linear-gradient(160deg,#082f49_0%,#0f172a_38%,#111827_100%)] px-6 py-6 text-white sm:px-8">
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
                          <img
                            src={brandLogoSrc}
                            alt="Tropicolors"
                            className="h-8 w-auto object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                            Checkout
                          </p>
                          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
                            Tropicolors
                          </h3>
                        </div>
                      </div>
                      <div className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                        <Package2 className="h-5 w-5 text-cyan-300" />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Resumen del pedido
                          </p>
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
                      {
                        label: "Confirmacion",
                        icon: ShieldCheck,
                        active: false,
                      },
                    ].map((step) => {
                      const StepIcon = step.icon;
                      return (
                        <div
                          key={step.label}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                            step.active
                              ? "bg-white/12 text-white"
                              : "text-slate-400"
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
                          <p className="truncate text-sm font-semibold text-white">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            {item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            x{item.quantity}
                          </p>
                          <p className="mt-1 text-sm text-cyan-300">
                            ${item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Productos</span>
                      <span>
                        {items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-base font-medium text-white">
                        Total
                      </span>
                      <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-200 bg-clip-text text-4xl font-black tracking-tight text-transparent">
                        ${cartTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f5f9ff_100%)] px-6 py-6 sm:px-8">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-200">
                        {step === 1 ? (
                          <Truck className="h-5 w-5" />
                        ) : step === 2 ? (
                          <CreditCard className="h-5 w-5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700/80">
                          {step === 1
                            ? "Envio"
                            : step === 2
                              ? "Pago"
                              : "Confirmacion"}
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                          {step === 1
                            ? "Datos de entrega"
                            : step === 2
                              ? "Metodo de pago"
                              : "Pago realizado con exito"}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-500">
                      {step === 1
                        ? "Completa los datos para confirmar tu pedido con una experiencia rapida y segura."
                        : step === 2
                          ? "Selecciona como deseas pagar y revisa el total antes de finalizar."
                          : "Tu pedido quedo registrado y el pago fue simulado correctamente."}
                    </p>
                  </div>

                  {step === 1 ? (
                    <form
                      id="checkout-form"
                      onSubmit={handleFormSubmit}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <FieldShell
                            icon={<UserRound className="h-4 w-4" />}
                            hasError={Boolean(errors.customerName)}
                            isValid={isFieldValid("customerName")}
                          >
                            <input
                              value={formValues.customerName}
                              onChange={(event) =>
                                handleFieldChange(
                                  "customerName",
                                  event.target.value,
                                )
                              }
                              onBlur={() => handleFieldBlur("customerName")}
                              placeholder="Nombre"
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.customerName && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.customerName}
                            </p>
                          )}
                        </div>

                        <div>
                          <FieldShell
                            icon={<Mail className="h-4 w-4" />}
                            hasError={Boolean(errors.customerEmail)}
                            isValid={isFieldValid("customerEmail")}
                          >
                            <input
                              value={formValues.customerEmail}
                              onChange={(event) =>
                                handleFieldChange(
                                  "customerEmail",
                                  event.target.value,
                                )
                              }
                              onBlur={() => handleFieldBlur("customerEmail")}
                              type="email"
                              placeholder="Email"
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.customerEmail && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.customerEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <FieldShell
                            icon={<Phone className="h-4 w-4" />}
                            hasError={Boolean(errors.customerPhone)}
                            isValid={isFieldValid("customerPhone")}
                          >
                            <input
                              value={formValues.customerPhone}
                              onChange={(event) =>
                                handleFieldChange(
                                  "customerPhone",
                                  event.target.value,
                                )
                              }
                              onBlur={() => handleFieldBlur("customerPhone")}
                              placeholder="Telefono"
                              inputMode="numeric"
                              maxLength={10}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.customerPhone && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.customerPhone}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={formValues.requiresInvoice}
                              onChange={(event) => {
                                const checked = event.target.checked;
                                const nextValues = {
                                  ...formValues,
                                  requiresInvoice: checked,
                                  customerRfc: checked
                                    ? formValues.customerRfc
                                    : "",
                                };
                                setFormValues(nextValues);
                                applyValidationVisibility(nextValues);
                              }}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Necesito factura
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                               
                              </p>
                            </div>
                          </label>
                        </div>

                        {formValues.requiresInvoice && (
                          <div className="sm:col-span-2">
                            <FieldShell
                              icon={<Building2 className="h-4 w-4" />}
                              hasError={Boolean(errors.customerRfc)}
                              isValid={isFieldValid("customerRfc")}
                            >
                              <input
                                value={formValues.customerRfc}
                                onChange={(event) =>
                                  handleFieldChange(
                                    "customerRfc",
                                    event.target.value,
                                  )
                                }
                                onBlur={() => handleFieldBlur("customerRfc")}
                                placeholder="RFC para facturar"
                                className="w-full border-0 bg-transparent py-3 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400"
                              />
                            </FieldShell>
                            <p className="mt-1 text-xs text-slate-500">
                              Formato esperado: persona física o moral, por
                              ejemplo `XAXX010101000`.
                            </p>
                            {errors.customerRfc && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.customerRfc}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <FieldShell
                            icon={<MapPinHouse className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingAddress)}
                            isValid={isFieldValid("shippingAddress")}
                          >
                            <input
                              value={formValues.shippingAddress}
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingAddress",
                                  event.target.value,
                                )
                              }
                              onBlur={() => handleFieldBlur("shippingAddress")}
                              placeholder="Direccion"
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.shippingAddress && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingAddress}
                            </p>
                          )}
                        </div>

                        <div>
                          <FieldShell
                            icon={<Building2 className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingExteriorNumber)}
                            isValid={isFieldValid("shippingExteriorNumber")}
                          >
                            <input
                              value={formValues.shippingExteriorNumber}
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingExteriorNumber",
                                  event.target.value,
                                )
                              }
                              onBlur={() =>
                                handleFieldBlur("shippingExteriorNumber")
                              }
                              placeholder="Numero exterior"
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.shippingExteriorNumber && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingExteriorNumber}
                            </p>
                          )}
                        </div>

                        <div>
                          <FieldShell
                            icon={<Building2 className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingInteriorNumber)}
                            isValid={isFieldValid("shippingInteriorNumber")}
                          >
                            <input
                              value={formValues.shippingInteriorNumber}
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingInteriorNumber",
                                  event.target.value,
                                )
                              }
                              onBlur={() =>
                                handleFieldBlur("shippingInteriorNumber")
                              }
                              placeholder="Numero interior (opcional)"
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {errors.shippingInteriorNumber && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingInteriorNumber}
                            </p>
                          )}
                        </div>

                        <div>
                          <FieldShell
                            icon={<MapPinned className="h-4 w-4" />}
                            hasError={Boolean(errors.shippingPostalCode)}
                            isValid={isFieldValid("shippingPostalCode")}
                          >
                            <input
                              value={formValues.shippingPostalCode}
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingPostalCode",
                                  event.target.value,
                                )
                              }
                              onBlur={() =>
                                handleFieldBlur("shippingPostalCode")
                              }
                              placeholder="Codigo postal"
                              inputMode="numeric"
                              maxLength={5}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          {postalCode.length > 0 && postalCode.length < 5 && (
                            <p className="mt-1 text-xs text-amber-600">
                              Ingresa los 5 digitos del codigo postal.
                            </p>
                          )}
                          {isPostalCodeLoading && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Consultando codigo postal...
                            </p>
                          )}
                          {postalCodeWarning && (
                            <p className="mt-1 text-xs text-amber-600">
                              {postalCodeWarning}
                            </p>
                          )}
                          {errors.shippingPostalCode && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingPostalCode}
                            </p>
                          )}
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
                                onChange={(event) =>
                                  handleFieldChange(
                                    "shippingNeighborhood",
                                    event.target.value,
                                  )
                                }
                                onBlur={() =>
                                  handleFieldBlur("shippingNeighborhood")
                                }
                                disabled={shouldDisableLocationFields}
                                className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none"
                              >
                                <option value="" disabled>
                                  Selecciona una colonia
                                </option>
                                {colonias.map((neighborhood) => (
                                  <option
                                    key={`${neighborhood.name}-${neighborhood.type || "na"}`}
                                    value={neighborhood.name}
                                  >
                                    {neighborhood.type
                                      ? `${neighborhood.name} (${neighborhood.type})`
                                      : neighborhood.name}
                                  </option>
                                ))}
                              </select>
                            </FieldShell>
                          ) : (
                            <FieldShell
                              icon={<Building2 className="h-4 w-4" />}
                              hasError={Boolean(errors.shippingNeighborhood)}
                              isValid={isFieldValid("shippingNeighborhood")}
                              disabled={
                                shouldDisableLocationFields ||
                                neighborhoodLockedByLookup
                              }
                            >
                              <input
                                value={formValues.shippingNeighborhood}
                                onChange={(event) =>
                                  handleFieldChange(
                                    "shippingNeighborhood",
                                    event.target.value,
                                  )
                                }
                                onBlur={() =>
                                  handleFieldBlur("shippingNeighborhood")
                                }
                                placeholder="Colonia"
                                disabled={
                                  shouldDisableLocationFields ||
                                  neighborhoodLockedByLookup
                                }
                                readOnly={neighborhoodLockedByLookup}
                                className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                              />
                            </FieldShell>
                          )}
                          {showNeighborhoodSelect && (
                            <p className="mt-1 text-xs text-slate-500">
                              Se encontraron varias colonias para este codigo
                              postal.
                            </p>
                          )}
                          {modeManual && (
                            <p className="mt-1 text-xs text-amber-600">
                              Completa la colonia manualmente.
                            </p>
                          )}
                          {!postalCode && (
                            <p className="mt-1 text-xs text-slate-500">
                              Ingresa un codigo postal para habilitar la
                              colonia.
                            </p>
                          )}
                          {errors.shippingNeighborhood && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingNeighborhood}
                            </p>
                          )}
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
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingMunicipality",
                                  event.target.value,
                                )
                              }
                              onBlur={() =>
                                handleFieldBlur("shippingMunicipality")
                              }
                              placeholder="Municipio / Alcaldia"
                              disabled={!modeManual}
                              readOnly={!modeManual}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          <p className="mt-1 text-xs text-slate-500">
                            {modeManual
                              ? "Ingresa el municipio o alcaldia manualmente."
                              : "Autocompletado por codigo postal."}
                          </p>
                          {errors.shippingMunicipality && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingMunicipality}
                            </p>
                          )}
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
                              onChange={(event) =>
                                handleFieldChange(
                                  "shippingState",
                                  event.target.value,
                                )
                              }
                              onBlur={() => handleFieldBlur("shippingState")}
                              placeholder="Estado"
                              disabled={!modeManual}
                              readOnly={!modeManual}
                              className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </FieldShell>
                          <p className="mt-1 text-xs text-slate-500">
                            {modeManual
                              ? "Ingresa el estado manualmente."
                              : "Autocompletado por codigo postal."}
                          </p>
                          {errors.shippingState && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.shippingState}
                            </p>
                          )}
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
                          disabled={
                            isProcessing ||
                            isPostalCodeLoading ||
                            hasBlockingErrors
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-200/80 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          {isProcessing ? "Procesando..." : "Confirmar pedido"}
                        </button>
                      </div>
                    </form>
                  ) : step === 2 ? (
                    <div className="space-y-6">
                      <div className="grid gap-3">
                        {paymentOptions.map((option) => {
                          const OptionIcon = option.icon;
                          const isSelected =
                            selectedPaymentMethod === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setSelectedPaymentMethod(option.id)
                              }
                              className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition duration-200 ${
                                isSelected
                                  ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100"
                                  : "border-slate-200 bg-white/90 hover:border-sky-200 hover:shadow-md"
                              }`}
                            >
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                  isSelected
                                    ? "bg-sky-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <OptionIcon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {option.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {option.description}
                                </p>
                              </div>
                              <div
                                className={`h-4 w-4 rounded-full border-2 ${
                                  isSelected
                                    ? "border-sky-500 bg-sky-500"
                                    : "border-slate-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {selectedPaymentMethod === "card" ? (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-900">
                              Datos de la tarjeta
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Vista simulada tipo Stripe. No se procesan pagos
                              reales.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <FieldShell
                                icon={<CreditCard className="h-4 w-4" />}
                                hasError={Boolean(cardErrors.cardNumber)}
                                isValid={isCardFieldValid("cardNumber")}
                              >
                                <input
                                  value={cardValues.cardNumber}
                                  onChange={(event) =>
                                    handleCardFieldChange(
                                      "cardNumber",
                                      event.target.value,
                                    )
                                  }
                                  onBlur={() =>
                                    handleCardFieldBlur("cardNumber")
                                  }
                                  placeholder="Numero de tarjeta"
                                  inputMode="numeric"
                                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                              </FieldShell>
                              {cardErrors.cardNumber && (
                                <p className="mt-1 text-xs text-red-500">
                                  {cardErrors.cardNumber}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <FieldShell
                                  icon={<Package2 className="h-4 w-4" />}
                                  hasError={Boolean(cardErrors.expiryDate)}
                                  isValid={isCardFieldValid("expiryDate")}
                                >
                                  <input
                                    value={cardValues.expiryDate}
                                    onChange={(event) =>
                                      handleCardFieldChange(
                                        "expiryDate",
                                        event.target.value,
                                      )
                                    }
                                    onBlur={() =>
                                      handleCardFieldBlur("expiryDate")
                                    }
                                    placeholder="MM/YY"
                                    inputMode="numeric"
                                    className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                  />
                                </FieldShell>
                                {cardErrors.expiryDate && (
                                  <p className="mt-1 text-xs text-red-500">
                                    {cardErrors.expiryDate}
                                  </p>
                                )}
                              </div>

                              <div>
                                <FieldShell
                                  icon={<ShieldCheck className="h-4 w-4" />}
                                  hasError={Boolean(cardErrors.cvv)}
                                  isValid={isCardFieldValid("cvv")}
                                >
                                  <input
                                    value={cardValues.cvv}
                                    onChange={(event) =>
                                      handleCardFieldChange(
                                        "cvv",
                                        event.target.value,
                                      )
                                    }
                                    onBlur={() => handleCardFieldBlur("cvv")}
                                    placeholder="CVV"
                                    inputMode="numeric"
                                    className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                  />
                                </FieldShell>
                                {cardErrors.cvv && (
                                  <p className="mt-1 text-xs text-red-500">
                                    {cardErrors.cvv}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <FieldShell
                                icon={<UserRound className="h-4 w-4" />}
                                hasError={Boolean(cardErrors.cardholderName)}
                                isValid={isCardFieldValid("cardholderName")}
                              >
                                <input
                                  value={cardValues.cardholderName}
                                  onChange={(event) =>
                                    handleCardFieldChange(
                                      "cardholderName",
                                      event.target.value,
                                    )
                                  }
                                  onBlur={() =>
                                    handleCardFieldBlur("cardholderName")
                                  }
                                  placeholder="Nombre del titular"
                                  className="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                              </FieldShell>
                              {cardErrors.cardholderName && (
                                <p className="mt-1 text-xs text-red-500">
                                  {cardErrors.cardholderName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedPaymentMethod === "oxxo"
                              ? "Pago en OXXO"
                              : "Transferencia bancaria"}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            {selectedPaymentMethod === "oxxo"
                              ? "Generaremos una referencia simulada para pago en tienda al continuar."
                              : "Te mostraremos una referencia simulada para transferencia al continuar."}
                          </p>
                        </div>
                      )}

                      <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>Total a pagar</span>
                          <span className="text-3xl font-black tracking-tight text-sky-700">
                            ${cartTotal}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Regresar
                        </button>
                        <button
                          type="button"
                          onClick={handlePaymentSubmit}
                          disabled={
                            isProcessing ||
                            (selectedPaymentMethod === "card" &&
                              cardFormHasErrors &&
                              Object.keys(cardTouched).length > 0)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-200/80 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {isProcessing ? "Procesando pago..." : "Pagar ahora"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-white/80 p-8 text-center shadow-sm">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100">
                        <ShieldCheck className="h-10 w-10" />
                      </div>
                      <h4 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                        Pago realizado con exito
                      </h4>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                        Tu compra fue simulada correctamente. Ya puedes cerrar
                        este paso y volver al catalogo.
                      </p>
                      {paymentResult?.orderId ? (
                        <p className="mt-4 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-600">
                          {paymentResult.orderId}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={onFinalize}
                        className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-200/80"
                      >
                        Finalizar
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
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
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const stripeReturnHandledRef = useRef<string | null>(null);

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

  useEffect(() => {
    const cleanupCheckoutParams = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("order_success");
      url.searchParams.delete("order_cancelled");
      url.searchParams.delete("order");
      url.searchParams.delete("order_id");
      url.searchParams.delete("session_id");
      const nextSearch = url.searchParams.toString();
      const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
      window.history.replaceState({}, document.title, nextUrl);
    };

    const params = new URLSearchParams(window.location.search);

    if (params.get("order_cancelled") === "true") {
      cleanupCheckoutParams();
      toast({
        title: "Pago cancelado",
        description: "El checkout de Stripe fue cancelado.",
        variant: "destructive",
      });
      return;
    }

    const sessionId = params.get("session_id");
    const orderId = params.get("order_id");
    const isOrderSuccess = params.get("order_success") === "true";

    if (!isOrderSuccess || !sessionId || !orderId) {
      return;
    }

    const requestKey = `${sessionId}:${orderId}`;
    if (stripeReturnHandledRef.current === requestKey) {
      return;
    }
    stripeReturnHandledRef.current = requestKey;

    let cancelled = false;

    const confirmStripeCheckout = async () => {
      setIsProcessing(true);

      try {
        const response = await fetch(
          `/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}&order_id=${encodeURIComponent(orderId)}`,
        );
        const payload = (await response.json()) as {
          error?: string;
          order?: StripeCheckoutOrder;
        };

        if (!response.ok || !payload.order) {
          throw new Error(
            payload.error || "No se pudo confirmar el pago en Stripe.",
          );
        }

        const order = payload.order;
        const notificationKey = `stripe-notification:${order.id}`;
        const emailKey = `stripe-email:${order.id}`;

        if (!sessionStorage.getItem(notificationKey)) {
          await createNotification({
            orderId: order.id,
            customerName: order.customerName || "Cliente",
            total: Number(order.total || 0),
            requiresInvoice: Boolean(order.requiresInvoice),
            customerRfc: order.customerRfc || "",
          });
          sessionStorage.setItem(notificationKey, "1");
        }

        if (
          order.customerName &&
          order.customerEmail &&
          !sessionStorage.getItem(emailKey)
        ) {
          const emailResult = await enviarCorreoConfirmacion({
            nombre: order.customerName,
            email: order.customerEmail,
            telefono: order.customerPhone || "",
            direccion: buildShippingAddress(order),
            numeroExterior: order.shippingExteriorNumber || "",
            numeroInterior: order.shippingInteriorNumber || "",
            total: Number(order.total || 0),
            numeroPedido: order.orderNumber || order.id,
            productos: (order.items || []).map((item) => ({
              nombre: item.productName || "Producto",
              cantidad: item.quantity || 1,
              precio: item.price || 0,
            })),
          });

          if (emailResult.success) {
            sessionStorage.setItem(emailKey, "1");
          } else {
            console.error(
              "[CartDrawer] No se pudo enviar el correo de confirmacion de Stripe:",
              emailResult.error,
            );
            toast({
              title: "Pago confirmado sin correo",
              description:
                emailResult.error ||
                "El pedido se confirmo, pero no se pudo enviar el correo.",
              variant: "destructive",
            });
          }
        }

        if (cancelled) return;

        clearCart();
        setIsCheckoutModalOpen(false);
        setIsCartOpen(false);
        toast({
          title: "Pago confirmado",
          description: `Tu pedido ${order.orderNumber || order.id} fue confirmado correctamente.`,
        });
      } catch (error) {
        if (cancelled) return;

        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "No se pudo confirmar el pago en Firestore.",
          variant: "destructive",
        });
      } finally {
        if (cancelled) return;
        setIsProcessing(false);
        cleanupCheckoutParams();
      }
    };

    void confirmStripeCheckout();

    return () => {
      cancelled = true;
    };
  }, [clearCart, setIsCartOpen, toast]);

  const onSubmit = async (
    data: CheckoutFormData,
    paymentMethod: PaymentMethod,
    cardData: CardFormData | null,
  ) => {
    if (items.length === 0) {
      throw new Error("No hay productos en el carrito.");
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "card") {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            requiresInvoice: data.requiresInvoice,
            customerRfc: data.requiresInvoice ? data.customerRfc.trim() : "",
            shippingAddress: data.shippingAddress,
            shippingExteriorNumber: data.shippingExteriorNumber.trim(),
            shippingInteriorNumber: data.shippingInteriorNumber.trim(),
            shippingPostalCode: data.shippingPostalCode,
            shippingNeighborhood: data.shippingNeighborhood,
            shippingMunicipality: data.shippingMunicipality,
            shippingState: data.shippingState,
            items: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              unitPrice: item.price,
              price: item.price,
              quantity: item.quantity,
              hexCode: item.hexCode,
              imageUrl: item.imageUrl,
            })),
          }),
        });

        const text = await response.text();
        let payload: {
          error?: string;
          orderId?: string;
          orderNumber?: string;
          sessionUrl?: string | null;
        } = {};

        try {
          payload = text ? (JSON.parse(text) as typeof payload) : {};
        } catch {
          throw new Error(
            `Respuesta inesperada del servidor (${response.status}).`,
          );
        }

        if (!response.ok || !payload.sessionUrl || !payload.orderId) {
          throw new Error(
            payload.error || "No se pudo crear la sesion de Stripe.",
          );
        }

        return {
          success: true,
          orderId: payload.orderNumber || payload.orderId,
          sessionUrl: payload.sessionUrl,
        } satisfies CheckoutSubmitResponse;
      }

      const orderDocumentId = await createOrder({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        requiresInvoice: data.requiresInvoice,
        customerRfc: data.requiresInvoice ? data.customerRfc.trim() : "",
        shippingAddress: data.shippingAddress,
        shippingExteriorNumber: data.shippingExteriorNumber.trim(),
        shippingInteriorNumber: data.shippingInteriorNumber.trim(),
        shippingPostalCode: data.shippingPostalCode,
        shippingNeighborhood: data.shippingNeighborhood,
        shippingMunicipality: data.shippingMunicipality,
        shippingState: data.shippingState,
        paymentMethod,
        paymentStatus: "paid",
        orderStatus: "pending",
        total: cartTotal,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          hexCode: item.hexCode,
          imageUrl: item.imageUrl,
        })),
        paymentDetails: null,
      });

      // Crear notificación para el admin
      try {
        await createNotification({
          orderId: orderDocumentId,
          customerName: data.customerName,
          total: cartTotal,
          requiresInvoice: data.requiresInvoice,
          customerRfc: data.requiresInvoice ? data.customerRfc.trim() : "",
        });
      } catch (notifError) {
        console.error("[CartDrawer] Error al crear notificación:", notifError);
      }

      // Enviar correo de confirmación del pedido
      try {
        const direccionCompleta = buildShippingAddress(data);
        const numeroPedido = `ORD-${orderDocumentId.slice(0, 8).toUpperCase()}`;
        const emailResult = await enviarCorreoConfirmacion({
          nombre: data.customerName,
          email: data.customerEmail,
          telefono: data.customerPhone,
          direccion: direccionCompleta,
          numeroExterior: data.shippingExteriorNumber.trim(),
          numeroInterior: data.shippingInteriorNumber.trim(),
          total: cartTotal,
          numeroPedido: numeroPedido,
          productos: items.map((item) => ({
            nombre: item.productName,
            cantidad: item.quantity,
            precio: item.price,
          })),
        });

        if (emailResult.success) {
          console.log("[CartDrawer] Correo de confirmacion enviado exitosamente");
        } else {
          console.error(
            "[CartDrawer] No se pudo enviar el correo de confirmacion:",
            emailResult.error,
          );
          toast({
            title: "Pedido guardado sin correo",
            description:
              emailResult.error ||
              "El pedido se guardo, pero el correo no pudo enviarse.",
            variant: "destructive",
          });
        }
      } catch (emailError) {
        console.error(
          "[CartDrawer] Error al enviar correo de confirmación:",
          emailError,
        );
      }

      return {
        success: true,
        orderId: `ORD-${orderDocumentId.slice(0, 8).toUpperCase()}`,
        sessionUrl: "",
      } satisfies CheckoutSubmitResponse;
    } catch (error) {
      toast({
        title: "Error",
        description:
          paymentMethod === "card"
            ? "No se pudo iniciar el checkout de Stripe. Intenta nuevamente."
            : "No se pudo guardar el pedido en Firebase. Intenta nuevamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizeCheckout = () => {
    clearCart();
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    toast({
      title: "Pedido realizado con exito",
      description: "Tu pedido ha sido procesado correctamente.",
    });
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
                <span className="text-lg font-bold text-gray-800">
                  Tu Carrito
                </span>
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
                  <p className="mb-2 font-medium text-gray-500">
                    Tu carrito esta vacio
                  </p>
                  <p className="mb-6 text-sm text-gray-400">
                    Agrega productos para comenzar
                  </p>
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
                      <h4 className="truncate text-sm font-semibold text-gray-800">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded transition-all hover:bg-white hover:shadow-sm"
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded transition-all hover:bg-white hover:shadow-sm"
                          >
                            <Plus className="h-3 w-3 text-gray-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            ${item.price * item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              removeFromCart(item.productId, item.size)
                            }
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
                <VaciarCarritoModalButton
                  clearCart={clearCart}
                  setIsCartOpen={setIsCartOpen}
                />
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
                  <span className="text-xl font-bold text-blue-600">
                    ${cartTotal}
                  </span>
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
            onFinalize={handleFinalizeCheckout}
            onClose={() => setIsCheckoutModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
