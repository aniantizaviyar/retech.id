# Company profile refresh - 29 October 2026

## Scope

Update the downloadable Indonesian company profile and `/about` (including its English locale). Preserve the existing Editorial Blue design, logo, CMS hero fields, navigation, inquiry form, chatbot, admin, and invoice/quotation logic. No database migration or subscription/billing change.

## Public sources and content decisions

- Previous published `public/documents/retech-company-profile.pdf`: company identity, business contacts, NPWP, Non-PKP administrative status, and technical experience.
- Public service definitions and `/services`: development, managed IT, installation, migration, troubleshooting, mail-server/DNS work, database and network administration, hardening.
- `/services/vps`: RDS Lite, RDS PRO, RDS Windows, RDS Dedicated; quotation-based pricing; Plesk/cPanel/no panel are optional configurations. Do not repeat the superseded claim that every package includes Plesk. SLA, backup and managed support follow the agreed package/scope.
- Audited ReTendance landing content and `lib/attendance-catalog.ts`: Android availability, selfie/location/face checks, shifts, leave approvals, company dashboard, Free/Pro/Business plans. No promise of zero fraud. Current detailed prices remain on the product page rather than frozen in this brochure.
- QR Order & POS remains a phased pilot; no claim that all roadmap features are generally available. Devices, gateways and integrations require scope confirmation.
- Five existing case-study categories: logistics web, operations dashboard/CMS, attendance web, Android attendance, infrastructure monitoring. Use only privacy-safe conceptual images, not client screenshots or names. No invented impact metrics or client testimonials.
- “9+ years” describes technical project experience, not the legal incorporation date. No unverified founding date is published. Avoid Flutter/HRMS terminology in new user-facing text. Non-PKP is retained only in the PDF's administrative information, not as a value proposition.

## Source and output

- `lib/company-profile.json`: shared ID/EN profile facts for About and the PDF generator.
- `app/about/page.tsx`, `app/about/about.module.css`: new company summary, vision/mission, four service groups, two products, five case-study links, delivery process and download entry points. CSS stays scoped to About.
- `scripts/build-company-profile.py`: ReportLab brochure generator. Reads existing public contact values from `lib/company.ts`; embeds only downsampled previews and leaves source images/logos unchanged. Rejects unexpected pagination.
- `public/documents/retech-company-profile.pdf`: reviewed 8-page A4 brochure; under 0.5 MB. Existing download route retained with a revision query to avoid stale links.
- `.gitattributes`: public document PDFs are binary, preventing Windows line-ending conversion from corrupting PDF byte offsets/embedded streams. The previous PDF emitted a startxref-repair warning; the rebuilt file parses without it.
- `output/pdf/RETECH-Company-Profile-20261029.pdf`: identical local deliverable.

## Verification

- Four profile tests pass: locale parity, stage/claims checks, valid privacy-safe references, secure download/external links, matching PDF bytes.
- Existing 41 assistant/admin-auth/runtime regression tests pass unchanged.
- TypeScript, targeted ESLint and production Next.js/Turbopack build pass.
- All eight PDF pages rendered and visually inspected; 8 pages confirmed, no out-of-page characters, relevant facts present, no obsolete Flutter/HRMS terms, official product links clickable.
- Browser QA at desktop, 768px English tablet and 320px Indonesian phone: no horizontal overflow or clipped headings; product cards stack at mobile; five portfolio images load; one H1; versioned PDF links; no application console errors (unrelated browser-extension messages excluded).
- Main website/inquiry/header/logo/admin/business/assistant source files are unchanged. Work takes place in the clean manual checkout, not the unrelated dirty primary workspace.

## Rebuild

Run `python scripts/build-company-profile.py` with ReportLab, Pillow, pypdf and the Windows Arial fonts available. Run `node --test tests/company-profile.test.mjs` and `npm run vercel-build` before deployment.
