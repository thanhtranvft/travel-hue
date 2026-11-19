import test from 'node:test'; import assert from 'node:assert/strict'; import { landmarkModules,validateLandmarks } from '../src/core/shared/architecture/registry.js';
test('đăng ký bốn landmark độc lập và không trùng mã',()=>{assert.equal(validateLandmarks(),true);assert.equal(landmarkModules.length,4);assert.equal(new Set(landmarkModules.map(x=>x.id)).size,4)});
test('mỗi landmark có vùng kích hoạt hợp lệ',()=>{for(const item of landmarkModules){assert.ok(item.radius>0);assert.equal(typeof item.position.x,'number');assert.equal(typeof item.position.z,'number')}});
