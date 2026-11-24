import { cleanGameModeId, DEFAULT_GAME_MODE_ID, getGameMode } from "./registry.js";

export class GameModeController {
  constructor(game) {
    this.game = game;
    this.modeId = DEFAULT_GAME_MODE_ID;
    this.modeDef = getGameMode(this.modeId);
    this.runtime = null;
  }

  get charmsEnabled() {
    return this.modeDef?.charmsEnabled !== false;
  }

  get speedMultiplier() {
    const val = this.runtime?.speedMultiplier;
    return Number.isFinite(val) && val > 0 ? val : 1;
  }

  activate(modeId, regionId = this.game?.world?.region?.id) {
    this.dispose();
    this.modeId = cleanGameModeId(modeId, regionId);
    this.modeDef = getGameMode(this.modeId);
    this.runtime = this.modeDef.createClientSession?.(this.game) || null;
    return this.modeId;
  }

  update(dt, elapsed) {
    this.runtime?.update?.(dt, elapsed);
  }

  onSnapshot(snapshot, selfId) {
    this.runtime?.onSnapshot?.(snapshot, selfId);
  }

  onServerEvent(message) {
    this.runtime?.onServerEvent?.(message);
  }

  handleTrafficContact(actor, oldX, oldZ) {
    return Boolean(this.runtime?.handleTrafficContact?.(actor, oldX, oldZ));
  }

  dispose() {
    this.runtime?.dispose?.();
    this.runtime = null;
  }
}
