import test from 'node:test';import assert from 'node:assert/strict';
import {sweptContact} from '../src/core/traffic/collision.js';
import {BRIDGE,CITY,bridgeHeight} from '../src/core/world/cityLayout.js';
test('đối đầu tốc độ cao vẫn bắt được va chạm giữa hai frame',()=>assert.ok(sweptContact({x:-4,z:0},{x:4,z:0},{x:4,z:0},{x:-4,z:0},1)));
test('xe đi đúng hai làn riêng không bị báo va chạm',()=>assert.equal(sweptContact({x:-4,z:35.5},{x:4,z:35.5},{x:4,z:28.5},{x:-4,z:28.5},2.1),false));
test('đi song song gần và vật thể đứng yên xử lý được',()=>{assert.ok(sweptContact({x:0,z:0},{x:0,z:0},{x:.4,z:0},{x:.4,z:0},.8));assert.equal(sweptContact({x:0,z:0},{x:0,z:1},{x:4,z:0},{x:4,z:1},1),false);});
test('mặt cầu rộng và cao; hai dốc nối liên tục tới mặt đường',()=>{assert.ok(BRIDGE.width>CITY.roadWidth);assert.ok(BRIDGE.deck>2);for(const side of [-1,1]){assert.equal(bridgeHeight(side*24),BRIDGE.deck);assert.ok(Math.abs(bridgeHeight(side*34)-BRIDGE.ground)<1e-9);assert.ok(Math.abs(bridgeHeight(side*(24+1e-6))-BRIDGE.deck)<1e-6);}});
