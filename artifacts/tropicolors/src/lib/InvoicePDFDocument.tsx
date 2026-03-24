import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import type { InvoiceData } from '../types/invoice';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../types/invoice';

// Registrar fuentes paraPDF (opcional - usamos fuentes por defecto)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
  ],
});

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

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: COLORS.white,
  },
  // Header
  header: {
    backgroundColor: COLORS.navy,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerLeftWithLogo: {
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  companyInfo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
    lineHeight: 1.5,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.orange,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '6 12',
    borderRadius: 4,
    marginBottom: 8,
  },
  invoiceDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '4 8',
    borderRadius: 12,
  },
  // Meta section
  metaSection: {
    backgroundColor: COLORS.navy,
    padding: '15 25',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  metaItem: {
    marginRight: 40,
  },
  metaLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'normal',
  },
  // Body
  body: {
    padding: 25,
  },
  // Customer section
  customerSection: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  customerField: {
    width: '50%',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 8,
    color: COLORS.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    color: COLORS.darkText,
  },
  // Items table
  tableHeader: {
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    padding: '10 15',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  colProducto: { width: '45%' },
  colCantidad: { width: '15%', textAlign: 'center' },
  colPrecio: { width: '20%', textAlign: 'right' },
  colImporte: { width: '20%', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    padding: '10 15',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBorder,
  },
  tableRowEven: {
    backgroundColor: COLORS.white,
  },
  tableRowOdd: {
    backgroundColor: COLORS.lightGray,
  },
  tableCell: {
    fontSize: 10,
    color: COLORS.darkText,
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: 8,
    color: COLORS.grayText,
    marginTop: 2,
  },
  // Totals
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  totalsBox: {
    width: 200,
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightBorder,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.grayText,
  },
  totalValue: {
    fontSize: 10,
    color: COLORS.darkText,
    fontWeight: 'normal',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: COLORS.orange,
    paddingTop: 8,
    marginTop: 4,
  },
  totalFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  totalFinalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.orange,
  },
  // Notes
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: COLORS.grayText,
  },
  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: COLORS.lightBorder,
    alignItems: 'center',
  },
  footerThanks: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 4,
  },
  footerContact: {
    fontSize: 9,
    color: COLORS.grayText,
  },
});

interface InvoicePDFDocumentProps {
  data: InvoiceData;
  logoBase64?: string;
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ data, logoBase64 }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerLeft, logoBase64 ? { gap: 12 } : {}]}>
            {/* Logo */}
            {logoBase64 && (
              <Image src={logoBase64} style={styles.logo} />
            )}
            <View>
              <Text style={styles.companyName}>Tropicolors</Text>
              <Text style={styles.companyInfo}>
                {data.company.address}{'\n'}
                {data.company.phone}{'\n'}
                {data.company.email}
                {data.company.rfc && `\nRFC: ${data.company.rfc}`}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>
              {data.invoiceNumberFormatted || data.invoiceNumber}
            </Text>
            <Text style={styles.invoiceDate}>{formatDate(data.issueDate)}</Text>
          </View>
        </View>

        {/* Meta section */}
        <View style={styles.metaSection}>
          {data.dueDate && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Vencimiento</Text>
              <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Método de Pago</Text>
            <Text style={styles.metaValue}>{getPaymentMethodLabel(data.paymentMethod)}</Text>
          </View>
          {data.orderId && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Pedido</Text>
              <Text style={[styles.metaValue, { color: COLORS.orange }]}>#{data.orderId}</Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Customer section */}
          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Datos del Cliente</Text>
            <View style={styles.customerGrid}>
              <View style={styles.customerField}>
                <Text style={styles.fieldLabel}>Nombre</Text>
                <Text style={styles.fieldValue}>{data.customer.name}</Text>
              </View>
              <View style={styles.customerField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{data.customer.email}</Text>
              </View>
              {data.customer.phone && (
                <View style={styles.customerField}>
                  <Text style={styles.fieldLabel}>Teléfono</Text>
                  <Text style={styles.fieldValue}>{data.customer.phone}</Text>
                </View>
              )}
              {data.customer.address && (
                <View style={styles.customerField}>
                  <Text style={styles.fieldLabel}>Dirección</Text>
                  <Text style={styles.fieldValue}>
                    {data.customer.address}
                    {(data.customer.city || data.customer.state) && (
                      <Text style={{ color: COLORS.grayText }}>
                        {data.customer.city && `, ${data.customer.city}`}
                        {data.customer.state && `, ${data.customer.state}`}
                        {data.customer.postalCode && ` ${data.customer.postalCode}`}
                      </Text>
                    )}
                  </Text>
                </View>
              )}
              {data.customer.rfc && (
                <View style={styles.customerField}>
                  <Text style={styles.fieldLabel}>RFC</Text>
                  <Text style={styles.fieldValue}>{data.customer.rfc}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Items table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colProducto]}>Producto</Text>
            <Text style={[styles.tableHeaderCell, styles.colCantidad]}>Cantidad</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrecio]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.colImporte]}>Importe</Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
              ]}
            >
              <View style={styles.colProducto}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.colCantidad]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrecio]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.colImporte]}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
              </View>
              {data.taxRate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IVA ({data.taxRate * 100}%)</Text>
                  <Text style={styles.totalValue}>{formatCurrency(data.taxAmount)}</Text>
                </View>
              )}
              {data.discount && data.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: '#16a34a' }]}>Descuento</Text>
                  <Text style={[styles.totalValue, { color: '#16a34a' }]}>
                    -{formatCurrency(data.discount)}
                  </Text>
                </View>
              )}
              <View style={styles.totalFinal}>
                <Text style={styles.totalFinalLabel}>Total</Text>
                <Text style={styles.totalFinalValue}>{formatCurrency(data.total)}</Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {data.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notas</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerThanks}>¡Gracias por su compra!</Text>
            <Text style={styles.footerContact}>
              Para cualquier duda o aclaración, contáctenos a {data.company.email}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;