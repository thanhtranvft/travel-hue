import freeRoamMode from "./free-roam/index.js";
import tagChaseMode from "./tag-chase/index.js";
import checkpointRaceMode from "./checkpoint-race/index.js";

export const DEFAULT_GAME_MODE_ID = "free-roam";
export const SPECIAL_MODE_REGIONS = ["quoc-hoc", "quang-trung"];
export const MAX_SPECIAL_MODES_PER_REGION = 2;

export const GAME_MODES = [freeRoamMode, tagChaseMode, checkpointRaceMode];

const MODE_BY_ID = new Map(GAME_MODES.map((mode) => [mode.id, mode]));

export function regionSupportsSpecialModes(regionId) {
  return SPECIAL_MODE_REGIONS.includes(regionId);
}

export function modeSupportsRegion(mode, regionId) {
  if (!mode) return false;
  if (mode.regions === "*") return true;
  return Array.isArray(mode.regions) && mode.regions.includes(regionId);
}

export function getGameMode(modeId) {
  return MODE_BY_ID.get(modeId) || freeRoamMode;
}

export function cleanGameModeId(modeId, regionId = null) {
  const mode = typeof modeId === "string" ? MODE_BY_ID.get(modeId) : null;
  if (!mode || mode.enabled !== true) return DEFAULT_GAME_MODE_ID;
  if (regionId && !modeSupportsRegion(mode, regionId)) {
    return DEFAULT_GAME_MODE_ID;
  }
  if (mode.kind === "special" && regionId && !regionSupportsSpecialModes(regionId)) {
    return DEFAULT_GAME_MODE_ID;
  }
  return mode.id;
}

export function getModesForRegion(regionId, { includeUpcoming = true } = {}) {
  const specials = GAME_MODES.filter(
    (mode) =>
      mode.kind === "special" &&
      regionSupportsSpecialModes(regionId) &&
      modeSupportsRegion(mode, regionId) &&
      (includeUpcoming ? mode.enabled || mode.upcoming : mode.enabled),
  ).slice(0, MAX_SPECIAL_MODES_PER_REGION);

  return [freeRoamMode, ...specials];
}

export function roomKeyFor(regionId, gameModeId = DEFAULT_GAME_MODE_ID) {
  const cleanMode = cleanGameModeId(gameModeId, regionId);
  return cleanMode === DEFAULT_GAME_MODE_ID
    ? regionId
    : `${regionId}::${cleanMode}`;
}
