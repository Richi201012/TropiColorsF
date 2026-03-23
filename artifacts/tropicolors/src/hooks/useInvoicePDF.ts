import { useCallback } from 'react';
import jsPDF from 'jspdf';

interface UseInvoicePDFOptions {
  fileName?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceNumberFormatted?: string;
  issueDate: string;
  paymentMethod: string;
  status: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    rfc?: string;
    logo?: string;
    website?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    rfc?: string;
  };
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  orderId?: string;
  notes?: string;
  terms?: string;
  dueDate?: string;
}

/**
 * Hook para generar PDF de facturas con diseño profesional
 * Genera un PDF limpio usando jsPDF programáticamente
 */
export const useInvoicePDF = (options?: UseInvoicePDFOptions) => {
  const generatePDF = useCallback(async (data: InvoiceData): Promise<jsPDF> => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Colores de marca Tropicolors
    const primaryColor: [number, number, number] = [26, 35, 126];   // #1A237E
    const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate
    const accentColor: [number, number, number] = [234, 88, 12];    // #EA580C
    const white: [number, number, number] = [255, 255, 255];

    // ==================== HEADER CON FONDO AZUL ====================
    // Fondo azul del header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 55, 'F');
    
    // Gradiente simulado (línea divisora)
    pdf.setFillColor(40, 53, 147); // #283593
    pdf.rect(0, 50, pageWidth, 5, 'F');

    // Logo y nombre de la empresa (izquierda)
    pdf.setTextColor(...white);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.company.name, margin, 18);

    // Datos de la empresa
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    let infoY = 26;
    pdf.setTextColor(230, 230, 230);
    pdf.text(data.company.address, margin, infoY);
    infoY += 5;
    pdf.text(`Tel: ${data.company.phone}`, margin, infoY);
    infoY += 5;
    pdf.text(`Email: ${data.company.email}`, margin, infoY);
    if (data.company.rfc) {
      infoY += 5;
      pdf.text(`RFC: ${data.company.rfc}`, margin, infoY);
    }

    // Título FACTURA (derecha)
    pdf.setTextColor(...white);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FACTURA', pageWidth - margin, 18, { align: 'right' });

    // Número de factura
    pdf.setFontSize(16);
    pdf.setTextColor(...accentColor);
    pdf.text(data.invoiceNumberFormatted || data.invoiceNumber, pageWidth - margin, 28, { align: 'right' });

    // Fecha
    const dateStr = new Date(data.issueDate).toLocaleDateString('es-MX');
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Fecha: ${dateStr}`, pageWidth - margin, 36, { align: 'right' });
    pdf.text(`Método: Transferencia`, pageWidth - margin, 42, { align: 'right' });

    y = 60;

    // ==================== INFORMACIÓN DEL CLIENTE ====================
    // Fondo gris claro para sección de cliente
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLIENTE', margin, y + 8);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.customer.name, margin, y + 16);

    if (data.customer.email) {
      pdf.setFontSize(9);
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Email: ${data.customer.email}`, margin, y + 23);
    }

    if (data.orderId) {
      pdf.setTextColor(...accentColor);
      pdf.setFontSize(9);
      pdf.text(`Pedido: ${data.orderId}`, margin + 100, y + 23);
    }

    y += 38;

    // ==================== TABLA DE PRODUCTOS ====================
    const tableHeaders = ['Descripción', 'Cantidad', 'P. Unitario', 'Importe'];
    const colWidths = [contentWidth * 0.45, contentWidth * 0.15, contentWidth * 0.2, contentWidth * 0.2];
    const tableX = margin;
    
    // Header de la tabla con color primario
    pdf.setFillColor(...primaryColor);
    pdf.rect(tableX, y, contentWidth, 9, 'F');

    // Texto del header
    pdf.setTextColor(...white);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    let headerX = tableX + 3;
    tableHeaders.forEach((header, i) => {
      pdf.text(header, headerX, y + 6);
      headerX += colWidths[i];
    });

    y += 9;

    // Filas de la tabla
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);

    data.items.forEach((item, index) => {
      // Alternar colores de fondo
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(tableX, y, contentWidth, 8, 'F');
      }

      const rowY = y + 5.5;
      let cellX = tableX + 3;

      // Descripción
      const maxDescLength = 40;
      const desc = item.name.length > maxDescLength 
        ? item.name.substring(0, maxDescLength - 3) + '...' 
        : item.name;
      pdf.text(desc, cellX, rowY);

      // Cantidad
      cellX += colWidths[0];
      pdf.text(item.quantity.toString(), cellX, rowY);

      // Precio unitario
      cellX += colWidths[1];
      pdf.text(`$${item.unitPrice.toLocaleString('es-MX')}`, cellX, rowY);

      // Importe
      cellX += colWidths[2];
      pdf.text(`$${item.subtotal.toLocaleString('es-MX')}`, cellX, rowY);

      y += 8;
    });

    y += 8;

    // ==================== TOTALES ====================
    const totalsX = pageWidth - margin - 70;

    // Subtotal
    pdf.setFontSize(10);
    pdf.setTextColor(...secondaryColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', totalsX, y);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`$${data.subtotal.toLocaleString('es-MX')}`, pageWidth - margin, y, { align: 'right' });

    y += 6;

    // IVA
    if (data.taxRate > 0) {
      pdf.setTextColor(...secondaryColor);
      pdf.text(`IVA (${(data.taxRate * 100).toFixed(0)}%):`, totalsX, y);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`$${data.taxAmount.toLocaleString('es-MX')}`, pageWidth - margin, y, { align: 'right' });
      y += 6;
    }

    // Descuento
    if (data.discount && data.discount > 0) {
      pdf.setTextColor(22, 163, 74); // Verde
      pdf.text('Descuento:', totalsX, y);
      pdf.text(`-$${data.discount.toLocaleString('es-MX')}`, pageWidth - margin, y, { align: 'right' });
      y += 6;
    }

    // Línea divisora antes del total
    y += 2;
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(1.5);
    pdf.line(totalsX - 5, y, pageWidth - margin, y);
    y += 6;

    // TOTAL
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', totalsX, y);
    pdf.setTextColor(...accentColor);
    pdf.setFontSize(16);
    pdf.text(`$${data.total.toLocaleString('es-MX')}`, pageWidth - margin, y, { align: 'right' });

    y += 20;

    // ==================== FOOTER ====================
    // Verificar si necesita nueva página
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }

    // Mensaje de agradecimiento
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('¡Gracias por su compra!', pageWidth / 2, y, { align: 'center' });

    y += 10;

    // Información de contacto
    pdf.setFontSize(9);
    pdf.setTextColor(...secondaryColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Contacto: ${data.company.email}`, pageWidth / 2, y, { align: 'center' });

    // Línea final
    y = pageHeight - 15;
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);

    // Texto final del footer
    pdf.setFontSize(8);
    pdf.text(
      `${data.company.name} - ${data.company.email}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    return pdf;
  }, []);

  const downloadPDF = useCallback(async (data: InvoiceData) => {
    try {
      const pdf = await generatePDF(data);
      const fileName = `${data.invoiceNumberFormatted || data.invoiceNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }, [generatePDF]);

  const getPDFBlob = useCallback(async (data: InvoiceData): Promise<Blob> => {
    const pdf = await generatePDF(data);
    return pdf.output('blob');
  }, [generatePDF]);

  const getPDFUrl = useCallback(async (data: InvoiceData): Promise<string> => {
    const pdf = await generatePDF(data);
    return pdf.output('dataurlstring');
  }, [generatePDF]);

  return {
    generatePDF,
    downloadPDF,
    getPDFBlob,
    getPDFUrl,
  };
};