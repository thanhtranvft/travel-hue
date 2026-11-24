import * as THREE from "three";
import { inside } from "../shared/geography/geometry.js";
import { roadWidth } from "./roadProfile.js";

export function riverMaterial() {
  const time = { value: 0 },
    material = new THREE.MeshPhysicalMaterial({
      color: "#267c91",
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 1,
      envMapIntensity: 0.7,
      side: THREE.DoubleSide,
    });
  material.userData.time = time;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.landscapeTime = time;
    shader.vertexShader =
      "uniform float landscapeTime; varying vec2 riverXZ;\n" +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n riverXZ=position.xz; transformed.y+=sin(position.x*.13+landscapeTime*1.2)*.018+sin(position.z*.22-landscapeTime*.8)*.012;",
    );
    shader.fragmentShader =
      "uniform float landscapeTime; varying vec2 riverXZ;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      "#include <normal_fragment_maps>\n normal=normalize(normal+vec3(sin(riverXZ.x*.7+landscapeTime*1.6)*.2,0.,cos(riverXZ.y*.55-landscapeTime)*.18));",
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      "#include <color_fragment>\n float wave=sin(riverXZ.x*.65+riverXZ.y*.23+landscapeTime*1.3)*sin(riverXZ.y*.9-landscapeTime*.8); float fresnel=pow(1.-abs(dot(normalize(vViewPosition),normalize(vNormal))),3.); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.46,.72,.82),.2+fresnel*.4); diffuseColor.rgb+=vec3(.12,.18,.2)*smoothstep(.65,1.,wave)*.4;",
    );
  };
  return material;
}

