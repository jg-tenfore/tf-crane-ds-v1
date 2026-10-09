// Refreshes the phone screenshots used by the Introduction's prototype hero
// (public/prototype-preview/*.png). Needs the prototype running: `npm run prototype`.
//   npm run prototype:preview
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "prototype-preview");
const BASE = process.env.PROTOTYPE_URL ?? "http://localhost:6022/";
const SHOTS = [
    ["welcome", "#/auth/welcome"],
    ["home", "#/home"],
    ["profile", "#/profile"],
];

const browser = await chromium.launch();
for (const [name, hash] of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: 1300, height: 1000 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}#/reset`, { waitUntil: "networkidle" }); // start from sample data
    await page.goto(BASE + hash, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    // Transparent page so only the bezel + screen are captured.
    await page.addStyleTag({ content: "html,body,#root,#root > div{background:transparent !important}" });
    const phone = await page.evaluateHandle(() => document.querySelector("[data-device-screen]").parentElement);
    await phone.asElement().screenshot({ path: path.join(OUT, `${name}.png`), omitBackground: true });
    console.log(`✓ ${name}.png`);
    await ctx.close();
}
await browser.close();
