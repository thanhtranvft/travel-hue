const SKIP_IDS = new Set([
  "game",
  "recording-pill",
  "scene-loading",
  "capture-modal",
  "clean-mode-exit",
]);

export function parseBorderRadius(raw, width, height) {
  const num = parseFloat(raw);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(num, width / 2, height / 2);
}

export function parseGradientColors(backgroundImage = "") {
  const raw = String(backgroundImage || "");
  if (!raw.includes("gradient(")) return null;
  const matches = raw.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g);
  if (!matches || matches.length < 2) return null;
  return matches.slice(0, 3);
}

function isTransparentColor(color) {
  if (!color || color === "transparent") return true;
  const match = color.match(
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/i,
  );
  return match ? parseFloat(match[1]) <= 0.005 : false;
}

function traceRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (r <= 0.5) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInlineSvg(ctx, svgEl, rect, fallbackColor) {
  const vbRaw = svgEl.getAttribute("viewBox");
  const vb = vbRaw
    ? vbRaw
        .trim()
        .split(/[\s,]+/)
        .map(Number)
    : [0, 0, rect.width, rect.height];
  const [, , vbW, vbH] = vb.length === 4 && vb[2] > 0 && vb[3] > 0
    ? vb
    : [0, 0, rect.width, rect.height];
  const vbX = vb[0] || 0;
  const vbY = vb[1] || 0;

  ctx.save();
  ctx.translate(rect.left, rect.top);
  ctx.scale(rect.width / vbW, rect.height / vbH);
  ctx.translate(-vbX, -vbY);

  const svgStyle = getComputedStyle(svgEl);
  const inheritedColor = svgStyle.color || fallbackColor || "#ffffff";

  for (const child of svgEl.querySelectorAll("circle, rect, path, line")) {
    const cs = getComputedStyle(child);
    if (cs.display === "none" || cs.visibility === "hidden") continue;

    const resolvePaint = (val) => {
      if (!val || val === "none") return null;
      if (val === "currentColor") return cs.color || inheritedColor;
      return val;
    };

    const fill = resolvePaint(cs.fill || child.getAttribute("fill"));
    const stroke = resolvePaint(cs.stroke || child.getAttribute("stroke"));
    const strokeWidth = parseFloat(cs.strokeWidth || child.getAttribute("stroke-width")) || 1;

    if (child.tagName.toLowerCase() === "circle") {
      const cx = parseFloat(child.getAttribute("cx")) || 0;
      const cy = parseFloat(child.getAttribute("cy")) || 0;
      const r = parseFloat(child.getAttribute("r")) || 0;
      if (r <= 0) continue;
      const dashArray = parseFloat(cs.strokeDasharray);
      const dashOffset = parseFloat(cs.strokeDashoffset);
      ctx.beginPath();
      if (
        Number.isFinite(dashArray) &&
        dashArray > 0 &&
        Number.isFinite(dashOffset)
      ) {
        const ratio = Math.max(0, Math.min(1, 1 - dashOffset / dashArray));
        if (ratio > 0.005) {
          ctx.arc(cx, cy, r, 0, Math.PI * 2 * ratio);
        }
      } else {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke && strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = cs.strokeLinecap || "round";
        ctx.stroke();
      }
    } else if (child.tagName.toLowerCase() === "path" && typeof Path2D === "function") {
      const d = child.getAttribute("d");
      if (!d) continue;
      const p2d = new Path2D(d);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill(p2d);
      }
      if (stroke && strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = cs.strokeLinecap || "butt";
        ctx.lineJoin = cs.strokeLinejoin || "miter";
        ctx.stroke(p2d);
      }
    } else if (child.tagName.toLowerCase() === "rect") {
      const x = parseFloat(child.getAttribute("x")) || 0;
      const y = parseFloat(child.getAttribute("y")) || 0;
      const w = parseFloat(child.getAttribute("width")) || 0;
      const h = parseFloat(child.getAttribute("height")) || 0;
      if (w <= 0 || h <= 0) continue;
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
      }
      if (stroke && strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.strokeRect(x, y, w, h);
      }
    }
  }
  ctx.restore();
}

function drawTextNodeLines(ctx, textNode, parentStyle) {
  const raw = textNode.textContent;
  if (!raw || !raw.trim()) return;

  const fontSize = parseFloat(parentStyle.fontSize) || 12;
  const fontFamily = parentStyle.fontFamily || '"Be Vietnam Pro", sans-serif';
  const fontWeight = parentStyle.fontWeight || "400";
  const fontStyle = parentStyle.fontStyle === "italic" ? "italic " : "";
  ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = parentStyle.color || "#ffffff";
  ctx.textBaseline = "middle";

  if (typeof document.createRange !== "function") return;
  const range = document.createRange();
  range.selectNodeContents(textNode);
  const rects = range.getClientRects();
  if (!rects || !rects.length) return;

  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (rects.length === 1) {
    const r = rects[0];
    if (r.width <= 0 || r.height <= 0) return;
    ctx.fillText(collapsed, r.left, r.top + r.height * 0.5, r.width + 2);
    return;
  }

  // Multi-line wrapped text: step through character offsets per line rect
  const text = textNode.textContent;
  let cursor = 0;
  for (let i = 0; i < rects.length && cursor < text.length; i++) {
    const r = rects[i];
    if (r.width <= 0 || r.height <= 0) continue;
    let lineText = "";
    while (cursor < text.length) {
      const ch = text[cursor];
      const next = lineText + ch;
      if (
        lineText.trim().length > 0 &&
        ctx.measureText(next.trim()).width > r.width + 3
      ) {
        break;
      }
      lineText = next;
      cursor++;
    }
    const cleanLine = lineText.trim();
    if (cleanLine) {
      ctx.fillText(cleanLine, r.left, r.top + r.height * 0.5, r.width + 4);
    }
  }
}

