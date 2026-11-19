import {readFile,writeFile,mkdir} from 'node:fs/promises';
const regions=JSON.parse(await readFile(new URL('./fixtures/regions-manifest.generated.json',import.meta.url),'utf8')),music=JSON.parse(await readFile(new URL('../src/data/music-tracks.json',import.meta.url),'utf8'));
await mkdir(new URL('../src/app/',import.meta.url),{recursive:true});
const config={schemaVersion:1,areas:{defaultId:'quoc-hoc',items:regions.districts.map(d=>({...d,enabled:true}))},music:{defaultId:'huong-evening',tracks:music.tracks.map(t=>({...t,enabled:true}))}};
await writeFile(new URL('../src/data/app-config.json',import.meta.url),JSON.stringify(config,null,2)+'\n');console.log('CREATED unified area/music catalog');
