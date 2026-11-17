import * as THREE from 'three';
import {box,label,mat} from '../shared.js';
import {tiledRoof} from '../architecture.js';
export const quocHoc={id:'quoc-hoc',title:'Bia Quốc Học',position:{x:-42,z:26},radius:12,referenceImage:new URL('../../assets/bia quoc hoc hue.jpg',import.meta.url).href,description:'Công trình được dựng lại theo ảnh tham khảo: sân bậc cấp, bình phong trung tâm, mái ngói và hai trụ biểu.',create(){
  const g=new THREE.Group();
  for(let i=0;i<7;i++)g.add(box([15-i*.25,.18,6.5-i*.5],'#817a68',[0,.09+i*.18,0]));
  for(const x of [-5.4,5.4]){g.add(box([3.8,1.3,2.2],'#90816b',[x,1.8,0]));for(let a=-1.5;a<1.6;a+=.6)g.add(box([.26,.6,.12],'#6e7365',[x+a,2.1,-1.16]));}
  g.add(box([6.3,3.5,.75],'#bda176',[0,3.1,0]),box([5.2,2.35,.08],'#dac39a',[0,3.35,-.43]));
  for(const x of [-3.5,3.5]){g.add(box([.6,4,.85],'#7c7060',[x,3.3,0]));for(let y=2;y<5;y+=.5)g.add(box([.7,.08,.95],'#bbb08c',[x,y,0]));}
  g.add(tiledRoof(8.8,2.8,5.2,'#8b7355'));g.add(box([2,1.2,.9],'#b69d75',[0,6.5,0]),tiledRoof(2.8,1.9,7.1,'#78684f'));
  for(const x of [-9,9]){g.add(box([1.5,.4,1.5],'#878273',[x,.2,0]));const pole=new THREE.Mesh(new THREE.CylinderGeometry(.28,.46,6.5,8),mat('#8a7e65'));pole.position.set(x,3.65,0);g.add(pole);for(const y of [1,5.8,6.4])g.add(box([.95,.22,.95],'#aaa080',[x,y,0]));const cap=new THREE.Mesh(new THREE.SphereGeometry(.48,10,8),mat('#6d7567'));cap.position.set(x,7,0);g.add(cap);}
  const name=label('Bia Quốc Học');name.position.y=9;g.add(name);return g;
}};
