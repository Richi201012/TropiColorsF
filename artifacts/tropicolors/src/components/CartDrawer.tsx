import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Modal personalizado para vaciar carrito
function VaciarCarritoModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  // Cerrar con ESC
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">¿Vaciar el carrito?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción eliminará todos los productos de tu carrito. ¿Estás seguro de continuar?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Sí, vaciar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente botón con modal
function VaciarCarritoModalButton({ clearCart, setIsCartOpen }: { clearCart: () => void; setIsCartOpen: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    clearCart();
    // Cerrar el carrito con.delay
    setTimeout(() => {
      setIsCartOpen(false);
    }, 500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full text-red-500 text-sm hover:text-red-700 hover:underline py-2 flex items-center justify-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
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

// ============================================================================
// 🎭 FUNCIÓN FAKE CHECKOUT - Simula respuesta exitosa del backend
// ============================================================================
const fakeCheckout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        orderId: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        sessionUrl: "/?order_success=true&order=ORD-123456"
      });
    }, 1500);
  });
};
// ============================================================================

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre es requerido"),
  customerEmail: z.string().email("Correo electrónico inválido"),
  customerPhone: z.string().min(10, "Teléfono es requerido"),
  shippingAddress: z.string().min(5, "Dirección es requerida"),
  shippingCity: z.string().min(2, "Ciudad es requerida"),
  shippingState: z.string().min(2, "Estado es requerido"),
  shippingPostalCode: z.string().min(4, "Código postal requerido"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // 🔒 Bloquear scroll del body cuando el carrito está abierto
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

  // ⌨️ Cerrar con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      // 🎭 Usar la función fake en lugar de llamar al backend
      const response = await fakeCheckout();
      
      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Tu pedido ha sido procesado correctamente.",
      });
      
      clearCart();
      setIsCartOpen(false);
      setIsCheckingOut(false);
      
      // Simular redirección
      console.log("Order ID:", response.orderId);
      
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
          {/* Overlay con backdrop-blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          {/* Carrito moderno */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl rounded-l-2xl z-50 flex flex-col"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-tl-2xl">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-lg text-gray-800">Tu Carrito</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400 py-16">
                  <ShoppingBag className="w-20 h-20 mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium mb-2">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400 mb-6">Agrega productos para comenzar</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors active:scale-95"
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
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    {/* Imagen color */}
                    <div
                      className="w-16 h-16 rounded-xl flex-shrink-0 shadow-md"
                      style={{ backgroundColor: item.hexCode || "#003F91" }}
                    />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">{item.productName}</h4>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <div className="flex items-center justify-between mt-2">
                        {/* Controles cantidad */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="text-sm w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                        {/* Precio + eliminar */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">${item.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-3 bg-gray-50">
                {/* Botón vaciar carrito */}
                <VaciarCarritoModalButton clearCart={clearCart} setIsCartOpen={setIsCartOpen} />
                {isCheckingOut ? (
                  <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-bold text-lg mb-2">Detalles de Envío</h3>
                    
                    <div className="space-y-3">
                      <input
                        {...register("customerName")}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
                      
                      <input
                        {...register("customerEmail")}
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
                      
                      <input
                        {...register("customerPhone")}
                        placeholder="Teléfono"
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      {errors.customerPhone && <p className="text-red-500 text-xs">{errors.customerPhone.message}</p>}
                      
                      <input
                        {...register("shippingAddress")}
                        placeholder="Dirección"
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      {errors.shippingAddress && <p className="text-red-500 text-xs">{errors.shippingAddress.message}</p>}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          {...register("shippingCity")}
                          placeholder="Ciudad"
                          className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <input
                          {...register("shippingState")}
                          placeholder="Estado"
                          className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      {errors.shippingCity && <p className="text-red-500 text-xs">{errors.shippingCity.message}</p>}
                      {errors.shippingState && <p className="text-red-500 text-xs">{errors.shippingState.message}</p>}
                      
                      <input
                        {...register("shippingPostalCode")}
                        placeholder="Código Postal"
                        className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      {errors.shippingPostalCode && <p className="text-red-500 text-xs">{errors.shippingPostalCode.message}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-blue-600">${cartTotal}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        form="checkout-form"
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isProcessing ? "Procesando..." : "Finalizar Pedido"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cartTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Envío</span>
                      <span>Calculado en checkout</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-xl font-bold text-blue-600">${cartTotal}</span>
                    </div>
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      Proceder al Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
