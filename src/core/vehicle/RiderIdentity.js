import * as THREE from "three";
import { cleanPlayerName } from "../network/protocol.js";

// Additive accessory: the existing dog and bicycle geometry remain intact.
export function setRiderIdentity(
  bike,
  name,
  color = "#247bba",
  overhead = false,
) {
  if (bike.identity) {
    bike.identity.removeFromParent();
    bike.identity.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        o.material.map?.dispose();
        o.material.dispose();
      }
    });
  }
  const group = new THREE.Group();
  group.name = "rider-identity";
  const shirt = new THREE.Mesh(
    new THREE.SphereGeometry(0.267, 16, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
  );
  shirt.position.y = 0.25;
  shirt.scale.set(0.82, 1.35, 1.04);
  group.add(shirt);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = cleanPlayerName(name);
  let size = 64;
  ctx.font = `bold ${size}px sans-serif`;
  while (ctx.measureText(label).width > 480 && size > 20)
    ctx.font = `bold ${--size}px sans-serif`;
  ctx.fillText(label, 256, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.125),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide }),
  );
  // Upper back: above the tail and proud of the curved shirt surface.
  patch.position.set(0, 0.55, -0.23);
  patch.rotation.y = Math.PI;
  group.add(patch);
  if (overhead) {
    const tag = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, depthWrite: false }),
    );
    tag.position.set(0, 1.23, 0);
    tag.scale.set(1.05, 0.33, 1);
    group.add(tag);
  }
  bike.rider.add(group);
  bike.identity = group;
  bike.playerName = label;
}
