import { Router, type IRouter } from "express";
import {
  generarEmailConfirmacion,
  type EmailPedidoData,
} from "../lib/emailTemplate";

const router: IRouter = Router();

// Configuración de Brevo API desde variables de entorno
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

// Remitente verificado en Brevo
const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL || "m_tropicolors1@hotmail.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Tropicolors";

/**
 * Función para enviar correo usando la API REST de Brevo
 */
async function enviarCorreoBrevoAPI(
  toEmail: string,
  toName: string,
  htmlContent: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: "Pedido Confirmado - Tropicolors",
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Brevo API] Error:", data);
      return {
        success: false,
        error: data.message || "Error al enviar correo",
      };
    }

    console.log("[Brevo API] Correo enviado:", data.messageId);
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("[Brevo API] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Función para enviar correo de confirmación de pedido
 * Tipo: https.onCall (simulado con POST)
 * NO guarda información del correo en base de datos
 */
router.post("/enviar-correo-pedido", async (req, res) => {
  console.log("[Email] Recibida solicitud de envío de correo de pedido");
  console.log("[Email] Body:", JSON.stringify(req.body, null, 2));

  // Validar que Brevo esté configurado
  if (!BREVO_API_KEY) {
    console.error("[Email] ERROR: API Key de Brevo no configurada");
    res.status(500).json({
      error: "Servicio de correo no configurado",
      message: "La API Key de Brevo no está disponible",
    });
    return;
  }

  try {
    // Validar datos del pedido
    const { nombre, email, direccion, total, productos } =
      req.body as EmailPedidoData;

    if (
      !nombre ||
      !email ||
      !direccion ||
      !total ||
      !productos ||
      !Array.isArray(productos)
    ) {
      console.error("[Email] ERROR: Datos del pedido incompletos");
      res.status(400).json({
        error: "Datos incompletos",
        message: "Faltan datos requeridos del pedido",
      });
      return;
    }

    // Validar que cada producto tenga los campos necesarios
    for (const producto of productos) {
      if (!producto.nombre || !producto.cantidad || !producto.precio) {
        console.error("[Email] ERROR: Producto inválido:", producto);
        res.status(400).json({
          error: "Producto inválido",
          message: "Cada producto debe tener nombre, cantidad y precio",
        });
        return;
      }
    }

    // Generar HTML del correo
    console.log("[Email] Generando HTML del correo...");
    const html = generarEmailConfirmacion({
      nombre,
      email,
      direccion,
      productos,
      total,
    });

    // Log de configuración para debugging
    console.log(
      "[Email] Remitente:",
      `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
    );

    // Enviar correo usando la API de Brevo
    console.log("[Email] Enviando correo a:", email);
    const result = await enviarCorreoBrevoAPI(email, nombre, html);

    if (!result.success) {
      console.error("[Email] ERROR al enviar correo:", result.error);
      res.status(500).json({
        error: "Error al enviar correo",
        message: result.error,
      });
      return;
    }

    console.log("[Email] Correo enviado exitosamente!");
    console.log("[Email] Message ID:", result.messageId);

    // Responder éxito (NO guardamos información del correo)
    res.json({
      success: true,
      message: "Correo de confirmación enviado exitosamente",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Email] ERROR al enviar correo:", error);

    // Manejo de errores con detalles
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    res.status(500).json({
      error: "Error al enviar correo",
      message: errorMessage,
    });
  }
});

/**
 * Endpoint de verificación de estado del servicio de correo
 */
router.get("/health-email", (req, res) => {
  const isConfigured = !!BREVO_API_KEY;
  res.json({
    status: isConfigured ? "ok" : "not_configured",
    service: "Brevo (API REST)",
    configured: isConfigured,
  });
});

export default router;
