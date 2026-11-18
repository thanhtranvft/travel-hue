import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {mountSignPanel} from '../src/world/TrafficBoard.js';
test('a support cannot hide the text when viewed from front or back at any rotation',()=>{
 for(const yaw of [0,.7,Math.PI,-1.8]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(3.6,3.6),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));const sign=mountSignPanel(panel);sign.rotation.y=yaw;sign.updateMatrixWorld(true);
  for(const side of [-1,1])for(const y of [2,2.7,3.3]){
   const origin=sign.localToWorld(new THREE.Vector3(0,y,side*5)),direction=new THREE.Vector3(0,0,-side).transformDirection(sign.matrixWorld),hits=new THREE.Raycaster(origin,direction).intersectObject(sign,true);
   assert.ok(hits.length);assert.equal(hits[0].object.userData.signFace,true,`yaw ${yaw}, side ${side}, y ${y}`);
  }
 }
});
