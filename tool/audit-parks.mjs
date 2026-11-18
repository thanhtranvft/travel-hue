import {features,centroid} from '../src/geography/map.js';
for(const f of features.filter(f=>f.tags?.leisure==='park'||f.tags?.landuse==='recreation_ground'))console.log(JSON.stringify({id:f.id,type:f.type,name:f.tags.name,center:centroid(f)}));
