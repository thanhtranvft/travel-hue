import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from 'three';
import {roadsidePoint,onOtherCarriageway} from '../src/core/world/streetPlacement.js';
import {roadWidth} from '../src/core/world/roadProfile.js';
import {nearestPoint} from '../src/core/shared/geography/geometry.js';
import {routeTrafficSign} from '../src/core/world/TrafficBoard.js';
import {GeographicWorld} from '../src/core/world/GeographicWorld.js';
import {loadGeography} from '../src/modules/areas/AreaModel.js';

function withMockDocument(fn){
 const prev=globalThis.document,noop=()=>{},grad=()=>({addColorStop:noop});
 const ctx={fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'center',textBaseline:'middle',fillRect:noop,clearRect:noop,strokeRect:noop,rect:noop,roundRect:noop,beginPath:noop,moveTo:noop,lineTo:noop,quadraticCurveTo:noop,bezierCurveTo:noop,closePath:noop,stroke:noop,fill:noop,arc:noop,clip:noop,fillText:noop,strokeText:noop,ellipse:noop,measureText:(t='')=>({width:t.length*20}),scale:noop,translate:noop,rotate:noop,setLineDash:noop,createLinearGradient:grad,createRadialGradient:grad,save:noop,restore:noop};
 globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>ctx})};
 try{return fn();}finally{globalThis.document=prev;}
}

test('posts are to the right in either direction',()=>{const a={x:0,z:0},b={x:0,z:100};assert.deepEqual(roadsidePoint(a,b,20,9,1),{x:-9,z:20});assert.deepEqual(roadsidePoint(a,b,20,9,-1),{x:9,z:20});});
test('crossing pavement is excluded from paint and roadside decorations',()=>{const road={id:1,tags:{highway:'secondary'},points:[{x:0,z:0},{x:0,z:100}]},cross={id:2,tags:{highway:'secondary'},points:[{x:-50,z:50},{x:50,z:50}]};assert.ok(onOtherCarriageway({x:0,z:50},road,[road,cross]));assert.equal(onOtherCarriageway({x:0,z:25},road,[road,cross]),false);});

test('routeTrafficSign builds realistic regulatory, directional warning, speed-limit, no-parking, and compact street-name signs',()=>{
 withMockDocument(()=>{
  for(const variant of ['no-car-time','direction-warning','no-parking','speed-limit','street-name']){
   const sign=routeTrafficSign({variant,title:'HƯỚNG ĐI · CẦU TRÀNG TIỀN',subtitle:'ĐƯỜNG LÊ LỢI'});
   assert.equal(sign.userData.routeSign?.variant,variant);
   let signFaces=0;
   sign.traverse(o=>{if(o.userData?.signFace)signFaces++;});
   assert.ok(signFaces>=1,`${variant} exposes readable signFace geometry`);
  }
 });
});

test('GeographicWorld mounts varied route traffic signs strictly on the right shoulder without cluttering carriageways',async()=>{
 for(const areaId of ['quoc-hoc','quang-trung']){
  const region=await loadGeography(areaId);
  withMockDocument(()=>{
   const world=new GeographicWorld(new THREE.Scene());
   world.region=region;
   world.build();
   assert.ok(Array.isArray(world.routeSignPlacements)&&world.routeSignPlacements.length>=6,`${areaId} places route signs`);
   const variants=new Set(world.routeSignPlacements.map(s=>s.variant));
   assert.ok(variants.size>=2,`${areaId} renders varied regulatory/guidance signs (${[...variants].join(', ')})`);
   for(const s of world.routeSignPlacements){
    const road=world.renderRoads.find(r=>r.id===s.roadId);
    assert.ok(road,`route sign references valid road ${s.roadId}`);
    const hit=nearestPoint(s,road.points);
    const right=(s.x-hit.x)*-Math.cos(s.heading)+(s.z-hit.z)*Math.sin(s.heading);
    assert.ok(right>roadWidth(road)/2,`route sign (${s.variant}) on ${s.roadName} mounts on right shoulder (${right.toFixed(2)} > ${(roadWidth(road)/2).toFixed(2)})`);
    assert.equal(onOtherCarriageway(s,{id:null},world.renderRoads,1),false,`route sign (${s.variant}) stays clear of carriageways`);
   }
  });
 }
});
