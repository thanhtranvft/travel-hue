export class PatrolWarnings {
  constructor(config) {
    this.config = config;
    this.encounters = new Map();
    this.lastWarning = -Infinity;
  }
  update(time, bike, actors) {
    const c = this.config;
    if (!c.enabled) return null;
    for (const actor of actors) {
      if (!actor.isPolice) continue;
      let entry = this.encounters.get(actor);
      if (!entry) {
        entry = { near: false, last: -Infinity };
        this.encounters.set(actor, entry);
      }
      const d = Math.hypot(
        actor.mesh.position.x - bike.position.x,
        actor.mesh.position.z - bike.position.z,
      );
      if (d > c.rearmDistance) {
        entry.near = false;
        continue;
      }
      if (
        d >= c.warningDistance ||
        Math.abs(actor.mesh.position.y - bike.position.y) > 1 ||
        entry.near
      )
        continue;
      if (Math.abs(bike.motion.speed) + Math.abs(actor.speed) < 0.4) continue;
      entry.near = true;
      if (
        time - entry.last < c.cooldownSeconds ||
        time - this.lastWarning < c.globalCooldownSeconds
      )
        continue;
      entry.last = time;
      this.lastWarning = time;
      return actor;
    }
    return null;
  }
}
