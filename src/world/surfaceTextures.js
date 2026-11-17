import * as THREE from 'three';
export function surfaceTexture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
  ctx.fillStyle=kind==='asphalt'?'#64696a':'#bfb6a0';ctx.fillRect(0,0,256,256);
  let seed=47;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<13000;i++){const v=Math.floor(70+random()*100);ctx.fillStyle=`rgba(${v},${v},${v},${kind==='asphalt'?.3:.1})`;ctx.fillRect(random()*256,random()*256,1,1);}
  if(kind!=='asphalt'){ctx.strokeStyle='#8f8c7d';ctx.lineWidth=1;for(let y=0;y<256;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();for(let x=(y%64?16:0);x<256;x+=64)ctx.strokeRect(x,y,64,32);}}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;
}
