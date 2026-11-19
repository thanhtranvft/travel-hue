import { chromium } from "playwright";
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
  });
  await page.goto("http://127.0.0.1:5174/", {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page
    .locator("#scene-loading")
    .waitFor({ state: "hidden", timeout: 120000 });
  const result = await page.evaluate(async () => {
    const { game } = await import(
      document.querySelector('script[src*="/src/main.js"]').src
    );
    game.renderer.setAnimationLoop(null);
    const timings = {},
      wrap = (object, key) => {
        const original = object[key].bind(object);
        object[key] = (...args) => {
          const start = performance.now(),
            value = original(...args);
          (timings[key] ??= []).push(performance.now() - start);
          return value;
        };
      };
    for (const key of ["step", "updateCamera", "updateHud", "drawMap"])
      wrap(game, key);
    wrap(game.world, "update");
    wrap(game.renderer, "render");
    const frames = [];
    for (let i = 0; i < 45; i++) {
      await new Promise(requestAnimationFrame);
      const start = performance.now();
      game.frame();
      if (i > 4) frames.push(performance.now() - start);
    }
    const stats = (a) => ({
      mean: +(a.reduce((n, v) => n + v, 0) / a.length).toFixed(2),
      p95: +a
        .slice()
        .sort((a, b) => a - b)
        [Math.floor(a.length * 0.95)].toFixed(2),
    });
    return {
      frame: stats(frames),
      timings: Object.fromEntries(
        Object.entries(timings).map(([k, v]) => [k, stats(v)]),
      ),
      render: game.renderer.info.render,
      dpr: game.renderer.getPixelRatio(),
      shadows: game.renderer.shadowMap.enabled,
      quality: game.quality || null,
    };
  });
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
