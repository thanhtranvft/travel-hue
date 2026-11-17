import * as THREE from 'three';
export const mat = (color, roughness=.75, metalness=.05) => new THREE.MeshStandardMaterial({color,roughness,metalness});
export function box(size, color, position=[0,0,0]){ const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color)); m.position.set(...position); m.castShadow=m.receiveShadow=true; return m; }
export function roof(width,depth,color,y){ const r=new THREE.Mesh(new THREE.ConeGeometry(width*.72,2.1,4),mat(color)); r.rotation.y=Math.PI/4; r.scale.z=depth/width; r.position.y=y; r.castShadow=true; return r; }
export function label(text){ const c=document.createElement('canvas'); c.width=512;c.height=96; const x=c.getContext('2d'); x.fillStyle='#102522dd';x.roundRect(5,5,502,86,20);x.fill();x.fillStyle='#ffe4a3';x.font='600 30px sans-serif';x.textAlign='center';x.fillText(text,256,59); const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));s.scale.set(10,1.9,1);s.position.y=7;return s; }
