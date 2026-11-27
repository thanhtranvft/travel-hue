import test from "node:test";
import assert from "node:assert/strict";
import {BicycleMotion,FOOT_MAX_SPEED} from "../src/core/vehicle/BicycleMotion.js";
import {TouringBike} from "../src/core/vehicle/TouringBike.js";

test("foot jump accelerates within 20 km/h, lands and cannot double jump; bike remains unchanged",()=>{
  const foot=new BicycleMotion("foot");
  for(let i=0;i<20;i++)foot.step(1/60,1,0);
  const before=foot.speed;
  assert.equal(foot.jump(),true);assert.ok(foot.speed>before);
  assert.equal(foot.jump(),false);
  let peak=0;
  for(let i=0;i<120;i++){foot.step(1/60,1,0);peak=Math.max(peak,foot.jumpHeight);assert.ok(foot.speed<=FOOT_MAX_SPEED+1e-6);}
  assert.ok(peak>1.5 && peak<1.85);assert.equal(foot.jumpHeight,0);
  assert.equal(foot.jump(),true);
  foot.setMode("bike");assert.equal(foot.jumpHeight,0);assert.equal(foot.jump(),false);
  for(let i=0;i<600;i++)foot.step(1/60,1,0);
  assert.ok(foot.speed>7.5 && foot.speed<=9);
});

test("traditional avatars have cloth, headwear and animated panels across all activities",()=>{
  for(const id of ["scholar","ao-dai-woman"]){
    const bike=new TouringBike({avatar:id,mode:"foot"});
    const character=bike.rig.character;
    assert.equal(character.traditionalPanels.length,2);
    assert.ok(!character.torsoPivot.getObjectByName("chibi-backpack"));
    assert.ok(character.root.getObjectByName(id==="scholar"?"scholar-sunglasses":"ao-dai-long-hair"));
    if(id==="scholar"){
      assert.ok(character.root.getObjectByName("scholar-round-glasses"));
      assert.ok(character.traditionalCane);
    }else assert.ok(character.root.getObjectByName("ao-dai-conical-hat"));
    assert.equal(bike.jump(),true);
    bike.update(.2,1,0);assert.ok(bike.rig.actor.position.y>0);
    for(const stance of ["fish","boat","cruise"]){bike.setActivityStance(stance);bike.update(.1,0,0,false,{stance,poseOnly:true});assert.equal(bike.jump(),false);if(character.traditionalCane)assert.equal(character.traditionalCane.visible,false);}
    bike.setActivityStance(null);bike.setTransportMode("bike");bike.update(.1,1,0);
    assert.equal(bike.jump(),false);assert.equal(bike.rig.actor.position.y,0);
  }
});
