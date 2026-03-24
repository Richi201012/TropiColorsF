import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import type { InvoiceData } from '../types/invoice';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../types/invoice';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
  ],
});

// ── Paleta Tropicolors ────────────────────────────────────────────────────────
const C = {
  blue:       '#1a237e',
  blueMid:    '#283593',
  blueLight:  '#3949ab',
  teal:       '#00acc1',
  orange:     '#f97316',
  white:      '#ffffff',
  offWhite:   '#f0f4ff',
  grayL:      '#e2e8f0',
  grayD:      '#64748b',
  ink:        '#1e293b',
  overlayLo:  'rgba(255,255,255,0.1)',
  overlayMid: 'rgba(255,255,255,0.18)',
};

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: C.white,
    padding: 0,
  },

  // ── Header azul ───────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.blue,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBox: {
    backgroundColor: C.white,
    borderRadius: 10,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginRight: 12,
  },
  logoImg: {
    width: 52,
    height: 52,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  companyLine: {
    fontSize: 7.5,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  folioBadge: {
    backgroundColor: C.overlayMid,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 6,
  },
  folioText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: C.orange,
    letterSpacing: 0.8,
  },
  dateBadge: {
    backgroundColor: C.overlayLo,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Franja teal ───────────────────────────────────────────────────────────
  metaStripe: {
    backgroundColor: C.teal,
    paddingHorizontal: 28,
    paddingVertical: 9,
    flexDirection: 'row',
  },
  metaItem: { marginRight: 36 },
  metaLabel: {
    fontSize: 6.5,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: { fontSize: 9, color: C.white, fontWeight: 'bold' },
  metaValueOrange: { fontSize: 9, color: '#fff3cd', fontWeight: 'bold' },

  // ── Cuerpo ────────────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 14,
  },

  // ── Cliente ───────────────────────────────────────────────────────────────
  clientCard: {
    backgroundColor: C.offWhite,
    borderRadius: 7,
    borderLeftWidth: 3,
    borderLeftColor: C.teal,
    padding: 11,
    marginBottom: 14,
  },
  clientTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: C.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  clientGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  clientField: { width: '50%', marginBottom: 5, paddingRight: 8 },
  fieldLabel: {
    fontSize: 6.5,
    color: C.grayD,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  fieldValue: { fontSize: 9, color: C.ink },

  // ── Tabla ─────────────────────────────────────────────────────────────────
  tableHead: {
    backgroundColor: C.blue,
    flexDirection: 'row',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 5,
  },
  thCell: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: C.white,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.grayL,
    alignItems: 'center',
  },
  rowEven: { backgroundColor: C.white },
  rowOdd:  { backgroundColor: '#f8faff' },
  tdCell:  { fontSize: 9, color: C.ink },
  tdBold:  { fontWeight: 'bold' },
  tdSub:   { fontSize: 7, color: C.grayD, marginTop: 1 },

  cDesc:  { width: '46%' },
  cQty:   { width: '14%', textAlign: 'center' },
  cPrice: { width: '20%', textAlign: 'right' },
  cTotal: { width: '20%', textAlign: 'right' },

  // ── Totales ───────────────────────────────────────────────────────────────
  totalsWrap: { alignItems: 'flex-end', marginTop: 10, marginBottom: 14 },
  totalsBox: {
    width: 195,
    backgroundColor: C.offWhite,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.grayL,
    overflow: 'hidden',
  },
  totalsInner: { paddingHorizontal: 13, paddingVertical: 9 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalRowLabel: { fontSize: 8.5, color: C.grayD },
  totalRowValue: { fontSize: 8.5, color: C.ink },
  totalFinalBg: {
    backgroundColor: C.blue,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalFinalLabel: { fontSize: 10, fontWeight: 'bold', color: C.white },
  totalFinalValue: { fontSize: 15, fontWeight: 'bold', color: C.orange },

  // ── Notas ─────────────────────────────────────────────────────────────────
  notesCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.blueLight,
    padding: 9,
    marginBottom: 12,
  },
  notesTitle: { fontSize: 8.5, fontWeight: 'bold', color: C.blue, marginBottom: 3 },
  notesText:  { fontSize: 8, color: C.grayD, lineHeight: 1.5 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.grayL,
    paddingTop: 12,
    alignItems: 'center',
  },
  footerThanks:  { fontSize: 11, fontWeight: 'bold', color: C.blue, marginBottom: 3 },
  footerContact: { fontSize: 7.5, color: C.grayD },
  watermarkWrap: { alignItems: 'center', marginTop: 16 },
  watermark: { width: 110, height: 110, opacity: 0.05, objectFit: 'contain' },
});

// ─── Componente ──────────────────────────────────────────────────────────────
interface InvoicePDFDocumentProps {
  data: InvoiceData;
  logoBase64?: string;
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ data, logoBase64 }) => (
  <Document>
    <Page size="A4" style={s.page}>

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            {logoBase64 && (
              <View style={s.logoBox}>
                <Image src={logoBase64} style={s.logoImg} />
              </View>
            )}
            <View>
              <Text style={s.companyName}>Tropicolors</Text>
              <Text style={s.companyLine}>
                {data.company.address}{'\n'}
                {data.company.phone}{'   '}{data.company.email}
                {data.company.rfc ? `\nRFC: ${data.company.rfc}` : ''}
              </Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <View style={s.folioBadge}>
              <Text style={s.folioText}>{data.invoiceNumberFormatted || data.invoiceNumber}</Text>
            </View>
            <View style={s.dateBadge}>
              <Text style={s.dateText}>{formatDate(data.issueDate)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* FRANJA TEAL */}
      <View style={s.metaStripe}>
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Método de Pago</Text>
          <Text style={s.metaValue}>{getPaymentMethodLabel(data.paymentMethod)}</Text>
        </View>
        {data.dueDate && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Vencimiento</Text>
            <Text style={s.metaValue}>{formatDate(data.dueDate)}</Text>
          </View>
        )}
        {data.orderId && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Pedido</Text>
            <Text style={s.metaValueOrange}>#{data.orderId}</Text>
          </View>
        )}
      </View>

      {/* CUERPO */}
      <View style={s.body}>

        {/* Cliente */}
        <View style={s.clientCard}>
          <Text style={s.clientTitle}>Datos del Cliente</Text>
          <View style={s.clientGrid}>
            <View style={s.clientField}>
              <Text style={s.fieldLabel}>Nombre</Text>
              <Text style={s.fieldValue}>{data.customer.name}</Text>
            </View>
            <View style={s.clientField}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{data.customer.email}</Text>
            </View>
            {data.customer.phone && (
              <View style={s.clientField}>
                <Text style={s.fieldLabel}>Teléfono</Text>
                <Text style={s.fieldValue}>{data.customer.phone}</Text>
              </View>
            )}
            {data.customer.address && (
              <View style={s.clientField}>
                <Text style={s.fieldLabel}>Dirección</Text>
                <Text style={s.fieldValue}>
                  {data.customer.address}
                  {data.customer.city       ? `, ${data.customer.city}`           : ''}
                  {data.customer.state      ? `, ${data.customer.state}`          : ''}
                  {data.customer.postalCode ? ` C.P. ${data.customer.postalCode}` : ''}
                </Text>
              </View>
            )}
            {data.customer.rfc && (
              <View style={s.clientField}>
                <Text style={s.fieldLabel}>RFC</Text>
                <Text style={s.fieldValue}>{data.customer.rfc}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabla */}
        <View style={s.tableHead}>
          <Text style={[s.thCell, s.cDesc]}>Producto</Text>
          <Text style={[s.thCell, s.cQty]}>Cant.</Text>
          <Text style={[s.thCell, s.cPrice]}>P. Unit.</Text>
          <Text style={[s.thCell, s.cTotal]}>Importe</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={item.id} style={[s.tableRow, i % 2 === 0 ? s.rowEven : s.rowOdd]}>
            <View style={s.cDesc}>
              <Text style={[s.tdCell, s.tdBold]}>{item.name}</Text>
              {item.description && <Text style={s.tdSub}>{item.description}</Text>}
            </View>
            <Text style={[s.tdCell, s.cQty]}>{item.quantity}</Text>
            <Text style={[s.tdCell, s.cPrice]}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={[s.tdCell, s.cTotal]}>{formatCurrency(item.subtotal)}</Text>
          </View>
        ))}

        {/* Totales */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalsInner}>
              <View style={s.totalRow}>
                <Text style={s.totalRowLabel}>Subtotal</Text>
                <Text style={s.totalRowValue}>{formatCurrency(data.subtotal)}</Text>
              </View>
              {data.taxRate > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalRowLabel}>IVA ({data.taxRate * 100}%)</Text>
                  <Text style={s.totalRowValue}>{formatCurrency(data.taxAmount)}</Text>
                </View>
              )}
              {data.discount && data.discount > 0 && (
                <View style={s.totalRow}>
                  <Text style={[s.totalRowLabel, { color: C.teal }]}>Descuento</Text>
                  <Text style={[s.totalRowValue, { color: C.teal }]}>-{formatCurrency(data.discount)}</Text>
                </View>
              )}
            </View>
            <View style={s.totalFinalBg}>
              <Text style={s.totalFinalLabel}>Total</Text>
              <Text style={s.totalFinalValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notas */}
        {data.notes && (
          <View style={s.notesCard}>
            <Text style={s.notesTitle}>Notas</Text>
            <Text style={s.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerThanks}>¡Gracias por su compra!</Text>
          <Text style={s.footerContact}>
            Para cualquier duda contáctenos a {data.company.email}
          </Text>
          {logoBase64 && (
            <View style={s.watermarkWrap}>
              <Image src={logoBase64} style={s.watermark} />
            </View>
          )}
        </View>

      </View>
    </Page>
  </Document>
);

export default InvoicePDFDocument;