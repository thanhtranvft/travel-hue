import * as THREE from "three";
import { CHARM_TIER_LIST, CHARM_TIERS } from "./speedCharms.js";

function createTierMaterials(tier) {
  return {
    core: new THREE.MeshStandardMaterial({
      color: tier.color,
      emissive: tier.glow,
      emissiveIntensity: tier.id === "100" ? 1.15 : 0.78,
      roughness: 0.22,
      metalness: 0.35,
    }),
    ring: new THREE.MeshBasicMaterial({
      color: tier.accent,
      transparent: true,
      opacity: 0.9,
    }),
    halo: new THREE.MeshBasicMaterial({
      color: tier.color,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };
}

export class SpeedCharmWorldView {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = "speed-charm-pickups";
    this.scene?.add(this.root);

    this.items = new Map();
    this.bursts = [];

    this.coreGeo = new THREE.OctahedronGeometry(0.46, 0);
    this.ringGeo = new THREE.TorusGeometry(0.66, 0.045, 8, 24);
    this.haloGeo = new THREE.RingGeometry(0.55, 0.95, 24);
    this.haloGeo.rotateX(-Math.PI / 2);
    this.burstGeo = new THREE.RingGeometry(0.45, 0.75, 24);
    this.burstGeo.rotateX(-Math.PI / 2);

    this.materials = new Map(
      CHARM_TIER_LIST.map((tier) => [tier.id, createTierMaterials(tier)]),
    );
  }

  attachScene(scene) {
    this.scene = scene;
    this.root.removeFromParent();
    scene?.add(this.root);
  }

  sync(charms = []) {
    const keep = new Set();
    for (const charm of charms) {
      if (!charm?.id) continue;
      keep.add(charm.id);
      if (this.items.has(charm.id)) continue;
      const mats = this.materials.get(charm.tier) || this.materials.get("10");
      const group = new THREE.Group();
      const scale = charm.tier === "100" ? 1.32 : charm.tier === "30" ? 1.16 : 1.0;

      const core = new THREE.Mesh(this.coreGeo, mats.core);
      core.position.y = 1.05;
      core.scale.setScalar(scale);

      const ring = new THREE.Mesh(this.ringGeo, mats.ring);
      ring.position.y = 1.05;
      ring.rotation.x = Math.PI * 0.35;
      ring.scale.setScalar(scale);

      const halo = new THREE.Mesh(this.haloGeo, mats.halo);
      halo.position.y = 0.06;
      halo.scale.setScalar(scale);

      group.add(core, ring, halo);
      group.position.set(charm.x, charm.y || 0.25, charm.z);
      this.root.add(group);
      this.items.set(charm.id, {
        group,
        core,
        ring,
        halo,
        baseScale: scale,
        phase: (this.items.size * 1.37) % (Math.PI * 2),
      });
    }

    for (const [id, entry] of this.items) {
      if (keep.has(id)) continue;
      entry.group.removeFromParent();
      this.items.delete(id);
    }
  }

  spawnPickupBurst(x, y, z, tierId) {
    const tier = CHARM_TIERS[tierId] || CHARM_TIERS["10"];
    const mat = new THREE.MeshBasicMaterial({
      color: tier.accent,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(this.burstGeo, mat);
    mesh.position.set(x, (y || 0.25) + 0.14, z);
    this.root.add(mesh);
    this.bursts.push({ mesh, mat, age: 0, duration: 0.45 });
  }

  update(dt, elapsed, playerPos) {
    for (const entry of this.items.values()) {
      const dx = playerPos ? entry.group.position.x - playerPos.x : 0;
      const dz = playerPos ? entry.group.position.z - playerPos.z : 0;
      const distSq = dx * dx + dz * dz;
      entry.group.visible = distSq < 260 * 260;
      if (!entry.group.visible) continue;

      const bob = Math.sin(elapsed * 2.9 + entry.phase) * 0.16;
      entry.core.position.y = 1.05 + bob;
      entry.core.rotation.y = elapsed * 2.1 + entry.phase;
      entry.ring.position.y = 1.05 + bob;
      entry.ring.rotation.z = elapsed * 2.4 + entry.phase;
      entry.ring.rotation.y = elapsed * 1.1;
      const pulse = 1 + Math.sin(elapsed * 3.6 + entry.phase) * 0.12;
      entry.halo.scale.setScalar(entry.baseScale * pulse);
    }

    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      const t = Math.min(1, b.age / b.duration);
      b.mesh.scale.setScalar(1 + t * 2.6);
      b.mat.opacity = 0.9 * (1 - t);
      if (t >= 1) {
        b.mesh.removeFromParent();
        b.mat.dispose();
        this.bursts.splice(i, 1);
      }
    }
  }

  dispose() {
    for (const entry of this.items.values()) entry.group.removeFromParent();
    this.items.clear();
    for (const b of this.bursts) {
      b.mesh.removeFromParent();
      b.mat.dispose();
    }
    this.bursts = [];
    this.root.removeFromParent();
    this.coreGeo.dispose();
    this.ringGeo.dispose();
    this.haloGeo.dispose();
    this.burstGeo.dispose();
    for (const mats of this.materials.values()) {
      mats.core.dispose();
      mats.ring.dispose();
      mats.halo.dispose();
    }
  }
}

export class SpeedAuraEffect {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "speed-boost-aura";
    this.group.visible = false;

    this.ringMat = new THREE.MeshBasicMaterial({
      color: "#2ee59d",
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringGeo = new THREE.RingGeometry(0.58, 0.92, 28);
    ringGeo.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(ringGeo, this.ringMat);
    this.ring.position.y = 0.08;
    this.group.add(this.ring);

    this.streakMat = new THREE.MeshBasicMaterial({
      color: "#a8ffd8",
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const streakGeo = new THREE.BoxGeometry(0.035, 0.035, 1.05);
    this.streaks = [];
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(streakGeo, this.streakMat);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.48 + (i % 2) * 0.24;
      mesh.userData = {
        x: Math.cos(angle) * radius,
        y: 0.35 + (i % 4) * 0.24,
        phase: i * 0.37,
      };
      this.group.add(mesh);
      this.streaks.push(mesh);
    }
    this.geometries = [ringGeo, streakGeo];
  }

  attachTo(parent) {
    if (this.group.parent !== parent) {
      this.group.removeFromParent();
      parent?.add(this.group);
    }
  }

  update(elapsed, { active = false, tierId = "10", speed = 0 } = {}) {
    this.group.visible = active;
    if (!active) return;
    const tier = CHARM_TIERS[tierId] || CHARM_TIERS["10"];
    this.ringMat.color.set(tier.color);
    this.streakMat.color.set(tier.accent);

    const pulse = 1 + Math.sin(elapsed * 11) * 0.14;
    const boostScale = tier.id === "100" ? 1.32 : tier.id === "30" ? 1.15 : 1.0;
    this.ring.scale.setScalar(pulse * boostScale);
    this.ringMat.opacity = 0.45 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 9));

    const speedFactor = Math.max(0.5, Math.min(2.2, Math.abs(speed) / 8));
    this.streakMat.opacity = Math.min(0.85, 0.28 + speedFactor * 0.32);

    for (const s of this.streaks) {
      const cycle = ((elapsed * (2.6 + speedFactor * 1.8) + s.userData.phase) % 1);
      s.position.set(
        s.userData.x,
        s.userData.y,
        -0.35 - cycle * 2.2,
      );
      s.scale.z = 0.7 + speedFactor * 0.7;
    }
  }

  dispose() {
    this.group.removeFromParent();
    for (const g of this.geometries) g.dispose();
    this.ringMat.dispose();
    this.streakMat.dispose();
  }
}
