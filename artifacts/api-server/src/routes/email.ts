import { Router, type IRouter } from "express";
import {
  generarEmailConfirmacion,
  generarEmailEstadoPedido,
  generarEmailAdminNuevoPedido,
  generarEmailFactura,
  generarEmailContacto,
  type EmailPedidoData,
  type EmailEstadoData,
  type DatosFactura,
  type DatosContacto,
} from "../lib/emailTemplate";

const router: IRouter = Router();

// Configuración de Brevo API desde variables de entorno
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

// Remitente verificado en Brevo
const BREVO_SENDER_EMAIL =
  process.env.BREVO_SENDER_EMAIL || "m_tropicolors1@hotmail.com";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Tropicolors";

// Correo del administrador
const ADMIN_EMAIL = "m_tropicolors1@hotmail.com";

function normalizeBrevoError(message?: string): {
  publicMessage: string;
  statusCode: number;
} {
  if (message?.includes("unrecognised IP address")) {
    return {
      publicMessage:
        "Brevo bloqueó el envío porque la IP pública actual no está autorizada. Agrega esta IP en Brevo > Security > Authorised IPs y vuelve a intentar.",
      statusCode: 403,
    };
  }

  return {
    publicMessage: message || "Error al enviar correo",
    statusCode: 500,
  };
}

/**
 * Función para enviar correo usando la API REST de Brevo
 */
