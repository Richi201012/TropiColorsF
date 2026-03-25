/**
 * Servicio para enviar correos de confirmación de pedido usando la API del servidor
 * El proxy en vite.config.ts redirige /api → http://localhost:3000
 */

export type ProductoPedido = {
  nombre: string;
  cantidad: number;
  precio: number;
};

export type DatosPedidoCorreo = {
  nombre: string;
  email: string;
  direccion: string;
  total: number;
  numeroPedido?: string; // ID del pedido (opcional)
  productos: ProductoPedido[];
};

export type CorreoRespuesta = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Envía el correo de confirmación de pedido al cliente
 */
export async function enviarCorreoConfirmacion(
  datosPedido: DatosPedidoCorreo,
): Promise<CorreoRespuesta> {
  try {
    console.log("[Email Service] Enviando correo de confirmación...", datosPedido);

    if (!datosPedido.email || !datosPedido.nombre) {
      console.error("[Email Service] Datos inválidos:", datosPedido);
      return {
        success: false,
        error: "El email y nombre son requeridos",
      };
    }

    // ── URL directa — el proxy de Vite redirige /api → localhost:3000 ──
    const url = "/api/enviar-correo-pedido";
    console.log("[Email Service] URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPedido),
    });

    // ── Parseo seguro — evita crash si la respuesta no es JSON ──────────
    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[Email Service] Respuesta no es JSON:", text);
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    console.log("[Email Service] Respuesta:", data);

    if (!response.ok) {
      console.error("[Email Service] Error del servidor:", data);
      return {
        success: false,
        error: (data.error as string) || `Error ${response.status} al enviar el correo`,
      };
    }

    console.log("[Email Service] Correo enviado exitosamente");
    return {
      success: true,
      message: "Correo de confirmación enviado correctamente",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[Email Service] Error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}