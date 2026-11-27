import {
  compositeHudOverFrame,
  renderGameHudToCanvas,
} from "./HudCompositor.js";

const VIDEO_MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.640028,mp4a.40.2",
  "video/mp4;codecs=avc1.4D401F,mp4a.40.2",
  "video/mp4;codecs=h264,aac",
  "video/webm;codecs=vp9,opus",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=h264,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export const CLIP_DURATION_OPTIONS = [15, 30, 60, 120];

export const VIDEO_QUALITY_PRESETS = {
  standard: {
    id: "standard",
    label: "Tiêu chuẩn (720p · 30fps)",
    maxEdge: 1280,
    fps: 30,
    videoBitsPerSecond: 4_500_000,
    audioBitsPerSecond: 128_000,
  },
  high: {
    id: "high",
    label: "Full HD (1080p · 60fps)",
    maxEdge: 1920,
    fps: 60,
    videoBitsPerSecond: 9_000_000,
    audioBitsPerSecond: 192_000,
  },
  ultra: {
    id: "ultra",
    label: "Siêu nét (Gốc · 60fps)",
    maxEdge: 2560,
    fps: 60,
    videoBitsPerSecond: 16_000_000,
    audioBitsPerSecond: 192_000,
  },
};

export function resolveVideoQuality(quality = "high") {
  if (quality && typeof quality === "object") {
    const base = VIDEO_QUALITY_PRESETS[quality.id] || VIDEO_QUALITY_PRESETS.high;
    return {
      ...base,
      maxEdge: Number(quality.maxEdge) > 0 ? Number(quality.maxEdge) : base.maxEdge,
      fps: Number(quality.fps) > 0 ? Number(quality.fps) : base.fps,
      videoBitsPerSecond:
        Number(quality.videoBitsPerSecond) > 0
          ? Number(quality.videoBitsPerSecond)
          : base.videoBitsPerSecond,
      audioBitsPerSecond:
        Number(quality.audioBitsPerSecond) > 0
          ? Number(quality.audioBitsPerSecond)
          : base.audioBitsPerSecond,
    };
  }
  return VIDEO_QUALITY_PRESETS[quality] || VIDEO_QUALITY_PRESETS.high;
}

function toEven(value, minimum = 2) {
  const rounded = Math.max(minimum, Math.round(value));
  return rounded % 2 === 0 ? rounded : rounded - 1;
}

export function computeCropRect(srcWidth, srcHeight, aspect = "full", maxEdge = 1280) {
  const swRaw = Math.max(2, Math.floor(Number(srcWidth) || 0));
  const shRaw = Math.max(2, Math.floor(Number(srcHeight) || 0));

  let sx = 0;
  let sy = 0;
  let sw = swRaw;
  let sh = shRaw;

  if (aspect === "9:16") {
    const targetRatio = 9 / 16;
    const srcRatio = swRaw / shRaw;
    if (srcRatio > targetRatio) {
      sw = Math.max(2, Math.round(shRaw * targetRatio));
      sx = Math.floor((swRaw - sw) / 2);
    } else if (srcRatio < targetRatio) {
      sh = Math.max(2, Math.round(swRaw / targetRatio));
      sy = Math.floor((shRaw - sh) / 2);
    }
  } else if (aspect === "16:9") {
    const targetRatio = 16 / 9;
    const srcRatio = swRaw / shRaw;
    if (srcRatio > targetRatio) {
      sw = Math.max(2, Math.round(shRaw * targetRatio));
      sx = Math.floor((swRaw - sw) / 2);
    } else if (srcRatio < targetRatio) {
      sh = Math.max(2, Math.round(swRaw / targetRatio));
      sy = Math.floor((shRaw - sh) / 2);
    }
  }

  const longest = Math.max(sw, sh);
  const scale = longest > maxEdge ? maxEdge / longest : 1;
  const width = toEven(sw * scale);
  const height = toEven(sh * scale);

  return { sx, sy, sw, sh, width, height };
}