async function enviarCorreoBrevoAPI(
  toEmail: string,
  toName: string,
  subject: string,
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
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = (await response.json()) as {
      message?: string;
      messageId?: string;
    };

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
 * Función para enviar correo de confirmación de pedido (ya existente)
 * Tipo: https.onCall (simulado con POST)
 * NO guarda información del correo en base de datos
 */
router.post("/enviar-correo-pedido", async (req, res) => {
  console.log("[Email] Recibida solicitud de envío de correo de pedido");
  console.log("[Email] Body:", JSON.stringify(req.body, null, 2));

  if (!BREVO_API_KEY) {
    console.error("[Email] ERROR: API Key de Brevo no configurada");
    res.status(500).json({
      error: "Servicio de correo no configurado",
      message: "La API Key de Brevo no está disponible",
    });
    return;
  }

  try {
    const {
      nombre,
      email,
      telefono,
      direccion,
      numeroExterior,
      numeroInterior,
      total,
      productos,
      numeroPedido,
    } = req.body as EmailPedidoData;

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

    console.log("[Email] Generando HTML del correo...");
    const html = generarEmailConfirmacion({
      nombre,
      email,
      telefono,
      direccion,
      numeroExterior,
      numeroInterior,
      productos,
      total,
      numeroPedido,
    });

    console.log(
      "[Email] Remitente:",
      `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
    );

    console.log("[Email] Enviando correo a:", email);
    const customerResult = await enviarCorreoBrevoAPI(
      email,
      nombre,
      "Pedido Confirmado - Tropicolors",
      html,
    );

    if (!customerResult.success) {
      console.error(
        "[Email] ERROR al enviar correo al cliente:",
        customerResult.error,
      );
      const brevoError = normalizeBrevoError(customerResult.error);
      res.status(brevoError.statusCode).json({
        error: "Error al enviar correo",
        message: brevoError.publicMessage,
        providerError: customerResult.error,
      });
      return;
    }

    console.log("[Email] Correo enviado exitosamente al cliente!");
    console.log("[Email] Message ID:", customerResult.messageId);

    console.log("[Email] Enviando notificación al administrador...");
    const adminHtml = generarEmailAdminNuevoPedido({
      nombre,
      email,
      telefono,
      direccion,
      numeroExterior,
      numeroInterior,
      productos,
      total,
      numeroPedido,
    });

    const adminResult = await enviarCorreoBrevoAPI(
      ADMIN_EMAIL,
      "Administrador Tropicolors",
      "Nuevo pedido recibido - Tropicolors",
      adminHtml,
    );

    if (adminResult.success) {
      console.log("[Email] Notificación admin enviada:", adminResult.messageId);
    } else {
      console.warn(
        "[Email] Error al enviar notificación admin (no crítico):",
        adminResult.error,
      );
    }

    res.json({
      success: true,
      message: "Correo de confirmación enviado exitosamente",
      messageId: customerResult.messageId,
    });
  } catch (error) {
    console.error("[Email] ERROR al enviar correo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({
      error: "Error al enviar correo",
      message: errorMessage,
    });
  }
});

/**
 * NUEVA: Función para enviar correo de actualización de estado de pedido
 * Tipo: https.onCall (simulado con POST)
 * NO guarda información del correo en base de datos
 */
router.post("/enviar-correo-estado", async (req, res) => {
  console.log("[Email Estado] Recibida solicitud de envío de correo de estado");
  console.log("[Email Estado] Body:", JSON.stringify(req.body, null, 2));

  if (!BREVO_API_KEY) {
    console.error("[Email Estado] ERROR: API Key de Brevo no configurada");
    res.status(500).json({
      error: "Servicio de correo no configurado",
      message: "La API Key de Brevo no está disponible",
    });
    return;
  }

  try {
    const {
      nombre,
      email,
      estado,
      productos,
      total,
      direccion,
      numeroExterior,
      numeroInterior,
      paqueteria,
      tipoEnvio,
      guia,
      numeroPedido,
    } = req.body as EmailEstadoData;

    if (!nombre || !email || !estado || !productos || !total || !direccion) {
      console.error("[Email Estado] ERROR: Datos incompletos");
      res.status(400).json({
        error: "Datos incompletos",
        message: "Faltan datos requeridos del pedido",
      });
      return;
    }

    const estadosValidos = ["Pendiente", "Pagado", "Enviado", "Entregado"];
    if (!estadosValidos.includes(estado)) {
      console.error("[Email Estado] ERROR: Estado inválido:", estado);
      res.status(400).json({
        error: "Estado inválido",
        message: "El estado debe ser: Pendiente, Pagado, Enviado o Entregado",
      });
      return;
    }

    console.log("[Email Estado] Generando HTML para estado:", estado);
    const html = generarEmailEstadoPedido({
      nombre,
      email,
      estado,
      productos,
      total,
      direccion,
      numeroExterior,
      numeroInterior,
      paqueteria,
      tipoEnvio,
      guia,
      numeroPedido,
    });

    const asuntos: Record<string, string> = {
      Pendiente: "Tu pedido está pendiente - Tropicolors",
      Pagado: "Tu pago ha sido confirmado - Tropicolors",
      Enviado: "Tu pedido ha sido enviado - Tropicolors",
      Entregado: "Tu pedido ha sido entregado - Tropicolors",
    };

    console.log("[Email Estado] Enviando correo a:", email, "Estado:", estado);
    const result = await enviarCorreoBrevoAPI(
      email,
      nombre,
      asuntos[estado],
      html,
    );

    if (!result.success) {
      console.error("[Email Estado] ERROR al enviar correo:", result.error);
      const brevoError = normalizeBrevoError(result.error);
      res.status(brevoError.statusCode).json({
        error: "Error al enviar correo",
        message: brevoError.publicMessage,
        providerError: result.error,
      });
      return;
    }

    console.log("[Email Estado] Correo enviado exitosamente!");
    console.log("[Email Estado] Message ID:", result.messageId);

    res.json({
      success: true,
      message: `Correo de estado "${estado}" enviado exitosamente`,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Email Estado] ERROR al enviar correo:", error);
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

/**
 * Endpoint para enviar factura al cliente por correo
 */
router.post("/enviar-correo-factura", async (req, res) => {
  console.log("[Email Factura] Recibida solicitud de envío de factura");
  console.log("[Email Factura] Body:", JSON.stringify(req.body, null, 2));

  if (!BREVO_API_KEY) {
    console.error("[Email Factura] ERROR: API Key de Brevo no configurada");
    res.status(500).json({
      error: "Servicio de correo no configurado",
      message: "La API Key de Brevo no está disponible",
    });
    return;
  }

  try {
    const {
      nombre,
      email,
      numeroFactura,
      numeroPedido,
      fecha,
      productos,
      subtotal,
      iva,
      total,
      telefono,
      direccion,
      numeroExterior,
      numeroInterior,
      metodoPago,
    } = req.body as DatosFactura;

    if (
      !nombre ||
      !email ||
      !numeroFactura ||
      !productos ||
      !Array.isArray(productos) ||
      !total
    ) {
      console.error("[Email Factura] ERROR: Datos de factura incompletos");
      res.status(400).json({
        error: "Datos incompletos",
        message: "Faltan datos requeridos de la factura",
      });
      return;
    }

    console.log("[Email Factura] Generando HTML de factura...");
    const html = generarEmailFactura({
      nombre,
      email,
      numeroFactura,
      numeroPedido,
      fecha: fecha || new Date().toLocaleDateString("es-MX"),
      productos,
      subtotal: subtotal || 0,
      iva: iva || 0,
      total,
      telefono,
      direccion,
      numeroExterior,
      numeroInterior,
      metodoPago,
    });

    console.log("[Email Factura] Enviando correo a:", email);
    const result = await enviarCorreoBrevoAPI(
      email,
      nombre,
      `Factura ${numeroFactura} - Tropicolors`,
      html,
    );

    if (!result.success) {
      console.error("[Email Factura] ERROR al enviar correo:", result.error);
      const brevoError = normalizeBrevoError(result.error);
      res.status(brevoError.statusCode).json({
        error: "Error al enviar factura",
        message: brevoError.publicMessage,
        providerError: result.error,
      });
      return;
    }

    console.log("[Email Factura] Factura enviada exitosamente!");
    console.log("[Email Factura] Message ID:", result.messageId);

    res.json({
      success: true,
      message: "Factura enviada exitosamente al cliente",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Email Factura] ERROR:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({
      error: "Error al enviar factura",
      message: errorMessage,
    });
  }
});

router.post("/enviar-correo-contacto", async (req, res) => {
  console.log("[Email Contacto] Recibida solicitud de contacto");
  console.log("[Email Contacto] Body:", JSON.stringify(req.body, null, 2));

  if (!BREVO_API_KEY) {
    res.status(500).json({
      error: "Servicio de correo no configurado",
      message: "La API Key de Brevo no está disponible",
    });
    return;
  }

  try {
    const { nombre, email, telefono, mensaje } = req.body as DatosContacto;

    if (!nombre || !email || !mensaje) {
      res.status(400).json({
        error: "Datos incompletos",
        message: "Nombre, correo y mensaje son requeridos",
      });
      return;
    }

    const html = generarEmailContacto({
      nombre,
      email,
      telefono,
      mensaje,
    });

    const result = await enviarCorreoBrevoAPI(
      ADMIN_EMAIL,
      "Contacto Web Tropicolors",
      `Nuevo mensaje de contacto de ${nombre} - Tropicolors`,
      html,
    );

    if (!result.success) {
      const brevoError = normalizeBrevoError(result.error);
      res.status(brevoError.statusCode).json({
        error: "Error al enviar mensaje",
        message: brevoError.publicMessage,
        providerError: result.error,
      });
      return;
    }

    res.json({
      success: true,
      message: "Mensaje de contacto enviado correctamente",
      messageId: result.messageId,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al enviar mensaje",
      message: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

export default router;
