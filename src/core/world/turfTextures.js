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
