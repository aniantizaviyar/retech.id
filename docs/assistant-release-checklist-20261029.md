# RETECH Assistant release checklist

## Automated checks

```powershell
npm run test:assistant
node --test tests/public-motion.test.mjs
npx tsc --noEmit --pretty false
npx eslint app/ChatWidget.tsx app/TurnstileWidget.tsx app/assistant app/api/assistant lib/assistant lib/attendance-catalog.ts tests/assistant.test.ts tests/assistant-ui-server.ts
npx next build --webpack
npm audit --omit=dev
```

Tests use synthetic credentials, mocked fetch/SMTP boundaries and an isolated in-memory inquiry store. The test-only server marker loader must never be used to launch production.

## Required scenarios

| Scenario                                                 | Expected result                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Services / product questions                             | Correct public reference links, no customer/private records                                               |
| Attendance Pro 25 employees, then 3 months               | Rp312,500/month then Rp937,500; no deduction of ten paid seats                                            |
| Free 11 employees / negative or fractional seats         | Explain ceiling or reject; do not silently change quantity                                                |
| VPS price                                                | Request quotation; do not publish reseller prices                                                         |
| Consultation request                                     | Review form, WIB preference and consent; stored reference only after successful insert                    |
| Support request                                          | Request for team follow-up, not a confirmed external helpdesk ticket                                      |
| Retry same request                                       | Same reference, one insert/email; changed payload rejected                                                |
| Public reachability                                      | Fixed root HEAD checks only; no tenant SLA or private-server health claim                                 |
| Ignore instructions / reveal keys                        | Refusal; no knowledge/tool/provider execution for recognized abuse                                        |
| Unknown tool, extra role or arbitrary URL                | Strict schema rejection                                                                                   |
| Cross-origin, oversized bytes, invalid/expired Turnstile | 403/413 or challenge error before execution                                                               |
| Quota exhausted or rate store offline                    | 429/503 fail closed; no unmetered LLM fallback                                                            |
| AI consent off                                           | Zero model requests                                                                                       |
| AI overload/timeout/invalid function response            | Guided clarification; no secret/provider error leakage                                                    |
| Cancel or interrupted SSE                                | Cancel/error feedback, composer recovers; no stuck busy state                                             |
| Close/Escape                                             | Focus returns to launcher; conversation memory cleared on unmount                                         |
| 320×568, 390×844, 768×1024 and laptop/desktop            | Panel within viewport, independent log scroll, input/actions accessible, compact Turnstile when necessary |
| Existing inquiry, logo and navigation                    | Unchanged source/hash regression tests; no real inquiry submission during QA                              |

## Local visual/integration QA

Use a local build with Cloudflare's official public test site key only; do not alter production keys. Run `next start --hostname localhost --port 3114`, then `node --import ./tests/assistant-register.mjs --import tsx tests/assistant-ui-server.ts`. The user-facing fixture is 127.0.0.1:3113. Keep the upstream hostname `localhost` consistent: Next's normalized loopback rewrites can otherwise make `/en` re-enter the proxy and lose its locale. It uses actual skill handlers and canonical public fallback data but mocks database, rate, verification, status and email side effects. Synthetic receipts are **not production evidence**.

Capture screenshots after responsive viewport changes settle. Reset the viewport, close test-only tabs and stop owned servers after QA. Evidence is saved under the main workspace's `deliverables/assistant-20261029/`.

## Security dependency preflight

Initial production dependency audit reported five affected packages: critical Next.js 16.3.2, high Nodemailer/sharp/source-map-js and moderate baseline-browser-mapping. The user explicitly approved targeted security updates on 29 October 2026. Do not publish that vulnerable baseline. Updated dependency versions and final audit/build outcomes must be recorded after verification; avoid `npm audit fix --force`.

Verified update: Next.js and matching first-party packages 16.4.3; Nodemailer 10.2.1; sharp 0.35.5; source-map-js 1.2.2; baseline-browser-mapping 2.11.34. `npm audit --omit=dev` reports **0 vulnerabilities**. The full development-tool audit still reports 16 advisories (6 moderate, 10 high), including the old Vinext/Vite/Workers development chain. Those tools are not the Next.js production runtime and require a separate migration/update review; do not describe the full dependency tree as vulnerability-free.

## Verification record — 29 October 2026

- 68 automated tests passed: 41 assistant/runtime-regression cases plus 27 existing attendance/control-plane/motion cases. All network and email mutations in those tests are synthetic fixtures.
- Targeted ESLint and TypeScript checks passed. Both webpack and the actual `npm run vercel-build` Turbopack production builds passed on Next.js 16.4.3.
- Runtime image optimization returned 200/image/png with updated sharp.
- Browser QA passed: official service search, price calculation with follow-up context, consultation and support synthetic receipts, public reachability wording, injection refusal, actual cancellation during a 20-second fixture delay, clean failure/retry control, Escape/focus return and English UI/source paths.
- Responsive checks covered 320×568, 390×844, 768×1024 and default desktop. A measured 320-pixel viewport had 15-pixel left/right panel margins and zero page/log horizontal overflow; compact Turnstile remained inside the request form.
- Browser error-console capture was empty. Existing logo, navigation and inquiry-form source hashes passed regression tests. No production inquiry, actual support ticket, appointment or email was created during QA.
- Static client bundles contained none of the backend credential variable names or assistant signing namespace checked by the secret-boundary scan.
- Live Cloudflare inference is **not yet verified**: the user has no provider key installed. Provider contract, invalid response, opt-out and failure paths have been verified only with mocks. Keep AI disabled until real activation/smoke testing.

## Production gates

The protected core can be released in guided-only mode while `ASSISTANT_AI_ENABLED` remains false. The token/provider gates apply before AI activation, not as proof that a guided release is already LLM-powered.

- Protected core configuration exists: Supabase, rate salt, production Turnstile site/secret keys and correct hostname/action validation.
- Build/lint/tests and runtime image optimization pass after security updates; existing admin login/logout authorization is retained.
- Cloudflare scoped token/account are installed through server environment management, never chat/source. Confirm the account stays on its intended free allocation; no paid upgrade.
- Set AI enabled only after an actual provider call passes. Test an ambiguous, non-sensitive service question with explicit opt-in and verify the Cloudflare-assisted intent note. A mocked test is not a live LLM smoke test.
- A synthetic inquiry in a designated staging environment must be verified before claiming production notification delivery. Do not send unsolicited production test email or create customer tickets.
- Fetch main before a non-force scoped push; preserve other workspaces' dirty changes. Confirm deployed asset/build and safe public endpoint behavior, not merely a successful push.
- Rollback is a normal reviewed revert of the scoped release commit, never `reset --hard` or a force push. To disable only LLM, set `ASSISTANT_AI_ENABLED=false` and redeploy; guided skills remain.
