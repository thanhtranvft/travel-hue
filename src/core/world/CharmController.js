import {
  CHARM_PICKUP_RADIUS,
  CHARM_TIERS,
  CHARM_TIER_LIST,
  cleanCharmTier,
  emptyCharmInventory,
  generateRegionCharms,
  randomCharmRefreshMs,
  sanitizeCharmInventory,
} from "./speedCharms.js";
import { SpeedCharmWorldView } from "./CharmSceneFX.js";

export class CharmController {
  constructor(game) {
    this.game = game;
    this.inventory = emptyCharmInventory();
    this.charms = [];
    this.pendingPickups = new Set();
    this.nextRefreshAt = Date.now() + randomCharmRefreshMs();
    this.activeBoost = null; // { tier, percent, multiplier, expiresAt, durationMs }
    this.worldView = new SpeedCharmWorldView(game.scene);
    this.refreshNoticeUntil = 0;
  }

  get speedMultiplier() {
    if (!this.activeBoost) return 1;
    if (Date.now() >= this.activeBoost.expiresAt) {
      this.activeBoost = null;
      return 1;
    }
    return this.activeBoost.multiplier || 1;
  }

  get boostRemainingMs() {
    if (!this.activeBoost) return 0;
    return Math.max(0, this.activeBoost.expiresAt - Date.now());
  }

  attachScene(scene) {
    this.worldView.attachScene(scene);
  }

  onRegionChanged() {
    this.pendingPickups.clear();
    if (this.game.online) {
      this.charms = [];
      this.worldView.sync([]);
      return;
    }
    this.spawnLocalCharms();
  }

  spawnLocalCharms({ notify = false } = {}) {
    const world = this.game.world;
    if (!world?.region) return;
    const region = world.region;
    this.charms = generateRegionCharms(region, {
      idPrefix: `${region.id}-${Date.now()}`,
      extraRoads: world.renderRoads || [],
      canPlace: (x, z) =>
        typeof world.canPlaceCharm === "function"
          ? world.canPlaceCharm(x, z)
          : world.canRide(x, z),
      groundAt: (x, z) => world.groundAt(x, z),
    });
    this.nextRefreshAt = Date.now() + randomCharmRefreshMs();
    this.worldView.sync(this.charms);
    if (notify) this.refreshNoticeUntil = Date.now() + 3000;
  }

  applyServerCharms(message) {
    if (!message || message.region !== this.game.world?.region?.id) return;
    this.pendingPickups.clear();
    this.charms = Array.isArray(message.charms) ? message.charms : [];
    if (Number.isFinite(message.nextRefreshAt)) {
      this.nextRefreshAt = message.nextRefreshAt;
    }
    this.worldView.sync(this.charms);
    if (message.refreshed) {
      this.refreshNoticeUntil = Date.now() + 3000;
    }
  }

  applyServerInventory(message) {
    if (!message) return;
    this.inventory = sanitizeCharmInventory(message.inventory);
    if (message.picked) {
      const wasOptimistic = this.pendingPickups.delete(message.picked.id);
      if (!wasOptimistic) {
        this.worldView.spawnPickupBurst(
          message.picked.x,
          message.picked.y,
          message.picked.z,
          message.picked.tier,
        );
        this.game.audio?.playCharmPickup?.(message.picked.percent);
      }
    }
  }

  applyServerBoostAck(message) {
    if (!message) return;
    this.inventory = sanitizeCharmInventory(message.inventory);
    if (message.rejected) return;
    const tier = CHARM_TIERS[cleanCharmTier(message.boostTier)];
    if (tier && Number.isFinite(message.remainingMs) && message.remainingMs > 0) {
      this.activeBoost = {
        tier: tier.id,
        percent: tier.percent,
        multiplier: tier.multiplier,
        durationMs: tier.durationMs,
        expiresAt: Date.now() + message.remainingMs,
      };
    }
  }

  collectNearby() {
    const pos = this.game.bike?.position;
    if (!pos) return;
    const now = Date.now();
    for (let i = this.charms.length - 1; i >= 0; i--) {
      const charm = this.charms[i];
      if (this.pendingPickups.has(charm.id)) continue;
      const d = Math.hypot(charm.x - pos.x, charm.z - pos.z);
      if (d > CHARM_PICKUP_RADIUS) continue;

      if (this.game.online) {
        this.pendingPickups.add(charm.id);
        this.game.online.sendPickup(charm.id);
        // Optimistic visual hide until server broadcasts updated region charms
        this.charms.splice(i, 1);
        this.worldView.sync(this.charms);
        this.worldView.spawnPickupBurst(charm.x, charm.y, charm.z, charm.tier);
        this.game.audio?.playCharmPickup?.(charm.percent);
      } else {
        this.charms.splice(i, 1);
        const key = cleanCharmTier(charm.tier);
        if (key) {
          this.inventory[key] = Math.min(99, (this.inventory[key] || 0) + 1);
        }
        this.worldView.sync(this.charms);
        this.worldView.spawnPickupBurst(charm.x, charm.y, charm.z, charm.tier);
        this.game.audio?.playCharmPickup?.(charm.percent);
      }
    }

    if (!this.game.online && now >= this.nextRefreshAt) {
      this.spawnLocalCharms({ notify: true });
    }
  }

  useCharm(tierInput) {
    const key = cleanCharmTier(tierInput);
    if (!key) return false;
    if ((this.inventory[key] || 0) <= 0) return false;
    const tier = CHARM_TIERS[key];
    const now = Date.now();

    this.inventory[key] -= 1;
    if (this.activeBoost && this.activeBoost.tier === tier.id && this.activeBoost.expiresAt > now) {
      const remaining = Math.min(tier.durationMs * 2, this.activeBoost.expiresAt - now + tier.durationMs);
      this.activeBoost.expiresAt = now + remaining;
      this.activeBoost.durationMs = Math.max(tier.durationMs, remaining);
    } else {
      this.activeBoost = {
        tier: tier.id,
        percent: tier.percent,
        multiplier: tier.multiplier,
        durationMs: tier.durationMs,
        expiresAt: now + tier.durationMs,
      };
    }

    if (this.game.online) {
      this.game.online.sendUseCharm(tier.id);
    }

    // Immediate burst kick when not braking so speed boost feels snappy
    const bike = this.game.bike;
    if (bike && !this.game.input?.brake && bike.motion.speed >= 0) {
      const kick = bike.transportMode === "bike" ? 5.5 : 3.6;
      if (bike.motion.speed < kick) bike.motion.speed = kick;
    }

    this.game.audio?.playSpeedBoost?.(tier.percent);
    return true;
  }

  update(dt, elapsed) {
    if (this.activeBoost && Date.now() >= this.activeBoost.expiresAt) {
      this.activeBoost = null;
    }
    if (this.game.sessionActive !== false) {
      this.collectNearby();
    }
    this.worldView.update(dt, elapsed, this.game.bike?.position);
  }

  getSummary() {
    const remainingMs = this.boostRemainingMs;
    return {
      inventory: { ...this.inventory },
      tiers: CHARM_TIER_LIST,
      activeBoost: this.activeBoost
        ? {
            ...this.activeBoost,
            remainingMs,
            progress: Math.max(0, Math.min(1, remainingMs / (this.activeBoost.durationMs || 6000))),
          }
        : null,
      refreshNoticeActive: Date.now() < this.refreshNoticeUntil,
      charms: this.charms,
    };
  }

  dispose() {
    this.worldView.dispose();
  }
}
