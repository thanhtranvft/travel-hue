import { regionContains } from "../modules/areas/AreaModel.js";
import { updateMobileStaticScene } from "../core/rendering/MobileStaticScene.js";
import { GameView } from "./GameView.js";
import { AreaPresenter } from "../modules/areas/AreaPresenter.js";
import { createAreaView } from "../modules/areas/AreaView.js";
import * as THREE from "three";
import { InputController } from "../core/input/InputController.js";
import { TouringBike } from "../core/vehicle/TouringBike.js";
import { geoDistricts as districts } from "../modules/areas/AreaModel.js";
import { damp, wrapAngle } from "../core/vehicle/BicycleMotion.js";
import { CityAudio } from "../core/audio/CityAudio.js";
import patrolConfig from "../data/world/police-patrols.json" with { type: "json" };
import collisionDialogue from "../data/audio/collision-dialogue.json" with { type: "json" };
import { renderQuality } from "../core/rendering/renderQuality.js";
import { VendorCalls } from "../core/world/VendorCalls.js";
import { CharmController } from "../core/world/CharmController.js";
import { SpeedAuraEffect } from "../core/world/CharmSceneFX.js";
import { ChurchBellController } from "../core/audio/ChurchBellController.js";
import { sourcePan } from "../core/audio/spatial.js";
const getDistrict = (id) => districts.find((d) => d.id === id);

