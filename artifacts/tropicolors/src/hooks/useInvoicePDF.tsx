import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { InvoiceData } from '../types/invoice';
import { InvoicePDFDocument } from '../lib/InvoicePDFDocument';

export const useInvoicePDF = () => {
  const [loading, setLoading] = useState(false);

  const downloadPDF = useCallback(async (invoiceData: InvoiceData) => {
    setLoading(true);
    try {
      // Generar el blob del PDF usando @react-pdf/renderer
      const blob = await pdf(<InvoicePDFDocument data={invoiceData} />).toBlob();
      
      // Crear URL del blob
      const url = URL.createObjectURL(blob);
      
      // Crear elemento link para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura-${invoiceData.invoiceNumberFormatted || invoiceData.invoiceNumber}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { downloadPDF, loading };
};

export default useInvoicePDF;