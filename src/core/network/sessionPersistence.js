import { cleanAvatarId, cleanPlayerName, DEFAULT_AVATAR_ID } from "./protocol.js";
import { cleanCharmTier, emptyCharmInventory, sanitizeCharmInventory } from "../world/speedCharms.js";
import { cleanGameModeId, DEFAULT_GAME_MODE_ID } from "../../modules/game-modes/registry.js";
import onlineConfig from "../../data/online-config.json" with { type: "json" };

export const ACTIVE_SESSION_STORAGE_KEY = "hue-active-session-v1";
export const VALID_MODES = ["explore", "online"];
export const VALID_TRANSPORTS = ["foot", "bike"];
export const VALID_ACTIVITIES = ["free-roam", "speed-hunt"];

export function isExploreModeEnabled() {
  return onlineConfig.exploreEnabled === true || onlineConfig.enabled === false;
}

export function cleanMode(value) {
  if (!isExploreModeEnabled()) return "online";
  if (VALID_MODES.includes(value)) return value;
  return VALID_MODES.includes(onlineConfig.defaultMode)
    ? onlineConfig.defaultMode
    : "online";
}

export function cleanTransport(value) {
  return VALID_TRANSPORTS.includes(value) ? value : "foot";
}

export function cleanActivity(value) {
  return VALID_ACTIVITIES.includes(value) ? value : "free-roam";
}

export function sanitizePose(raw) {
  if (!raw || typeof raw !== "object") return null;
  const x = Number(raw.x);
  const y = Number(raw.y ?? 0);
  const z = Number(raw.z);
  const heading = Number(raw.heading ?? 0);
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(z) ||
    !Number.isFinite(heading)
  ) {
    return null;
  }
  return { x, y, z, heading };
}

export function sanitizeActiveBoost(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") return null;
  const tier = cleanCharmTier(raw.tier);
  const expiresAt = Number(raw.expiresAt);
  const durationMs = Number(raw.durationMs);
  const multiplier = Number(raw.multiplier);
  const percent = Number(raw.percent);
  if (
    !tier ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= now ||
    !Number.isFinite(multiplier) ||
    multiplier <= 1
  ) {
    return null;
  }
  return {
    tier,
    percent: Number.isFinite(percent) ? percent : 10,
    multiplier,
    durationMs: Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 6000,
    expiresAt,
  };
}

export function cleanRegionId(value) {
  if (typeof value !== "string" || !/^[a-z0-9-]+$/.test(value)) return null;
  return value === "south-bank" ? "quoc-hoc" : value;
}

export function loadActiveSession(
  storage = globalThis.localStorage,
  now = Date.now(),
) {
  try {
    const rawText = storage?.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!rawText) return null;
    const raw = JSON.parse(rawText);
    if (!raw || typeof raw !== "object") return null;
    const name = cleanPlayerName(raw.name || "");
    const mode = cleanMode(raw.mode);
    const region = cleanRegionId(raw.region);
    const gameMode = cleanGameModeId(
      raw.gameMode || DEFAULT_GAME_MODE_ID,
      region,
    );
    return {
      active: Boolean(raw.active && name),
      name,
      mode,
      gameMode,
      activity: cleanActivity(raw.activity),
      avatar: cleanAvatarId(raw.avatar || DEFAULT_AVATAR_ID),
      region,
      transportMode: cleanTransport(raw.transportMode),
      onlineToken:
        typeof raw.onlineToken === "string" && raw.onlineToken.length <= 128
          ? raw.onlineToken
          : null,
      pose: sanitizePose(raw.pose),
      inventory: sanitizeCharmInventory(raw.inventory || emptyCharmInventory()),
      activeBoost: sanitizeActiveBoost(raw.activeBoost, now),
      savedAt: Number.isFinite(Number(raw.savedAt)) ? Number(raw.savedAt) : now,
    };
  } catch {
    return null;
  }
}

export function saveActiveSession(
  patch,
  storage = globalThis.localStorage,
  now = Date.now(),
) {
  const existing = loadActiveSession(storage, now) || {
    active: false,
    name: "",
    mode: "online",
    gameMode: DEFAULT_GAME_MODE_ID,
    activity: "free-roam",
    avatar: DEFAULT_AVATAR_ID,
    region: null,
    transportMode: "foot",
    onlineToken: null,
    pose: null,
    inventory: emptyCharmInventory(),
    activeBoost: null,
  };
  const merged = {
    ...existing,
    ...patch,
    savedAt: now,
  };
  const region = cleanRegionId(merged.region) || existing.region;
  const next = {
    active: Boolean(merged.active && cleanPlayerName(merged.name)),
    name: cleanPlayerName(merged.name),
    mode: cleanMode(merged.mode),
    gameMode: cleanGameModeId(merged.gameMode || DEFAULT_GAME_MODE_ID, region),
    activity: cleanActivity(merged.activity),
    avatar: cleanAvatarId(merged.avatar),
    region,
    transportMode: cleanTransport(merged.transportMode),
    onlineToken:
      typeof merged.onlineToken === "string" && merged.onlineToken.length <= 128
        ? merged.onlineToken
        : null,
    pose: sanitizePose(merged.pose),
    inventory: sanitizeCharmInventory(merged.inventory),
    activeBoost: sanitizeActiveBoost(merged.activeBoost, now),
    savedAt: now,
  };
  try {
    storage?.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function markSessionInactive(
  storage = globalThis.localStorage,
  now = Date.now(),
) {
  const current = loadActiveSession(storage, now);
  if (!current) return null;
  return saveActiveSession(
    { active: false, onlineToken: null },
    storage,
    now,
  );
}

export function clearActiveSession(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(ACTIVE_SESSION_STORAGE_KEY);
  } catch {}
}
