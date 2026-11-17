import {stickInput} from './touchMath.js';

export class TouchControls {
  constructor(drag){
    this.drag=drag;this.throttle=0;this.steer=0;this.braking=false;this.moveId=null;this.cameraId=null;this.brakeId=null;
    this.stick=document.querySelector('#move-stick');this.thumb=document.querySelector('#stick-thumb');const brake=document.querySelector('#touch-brake');
    this.stick.addEventListener('pointerdown',e=>{if(this.moveId!==null||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();this.moveId=e.pointerId;this.stick.setPointerCapture(e.pointerId);const bounds=this.stick.getBoundingClientRect();this.center={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};this.radius=bounds.width*.32;this.stick.classList.add('engaged');this.move(e);});
    this.stick.addEventListener('pointermove',e=>{if(e.pointerId!==this.moveId)return;e.preventDefault();this.move(e);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(event,e=>{if(e.pointerId===this.moveId){this.moveId=null;this.throttle=this.steer=0;this.thumb.style.transform='translate(0px,0px)';this.stick.classList.remove('engaged');}});
    this.bindCamera(document.querySelector('#look-pad'));this.bindCamera(document.querySelector('#game'));
    brake.addEventListener('pointerdown',e=>{if(this.brakeId!==null)return;e.preventDefault();this.brakeId=e.pointerId;this.braking=true;brake.setPointerCapture(e.pointerId);brake.classList.add('engaged');});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])brake.addEventListener(event,e=>{if(e.pointerId===this.brakeId){this.brakeId=null;this.braking=false;brake.classList.remove('engaged');}});
    for(const surface of [this.stick,brake,document.querySelector('#look-pad'),document.querySelector('#game')])surface.addEventListener('contextmenu',e=>e.preventDefault());
  }
  move(event){const value=stickInput(event.clientX-this.center.x,event.clientY-this.center.y,this.radius);this.throttle=value.throttle;this.steer=value.steer;this.thumb.style.transform=`translate(${value.x}px,${value.y}px)`;}
  bindCamera(surface){
    surface.addEventListener('pointerdown',e=>{if(this.cameraId!==null||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();this.cameraId=e.pointerId;surface.setPointerCapture(e.pointerId);this.drag.active=true;this.drag.x=e.clientX;this.drag.y=e.clientY;surface.classList.add('engaged');});
    surface.addEventListener('pointermove',e=>{if(e.pointerId!==this.cameraId)return;e.preventDefault();this.drag.yaw-=(e.clientX-this.drag.x)*.005;this.drag.pitch=Math.max(.12,Math.min(1.05,this.drag.pitch+(e.clientY-this.drag.y)*.0035));this.drag.x=e.clientX;this.drag.y=e.clientY;});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,e=>{if(e.pointerId===this.cameraId){this.cameraId=null;this.drag.active=false;surface.classList.remove('engaged');}});
  }
  reset(){this.moveId=this.cameraId=this.brakeId=null;this.throttle=this.steer=0;this.braking=false;this.drag.active=false;this.thumb.style.transform='translate(0px,0px)';document.querySelectorAll('.touch-controls .engaged').forEach(e=>e.classList.remove('engaged'));}
}
