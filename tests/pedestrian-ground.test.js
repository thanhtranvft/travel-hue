import test from 'node:test';
import assert from 'node:assert/strict';
import {pedestrianSurface,PedestrianLife} from '../src/core/world/PedestrianLife.js';

test('pedestrians follow current paving, lawn and wooden deck levels rather than fixed height',()=>{
  const world={groundAt:(x,z,reference)=>x<0?0.13:x<5?0.24:reference};
  const person={mesh:{position:{x:-1,z:0}},fixedY:0.36};
  assert.equal(pedestrianSurface(world,person),0.13);
  person.mesh.position.x=2;
  assert.equal(pedestrianSurface(world,person),0.24);
  person.mesh.position.x=8;
  assert.equal(pedestrianSurface(world,person),0.36);
});

test('walkers resample the surface after movement and stationary people remain grounded',()=>{
  const make=(mode)=>({mode,mesh:{position:{x:0,y:-1,z:0},rotation:{},userData:{limbs:{arms:[],legs:[]}}},origin:{x:0,z:0},phase:0,pause:0,start:{x:0,z:0},end:{x:10,z:0},fixedY:0.17});
  const life=Object.create(PedestrianLife.prototype);
  life.world={groundAt:x=>x>3?0.36:0.24};
  life.people=[make('walk'),make('chat')];
  life.update(1,{x:0,z:0});
  assert.equal(life.people[0].mesh.position.y,0.36);
  assert.equal(life.people[1].mesh.position.y,0.24);
});
