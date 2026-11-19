import { loadGeography, geoDistricts } from "./AreaModel.js";
import { createAreaView } from "./AreaView.js";
import { disposeOldScene } from "../../core/shared/resources/sceneResources.js";
export class AreaPresenter {
  constructor(game) {
    this.game = game;
  }
  changeRegion(id) {
    const game = this.game;
    game.isLoadingRegion = true;
    game.auto = false;
    game.input.reset();
    const previous = game.world.region?.id,
      loading = document.querySelector("#scene-loading");
    loading.textContent = `Đang tải khu vực ${geoDistricts.find((a) => a.id === id)?.title || id}…`;
    loading.hidden = false;
    game.renderer.setAnimationLoop(null);
    game.regionLoadPromise = (async () => {
      let candidate;
      try {
        await new Promise((resolve) =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        );
        await loadGeography(id);
        candidate = await createAreaView(game.quality);
        const oldScene = game.scene;
        game.scene = candidate.scene;
        game.world = candidate.world;
        game.traffic = candidate.traffic;
        game.scene.add(game.bike, game.impact);
        game.audio.venues = game.world.venues;
        game.isLoadingRegion = false;
        game.travelTo(id);
        game.lastDisposedResources = disposeOldScene(oldScene, game.scene);
        document.querySelector("#asset-notice").hidden =
          !candidate.assetFailures;
        return true;
      } catch (error) {
        if (previous) await loadGeography(previous);
        if (candidate) disposeOldScene(candidate.scene, game.scene);
        document.querySelector("#asset-notice").textContent =
          "Chưa tải được khu vực. Hãy chọn lại để thử.";
        document.querySelector("#asset-notice").hidden = false;
        return false;
      } finally {
        game.isLoadingRegion = false;
        loading.hidden = true;
        game.accumulator = 0;
        game.clock.getDelta();
        game.start();
        const pending = game.pendingRegion;
        game.pendingRegion = null;
        if (pending && pending !== game.world.region?.id)
          void this.changeRegion(pending);
      }
    })();
    game.ready = game.regionLoadPromise;
    return game.regionLoadPromise;
  }
}
