import * as THREE from "three";
import { cleanPlayerName } from "../network/protocol.js";

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
    bike.identity = null;
    bike.identityTag = null;
  }

  const label = cleanPlayerName(name);
  bike.playerName = label;
  if (overhead && typeof bike.setBikeColor === "function") {
    bike.setBikeColor(color);
  }
  if (!overhead || typeof document === "undefined" || !label) return;

  const canvas = document.createElement("canvas");
  if (!canvas || typeof canvas.getContext !== "function") return;
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect?.(0, 0, 512, 128);
  if (typeof ctx.beginPath === "function" && typeof ctx.roundRect === "function") {
    ctx.fillStyle = "rgba(16, 38, 34, 0.88)";
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 44);
    ctx.fill?.();
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke?.();
  } else {
    ctx.fillStyle = color;
    ctx.fillRect?.(16, 16, 480, 96);
  }

  ctx.fillStyle = "#fff8e8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 50;
  ctx.font = `bold ${size}px sans-serif`;
  while (ctx.measureText?.(label)?.width > 430 && size > 20) {
    ctx.font = `bold ${--size}px sans-serif`;
  }
  ctx.fillText?.(label, 256, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group();
  group.name = "rider-identity";

  const tag = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  tag.position.set(0, (bike.headTopY || 1.46) + 0.34, 0);
  tag.scale.set(1.18, 0.3, 1);
  group.add(tag);

  bike.rider.add(group);
  bike.identity = group;
  bike.identityTag = tag;
}

