import type { DatosEstadoPedido } from "./emailTemplate";

type Estado = "Pendiente" | "Pagado" | "Enviado" | "Entregado" | "Cancelado";

type EstadoConfig = {
  titulo: string;
  asunto: string;
  etiqueta: string;
  mensaje: string;
  siguientePaso: string;
  color: string;
  suave: string;
  imagen: string;
  alt: string;
  progreso: number;
};

const ASSET_BASE_URL = (
  process.env.EMAIL_ASSET_BASE_URL ||
  process.env.PUBLIC_SITE_URL ||
  "https://tropicolors.mx"
).replace(/\/+$/, "");

const CONFIG: Record<Estado, EstadoConfig> = {
  Pendiente: {
    titulo: "Ya tenemos tu pedido",
    asunto: "Recibimos tu pedido",
    etiqueta: "Pedido recibido",
    mensaje: "Estamos revisando los datos de tu compra. Te avisaremos en cuanto el pago quede confirmado.",
    siguientePaso: "Siguiente paso: confirmación de pago",
    color: "#B66E00",
    suave: "#FFF7D6",
    imagen: "pending.png",
    alt: "Mascota TropiColors revisando el pedido",
    progreso: 1,
  },
  Pagado: {
    titulo: "Tu pago está confirmado",
    asunto: "Pago confirmado",
    etiqueta: "Pago confirmado",
    mensaje: "Todo está correcto. Nuestro equipo ya está preparando tus colores para el envío.",
    siguientePaso: "Siguiente paso: preparación y envío",
    color: "#16803B",
    suave: "#ECFDF3",
    imagen: "paid.png",
    alt: "Mascota TropiColors confirmando el pago",
    progreso: 2,
  },
  Enviado: {
    titulo: "Tu pedido va en camino",
    asunto: "Tu pedido fue enviado",
    etiqueta: "Pedido enviado",
    mensaje: "Tu compra salió de nuestras instalaciones. Consulta abajo la paquetería y el número de guía.",
    siguientePaso: "Siguiente paso: entrega en tu domicilio",
    color: "#007E8C",
    suave: "#E7FAFC",
    imagen: "shipped.png",
    alt: "Mascota TropiColors llevando un paquete",
    progreso: 3,
  },
  Entregado: {
    titulo: "¡Tu pedido fue entregado!",
    asunto: "Pedido entregado",
    etiqueta: "Entrega completada",
    mensaje: "Esperamos que disfrutes tus productos. Gracias por elegir color, rendimiento y consistencia TropiColors.",
    siguientePaso: "Tu compra está completa",
    color: "#548D12",
    suave: "#F2FBE9",
    imagen: "delivered.png",
    alt: "Mascota TropiColors agradeciendo la compra",
    progreso: 4,
  },
  Cancelado: {
    titulo: "Tu pedido fue cancelado",
    asunto: "Actualización sobre tu pedido",
    etiqueta: "Pedido cancelado",
    mensaje: "El pedido ya no continuará su proceso. Si necesitas aclararlo o deseas hacer una nueva compra, estamos para ayudarte.",
    siguientePaso: "Nuestro equipo puede ayudarte por WhatsApp",
    color: "#C81E4F",
    suave: "#FFF0F5",
    imagen: "cancelled.png",
    alt: "Mascota de soporte TropiColors lista para ayudar",
    progreso: 0,
  },
};

