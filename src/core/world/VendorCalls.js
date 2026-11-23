export class VendorCalls {
  constructor({
    callDistance = 9.5,
    rearmDistance = 15,
    cooldownSeconds = 12,
    typeCooldownSeconds = 4,
  } = {}) {
    this.callDistance = callDistance;
    this.rearmDistance = rearmDistance;
    this.cooldownSeconds = cooldownSeconds;
    this.typeCooldownSeconds = typeCooldownSeconds;
    this.encounters = new Map();
    this.lastTypeCall = new Map();
  }
  update(time, bike, vendors = []) {
    if (!vendors.length || !bike?.position) return null;
    let nearest = null;
    let nearestDist = Infinity;
    for (const vendor of vendors) {
      const key = vendor.id || vendor;
      let entry = this.encounters.get(key);
      if (!entry) {
        entry = { near: false, last: -Infinity };
        this.encounters.set(key, entry);
      }
      const d = Math.hypot(
        vendor.x - bike.position.x,
        vendor.z - bike.position.z,
      );
      const rearm = vendor.rearmDistance ?? this.rearmDistance;
      if (d > rearm) {
        entry.near = false;
        continue;
      }
      const triggerDist = vendor.callDistance ?? this.callDistance;
      const vy = vendor.y ?? bike.position.y;
      if (
        d >= triggerDist ||
        Math.abs(vy - bike.position.y) > 1.8 ||
        entry.near
      )
        continue;
      const lastType = this.lastTypeCall.get(vendor.vendorType) ?? -Infinity;
      if (
        time - entry.last < this.cooldownSeconds ||
        time - lastType < this.typeCooldownSeconds
      )
        continue;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = vendor;
      }
    }
    if (!nearest) return null;
    const entry = this.encounters.get(nearest.id || nearest);
    entry.near = true;
    entry.last = time;
    this.lastTypeCall.set(nearest.vendorType, time);
    return nearest;
  }
}
