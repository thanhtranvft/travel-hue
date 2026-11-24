import { restaurantZones } from "../world/streetVenues.js";
import { nearestAudibleSource, proximityGain, sourcePan } from "./spatial.js";
import { backgroundMelody, restaurantMelody, pluck, flute } from "./music.js";
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
    this.onStatus = () => {};
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else if (this.enabled)
        this.ctx
          .resume()
          .catch(() => this.onStatus("Chạm nút âm thanh để phát tiếp."));
    });
    addEventListener("pagehide", () => this.ctx?.suspend().catch(() => {}));
  }
  initialize() {
    if (this.ctx) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio không được hỗ trợ");
    this.ctx = new Context();
    const ctx = this.ctx;
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
    this.background.gain.value = 0.65;
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
    this.timer = setInterval(() => this.schedule(), 100);
    this.nextNote = ctx.currentTime + 0.08;
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
      this.initialize();
      await this.ctx.resume();
      if (this.ctx.state !== "running")
        throw new Error("Audio đang bị tạm dừng");
      this.enabled = true;
      this.nextNote = this.ctx.currentTime + 0.08;
    } else {
      this.enabled = false;
      this.collisionVoice?.stop();
      if (this.ctx) await this.ctx.suspend();
    }
    return this.enabled;
  }
  setMusicEnabled(enabled) {
    this.musicEnabled = !!enabled;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.background.gain.setTargetAtTime(enabled ? 0.65 : 0, now, 0.05);
      if (!enabled) this.venue.gain.setTargetAtTime(0, now, 0.05);
      this.nextNote = now + 0.08;
    }
    return this.musicEnabled;
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
      this.background.gain.value = this.musicEnabled ? 0.65 : 0;
      this.background.connect(this.master);
      setTimeout(() => old.disconnect(), 3500);
      this.nextNote = now + 0.08;
    }
    return true;
  }
  schedule() {
    if (
      !this.enabled ||
      !this.musicEnabled ||
      !this.track ||
      this.ctx.state !== "running" ||
      document.hidden
    )
      return;
    const ctx = this.ctx,
      now = ctx.currentTime;
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
  update(bike, actors, cameraHeading) {
    const nearby = nearestAudibleSource(
      bike.position,
      this.venues || restaurantZones,
      25,
    );
    this.nearbyVenue = nearby?.source || null;
    this.venueLevel = nearby?.gain || 0;
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const ctx = this.ctx,
      t = ctx.currentTime,
      speed = Math.abs(bike.motion.speed);
    this.background.gain.setTargetAtTime(
      !this.musicEnabled || !this.track ? 0 : 0.65 - this.venueLevel * 0.4,
      t,
      0.7,
    );
    this.venue.gain.setTargetAtTime(
      !this.musicEnabled ? 0 : this.venueLevel * 0.9,
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
      (typeof document !== "undefined" && document.hidden)
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
      (typeof document !== "undefined" && document.hidden)
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
      (typeof document !== "undefined" && document.hidden)
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
  dispose() {
    clearInterval(this.timer);
    if (this.preloadIdleId != null && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(this.preloadIdleId);
      this.preloadIdleId = null;
    }
    if (this.preloadTimerId != null) {
      clearTimeout(this.preloadTimerId);
      this.preloadTimerId = null;
    }
    this.collisionVoice?.stop();
    return this.ctx?.close();
  }
}
