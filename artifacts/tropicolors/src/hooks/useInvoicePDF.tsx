import { useState, useCallback } from 'react';
import { buildInvoiceNumber, type InvoiceData } from '../types/invoice';

// Convierte recursos públicos a data URL para que React PDF los incruste.
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('[PDF] No se pudo cargar un recurso visual:', error);
    return '';
  }
};

const getMascotUrl = (status: InvoiceData['status']): string => {
  if (status === 'paid') return '/email/order-status/paid.png';
  if (status === 'cancelled') return '/email/order-status/cancelled.png';
  return '/email/order-status/pending.png';
};

export const useInvoicePDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = useCallback(async (invoiceData: InvoiceData) => {
    setIsGenerating(true);
    try {
      const invoiceNumber =
        invoiceData.invoiceNumberFormatted ||
        invoiceData.invoiceNumber ||
        buildInvoiceNumber(1, invoiceData.issueDate);

      const validData = {
        ...invoiceData,
        invoiceNumber,
        invoiceNumberFormatted: invoiceNumber,
        subtotal: Number(invoiceData.subtotal) || 0,
        taxAmount: Number(invoiceData.taxAmount) || 0,
        total: Number(invoiceData.total) || 0,
        taxRate: Number(invoiceData.taxRate) || 0,
        items: invoiceData.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          subtotal: Number(item.subtotal) || 0,
        })),
      };

      const [logoBase64, mascotBase64] = await Promise.all([
        urlToBase64(invoiceData.company?.logo || '/logo-tropicolors.png'),
        urlToBase64(getMascotUrl(invoiceData.status)),
      ]);

      const [{ pdf }, { InvoicePDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../lib/InvoicePDFDocument'),
      ]);

      const blob = await pdf(
        <InvoicePDFDocument
          data={validData}
          logoBase64={logoBase64}
          mascotBase64={mascotBase64}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = validData.invoiceNumberFormatted || validData.invoiceNumber || 'Factura';
      link.download = `Factura-${filename}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[PDF] Error al generar el PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { downloadPDF, isGenerating };
};

export default useInvoicePDF;
