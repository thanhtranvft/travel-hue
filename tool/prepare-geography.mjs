import {readFile,writeFile,mkdir} from 'node:fs/promises';
const raw=JSON.parse(await readFile(new URL('../src/assets/hue-geography.json',import.meta.url)));
const selected=raw.elements.filter(e=>e.type==='way'&&(e.tags?.natural==='water'||e.tags?.waterway||e.tags?.surface==='wood'||e.tags?.bridge&&e.tags?.highway==='footway'));
console.log('WATER / WOOD',JSON.stringify(selected.map(e=>({id:e.id,tags:e.tags,points:e.geometry?.length}))).slice(0,12000));
const counts=raw.elements.filter(e=>e.type==='relation'&&(e.tags?.natural==='water'||e.id===21912794));console.log('RELATIONS',JSON.stringify(counts.map(e=>({id:e.id,tags:e.tags,members:e.members?.map(m=>({ref:m.ref,role:m.role,points:m.geometry?.length}))}))).slice(0,8000));
const elements=raw.elements.map(({type,id,tags,geometry,lat,lon,nodes,members})=>({type,id,tags,geometry,lat,lon,nodes,members:members?.map(({type,ref,role,geometry,lat,lon})=>({type,ref,role,geometry,lat,lon}))}));
await mkdir(new URL('../src/geography/',import.meta.url),{recursive:true});
await writeFile(new URL('../src/geography/osm-snapshot.json',import.meta.url),JSON.stringify({source:'https://www.openstreetmap.org/copyright',retrievedAt:raw.retrievedAt,elements}));
console.log('Snapshot saved');
