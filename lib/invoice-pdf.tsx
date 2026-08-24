/* eslint-disable jsx-a11y/alt-text -- @react-pdf Image is not an HTML image and does not expose an alt prop */
import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { companyContact } from "./company";
import { invoiceSubtotal, invoiceTotal, type Invoice } from "./business-documents";
import { formatRupiah } from "./quotations";

Font.registerHyphenationCallback((word) => [word]);
const colors = { ink: "#071827", navy: "#0a2a43", blue: "#176fe8", muted: "#587184", line: "#c9d8e3", pale: "#edf7fc", white: "#ffffff" };
const styles = StyleSheet.create({
  page: { paddingTop: 26, paddingRight: 36, paddingBottom: 50, paddingLeft: 36, fontFamily: "Helvetica", color: colors.ink, fontSize: 8, lineHeight: 1.35 },
  topLine: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: colors.blue },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 9, borderBottomWidth: 1.5, borderBottomColor: colors.blue },
  logoBox: { display: "flex", width: 70, height: 54, marginRight: 14, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: colors.ink },
  logo: { width: 59, height: 48, objectFit: "contain" },
  company: { flexGrow: 1, borderLeftWidth: 1.3, borderLeftColor: colors.blue, paddingLeft: 15 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#0d3f91", letterSpacing: 0.3 },
  tagline: { marginTop: 3, fontFamily: "Helvetica-Bold", fontSize: 7.5, color: colors.blue, letterSpacing: 1.2 },
  contact: { marginTop: 8, flexDirection: "row", gap: 14, color: colors.muted, fontSize: 7.2 },
  contactLabel: { color: colors.blue, fontFamily: "Helvetica-Bold" },
  officeAddress: { marginTop: 5, maxWidth: 390, color: colors.muted, fontSize: 6.4, lineHeight: 1.3 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14, marginBottom: 12 },
  titleBlock: { width: 285 },
  documentTitle: { fontFamily: "Helvetica-Bold", fontSize: 23, lineHeight: 1.05, color: colors.navy, letterSpacing: 1 },
  documentSubtitle: { marginTop: 7, color: colors.muted, fontSize: 8 },
  metaCard: { width: 190, padding: 9, borderRadius: 6, backgroundColor: colors.pale },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metaLabel: { color: colors.muted }, metaValue: { maxWidth: 120, fontFamily: "Helvetica-Bold", textAlign: "right", color: colors.navy },
  status: { marginTop: 3, alignSelf: "flex-end", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: colors.blue, color: colors.white, fontFamily: "Helvetica-Bold", fontSize: 6.8, letterSpacing: 0.8 },
  clientCard: { padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 6, flexDirection: "row", gap: 18 },
  clientColumn: { flex: 1 }, eyebrow: { marginBottom: 5, color: colors.blue, fontFamily: "Helvetica-Bold", fontSize: 6.8, letterSpacing: 1.1 },
  clientCompany: { fontFamily: "Helvetica-Bold", fontSize: 11, color: colors.navy }, clientText: { marginTop: 2, color: colors.muted }, subject: { fontFamily: "Helvetica-Bold", color: colors.navy },
  intro: { marginTop: 9, marginBottom: 8, color: colors.muted },
  table: { borderWidth: 1, borderColor: colors.line, borderRadius: 5, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.line, minHeight: 26, alignItems: "center" },
  tableHead: { backgroundColor: colors.navy, color: colors.white, fontFamily: "Helvetica-Bold", minHeight: 24 },
  colNo: { width: "6%", padding: 6, textAlign: "center" }, colService: { width: "45%", padding: 6 }, colQty: { width: "10%", padding: 6, textAlign: "center" }, colPrice: { width: "19%", padding: 6, textAlign: "right" }, colTotal: { width: "20%", padding: 6, textAlign: "right" },
  itemName: { fontFamily: "Helvetica-Bold", color: colors.navy }, itemDescription: { marginTop: 2, color: colors.muted, fontSize: 7.2 },
  summaryWrap: { marginTop: 9, flexDirection: "row", justifyContent: "flex-end" }, summary: { width: 240 }, summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.line },
  totalRow: { marginTop: 4, paddingVertical: 8, paddingHorizontal: 9, borderRadius: 5, backgroundColor: colors.blue, color: colors.white, flexDirection: "row", justifyContent: "space-between", fontFamily: "Helvetica-Bold", fontSize: 10.5 }, taxNote: { marginTop: 5, color: colors.muted, fontSize: 6.8, textAlign: "right" },
  section: { marginTop: 10 }, sectionTitle: { marginBottom: 5, fontFamily: "Helvetica-Bold", fontSize: 9, color: colors.navy }, twoColumns: { flexDirection: "row", gap: 10 }, infoColumn: { flex: 1 },
  paymentBox: { padding: 9, borderRadius: 6, backgroundColor: colors.pale, flexDirection: "row", gap: 18 }, paymentColumn: { flex: 1 }, paymentValue: { marginTop: 2, fontFamily: "Helvetica-Bold", color: colors.navy }, terms: { padding: 8, borderRadius: 5, backgroundColor: colors.pale, color: colors.muted },
  signature: { width: 245, marginTop: 6 }, signatureArtwork: { position: "relative", height: 45, marginTop: 1 }, signatureInk: { position: "absolute", left: 0, top: 10, width: 105, height: 34, objectFit: "contain" }, signatureStamp: { position: "absolute", left: 70, top: 0, width: 45, height: 45, objectFit: "contain", opacity: 0.88 }, signaturePlaceholder: { height: 45, marginTop: 1 }, signatureLine: { paddingTop: 3, borderTopWidth: 1, borderTopColor: colors.navy },
  footerLine: { position: "absolute", left: 36, right: 36, bottom: 35, height: 2.4, backgroundColor: colors.blue }, footerLineThin: { position: "absolute", left: 36, right: 36, bottom: 39, height: 0.8, backgroundColor: colors.blue }, footerText: { position: "absolute", left: 36, bottom: 22, color: colors.muted, fontSize: 6.5 }, pageNumber: { position: "absolute", right: 36, bottom: 22, width: 70, color: colors.blue, fontFamily: "Helvetica-Bold", fontSize: 6.5, textAlign: "right" },
});

