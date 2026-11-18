import {geoDistricts,river,sites} from '../src/geography/map.js';
console.log(JSON.stringify({districts:geoDistricts.map(d=>({id:d.id,points:d.path.length,spawn:d.spawn})),riverRings:river.length,sites:sites.map(s=>({id:s.id,center:s.center,sign:s.sign}))}));
