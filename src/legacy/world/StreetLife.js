import * as THREE from 'three';
import {box,mat} from '../../core/shared/architecture/shared.js';
import {makePerson} from '../../core/world/People.js';

function sign(text){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#602e24';ctx.fillRect(0,0,768,160);ctx.strokeStyle='#e1bd6d';ctx.lineWidth=8;ctx.strokeRect(8,8,752,144);ctx.fillStyle='#ffedbf';ctx.font='bold 45px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,85);ctx.font='19px sans-serif';ctx.fillText('HƯƠNG VỊ HUẾ · MỜI BẠN GHÉ CHƠI',384,125);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(6.8,1.4),new THREE.MeshStandardMaterial({map:texture,roughness:.8,side:THREE.DoubleSide}));mesh.position.set(0,3.25,.05);return mesh;}
export function addStreetLife(scene,obstacles){
  const names=['BÚN BÒ HUẾ','CƠM HẾN','CÀ PHÊ SÔNG HƯƠNG','NHÀ HÀNG AN NHIÊN'];
  const xs=[-105,-85,-15,35,55,95];
  for(const side of [-1,1])for(let index=0;index<xs.length;index++){
    const x=xs[index],group=new THREE.Group(),color=['#b06a42','#5f8a78','#b99959'][index%3];group.add(sign(names[index%names.length]));
    for(let stripe=0;stripe<12;stripe++){const awning=box([.58,.1,3.5],stripe%2?'#e6d8b7':color,[-3.2+stripe*.58,2.5,1.7]);awning.rotation.x=.12;group.add(awning);}
    group.add(box([6.8,.5,.15],color,[0,2.05,3.4]));
    for(const tx of [-1.8,1.8]){
      const table=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.09,16),mat('#b39a70'));table.position.set(tx,.77,4.2);group.add(table,box([.09,.75,.09],'#454b42',[tx,.37,4.2]));
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8,0,Math.PI*2,0,Math.PI/2),mat('#eee1b6'));bowl.rotation.x=Math.PI;bowl.position.set(tx,.88,4.2);group.add(bowl);
      for(const direction of [-1,1]){group.add(box([.45,.08,.45],'#8c4e38',[tx+direction*.95,.43,4.2]),box([.45,.42,.09],'#8c4e38',[tx+direction*.95,.68,4.45]));const patron=makePerson(index%2?'#c0a472':'#a9715a',true);patron.position.set(tx+direction*.95,-.4,4.2);patron.rotation.y=direction>0?-Math.PI/2:Math.PI/2;group.add(patron);}
    }
    group.position.set(x,.23,side*51);if(side>0)group.rotation.y=Math.PI;scene.add(group);
    // Tables stay outside the public sidewalk, with explicit footprints.
    obstacles.push({minX:x-3.3,maxX:x+3.3,minZ:side>0?45.7:-48,maxZ:side>0?48:-45.7});
  }
}
