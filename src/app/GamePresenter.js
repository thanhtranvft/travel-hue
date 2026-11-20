import { regionContains } from "../modules/areas/AreaModel.js";
import { updateMobileStaticScene } from "../core/rendering/MobileStaticScene.js";
import { GameView } from "./GameView.js";
import { AreaPresenter } from "../modules/areas/AreaPresenter.js";
import { createAreaView } from "../modules/areas/AreaView.js";
import * as THREE from "three";
import { InputController } from "../core/input/InputController.js";
import { TouringBike } from "../core/vehicle/TouringBike.js";
import { geoDistricts as districts } from "../core/shared/geography/map.js";
import { damp, wrapAngle } from "../core/vehicle/BicycleMotion.js";
import { CityAudio } from "../core/audio/CityAudio.js";
import patrolConfig from "../data/world/police-patrols.json" with { type: "json" };
import collisionDialogue from "../data/audio/collision-dialogue.json" with { type: "json" };
import { renderQuality } from "../core/rendering/renderQuality.js";
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
      this.quality.mobile ? 1300 : 5000,
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.quality.mobile,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(this.quality.pixelRatio);
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = this.quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    for (let i = 0; i < 8; i++) {
      const spark = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075),
        new THREE.MeshBasicMaterial({ color: "#ffe1a0", transparent: true }),
      );
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
      if (e.key.toLowerCase() === "m")
        document.querySelector("#map-panel").classList.toggle("expanded");
      if (e.key.toLowerCase() === "t") this.toggleAutopilot();
      if (e.key.toLowerCase() === "r") this.reset();
    });
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
    document.querySelector("#collision-toast").hidden = true;
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
    this.syncMode();
    this.updateHud();
    this.drawMap();
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
      brake = this.input.brake;
    if (this.auto && (throttle || steer || brake)) {
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
    }
    const oldX = this.bike.position.x,
      oldZ = this.bike.position.z;
    if (this.stun > 0) {
      throttle = 0;
      steer = 0;
      brake = true;
    }
    this.bike.update(dt, throttle, steer, brake);
    if (!this.world.canRide(this.bike.position.x, this.bike.position.z)) {
      if (
        !regionContains(
          this.world.region,
          this.bike.position.x,
          this.bike.position.z,
        )
      ) {
        this.boundaryHint.hidden = false;
        this.boundaryHintUntil = this.elapsed + 2;
      }
      this.bike.position.x = oldX;
      this.bike.position.z = oldZ;
      this.bike.motion.speed = 0;
    }
    this.bike.position.y = damp(
      this.bike.position.y,
      this.world.groundAt(
        this.bike.position.x,
        this.bike.position.z,
        this.bike.position.y,
      ),
      15,
      dt,
    );
    if (this.collisionCooldown === 0) {
      const actor = this.traffic.contact({ x: oldX, z: oldZ }, this.bike);
      if (actor && Math.abs(this.bike.motion.speed) + actor.speed > 0.5)
        this.crash(actor, oldX, oldZ);
    }
    if (this.stun > 0) this.bike.rotation.z += Math.sin(this.stun * 8) * 0.28;
  }
  crash(actor, oldX, oldZ) {
    this.bike.position.x = oldX;
    this.bike.position.z = oldZ;
    this.bike.motion.speed = 0;
    this.auto = false;
    this.completed = false;
    this.syncMode();
    this.collisionCooldown = 3;
    this.stun = 1;
    this.noticeTime = 4;
    this.crashCount++;
    actor.pause = 1.4;
    this.impact.position.copy(this.bike.position);
    this.impact.position.y += 0.12;
    this.impact.visible = true;
    const label =
      actor.type === "car"
        ? "ô tô"
        : actor.type === "scooter"
          ? "xe máy"
          : "người đi bộ";
    const headOn = Math.cos(this.bike.motion.heading - actor.heading) < -0.4;
    document.querySelector("#collision-message").textContent =
      (actor.isPolice
        ? patrolConfig.dialogue
        : actor.type === "player"
          ? `Bạn vừa va chạm với ${actor.name}. Hãy giảm tốc và quan sát khi đi cùng nhau!`
          : collisionDialogue[actor.type]) ||
      `${headOn ? "Bạn đã đi đối đầu và va chạm với" : "Bạn vừa va chạm với"} ${label}. Hãy cẩn thận hơn, đi bên phải, giảm tốc và quan sát phía trước!`;
    document.querySelector("#collision-toast").hidden = false;
    this.audio.collision();
    this.audio.speakCollision(actor.isPolice ? "police" : actor.type);
  }
  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
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
      this.cameraYaw + this.input.drag.yaw,
    );
    const patrol = this.traffic.patrolWarning?.(this.bike);
    if (patrol) {
      this.audio.speakPatrolWarning();
      this.patrolNotice.hidden = false;
      this.patrolNoticeUntil = this.elapsed + 4;
    }
    if (this.elapsed > this.patrolNoticeUntil) this.patrolNotice.hidden = true;
    if (!this.nextHud || this.elapsed >= this.nextHud) {
      this.updateHud();
      this.drawMap();
      this.nextHud = this.elapsed + 0.1;
    }
    this.renderer.render(this.scene, this.camera);
  }
  updateCamera(dt) {
    const recenter = !!this.input.recenterRequested;
    if (recenter) {
      this.cameraYaw = this.bike.motion.heading;
      this.input.recenterRequested = false;
    }
    this.cameraYaw +=
      wrapAngle(this.bike.motion.heading - this.cameraYaw) *
      (1 - Math.exp(-12 * dt));
    const yaw = this.cameraYaw + this.input.drag.yaw,
      speed = Math.abs(this.bike.motion.speed),
      distance = 5.3 + speed * 0.07,
      p = this.bike.position;
    this.desired.set(
      p.x - Math.sin(yaw) * distance,
      p.y + 2.0 + (this.input.drag.pitch - 0.38) * 3,
      p.z - Math.cos(yaw) * distance,
    );
    this.cameraTarget.set(p.x, p.y + 1.25, p.z);
    this.rayDirection.copy(this.desired).sub(this.cameraTarget);
    const maxDistance = this.rayDirection.length();
    this.ray.set(this.cameraTarget, this.rayDirection.normalize());
    this.ray.far = maxDistance;
    const hit = this.ray.intersectObjects(
      [...this.world.cameraObstacles, ...this.traffic.cameraObstacles(p)],
      false,
    )[0];
    if (hit)
      this.desired
        .copy(this.cameraTarget)
        .addScaledVector(this.rayDirection, Math.max(0.8, hit.distance - 0.35));
    if (this.stun > 0)
      this.desired.x += Math.sin(this.elapsed * 46) * this.stun * 0.08;
    if (recenter) this.camera.position.copy(this.desired);
    else this.camera.position.lerp(this.desired, 1 - Math.exp(-10 * dt));
    this.cameraTarget.set(
      p.x + Math.sin(yaw) * 1.8,
      p.y + 1.1,
      p.z + Math.cos(yaw) * 1.8,
    );
    if (recenter) this.look.copy(this.cameraTarget);
    else this.look.lerp(this.cameraTarget, 1 - Math.exp(-12 * dt));
    this.camera.lookAt(this.look);
  }
  updateHud() {
    this.view.updateHud(this);
  }
  drawMap() {
    this.view.drawMap(this);
  }
  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
}
