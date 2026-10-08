import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { InvoiceData } from "../types/invoice";
import {
  formatCurrency,
  formatCustomerAddress,
  formatDate,
  getPaymentMethodLabel,
  getStatusLabel,
} from "../types/invoice";

const COLORS = {
  navy: "#071A34",
  blue: "#003F91",
  cyan: "#00AFC7",
  yellow: "#FFD400",
  orange: "#FF7A00",
  pink: "#F72585",
  white: "#FFFFFF",
  canvas: "#F4F7FB",
  surface: "#FFFFFF",
  ink: "#10233F",
  muted: "#5E7088",
  line: "#DCE5F0",
  softCyan: "#E8FAFC",
  softYellow: "#FFF8D6",
  softRed: "#FEECEC",
  red: "#DC2626",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.ink,
    backgroundColor: COLORS.canvas,
  },
  spectrum: { height: 7, flexDirection: "row" },
  spectrumPart: { flex: 1 },
  hero: {
    minHeight: 174,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 30,
    paddingTop: 22,
    paddingBottom: 32,
    position: "relative",
    overflow: "hidden",
  },
  heroOrb: {
    position: "absolute",
    width: 178,
    height: 178,
    borderRadius: 89,
    right: -56,
    top: -62,
    backgroundColor: "#0B5AC2",
    opacity: 0.42,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "68%",
  },
  logoPlate: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    padding: 4,
  },
  logo: { width: 42, height: 42, objectFit: "contain" },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  brandTagline: {
    marginTop: 3,
    fontSize: 7.5,
    color: "#B8D5FF",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  invoiceCopy: { width: "65%", marginTop: 18 },
  eyebrow: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#7DE5F0",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  invoiceTitle: {
    marginTop: 4,
    fontSize: 29,
    lineHeight: 1,
    fontWeight: "bold",
    color: COLORS.white,
  },
  invoiceNumber: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.yellow,
    letterSpacing: 0.6,
  },
  mascot: {
    position: "absolute",
    right: 21,
    bottom: 8,
    width: 126,
    height: 126,
    objectFit: "contain",
  },
  statusPill: {
    position: "absolute",
    right: 26,
    top: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  content: { paddingHorizontal: 28, paddingBottom: 18 },
  metaCard: {
    marginTop: -18,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  metaColumn: {
    flex: 1,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.line,
  },
  metaColumnLast: { flex: 1, paddingHorizontal: 8 },
  label: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: COLORS.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaValue: {
    marginTop: 4,
    fontSize: 8.5,
    fontWeight: "bold",
    color: COLORS.ink,
  },
  partiesRow: { flexDirection: "row", marginBottom: 15 },
  partyCard: {
    width: "49%",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
  },
  partyCardRight: {
    marginLeft: "2%",
    borderTopWidth: 3,
    borderTopColor: COLORS.cyan,
  },
  partyCardLeft: { borderTopWidth: 3, borderTopColor: COLORS.blue },
  partyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  partyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  partyTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.ink,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  primaryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.ink,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 7.5,
    lineHeight: 1.45,
    color: COLORS.muted,
    marginBottom: 2,
  },
  inlineLabel: { fontWeight: "bold", color: COLORS.ink },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: COLORS.ink },
  sectionHint: { fontSize: 7, color: COLORS.muted },
  table: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  tableHeadText: {
    fontSize: 7,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  tableRowAlt: { backgroundColor: "#F8FBFF" },
  tableText: { fontSize: 8.5, color: COLORS.ink },
  tableStrong: { fontWeight: "bold" },
  tableSub: { marginTop: 2, fontSize: 7, color: COLORS.muted },
  productColumn: { width: "46%" },
  quantityColumn: { width: "12%", textAlign: "center" },
  priceColumn: { width: "21%", textAlign: "right" },
  amountColumn: { width: "21%", textAlign: "right" },
  closingRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 13,
    marginBottom: 12,
  },
  paymentCard: {
    width: "54%",
    borderRadius: 10,
    backgroundColor: COLORS.softCyan,
    borderWidth: 1,
    borderColor: "#BDECF1",
    padding: 12,
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.blue,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  paymentText: {
    marginTop: 6,
    fontSize: 8,
    lineHeight: 1.45,
    color: COLORS.muted,
  },
  totalsCard: {
    width: "44%",
    marginLeft: "2%",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  totalsBody: { paddingHorizontal: 13, paddingVertical: 10 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLineLabel: { fontSize: 8, color: COLORS.muted },
  totalLineValue: { fontSize: 8, fontWeight: "bold", color: COLORS.ink },
  grandTotal: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#B8D5FF",
    textTransform: "uppercase",
  },
  grandTotalValue: { fontSize: 15, fontWeight: "bold", color: COLORS.yellow },
  notesCard: {
    borderRadius: 9,
    backgroundColor: COLORS.softYellow,
    borderWidth: 1,
    borderColor: "#F4E49C",
    padding: 10,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: COLORS.ink,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: { fontSize: 7.5, lineHeight: 1.45, color: COLORS.muted },
  footer: {
    marginTop: "auto",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: 28,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerThanks: { fontSize: 10, fontWeight: "bold", color: COLORS.blue },
  footerText: { marginTop: 3, fontSize: 7, color: COLORS.muted },
  footerRight: { alignItems: "flex-end" },
  pageNumber: { fontSize: 7, fontWeight: "bold", color: COLORS.muted },
});

interface InvoicePDFDocumentProps {
  data: InvoiceData;
  logoBase64?: string;
  mascotBase64?: string;
}

function statusPalette(status: InvoiceData["status"]) {
  if (status === "paid") {
    return {
      backgroundColor: "#DDF8E7",
      borderColor: "#61CF88",
      color: "#13743A",
    };
  }
  if (status === "cancelled" || status === "overdue") {
    return {
      backgroundColor: COLORS.softRed,
      borderColor: "#F3A4A4",
      color: COLORS.red,
    };
  }
  return {
    backgroundColor: COLORS.softYellow,
    borderColor: "#EBCB55",
    color: "#8A6200",
  };
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({
  data,
  logoBase64,
  mascotBase64,
}) => {
  const statusColors = statusPalette(data.status);
  const customerAddress = formatCustomerAddress(data.customer);
  const invoiceNumber = data.invoiceNumberFormatted || data.invoiceNumber;

  return (
    <Document
      title={`Factura ${invoiceNumber}`}
      author="Tropicolors"
      subject="Comprobante comercial"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.spectrum} fixed>
          <View style={[styles.spectrumPart, { backgroundColor: COLORS.pink }]} />
          <View style={[styles.spectrumPart, { backgroundColor: COLORS.orange }]} />
          <View style={[styles.spectrumPart, { backgroundColor: COLORS.yellow }]} />
          <View style={[styles.spectrumPart, { backgroundColor: COLORS.cyan }]} />
          <View style={[styles.spectrumPart, { backgroundColor: COLORS.blue }]} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <View style={styles.brandRow}>
            {logoBase64 ? (
              <View style={styles.logoPlate}>
                <Image src={logoBase64} style={styles.logo} />
              </View>
            ) : null}
            <View>
              <Text style={styles.brandName}>TROPICOLORS</Text>
              <Text style={styles.brandTagline}>Colores que hacen destacar</Text>
            </View>
          </View>

          <View style={styles.invoiceCopy}>
            <Text style={styles.eyebrow}>Documento comercial</Text>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusColors.backgroundColor,
                borderColor: statusColors.borderColor,
              },
            ]}
          >
            <Text style={[styles.statusPillText, { color: statusColors.color }]}>
              {getStatusLabel(data.status)}
            </Text>
          </View>

          {mascotBase64 ? <Image src={mascotBase64} style={styles.mascot} /> : null}
        </View>

        <View style={styles.content}>
          <View style={styles.metaCard} wrap={false}>
            <View style={styles.metaColumn}>
              <Text style={styles.label}>Fecha de emisión</Text>
              <Text style={styles.metaValue}>{formatDate(data.issueDate)}</Text>
            </View>
            <View style={styles.metaColumn}>
              <Text style={styles.label}>Método de pago</Text>
              <Text style={styles.metaValue}>
                {getPaymentMethodLabel(data.paymentMethod)}
              </Text>
            </View>
            <View style={styles.metaColumnLast}>
              <Text style={styles.label}>Pedido relacionado</Text>
              <Text style={styles.metaValue}>
                {data.orderId ? `#${data.orderId}` : "No especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.partiesRow} wrap={false}>
            <View style={[styles.partyCard, styles.partyCardLeft]}>
              <View style={styles.partyTitleRow}>
                <View style={[styles.partyDot, { backgroundColor: COLORS.blue }]} />
                <Text style={styles.partyTitle}>Emisor</Text>
              </View>
              <Text style={styles.primaryText}>{data.company.name}</Text>
              <Text style={styles.detailText}>{data.company.address}</Text>
              <Text style={styles.detailText}>
                {data.company.phone} · {data.company.email}
              </Text>
              {data.company.rfc ? (
                <Text style={styles.detailText}>
                  <Text style={styles.inlineLabel}>RFC: </Text>
                  {data.company.rfc}
                </Text>
              ) : null}
            </View>

            <View style={[styles.partyCard, styles.partyCardRight]}>
              <View style={styles.partyTitleRow}>
                <View style={[styles.partyDot, { backgroundColor: COLORS.cyan }]} />
                <Text style={styles.partyTitle}>Facturado a</Text>
              </View>
              <Text style={styles.primaryText}>{data.customer.name}</Text>
              <Text style={styles.detailText}>{data.customer.email}</Text>
              {data.customer.phone ? (
                <Text style={styles.detailText}>{data.customer.phone}</Text>
              ) : null}
              {customerAddress ? (
                <Text style={styles.detailText}>{customerAddress}</Text>
              ) : null}
              {data.customer.rfc ? (
                <Text style={styles.detailText}>
                  <Text style={styles.inlineLabel}>RFC: </Text>
                  {data.customer.rfc}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detalle de compra</Text>
            <Text style={styles.sectionHint}>{data.items.length} concepto(s)</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHead} fixed>
              <Text style={[styles.tableHeadText, styles.productColumn]}>Producto</Text>
              <Text style={[styles.tableHeadText, styles.quantityColumn]}>Cant.</Text>
              <Text style={[styles.tableHeadText, styles.priceColumn]}>P. unitario</Text>
              <Text style={[styles.tableHeadText, styles.amountColumn]}>Importe</Text>
            </View>
            {data.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
                wrap={false}
              >
                <View style={styles.productColumn}>
                  <Text style={[styles.tableText, styles.tableStrong]}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.tableSub}>{item.description}</Text>
                  ) : null}
                </View>
                <Text style={[styles.tableText, styles.quantityColumn]}>{item.quantity}</Text>
                <Text style={[styles.tableText, styles.priceColumn]}>
                  {formatCurrency(item.unitPrice)}
                </Text>
                <Text style={[styles.tableText, styles.tableStrong, styles.amountColumn]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.closingRow} wrap={false}>
            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Resumen del comprobante</Text>
              <Text style={styles.paymentText}>
                Este documento corresponde al pedido indicado. Conserva el folio para
                cualquier aclaración con nuestro equipo.
              </Text>
              {data.dueDate ? (
                <Text style={styles.paymentText}>
                  <Text style={styles.inlineLabel}>Vencimiento: </Text>
                  {formatDate(data.dueDate)}
                </Text>
              ) : null}
            </View>

            <View style={styles.totalsCard}>
              <View style={styles.totalsBody}>
                <View style={styles.totalLine}>
                  <Text style={styles.totalLineLabel}>Subtotal</Text>
                  <Text style={styles.totalLineValue}>{formatCurrency(data.subtotal)}</Text>
                </View>
                {data.shippingFee && data.shippingFee > 0 ? (
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Envío</Text>
                    <Text style={styles.totalLineValue}>
                      {formatCurrency(data.shippingFee)}
                    </Text>
                  </View>
                ) : null}
                {data.taxRate > 0 ? (
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>IVA ({data.taxRate * 100}%)</Text>
                    <Text style={styles.totalLineValue}>
                      {formatCurrency(data.taxAmount)}
                    </Text>
                  </View>
                ) : null}
                {data.discount && data.discount > 0 ? (
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLineLabel}>Descuento</Text>
                    <Text style={styles.totalLineValue}>
                      -{formatCurrency(data.discount)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total MXN</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
              </View>
            </View>
          </View>

          {data.notes ? (
            <View style={styles.notesCard} wrap={false}>
              <Text style={styles.notesTitle}>Notas</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerThanks}>Gracias por elegir Tropicolors.</Text>
            <Text style={styles.footerText}>
              Dudas y aclaraciones: {data.company.email} · {data.company.phone}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
            {data.company.website ? (
              <Text style={styles.footerText}>{data.company.website}</Text>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDFDocument;
