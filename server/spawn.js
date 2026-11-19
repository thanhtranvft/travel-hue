import { nearestPoint } from '../src/core/shared/geography/geometry.js';

// Follow the route bend while preserving the configured spawn's lateral offset.
export function spacedSpawn(area, distance) {
  const line=area.region.path.map(([x,z])=>({x,z}));
  const start=nearestPoint(area.spawn,line);
  const lengths=[0];
  for(let i=1;i<line.length;i++)lengths.push(lengths[i-1]+Math.hypot(line[i].x-line[i-1].x,line[i].z-line[i-1].z));
  const direction=Math.cos(area.spawn.heading-start.heading)>=0?1:-1;
  const progress=Math.max(0,Math.min(lengths.at(-1),lengths[start.index-1]+start.t*(lengths[start.index]-lengths[start.index-1])+distance*direction));
  let index=1;while(index<line.length-1&&lengths[index]<progress)index++;
  const a=line[index-1],b=line[index],t=(progress-lengths[index-1])/(lengths[index]-lengths[index-1]||1);
  const heading=Math.atan2(b.x-a.x,b.z-a.z);
  const lateral=(area.spawn.x-start.x)*Math.cos(start.heading)-(area.spawn.z-start.z)*Math.sin(start.heading);
  return {x:a.x+(b.x-a.x)*t+Math.cos(heading)*lateral,z:a.z+(b.z-a.z)*t-Math.sin(heading)*lateral,heading:Math.atan2(Math.sin(heading+(direction<0?Math.PI:0)),Math.cos(heading+(direction<0?Math.PI:0)))};
}
