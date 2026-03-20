import React, { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#003F91]" />
                <span className="font-bold text-lg">Tu Carrito</span>
                <span className="bg-[#003F91] text-white text-xs px-2 py-0.5 rounded-full">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div
                      className="w-16 h-16 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: item.hexCode || "#003F91" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.productName}</h4>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">${item.price * item.quantity}</span>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
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
              <div className="border-t p-4 space-y-4">
                {isCheckingOut ? (
                  <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-bold text-lg mb-2">Detalles de Envío</h3>
                    
                    <div className="space-y-3">
                      <input
                        {...register("customerName")}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
                      
                      <input
                        {...register("customerEmail")}
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
                      
                      <input
                        {...register("customerPhone")}
                        placeholder="Teléfono"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {errors.customerPhone && <p className="text-red-500 text-xs">{errors.customerPhone.message}</p>}
                      
                      <input
                        {...register("shippingAddress")}
                        placeholder="Dirección"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {errors.shippingAddress && <p className="text-red-500 text-xs">{errors.shippingAddress.message}</p>}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          {...register("shippingCity")}
                          placeholder="Ciudad"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          {...register("shippingState")}
                          placeholder="Estado"
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      {errors.shippingCity && <p className="text-red-500 text-xs">{errors.shippingCity.message}</p>}
                      {errors.shippingState && <p className="text-red-500 text-xs">{errors.shippingState.message}</p>}
                      
                      <input
                        {...register("shippingPostalCode")}
                        placeholder="Código Postal"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      {errors.shippingPostalCode && <p className="text-red-500 text-xs">{errors.shippingPostalCode.message}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span>Total</span>
                      <span className="text-xl font-bold">${cartTotal}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        form="checkout-form"
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-[#003F91] text-white rounded-xl font-bold hover:bg-[#002d6e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                      <span className="font-bold">${cartTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Envío</span>
                      <span>Calculado en checkout</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-xl font-bold">${cartTotal}</span>
                    </div>
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full py-3 bg-[#003F91] text-white rounded-xl font-bold hover:bg-[#002d6e] transition-colors flex items-center justify-center gap-2"
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
