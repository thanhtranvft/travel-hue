import * as THREE from "three";
import { GeographicWorld } from "../../core/world/GeographicWorld.js";
import { GeographicTraffic } from "../../core/traffic/GeographicTraffic.js";
import { currentRegion } from "./AreaModel.js";
import { optimizeMobileStaticScene } from "../../core/rendering/MobileStaticScene.js";
import { MobileCrowd } from "../../core/rendering/MobileCrowd.js";
import { loadMobileTrees } from "../../core/rendering/MobileTrees.js";
import { loadMobileCars } from "../../core/traffic/MobileCars.js";
export async function createAreaView(quality) {
  const scene = new THREE.Scene(),
    world = new GeographicWorld(scene);
  world.quality = quality;
  world.region = currentRegion;
  world.build();
  optimizeMobileStaticScene(world);
  scene.traverse((o) => {
    if (o.isSprite) o.visible = false;
  });
  const traffic = new GeographicTraffic(scene, world);
  world.mobileCrowd = new MobileCrowd(world, traffic);
  const assets = await Promise.allSettled([
    loadMobileTrees(world),
    quality.mobile ? loadMobileCars(traffic) : traffic.loadDetailedCars(),
  ]);
  return {
    scene,
    world,
    traffic,
    assetFailures: assets.filter((r) => r.status === "rejected").length,
  };
}
