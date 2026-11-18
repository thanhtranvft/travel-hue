import * as THREE from 'three';
import config from '../data/school-gates.json' with {type:'json'};
import {box,roof} from './shared.js';
import {pointsOf,roads} from '../geography/map.js';
import {nearestPoint} from '../geography/geometry.js';

export function gateNamePanel(title,address,width=8.6,height=1.3){const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#0863b8';c.fillRect(0,0,1536,256);c.fillStyle='#fff';c.textAlign='center';c.font='bold 86px Arial';c.fillText(title,768,110,1450);c.font='bold 62px Arial';c.fillText(address,768,210);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide}));panel.name='gate-name-panel';return panel;}

export function schoolGatePlacement(site){
 const leLoi=roads.filter(r=>r.tags.name==='Lê Lợi');
 if(site.anchor.kind==='mapped-entrance'){const hit=leLoi.map(r=>nearestPoint(site.sign,r.points)).sort((a,b)=>a.distance-b.distance)[0];return {...site.sign,heading:Math.atan2(hit.x-site.sign.x,hit.z-site.sign.z),confidence:'mapped'};}
 // Pending a mapped entrance: use the midpoint of the campus frontage edge,
 // explicitly retain estimated status rather than inventing a verified gate GPS.
 const points=pointsOf(site.feature),edges=[];for(let i=1;i<points.length;i++){const p={x:(points[i-1].x+points[i].x)/2,z:(points[i-1].z+points[i].z)/2},hit=leLoi.map(r=>nearestPoint(p,r.points)).sort((a,b)=>a.distance-b.distance)[0];edges.push({p,hit});}edges.sort((a,b)=>a.hit.distance-b.hit.distance);const {p,hit}=edges[0];return {...p,heading:Math.atan2(hit.x-p.x,hit.z-p.z),confidence:'estimated-frontage'};
}
export function createSchoolGate(site){const data=config[site.id];if(!data)return null;const group=new THREE.Group(),w=data.width;
 for(const x of [-w/2,w/2]){group.add(box([1,4.7,1],data.color,[x,2.35,0]),box([1.35,.3,1.35],data.trim,[x,4.7,0]),box([1.3,.25,1.3],data.trim,[x,.125,0]),box([4,1.7,.4],data.wallColor||data.color,[x+Math.sign(x)*2.5,.85,0]));}
 group.add(box([w,1,.55],data.color,[0,4,0]),box([w+.6,.22,.85],data.trim,[0,4.6,0]));
 if(data.style==='tiled')for(const x of [-w/2,0,w/2]){const r=roof(x===0?6:2.3,1.7,'#8d392a',6.1);r.position.x=x;group.add(r);group.add(box([x===0?6:1.1,.3,1.1],data.color,[x,4.9,0]));}else{const arch=new THREE.Mesh(new THREE.TorusGeometry(1.7,.16,6,32,Math.PI),new THREE.MeshStandardMaterial({color:data.trim}));arch.position.set(0,4.65,0);group.add(arch);}
 const panel=gateNamePanel(data.title,data.address);panel.position.set(0,4.05,.65);group.add(panel,box([8,.12,20],'#c7bea7',[0,-.02,-7]));
 // Open metal leaves alongside the pillars; the central entrance stays clear.
 for(const side of [-1,1])for(let i=0;i<10;i++)group.add(box([.055,2.1,.06],'#435856',[side*(w/2+.3+i*.25),1.3,.3]));
 return {object:group,placement:schoolGatePlacement(site)};
}
