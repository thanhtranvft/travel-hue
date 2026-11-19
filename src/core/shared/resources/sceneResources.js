import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const models = new Map(),
  shared = new WeakSet();
export class SharedModelLoader {
  loadAsync(url) {
    return loadSharedModel(url);
  }
}
function protectMaterial(material) {
  shared.add(material);
  for (const value of Object.values(material))
    if (value?.isTexture) shared.add(value);
}
export function loadSharedModel(url) {
  if (!models.has(url))
    models.set(
      url,
      new GLTFLoader()
        .loadAsync(url)
        .then((gltf) => {
          gltf.scene.traverse((o) => {
            if (o.geometry) shared.add(o.geometry);
            for (const material of Array.isArray(o.material)
              ? o.material
              : o.material
                ? [o.material]
                : [])
              protectMaterial(material);
          });
          return gltf;
        })
        .catch((error) => {
          models.delete(url);
          throw error;
        }),
    );
  return models.get(url);
}
export function disposeOldScene(scene, retainedScene) {
  const retained = new Set(),
    disposed = new Set(),
    collect = (root, set) =>
      root.traverse((o) => {
        if (o.geometry) set.add(o.geometry);
        for (const m of Array.isArray(o.material)
          ? o.material
          : o.material
            ? [o.material]
            : []) {
          set.add(m);
          for (const value of Object.values(m))
            if (value?.isTexture) set.add(value);
        }
      });
  collect(retainedScene, retained);
  scene.traverse((o) => {
    for (const resource of [
      o.geometry,
      ...(Array.isArray(o.material)
        ? o.material
        : o.material
          ? [o.material]
          : []),
    ]) {
      if (
        !resource ||
        shared.has(resource) ||
        retained.has(resource) ||
        disposed.has(resource)
      )
        continue;
      if (resource.isMaterial)
        for (const texture of Object.values(resource))
          if (
            texture?.isTexture &&
            !shared.has(texture) &&
            !retained.has(texture) &&
            !disposed.has(texture)
          ) {
            texture.dispose();
            disposed.add(texture);
          }
      resource.dispose();
      disposed.add(resource);
    }
    if (o.isInstancedMesh) o.dispose();
    o.shadow?.map?.dispose();
  });
  scene.clear();
  return disposed.size;
}
