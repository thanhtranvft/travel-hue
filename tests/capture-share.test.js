import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildCaptureFilename,
  computeCropRect,
  extensionForMimeType,
  formatDuration,
  pickRecorderMimeType,
  prepareRecordingAudio,
  resolveVideoQuality,
  shareCapturedMedia,
  VIDEO_QUALITY_PRESETS,
} from "../src/core/capture/GameplayCapture.js";

test("recording resumes game audio, owns its track and restores background policy after each clip", async () => {
  let sourceStops=0,cloneStops=0;
  const source={readyState:"live",stop(){sourceStops++;},clone(){return {enabled:false,stop(){cloneStops++;}};}};
  const audio={enabled:true,ctx:{state:"suspended"},keepAliveInBackground:false,
    async setEnabled(){this.ctx.state="running";},
    getCaptureAudioStream(){return {getAudioTracks:()=>[source]};},
    setKeepAliveInBackground(value){this.keepAliveInBackground=value;}
  };
  for(let i=0;i<2;i++){
    const recording=await prepareRecordingAudio(audio);
    assert.equal(recording.tracks[0].enabled,true);
    assert.notEqual(recording.tracks[0],source);
    assert.equal(audio.keepAliveInBackground,true);
    recording.release();recording.release();
    assert.equal(audio.keepAliveInBackground,false);
  }
  assert.equal(cloneStops,2);assert.equal(sourceStops,0);
});

test("audio unlock failure or absent/ended track cannot silently export a video without sound", async () => {
  await assert.rejects(prepareRecordingAudio({enabled:true,ctx:{state:"suspended"},async setEnabled(){throw Error("blocked");}}),/âm thanh/);
  await assert.rejects(prepareRecordingAudio({enabled:true,ctx:{state:"running"},getCaptureAudioStream:()=>({getAudioTracks:()=>[]})}),/âm thanh/);
  await assert.rejects(prepareRecordingAudio({enabled:true,ctx:{state:"running"},getCaptureAudioStream:()=>({getAudioTracks:()=>[{readyState:"ended"}]})}),/âm thanh/);
});
import { CityAudio } from "../src/core/audio/CityAudio.js";
import {
  compositeHudOverFrame,
  parseBorderRadius,
  parseGradientColors,
} from "../src/core/capture/HudCompositor.js";

test("computeCropRect computes centered 9:16 portrait crop with even dimensions", () => {
  const rect = computeCropRect(1920, 1080, "9:16", 1280);
  assert.equal(rect.sy, 0);
  assert.equal(rect.sh, 1080);
  assert.ok(rect.sw < 1920 && rect.sx > 0);
  assert.equal(rect.width % 2, 0);
  assert.equal(rect.height % 2, 0);
  assert.ok(Math.abs(rect.width / rect.height - 9 / 16) < 0.02);
});

test("computeCropRect preserves full aspect ratio and respects maxEdge", () => {
  const rect = computeCropRect(2560, 1440, "full", 1280);
  assert.equal(rect.sx, 0);
  assert.equal(rect.sy, 0);
  assert.equal(rect.width, 1280);
  assert.equal(rect.height, 720);
});

test("pickRecorderMimeType selects most compatible supported video+audio container", () => {
  const mp4 = pickRecorderMimeType((t) => t === "video/mp4;codecs=h264,aac");
  assert.equal(mp4, "video/mp4;codecs=h264,aac");
  assert.equal(extensionForMimeType(mp4), "mp4");

  const webm = pickRecorderMimeType((t) => t === "video/webm;codecs=vp9,opus");
  assert.equal(webm, "video/webm;codecs=vp9,opus");
  assert.equal(extensionForMimeType(webm), "webm");

  assert.equal(pickRecorderMimeType(() => false), "");
});

test("VIDEO_QUALITY_PRESETS and resolveVideoQuality configure crisp bitrates, 60fps high/ultra, and safe defaults", () => {
  assert.equal(VIDEO_QUALITY_PRESETS.standard.fps, 30);
  assert.equal(VIDEO_QUALITY_PRESETS.high.fps, 60);
  assert.equal(VIDEO_QUALITY_PRESETS.high.maxEdge, 1920);
  assert.ok(VIDEO_QUALITY_PRESETS.high.videoBitsPerSecond >= 8_000_000);
  assert.ok(
    VIDEO_QUALITY_PRESETS.ultra.videoBitsPerSecond >
      VIDEO_QUALITY_PRESETS.high.videoBitsPerSecond,
  );
  assert.equal(resolveVideoQuality("unknown").id, "high");
  assert.equal(
    resolveVideoQuality({ id: "ultra", fps: 60, videoBitsPerSecond: 20_000_000 })
      .videoBitsPerSecond,
    20_000_000,
  );
});

