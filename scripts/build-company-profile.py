"""Build the public Indonesian brochure from the same facts used by /about."""
from pathlib import Path
from shutil import copyfile
from xml.sax.saxutils import escape
import json
import re
from io import BytesIO
from PIL import Image as RasterImage

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Image, Table,
    TableStyle, PageBreak, KeepTogether,
)

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "lib/company-profile.json").read_text(encoding="utf-8"))
D = DATA["id"]
CONTACT_SOURCE = (ROOT / "lib/company.ts").read_text(encoding="utf-8")


def contact(key):
    match = re.search(r'\b' + key + r':\s*"([^"]+)"', CONTACT_SOURCE)
    if not match:
        raise ValueError(f"Missing public contact: {key}")
    return match.group(1)


OUT = ROOT / "output/pdf/RETECH-Company-Profile-20261029.pdf"
PUBLIC = ROOT / "public/documents/retech-company-profile.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
NAVY = colors.HexColor("#102C43")
BLUE = colors.HexColor("#1762E8")
CYAN = colors.HexColor("#10B6D8")
INK = colors.HexColor("#16344A")
MUTED = colors.HexColor("#567082")
PALE = colors.HexColor("#F0F6FC")
LINE = colors.HexColor("#D6E3EF")
WHITE = colors.white
W, H = A4
CW = W - 36 * mm

# Embed a locally installed sans-serif font for reliable Indonesian text.
FONT_DIR = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Profile", str(FONT_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("ProfileBold", str(FONT_DIR / "arialbd.ttf")))
pdfmetrics.registerFontFamily("Profile", normal="Profile", bold="ProfileBold")
STYLES = {
    "body": ParagraphStyle("body", fontName="Profile", fontSize=9.5, leading=14, textColor=INK, spaceAfter=7),
    "small": ParagraphStyle("small", fontName="Profile", fontSize=8, leading=11.5, textColor=MUTED, spaceAfter=5),
    "label": ParagraphStyle("label", fontName="ProfileBold", fontSize=8, leading=11, textColor=BLUE, spaceAfter=6),
    "title": ParagraphStyle("title", fontName="ProfileBold", fontSize=27, leading=32, textColor=NAVY, spaceAfter=12),
    "h2": ParagraphStyle("h2", fontName="ProfileBold", fontSize=15, leading=19, textColor=NAVY, spaceAfter=7),
    "h3": ParagraphStyle("h3", fontName="ProfileBold", fontSize=11, leading=15, textColor=INK, spaceAfter=5),
    "white": ParagraphStyle("white", fontName="Profile", fontSize=11, leading=17, textColor=WHITE, spaceAfter=10),
}


def p(text, kind="body"):
    return Paragraph(escape(text), STYLES[kind])


def bullet(text):
    return Paragraph("<font color='#1762E8'>-</font> " + escape(text), STYLES["body"])


def link(text, url):
    return Paragraph(f'<link href="{escape(url)}" color="#1762E8">{escape(text)}</link>', STYLES["body"])


def photo(src, width, height):
    # Downsample only the embedded brochure preview, leaving source assets intact.
    with RasterImage.open(ROOT / "public" / src.lstrip("/")) as raster:
        raster = raster.convert("RGB")
        raster.thumbnail((int(width / 72 * 160), int(height / 72 * 160)))
        stream = BytesIO()
        raster.save(stream, format="JPEG", quality=88, optimize=True)
    stream.seek(0)
    return Image(stream, width=width, height=height, kind="proportional", hAlign="LEFT")


def panel(content, width=CW, background=PALE, padding=12):
    table = Table([[content]], colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
    ]))
    return table


def title(kicker, heading, intro=None):
    result = [p(kicker, "label"), p(heading, "title")]
    if intro:
        result += [p(intro), Spacer(1, 3 * mm)]
    return result


