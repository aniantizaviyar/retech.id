# Public website motion

Approved direction: Orbit Ecosystem on the homepage. The existing RETECH artwork is used unchanged; no new brand mark is generated.

## Scope

- Homepage: CSS orbit with four localized service links, upright labels, pause/resume, hover/focus pause, and offscreen/document-visibility pause.
- Services and product workflows: one-time, in-view step reveals with progressive accent lines.
- Product, service, pricing and portfolio cards: subtle entrance and fine-pointer spotlight.
- About, FAQ and case-study content: restrained one-time editorial reveals.
- Privacy-policy text, inquiry form, admin dashboard, authentication, API routes and commercial data are unchanged.

`PublicMotion` mounts through the public `SiteFooter`, scopes itself to its nearest `.public-site`, and cleans up on route changes. It has no hidden-content default, does not intercept clicks, and observes `prefers-reduced-motion`. No animation package was added. The original hero copy and calls to action remain server-rendered.

## Verification

Run from the repository root:

```powershell
node --test tests/public-motion.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/next/dist/bin/next build --webpack
```

The existing local Windows dependency junction requires the webpack build flag; production deployment retains its existing build configuration.

Manual browser coverage:

- Homepage widths: 320, 390, 768, 1024 and 1440 px. No horizontal page overflow; orbit labels remain inside the viewport.
- Pause/resume updates its accessible state and animation play state.
- Timeline accents appear when the process enters the viewport.
- Pricing spotlight follows the pointer; card content and links remain usable.
- Attendance cards and workflow animate; pricing and Google Play links remain unchanged.
- Mobile navigation opens, closes after selection, and initializes public motion on client navigation without duplicate markers.
- Public routes remain available. Local English routing has a pre-existing header-propagation difference from production; verify the English orbit labels and destinations on the production deployment.
- Reduced-motion behavior is covered by explicit CSS and controller guards; browser emulation is not exposed by the available test browser.

No live inquiry or email submission is performed during visual QA.
