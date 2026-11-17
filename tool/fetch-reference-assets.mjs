import {mkdir,writeFile} from 'node:fs/promises';
const folder=new URL('../src/assets/models/',import.meta.url);await mkdir(folder,{recursive:true});
for(const name of ['trees_v4','priority_gbike_v9','waymo_gen6_v4']){
  const url=`https://www.gstatic.com/aistudio/starter-apps/pelican-campus/${name}.glb`;
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.readUInt32LE(0)!==0x46546c67)throw new Error(`${name}: invalid GLB`);
  await writeFile(new URL(`${name}.glb`,folder),bytes);console.log(name,bytes.length);
}
