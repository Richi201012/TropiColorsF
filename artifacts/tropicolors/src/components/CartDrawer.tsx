import React, { useEffect, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ShoppingBag, Plus, Minus, Trash2, Loader2, ArrowRight } from "lucide-react";
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

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre es requerido"),
  customerEmail: z.string().email("Correo electronico invalido"),
  customerPhone: z.string().min(10, "Telefono es requerido"),
  shippingAddress: z.string().min(5, "Direccion es requerida"),
  shippingPostalCode: z.string().regex(/^\d{5}$/, "El codigo postal debe tener 5 digitos"),
  shippingNeighborhood: z.string().min(2, "Colonia es requerida"),
  shippingMunicipality: z.string().min(2, "Municipio es requerido"),
  shippingState: z.string().min(2, "Estado es requerido"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function CheckoutModal({
  open,
  items,
  cartTotal,
  isProcessing,
  register,
  handleSubmit,
  watch,
  setValue,
  errors,
  onSubmit,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  cartTotal: number;
  isProcessing: boolean;
  register: ReturnType<typeof useForm<CheckoutFormData>>["register"];
  handleSubmit: ReturnType<typeof useForm<CheckoutFormData>>["handleSubmit"];
  watch: ReturnType<typeof useForm<CheckoutFormData>>["watch"];
  setValue: ReturnType<typeof useForm<CheckoutFormData>>["setValue"];
  errors: ReturnType<typeof useForm<CheckoutFormData>>["formState"]["errors"];
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  onClose: () => void;
}) {
  const postalCode = watch("shippingPostalCode") || "";
  const neighborhoodValue = watch("shippingNeighborhood") || "";
  const { data: postalCodeData, isLoading: isPostalCodeLoading, error: postalCodeError } =
    usePostalCodeLookup({ postalCode, enabled: open });

  useEffect(() => {
    const normalizedPostalCode = postalCode.replace(/\D/g, "").slice(0, 5);

    if (normalizedPostalCode !== postalCode) {
      setValue("shippingPostalCode", normalizedPostalCode, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [postalCode, setValue]);

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
    if (!postalCodeData) {
      return;
    }

    setValue("shippingState", postalCodeData.state, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("shippingMunicipality", postalCodeData.municipality, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (postalCodeData.neighborhoods.length === 1) {
      setValue("shippingNeighborhood", postalCodeData.neighborhoods[0]?.name || "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const neighborhoodExists = postalCodeData.neighborhoods.some(
      (neighborhood) => neighborhood.name === neighborhoodValue,
    );

    if (!neighborhoodExists) {
      setValue("shippingNeighborhood", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [neighborhoodValue, postalCodeData, setValue]);

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
                <div className="overflow-y-auto bg-slate-950 px-6 py-6 text-white sm:px-8">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Checkout</p>
                      <h3 className="mt-2 text-2xl font-semibold">Resumen del pedido</h3>
                      <p className="mt-2 text-sm text-slate-300">Revisa tus productos antes de confirmar el envio.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-white/15 p-2 text-slate-200 transition-colors hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div
                          className="h-14 w-14 rounded-2xl shadow-inner"
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

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Productos</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-base font-medium text-white">Total</span>
                      <span className="text-3xl font-semibold text-cyan-300">${cartTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_38%,#f8fafc_100%)] px-6 py-6 sm:px-8">
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/80">Envio</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Datos de entrega</h3>
                    <p className="mt-2 text-sm text-slate-500">Completa los datos para confirmar tu pedido.</p>
                  </div>

                  <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <input
                          {...register("customerName")}
                          placeholder="Nombre"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
                      </div>

                      <div>
                        <input
                          {...register("customerEmail")}
                          type="email"
                          placeholder="Email"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {errors.customerEmail && <p className="mt-1 text-xs text-red-500">{errors.customerEmail.message}</p>}
                      </div>

                      <div>
                        <input
                          {...register("customerPhone")}
                          placeholder="Telefono"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone.message}</p>}
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          {...register("shippingAddress")}
                          placeholder="Direccion"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {errors.shippingAddress && <p className="mt-1 text-xs text-red-500">{errors.shippingAddress.message}</p>}
                      </div>

                      <div>
                        <input
                          {...register("shippingPostalCode")}
                          placeholder="Codigo postal"
                          inputMode="numeric"
                          maxLength={5}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {postalCode.length > 0 && postalCode.length < 5 && (
                          <p className="mt-1 text-xs text-amber-600">Ingresa los 5 digitos del codigo postal.</p>
                        )}
                        {isPostalCodeLoading && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Consultando codigo postal...
                          </p>
                        )}
                        {postalCodeError && <p className="mt-1 text-xs text-red-500">{postalCodeError}</p>}
                        {errors.shippingPostalCode && <p className="mt-1 text-xs text-red-500">{errors.shippingPostalCode.message}</p>}
                      </div>

                      <div>
                        {postalCodeData && postalCodeData.neighborhoods.length > 1 ? (
                          <select
                            {...register("shippingNeighborhood")}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Selecciona una colonia
                            </option>
                            {postalCodeData.neighborhoods.map((neighborhood) => (
                              <option key={`${neighborhood.name}-${neighborhood.type || "na"}`} value={neighborhood.name}>
                                {neighborhood.type ? `${neighborhood.name} (${neighborhood.type})` : neighborhood.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            {...register("shippingNeighborhood")}
                            placeholder="Colonia"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          />
                        )}
                        {postalCodeData && postalCodeData.neighborhoods.length > 1 && (
                          <p className="mt-1 text-xs text-slate-500">Se encontraron varias colonias para este codigo postal.</p>
                        )}
                        {errors.shippingNeighborhood && <p className="mt-1 text-xs text-red-500">{errors.shippingNeighborhood.message}</p>}
                      </div>

                      <div>
                        <input
                          {...register("shippingMunicipality")}
                          placeholder="Municipio"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {postalCodeData && <p className="mt-1 text-xs text-slate-500">Autocompletado por codigo postal. Puedes editarlo.</p>}
                        {errors.shippingMunicipality && <p className="mt-1 text-xs text-red-500">{errors.shippingMunicipality.message}</p>}
                      </div>

                      <div>
                        <input
                          {...register("shippingState")}
                          placeholder="Estado"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        />
                        {postalCodeData && <p className="mt-1 text-xs text-slate-500">Autocompletado por codigo postal. Puedes editarlo.</p>}
                        {errors.shippingState && <p className="mt-1 text-xs text-red-500">{errors.shippingState.message}</p>}
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
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      shippingPostalCode: "",
      shippingNeighborhood: "",
      shippingMunicipality: "",
      shippingState: "",
    },
  });

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
      reset();
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
            register={register}
            handleSubmit={handleSubmit}
            watch={watch}
            setValue={setValue}
            errors={errors}
            onSubmit={onSubmit}
            onClose={() => setIsCheckoutModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
