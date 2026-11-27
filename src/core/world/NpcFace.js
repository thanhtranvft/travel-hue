import * as THREE from 'three';

const sphere = new THREE.SphereGeometry(1, 10, 8);
const materials = new Map();
const material = color => {
  if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.72}));
  return materials.get(color);
};

// Local +Z is the face direction. Attach to the head so all head motion is inherited.
export function addNpcFace(head, radius = .18) {
  if(head.getObjectByName('npc-face'))return;
  const face=new THREE.Group();face.name='npc-face';head.add(face);
  const part=(name,color,x,y,z,sx,sy,sz)=>{
    const mesh=new THREE.Mesh(sphere,material(color));mesh.name=name;
    mesh.position.set(x*radius,y*radius,z*radius);
    mesh.scale.set(sx*radius,sy*radius,sz*radius);face.add(mesh);return mesh;
  };
  for(const side of [-1,1]){
    part('eye-white','#fff9ed',side*.34,.13,.91,.19,.14,.08);
    part('eye-pupil','#241c19',side*.34,.12,.98,.09,.105,.035);
    part('eye-highlight','#ffffff',side*.32,.15,1.015,.026,.03,.012);
    part('eyebrow','#3b2921',side*.34,.36,.89,.20,.035,.035);
    part('cheek','#dca18d',side*.53,-.23,.82,.13,.07,.035);
  }
  part('nose','#dba88a',0,-.07,1,.11,.14,.13);
  part('smile','#864a43',0,-.40,.90,.23,.055,.035);
  part('lower-lip','#d08d80',0,-.455,.88,.16,.028,.025);
  return face;
}
