import { quocHoc } from "../../../modules/areas/quoc-hoc/view/BiaQuocHoc.js";
import { truongTien } from "../../../modules/areas/truong-tien/view/TruongTien.js";
import { kyDai } from "../../../modules/areas/imperial-city/view/KyDai.js";
import { ngoMon } from "../../../modules/areas/imperial-city/view/NgoMon.js";

export const landmarkModules = [quocHoc, truongTien, kyDai, ngoMon];
export function validateLandmarks(items = landmarkModules) {
  const ids = new Set();
  for (const item of items) {
    if (
      !item.id ||
      !item.title ||
      !item.position ||
      typeof item.create !== "function"
    )
      throw new Error(`Landmark không hợp lệ: ${item.id || "unknown"}`);
    if (ids.has(item.id)) throw new Error(`Trùng landmark: ${item.id}`);
    ids.add(item.id);
  }
  return true;
}
