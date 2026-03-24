import React from 'react';
import {
  InvoiceProps,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel
} from '../types/invoice';
import { useInvoicePDF } from '../hooks/useInvoicePDF';

/**
 * Invoice - Componente de vista previa de factura
 * 
 * IMPORTANTE: Este componente NO tiene overflow propio.
 * El scroll debe controlarse desde el contenedor padre (modal).
 * Solo debe haber UNA barra de scroll en el modal.
 */
export const Invoice: React.FC<InvoiceProps> = ({
  data,
  showActions = true,
  isPreview = false
}) => {
  // Hook para descargar PDF
  const { downloadPDF, loading } = useInvoicePDF();

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  // ============================================
  // Render - SIN overflow propio, fluye naturalmente
  // ============================================

  return (
    <div className="invoice-wrapper w-full">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .invoice-print { margin: 0 !important; padding: 0 !important; box-shadow: none !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Botones de acción - Fuera del área de scroll si es posible */}
      {showActions && !isPreview && (
        <div className="no-print mb-4 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={() => downloadPDF(data)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#151b60] transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      )}

      {/* Contenido de la factura - SIN overflow propio, fluye naturalmente */}
      <div className="invoice-print bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* HEADER AZUL - De borde a borde */}
        <div className="bg-[#1a237e] text-white">
          {/* Fila 1: Logo+Empresa | Folio+Fecha */}
          <div className="flex justify-between items-start p-6">
            {/* Columna Izquierda */}
            <div className="flex items-start gap-4">
              <img src="/logo-tropicolors.png" alt="Tropicolors" className="w-14 h-14 object-contain rounded-lg bg-white/10 p-1 flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Tropicolors</h1>
                <div className="mt-2 space-y-0.5 text-white/80 text-sm">
                  <p className="text-xs">{data.company.address}</p>
                  <p className="text-xs">{data.company.phone}</p>
                  <p className="text-xs">{data.company.email}</p>
                  {data.company.rfc && <p className="text-xs">RFC: {data.company.rfc}</p>}
                </div>
              </div>
            </div>
            {/* Columna Derecha */}
            <div className="text-right">
              <h2 className="text-4xl font-bold tracking-wide text-white mb-2">FACTURA</h2>
              <div className="text-2xl font-bold text-[#f97316] bg-white/10 px-4 py-2 rounded-lg inline-block">
                {data.invoiceNumberFormatted || data.invoiceNumber}
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20">
                {formatDate(data.issueDate)}
              </div>
            </div>
          </div>
          {/* Línea divisoria */}
          <div className="border-t border-white/20"></div>
          {/* Fila 2: Método de Pago | Pedido */}
          <div className="flex justify-start gap-12 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Método de Pago</p>
              <p className="font-medium text-white">{getPaymentMethodLabel(data.paymentMethod)}</p>
            </div>
            {data.dueDate && (
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Vencimiento</p>
                <p className="font-medium text-white">{formatDate(data.dueDate)}</p>
              </div>
            )}
            {data.orderId && (
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Pedido</p>
                <p className="font-medium text-[#f97316]">#{data.orderId}</p>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN CLIENTE - Fondo blanco */}
        <div className="p-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-base font-semibold text-[#1a237e] mb-4">Datos del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">Nombre</p>
                <p className="font-medium text-[#1e293b]">{data.customer.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">Email</p>
                <p className="text-[#1e293b]">{data.customer.email}</p>
              </div>
              {data.customer.phone && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">Teléfono</p>
                  <p className="text-[#1e293b]">{data.customer.phone}</p>
                </div>
              )}
              {data.customer.address && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">Dirección</p>
                  <p className="text-[#1e293b]">
                    {data.customer.address}
                    {(data.customer.city || data.customer.state) && (
                      <span className="text-[#64748b]">
                        {data.customer.city && `, ${data.customer.city}`}
                        {data.customer.state && `, ${data.customer.state}`}
                        {data.customer.postalCode && ` ${data.customer.postalCode}`}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {data.customer.rfc && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">RFC</p>
                  <p className="text-[#1e293b] font-mono">{data.customer.rfc}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLA PRODUCTOS */}
        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="bg-[#1a237e] text-white grid grid-cols-12 gap-4 px-4 py-3 text-sm font-semibold">
              <div className="col-span-5 text-left">Producto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Precio Unit.</div>
              <div className="col-span-3 text-right">Importe</div>
            </div>
            {data.items.map((item, index) => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}`}>
                <div className="col-span-5">
                  <p className="font-medium text-[#1e293b]">{item.name}</p>
                  {item.description && <p className="text-xs text-[#64748b] mt-0.5">{item.description}</p>}
                </div>
                <div className="col-span-2 text-center text-[#1e293b]">{item.quantity}</div>
                <div className="col-span-2 text-right text-[#1e293b]">{formatCurrency(item.unitPrice)}</div>
                <div className="col-span-3 text-right font-medium text-[#1e293b]">{formatCurrency(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN TOTALES */}
        <div className="px-6 pb-6">
          <div className="flex justify-end">
            <div className="w-72 bg-[#f8fafc] rounded-lg border border-slate-200 p-4">
              <div className="flex justify-between text-[#64748b] mb-2">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(data.subtotal)}</span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between text-[#64748b] mb-2">
                  <span>IVA ({data.taxRate * 100}%)</span>
                  <span className="font-medium">{formatCurrency(data.taxAmount)}</span>
                </div>
              )}
              {data.discount && data.discount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>Descuento</span>
                  <span className="font-medium">-{formatCurrency(data.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-[#f97316]">
                <span className="text-base font-semibold text-[#1a237e]">Total</span>
                <span className="text-xl font-bold text-[#f97316]">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        {data.notes && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
              <h4 className="font-semibold text-[#1a237e] text-sm mb-2">Notas</h4>
              <p className="text-[#64748b] text-sm">{data.notes}</p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-6 pb-8 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-lg font-semibold text-[#1a237e] mb-1">¡Gracias por su compra!</p>
            <p className="text-sm text-[#64748b]">Para cualquier duda o aclaración, contáctenos a {data.company.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;