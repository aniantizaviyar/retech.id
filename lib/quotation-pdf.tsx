/* eslint-disable jsx-a11y/alt-text -- @react-pdf Image is not an HTML image and does not expose an alt prop */
import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { companyContact } from "./company";
import { formatRupiah, quotationSubtotal, quotationTotal, type Quotation } from "./quotations";

Font.registerHyphenationCallback((word) => [word]);

const colors = { ink: "#071827", navy: "#0a2a43", blue: "#176fe8", cyan: "#18bfee", muted: "#587184", line: "#c9d8e3", pale: "#edf7fc", white: "#ffffff", green: "#168361" };
const styles = StyleSheet.create({
  page: { paddingTop: 100, paddingRight: 36, paddingBottom: 42, paddingLeft: 36, fontFamily: "Helvetica", color: colors.ink, fontSize: 7.8, lineHeight: 1.3 },
  topLine: { position: "absolute", top: 0, left: 0, right: 0, height: 6, backgroundColor: colors.blue },
  header: { position: "absolute", top: 22, left: 36, right: 36, flexDirection: "row", alignItems: "center", paddingBottom: 7, borderBottomWidth: 1.5, borderBottomColor: colors.blue },
  logoBox: { display: "flex", width: 70, height: 54, marginRight: 14, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: colors.ink },
  logo: { width: 59, height: 48, objectFit: "contain" },
  company: { flexGrow: 1, borderLeftWidth: 1.3, borderLeftColor: colors.blue, paddingLeft: 15 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#0d3f91", letterSpacing: 0.3 },
  tagline: { marginTop: 3, fontFamily: "Helvetica-Bold", fontSize: 7.5, color: colors.blue, letterSpacing: 1.2 },
  contact: { marginTop: 8, flexDirection: "row", gap: 14, color: colors.muted, fontSize: 7.2 },
  contactLabel: { color: colors.blue, fontFamily: "Helvetica-Bold" },
  officeAddress: { marginTop: 5, maxWidth: 390, color: colors.muted, fontSize: 6.4, lineHeight: 1.3 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, marginBottom: 6 },
  titleBlock: { width: 285 },
  documentTitle: { fontFamily: "Helvetica-Bold", fontSize: 23, lineHeight: 1.05, color: colors.navy, letterSpacing: 1 },
  documentSubtitle: { marginTop: 7, color: colors.muted, fontSize: 8 },
  metaCard: { width: 190, padding: 7, borderRadius: 6, backgroundColor: colors.pale },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  metaLabel: { color: colors.muted },
  metaValue: { maxWidth: 120, fontFamily: "Helvetica-Bold", textAlign: "right", color: colors.navy },
  status: { marginTop: 2, alignSelf: "flex-end", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20, backgroundColor: colors.blue, color: colors.white, fontFamily: "Helvetica-Bold", fontSize: 6.8, letterSpacing: 0.8 },
  clientCard: { padding: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 6, flexDirection: "row", gap: 16 },
  clientColumn: { flex: 1 },
  eyebrow: { marginBottom: 3, color: colors.blue, fontFamily: "Helvetica-Bold", fontSize: 6.8, letterSpacing: 1.1 },
  clientCompany: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: colors.navy },
  clientText: { marginTop: 1, color: colors.muted },
  intro: { marginTop: 6, marginBottom: 5, color: colors.muted },
  subject: { fontFamily: "Helvetica-Bold", color: colors.navy },
  section: { marginTop: 7 },
  sectionTitle: { marginBottom: 4, fontFamily: "Helvetica-Bold", fontSize: 8.7, color: colors.navy },
  table: { borderWidth: 1, borderColor: colors.line, borderRadius: 5, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.line, minHeight: 24, alignItems: "center" },
  tableHead: { backgroundColor: colors.navy, color: colors.white, fontFamily: "Helvetica-Bold", minHeight: 23 },
  colNo: { width: "5%", padding: 4, textAlign: "center" },
  colService: { width: "52%", padding: 4 },
  colQty: { width: "9%", padding: 4, textAlign: "center" },
  colPrice: { width: "18%", padding: 4, textAlign: "right" },
  colTotal: { width: "16%", padding: 4, textAlign: "right" },
  itemName: { fontFamily: "Helvetica-Bold", color: colors.navy },
  itemDescription: { marginTop: 1, color: colors.muted, fontSize: 6.4, lineHeight: 1.18 },
  summaryWrap: { marginTop: 6, flexDirection: "row", justifyContent: "flex-end" },
  summary: { width: 240 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5, borderBottomWidth: 1, borderBottomColor: colors.line },
  totalRow: { marginTop: 3, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 5, backgroundColor: colors.blue, color: colors.white, flexDirection: "row", justifyContent: "space-between", fontFamily: "Helvetica-Bold", fontSize: 10 },
  taxNote: { marginTop: 3, color: colors.muted, fontSize: 6.5, textAlign: "right" },
  twoColumns: { flexDirection: "row", gap: 10 },
  infoBox: { flex: 1, minHeight: 48, padding: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 5 },
  infoTitle: { marginBottom: 4, fontFamily: "Helvetica-Bold", color: colors.blue, fontSize: 6.8, letterSpacing: 0.7 },
  listItem: { marginBottom: 1.5, flexDirection: "row" },
  bullet: { width: 10, color: colors.blue, fontFamily: "Helvetica-Bold" },
  listText: { flex: 1, color: colors.muted },
  terms: { padding: 6, borderRadius: 5, backgroundColor: colors.pale, color: colors.muted },
  signatureRow: { marginTop: 6, flexDirection: "row", gap: 30 },
  signature: { flex: 1 },
  signatureArtwork: { position: "relative", height: 42, marginTop: 1 },
  signatureInk: { position: "absolute", left: 0, top: 9, width: 100, height: 32, objectFit: "contain" },
  signatureStamp: { position: "absolute", left: 70, top: 0, width: 42, height: 42, objectFit: "contain", opacity: 0.88 },
  signaturePlaceholder: { height: 42, marginTop: 1 },
  signatureLine: { paddingTop: 2, borderTopWidth: 1, borderTopColor: colors.navy },
  signatureName: { fontFamily: "Helvetica-Bold", color: colors.navy },
  footerLine: { position: "absolute", left: 36, right: 36, bottom: 35, height: 2.4, backgroundColor: colors.blue },
  footerLineThin: { position: "absolute", left: 36, right: 36, bottom: 39, height: 0.8, backgroundColor: colors.blue },
  footerText: { position: "absolute", left: 36, bottom: 22, color: colors.muted, fontSize: 6.5 },
  pageNumber: { position: "absolute", right: 36, bottom: 22, width: 70, color: colors.blue, fontFamily: "Helvetica-Bold", fontSize: 6.5, textAlign: "right" },
});

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function idr(value: number) {
  return formatRupiah(value).replace(/\u00a0/g, " ");
}

