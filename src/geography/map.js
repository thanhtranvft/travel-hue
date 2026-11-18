import siteCatalog from '../data/sites.json' with {type:'json'};
import snapshot from './osm-snapshot.json' with {type:'json'};
import entranceSnapshot from './osm-entrances.json' with {type:'json'};
import {principalCenter,resolveSiteAnchor} from './siteAnchors.js';
import {project,joinLines,nearestPoint,routeOnWays} from './geometry.js';
export const features=snapshot.elements;
export const byId=id=>features.find(f=>f.id===id);
export const pointsOf=feature=>(feature?.geometry||[]).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)).map(project);
export const roads=features.filter(f=>f.type==='way'&&f.tags?.highway&&f.geometry?.length>1&&!['steps','construction','proposed'].includes(f.tags.highway)).map(f=>({...f,points:pointsOf(f)}));
export const mainRoads=roads.filter(r=>['Lê Lợi','Hà Nội','Trần Hưng Đạo','Cầu Phú Xuân','Cầu Trường Tiền','Lê Duẩn'].includes(r.tags.name));
export function ringsOf(feature){if(feature.type==='way')return [pointsOf(feature)];return joinLines((feature.members||[]).filter(m=>m.role==='outer'&&m.geometry).map(pointsOf));}
export const river=ringsOf(byId(2393612));
export const centroid=feature=>feature.type==='node'?project(feature):principalCenter(ringsOf(feature));
const siteDefinitions=siteCatalog.sites;
const leLoi=roads.filter(r=>r.tags.name==='Lê Lợi');
// Shared OSM vertices are real junctions; never place crossings by visual spacing.
export const corridorCrossings=['Phan Bội Châu','Nguyễn Trường Tộ','Lê Lai','Hà Nội'].map(name=>{
  const cross=roads.filter(r=>r.tags.name===name);
  for(const road of cross)for(const point of road.points)for(const main of leLoi)if(main.points.some(p=>Math.hypot(p.x-point.x,p.z-point.z)<.1))return {name,point,roadId:road.id,mainId:main.id,heading:nearestPoint(point,main.points).heading};
  throw new Error(`Thiếu nút giao OSM: ${name}`);
});
export const sites=siteDefinitions.map(site=>{const feature=byId(site.osm);if(!feature)throw new Error(`Thiếu OSM ${site.osm}`);const center=centroid(feature),anchor=resolveSiteAnchor(feature,ringsOf(feature),entranceSnapshot.elements,['school','government','hospital'].includes(site.kind)?leLoi.map(r=>r.points):[]);return {...site,feature,center,sign:anchor.point,anchor,source:`https://www.openstreetmap.org/${feature.type}/${feature.id}`,anchorSource:`https://www.openstreetmap.org/${anchor.sourceType}/${anchor.sourceId}`};});
const location=id=>sites.find(s=>s.id===id).center;
const junction=project({lat:16.4639209,lon:107.5866524});
export const intersection={...junction,lat:16.4639209,lon:107.5866524,sourceWay:39420686};
export const mappedSignals=entranceSnapshot.elements.filter(e=>e.type==='node'&&e.tags?.highway==='traffic_signals').map(node=>({...project(node),osm:node.id}));
const makeDistrict=(id,title,subtitle,color,points)=>({id,title,subtitle,color,path:points.map(p=>[p.x,p.z]),spawn:{...points[0],heading:Math.atan2(points[1].x-points[0].x,points[1].z-points[0].z)},landmarks:[],geo:true});
export const leLoiTruongTienJunction=pointsOf(byId(626373586))[0];
const mainTour=routeOnWays(roads.filter(r=>r.tags.name==='Lê Lợi'||r.tags.bridge==='yes'),location('station'),leLoiTruongTienJunction);
const bridge=pointsOf(byId(174759688)).reverse();
export const boardwalkWayIds=[1167513732,1167513733,683633953];
const walk=routeOnWays(roads.filter(r=>boardwalkWayIds.includes(r.id)),pointsOf(byId(1167513732)).at(-1),pointsOf(byId(683633953))[0]);
const north=pointsOf(byId(1160448447)).slice().reverse();
// Actual OSM footways around the ceremonial square, rather than a fabricated straight path.
const imperialRoads=roads.filter(r=>['footway','pedestrian','path','service','residential','tertiary','secondary','primary'].includes(r.tags.highway));
const imperial=routeOnWays(imperialRoads,location('ky-dai'),location('ngo-mon'));
export const geoDistricts=[makeDistrict('quoc-hoc','Ga Huế → Tràng Tiền','Lê Lợi · Quốc Học → Phú Xuân → Tràng Tiền','#e7bd77',mainTour),makeDistrict('south-bank','Cầu Gỗ Lim · bờ Nam','Tuyến đi bộ ven sông nối các đoạn OSM','#8ec0a0',walk),makeDistrict('truong-tien','Cầu Trường Tiền','Tuyến cầu theo tọa độ OSM','#8db9d6',bridge),makeDistrict('north-bank','Trần Hưng Đạo','Tuyến bờ Bắc theo bản đồ','#ce9da8',north),makeDistrict('imperial-city','Kỳ Đài · Ngọ Môn','Đường tiếp cận Hoàng thành trên OSM','#c7b083',imperial)];
export const attribution={source:snapshot.source,retrievedAt:snapshot.retrievedAt};
