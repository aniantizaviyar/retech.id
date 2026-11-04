# Work visuals and company profile — 4 November 2026

## Scope

- Five approved, privacy-safe UI reconstructions replace covers only on `/work` and `/en/work`.
- Company profile case-study thumbnails and the public 8-page PDF use the same artwork. About download revision is 4 November 2026.
- Original RETECH logo, business/legal/contact facts, services, product status, navigation, forms, chatbot, homepage and individual case-study pages are unchanged.
- Images are labelled as reconstructions with demo data, not original customer screenshots.
- No new paid provider, API key, permission or database migration.

## Assets and source

PNG masters: `assets/work-20261104/`. Published lossless WebP: `public/privacy-safe/work-20261104/`.

Regenerate images with `node scripts/prepare-work-visuals.mjs`; generate the PDF with `scripts/build-company-profile.py` using a Python runtime with ReportLab, pypdf and Pillow.

## Verification

- 3 Work-specific tests: mapping isolation, source-image pixel equality, profile parity and unchanged shared routes.
- 4 company-profile tests: audited content, asset existence, secure links, published/download artifact equality.
- 67 assistant regression tests: no change to chat, sessions, admin authorization or email behavior.
- TypeScript check and production webpack build.
- All 8 rendered PDF pages inspected. PDF remains A4 and about 430 KiB.
- Browser checks at desktop 1440×1000, mobile 390×844 and landscape 844×390; no horizontal page overflow. Existing category filter remains functional.
- Local webpack proxy language-header behavior differs from the existing public deployment; final ID/EN language verification must run on production, without changing the proxy as part of this visual-only release.

## Deployment

Existing Git-main to Vercel workflow, project `retech-id`. The Vercel connector lacked permission for the configured team; no connector access was expanded. Verify the public release using:

```sh
node scripts/verify-work-profile-release.mjs https://retech.id
```

The release verifier checks ID/EN Work and About, exact SHA-256 of all five images, the PDF and unchanged logo, plus separation from the homepage and a case-detail route. No forms are submitted.
