import * as THREE from 'three';
import { Game } from './Game.js';
import { HueWorld } from '../world/DetailedWorld.js';
import { destinations } from '../routes/destinations.js';
import { hueHeritageRoute } from '../routes/hueHeritageRoute.js';
export class ScenicGame extends Game {
  constructor(canvas){super(canvas);const old=this.scene;this.scene=new THREE.Scene();this.world=new HueWorld(this.scene);this.world.build();this.scene.add(this.bike);old.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.travelTo('quoc-hoc');}
  travelTo(id){const p=destinations.find(p=>p.id===id);if(!p)return;this.auto=false;document.querySelector('#autopilot').classList.remove('active');this.input.keys.clear();this.input.drag.yaw=0;this.bike.position.set(p.x,.25,p.z);this.bike.velocity=0;this.bike.heading=p.heading;this.bike.rotation.set(0,p.heading,0);this.routeIndex=Math.min(p.routeIndex,hueHeritageRoute.length-1);this.camera.position.set(p.x-Math.sin(p.heading)*9,6,p.z-Math.cos(p.heading)*9);this.camera.lookAt(p.x,1.5,p.z);}
  reset(){if(this.world?.water)this.travelTo('quoc-hoc');else super.reset();}
  frame(){this.world.update(performance.now()/1000);super.frame();}
}
