import { quocHoc } from './quoc-hoc/index.js';
import { truongTien } from './truong-tien/index.js';
import { kyDai } from './ky-dai/index.js';
import { ngoMon } from './ngo-mon/index.js';

export const landmarkModules = [quocHoc, truongTien, kyDai, ngoMon];
export function validateLandmarks(items=landmarkModules){ const ids=new Set(); for(const item of items){ if(!item.id||!item.title||!item.position||typeof item.create!=='function') throw new Error(`Landmark không hợp lệ: ${item.id||'unknown'}`); if(ids.has(item.id)) throw new Error(`Trùng landmark: ${item.id}`); ids.add(item.id); } return true; }
