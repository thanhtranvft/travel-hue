import {byId,ringsOf,centroid} from '../src/geography/map.js';
for(const id of [695775607,118541971]){const f=byId(id);console.log(JSON.stringify({id,tags:f.tags,center:centroid(f),rings:ringsOf(f)}));}
