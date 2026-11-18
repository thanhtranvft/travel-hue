import {features,centroid} from '../src/geography/map.js';
for(const f of features){const p=centroid(f);if(!p)continue;if(Math.hypot(p.x-386,p.z+271)<120&&(f.tags?.area||f.tags?.barrier||f.tags?.amenity||f.tags?.landuse))console.log(JSON.stringify({id:f.id,type:f.type,tags:f.tags,center:p}));}
