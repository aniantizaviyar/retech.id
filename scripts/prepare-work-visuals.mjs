import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const source = resolve("assets/work-20261104");
const target = resolve("public/privacy-safe/work-20261104");
await mkdir(target, { recursive: true });
for (const name of ["website-landing", "dashboard-crm", "attendance-platform", "infrastructure-monitoring", "android-attendance"]) {
  await sharp(resolve(source, `${name}.png`)).webp({ lossless: true, effort: 6 }).toFile(resolve(target, `${name}.webp`));
  console.log(`${name}: lossless WebP prepared`);
}
