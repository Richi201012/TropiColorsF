import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import Stripe from "stripe";

const router: IRouter = Router();

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TC-${timestamp}-${random}`;
}

router.post("/checkout", async (req, res) => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(500).json({ error: "Stripe no configurado" });
      return;
    }

    const stripe = new Stripe(stripeKey);
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingExterior,
      shippingInterior,
      shippingCity,
      shippingState,
      shippingPostalCode,
    } = req.body;

    if (!items || items.length === 0 || !customerName || !customerEmail) {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }

    const lineItems = items.map(
      (item: { productName: string; unitPrice: number; quantity: number }) => ({
        price_data: {
          currency: "mxn",
          product_data: {
            name: item.productName,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      }),
    );

    const totalAmount = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0,
    );
    const orderId = randomUUID();
    const orderNumber = generateOrderNumber();

    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/?order_success=true&order=${orderNumber}`,
      cancel_url: `${baseUrl}/?order_cancelled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId,
        orderNumber,
        customerName,
        customerPhone: customerPhone || "",
      },
    });

    await db.insert(ordersTable).values({
      id: orderId,
      orderNumber,
      stripeSessionId: session.id,
      status: "pending",
      amount: Math.round(totalAmount * 100),
      currency: "mxn",
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      shippingAddress: shippingAddress || null,
      shippingExterior: shippingExterior || null,
      shippingInterior: shippingInterior || null,
      shippingCity: shippingCity || null,
      shippingState: shippingState || null,
      shippingPostalCode: shippingPostalCode || null,
      items: items,
    });

    res.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (error) {
    req.log.error(error, "Error creating checkout session");
    res.status(500).json({ error: "Error al crear sesión de pago" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));
    const formatted = orders.map((o) => ({
      ...o,
      amount: o.amount / 100,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    req.log.error(error, "Error fetching orders");
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    res.json({
      ...order,
      amount: order.amount / 100,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
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

    const [updated] = await db
      .update(ordersTable)
      .set({
        status,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }

    res.json({
      ...updated,
      amount: updated.amount / 100,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    req.log.error(error, "Error updating order status");
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

export default router;
