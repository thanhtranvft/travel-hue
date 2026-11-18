import {writeFile} from 'node:fs/promises';
const query='[out:json][timeout:45];(way(id:695775622,695770482,695770476,175063593);relation(21912794);node[entrance](16.455,107.575,16.468,107.592);node[barrier=gate](16.455,107.575,16.468,107.592);node[highway=traffic_signals](16.455,107.575,16.468,107.592););(._;>>;);out body;';
const response=await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query),{headers:{Accept:'application/json','User-Agent':'CunConHueLocalPrototype/0.1'},signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error(`OSM HTTP ${response.status}`);
const data=await response.json();await writeFile(new URL('../src/geography/osm-entrances.json',import.meta.url),JSON.stringify({...data,retrievedAt:new Date().toISOString()}));
console.log('NODES',data.elements.length);for(const e of data.elements.filter(e=>e.type==='node'&&e.tags))console.log(JSON.stringify(e));
