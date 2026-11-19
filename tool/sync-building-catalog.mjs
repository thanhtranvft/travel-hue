import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {features,centroid,mainRoads} from '../src/core/shared/geography/map.js';
import {nearestPoint,unproject} from '../src/core/shared/geography/geometry.js';
const directory=new URL('../src/data/',import.meta.url),path=new URL('buildings.json',directory);await mkdir(directory,{recursive:true});
let catalog={schemaVersion:1,buildings:[]};try{catalog=JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const known=new Set(catalog.buildings.map(b=>b.osmKey));let next=Math.max(0,...catalog.buildings.map(b=>b.number))+1;
for(const f of features.filter(f=>f.type==='way'&&f.tags?.building&&f.geometry?.length>3).sort((a,b)=>a.id-b.id)){
 const p=centroid(f);if(p.x< -350||p.x>1700||p.z< -1900||p.z>200||!mainRoads.some(r=>nearestPoint(p,r.points).distance<135))continue;
 const osmKey=`${f.type}/${f.id}`;if(known.has(osmKey))continue;
 const number=next++;catalog.buildings.push({code:`TN-${String(number).padStart(4,'0')}`,number,osmKey,coordinates:unproject(p),name:null,houseNumber:null,street:null,osm:{name:f.tags.name||null,houseNumber:f.tags['addr:housenumber']||null,street:f.tags['addr:street']||null}});known.add(osmKey);
}
await writeFile(path,JSON.stringify(catalog,null,2)+'\n');console.log(`BUILDING_CATALOG ${catalog.buildings.length} records; existing codes and overrides preserved`);
