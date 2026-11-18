import * as THREE from 'three';
import {InputController} from './InputController.js';
import {GeographicWorld as HueWorld} from '../world/GeographicWorld.js';
import {TouringBike} from '../vehicle/TouringBike.js';
import {geoDistricts as districts} from '../geography/map.js';
import {damp,wrapAngle} from '../vehicle/BicycleMotion.js';
import {GeographicTraffic as TrafficSystem} from '../traffic/GeographicTraffic.js';
import {CITY,BRIDGE} from '../world/cityLayout.js';
import {CityAudio} from '../audio/CityAudio.js';
import {unproject} from '../geography/geometry.js';
const getDistrict=id=>districts.find(d=>d.id===id);

export class CityGame {
  constructor(canvas){
    this.audio=new CityAudio();this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,5000);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setSize(innerWidth,innerHeight);
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.input=new InputController(canvas);this.world=new HueWorld(this.scene);this.world.build();this.audio.venues=this.world.venues;this.scene.traverse(object=>{if(object.isSprite)object.visible=false;});this.bike=new TouringBike();this.scene.add(this.bike);this.traffic=new TrafficSystem(this.scene,this.world);this.collisionCooldown=0;this.stun=0;this.crashCount=0;this.noticeTime=0;
    this.impact=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(.85,.035,6,32),new THREE.MeshBasicMaterial({color:'#ffb55d',transparent:true}));ring.rotation.x=Math.PI/2;this.impact.add(ring);for(let i=0;i<8;i++){const spark=new THREE.Mesh(new THREE.OctahedronGeometry(.075),new THREE.MeshBasicMaterial({color:'#ffe1a0',transparent:true}));spark.position.set(Math.cos(i*Math.PI/4)*.8,.4,Math.sin(i*Math.PI/4)*.8);this.impact.add(spark);}this.impact.visible=false;this.scene.add(this.impact);
    this.clock=new THREE.Clock();this.accumulator=0;this.auto=false;this.elapsed=0;this.cameraYaw=0;this.look=new THREE.Vector3();this.desired=new THREE.Vector3();this.cameraTarget=new THREE.Vector3();this.ray=new THREE.Raycaster();this.rayDirection=new THREE.Vector3();
    this.map=document.querySelector('#minimap').getContext('2d');this.hud={district:document.querySelector('#destination'),speed:document.querySelector('#speed'),distance:document.querySelector('#distance'),progress:document.querySelector('#progress'),mode:document.querySelector('#mode-label'),auto:document.querySelector('#autopilot'),card:document.querySelector('#landmark-card')};
    this.travelTo(districts[0].id);addEventListener('resize',()=>this.resize());
    this.ready=Promise.allSettled([this.bike.loadDetailedModel(),this.world.loadDetailedTrees(),this.traffic.loadDetailedCars()]).then(results=>{document.querySelector('#scene-loading').hidden=true;if(results.some(r=>r.status==='rejected'))document.querySelector('#asset-notice').hidden=false;});
    addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='m')document.querySelector('#map-panel').classList.toggle('expanded');if(e.key.toLowerCase()==='t')this.toggleAutopilot();if(e.key.toLowerCase()==='r')this.reset();});
  }
  travelTo(id){
    const district=getDistrict(id);if(!district)return;this.district=district;this.auto=false;this.completed=false;this.input.reset();this.input.drag.yaw=0;this.collisionCooldown=2;this.stun=0;this.noticeTime=0;this.impact.visible=false;document.querySelector('#collision-toast').hidden=true;
    const {x,z,heading}=district.spawn;this.bike.reset(x,z,heading);this.bike.position.y=this.world.groundAt(x,z);
    this.traffic.clearSpawn(this.bike.position);
    this.curve=new THREE.CurvePath();for(let i=1;i<district.path.length;i++)this.curve.add(new THREE.LineCurve3(new THREE.Vector3(district.path[i-1][0],0,district.path[i-1][1]),new THREE.Vector3(district.path[i][0],0,district.path[i][1])));this.routeLength=this.curve.getLength();this.routeU=0;
    let nearest=Infinity;for(let i=0;i<=100;i++){const p=this.curve.getPointAt(i/100),d=Math.hypot(p.x-x,p.z-z);if(d<nearest){nearest=d;this.routeU=i/100;}}
    this.cameraYaw=heading;this.camera.position.set(x-Math.sin(heading)*5.6,3,z-Math.cos(heading)*5.6);this.look.set(x+Math.sin(heading)*2,1.3,z+Math.cos(heading)*2);this.camera.lookAt(this.look);
    document.querySelectorAll('[data-district]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.district===id)));this.syncMode();this.updateHud();
  }
  reset(){this.travelTo(this.district.id);}
  syncMode(){this.hud.mode.textContent=this.auto?'Tự lái tham quan':'Đạp tự do';this.hud.auto.classList.toggle('active',this.auto);this.hud.auto.setAttribute('aria-pressed',String(this.auto));}
  toggleAutopilot(){if(!this.auto){this.travelTo(this.district.id);this.auto=true;}else this.auto=false;this.syncMode();}
  start(){this.renderer.setAnimationLoop(()=>this.frame());}
  step(dt){
    this.collisionCooldown=Math.max(0,this.collisionCooldown-dt);this.stun=Math.max(0,this.stun-dt);this.noticeTime=Math.max(0,this.noticeTime-dt);if(this.noticeTime===0)document.querySelector('#collision-toast').hidden=true;
    this.traffic.step(dt,this.bike);
    let throttle=this.input.throttle,steer=this.input.steer,brake=this.input.brake;
    if(this.auto&&(throttle||steer||brake)){this.auto=false;this.syncMode();}
    if(this.auto){
      let nearest=Infinity,best=this.routeU;
      for(let i=0;i<=20;i++){const u=Math.min(1,this.routeU+i*.003),p=this.curve.getPointAt(u),d=Math.hypot(p.x-this.bike.position.x,p.z-this.bike.position.z);if(d<nearest){nearest=d;best=u;}}
      this.routeU=best;const lookahead=1.8+Math.abs(this.bike.motion.speed)*.4,target=this.curve.getPointAt(Math.min(1,best+lookahead/this.routeLength));
      const dx=target.x-this.bike.position.x,dz=target.z-this.bike.position.z,delta=wrapAngle(Math.atan2(dx,dz)-this.bike.motion.heading);
      const turn=Math.atan(2*1.18*Math.sin(delta)/Math.max(.6,Math.hypot(dx,dz)));
      steer=THREE.MathUtils.clamp(turn/(.55/(1+Math.abs(this.bike.motion.speed)*.07)),-1,1);
      const remaining=(1-best)*this.routeLength,targetSpeed=Math.min(4.6*(1-Math.min(.65,Math.abs(delta)*.5)),Math.sqrt(Math.max(0,remaining)*2));
      throttle=THREE.MathUtils.clamp((targetSpeed-this.bike.motion.speed)*.85,-1,1);
      if(this.traffic.enabled&&this.traffic.hasVehicleAhead(this.bike)){throttle=0;brake=true;}
      if(remaining<.6){this.auto=false;this.completed=true;this.bike.motion.speed=0;throttle=0;steer=0;this.syncMode();}
    }
    const oldX=this.bike.position.x,oldZ=this.bike.position.z;
    if(this.stun>0){throttle=0;steer=0;brake=true;}
    this.bike.update(dt,throttle,steer,brake);
    if(!this.world.canRide(this.bike.position.x,this.bike.position.z)) {this.bike.position.x=oldX;this.bike.position.z=oldZ;this.bike.motion.speed=0;}
    this.bike.position.y=damp(this.bike.position.y,this.world.groundAt(this.bike.position.x,this.bike.position.z,this.bike.position.y),15,dt);
    if(this.collisionCooldown===0){const actor=this.traffic.contact({x:oldX,z:oldZ},this.bike);if(actor&&Math.abs(this.bike.motion.speed)+actor.speed>.5)this.crash(actor,oldX,oldZ);}
    if(this.stun>0)this.bike.rotation.z+=Math.sin(this.stun*8)*.28;
  }
  crash(actor,oldX,oldZ){
    this.bike.position.x=oldX;this.bike.position.z=oldZ;this.bike.motion.speed=0;this.auto=false;this.completed=false;this.syncMode();this.collisionCooldown=3;this.stun=1;this.noticeTime=4;this.crashCount++;actor.pause=1.4;
    this.impact.position.copy(this.bike.position);this.impact.position.y+=.12;this.impact.visible=true;
    const label=actor.type==='car'?'ô tô':actor.type==='scooter'?'xe máy':'người đi bộ';const headOn=Math.cos(this.bike.motion.heading-actor.heading)<-.4;
    document.querySelector('#collision-message').textContent=`${headOn?'Bạn đã đi đối đầu và va chạm với':'Bạn vừa va chạm với'} ${label}. Hãy cẩn thận hơn, đi bên phải, giảm tốc và quan sát phía trước!`;
    document.querySelector('#collision-toast').hidden=false;
    this.audio.collision();
  }
  frame(){
    const dt=Math.min(this.clock.getDelta(),.1);this.elapsed+=dt;this.accumulator+=dt;
    while(this.accumulator>=1/120){this.step(1/120);this.accumulator-=1/120;}
    this.world.update(this.elapsed,this.bike.position);if(this.impact.visible){const age=1-this.stun;this.impact.scale.setScalar(1+age*1.4);this.impact.children.forEach(mesh=>mesh.material.opacity=Math.max(0,1-age));if(this.stun===0)this.impact.visible=false;}this.updateCamera(dt);this.audio.update(this.bike,this.traffic.actors,this.cameraYaw+this.input.drag.yaw);this.updateHud();this.drawMap();this.renderer.render(this.scene,this.camera);
  }
  updateCamera(dt){
    this.cameraYaw+=wrapAngle(this.bike.motion.heading-this.cameraYaw)*(1-Math.exp(-7.5*dt));
    const yaw=this.cameraYaw+this.input.drag.yaw,speed=Math.abs(this.bike.motion.speed),distance=5.3+speed*.07,p=this.bike.position;
    this.desired.set(p.x-Math.sin(yaw)*distance,p.y+2.0+(this.input.drag.pitch-.38)*3,p.z-Math.cos(yaw)*distance);
    this.cameraTarget.set(p.x,p.y+1.25,p.z);this.rayDirection.copy(this.desired).sub(this.cameraTarget);const maxDistance=this.rayDirection.length();this.ray.set(this.cameraTarget,this.rayDirection.normalize());this.ray.far=maxDistance;
    const hit=this.ray.intersectObjects([...this.world.cameraObstacles,...this.traffic.cameraObstacles(p)],false)[0];if(hit)this.desired.copy(this.cameraTarget).addScaledVector(this.rayDirection,Math.max(.8,hit.distance-.35));
    if(this.stun>0)this.desired.x+=Math.sin(this.elapsed*46)*this.stun*.08;this.camera.position.lerp(this.desired,1-Math.exp(-10*dt));this.cameraTarget.set(p.x+Math.sin(yaw)*1.8,p.y+1.1,p.z+Math.cos(yaw)*1.8);this.look.lerp(this.cameraTarget,1-Math.exp(-12*dt));this.camera.lookAt(this.look);
  }
  updateHud(){
    const osmLink=document.querySelector('#open-osm');if(osmLink){const gps=unproject(this.bike.position);osmLink.href=`https://www.openstreetmap.org/#map=18/${gps.lat.toFixed(7)}/${gps.lon.toFixed(7)}`;}
    this.hud.district.textContent=this.district.title;this.hud.speed.textContent=Math.round(Math.abs(this.bike.motion.speed)*3.6);this.hud.distance.textContent=this.completed?'Đã hoàn thành tuyến':this.auto?`${Math.round((1-this.routeU)*this.routeLength)} m trên tuyến`:'Tự do khám phá';this.hud.progress.style.width=`${this.completed?100:this.routeU*100}%`;
    const soundLocation=document.querySelector('#sound-location');if(soundLocation)soundLocation.textContent=this.audio.venueLevel>.07?`Nhạc ven quán · ${this.audio.nearbyVenue.title}`:'Giai điệu bên sông Hương';
    let near=null,distance=Infinity;for(const lm of this.world.landmarks.values()){const d=Math.hypot(lm.position.x-this.bike.position.x,lm.position.z-this.bike.position.z);if(d<distance&&d<lm.radius){distance=d;near=lm;}}
    this.hud.card.classList.toggle('visible',!!near);if(near){this.hud.card.querySelector('h2').textContent=near.title;this.hud.card.querySelector('p').textContent=near.description;}
  }
  drawMap(){
    if(this.world.drawMap){this.world.drawMap(this.map,this.bike,districts,this.district.id,this.traffic.actors);return;}
    const ctx=this.map,w=240,h=170,toX=x=>(x+85)/125*w,toY=z=>(z+82)/145*h;
    ctx.fillStyle='#102420';ctx.fillRect(0,0,w,h);ctx.fillStyle='#326d78';ctx.fillRect(0,toY(-CITY.riverHalfWidth),w,toY(CITY.riverHalfWidth)-toY(-CITY.riverHalfWidth));
    ctx.strokeStyle='#829183';ctx.lineWidth=CITY.roadWidth/145*h;for(const z of [-CITY.roadCenter,CITY.roadCenter]){ctx.beginPath();ctx.moveTo(0,toY(z));ctx.lineTo(w,toY(z));ctx.stroke();}ctx.lineWidth=BRIDGE.width/125*w;ctx.beginPath();ctx.moveTo(toX(BRIDGE.x),toY(-34));ctx.lineTo(toX(BRIDGE.x),toY(34));ctx.stroke();
    ctx.lineWidth=2;for(const district of districts){ctx.strokeStyle=district.id===this.district.id?district.color:'#4a6257';ctx.beginPath();district.path.forEach(([x,z],i)=>i?ctx.lineTo(toX(x),toY(z)):ctx.moveTo(toX(x),toY(z)));ctx.stroke();ctx.fillStyle=district.color;ctx.beginPath();ctx.arc(toX(district.spawn.x),toY(district.spawn.z),3,0,Math.PI*2);ctx.fill();}
    ctx.save();ctx.translate(toX(this.bike.position.x),toY(this.bike.position.z));ctx.rotate(-this.bike.motion.heading);ctx.fillStyle='#fff0bb';ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-4,-4);ctx.lineTo(0,-2);ctx.lineTo(4,-4);ctx.closePath();ctx.fill();ctx.restore();
    for(const actor of this.traffic.actors){ctx.fillStyle=actor.type==='pedestrian'?'#a6c6a0':'#e7a184';ctx.fillRect(toX(actor.mesh.position.x)-1,toY(actor.mesh.position.z)-1,2,2);}
  }
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);}
}
