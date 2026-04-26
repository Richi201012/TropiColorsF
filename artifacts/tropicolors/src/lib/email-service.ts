/**
 * Servicio para enviar correos de confirmación de pedido usando la API del servidor
 * El proxy en vite.config.ts redirige /api → http://localhost:3000
 */

import { apiUrl } from "@/lib/api";

export type ProductoPedido = {
  nombre: string;
  cantidad: number;
  precio: number;
};

export type DatosPedidoCorreo = {
  nombre: string;
  email: string;
  telefono?: string;
  direccion: string;
  numeroExterior?: string;
  numeroInterior?: string;
  total: number;
  numeroPedido?: string;
  trackingUrl?: string;
  productos: ProductoPedido[];
};

export type DatosEstadoPedidoCorreo = {
  nombre: string;
  email: string;
  estado: string;
  productos: ProductoPedido[];
  total: number;
  direccion: string;
  numeroExterior?: string;
  numeroInterior?: string;
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  cancellationReason?: string;
  numeroPedido?: string;
  trackingUrl?: string;
};

export type DatosFacturaCorreo = {
  nombre: string;
  email: string;
  numeroFactura: string;
  numeroPedido?: string;
  fecha: string;
  productos: ProductoPedido[];
  subtotal: number;
  iva: number;
  total: string;
  telefono?: string;
  direccion?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  metodoPago?:
    | "efectivo"
    | "transferencia"
    | "tarjeta"
    | "mercadopago"
    | "oxxo"
    | "other";
};

export type DatosContactoCorreo = {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
};

export type CorreoRespuesta = {
  success: boolean;
  message?: string;
  error?: string;
};

type AsyncCorreoRespuesta = CorreoRespuesta & {
  queued?: boolean;
};

/**
 * Envía el correo de confirmación de pedido al cliente
 */
export async function enviarCorreoConfirmacion(
  datosPedido: DatosPedidoCorreo,
): Promise<CorreoRespuesta> {
  try {
    console.log(
      "[Email Service] Enviando correo de confirmación...",
      datosPedido,
    );

    if (!datosPedido.email || !datosPedido.nombre) {
      console.error("[Email Service] Datos inválidos:", datosPedido);
      return {
        success: false,
        error: "El email y nombre son requeridos",
      };
    }

    const url = apiUrl("/api/enviar-correo-pedido");
    console.log("[Email Service] URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPedido),
    });

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
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al enviar el correo`,
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

/**
 * Envía el correo de actualización de estado de pedido al cliente
 */
export async function enviarCorreoEstadoPedido(
  datosEstado: DatosEstadoPedidoCorreo,
): Promise<CorreoRespuesta> {
  try {
    console.log("[Email Estado] Enviando correo de estado...", datosEstado);

    if (!datosEstado.email || !datosEstado.nombre || !datosEstado.estado) {
      console.error("[Email Estado] Datos inválidos:", datosEstado);
      return {
        success: false,
        error: "El email, nombre y estado son requeridos",
      };
    }

    const url = apiUrl("/api/enviar-correo-estado");
    console.log("[Email Estado] URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosEstado),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[Email Estado] Respuesta no es JSON:", text);
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    console.log("[Email Estado] Respuesta:", data);

    if (!response.ok) {
      console.error("[Email Estado] Error del servidor:", data);
      return {
        success: false,
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al enviar el correo`,
      };
    }

    console.log("[Email Estado] Correo de estado enviado exitosamente");
    return {
      success: true,
      message: `Correo de estado "${datosEstado.estado}" enviado correctamente`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[Email Estado] Error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function enviarCorreoEstadoPedidoEnSegundoPlano(
  datosEstado: DatosEstadoPedidoCorreo,
): Promise<AsyncCorreoRespuesta> {
  try {
    const startedAt = performance.now();
    console.log("[Email Estado Async] Encolando correo...", datosEstado);

    if (!datosEstado.email || !datosEstado.nombre || !datosEstado.estado) {
      return {
        success: false,
        error: "El email, nombre y estado son requeridos",
      };
    }

    const response = await fetch(apiUrl("/api/enviar-correo-estado-async"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosEstado),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    console.log(
      "[Email Estado Async] Respuesta en",
      `${Math.round(performance.now() - startedAt)}ms`,
      data,
    );

    if (!response.ok) {
      return {
        success: false,
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al encolar el correo`,
      };
    }

    return {
      success: true,
      queued: true,
      message:
        (data.message as string) || "Correo en proceso de envío en segundo plano",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function enviarCorreoConfirmacionEnSegundoPlano(
  datosPedido: DatosPedidoCorreo,
): Promise<AsyncCorreoRespuesta> {
  try {
    const startedAt = performance.now();
    console.log(
      "[Email Confirmacion Async] Encolando correo de confirmacion...",
      datosPedido,
    );

    if (!datosPedido.email || !datosPedido.nombre) {
      return {
        success: false,
        error: "El email y nombre son requeridos",
      };
    }

    const response = await fetch(apiUrl("/api/enviar-correo-pedido-async"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPedido),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    console.log(
      "[Email Confirmacion Async] Respuesta en",
      `${Math.round(performance.now() - startedAt)}ms`,
      data,
    );

    if (!response.ok) {
      return {
        success: false,
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al encolar el correo`,
      };
    }

    return {
      success: true,
      queued: true,
      message:
        (data.message as string) || "Correo en proceso de envio en segundo plano",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Envía la factura al cliente por correo
 */
export async function enviarFacturaCorreo(
  datosFactura: DatosFacturaCorreo,
): Promise<CorreoRespuesta> {
  try {
    console.log("[Email Factura] Enviando factura...", datosFactura);

    if (
      !datosFactura.email ||
      !datosFactura.nombre ||
      !datosFactura.numeroFactura
    ) {
      console.error("[Email Factura] Datos inválidos:", datosFactura);
      return {
        success: false,
        error: "El email, nombre y número de factura son requeridos",
      };
    }

    const url = apiUrl("/api/enviar-correo-factura");
    console.log("[Email Factura] URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosFactura),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("[Email Factura] Respuesta no es JSON:", text);
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    console.log("[Email Factura] Respuesta:", data);

    if (!response.ok) {
      console.error("[Email Factura] Error del servidor:", data);
      return {
        success: false,
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al enviar la factura`,
      };
    }

    console.log("[Email Factura] Factura enviada exitosamente");
    return {
      success: true,
      message: "Factura enviada correctamente al cliente",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[Email Factura] Error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function enviarMensajeContacto(
  datosContacto: DatosContactoCorreo,
): Promise<CorreoRespuesta> {
  try {
    console.log("[Email Contacto] Enviando mensaje...", datosContacto);

    if (!datosContacto.email || !datosContacto.nombre || !datosContacto.mensaje) {
      return {
        success: false,
        error: "Nombre, correo y mensaje son requeridos",
      };
    }

    const response = await fetch(apiUrl("/api/enviar-correo-contacto"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosContacto),
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return {
        success: false,
        error: `Error del servidor (${response.status}): respuesta inesperada`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          (data.message as string) ||
          (data.error as string) ||
          `Error ${response.status} al enviar el mensaje`,
      };
    }

    return {
      success: true,
      message: "Mensaje enviado correctamente",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
