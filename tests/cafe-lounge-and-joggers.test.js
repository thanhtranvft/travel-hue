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
    body: { dataset: {} },
    addEventListener: noop,
    createElement(tag) {
      if (tag === "canvas") {
        return { width: 256, height: 256, getContext: createCtx };
      }
      return { style: {}, append: noop, setAttribute: noop, dataset: {} };
    },
  };
}

import { enabledAreas } from "../src/app/catalog.js";
import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { PedestrianLife } from "../src/core/world/PedestrianLife.js";
import { JOGGER_SPEED_KMH, JOGGER_SPEED_MPS, makeJogger } from "../src/core/world/People.js";
import { CafeLounge } from "../src/core/world/CafeLounge.js";
import { CityAudio } from "../src/core/audio/CityAudio.js";
import { HUE_POEMS } from "../src/data/world/hue-poems.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";
import { STANCE_IDS } from "../src/core/network/protocol.js";

function buildWorldSync(region) {
  const scene = new THREE.Scene();
  const world = new GeographicWorld(scene);
  world.quality = {
    mobile: false,
    shadows: false,
    shadowMapSize: 1024,
    grassSamples: 4000,
    grassSpan: 120,
  };
  world.region = region;
  world.build();
  world.scene.updateMatrixWorld(true);
  return world;
}

