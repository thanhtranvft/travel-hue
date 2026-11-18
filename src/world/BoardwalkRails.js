import {nearestPoint} from '../geography/geometry.js';
export function railSegments(road,width,heightAt){
 const result=[];
 for(const side of [-1,1]){const edge=road.points.map((p,i)=>{const a=road.points[Math.max(0,i-1)],b=road.points[Math.min(road.points.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz)||1;return {x:p.x-dz/length*width/2*side,z:p.z+dx/length*width/2*side,y:heightAt(i)};});for(let i=1;i<edge.length;i++)result.push({a:edge[i-1],b:edge[i]});}
 return result;
}
export function hitsRail(point,segments,radius=.45){return segments.some(s=>Math.abs((point.y??s.a.y)-s.a.y)<2&&nearestPoint(point,[s.a,s.b]).distance<radius);}