export function pickRecorderMimeType(
  isTypeSupported = typeof MediaRecorder !== "undefined"
    ? (type) => MediaRecorder.isTypeSupported?.(type)
    : null,
) {
  if (typeof isTypeSupported !== "function") return "";
  for (const candidate of VIDEO_MIME_CANDIDATES) {
    try {
      if (isTypeSupported(candidate)) return candidate;
    } catch {}
  }
  return "";
}

export function extensionForMimeType(mimeType = "") {
  const lower = String(mimeType || "").toLowerCase();
  return lower.includes("mp4") ? "mp4" : "webm";
}

export function buildCaptureFilename(
  kind = "image",
  regionId = "hue",
  mimeType = "",
  date = new Date(),
) {
  const safeRegion =
    String(regionId || "hue")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "") || "hue";
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
  const ext = kind === "video" ? extensionForMimeType(mimeType) : "png";
  return `cun-con-hue-${safeRegion}-${stamp}.${ext}`;
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function getCaptureCapabilities() {
  const hasCanvas = typeof HTMLCanvasElement !== "undefined";
  const canCaptureCanvas =
    hasCanvas &&
    typeof HTMLCanvasElement.prototype.captureStream === "function";
  const hasMediaRecorder = typeof MediaRecorder !== "undefined";
  const hasAudioStreamDest =
    typeof AudioContext !== "undefined" ||
    typeof webkitAudioContext !== "undefined";
  return {
    canScreenshot: hasCanvas,
    canRecordVideo: canCaptureCanvas && hasMediaRecorder,
    canCaptureGameAudio: hasAudioStreamDest,
    micUsed: false,
  };
}

export function drawCaptureWatermark(
  ctx,
  width,
  height,
  { areaTitle = "", landmarkTitle = "" } = {},
) {
  if (!ctx || !width || !height) return;
  const compact = width < 640;
  const padX = compact ? 12 : 16;
  const padY = compact ? 8 : 10;
  const margin = compact ? 14 : 20;
  const titleText = "Cún con đi dạo Huế";
  const subText = [areaTitle, landmarkTitle].filter(Boolean).join(" · ");

  ctx.save();
  ctx.font = compact
    ? '700 13px "Be Vietnam Pro", system-ui, sans-serif'
    : '700 15px "Be Vietnam Pro", system-ui, sans-serif';
  const titleWidth = ctx.measureText(titleText).width;
  ctx.font = compact
    ? '500 11px "Be Vietnam Pro", system-ui, sans-serif'
    : '500 12px "Be Vietnam Pro", system-ui, sans-serif';
  const subWidth = subText ? ctx.measureText(subText).width : 0;

  const boxWidth = Math.min(
    width - margin * 2,
    Math.ceil(Math.max(titleWidth, subWidth) + padX * 2),
  );
  const boxHeight = subText ? (compact ? 42 : 48) : compact ? 28 : 32;
  const x = margin;
  const y = height - boxHeight - margin;
  const radius = 12;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + boxWidth - radius, y);
  ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
  ctx.lineTo(x + boxWidth, y + boxHeight - radius);
  ctx.quadraticCurveTo(
    x + boxWidth,
    y + boxHeight,
    x + boxWidth - radius,
    y + boxHeight,
  );
  ctx.lineTo(x + radius, y + boxHeight);
  ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fillStyle = "rgba(12, 31, 28, 0.78)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(246, 213, 155, 0.45)";
  ctx.stroke();

  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffe5a8";
  ctx.font = compact
    ? '700 13px "Be Vietnam Pro", system-ui, sans-serif'
    : '700 15px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.fillText(titleText, x + padX, y + padY - 1, boxWidth - padX * 2);

  if (subText) {
    ctx.fillStyle = "#d9ebe2";
    ctx.font = compact
      ? '500 11px "Be Vietnam Pro", system-ui, sans-serif'
      : '500 12px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText(
      subText,
      x + padX,
      y + padY + (compact ? 16 : 19),
      boxWidth - padX * 2,
    );
  }
  ctx.restore();
}