function makeAudioContextStub() {
  const makeNode = () => {
    const node = {
      type: "sine",
      frequency: {
        value: 440,
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      detune: { value: 0 },
      gain: {
        value: 0,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
        setTargetAtTime(val) {
          this.value = val;
        },
        cancelScheduledValues() {},
      },
      connect() {
        return node;
      },
      disconnect() {},
      start() {},
      stop() {},
      onended: null,
    };
    return node;
  };
  return {
    currentTime: 10,
    state: "running",
    createOscillator: makeNode,
    createGain: makeNode,
  };
}

test("10 sportswear joggers move continuously at 12 km/h along wooden riverside boardwalk", async () => {
  const region = await loadGeography("quoc-hoc");
  const world = buildWorldSync(region);

  const life = new PedestrianLife(world);
  assert.equal(life.joggers.length, 10, "expected exactly 10 joggers on wooden riverside path");
  assert.equal(JOGGER_SPEED_KMH, 12);
  assert.ok(Math.abs(JOGGER_SPEED_MPS - 12 / 3.6) < 1e-6);

  const initialPositions = life.joggers.map((j) => ({
    x: j.mesh.position.x,
    y: j.mesh.position.y,
    z: j.mesh.position.z,
  }));

  for (const j of life.joggers) {
    assert.equal(j.mode, "jog");
    assert.equal(j.speedKmh, 12);
    assert.ok(Math.abs(j.speed - 12 / 3.6) < 1e-6);
    assert.equal(j.mesh.userData.isJogger, true);
    assert.equal(j.mesh.userData.limbs?.legs?.length, 2);
    assert.equal(j.mesh.userData.limbs?.arms?.length, 2);
  }

  // Advance pedestrian simulation in 20 x 0.05s frames (dt clamp is 0.15s/frame) to measure 1s travel at 12 km/h (~3.33m)
  const samplePt = world.boardwalkView?.mainPoints?.[0] || [0, 0];
  const bike = { position: new THREE.Vector3(samplePt[0], 0, samplePt[1]) };
  life.update(0, bike);
  for (let step = 1; step <= 20; step++) {
    life.update(step * 0.05, bike);
  }

  for (let i = 0; i < life.joggers.length; i++) {
    const p0 = initialPositions[i];
    const p1 = life.joggers[i].mesh.position;
    const moved = Math.hypot(p1.x - p0.x, p1.z - p0.z);
    assert.ok(
      moved > 2.5 && moved < 3.6,
      `jogger ${i} moved ${moved.toFixed(2)}m in 1s (expected ~3.33m at 12 km/h)`,
    );
  }
});

test("makeJogger builds distinct animated athletic rigs with athletic shoes", () => {
  const jogger = makeJogger(0);
  assert.ok(jogger.userData.limbs);
  assert.equal(jogger.userData.limbs.legs.length, 2);
  assert.equal(jogger.userData.limbs.shins.length, 2);
  assert.equal(jogger.userData.limbs.arms.length, 2);
  assert.equal(jogger.userData.limbs.forearms.length, 2);
});

test("all 11 cafes register open, rideable cafeSpots across Hue districts", async () => {
  const allCafeSpots = [];
  const venueTitles = new Set();

  for (const area of enabledAreas) {
    const region = await loadGeography(area.id);
    const world = buildWorldSync(region);
    for (const spot of world.cafeSpots) {
      allCafeSpots.push({ region: area.id, spot });
      venueTitles.add(spot.title);
      const seatGround = world.groundAt(spot.x, spot.z, spot.y);
      assert.ok(Number.isFinite(seatGround), `finite ground at ${spot.id}`);
      assert.equal(
        world.canRide(spot.x, spot.z, seatGround),
        true,
        `cafe seat ${spot.id} (${spot.title}) must be reachable`,
      );
      if (spot.returnPose) {
        const retGround = world.groundAt(spot.returnPose.x, spot.returnPose.z, spot.returnPose.y);
        assert.equal(
          world.canRide(spot.returnPose.x, spot.returnPose.z, retGround),
          true,
          `cafe returnPose for ${spot.id} must be walkable`,
        );
      }
    }
  }

  assert.equal(venueTitles.size, 11, `expected all 11 built cafes, got ${[...venueTitles].join(", ")}`);
  assert.ok(allCafeSpots.length >= 25, "expected numerous cafe chairs across all 11 cafes");
});

test("CityAudio mutes main BGM and river boats while playing acoustic music in cafe mode", () => {
  const audio = new CityAudio();
  const makeBus = () => ({
    gain: {
      value: 0,
      setTargetAtTime(val) {
        this.value = val;
      },
      cancelScheduledValues() {},
    },
    connect() {
      return this;
    },
  });
  audio.ctx = makeAudioContextStub();
  audio.background = makeBus();
  audio.fishingBus = makeBus();
  audio.caHueBus = makeBus();
  audio.venue = makeBus();
  audio.wheelGain = makeBus();
  audio.engineGain = makeBus();
  audio.engine = { frequency: { value: 55, setTargetAtTime() {} } };
  audio.enginePan = { pan: { value: 0, setTargetAtTime() {} } };
  audio.venuePan = { pan: { value: 0, setTargetAtTime() {} } };
  audio.caHuePan = { pan: { value: 0, setTargetAtTime() {} } };
  audio.caHueLowpass = { frequency: { value: 3200, setTargetAtTime() {} } };

  audio.setCafeMode(true, { id: "ben-trang-1", title: "Cà Phê Bến Tràng" });
  assert.equal(audio.cafeMode, true);
  assert.equal(audio.background.gain.value, 0, "main BGM must mute when seated at cafe");
  assert.ok(audio.venue.gain.value > 0.5, "cafe music bus must play");

  audio.update({ position: { x: 0, z: 0 }, motion: { speed: 0 } }, [], 0, [
    { song: { id: "boat-1" }, x: 0, z: 0 },
  ]);
  assert.equal(audio.background.gain.value, 0, "update() keeps BGM muted in cafe mode");
  assert.equal(audio.caHueBus.gain.value, 0, "update() silences nearby Ca Hue while inside cafe");
  assert.ok(audio.venue.gain.value > 0.5, "update() maintains cafe music volume");

  audio.setMusicEnabled(false);
  assert.equal(audio.venue.gain.value, 0, "music toggle mutes cafe music too");
  audio.setMusicEnabled(true);
  assert.ok(audio.venue.gain.value > 0.5, "music toggle restores cafe music while still seated");

  audio.setCafeMode(false);
  assert.equal(audio.cafeMode, false);
  assert.ok(audio.background.gain.value > 0.5, "BGM resumes when leaving cafe chair");
  assert.equal(audio.venue.gain.value, 0);
});

test("CafeLounge enters cafe stance, slowly reveals Hue poetry, cycles poems, and stands cleanly", () => {
  assert.ok(STANCE_IDS.includes("cafe"));
  assert.ok(HUE_POEMS.length >= 6);

  const seat = {
    id: "gahi-cafe-patio-0",
    venueId: "gahi-cafe",
    title: "Gahi Café",
    x: 10.5,
    y: 0.31,
    z: -4.2,
    heading: Math.PI / 2,
    returnPose: { x: 11.4, y: 0.31, z: -4.2, heading: 0 },
  };
  const bike = new TouringBike({ avatar: "girl", mode: "foot" });
  bike.position.set(11.4, 0.31, -4.2);

  let cafeAudioArg = null;
  const lounge = Object.create(CafeLounge.prototype);
  lounge.activeSeat = null;
  lounge.previousPose = null;
  lounge.declinedSeatId = null;
  lounge.declinedUntil = -Infinity;
  lounge.poemIndex = 0;
  lounge.revealedChars = 0;
  lounge.lastRenderedCount = -1;
  lounge.lastRenderedPoemId = null;
  lounge.ui = null;
  lounge.game = {
    bike,
    elapsed: 0,
    auto: true,
    cameraYaw: 0,
    input: { reset() {} },
    audio: {
      tryUnlock: async () => true,
      setCafeMode(enabled, spot) {
        cafeAudioArg = { enabled, spot };
      },
    },
    world: { cafeSpots: [seat], groundAt: () => 0.31 },
    syncMode() {},
    updateHud() {},
  };

  assert.equal(lounge.handleKeyG(), true);
  assert.equal(lounge.isActive(), true);
  assert.equal(bike.stance, "cafe");
  assert.equal(cafeAudioArg.enabled, true);
  assert.equal(cafeAudioArg.spot.title, "Gahi Café");
  assert.equal(lounge.revealedChars, 0);

  // Slow gradual reveal over several frames
  lounge.update(0.5);
  const afterHalfSec = lounge.revealedChars;
  assert.ok(afterHalfSec > 3 && afterHalfSec < 12, `expected gentle reveal, got ${afterHalfSec} chars`);
  lounge.update(2.0);
  assert.ok(lounge.revealedChars > afterHalfSec);

  const firstPoem = lounge.getActivePoem();
  lounge.cyclePoem();
  const secondPoem = lounge.getActivePoem();
  assert.notEqual(secondPoem.id, firstPoem.id);
  assert.equal(lounge.revealedChars, 0);

  // Exit via Escape -> restores stance & unmutes normal BGM
  assert.equal(lounge.handleEscape(), true);
  assert.equal(lounge.isActive(), false);
  assert.equal(cafeAudioArg.enabled, false);
  assert.equal(bike.activityStance, null);
  assert.equal(bike.stance, "idle");
});
