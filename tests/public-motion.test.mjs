import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("retains the original RETECH artwork, navigation and inquiry form", async () => {
  for (const [path, expected] of [
    ["public/retech-logo-transparent.png", "ad6e526487ea93572a8eb5cd7a74bf69c5165c948f8a029b50abb0c2e294554d"],
    ["components/SiteHeader.tsx", "6b63feaf58cb4617422c9a1b00d3121bdcc67a8216388380199416f0c4c091a9"],
    ["app/LeadForm.tsx", "508bd633ec597b87aacdb1a3ddf9b1d5e1115837548f2cec29535a79beff740e"],
  ]) {
    const bytes = await readFile(new URL(`../${path}`, import.meta.url));
    const content = path.endsWith(".tsx") ? bytes.toString("utf8").replaceAll("\r\n", "\n") : bytes;
    assert.equal(createHash("sha256").update(content).digest("hex"), expected, path);
  }
});

test("Orbit uses the existing logo and localized service destinations", async () => {
  const orbit = await source("components/OrbitEcosystem.tsx");
  assert.match(orbit, /src="\/retech-logo-transparent\.png"/);
  assert.match(orbit, /localePath\(locale, service.href\)/);
  assert.match(orbit, /aria-pressed=\{paused\}/);
  assert.match(orbit, /visibilitychange/);
  assert.match(orbit, /observer\?\.disconnect\(\)/);
  const home = await source("app/page.tsx");
  assert.match(home, /<OrbitEcosystem locale=\{locale\}/);
  assert.doesNotMatch(home, /<HomeProductPreview/);
});

test("motion is public-only, progressive and respects reduced motion", async () => {
  const motion = await source("components/PublicMotion.tsx");
  assert.match(motion, /closest<HTMLElement>\("\.public-site"\)/);
  assert.match(motion, /if \(reduced.matches\) return/);
  assert.match(motion, /observer\.unobserve\(element\)/);
  assert.match(motion, /root.removeEventListener\("pointermove"/);
  assert.match(motion, /event.pointerType === "touch"/);
  assert.doesNotMatch(motion, /fetch\(|localStorage|sessionStorage|preventDefault/);
  const css = await source("components/PublicMotion.module.css");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /opacity:\s*0[;}]/);
  const orbitCss = await source("components/OrbitEcosystem.module.css");
  assert.match(orbitCss, /prefers-reduced-motion:reduce/);
  assert.match(orbitCss, /animation-play-state:paused/);
});