test("buildCaptureFilename and formatDuration format social export names cleanly", () => {
  const dt = new Date(2026, 10, 26, 9, 5, 7);
  assert.equal(
    buildCaptureFilename("image", "quoc-hoc", "image/png", dt),
    "cun-con-hue-quoc-hoc-20261126-090507.png",
  );
  assert.equal(
    buildCaptureFilename("video", "truong-tien", "video/mp4;codecs=h264,aac", dt),
    "cun-con-hue-truong-tien-20261126-090507.mp4",
  );
  assert.equal(formatDuration(75), "01:15");
});

test("CityAudio.getCaptureAudioStream taps meter output without requesting microphone", () => {
  const connected = [];
  const disconnected = [];
  let trackState = "live";
  let destCount = 0;

  const mockStream = () => ({
    getAudioTracks: () => [{ readyState: trackState }],
  });

  const audio = Object.create(CityAudio.prototype);
  audio.meter = {
    connect(node) {
      connected.push(node);
    },
    disconnect(node) {
      disconnected.push(node);
    },
  };
  audio.ctx = {
    createMediaStreamDestination() {
      destCount += 1;
      return { id: destCount, stream: mockStream() };
    },
  };
  audio.captureDestination = null;

  const stream1 = audio.getCaptureAudioStream();
  assert.ok(stream1);
  assert.equal(destCount, 1);
  assert.equal(connected.length, 1);

  // Reuses existing live destination
  const stream2 = audio.getCaptureAudioStream();
  assert.equal(stream2, stream1);
  assert.equal(destCount, 1);

  // Recreates cleanly if previous track ended
  trackState = "ended";
  const stream3 = audio.getCaptureAudioStream();
  assert.notEqual(stream3, stream1);
  assert.equal(destCount, 2);
  assert.equal(disconnected.length, 1);
});

test("CityAudio.setKeepAliveInBackground toggles background keep-alive and resumes suspended context", () => {
  let resumed = 0;
  const audio = Object.create(CityAudio.prototype);
  audio.enabled = true;
  audio.keepAliveInBackground = false;
  audio.ctx = {
    state: "suspended",
    resume() {
      resumed += 1;
      return Promise.resolve();
    },
  };

  assert.equal(audio.setKeepAliveInBackground(true), true);
  assert.equal(audio.keepAliveInBackground, true);
  assert.equal(resumed, 1);
  assert.equal(audio.setKeepAliveInBackground(false), false);
});

test("capture modules never invoke microphone getUserMedia API", async () => {
  const [captureSrc, hudSrc, uiSrc, audioSrc] = await Promise.all([
    readFile("src/core/capture/GameplayCapture.js", "utf8"),
    readFile("src/core/capture/HudCompositor.js", "utf8"),
    readFile("src/ui/CaptureShareUI.js", "utf8"),
    readFile("src/core/audio/CityAudio.js", "utf8"),
  ]);
  for (const src of [captureSrc, hudSrc, uiSrc, audioSrc]) {
    assert.equal(/\bmediaDevices\b/.test(src), false);
    assert.equal(/\bgetUserMedia\s*\(/.test(src), false);
    assert.equal(/\benumerateDevices\s*\(/.test(src), false);
  }
});

test("HudCompositor helpers parse border radius, gradients, and composite cropped HUD frames", () => {
  assert.equal(parseBorderRadius("16px", 100, 40), 16);
  assert.equal(parseBorderRadius("999px", 100, 40), 20);
  assert.deepEqual(
    parseGradientColors("linear-gradient(90deg, #f9b657, #ee725e)"),
    ["#f9b657", "#ee725e"],
  );
  assert.equal(parseGradientColors("none"), null);

  let drawn = null;
  const mockOutCtx = {
    drawImage(...args) {
      drawn = args;
    },
  };
  const ok = compositeHudOverFrame(
    mockOutCtx,
    { width: 1280, height: 720 },
    {
      srcRect: { sx: 320, sy: 0, sw: 640, sh: 720 },
      gameCanvasWidth: 1280,
      gameCanvasHeight: 720,
      outWidth: 540,
      outHeight: 960,
    },
  );
  assert.equal(ok, true);
  assert.deepEqual(drawn, [
    { width: 1280, height: 720 },
    320,
    0,
    640,
    720,
    0,
    0,
    540,
    960,
  ]);
});

test("shareCapturedMedia handles unsupported browser environments gracefully", async () => {
  const res = await shareCapturedMedia({
    title: "Test",
    text: "Hue",
    url: "https://example.com",
  });
  assert.equal(res.status, "unsupported");
});