export async function captureScreenshot({
  canvas,
  renderNow,
  aspect = "full",
  regionId = "hue",
  areaTitle = "",
  landmarkTitle = "",
  watermark = true,
  includeHud = false,
}) {
  if (!canvas) throw new Error("Không tìm thấy khung hình 3D để chụp.");
  renderNow?.();

  const srcWidth = canvas.width || canvas.clientWidth || 1280;
  const srcHeight = canvas.height || canvas.clientHeight || 720;
  const maxEdge = aspect === "9:16" ? 1920 : 2560;
  const rect = computeCropRect(srcWidth, srcHeight, aspect, maxEdge);

  const out = document.createElement("canvas");
  out.width = rect.width;
  out.height = rect.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh chụp.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    canvas,
    rect.sx,
    rect.sy,
    rect.sw,
    rect.sh,
    0,
    0,
    rect.width,
    rect.height,
  );
  if (includeHud) {
    const hudCanvas = document.createElement("canvas");
    if (renderGameHudToCanvas(hudCanvas)) {
      compositeHudOverFrame(ctx, hudCanvas, {
        srcRect: rect,
        gameCanvasWidth: srcWidth,
        gameCanvasHeight: srcHeight,
        outWidth: rect.width,
        outHeight: rect.height,
      });
    }
  }
  if (watermark && !includeHud) {
    drawCaptureWatermark(ctx, rect.width, rect.height, {
      areaTitle,
      landmarkTitle,
    });
  }

  const blob = await new Promise((resolve, reject) => {
    out.toBlob(
      (result) =>
        result
          ? resolve(result)
          : reject(new Error("Không xuất được file ảnh PNG.")),
      "image/png",
    );
  });

  return {
    kind: "image",
    blob,
    url: URL.createObjectURL(blob),
    mimeType: "image/png",
    filename: buildCaptureFilename("image", regionId, "image/png"),
    width: rect.width,
    height: rect.height,
    hasAudio: false,
    micIncluded: false,
    includeHud: Boolean(includeHud),
  };
}

export async function prepareRecordingAudio(audio) {
  const message = "Chưa thu được âm thanh game. Hãy chạm vào game để bật tiếng rồi thử quay lại.";
  if (!audio) throw new Error(message);
  try {
    if (!audio.enabled || audio.ctx?.state !== "running") await audio.setEnabled(true);
  } catch {
    throw new Error(message);
  }
  if (audio.ctx?.state !== "running") throw new Error(message);
  const source = audio.getCaptureAudioStream?.();
  const liveTracks = source?.getAudioTracks?.().filter(track=>track.readyState === "live") || [];
  if (!liveTracks.length) throw new Error(message);
  // Own a track per clip; stopping a recorder must not change the shared mixer.
  const tracks = liveTracks.map(track=>track.clone());
  for (const track of tracks) track.enabled = true;
  const previousKeepAlive = Boolean(audio.keepAliveInBackground);
  audio.setKeepAliveInBackground?.(true);
  let released = false;
  return {
    tracks,
    release() {
      if (released) return;
      released = true;
      for (const track of tracks) track.stop();
      audio.setKeepAliveInBackground?.(previousKeepAlive);
    },
  };
}

