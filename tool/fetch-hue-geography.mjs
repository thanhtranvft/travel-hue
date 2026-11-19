import {writeFile} from 'node:fs/promises';
const query='[out:json][timeout:40];(way[highway](16.450,107.565,16.478,107.601);way[building](16.450,107.565,16.478,107.601);way[natural=water](16.450,107.565,16.478,107.601);nwr[name](16.450,107.565,16.478,107.601););out geom;';
const urls=[
  'https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query),
  'https://api.openstreetmap.org/api/0.6/map.json?bbox=107.565,16.450,107.601,16.478',
  'https://overpass.private.coffee/api/interpreter?data='+encodeURIComponent(query)
];
let saved=false;
for(const url of urls){try{const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'CunConHueLocalPrototype/0.1'},signal:AbortSignal.timeout(55000)});if(!response.ok){console.log(new URL(url).hostname,response.status,(await response.text()).slice(0,150));continue;}const data=await response.json();if(!data.elements?.length)throw new Error('Empty response');await writeFile(new URL('../src/assets/maps/source/hue-geography.json',import.meta.url),JSON.stringify({...data,sourceUrl:url,retrievedAt:new Date().toISOString()}));console.log('Saved',data.elements.length,'features');saved=true;break;}catch(e){console.log(new URL(url).hostname,e.message);}}
if(!saved)process.exitCode=1;
