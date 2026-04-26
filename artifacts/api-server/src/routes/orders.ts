import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import Stripe from "stripe";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../lib/firebase";

const router: IRouter = Router();
const ORDER_TRACKING_COLLECTION = "order_tracking";
const ORDER_TRACKING_LOOKUP_COLLECTION = "order_tracking_lookup";

type CheckoutItem = {
  productId?: string;
  productName?: string;
  name?: string;
  unitPrice?: number;
  price?: number;
  quantity: number;
  size?: string;
  hexCode?: string;
  imageUrl?: string;
};

type FirestoreOrderItem = {
  productId?: string;
  productName: string;
  size?: string;
  price: number;
  quantity: number;
  hexCode?: string;
  imageUrl?: string;
};

function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TC-${timestamp}-${random}`;
}

function generateTrackingToken(): string {
  return randomUUID().replace(/-/g, "");
}

function normalizeOrderNumberForLookup(orderNumber: string): string {
  return orderNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\//g, "-");
}

function getLookupAliases(orderId: string, orderNumber: string) {
  return Array.from(new Set([orderNumber, orderId].filter(Boolean)));
}

function buildTrackingLookupPayload({
  orderId,
  orderNumber,
  trackingToken,
}: {
  orderId: string;
  orderNumber: string;
  trackingToken: string;
}) {
  return removeUndefinedFields({
    orderId,
    orderNumber,
    orderNumberLookup: normalizeOrderNumberForLookup(orderNumber),
    trackingToken,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function getTrackingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return labels[status] || "Pendiente";
}

function getTrackingStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    pendiente:
      "Tu pedido esta registrado. Validaremos tu pago y datos para comenzar a prepararlo.",
    pagado:
      "Tu pago ya fue confirmado. Estamos preparando los productos de tu pedido.",
    enviado:
      "Tu pedido ya fue enviado. Revisa los datos de paqueteria y guia cuando esten disponibles.",
    entregado:
      "Tu pedido ya fue entregado. Gracias por comprar en Tropicolors.",
    cancelado:
      "Este pedido fue cancelado. Si tienes dudas, contactanos por WhatsApp.",
  };

  return descriptions[status] || descriptions.pendiente;
}

function buildTrackingItems(items: FirestoreOrderItem[]) {
  return items.slice(0, 30).map((item) =>
    removeUndefinedFields({
      productName: item.productName,
      quantity: item.quantity,
      size: item.size,
      subtotal: Number((item.price * item.quantity).toFixed(2)),
    }),
  );
}

function getStripeClient(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return null;
  return new Stripe(stripeKey);
}

function getStripePublishableKey(): string | null {
  return process.env.STRIPE_PUBLISHABLE_KEY || null;
}

function getClientBaseUrl(): string {
  return (
    process.env.PUBLIC_SITE_URL ||
    process.env.BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`
  ).replace(/\/+$/, "");
}

function mapCheckoutItems(items: CheckoutItem[]): FirestoreOrderItem[] {
  return items.map((item) =>
    removeUndefinedFields({
      productId: item.productId,
      productName: item.productName || item.name || "Producto",
      size: item.size,
      price: Number(item.price ?? item.unitPrice ?? 0),
      quantity: Number(item.quantity || 1),
      hexCode: item.hexCode,
      imageUrl: item.imageUrl,
    }),
  );
}

function buildLineItems(
  items: FirestoreOrderItem[],
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    price_data: {
      currency: "mxn",
      product_data: {
        name: item.productName,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));
}

