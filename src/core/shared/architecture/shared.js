import * as THREE from "three";
const matCache = new Map();
const boxGeoCache = new Map();
export const mat = (color, roughness = 0.75, metalness = 0.05) => {
  const key = `${color}|${roughness}|${metalness}`;
  let cached = matCache.get(key);
  if (!cached) {
    cached = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    cached.addEventListener("dispose", () => {
      if (matCache.get(key) === cached) matCache.delete(key);
    });
    matCache.set(key, cached);
  }
  return cached;
};
export function box(size, color, position = [0, 0, 0]) {
  const [w, h, d] = size;
  const geoKey = `${w}|${h}|${d}`;
  let geo = boxGeoCache.get(geoKey);
  if (!geo) {
    geo = new THREE.BoxGeometry(w, h, d);
    geo.addEventListener("dispose", () => {
      if (boxGeoCache.get(geoKey) === geo) boxGeoCache.delete(geoKey);
    });
    boxGeoCache.set(geoKey, geo);
  }
  const m = new THREE.Mesh(geo, mat(color));
  m.position.set(...position);
  m.castShadow = m.receiveShadow = true;
  return m;
}
export function roof(width, depth, color, y) {
  const r = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.72, 2.1, 4),
    mat(color),
  );
  r.rotation.y = Math.PI / 4;
  r.scale.z = depth / width;
  r.position.y = y;
  r.castShadow = true;
  return r;
}
export function label(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const x = c.getContext("2d");
  x.fillStyle = "#102522dd";
  x.roundRect(5, 5, 502, 86, 20);
  x.fill();
  x.fillStyle = "#ffe4a3";
  x.font = "600 30px sans-serif";
  x.textAlign = "center";
  x.fillText(text, 256, 59);
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
    }),
  );
  s.scale.set(10, 1.9, 1);
  s.position.y = 7;
  return s;
}
