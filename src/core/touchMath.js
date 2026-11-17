export function stickInput(dx,dy,radius,deadZone=.12){
  const length=Math.hypot(dx,dy),scale=length>radius?radius/length:1,x=dx*scale/radius,y=dy*scale/radius,magnitude=Math.min(1,length/radius);
  if(magnitude<=deadZone)return {x:dx*scale,y:dy*scale,throttle:0,steer:0};
  const power=(magnitude-deadZone)/(1-deadZone);
  // One thumb can start a turn from rest; pull down to reverse.
  return {x:dx*scale,y:dy*scale,throttle:(y>.25?-1:1)*power,steer:x===0?0:-Math.sign(x)*Math.abs(x)**1.15};
}
