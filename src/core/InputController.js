export class InputController {
  constructor(canvas) {
    this.keys = new Set(); this.drag = { active:false, x:0, y:0, yaw:0, pitch:0.38 };
    addEventListener('keydown', e => {if(e.target.closest?.('button,input,select,textarea')&&!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();this.keys.add(e.key.toLowerCase());});
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur',()=>{this.keys.clear();this.drag.active=false;});
    canvas.addEventListener('pointerdown', e => { this.drag.active=true; this.drag.x=e.clientX; this.drag.y=e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if(!this.drag.active)return; this.drag.yaw-=(e.clientX-this.drag.x)*.006; this.drag.pitch=Math.max(.12,Math.min(1.05,this.drag.pitch+(e.clientY-this.drag.y)*.004)); this.drag.x=e.clientX; this.drag.y=e.clientY; });
    canvas.addEventListener('pointerup', () => this.drag.active=false);
    canvas.addEventListener('pointercancel',()=>this.drag.active=false);
    document.querySelectorAll('[data-key]').forEach(b => { const k=b.dataset.key; b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.keys.add(k)}); b.addEventListener('pointerup',()=>this.keys.delete(k)); b.addEventListener('pointercancel',()=>this.keys.delete(k));b.addEventListener('lostpointercapture',()=>this.keys.delete(k)); });
  }
  get throttle(){ return (this.keys.has('w')||this.keys.has('arrowup')?1:0)-(this.keys.has('s')||this.keys.has('arrowdown')?1:0); }
  get steer(){ return (this.keys.has('a')||this.keys.has('arrowleft')?1:0)-(this.keys.has('d')||this.keys.has('arrowright')?1:0); }
}
