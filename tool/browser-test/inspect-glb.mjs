import {readFile} from 'node:fs/promises';
for(const name of ['trees_v4','priority_gbike_v9']){
  const data=await readFile(`E:/02.Games/AI/pelican-campus-quest/public/assets/glb/${name}.glb`);const length=data.readUInt32LE(12);const json=JSON.parse(data.subarray(20,20+length).toString());
  console.log(name,JSON.stringify(json.nodes.map((n,i)=>({i,name:n.name,children:n.children,translation:n.translation,scale:n.scale})).slice(0,65)));
}