function dateLabel(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function idr(value: number) { return formatRupiah(value).replace(/\u00a0/g, " "); }

export function InvoicePdf({ invoice, logoSrc, signatureSrc, stampSrc }: { invoice: Invoice; logoSrc: string; signatureSrc?: string; stampSrc?: string }) {
  const subtotal = invoiceSubtotal(invoice); const total = invoiceTotal(invoice); const account = invoice.payment_account_snapshot;
  return <Document title={`${invoice.invoice_number} - ${invoice.customer_company}`} author={companyContact.legalName} subject={invoice.subject} creator="RETECH Admin CMS"><Page size="A4" style={styles.page}>
    <View style={styles.topLine} fixed /><View style={styles.header} fixed><View style={styles.logoBox}><Image style={styles.logo} src={logoSrc} /></View><View style={styles.company}><Text style={styles.companyName}>PT RETECH DIGITAL SOLUTION</Text><Text style={styles.tagline}>DIGITAL SOLUTION FOR YOUR BUSINESS</Text><View style={styles.contact}><Text><Text style={styles.contactLabel}>WA </Text>{companyContact.whatsappDisplay} (chat only)</Text><Text><Text style={styles.contactLabel}>EMAIL </Text>{companyContact.email}</Text><Text><Text style={styles.contactLabel}>WEB </Text>retech.id</Text></View><Text style={styles.officeAddress}><Text style={styles.contactLabel}>OFFICE </Text>{companyContact.address}</Text></View></View>
    <View style={styles.footerLineThin} fixed /><View style={styles.footerLine} fixed /><Text style={styles.footerText} fixed>PT RETECH DIGITAL SOLUTION - DIGITAL SOLUTION FOR YOUR BUSINESS - retech.id</Text><Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `PAGE ${pageNumber}/${totalPages}`} />
    <View style={styles.titleRow}><View style={styles.titleBlock}><Text style={styles.documentTitle}>INVOICE</Text><Text style={styles.documentSubtitle}>Tagihan layanan teknologi dan pekerjaan profesional</Text></View><View style={styles.metaCard}><View style={styles.metaRow}><Text style={styles.metaLabel}>Nomor</Text><Text style={styles.metaValue}>{invoice.invoice_number}</Text></View><View style={styles.metaRow}><Text style={styles.metaLabel}>Tanggal</Text><Text style={styles.metaValue}>{dateLabel(invoice.issue_date)}</Text></View><View style={styles.metaRow}><Text style={styles.metaLabel}>Jatuh tempo</Text><Text style={styles.metaValue}>{dateLabel(invoice.due_date)}</Text></View><Text style={styles.status}>{invoice.status.replace("_", " ").toUpperCase()}</Text></View></View>
    <View style={styles.clientCard}><View style={styles.clientColumn}><Text style={styles.eyebrow}>DITAGIHKAN KEPADA</Text><Text style={styles.clientCompany}>{invoice.customer_company}</Text><Text style={styles.clientText}>Attn. {invoice.customer_name}</Text>{invoice.customer_address && <Text style={styles.clientText}>{invoice.customer_address}</Text>}</View><View style={styles.clientColumn}><Text style={styles.eyebrow}>KONTAK CUSTOMER</Text>{invoice.customer_email && <Text style={styles.clientText}>{invoice.customer_email}</Text>}{invoice.customer_phone && <Text style={styles.clientText}>{invoice.customer_phone}</Text>}<Text style={[styles.clientText, { marginTop: 7 }]}><Text style={styles.subject}>Perihal: </Text>{invoice.subject}</Text></View></View>
    <Text style={styles.intro}>Berikut tagihan atas layanan atau pekerjaan yang telah disepakati. Mohon lakukan pembayaran sebelum tanggal jatuh tempo dan cantumkan nomor invoice pada berita transfer.</Text>
    <View style={styles.table}><View style={[styles.tableRow, styles.tableHead]} fixed><Text style={styles.colNo}>NO</Text><Text style={styles.colService}>LAYANAN / TAGIHAN</Text><Text style={styles.colQty}>QTY</Text><Text style={styles.colPrice}>HARGA</Text><Text style={styles.colTotal}>JUMLAH</Text></View>{invoice.items.map((item, index) => <View style={styles.tableRow} key={`${item.name}-${index}`} wrap={false}><Text style={styles.colNo}>{index + 1}</Text><View style={styles.colService}><Text style={styles.itemName}>{item.name}</Text>{item.description && <Text style={styles.itemDescription}>{item.description}</Text>}</View><Text style={styles.colQty}>{item.quantity} {item.unit}</Text><Text style={styles.colPrice}>{idr(item.unitPrice)}</Text><Text style={styles.colTotal}>{idr(item.quantity * item.unitPrice)}</Text></View>)}</View>
    <View style={styles.summaryWrap} wrap={false}><View style={styles.summary}><View style={styles.summaryRow}><Text>Subtotal</Text><Text>{idr(subtotal)}</Text></View>{invoice.discount_amount > 0 && <View style={styles.summaryRow}><Text>Diskon</Text><Text>- {idr(invoice.discount_amount)}</Text></View>}<View style={styles.totalRow}><Text>TOTAL INVOICE</Text><Text>{idr(total)}</Text></View><Text style={styles.taxNote}>PPN tidak dikenakan. RETECH saat ini bukan Pengusaha Kena Pajak (Non-PKP).</Text></View></View>
    <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>INFORMASI PEMBAYARAN</Text><View style={styles.paymentBox}><View style={styles.paymentColumn}><Text style={styles.eyebrow}>BANK</Text><Text style={styles.paymentValue}>{account.bank_name}</Text>{account.branch && <Text style={styles.clientText}>Cabang {account.branch}</Text>}</View><View style={styles.paymentColumn}><Text style={styles.eyebrow}>NAMA REKENING</Text><Text style={styles.paymentValue}>{account.account_name}</Text></View><View style={styles.paymentColumn}><Text style={styles.eyebrow}>NOMOR REKENING</Text><Text style={styles.paymentValue}>{account.account_number}</Text><Text style={styles.clientText}>{account.currency}</Text></View></View>{account.instructions && <Text style={[styles.clientText, { marginTop: 6 }]}>{account.instructions}</Text>}</View>
    {(invoice.payment_terms || invoice.notes) && <View style={[styles.section, styles.twoColumns]} wrap={false}>{invoice.payment_terms && <View style={styles.infoColumn}><Text style={styles.sectionTitle}>SYARAT PEMBAYARAN</Text><Text style={styles.terms}>{invoice.payment_terms}</Text></View>}{invoice.notes && <View style={styles.infoColumn}><Text style={styles.sectionTitle}>CATATAN</Text><Text style={styles.terms}>{invoice.notes}</Text></View>}</View>}
    <View style={styles.signature} wrap={false}><Text>Hormat kami,</Text>{signatureSrc && stampSrc ? <View style={styles.signatureArtwork}><Image style={styles.signatureStamp} src={stampSrc} /><Image style={styles.signatureInk} src={signatureSrc} /></View> : <View style={styles.signaturePlaceholder} />}<Text style={styles.signatureLine}>PT RETECH DIGITAL SOLUTION</Text><Text style={styles.clientText}>Authorized Representative</Text></View>
  </Page></Document>;
}
