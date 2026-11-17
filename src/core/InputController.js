import {TouchControls} from './TouchControls.js';
export class InputController {
  constructor(canvas) {
    this.keys = new Set(); this.drag = { active:false, x:0, y:0, yaw:0, pitch:0.38 };
    addEventListener('keydown', e => {if(e.target.closest?.('button,input,select,textarea')&&!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();this.keys.add(e.key.toLowerCase());});
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    this.touch=new TouchControls(this.drag);
    addEventListener('blur',()=>this.reset());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    document.querySelector('#app').addEventListener('selectstart',event=>{if(!event.target.closest?.('input,textarea'))event.preventDefault();});
    document.querySelector('#app').addEventListener('contextmenu',event=>{if(!event.target.closest?.('input,textarea'))event.preventDefault();});
  }
  reset(){this.keys.clear();this.touch.reset();}
  get throttle(){const keyboard=(this.keys.has('w')||this.keys.has('arrowup')?1:0)-(this.keys.has('s')||this.keys.has('arrowdown')?1:0);return keyboard||this.touch.throttle;}
  get steer(){const keyboard=(this.keys.has('a')||this.keys.has('arrowleft')?1:0)-(this.keys.has('d')||this.keys.has('arrowright')?1:0);return keyboard||this.touch.steer;}
  get brake(){return this.keys.has(' ')||this.touch.braking;}
}