function html(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function getConfig(estado: string): EstadoConfig {
  return CONFIG[estado as Estado] || CONFIG.Pendiente;
}

export function generarAsuntoEstadoPedido(estado: string, numeroPedido?: string): string {
  const referencia = numeroPedido ? ` ${numeroPedido}` : "";
  return `${getConfig(estado).asunto}${referencia} | TropiColors`;
}

function renderProgreso(config: EstadoConfig): string {
  if (!config.progreso) return "";
  const etapas = ["Pedido", "Pago", "Envío", "Entrega"];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr>${etapas
    .map((etapa, index) => {
      const completada = index + 1 <= config.progreso;
      const actual = index + 1 === config.progreso;
      return `<td width="25%" align="center" valign="top" style="padding:0 2px;"><div style="width:28px;height:28px;margin:0 auto 7px;border-radius:50%;line-height:28px;text-align:center;background-color:${completada ? config.color : "#E7ECF3"};color:${completada ? "#FFFFFF" : "#8A96A8"};font-size:12px;font-weight:800;border:${actual ? `3px solid ${config.suave}` : "3px solid transparent"};">${completada ? "✓" : index + 1}</div><span style="display:block;color:${actual ? "#0B2D6B" : "#7B8798"};font-size:10px;font-weight:${actual ? "800" : "600"};line-height:1.3;">${etapa}</span></td>`;
    })
    .join("")}</tr></table>`;
}

function renderProductos(data: DatosEstadoPedido): string {
  return data.productos
    .map((producto, index) => {
      const fondo = index % 2 === 0 ? "#FFFFFF" : "#F8FAFD";
      return `<tr><td style="padding:14px;border-bottom:1px solid #E7ECF3;background:${fondo};color:#13233F;font-size:13px;line-height:1.45;font-weight:700;">${html(producto.nombre)}</td><td align="center" style="padding:14px 8px;border-bottom:1px solid #E7ECF3;background:${fondo};color:#5E6C82;font-size:13px;">${html(producto.cantidad)}</td><td class="hide-mobile" align="right" style="padding:14px 8px;border-bottom:1px solid #E7ECF3;background:${fondo};color:#5E6C82;font-size:13px;white-space:nowrap;">${money(producto.precio)}</td><td align="right" style="padding:14px;border-bottom:1px solid #E7ECF3;background:${fondo};color:#0B2D6B;font-size:13px;font-weight:800;white-space:nowrap;">${money(producto.cantidad * producto.precio)}</td></tr>`;
    })
    .join("");
}

export function generarEmailEstadoPedido(data: DatosEstadoPedido): string {
  const config = getConfig(data.estado);
  const logoUrl = "https://i.ibb.co/cKX9nVTQ/logo.png";
  const imageUrl = `${ASSET_BASE_URL}/email/order-status/${config.imagen}`;
  const numero = html(data.numeroPedido || "Sin referencia");
  const trackingUrl = data.trackingUrl ? html(data.trackingUrl) : "";
  const whatsappUrl = `https://wa.me/525551146856?text=${encodeURIComponent(`Hola, necesito ayuda con mi pedido ${data.numeroPedido || ""}`.trim())}`;
  const envio = data.estado === "Enviado" && data.paqueteria;
  const cancelacion = data.estado === "Cancelado" && data.cancellationReason;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${html(config.titulo)} - TropiColors</title><style>@media only screen and (max-width:620px){.email-shell{width:100%!important;border-radius:0!important}.email-pad{padding-left:20px!important;padding-right:20px!important}.hero-copy,.hero-art{display:block!important;width:100%!important;text-align:center!important}.hero-copy{padding-right:0!important}.hero-art{padding-top:8px!important}.hero-art img{width:172px!important}.mobile-block{display:block!important;width:100%!important;padding:0 0 14px!important}.hide-mobile{display:none!important}.mobile-button{display:block!important}}</style></head>
<body style="margin:0;padding:0;background:#EEF4FA;color:#13233F;font-family:Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${html(config.mensaje)} Pedido ${numero}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#EEF4FA;"><tr><td align="center" style="padding:32px 12px;"><table role="presentation" class="email-shell" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:620px;background:#FFFFFF;border:1px solid #DCE5F0;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(9,42,92,.12);">
<tr><td style="height:6px;background:#00A8B5;background-image:linear-gradient(90deg,#FFCD00,#FF2E63,#003F91,#00A8B5);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="email-pad" style="padding:20px 32px;background:#071B42;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="54" valign="middle"><img src="${logoUrl}" alt="TropiColors" width="54" height="54" style="display:block;width:54px;height:54px;border:0;border-radius:13px;background:#FFFFFF;"></td><td valign="middle" style="padding-left:13px;"><p style="margin:0;color:#FFFFFF;font-size:19px;line-height:1.1;font-weight:800;">TropiColors</p><p style="margin:4px 0 0;color:#A8C7EA;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;">Color que transforma</p></td><td align="right"><span style="display:inline-block;padding:7px 11px;border:1px solid #49658A;border-radius:999px;color:#FFFFFF;font-size:10px;font-weight:700;letter-spacing:.7px;">ACTUALIZACIÓN</span></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:30px 32px 24px;background:${config.suave};border-bottom:1px solid #E4EBF3;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="hero-copy" width="62%" valign="middle" style="width:62%;padding-right:18px;text-align:left;"><span style="display:inline-block;padding:7px 12px;border-radius:999px;background:${config.color};color:#FFFFFF;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.1px;">${html(config.etiqueta)}</span><p style="margin:15px 0 6px;color:#607089;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Pedido ${numero}</p><h1 style="margin:0;color:#0B2D6B;font-size:30px;line-height:1.12;letter-spacing:-.7px;font-weight:800;">${html(config.titulo)}</h1><p style="margin:13px 0 0;color:#45546A;font-size:14px;line-height:1.65;">Hola, <strong style="color:#13233F;">${html(data.nombre)}</strong>. ${html(config.mensaje)}</p><p style="margin:15px 0 0;color:${config.color};font-size:12px;line-height:1.4;font-weight:800;">${html(config.siguientePaso)}</p></td><td class="hero-art" width="38%" align="right" valign="middle"><img src="${imageUrl}" alt="${html(config.alt)}" width="190" style="display:inline-block;width:190px;max-width:100%;height:auto;border:0;"></td></tr></table>${renderProgreso(config)}</td></tr>
${envio ? `<tr><td class="email-pad" style="padding:24px 32px 0;background:#FFFFFF;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #BDE8ED;border-left:5px solid ${config.color};border-radius:16px;background:#F4FCFD;"><tr><td style="padding:19px 20px;"><p style="margin:0 0 14px;color:#0B2D6B;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;">Datos de envío</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="mobile-block" width="33%" valign="top" style="padding-right:12px;"><small style="display:block;margin-bottom:4px;color:#718096;text-transform:uppercase;">Paquetería</small><strong style="font-size:13px;">${html(data.paqueteria)}</strong></td><td class="mobile-block" width="33%" valign="top" style="padding-right:12px;"><small style="display:block;margin-bottom:4px;color:#718096;text-transform:uppercase;">Servicio</small><strong style="font-size:13px;">${html(data.tipoEnvio || "Por confirmar")}</strong></td><td class="mobile-block" width="34%" valign="top"><small style="display:block;margin-bottom:4px;color:#718096;text-transform:uppercase;">Número de guía</small><strong style="color:#0B2D6B;font-size:13px;word-break:break-word;">${html(data.guia || "Por confirmar")}</strong></td></tr></table></td></tr></table></td></tr>` : ""}
${cancelacion ? `<tr><td class="email-pad" style="padding:24px 32px 0;background:#FFFFFF;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F6C9D7;border-left:5px solid ${config.color};border-radius:16px;background:${config.suave};"><tr><td style="padding:19px 20px;"><p style="margin:0 0 8px;color:${config.color};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;">Motivo de cancelación</p><p style="margin:0;color:#344258;font-size:14px;line-height:1.6;">${html(data.cancellationReason)}</p></td></tr></table></td></tr>` : ""}
<tr><td class="email-pad" style="padding:24px 32px 0;background:#FFFFFF;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E1E8F0;border-radius:16px;background:#F8FAFD;"><tr><td style="padding:18px 20px;"><p style="margin:0 0 7px;color:#718096;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.1px;">Dirección de entrega</p><p style="margin:0;color:#24354E;font-size:13px;line-height:1.6;">${html(data.direccion)}</p></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:26px 32px 0;background:#FFFFFF;"><p style="margin:0 0 12px;color:#0B2D6B;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;">Resumen del pedido</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E1E8F0;border-radius:16px;overflow:hidden;border-collapse:separate;"><tr style="background:#0B2D6B;"><th align="left" style="padding:12px 14px;color:#FFFFFF;font-size:10px;text-transform:uppercase;">Producto</th><th align="center" style="padding:12px 8px;color:#FFFFFF;font-size:10px;text-transform:uppercase;">Cant.</th><th class="hide-mobile" align="right" style="padding:12px 8px;color:#FFFFFF;font-size:10px;text-transform:uppercase;">Unitario</th><th align="right" style="padding:12px 14px;color:#FFFFFF;font-size:10px;text-transform:uppercase;">Importe</th></tr>${renderProductos(data)}</table></td></tr>
<tr><td class="email-pad" style="padding:16px 32px 0;background:#FFFFFF;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;background:#071B42;"><tr><td style="padding:19px 22px;color:#BDD0E6;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Total del pedido</td><td align="right" style="padding:19px 22px;color:#FFCD00;font-size:24px;font-weight:800;white-space:nowrap;">${money(data.total)}</td></tr></table></td></tr>
<tr><td class="email-pad" align="center" style="padding:26px 32px 30px;background:#FFFFFF;">${trackingUrl ? `<a class="mobile-button" href="${trackingUrl}" style="display:inline-block;min-width:190px;padding:15px 24px;border-radius:14px;background:#003F91;color:#FFFFFF;font-size:14px;font-weight:800;text-align:center;text-decoration:none;">Ver seguimiento</a>` : ""}<a class="mobile-button" href="${whatsappUrl}" style="display:inline-block;min-width:190px;margin:${trackingUrl ? "10px 0 0" : "0"};padding:14px 23px;border:1px solid #CAD6E5;border-radius:14px;background:#FFFFFF;color:#0B2D6B;font-size:13px;font-weight:800;text-align:center;text-decoration:none;">¿Necesitas ayuda?</a>${trackingUrl ? `<p style="margin:15px 0 0;color:#7B8798;font-size:10px;line-height:1.55;word-break:break-all;">Si el botón no abre, copia este enlace:<br>${trackingUrl}</p>` : ""}</td></tr>
<tr><td class="email-pad" align="center" style="padding:24px 32px;background:#F7F9FC;border-top:1px solid #E1E8F0;"><p style="margin:0;color:#0B2D6B;font-size:14px;font-weight:800;">TropiColors</p><p style="margin:5px 0 13px;color:#68778E;font-size:11px;line-height:1.5;">Colores intensos, consistentes y listos para transformar tus productos.</p><p style="margin:0;color:#94A0B1;font-size:10px;line-height:1.55;">Este correo fue enviado a ${html(data.email)} por una actualización del pedido ${numero}.</p></td></tr>
</table></td></tr></table></body></html>`;
}
