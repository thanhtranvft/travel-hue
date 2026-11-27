import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { CityAudio } from "../src/core/audio/CityAudio.js";
import { CaHueBoats } from "../src/core/world/CaHueBoats.js";
import { RiverActivities } from "../src/core/world/RiverActivities.js";
import { boatHull, boatHullsOverlap } from "../src/core/world/boatCollision.js";
import { river } from "../src/core/shared/geography/map.js";
import { Room } from "../server/Room.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { AVATAR_IDS } from "../src/core/network/protocol.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";

test("leaving the cruise chooses a walkable shore point with inland clearance and resets input",()=>{
  const activity=Object.create(RiverActivities.prototype);
  const dock={pierReturnPos:{x:0,z:0,y:.36},vendorPos:{x:0,z:5,y:.36},setCruiseActive(){}};
  const bike=new TouringBike({avatar:"boy",mode:"foot"});bike.setActivityStance("cruise");
  let resets=0;
  activity.mode="cruise";activity.game={bike,auto:true,input:{reset(){resets++;}},world:{
    fireflyPark:{dragonDock:dock},groundAt:()=>.36,canRide:(x,z)=>z>=5&&Math.abs(x)<5
  }};
  activity.refreshPanels=()=>{};
  assert.equal(activity.exitCruise(),true);
  assert.ok(bike.position.z>=5);
  assert.equal(bike.motion.heading,0);
  assert.equal(bike.activityStance,null);
  assert.equal(activity.game.auto,false);
  assert.equal(resets,1);
  assert.equal(activity.stepPhysics(.1),false,"land movement no longer intercepted by river activity");
  activity.mode="boating";activity.game.world.fountainPark={pedalDock:dock};
  bike.setActivityStance("boat",{boatIndex:0});
  assert.equal(activity.exitBoat(),true);
  assert.equal(bike.activityStance,null);
  assert.ok(bike.position.z>=5);
});

test("boarding a cruise cleans up the previous fading song immediately", () => {
  const originalDoc = globalThis.document;
  globalThis.document = { addEventListener() {} };
  let audio;
  try {
    audio = new CityAudio();
  } finally {
    if (originalDoc === undefined) delete globalThis.document;
    else globalThis.document = originalDoc;
  }
  assert.equal(audio.enabled, true);
  assert.equal(audio.musicEnabled, true);
  let paused = 0,
    released = 0;
  const param = {
    value: 1,
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    cancelScheduledValues() {},
  };
  audio.ctx = { currentTime: 0 };
  audio.background = { gain: { setTargetAtTime() {} } };
  audio.venue = { gain: { setTargetAtTime() {} } };
  audio.caHueMediaEl = {
    pause() {
      paused++;
    },
    removeAttribute() {
      released++;
    },
    load() {},
  };
  audio.caHueMediaGain = { gain: param, disconnect() {} };
  audio.caHueMediaSrc = { disconnect() {} };
  audio.stopCaHueMedia(false);
  assert.equal(paused, 0);
  audio.setDragonCruiseMode(true, { song: { id: "onboard" } });
  assert.equal(paused, 1);
  assert.equal(released, 1);
  assert.equal(audio.caHueFadeTimer, null);
  audio.update({ position: { x: 0, z: 0 }, motion: { speed: 0 } }, [], 0, [
    { song: { id: "other" }, x: 0, z: 0 },
  ]);
  assert.equal(audio.activeCaHueBoat.song.id, "onboard");
  audio.setMusicEnabled(false);
  assert.equal(
    audio.dragonCruiseMode,
    true,
    "music toggle does not stop the onboard performance",
  );
  audio.setDragonCruiseMode(false);
  assert.equal(audio.activeCaHueBoat, null);
});

