/**
 * Plantilla HTML profesional para correo de "Pedido Confirmado" y "Estado de Pedido"
 * Estilo: Fondo blanco con degradados claros - identidad Tropicolors
 * Logo: /images/logo-tropicolors.png (servido desde el API server)
 */

export interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface DatosPedido {
  nombre: string;
  email: string;
  telefono?: string;
  direccion: string;
  numeroExterior?: string;
  numeroInterior?: string;
  productos: Producto[];
  total: number;
  numeroPedido?: string;
}

export interface DatosContacto {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

const TROPICOLORS_COMPANY_INFO = {
  name: "Tropicolors",
  address:
    "Calle Abedules Mz. 1 Lt. 36, Col. Ejercito del Trabajo II, 55238 Ecatepec de Morelos, Estado de Mexico",
  phone: "55 5114 6856",
  email: "m_tropicolors1@hotmail.com",
  rfc: "VAVE840727NKA",
} as const;

function formatInvoiceDate(value: string): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return value;
  }

  const dateOnlyMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsedDate = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

// ═══════════════════════════════════════════════════════════════════════════
// CORREO DE CONFIRMACIÓN DE COMPRA
// ═══════════════════════════════════════════════════════════════════════════

function generarFilasProductos(productos: Producto[]): string {
  return productos
    .map(
      (producto, index) => `
    <tr>
      <td style="padding: 13px 16px; color: #1e293b; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8faff"};">
        ${producto.nombre}
      </td>
      <td style="padding: 13px 16px; text-align: center; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8faff"};">
        ${producto.cantidad}
      </td>
      <td style="padding: 13px 16px; text-align: right; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8faff"};">
        $${producto.precio.toFixed(2)}
      </td>
      <td style="padding: 13px 16px; text-align: right; color: #0d1340; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8faff"};">
        $${(producto.cantidad * producto.precio).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");
}

export function generarEmailConfirmacion(pedido: DatosPedido): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const productosHtml = generarFilasProductos(pedido.productos);
  const fecha = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Confirmado - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#f8fafc;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 50%, #f1f5f9 100%); min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px 20px 0 0; padding: 40px 32px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius: 50%; padding: 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #ffffff; border-radius: 16px; padding: 8px; line-height: 0;">
                          <img src="${logoUrl}" alt="Tropicolors" width="100" style="display: block; border-radius: 10px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; background: linear-gradient(135deg, #0d1340 0%, #1a237e 100%); border-radius: 50px; padding: 8px 24px; margin-bottom: 16px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">✓ Pedido Confirmado</span>
              </div>

              ${
                pedido.numeroPedido
                  ? `
              <div style="display: inline-block; background: #f1f5f9; border-radius: 8px; padding: 8px 16px; margin-bottom: 16px;">
                <span style="color: #64748b; font-size: 12px;">No. de Pedido:</span>
                <span style="color: #0d1340; font-size: 14px; font-weight: 700; margin-left: 8px;">${pedido.numeroPedido}</span>
              </div>
              `
                  : ""
              }

              <h1 style="margin: 0 0 12px; color: #0d1340; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                ¡Gracias por tu compra,<br><span style="color: #f97316;">${pedido.nombre}</span>!
              </h1>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Tu pedido fue procesado exitosamente el <strong style="color: #0d1340;">${fecha}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #0d1340, #0ea5e9, #f97316, #0ea5e9, #0d1340); padding: 0;"></td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 28px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid #0d1340; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #0d1340; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📦 Datos del Cliente</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Nombre</span>
                          <span style="color: #1e293b; font-size: 14px; font-weight: 600;">${pedido.nombre}</span>
                        </td>
                        <td width="50%" style="padding: 0 0 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Email</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Teléfono</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.telefono || "No proporcionado"}</span>
                        </td>
                        <td width="50%" style="padding: 0 0 10px 8px; vertical-align: top;"></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 4px;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Dirección de entrega</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.direccion}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #0d1340; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🛒 Detalle del Pedido</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #0d1340 0%, #1e293b 100%);">
                    <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Producto</th>
                    <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">P. Unit.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d1340 0%, #1e293b 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 6px;">Total del Pedido</td>
                        <td style="text-align: right;"><span style="color: #f97316; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">$${pedido.total.toFixed(2)}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 36px; text-align: center;">
              <p style="margin: 0 0 18px; color: #64748b; font-size: 14px; line-height: 1.6;">¿Tienes dudas sobre tu pedido? Estamos aquí para ayudarte.</p>
              <a href="https://wa.me/+52551146856?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20pedido%20${pedido.numeroPedido ? `-%20${pedido.numeroPedido}` : ""}" style="display: inline-block; background: linear-gradient(135deg, #0d1340 0%, #1a237e 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-size: 14px; font-weight: 700;">Contáctanos por WhatsApp ↗</a>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px; padding: 28px 32px; text-align: center;">
              <img src="${logoUrl}" alt="Tropicolors" width="48" style="display:inline-block; border-radius: 10px; margin-bottom: 12px;">
              <p style="margin: 0 0 4px; color: #0d1340; font-size: 15px; font-weight: 700;">Tropicolors</p>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 12px;">Colorantes para la Industria Alimentaria</p>
              <div style="margin-bottom: 12px;">
                <span style="display:inline-block; background: #f1f5f9; color: #64748b; font-size: 10px; padding: 4px 10px; border-radius: 20px; margin: 2px;">Grado Alimenticio</span>
                <span style="display:inline-block; background: #fef3c7; color: #b45309; font-size: 10px; padding: 4px 10px; border-radius: 20px; margin: 2px;">Alta Concentración</span>
                <span style="display:inline-block; background: #dbeafe; color: #1d4ed8; font-size: 10px; padding: 4px 10px; border-radius: 20px; margin: 2px;">Envíos a México</span>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">Este correo fue enviado a ${pedido.email}</p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}

export interface EmailPedidoData {
  nombre: string;
  email: string;
  telefono?: string;
  direccion: string;
  numeroExterior?: string;
  numeroInterior?: string;
  total: number;
  numeroPedido?: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORREO DE ESTADO DE PEDIDO
// ═══════════════════════════════════════════════════════════════════════════

export interface DatosEstadoPedido {
  nombre: string;
  email: string;
  estado: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  direccion: string;
  numeroExterior?: string;
  numeroInterior?: string;
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  cancellationReason?: string;
  numeroPedido?: string;
}

export interface EmailEstadoData extends DatosEstadoPedido {}

/**
 * Genera correo de notificación al administrador cuando se recibe un nuevo pedido
 */
export function generarEmailAdminNuevoPedido(pedido: DatosPedido): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const productosHtml = generarFilasProductos(pedido.productos);
  const fecha = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo pedido recibido - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#f8fafc;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #fef2f2 0%, #f8fafc 50%, #fef2f2 100%); min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <tr>
            <td style="background: #ffffff; border: 1px solid #fecaca; border-radius: 20px 20px 0 0; padding: 40px 32px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius: 50%; padding: 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #fef2f2; border-radius: 16px; padding: 8px; line-height: 0;">
                          <img src="${logoUrl}" alt="Tropicolors" width="100" style="display: block; border-radius: 10px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 50px; padding: 8px 24px; margin-bottom: 16px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">🛎️ Nuevo pedido recibido</span>
              </div>

              ${
                pedido.numeroPedido
                  ? `
              <div style="display: inline-block; background: #fef2f2; border-radius: 8px; padding: 8px 16px; margin-bottom: 16px;">
                <span style="color: #b91c1c; font-size: 12px;">No. de Pedido:</span>
                <span style="color: #dc2626; font-size: 14px; font-weight: 700; margin-left: 8px;">${pedido.numeroPedido}</span>
              </div>
              `
                  : ""
              }

              <h1 style="margin: 0 0 12px; color: #1e293b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                Tienes un nuevo pedido de <span style="color: #dc2626;">${pedido.nombre}</span>
              </h1>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Pedido realizado el <strong style="color: #1e293b;">${fecha}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626); padding: 0;"></td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 28px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef2f2 0%, #f8fafc 100%); border-radius: 12px; border-left: 4px solid #dc2626; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #1e293b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📋 Datos del Cliente</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Nombre</span>
                          <span style="color: #1e293b; font-size: 14px; font-weight: 600;">${pedido.nombre}</span>
                        </td>
                        <td width="50%" style="padding: 0 0 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Email</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Teléfono</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.telefono || "No proporcionado"}</span>
                        </td>
                        <td width="50%" style="padding: 0 0 10px 8px; vertical-align: top;"></td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 4px;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Dirección de entrega</span>
                          <span style="color: #1e293b; font-size: 14px;">${pedido.direccion}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #1e293b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🛒 Detalle del Pedido</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                    <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Producto</th>
                    <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">P. Unit.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase;">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 6px;">Total del Pedido</td>
                        <td style="text-align: right;"><span style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">$${pedido.total.toFixed(2)}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px; padding: 28px 32px; text-align: center;">
              <img src="${logoUrl}" alt="Tropicolors" width="48" style="display:inline-block; border-radius: 10px; margin-bottom: 12px;">
              <p style="margin: 0 0 4px; color: #1e293b; font-size: 15px; font-weight: 700;">Tropicolors - Panel de Administración</p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">Notificaciones de nuevos pedidos</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}

function generarIconoEstado(estado: string): string {
  const iconos: Record<string, string> = {
    Pendiente: "⏳",
    Pagado: "✅",
    Enviado: "📦",
    Entregado: "🎉",
    Cancelado: "❌",
  };
  return iconos[estado] || "📋";
}

function generarMensajeEstado(estado: string): string {
  const mensajes: Record<string, string> = {
    Pendiente: "Tu pedido está siendo procesado y espera confirmación de pago.",
    Pagado:
      "¡Excelente! Tu pago ha sido confirmado y tu pedido está siendo preparado.",
    Enviado: "¡Tu pedido está en camino! Estamos ansiosos por que lo recibas.",
    Entregado:
      "¡Tu pedido ha sido entregado! Gracias por confiar en Tropicolors.",
    Cancelado:
      "Tu pedido fue cancelado. Si tienes dudas o deseas reactivar la compra, contáctanos.",
  };
  return mensajes[estado] || "Estado actualizado";
}

function generarTituloEstado(estado: string): string {
  const titulos: Record<string, string> = {
    Pendiente: "Pedido Pendiente",
    Pagado: "Pago Confirmado",
    Enviado: "Pedido Enviado",
    Entregado: "Pedido Entregado",
    Cancelado: "Pedido Cancelado",
  };
  return titulos[estado] || "Estado Actualizado";
}

function obtenerColorEstado(estado: string): string {
  const colores: Record<string, string> = {
    Pendiente: "#f59e0b",
    Pagado: "#10b981",
    Enviado: "#3b82f6",
    Entregado: "#8b5cf6",
    Cancelado: "#dc2626",
  };
  return colores[estado] || "#6b7280";
}

export function generarEmailEstadoPedido(data: DatosEstadoPedido): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const productosHtml = data.productos
    .map(
      (p, i) => `
    <tr>
      <td style="padding: 12px 16px; color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">${p.nombre}</td>
      <td style="padding: 12px 16px; text-align: center; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">${p.cantidad}</td>
      <td style="padding: 12px 16px; text-align: right; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">$${p.precio.toFixed(2)}</td>
      <td style="padding: 12px 16px; text-align: right; color: #0d1340; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">$${(p.cantidad * p.precio).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const colorEstado = obtenerColorEstado(data.estado);
  const icono = generarIconoEstado(data.estado);
  const titulo = generarTituloEstado(data.estado);
  const mensaje = generarMensajeEstado(data.estado);
  const mostrarDatosEnvio = data.estado === "Enviado" && data.paqueteria;
  const mostrarMotivoCancelacion =
    data.estado === "Cancelado" && data.cancellationReason;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#f8fafc;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 50%, #f1f5f9 100%); min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px 20px 0 0; padding: 40px 32px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius: 50%; padding: 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #ffffff; border-radius: 16px; padding: 8px; line-height: 0;">
                          <img src="${logoUrl}" alt="Tropicolors" width="100" style="display: block; border-radius: 10px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; background: ${colorEstado}; border-radius: 50px; padding: 8px 24px; margin-bottom: 16px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">${icono} ${titulo}</span>
              </div>

              ${
                data.numeroPedido
                  ? `
              <div style="display: inline-block; background: #f1f5f9; border-radius: 8px; padding: 8px 16px; margin-bottom: 16px;">
                <span style="color: #64748b; font-size: 12px;">No. de Pedido:</span>
                <span style="color: #0d1340; font-size: 14px; font-weight: 700; margin-left: 8px;">${data.numeroPedido}</span>
              </div>
              `
                  : ""
              }

              <h1 style="margin: 0 0 12px; color: #0d1340; font-size: 26px; font-weight: 800;">Hola, <span style="color: #f97316;">${data.nombre}</span>!</h1>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">${mensaje}</p>
            </td>
          </tr>

          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #0d1340, ${colorEstado}, #0d1340); padding: 0;"></td>
          </tr>

          ${
            mostrarDatosEnvio
              ? `
          <tr>
            <td style="background: #ffffff; padding: 28px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid ${colorEstado}; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #0d1340; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🚚 Información de Envío</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Paquetería</span>
                          <span style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.paqueteria}</span>
                        </td>
                        <td width="33%" style="padding: 0 8px 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Tipo de envío</span>
                          <span style="color: #1e293b; font-size: 14px;">${data.tipoEnvio}</span>
                        </td>
                        <td width="34%" style="padding: 0 0 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">No. Guía</span>
                          <span style="color: #0d1340; font-size: 14px; font-weight: 700;">${data.guia}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          ${
            mostrarMotivoCancelacion
              ? `
          <tr>
            <td style="background: #ffffff; padding: 28px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff1f2 0%, #fef2f2 100%); border-radius: 12px; border-left: 4px solid #dc2626; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #991b1b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Motivo de cancelación</p>
                    <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.7;">${data.cancellationReason}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <tr>
            <td style="background: #ffffff; padding: ${mostrarDatosEnvio ? "0" : "28px"} 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border-left: 4px solid #0d1340; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #0d1340; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📦 Datos de Entrega</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td colspan="2" style="padding-bottom: 8px;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Dirección de entrega</span>
                          <span style="color: #1e293b; font-size: 14px;">${data.direccion}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #0d1340; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🛒 Productos</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #0d1340 0%, #1e293b 100%);">
                    <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 11px; font-weight: 600;">Producto</th>
                    <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 11px; font-weight: 600;">Cant.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600;">P. Unit.</th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600;">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d1340 0%, #1e293b 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td><span style="color: #ffffff; font-size: 16px; font-weight: 700;">Total</span></td>
                        <td style="text-align: right;"><span style="color: #f97316; font-size: 28px; font-weight: 800;">$${data.total.toFixed(2)}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 20px 20px; padding: 28px 32px; text-align: center;">
              <img src="${logoUrl}" alt="Tropicolors" width="48" style="display:inline-block; border-radius: 10px; margin-bottom: 12px;">
              <p style="margin: 0 0 4px; color: #0d1340; font-size: 15px; font-weight: 700;">Tropicolors</p>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 12px;">Colorantes para la Industria Alimentaria</p>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">Este correo fue enviado a ${data.email}</p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORREO DE FACTURA
// ═══════════════════════════════════════════════════════════════════════════

export interface FacturaProducto {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface DatosFactura {
  nombre: string;
  email: string;
  numeroFactura: string;
  numeroPedido?: string;
  fecha: string;
  productos: FacturaProducto[];
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
}

export function generarEmailContacto(data: DatosContacto): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const fecha = new Date().toLocaleString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo mensaje de contacto - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 58%, #fff8e7 100%); min-height: 100vh; padding: 32px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px;">
          <tr>
            <td style="background:#ffffff; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden; box-shadow:0 22px 55px rgba(15, 23, 42, 0.12);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1a237e; padding:28px 30px; color:#ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle">
                          <img src="${logoUrl}" alt="Tropicolors" width="74" style="display:block;">
                        </td>
                        <td valign="middle" align="right">
                          <div style="display:inline-block; background:rgba(255,255,255,0.12); border-radius:999px; padding:8px 16px; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase;">
                            Nuevo mensaje de contacto
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 30px 20px;">
                    <p style="margin:0 0 8px; color:#0f172a; font-size:24px; font-weight:800;">${data.nombre} quiere cotizar contigo</p>
                    <p style="margin:0; color:#64748b; font-size:14px; line-height:1.6;">Mensaje recibido el ${fecha} desde el formulario de contacto del sitio.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 30px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px;">
                      <tr>
                        <td style="padding:18px;">
                          <p style="margin:0 0 14px; color:#1a237e; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Datos del prospecto</p>
                          <p style="margin:0 0 8px; color:#0f172a; font-size:14px;"><strong>Nombre:</strong> ${data.nombre}</p>
                          <p style="margin:0 0 8px; color:#0f172a; font-size:14px;"><strong>Correo:</strong> ${data.email}</p>
                          <p style="margin:0; color:#0f172a; font-size:14px;"><strong>Teléfono:</strong> ${data.telefono || "No proporcionado"}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 30px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px;">
                      <tr>
                        <td style="padding:18px;">
                          <p style="margin:0 0 14px; color:#1a237e; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Mensaje</p>
                          <p style="margin:0; color:#334155; font-size:14px; line-height:1.8; white-space:pre-line;">${data.mensaje}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generarEmailFactura(data: DatosFactura): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const fechaFactura = formatInvoiceDate(data.fecha);
  const getPaymentMethodLabel = (
    method?: DatosFactura["metodoPago"],
  ): string => {
    const labels: Record<NonNullable<DatosFactura["metodoPago"]>, string> = {
      efectivo: "Efectivo",
      transferencia: "Transferencia bancaria",
      tarjeta: "Tarjeta",
      mercadopago: "MercadoPago",
      oxxo: "OXXO Pay",
      other: "Otro",
    };

    return method ? labels[method] || "Otro" : "No especificado";
  };

  const productosHtml = data.productos
    .map(
      (p, i) => `
    <tr>
      <td style="padding: 14px 16px; color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">${p.nombre}</td>
      <td style="padding: 14px 16px; text-align: center; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">${p.cantidad}</td>
      <td style="padding: 14px 16px; text-align: right; color: #475569; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">$${p.precio.toFixed(2)}</td>
      <td style="padding: 14px 16px; text-align: right; color: #0d1340; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">$${(p.cantidad * p.precio).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");
  const direccionBase = data.direccion || "";
  const direccionFactura = [
    direccionBase,
    data.numeroExterior && !direccionBase.includes(`Ext. ${data.numeroExterior}`)
      ? `Ext. ${data.numeroExterior}`
      : "",
    data.numeroInterior && !direccionBase.includes(`Int. ${data.numeroInterior}`)
      ? `Int. ${data.numeroInterior}`
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${data.numeroFactura} - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#f8fafc;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #eef6ff 0%, #f8fafc 52%, #fff8e7 100%); min-height: 100vh; padding: 32px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 760px;">

          <tr>
            <td style="background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 22px 55px rgba(15, 23, 42, 0.12); border: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #1a237e; padding: 28px 30px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 66px; height: 66px; border-radius: 14px; background: #ffffff; text-align: center; vertical-align: middle; overflow: hidden;">
                                <img src="${logoUrl}" alt="Tropicolors" width="56" style="display: block; margin: 5px auto;">
                              </td>
                              <td style="padding-left: 16px;">
                                <p style="margin: 0 0 6px; color: #ffffff; font-size: 20px; font-weight: 800;">${TROPICOLORS_COMPANY_INFO.name}</p>
                                <p style="margin: 0 0 4px; color: rgba(255,255,255,0.76); font-size: 12px;">${TROPICOLORS_COMPANY_INFO.address}</p>
                                <p style="margin: 0 0 4px; color: rgba(255,255,255,0.76); font-size: 12px;">${TROPICOLORS_COMPANY_INFO.phone} &nbsp;·&nbsp; ${TROPICOLORS_COMPANY_INFO.email}</p>
                                <p style="margin: 0; color: rgba(255,255,255,0.76); font-size: 12px;">RFC: ${TROPICOLORS_COMPANY_INFO.rfc}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" align="right">
                          <div style="display: inline-block; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.24); border-radius: 10px; padding: 12px 18px; margin-bottom: 10px;">
                            <span style="color: #f97316; font-size: 24px; font-weight: 800; letter-spacing: 1px;">${data.numeroFactura}</span>
                          </div>
                          <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 14px;">
                            <span style="color: rgba(255,255,255,0.88); font-size: 13px;">${fechaFactura}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="background: #00acc1; padding: 12px 30px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 36px;">
                          <p style="margin: 0 0 4px; color: rgba(255,255,255,0.7); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Método de pago</p>
                          <p style="margin: 0; color: #ffffff; font-size: 13px; font-weight: 700;">${getPaymentMethodLabel(data.metodoPago)}</p>
                        </td>
                        ${
                          data.numeroPedido
                            ? `<td>
                          <p style="margin: 0 0 4px; color: rgba(255,255,255,0.7); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Pedido</p>
                          <p style="margin: 0; color: #fff6cf; font-size: 13px; font-weight: 700;">#${data.numeroPedido}</p>
                        </td>`
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 26px 30px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f4ff; border-radius: 10px; border-left: 4px solid #00acc1;">
                      <tr>
                        <td style="padding: 18px 18px 14px;">
                          <p style="margin: 0 0 14px; color: #1a237e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Datos del cliente</p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="padding: 0 12px 12px 0; vertical-align: top;">
                                <span style="display:block; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Nombre</span>
                                <span style="color:#1e293b; font-size:14px; font-weight:600;">${data.nombre}</span>
                              </td>
                              <td width="50%" style="padding: 0 0 12px 12px; vertical-align: top;">
                                <span style="display:block; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Email</span>
                                <span style="color:#1e293b; font-size:14px;">${data.email}</span>
                              </td>
                            </tr>
                            <tr>
                              <td width="50%" style="padding: 0 12px 0 0; vertical-align: top;">
                                <span style="display:block; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Teléfono</span>
                                <span style="color:#1e293b; font-size:14px;">${data.telefono || "No proporcionado"}</span>
                              </td>
                              <td width="50%" style="padding: 0 0 0 12px; vertical-align: top;">
                                <span style="display:block; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Dirección</span>
                                <span style="color:#1e293b; font-size:14px;">${direccionFactura || "No proporcionada"}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 30px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                      <thead>
                        <tr style="background: #1a237e;">
                          <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase;">Producto</th>
                          <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase;">Cant.</th>
                          <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase;">P. Unit.</th>
                          <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase;">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${productosHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 30px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="45%"></td>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8faff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                            <tr>
                              <td style="padding: 12px 16px; color: #64748b; font-size: 14px;">Subtotal</td>
                              <td style="padding: 12px 16px; text-align: right; color: #1e293b; font-size: 14px; font-weight: 600;">$${data.subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td style="padding: 0 16px 12px; color: #64748b; font-size: 14px;">IVA (16%)</td>
                              <td style="padding: 0 16px 12px; text-align: right; color: #1e293b; font-size: 14px; font-weight: 600;">$${data.iva.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td style="padding: 14px 16px; background: #1a237e; color: #ffffff; font-size: 16px; font-weight: 700;">Total</td>
                              <td style="padding: 14px 16px; background: #1a237e; text-align: right; color: #f97316; font-size: 28px; font-weight: 800;">$${data.total}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 8px 30px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <img src="${logoUrl}" alt="Tropicolors" width="72" style="display:inline-block; margin: 18px 0 10px; opacity: 0.18;">
                    <p style="margin: 0 0 6px; color: #1a237e; font-size: 18px; font-weight: 800;">Gracias por su compra</p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">Para cualquier duda o aclaración contáctenos en ${TROPICOLORS_COMPANY_INFO.email}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}
