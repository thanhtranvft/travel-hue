import * as THREE from "three";
import { box, label } from "../../../../core/shared/architecture/shared.js";
import { tiledRoof } from "../../../../core/shared/architecture/architecture.js";
export const ngoMon = {
  id: "ngo-mon",
  title: "Ngọ Môn",
  position: { x: -34, z: -38 },
  radius: 14,
  referenceImage: new URL(
    "../../../../assets/72797-cong-ngo-mon-hue-700x442.jpg",
    import.meta.url,
  ).href,
  description:
    "Dựng theo ảnh Ngọ Môn: nền đài đá có lối đi xuyên cổng, hàng cột đỏ và các tầng mái ngói của lầu Ngũ Phụng.",
  create() {
    const g = new THREE.Group();
    // Separate piers leave actual passageways instead of painting doors on a solid cube.
    for (const x of [-11, -7.5, -3.8, 0, 3.8, 7.5, 11]) {
      if (x === 0) continue;
      g.add(box([2.2, 3.8, 5], "#8b8c7e", [x, 1.9, 0]));
    }
    g.add(box([26, 0.8, 5.2], "#a5a18c", [0, 4.1, 0]));
    for (const x of [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10])
      for (const z of [-2, 2])
        g.add(box([0.18, 2.3, 0.18], "#983f2d", [x, 5.65, z]));
    g.add(tiledRoof(26, 7, 6.7, "#9b8b4c"));
    for (const x of [-9, 0, 9]) {
      g.add(box([x === 0 ? 8 : 4, 1.3, 3], "#9a4d34", [x, 8.1, 0]));
      const roof = tiledRoof(
        x === 0 ? 10 : 5.8,
        4.8,
        8.7,
        x === 0 ? "#c4a24e" : "#8e8b57",
      );
      roof.position.x = x;
      g.add(roof);
    }
    for (let x = -12; x < 13; x += 0.65)
      g.add(box([0.12, 0.65, 0.12], "#d1c7aa", [x, 4.8, -2.5]));
    for (const x of [-12.5, 12.5])
      g.add(box([0.7, 4.2, 5.3], "#9b9d88", [x, 2.1, 0]));
    const name = label("Ngọ Môn");
    name.position.y = 12;
    g.add(name);
    return g;
  },
};
