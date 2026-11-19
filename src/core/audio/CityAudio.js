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
    void this.collisionVoice.preload();
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
    if (this.recordedMusic)
      void this.recordedMusic.sync(
        this.track,
        this.enabled && this.musicEnabled,
      );
    return this.enabled;
  }
  setMusicEnabled(enabled) {
    this.musicEnabled = !!enabled;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.background.gain.setTargetAtTime(
        enabled && this.track?.kind !== "file" ? 0.65 : 0,
        now,
        0.05,
      );
      if (!enabled) this.venue.gain.setTargetAtTime(0, now, 0.05);
      this.nextNote = now + 0.08;
    }
    if (this.recordedMusic)
      void this.recordedMusic.sync(
        this.track,
        this.enabled && this.musicEnabled,
      );
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
      this.background.gain.value =
        !this.musicEnabled || track.kind === "file" ? 0 : 0.65;
      this.background.connect(this.master);
      setTimeout(() => old.disconnect(), 3500);
      this.nextNote = now + 0.08;
    }
    if (this.recordedMusic)
      void this.recordedMusic.sync(track, this.enabled && this.musicEnabled);
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
      if (this.track.kind === "file") {
        this.nextNote = now + 0.3;
        return;
      }
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
      !this.musicEnabled || !this.track || this.track.kind === "file"
        ? 0
        : 0.65 - this.venueLevel * 0.4,
      t,
      0.7,
    );
    this.venue.gain.setTargetAtTime(
      !this.musicEnabled || this.track?.kind === "file"
        ? 0
        : this.venueLevel * 0.9,
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
    if (!this.enabled || this.ctx?.state !== "running" || document.hidden)
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
  collision() {
    if (!this.enabled || this.ctx?.state !== "running") return;
    const t = this.ctx.currentTime;
    this.collisionsPlayed++;
    this.noiseBurst(t, 0.35, 0.35, 1800);
    pluck(this.ctx, this.master, 43, t, 0.2, 0.35);
    pluck(this.ctx, this.master, 91, t + 0.025, 0.09, 0.45);
  }
  dispose() {
    clearInterval(this.timer);
    this.recordedMusic?.dispose();
    this.collisionVoice?.stop();
    return this.ctx?.close();
  }
}
