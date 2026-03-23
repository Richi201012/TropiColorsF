import { useRef, useEffect } from 'react';
import { 
  Download, 
  Mail, 
  Printer, 
  MapPin, 
  Phone, 
  Mail as MailIcon,
  Globe,
  CreditCard,
  Calendar,
  Hash,
  User,
  Package
} from 'lucide-react';
import { useInvoicePDF } from '../hooks/useInvoicePDF';
import { 
  InvoiceProps, 
  formatCurrency, 
  formatDate, 
  getPaymentMethodLabel
} from '../types/invoice';

export const Invoice: React.FC<InvoiceProps> = ({ 
  data, 
  showActions = true,
  onDownloadPDF,
  onSendEmail,
  isPreview = false
}) => {
  // Hook para generar PDF con datos
  const { downloadPDF } = useInvoicePDF();

  const handleDownloadPDF = async () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      // Pasar los datos de la factura para generar el PDF
      await downloadPDF(data);
    }
  };

  // Colors from Tropicolors brand
  const primaryColor = 'text-[#1A237E]'; // Deep blue
  const primaryBg = 'bg-[#1A237E]';
  const accentColor = 'text-[#EA580C]'; // Orange
  const accentBg = 'bg-[#EA580C]';
  const mutedColor = 'text-slate-500';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions Bar */}
      {showActions && !isPreview && (
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg hover:bg-[#151b60] transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
          {onSendEmail && (
            <button
              onClick={onSendEmail}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar por Email
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      )}

      {/* Invoice Container */}
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] p-8 text-white">
          <div className="flex justify-between items-start">
            {/* Company Info - Logo + Name */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="/logo-tropicolors.png" 
                  alt="Tropicolors" 
                  className="w-16 h-16 object-contain rounded-lg bg-white/10 p-1"
                />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Tropicolors</h1>
                <div className="mt-4 space-y-1 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{data.company.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{data.company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{data.company.email}</span>
                  </div>
                  {data.company.rfc && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span>RFC: {data.company.rfc}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Title & Number */}
            <div className="text-right">
              <h2 className="text-5xl font-bold tracking-wide text-white mb-2">FACTURA</h2>
              <div className="text-3xl font-bold text-[#EA580C] bg-white/10 px-4 py-2 rounded-lg inline-block">
                {data.invoiceNumberFormatted || data.invoiceNumber}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
                <Calendar className="w-4 h-4" />
                {formatDate(data.issueDate)}
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="mt-8 flex justify-between items-center border-t border-white/20 pt-6">
            <div className="flex gap-8">
              {data.dueDate && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Vencimiento</div>
                  <div className="font-medium">{formatDate(data.dueDate)}</div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Método de Pago</div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#EA580C]" />
                  {getPaymentMethodLabel(data.paymentMethod)}
                </div>
              </div>
              {data.orderId && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/60 mb-1">Pedido</div>
                  <div className="font-medium text-[#EA580C]">#{data.orderId}</div>
                </div>
              )}
            </div>
            {/* Status badge removed - invoice shows clean without payment status */}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Customer Info */}
          <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1A237E]" />
              <h3 className="text-lg font-semibold text-[#1A237E]">Datos del Cliente</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Nombre</div>
                <div className="font-semibold text-slate-900">{data.customer.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Email</div>
                <div className="text-slate-700">{data.customer.email}</div>
              </div>
              {data.customer.phone && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Teléfono</div>
                  <div className="text-slate-700">{data.customer.phone}</div>
                </div>
              )}
              {data.customer.address && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Dirección</div>
                  <div className="text-slate-700">
                    {data.customer.address}
                    {(data.customer.city || data.customer.state) && (
                      <span className="text-slate-500">
                        {data.customer.city && `, ${data.customer.city}`}
                        {data.customer.state && `, ${data.customer.state}`}
                        {data.customer.postalCode && ` ${data.customer.postalCode}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {data.customer.rfc && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">RFC</div>
                  <div className="text-slate-700 font-mono">{data.customer.rfc}</div>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#1A237E]" />
              <h3 className="text-lg font-semibold text-[#1A237E]">Detalle de Productos</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1A237E] text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Producto</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Cantidad</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Precio Unitario</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(data.subtotal)}</span>
                </div>
                
                {data.taxRate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({data.taxRate * 100}%)</span>
                    <span className="font-medium">{formatCurrency(data.taxAmount)}</span>
                  </div>
                )}
                
                {data.discount && data.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span className="font-medium">-{formatCurrency(data.discount)}</span>
                  </div>
                )}

                <div className="border-t-2 border-[#EA580C] pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#1A237E]">Total</span>
                  <span className="text-2xl font-bold text-[#EA580C]">
                    {formatCurrency(data.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-[#1A237E] mb-2">Notas</h4>
              <p className="text-slate-600 text-sm">{data.notes}</p>
            </div>
          )}

          {/* Terms */}
          {data.terms && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-2">Términos y Condiciones</h4>
              <p className="text-slate-500 text-sm">{data.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            {/* Logo sutil en footer */}
            <div className="flex justify-center mb-4">
              <img 
                src="/logo-tropicolors.png" 
                alt="Tropicolors" 
                className="h-8 opacity-30"
              />
            </div>
            <p className="text-xl font-semibold text-[#1A237E] mb-2">
              ¡Gracias por su compra!
            </p>
            <p className="text-slate-500 text-sm">
              Para cualquier duda o aclaración, contactenos a {data.company.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;