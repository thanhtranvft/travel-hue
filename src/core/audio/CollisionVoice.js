import { collisionRecordingURLs } from "./collisionRecordings.js";
export { collisionRecordingURLs } from "./collisionRecordings.js";

function resolveEntries(type) {
  const entry = collisionRecordingURLs[type];
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}

export class CollisionVoice {
  constructor(ctx, output, onStatus = () => {}, random = Math.random) {
    this.ctx = ctx;
    this.output = output;
    this.onStatus = onStatus;
    this.random = random;
    this.buffers = new Map();
    this.sequence = 0;
    this.active = null;
    this.lastPlayed = null;
  }
  pickVariant(type) {
    const entries = resolveEntries(type);
    if (!entries.length) return null;
    if (entries.length === 1) {
      return { cacheKey: type, url: entries[0], variant: null };
    }
    const raw = Number(this.random?.());
    const clamped = Number.isFinite(raw) ? Math.min(0.999999, Math.max(0, raw)) : 0;
    const variant = Math.floor(clamped * entries.length);
    return {
      cacheKey: `${type}:${variant}`,
      url: entries[variant],
      variant,
    };
  }
  load(type, index = null) {
    const entries = resolveEntries(type);
    if (!entries.length)
      return Promise.reject(new Error("Không có bản thu cho va chạm này."));
    let cacheKey = type;
    let url = entries[0];
    if (entries.length > 1) {
      const idx = Number.isInteger(index)
        ? ((index % entries.length) + entries.length) % entries.length
        : this.pickVariant(type).variant;
      cacheKey = `${type}:${idx}`;
      url = entries[idx];
    }
    if (!this.buffers.has(cacheKey)) {
      const pending = fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Không tải được bản thu va chạm.");
          return response.arrayBuffer();
        })
        .then((bytes) => this.ctx.decodeAudioData(bytes))
        .catch((error) => {
          this.buffers.delete(cacheKey);
          throw error;
        });
      this.buffers.set(cacheKey, pending);
    }
    return this.buffers.get(cacheKey);
  }
  preload() {
    const jobs = [];
    for (const [type, entry] of Object.entries(collisionRecordingURLs)) {
      const list = Array.isArray(entry) ? entry : [entry];
      list.forEach((_, idx) => jobs.push(this.load(type, idx)));
    }
    return Promise.allSettled(jobs);
  }
  stop() {
    this.sequence++;
    if (this.active) {
      try {
        this.active.stop();
      } catch {}
      this.active.disconnect();
      this.active = null;
    }
  }
  async play(type) {
    const picked = this.pickVariant(type);
    if (!picked || this.ctx.state !== "running") return false;
    this.stop();
    const sequence = this.sequence;
    try {
      const buffer = await this.load(type, picked.variant);
      if (sequence !== this.sequence || this.ctx.state !== "running")
        return false;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.output);
      this.active = source;
      this.lastPlayed = {
        type,
        url: picked.url,
        ...(picked.variant !== null ? { variant: picked.variant } : {}),
        duration: buffer.duration,
      };
      source.onended = () => {
        source.disconnect();
        if (this.active === source) this.active = null;
      };
      source.start();
      return true;
    } catch {
      if (sequence === this.sequence)
        this.onStatus(
          "Chưa tải được âm thanh va chạm; lời thoại vẫn hiển thị trên màn hình.",
        );
      return false;
    }
  }
}
