import {nearestPoint} from '../geography/geometry.js';
import {roadWidth,isFootway} from './roadProfile.js';
export function roadsidePoint(a,b,distance,offset,direction=1){const length=Math.hypot(b.x-a.x,b.z-a.z)||1,dx=(b.x-a.x)/length,dz=(b.z-a.z)/length;return {x:a.x+dx*distance-dz*offset*direction,z:a.z+dz*distance+dx*offset*direction};}
const bounds=new WeakMap();
export function onOtherCarriageway(point,road,roads,margin=0){return roads.some(other=>{if(other.id===road.id||isFootway(other))return false;let box=bounds.get(other);if(!box){box={minX:Math.min(...other.points.map(p=>p.x)),maxX:Math.max(...other.points.map(p=>p.x)),minZ:Math.min(...other.points.map(p=>p.z)),maxZ:Math.max(...other.points.map(p=>p.z))};bounds.set(other,box);}const radius=roadWidth(other)/2+margin;if(point.x<box.minX-radius||point.x>box.maxX+radius||point.z<box.minZ-radius||point.z>box.maxZ+radius)return false;return nearestPoint(point,other.points).distance<radius;});}
