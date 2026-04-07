import { useState, useCallback } from 'react';
import { buildInvoiceNumber, type InvoiceData } from '../types/invoice';

// FunciÃ³n para convertir URL a base64
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    console.log('[PDF] Intentando convertir URL del logo:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('[PDF] Logo convertido a base64 exitosamente');
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.warn('[PDF] Error al leer el archivo del logo');
        resolve('');
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('[PDF] Logo no disponible, generando PDF sin logo:', error);
    return '';
  }
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

      let logoBase64 = '';
      const logoUrl = invoiceData.company?.logo;
      console.log('[PDF] Logo URL encontrado:', logoUrl);

      if (logoUrl) {
        try {
          logoBase64 = await urlToBase64(logoUrl);
        } catch (e) {
          console.warn('[PDF] Error al convertir logo:', e);
        }
      } else {
        console.log('[PDF] No hay logo en company, usando logo estÃ¡tico');
        try {
          logoBase64 = await urlToBase64('/logo-tropicolors.png');
        } catch (e) {
          console.warn('[PDF] No se pudo usar logo estÃ¡tico:', e);
        }
      }

      console.log('[PDF] Generando PDF con logoBase64:', logoBase64 ? 'sÃ­' : 'no');

      const [{ pdf }, { InvoicePDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../lib/InvoicePDFDocument'),
      ]);

      const blob = await pdf(
        <InvoicePDFDocument data={validData} logoBase64={logoBase64} />,
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
