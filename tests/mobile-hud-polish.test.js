import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { renderQuality } from "../src/core/rendering/renderQuality.js";
import { optimizeMobileStaticScene } from "../src/core/rendering/MobileStaticScene.js";
import { GameView } from "../src/app/GameView.js";

test("mobile renderQuality keeps crisp DPR and wide culling distance", () => {
  const q = renderQuality({ coarse: true, width: 390, dpr: 3 });
  assert.equal(q.mobile, true);
  assert.equal(q.pixelRatio, 2);
  assert.ok(q.staticDistance >= 1000);
  assert.ok(q.crowdDistance >= 110);
});

test("optimizeMobileStaticScene preserves emissive meshes instead of flattening them", () => {
  const scene = new THREE.Scene();
  const glowing = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "#fff0b0", emissive: "#ffaa33" }),
  );
  scene.add(glowing);
  const world = {
    scene,
    cameraObstacles: [],
    pedestrianLife: { people: [] },
    youthPlayground: { equipment: [] },
    propertyEnclosures: { parking: { cars: [] } },
  };
  optimizeMobileStaticScene(world);
  assert.equal(glowing.parent, scene);
});

test("GameView landmark notification shows gently on entry and auto-dismisses after timeout", () => {
  const prevDoc = globalThis.document;
  const prevNow = Date.now;
  let now = 1000;
  Date.now = () => now;

  const classes = new Set();
  const titleEl = { textContent: "" };
  const descEl = { textContent: "" };
  const cardEl = {
    classList: {
      add(c) {
        classes.add(c);
      },
      remove(c) {
        classes.delete(c);
      },
      contains(c) {
        return classes.has(c);
      },
    },
    querySelector(sel) {
      return sel === "h2" ? titleEl : descEl;
    },
  };
  const mapPanel = { hidden: true };

  globalThis.document = {
    querySelector(sel) {
      if (sel === "#minimap") return { getContext: () => ({}) };
      if (sel === "#landmark-card") return cardEl;
      if (sel === "#map-panel") return mapPanel;
      if (sel === "#sound-location") return null;
      return { textContent: "", style: {} };
    },
  };

  try {
    const view = new GameView();
    const makeGame = (x) => ({
      hud: view.hud,
      district: { title: "Quốc Học" },
      bike: { position: { x, z: 0 }, motion: { speed: 1 }, stance: "walk" },
      auto: false,
      completed: false,
      routeU: 0,
      routeLength: 100,
      audio: { venueLevel: 0 },
      world: {
        landmarks: new Map([
          [
            "quoc-hoc",
            {
              id: "quoc-hoc",
              title: "Quốc Học Huế",
              description: "Ngôi trường lịch sử bên sông Hương.",
              position: { x: 0, z: 0 },
              radius: 25,
            },
          ],
        ]),
      },
    });

    view.updateHud(makeGame(5));
    assert.equal(classes.has("visible"), true);
    assert.equal(titleEl.textContent, "Quốc Học Huế");

    now += 4500;
    view.updateHud(makeGame(5));
    assert.equal(classes.has("visible"), false);

    // Leaving and re-entering shows it again
    view.updateHud(makeGame(60));
    assert.equal(classes.has("visible"), false);
    view.updateHud(makeGame(5));
    assert.equal(classes.has("visible"), true);
  } finally {
    globalThis.document = prevDoc;
    Date.now = prevNow;
  }
});
