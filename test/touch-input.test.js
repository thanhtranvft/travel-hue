import test from 'node:test';import assert from 'node:assert/strict';
import {stickInput} from '../src/core/touchMath.js';
test('cần lái có deadzone và giới hạn khi kéo ra ngoài pad',()=>{assert.equal(stickInput(1,1,45).throttle,0);const input=stickInput(200,-200,45);assert.ok(Math.abs(Math.hypot(input.x,input.y)-45)<1e-9);assert.ok(input.throttle<=1&&input.steer>=-1);});
test('một ngón có thể vừa đạp vừa cua hoặc kéo xuống để lùi',()=>{const right=stickInput(30,-20,45);assert.ok(right.throttle>0&&right.steer<0);const left=stickInput(-45,0,45);assert.ok(left.throttle>0&&left.steer>0);const reverse=stickInput(0,45,45);assert.equal(reverse.throttle,-1);assert.equal(reverse.steer,0);});
