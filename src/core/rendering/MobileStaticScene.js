import * as THREE from "three";

const _size = new THREE.Vector3();
const _v0 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _n = new THREE.Vector3();
const _normalMatrix = new THREE.Matrix3();
const _box = new THREE.Box3();
const _center = new THREE.Vector3();

// Batch fixed, untextured standard meshes into spatial tiles using vertex colors
// so thousands of color-varied building/park parts collapse into ~100 draw calls.
export function optimizeMobileStaticScene(world) {
  const excluded = new Set([
      ...(world.pedestrianLife?.people.map((p) => p.mesh) || []),
      ...(world.youthPlayground?.equipment.map((e) => e.group) || []),
      ...(world.youthPlayground?.animatedObjects || []),
      ...(world.propertyEnclosures?.parking?.cars || []),
      ...(world.truongTienBridge?.animatedObjects || []),
      ...(world.biaPark?.animatedObjects || []),
      ...(world.fireflyPark?.animatedObjects || []),
      ...(world.fountainPark?.animatedObjects || []),
      ...(world.phuXuanParkWalk?.animatedObjects || []),
      ...(world.northBankVista?.animatedObjects || []),
      ...(world.quocHocCampus?.animatedObjects || []),
      ...(world.haiBaTrungCampus?.animatedObjects || []),
      ...(world.nguyenChiDieuCampus?.animatedObjects || []),
      ...(world.caoThangCampus?.animatedObjects || []),
      ...(world.quangTrungCampus?.animatedObjects || []),
      ...(world.quangTrungEastPrecinct?.animatedObjects || []),
      ...(world.benhVienRhmHue?.animatedObjects || []),
      ...(world.dongChuaCuuTheChurch?.animatedObjects || []),
      ...(world.vincomPlaza?.animatedObjects || []),
      ...(world.ubndPalace?.animatedObjects || []),
      ...(world.hoChiMinhMuseum?.animatedObjects || []),
      ...(world.benTrangCafe?.animatedObjects || []),
      ...(world.museumParkingCafe?.animatedObjects || []),
      ...(world.hueCit?.animatedObjects || []),
      ...(world.hueHospital?.animatedObjects || []),
      ...(world.boardwalkView?.animatedObjects || []),
      ...(world.truongTienSurroundings?.animatedObjects || []),
      ...(world.dongDaCorridor?.animatedObjects || []),
      ...(world.phuXuanBridge?.animatedObjects || []),
      world.caHueBoats?.group,
      world.ambientSwanBoats?.group,
    ].filter(Boolean)),
    batches = new Map(),
    sharedTileMaterials = new Map(),
    dynamicCullingGroups = [],
    oldObstacles = new Set(world.cameraObstacles),
    remainingObstacles = world.cameraObstacles.slice(),
    preserveShadows = Boolean(world.quality?.shadows),
    tileSize = world.quality?.mobile === false ? 192 : 96;

  world.scene.updateMatrixWorld(true);

  const getSharedBatchMaterial = (roughness, metalness, side) => {
    const r = Math.round(roughness * 2) / 2;
    const m = metalness > 0.35 ? 0.75 : 0;
    const matKey = `${r}/${m}/${side}`;
    let mat = sharedTileMaterials.get(matKey);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        vertexColors: true,
        roughness: r,
        metalness: m,
        side,
      });
      sharedTileMaterials.set(matKey, mat);
    }
    return { matKey, mat };
  };

  const isBatchableLeafMesh = (object) => {
    const material = object.material;
    return Boolean(
      object.isMesh &&
        !object.isInstancedMesh &&
        !object.userData?.keepSeparate &&
        material?.isMeshStandardMaterial &&
        !material.map &&
        !material.transparent &&
        !material.vertexColors &&
        !material.flatShading &&
        !(material.emissive && material.emissive.getHex() !== 0) &&
        !object.geometry?.attributes?.color &&
        !material.onBeforeCompile.toString().includes("landscapeTime") &&
        !material.isMeshPhysicalMaterial,
    );
  };

  const mergeLocalNodeChildren = (node) => {
    if (!node || !node.visible || node.userData?.noLeafMerge) return;
    const directChildren = [...node.children];
    const localBatches = new Map();
    const toRemove = [];

    for (const child of directChildren) {
      if (child.children?.length > 0) {
        mergeLocalNodeChildren(child);
        continue;
      }
      if (!isBatchableLeafMesh(child)) continue;
      const position = child.geometry?.attributes?.position;
      const normal = child.geometry?.attributes?.normal;
      if (!position || !normal) continue;
      if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
      child.geometry.boundingBox.getSize(_size);

      const maxDim = Math.max(_size.x, _size.y, _size.z);
      const castShadow = preserveShadows && child.castShadow && maxDim >= 0.32;
      if (!castShadow && child.castShadow) child.castShadow = false;
      const receiveShadow = preserveShadows && child.receiveShadow;
      const { matKey, mat } = getSharedBatchMaterial(
        child.material.roughness ?? 0.8,
        child.material.metalness ?? 0,
        child.material.side ?? THREE.FrontSide,
      );
      const key = `${matKey}/${castShadow ? 1 : 0}/${receiveShadow ? 1 : 0}`;
      let batch = localBatches.get(key);
      if (!batch) {
        batch = {
          material: mat,
          castShadow,
          receiveShadow,
          positions: [],
          normals: [],
          colors: [],
          sourceCount: 0,
        };
        localBatches.set(key, batch);
      }

      child.updateMatrix();
      const matrix = child.matrix;
      _normalMatrix.getNormalMatrix(matrix);
      const cr = child.material.color.r;
      const cg = child.material.color.g;
      const cb = child.material.color.b;
      const index = child.geometry.index;
      const total = index ? index.count : position.count;
      for (let i = 0; i < total; i += 3) {
        const k0 = index ? index.getX(i) : i;
        const k1 = index ? index.getX(i + 1) : i + 1;
        const k2 = index ? index.getX(i + 2) : i + 2;
        _v0.fromBufferAttribute(position, k0).applyMatrix4(matrix);
        _v1.fromBufferAttribute(position, k1).applyMatrix4(matrix);
        _v2.fromBufferAttribute(position, k2).applyMatrix4(matrix);
        batch.positions.push(_v0.x, _v0.y, _v0.z, _v1.x, _v1.y, _v1.z, _v2.x, _v2.y, _v2.z);
        batch.colors.push(cr, cg, cb, cr, cg, cb, cr, cg, cb);
        _n.fromBufferAttribute(normal, k0).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(normal, k1).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(normal, k2).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
      }
      batch.sourceCount++;
      toRemove.push({ child, key });
    }

    if (toRemove.length < 2) return;
    for (const { child, key } of toRemove) {
      const batch = localBatches.get(key);
      if (batch && batch.sourceCount >= 2) child.removeFromParent();
    }
    for (const batch of localBatches.values()) {
      if (batch.sourceCount < 2) continue;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(batch.positions, 3));
      geometry.setAttribute("normal", new THREE.Float32BufferAttribute(batch.normals, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(batch.colors, 3));
      geometry.computeBoundingSphere();
      const merged = new THREE.Mesh(geometry, batch.material);
      merged.castShadow = batch.castShadow;
      merged.receiveShadow = batch.receiveShadow;
      node.add(merged);
    }
  };

  const collect = (object, dynamic = false) => {
    if (!object.visible) return;
    if (object.userData?.dynamicAnimated) {
      mergeLocalNodeChildren(object);
      const dynRange = world.quality?.mobile ? 85 : 115;
      _box.setFromObject(object);
      if (!_box.isEmpty()) {
        _box.getCenter(_center);
        _box.getSize(_size);
        const radius = Math.hypot(_size.x, _size.z) * 0.5;
        dynamicCullingGroups.push({
          group: object,
          cx: _center.x,
          cz: _center.z,
          cullDistSq: (radius + dynRange) ** 2,
        });
      }
      if (preserveShadows) {
        object.traverse((sub) => {
          if (sub.isMesh && sub.castShadow && sub.geometry) {
            if (!sub.geometry.boundingBox) sub.geometry.computeBoundingBox();
            sub.geometry.boundingBox.getSize(_size);
            if (Math.max(_size.x, _size.y, _size.z) < 0.32) {
              sub.castShadow = false;
            }
          }
        });
      }
      return;
    }
    dynamic ||= excluded.has(object);
    if (dynamic) {
      if (object === world.ambientSwanBoats?.group || object === world.caHueBoats?.group) {
        mergeLocalNodeChildren(object);
      }
      return;
    }
    const material = object.material;
    if (isBatchableLeafMesh(object)) {
      const position = object.geometry.attributes.position,
        index = object.geometry.index,
        normal = object.geometry.attributes.normal;
      if (!position || !normal) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      object.geometry.boundingBox.getSize(_size);
      if (position.count < 10 && Math.max(_size.x, _size.z) > 200) return;

      const castShadow =
        preserveShadows &&
        object.castShadow &&
        Math.max(_size.x, _size.y, _size.z) >= 0.85;
      const receiveShadow = preserveShadows && object.receiveShadow;
      const { matKey, mat } = getSharedBatchMaterial(
        material.roughness ?? 0.8,
        material.metalness ?? 0,
        material.side ?? THREE.FrontSide,
      );
      const cr = material.color.r;
      const cg = material.color.g;
      const cb = material.color.b;
      const key = `${matKey}/${castShadow ? 1 : 0}/${receiveShadow ? 1 : 0}`;
      const matrix = object.matrixWorld;
      _normalMatrix.getNormalMatrix(matrix);

      const total = index ? index.count : position.count;
      const isObstacle = oldObstacles.has(object);
      for (let i = 0; i < total; i += 3) {
        const k0 = index ? index.getX(i) : i;
        const k1 = index ? index.getX(i + 1) : i + 1;
        const k2 = index ? index.getX(i + 2) : i + 2;
        _v0.fromBufferAttribute(position, k0).applyMatrix4(matrix);
        _v1.fromBufferAttribute(position, k1).applyMatrix4(matrix);
        _v2.fromBufferAttribute(position, k2).applyMatrix4(matrix);

        const cx = (_v0.x + _v1.x + _v2.x) / 3;
        const cz = (_v0.z + _v1.z + _v2.z) / 3;
        const tile = `${Math.floor(cx / tileSize)},${Math.floor(cz / tileSize)}`;
        const batchKey = `${tile}/${key}`;
        let batch = batches.get(batchKey);
        if (!batch) {
          batch = {
            tile,
            material: mat,
            castShadow,
            receiveShadow,
            positions: [],
            normals: [],
            colors: [],
            obstacle: false,
          };
          batches.set(batchKey, batch);
        }
        batch.obstacle ||= isObstacle;
        batch.positions.push(
          _v0.x, _v0.y, _v0.z,
          _v1.x, _v1.y, _v1.z,
          _v2.x, _v2.y, _v2.z,
        );
        batch.colors.push(cr, cg, cb, cr, cg, cb, cr, cg, cb);
        _n.fromBufferAttribute(normal, k0).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(normal, k1).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(normal, k2).applyMatrix3(_normalMatrix).normalize();
        batch.normals.push(_n.x, _n.y, _n.z);
      }

      object.removeFromParent();
      if (isObstacle) {
        const idx = remainingObstacles.indexOf(object);
        if (idx !== -1) remainingObstacles.splice(idx, 1);
      }
      return;
    }
    for (const child of [...object.children]) collect(child, dynamic);
  };

  // Keep traversal separate from insertion so generated batches aren't reprocessed.
  for (const root of [...world.scene.children]) collect(root);

  world.mobileStaticTiles = [];
  for (const batch of batches.values()) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(batch.positions, 3),
    );
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(batch.normals, 3),
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(batch.colors, 3),
    );
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, batch.material);
    mesh.castShadow = batch.castShadow;
    mesh.receiveShadow = batch.receiveShadow;
    world.scene.add(mesh);
    world.mobileStaticTiles.push({ mesh, sphere: geometry.boundingSphere });
    if (batch.obstacle) remainingObstacles.push(mesh);
  }
  world.cameraObstacles = remainingObstacles;
  world.dynamicCullingGroups = dynamicCullingGroups;
  world.mobileStaticStats = {
    batches: batches.size,
    materials: sharedTileMaterials.size,
    dynamicCulled: dynamicCullingGroups.length,
  };
  world._lastStaticTilePos = null;
}

export const optimizeStaticScene = optimizeMobileStaticScene;

export function updateMobileStaticScene(world, position) {
  if (!position) return;
  const last = world._lastStaticTilePos;
  if (last) {
    const moveDx = position.x - last.x;
    const moveDz = position.z - last.z;
    if (moveDx * moveDx + moveDz * moveDz < 64) return;
  }
  world._lastStaticTilePos = { x: position.x, z: position.z };

  const tiles = world.mobileStaticTiles;
  if (tiles?.length) {
    const distance = world.quality?.staticDistance || 1100;
    for (let i = 0; i < tiles.length; i++) {
      const { mesh, sphere } = tiles[i];
      const dx = sphere.center.x - position.x,
        dz = sphere.center.z - position.z,
        maxDist = distance + sphere.radius;
      mesh.visible = dx * dx + dz * dz < maxDist * maxDist;
    }
  }

  const dynGroups = world.dynamicCullingGroups;
  if (dynGroups?.length) {
    for (let i = 0; i < dynGroups.length; i++) {
      const entry = dynGroups[i];
      const dx = entry.cx - position.x;
      const dz = entry.cz - position.z;
      entry.group.visible = dx * dx + dz * dz <= entry.cullDistSq;
    }
  }
}
