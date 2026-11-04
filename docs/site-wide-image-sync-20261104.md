# Site-wide image consistency — approved for deployment

Status: implemented, verified locally, and approved by the user for production deployment on 4 November 2026. Release uses the existing Git-main to Vercel integration. No CMS write, credential change or database migration is required.

## Diagnosis

The previous release intentionally scoped new images to Work and About. Homepage project cards and case details still read the older shared project gallery. Product catalogs independently read legacy product images from CMS/fallback seeds. This is a data-source inconsistency, not a browser-cache issue.

## Public production audit

38 sitemap URLs (19 pages × ID/EN) returned HTTP 200. No additional same-origin public page links were found outside that inventory. 16 URLs still referenced one or more legacy illustrations:

| Page group | Affected URLs including ID/EN |
| --- | ---: |
| Homepage | 2 |
| Product directory | 2 |
| QR Order & POS detail | 2 |
| Five individual case-study pages | 10 |

Work and About already used current portfolio artwork. Services, VPS, Pricing, FAQ, Privacy and the dedicated ReTendance page did not render these old illustrations. Actual ReTendance app screenshots, Google Play badge, and original brand assets are retained.

## Local changes

- Apply the reviewed five project covers in the shared `getProjects` loader, so homepage, Work, case details, metadata and structured data stay consistent. Retain CMS text, sort order, feature flags, statuses and all other project fields.
- Apply product image overrides to CMS and fallback paths. Attendance previews reuse the reviewed Android cover; dedicated ReTendance screenshots are not replaced.
- Add a sixth, natural QR/POS UI reconstruction with fictional cafe data, clearly labelled as a demo. This visual was reviewed and approved with the site-wide release.
- Product social preview images use the same current catalog.
- Preserve full 16:9 artwork in case galleries and contain product previews so neither UI nor the original logo is cropped.
- Update the PDF QR/POS image and cache version to `20261104.2`; preserve the existing eight-page structure and content.

## Verification

- Local crawl: 38 pages return HTTP 200; zero legacy image references in rendered images and social metadata.
- 5 image/catalog tests and 4 company-profile tests pass, including CMS/fallback ID/EN mappings, non-mutating behavior, unchanged prices/plans and lossless asset equality.
- All 67 assistant regression tests pass. TypeScript and production webpack build pass.
- All eight PDF pages rendered and visually inspected; file remains A4, about 376 KiB.
- Browser checks on affected pages at desktop 1440×1000 and mobile 375×812; five case galleries preserve 16:9 and no horizontal overflow is observed.
- RETECH original logo SHA-256 remains `00c1b35e551c5971eadaeff213d438910f110d94dab3b3e7d405d39f521887ee`.

Local webpack language-header behavior is an existing local-only limitation; mapping is unit tested for both locales and public ID/EN routes were audited before changes. After approval and deploy, repeat the public crawl plus `scripts/verify-work-profile-release.mjs` for production-language and byte-level checks.

## Approved scope

Propagate the five reviewed portfolio visuals, the sixth QR/POS preview, and the matching PDF image update to all affected public pages. Business logic, inquiry forms, prices, authentication, logo artwork and database records are unchanged.
