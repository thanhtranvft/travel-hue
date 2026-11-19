import {readFile,writeFile} from 'node:fs/promises';
import {project} from '../src/core/shared/geography/geometry.js';
const file='src/data/app-config.json',config=JSON.parse(await readFile(file,'utf8'));
const data=JSON.parse(await readFile('src/modules/areas/quoc-hoc/model/osm.json','utf8'));
const bridge=data.elements.find(f=>f.id===39414469),[a,b]=bridge.geometry.map(project);
const length=Math.hypot(b.x-a.x,b.z-a.z),heading=Math.atan2(b.x-a.x,b.z-a.z);
const area=config.areas.items.find(a=>a.id==='quoc-hoc');
area.spawnSlots=Array.from({length:10},(_,i)=>{
 const along=4+Math.floor(i/2)*4.5,right=i%2?4.6:2.2;
 return {x:a.x+(b.x-a.x)*along/length-Math.cos(heading)*right,z:a.z+(b.z-a.z)*along/length+Math.sin(heading)*right,heading};
});
area.spawn={...area.spawnSlots[0]};
await writeFile(file,JSON.stringify(config,null,2)+'\n');
console.log('Spawn on mapped Ga bridge:',area.spawn,'slots:',area.spawnSlots.length);
