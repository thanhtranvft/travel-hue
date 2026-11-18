import test from 'node:test';import assert from 'node:assert/strict';
import {BicycleMotion,wrapAngle} from '../src/vehicle/BicycleMotion.js';
import {drivingKey} from '../src/core/keyboardInput.js';
test('physical WASD keys work independently of keyboard layout and letter case',()=>{assert.equal(drivingKey({code:'KeyD',key:'D'}),'d');assert.equal(drivingKey({code:'KeyA',key:'â'}),'a');assert.equal(drivingKey({key:'ArrowRight'}),'arrowright');});
test('switching A to D changes yaw direction on the next physics tick at every heading',()=>{for(const heading of [0,.7,Math.PI,-Math.PI/2]){const b=new BicycleMotion();b.reset(heading);b.speed=4;for(let i=0;i<30;i++)b.step(1/120,1,1);const before=b.heading;b.step(1/120,1,-1);assert.ok(wrapAngle(b.heading-before)<0);const right=b.heading;b.step(1/120,1,1);assert.ok(wrapAngle(b.heading-right)>0);}});
test('steering reaches useful lock quickly and releases without drifting',()=>{const b=new BicycleMotion();b.speed=3;for(let i=0;i<12;i++)b.step(1/120,1,1);assert.ok(b.steering>.35);for(let i=0;i<40;i++)b.step(1/120,1,0);assert.ok(Math.abs(b.steering)<.002);});
