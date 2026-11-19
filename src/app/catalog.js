import config from "../data/app-config.json" with { type: "json" };
export const isEnabled = (item) =>
  item.enabled !== false && item.disabled !== true;
export const enabledRecords = (items) => items.filter(isEnabled);
export const enabledAreas = enabledRecords(config.areas.items);
export const musicTracks = enabledRecords(config.music.tracks);
export const defaultArea =
  enabledAreas.find((a) => a.id === config.areas.defaultId) ||
  enabledAreas[0] ||
  null;
export const defaultMusicTrack =
  musicTracks.find((t) => t.id === config.music.defaultId) ||
  musicTracks[0] ||
  null;
export const areaIsEnabled = (id) =>
  enabledAreas.some((area) => area.id === id);
