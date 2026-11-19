import * as THREE from "three";
import { box } from "../shared/architecture/shared.js";
function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
const materials = new Map();
export function trafficBoard(title, subtitle = "", size = 3.4) {
  const key = `${title}\n${subtitle}`;
  if (materials.has(key))
    return new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      materials.get(key),
    );
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  c.scale(0.5, 0.5);
  c.fillStyle = "#0863b8";
  c.fillRect(0, 0, 1024, 1024);
  c.strokeStyle = "#ffffff";
  c.lineWidth = 16;
  c.strokeRect(22, 22, 980, 980);
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  let font = 150,
    lines;
  do {
    c.font = `bold ${font}px Arial, sans-serif`;
    lines = wrap(c, title, 900);
    if (lines.length * font * 1.16 < 650) break;
    font -= 6;
  } while (font > 48);
  const top = subtitle ? 390 : 512;
  lines.forEach((line, i) =>
    c.fillText(line, 512, top + (i - (lines.length - 1) / 2) * font * 1.16),
  );
  if (subtitle) {
    c.font = "bold 78px Arial, sans-serif";
    const sub = wrap(c, subtitle, 900);
    sub.slice(0, 3).forEach((line, i) => c.fillText(line, 512, 760 + i * 86));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.85,
  });
  materials.set(key, material);
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
}
export function mountSignPanel(
  panel,
  height = 3.5,
  poleXs = [0],
  color = "#626e72",
) {
  const group = new THREE.Group();
  panel.position.set(0, height, 0);
  panel.userData.signFace = true;
  group.add(panel);
  // Two readable faces enclose the support. A double-sided plane alone lets
  // the pole cover the lettering whenever the player approaches from behind.
  const back = panel.clone();
  back.position.z = -0.4;
  back.rotation.y = Math.PI;
  back.userData.signFace = true;
  group.add(back);
  const { width, height: panelHeight } = panel.geometry.parameters;
  const backing = box([width, panelHeight, 0.34], "#28547d", [0, height, -0.2]);
  group.add(backing);
  for (const x of poleXs) {
    const pole = box([0.15, height, 0.15], color, [x, height / 2, -0.2]);
    pole.userData.signPole = true;
    group.add(pole);
  }
  return group;
}
export function postedBoard(title, subtitle = "", size = 3.4) {
  return mountSignPanel(trafficBoard(title, subtitle, size));
}