function calculateTotalAmount(items: FirestoreOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

router.post("/checkout", async (req, res) => {
  try {
    const stripe = getStripeClient();
    const publishableKey = getStripePublishableKey();
    if (!stripe) {
      res.status(500).json({ error: "Stripe no configurado" });
      return;
    }
    if (!publishableKey) {
      res.status(500).json({ error: "Stripe publishable key no configurada" });
      return;
    }

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingMunicipality,
      shippingState,
      shippingPostalCode,
      shippingNeighborhood,
      shippingExteriorNumber,
      shippingInteriorNumber,
      requiresInvoice,
      customerRfc,
    } = req.body as {
      items?: CheckoutItem[];
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      shippingAddress?: string;
      shippingCity?: string;
      shippingMunicipality?: string;
      shippingState?: string;
      shippingPostalCode?: string;
      shippingNeighborhood?: string;
      shippingExteriorNumber?: string;
      shippingInteriorNumber?: string;
      requiresInvoice?: boolean;
      customerRfc?: string;
    };

    if (!items?.length || !customerName || !customerEmail) {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }

    const normalizedItems = mapCheckoutItems(items);
    const totalAmount = calculateTotalAmount(normalizedItems);
    const orderId = randomUUID();
    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();
    const initialStatus = "pendiente";
    const historyDate = new Date().toISOString();
    const baseUrl = getClientBaseUrl();

    const session = await stripe.checkout.sessions.create({
      ui_mode: "custom",
      payment_method_types: ["card"],
      line_items: buildLineItems(normalizedItems),
      mode: "payment",
      return_url: `${baseUrl}/?order_success=true&order=${orderNumber}&order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        orderNumber,
        customerName,
        customerPhone: customerPhone || "",
      },
    });

    await setDoc(doc(firestore, "orders", orderId), {
      orderNumber,
      trackingToken,
      stripeSessionId: session.id,
      paymentMethod: "card",
      paymentStatus: "pending",
      status: initialStatus,
      orderStatus: "pending",
      currency: "MXN",
      total: Number(totalAmount.toFixed(2)),
      amount: Math.round(totalAmount * 100),
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      requiresInvoice: Boolean(requiresInvoice),
      customerRfc: customerRfc || "",
      shippingAddress: shippingAddress || "",
      shippingNeighborhood: shippingNeighborhood || "",
      shippingExteriorNumber: shippingExteriorNumber || "",
      shippingInteriorNumber: shippingInteriorNumber || "",
      shippingMunicipality: shippingMunicipality || shippingCity || "",
      shippingState: shippingState || "",
      shippingPostalCode: shippingPostalCode || "",
      items: normalizedItems,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      historial: [
        {
          estado: initialStatus,
          fecha: historyDate,
        },
      ],
    });

    try {
      await setDoc(doc(firestore, ORDER_TRACKING_COLLECTION, trackingToken), {
        orderId,
        orderNumber,
        trackingToken,
        status: initialStatus,
        statusLabel: getTrackingStatusLabel(initialStatus),
        description: getTrackingStatusDescription(initialStatus),
        total: Number(totalAmount.toFixed(2)),
        currency: "MXN",
        paymentMethod: "card",
        paymentStatus: "pending",
        items: buildTrackingItems(normalizedItems),
        historial: [
          {
            estado: initialStatus,
            label: getTrackingStatusLabel(initialStatus),
            description: getTrackingStatusDescription(initialStatus),
            fecha: historyDate,
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await Promise.all(
        getLookupAliases(orderId, orderNumber).map((alias) =>
          setDoc(
            doc(
              firestore,
              ORDER_TRACKING_LOOKUP_COLLECTION,
              normalizeOrderNumberForLookup(alias),
            ),
            buildTrackingLookupPayload({
              orderId,
              orderNumber: alias,
              trackingToken,
            }),
          ),
        ),
      );
    } catch (trackingError) {
      req.log.error(
        trackingError,
        "Error creating public order tracking document",
      );
    }

    res.json({
      orderId,
      orderNumber,
      trackingToken,
      sessionId: session.id,
      clientSecret: session.client_secret,
      publishableKey,
    });
  } catch (error) {
    req.log.error(error, "Error creating checkout session");
    res.status(500).json({ error: "Error al crear sesion de pago" });
  }
});

router.get("/checkout/config", (_req, res) => {
  const publishableKey = getStripePublishableKey();

  if (!publishableKey) {
    res.status(500).json({
      error:
        "Stripe publishable key no configurada. Define STRIPE_PUBLISHABLE_KEY en el servidor.",
    });
    return;
  }

  res.json({ publishableKey });
});

router.get("/checkout/confirm", async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      res.status(500).json({ error: "Stripe no configurado" });
      return;
    }

    const sessionId =
      typeof req.query.session_id === "string" ? req.query.session_id : "";
    const orderId =
      typeof req.query.order_id === "string" ? req.query.order_id : "";

    if (!sessionId || !orderId) {
      res.status(400).json({ error: "session_id y order_id son requeridos" });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderRef = doc(firestore, "orders", orderId);
    const orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists()) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    const paymentCompleted =
      session.payment_status === "paid" || session.status === "complete";

    if (!paymentCompleted) {
      res.status(409).json({
        error: "El pago aun no ha sido confirmado por Stripe",
      });
      return;
    }

    const currentOrder = orderSnapshot.data() as {
      paymentStatus?: string;
    };

    if (currentOrder.paymentStatus !== "paid") {
      await updateDoc(orderRef, {
        paymentStatus: "paid",
        status: "pagado",
        orderStatus: "paid",
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        historial: arrayUnion({
          estado: "pagado",
          fecha: new Date().toISOString(),
        }),
      });
    }

    const updatedSnapshot = await getDoc(orderRef);
    res.json({
      success: true,
      order: {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data(),
      },
    });
  } catch (error) {
    req.log.error(error, "Error confirming checkout session");
    res.status(500).json({ error: "Error al confirmar el pago" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const snapshot = await getDocs(
      query(collection(firestore, "orders"), orderBy("createdAt", "desc")),
    );

    const orders = snapshot.docs.map(
      (docSnap: (typeof snapshot.docs)[number]) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }),
    );

    res.json(orders);
  } catch (error) {
    req.log.error(error, "Error fetching orders");
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orderRef = doc(firestore, "orders", id);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    res.json({
      id: snapshot.id,
      ...snapshot.data(),
    });
  } catch (error) {
    req.log.error(error, "Error fetching order");
    res.status(500).json({ error: "Error al obtener pedido" });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    if (!status) {
      res.status(400).json({ error: "Estado requerido" });
      return;
    }

    const orderRef = doc(firestore, "orders", id);
    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    await updateDoc(orderRef, {
      status,
      trackingNumber: trackingNumber || null,
      notes: notes || null,
      updatedAt: serverTimestamp(),
    });

    const updatedSnapshot = await getDoc(orderRef);
    res.json({
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    });
  } catch (error) {
    req.log.error(error, "Error updating order status");
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

export default router;
