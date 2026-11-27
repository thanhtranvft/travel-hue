import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";

if (typeof globalThis.document === "undefined") {
  const noop = () => {};
  const createCtx = () => ({
    fillStyle: "",
    strokeStyle: "",
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    lineWidth: 1,
    globalAlpha: 1,
    lineCap: "butt",
    lineJoin: "miter",
    shadowColor: "",
    shadowBlur: 0,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    arc: noop,
    rect: noop,
    roundRect: noop,
    fill: noop,
    stroke: noop,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    strokeText: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    setLineDash: noop,
    drawImage: noop,
    measureText: (txt = "") => ({ width: String(txt).length * 8 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({}),
    getImageData: () => ({ data: new Uint8ClampedArray(16) }),
    putImageData: noop,
  });
  globalThis.document = {
    createElement(tag) {
      if (tag === "canvas") {
        return { width: 256, height: 256, getContext: createCtx };
      }
      return { style: {}, append: noop, setAttribute: noop };
    },
  };
}

import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { PedestrianLife } from "../src/core/world/PedestrianLife.js";

test("Quoc Hoc riverside parks include 10 pulling anglers, pedal-dock crowd, bench couples, youth activity groups, and boardwalk strollers", async () => {
  const region = await loadGeography("quoc-hoc");
  const world = new GeographicWorld(new THREE.Scene());
  world.quality = {
    mobile: false,
    shadows: false,
    shadowMapSize: 1024,
    grassSamples: 2000,
    grassSpan: 100,
    crowdDistance: 400,
  };
  world.region = region;
  world.build();

  // 1. 10 NPC anglers at Bia Quoc Hoc wooden overlook deck with heavy reel-pull motion
  const anglerRow = world.biaPark.group.getObjectByName("fishing-angler-row");
  assert.ok(anglerRow, "BiaQuocHocPark must render fishing-angler-row");
  assert.equal(anglerRow.userData.anglers?.length, 10, "Fishing area must have 10 animated anglers");

  let sawPull = false;
  let sawFishHoist = false;
  for (let t = 0; t < 12; t += 0.25) {
    world.biaPark.update(t);
    for (const a of anglerRow.userData.anglers) {
      if (a.pullStrength > 0.5 && a.rodTipPivot.rotation.x > 0.35) sawPull = true;
      if (a.hookedFish.visible) sawFishHoist = true;
    }
  }
  assert.ok(sawPull, "Anglers must animate heavy rod pull & tip flex");
  assert.ok(sawFishHoist, "Anglers must hoist hooked river fish out of water");

  // 2. Pedal-boat hub spectator crowd at FountainPark
  const dockCrowd = world.fountainPark.group.getObjectByName("pedal-dock-crowd");
  assert.ok(dockCrowd, "FountainPark must render pedal-dock-crowd");
  assert.ok(dockCrowd.children.length >= 14, "Pedal-boat hub must have lively visitor crowd");

  // 3. Talking male-female couples on park benches across riverfront parks & cafes
  const countNamed = (root, targetName) => {
    let n = 0;
    root.traverse((obj) => {
      if (obj.name === targetName) n++;
    });
    return n;
  };
  assert.ok(countNamed(world.biaPark.group, "bench-couple") >= 5);
  assert.ok(countNamed(world.fireflyPark.group, "bench-couple") >= 5);
  assert.ok(countNamed(world.fountainPark.group, "bench-couple") >= 4);
  assert.ok(countNamed(world.phuXuanParkWalk.group, "bench-couple") >= 6);
  assert.ok(countNamed(world.museumParkingCafe.group, "bench-couple") >= 2);
  assert.ok(countNamed(world.truongTienSurroundings.group, "bench-couple") >= 2);

  // 4. All youth activity groups present (kite flying, guitar circle, badminton, đá cầu)
  for (const name of [
    "kite-flying-group",
    "guitar-circle-group",
    "badminton-group",
    "da-cau-group",
  ]) {
    assert.ok(
      countNamed(world.scene, name) >= 4,
      `Expected >= 4 instances of ${name} across quoc-hoc riverfront parks`,
    );
  }

  // 5. PhuXuanParkWalk update runs cleanly via GeographicWorld.update
  assert.equal(typeof world.phuXuanParkWalk.update, "function");
  assert.doesNotThrow(() => world.update(1.75, { x: 0, z: 0 }));

  // 6. PedestrianLife populates strollers along extended Cau Go Lim and south-bank promenade
  const pedLife = new PedestrianLife(world);
  const promWalkers = pedLife.people.filter((p) => p.underBridgePromenade);
  assert.ok(
    promWalkers.length >= 25,
    `Expected >= 25 strollers across Cau Go Lim & riverfront park promenades, got ${promWalkers.length}`,
  );
  assert.doesNotThrow(() => pedLife.update(2.4, world.biaPark.toWorld(0, 0)));

  // 7. Seated youth & family circles behind Bia Quoc Hoc + across-river North Bank Vista
  const biaCircles =
    countNamed(world.biaPark.group, "youth-sitting-circle") +
    countNamed(world.biaPark.group, "family-sitting-circle");
  assert.ok(biaCircles >= 6, `Expected >= 6 seated circles behind Bia Quoc Hoc, got ${biaCircles}`);

  assert.ok(world.northBankVista, "quoc-hoc world must mount northBankVista across Perfume River");
  assert.ok(
    world.northBankVista.treeCount >= 100,
    `Expected lush opposite-bank treeline (>=100 trees), got ${world.northBankVista.treeCount}`,
  );
  assert.ok(world.northBankVista.group.getObjectByName("nghenh-luong-dinh"), "Nghênh Lương Đình must render on north bank");
  assert.ok(world.northBankVista.group.getObjectByName("phu-van-lau"), "Phu Văn Lâu must render on north bank");
  assert.ok(world.northBankVista.group.getObjectByName("ky-dai-hue"), "Kỳ Đài Huế must render on north bank");
  assert.ok(world.northBankVista.group.getObjectByName("ky-dai-flag"), "Kỳ Đài Huế flag must render on flagpole");
  assert.ok(world.landmarks.has("phu-van-lau"), "Phu Văn Lâu landmark must be registered");
  assert.ok(world.landmarks.has("ky-dai"), "Kỳ Đài Huế landmark must be registered");
});
