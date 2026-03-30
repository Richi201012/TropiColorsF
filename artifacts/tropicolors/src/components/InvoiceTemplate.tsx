import React from 'react';
import { formatCustomerAddress } from '../types/invoice';
import {
  InvoiceProps,
  InvoiceData,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel
} from '../types/invoice';
import { useInvoicePDF } from '../hooks/useInvoicePDF';

// Colores exactos según especificación
const COLORS = {
  navy: '#1a237e',
  orange: '#f97316',
  lightGray: '#f8fafc',
  white: '#ffffff',
  darkText: '#1e293b',
  grayText: '#64748b',
  lightBorder: '#e2e8f0'
};

// Estilos en línea para impresión
const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0;
    }
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .invoice-container {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: 100% !important;
    }
  }
`;

interface InvoiceTemplateProps {
  data: InvoiceData;
  showActions?: boolean;
  onSendEmail?: () => void;
  isPreview?: boolean;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  data,
  showActions = true,
  onSendEmail,
  isPreview = false
}) => {
  const { downloadPDF, isGenerating } = useInvoicePDF();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{printStyles}</style>
      <div className="max-w-4xl mx-auto">
        {/* Actions Bar - ocultar en impresión */}
        {showActions && !isPreview && (
          <div className="flex justify-end gap-2 mb-4 no-print">
            {onSendEmail && (
              <button
                onClick={onSendEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📧 Enviar por Email
              </button>
            )}
            <button
              onClick={() => downloadPDF(data)}
              disabled={isGenerating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: COLORS.navy,
                color: COLORS.white,
                border: 'none',
                borderRadius: '8px',
                cursor: isGenerating ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isGenerating ? 0.7 : 1
              }}
            >
              {isGenerating ? '⏳ Generando...' : '📥 Descargar PDF'}
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🖨️ Imprimir
            </button>
          </div>
        )}

        {/* Invoice Container */}
        <div
          className="invoice-container"
          style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: `1px solid ${COLORS.lightBorder}`
          }}
        >
          {/* Header - Azul Marino */}
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, #283593 100%)`,
              padding: '32px',
              color: COLORS.white
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Company Info - Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Logo */}
                <div style={{ flexShrink: 0 }}>
                  <img
                    src="/logo-tropicolors.png"
                    alt="Tropicolors"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: '4px'
                    }}
                  />
                </div>

                <div>
                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '-0.025em',
                    color: COLORS.white,
                    margin: 0
                  }}>
                    Tropicolors
                  </h1>
                  <div style={{ marginTop: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>📍 {data.company.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>📞 {data.company.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✉️ {data.company.email}</span>
                    </div>
                    {data.company.rfc && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span>🏢 RFC: {data.company.rfc}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Title & Number - Right */}
              <div style={{ textAlign: 'right' }}>
                <h2 style={{
                  fontSize: '40px',
                  fontWeight: 'bold',
                  letterSpacing: '0.025em',
                  color: COLORS.white,
                  margin: '0 0 8px 0'
                }}>
                  FACTURA
                </h2>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: COLORS.orange,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  {data.invoiceNumberFormatted || data.invoiceNumber}
                </div>
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)'
                }}>
                  📅 {formatDate(data.issueDate)}
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{
              marginTop: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid rgba(255,255,255,0.2)`,
              paddingTop: '24px'
            }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                {data.dueDate && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '4px'
                    }}>
                      Vencimiento
                    </div>
                    <div style={{ fontWeight: '500' }}>{formatDate(data.dueDate)}</div>
                  </div>
                )}
                <div>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '4px'
                  }}>
                    Método de Pago
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: COLORS.orange }}>💳</span>
                    {getPaymentMethodLabel(data.paymentMethod)}
                  </div>
                </div>
                {data.orderId && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '4px'
                    }}>
                      Pedido
                    </div>
                    <div style={{ fontWeight: '500', color: COLORS.orange }}>#{data.orderId}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px' }}>
            {/* Customer Info */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: COLORS.lightGray,
              borderRadius: '12px',
              border: `1px solid ${COLORS.lightBorder}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                color: COLORS.navy
              }}>
                <span style={{ fontSize: '20px' }}>👤</span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0,
                  color: COLORS.navy
                }}>
                  Datos del Cliente
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: COLORS.grayText,
                    marginBottom: '4px'
                  }}>
                    Nombre
                  </div>
                  <div style={{ fontWeight: '600', color: COLORS.darkText }}>{data.customer.name}</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: COLORS.grayText,
                    marginBottom: '4px'
                  }}>
                    Email
                  </div>
                  <div style={{ color: COLORS.darkText }}>{data.customer.email}</div>
                </div>
                {data.customer.phone && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: COLORS.grayText,
                      marginBottom: '4px'
                    }}>
                      Teléfono
                    </div>
                    <div style={{ color: COLORS.darkText }}>{data.customer.phone}</div>
                  </div>
                )}
                {data.customer.address && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: COLORS.grayText,
                      marginBottom: '4px'
                    }}>
                      Dirección
                    </div>
                    <div style={{ color: COLORS.darkText }}>
                      {formatCustomerAddress(data.customer)}
                    </div>
                  </div>
                )}
                {data.customer.rfc && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: COLORS.grayText,
                      marginBottom: '4px'
                    }}>
                      RFC
                    </div>
                    <div style={{ color: COLORS.darkText, fontFamily: 'monospace' }}>{data.customer.rfc}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                color: COLORS.navy
              }}>
                <span style={{ fontSize: '20px' }}>📦</span>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0,
                  color: COLORS.navy
                }}>
                  Detalle de Productos
                </h3>
              </div>
              <div style={{
                overflow: 'hidden',
                borderRadius: '12px',
                border: `1px solid ${COLORS.lightBorder}`
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
                      <th style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Producto
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Cantidad
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Precio Unitario
                      </th>
                      <th style={{
                        padding: '16px',
                        textAlign: 'right',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, index) => (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? COLORS.white : COLORS.lightGray,
                          borderBottom: `1px solid ${COLORS.lightBorder}`
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '500', color: COLORS.darkText }}>{item.name}</div>
                          {item.description && (
                            <div style={{ fontSize: '14px', color: COLORS.grayText, marginTop: '4px' }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'center',
                          color: COLORS.darkText
                        }}>
                          {item.quantity}
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          color: COLORS.darkText
                        }}>
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td style={{
                          padding: '16px',
                          textAlign: 'right',
                          fontWeight: '500',
                          color: COLORS.darkText
                        }}>
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '320px' }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: COLORS.lightGray,
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.lightBorder}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: COLORS.grayText,
                    marginBottom: '12px'
                  }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: '500' }}>{formatCurrency(data.subtotal)}</span>
                  </div>

                  {data.taxRate > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: COLORS.grayText,
                      marginBottom: '12px'
                    }}>
                      <span>IVA ({data.taxRate * 100}%)</span>
                      <span style={{ fontWeight: '500' }}>{formatCurrency(data.taxAmount)}</span>
                    </div>
                  )}

                  {data.discount && data.discount > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#16a34a',
                      marginBottom: '12px'
                    }}>
                      <span>Descuento</span>
                      <span style={{ fontWeight: '500' }}>-{formatCurrency(data.discount)}</span>
                    </div>
                  )}

                  <div style={{
                    borderTop: `2px solid ${COLORS.orange}`,
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: COLORS.navy
                    }}>
                      Total
                    </span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: COLORS.orange
                    }}>
                      {formatCurrency(data.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div style={{
                marginTop: '32px',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                border: '1px solid #dbeafe'
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: COLORS.navy,
                  marginBottom: '8px'
                }}>
                  Notas
                </h4>
                <p style={{ color: COLORS.grayText, fontSize: '14px' }}>{data.notes}</p>
              </div>
            )}

            {/* Terms */}
            {data.terms && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: COLORS.lightGray,
                borderRadius: '12px',
                border: `1px solid ${COLORS.lightBorder}`
              }}>
                <h4 style={{
                  fontWeight: '600',
                  color: COLORS.darkText,
                  marginBottom: '8px'
                }}>
                  Términos y Condiciones
                </h4>
                <p style={{ color: COLORS.grayText, fontSize: '14px' }}>{data.terms}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: `2px solid ${COLORS.lightBorder}`
            }}>
              {/* Logo sutil en footer */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <img
                  src="/logo-tropicolors.png"
                  alt="Tropicolors"
                  style={{ height: '32px', opacity: 0.3 }}
                />
              </div>
              <p style={{
                fontSize: '20px',
                fontWeight: '600',
                color: COLORS.navy,
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                ¡Gracias por su compra!
              </p>
              <p style={{
                color: COLORS.grayText,
                fontSize: '14px',
                textAlign: 'center'
              }}>
                Para cualquier duda o aclaración, contáctenos a {data.company.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente de compatibilidad para mantener backwards compatibility
export const Invoice: React.FC<InvoiceProps> = (props) => {
  return <InvoiceTemplate {...props} />;
};

export default InvoiceTemplate;
