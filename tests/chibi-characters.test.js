import test from "node:test";
import assert from "node:assert/strict";
import {
  AVATAR_IDS,
  AVATAR_CATALOG,
  cleanAvatarId,
  cleanStance,
  DEFAULT_AVATAR_ID,
  PROTOCOL_VERSION,
} from "../src/core/network/protocol.js";
import { buildChibiActor } from "../src/core/vehicle/ChibiCharacters.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";
import { BicycleMotion, wrapAngle } from "../src/core/vehicle/BicycleMotion.js";
import { setRiderIdentity } from "../src/core/vehicle/RiderIdentity.js";
import { Room } from "../server/Room.js";
import {
  getSavedAvatar,
  PLAYER_AVATAR_STORAGE_KEY,
  saveAvatar,
} from "../src/ui/SessionUI.js";

test("all 6 Chibi characters build in 3D and animate idle/walk/run/bike cleanly", () => {
  assert.deepEqual(AVATAR_IDS, ["boy", "girl", "dog", "cat", "cow", "buffalo"]);
  assert.equal(AVATAR_CATALOG.length, 6);

  for (const id of AVATAR_IDS) {
    const rig = buildChibiActor(id);
    assert.equal(rig.avatarId, id);
    assert.equal(rig.bike.group.visible, false);

    const bike = new TouringBike({ avatar: id, mode: "foot" });
    setRiderIdentity(bike, `Bạn ${id}`, "#247bba", true);
    assert.equal(bike.avatarId, id);
    assert.equal(bike.stance, "idle");
    assert.equal(bike.rig.bike.group.visible, false);

    // Walk
    for (let i = 0; i < 20; i++) bike.update(1 / 60, 0.7, 0, false);
    assert.equal(bike.stance, "walk");
    assert.equal(bike.rig.bike.group.visible, false);

    // Run (with sprint)
    for (let i = 0; i < 45; i++)
      bike.update(1 / 60, 1, 0, false, { sprint: true });
    assert.equal(bike.stance, "run");
    assert.equal(bike.rig.bike.group.visible, false);

    // Toggle to bike
    bike.toggleTransportMode();
    bike.update(1 / 60, 1, 0.3, false);
    assert.equal(bike.stance, "bike");
    assert.equal(bike.rig.bike.group.visible, true);

    // Toggle back to foot
    bike.toggleTransportMode();
    bike.update(1 / 60, 0, 0, true);
    assert.notEqual(bike.stance, "bike");
    assert.equal(bike.rig.bike.group.visible, false);
  }
});

test("on-foot locomotion allows stationary turning and progresses walk -> run cleanly", () => {
  const foot = new BicycleMotion("foot");
  assert.equal(foot.stance, "idle");

  // Stationary turn in place works when speed === 0
  foot.step(0.2, 0, 1);
  assert.ok(wrapAngle(foot.heading) > 0.25);

  // Start walking
  for (let i = 0; i < 25; i++) foot.step(1 / 60, 0.8, 0);
  assert.equal(foot.stance, "walk");
  assert.ok(foot.speed > 1.0 && foot.speed < 2.75);

  // Sustained fast walk / sprint accelerates to run
  for (let i = 0; i < 100; i++) foot.step(1 / 60, 1, 0, false, false);
  assert.equal(foot.stance, "run");
  assert.ok(foot.speed >= 2.75 && foot.speed <= 5.7);

  // Switching to bike keeps max speed capped <= 9
  foot.setMode("bike");
  for (let i = 0; i < 600; i++) foot.step(1 / 60, 1, 0);
  assert.equal(foot.stance, "bike");
  assert.ok(foot.speed > 7.5 && foot.speed <= 9.0);
});

test("protocol & multiplayer Room sanitize avatar and stance fields safely", () => {
  assert.equal(cleanAvatarId("invalid"), DEFAULT_AVATAR_ID);
  assert.equal(cleanAvatarId("buffalo"), "buffalo");
  assert.equal(cleanStance("run", 4), "run");
  assert.equal(cleanStance("bogus", 3.5), "run");
  assert.equal(cleanStance("bogus", 1.2), "walk");
  assert.equal(cleanStance("bogus", 0), "idle");

  const region = {
    path: [
      [0, 0],
      [0, 100],
    ],
    radius: 10,
    extensions: [],
  };
  const areas = new Map([
    ["quoc-hoc", { spawn: { x: 0, z: 0, heading: 0 }, region }],
  ]);
  let now = 0;
  const room = new Room(areas, { now: () => now });
  const joined = room.join(
    {
      version: PROTOCOL_VERSION,
      name: "Minh",
      avatar: "cat",
      region: "quoc-hoc",
    },
    () => {},
  );
  assert.equal(joined.player.avatar, "cat");
  assert.equal(room.publicPlayer(joined.player).avatar, "cat");

  now = 200;
  room.state(joined.player, {
    seq: 1,
    region: "quoc-hoc",
    x: 0,
    y: 0,
    z: 0.4,
    heading: 0,
    speed: 3.4,
    lean: 0,
    avatar: "buffalo",
    stance: "run",
  });
  const pub = room.publicPlayer(joined.player);
  assert.equal(pub.avatar, "buffalo");
  assert.equal(pub.stance, "run");
});

test("avatar selection persists in storage with clean fallback", () => {
  const map = new Map();
  const storage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
  assert.equal(getSavedAvatar(storage), DEFAULT_AVATAR_ID);
  assert.equal(saveAvatar("cow", storage), "cow");
  assert.equal(map.get(PLAYER_AVATAR_STORAGE_KEY), "cow");
  assert.equal(getSavedAvatar(storage), "cow");
  assert.equal(saveAvatar("hacked", storage), DEFAULT_AVATAR_ID);
});