def page_chrome(c, doc):
    c.saveState()
    if doc.page == 1:
        c.setFillColor(NAVY)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#254961"))
        c.setLineWidth(0.7)
        for radius in [32, 48, 64]:
            c.circle(W - 12 * mm, H - 50 * mm, radius * mm, fill=0, stroke=1)
        c.drawImage(str(ROOT / "public/retech-logo.png"), 18 * mm, H - 69 * mm, 42 * mm, 42 * mm, preserveAspectRatio=True, mask="auto")
        c.setFillColor(CYAN)
        c.setFont("ProfileBold", 9)
        c.drawString(18 * mm, H - 99 * mm, "COMPANY PROFILE / 2026")
        c.setFillColor(WHITE)
        c.setFont("ProfileBold", 31)
        c.drawString(18 * mm, H - 121 * mm, "Technology that works.")
        c.setFillColor(colors.HexColor("#72C8FF"))
        c.drawString(18 * mm, H - 137 * mm, "Business that grows.")
        c.setFillColor(WHITE)
        c.setFont("ProfileBold", 15)
        c.drawString(18 * mm, H - 160 * mm, "PT RETECH DIGITAL SOLUTION")
        cover_copy = Paragraph(escape("Partner teknologi untuk pengembangan aplikasi, produk operasional, serta infrastruktur yang siap dijalankan dan dikembangkan."), STYLES["white"])
        _, ph = cover_copy.wrap(CW - 12 * mm, 50 * mm)
        cover_copy.drawOn(c, 18 * mm, H - 172 * mm - ph)
        c.setStrokeColor(colors.HexColor("#42627A"))
        c.line(18 * mm, 61 * mm, W - 18 * mm, 61 * mm)
        c.setFillColor(WHITE)
        c.setFont("ProfileBold", 9)
        c.drawString(18 * mm, 49 * mm, "BUILD  /  OPERATE  /  DEPLOY  /  INFRASTRUCTURE")
        c.setFont("Profile", 9)
        c.drawString(18 * mm, 39 * mm, "Web & Mobile  |  ReTendance  |  QR Order & POS  |  VPS")
        c.setFillColor(colors.HexColor("#BFD3E2"))
        c.setFont("Profile", 8)
        c.drawString(18 * mm, 20 * mm, "retech.id  |  sales@retech.id  |  Bekasi, Indonesia")
        c.drawRightString(W - 18 * mm, 12 * mm, "Diperbarui 29 Oktober 2026")
    else:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.line(18 * mm, H - 18 * mm, W - 18 * mm, H - 18 * mm)
        c.setFillColor(NAVY)
        c.setFont("ProfileBold", 8)
        c.drawString(18 * mm, H - 14 * mm, "RETECH")
        c.setFillColor(MUTED)
        c.setFont("Profile", 7)
        c.drawRightString(W - 18 * mm, H - 14 * mm, "PT RETECH DIGITAL SOLUTION / COMPANY PROFILE")
        c.setStrokeColor(BLUE)
        c.line(18 * mm, 17 * mm, W - 18 * mm, 17 * mm)
        c.setFont("Profile", 7)
        c.drawString(18 * mm, 11 * mm, "sales@retech.id  |  +62 877-9834-7007  |  retech.id")
        c.drawRightString(W - 18 * mm, 11 * mm, f"{doc.page:02d} / 08")
    c.restoreState()


doc = BaseDocTemplate(str(OUT), pagesize=A4, title="Company Profile - PT Retech Digital Solution - Oktober 2026", author="PT Retech Digital Solution", subject="Layanan, produk, portofolio, dan informasi perusahaan", pageCompression=1)
frame = Frame(18 * mm, 24 * mm, CW, H - 50 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates(PageTemplate(id="profile", frames=[frame], onPage=page_chrome))
story = [Spacer(1, 10 * mm), PageBreak()]

# 02 / Company and value
story += title("01 / COMPANY", "Teknologi dengan konteks bisnis.", D["intro"])
story += [panel([p("9+ TAHUN PENGALAMAN TEKNIS", "label"), p(D["experienceNote"], "small")]), Spacer(1, 5 * mm)]
story += [p("Visi", "h2"), p(D["vision"]), p("Misi", "h2")]
story += [bullet(item) for item in D["mission"]]
story += [Spacer(1, 4 * mm), p("Nilai yang kami bawa", "h2")]
for item in D["value"]:
    story += [p(item["title"], "h3"), p(item["copy"])]
story += [p("Berbasis di Bekasi, Indonesia. Kolaborasi dan pelaksanaan remote mengikuti kebutuhan serta kesepakatan pekerjaan.", "small"), PageBreak()]

# 03 / Services
story += title("02 / SERVICES", "Satu partner, empat area layanan.", "Layanan dapat berdiri sendiri atau digabung, dari discovery dan implementasi hingga dukungan operasional.")
for index, item in enumerate(D["services"], 1):
    content = [p(f"0{index} / {item['label']}", "label"), p(item["title"], "h3"), p(item["summary"])]
    content += [p(" / ".join(item["scope"]), "small"), p(item["outcome"], "small")]
    story += [KeepTogether([panel(content, padding=10), Spacer(1, 4 * mm)])]
story += [p("Pemilihan stack mengikuti kebutuhan dan maintainability, misalnya React/Next.js, TypeScript, Laravel/PHP, REST API, SQL, React Native, Kotlin, atau Swift. Platform dan lisensi dipastikan pada tahap scope.", "small"), PageBreak()]

# 04 / Attendance product
attendance = D["products"][0]
story += title("03 / PRODUCTS / ATTENDANCE", attendance["title"], attendance["summary"])
product_columns = Table([[
    photo(attendance["image"], 54 * mm, 100 * mm),
    [p("ANDROID + COMPANY DASHBOARD", "label")] + [bullet(t) for t in attendance["features"]] + [p(attendance["note"], "small")],
]], colWidths=[63 * mm, CW - 63 * mm])
product_columns.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
story += [product_columns, Spacer(1, 6 * mm), p("Pilihan paket", "h2")]
plan_rows = [[p("Free", "h3"), p("Pro", "h3"), p("Bisnis", "h3")], [p("Maksimal 10 karyawan aktif. 1 lokasi, 1 shift, dan 1 pengelola.", "small"), p("Kapasitas sesuai slot. 3 lokasi, 10 shift, 3 pengelola, dan 1 tingkat persetujuan.", "small"), p("Kapasitas sesuai slot. 10 lokasi, 30 shift, 10 pengelola, dan hingga 3 tingkat persetujuan.", "small")]]
plans = Table(plan_rows, colWidths=[CW / 3] * 3)
plans.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))
story += [plans, Spacer(1, 6 * mm), p("Akses dan bantuan resmi", "h2"), link("Unduh ReTendance di Google Play", "https://play.google.com/store/apps/details?id=com.absen.project"), link("Dashboard perusahaan: absensi.retech.id", "https://absensi.retech.id/"), link("Detail paket, harga, tutorial, dan privasi", "https://retech.id/products/attendance"), p("Permintaan penghapusan akun tersedia melalui tautan resmi pada halaman produk.", "small"), PageBreak()]

