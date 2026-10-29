import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const profile = JSON.parse(await read("lib/company-profile.json"));

test("company profile preserves audited services, product stages, and case-study parity in both locales", () => {
  for (const locale of ["id", "en"]) {
    const content = profile[locale];
    assert.equal(content.services.length, 4);
    assert.equal(content.products.length, 2);
    assert.equal(content.cases.length, 5);
    assert.equal(content.process.length, 4);
    assert.match(content.products[1].status, /pilot/i);
    assert.match(content.products[0].status, /Android/);
    assert.match(content.experienceNote, /bukan|not/i);
    assert.doesNotMatch(JSON.stringify(content.value), /Non-PKP|HRMS|Flutter/i);
    assert.match(content.services.at(-1).scope.join(" "), /Plesk.*cPanel/);
    assert.match(content.services.at(-1).scope.join(" "), /tanpa|no control panel/);
    assert.match(content.privacyNote, /ilustrasi|illustrations/);
  }
  assert.deepEqual(profile.id.services.map(s => s.href), profile.en.services.map(s => s.href));
  assert.deepEqual(profile.id.cases.map(s => s.href), profile.en.cases.map(s => s.href));
});

test("case-study references and privacy-safe assets exist", async () => {
  const projects = await read("lib/projects.ts");
  for (const item of profile.id.cases) {
    assert.match(projects, new RegExp(`slug: "${item.href.split("/").at(-1)}"`));
    assert.match(item.image, /^\/privacy-safe\//);
    assert.ok((await stat(new URL(`public${item.image}`, root))).size > 0);
    assert.doesNotMatch(JSON.stringify(item), /ugc\.co\.id|Utama Globalindo|100%|guarantee/i);
  }
});

test("About keeps locale navigation, public PDF download, and secure external links", async () => {
  const source = await read("app/about/page.tsx");
  assert.match(source, /getPageContent\("about", locale\)/);
  assert.match(source, /href=\{companyProfile.download\}/);
  assert.match(source, /download/);
  assert.match(source, /localePath\(locale, product.href\)/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /details\?id=com.absen.project/);
  assert.doesNotMatch(source, /<form|localStorage|SUPABASE_SECRET|api\/admin/);
  assert.match(profile.download, /^\/documents\/retech-company-profile\.pdf\?v=20261029$/);
});

test("the published brochure is a lightweight PDF identical to the reviewed deliverable", async () => {
  const liveAsset = await readFile(new URL("public/documents/retech-company-profile.pdf", root));
  const output = await readFile(new URL("output/pdf/RETECH-Company-Profile-20261029.pdf", root));
  assert.equal(liveAsset.subarray(0, 5).toString(), "%PDF-");
  assert.ok(liveAsset.length < 2_000_000);
  assert.deepEqual(liveAsset, output);
});
