import "server-only";
import type { Answer, Knowledge, ToolCall } from "./contracts";
import { estimate, retrieve } from "./domain";
import { makeDraft, type Session } from "./security";
import { localePath } from "../i18n";

const publicTargets = {
  website: "https://retech.id/",
  attendance: "https://absensi.retech.id/",
} as const;
export async function publicStatus(
  service: keyof typeof publicTargets,
  en: boolean,
  signal: AbortSignal,
): Promise<Answer> {
  const url = publicTargets[service];
  const name =
    service === "website" ? "Website RETECH" : "Dashboard ReTendance";
  let observation: string;
  const start = performance.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]),
      headers: { "User-Agent": "RETECH-Public-Reachability/1.0" },
    });
    observation =
      response.status < 400
        ? en
          ? `reachable (HTTP ${response.status})`
          : `terjangkau (HTTP ${response.status})`
        : [401, 403, 405].includes(response.status)
          ? en
            ? `responding with protected/restricted access (HTTP ${response.status})`
            : `merespons dengan akses terlindungi/dibatasi (HTTP ${response.status})`
          : en
            ? `returned HTTP ${response.status}; service health cannot be confirmed`
            : `mengembalikan HTTP ${response.status}; kesehatan layanan belum dapat dipastikan`;
    await response.body?.cancel();
  } catch {
    observation = en
      ? "could not be verified within the check window"
      : "belum dapat diverifikasi dalam batas waktu pemeriksaan";
  }
  const timestamp = new Intl.DateTimeFormat(en ? "en-GB" : "id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  return {
    skill: "check_service_status",
    sources: [{ title: name, href: url }],
    text: en
      ? `${name}: ${observation}. Observed ${timestamp} WIB (${Math.round(performance.now() - start)} ms). This is a single public-page reachability check, not tenant/server monitoring, historical uptime or an SLA guarantee.`
      : `${name}: ${observation}. Diperiksa ${timestamp} WIB (${Math.round(performance.now() - start)} ms). Ini satu pemeriksaan keterjangkauan halaman publik, bukan monitoring tenant/server, histori uptime, atau jaminan SLA.`,
  };
}
export async function executeSkill(
  call: ToolCall,
  knowledge: Knowledge,
  en: boolean,
  session: Session,
  signal: AbortSignal,
): Promise<Answer> {
  let answer: Answer;
  if (call.name === "estimate_price") answer = estimate(call, knowledge, en);
  else if (call.name === "check_service_status")
    return publicStatus(call.arguments.service, en, signal);
  else if (
    call.name === "request_consultation" ||
    call.name === "create_support_request"
  ) {
    const consultation = call.name === "request_consultation";
    answer = {
      skill: call.name,
      text: en
        ? `${consultation ? "Choose your preferred consultation time" : "Describe the issue without passwords or sensitive customer data"} in the form below. Review the summary and explicitly submit it. The team must confirm ${consultation ? "the appointment" : "the follow-up"}; this is not an external calendar booking or helpdesk ticket.`
        : `${consultation ? "Pilih waktu konsultasi yang diinginkan" : "Jelaskan kendala tanpa password atau data customer sensitif"} pada formulir berikut. Periksa ringkasan lalu kirim dengan persetujuan. ${consultation ? "Jadwal" : "Tindak lanjut"} masih perlu konfirmasi tim; ini bukan booking kalender atau tiket helpdesk eksternal.`,
      sources: [
        {
          title: en ? "Privacy policy" : "Kebijakan privasi",
          href: "/privacy-policy",
        },
      ],
      action: makeDraft(
        consultation ? "consultation" : "support",
        consultation ? call.arguments.topic : call.arguments.summary,
        session,
      ),
    };
  } else {
    const query = call.arguments.query;
    if (/^(?:halo|hai|hello|hi|terima kasih|thanks)[!.\s]*$/i.test(query))
      return {
        skill: "search_information",
        text: en
          ? "Hello! I can explain RETECH services, calculate catalog estimates, prepare a consultation/support request, or check public-page reachability. What would you like to do?"
          : "Halo! Saya bisa menjelaskan layanan RETECH, menghitung estimasi katalog, menyiapkan permintaan konsultasi/support, atau mengecek halaman publik. Mau mulai dari mana?",
        sources: [],
      };
    const docs = retrieve(
      query === "private-account-access"
        ? "privacy akun invoice password"
        : query,
      knowledge.documents,
    );
    const overview =
      docs.length > 1 && docs.every((d) => d.id.startsWith("service:"));
    answer = {
      skill: "search_information",
      sources: docs.map((d) => ({ title: d.title, href: d.href })),
      text: docs.length
        ? docs
            .map(
              (d) => `${d.title}\n${overview ? d.text.split("\n")[0] : d.text}`,
            )
            .join("\n\n")
        : en
          ? "I can help with RETECH digital products, web/mobile development, infrastructure, VPS and attendance. Please specify the product or requirement; I will not guess information that is not published."
          : "Saya dapat membantu tentang produk digital RETECH, pengembangan web/mobile, infrastruktur, VPS, dan attendance. Sebutkan produk atau kebutuhan lebih spesifik; saya tidak menebak informasi yang tidak dipublikasikan.",
    };
  }
  return {
    ...answer,
    sources: answer.sources.map((source) => ({
      ...source,
      href: source.href.startsWith("/")
        ? localePath(en ? "en" : "id", source.href)
        : source.href,
    })),
  };
}
