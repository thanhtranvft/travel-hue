import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import {
  createFishingGameState,
  FISH_SPECIES,
} from "../src/core/world/RiverActivities.js";
import {
  CaHueBoats,
  CA_HUE_SONGS,
} from "../src/core/world/CaHueBoats.js";
import { AmbientSwanBoats } from "../src/core/world/AmbientSwanBoats.js";
import { RIVER_FISH_VISUALS } from "../src/core/world/RiverFish.js";
import { CityAudio } from "../src/core/audio/CityAudio.js";
import {
  countrysideFishingMelody,
  countrysideFishingBass,
} from "../src/core/audio/music.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";
import { AVATAR_IDS, PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { river, sites, mainRoads } from "../src/core/shared/geography/map.js";
import { inside, nearestPoint } from "../src/core/shared/geography/geometry.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { createFountainPark } from "../src/modules/areas/quoc-hoc/view/FountainPark.js";
import {
  handleRiverRewardAction,
  RIVER_FISH_REWARDS,
  BOAT_CRUISE_REWARD,
} from "../server/riverActivity.js";
import { Room } from "../server/Room.js";

test("FISH_SPECIES & RIVER_FISH_REWARDS cover bống, diếc, rô phi, chép, koi scaled by size and rarity", () => {
  const expectedOrder = ["ca-bong", "ca-diec", "ca-ro-phi", "ca-chep", "ca-koi"];
  assert.deepEqual(
    FISH_SPECIES.map((s) => s.id),
    expectedOrder,
  );
  for (let i = 1; i < FISH_SPECIES.length; i++) {
    const prev = FISH_SPECIES[i - 1];
    const curr = FISH_SPECIES[i];
    assert.ok(curr.points > prev.points, `${curr.id} should award more points than ${prev.id}`);
    assert.ok(curr.weight < prev.weight, `${curr.id} should be rarer than ${prev.id}`);
    assert.ok(
      RIVER_FISH_VISUALS[curr.id].length > RIVER_FISH_VISUALS[prev.id].length,
      `${curr.id} 3D model should be larger than ${prev.id}`,
    );
    assert.equal(RIVER_FISH_REWARDS[curr.id].points, curr.points);
  }
  assert.equal(RIVER_FISH_REWARDS["ca-bong"].points, FISH_SPECIES[0].points);
});

test("createFishingGameState progresses cast -> waiting -> bite -> reeling -> caught and reset", () => {
  const f = createFishingGameState();
  assert.equal(f.phase, "ready");
  assert.ok(FISH_SPECIES.length >= 5);

  const castRes = f.pullReel(() => 0.1);
  assert.equal(castRes.action, "cast");
  assert.equal(f.phase, "waiting");

  const earlyRes = f.pullReel();
  assert.equal(earlyRes.action, "early");
  assert.equal(f.phase, "waiting");

  let bitten = false;
  for (let i = 0; i < 40; i++) {
    const ev = f.step(0.15, () => 0.96);
    if (ev.bitten) {
      bitten = true;
      break;
    }
  }
  assert.equal(bitten, true);
  assert.equal(f.phase, "bite");
  assert.equal(f.species.id, "ca-koi");

  const hooked = f.pullReel(() => 0.5);
  assert.equal(hooked.action, "hooked");
  assert.equal(f.phase, "reeling");
  assert.equal(f.pullPulse, 1);

  f.step(0.25);
  assert.ok(f.pullPulse < 1 && f.pullPulse > 0, "pullPulse should decay smoothly");

  f.cursor = f.targetCenter;
  const hit1 = f.pullReel(() => 0.5);
  assert.equal(hit1.action, "hit");
  assert.equal(f.pullPulse, 1);
  f.cursor = f.targetCenter;
  const hit2 = f.pullReel(() => 0.5);
  assert.equal(hit2.action, "caught");
  assert.equal(f.phase, "caught");
  assert.equal(f.lastCatch.id, "ca-koi");

  f.reset();
  assert.equal(f.phase, "ready");
  assert.equal(f.species, null);
});

test("all 6 chibi avatars animate 3D fishing rod, reveal & reel up caught species mesh, and pedal boats", () => {
  for (const id of AVATAR_IDS) {
    const bike = new TouringBike({ avatar: id, mode: "foot" });
    bike.setActivityStance("fish", { fishState: { phase: "bite" } });
    assert.equal(bike.stance, "fish");
    const rod = bike.rig.character.fishingRod;
    assert.equal(rod.group.visible, true);
    assert.equal(rod.caughtFishAnchor.visible, false);

    bike.update(0.1, 0, 0, false, {
      stance: "fish",
      poseOnly: true,
      fishState: { phase: "reeling", speciesId: "ca-koi", pullPulse: 0.9 },
    });
    assert.ok(
      rod.rodPivot.rotation.x < -0.1,
      `expected reeling rod lift for ${id}`,
    );
    assert.ok(
      rod.rodTipPivot && rod.rodTipPivot.rotation.x > 0.25,
      `expected heavy-pull upper tip flex for ${id}`,
    );
    assert.equal(
      rod.waterSplash?.visible,
      true,
      `expected water splash ring visible while reeling big fish for ${id}`,
    );
    if (bike.rig.character.torsoPivot) {
      assert.ok(
        bike.rig.character.torsoPivot.rotation.x < 0,
        `expected fisher torso to brace back for ${id}`,
      );
    } else if (bike.rig.character.spinePivot) {
      assert.ok(
        bike.rig.character.spinePivot.rotation.x < -0.95,
        `expected animal spine to brace back for ${id}`,
      );
    }

    // When caught, only matching real 3D fish appears and rises out of the water
    bike.update(0.1, 0, 0, false, {
      stance: "fish",
      poseOnly: true,
      fishState: { phase: "caught", speciesId: "ca-koi", resultTimer: 1.5 },
    });
    assert.equal(rod.caughtFishAnchor.visible, true);
    assert.equal(rod.caughtFishMeshes["ca-koi"].visible, true);
    assert.equal(rod.caughtFishMeshes["ca-bong"].visible, false);
    assert.ok(rod.bobber.position.y > -0.85);

    bike.setActivityStance("boat", { boatIndex: 2 });
    assert.equal(bike.stance, "boat");
    assert.equal(bike.boatIndex, 2);
    assert.equal(bike.boatHull.visible, true);
    assert.equal(rod.group.visible, false);

    bike.setActivityStance(null);
    assert.notEqual(bike.stance, "boat");
    assert.notEqual(bike.stance, "fish");
    assert.equal(bike.boatHull.visible, false);
  }
});

test("CaHueBoats (10 dragon boats) & AmbientSwanBoats (10 occupied pedal boats) cruise safely inside Perfume River", () => {
  const piers = [
    { x: 430, z: -610, nx: 0.7, nz: 0.7, tx: -0.7, tz: 0.7, halfLen: 10, halfWidth: 2.5 },
  ];
  const world = {
    scene: new THREE.Scene(),
    riverRings: river,
    phuXuanBridge: { piers },
    truongTienBridge: { piers: [] },
    riverSurfaceAt: (_x, _z, t) => 0.03 + Math.sin(t) * 0.02,
  };
  const caHue = new CaHueBoats(world);
  assert.ok(CA_HUE_SONGS.length >= 10);
  assert.equal(caHue.boats.length, CA_HUE_SONGS.length);

  caHue.update(12.5);
  const sources = caHue.getAudioSources();
  assert.equal(sources.length, CA_HUE_SONGS.length);
  for (const s of sources) {
    assert.ok(s.song?.title);
    assert.match(s.song?.audioUrl || "", /ho-doi-dap-song-huong-0[1-4]\.mp3/);
    assert.ok(river.some((ring) => inside({ x: s.x, z: s.z }, ring)));
    assert.equal(caHue.hitsBoat(s.x, s.z, 0), true);
  }
  for (const file of [
    "ho-doi-dap-song-huong-01.mp3",
    "ho-doi-dap-song-huong-02.mp3",
    "ho-doi-dap-song-huong-03.mp3",
    "ho-doi-dap-song-huong-04.mp3",
  ]) {
    assert.equal(fs.existsSync(path.resolve("src/assets/music", file)), true, `Missing ${file}`);
  }

  const ambientSwans = new AmbientSwanBoats(world, 10);
  assert.equal(ambientSwans.boats.length, 10);
  const before = ambientSwans.boats.map((b) => ({ x: b.x, z: b.z }));
  ambientSwans.update(8.0);
  for (let i = 0; i < ambientSwans.boats.length; i++) {
    const b = ambientSwans.boats[i];
    assert.ok(b.rig, "ambient swan boat must carry a seated chibi rider");
    assert.ok(
      river.some((ring) => inside({ x: b.x, z: b.z }, ring)),
      `ambient swan boat ${i} stayed inside river rings`,
    );
    assert.ok(
      Math.hypot(b.x - before[i].x, b.z - before[i].z) > 1.0,
      `ambient swan boat ${i} should actively pedal forward`,
    );
    assert.equal(ambientSwans.hitsBoat(b.x, b.z, 0.5), true);
  }
});

test("BiaQuocHoc carp/koi shoal, unobstructed dock signboard, riverward boat heading, Room online boarding, and countryside music", () => {
  const origDoc = globalThis.document;
  if (typeof globalThis.document === "undefined") {
    const noop = () => {};
    const createCtx = () => ({
      fillStyle: "",
      strokeStyle: "",
      font: "",
      textAlign: "left",
      textBaseline: "alphabetic",
      lineWidth: 1,
      beginPath: noop,
      closePath: noop,
      moveTo: noop,
      lineTo: noop,
      quadraticCurveTo: noop,
      arc: noop,
      fill: noop,
      stroke: noop,
      fillRect: noop,
      strokeRect: noop,
      fillText: noop,
      measureText: (t = "") => ({ width: String(t).length * 8 }),
      createLinearGradient: () => ({ addColorStop: noop }),
    });
    globalThis.document = {
      addEventListener: noop,
      createElement: (tag) =>
        tag === "canvas"
          ? { width: 256, height: 256, getContext: createCtx }
          : { style: {} },
    };
  }

  try {
    const biaSite = sites.find((s) => s.id === "quoc-hoc");
    const ubndSite = sites.find((s) => s.id === "ubnd");
    const closest = mainRoads
      .map((r) => nearestPoint(biaSite.sign, r.points))
      .sort((a, b) => a.distance - b.distance)[0];
    const heading = Math.atan2(closest.x - biaSite.sign.x, closest.z - biaSite.sign.z);

    const world = {
      scene: new THREE.Scene(),
      riverRings: river,
      cameraObstacles: [],
    };
    const bia = createBiaQuocHocPark(world, biaSite, heading);
    const fp = createFountainPark(world, biaSite, heading, { ubnd: ubndSite });

    // Shore carp & koi shoals
    assert.ok(bia.fishingSpot);
    assert.ok(bia.fishShoal.length >= 20);
    assert.ok(bia.fishShoal.some((f) => f.speciesId === "ca-koi"));
    assert.ok(bia.fishShoal.some((f) => f.speciesId === "ca-chep"));
    const firstFishBefore = bia.fishShoal[0].mesh.position.clone();
    bia.fishingSpot.setFishingActive(true, bia.fishingSpot.vendorPos);
    assert.equal(bia.fishingSpot.isFishingActive(), true);
    bia.update(3.5);
    assert.ok(bia.fishShoal[0].mesh.position.distanceTo(firstFishBefore) > 0.2);

    // Unobstructed dock signboard: posts sit outside sign width and behind sign z
    const booth = fp.group.getObjectByName("pedal-dock-booth");
    const postL = booth.getObjectByName("dock-sign-post-left");
    const postR = booth.getObjectByName("dock-sign-post-right");
    const signBoard = booth.getObjectByName("dock-signboard");
    assert.ok(postL && postR && signBoard);
    const signHalfW = 2.26 / 2;
    assert.ok(postL.position.x + 0.04 < signBoard.position.x - signHalfW);
    assert.ok(postR.position.x - 0.04 > signBoard.position.x + signHalfW);
    assert.ok(postL.position.z < signBoard.position.z);

    // Boat launch heading pushes riverward (away from shore block)
    const launchStep = {
      x: fp.pedalDock.dockWaterPos.x + Math.sin(fp.pedalDock.dockWaterPos.heading) * 6,
      z: fp.pedalDock.dockWaterPos.z + Math.cos(fp.pedalDock.dockWaterPos.heading) * 6,
    };
    assert.equal(fp.isWaterBlocked(launchStep.x, launchStep.z), false);
    assert.ok(river.some((r) => inside(launchStep, r)));

    // Room accepts valid online boarding jump from dock vendor to moored boat and exit back to pier
    const realAreas = new Map([
      [
        "quoc-hoc",
        {
          region: {
            path: [
              [480, -498],
              [678, -714],
            ],
            radius: 160,
          },
          spawn: { x: fp.pedalDock.vendorPos.x, z: fp.pedalDock.vendorPos.z, heading: 0 },
        },
      ],
    ]);
    const room = new Room(realAreas);
    const msgs = [];
    const joinRes = room.join(
      {
        version: PROTOCOL_VERSION,
        name: "ThuyenVien",
        region: "quoc-hoc",
        avatar: "boy",
        gameMode: "free-roam",
      },
      (m) => msgs.push(m),
    );
    const sailor = joinRes.player;
    assert.ok(sailor, `expected sailor to join, got: ${joinRes.error}`);
    const boatSpec = fp.pedalDock.boats[0];
    room.state(sailor, {
      region: "quoc-hoc",
      seq: 1,
      x: boatSpec.x,
      y: 0.03,
      z: boatSpec.z,
      heading: boatSpec.launchHeading,
      speed: 0,
      lean: 0,
      stance: "boat",
      boatIndex: 0,
    });
    assert.equal(sailor.stance, "boat");
    assert.equal(msgs.some((m) => m.type === "correct"), false);

    // Server river reward action awards 65đ for cá chép, 100đ for cá koi, 15đ for boat cruise, and enforces cooldown
    assert.equal(
      handleRiverRewardAction(
        sailor,
        { action: "river_reward", kind: "boat_cruise" },
        room,
        10_000,
      ),
      true,
    );
    assert.equal(sailor.riverScore, BOAT_CRUISE_REWARD.points);

    room.state(sailor, {
      region: "quoc-hoc",
      seq: 2,
      x: fp.pedalDock.pierReturnPos.x,
      y: 0.22,
      z: fp.pedalDock.pierReturnPos.z,
      heading: 0,
      speed: 0,
      lean: 0,
      stance: "idle",
      boatIndex: -1,
    });
    assert.equal(sailor.stance, "idle");
    assert.equal(msgs.some((m) => m.type === "correct"), false);

    // Server fish rewards: move sailor near Bia Quốc Học deck and test ca-chep + cooldown + ca-koi
    sailor.x = 480.44;
    sailor.z = -498.06;
    assert.equal(
      handleRiverRewardAction(
        sailor,
        { action: "river_reward", kind: "fish_catch", speciesId: "ca-chep" },
        room,
        20_000,
      ),
      true,
    );
    assert.equal(
      handleRiverRewardAction(
        sailor,
        { action: "river_reward", kind: "fish_catch", speciesId: "ca-koi" },
        room,
        20_500,
      ),
      false,
    );
    assert.equal(
      handleRiverRewardAction(
        sailor,
        { action: "river_reward", kind: "fish_catch", speciesId: "ca-koi" },
        room,
        25_000,
      ),
      true,
    );
    assert.equal(sailor.fishCount, 2);
    assert.equal(sailor.riverScore, BOAT_CRUISE_REWARD.points + 65 + 100);

    // Cross-plane Boat vs Walker does not trigger collision
    let now = 50_000;
    const collisionRoom = new Room(realAreas, { now: () => now });
    const boatMsgs = [];
    const walkMsgs = [];
    const pBoat = collisionRoom.join(
      { version: PROTOCOL_VERSION, name: "Boat", region: "quoc-hoc", avatar: "boy", gameMode: "free-roam" },
      (m) => boatMsgs.push(m),
    ).player;
    const pWalk = collisionRoom.join(
      { version: PROTOCOL_VERSION, name: "Walker", region: "quoc-hoc", avatar: "girl", gameMode: "free-roam" },
      (m) => walkMsgs.push(m),
    ).player;
    Object.assign(pBoat, { x: 480, z: -500, speed: 3, stance: "boat", boatIndex: 0, ready: true, activeAt: 50_000, immuneUntil: 0 });
    Object.assign(pWalk, { x: 480, z: -500.5, speed: 2, stance: "walk", boatIndex: -1, ready: true, activeAt: 50_000, immuneUntil: 0 });
    now = 50_100;
    collisionRoom.state(pBoat, {
      region: "quoc-hoc",
      seq: 1,
      x: 480,
      y: 0.03,
      z: -500.6,
      heading: 0,
      speed: 3,
      lean: 0,
      stance: "boat",
      boatIndex: 0,
    });
    assert.equal(boatMsgs.some((m) => m.type === "collision"), false);
    assert.equal(walkMsgs.some((m) => m.type === "collision"), false);

    // Fishing countryside music state & heavy-pull / big-fish audio cues
    assert.ok(countrysideFishingMelody.length >= 16);
    assert.ok(countrysideFishingBass.length >= 2);
    const origAddEvt = globalThis.addEventListener;
    globalThis.addEventListener = () => {};
    try {
      const audio = new CityAudio();
      assert.equal(audio.fishingMode, false);
      assert.equal(audio.setFishingMode(true), true);
      assert.equal(audio.fishingMode, true);
      assert.equal(audio.setFishingMode(false), false);

      // Safe no-op when audio context is not running
      audio.playReelPull(1.5, true);
      audio.playFishCatchFanfare("ca-koi");

      // Active WebAudio graph synthesizes heavy reel tension + big fish catch fanfare
      let oscCount = 0;
      let bufCount = 0;
      const makeParam = () => ({
        value: 0,
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
      });
      const makeNode = () => ({
        frequency: makeParam(),
        gain: makeParam(),
        Q: makeParam(),
        type: "",
        buffer: null,
        connect(target) {
          return target;
        },
        disconnect() {},
        start() {},
        stop() {},
      });
      audio.enabled = true;
      audio.master = makeNode();
      audio.noiseBuffer = {};
      audio.ctx = {
        state: "running",
        currentTime: 1,
        createOscillator() {
          oscCount += 1;
          return makeNode();
        },
        createGain() {
          return makeNode();
        },
        createBiquadFilter() {
          return makeNode();
        },
        createBufferSource() {
          bufCount += 1;
          return makeNode();
        },
      };
      audio.playReelPull(1.5, true);
      const afterPullOsc = oscCount;
      const afterPullBuf = bufCount;
      assert.ok(afterPullOsc >= 4, "heavy reel pull should synthesize clicks + strain osc");
      assert.ok(afterPullBuf >= 1, "heavy reel pull should trigger water churn burst");

      oscCount = 0;
      bufCount = 0;
      audio.playFishCatchFanfare("ca-bong");
      const smallFishOsc = oscCount;

      oscCount = 0;
      bufCount = 0;
      audio.playFishCatchFanfare("ca-koi");
      assert.ok(oscCount > smallFishOsc, "big koi catch should layer extra bass + sparkle notes");
      assert.ok(bufCount >= 1, "big koi catch should trigger water breach splash");
    } finally {
      globalThis.addEventListener = origAddEvt;
    }

    // Fishing minigame HUD stays docked off-center so it does not cover the seated fisher
    const riverCss = fs.readFileSync(
      path.resolve("src/core/world/river-activities.css"),
      "utf8",
    );
    assert.match(riverCss, /#fishing-minigame\s*\{[^}]*--panel-tx:\s*0%[^}]*left:\s*16px/);
    assert.match(riverCss, /body\[data-river-activity="fishing"\]\s+\.touch-controls/);
  } finally {
    if (origDoc === undefined) delete globalThis.document;
    else globalThis.document = origDoc;
  }
});
