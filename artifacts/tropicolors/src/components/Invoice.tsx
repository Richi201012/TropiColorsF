import React from 'react';
import {
  InvoiceProps,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
} from '../types/invoice';
import { useInvoicePDF } from '../hooks/useInvoicePDF';

/**
 * Invoice — Vista previa de factura
 * Diseño alineado con la identidad de Tropicolors:
 *   azul marino #1a237e · teal #00acc1 · naranja #f97316
 *
 * SIN overflow propio — el scroll lo maneja el modal padre.
 */
export const Invoice: React.FC<InvoiceProps> = ({
  data,
  showActions = true,
  isPreview = false,
}) => {
  const { downloadPDF, isGenerating } = useInvoicePDF();

  const C = {
    blue:      '#1a237e',
    blueMid:   '#283593',
    blueLight: '#3949ab',
    teal:      '#00acc1',
    orange:    '#f97316',
    offWhite:  '#f0f4ff',
    grayL:     '#e2e8f0',
    grayD:     '#64748b',
    ink:       '#1e293b',
  };

  return (
    <div className="invoice-wrapper w-full">

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .invoice-print { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Botones */}
      {showActions && !isPreview && (
        <div className="no-print mb-4 flex justify-end gap-2">
          <button
            onClick={() => downloadPDF(data)}
            disabled={isGenerating}
            style={{ backgroundColor: C.blue }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 text-sm font-medium"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generando…
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
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      )}

      {/* ── Factura ─────────────────────────────────────────────────── */}
      <div className="invoice-print bg-white rounded-xl shadow-lg overflow-hidden">

        {/* ── HEADER azul ──────────────────────────────────────────── */}
        <div style={{ backgroundColor: C.blue }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 28px 16px',
          }}>
            {/* Logo + empresa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                <img
                  src="/logo-tropicolors.png"
                  alt="Tropicolors"
                  style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.4px' }}>
                  Tropicolors
                </p>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', lineHeight: '1.6' }}>
                  <p>{data.company.address}</p>
                  <p>{data.company.phone} &nbsp;·&nbsp; {data.company.email}</p>
                  {data.company.rfc && <p>RFC: {data.company.rfc}</p>}
                </div>
              </div>
            </div>

            {/* Folio + fecha */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: '8px',
                padding: '7px 14px',
                display: 'inline-block',
                border: '1px solid rgba(255,255,255,0.25)',
                marginBottom: '7px',
              }}>
                <span style={{ color: C.orange, fontSize: '19px', fontWeight: '700', letterSpacing: '0.8px' }}>
                  {data.invoiceNumberFormatted || data.invoiceNumber}
                </span>
              </div>
              <br />
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                padding: '4px 10px',
                display: 'inline-block',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                  {formatDate(data.issueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Franja teal */}
          <div style={{
            backgroundColor: C.teal,
            padding: '9px 28px',
            display: 'flex',
            gap: '36px',
          }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                Método de Pago
              </p>
              <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                {getPaymentMethodLabel(data.paymentMethod)}
              </p>
            </div>
            {data.dueDate && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                  Vencimiento
                </p>
                <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>{formatDate(data.dueDate)}</p>
              </div>
            )}
            {data.orderId && (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                  Pedido
                </p>
                <p style={{ color: '#fff3cd', fontSize: '12px', fontWeight: '600' }}>#{data.orderId}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── CUERPO ───────────────────────────────────────────────── */}
        <div style={{ padding: '20px 28px' }}>

          {/* Cliente */}
          <div style={{
            backgroundColor: C.offWhite,
            borderRadius: '7px',
            borderLeft: `3px solid ${C.teal}`,
            padding: '12px 14px',
            marginBottom: '16px',
          }}>
            <p style={{ color: C.blue, fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Datos del Cliente
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div>
                <p style={{ color: C.grayD, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Nombre</p>
                <p style={{ color: C.ink, fontSize: '12px', fontWeight: '500' }}>{data.customer.name}</p>
              </div>
              <div>
                <p style={{ color: C.grayD, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Email</p>
                <p style={{ color: C.ink, fontSize: '12px' }}>{data.customer.email}</p>
              </div>
              {data.customer.phone && (
                <div>
                  <p style={{ color: C.grayD, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Teléfono</p>
                  <p style={{ color: C.ink, fontSize: '12px' }}>{data.customer.phone}</p>
                </div>
              )}
              {data.customer.address && (
                <div>
                  <p style={{ color: C.grayD, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Dirección</p>
                  <p style={{ color: C.ink, fontSize: '12px' }}>
                    {data.customer.address}
                    {data.customer.city       ? `, ${data.customer.city}`           : ''}
                    {data.customer.state      ? `, ${data.customer.state}`          : ''}
                    {data.customer.postalCode ? ` C.P. ${data.customer.postalCode}` : ''}
                  </p>
                </div>
              )}
              {data.customer.rfc && (
                <div>
                  <p style={{ color: C.grayD, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>RFC</p>
                  <p style={{ color: C.ink, fontSize: '12px', fontFamily: 'monospace' }}>{data.customer.rfc}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabla */}
          <div style={{ borderRadius: '7px', overflow: 'hidden', border: `1px solid ${C.grayL}`, marginBottom: '16px' }}>
            <div style={{
              backgroundColor: C.blue,
              display: 'grid',
              gridTemplateColumns: '46% 14% 20% 20%',
              padding: '8px 12px',
            }}>
              {[
                { label: 'Producto',  align: 'left'   },
                { label: 'Cant.',     align: 'center' },
                { label: 'P. Unit.',  align: 'right'  },
                { label: 'Importe',   align: 'right'  },
              ].map(({ label, align }) => (
                <p key={label} style={{ color: '#fff', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: align as any }}>
                  {label}
                </p>
              ))}
            </div>
            {data.items.map((item, i) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '46% 14% 20% 20%',
                padding: '9px 12px',
                borderBottom: i < data.items.length - 1 ? `1px solid ${C.grayL}` : 'none',
                backgroundColor: i % 2 === 0 ? '#fff' : '#f8faff',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ color: C.ink, fontSize: '12px', fontWeight: '500' }}>{item.name}</p>
                  {item.description && <p style={{ color: C.grayD, fontSize: '10px', marginTop: '2px' }}>{item.description}</p>}
                </div>
                <p style={{ color: C.ink, fontSize: '12px', textAlign: 'center' }}>{item.quantity}</p>
                <p style={{ color: C.ink, fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</p>
                <p style={{ color: C.ink, fontSize: '12px', fontWeight: '500', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <div style={{
              width: '210px',
              backgroundColor: C.offWhite,
              borderRadius: '7px',
              border: `1px solid ${C.grayL}`,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: C.grayD, fontSize: '12px' }}>Subtotal</span>
                  <span style={{ color: C.ink, fontSize: '12px' }}>{formatCurrency(data.subtotal)}</span>
                </div>
                {data.taxRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: C.grayD, fontSize: '12px' }}>IVA ({data.taxRate * 100}%)</span>
                    <span style={{ color: C.ink, fontSize: '12px' }}>{formatCurrency(data.taxAmount)}</span>
                  </div>
                )}
                {data.discount && data.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: C.teal, fontSize: '12px' }}>Descuento</span>
                    <span style={{ color: C.teal, fontSize: '12px' }}>-{formatCurrency(data.discount)}</span>
                  </div>
                )}
              </div>
              <div style={{
                backgroundColor: C.blue,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Total</span>
                <span style={{ color: C.orange, fontSize: '17px', fontWeight: '700' }}>{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {data.notes && (
            <div style={{
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              borderLeft: `3px solid ${C.blueLight}`,
              padding: '10px 12px',
              marginBottom: '14px',
            }}>
              <p style={{ color: C.blue, fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Notas</p>
              <p style={{ color: C.grayD, fontSize: '11px', lineHeight: '1.5' }}>{data.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${C.grayL}`, paddingTop: '14px', textAlign: 'center' }}>
            <p style={{ color: C.blue, fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
              ¡Gracias por su compra!
            </p>
            <p style={{ color: C.grayD, fontSize: '11px' }}>
              Para cualquier duda contáctenos a {data.company.email}
            </p>
            {/* Marca de agua */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo-tropicolors.png"
                alt=""
                style={{ width: '120px', height: '120px', objectFit: 'contain', opacity: 0.05 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Invoice;