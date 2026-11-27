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
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
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

import {
  createPoeticSky,
  POETIC_HORIZON_COLOR,
} from "../src/core/world/PoeticSky.js";
import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";

test("createPoeticSky builds a fog-exempt poetic sky dome and tracks player XZ", () => {
  const sky = createPoeticSky({ radius: 2200 });
  assert.equal(sky.mesh.name, "hue-poetic-sky-dome");
  assert.equal(sky.material.side, THREE.BackSide);
  assert.equal(sky.material.depthWrite, false);
  assert.equal(sky.material.fog, false);
  assert.match(sky.material.fragmentShader, /#include <tonemapping_fragment>/);
  assert.match(sky.material.fragmentShader, /#include <colorspace_fragment>/);

  sky.update(12.5, { x: 140, y: 1.2, z: -280 });
  assert.equal(sky.uniforms.uTime.value, 12.5);
  assert.equal(sky.mesh.position.x, 140);
  assert.equal(sky.mesh.position.y, 0);
  assert.equal(sky.mesh.position.z, -280);
  sky.dispose();
});

test("GeographicWorld mounts poetic sky dome and matches fog to horizon color", async () => {
  const region = await loadGeography("quoc-hoc");
  const scene = new THREE.Scene();
  const world = new GeographicWorld(scene);
  world.quality = {
    mobile: false,
    shadows: false,
    shadowMapSize: 1024,
    grassSamples: 1000,
    grassSpan: 80,
  };
  world.region = region;
  world.build();

  assert.ok(world.poeticSky, "world should initialize poeticSky");
  const dome = scene.getObjectByName("hue-poetic-sky-dome");
  assert.ok(dome, "scene should contain hue-poetic-sky-dome");
  assert.equal(
    "#" + scene.fog.color.getHexString(),
    POETIC_HORIZON_COLOR.toLowerCase(),
  );

  world.update(4.2, { x: 55, y: 0.4, z: -90 });
  assert.equal(world.poeticSky.uniforms.uTime.value, 4.2);
  assert.equal(dome.position.x, 55);
  assert.equal(dome.position.z, -90);
});
