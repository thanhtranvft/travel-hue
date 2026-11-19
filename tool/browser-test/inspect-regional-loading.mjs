import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe",
});
try {
  const page = await browser.newPage({
      viewport: { width: 844, height: 390 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    }),
    errors = [],
    packages = [],
    models = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    const url = r.url();
    if (/\/areas\/[^/]+\/model\/osm\.json/.test(url)) packages.push(url);
    if (url.includes(".glb")) models.push(url);
  });
  await page.goto("http://127.0.0.1:5174/", {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page
    .locator("#scene-loading")
    .waitFor({ state: "hidden", timeout: 120000 });
  assert.equal(packages.length, 1, JSON.stringify(packages));
  const reports = [];
  for (const id of [
    "quoc-hoc",
    "south-bank",
    "truong-tien",
    "north-bank",
    "imperial-city",
    "quoc-hoc",
  ]) {
    const report = await page.evaluate(async (id) => {
      const { game } = await import(
          document.querySelector('script[src*="/src/main.js"]').src
        ),
        old = game.scene;
      await game.travelTo(id);
      game.renderer.setAnimationLoop(null);
      const switched = game.scene !== old;
      const counts = {
        id: game.world.region.id,
        features: game.world.loadedFeatureCount,
        buildings: game.world.buildingCount,
        oldSceneEmpty: !switched || old.children.length === 0,
        disposed: game.lastDisposedResources || 0,
        rejectsOutside: !game.world.canRide(
          game.world.bounds.maxX + 1000,
          game.world.bounds.maxZ + 1000,
        ),
      };
      game.traffic.enabled = false;
      game.toggleAutopilot();
      for (let i = 0; i < (game.routeLength / 2 + 80) * 120 && game.auto; i++)
        game.step(1 / 120);
      counts.tourComplete = game.completed;
      return counts;
    }, id);
    reports.push(report);
    console.log("AREA", JSON.stringify(report));
    assert.equal(report.id, id);
    assert.ok(report.features > 0 && report.features < 500);
    assert.ok(
      report.oldSceneEmpty && report.rejectsOutside && report.tourComplete,
    );
  }
  assert.equal(new Set(packages).size, 5);
  assert.equal(models.filter((u) => u.includes("trees_v4")).length, 1);
  assert.equal(models.filter((u) => u.includes("waymo_gen6")).length, 1);
  assert.deepEqual(errors, []);
  console.log(
    "REGIONAL_LOADING_PASS",
    JSON.stringify({
      reports,
      packages: packages.length,
      models: models.length,
    }),
  );
} finally {
  await browser.close();
}
