import { companyContact } from "./company";
import { formatRupiah, quotationTotal, type Quotation } from "./quotations";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function quotationEmailSubject(quotation: Quotation) {
  return `Quotation ${quotation.quote_number} — ${quotation.subject}`;
}

export function quotationEmailHtml(quotation: Quotation) {
  const total = escapeHtml(formatRupiah(quotationTotal(quotation)));
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(quotationEmailSubject(quotation))}</title></head>
  <body style="margin:0;background:#eef5f8;color:#071827;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5f8;padding:28px 12px"><tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-collapse:separate;border-spacing:0;border-radius:16px;overflow:hidden;box-shadow:0 12px 36px rgba(7,24,39,.10)">
        <tr><td style="height:7px;background:linear-gradient(90deg,#18bfee,#176fe8)"></td></tr>
        <tr><td style="padding:28px 34px 20px;background:#071827">
          <img src="https://retech.id/retech-logo-transparent.png" width="118" alt="RETECH Digital Solution" style="display:block;width:118px;height:auto">
          <div style="margin-top:18px;color:#18bfee;font-size:11px;font-weight:700;letter-spacing:1.8px">DIGITAL SOLUTION FOR YOUR BUSINESS</div>
        </td></tr>
        <tr><td style="padding:34px">
          <p style="margin:0 0 12px;font-size:16px">Yth. Bapak/Ibu <strong>${escapeHtml(quotation.customer_name)}</strong>,</p>
          <p style="margin:0 0 24px;color:#587184;font-size:14px;line-height:1.7">Terima kasih atas kesempatan yang diberikan kepada RETECH. Bersama email ini kami lampirkan quotation resmi untuk kebutuhan <strong style="color:#071827">${escapeHtml(quotation.subject)}</strong>.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf7fc;border:1px solid #c9d8e3;border-radius:12px">
            <tr><td style="padding:18px 20px;color:#587184;font-size:12px;line-height:2">
              <strong style="display:inline-block;width:135px;color:#0a2a43">Nomor quotation</strong>${escapeHtml(quotation.quote_number)}<br>
              <strong style="display:inline-block;width:135px;color:#0a2a43">Berlaku hingga</strong>${escapeHtml(dateLabel(quotation.valid_until))}<br>
              <strong style="display:inline-block;width:135px;color:#0a2a43">Total penawaran</strong><span style="color:#176fe8;font-size:16px;font-weight:700">${total}</span>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#587184;font-size:13px;line-height:1.7">Silakan meninjau ruang lingkup, jadwal, dan ketentuan pada file PDF terlampir. Jika ada bagian yang perlu disesuaikan, balas email ini atau hubungi kami melalui WhatsApp.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td style="border-radius:8px;background:#176fe8"><a href="${companyContact.whatsappUrl}" style="display:inline-block;padding:13px 20px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700">Diskusikan quotation via WhatsApp</a></td></tr></table>
          <p style="margin:30px 0 0;font-size:13px;line-height:1.7">Hormat kami,<br><strong>Sales Team — RETECH</strong><br><a href="mailto:${companyContact.email}" style="color:#176fe8">${companyContact.email}</a></p>
        </td></tr>
        <tr><td style="padding:20px 34px;border-top:1px solid #c9d8e3;background:#f8fbfc;color:#587184;font-size:10px;line-height:1.6"><strong style="color:#0a2a43">PT RETECH DIGITAL SOLUTION</strong><br>${escapeHtml(companyContact.address)}<br>${escapeHtml(companyContact.whatsappDisplay)} (chat only) · retech.id</td></tr>
        <tr><td style="height:4px;background:#176fe8"></td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

export function quotationEmailText(quotation: Quotation) {
  return `Yth. Bapak/Ibu ${quotation.customer_name},\n\nBersama email ini kami lampirkan quotation ${quotation.quote_number} untuk ${quotation.subject}.\n\nBerlaku hingga: ${dateLabel(quotation.valid_until)}\nTotal penawaran: ${formatRupiah(quotationTotal(quotation))}\n\nSilakan balas email ini jika diperlukan penyesuaian.\n\nHormat kami,\nSales Team — RETECH\n${companyContact.email}\n${companyContact.address}`;
}
