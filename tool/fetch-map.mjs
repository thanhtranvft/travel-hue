import { writeFile } from 'node:fs/promises';
const query='[out:json][timeout:60];(way[highway](16.455,107.565,16.475,107.595);way[natural=water](16.455,107.565,16.475,107.595);relation[natural=water](16.455,107.565,16.475,107.595););out geom;';
const response=await fetch('https://overpass.kumi.systems/api/interpreter?data='+encodeURIComponent(query),{signal:AbortSignal.timeout(90000)});
if(!response.ok)throw new Error(`OSM request: ${response.status}`);
const data=await response.json();
if(!Array.isArray(data.elements)||!data.elements.length)throw new Error('OSM returned no features');
await writeFile(new URL('../src/assets/hue-osm.json',import.meta.url),JSON.stringify(data));
console.log(`Saved ${data.elements.length} OSM features`);