function List({ entries }: { entries: string[] }) {
  return <>{entries.map((entry, index) => <View style={styles.listItem} key={`${entry}-${index}`}><Text style={styles.bullet}>-</Text><Text style={styles.listText}>{entry}</Text></View>)}</>;
}

export function QuotationPdf({ quotation, logoSrc, signatureSrc, stampSrc }: { quotation: Quotation; logoSrc: string; signatureSrc?: string; stampSrc?: string }) {
  const subtotal = quotationSubtotal(quotation);
  const total = quotationTotal(quotation);
  return <Document title={`${quotation.quote_number} - ${quotation.customer_company}`} author={companyContact.legalName} subject={quotation.subject} creator="RETECH Admin CMS">
    <Page size="A4" style={styles.page}>
      <View style={styles.topLine} fixed />
      <View style={styles.header} fixed>
        <View style={styles.logoBox}><Image style={styles.logo} src={logoSrc} /></View>
        <View style={styles.company}>
          <Text style={styles.companyName}>PT RETECH DIGITAL SOLUTION</Text>
          <Text style={styles.tagline}>DIGITAL SOLUTION FOR YOUR BUSINESS</Text>
          <View style={styles.contact}>
            <Text><Text style={styles.contactLabel}>WA </Text>{companyContact.whatsappDisplay} (chat only)</Text>
            <Text><Text style={styles.contactLabel}>EMAIL </Text>{companyContact.email}</Text>
            <Text><Text style={styles.contactLabel}>WEB </Text>retech.id</Text>
          </View>
          <Text style={styles.officeAddress}><Text style={styles.contactLabel}>OFFICE </Text>{companyContact.address}</Text>
        </View>
      </View>
      <View style={styles.footerLineThin} fixed />
      <View style={styles.footerLine} fixed />
      <Text style={styles.footerText} fixed>PT RETECH DIGITAL SOLUTION - DIGITAL SOLUTION FOR YOUR BUSINESS - retech.id</Text>
      <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `PAGE ${pageNumber}/${totalPages}`} />

      <View style={styles.titleRow}>
        <View style={styles.titleBlock}><Text style={styles.documentTitle}>QUOTATION</Text><Text style={styles.documentSubtitle}>Penawaran solusi teknologi dan layanan profesional</Text></View>
        <View style={styles.metaCard}>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Nomor</Text><Text style={styles.metaValue}>{quotation.quote_number}</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Tanggal</Text><Text style={styles.metaValue}>{dateLabel(quotation.issue_date)}</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Berlaku hingga</Text><Text style={styles.metaValue}>{dateLabel(quotation.valid_until)}</Text></View>
          <Text style={styles.status}>{quotation.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.clientCard}>
        <View style={styles.clientColumn}><Text style={styles.eyebrow}>DITUJUKAN KEPADA</Text><Text style={styles.clientCompany}>{quotation.customer_company}</Text><Text style={styles.clientText}>Attn. {quotation.customer_name}</Text>{quotation.customer_address && <Text style={styles.clientText}>{quotation.customer_address}</Text>}</View>
        <View style={styles.clientColumn}><Text style={styles.eyebrow}>KONTAK CUSTOMER</Text>{quotation.customer_email && <Text style={styles.clientText}>{quotation.customer_email}</Text>}{quotation.customer_phone && <Text style={styles.clientText}>{quotation.customer_phone}</Text>}<Text style={[styles.clientText, { marginTop: 7 }]}><Text style={styles.subject}>Perihal: </Text>{quotation.subject}</Text></View>
      </View>

      <Text style={styles.intro}>Terima kasih atas kesempatan yang diberikan kepada RETECH. Berdasarkan kebutuhan yang telah dibahas, berikut ruang lingkup dan nilai penawaran yang kami rekomendasikan.</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHead]} fixed><Text style={styles.colNo}>NO</Text><Text style={styles.colService}>LAYANAN / RUANG LINGKUP</Text><Text style={styles.colQty}>QTY</Text><Text style={styles.colPrice}>HARGA</Text><Text style={styles.colTotal}>JUMLAH</Text></View>
        {quotation.items.map((item, index) => <View style={styles.tableRow} key={`${item.name}-${index}`} wrap={false}><Text style={styles.colNo}>{index + 1}</Text><View style={styles.colService}><Text style={styles.itemName}>{item.name}</Text>{item.description && <Text style={styles.itemDescription}>{item.description}</Text>}</View><Text style={styles.colQty}>{item.quantity} {item.unit}</Text><Text style={styles.colPrice}>{idr(item.unitPrice)}</Text><Text style={styles.colTotal}>{idr(item.quantity * item.unitPrice)}</Text></View>)}
      </View>

      <View style={styles.summaryWrap} wrap={false}><View style={styles.summary}><View style={styles.summaryRow}><Text>Subtotal</Text><Text>{idr(subtotal)}</Text></View>{quotation.discount_amount > 0 && <View style={styles.summaryRow}><Text>Diskon</Text><Text>- {idr(quotation.discount_amount)}</Text></View>}<View style={styles.totalRow}><Text>TOTAL PENAWARAN</Text><Text>{idr(total)}</Text></View><Text style={styles.taxNote}>PPN tidak dikenakan. RETECH saat ini bukan Pengusaha Kena Pajak (Non-PKP).</Text></View></View>

      {(quotation.scope_included.length > 0 || quotation.scope_excluded.length > 0) && <View style={[styles.section, styles.twoColumns]} wrap={false}>
        <View style={styles.infoBox}><Text style={styles.infoTitle}>TERMASUK DALAM PENAWARAN</Text><List entries={quotation.scope_included} /></View>
        <View style={styles.infoBox}><Text style={styles.infoTitle}>TIDAK TERMASUK</Text><List entries={quotation.scope_excluded} /></View>
      </View>}

      {(quotation.timeline || quotation.payment_terms) && <View style={[styles.section, styles.twoColumns]} wrap={false}>{quotation.timeline && <View style={styles.infoBox}><Text style={styles.infoTitle}>ESTIMASI PELAKSANAAN</Text><Text style={styles.listText}>{quotation.timeline}</Text></View>}{quotation.payment_terms && <View style={styles.infoBox}><Text style={styles.infoTitle}>SYARAT PEMBAYARAN</Text><Text style={styles.listText}>{quotation.payment_terms}</Text></View>}</View>}
      {quotation.notes && <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>Catatan dan ketentuan</Text><Text style={styles.terms}>{quotation.notes}</Text></View>}

      <View style={styles.signatureRow} wrap={false}>
        <View style={styles.signature}><Text>Hormat kami,</Text>{signatureSrc && stampSrc ? <View style={styles.signatureArtwork}><Image style={styles.signatureStamp} src={stampSrc} /><Image style={styles.signatureInk} src={signatureSrc} /></View> : <View style={styles.signaturePlaceholder} />}<Text style={styles.signatureLine}>PT RETECH DIGITAL SOLUTION</Text><Text style={styles.clientText}>Authorized Representative</Text></View>
        <View style={styles.signature}><Text>Disetujui oleh,</Text><View style={styles.signaturePlaceholder} /><Text style={styles.signatureLine}>{quotation.customer_company}</Text><Text style={styles.clientText}>Nama, jabatan, tanda tangan, dan tanggal</Text></View>
      </View>

    </Page>
  </Document>;
}
