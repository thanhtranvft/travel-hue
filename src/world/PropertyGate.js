import * as THREE from 'three';
import {box} from '../landmarks/shared.js';
import {postedBoard} from './TrafficBoard.js';
export function propertyGateModel(property,heading){const group=new THREE.Group(),width=property.entranceWidth,color=property.style==='wall'?property.color:'#526f72';for(const side of [-1,1])group.add(box([.38,3.3,.38],color,[side*width/2,1.65,0]),box([.52,.18,.52],'#eee9db',[side*width/2,3.35,0]));group.add(box([width+.4,.2,.3],color,[0,3.6,0]));const sign=postedBoard(property.title,'Cổng vào · Lê Lợi',2.6);sign.position.set(width/2+1.7,0,.15);group.add(sign);group.position.set(property.gate.x,.17,property.gate.z);group.rotation.y=heading;return group;}
