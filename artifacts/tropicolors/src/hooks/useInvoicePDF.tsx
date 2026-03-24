import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { InvoiceData } from '../types/invoice';
import { InvoicePDFDocument } from '../lib/InvoicePDFDocument';

// Función para convertir URL a base64
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
       // Generar número de factura único basado en timestamp para evitar duplicados
       const timestamp = Date.now();
       const uniqueInvoiceNumber = `FAC-${timestamp.toString().slice(-6)}`;
       
       // Validar que los datos tengan los campos requeridos
       const validData = {
         ...invoiceData,
         invoiceNumber: uniqueInvoiceNumber,
         invoiceNumberFormatted: uniqueInvoiceNumber,
         // Asegurar valores numéricos válidos
         subtotal: Number(invoiceData.subtotal) || 0,
         taxAmount: Number(invoiceData.taxAmount) || 0,
         total: Number(invoiceData.total) || 0,
         taxRate: Number(invoiceData.taxRate) || 0,
         items: invoiceData.items.map(item => ({
           ...item,
           quantity: Number(item.quantity) || 1,
           unitPrice: Number(item.unitPrice) || 0,
           subtotal: Number(item.subtotal) || 0
         }))
       };

      // Convertir logo URL a base64 si existe
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
        console.log('[PDF] No hay logo en company, usando logo estático');
        // Usar logo estático como fallback
        try {
          logoBase64 = await urlToBase64('/logo-tropicolors.png');
        } catch (e) {
          console.warn('[PDF] No se pudo usar logo estático:', e);
        }
      }

      console.log('[PDF] Generando PDF con logoBase64:', logoBase64 ? 'sí' : 'no');

      // Generar el blob del PDF usando @react-pdf/renderer
      const blob = await pdf(<InvoicePDFDocument data={validData} logoBase64={logoBase64} />).toBlob();
      
      // Crear URL del blob
      const url = URL.createObjectURL(blob);
      
      // Crear elemento link para descargar
      const link = document.createElement('a');
      link.href = url;
      const filename = invoiceData.invoiceNumberFormatted || invoiceData.invoiceNumber || 'Factura';
      link.download = `Factura-${filename}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[PDF] Error al generar PDF:', error);
      alert('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { downloadPDF, isGenerating };
};

export default useInvoicePDF;