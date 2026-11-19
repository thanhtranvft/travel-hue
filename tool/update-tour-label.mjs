import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../src/core/shared/geography/map.js',import.meta.url),source=await readFile(path,'utf8');
const old="makeDistrict('quoc-hoc','Ga Huế · Lê Lợi','Quốc Học → Hai Bà Trưng → UBND → bệnh viện → Phú Xuân'";
if(!source.includes(old))throw new Error('Không tìm thấy nhãn tour cần sửa');
await writeFile(path,source.replace(old,"makeDistrict('quoc-hoc','Ga Huế → Tràng Tiền','Lê Lợi · Quốc Học → Phú Xuân → Tràng Tiền'"));
