import * as THREE from 'three';
import {box} from '../landmarks/shared.js';
import {roadWidth,isFootway} from './roadProfile.js';
import {nearestPoint,inside} from '../geography/geometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {roadsidePoint,onOtherCarriageway} from './streetPlacement.js';
import {buildingDetails} from '../data/buildingCatalog.js';

function sign(text,width=7){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle='#174b56';c.fillRect(0,0,1024,160);c.strokeStyle='#f0ead6';c.lineWidth=6;c.strokeRect(5,5,1014,150);let size=60;do{c.font=`bold ${size--}px sans-serif`;}while(c.measureText(text).width>970&&size>16);c.fillStyle='#fff5d9';c.textAlign='center';c.fillText(text,512,103);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(width,width/6.4),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide}));}
export function addStreetDetails(world,features){
 const {scene,renderRoads}=world;world.buildingLabels=[];world.streetLampPositions=[];let markers=0;const paint=[];const addPaint=mesh=>{mesh.updateMatrix();const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrix);paint.push(geometry);mesh.geometry.dispose();};
 const material=new THREE.MeshStandardMaterial({color:'#eadfac'}),white=new THREE.MeshStandardMaterial({color:'#eee9da'});
 for(const road of renderRoads.filter(r=>!isFootway(r))){
  let distance=0,lastSign=-140;
  for(let i=1;i<road.points.length;i++){
   const a=road.points[i-1],b=road.points[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(!len)continue;const nx=-dz/len,nz=dx/len;
   const surface=d=>world.roadHeight(road,i-1)*(1-d/len)+world.roadHeight(road,i)*d/len;
   for(let d=1;d<len;d+=2){const length=Math.min(2,len-d),mid=d+length/2,p=roadsidePoint(a,b,mid,0);if(onOtherCarriageway(p,road,renderRoads,1))continue;
    if(Math.floor((distance+d)/3)%2){const dash=new THREE.Mesh(new THREE.PlaneGeometry(.15,length),material);dash.rotation.set(-Math.PI/2,0,Math.atan2(dx,dz));dash.position.set(p.x,surface(mid)+.035,p.z);addPaint(dash);markers++;}
    for(const side of [-1,1]){const e=roadsidePoint(a,b,mid,roadWidth(road)/2-.4,side);if(onOtherCarriageway(e,road,renderRoads,1))continue;const edge=new THREE.Mesh(new THREE.PlaneGeometry(.12,length),white);edge.rotation.set(-Math.PI/2,0,Math.atan2(dx,dz));edge.position.set(e.x,surface(mid)+.03,e.z);addPaint(edge);}
   }
   if(road.tags.name&&distance-lastSign>120&&len>6){for(const direction of road.tags.oneway==='yes'?[1]:[1,-1]){const p=roadsidePoint(a,b,Math.min(12,len/2),roadWidth(road)/2+1.5,direction);if(onOtherCarriageway(p,road,renderRoads,2))continue;const y=surface(Math.min(12,len/2)),pole=box([.12,4,.12],'#526363',[p.x,y+2,p.z]),label=sign(road.tags.name,3.2);label.position.set(p.x,y+3.6,p.z);label.rotation.y=Math.atan2(-dx*direction,-dz*direction);scene.add(pole,label);}lastSign=distance;
    for(const side of [-1,1]){const p=roadsidePoint(a,b,Math.min(12,len/2),roadWidth(road)/2+1.8,side);if(onOtherCarriageway(p,{id:null},renderRoads,1))continue;const lamp=new THREE.Group();lamp.position.set(p.x,surface(Math.min(12,len/2)),p.z);lamp.add(box([.18,7,.18],'#455755',[0,3.5,0]),box([1.4,.14,.2],'#455755',[.6,7,0]),box([.8,.12,.4],'#f2e1ad',[1,6.9,0]));scene.add(lamp);world.streetLampPositions.push(p);}
   }
   distance+=len;
  }
 }
 for(const f of features.filter(f=>f.type==='way'&&f.tags?.building&&f.geometry?.length>3)){
  const points=f.geometry.map(p=>world.projectPoint(p)),center=points.reduce((a,p)=>({x:a.x+p.x/points.length,z:a.z+p.z/points.length}),{x:0,z:0});
  if(center.x<world.bounds.minX||center.x>world.bounds.maxX||center.z<world.bounds.minZ||center.z>world.bounds.maxZ)continue;
  if(!world.buildingPolygons.some(b=>inside(center,b.points)))continue;
  const hit=renderRoads.filter(r=>r.tags.name&&!isFootway(r)).map(r=>({...nearestPoint(center,r.points),road:r})).sort((a,b)=>a.distance-b.distance)[0];if(!hit||hit.distance>135)continue;
  const details=buildingDetails(f),title=details.needsName?details.name:`${details.code||''} · ${details.name}`;
  const label=sign(`${title} · ${details.address||'Chưa có địa chỉ'}`,12);label.userData.building=details;label.position.set(center.x,Math.min(45,Number.parseFloat(f.tags.height)||Number(f.tags['building:levels']||2)*3.2)+3,center.z);scene.add(label);world.buildingLabels.push(label);
 }
 // Trees follow pavements, with river/building rejection; these are landscape decorations.
 for(const road of renderRoads.filter(r=>!isFootway(r)&&r.tags.name).sort((a,b)=>(b.tags.name==='Lê Lợi')-(a.tags.name==='Lê Lợi')))for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);for(let d=6;d<len;d+=16)for(const side of [-1,1]){const p=roadsidePoint(a,b,d,roadWidth(road)/2+3,side);if(world.riverRings.some(r=>inside(p,r))||world.buildingPolygons.some(b=>inside(p,b.points))||onOtherCarriageway(p,road,renderRoads,2))continue;if(world.treePositions.length<480&&!world.treePositions.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<5))world.treePositions.push(p);}
 }
 if(paint.length){scene.add(new THREE.Mesh(mergeGeometries(paint),white));paint.forEach(g=>g.dispose());}
 for(let i=0;i<world.treePositions.length;i+=7){const p=world.treePositions[i],tree=new THREE.Group();tree.add(box([.24,3,.24],'#796346',[0,1.5,0]));for(let j=0;j<3;j++){const crown=new THREE.Mesh(new THREE.ConeGeometry(1.5-j*.28,2.5,10),new THREE.MeshStandardMaterial({color:['#486d47','#527e49','#68964c'][j]}));crown.position.y=3+j*.9;tree.add(crown);}tree.position.set(p.x+3,0,p.z);scene.add(tree);}
 world.streetDetailCounts={laneMarkers:markers,buildingLabels:world.buildingLabels.length};
}
