import * as THREE from 'three';
import {box,label} from '../shared.js';
import {beam} from '../architecture.js';
import {BRIDGE} from '../../world/cityLayout.js';
export const truongTien={id:'truong-tien',title:'Cầu Trường Tiền',position:{x:BRIDGE.x,z:BRIDGE.z},radius:30,referenceImage:new URL('../../assets/cau truong tien.jpg',import.meta.url).href,description:'Sáu khoang vòm thép cao, mặt cầu rộng với hai làn xe và lối đi bộ riêng. Hãy đi bên phải và chú ý xe ngược chiều.',create(){
  const g=new THREE.Group(),deck=BRIDGE.deck,length=BRIDGE.length;g.add(box([BRIDGE.width,.36,length],'#687276',[0,deck-.18,0]));
  for(const x of [-7,7])g.add(box([1.5,.12,length],'#b6b1a2',[x,deck+.06,0]));
  for(let z=-length/2;z<length/2;z+=5)g.add(box([.12,.025,2.8],'#e1cd8a',[0,deck+.02,z]));
  for(let span=0;span<6;span++){
    const z0=-length/2+span*length/6,len=length/6;
    for(const x of [-6.1,6.1])for(let j=0;j<8;j++){
      const t=j/8,u=(j+1)/8,z=z0+t*len,zz=z0+u*len,y=deck+.3+5.2*Math.sin(t*Math.PI),yy=deck+.3+5.2*Math.sin(u*Math.PI);
      g.add(beam([x,y,z],[x,yy,zz],.11),beam([x,deck+.1,z],[x,y,z],.055),beam([x,deck+.1,z],[x,yy,zz],.045));
      if(j===4)g.add(beam([-6.1,y,z],[6.1,y,z],.065));
    }
    if(span>0)g.add(box([12,2.8,1.2],'#a49e89',[0,.3,z0]));
  }
  for(const x of [-7.8,7.8]){g.add(beam([x,deck+1.1,-length/2],[x,deck+1.1,length/2],.05));for(let z=-length/2;z<=length/2;z+=.8)g.add(beam([x,deck,z],[x,deck+1.1,z],.03));}
  const name=label('Cầu Trường Tiền');name.position.y=9;g.add(name);return g;
}};
