import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createFishingGameState,
  FISH_SPECIES,
} from "../src/core/world/RiverActivities.js";
import { CaHueBoats, CA_HUE_SONGS } from "../src/core/world/CaHueBoats.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";
import { AVATAR_IDS } from "../src/core/network/protocol.js";
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

  // Advance until bite triggers
  let bitten = false;
  for (let i = 0; i < 40; i++) {
    const ev = f.step(0.15, () => 0.25);
    if (ev.bitten) {
      bitten = true;
      break;
    }
  }
  assert.equal(bitten, true);
  assert.equal(f.phase, "bite");
  assert.ok(f.species);

  const hooked = f.pullReel(() => 0.5);
  assert.equal(hooked.action, "hooked");
  assert.equal(f.phase, "reeling");

  // Align cursor with targetCenter and reel until caught
  f.cursor = f.targetCenter;
  const hit1 = f.pullReel(() => 0.5);
  assert.equal(hit1.action, "hit");
  f.cursor = f.targetCenter;
  const hit2 = f.pullReel(() => 0.5);
  assert.equal(hit2.action, "caught");
  assert.equal(f.phase, "caught");
  assert.equal(f.lastCatch.id, f.species.id);

  f.reset();
  assert.equal(f.phase, "ready");
  assert.equal(f.species, null);
});

test("all 6 chibi avatars animate 3D fishing rod with { phase } and pedal boats cleanly", () => {
  for (const id of AVATAR_IDS) {
    const bike = new TouringBike({ avatar: id, mode: "foot" });
    bike.setActivityStance("fish", { fishState: { phase: "bite" } });
    assert.equal(bike.stance, "fish");
    assert.equal(bike.rig.character.fishingRod.group.visible, true);

    bike.update(0.1, 0, 0, false, {
      stance: "fish",
      poseOnly: true,
      fishState: { phase: "reeling" },
    });
    assert.ok(
      bike.rig.character.fishingRod.rodPivot.rotation.x < -0.1,
      `expected reeling rod lift for ${id}`,
    );

    bike.setActivityStance("boat", { boatIndex: 2 });
    assert.equal(bike.stance, "boat");
    assert.equal(bike.boatIndex, 2);
    assert.equal(bike.boatHull.visible, true);
    assert.equal(bike.rig.character.fishingRod.group.visible, false);

    bike.setActivityStance(null);
    assert.notEqual(bike.stance, "boat");
    assert.notEqual(bike.stance, "fish");
    assert.equal(bike.boatHull.visible, false);
  }
});

test("CaHueBoats cruise inside river rings clear of piers and expose spatial songs", () => {
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
  assert.equal(caHue.boats.length, CA_HUE_SONGS.length);

  caHue.update(12.5);
  const sources = caHue.getAudioSources();
  assert.equal(sources.length, CA_HUE_SONGS.length);
  for (const s of sources) {
    assert.ok(s.song?.title);
    assert.ok(river.some((ring) => inside({ x: s.x, z: s.z }, ring)));
    assert.equal(caHue.hitsBoat(s.x, s.z, 0), true);
  }
});

test("BiaQuocHoc fishingSpot, FountainPark pedalDock, and server riverActivity rewards & boat slots work end-to-end", () => {
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

  assert.ok(bia.fishingSpot);
  const seat = bia.fishingSpot.seatAtWorld(
    bia.fishingSpot.vendorPos.x,
    bia.fishingSpot.vendorPos.z,
  );
  assert.equal(seat.y, bia.fishingSpot.seatY);
  assert.equal(bia.fishingSpot.isNearDeckEdge(seat.x, seat.z, 4.2), true);

  assert.ok(fp.pedalDock);
  assert.equal(fp.pedalDock.boats.length, 6);
  const boatMeshes = fp.animatedObjects.slice(2);
  fp.setOccupiedBoats(new Set([0, 3]));
  assert.equal(boatMeshes[0].visible, false);
  assert.equal(boatMeshes[1].visible, true);
  assert.equal(fp.pedalDock.isDockBlocked(fp.pedalDock.boats[0].x, fp.pedalDock.boats[0].z), false);
  assert.equal(fp.pedalDock.isDockBlocked(fp.pedalDock.boats[1].x, fp.pedalDock.boats[1].z), true);

  // Server reward validation & Room cross-plane collision check
  const sent = [];
  const fakeRoom = {
    areas: new Map([["quoc-hoc", { region: { path: [[bia.fishingSpot.vendorPos.x, bia.fishingSpot.vendorPos.z]], radius: 220 } }]]),
    contains: () => true,
    send: (_p, msg) => sent.push(msg),
  };
  const angler = {
    region: "quoc-hoc",
    x: bia.fishingSpot.vendorPos.x,
    z: bia.fishingSpot.vendorPos.z,
    stance: "fish",
    riverScore: 0,
    fishCount: 0,
  };
  const okFish = handleRiverRewardAction(
    angler,
    { action: "river_reward", kind: "fish_catch", speciesId: "ca-chep" },
    fakeRoom,
    10_000,
  );
  assert.equal(okFish, true);
  assert.equal(angler.riverScore, RIVER_FISH_REWARDS["ca-chep"].points);
  assert.equal(angler.fishCount, 1);

  // Cooldown rejects spam within 2.2s
  const spamFish = handleRiverRewardAction(
    angler,
    { action: "river_reward", kind: "fish_catch", speciesId: "ca-chep" },
    fakeRoom,
    11_000,
  );
  assert.equal(spamFish, false);

  // Boat cruise reward requires boat stance
  angler.stance = "boat";
  const okBoat = handleRiverRewardAction(
    angler,
    { action: "river_reward", kind: "boat_cruise" },
    fakeRoom,
    20_000,
  );
  assert.equal(okBoat, true);
  assert.equal(
    angler.riverScore,
    RIVER_FISH_REWARDS["ca-chep"].points + BOAT_CRUISE_REWARD.points,
  );
  assert.equal(sent.length, 2);

  // Room skips 2D collision between boat player and land/bridge player
  const areas = new Map([
    [
      "quoc-hoc",
      {
        region: {
          path: [
            [0, 0],
            [0, 100],
          ],
          radius: 40,
        },
        spawn: { x: 0, z: 0, heading: 0 },
      },
    ],
  ]);
  const room = new Room(areas);
  const p1Msgs = [];
  const p2Msgs = [];
  const p1 = room.join(
    { name: "Boat", region: "quoc-hoc", avatar: "boy", gameMode: "free-roam" },
    (m) => p1Msgs.push(m),
  );
  const p2 = room.join(
    { name: "Walker", region: "quoc-hoc", avatar: "girl", gameMode: "free-roam" },
    (m) => p2Msgs.push(m),
  );
  room.state(p1, {
    region: "quoc-hoc",
    seq: 1,
    x: 0,
    y: 0.03,
    z: 10,
    heading: 0,
    speed: 4,
    lean: 0,
    stance: "boat",
    boatIndex: 0,
  });
  p1.immuneUntil = 0;
  p2.immuneUntil = 0;
  room.state(p2, {
    region: "quoc-hoc",
    seq: 1,
    x: 0,
    y: 5,
    z: 10,
    heading: 0,
    speed: 3,
    lean: 0,
    stance: "run",
    boatIndex: -1,
  });
  assert.equal(
    p1Msgs.some((m) => m.type === "collision") ||
      p2Msgs.some((m) => m.type === "collision"),
    false,
  );
});
