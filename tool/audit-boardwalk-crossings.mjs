import {roads,boardwalkWayIds} from '../src/geography/map.js';
import {nearestPoint} from '../src/geography/geometry.js';
const boardwalk=roads.filter(r=>boardwalkWayIds.includes(r.id));
for(const r of roads){if(boardwalkWayIds.includes(r.id))continue;let distance=Infinity;for(const p of r.points)for(const b of boardwalk)distance=Math.min(distance,nearestPoint(p,b.points).distance);if(distance<9)console.log(JSON.stringify({id:r.id,tags:r.tags,distance,points:r.points}));}