test("ambient dragon boats keep hull clearance from each other and online cruises", () => {
  const boats = new CaHueBoats({ scene: new THREE.Scene(), riverRings: river });
  for (let time = 0; time <= 900; time += 5) {
    const local = boatHull(boats.sampleLoop(time * 3.65));
    const remote = boatHull(boats.sampleLoop(time * 3.65 + 120));
    boats.setExternalCruisePose(local);
    boats.remoteCruisePoses = [remote];
    boats.update(time);
    for (let i = 0; i < boats.boats.length; i++) {
      const a = boatHull(boats.boats[i]);
      for (const ext of [local, remote])
        assert.equal(
          boatHullsOverlap(a, ext, 0),
          false,
          `external hull collision at ${time}`,
        );
      for (let j = i + 1; j < boats.boats.length; j++)
        assert.equal(
          boatHullsOverlap(a, boatHull(boats.boats[j]), 0),
          false,
          `ambient collision ${i}/${j} at ${time}`,
        );
    }
  }
});

test("cruise autopilot steers or yields without advancing its hull through another boat", () => {
  const activity = Object.create(RiverActivities.prototype);
  const other = boatHull({ x: 0, z: 22, heading: Math.PI });
  const bike = {
    position: new THREE.Vector3(),
    rotation: { y: 0, z: 0 },
    motion: { heading: 0, speed: 3.65 },
    update() {},
  };
  activity.mode = "cruise";
  activity.remoteCruisePoses = [other];
  activity.cruiseDistance = 0;
  activity.cruiseLoopDist = 0;
  activity.game = {
    bike,
    elapsed: 0,
    world: {
      canCruiseAt: () => true,
      caHueBoats: { boats: [], setExternalCruisePose() {} },
      riverSurfaceAt: () => 0.03,
    },
  };
  for (let i = 0; i < 600; i++) {
    activity.game.elapsed = i / 60;
    activity.stepPhysics(1 / 60);
    assert.equal(
      boatHullsOverlap(
        boatHull({
          x: bike.position.x,
          z: bike.position.z,
          heading: bike.motion.heading,
        }),
        other,
        0,
      ),
      false,
    );
  }
});

test("online server refuses overlapping cruise boarding and approaching hulls", () => {
  let now = 1000;
  const area = {
    region: {
      path: [
        [500, -640],
        [650, -640],
      ],
      radius: 200,
    },
    spawn: { x: 570.96, z: -629.48, heading: 0 },
  };
  const room = new Room(new Map([["quoc-hoc", area]]), { now: () => now });
  const messages = [];
  const join = (name) =>
    room.join(
      {
        version: PROTOCOL_VERSION,
        name,
        region: "quoc-hoc",
        gameMode: "free-roam",
      },
      (msg) => messages.push(msg),
    ).player;
  const a = join("Một"),
    b = join("Hai");
  const pose = {
    region: "quoc-hoc",
    seq: 1,
    x: 568.91,
    z: -635.53,
    y: 0.03,
    heading: Math.PI / 2,
    speed: 0,
    lean: 0,
    stance: "cruise",
  };
  room.state(a, pose);
  assert.equal(a.stance, "cruise");
  room.state(b, pose);
  assert.notEqual(b.stance, "cruise");
  assert.ok(messages.some((m) => m.type === "correct" && m.player.id === b.id));
  Object.assign(b, {
    x: a.x + 18,
    z: a.z,
    heading: Math.PI / 2,
    stance: "cruise",
    ready: true,
  });
  const oldX = a.x;
  now += 100;
  room.state(a, { ...pose, seq: 2, x: oldX + 0.8 });
  assert.equal(a.x, oldX);
  assert.equal(a.speed, 0);
});

test("all avatars board as seated tourists with the three requested performers", () => {
  for (const avatar of AVATAR_IDS) {
    const bike = new TouringBike({ avatar, mode: "foot" });
    bike.setActivityStance("cruise");
    bike.update(0.1, 0, 0, false, { stance: "cruise", poseOnly: true });
    assert.equal(bike.stance, "cruise");
    assert.equal(bike.cruiseBoat.group.visible, true);
    assert.equal(bike.cruiseBoat.performers.length, 3);
    assert.ok(
      bike.rig.actor.position.distanceTo(
        new THREE.Vector3(
          bike.cruiseBoat.playerSeatOffset.x,
          bike.cruiseBoat.playerSeatOffset.y,
          bike.cruiseBoat.playerSeatOffset.z,
        ),
      ) < 0.01,
    );
    bike.setActivityStance(null);
    assert.equal(bike.cruiseBoat.group.visible, false);
  }
});
