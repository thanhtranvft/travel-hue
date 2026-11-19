import {readFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../src/assets/maps/source/hue-geography.json',import.meta.url)));
console.log('SOURCE',new URL(data.sourceUrl).hostname,'TYPES',data.elements.reduce((r,e)=>(r[e.type]=(r[e.type]||0)+1,r),{}));
const pattern=/Lê Lợi|Quốc Học|Quoc Hoc|Hai Bà Trưng|Ủy ban|Uỷ ban|Trung Ương|Trung ương|Phú Xuân|Hà Nội|Gỗ Lim|Ga Huế|Ngọ Môn|Kỳ Đài|Trường Tiền|Tràng Tiền|Trần Hưng Đạo/i;
for(const e of data.elements){if(!pattern.test(e.tags?.name||''))continue;const g=e.geometry||[];const coords=g.length?{lat:g.reduce((s,p)=>s+p.lat,0)/g.length,lon:g.reduce((s,p)=>s+p.lon,0)/g.length}:{lat:e.lat,lon:e.lon};console.log(JSON.stringify({id:e.id,type:e.type,tags:e.tags,coordinates:coords,geometry:g.length,first:g[0],last:g.at(-1)}));}
