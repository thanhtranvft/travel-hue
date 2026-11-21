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
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -0.05, 0, 0, 0.05, 0, 0, 0.01, 0.45, 0, 0, 0, -0.05, 0, 0, 0.05, 0,
          0.35, 0.01,
        ],
        3,
      ),
    );
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: "#668745",
      side: THREE.DoubleSide,
      roughness: 1,
    });
    this.mesh = new THREE.InstancedMesh(geometry, material, 18000);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    world.scene.add(this.mesh);
    this.dummy = new THREE.Object3D();
  }
  update(position) {
    if (Math.hypot(position.x - this.center.x, position.z - this.center.z) < 20)
      return;
    this.center = { x: position.x, z: position.z };
    const world = this.world;
    let count = 0,
      seed = 71;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < (world.quality?.grassSamples || 18000); i++) {
      const span = world.quality?.grassSpan || 160,
        p = {
          x: position.x + (random() - 0.5) * span,
          z: position.z + (random() - 0.5) * span,
        },
        road = world.nearestRoad(p.x, p.z);
      if (road.road && road.distance < roadWidth(road.road) / 2 + 2.2) continue;
      if (world.station?.blocks(p.x, p.z)) continue;
      if (
        world.riverRings.some((r) => inside(p, r)) ||
        world.buildingPolygons.some(
          (b) =>
            p.x > b.minX &&
            p.x < b.maxX &&
            p.z > b.minZ &&
            p.z < b.maxZ &&
            inside(p, b.points),
        )
      )
        continue;
      if (
        world.entranceClearances?.some((g) => {
          const dx = p.x - g.x,
            dz = p.z - g.z,
            lateral = dx * Math.cos(g.heading) - dz * Math.sin(g.heading),
            forward = dx * Math.sin(g.heading) + dz * Math.cos(g.heading);
          return (
            Math.abs(lateral) < g.width / 2 && forward > -15 && forward < 5
          );
        })
      )
        continue;
      if (world.parkingAreas?.some((r) => inside(p, r))) continue;
      if (
        world.playgroundAreas?.some(
          (a) => Math.hypot(p.x - a.x, p.z - a.z) < a.radius + 0.2,
        )
      )
        continue;
      if (
        world.schoolGates?.some((g) => {
          const dx = p.x - g.x,
            dz = p.z - g.z,
            lateral = dx * Math.cos(g.heading) - dz * Math.sin(g.heading),
            forward = dx * Math.sin(g.heading) + dz * Math.cos(g.heading);
          return Math.abs(lateral) < 5 && forward > -18 && forward < 4;
        })
      )
        continue;
      if (world.quocHocPark?.blocksGrass(p.x, p.z)) continue;
      this.dummy.position.set(p.x, 0.055, p.z);
      this.dummy.rotation.y = random() * Math.PI;
      this.dummy.scale.setScalar(0.5 + random() * 1.1);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(count++, this.dummy.matrix);
    }
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
