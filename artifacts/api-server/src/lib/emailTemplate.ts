/**
 * Plantilla HTML profesional para correo de "Pedido Confirmado"
 * Estilo: glassmorphism + degradados — identidad Tropicolors
 * Logo: https://i.ibb.co/cKX9nVTQ/logo.png
 */

export interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface DatosPedido {
  nombre: string;
  email: string;
  direccion: string;
  productos: Producto[];
  total: number;
}

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
      <td style="padding: 13px 16px; text-align: right; color: #1a237e; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8faff"};">
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
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#0d1340;">

  <!-- Fondo con gradiente profundo -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background: linear-gradient(135deg, #0d1340 0%, #1a237e 40%, #0e4a6e 70%, #006064 100%); min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- ══ HEADER GLASS ════════════════════════════════════════════ -->
          <tr>
            <td style="
              background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
              border: 1px solid rgba(255,255,255,0.25);
              border-radius: 20px 20px 0 0;
              padding: 40px 32px 32px;
              text-align: center;
              backdrop-filter: blur(20px);
            ">
              <!-- Logo (sin position absolute — compatible con clientes de correo) -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="
                    background: radial-gradient(circle, rgba(0,172,193,0.3) 0%, transparent 75%);
                    border-radius: 50%;
                    padding: 14px;
                  ">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background: #ffffff;
                          border-radius: 20px;
                          padding: 10px;
                          line-height: 0;
                        ">
                          <img src="${logoUrl}" alt="Tropicolors" width="88"
                            style="display: block; border-radius: 12px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Check badge -->
              <div style="
                display: inline-block;
                background: linear-gradient(135deg, #00acc1, #00838f);
                border-radius: 50px;
                padding: 6px 20px;
                margin-bottom: 16px;
              ">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                  ✓ &nbsp;Pedido Confirmado
                </span>
              </div>

              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                ¡Gracias por tu compra,<br>
                <span style="color: #f97316;">${pedido.nombre}!</span>
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.6;">
                Tu pedido fue procesado exitosamente el <strong style="color: rgba(255,255,255,0.85);">${fecha}</strong>
              </p>
            </td>
          </tr>

          <!-- ══ SEPARADOR GRADIENTE ═════════════════════════════════════ -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #1a237e, #00acc1, #f97316, #00acc1, #1a237e); padding: 0;"></td>
          </tr>

          <!-- ══ DATOS DEL CLIENTE ════════════════════════════════════════ -->
          <tr>
            <td style="
              background: rgba(255,255,255,0.97);
              padding: 28px 32px 20px;
            ">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f4f8 100%); border-radius: 12px; border-left: 4px solid #00acc1; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #1a237e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      📦 &nbsp;Datos de Entrega
                    </p>
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

          <!-- ══ TABLA PRODUCTOS ══════════════════════════════════════════ -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #1a237e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                🛒 &nbsp;Detalle del Pedido
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%);">
                    <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Producto
                    </th>
                    <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Cant.
                    </th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      P. Unit.
                    </th>
                    <th style="padding: 12px 16px; text-align: right; color: #ffffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${productosHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ══ TOTAL ════════════════════════════════════════════════════ -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background: linear-gradient(135deg, #1a237e 0%, #0e3060 50%, #006064 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 6px;">
                          Subtotal
                        </td>
                        <td style="text-align: right; color: rgba(255,255,255,0.7); font-size: 14px; padding-bottom: 6px;">
                          $${pedido.total.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top: 1px solid rgba(255,255,255,0.15); padding-top: 12px;">
                          <span style="color: #ffffff; font-size: 16px; font-weight: 700;">Total del Pedido</span>
                        </td>
                        <td style="text-align: right; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 12px;">
                          <span style="color: #f97316; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                            $${pedido.total.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ CTA ══════════════════════════════════════════════════════ -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 0 32px 36px; text-align: center;">
              <p style="margin: 0 0 18px; color: #64748b; font-size: 14px; line-height: 1.6;">
                ¿Tienes dudas sobre tu pedido? Estamos aquí para ayudarte.
              </p>
              <a href="https://wa.me/5255114 6856"
                style="
                  display: inline-block;
                  background: linear-gradient(135deg, #00acc1 0%, #00838f 100%);
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 36px;
                  border-radius: 50px;
                  font-size: 14px;
                  font-weight: 700;
                  letter-spacing: 0.3px;
                  box-shadow: 0 4px 20px rgba(0,172,193,0.4);
                ">
                Contáctanos por WhatsApp ↗
              </a>
            </td>
          </tr>

          <!-- ══ FOOTER GLASS ═════════════════════════════════════════════ -->
          <tr>
            <td style="
              background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
              border: 1px solid rgba(255,255,255,0.2);
              border-top: none;
              border-radius: 0 0 20px 20px;
              padding: 28px 32px;
              text-align: center;
            ">
              <!-- Línea gradiente -->
              <div style="height: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin-bottom: 20px;"></div>

              <img src="${logoUrl}" alt="Tropicolors" width="44"
                style="display:inline-block; border-radius: 8px; background: rgba(255,255,255,0.9); padding: 4px; margin-bottom: 12px; opacity: 0.9;">

              <p style="margin: 0 0 4px; color: #ffffff; font-size: 15px; font-weight: 700;">
                Tropicolors
              </p>
              <p style="margin: 0 0 16px; color: rgba(255,255,255,0.5); font-size: 12px;">
                Colorantes para la Industria Alimentaria
              </p>

              <!-- Tags de colores decorativos -->
              <div style="margin-bottom: 16px;">
                <span style="display:inline-block; background: rgba(0,172,193,0.3); color: rgba(255,255,255,0.8); font-size: 10px; padding: 3px 10px; border-radius: 20px; margin: 2px; border: 1px solid rgba(0,172,193,0.4);">Grado Alimenticio</span>
                <span style="display:inline-block; background: rgba(249,115,22,0.3); color: rgba(255,255,255,0.8); font-size: 10px; padding: 3px 10px; border-radius: 20px; margin: 2px; border: 1px solid rgba(249,115,22,0.4);">Alta Concentración</span>
                <span style="display:inline-block; background: rgba(26,35,126,0.5); color: rgba(255,255,255,0.8); font-size: 10px; padding: 3px 10px; border-radius: 20px; margin: 2px; border: 1px solid rgba(255,255,255,0.2);">Envíos a México</span>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
                <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px;">
                  Este correo fue enviado a ${pedido.email}
                </p>
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
  direccion: string;
  total: number;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// NUEVA INTERFAZ Y FUNCIÓN PARA CORREOS DE ESTADO DE PEDIDO
// ═══════════════════════════════════════════════════════════════════════════

export interface DatosEstadoPedido {
  nombre: string;
  email: string;
  estado: string;
  productos: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  direccion: string;
  paqueteria?: string;
  tipoEnvio?: string;
  guia?: string;
  numeroPedido?: string;
}

export interface EmailEstadoData extends DatosEstadoPedido {}

function generarIconoEstado(estado: string): string {
  const iconos: Record<string, string> = {
    Pendente: "⏳",
    Pagado: "✅",
    Enviado: "📦",
    Entregado: "🎉",
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
  };
  return mensajes[estado] || "Estado actualizado";
}

function generarTituloEstado(estado: string): string {
  const titulos: Record<string, string> = {
    Pendiente: "Pedido Pendiente",
    Pagado: "Pago Confirmado",
    Enviado: "Pedido Enviado",
    Entregado: "Pedido Entregado",
  };
  return titulos[estado] || "Estado Actualizado";
}

function obtenerColorEstado(estado: string): string {
  const colores: Record<string, string> = {
    Pendiente: "#f59e0b",
    Pagado: "#10b981",
    Enviado: "#3b82f6",
    Entregado: "#8b5cf6",
  };
  return colores[estado] || "#6b7280";
}

export function generarEmailEstadoPedido(data: DatosEstadoPedido): string {
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const productosHtml = data.productos
    .map(
      (p, i) => `
    <tr>
      <td style="padding: 12px 16px; color: #1e293b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
        ${p.nombre}
      </td>
      <td style="padding: 12px 16px; text-align: center; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
        ${p.cantidad}
      </td>
      <td style="padding: 12px 16px; text-align: right; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
        $${p.precio.toFixed(2)}
      </td>
      <td style="padding: 12px 16px; text-align: right; color: #1a237e; font-size: 14px; font-weight: 700; border-bottom: 1px solid #e2e8f0; background-color: ${i % 2 === 0 ? "#ffffff" : "#f8faff"};">
        $${(p.cantidad * p.precio).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  const colorEstado = obtenerColorEstado(data.estado);
  const icono = generarIconoEstado(data.estado);
  const titulo = generarTituloEstado(data.estado);
  const mensaje = generarMensajeEstado(data.estado);
  const mostrarDatosEnvio = data.estado === "Enviado" && data.paqueteria;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} - Tropicolors</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color:#0d1340;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d1340 0%, #1a237e 40%, #0e4a6e 70%, #006064 100%); min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px 20px 0 0; padding: 40px 32px 32px; text-align: center; backdrop-filter: blur(20px);">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="background: radial-gradient(circle, rgba(0,172,193,0.3) 0%, transparent 75%); border-radius: 50%; padding: 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #ffffff; border-radius: 20px; padding: 10px; line-height: 0;">
                          <img src="${logoUrl}" alt="Tropicolors" width="88" style="display: block; border-radius: 12px;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Badge de estado -->
              <div style="display: inline-block; background: ${colorEstado}; border-radius: 50px; padding: 6px 20px; margin-bottom: 16px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${icono} &nbsp;${titulo}
                </span>
              </div>

              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                Hola, <span style="color: #f97316;">${data.nombre}</span>!
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.6;">
                ${mensaje}
              </p>
              ${data.numeroPedido ? `<p style="margin: 8px 0 0; color: rgba(255,255,255,0.5); font-size: 12px;">Pedido: <strong style="color: #00acc1;">${data.numeroPedido}</strong></p>` : ""}
            </td>
          </tr>

          <!-- Separador -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #1a237e, ${colorEstado}, #1a237e); padding: 0;"></td>
          </tr>

          <!-- DATOS DE ENVÍO (solo si está enviado) -->
          ${
            mostrarDatosEnvio
              ? `
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 28px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f4f8 100%); border-radius: 12px; border-left: 4px solid ${colorEstado}; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #1a237e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      🚚 &nbsp;Información de Envío
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" style="padding: 0 8px 10px 0; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Paquetería</span>
                          <span style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.paqueteria}</span>
                        </td>
                        <td width="33%" style="padding: 0 8px 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Tipo de envío</span>
                          <span style="color: #1e293b; font-size: 14px;">${data.tipoEnvio}</span>
                        </td>
                        <td width="34%" style="padding: 0 0 10px 8px; vertical-align: top;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">No. Guía</span>
                          <span style="color: #1a237e; font-size: 14px; font-weight: 700;">${data.guia}</span>
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

          <!-- DATOS DE ENTREGA -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: ${mostrarDatosEnvio ? "0" : "28px"} 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f4f8 100%); border-radius: 12px; border-left: 4px solid #00acc1; overflow: hidden;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 14px; color: #1a237e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      📦 &nbsp;Datos de Entrega
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td colspan="2" style="padding-bottom: 8px;">
                          <span style="display:block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px;">Dirección de entrega</span>
                          <span style="color: #1e293b; font-size: 14px;">${data.direccion}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TABLA PRODUCTOS -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #1a237e; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                🛒 &nbsp;Productos
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%);">
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

          <!-- TOTAL -->
          <tr>
            <td style="background: rgba(255,255,255,0.97); padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a237e 0%, #0e3060 50%, #006064 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="color: #ffffff; font-size: 16px; font-weight: 700;">Total</span>
                        </td>
                        <td style="text-align: right;">
                          <span style="color: #f97316; font-size: 28px; font-weight: 800;">
                            $${data.total.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%); border: 1px solid rgba(255,255,255,0.2); border-radius: 0 0 20px 20px; padding: 28px 32px; text-align: center;">
              <div style="height: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin-bottom: 20px;"></div>
              <img src="${logoUrl}" alt="Tropicolors" width="44" style="display:inline-block; border-radius: 8px; background: rgba(255,255,255,0.9); padding: 4px; margin-bottom: 12px;">
              <p style="margin: 0 0 4px; color: #ffffff; font-size: 15px; font-weight: 700;">Tropicolors</p>
              <p style="margin: 0 0 16px; color: rgba(255,255,255,0.5); font-size: 12px;">Colorantes para la Industria Alimentaria</p>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
                <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px;">Este correo fue enviado a ${data.email}</p>
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
