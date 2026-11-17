import * as THREE from 'three';
import {mat,box} from '../landmarks/shared.js';

export function makePerson(color='#739ba7',seated=false){
  const group=new THREE.Group(),skin=mat('#c59d78'),cloth=mat(color),trousers=mat('#38474a');
  const head=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),skin);head.position.y=1.53;group.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.154,12,8,0,Math.PI*2,0,Math.PI*.55),mat('#35312b'));hair.position.y=1.55;group.add(hair);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.4,4,10),cloth);body.position.y=1.13;group.add(body);
  const legs=[],arms=[];
  for(const x of [-.105,.105]){
    const pivot=new THREE.Group();pivot.position.set(x,.85,0);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.065,.55,3,8),trousers);leg.position.y=-.32;pivot.add(leg,box([.14,.09,.26],'#3a3831',[0,-.72,.05]));if(seated)pivot.rotation.x=-1.2;group.add(pivot);legs.push(pivot);
    const arm=new THREE.Group();arm.position.set(x*2.2,1.34,0);const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.42,3,8),cloth);sleeve.position.y=-.24;arm.add(sleeve);group.add(arm);arms.push(arm);
  }
  if(seated)group.position.y=-.27;
  group.userData.limbs={legs,arms};group.traverse(o=>{if(o.isMesh)o.castShadow=true;});return group;
}
export function animateWalker(group,phase){const {legs,arms}=group.userData.limbs;legs.forEach((leg,i)=>leg.rotation.x=Math.sin(phase+i*Math.PI)*.35);arms.forEach((arm,i)=>arm.rotation.x=-Math.sin(phase+i*Math.PI)*.25);}