# 05 / QR product and subscription operating model
qr = D["products"][1]
story += title("04 / PRODUCTS / F&B", qr["title"], qr["summary"])
story += [photo(qr["image"], CW, 88 * mm), Spacer(1, 4 * mm), p("PILOT TERARAH / ROLLOUT BERTAHAP", "label")]
story += [bullet(t) for t in qr["features"]]
story += [p(qr["note"], "small"), Spacer(1, 5 * mm), panel([p("Satu platform, workspace setiap customer", "h3"), p(D["subscriptionNote"]), p("Harga dan kebutuhan setup, perangkat, serta integrasi mengikuti paket dan penawaran. Detail: retech.id/products/qr-order-pos", "small")]), PageBreak()]

# 06-07 / Case studies
for page_index, items in enumerate([D["cases"][:3], D["cases"][3:]]):
    story += title("05 / SELECTED CASE STUDIES", "Implementasi untuk operasi nyata." if page_index == 0 else "Mobile & infrastructure.", D["privacyNote"])
    for item in items:
        row = Table([[
            photo(item["image"], 57 * mm, 37 * mm),
            [p(item["title"], "h3"), p(item["summary"]), p(item["outcome"], "small"), p(item["tags"], "label")],
        ]], colWidths=[67 * mm, CW - 67 * mm])
        row.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
        story += [KeepTogether([row, Spacer(1, 5 * mm)])]
    if page_index == 1:
        story += [Spacer(1, 4 * mm), p("Kebutuhan serupa, konteks yang berbeda", "h2"), p("Setiap implementasi diawali assessment. Kebutuhan integrasi, pemindahan data, validasi keamanan, kapasitas server, dan penerimaan hasil ditentukan bersama customer - bukan diasumsikan sama dengan proyek sebelumnya."), p("Lihat uraian case studies: retech.id/work", "label")]
    story += [PageBreak()]

# 08 / Delivery and contact
story += title("06 / WORK WITH RETECH", "Scope jelas. Langkah terarah.")
for index, step in enumerate(D["process"], 1):
    story += [p(f"0{index} / {step['title']}", "h3"), p(step["copy"])]
story += [Spacer(1, 3 * mm), p("Kontak & informasi perusahaan", "h2")]
rows = [
    ["Badan usaha", contact("legalName")],
    ["Brand", contact("brandName")],
    ["NPWP", DATA["npwp"]],
    ["Status pajak", "Non-PKP"],
    ["Alamat bisnis", contact("address")],
    ["Email sales", contact("email")],
    ["Email billing", contact("billingEmail")],
    ["WhatsApp", contact("whatsappDisplay") + " (hanya chat)"],
    ["Website", "https://retech.id"],
]
table = Table([[p(key, "label"), p(value, "small")] for key, value in rows], colWidths=[34 * mm, CW - 34 * mm])
table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
story += [table, Spacer(1, 4 * mm), p("Kunjungan kantor berdasarkan janji temu. Company profile ini bukan quotation atau jaminan SLA; harga, kapasitas, lisensi, dukungan, dan ketentuan kontrak dikonfirmasi dalam penawaran.", "small")]
doc.build(story)

# Reject accidental pagination overflow instead of publishing a broken brochure.
from pypdf import PdfReader
if len(PdfReader(str(OUT)).pages) != 8:
    raise RuntimeError("Expected an eight-page brochure; inspect layout before publishing.")
copyfile(OUT, PUBLIC)
print(OUT)
print(f"Public PDF: {PUBLIC}; bytes: {OUT.stat().st_size}")
