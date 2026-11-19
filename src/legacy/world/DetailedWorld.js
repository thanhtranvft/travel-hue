import * as THREE from 'three';
import { box,mat } from '../../core/shared/architecture/shared.js';
import { landmarkModules,validateLandmarks } from '../../core/shared/architecture/registry.js';
import {surfaceTexture} from '../../core/world/surfaceTextures.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {CITY,BRIDGE,bridgeHeight} from '../../core/world/cityLayout.js';
import {addStreetLife} from './StreetLife.js';
export class HueWorld {
  constructor(scene){this.scene=scene;this.landmarks=new Map();this.cameraObstacles=[];this.obstacles=[];this.treePositions=[];this.treeFallback=[];}
  build(){
    const scene=this.scene;
    const asphalt=surfaceTexture('asphalt'),paving=surfaceTexture('paving');
    const add=(size,color,x,y,z)=>{const m=box(size,color,[x,y,z]);if(size[0]>20&&size[1]<.3&&y>0){const texture=(color==='#555b59'?asphalt:paving).clone();texture.repeat.set(size[0]/3,size[2]/3);m.material.map=texture;m.material.color.set('#ffffff');}scene.add(m);if(size[1]>3&&size[2]>4){this.cameraObstacles.push(m);this.obstacles.push({minX:x-size[0]/2-.25,maxX:x+size[0]/2+.25,minZ:z-size[2]/2-.25,maxZ:z+size[2]/2+.25});}return m;};
    scene.background=new THREE.Color('#b6d3e2');scene.fog=new THREE.Fog('#b6cdd2',110,260);
    add([380,.2,280],'#799263',0,-.2,0);
    this.water=new THREE.Mesh(new THREE.PlaneGeometry(380,CITY.riverHalfWidth*2,180,12),new THREE.MeshPhysicalMaterial({color:'#3a7e88',roughness:.22,metalness:.35,clearcoat:1}));this.water.rotation.x=-Math.PI/2;this.water.position.y=.03;scene.add(this.water);
    for(const side of [-1,1]){
      add([300,.14,4],'#c5bda7',0,.17,side*CITY.promenade);add([300,.1,CITY.roadWidth],'#555b59',0,.12,side*CITY.roadCenter);add([300,.18,5],'#d8ccb5',0,.18,side*CITY.sidewalk);
      for(let x=-140;x<145;x+=7){add([3,.025,.13],'#e8d8a7',x,.2,side*CITY.roadCenter);for(const edge of [CITY.roadCenter-6.8,CITY.roadCenter+6.8])add([6.9,.025,.13],'#eee6ce',x,.2,side*edge);}
      for(let x=-135;x<140;x+=9){
        if(x>1&&x<22)continue;
        this.treePositions.push({x,z:side*CITY.treeLine});this.obstacles.push({minX:x-.3,maxX:x+.3,minZ:side*CITY.treeLine-.3,maxZ:side*CITY.treeLine+.3});
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.25,3.8,9),mat('#75624a'));trunk.position.set(x,1.9,side*CITY.treeLine);scene.add(trunk);this.treeFallback.push(trunk);
        for(let i=0;i<6;i++){const a=i*2.4,leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),mat(['#668448','#7f9958','#547448'][i%3]));leaf.position.set(x+Math.cos(a),3.7+(i%3)*.35,side*CITY.treeLine+Math.sin(a));leaf.scale.y=.75;leaf.castShadow=true;scene.add(leaf);this.treeFallback.push(leaf);}
        add([2,.14,.6],'#886549',x+3,.65,side*19.3);add([2,.6,.1],'#886549',x+3,1,side*19.3-.25);
        for(const leg of [-.7,.7])add([.12,.65,.45],'#36433a',x+3+leg,.3,side*19.3);
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.12,4.6,8),mat('#35453d'));pole.position.set(x+4,2.3,side*16.2);scene.add(pole);add([.45,.6,.45],'#f0dda2',x+4,4.6,side*16.2);add([.7,.15,.7],'#35453d',x+4,4.95,side*16.2);
      }
      for(let x=-125;x<130;x+=10){
        if(side<0&&x>-55&&x<-15||side>0&&x>-55&&x<-32)continue;
        const h=4.5+Math.abs(x%3)*.7,z=side*CITY.houseLine;add([7.5,h,6],['#decca6','#d9c49e','#e5d6ba'][Math.abs(x)%3],x,h/2,z);
        for(const y of [1.5,3.4])for(const a of [-2.4,0,2.4]){add([1.25,1.45,.12],'#526d66',x+a,y,z-side*3.08);add([1.5,.12,.3],'#eee1bc',x+a,y-.8,z-side*3.12);}
        add([7.8,.2,6.2],'#e9d9b4',x,h,z);const roof=new THREE.Mesh(new THREE.ConeGeometry(5.8,2,4),mat('#9b614c'));roof.rotation.y=Math.PI/4;roof.scale.z=.8;roof.position.set(x,h+1,z);roof.castShadow=true;scene.add(roof);
      }
    }
    add([44,.15,35],'#c8bca3',-30,.14,-58);
    // Access road connects the northern bank to the ceremonial square.
    add([7,.14,17],'#555b59',-12,.2,-42);
    for(const side of [-1,1]){const rampGeometry=new THREE.PlaneGeometry(BRIDGE.width,BRIDGE.rampLength);rampGeometry.rotateX(-Math.PI/2);const ramp=new THREE.Mesh(rampGeometry,mat('#687276'));ramp.position.set(BRIDGE.x,(BRIDGE.deck+BRIDGE.ground)/2,side*(BRIDGE.length/2+BRIDGE.rampLength/2));const positions=rampGeometry.attributes.position;for(let i=0;i<positions.count;i++)positions.setY(i,bridgeHeight(ramp.position.z+positions.getZ(i))-ramp.position.y);rampGeometry.computeVertexNormals();ramp.receiveShadow=true;scene.add(ramp);}
    const placements={'quoc-hoc':{x:-42,z:49},'ky-dai':{x:-27,z:-53},'ngo-mon':{x:-34,z:-67}};
    validateLandmarks();for(const module of landmarkModules){const object=module.create(),position=placements[module.id]||module.position;object.position.set(position.x,0,position.z);scene.add(object);object.updateMatrixWorld(true);object.traverse(mesh=>{if(!mesh.isMesh||mesh.geometry.type!=='BoxGeometry'||module.id==='truong-tien')return;this.cameraObstacles.push(mesh);const b=new THREE.Box3().setFromObject(mesh);if(b.min.y<1.4&&b.max.y>1.1&&b.max.x-b.min.x>.5)this.obstacles.push({minX:b.min.x-.15,maxX:b.max.x+.15,minZ:b.min.z-.15,maxZ:b.max.z+.15});});this.landmarks.set(module.id,{...module,position,object});}
    addStreetLife(scene,this.obstacles);
    scene.add(new THREE.HemisphereLight('#daedff','#687049',2));const sun=new THREE.DirectionalLight('#fff0d4',3);sun.position.set(-55,85,45);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:250});sun.shadow.normalBias=.035;scene.add(sun);
  }
  update(time){const p=this.water.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*.45+time)*.04+Math.cos(p.getY(i)+time*.7)*.025);p.needsUpdate=true;}
  canRide(x,z){if(Math.abs(x)>CITY.bounds.x||Math.abs(z)>CITY.bounds.z)return false;if(Math.abs(z)<CITY.riverHalfWidth&&(Math.abs(x-BRIDGE.x)>BRIDGE.width/2-.5))return false;return !this.obstacles.some(b=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ);}
  groundAt(x,z){if(Math.abs(x-BRIDGE.x)<=BRIDGE.width/2&&Math.abs(z)<=BRIDGE.length/2+BRIDGE.rampLength)return bridgeHeight(z);return BRIDGE.ground;}
  async loadDetailedTrees(){
    const gltf=await new GLTFLoader().loadAsync(new URL('../../assets/models/trees_v4.glb',import.meta.url).href);
    const template=gltf.scene.getObjectByName('Tree_CoastLiveOak_V4');if(!template)throw new Error('Tree template missing');
    const bounds=new THREE.Box3().setFromObject(template),height=bounds.max.y-bounds.min.y;
    for(let i=0;i<this.treePositions.length;i++){const {x,z}=this.treePositions[i],tree=template.clone(true),scale=(5.5+(i%3)*.3)/height;tree.scale.multiplyScalar(scale);tree.position.set(x,-bounds.min.y*scale,z);tree.rotation.y=(i*2.4)%(Math.PI*2);tree.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});this.scene.add(tree);}
    for(const fallback of this.treeFallback){this.scene.remove(fallback);fallback.geometry.dispose();fallback.material.dispose();}this.treeFallback=[];
  }
}
