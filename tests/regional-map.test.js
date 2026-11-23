import test from 'node:test';import assert from 'node:assert/strict';
import {geoDistricts,regionContains} from '../src/modules/areas/AreaModel.js';
import {readFile} from 'node:fs/promises';
import {renderQuality} from '../src/core/rendering/renderQuality.js';
test('five area packages cover their own tour and reject remote coordinates',async()=>{for(const d of geoDistricts){const {region,elements}=JSON.parse(await readFile(new URL(`../src/modules/areas/${d.id}/model/osm.json`,import.meta.url),'utf8'));assert.equal(region.id,d.id);assert.ok(elements.length<500);for(const [x,z]of d.path)assert.equal(regionContains(region,x,z),true,`${d.id} route vertex`);assert.equal(regionContains(region,region.bounds.maxX+1000,region.bounds.maxZ+1000),false);}});
test('mobile quality caps resolution, shadows and physics catch-up work',()=>{const quality=renderQuality({coarse:true,width:844,dpr:3});assert.equal(quality.mobile,true);assert.equal(quality.pixelRatio,2);assert.equal(quality.shadows,false);assert.equal(quality.physicsHz,60);assert.equal(quality.maxSubsteps,4);assert.ok(quality.grassSamples<18000);assert.equal(renderQuality({width:1440,dpr:2}).mobile,false);});
