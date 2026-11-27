import { restaurantZones } from "../world/streetVenues.js";
import { nearestAudibleSource, proximityGain, sourcePan } from "./spatial.js";
import {
  backgroundMelody,
  restaurantMelody,
  countrysideFishingMelody,
  countrysideFishingBass,
  pluck,
  flute,
  frequency,
} from "./music.js";
import { musicTracks, defaultMusicTrack } from "../../app/catalog.js";
import { CollisionVoice } from "./CollisionVoice.js";

export class CityAudio {
  constructor() {
    this.enabled = true;
    this.musicEnabled = true;
    this.volume = 0.45;
    this.ctx = null;
    this.step = 0;
    this.track = defaultMusicTrack;
    this.tracks = musicTracks;
    this.nearbyVenue = null;
    this.lastPedal = 0;
    this.collisionsPlayed = 0;
    this.caHueBoats = [];
    this.activeCaHueBoat = null;
    this.caHueLevel = 0;
    this.caHueStep = 0;
    this.caHueLastSongId = null;
    this.caHueAudioOverrides = new Map();
    this.caHueMediaEl = null;
    this.caHueMediaGain = null;
    this.caHueMediaSrc = null;
    this.caHueFadeTimer = null;
    this.fishingMode = false;
    this.fishingStep = 0;
    this.fishingStepSeconds = 0.54;
    this.nextFishingNote = 0;
    this.dragonCruiseMode = false;
    this.dragonCruiseSource = null;
    this.captureDestination = null;
    this.keepAliveInBackground = false;
    this.onStatus = () => {};
    this.onStateChange = () => {};
    document.addEventListener?.("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden && !this.keepAliveInBackground) {
        this.ctx.suspend().catch(() => {});
      } else if (this.enabled) {
        this.ctx
          .resume()
          .then(() => {
            this.onStatus("");
            this.onStateChange?.();
          })
          .catch(() => this.onStatus("Chạm màn hình để phát tiếp âm thanh."));
      }
    });
    globalThis.addEventListener?.("pagehide", () => this.ctx?.suspend().catch(() => {}));
  }
  initialize() {
    if (this.ctx) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio không được hỗ trợ");
    this.ctx = new Context();
    const ctx = this.ctx;
    ctx.addEventListener?.("statechange", () => this.onStateChange?.());
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -15;
    compressor.ratio.value = 5;
    this.meter = ctx.createAnalyser();
    this.meter.fftSize = 256;
    this.master
      .connect(compressor)
      .connect(this.meter)
      .connect(ctx.destination);
    this.collisionVoice = new CollisionVoice(ctx, this.master, (text) =>
      this.onStatus(text),
    );
    this.scheduleCollisionPreload();
    const bus = () => {
      const gain = ctx.createGain();
      gain.connect(this.master);
      return gain;
    };
    this.background = bus();
    this.background.gain.value = this.musicEnabled
      ? this.fishingMode
        ? 0.04
        : 0.65
      : 0;
    this.venue = ctx.createGain();
    this.venue.gain.value = 0;
    this.venuePan = ctx.createStereoPanner();
    this.venue.connect(this.venuePan).connect(this.master);
    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.enginePan = ctx.createStereoPanner();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 210;
    this.engine = ctx.createOscillator();
    this.engine.type = "sawtooth";
    this.engine.frequency.value = 55;
    this.engine
      .connect(filter)
      .connect(this.engineGain)
      .connect(this.enginePan)
      .connect(this.master);
    this.engine.start();
    this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let seed = 42;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = (seed / 4294967296) * 2 - 1;
    }
    const rolling = ctx.createBufferSource();
    rolling.buffer = this.noiseBuffer;
    rolling.loop = true;
    const wheelFilter = ctx.createBiquadFilter();
    wheelFilter.type = "bandpass";
    wheelFilter.frequency.value = 650;
    wheelFilter.Q.value = 0.6;
    this.wheelGain = ctx.createGain();
    this.wheelGain.gain.value = 0;
    rolling.connect(wheelFilter).connect(this.wheelGain).connect(this.master);
    rolling.start();

    // Spatial echoing Ca Huế river boat bus over the Perfume River
    this.caHueBus = ctx.createGain();
    this.caHueBus.gain.value = 0;
    this.caHueLowpass = ctx.createBiquadFilter();
    this.caHueLowpass.type = "lowpass";
    this.caHueLowpass.frequency.value = 3200;
    this.caHuePan = ctx.createStereoPanner();
    this.caHueEchoDelay = ctx.createDelay(1.0);
    this.caHueEchoDelay.delayTime.value = 0.34;
    this.caHueEchoFilter = ctx.createBiquadFilter();
    this.caHueEchoFilter.type = "lowpass";
    this.caHueEchoFilter.frequency.value = 1650;
    this.caHueEchoFeedback = ctx.createGain();
    this.caHueEchoFeedback.gain.value = 0.32;
    const caHueEchoWet = ctx.createGain();
    caHueEchoWet.gain.value = 0.45;
    this.caHueBus.connect(this.caHueLowpass);
    this.caHueLowpass.connect(this.caHuePan);
    this.caHueLowpass.connect(this.caHueEchoDelay);
    this.caHueEchoDelay.connect(this.caHueEchoFilter);
    this.caHueEchoFilter.connect(this.caHueEchoFeedback).connect(this.caHueEchoDelay);
    this.caHueEchoFilter.connect(caHueEchoWet).connect(this.caHuePan);
    this.caHuePan.connect(this.master);

    this.fishingBus = bus();
    this.fishingBus.gain.value = 0;
    this.timer = setInterval(() => this.schedule(), 100);
    this.nextNote = ctx.currentTime + 0.08;
    this.nextCaHueNote = ctx.currentTime + 0.1;
    this.nextFishingNote = ctx.currentTime + 0.08;
  }
  registerCaHueAudioUrl(songId, url) {
    if (!songId) return;
    if (url) this.caHueAudioOverrides.set(songId, url);
    else this.caHueAudioOverrides.delete(songId);
  }
  stopCaHueMedia(immediate = false) {
    // A previous fade may still own a detached media element. Finish it before
    // switching boats so cancelling its timer cannot leave a second song alive.
    this.caHueFadeCleanup?.();
    this.caHueFadeCleanup = null;
    const oldEl = this.caHueMediaEl;
    const oldGain = this.caHueMediaGain;
    const oldSrc = this.caHueMediaSrc;
    this.caHueMediaEl = null;
    this.caHueMediaGain = null;
    this.caHueMediaSrc = null;
    this.caHueLastSongId = null;
    if (this.caHueFadeTimer) {
      clearTimeout(this.caHueFadeTimer);
      this.caHueFadeTimer = null;
    }
    if (!oldEl) return;
    const cleanup = () => {
      try {
        oldEl.pause();
        oldEl.removeAttribute?.("src");
        oldEl.load?.();
      } catch {}
      try {
        oldSrc?.disconnect?.();
        oldGain?.disconnect?.();
      } catch {}
    };
    if (!immediate && this.ctx && oldGain?.gain?.linearRampToValueAtTime) {
      const now = this.ctx.currentTime;
      try {
        oldGain.gain.cancelScheduledValues?.(now);
        oldGain.gain.setValueAtTime?.(oldGain.gain.value ?? 1, now);
        oldGain.gain.linearRampToValueAtTime(0.0001, now + 0.9);
      } catch {}
      this.caHueFadeTimer = setTimeout(() => {
        this.caHueFadeTimer = null;
        this.caHueFadeCleanup = null;
        cleanup();
      }, 950);
      this.caHueFadeCleanup = cleanup;
    } else {
      cleanup();
    }
  }
  playCaHueHornNote(ctx, output, midi, time, volume = 0.13, duration = 0.72) {
    const hz = frequency(midi);
    const body = ctx.createOscillator();
    const fifth = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoDepth = ctx.createGain();
    const formant = ctx.createBiquadFilter();
    const env = ctx.createGain();

    body.type = "sawtooth";
    body.frequency.setValueAtTime(hz, time);
    fifth.type = "triangle";
    fifth.frequency.setValueAtTime(hz * 0.5, time);

    vibrato.frequency.value = 5.1;
    vibratoDepth.gain.value = 14;
    vibrato.connect(vibratoDepth).connect(body.detune);

    formant.type = "bandpass";
    formant.frequency.setValueAtTime(Math.min(1800, Math.max(520, hz * 2.1)), time);
    formant.Q.value = 1.4;

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(volume, time + 0.09);
    env.gain.setValueAtTime(volume * 0.8, time + duration * 0.58);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.45;
    body.connect(formant).connect(env);
    fifth.connect(fifthGain).connect(env);
    env.connect(output);

    body.start(time);
    fifth.start(time);
    vibrato.start(time);
    const stopAt = time + duration + 0.04;
    body.stop(stopAt);
    fifth.stop(stopAt);
    vibrato.stop(stopAt);
    body.onended = () => {
      body.disconnect();
      fifth.disconnect();
      fifthGain.disconnect();
      vibrato.disconnect();
      vibratoDepth.disconnect();
      formant.disconnect();
      env.disconnect();
    };
  }
  scheduleCollisionPreload() {
    if (typeof requestIdleCallback === "function") {
      this.preloadIdleId = requestIdleCallback(
        () => {
          this.preloadIdleId = null;
          if (this.ctx) void this.collisionVoice?.preload();
        },
        { timeout: 3000 },
      );
    } else {
      this.preloadTimerId = setTimeout(() => {
        this.preloadTimerId = null;
        if (this.ctx) void this.collisionVoice?.preload();
      }, 2500);
    }
  }
  async setEnabled(enabled) {
    if (enabled) {
      this.enabled = true;
      this.initialize();
      await this.ctx.resume();
      if (this.ctx.state !== "running") {
        this.onStateChange?.();
        throw new Error("Audio đang bị tạm dừng");
      }
      this.nextNote = this.ctx.currentTime + 0.08;
      this.nextFishingNote = this.ctx.currentTime + 0.08;
      this.onStatus("");
      this.onStateChange?.();
      this.schedule();
    } else {
      this.enabled = false;
      this.stopCaHueMedia(true);
      this.collisionVoice?.stop();
      if (this.ctx) await this.ctx.suspend();
      this.onStateChange?.();
    }
    return this.enabled;
  }
  async tryUnlock() {
    if (!this.enabled) return false;
    if (this.ctx?.state === "running") {
      this.onStatus("");
      this.onStateChange?.();
      return true;
    }
    try {
      await this.setEnabled(true);
      return true;
    } catch {
      this.onStateChange?.();
      return false;
    }
  }
  setKeepAliveInBackground(enabled) {
    this.keepAliveInBackground = Boolean(enabled);
    if (
      this.keepAliveInBackground &&
      this.enabled &&
      this.ctx?.state === "suspended"
    ) {
      this.ctx.resume().catch(() => {});
    }
    return this.keepAliveInBackground;
  }
  getCaptureAudioStream() {
    if (
      !this.ctx ||
      !this.meter ||
      typeof this.ctx.createMediaStreamDestination !== "function"
    ) {
      return null;
    }
    const existingTracks = this.captureDestination?.stream?.getAudioTracks?.() || [];
    const hasEndedTrack = existingTracks.some((t) => t.readyState === "ended");
    if (!this.captureDestination || hasEndedTrack) {
      if (this.captureDestination) {
        try {
          this.meter.disconnect(this.captureDestination);
        } catch {}
      }
      this.captureDestination = this.ctx.createMediaStreamDestination();
      this.meter.connect(this.captureDestination);
    }
    return this.captureDestination.stream || null;
  }
  setMusicEnabled(enabled) {
    this.musicEnabled = !!enabled;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.background.gain.setTargetAtTime(
        this.dragonCruiseMode ? 0 : enabled ? (this.fishingMode ? 0.04 : 0.65) : 0,
        now,
        0.05,
      );
      if (this.fishingBus) {
        this.fishingBus.gain.setTargetAtTime(
          !this.dragonCruiseMode && enabled && this.fishingMode ? 0.78 : 0,
          now,
          0.08,
        );
      }
      if (!enabled) this.venue.gain.setTargetAtTime(0, now, 0.05);
      if (!enabled && !this.dragonCruiseMode) {
        this.stopCaHueMedia(false);
      }
      this.nextNote = now + 0.08;
      this.nextFishingNote = now + 0.08;
    }
    return this.musicEnabled;
  }
  setDragonCruiseMode(enabled, cruiseSource = null) {
    const next = Boolean(enabled && cruiseSource?.song);
    const prevSongId = this.dragonCruiseSource?.song?.id || null;
    const nextSongId = next ? cruiseSource.song.id : null;
    const changed = this.dragonCruiseMode !== next || prevSongId !== nextSongId;
    this.dragonCruiseMode = next;
    this.dragonCruiseSource = next ? cruiseSource : null;
    if (next) {
      this.activeCaHueBoat = cruiseSource;
      this.caHueLevel = 1;
      if (changed) {
        this.stopCaHueMedia(true);
        this.caHueLastSongId = null;
      }
    } else if (changed) {
      this.activeCaHueBoat = null;
      this.caHueLevel = 0;
      this.stopCaHueMedia(true);
      this.caHueLastSongId = null;
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.background?.gain?.setTargetAtTime(
        !this.musicEnabled || next ? 0 : this.fishingMode ? 0.04 : 0.65,
        now,
        0.18,
      );
      this.venue?.gain?.setTargetAtTime(0, now, 0.15);
      this.fishingBus?.gain?.setTargetAtTime(
        this.musicEnabled && this.fishingMode && !next ? 0.78 : 0,
        now,
        0.18,
      );
      if (this.caHueBus) {
        this.caHueBus.gain.setTargetAtTime(next ? 0.86 : 0, now, 0.18);
        if (next && this.caHueLowpass && this.caHuePan) {
          this.caHueLowpass.frequency.setTargetAtTime(6800, now, 0.15);
          this.caHuePan.pan.setTargetAtTime(0, now, 0.12);
        }
      }
    }
    if (next && this.enabled && this.ctx?.state === "running") {
      this.schedule();
    }
    return this.dragonCruiseMode;
  }
  setFishingMode(enabled) {
    const next = Boolean(enabled);
    if (this.fishingMode === next) return this.fishingMode;
    this.fishingMode = next;
    if (next) this.fishingStep = 0;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.nextFishingNote = now + 0.06;
      this.background.gain.setTargetAtTime(
        !this.musicEnabled || this.dragonCruiseMode ? 0 : next ? 0.04 : 0.65,
        now,
        0.25,
      );
      if (this.fishingBus) {
        this.fishingBus.gain.setTargetAtTime(
          this.musicEnabled && next && !this.dragonCruiseMode ? 0.78 : 0,
          now,
          0.28,
        );
      }
    }
    return this.fishingMode;
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.ctx)
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
  }
  setTrack(id) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return false;
    this.track = track;
    this.step = 0;
    if (this.ctx) {
      const now = this.ctx.currentTime,
        old = this.background;
      old.gain.cancelScheduledValues(now);
      old.gain.setTargetAtTime(0, now, 0.035);
      this.background = this.ctx.createGain();
      this.background.gain.value =
        this.musicEnabled && !this.dragonCruiseMode
          ? this.fishingMode
            ? 0.04
            : 0.65
          : 0;
      this.background.connect(this.master);
      setTimeout(() => old.disconnect(), 3500);
      this.nextNote = now + 0.08;
    }
    return true;
  }
  schedule() {
    if (
      !this.enabled ||
      !this.ctx ||
      this.ctx.state !== "running" ||
      (document.hidden && !this.keepAliveInBackground)
    )
      return;
    const ctx = this.ctx,
      now = ctx.currentTime;
    if (this.musicEnabled && !this.dragonCruiseMode && this.track) {
      if (this.nextNote < now - 0.25) this.nextNote = now + 0.05;
    for (let count = 0; this.nextNote < now + 0.25 && count < 4; count++) {
      const index = this.step % this.track.melody.length,
        note = this.track.melody[index],
        time = this.nextNote;
      if (note !== null) {
        pluck(ctx, this.background, note, time, 0.12, 2.2);
        if (index % 4 === 0)
          flute(ctx, this.background, note + 12, time + 0.08, 0.045, 1.8);
      }
      if (index % 8 === 0)
        pluck(
          ctx,
          this.background,
          this.track.bass[index < 16 ? 0 : 1],
          time,
          0.08,
          3.3,
        );
      const localNote = restaurantMelody[this.step % restaurantMelody.length];
      if (localNote !== null && this.nearbyVenue) {
        pluck(ctx, this.venue, localNote, time, 0.22, 1.1);
        if (index % 4 === 0)
          flute(ctx, this.venue, localNote, time + 0.06, 0.06, 1.3);
      }
      this.step++;
      this.nextNote += this.track.stepSeconds;
    }
    }

    if (this.musicEnabled && !this.dragonCruiseMode && this.fishingMode && this.fishingBus) {
      if (this.nextFishingNote < now - 0.35) this.nextFishingNote = now + 0.05;
      for (let count = 0; this.nextFishingNote < now + 0.25 && count < 4; count++) {
        const idx = this.fishingStep % countrysideFishingMelody.length;
        const note = countrysideFishingMelody[idx];
        const t = this.nextFishingNote;
        if (note !== null) {
          pluck(ctx, this.fishingBus, note, t, 0.13, 2.5);
          if (idx % 2 === 0) {
            flute(ctx, this.fishingBus, note + 12, t + 0.06, 0.058, 1.9);
          }
        }
        if (idx % 8 === 0) {
          const bassNote =
            countrysideFishingBass[Math.floor(idx / 8) % countrysideFishingBass.length];
          pluck(ctx, this.fishingBus, bassNote, t, 0.09, 3.6);
        }
        this.fishingStep++;
        this.nextFishingNote += this.fishingStepSeconds;
      }
    }

    const boatSong = this.activeCaHueBoat?.song;
    if ((this.musicEnabled || this.dragonCruiseMode) && boatSong && this.caHueLevel > 0.015) {
      const overrideUrl =
        boatSong.audioUrl || this.caHueAudioOverrides.get(boatSong.id);
      if (boatSong.id !== this.caHueLastSongId) {
        this.stopCaHueMedia(true);
        this.caHueLastSongId = boatSong.id;
        this.caHueStep = 0;
        this.nextCaHueNote = now + 0.05;
        if (overrideUrl && typeof Audio !== "undefined") {
          try {
            const el = new Audio(overrideUrl);
            el.loop = true;
            el.preload = "auto";
            el.crossOrigin = "anonymous";
            const src = ctx.createMediaElementSource(el);
            const mediaGain = ctx.createGain();
            if (mediaGain.gain?.setValueAtTime) {
              mediaGain.gain.setValueAtTime(0.0001, now);
              mediaGain.gain.linearRampToValueAtTime?.(1.0, now + 0.6);
            } else {
              mediaGain.gain.value = 1.0;
            }
            src.connect(mediaGain).connect(this.caHueBus);
            this.caHueMediaEl = el;
            this.caHueMediaGain = mediaGain;
            this.caHueMediaSrc = src;
            const playRes = el.play();
            if (playRes && typeof playRes.catch === "function") {
              playRes.catch(() => {
                if (this.caHueMediaEl === el) {
                  this.stopCaHueMedia(true);
                }
              });
            }
          } catch {}
        }
      }
      if (!overrideUrl && boatSong.notes?.length) {
        if (this.nextCaHueNote < now - 0.35) this.nextCaHueNote = now + 0.05;
        for (let c = 0; this.nextCaHueNote < now + 0.28 && c < 4; c++) {
          const note = boatSong.notes[this.caHueStep % boatSong.notes.length];
          const tempo = boatSong.tempo || 0.78;
          if (note !== null && note !== undefined) {
            this.playCaHueHornNote(
              ctx,
              this.caHueBus,
              note,
              this.nextCaHueNote,
              0.14,
              tempo * 0.94,
            );
          }
          this.caHueStep++;
          this.nextCaHueNote += tempo;
        }
      }
    } else if (this.caHueMediaEl || this.caHueLastSongId) {
      this.stopCaHueMedia(false);
    }
  }
  update(bike, actors, cameraHeading, caHueBoats = this.caHueBoats) {
    let nearby = null;
    let caHueHit = null;
    if (this.dragonCruiseMode && this.dragonCruiseSource?.song) {
      // Exclusive onboard Hò Đối Đáp audio: never query/load other river boats
      this.nearbyVenue = null;
      this.venueLevel = 0;
      this.activeCaHueBoat = this.dragonCruiseSource;
      this.caHueLevel = 1;
    } else {
      nearby = nearestAudibleSource(
        bike.position,
        this.venues || restaurantZones,
        25,
      );
      this.nearbyVenue = nearby?.source || null;
      this.venueLevel = nearby?.gain || 0;
      const caHueSources = Array.isArray(caHueBoats) ? caHueBoats : [];
      caHueHit = nearestAudibleSource(bike.position, caHueSources, 230);
      this.activeCaHueBoat = caHueHit?.source || null;
      this.caHueLevel = caHueHit?.gain || 0;
    }
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const ctx = this.ctx,
      t = ctx.currentTime,
      speed = Math.abs(bike.motion.speed);
    this.background.gain.setTargetAtTime(
      !this.musicEnabled || !this.track || this.dragonCruiseMode
        ? 0
        : this.fishingMode
          ? 0.04
          : Math.max(
              0.14,
              0.65 - this.venueLevel * 0.4 - this.caHueLevel * 0.34,
            ),
      t,
      0.5,
    );
    if (this.fishingBus) {
      this.fishingBus.gain.setTargetAtTime(
        this.musicEnabled && this.fishingMode && !this.dragonCruiseMode
          ? Math.max(0.28, 0.78 - this.caHueLevel * 0.44)
          : 0,
        t,
        0.35,
      );
    }
    this.venue.gain.setTargetAtTime(
      !this.musicEnabled || this.dragonCruiseMode ? 0 : this.venueLevel * 0.9,
      t,
      0.45,
    );
    this.venuePan.pan.setTargetAtTime(
      nearby
        ? sourcePan(
            nearby.source.x - bike.position.x,
            nearby.source.z - bike.position.z,
            cameraHeading,
          )
        : 0,
      t,
      0.2,
    );
    if (this.caHueBus) {
      const riverGain = this.dragonCruiseMode
        ? 0.86
        : !this.musicEnabled || this.caHueLevel <= 0
          ? 0
          : Math.min(0.75, Math.pow(this.caHueLevel, 0.72) * 0.72);
      this.caHueBus.gain.setTargetAtTime(riverGain, t, 0.35);
      this.caHueLowpass.frequency.setTargetAtTime(
        this.dragonCruiseMode ? 6800 : 850 + this.caHueLevel * 4400,
        t,
        0.35,
      );
      this.caHuePan.pan.setTargetAtTime(
        this.dragonCruiseMode
          ? 0
          : caHueHit
            ? sourcePan(
                caHueHit.source.x - bike.position.x,
                caHueHit.source.z - bike.position.z,
                cameraHeading,
              )
            : 0,
        t,
        0.2,
      );
    }
    this.wheelGain.gain.setTargetAtTime(
      Math.min(0.045, speed * 0.005),
      t,
      0.12,
    );
    if (
      speed > 0.25 &&
      t - this.lastPedal > Math.max(0.09, 0.4 / (1 + speed * 0.3))
    ) {
      this.noiseBurst(t, 0.035, 0.018, 1800);
      this.lastPedal = t;
    }
    let nearest = null,
      distance = 32;
    for (const actor of actors) {
      if (actor.type === "pedestrian") continue;
      const d = Math.hypot(
        actor.mesh.position.x - bike.position.x,
        actor.mesh.position.z - bike.position.z,
      );
      if (d < distance) {
        distance = d;
        nearest = actor;
      }
    }
    this.engineGain.gain.setTargetAtTime(
      nearest
        ? proximityGain(distance, 32) *
            (nearest.type === "scooter" ? 0.025 : 0.045)
        : 0,
      t,
      0.18,
    );
    if (nearest) {
      this.engine.frequency.setTargetAtTime(
        (nearest.type === "scooter" ? 95 : 43) + nearest.speed * 5,
        t,
        0.15,
      );
      this.enginePan.pan.setTargetAtTime(
        sourcePan(
          nearest.mesh.position.x - bike.position.x,
          nearest.mesh.position.z - bike.position.z,
          cameraHeading,
        ),
        t,
        0.15,
      );
    }
  }
  noiseBurst(time, duration, volume, cutoff) {
    const ctx = this.ctx,
      source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(time);
    source.stop(time + duration + 0.01);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
  speakCollision(type) {
    if (!this.enabled || this.ctx?.state !== "running") return false;
    this.lastCollisionVoiceAt = this.ctx.currentTime;
    return this.collisionVoice.play(type);
  }
  speakPatrolWarning() {
    if (
      !this.enabled ||
      this.ctx?.state !== "running" ||
      (typeof document !== "undefined" &&
        document.hidden &&
        !this.keepAliveInBackground)
    )
      return false;
    const now = this.ctx.currentTime;
    if (
      this.collisionVoice.active ||
      now - (this.lastCollisionVoiceAt ?? -Infinity) < 4 ||
      now - (this.lastPatrolVoiceAt ?? -Infinity) < 12
    )
      return false;
    this.lastPatrolVoiceAt = now;
    return this.collisionVoice.play("police");
  }
  speakVendorCall(type) {
    if (
      !this.enabled ||
      this.ctx?.state !== "running" ||
      (typeof document !== "undefined" &&
        document.hidden &&
        !this.keepAliveInBackground)
    )
      return false;
    const now = this.ctx.currentTime;
    if (
      this.collisionVoice.active ||
      now - (this.lastCollisionVoiceAt ?? -Infinity) < 2.5
    )
      return false;
    this.lastVendorVoiceAt = now;
    return this.collisionVoice.play(type);
  }
  collision() {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const t = this.ctx.currentTime;
    this.collisionsPlayed++;
    this.noiseBurst(t, 0.35, 0.35, 1800);
    pluck(this.ctx, this.master, 43, t, 0.2, 0.35);
    pluck(this.ctx, this.master, 91, t + 0.025, 0.09, 0.45);
  }
  playCharmPickup(percent = 10) {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const notes =
      percent >= 100
        ? [79, 83, 86, 91]
        : percent >= 30
          ? [76, 83, 88]
          : percent >= 20
            ? [74, 81]
            : [72, 76];
    notes.forEach((midi, idx) => {
      pluck(ctx, this.master, midi, t + idx * 0.055, 0.16, 0.42);
    });
  }
  playSpeedBoost(percent = 10) {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const intensity = percent >= 100 ? 1 : percent >= 30 ? 0.72 : percent >= 20 ? 0.55 : 0.42;
    const duration = percent >= 100 ? 0.7 : 0.48;

    // 1. Filtered wind-rush whoosh
    if (this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.1;
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(1600 + intensity * 1200, t + duration * 0.65);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.16 * intensity + 0.06, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      src.connect(filter).connect(gain).connect(this.master);
      src.start(t);
      src.stop(t + duration + 0.02);
      src.onended = () => {
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    }

    // 2. Ascending turbo synth sweep
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = percent >= 100 ? "sawtooth" : "triangle";
    const startHz = 210 + intensity * 60;
    const endHz = 520 + intensity * 460;
    osc.frequency.setValueAtTime(startHz, t);
    osc.frequency.exponentialRampToValueAtTime(endHz, t + duration * 0.85);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1400, t);
    lp.frequency.exponentialRampToValueAtTime(3200, t + duration * 0.8);
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.13 + intensity * 0.07, t + 0.05);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(lp).connect(oscGain).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      lp.disconnect();
      oscGain.disconnect();
    };

    // 3. Bright power-up chord accent
    pluck(ctx, this.master, percent >= 100 ? 84 : 79, t + 0.03, 0.14, 0.5);
    if (percent >= 30) {
      flute(ctx, this.master, percent >= 100 ? 91 : 86, t + 0.07, 0.11, 0.55);
    }
  }
  playChurchBell({ pan = 0, gainScale = 1 } = {}) {
    if (
      !this.enabled ||
      !this.ctx ||
      this.ctx.state !== "running" ||
      (typeof document !== "undefined" &&
        document.hidden &&
        !this.keepAliveInBackground)
    )
      return false;

    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.03;
    this.churchBellsPlayed = (this.churchBellsPlayed || 0) + 1;

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t0);
    panner.connect(this.master);

    // Classic cathedral bronze bell phrase (3 resonant tolls: G3 -> C4 -> G3)
    const strikes = [
      { offset: 0.0, fundamental: 196.0, gain: 0.24 * gainScale, decay: 3.8 },
      { offset: 1.65, fundamental: 261.63, gain: 0.21 * gainScale, decay: 3.6 },
      { offset: 3.3, fundamental: 196.0, gain: 0.26 * gainScale, decay: 4.5 },
    ];
    // Authentic minor-third bell inharmonic overtone ratios
    const partials = [
      { ratio: 0.5, weight: 0.55, decayMul: 1.15 },
      { ratio: 1.0, weight: 1.0, decayMul: 1.0 },
      { ratio: 1.189, weight: 0.65, decayMul: 0.85 },
      { ratio: 1.5, weight: 0.48, decayMul: 0.72 },
      { ratio: 2.0, weight: 0.52, decayMul: 0.62 },
      { ratio: 2.51, weight: 0.24, decayMul: 0.45 },
      { ratio: 3.01, weight: 0.2, decayMul: 0.36 },
    ];

    for (const strike of strikes) {
      const st = t0 + strike.offset;
      for (const p of partials) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(strike.fundamental * p.ratio, st);
        const peak = Math.max(0.0005, strike.gain * p.weight * 0.32);
        const dur = strike.decay * p.decayMul;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.linearRampToValueAtTime(peak, st + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
        osc.connect(g).connect(panner);
        osc.start(st);
        osc.stop(st + dur + 0.04);
        osc.onended = () => {
          osc.disconnect();
          g.disconnect();
        };
      }
    }
    setTimeout(() => {
      try {
        panner.disconnect();
      } catch {}
    }, 9000);
    return true;
  }
  playShieldActivate() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    [72, 79, 84].forEach((m, i) => pluck(this.ctx, this.master, m, t + i * 0.045, 0.14, 0.5));
  }
  playShieldBlock() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    pluck(this.ctx, this.master, 88, t, 0.22, 0.35);
    pluck(this.ctx, this.master, 81, t + 0.04, 0.18, 0.35);
  }
  playWindGust() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    if (this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 1.8;
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(360, t + 0.55);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.58);
      src.connect(filter).connect(gain).connect(this.master);
      src.start(t);
      src.stop(t + 0.6);
      src.onended = () => {
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    }
    flute(ctx, this.master, 74, t + 0.03, 0.09, 0.45);
  }
  playCoffeeBoost() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    [69, 76, 81, 88].forEach((m, i) => pluck(this.ctx, this.master, m, t + i * 0.04, 0.15, 0.45));
  }
  playTagHit(isVictim = false) {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    if (isVictim) {
      [74, 69, 64].forEach((m, i) => pluck(this.ctx, this.master, m, t + i * 0.055, 0.18, 0.4));
    } else {
      [72, 76, 79, 84].forEach((m, i) => pluck(this.ctx, this.master, m, t + i * 0.045, 0.18, 0.5));
    }
  }
  playCloseCall() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    pluck(this.ctx, this.master, 79, t, 0.14, 0.35);
    pluck(this.ctx, this.master, 86, t + 0.07, 0.16, 0.42);
  }
  playEmotePop() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    pluck(this.ctx, this.master, 83, t, 0.08, 0.18);
  }
  playFireworkBurst() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    if (this.noiseBuffer) this.noiseBurst(t, 0.28, 0.14, 2400);
    [76, 79, 83, 88, 91].forEach((m, i) =>
      pluck(this.ctx, this.master, m, t + i * 0.05, 0.13, 0.55),
    );
  }
  playWaterSplash(intensity = 1) {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const t = this.ctx.currentTime;
    const scale = Math.max(0.6, Math.min(1.8, intensity));
    if (this.noiseBuffer) this.noiseBurst(t, 0.24 * scale, 0.12 * scale, 950 + scale * 320);
    pluck(this.ctx, this.master, 67, t + 0.02, 0.08 * scale, 0.3);
  }
  playReelPull(weight = 1, goodHit = true) {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const w = Math.max(0.5, Math.min(1.6, weight));

    // Mechanical reel ratchet clicks + taut fishing line strain
    const clicks = goodHit ? 3 : 1;
    for (let i = 0; i < clicks; i++) {
      const ct = t + i * 0.036;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime((goodHit ? 540 : 320) + i * 75, ct);
      clickOsc.frequency.exponentialRampToValueAtTime(190, ct + 0.03);
      clickGain.gain.setValueAtTime(0.001, ct);
      clickGain.gain.linearRampToValueAtTime(goodHit ? 0.095 : 0.055, ct + 0.004);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, ct + 0.035);
      clickOsc.connect(clickGain).connect(this.master);
      clickOsc.start(ct);
      clickOsc.stop(ct + 0.045);
      clickOsc.onended = () => {
        clickOsc.disconnect();
        clickGain.disconnect();
      };
    }

    if (goodHit) {
      // Heavy low line tension groan + water churn
      const strainOsc = ctx.createOscillator();
      const strainGain = ctx.createGain();
      strainOsc.type = "sawtooth";
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 520 + w * 260;
      strainOsc.frequency.setValueAtTime(115 * (0.9 + w * 0.12), t);
      strainOsc.frequency.exponentialRampToValueAtTime(215 * (0.9 + w * 0.15), t + 0.18);
      strainGain.gain.setValueAtTime(0.001, t);
      strainGain.gain.linearRampToValueAtTime(0.085 * w, t + 0.025);
      strainGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      strainOsc.connect(lp).connect(strainGain).connect(this.master);
      strainOsc.start(t);
      strainOsc.stop(t + 0.24);
      strainOsc.onended = () => {
        strainOsc.disconnect();
        lp.disconnect();
        strainGain.disconnect();
      };
      if (this.noiseBuffer && w >= 0.95) {
        this.noiseBurst(t + 0.02, 0.16, 0.08 * w, 820);
      }
    }
  }
  playFishBiteAlert() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    pluck(this.ctx, this.master, 84, t, 0.14, 0.22);
    pluck(this.ctx, this.master, 88, t + 0.08, 0.16, 0.28);
  }
  playFishCatchFanfare(speciesId = "ca-bong") {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const isBigFish =
      speciesId === "ca-koi" || speciesId === "ca-chep" || speciesId === "ca-ro-phi";
    const isTrophy = speciesId === "ca-koi" || speciesId === "ca-chep";

    if (isBigFish) {
      // Heavy fish breaching water splash + deep low-end thump
      if (this.noiseBuffer) {
        this.noiseBurst(t, isTrophy ? 0.44 : 0.32, isTrophy ? 0.24 : 0.17, 1550);
      }
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(isTrophy ? 128 : 112, t);
      sub.frequency.exponentialRampToValueAtTime(46, t + 0.28);
      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(isTrophy ? 0.24 : 0.17, t + 0.018);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      sub.connect(subGain).connect(this.master);
      sub.start(t);
      sub.stop(t + 0.36);
      sub.onended = () => {
        sub.disconnect();
        subGain.disconnect();
      };

      // Triumphant brass-flute + resonant bass fanfare for big fish
      pluck(ctx, this.master, 48, t + 0.04, 0.18, 0.85);
      pluck(ctx, this.master, 55, t + 0.18, 0.16, 0.85);
      const melody = isTrophy
        ? [72, 76, 79, 84, 88, 91, 96]
        : [72, 76, 79, 84, 88];
      melody.forEach((m, i) => {
        const nt = t + 0.05 + i * 0.065;
        pluck(ctx, this.master, m, nt, isTrophy ? 0.17 : 0.15, 0.65);
        if (i >= melody.length - 3) {
          flute(ctx, this.master, m, nt, isTrophy ? 0.14 : 0.1, 0.68);
        }
      });
      if (speciesId === "ca-koi") {
        // Extra sparkling trophy chord for Imperial Koi
        pluck(ctx, this.master, 84, t + 0.5, 0.16, 0.95);
        pluck(ctx, this.master, 91, t + 0.5, 0.14, 0.95);
        flute(ctx, this.master, 96, t + 0.5, 0.13, 1.0);
      }
      return;
    }

    if (this.noiseBuffer) {
      this.noiseBurst(t, 0.18, 0.1, 1100);
    }
    [72, 76, 79, 84].forEach((m, i) =>
      pluck(ctx, this.master, m, t + i * 0.055, 0.14, 0.45),
    );
  }
  playBoatBell() {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;
    pluck(this.ctx, this.master, 79, t, 0.14, 0.45);
    pluck(this.ctx, this.master, 86, t + 0.06, 0.11, 0.45);
  }
  dispose() {
    clearInterval(this.timer);
    this.stopCaHueMedia(true);
    if (this.preloadIdleId != null && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(this.preloadIdleId);
      this.preloadIdleId = null;
    }
    if (this.preloadTimerId != null) {
      clearTimeout(this.preloadTimerId);
      this.preloadTimerId = null;
    }
    this.collisionVoice?.stop();
    if (this.captureDestination) {
      try {
        this.meter?.disconnect(this.captureDestination);
      } catch {}
      this.captureDestination = null;
    }
    return this.ctx?.close();
  }
}
