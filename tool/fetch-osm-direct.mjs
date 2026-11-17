import {writeFile} from 'node:fs/promises';
const response=await fetch('https://api.openstreetmap.org/api/0.6/map?bbox=107.565,16.455,107.595,16.475',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(90000)});
if(!response.ok)throw new Error('OSM API '+response.status);
const text=await response.text();
await writeFile(new URL('../src/assets/hue-map.osm',import.meta.url),text);
console.log('Saved OSM data:',text.length,'bytes');
