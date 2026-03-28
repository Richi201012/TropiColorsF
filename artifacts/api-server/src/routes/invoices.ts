import { Router, type IRouter } from "express";
import { db, invoicesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `TC-${year}-${String(seq).padStart(5, "0")}`;
}

router.get("/invoices", async (req, res) => {
  try {
    const invoices = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt));
    const formatted = invoices.map((inv) => ({
      ...inv,
      amount: inv.amount / 100,
      createdAt: inv.createdAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    req.log.error(error, "Error fetching invoices");
    res.status(500).json({ error: "Error al obtener facturas" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { orderId, customerName, customerEmail, customerRfc, items } = req.body;

    if (!customerName || !customerEmail || !items?.length) {
      res.status(400).json({ error: "Datos incompletos" });
      return;
    }

    const totalAmount = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0);

    const id = randomUUID();
    const invoiceNumber = generateInvoiceNumber();

    const [invoice] = await db
      .insert(invoicesTable)
      .values({
        id,
        invoiceNumber,
        orderId: orderId || null,
        customerName,
        customerEmail,
        customerRfc: customerRfc || null,
        amount: Math.round(totalAmount * 100),
        status: "draft",
        items,
      })
      .returning();

    res.status(201).json({
      ...invoice,
      amount: invoice.amount / 100,
      createdAt: invoice.createdAt.toISOString(),
    });
  } catch (error) {
    req.log.error(error, "Error creating invoice");
    res.status(500).json({ error: "Error al crear factura" });
  }
});

export default router;
