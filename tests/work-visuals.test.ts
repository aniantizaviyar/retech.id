import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { withWorkVisuals, workVisuals } from "../lib/work-visuals";
import type { Project } from "../lib/projects";

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
  for (const visual of Object.values(workVisuals)) {
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
test("Homepage and individual case pages do not import Work-only replacements",async()=>{
  for(const path of ["app/page.tsx","app/work/[slug]/page.tsx","lib/projects.ts"]){const source=await readFile(new URL(`../${path}`,import.meta.url),"utf8");assert.doesNotMatch(source,/withWorkVisuals|work-20261104/);}
  const work=await readFile(new URL("../app/work/page.tsx",import.meta.url),"utf8");assert.match(work,/withWorkVisuals\(await getProjects\(locale\), locale\)/);assert.match(work,/bukan screenshot asli customer/);
});