export class LivingGrass {
  constructor(world) {
    this.world = world;
    this.center = { x: Infinity, z: Infinity };
    const geometry = new THREE.BufferGeometry();
    // Low, manicured emerald multi-blade turf tuft (~0.20m) so open grass stays tidy and soft
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -0.06, 0, 0, 0.06, 0, 0, 0.015, 0.21, 0.01,
          0, 0, -0.06, 0, 0, 0.06, -0.01, 0.17, 0.015,
          -0.04, 0, -0.04, 0.04, 0, 0.04, 0.0, 0.15, -0.01,
        ],
        3,
      ),
    );
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: "#6ba748",
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.0,
    });
    const maxCount = world.quality?.grassSamples || 18000;
    this.mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    const toneA = new THREE.Color("#529038");
    const toneB = new THREE.Color("#63a343");
    const toneC = new THREE.Color("#74b351");
    const tmpColor = new THREE.Color();
    for (let i = 0; i < maxCount; i++) {
      const m = i % 3;
      tmpColor.copy(m === 0 ? toneA : m === 1 ? toneB : toneC);
      this.mesh.setColorAt?.(i, tmpColor);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    this.mesh.computeBoundingSphere?.();
    world.scene.add(this.mesh);
    this.dummy = new THREE.Object3D();
  }
  _startJob(position) {
    const world = this.world;
    const span = world.quality?.grassSpan || 160;
    const half = span * 0.5;
    const minX = position.x - half;
    const maxX = position.x + half;
    const minZ = position.z - half;
    const maxZ = position.z + half;
    const maxCount = world.quality?.grassSamples || 18000;

    const filterBoxes = (list) =>
      list?.filter(
        (b) =>
          b.maxX >= minX &&
          b.minX <= maxX &&
          b.maxZ >= minZ &&
          b.minZ <= maxZ,
      ) || [];

    const ringBounds = (ring) => {
      let rMinX = Infinity,
        rMaxX = -Infinity,
        rMinZ = Infinity,
        rMaxZ = -Infinity;
      for (const p of ring) {
        if (p.x < rMinX) rMinX = p.x;
        if (p.x > rMaxX) rMaxX = p.x;
        if (p.z < rMinZ) rMinZ = p.z;
        if (p.z > rMaxZ) rMaxZ = p.z;
      }
      return { minX: rMinX, maxX: rMaxX, minZ: rMinZ, maxZ: rMaxZ, points: ring };
    };

    if (!this._riverBounds && world.riverRings?.length) {
      this._riverBounds = world.riverRings.map(ringBounds);
    }

    const blockers = [
      world.quocHocPark,
      world.quocHocCampus,
      world.haiBaTrungCampus,
      world.nguyenChiDieuCampus,
      world.caoThangCampus,
      world.quangTrungCampus,
      world.quangTrungEastPrecinct,
      world.benhVienRhmHue,
      world.dongChuaCuuTheChurch,
      world.youthPlayground,
      world.ubndPalace,
      world.hoChiMinhMuseum,
      world.benTrangCafe,
      world.hueCit,
      world.hueHospital,
      world.truongTienSurroundings,
      world.dongDaCorridor,
    ].filter((b) => b && typeof b.blocksGrass === "function");

    this._job = {
      cx: position.x,
      cz: position.z,
      span,
      maxCount,
      i: 0,
      count: 0,
      seed: 71,
      buildings: filterBoxes(world.buildingPolygons),
      parks: filterBoxes(world.parkPolygons),
      rivers: filterBoxes(this._riverBounds),
      clearances:
        world.entranceClearances?.filter(
          (g) => Math.hypot(g.x - position.x, g.z - position.z) <= half + 20,
        ) || [],
      gates:
        world.schoolGates?.filter(
          (g) => Math.hypot(g.x - position.x, g.z - position.z) <= half + 22,
        ) || [],
      parking: world.parkingAreas || [],
      playgrounds:
        world.playgroundAreas?.filter(
          (a) =>
            Math.hypot(a.x - position.x, a.z - position.z) <=
            half + (a.radius || 0) + 1,
        ) || [],
      blockers,
    };
  }
  update(position) {
    if (
      Math.hypot(position.x - this.center.x, position.z - this.center.z) >= 20
    ) {
      this.center = { x: position.x, z: position.z };
      this._startJob(position);
    }
    const job = this._job;
    if (!job || job.i >= job.maxCount) return;

    const world = this.world;
    const isInitial = this.mesh.count === 0;
    const batchLimit = isInitial ? Math.min(job.maxCount, 4500) : 1800;
    const endI = Math.min(job.maxCount, job.i + batchLimit);
    const {
      cx,
      cz,
      span,
      buildings,
      parks,
      rivers,
      clearances,
      gates,
      parking,
      playgrounds,
      blockers,
    } = job;

    let seed = job.seed;
    let count = job.count;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = job.i; i < endI; i++) {
      const px = cx + (random() - 0.5) * span;
      const pz = cz + (random() - 0.5) * span;
      const road = world.nearestRoad(px, pz);
      if (road.road && road.distance < roadWidth(road.road) / 2 + 2.5) continue;
      if (world.station?.blocks(px, pz)) continue;

      const p = { x: px, z: pz };
      let skip = false;
      for (let j = 0; j < rivers.length; j++) {
        const r = rivers[j];
        if (px > r.minX && px < r.maxX && pz > r.minZ && pz < r.maxZ && inside(p, r.points)) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      for (let j = 0; j < buildings.length; j++) {
        const b = buildings[j];
        if (px > b.minX && px < b.maxX && pz > b.minZ && pz < b.maxZ && inside(p, b.points)) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      for (let j = 0; j < parks.length; j++) {
        const b = parks[j];
        if (px > b.minX && px < b.maxX && pz > b.minZ && pz < b.maxZ && inside(p, b.points)) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      for (let j = 0; j < clearances.length; j++) {
        const g = clearances[j];
        const dx = px - g.x,
          dz = pz - g.z,
          lateral = dx * Math.cos(g.heading) - dz * Math.sin(g.heading),
          forward = dx * Math.sin(g.heading) + dz * Math.cos(g.heading);
        if (Math.abs(lateral) < g.width / 2 && forward > -15 && forward < 5) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      if (parking.length && parking.some((r) => inside(p, r))) continue;

      for (let j = 0; j < playgrounds.length; j++) {
        const a = playgrounds[j];
        if (Math.hypot(px - a.x, pz - a.z) < a.radius + 0.2) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      for (let j = 0; j < gates.length; j++) {
        const g = gates[j];
        const dx = px - g.x,
          dz = pz - g.z,
          lateral = dx * Math.cos(g.heading) - dz * Math.sin(g.heading),
          forward = dx * Math.sin(g.heading) + dz * Math.cos(g.heading);
        if (Math.abs(lateral) < 5 && forward > -18 && forward < 4) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      for (let j = 0; j < blockers.length; j++) {
        if (blockers[j].blocksGrass(px, pz)) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      this.dummy.position.set(px, 0.055, pz);
      this.dummy.rotation.y = random() * Math.PI;
      this.dummy.scale.setScalar(0.6 + random() * 0.65);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(count++, this.dummy.matrix);
    }

    job.i = endI;
    job.seed = seed;
    job.count = count;
    if (isInitial || job.i >= job.maxCount) {
      this.mesh.count = count;
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    if (job.i >= job.maxCount) {
      this._job = null;
    }
  }
}
