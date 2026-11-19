import {mkdir,writeFile} from 'node:fs/promises';
import snapshot from '../src/assets/maps/source/osm-snapshot.json' with {type:'json'};
import entrances from '../src/assets/maps/source/osm-entrances.json' with {type:'json'};
import {sites,ringsOf,pointsOf} from '../src/core/shared/geography/map.js';
import config from '../src/data/app-config.json' with {type:'json'};
const geoDistricts=config.areas.items;
import {project,nearestPoint,inside} from '../src/core/shared/geography/geometry.js';
const directory=new URL('../src/modules/areas/',import.meta.url);await mkdir(directory,{recursive:true});const regions=[];
for(const district of geoDistricts){const radius=district.id==='quoc-hoc'?140:district.id==='truong-tien'?65:district.id==='south-bank'?85:120,path=district.path.map(([x,z])=>({x,z})),extensions=sites.filter(s=>['school','hospital','youth'].includes(s.kind)&&nearestPoint(s.sign,path).distance<radius).flatMap(s=>ringsOf(s.feature)),near=p=>nearestPoint(p,path).distance<radius+45||extensions.some(r=>inside(p,r)),all=[...path,...extensions.flat()],bounds={minX:Math.min(...all.map(p=>p.x))-radius,maxX:Math.max(...all.map(p=>p.x))+radius,minZ:Math.min(...all.map(p=>p.z))-radius,maxZ:Math.max(...all.map(p=>p.z))+radius};
 const intersects=feature=>{if(feature.id===2393612&&feature.type==='relation')return true;const geometry=feature.type==='node'?[project(feature)]:feature.type==='way'?pointsOf(feature):(feature.members||[]).flatMap(m=>m.geometry?pointsOf(m):[]);return geometry.some(near)||path.some(p=>feature.type==='way'&&feature.geometry?.length>3&&feature.tags?.area==='yes'&&inside(p,geometry));};
 const elements=snapshot.elements.filter(intersects),extra=entrances.elements.filter(e=>e.type!=='node'||near(project(e))),region={id:district.id,title:district.title,path:district.path,radius,bounds,extensions};
 const target=new URL(`${district.id}/model/`,directory);await mkdir(target,{recursive:true});await writeFile(new URL('osm.json',target),JSON.stringify({region,source:snapshot.source,retrievedAt:snapshot.retrievedAt,elements,entrances:extra}));regions.push({...region,featureCount:elements.length});
}
await writeFile(new URL('./fixtures/regions-manifest.generated.json',import.meta.url),JSON.stringify({districts:geoDistricts,regions},null,2));console.log(JSON.stringify(regions.map(r=>({id:r.id,features:r.featureCount,radius:r.radius}))));
