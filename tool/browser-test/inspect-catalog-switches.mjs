import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const original = JSON.parse(
  await readFile(
    new URL("../../src/data/app-config.json", import.meta.url),
    "utf8",
  ),
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe",
});
try {
  const page = await browser.newPage(),
    errors = [],
    packages = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/\/areas\/[^/]+\/model\/osm\.json/.test(r.url()))
      packages.push(r.url());
  });
  let config = structuredClone(original);
  config.areas.items.find((a) => a.id === "quoc-hoc").enabled = false;
  config.music.tracks.find((t) => t.id === "hue-thuong-vocal").disabled = true;
  await page.route("**/src/data/app-config.json*", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `export default ${JSON.stringify(config)};`,
    }),
  );
  await page.goto("http://127.0.0.1:5174/", {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page
    .locator("#scene-loading")
    .waitFor({ state: "hidden", timeout: 120000 });
  assert.equal(await page.locator('[data-district="quoc-hoc"]').count(), 0);
  assert.equal(
    await page.locator('#music-track option[value="hue-thuong-vocal"]').count(),
    0,
  );
  assert.equal(await page.locator("[data-district]").count(), 4);
  assert.equal(await page.locator("#music-track option").count(), 5);
  const blocked = await page.evaluate(async () => {
    const { game } = await import(
        document.querySelector('script[src*="/src/main.js"]').src
      ),
      before = game.scene;
    const changed = await game.travelTo("quoc-hoc");
    return {
      changed,
      id: game.world.region.id,
      sameScene: before === game.scene,
    };
  });
  assert.equal(blocked.changed, false);
  assert.equal(blocked.id, "south-bank");
  assert.ok(blocked.sameScene);
  assert.ok(!packages.some((p) => p.includes("/quoc-hoc/")));
  console.log(
    "DISABLED_AREA_MUSIC_PASS",
    JSON.stringify({ blocked, packages }),
  );
  config = structuredClone(original);
  config.areas.items.forEach((a) => (a.enabled = false));
  config.music.tracks.forEach((t) => (t.enabled = false));
  packages.length = 0;
  await page.reload({ waitUntil: "networkidle", timeout: 120000 });
  assert.equal(await page.locator("[data-district]").count(), 0);
  assert.equal(packages.length, 0);
  assert.ok(
    (await page.locator("#scene-loading").textContent()).includes(
      "chưa có khu vực",
    ),
  );
  assert.deepEqual(errors, []);
  console.log("EMPTY_CATALOG_PASS");
} finally {
  await browser.close();
}
