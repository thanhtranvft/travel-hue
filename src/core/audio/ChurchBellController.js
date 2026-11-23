export class ChurchBellController {
  constructor({
    minInterval = 30,
    maxInterval = 60,
    initialDelay = 1.5,
    rng = Math.random,
  } = {}) {
    this.minInterval = minInterval;
    this.maxInterval = maxInterval;
    this.initialDelay = initialDelay;
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.wasInside = false;
    this.lastTollAt = -Infinity;
    this.nextTollAt = Infinity;
  }

  nextSpan() {
    const r = Math.max(0, Math.min(1, Number(this.rng?.() ?? Math.random())));
    return this.minInterval + r * (this.maxInterval - this.minInterval);
  }

  update(elapsed, inChurchArea) {
    if (!Number.isFinite(elapsed) || !inChurchArea) {
      this.wasInside = false;
      return false;
    }

    if (!this.wasInside) {
      this.wasInside = true;
      const sinceLast = elapsed - this.lastTollAt;
      if (this.lastTollAt === -Infinity || sinceLast >= this.minInterval) {
        this.nextTollAt = elapsed + this.initialDelay;
      } else {
        this.nextTollAt = Math.max(
          this.nextTollAt,
          this.lastTollAt + this.minInterval,
        );
      }
    }

    if (elapsed >= this.nextTollAt) {
      this.lastTollAt = elapsed;
      this.nextTollAt = elapsed + this.nextSpan();
      return true;
    }
    return false;
  }
}
