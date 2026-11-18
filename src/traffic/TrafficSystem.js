import * as THREE from 'three';
import {box,mat} from '../landmarks/shared.js';
import {makePerson,animateWalker} from '../world/People.js';
import {CITY,BRIDGE} from '../world/cityLayout.js';
import {sweptContact} from './collision.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export function car(color){
  const g=new THREE.Group();g.add(box([1.8,.65,3.8],color,[0,.8,0]));
  const cabin=new THREE.Mesh(new THREE.CapsuleGeometry(.7,1.1,4,12),mat(color,.3,.3));cabin.rotation.x=Math.PI/2;cabin.scale.set(1,.8,.8);cabin.position.set(0,1.16,-.1);g.add(cabin);
  g.add(box([1.45,.65,1.55],'#506d78',[0,1.27,-.08]),box([1.65,.08,1.6],color,[0,1.64,-.1]));
  for(const x of [-.9,.9])for(const z of [-1.15,1.15]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.16,16),mat('#242a28'));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.42,z);g.add(wheel);}
  for(const x of [-.6,.6]){g.add(box([.38,.18,.06],'#fff0bf',[x,.87,1.93]),box([.38,.18,.06],'#a73f32',[x,.87,-1.93]));}g.add(box([1.55,.12,.12],'#919b95',[0,.55,1.97]));g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;
}
export function scooter(color){const g=new THREE.Group();g.add(box([.55,.5,1.3],color,[0,.6,0]),box([.5,.16,.7],'#333936',[0,.95,-.25]),box([.48,.8,.2],color,[0,.95,.5]));for(const z of [-.6,.6]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.25,.065,8,16),mat('#252b29'));wheel.rotation.y=Math.PI/2;wheel.position.set(0,.3,z);g.add(wheel);}g.add(box([.8,.07,.1],'#434b45',[0,1.35,.45]));const rider=makePerson('#718c8e',true);rider.position.set(0,.38,-.15);rider.scale.setScalar(.85);g.add(rider);const helmet=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),mat('#e6d0a4'));helmet.position.set(0,1.72,-.15);g.add(helmet);return g;}

export class TrafficSystem{
  constructor(scene,world){this.scene=scene;this.world=world;this.actors=[];this.time=0;this.enabled=true;
    for(const side of [-1,1])for(const direction of [-1,1])for(let i=0;i<3;i++){
      const type=i===1?'scooter':'car',mesh=type==='car'?car(['#d8d3bb','#688b83','#a75e4f'][i]):scooter('#8f6d4d');
      this.add(type,mesh,{x:-115+i*70+(side>0?12:0),z:side*CITY.roadCenter+direction*3.5},direction*Math.PI/2,type==='car'?5.5:6.7,'x',direction);
    }
    for(const direction of [-1,1])this.add('car',car('#a6b5af'),{x:BRIDGE.x-direction*3.5,z:direction>0?-40:40},direction>0?0:Math.PI,4.2,'z',direction);
    for(let i=0;i<20;i++){const side=i%2?1:-1,z=side*(i%3===0?CITY.promenade:CITY.sidewalk),direction=i%4<2?1:-1;this.add('pedestrian',makePerson(['#a77856','#719b9c','#b3aa76','#8e7689'][i%4]),{x:-115+i*12,z},direction*Math.PI/2,.7+(i%3)*.15,'x',direction);}
  }
  add(type,mesh,position,heading,speed,axis,direction){mesh.position.set(position.x,this.world.groundAt(position.x,position.z),position.z);mesh.rotation.y=heading;this.scene.add(mesh);this.actors.push({type,mesh,heading,baseSpeed:speed,speed,axis,direction,radius:type==='car'?1.65:type==='scooter'?.65:.35,previous:{...position},pause:0});}
  step(dt,bike){if(!this.enabled)return;this.time+=dt;
    for(const actor of this.actors){
      const p=actor.mesh.position;actor.previous={x:p.x,z:p.z};let speed=actor.baseSpeed;
      if(actor.pause>0){actor.pause-=dt;speed=0;}
      if(actor.type!=='pedestrian'){
        const forward=(actor.axis==='x'?bike.position.x-p.x:bike.position.z-p.z)*actor.direction,lateral=Math.abs(actor.axis==='x'?bike.position.z-p.z:bike.position.x-p.x),sameDirection=Math.cos(bike.motion.heading-actor.heading)>.5;
        if(sameDirection&&forward>0&&forward<10&&lateral<1.8)speed=forward<4?0:Math.min(speed,Math.max(0,bike.motion.speed));
        for(const other of this.actors){if(other===actor||other.type==='pedestrian'||other.axis!==actor.axis||other.direction!==actor.direction)continue;const gap=(other.mesh.position[actor.axis]-p[actor.axis])*actor.direction,lane=Math.abs(actor.axis==='x'?other.mesh.position.z-p.z:other.mesh.position.x-p.x);if(gap>0&&gap<5&&lane<1.5)speed=0;}
      }
      actor.speed=speed;p[actor.axis]+=speed*actor.direction*dt;
      const limit=actor.axis==='x'?135:42;if(Math.abs(p[actor.axis])>limit){p[actor.axis]=-Math.sign(p[actor.axis])*limit;actor.previous={x:p.x,z:p.z};}
      p.y=this.world.groundAt(p.x,p.z);if(actor.type==='pedestrian')animateWalker(actor.mesh,this.time*4+this.actors.indexOf(actor));
    }
  }
  contact(oldPosition,bike){if(!this.enabled)return null;
    for(const actor of this.actors){if(Math.abs(actor.mesh.position.y-bike.position.y)>1)continue;if(sweptContact(oldPosition,bike.position,actor.previous,actor.mesh.position,actor.radius+.45))return actor;}
    return null;
  }
  async loadDetailedCars(){
    const gltf=await new GLTFLoader().loadAsync(new URL('../assets/models/waymo_gen6_v4.glb',import.meta.url).href),bounds=new THREE.Box3().setFromObject(gltf.scene),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),scale=4.2/size.z;
    for(const actor of this.actors.filter(a=>a.type==='car')){for(const child of actor.mesh.children)child.visible=false;const wrapper=new THREE.Group(),model=gltf.scene.clone(true);model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);wrapper.add(model);actor.cameraMeshes=[];wrapper.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;actor.cameraMeshes.push(o);}});actor.mesh.add(wrapper);}
  }
  cameraObstacles(position){return this.actors.filter(a=>a.type==='car'&&a.mesh.position.distanceToSquared(position)<144).flatMap(a=>a.cameraMeshes||[]);}
  clearSpawn(position){for(const actor of this.actors){if(actor.mesh.position.distanceTo(position)>8)continue;const p=actor.mesh.position,limit=actor.axis==='x'?135:42;p[actor.axis]+=actor.direction*15;if(Math.abs(p[actor.axis])>limit)p[actor.axis]=-Math.sign(p[actor.axis])*limit;p.y=this.world.groundAt(p.x,p.z);actor.previous={x:p.x,z:p.z};}}
  hasVehicleAhead(bike,distance=7){return this.actors.some(actor=>{const dx=actor.mesh.position.x-bike.position.x,dz=actor.mesh.position.z-bike.position.z,forward=dx*Math.sin(bike.motion.heading)+dz*Math.cos(bike.motion.heading),lateral=Math.abs(dx*Math.cos(bike.motion.heading)-dz*Math.sin(bike.motion.heading));return forward>0&&forward<(actor.type==='pedestrian'?3:distance)&&lateral<(actor.type==='pedestrian'?1:2)&&Math.abs(actor.mesh.position.y-bike.position.y)<1;});}
}
