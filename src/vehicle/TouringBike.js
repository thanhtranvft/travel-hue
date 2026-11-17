import * as THREE from 'three';
import {beam} from '../landmarks/architecture.js';
import {mat} from '../landmarks/shared.js';
import {BicycleMotion} from './BicycleMotion.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export class TouringBike extends THREE.Group {
  constructor(){
    super();this.motion=new BicycleMotion();this.wheels=[];this.pedalPhase=0;this.rider=new THREE.Group();
    const rubber=mat('#242a28',.85),silver=mat('#b5c1ba',.28,.7),fur=mat('#b97c43'),cream=mat('#e7c99b');
    const sphere=(parent,r,material,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
    for(const z of [-.59,.59]){
      const pivot=new THREE.Group();pivot.position.set(0,.43,z);this.add(pivot);this.wheels.push(pivot);
      const tire=new THREE.Mesh(new THREE.TorusGeometry(.4,.045,10,40),rubber);tire.rotation.y=Math.PI/2;pivot.add(tire);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.375,.012,6,40),silver);rim.rotation.y=Math.PI/2;pivot.add(rim);
      for(let i=0;i<16;i++){const a=i*Math.PI/8;pivot.add(beam([0,0,0],[0,Math.sin(a)*.37,Math.cos(a)*.37],.004,'#aebbb7'));}
    }
    const joints=[[0,.43,-.59],[0,.46,0],[0,.9,-.12],[0,1,.42],[0,.43,.59]];
    for(const [a,b]of [[0,1],[0,2],[1,2],[2,3],[1,3],[3,4]])this.add(beam(joints[a],joints[b],.028,'#3e887b'));
    this.add(beam([0,1,.42],[0,1.18,.42],.023,'#9ca9a1'),beam([-.24,1.18,.42],[.24,1.18,.42],.024,'#35453f'));
    const seat=new THREE.Mesh(new THREE.SphereGeometry(.15,14,8),rubber);seat.scale.set(.8,.25,1.2);seat.position.set(0,.99,-.15);this.add(seat);
    this.add(beam([0,.46,-.05],[0,.43,-.59],.009,'#47504b'),beam([0,.4,-.06],[0,.4,-.59],.009,'#47504b'));
    this.crank=new THREE.Group();this.crank.position.set(0,.46,0);this.crank.add(beam([-.18,-.13,0],[.18,.13,0],.02,'#c6ccc3'));this.add(this.crank);
    this.rider.position.set(0,.98,-.12);this.add(this.rider);
    sphere(this.rider,.26,fur,0,.25,0,.8,1.35,1);
    sphere(this.rider,.23,fur,0,.69,.12,1,1,1);
    sphere(this.rider,.13,cream,0,.61,.32,1,.8,1.3);sphere(this.rider,.045,rubber,0,.65,.45,1,.7,.65);
    for(const x of [-.105,.105]){sphere(this.rider,.026,rubber,x,.75,.3);sphere(this.rider,.011,mat('#f4f0d9'),x-.006,.758,.318);sphere(this.rider,.12,fur,x*2,.65,.08,.55,1.7,.8);}
    const hat=new THREE.Mesh(new THREE.ConeGeometry(.34,.19,36),mat('#c4aa73'));hat.position.set(0,.94,.12);this.rider.add(hat);
    const tail=new THREE.Mesh(new THREE.TorusGeometry(.17,.055,8,16,Math.PI*1.5),fur);tail.position.set(0,.24,-.3);tail.rotation.y=Math.PI/2;this.rider.add(tail);
    for(const x of [-.15,.15])this.rider.add(beam([x,.38,.08],[x,.18,.51],.055,'#b5804c'));
    this.legs=[];for(const x of [-.15,.15]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.26,4,8),fur);leg.position.set(x,-.15,0);this.rider.add(leg);this.legs.push(leg);}
    this.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    this.fallbackParts=this.children.filter(part=>part!==this.rider);
  }
  async loadDetailedModel(){
    const gltf=await new GLTFLoader().loadAsync(new URL('../assets/models/priority_gbike_v9.glb',import.meta.url).href);
    const model=gltf.scene;model.rotation.y=Math.PI;model.scale.setScalar(1.0875);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    this.assetWheels=['Priority_Wheel_Front_V9','Priority_Wheel_Rear_V9'].map(name=>model.getObjectByName(name)).filter(Boolean);
    this.assetCrank=model.getObjectByName('Priority_Crank_V9');
    for(const part of this.fallbackParts)part.visible=false;this.add(model);this.rider.position.y=.86;
  }
  reset(x,z,heading){this.position.set(x,.25,z);this.rotation.set(0,heading,0);this.motion.reset(heading);}
  update(dt,throttle,steer,brake){const step=this.motion.step(dt,throttle,steer,brake);this.position.x+=step.dx;this.position.z+=step.dz;this.rotation.y=this.motion.heading;this.rotation.z=this.motion.lean;this.pedalPhase+=this.motion.speed*dt*2.4;for(const w of this.wheels)w.rotation.x+=this.motion.speed*dt/.4;for(const w of this.assetWheels||[])w.rotation.x-=this.motion.speed*dt/.363;this.crank.rotation.x=this.pedalPhase;if(this.assetCrank)this.assetCrank.rotation.x=-this.pedalPhase;this.legs.forEach((leg,i)=>{leg.position.y=-.15+Math.sin(this.pedalPhase+i*Math.PI)*.09;leg.rotation.x=Math.cos(this.pedalPhase+i*Math.PI)*.45;});}
}
