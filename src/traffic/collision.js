// Continuous relative-motion test. Prevents fast vehicles tunnelling past a bicycle.
export function sweptContact(a0,a1,b0,b1,radius){
  const x=a0.x-b0.x,z=a0.z-b0.z,dx=(a1.x-a0.x)-(b1.x-b0.x),dz=(a1.z-a0.z)-(b1.z-b0.z);
  const denominator=dx*dx+dz*dz,t=denominator>0?Math.max(0,Math.min(1,-(x*dx+z*dz)/denominator)):0;
  return (x+dx*t)**2+(z+dz*t)**2<=radius*radius;
}
