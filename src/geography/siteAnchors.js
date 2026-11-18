import {inside,nearestPoint,project} from './geometry.js';
export function ringArea(ring){let area=0;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length];area+=p.x*q.z-q.x*p.z;}return Math.abs(area)/2;}
export function polygonCenter(ring){let sum=0,x=0,z=0;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length],cross=p.x*q.z-q.x*p.z;sum+=cross;x+=(p.x+q.x)*cross;z+=(p.z+q.z)*cross;}if(Math.abs(sum)<1e-8)return {...ring[0]};return {x:x/(3*sum),z:z/(3*sum)};}
export function principalCenter(rings){const ring=rings.slice().sort((a,b)=>ringArea(b)-ringArea(a))[0];return ring?polygonCenter(ring):null;}
export function resolveSiteAnchor(feature,rings,nodes,frontageRoads=[]){
  if(feature.type==='node')return {point:project(feature),kind:'feature-point',sourceId:feature.id,sourceType:'node',confidence:'mapped'};
  const boundary=new Set(feature.nodes||[]),candidates=nodes.filter(n=>n.type==='node'&&n.tags&&(n.tags.entrance==='main'||n.tags.entrance==='yes'||n.tags.barrier==='gate')&&n.tags.access!=='no').map(n=>({node:n,p:project(n)})).filter(({node,p})=>(boundary.has(node.id)||rings.some(r=>inside(p,r)||nearestPoint(p,r).distance<1))&&(!frontageRoads.length||frontageRoads.some(road=>nearestPoint(p,road).distance<30)));
  candidates.sort((a,b)=>(a.node.tags.entrance==='main'?0:1)-(b.node.tags.entrance==='main'?0:1));
  if(candidates.length===1||candidates[0]?.node.tags.entrance==='main'){const {node,p}=candidates[0];return {point:p,kind:'mapped-entrance',sourceId:node.id,sourceType:'node',confidence:'mapped'};}
  // A label for an area is not an inferred gate. Multiple/unmapped entrances remain explicit.
  return {point:principalCenter(rings),kind:'area-label',sourceId:feature.id,sourceType:feature.type,confidence:'area-only'};
}
