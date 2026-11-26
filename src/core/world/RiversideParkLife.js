import * as THREE from "three";
import { markSharedResource } from "../shared/resources/sceneResources.js";
import { makePerson, SOCIETY_PRESETS } from "./People.js";
import { createRiverFishMesh } from "./RiverFish.js";

const _matCache = new Map();
const _geoCache = new Map();

function sharedMat(color, roughness = 0.74, metalness = 0.05, extra = {}) {
  const key = `${color}|${roughness}|${metalness}|${extra.doubleSide ? 1 : 0}|${extra.opacity ?? 1}`;
  let m = _matCache.get(key);
  if (!m) {
    m = markSharedResource(
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        side: extra.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        transparent: extra.opacity !== undefined && extra.opacity < 1,
        opacity: extra.opacity ?? 1,
      }),
    );
    _matCache.set(key, m);
  }
  return m;
}

function sharedCyl(rt, rb, h, seg = 8) {
  const key = `cyl|${rt}|${rb}|${h}|${seg}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.CylinderGeometry(rt, rb, h, seg));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedBox(w, h, d) {
  const key = `box|${w}|${h}|${d}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.BoxGeometry(w, h, d));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedSphere(r, ws = 8, hs = 6) {
  const key = `sph|${r}|${ws}|${hs}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.SphereGeometry(r, ws, hs));
    _geoCache.set(key, g);
  }
  return g;
}

const MALE_PRESETS = SOCIETY_PRESETS.filter(
  (p) => p.role === "man" || p.role === "elder-man",
);
const FEMALE_PRESETS = SOCIETY_PRESETS.filter(
  (p) => p.role === "woman" || p.role === "elder-woman",
);
const YOUTH_PRESETS = SOCIETY_PRESETS.filter(
  (p) => p.role === "man" || p.role === "woman" || p.role === "boy" || p.role === "girl",
);

const _vTip = new THREE.Vector3();
const _vEnd = new THREE.Vector3();
const _vDir = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, 1, 0);

function connectLineMesh(mesh, aWorld, bWorld) {
  _vDir.subVectors(bWorld, aWorld);
  const len = _vDir.length();
  if (len < 0.001) {
    mesh.visible = false;
    return;
  }
  mesh.visible = true;
  mesh.position.addVectors(aWorld, bWorld).multiplyScalar(0.5);
  mesh.scale.set(1, len, 1);
  _vDir.normalize();
  mesh.quaternion.setFromUnitVectors(_vUp, _vDir);
}

/**
 * Couple of a man and a woman seated side-by-side on a park bench talking with animated head & hand gestures.
 */
export function createSeatedBenchCouple({
  x = 0,
  benchBaseY = 0,
  z = 0,
  yaw = 0,
  seatDeltaY = 0,
  manIndex = 0,
  womanIndex = 0,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "bench-couple";
  group.position.set(x, benchBaseY + seatDeltaY, z);
  group.rotation.y = yaw;

  const mPreset = MALE_PRESETS[Math.abs(manIndex) % MALE_PRESETS.length];
  const fPreset = FEMALE_PRESETS[Math.abs(womanIndex) % FEMALE_PRESETS.length];

  const man = makePerson({
    ...mPreset,
    role: "man",
    accessory: undefined,
    seated: true,
  });
  man.position.set(-0.34, -0.27, 0.04);
  man.rotation.y = 0.28;

  const woman = makePerson({
    ...fPreset,
    role: "woman",
    accessory: undefined,
    hat: womanIndex % 3 === 1 ? undefined : fPreset.hat,
    seated: true,
  });
  woman.position.set(0.34, -0.24, 0.04);
  woman.rotation.y = -0.28;

  group.add(man, woman);

  const mHead = man.getObjectByName("head-group");
  const wHead = woman.getObjectByName("head-group");
  const mArms = man.userData.limbs?.arms || [];
  const wArms = woman.userData.limbs?.arms || [];

  const update = (time = 0) => {
    const t = time * 1.65 + phase;
    if (mHead) {
      mHead.rotation.y = 0.24 + Math.sin(t * 0.9) * 0.14;
      mHead.rotation.x = Math.sin(t * 1.9) * 0.09;
    }
    if (wHead) {
      wHead.rotation.y = -0.24 + Math.cos(t * 0.85) * 0.14;
      wHead.rotation.x = Math.sin(t * 2.1 + 1.2) * 0.1;
    }
    if (mArms[0]) {
      mArms[0].rotation.x = -0.34 - Math.max(0, Math.sin(t * 1.4)) * 0.24;
      mArms[0].rotation.z = 0.08 + Math.sin(t * 1.1) * 0.07;
    }
    if (mArms[1]) {
      mArms[1].rotation.x = -0.34 - Math.max(0, Math.cos(t * 1.3)) * 0.22;
      mArms[1].rotation.z = -0.06;
    }
    if (wArms[0]) {
      wArms[0].rotation.x = -0.34 - Math.max(0, Math.cos(t * 1.5 + 0.8)) * 0.25;
      wArms[0].rotation.z = 0.06;
    }
    if (wArms[1]) {
      wArms[1].rotation.x = -0.34 - Math.max(0, Math.sin(t * 1.2 + 0.5)) * 0.18;
      wArms[1].rotation.z = -0.08 - Math.cos(t * 1.1) * 0.06;
    }
  };
  update(0);

  return { group, update };
}

/**
 * Row of 10 animated NPC anglers fishing from the Bia Quốc Học wooden overlook deck,
 * cycling through calm waiting, bite splashes, heavy rod-bending pull/reel-in, and hoisting real river fish.
 */
export function createFishingAnglerRow(positions = []) {
  const group = new THREE.Group();
  group.name = "fishing-angler-row";

  const rodBaseGeo = markSharedResource(new THREE.CylinderGeometry(0.011, 0.018, 1.55, 6));
  rodBaseGeo.translate(0, 0.775, 0);
  const rodTipGeo = markSharedResource(new THREE.CylinderGeometry(0.0055, 0.011, 1.45, 6));
  rodTipGeo.translate(0, 0.725, 0);
  const lineGeo = markSharedResource(new THREE.CylinderGeometry(0.004, 0.004, 1, 5));
  const splashGeo = markSharedResource(new THREE.RingGeometry(0.11, 0.24, 14));
  splashGeo.rotateX(-Math.PI / 2);

  const bambooMat = sharedMat("#b78a42", 0.68);
  const tipMat = sharedMat("#cfa65a", 0.65);
  const lineMat = sharedMat("#eef7f8", 0.4, 0.1, { opacity: 0.85 });
  const floatRedMat = sharedMat("#e64632", 0.45);
  const floatWhiteMat = sharedMat("#f7f9fa", 0.45);
  const splashMat = sharedMat("#dffaff", 0.3, 0, { doubleSide: true, opacity: 0.62 });
  const bucketMat = sharedMat("#2f7d99", 0.65);

  const fishSpeciesPool = ["ca-chep", "ca-koi", "ca-ro-phi", "ca-diec", "ca-bong"];
  const anglerPresets = [
    { ...SOCIETY_PRESETS[0], hat: "non-la", accessory: undefined },
    { ...SOCIETY_PRESETS[2], accessory: undefined },
    { ...SOCIETY_PRESETS[1], hat: "non-la", accessory: undefined, skirt: false },
    { ...SOCIETY_PRESETS[6], accessory: undefined },
    { ...SOCIETY_PRESETS[4], accessory: undefined },
    { ...SOCIETY_PRESETS[8], hat: "cap", accessory: undefined },
    { ...SOCIETY_PRESETS[10], hat: "non-la", accessory: undefined },
    { ...SOCIETY_PRESETS[14], accessory: undefined, skirt: false },
    { ...SOCIETY_PRESETS[15], hat: "flat-cap", accessory: undefined },
    { ...SOCIETY_PRESETS[12], accessory: undefined },
  ];

  const anglers = [];

  positions.forEach((slot, idx) => {
    const slotGroup = new THREE.Group();
    slotGroup.name = `fishing-angler-${idx + 1}`;
    slotGroup.position.set(slot.lx, slot.deckY, slot.lz);
    slotGroup.rotation.y = slot.yaw ?? Math.PI;

    const leanPivot = new THREE.Group();
    const person = makePerson(anglerPresets[idx % anglerPresets.length]);
    leanPivot.add(person);
    slotGroup.add(leanPivot);

    // Small bait bucket resting beside each angler on the deck
    const bucket = new THREE.Mesh(sharedCyl(0.14, 0.11, 0.25, 10), bucketMat);
    bucket.position.set(0.42, 0.125, -0.1);
    bucket.castShadow = true;
    slotGroup.add(bucket);

    // Articulated 2-segment bamboo fishing rod attached to leanPivot
    const rodPivot = new THREE.Group();
    rodPivot.name = "angler-rod-pivot";
    rodPivot.position.set(0.2, 1.02, 0.22);
    const rodLower = new THREE.Mesh(rodBaseGeo, bambooMat);
    const rodTipPivot = new THREE.Group();
    rodTipPivot.name = "angler-rod-tip-pivot";
    rodTipPivot.position.set(0, 1.55, 0);
    const rodUpper = new THREE.Mesh(rodTipGeo, tipMat);
    const rodTipAnchor = new THREE.Object3D();
    rodTipAnchor.position.set(0, 1.45, 0);
    rodTipPivot.add(rodUpper, rodTipAnchor);
    rodPivot.add(rodLower, rodTipPivot);
    leanPivot.add(rodPivot);

    // Fishing line connecting rod tip to water bobber in slotGroup space
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    slotGroup.add(lineMesh);

    // Bobber + Splash + Hooked Fish
    const bobberGroup = new THREE.Group();
    const bTop = new THREE.Mesh(sharedSphere(0.048, 8, 6), floatRedMat);
    bTop.position.y = 0.025;
    const bBot = new THREE.Mesh(sharedSphere(0.044, 8, 6), floatWhiteMat);
    bBot.position.y = -0.02;
    bobberGroup.add(bTop, bBot);

    const speciesId = fishSpeciesPool[idx % fishSpeciesPool.length];
    const hookedFish = createRiverFishMesh(speciesId, { variant: idx + 3 });
    hookedFish.scale.setScalar(0.92 + (idx % 3) * 0.14);
    hookedFish.rotation.x = -Math.PI / 2;
    hookedFish.position.set(0, -0.26, 0);
    hookedFish.visible = false;
    bobberGroup.add(hookedFish);
    slotGroup.add(bobberGroup);

    const splashRing = new THREE.Mesh(splashGeo, splashMat);
    splashRing.position.set(0, -slot.deckY + 0.03, slot.waterOffset ?? 2.65);
    slotGroup.add(splashRing);

    group.add(slotGroup);

    anglers.push({
      slotGroup,
      leanPivot,
      person,
      arms: person.userData.limbs?.arms || [],
      head: person.getObjectByName("head-group"),
      rodPivot,
      rodTipPivot,
      rodTipAnchor,
      lineMesh,
      bobberGroup,
      hookedFish,
      splashRing,
      deckY: slot.deckY,
      waterDist: slot.waterOffset ?? 2.65,
      phase: slot.phase ?? idx * 1.17,
      cyclePeriod: 9.2 + (idx % 3) * 0.85,
      pullStrength: 0,
    });
  });

  group.userData.anglers = anglers;

  const update = (time = 0) => {
    slotMatrixLoop:
    for (let i = 0; i < anglers.length; i++) {
      const a = anglers[i];
      const u = (((time + a.phase) % a.cyclePeriod) + a.cyclePeriod) % a.cyclePeriod / a.cyclePeriod;
      const waterY = -a.deckY + 0.02;

      let rodX = 0.92;
      let rodZ = -0.05;
      let tipBendX = 0.14;
      let leanX = 0;
      let bobberX = 0.15;
      let bobberY = waterY;
      let bobberZ = a.waterDist;
      let showFish = false;
      let splashAmt = 0.4;

      if (u < 0.44) {
        // Calm wait: gentle breeze & floating bobber
        const waitT = time * 1.8 + a.phase;
        rodX = 0.92 + Math.sin(waitT * 0.7) * 0.04;
        tipBendX = 0.12 + Math.sin(waitT) * 0.04;
        bobberY = waterY + Math.sin(waitT * 1.6) * 0.022;
        splashAmt = 0.45 + 0.15 * Math.sin(waitT * 2);
      } else if (u < 0.56) {
        // Fish nibble / bite alert!
        const bt = (u - 0.44) / 0.12;
        const tug = Math.sin(bt * Math.PI * 5);
        rodX = 0.84 + tug * 0.09;
        tipBendX = 0.28 + Math.abs(tug) * 0.22;
        leanX = -0.04;
        bobberY = waterY - 0.06 - Math.abs(tug) * 0.08;
        bobberX = 0.15 + tug * 0.14;
        splashAmt = 0.85 + Math.abs(tug) * 0.65;
      } else if (u < 0.82) {
        // Heavy pulling / reeling in ("hành động kéo cần câu như người chơi")
        const pt = (u - 0.56) / 0.26;
        const pullWave = Math.sin(pt * Math.PI);
        const jerk = Math.sin(pt * Math.PI * 4) * 0.08;
        a.pullStrength = pullWave;
        leanX = -0.24 * pullWave + jerk * 0.3;
        rodX = 0.92 - 0.68 * pullWave + jerk * 0.5;
        rodZ = -0.14 * pullWave;
        tipBendX = 0.72 * pullWave + Math.abs(jerk) * 0.4;
        // Fish struggles & gets hoisted out of river surface toward deck edge
        const hoist = Math.max(0, (pt - 0.28) / 0.72);
        bobberZ = a.waterDist - hoist * 0.95;
        bobberY = waterY + hoist * 1.48;
        bobberX = 0.15 + Math.sin(pt * Math.PI * 6) * 0.16 * (1 - hoist * 0.5);
        showFish = hoist > 0.05;
        splashAmt = hoist < 0.5 ? 1.4 + Math.sin(time * 16) * 0.35 : 0.6;
      } else if (u < 0.91) {
        // Admire catch held in front
        const ht = (u - 0.82) / 0.09;
        leanX = -0.08 * (1 - ht);
        rodX = 0.32 + ht * 0.25;
        tipBendX = 0.38 * (1 - ht * 0.5);
        bobberZ = a.waterDist - 0.95;
        bobberY = waterY + 1.45 - ht * 0.25;
        showFish = true;
        splashAmt = 0.4;
      } else {
        // Re-cast cleanly into water
        const ct = (u - 0.91) / 0.09;
        rodX = 0.57 + ct * 0.35;
        tipBendX = 0.18 - ct * 0.06;
        bobberZ = a.waterDist - (1 - ct) * 0.95;
        bobberY = waterY + (1 - ct) * 1.2;
        splashAmt = ct > 0.75 ? 1.3 : 0.3;
      }

      if (u >= 0.82 || u < 0.56) {
        a.pullStrength = 0;
      }

      a.leanPivot.rotation.x = leanX;
      a.rodPivot.rotation.x = rodX;
      a.rodPivot.rotation.z = rodZ;
      a.rodTipPivot.rotation.x = tipBendX;

      if (a.arms[0]) {
        a.arms[0].rotation.x = -0.75 - Math.abs(leanX) * 1.3;
        a.arms[0].rotation.z = 0.22;
      }
      if (a.arms[1]) {
        a.arms[1].rotation.x = -0.82 - Math.abs(leanX) * 1.5;
        a.arms[1].rotation.z = -0.18;
      }
      if (a.head) {
        a.head.rotation.x = 0.14 + leanX * 0.6;
      }

      a.bobberGroup.position.set(bobberX, bobberY, bobberZ);
      a.hookedFish.visible = showFish;
      if (showFish && a.hookedFish.userData.tailPivot) {
        a.hookedFish.userData.tailPivot.rotation.y = Math.sin(time * 18 + i) * 0.42;
      }

      a.splashRing.position.set(bobberX, waterY + 0.01, a.waterDist);
      a.splashRing.scale.set(splashAmt, 1, splashAmt);

      // Compute rod tip position in slotGroup space without world matrix sync cost
      _vTip.set(0, 1.45, 0);
      _vTip.applyEuler(a.rodTipPivot.rotation);
      _vTip.y += 1.55;
      _vTip.applyEuler(a.rodPivot.rotation);
      _vTip.add(a.rodPivot.position);
      _vTip.applyEuler(a.leanPivot.rotation);

      _vEnd.set(bobberX, bobberY, bobberZ);
      connectLineMesh(a.lineMesh, _vTip, _vEnd);
      continue slotMatrixLoop;
    }
  };
  update(0);

  return { group, anglers, update };
}

/**
 * Group of youths flying colorful Hue kites overhead with animated reels, swaying kites, and trailing ribbons.
 */
export function createKiteFlyingGroup({
  x = 0,
  y = 0,
  z = 0,
  yaw = 0,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "kite-flying-group";
  group.position.set(x, y, z);
  group.rotation.y = yaw;

  const stringMat = sharedMat("#f7f4e8", 0.5, 0, { opacity: 0.78 });
  const stringGeo = sharedCyl(0.0055, 0.0055, 1, 4);
  const sparMat = sharedMat("#614328", 0.8);

  const flyers = [];
  const kiteDefs = [
    { px: -1.1, pz: 0.6, kx: -1.6, ky: 7.4, kz: -4.2, colA: "#e84b3a", colB: "#f6c945", tail: "#37b7e6", presetIdx: 4 },
    { px: 1.0, pz: 0.3, kx: 1.8, ky: 8.6, kz: -5.4, colA: "#2eb886", colB: "#ff8c42", tail: "#e85d9e", presetIdx: 5 },
    { px: 0.1, pz: 1.6, kx: 0.2, ky: 6.4, kz: -3.1, colA: "#4588e6", colB: "#ffe46b", tail: "#ff5c4d", presetIdx: 1 },
  ];

  kiteDefs.forEach((kd, idx) => {
    const person = makePerson({
      ...YOUTH_PRESETS[(kd.presetIdx + Math.round(phase * 3)) % YOUTH_PRESETS.length],
      accessory: undefined,
    });
    person.position.set(kd.px, 0, kd.pz);
    person.rotation.y = Math.atan2(kd.kx - kd.px, kd.kz - kd.pz);
    group.add(person);

    const head = person.getObjectByName("head-group");
    if (head) head.rotation.x = -0.36;

    // Kite reel held by flyer
    const reel = new THREE.Mesh(sharedCyl(0.075, 0.075, 0.11, 8), sharedMat("#c9823c", 0.75));
    reel.position.set(kd.px + 0.16, 1.15, kd.pz - 0.18);
    reel.rotation.z = Math.PI / 2;
    group.add(reel);

    // Sculpted diamond Hue kite + cross spars + 4 fluttering tail segments
    const kite = new THREE.Group();
    const sailA = new THREE.Mesh(sharedBox(0.72, 0.02, 0.72), sharedMat(kd.colA, 0.58, 0, { doubleSide: true }));
    sailA.rotation.y = Math.PI / 4;
    const sailB = new THREE.Mesh(sharedBox(0.46, 0.025, 0.46), sharedMat(kd.colB, 0.58, 0, { doubleSide: true }));
    sailB.rotation.y = Math.PI / 4;
    sailB.position.y = 0.008;
    const sparLong = new THREE.Mesh(sharedCyl(0.012, 0.012, 1.05, 5), sparMat);
    sparLong.rotation.x = Math.PI / 2;
    const sparCross = new THREE.Mesh(sharedCyl(0.012, 0.012, 1.02, 5), sparMat);
    sparCross.rotation.z = Math.PI / 2;
    kite.add(sailA, sailB, sparLong, sparCross);

    const tails = [];
    const tailMat = sharedMat(kd.tail, 0.65, 0, { doubleSide: true });
    for (let t = 0; t < 4; t++) {
      const seg = new THREE.Mesh(sharedBox(0.085, 0.012, 0.32), tailMat);
      seg.position.set(0, -0.02, 0.64 + t * 0.34);
      kite.add(seg);
      tails.push(seg);
    }
    kite.position.set(kd.kx, kd.ky, kd.kz);
    kite.rotation.x = 0.65;
    group.add(kite);

    const line = new THREE.Mesh(stringGeo, stringMat);
    group.add(line);

    flyers.push({
      person,
      arms: person.userData.limbs?.arms || [],
      head,
      handOrigin: new THREE.Vector3(kd.px + 0.16, 1.18, kd.pz - 0.18),
      kite,
      tails,
      line,
      base: kd,
      p: phase + idx * 1.4,
    });
  });

  const update = (time = 0) => {
    for (const f of flyers) {
      const t = time * 1.55 + f.p;
      const kx = f.base.kx + Math.sin(t) * 0.85;
      const ky = f.base.ky + Math.cos(t * 1.3) * 0.45;
      const kz = f.base.kz + Math.sin(t * 0.7) * 0.4;
      f.kite.position.set(kx, ky, kz);
      f.kite.rotation.z = Math.sin(t * 1.8) * 0.22;
      f.kite.rotation.x = 0.62 + Math.cos(t * 1.4) * 0.1;
      for (let j = 0; j < f.tails.length; j++) {
        f.tails[j].position.x = Math.sin(time * 5.2 + f.p + j * 0.9) * (0.08 + j * 0.04);
      }
      const tug = Math.sin(t * 2.1) * 0.12;
      if (f.arms[1]) f.arms[1].rotation.x = -1.25 + tug;
      if (f.arms[0]) f.arms[0].rotation.x = -0.95 - tug * 0.6;
      if (f.head) f.head.rotation.y = Math.sin(t * 0.9) * 0.14;

      _vEnd.set(kx, ky - 0.05, kz + 0.15);
      connectLineMesh(f.line, f.handOrigin, _vEnd);
    }
  };
  update(0);

  return { group, update };
}

/**
 * Youth music circle ("ngồi vòng tròn ca hát, đánh đàn"): cross-legged campers on a woven circular picnic mat
 * clapping & swaying around a central acoustic guitarist strumming.
 */
export function createGuitarCircleGroup({
  x = 0,
  y = 0,
  z = 0,
  yaw = 0,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "guitar-circle-group";
  group.position.set(x, y, z);
  group.rotation.y = yaw;

  // Woven mat cleanly 40mm above park lawn to guarantee zero Z-fighting
  const matMesh = new THREE.Mesh(
    sharedCyl(1.65, 1.65, 0.03, 24),
    sharedMat("#d89a56", 0.9),
  );
  matMesh.position.y = 0.025;
  matMesh.receiveShadow = true;
  const matBorder = new THREE.Mesh(
    sharedCyl(1.72, 1.72, 0.02, 24),
    sharedMat("#a64438", 0.88),
  );
  matBorder.position.y = 0.018;
  group.add(matBorder, matMesh);

  const seatY = 0.04;
  // Acoustic guitarist seated on one side facing into the circle
  const guitaristAngle = -Math.PI / 2;
  const gx = Math.cos(guitaristAngle) * 0.95;
  const gz = Math.sin(guitaristAngle) * 0.95;
  const guitarist = makePerson({
    ...SOCIETY_PRESETS[0],
    role: "man",
    accessory: undefined,
    onMat: true,
  });
  guitarist.position.set(gx, seatY, gz);
  guitarist.rotation.y = Math.atan2(-gx, -gz);
  group.add(guitarist);

  // Sculpted acoustic guitar held across chest
  const guitar = new THREE.Group();
  const bodyColor = sharedMat("#b8662c", 0.55);
  const darkWood = sharedMat("#3a2315", 0.7);
  const bodyMain = new THREE.Mesh(sharedCyl(0.19, 0.22, 0.09, 12), bodyColor);
  bodyMain.rotation.x = Math.PI / 2;
  const soundHole = new THREE.Mesh(sharedCyl(0.065, 0.065, 0.098, 10), darkWood);
  soundHole.rotation.x = Math.PI / 2;
  const neck = new THREE.Mesh(sharedBox(0.055, 0.46, 0.035), darkWood);
  neck.position.set(0, 0.34, 0);
  const headStock = new THREE.Mesh(sharedBox(0.085, 0.11, 0.04), darkWood);
  headStock.position.set(0, 0.6, 0);
  guitar.add(bodyMain, soundHole, neck, headStock);
  guitar.position.set(0.02, 0.36, 0.27);
  guitar.rotation.z = -0.95;
  guitar.rotation.y = 0.12;
  guitarist.add(guitar);

  // 5 seated youths forming a cheerful singing/clapping circle around the guitarist
  const listeners = [];
  const seatCount = 5;
  for (let i = 0; i < seatCount; i++) {
    const a = guitaristAngle + ((i + 1) / (seatCount + 1)) * Math.PI * 2;
    const lx = Math.cos(a) * 1.15;
    const lz = Math.sin(a) * 1.15;
    const preset = YOUTH_PRESETS[(i + 1) % YOUTH_PRESETS.length];
    const youth = makePerson({
      ...preset,
      accessory: undefined,
      onMat: true,
    });
    youth.position.set(lx, seatY, lz);
    youth.rotation.y = Math.atan2(-lx, -lz);
    group.add(youth);
    listeners.push({
      person: youth,
      arms: youth.userData.limbs?.arms || [],
      head: youth.getObjectByName("head-group"),
      p: phase + i * 0.7,
    });
  }

  const gArms = guitarist.userData.limbs?.arms || [];
  const gHead = guitarist.getObjectByName("head-group");

  const update = (time = 0) => {
    const beat = time * 3.8 + phase;
    if (gArms[1]) {
      // Right hand strumming strings
      gArms[1].rotation.x = -0.78 + Math.sin(beat * 2.2) * 0.24;
      gArms[1].rotation.z = -0.25 + Math.cos(beat * 2.2) * 0.12;
    }
    if (gArms[0]) {
      // Left hand fretting guitar neck
      gArms[0].rotation.x = -0.92;
      gArms[0].rotation.z = 0.32;
    }
    if (gHead) {
      gHead.rotation.x = Math.sin(beat) * 0.1;
      gHead.rotation.y = Math.sin(beat * 0.5) * 0.14;
    }

    for (const l of listeners) {
      const clap = Math.abs(Math.sin(beat + l.p));
      if (l.arms[0]) {
        l.arms[0].rotation.x = -0.72 - clap * 0.18;
        l.arms[0].rotation.z = -0.28 + clap * 0.22;
      }
      if (l.arms[1]) {
        l.arms[1].rotation.x = -0.72 - clap * 0.18;
        l.arms[1].rotation.z = 0.28 - clap * 0.22;
      }
      if (l.head) {
        l.head.rotation.z = Math.sin(beat * 0.5 + l.p) * 0.11;
        l.head.rotation.x = Math.sin(beat + l.p) * 0.08;
      }
    }
  };
  update(0);

  return { group, update };
}

/**
 * Two youths playing badminton ("đánh cầu lông") with animated rackets and arcing shuttlecock.
 */
export function createBadmintonGroup({
  x = 0,
  y = 0,
  z = 0,
  yaw = 0,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "badminton-group";
  group.position.set(x, y, z);
  group.rotation.y = yaw;

  const frameMat = sharedMat("#265d91", 0.45, 0.35);
  const gripMat = sharedMat("#22262b", 0.8);
  const netMat = sharedMat("#e8eef2", 0.5, 0, { opacity: 0.7, doubleSide: true });
  const torusGeo = markSharedResource(new THREE.TorusGeometry(0.13, 0.011, 6, 16));

  function attachRacket(armPivot, colorHex) {
    const racket = new THREE.Group();
    const grip = new THREE.Mesh(sharedCyl(0.015, 0.015, 0.18, 6), gripMat);
    grip.position.y = -0.52;
    grip.rotation.x = Math.PI / 2;
    const shaft = new THREE.Mesh(sharedCyl(0.008, 0.008, 0.28, 6), frameMat);
    shaft.position.set(0, -0.52, 0.22);
    shaft.rotation.x = Math.PI / 2;
    const head = new THREE.Mesh(torusGeo, sharedMat(colorHex, 0.4, 0.3));
    head.scale.set(0.85, 1.15, 1);
    head.position.set(0, -0.52, 0.48);
    head.rotation.x = Math.PI / 2;
    const meshFace = new THREE.Mesh(sharedCyl(0.11, 0.11, 0.006, 12), netMat);
    meshFace.scale.set(0.85, 1, 1.12);
    meshFace.position.set(0, -0.52, 0.48);
    racket.add(grip, shaft, head, meshFace);
    armPivot.add(racket);
  }

  const pA = makePerson({ ...YOUTH_PRESETS[0], accessory: undefined });
  pA.position.set(0, 0, 2.2);
  pA.rotation.y = Math.PI;
  const pB = makePerson({ ...YOUTH_PRESETS[1], accessory: undefined, skirt: false });
  pB.position.set(0, 0, -2.2);
  pB.rotation.y = 0;

  if (pA.userData.limbs?.arms?.[1]) attachRacket(pA.userData.limbs.arms[1], "#d94646");
  if (pB.userData.limbs?.arms?.[1]) attachRacket(pB.userData.limbs.arms[1], "#3096d9");
  group.add(pA, pB);

  // Shuttlecock
  const shuttle = new THREE.Group();
  const cork = new THREE.Mesh(sharedSphere(0.036, 8, 6), sharedMat("#f7f7f2", 0.5));
  const skirt = new THREE.Mesh(
    markSharedResource(new THREE.CylinderGeometry(0.068, 0.022, 0.095, 10, 1, true)),
    sharedMat("#ffffff", 0.6, 0, { doubleSide: true }),
  );
  skirt.position.y = 0.05;
  shuttle.add(cork, skirt);
  group.add(shuttle);

  const armsA = pA.userData.limbs?.arms || [];
  const armsB = pB.userData.limbs?.arms || [];
  const legsA = pA.userData.limbs?.legs || [];
  const legsB = pB.userData.limbs?.legs || [];
  const headA = pA.getObjectByName("head-group");
  const headB = pB.getObjectByName("head-group");

  const update = (time = 0) => {
    const cycle = (((time * 0.75 + phase) % 2) + 2) % 2; // 0..1 A->B, 1..2 B->A
    const dir = cycle < 1 ? 1 : -1;
    const u = cycle < 1 ? cycle : cycle - 1;
    const zPos = dir > 0 ? 1.8 - u * 3.6 : -1.8 + u * 3.6;
    const yPos = 1.42 + Math.sin(u * Math.PI) * 1.85;
    const xPos = Math.sin((time * 0.75 + phase) * 1.1) * 0.35;

    shuttle.position.set(xPos, yPos, zPos);
    shuttle.rotation.x = dir > 0 ? -0.5 + u : 0.5 - u;

    // Player lateral footwork & racket swing timed to shuttlecock arrival
    pA.position.x = Math.sin(time * 1.4 + phase) * 0.32;
    pB.position.x = Math.cos(time * 1.3 + phase) * 0.32;

    const swingA = cycle < 0.25 ? Math.sin((cycle / 0.25) * Math.PI) : cycle > 1.8 ? Math.sin(((cycle - 1.8) / 0.2) * Math.PI) * 0.6 : 0;
    const swingB = cycle > 0.8 && cycle < 1.25 ? Math.sin(((cycle - 0.8) / 0.45) * Math.PI) : 0;

    if (armsA[1]) armsA[1].rotation.x = -0.45 - swingA * 1.85;
    if (armsA[0]) armsA[0].rotation.x = -0.35 + swingA * 0.4;
    if (armsB[1]) armsB[1].rotation.x = -0.45 - swingB * 1.85;
    if (armsB[0]) armsB[0].rotation.x = -0.35 + swingB * 0.4;
    if (legsA[0]) legsA[0].rotation.x = Math.sin(time * 3.5 + phase) * 0.16;
    if (legsA[1]) legsA[1].rotation.x = -Math.sin(time * 3.5 + phase) * 0.16;
    if (legsB[0]) legsB[0].rotation.x = Math.cos(time * 3.4 + phase) * 0.16;
    if (legsB[1]) legsB[1].rotation.x = -Math.cos(time * 3.4 + phase) * 0.16;
    if (headA) headA.rotation.x = -0.18 - Math.sin(u * Math.PI) * 0.16;
    if (headB) headB.rotation.x = -0.18 - Math.sin(u * Math.PI) * 0.16;
  };
  update(0);

  return { group, update };
}

/**
 * Circle of 3–4 youths playing đá cầu (traditional Vietnamese shuttlecock kicking) with feathered cầu.
 */
export function createDaCauGroup({
  x = 0,
  y = 0,
  z = 0,
  phase = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "da-cau-group";
  group.position.set(x, y, z);

  const count = 3;
  const radius = 1.45;
  const players = [];

  for (let i = 0; i < count; i++) {
    const a = (i * Math.PI * 2) / count + phase * 0.3;
    const px = Math.cos(a) * radius;
    const pz = Math.sin(a) * radius;
    const preset = YOUTH_PRESETS[(i * 2 + 4) % YOUTH_PRESETS.length];
    const person = makePerson({ ...preset, accessory: undefined, skirt: false });
    person.position.set(px, 0, pz);
    person.rotation.y = Math.atan2(-px, -pz);
    group.add(person);
    players.push({
      px,
      pz,
      person,
      legs: person.userData.limbs?.legs || [],
      arms: person.userData.limbs?.arms || [],
      head: person.getObjectByName("head-group"),
    });
  }

  // Traditional bright red-yellow feathered đá cầu shuttlecock
  const dacau = new THREE.Group();
  const baseDisc = new THREE.Mesh(sharedCyl(0.05, 0.05, 0.025, 10), sharedMat("#22252a", 0.6));
  const featherYellow = new THREE.Mesh(
    markSharedResource(new THREE.CylinderGeometry(0.075, 0.018, 0.12, 8, 1, true)),
    sharedMat("#ffcf33", 0.55, 0, { doubleSide: true }),
  );
  featherYellow.position.y = 0.07;
  const featherRed = new THREE.Mesh(
    markSharedResource(new THREE.CylinderGeometry(0.09, 0.025, 0.08, 8, 1, true)),
    sharedMat("#e83d35", 0.55, 0, { doubleSide: true }),
  );
  featherRed.position.y = 0.11;
  dacau.add(baseDisc, featherYellow, featherRed);
  group.add(dacau);

  const update = (time = 0) => {
    const total = ((time * 0.95 + phase) % count + count) % count;
    const fromIdx = Math.floor(total);
    const toIdx = (fromIdx + 1) % count;
    const u = total - fromIdx;

    const pFrom = players[fromIdx];
    const pTo = players[toIdx];
    const sx = pFrom.px * 0.72;
    const sz = pFrom.pz * 0.72;
    const ex = pTo.px * 0.72;
    const ez = pTo.pz * 0.72;
    const cx = sx + (ex - sx) * u;
    const cz = sz + (ez - sz) * u;
    const cy = 0.52 + Math.sin(u * Math.PI) * 1.65;

    dacau.position.set(cx, cy, cz);
    dacau.rotation.y = time * 6;
    dacau.rotation.z = Math.sin(time * 5) * 0.25;

    for (let i = 0; i < players.length; i++) {
      const pl = players[i];
      const kickStart = i === fromIdx ? Math.max(0, 1 - u * 3.8) : 0;
      const kickEnd = i === toIdx ? Math.max(0, (u - 0.74) / 0.26) : 0;
      const kick = Math.max(kickStart, kickEnd);
      if (pl.legs[1]) {
        pl.legs[1].rotation.x = -kick * 0.95;
        pl.legs[1].rotation.z = -kick * 0.35;
      }
      if (pl.legs[0]) pl.legs[0].rotation.x = kick * 0.12;
      if (pl.arms[0]) pl.arms[0].rotation.z = 0.18 + kick * 0.42;
      if (pl.arms[1]) pl.arms[1].rotation.z = -0.18 - kick * 0.42;
      if (pl.head) pl.head.rotation.x = 0.12 - Math.sin(u * Math.PI) * 0.18;
    }
  };
  update(0);

  return { group, update };
}

/**
 * Crowd of spectators, families, couples, and photo-takers gathered around FountainPark's swan pedal-boat dock.
 */
export function createPedalDockCrowd(specs = []) {
  const group = new THREE.Group();
  group.name = "pedal-dock-crowd";

  const camBodyMat = sharedMat("#22262b", 0.45, 0.5);
  const camLensMat = sharedMat("#82c9e6", 0.2, 0.7);
  const visitors = [];

  specs.forEach((s, idx) => {
    const preset = SOCIETY_PRESETS[(s.presetIdx ?? idx) % SOCIETY_PRESETS.length];
    const person = makePerson({
      ...preset,
      hat: s.hat !== undefined ? s.hat : preset.hat,
    });
    person.position.set(s.lx, s.y ?? 0.256, s.lz);
    person.rotation.y = s.yaw ?? Math.PI;

    if (s.camera) {
      const cam = new THREE.Group();
      cam.add(new THREE.Mesh(sharedBox(0.14, 0.09, 0.07), camBodyMat));
      const lens = new THREE.Mesh(sharedCyl(0.032, 0.032, 0.05, 8), camLensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.05;
      cam.add(lens);
      cam.position.set(0.05, 1.38, 0.25);
      person.add(cam);
    }

    group.add(person);
    visitors.push({
      person,
      arms: person.userData.limbs?.arms || [],
      head: person.getObjectByName("head-group"),
      wave: Boolean(s.wave),
      camera: Boolean(s.camera),
      phase: idx * 0.85,
    });
  });

  const update = (time = 0) => {
    for (const v of visitors) {
      const t = time * 1.8 + v.phase;
      if (v.camera) {
        if (v.arms[0]) v.arms[0].rotation.x = -1.25;
        if (v.arms[1]) v.arms[1].rotation.x = -1.25;
        if (v.head) v.head.rotation.y = Math.sin(t * 0.6) * 0.14;
      } else if (v.wave) {
        if (v.arms[1]) {
          v.arms[1].rotation.x = -2.15;
          v.arms[1].rotation.z = -0.3 + Math.sin(t * 2.8) * 0.28;
        }
        if (v.head) v.head.rotation.y = Math.sin(t * 0.8) * 0.16;
      } else {
        if (v.arms[0]) v.arms[0].rotation.x = -0.18 + Math.sin(t) * 0.14;
        if (v.arms[1]) v.arms[1].rotation.x = -0.22 + Math.cos(t * 1.1) * 0.16;
        if (v.head) v.head.rotation.y = Math.sin(t * 0.7) * 0.18;
      }
    }
  };
  update(0);

  return { group, visitors, update };
}
