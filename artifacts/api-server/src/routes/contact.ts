import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message, productInterest } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: "Nombre, correo y mensaje son requeridos" });
      return;
    }

    const id = randomUUID();
    await db.insert(contactMessagesTable).values({
      id,
      name,
      email,
      phone: phone || null,
      message,
      productInterest: productInterest || null,
    });

    res.json({ success: true, message: "Mensaje enviado correctamente. Te contactaremos pronto." });
  } catch (error) {
    req.log.error(error, "Error saving contact message");
    res.status(500).json({ success: false, message: "Error al enviar el mensaje" });
  }
});

export default router;
