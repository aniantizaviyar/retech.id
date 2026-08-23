const descriptions: Record<string, string> = {
  "business-dashboard": "Ringkasan pipeline, quotation aktif, invoice, pembayaran, dan performa penjualan RETECH.",
  "business-leads": "Kelola prospek dari form website, referral, kampanye, dan follow-up tim sales.",
  "business-customers": "Database perusahaan customer dengan snapshot identitas untuk dokumen bisnis.",
  "business-contacts": "Kelola PIC, jabatan, email, WhatsApp, dan relasi ke perusahaan customer.",
  "business-pipeline": "Pantau tahapan Lead, Qualified, Quotation, Negotiation, Won, dan Lost.",
  "business-invoices": "Konversi quotation yang disetujui menjadi invoice dan pantau jatuh tempo.",
  "business-payments": "Catat termin, pembayaran parsial, bukti transfer, dan status pelunasan.",
  "business-products": "Price book layanan RETECH untuk mengisi item quotation secara konsisten.",
  "business-templates": "Atur kop surat, ketentuan, tanda tangan, penomoran, dan template PDF.",
  "mail-delivery": "Pantau delivered, soft bounce, hard bounce, blocked, complaint, dan suppression list dari Brevo.",
};

export function ComingSoonPanel({ id, title }: { id: string; title: string }) {
  return <div className="admin-content"><section className="admin-coming-soon"><span className="admin-kicker">ROADMAP / COMING SOON</span><div className="admin-coming-icon">◇</div><h2>{title}</h2><p>{descriptions[id] || "Modul ini sudah masuk roadmap pengembangan RETECH Admin CMS."}</p><div className="admin-coming-status"><i /> Fondasi menu sudah tersedia</div><small>Quotations menjadi modul Business pertama yang diaktifkan. Modul ini akan menggunakan customer, price book, dan audit trail yang sama pada tahap berikutnya.</small></section></div>;
}
