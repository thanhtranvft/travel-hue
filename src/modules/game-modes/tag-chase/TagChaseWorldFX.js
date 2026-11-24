import * as THREE from "three";

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function drawEmoteCanvas(text) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 96;
  const ctx = canvas.getContext?.("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rounded pill bubble
  const x = 10;
  const y = 10;
  const w = 300;
  const h = 64;
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + w * 0.56, y + h);
  ctx.lineTo(x + w * 0.5, y + h + 14);
  ctx.lineTo(x + w * 0.44, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = "rgba(15, 36, 31, 0.94)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffd36a";
  ctx.stroke();

  ctx.fillStyle = "#fff7e2";
  ctx.font = '700 28px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(text || ""), canvas.width / 2, y + h / 2 + 1, 276);

  return canvas;
}

export class TagChaseWorldFX {
  constructor(game) {
    this.game = game;
    this.scene = game?.scene || null;
    this.root = new THREE.Group();
    this.root.name = "tag-chase-fx";
    this.scene?.add(this.root);

    this.boxes = new Map();
    this.coopMeshes = new Map();
    this.playerAuras = new Map();
    this.windWaves = [];
    this.emoteBubbles = [];
    this.fireworks = [];

    // Hotspot beacon
    this.hotspotGroup = new THREE.Group();
    this.hotspotGroup.visible = false;
    this.hotspotRingGeo = new THREE.RingGeometry(27.2, 28.0, 48);
    this.hotspotRingGeo.rotateX(-Math.PI / 2);
    this.hotspotRingMat = new THREE.MeshBasicMaterial({
      color: "#ffd36a",
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.hotspotRing = new THREE.Mesh(this.hotspotRingGeo, this.hotspotRingMat);
    this.hotspotRing.position.y = 0.12;

    this.hotspotBeamGeo = new THREE.CylinderGeometry(1.1, 1.8, 18, 20, 1, true);
    this.hotspotBeamMat = new THREE.MeshBasicMaterial({
      color: "#ffcf5c",
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.hotspotBeam = new THREE.Mesh(this.hotspotBeamGeo, this.hotspotBeamMat);
    this.hotspotBeam.position.y = 9.2;
    this.hotspotGroup.add(this.hotspotRing, this.hotspotBeam);
    this.root.add(this.hotspotGroup);

    // Shared pickup geometries & materials
    this.boxCoreGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
    this.boxRibbonGeo = new THREE.BoxGeometry(0.76, 0.16, 0.76);
    this.boxRingGeo = new THREE.RingGeometry(0.65, 1.0, 24);
    this.boxRingGeo.rotateX(-Math.PI / 2);

    this.boxCoreMat = new THREE.MeshStandardMaterial({
      color: "#d94f3d",
      emissive: "#8a2216",
      emissiveIntensity: 0.75,
      roughness: 0.3,
    });
    this.boxRibbonMat = new THREE.MeshStandardMaterial({
      color: "#ffd66b",
      emissive: "#c98b18",
      emissiveIntensity: 0.65,
      roughness: 0.25,
    });
    this.boxRingMat = new THREE.MeshBasicMaterial({
      color: "#ffd66b",
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Co-op geometries & materials
    this.coopLanternGeo = new THREE.SphereGeometry(0.45, 12, 10);
    this.coopLanternCapGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12);
    this.coopRingGeo = new THREE.RingGeometry(0.55, 0.92, 22);
    this.coopRingGeo.rotateX(-Math.PI / 2);

    this.lanternMat = new THREE.MeshStandardMaterial({
      color: "#ff5c3d",
      emissive: "#ff8c38",
      emissiveIntensity: 1.0,
      roughness: 0.25,
    });
    this.lotusMat = new THREE.MeshStandardMaterial({
      color: "#ff88c2",
      emissive: "#e34292",
      emissiveIntensity: 0.9,
      roughness: 0.28,
    });
    this.coopCapMat = new THREE.MeshStandardMaterial({
      color: "#ffd66b",
      roughness: 0.3,
    });
    this.coopRingMat = new THREE.MeshBasicMaterial({
      color: "#ff9b54",
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Shared aura geometries
    this.auraRingGeo = new THREE.RingGeometry(0.75, 1.06, 28);
    this.auraRingGeo.rotateX(-Math.PI / 2);
    this.nonLaGeo = new THREE.ConeGeometry(0.55, 0.32, 18, 1, true);
    this.shieldOrbitGeo = new THREE.TorusGeometry(0.95, 0.04, 8, 28);
    this.windWaveGeo = new THREE.RingGeometry(0.8, 1.25, 32);
    this.windWaveGeo.rotateX(-Math.PI / 2);
    this.fireworkParticleGeo = new THREE.SphereGeometry(0.18, 6, 6);
  }

  ensureSceneAttached() {
    if (this.game?.scene && this.root.parent !== this.game.scene) {
      this.scene = this.game.scene;
      this.scene.add(this.root);
    }
  }

  groundY(x, z, fallback = 0.2) {
    const y = this.game?.world?.groundAt?.(x, z, fallback);
    return Number.isFinite(y) ? y : fallback;
  }

  syncState(tagState) {
    this.ensureSceneAttached();
    const hs = tagState?.hotspot;
    if (hs && Number.isFinite(hs.x) && Number.isFinite(hs.z)) {
      this.hotspotGroup.visible = true;
      this.hotspotGroup.position.set(hs.x, this.groundY(hs.x, hs.z, 0.2), hs.z);
    } else {
      this.hotspotGroup.visible = false;
    }

    // Party boxes
    const keepBoxes = new Set();
    for (const box of tagState?.partyBoxes || []) {
      if (!box?.id) continue;
      keepBoxes.add(box.id);
      if (this.boxes.has(box.id)) continue;
      const g = new THREE.Group();
      const core = new THREE.Mesh(this.boxCoreGeo, this.boxCoreMat);
      core.position.y = 0.9;
      const ribbon = new THREE.Mesh(this.boxRibbonGeo, this.boxRibbonMat);
      ribbon.position.y = 0.9;
      const ring = new THREE.Mesh(this.boxRingGeo, this.boxRingMat);
      ring.position.y = 0.08;
      g.add(core, ribbon, ring);
      const y = this.groundY(box.x, box.z, box.y || 0.2);
      g.position.set(box.x, y, box.z);
      this.root.add(g);
      this.boxes.set(box.id, {
        group: g,
        core,
        ribbon,
        ring,
        phase: (this.boxes.size * 1.1) % (Math.PI * 2),
      });
    }
    for (const [id, entry] of this.boxes) {
      if (keepBoxes.has(id)) continue;
      entry.group.removeFromParent();
      this.boxes.delete(id);
    }

    // Co-op items
    const keepCoop = new Set();
    const coopItems = tagState?.coop?.active ? tagState.coop.items || [] : [];
    for (const item of coopItems) {
      if (!item?.id) continue;
      keepCoop.add(item.id);
      if (this.coopMeshes.has(item.id)) continue;
      const g = new THREE.Group();
      const isLotus = item.kind === "lotus";
      const body = new THREE.Mesh(
        this.coopLanternGeo,
        isLotus ? this.lotusMat : this.lanternMat,
      );
      body.scale.set(1, isLotus ? 0.65 : 1.18, 1);
      body.position.y = 1.05;
      const cap = new THREE.Mesh(this.coopLanternCapGeo, this.coopCapMat);
      cap.position.y = isLotus ? 0.72 : 1.56;
      const ring = new THREE.Mesh(this.coopRingGeo, this.coopRingMat);
      ring.position.y = 0.08;
      g.add(body, cap, ring);
      const y = this.groundY(item.x, item.z, item.y || 0.2);
      g.position.set(item.x, y, item.z);
      this.root.add(g);
      this.coopMeshes.set(item.id, {
        group: g,
        body,
        cap,
        capBaseY: cap.position.y,
        phase: (this.coopMeshes.size * 0.9) % (Math.PI * 2),
      });
    }
    for (const [id, entry] of this.coopMeshes) {
      if (keepCoop.has(id)) continue;
      entry.group.removeFromParent();
      this.coopMeshes.delete(id);
    }
  }

  hidePickup(id) {
    const box = this.boxes.get(id);
    if (box) {
      box.group.removeFromParent();
      this.boxes.delete(id);
    }
    const coop = this.coopMeshes.get(id);
    if (coop) {
      coop.group.removeFromParent();
      this.coopMeshes.delete(id);
    }
  }

  ensurePlayerAura(key, parentObj) {
    let entry = this.playerAuras.get(key);
    if (!entry) {
      const group = new THREE.Group();
      group.name = `tag-aura-${key}`;

      const roleMat = new THREE.MeshBasicMaterial({
        color: "#ff5a36",
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const roleRing = new THREE.Mesh(this.auraRingGeo, roleMat);
      roleRing.position.y = 0.1;

      const shieldGroup = new THREE.Group();
      shieldGroup.visible = false;
      const nonLaMat = new THREE.MeshStandardMaterial({
        color: "#f2ce7c",
        emissive: "#a67c22",
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const nonLa = new THREE.Mesh(this.nonLaGeo, nonLaMat);
      nonLa.position.y = 2.05;
      const orbitMat = new THREE.MeshBasicMaterial({
        color: "#ffd36a",
        transparent: true,
        opacity: 0.75,
      });
      const orbit = new THREE.Mesh(this.shieldOrbitGeo, orbitMat);
      orbit.rotation.x = Math.PI / 2;
      orbit.position.y = 0.95;
      shieldGroup.add(nonLa, orbit);

      const slowMat = new THREE.MeshBasicMaterial({
        color: "#6ee7ff",
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const slowRing = new THREE.Mesh(this.auraRingGeo, slowMat);
      slowRing.position.y = 0.18;
      slowRing.scale.setScalar(1.22);
      slowRing.visible = false;

      group.add(roleRing, shieldGroup, slowRing);
      entry = {
        group,
        roleRing,
        roleMat,
        shieldGroup,
        nonLa,
        nonLaMat,
        orbit,
        orbitMat,
        slowRing,
        slowMat,
      };
      this.playerAuras.set(key, entry);
    }
    if (parentObj && entry.group.parent !== parentObj) {
      entry.group.removeFromParent();
      parentObj.add(entry.group);
    }
    return entry;
  }

  updatePlayerAura(key, parentObj, status, elapsed) {
    if (!parentObj) return;
    const aura = this.ensurePlayerAura(key, parentObj);
    const isHunter = status?.role === "hunter";
    aura.roleRing.visible = isHunter || Boolean(status?.coffeeBoost);
    if (isHunter) {
      aura.roleMat.color.set("#ff4b2b");
      const pulse = 1 + Math.sin(elapsed * 8) * 0.12;
      aura.roleRing.scale.setScalar(pulse);
    } else if (status?.coffeeBoost) {
      aura.roleMat.color.set("#ff9b54");
      aura.roleRing.scale.setScalar(1.08 + Math.sin(elapsed * 12) * 0.08);
    }

    aura.shieldGroup.visible = Boolean(status?.shielded);
    if (aura.shieldGroup.visible) {
      aura.nonLa.rotation.y = elapsed * 2.2;
      aura.orbit.rotation.z = elapsed * 3.1;
      aura.orbit.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.05);
    }

    aura.slowRing.visible = Boolean(status?.slowed);
    if (aura.slowRing.visible) {
      aura.slowRing.rotation.z = elapsed * 1.8;
      aura.slowMat.opacity = 0.4 + 0.25 * Math.sin(elapsed * 7);
    }
  }

  spawnWindWave(x, y, z) {
    this.ensureSceneAttached();
    const mat = new THREE.MeshBasicMaterial({
      color: "#6ee7ff",
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(this.windWaveGeo, mat);
    mesh.position.set(x, this.groundY(x, z, y) + 0.16, z);
    this.root.add(mesh);
    this.windWaves.push({ mesh, mat, age: 0, duration: 0.72 });
  }

  spawnEmoteBubble(parentObj, text) {
    if (!parentObj || !text) return;
    const canvas = drawEmoteCanvas(text);
    if (!canvas) return;
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 1,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(0, 2.55, 0);
    sprite.scale.set(2.4, 0.72, 1);
    sprite.renderOrder = 25;
    parentObj.add(sprite);
    this.emoteBubbles.push({
      sprite,
      mat,
      tex,
      age: 0,
      duration: 2.8,
      baseY: 2.55,
    });
  }

  spawnFireworkVolley(centerX, centerZ) {
    this.ensureSceneAttached();
    const colors = ["#ffd36a", "#ff5c7a", "#6ee7ff", "#98ff98", "#ff9b54"];
    const baseY = this.groundY(centerX, centerZ, 0.5);
    for (let burstIdx = 0; burstIdx < 5; burstIdx++) {
      const bx = centerX + (burstIdx - 2) * 10 + (Math.random() - 0.5) * 6;
      const bz = centerZ + (Math.random() - 0.5) * 14;
      const by = baseY + 12 + Math.random() * 8;
      const color = colors[burstIdx % colors.length];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const particles = [];
      for (let i = 0; i < 18; i++) {
        const mesh = new THREE.Mesh(this.fireworkParticleGeo, mat);
        mesh.position.set(bx, by, bz);
        const theta = (i / 18) * Math.PI * 2;
        const phi = ((i % 3) - 1) * 0.65 + (Math.random() - 0.5) * 0.4;
        const speed = 7 + Math.random() * 4.5;
        const vx = Math.cos(theta) * Math.cos(phi) * speed;
        const vy = Math.sin(phi) * speed + 2.5;
        const vz = Math.sin(theta) * Math.cos(phi) * speed;
        this.root.add(mesh);
        particles.push({ mesh, vx, vy, vz });
      }
      this.fireworks.push({
        particles,
        mat,
        age: -burstIdx * 0.22,
        duration: 1.9,
      });
    }
  }

  update(dt, elapsed, localStatus, remoteEntries) {
    this.ensureSceneAttached();
    const playerPos = this.game?.bike?.position;

    if (this.hotspotGroup.visible) {
      this.hotspotRing.rotation.z = elapsed * 0.22;
      this.hotspotRingMat.opacity = 0.34 + 0.16 * Math.sin(elapsed * 2.5);
      this.hotspotBeam.rotation.y = elapsed * 0.5;
    }

    for (const entry of this.boxes.values()) {
      const distSq = playerPos
        ? (entry.group.position.x - playerPos.x) ** 2 +
          (entry.group.position.z - playerPos.z) ** 2
        : 0;
      entry.group.visible = distSq < 260 * 260;
      if (!entry.group.visible) continue;
      const bob = Math.sin(elapsed * 2.8 + entry.phase) * 0.16;
      entry.core.position.y = 0.9 + bob;
      entry.ribbon.position.y = 0.9 + bob;
      entry.core.rotation.y = elapsed * 1.9 + entry.phase;
      entry.ribbon.rotation.y = elapsed * 1.9 + entry.phase;
      entry.ring.scale.setScalar(1 + Math.sin(elapsed * 3.5 + entry.phase) * 0.12);
    }

    for (const entry of this.coopMeshes.values()) {
      const distSq = playerPos
        ? (entry.group.position.x - playerPos.x) ** 2 +
          (entry.group.position.z - playerPos.z) ** 2
        : 0;
      entry.group.visible = distSq < 280 * 280;
      if (!entry.group.visible) continue;
      const bob = Math.sin(elapsed * 3.2 + entry.phase) * 0.18;
      entry.body.position.y = 1.05 + bob;
      entry.cap.position.y = entry.capBaseY + bob;
      entry.body.rotation.y = elapsed * 1.5 + entry.phase;
    }

    // Local aura
    if (this.game?.bike) {
      this.updatePlayerAura("self", this.game.bike, localStatus, elapsed);
    }

    // Remote auras
    const activeRemotes = new Set(["self"]);
    if (remoteEntries) {
      for (const [id, entry] of remoteEntries) {
        if (!entry?.bike) continue;
        activeRemotes.add(id);
        this.updatePlayerAura(id, entry.bike, entry.target?.modeData, elapsed);
      }
    }
    for (const [id, entry] of this.playerAuras) {
      if (activeRemotes.has(id)) continue;
      this.disposeAuraEntry(entry);
      this.playerAuras.delete(id);
    }

    // Wind waves
    for (let i = this.windWaves.length - 1; i >= 0; i--) {
      const w = this.windWaves[i];
      w.age += dt;
      const t = Math.min(1, w.age / w.duration);
      w.mesh.scale.setScalar(1 + t * 8.2);
      w.mat.opacity = 0.85 * (1 - t);
      if (t >= 1) {
        w.mesh.removeFromParent();
        w.mat.dispose();
        this.windWaves.splice(i, 1);
      }
    }

    // Emote bubbles
    for (let i = this.emoteBubbles.length - 1; i >= 0; i--) {
      const b = this.emoteBubbles[i];
      b.age += dt;
      const t = Math.min(1, b.age / b.duration);
      b.sprite.position.y = b.baseY + t * 0.55;
      b.mat.opacity = t > 0.72 ? Math.max(0, 1 - (t - 0.72) / 0.28) : 1;
      if (t >= 1) {
        b.sprite.removeFromParent();
        b.mat.dispose();
        b.tex.dispose();
        this.emoteBubbles.splice(i, 1);
      }
    }

    // Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.age += dt;
      if (fw.age < 0) {
        for (const p of fw.particles) p.mesh.visible = false;
        continue;
      }
      const t = Math.min(1, fw.age / fw.duration);
      fw.mat.opacity = Math.max(0, 1 - t * t);
      for (const p of fw.particles) {
        p.mesh.visible = true;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 5.2 * dt;
        p.vx *= 0.985;
        p.vz *= 0.985;
      }
      if (t >= 1) {
        for (const p of fw.particles) p.mesh.removeFromParent();
        fw.mat.dispose();
        this.fireworks.splice(i, 1);
      }
    }
  }

  disposeAuraEntry(entry) {
    entry.group.removeFromParent();
    entry.roleMat.dispose();
    entry.nonLaMat.dispose();
    entry.orbitMat.dispose();
    entry.slowMat.dispose();
  }

  dispose() {
    for (const entry of this.boxes.values()) entry.group.removeFromParent();
    this.boxes.clear();
    for (const entry of this.coopMeshes.values()) entry.group.removeFromParent();
    this.coopMeshes.clear();
    for (const entry of this.playerAuras.values()) this.disposeAuraEntry(entry);
    this.playerAuras.clear();
    for (const w of this.windWaves) {
      w.mesh.removeFromParent();
      w.mat.dispose();
    }
    this.windWaves = [];
    for (const b of this.emoteBubbles) {
      b.sprite.removeFromParent();
      b.mat.dispose();
      b.tex.dispose();
    }
    this.emoteBubbles = [];
    for (const fw of this.fireworks) {
      for (const p of fw.particles) p.mesh.removeFromParent();
      fw.mat.dispose();
    }
    this.fireworks = [];
    this.root.removeFromParent();
    this.hotspotRingGeo.dispose();
    this.hotspotRingMat.dispose();
    this.hotspotBeamGeo.dispose();
    this.hotspotBeamMat.dispose();
    this.boxCoreGeo.dispose();
    this.boxRibbonGeo.dispose();
    this.boxRingGeo.dispose();
    this.boxCoreMat.dispose();
    this.boxRibbonMat.dispose();
    this.boxRingMat.dispose();
    this.coopLanternGeo.dispose();
    this.coopLanternCapGeo.dispose();
    this.coopRingGeo.dispose();
    this.lanternMat.dispose();
    this.lotusMat.dispose();
    this.coopCapMat.dispose();
    this.coopRingMat.dispose();
    this.auraRingGeo.dispose();
    this.nonLaGeo.dispose();
    this.shieldOrbitGeo.dispose();
    this.windWaveGeo.dispose();
    this.fireworkParticleGeo.dispose();
  }
}

export { UP_AXIS };
