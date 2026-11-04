import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { withWorkVisuals, workVisuals, withProductVisuals, productVisuals } from "../lib/work-visuals";
import { getProjects, getProject, type Project } from "../lib/projects";
import { getFallbackProducts, productSeeds } from "../lib/products";
import { getProducts } from "../lib/cms-data";

const fixture = (slug: string): Project => ({slug,title:"Original title",category:"Business Application",status:"live",summary:"Original summary",challenge:"Original challenge",solution:"Original solution",outcome:"Original outcome",services:["CMS"],gallery:[{src:"/privacy-safe/original.png",alt:"Original"},{src:"/privacy-safe/detail.png",alt:"Detail"}],featured:true,sortOrder:1});
test("Work gets five approved covers without mutating shared projects or unrelated metadata",()=>{
  const projects=Object.keys(workVisuals).map(fixture), original=structuredClone(projects);
  for(const locale of ["id","en"] as const){const updated=withWorkVisuals(projects,locale);assert.equal(updated.length,5);updated.forEach((item,i)=>{assert.equal(item.gallery[0].src,workVisuals[item.slug].src);assert.match(item.gallery[0].alt,/demo|dummy|synthetic|simulasi|simulated|fiktif|fictional/);assert.deepEqual(item.gallery[1],original[i].gallery[1]);assert.deepEqual({...item,gallery:[]},{...original[i],gallery:[]});});}
  assert.deepEqual(projects,original);
  const unknown=fixture("other-project");assert.equal(withWorkVisuals([unknown],"id")[0],unknown);
  const inherited=fixture("toString");assert.equal(withWorkVisuals([inherited],"id")[0],inherited);
});
test("Company profile and Work point at the same lossless approved artwork",async()=>{
  const profile=JSON.parse(await readFile(new URL("../lib/company-profile.json",import.meta.url),"utf8"));
  for(const locale of ["id","en"]){for(const item of profile[locale].cases){const slug=item.href.split("/").at(-1);assert.equal(item.image,workVisuals[slug].src);}}
  for (const visual of [...Object.values(workVisuals), productVisuals["qr-order-pos"]]) {
    const published = new URL(`../public${visual.src}`, import.meta.url);
    const name = visual.src.split("/").at(-1)!.replace(".webp", ".png");
    const approved = new URL(`../assets/work-20261104/${name}`, import.meta.url);
    const publishedBytes = await readFile(published);
    const metadata = await sharp(publishedBytes).metadata();
    assert.equal(metadata.width, 1600);
    assert.equal(metadata.height, 900);
    const [actual, expected] = await Promise.all([
      sharp(publishedBytes).removeAlpha().raw().toBuffer(),
      readFile(approved).then((bytes) => sharp(bytes).removeAlpha().raw().toBuffer()),
    ]);
    assert.deepEqual(actual, expected);
  }
});
test("Shared loaders apply current visuals to fallback and CMS data in both locales", async () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SECRET_KEY;
  const originalFetch = globalThis.fetch;
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    for (const locale of ["id", "en"] as const) {
      const projects = await getProjects(locale);
      for (const project of projects) assert.deepEqual(project.gallery[0], {src: workVisuals[project.slug].src, alt: workVisuals[project.slug].alt[locale]});
      assert.deepEqual((await getProject("logistics-company-website", locale))?.gallery, projects[0].gallery);
      for (const product of getFallbackProducts(locale)) assert.equal(product.heroImage, productVisuals[product.slug as keyof typeof productVisuals].src);
    }
    process.env.SUPABASE_URL = "https://cms.test.invalid";
    process.env.SUPABASE_SECRET_KEY = "unit-test-only";
    globalThis.fetch = async (input, init) => {
      assert.equal(init?.method || "GET", "GET", "visual sync must never write CMS data");
      const url = String(input);
      if (url.includes("portfolio_projects")) return Response.json(Object.keys(workVisuals).map(slug => ({...fixture(slug), title:"CMS title retained", published:true, sort_order:1})));
      if (url.includes("cms_products")) return Response.json(productSeeds.map(seed => ({slug:seed.slug, data_id:seed.dataId, data_en:seed.dataEn})));
      throw new Error("Unexpected test request");
    };
    for (const locale of ["id", "en"] as const) {
      const projects = await getProjects(locale);
      assert.equal(projects.length, 5);
      if (locale === "id") assert.equal(projects[0].title, "CMS title retained");
      for (const project of projects) assert.equal(project.gallery[0].src, workVisuals[project.slug].src);
      for (const product of await getProducts(locale)) assert.equal(product.heroImage, productVisuals[product.slug as keyof typeof productVisuals].src);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = originalKey;
  }
});
test("Product image overrides preserve all plan, price and business fields", () => {
  for (const locale of ["id", "en"] as const) {
    const products = productSeeds.map(seed => ({slug:seed.slug,...(locale === "en" ? seed.dataEn : seed.dataId)}));
    const original = structuredClone(products);
    const updated = withProductVisuals(products, locale);
    assert.deepEqual(products, original);
    updated.forEach((product,index) => {
      assert.deepEqual({...product,heroImage:"",heroAlt:""},{...original[index],heroImage:"",heroAlt:""});
      assert.match(product.heroAlt, /demo/);
    });
  }
});
test("Public consumers use shared loaders and retain original navigation/form structure", async () => {
  for (const path of ["app/page.tsx", "app/work/page.tsx"]) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(source, /getProjects\(locale\)/);
  }
  const detail = await readFile(new URL("../app/work/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(detail, /getProject/);
  assert.match(detail, /bukan screenshot asli customer/);
  const landing = await readFile(new URL("../components/AttendanceLanding.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(landing, /work-20261104/);
});