function paintElementTree(ctx, el, parentAlpha = 1) {
  if (!el || el.nodeType !== 1) return;
  if (el.hidden || SKIP_IDS.has(el.id)) return;

  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return;
  const localAlpha = parseFloat(cs.opacity);
  const alpha = parentAlpha * (Number.isFinite(localAlpha) ? localAlpha : 1);
  if (alpha <= 0.01) return;

  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    // Container with display: contents or zero-box wrapper may still hold positioned children
    if (cs.display !== "contents") {
      for (const child of el.children) paintElementTree(ctx, child, alpha);
    }
    return;
  }

  const tag = el.tagName.toLowerCase();
  if (tag === "svg") {
    ctx.save();
    ctx.globalAlpha = alpha;
    drawInlineSvg(ctx, el, rect, cs.color);
    ctx.restore();
    return;
  }

  const radius = parseBorderRadius(cs.borderTopLeftRadius, rect.width, rect.height);
  const bg = cs.backgroundColor;
  const gradColors = parseGradientColors(cs.backgroundImage);
  const borderWidth = parseFloat(cs.borderTopWidth) || 0;
  const borderColor = cs.borderTopColor;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (!isTransparentColor(bg) || gradColors) {
    traceRoundedRect(ctx, rect.left, rect.top, rect.width, rect.height, radius);
    if (gradColors) {
      const grad = ctx.createLinearGradient(
        rect.left,
        rect.top,
        rect.left + rect.width,
        rect.top,
      );
      gradColors.forEach((c, idx) =>
        grad.addColorStop(idx / Math.max(1, gradColors.length - 1), c),
      );
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bg;
    }
    ctx.fill();
  }

  if (borderWidth > 0 && !isTransparentColor(borderColor)) {
    traceRoundedRect(
      ctx,
      rect.left + borderWidth * 0.5,
      rect.top + borderWidth * 0.5,
      Math.max(0, rect.width - borderWidth),
      Math.max(0, rect.height - borderWidth),
      radius,
    );
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  if (tag === "canvas" && el.width > 0 && el.height > 0) {
    traceRoundedRect(ctx, rect.left, rect.top, rect.width, rect.height, radius);
    ctx.clip();
    try {
      ctx.drawImage(el, rect.left, rect.top, rect.width, rect.height);
    } catch {}
    ctx.restore();
    return;
  }

  const shouldClip =
    cs.overflow === "hidden" ||
    cs.overflowX === "hidden" ||
    cs.overflowY === "hidden";
  if (shouldClip) {
    traceRoundedRect(ctx, rect.left, rect.top, rect.width, rect.height, radius);
    ctx.clip();
  }

  if (tag === "select") {
    const label = el.options?.[el.selectedIndex]?.text || el.value || "";
    if (label) {
      ctx.font = `${cs.fontWeight || "400"} ${parseFloat(cs.fontSize) || 12}px ${cs.fontFamily || "sans-serif"}`;
      ctx.fillStyle = cs.color || "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(label, rect.left + 8, rect.top + rect.height / 2, Math.max(0, rect.width - 16));
    }
    ctx.restore();
    return;
  }

  for (const node of el.childNodes) {
    if (node.nodeType === 3) {
      drawTextNodeLines(ctx, node, cs);
    } else if (node.nodeType === 1) {
      paintElementTree(ctx, node, 1);
    }
  }

  ctx.restore();
}

export function renderGameHudToCanvas(targetCanvas) {
  if (typeof document === "undefined" || !targetCanvas) return false;
  const appRoot = document.querySelector("#app");
  if (!appRoot) return false;

  const vw = Math.max(1, window.innerWidth || appRoot.clientWidth || 1280);
  const vh = Math.max(1, window.innerHeight || appRoot.clientHeight || 720);
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.max(2, Math.round(vw * scale));
  const h = Math.max(2, Math.round(vh * scale));

  if (targetCanvas.width !== w) targetCanvas.width = w;
  if (targetCanvas.height !== h) targetCanvas.height = h;

  const ctx = targetCanvas.getContext("2d");
  if (!ctx) return false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(scale, scale);

  for (const child of appRoot.children) {
    paintElementTree(ctx, child, 1);
  }
  ctx.restore();
  return true;
}

export function compositeHudOverFrame(
  outCtx,
  hudCanvas,
  { srcRect, gameCanvasWidth, gameCanvasHeight, outWidth, outHeight },
) {
  if (!outCtx || !hudCanvas || hudCanvas.width <= 0 || hudCanvas.height <= 0) {
    return false;
  }
  const gw = Math.max(1, gameCanvasWidth || 1);
  const gh = Math.max(1, gameCanvasHeight || 1);
  const sx = (srcRect.sx / gw) * hudCanvas.width;
  const sy = (srcRect.sy / gh) * hudCanvas.height;
  const sw = Math.max(1, (srcRect.sw / gw) * hudCanvas.width);
  const sh = Math.max(1, (srcRect.sh / gh) * hudCanvas.height);

  outCtx.drawImage(hudCanvas, sx, sy, sw, sh, 0, 0, outWidth, outHeight);
  return true;
}
