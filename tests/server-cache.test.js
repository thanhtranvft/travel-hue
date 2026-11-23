import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
import { createGameServer } from "../server/index.js";

test("createGameServer compresses assets with br/gzip and applies immutable cache headers", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hue-cache-test-"));
  const assetsDir = join(dir, "assets");
  await mkdir(assetsDir, { recursive: true });
  const bigJs = "export const hello = " + JSON.stringify("huế ".repeat(600)) + ";";
  const html = "<!doctype html><html><body>ok</body></html>" + " ".repeat(1100);
  const sw = "self.addEventListener('fetch', () => {});" + " ".repeat(1100);

  await writeFile(join(dir, "index.html"), html);
  await writeFile(join(dir, "sw.js"), sw);
  await writeFile(join(assetsDir, "app-12345678.js"), bigJs);

  const app = await createGameServer({ dist: dir });
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${app.server.address().port}`;

  try {
    // 1. Immutable cache + Brotli for hashed /assets/*
    const assetBrRes = await fetch(`${base}/assets/app-12345678.js`, {
      headers: { "Accept-Encoding": "gzip, br" },
    });
    assert.equal(assetBrRes.status, 200);
    assert.equal(
      assetBrRes.headers.get("cache-control"),
      "public, max-age=31536000, immutable",
    );
    assert.equal(assetBrRes.headers.get("content-encoding"), "br");
    assert.match(assetBrRes.headers.get("vary") || "", /Accept-Encoding/i);
    // Note: Node fetch auto-decompresses Content-Encoding unless raw http is used; verify readable text!
    assert.equal(await assetBrRes.text(), bigJs);

    // Verify raw wire bytes via node:http for gzip as well
    const { request } = await import("node:http");
    const rawGzip = await new Promise((resolve, reject) => {
      const req = request(
        `${base}/assets/app-12345678.js`,
        { headers: { "Accept-Encoding": "gzip" } },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: Buffer.concat(chunks),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
    assert.equal(rawGzip.status, 200);
    assert.equal(rawGzip.headers["content-encoding"], "gzip");
    assert.ok(rawGzip.body.length < Buffer.byteLength(bigJs));
    assert.equal(gunzipSync(rawGzip.body).toString("utf8"), bigJs);

    const rawBr = await new Promise((resolve, reject) => {
      const req = request(
        `${base}/assets/app-12345678.js`,
        { headers: { "Accept-Encoding": "br" } },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: Buffer.concat(chunks),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
    assert.equal(rawBr.status, 200);
    assert.equal(rawBr.headers["content-encoding"], "br");
    assert.ok(rawBr.body.length < Buffer.byteLength(bigJs));
    assert.equal(brotliDecompressSync(rawBr.body).toString("utf8"), bigJs);

    // 2. HTML and /sw.js must use no-cache
    const htmlRes = await fetch(`${base}/`);
    assert.equal(htmlRes.status, 200);
    assert.equal(htmlRes.headers.get("cache-control"), "no-cache");

    const swRes = await fetch(`${base}/sw.js`);
    assert.equal(swRes.status, 200);
    assert.equal(swRes.headers.get("cache-control"), "no-cache");

    // 3. Path traversal must still return 403
    const traversalRes = await fetch(`${base}/..%2fpackage.json`);
    assert.equal(traversalRes.status, 403);
  } finally {
    await app.close();
    await rm(dir, { recursive: true, force: true });
  }
});
