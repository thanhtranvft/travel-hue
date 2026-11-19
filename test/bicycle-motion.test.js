import test from 'node:test';
import assert from 'node:assert/strict';
import {BicycleMotion,wrapAngle} from '../src/core/vehicle/BicycleMotion.js';
import {districts} from '../src/legacy/routes/districts.js';

test('tăng tốc có giới hạn và phanh dừng mà không đổi chiều',()=>{
  const bike=new BicycleMotion();for(let i=0;i<2400;i++)bike.step(1/120,1,0);
  assert.ok(bike.speed<=9&&bike.speed>8);
  for(let i=0;i<240;i++)bike.step(1/120,0,0,true);
  assert.equal(bike.speed,0);
});
test('trả lái mượt và ổn định giữa 60/120 Hz',()=>{
  const run=hz=>{const b=new BicycleMotion();let x=0,z=0;for(let i=0;i<hz*4;i++){const p=b.step(1/hz,1,i<hz*2?.4:0);x+=p.dx;z+=p.dz;}return {b,x,z};};
  const a=run(60),b=run(120);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.2);assert.ok(Math.abs(a.b.steering)<.001);assert.ok(Number.isFinite(a.b.lean));
  assert.ok(Math.abs(wrapAngle(Math.PI*4+.2)-.2)<1e-10);
});
test('các khu vực có mã duy nhất và tuyến dài đủ để tham quan',()=>{
  assert.equal(new Set(districts.map(d=>d.id)).size,districts.length);
  for(const district of districts){assert.ok(district.path.length>=5);assert.ok(Number.isFinite(district.spawn.heading));assert.ok(district.path.every(p=>p.length===2&&p.every(Number.isFinite)));}
});
