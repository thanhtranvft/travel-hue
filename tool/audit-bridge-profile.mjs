import {roads,boardwalkWayIds} from '../src/core/shared/geography/map.js';
for(const r of roads.filter(r=>r.tags.name==='Cầu Trường Tiền'||r.tags.name==='Lê Lợi'))console.log(JSON.stringify({id:r.id,tags:r.tags,points:r.points}));
