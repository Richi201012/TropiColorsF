import React, { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCheckout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const { toast } = useToast();

  const { mutate: createCheckout, isPending } = useCreateCheckout();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (items.length === 0) return;

    createCheckout(
      {
        data: {
          items: items.map(item => ({
            productId: item.productId,
            productName: `${item.productName} (${item.size})`,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          ...data
        }
      },
      {
        onSuccess: (res) => {
          toast({
            title: "¡Pedido iniciado!",
            description: "Redirigiendo al pago seguro...",
          });
          clearCart();
          setIsCartOpen(false);
          // Simulate redirect
          if (res.sessionUrl) {
            window.location.href = res.sessionUrl;
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo procesar el pedido. Intente nuevamente.",
            variant: "destructive",
          });
        }
      }
    );
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-border"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Tu Carrito</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <ShoppingBag size={64} className="text-muted-foreground" />
                  <p className="text-lg font-medium text-muted-foreground">Tu carrito está vacío</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                !isCheckingOut ? (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="bg-white p-4 rounded-xl shadow-sm border border-border/50 flex gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg shadow-inner flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${item.hexCode} 0%, ${item.hexCode}dd 100%)` }}
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground leading-tight">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">{item.size} • ${(item.price).toFixed(2)} MXN</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="p-1 text-foreground hover:bg-white rounded-full transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="p-1 text-foreground hover:bg-white rounded-full transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.productId, item.size)}
                              className="text-destructive p-2 hover:bg-destructive/10 rounded-full transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-bold text-lg mb-2">Detalles de Envío</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <input {...register("customerName")} placeholder="Nombre completo" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName.message}</p>}
                      </div>
                      <div>
                        <input {...register("customerEmail")} placeholder="Correo electrónico" type="email" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        {errors.customerEmail && <p className="text-destructive text-xs mt-1">{errors.customerEmail.message}</p>}
                      </div>
                      <div>
                        <input {...register("customerPhone")} placeholder="Teléfono" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        {errors.customerPhone && <p className="text-destructive text-xs mt-1">{errors.customerPhone.message}</p>}
                      </div>
                      <div>
                        <input {...register("shippingAddress")} placeholder="Dirección completa" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        {errors.shippingAddress && <p className="text-destructive text-xs mt-1">{errors.shippingAddress.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input {...register("shippingCity")} placeholder="Ciudad" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                          {errors.shippingCity && <p className="text-destructive text-xs mt-1">{errors.shippingCity.message}</p>}
                        </div>
                        <div>
                          <input {...register("shippingState")} placeholder="Estado" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                          {errors.shippingState && <p className="text-destructive text-xs mt-1">{errors.shippingState.message}</p>}
                        </div>
                      </div>
                      <div>
                        <input {...register("shippingPostalCode")} placeholder="Código Postal" className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        {errors.shippingPostalCode && <p className="text-destructive text-xs mt-1">{errors.shippingPostalCode.message}</p>}
                      </div>
                    </div>
                  </form>
                )
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-border/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)} MXN</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>Calculado en checkout</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-foreground pt-3 border-t">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)} MXN</span>
                  </div>
                </div>

                {!isCheckingOut ? (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full py-4 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Proceder al Pago
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="px-6 py-4 rounded-xl font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={isPending}
                      className="flex-1 py-4 rounded-xl font-bold text-primary-foreground bg-accent hover:bg-accent/90 shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <><Loader2 className="animate-spin" size={20} /> Procesando...</>
                      ) : (
                        "Pagar Ahora"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