export async function startClipRecording({
  getCanvas,
  audio,
  aspect = "full",
  quality = "high",
  maxDurationSec = 30,
  regionId = "hue",
  getWatermarkMeta,
  watermark = true,
  includeHud = false,
  onTick,
  onFinish,
  onError,
}) {
  const capabilities = getCaptureCapabilities();
  if (!capabilities.canRecordVideo) {
    throw new Error(
      "Trình duyệt này chưa hỗ trợ quay video trực tiếp. Bạn có thể dùng Quay màn hình của máy và bật Chế độ Quay Sạch.",
    );
  }

  const initialCanvas = getCanvas?.();
  if (!initialCanvas) {
    throw new Error("Không tìm thấy khung hình 3D để quay.");
  }

  const preset = resolveVideoQuality(quality);

  // A failed audio unlock must not silently turn into a successful silent clip.
  const recordingAudio = await prepareRecordingAudio(audio);
  const audioTracks = recordingAudio.tracks;

  const srcWidth = initialCanvas.width || initialCanvas.clientWidth || 1280;
  const srcHeight = initialCanvas.height || initialCanvas.clientHeight || 720;
  // Keep the recording canvas alive even if WebGL replaces the game canvas.
  const useCompositor = true;
  const rect = computeCropRect(srcWidth, srcHeight, aspect, preset.maxEdge);

  let videoStream = null;
  let compositorCanvas = null;
  let compositorCtx = null;
  let hudCacheCanvas = includeHud ? document.createElement("canvas") : null;
  let lastHudPaintAt = 0;
  let lastFrameAt = 0;
  const frameIntervalMs = preset.fps <= 30 ? 31 : 0;
  let rafId = 0;
  let stopped = false;

  if (useCompositor) {
    compositorCanvas = document.createElement("canvas");
    compositorCanvas.width = rect.width;
    compositorCanvas.height = rect.height;
    compositorCtx = compositorCanvas.getContext("2d");
    compositorCtx.imageSmoothingEnabled = true;
    compositorCtx.imageSmoothingQuality = "high";
    const drawFrame = () => {
      if (stopped) return;
      const nowMs = performance.now();
      if (!frameIntervalMs || nowMs - lastFrameAt >= frameIntervalMs) {
        lastFrameAt = nowMs;
        const liveCanvas = getCanvas?.();
        if (liveCanvas && liveCanvas.width > 0 && liveCanvas.height > 0) {
          const liveRect = computeCropRect(
            liveCanvas.width,
            liveCanvas.height,
            aspect,
            preset.maxEdge,
          );
          compositorCtx.drawImage(
            liveCanvas,
            liveRect.sx,
            liveRect.sy,
            liveRect.sw,
            liveRect.sh,
            0,
            0,
            compositorCanvas.width,
            compositorCanvas.height,
          );
          if (includeHud && hudCacheCanvas) {
            if (nowMs - lastHudPaintAt >= 100) {
              renderGameHudToCanvas(hudCacheCanvas);
              lastHudPaintAt = nowMs;
            }
            compositeHudOverFrame(compositorCtx, hudCacheCanvas, {
              srcRect: liveRect,
              gameCanvasWidth: liveCanvas.width,
              gameCanvasHeight: liveCanvas.height,
              outWidth: compositorCanvas.width,
              outHeight: compositorCanvas.height,
            });
          }
          if (watermark && !includeHud) {
            drawCaptureWatermark(
              compositorCtx,
              compositorCanvas.width,
              compositorCanvas.height,
              getWatermarkMeta?.() || {},
            );
          }
        }
      }
      rafId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
    videoStream = compositorCanvas.captureStream(preset.fps);
  } else {
    videoStream = initialCanvas.captureStream(preset.fps);
  }

  const videoTracks = videoStream.getVideoTracks();
  if (!videoTracks.length) {
    recordingAudio.release();
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    throw new Error("Không khởi tạo được luồng hình ảnh để quay clip.");
  }

  const combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
  const preferredMime = pickRecorderMimeType();
  const videoBitsPerSecond =
    aspect === "9:16"
      ? Math.round(preset.videoBitsPerSecond * 0.85)
      : preset.videoBitsPerSecond;
  const recorderOptions = {};
  if (preferredMime) recorderOptions.mimeType = preferredMime;
  recorderOptions.videoBitsPerSecond = videoBitsPerSecond;
  if (audioTracks.length > 0) {
    recorderOptions.audioBitsPerSecond = preset.audioBitsPerSecond;
  }

  let recorder;
  try {
    recorder = new MediaRecorder(combinedStream, recorderOptions);
  } catch {
    try {
      recorder = preferredMime
        ? new MediaRecorder(combinedStream, { mimeType: preferredMime })
        : new MediaRecorder(combinedStream);
    } catch (error) {
      recordingAudio.release();
      for (const track of videoTracks) track.stop();
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      throw error;
    }
  }

  const chunks = [];
  const startedAt = performance.now();
  let tickTimer = null;
  let stopTimeout = null;
  let finished = false;

  const cleanupStreams = () => {
    stopped = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }
    window.removeEventListener("hue-webgl-lost", onContextLost);
    for (const track of audioTracks) track.removeEventListener("ended", onAudioEnded);
    recordingAudio.release();
    // Stop ONLY our video capture tracks; never stop shared CityAudio capture tracks.
    for (const track of videoTracks) {
      try {
        track.stop();
      } catch {}
    }
  };

  const finalize = () => {
    if (finished) return;
    finished = true;
    cleanupStreams();
    const actualMime =
      recorder.mimeType || preferredMime || "video/webm";
    const blob = new Blob(chunks, { type: actualMime });
    const durationSec = Math.max(
      1,
      Math.round((performance.now() - startedAt) / 1000),
    );
    if (!blob.size) {
      onError?.(new Error("Clip chưa thu được dữ liệu hình ảnh."));
      return;
    }
    onFinish?.({
      kind: "video",
      blob,
      url: URL.createObjectURL(blob),
      mimeType: actualMime,
      filename: buildCaptureFilename("video", regionId, actualMime),
      durationSec,
      width: rect.width,
      height: rect.height,
      fps: preset.fps,
      quality: preset.id,
      hasAudio: audioTracks.length > 0,
      micIncluded: false,
      includeHud: Boolean(includeHud),
    });
  };

  const stop = () => {
    if (finished) return;
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
        return;
      } catch {}
    }
    finalize();
  };

  const onContextLost = () => {
    // The game recovers/replaces its WebGL canvas. drawFrame reads getCanvas
    // each time, so keep this stable recording stream instead of ending early.
  };
  const onAudioEnded = () => {
    if (finished) return;
    finished = true;
    if (recorder.state !== "inactive") {
      try { recorder.stop(); } catch {}
    }
    cleanupStreams();
    onError?.(new Error("Luồng âm thanh bị gián đoạn. Hãy bật tiếng và quay lại clip."));
  };
  for (const track of audioTracks) track.addEventListener("ended", onAudioEnded);
  window.addEventListener("hue-webgl-lost", onContextLost);

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };
  recorder.onerror = () => {
    if (finished) return;
    finished = true;
    if (recorder.state !== "inactive") {
      try { recorder.stop(); } catch {}
    }
    cleanupStreams();
    onError?.(new Error("Quá trình ghi clip gặp gián đoạn trên thiết bị."));
  };
  recorder.onstop = finalize;

  try {
    recorder.start(1000);
  } catch (error) {
    finished = true;
    cleanupStreams();
    throw error;
  }
  onTick?.({ elapsedSec: 0, maxDurationSec });

  tickTimer = setInterval(() => {
    const elapsedSec = Math.floor((performance.now() - startedAt) / 1000);
    onTick?.({ elapsedSec: Math.min(elapsedSec, maxDurationSec), maxDurationSec });
  }, 250);

  stopTimeout = setTimeout(() => stop(), maxDurationSec * 1000);

  return {
    stop,
    hasAudio: audioTracks.length > 0,
    micIncluded: false,
    fps: preset.fps,
    quality: preset.id,
    mimeType: recorder.mimeType || preferredMime || "video/webm",
  };
}

export async function shareCapturedMedia({
  blob,
  filename,
  mimeType,
  title = "Cún con đi dạo Huế",
  text = "Cùng mình dạo quanh Huế bên sông Hương trong không gian 3D!",
  url = typeof window !== "undefined" ? window.location.href : "",
}) {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function"
  ) {
    return { status: "unsupported" };
  }

  if (blob && typeof File === "function") {
    const file = new File([blob], filename, { type: mimeType || blob.type });
    if (!navigator.canShare || navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return { status: "shared" };
      } catch (err) {
        if (err?.name === "AbortError") return { status: "cancelled" };
        // Fall through to link share only if file sharing rejected unexpectedly.
      }
    }
  }

  try {
    await navigator.share({ title, text, url });
    return { status: "shared-link-only" };
  } catch (err) {
    if (err?.name === "AbortError") return { status: "cancelled" };
    return { status: "unsupported" };
  }
}