export class GamePresenter {
  static async create(canvas, { audio } = {}) {
    const quality = renderQuality({
        coarse: matchMedia("(pointer:coarse)").matches,
        width: innerWidth,
        dpr: devicePixelRatio,
      }),
      area = await createAreaView(quality);
    return new this(canvas, { ...area, quality, audio });
  }
  constructor(canvas, setup) {
    this.quality = setup.quality;
    this.audio = setup.audio || new CityAudio();
    this.scene = setup.scene;
    this.camera = new THREE.PerspectiveCamera(
      57,
      innerWidth / innerHeight,
      0.1,
      this.quality.mobile ? 2800 : 5000,
    );
    this.renderer = this.createRenderer(canvas);
    this.contextLost = false;
    this.contextRestoreTimer = null;
    this.onContextLost = (e) => {
      e.preventDefault();
      this.contextLost = true;
      this.input?.reset();
      if (!this.isLoadingRegion) {
        const loading = document.querySelector("#scene-loading");
        if (loading) {
          loading.textContent = "Đang khôi phục màn hình 3D…";
          loading.hidden = false;
        }
      }
      clearTimeout(this.contextRestoreTimer);
      this.contextRestoreTimer = setTimeout(() => {
        if (this.contextLost) this.recoverWebGL();
      }, 1500);
    };
    this.onContextRestored = () => {
      clearTimeout(this.contextRestoreTimer);
      this.contextLost = false;
      if (!this.isLoadingRegion) {
        const loading = document.querySelector("#scene-loading");
        if (loading) loading.hidden = true;
      }
      this.resize();
    };
    this.bindContextEvents(canvas);
    this.input = new InputController(canvas);
    this.world = setup.world;
    this.traffic = setup.traffic;
    this.audio.venues = this.world.venues;
    this.bike = new TouringBike();
    this.scene.add(this.bike);
    this.collisionCooldown = 0;
    this.stun = 0;
    this.crashCount = 0;
    this.noticeTime = 0;
    this.areaPresenter = new AreaPresenter(this);
    this.impact = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.035, 6, 32),
      new THREE.MeshBasicMaterial({ color: "#ffb55d", transparent: true }),
    );
    ring.rotation.x = Math.PI / 2;
    this.impact.add(ring);
    const sparkGeometry = new THREE.OctahedronGeometry(0.075);
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: "#ffe1a0",
      transparent: true,
    });
    for (let i = 0; i < 8; i++) {
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      spark.position.set(
        Math.cos((i * Math.PI) / 4) * 0.8,
        0.4,
        Math.sin((i * Math.PI) / 4) * 0.8,
      );
      this.impact.add(spark);
    }
    this.impact.visible = false;
    this.scene.add(this.impact);
    this.clock = new THREE.Clock();
    this.accumulator = 0;
    this.auto = false;
    this.elapsed = 0;
    this.cameraYaw = 0;
    this.look = new THREE.Vector3();
    this.desired = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();
    this.ray = new THREE.Raycaster();
    this.rayDirection = new THREE.Vector3();
    this.view = new GameView();
    this.map = this.view.map;
    this.hud = this.view.hud;
    this.boundaryHint = document.createElement("div");
    this.boundaryHint.id = "region-boundary-hint";
    this.boundaryHint.hidden = true;
    this.boundaryHint.textContent =
      "Đã tới ranh giới khu vực. Chọn khu khác để tiếp tục.";
    document.querySelector("#app").append(this.boundaryHint);
    this.patrolNotice = document.createElement("aside");
    this.patrolNotice.id = "patrol-toast";
    this.patrolNotice.hidden = true;
    this.patrolNotice.setAttribute("role", "status");
    this.patrolNotice.textContent = `Cảnh sát: “${patrolConfig.dialogue}”`;
    document.querySelector("#app").append(this.patrolNotice);
    this.vendorCalls = new VendorCalls();
    this.vendorNoticeUntil = -Infinity;
    this.vendorNotice = document.createElement("aside");
    this.vendorNotice.id = "vendor-toast";
    this.vendorNotice.hidden = true;
    this.vendorNotice.setAttribute("role", "status");
    document.querySelector("#app").append(this.vendorNotice);
    this.churchBell = new ChurchBellController();
    this.churchBellNoticeUntil = -Infinity;
    this.churchBellNotice = document.createElement("aside");
    this.churchBellNotice.id = "church-bell-toast";
    this.churchBellNotice.hidden = true;
    this.churchBellNotice.setAttribute("role", "status");
    this.churchBellNotice.textContent =
      "🔔 Tiếng chuông Nhà thờ Dòng Chúa Cứu Thế đang ngân vang…";
    document.querySelector("#app").append(this.churchBellNotice);
    this.charms = new CharmController(this);
    this.speedAura = new SpeedAuraEffect();
    this.speedAura.attachTo(this.bike);
    this.travelTo(this.world.region.id);
    addEventListener("resize", () => this.resize());
    this.ready = Promise.allSettled([this.bike.loadDetailedModel()]).then(
      (results) => {
        if (!this.isLoadingRegion)
          document.querySelector("#scene-loading").hidden = true;
        if (setup.assetFailures || results.some((r) => r.status === "rejected"))
          document.querySelector("#asset-notice").hidden = false;
      },
    );
    addEventListener("keydown", (e) => {
      if (
        this.sessionActive === false ||
        e.target.closest?.('input,select,textarea,[contenteditable="true"]')
      )
        return;
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === "m") {
        const toggleBtn = document.querySelector("#map-toggle");
        if (toggleBtn) toggleBtn.click();
        else {
          const mapPanel = document.querySelector("#map-panel");
          if (mapPanel) {
            mapPanel.hidden = !mapPanel.hidden;
            if (!mapPanel.hidden) this.drawMap();
          }
        }
      }
      if (key === "t") this.toggleAutopilot();
      if (key === "e") this.toggleTransportMode();
      if (key === "r") this.reset();
      if (key === "1") this.useCharm("10");
      if (key === "2") this.useCharm("20");
      if (key === "3") this.useCharm("30");
      if (key === "4") this.useCharm("100");
    });
  }
  createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(this.quality.pixelRatio);
    if (innerWidth > 0 && innerHeight > 0) {
      renderer.setSize(innerWidth, innerHeight);
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = this.quality.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
  }
  bindContextEvents(canvas) {
    if (this._boundCanvas === canvas) return;
    if (this._boundCanvas) {
      this._boundCanvas.removeEventListener(
        "webglcontextlost",
        this.onContextLost,
      );
      this._boundCanvas.removeEventListener(
        "webglcontextrestored",
        this.onContextRestored,
      );
    }
    this._boundCanvas = canvas;
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
  }
  recoverWebGL() {
    clearTimeout(this.contextRestoreTimer);
    const oldCanvas =
      this.renderer?.domElement || document.querySelector("#game");
    if (!oldCanvas || !oldCanvas.parentNode) return;
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "game";
    oldCanvas.replaceWith(newCanvas);
    try {
      this.renderer?.setAnimationLoop(null);
      this.renderer?.dispose();
    } catch {}
    try {
      this.renderer = this.createRenderer(newCanvas);
      this.bindContextEvents(newCanvas);
      this.input?.touch?.rebindGameCanvas?.(newCanvas);
      this.contextLost = false;
      this.resize();
      if (!this.isLoadingRegion) {
        const loading = document.querySelector("#scene-loading");
        if (loading) loading.hidden = true;
        this.start();
      }
    } catch {
      this.contextLost = true;
    }
  }
  travelTo(id) {
    if (this.isLoadingRegion) {
      this.pendingRegion = id;
      return this.regionLoadPromise;
    }
    if (this.world.region?.id !== id) return this.changeRegion(id);
    const district = getDistrict(id);
    if (!district) return;
    this.district = district;
    if (this.online) {
      this.onlineResetRequested = true;
      this.online.awaitingRegion = true;
    }
    this.auto = false;
    this.completed = false;
    this.input.reset();
    this.input.drag.yaw = 0;
    this.collisionCooldown = 2;
    this.stun = 0;
    this.noticeTime = 0;
    this.impact.visible = false;
    this.boundaryHint.hidden = true;
    this.churchBell?.reset();
    if (this.churchBellNotice) this.churchBellNotice.hidden = true;
    this.churchBellNoticeUntil = -Infinity;
    document.querySelector("#collision-toast").hidden = true;
    this.view?.resetLandmarkNotice?.();
    const { x, z, heading } = district.spawn;
    this.bike.reset(x, z, heading);
    this.bike.position.y = this.world.groundAt(x, z);
    this.traffic.clearSpawn(this.bike.position);
    this.curve = new THREE.CurvePath();
    for (let i = 1; i < district.path.length; i++)
      this.curve.add(
        new THREE.LineCurve3(
          new THREE.Vector3(
            district.path[i - 1][0],
            0,
            district.path[i - 1][1],
          ),
          new THREE.Vector3(district.path[i][0], 0, district.path[i][1]),
        ),
      );
    this.routeLength = this.curve.getLength();
    this.routeU = 0;
    let nearest = Infinity;
    for (let i = 0; i <= 100; i++) {
      const p = this.curve.getPointAt(i / 100),
        d = Math.hypot(p.x - x, p.z - z);
      if (d < nearest) {
        nearest = d;
        this.routeU = i / 100;
      }
    }
    this.cameraYaw = heading;
    this.camera.position.set(
      x - Math.sin(heading) * 5.6,
      3,
      z - Math.cos(heading) * 5.6,
    );
    this.look.set(x + Math.sin(heading) * 2, 1.3, z + Math.cos(heading) * 2);
    this.camera.lookAt(this.look);
    document
      .querySelectorAll("[data-district]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.district === id)),
      );
    if (Array.isArray(this.world.trail)) this.world.trail = [];
    this.charms?.onRegionChanged?.();
    this.syncMode();
    this.updateHud();
    this.drawMap();
  }
  useCharm(tier) {
    if (this.sessionActive === false || this.isLoadingRegion) return false;
    const used = this.charms?.useCharm?.(tier);
    if (used) this.updateHud();
    return Boolean(used);
  }
  changeRegion(id) {
    return this.areaPresenter.changeRegion(id);
  }
  reset() {
    this.travelTo(this.district.id);
  }
  syncMode() {
    this.view.syncMode(this);
  }
  setAvatar(avatarId) {
    const chosen = this.bike.setAvatar(avatarId);
    this.syncMode();
    return chosen;
  }
  toggleTransportMode() {
    const next = this.bike.toggleTransportMode();
    this.syncMode();
    this.updateHud();
    return next;
  }
  toggleAutopilot() {
    if (!this.auto) {
      this.travelTo(this.district.id);
      this.auto = true;
    } else this.auto = false;
    this.syncMode();
  }
  start() {
    this.renderer.setAnimationLoop(() => this.frame());
  }
  step(dt) {
    if (this.sessionActive === false) return;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.stun = Math.max(0, this.stun - dt);
    this.noticeTime = Math.max(0, this.noticeTime - dt);
    if (this.noticeTime === 0)
      document.querySelector("#collision-toast").hidden = true;
    this.traffic.step(dt, this.bike);
    if (this.online && !this.online.canMove) {
      this.bike.motion.speed = 0;
      return;
    }
    let throttle = this.input.throttle,
      steer = this.input.steer,
      brake = this.input.brake,
      sprint = this.input.sprint;
    const touchVec = this.input.touchVector;
    if (this.auto && (throttle || steer || brake || touchVec?.active)) {
      this.auto = false;
      this.syncMode();
    }
    if (this.auto) {
      let nearest = Infinity,
        best = this.routeU;
      for (let i = 0; i <= 20; i++) {
        const u = Math.min(1, this.routeU + i * 0.003),
          p = this.curve.getPointAt(u),
          d = Math.hypot(
            p.x - this.bike.position.x,
            p.z - this.bike.position.z,
          );
        if (d < nearest) {
          nearest = d;
          best = u;
        }
      }
      this.routeU = best;
      const lookahead = 1.8 + Math.abs(this.bike.motion.speed) * 0.4,
        target = this.curve.getPointAt(
          Math.min(1, best + lookahead / this.routeLength),
        );
      const dx = target.x - this.bike.position.x,
        dz = target.z - this.bike.position.z,
        delta = wrapAngle(Math.atan2(dx, dz) - this.bike.motion.heading);
      const turn = Math.atan(
        (2 * 1.18 * Math.sin(delta)) / Math.max(0.6, Math.hypot(dx, dz)),
      );
      steer = THREE.MathUtils.clamp(
        turn / (0.55 / (1 + Math.abs(this.bike.motion.speed) * 0.07)),
        -1,
        1,
      );
      const remaining = (1 - best) * this.routeLength,
        targetSpeed = Math.min(
          4.6 * (1 - Math.min(0.65, Math.abs(delta) * 0.5)),
          Math.sqrt(Math.max(0, remaining) * 2),
        );
      throttle = THREE.MathUtils.clamp(
        (targetSpeed - this.bike.motion.speed) * 0.85,
        -1,
        1,
      );
      sprint = this.bike.transportMode === "foot" && targetSpeed > 2.6;
      if (this.traffic.enabled && this.traffic.hasVehicleAhead(this.bike)) {
        throttle = 0;
        brake = true;
      }
      if (remaining < 0.6) {
        this.auto = false;
        this.completed = true;
        this.bike.motion.speed = 0;
        throttle = 0;
        steer = 0;
        this.syncMode();
      }
    } else if (touchVec?.active) {
      const viewYaw =
        (Number.isFinite(this.cameraYaw)
          ? this.cameraYaw
          : this.bike.motion.heading) +
        (Number.isFinite(this.input.drag.yaw) ? this.input.drag.yaw : 0);
      const desiredHeading = wrapAngle(viewYaw - touchVec.angle);
      const delta = wrapAngle(desiredHeading - this.bike.motion.heading);
      const absDelta = Math.abs(delta);
      const onBike = this.bike.transportMode === "bike";

      if (absDelta < 0.04) {
        steer = 0;
      } else {
        steer = THREE.MathUtils.clamp(delta / (onBike ? 0.55 : 0.42), -1, 1);
      }
      const turnThrottleFactor =
        absDelta > 1.75
          ? onBike
            ? 0.45
            : 0.35
          : absDelta > 0.9
            ? 0.72
            : 1;
      throttle = touchVec.power * turnThrottleFactor;
      sprint = sprint && absDelta < 1.1;
    }
    if (
      !Number.isFinite(this.bike.position.x) ||
      !Number.isFinite(this.bike.position.z) ||
      !Number.isFinite(this.bike.motion.heading)
    ) {
      const spawn = this.district?.spawn || { x: 0, z: 0, heading: 0 };
      this.bike.reset(spawn.x, spawn.z, spawn.heading);
      this.bike.position.y = this.world.groundAt(spawn.x, spawn.z);
    }
    const oldX = this.bike.position.x,
      oldZ = this.bike.position.z;
    if (this.stun > 0) {
      throttle = 0;
      steer = 0;
      brake = true;
    }
    const speedMultiplier = this.charms?.speedMultiplier || 1;
    this.bike.update(dt, throttle, steer, brake, { sprint, speedMultiplier });
    const nextX = this.bike.position.x,
      nextZ = this.bike.position.z;
    if (
      !Number.isFinite(nextX) ||
      !Number.isFinite(nextZ) ||
      !this.world.canRide(nextX, nextZ, this.bike.position.y)
    ) {
      if (
        Number.isFinite(nextX) &&
        Number.isFinite(nextZ) &&
        this.world.canRide(nextX, oldZ, this.bike.position.y)
      ) {
        this.bike.position.x = nextX;
        this.bike.position.z = oldZ;
        this.bike.motion.speed *= 0.92;
      } else if (
        Number.isFinite(nextX) &&
        Number.isFinite(nextZ) &&
        this.world.canRide(oldX, nextZ, this.bike.position.y)
      ) {
        this.bike.position.x = oldX;
        this.bike.position.z = nextZ;
        this.bike.motion.speed *= 0.92;
      } else {
        if (
          Number.isFinite(nextX) &&
          Number.isFinite(nextZ) &&
          !regionContains(this.world.region, nextX, nextZ)
        ) {
          this.boundaryHint.hidden = false;
          this.boundaryHintUntil = this.elapsed + 2;
        }
        this.bike.position.x = oldX;
        this.bike.position.z = oldZ;
        this.bike.motion.speed = 0;
      }
    }
    const targetY = this.world.groundAt(
      this.bike.position.x,
      this.bike.position.z,
      this.bike.position.y,
    );
    if (Number.isFinite(targetY)) {
      this.bike.position.y = damp(this.bike.position.y, targetY, 15, dt);
    }
    if (this.collisionCooldown === 0) {
      const actor = this.traffic.contact({ x: oldX, z: oldZ }, this.bike);
      if (actor && Math.abs(this.bike.motion.speed) + actor.speed > 0.5)
        this.crash(actor, oldX, oldZ);
    }
    if (this.stun > 0) this.bike.rotation.z += Math.sin(this.stun * 8) * 0.28;
  }
  crash(actor, oldX, oldZ) {
    const safeX = Number.isFinite(oldX) ? oldX : this.bike.position.x;
    const safeZ = Number.isFinite(oldZ) ? oldZ : this.bike.position.z;
    this.bike.position.x = safeX;
    this.bike.position.z = safeZ;
    this.bike.motion.speed = 0;
    this.auto = false;
    this.completed = false;
    this.syncMode();
    this.collisionCooldown = 3;
    this.stun = 1;
    this.noticeTime = 4;
    this.crashCount++;
    if (actor) actor.pause = 1.4;
    this.impact.position.copy(this.bike.position);
    this.impact.position.y += 0.12;
    this.impact.visible = true;
    const actorType = actor?.type || "pedestrian";
    const label =
      actorType === "car"
        ? "ô tô"
        : actorType === "scooter"
          ? "xe máy"
          : "người đi bộ";
    const actorHeading = Number.isFinite(actor?.heading)
      ? actor.heading
      : this.bike.motion.heading;
    const headOn = Math.cos(this.bike.motion.heading - actorHeading) < -0.4;
    document.querySelector("#collision-message").textContent =
      (actor?.isPolice
        ? patrolConfig.dialogue
        : actor?.isStudent
          ? `${collisionDialogue.student || "Cẩn thận bạn ơi!"} Bạn vừa va chạm với học sinh trong sân trường!`
          : actorType === "player"
            ? `Bạn vừa va chạm với ${actor?.name || "người chơi khác"}. Hãy giảm tốc và quan sát khi đi cùng nhau!`
            : collisionDialogue[actorType]) ||
      `${headOn ? "Bạn đã đi đối đầu và va chạm với" : "Bạn vừa va chạm với"} ${label}. Hãy cẩn thận hơn, đi bên phải, giảm tốc và quan sát phía trước!`;
    document.querySelector("#collision-toast").hidden = false;
    this.audio.collision();
    this.audio.speakCollision(
      actor?.isPolice ? "police" : actor?.isStudent ? "student" : actorType,
    );
  }
  frame() {
    const rawDt = this.clock.getDelta();
    if (this.contextLost) return;
    if (this.renderer.getContext?.()?.isContextLost?.()) {
      this.onContextLost?.({ preventDefault() {} });
      return;
    }
    const dt = Number.isFinite(rawDt) ? Math.min(Math.max(rawDt, 0), 0.1) : 0.016;
    this.elapsed += dt;
    this.accumulator += dt;
    const fixed = 1 / this.quality.physicsHz;
    let steps = 0;
    while (this.accumulator >= fixed && steps++ < this.quality.maxSubsteps) {
      this.step(fixed);
      this.accumulator -= fixed;
    }
    if (steps > this.quality.maxSubsteps) this.accumulator = 0;
    this.world.mobileTrees?.update(this.bike.position);
    this.traffic.mobileCars?.update(this.bike.position);
    if (this.elapsed > this.boundaryHintUntil) this.boundaryHint.hidden = true;
    this.world.update(this.elapsed, this.bike.position);
    this.online?.update(dt);
    this.charms?.update(dt, this.elapsed);
    const activeBoost = this.charms?.activeBoost;
    this.speedAura?.update(this.elapsed, {
      active: Boolean(activeBoost && this.charms.speedMultiplier > 1),
      tierId: activeBoost?.tier || "10",
      speed: this.bike.motion.speed,
    });
    if (this.quality.mobile) {
      updateMobileStaticScene(this.world, this.bike.position);
      this.world.mobileCrowd?.update(this.bike.position);
    }
    if (this.impact.visible) {
      const age = 1 - this.stun;
      this.impact.scale.setScalar(1 + age * 1.4);
      this.impact.children.forEach(
        (mesh) => (mesh.material.opacity = Math.max(0, 1 - age)),
      );
      if (this.stun === 0) this.impact.visible = false;
    }
    this.updateCamera(dt);
    this.audio.update(
      this.bike,
      this.traffic.actors,
      this.cameraYaw +
        (Number.isFinite(this.input.drag.yaw) ? this.input.drag.yaw : 0),
    );
    const patrol = this.traffic.patrolWarning?.(this.bike);
    if (patrol) {
      this.audio.speakPatrolWarning();
      this.patrolNotice.hidden = false;
      this.patrolNoticeUntil = this.elapsed + 4;
    }
    if (this.elapsed > this.patrolNoticeUntil) this.patrolNotice.hidden = true;
    const vendors = this.world.quangTrungCampus?.vendorPoints;
    if (vendors?.length) {
      const vendor = this.vendorCalls.update(this.elapsed, this.bike, vendors);
      if (vendor) {
        this.audio.speakVendorCall(vendor.vendorType);
        const line =
          collisionDialogue[vendor.vendorType] || vendor.dialogue || "";
        this.vendorNotice.textContent = `${vendor.title}: “${line}”`;
        this.vendorNotice.hidden = false;
        this.vendorNoticeUntil = this.elapsed + 4;
      }
    }
    if (this.elapsed > this.vendorNoticeUntil) this.vendorNotice.hidden = true;
    const church = this.world.dongChuaCuuTheChurch;
    const inChurchArea = Boolean(
      church?.isPlayerInArea?.(this.bike.position.x, this.bike.position.z),
    );
    if (this.churchBell?.update(this.elapsed, inChurchArea)) {
      const bellSrc = church.getBellSource?.();
      const heading =
        this.cameraYaw +
        (Number.isFinite(this.input.drag.yaw) ? this.input.drag.yaw : 0);
      const pan = bellSrc
        ? sourcePan(
            bellSrc.x - this.bike.position.x,
            bellSrc.z - this.bike.position.z,
            heading,
          )
        : 0;
      this.audio.playChurchBell?.({ pan });
      this.churchBellNotice.hidden = false;
      this.churchBellNoticeUntil = this.elapsed + 4.8;
    }
    if (this.elapsed > this.churchBellNoticeUntil)
      this.churchBellNotice.hidden = true;
    if (!this.nextHud || this.elapsed >= this.nextHud) {
      this.updateHud();
      this.drawMap();
      this.nextHud = this.elapsed + 0.1;
    }
    this.renderer.render(this.scene, this.camera);
  }
  updateCamera(dt) {
    if (!Number.isFinite(this.cameraYaw))
      this.cameraYaw = this.bike.motion.heading || 0;
    const recenter = !!this.input.recenterRequested;
    if (recenter) {
      this.cameraYaw = Number.isFinite(this.bike.motion.heading)
        ? this.bike.motion.heading
        : 0;
      this.input.recenterRequested = false;
    }
    const touchVec = !this.auto ? this.input.touchVector : null;
    let followRate = 12;
    let shouldEaseDrag =
      !this.input.drag.active && Math.abs(this.bike.motion.speed) > 0.25;
    if (touchVec?.active) {
      const forwardAlign = Math.cos(touchVec.angle);
      if (forwardAlign > 0.35) {
        followRate = 2.8 + 7.2 * forwardAlign;
      } else if (forwardAlign > -0.25) {
        followRate = 0.85;
        shouldEaseDrag = false;
      } else {
        followRate = 0;
        shouldEaseDrag = false;
      }
    }
    if (followRate > 0) {
      this.cameraYaw +=
        wrapAngle(this.bike.motion.heading - this.cameraYaw) *
        (1 - Math.exp(-followRate * dt));
    }
    if (shouldEaseDrag && Number.isFinite(this.input.drag.yaw)) {
      this.input.drag.yaw = damp(this.input.drag.yaw, 0, 2.8, dt);
      if (Math.abs(this.input.drag.yaw) < 0.002) this.input.drag.yaw = 0;
    }
    const dragYaw = Number.isFinite(this.input.drag.yaw)
      ? this.input.drag.yaw
      : 0;
    const dragPitch = Number.isFinite(this.input.drag.pitch)
      ? this.input.drag.pitch
      : 0.38;
    const yaw = this.cameraYaw + dragYaw,
      speed = Math.abs(this.bike.motion.speed),
      onBike = this.bike.stance === "bike",
      baseDist = onBike ? 4.85 : 3.9,
      camHeight = onBike ? 1.9 : 1.68,
      lookLift = onBike ? 1.15 : 0.98,
      distance = baseDist + speed * 0.07,
      p = this.bike.position;
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z))
      return;
    this.desired.set(
      p.x - Math.sin(yaw) * distance,
      p.y + camHeight + (dragPitch - 0.38) * 3,
      p.z - Math.cos(yaw) * distance,
    );
    this.cameraTarget.set(p.x, p.y + lookLift, p.z);
    this.rayDirection.copy(this.desired).sub(this.cameraTarget);
    const maxDistance = this.rayDirection.length();
    if (maxDistance > 1e-4) {
      this.ray.set(this.cameraTarget, this.rayDirection.divideScalar(maxDistance));
      this.ray.far = maxDistance;
      const hit = this.ray.intersectObjects(
        [...this.world.cameraObstacles, ...this.traffic.cameraObstacles(p)],
        false,
      )[0];
      if (hit)
        this.desired
          .copy(this.cameraTarget)
          .addScaledVector(
            this.rayDirection,
            Math.max(0.8, hit.distance - 0.35),
          );
    }
    if (this.stun > 0)
      this.desired.x += Math.sin(this.elapsed * 46) * this.stun * 0.08;
    if (
      recenter ||
      !Number.isFinite(this.camera.position.x) ||
      !Number.isFinite(this.camera.position.y) ||
      !Number.isFinite(this.camera.position.z)
    )
      this.camera.position.copy(this.desired);
    else this.camera.position.lerp(this.desired, 1 - Math.exp(-10 * dt));
    this.cameraTarget.set(
      p.x + Math.sin(yaw) * 1.8,
      p.y + 1.1,
      p.z + Math.cos(yaw) * 1.8,
    );
    if (
      recenter ||
      !Number.isFinite(this.look.x) ||
      !Number.isFinite(this.look.y) ||
      !Number.isFinite(this.look.z)
    )
      this.look.copy(this.cameraTarget);
    else this.look.lerp(this.cameraTarget, 1 - Math.exp(-12 * dt));
    const boostMult = this.charms?.speedMultiplier || 1;
    const speedNorm = Math.min(1, Math.abs(this.bike.motion.speed) / 7);
    const targetFov = 57 + (boostMult > 1 ? (boostMult - 1) * 14 * speedNorm : 0);
    if (Math.abs(this.camera.fov - targetFov) > 0.03) {
      this.camera.fov = damp(this.camera.fov, targetFov, 7, dt);
      this.camera.updateProjectionMatrix();
    }
    this.camera.lookAt(this.look);
  }
  updateHud() {
    this.view.updateHud(this);
  }
  drawMap() {
    this.view.drawMap(this);
  }
  resize() {
    if (innerWidth <= 0 || innerHeight <= 0) return;
    const dpr = Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
    this.quality.pixelRatio = Math.min(dpr, this.quality.mobile ? 2 : 1.8);
    this.renderer.setPixelRatio(this.quality.pixelRatio);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
}
