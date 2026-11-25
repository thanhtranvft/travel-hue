import * as THREE from "three";

export function createCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

/**
 * Shared manicured Hue emerald lawn texture inspired by the crisp, well-tended
 * Fountain Park lawns: balanced sunlit emerald mowed stripes, subtle fine blade
 * sparkle, and clean tone that keeps pale granite/concrete paths super legible.
 */
export function createManicuredLawnTexture(
  repeatX = 10,
  repeatY = 8,
  { striped = true, rich = true } = {},
) {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const base = rich ? "#4e8b35" : "#56913d";
      const bandA = rich ? "#58973d" : "#5e9a44";
      const bandB = rich ? "#478030" : "#4f8837";
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      if (striped) {
        for (let y = 0; y < h; y += 32) {
          ctx.fillStyle = (y / 32) % 2 ? bandB : bandA;
          ctx.fillRect(0, y, w, 32);
        }
      } else {
        // Gentle sunlit meadow patches for broad macro terrain (no harsh high-frequency banding)
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const odd = (r * 3 + c * 5) % 4;
            ctx.fillStyle =
              odd === 0
                ? "rgba(104, 168, 66, 0.2)"
                : odd === 1
                  ? "rgba(64, 118, 42, 0.16)"
                  : "rgba(92, 152, 58, 0.12)";
            ctx.fillRect(c * 32, r * 32, 32, 32);
          }
        }
      }

      // Soft natural grass blade fleck detail
      for (let i = 0; i < 820; i++) {
        const x = (i * 83 + 17) % w;
        const y = (i * 173 + 41) % h;
        ctx.fillStyle =
          i % 3 === 0
            ? "rgba(142, 200, 88, 0.24)"
            : i % 3 === 1
              ? "rgba(42, 82, 26, 0.18)"
              : "rgba(116, 178, 72, 0.18)";
        ctx.fillRect(x, y, i % 2 ? 3 : 2, 2);
      }
    },
    repeatX,
    repeatY,
  );
}

export function createManicuredLawnMaterial(repeatX = 10, repeatY = 8, options = {}) {
  const map = createManicuredLawnTexture(repeatX, repeatY, options);
  return new THREE.MeshStandardMaterial({
    color: map ? "#ffffff" : "#508d37",
    map,
    roughness: 0.88,
    metalness: 0.01,
    side: THREE.DoubleSide,
  });
}

/**
 * Projects world-horizontal (x, z) coordinates onto geometry UVs so merged
 * polygons and extruded park shapes tile cleanly at uniform metric scale.
 */
export function applyWorldPlanarUVs(geometry, tileMeters = 14) {
  const pos = geometry.attributes.position;
  if (!pos) return geometry;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    uvs[i * 2] = x / tileMeters;
    uvs[i * 2 + 1] = z / tileMeters;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

/**
 * Shared light-grey/warm-ivory granite walkway texture matching Fountain Park.
 */
export function createParkGraniteTexture(repeatX = 10, repeatY = 10) {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#d4d0c7";
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let r = 0; r < h / tile; r++) {
        for (let c = 0; c < w / tile; c++) {
          const shade = ((r * 7 + c * 11) % 5) * 3 - 6;
          ctx.fillStyle = `rgb(${210 + shade}, ${206 + shade}, ${196 + shade})`;
          ctx.fillRect(c * tile + 1, r * tile + 1, tile - 2, tile - 2);
        }
      }
      ctx.strokeStyle = "rgba(128, 125, 118, 0.34)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += tile) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
    },
    repeatX,
    repeatY,
  );
}

/**
 * Shared polished ironwood (gỗ lim) plank texture matching Cầu Gỗ Lim sông Hương:
 * rich warm lim-wood boards laid crosswise with crisp recessed joints, subtle timber grain,
 * and discreet brass/steel deck fasteners.
 */
export function createIronwoodPlankTexture(
  repeatX = 1,
  repeatY = 1,
  { mobile = false, rich = true } = {},
) {
  return createCanvasTexture(
    mobile ? 256 : 512,
    mobile ? 256 : 512,
    (ctx, w, h) => {
      ctx.fillStyle = rich ? "#704525" : "#7a4d2c";
      ctx.fillRect(0, 0, w, h);

      let seed = 419;
      const rand = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      const plankCount = 16;
      const plankH = h / plankCount;
      const tones = rich
        ? ["#7b4c28", "#6f4322", "#86552f", "#673d1e", "#764826"]
        : ["#84532e", "#794a27", "#8e5c36", "#6f4220", "#7f4e2a"];

      for (let p = 0; p < plankCount; p++) {
        const y0 = p * plankH;
        const seam = mobile ? 1.5 : 2.6;
        ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
        ctx.fillRect(0, y0, w, plankH - seam);

        // Warm sunlit highlight band along plank center + darker edge bevel
        ctx.fillStyle = "rgba(218, 162, 104, 0.10)";
        ctx.fillRect(0, y0 + 1, w, plankH * 0.28);

        // Longitudinal ironwood grain streaks
        const grains = mobile ? 10 : 24;
        for (let g = 0; g < grains; g++) {
          const gy = y0 + 2 + rand() * (plankH - seam - 3);
          ctx.fillStyle =
            rand() > 0.45 ? "rgba(34, 16, 6, 0.20)" : "rgba(196, 138, 84, 0.14)";
          ctx.fillRect(rand() * w * 0.35, gy, w * (0.3 + rand() * 0.7), 1.3);
        }

        // Discreet recessed stainless-steel deck screw heads near outer edges
        if (!mobile) {
          ctx.fillStyle = "rgba(42, 26, 16, 0.42)";
          for (const bx of [w * 0.08, w * 0.92]) {
            ctx.fillRect(bx, y0 + plankH * 0.26, 2.2, 2.2);
            ctx.fillRect(bx, y0 + plankH * 0.64, 2.2, 2.2);
          }
        }

        // Dark recessed gap between adjacent ironwood planks
        ctx.fillStyle = "#2b1609";
        ctx.fillRect(0, y0 + plankH - seam, w, seam);
      }

      // Outer deck shadow trim
      ctx.fillStyle = "rgba(28, 14, 6, 0.22)";
      ctx.fillRect(0, 0, Math.round(w * 0.02), h);
      ctx.fillRect(w - Math.round(w * 0.02), 0, Math.round(w * 0.02), h);
    },
    repeatX,
    repeatY,
  );
}

export function createIronwoodWalkMaterial(repeatX = 1, repeatY = 1, options = {}) {
  const map = createIronwoodPlankTexture(repeatX, repeatY, options);
  return new THREE.MeshStandardMaterial({
    color: map ? "#ffffff" : "#784c2b",
    map,
    roughness: 0.64,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });
}

export function createIronwoodPromenadeGeometry(
  lenX,
  height,
  widthZ,
  plankRepeatLength = 3.2,
) {
  const geo = new THREE.BoxGeometry(lenX, height, widthZ);
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  const uv = geo.attributes.uv;
  if (pos && norm && uv) {
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(norm.getY(i)) > 0.5) {
        const u = (pos.getZ(i) + widthZ / 2) / (widthZ || 1);
        const v = (pos.getX(i) + lenX / 2) / (plankRepeatLength || 3.2);
        uv.setXY(i, u, v);
      }
    }
    uv.needsUpdate = true;
  }
  return geo;
}


