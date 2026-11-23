import * as THREE from "three";
import { mat } from "../../../../core/shared/architecture/shared.js";

function createTeacherFaceTexture(lipColor = "#c85b63") {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  if (!canvas || typeof canvas.getContext !== "function") return null;
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Warm natural skin tone
  ctx.fillStyle = "#f1c7a6";
  ctx.fillRect?.(0, 0, 256, 128);

  // Soft rosy cheeks
  ctx.fillStyle = "rgba(235, 132, 132, 0.35)";
  for (const cx of [96, 160]) {
    ctx.beginPath?.();
    ctx.arc?.(cx, 76, 10, 0, Math.PI * 2);
    ctx.fill?.();
  }

  // Gentle brows and warm eyes
  ctx.strokeStyle = "#2d201a";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const ex of [109, 147]) {
    ctx.beginPath?.();
    ctx.moveTo?.(ex - 9, 51);
    ctx.lineTo?.(ex + 9, 50);
    ctx.stroke?.();

    ctx.fillStyle = "#241814";
    ctx.beginPath?.();
    ctx.arc?.(ex, 63, 4.5, 0, Math.PI * 2);
    ctx.fill?.();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath?.();
    ctx.arc?.(ex - 1.4, 61.5, 1.5, 0, Math.PI * 2);
    ctx.fill?.();
  }

  // Warm smile
  ctx.strokeStyle = lipColor;
  ctx.lineWidth = 3.2;
  ctx.beginPath?.();
  ctx.arc?.(128, 80, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke?.();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createAoDaiTeacher({
  aoDaiColor = "#7b4b94",
  trouserColor = "#f7f4ec",
  hairStyle = "bun",
  prop = "none",
  heightScale = 1.0,
} = {}) {
  const teacher = new THREE.Group();
  teacher.name = "quang-trung-ao-dai-teacher";

  const silkMat = mat(aoDaiColor, 0.44, 0.05, { side: THREE.DoubleSide });
  const trouserMat = mat(trouserColor, 0.48, 0.04);
  const skinMat = mat("#f1c7a6", 0.68, 0.02);
  const hairMat = mat("#1f1a18", 0.82, 0.04);
  const shoeMat = mat("#2c2320", 0.52, 0.08);
  const goldMat = mat("#e3b94f", 0.28, 0.65);

  const root = new THREE.Group();
  root.scale.setScalar(heightScale);
  teacher.add(root);

  // 1) Low-heeled sandals & wide-leg silk trousers (grounded flush at y = 0)
  for (const sx of [-0.075, 0.075]) {
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.045, 0.19),
      shoeMat,
    );
    shoe.position.set(sx, 0.0225, 0.02);
    shoe.castShadow = true;
    root.add(shoe);

    const trouserLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.112, 0.86, 12),
      trouserMat,
    );
    trouserLeg.position.set(sx, 0.47, 0);
    trouserLeg.castShadow = trouserLeg.receiveShadow = true;
    root.add(trouserLeg);
  }

  // Upper body pivot from waist (y = 0.92)
  const upperPivot = new THREE.Group();
  upperPivot.position.set(0, 0.92, 0);
  root.add(upperPivot);

  // 2) Contoured áo dài bodice + Mandarin collar (cổ tàu)
  const waistMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.112, 0.098, 0.17, 14),
    silkMat,
  );
  waistMesh.scale.set(1.12, 1, 0.78);
  waistMesh.position.set(0, 0.075, 0);
  waistMesh.castShadow = true;
  upperPivot.add(waistMesh);

  const chestMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.128, 0.112, 0.24, 14),
    silkMat,
  );
  chestMesh.scale.set(1.14, 1, 0.8);
  chestMesh.position.set(0, 0.27, 0);
  chestMesh.castShadow = true;
  upperPivot.add(chestMesh);

  // Mandarin collar (cổ tàu)
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.056, 0.066, 0.055, 14),
    silkMat,
  );
  collar.position.set(0, 0.405, 0);
  upperPivot.add(collar);

  // Delicate brooch / pin accent at collar side
  const brooch = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 8, 8),
    goldMat,
  );
  brooch.position.set(0.052, 0.37, 0.068);
  upperPivot.add(brooch);

  // 3) Signature flowing split áo dài panels (tà trước & tà sau)
  const frontFlapPivot = new THREE.Group();
  frontFlapPivot.position.set(0, 0.02, 0.012);
  const frontFlap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.112,
      0.188,
      0.72,
      12,
      1,
      true,
      -Math.PI * 0.31,
      Math.PI * 0.62,
    ),
    silkMat,
  );
  frontFlap.scale.set(1.08, 1, 0.78);
  frontFlap.position.set(0, -0.36, 0);
  frontFlap.castShadow = frontFlap.receiveShadow = true;
  frontFlapPivot.add(frontFlap);
  upperPivot.add(frontFlapPivot);

  const backFlapPivot = new THREE.Group();
  backFlapPivot.position.set(0, 0.02, -0.012);
  const backFlap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.112,
      0.195,
      0.74,
      12,
      1,
      true,
      Math.PI - Math.PI * 0.31,
      Math.PI * 0.62,
    ),
    silkMat,
  );
  backFlap.scale.set(1.08, 1, 0.78);
  backFlap.position.set(0, -0.37, 0);
  backFlap.castShadow = backFlap.receiveShadow = true;
  backFlapPivot.add(backFlap);
  upperPivot.add(backFlapPivot);

  // 4) Head, face & classic Vietnamese teacher hairstyles
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.43, 0);
  upperPivot.add(headPivot);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.052, 0.075, 10),
    skinMat,
  );
  neck.position.set(0, 0.03, 0);
  headPivot.add(neck);

  const faceTex = createTeacherFaceTexture();
  const headMat = faceTex
    ? mat("#ffffff", 0.66, 0.02, { map: faceTex })
    : skinMat;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.114, 16, 14),
    headMat,
  );
  head.position.set(0, 0.145, 0.005);
  head.rotation.y = -Math.PI / 2;
  head.scale.set(1.0, 1.06, 0.94);
  head.castShadow = true;
  headPivot.add(head);

  // Hair cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.122, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
  );
  hairCap.position.set(0, 0.158, -0.005);
  hairCap.rotation.x = -0.22;
  hairCap.castShadow = true;
  headPivot.add(hairCap);

  if (hairStyle === "bun") {
    const bun = new THREE.Mesh(
      new THREE.SphereGeometry(0.056, 12, 10),
      hairMat,
    );
    bun.position.set(0, 0.15, -0.125);
    bun.scale.set(1.08, 0.92, 0.85);
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.13, 6),
      goldMat,
    );
    pin.rotation.z = Math.PI * 0.38;
    pin.position.set(0, 0.165, -0.132);
    headPivot.add(bun, pin);
  } else if (hairStyle === "long") {
    const backHair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.118, 0.34, 12, 1, false, Math.PI * 0.6, Math.PI * 0.8),
      hairMat,
    );
    backHair.position.set(0, 0.03, -0.02);
    backHair.castShadow = true;
    headPivot.add(backHair);
  } else {
    // Low side-swept chignon
    const lowBun = new THREE.Mesh(
      new THREE.SphereGeometry(0.054, 12, 10),
      hairMat,
    );
    lowBun.position.set(0.035, 0.105, -0.115);
    headPivot.add(lowBun);
  }

  // 5) Articulated long áo dài sleeves & hands
  const buildArm = (sx) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(sx * 0.165, 0.355, 0);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.038, 0.23, 10),
      silkMat,
    );
    upperArm.position.set(0, -0.11, 0);
    upperArm.castShadow = true;
    armPivot.add(upperArm);

    const forearmPivot = new THREE.Group();
    forearmPivot.position.set(0, -0.22, 0);
    armPivot.add(forearmPivot);

    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.034, 0.21, 10),
      silkMat,
    );
    sleeve.position.set(0, -0.1, 0);
    sleeve.castShadow = true;
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 8, 8),
      skinMat,
    );
    hand.position.set(0, -0.225, 0.01);
    forearmPivot.add(sleeve, hand);

    armPivot.forearm = forearmPivot;
    upperPivot.add(armPivot);
    return armPivot;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  if (prop === "notebook") {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.032, 0.29),
      mat("#1f4e78", 0.65, 0.05),
    );
    book.position.set(0.03, -0.21, 0.09);
    book.rotation.set(0.15, 0.1, 0.35);
    book.castShadow = true;
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(0.205, 0.024, 0.27),
      mat("#f5f3ea", 0.85),
    );
    pages.position.set(0.008, 0, 0.004);
    book.add(pages);
    leftArm.forearm.add(book);
  } else if (prop === "handbag") {
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.01, 6, 14, Math.PI),
      mat("#3e2c23", 0.65),
    );
    strap.rotation.y = Math.PI / 2;
    strap.position.set(0, -0.2, 0.01);
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.21),
      mat("#c99d70", 0.58, 0.08),
    );
    bag.position.set(0, -0.32, 0.01);
    bag.castShadow = true;
    const clasp = new THREE.Mesh(
      new THREE.BoxGeometry(0.086, 0.028, 0.04),
      goldMat,
    );
    clasp.position.set(0, 0.02, 0);
    bag.add(clasp);
    rightArm.forearm.add(strap, bag);
  }

  teacher.userData.rig = {
    upperPivot,
    headPivot,
    leftArm,
    rightArm,
    frontFlapPivot,
    backFlapPivot,
  };
  return teacher;
}

export function createTeachersChatGroup() {
  const group = new THREE.Group();
  group.name = "quang-trung-teachers-group";

  const specs = [
    {
      aoDaiColor: "#7b4b94", // Tím Huế
      trouserColor: "#f7f4ec",
      hairStyle: "bun",
      prop: "notebook",
      heightScale: 1.01,
      angle: 0.35,
      radius: 0.92,
      pose: "presenter",
      phase: 0.0,
    },
    {
      aoDaiColor: "#d46b8d", // Hồng sen
      trouserColor: "#f8f6ef",
      hairStyle: "long",
      prop: "handbag",
      heightScale: 0.99,
      angle: 1.92,
      radius: 0.88,
      pose: "listener",
      phase: 1.55,
    },
    {
      aoDaiColor: "#2d8d84", // Xanh ngọc
      trouserColor: "#f7f5ee",
      hairStyle: "chignon",
      prop: "none",
      heightScale: 1.0,
      angle: 3.45,
      radius: 0.94,
      pose: "converser",
      phase: 3.1,
    },
    {
      aoDaiColor: "#4886c6", // Xanh thiên thanh
      trouserColor: "#f8f6f0",
      hairStyle: "bun",
      prop: "none",
      heightScale: 0.98,
      angle: 4.95,
      radius: 0.9,
      pose: "relaxed",
      phase: 4.6,
    },
  ];

  const actors = specs.map((spec) => {
    const mesh = createAoDaiTeacher({
      aoDaiColor: spec.aoDaiColor,
      trouserColor: spec.trouserColor,
      hairStyle: spec.hairStyle,
      prop: spec.prop,
      heightScale: spec.heightScale,
    });
    const x = Math.cos(spec.angle) * spec.radius;
    const z = Math.sin(spec.angle) * spec.radius;
    mesh.position.set(x, 0, z);
    const baseYaw = Math.atan2(-x, -z);
    mesh.rotation.y = baseYaw;
    group.add(mesh);
    return {
      mesh,
      rig: mesh.userData.rig,
      baseYaw,
      pose: spec.pose,
      phase: spec.phase,
    };
  });

  const update = (time = 0) => {
    for (const a of actors) {
      const { upperPivot, headPivot, leftArm, rightArm, frontFlapPivot, backFlapPivot } = a.rig;
      const t = time + a.phase;

      // Gentle breeze across the áo dài silk panels
      const breeze = Math.sin(time * 1.45 + a.phase) * 0.035;
      frontFlapPivot.rotation.x = -0.03 + breeze;
      backFlapPivot.rotation.x = 0.04 + breeze * 1.25;

      // Subtle weight shift and head nodding while chatting
      upperPivot.rotation.z = Math.sin(t * 0.9) * 0.022;
      a.mesh.rotation.y = a.baseYaw + Math.sin(t * 0.65) * 0.07;

      const speakWave = Math.max(0, Math.sin(time * 0.85 + a.phase));
      headPivot.rotation.x = Math.sin(t * 2.1) * 0.055 * (0.5 + speakWave * 0.6);
      headPivot.rotation.y = Math.sin(t * 0.95) * 0.14;

      if (a.pose === "presenter") {
        // Left arm cradles lesson notebook; right hand gestures warmly
        leftArm.rotation.set(-0.62, 0.12, -0.16);
        leftArm.forearm.rotation.set(-0.72, 0.25, 0);
        rightArm.rotation.set(-0.48 - speakWave * 0.28, -0.1, 0.14);
        rightArm.forearm.rotation.set(-0.78 - Math.sin(t * 2.8) * 0.18 * speakWave, -0.22, 0);
      } else if (a.pose === "listener") {
        // Right wrist holds handbag; left hand responds expressively
        rightArm.rotation.set(-0.26, 0, 0.1);
        rightArm.forearm.rotation.set(-0.55, 0, 0);
        leftArm.rotation.set(-0.34 - speakWave * 0.26, 0.08, -0.12);
        leftArm.forearm.rotation.set(-0.68 - Math.sin(t * 2.5) * 0.16 * speakWave, 0.18, 0);
      } else if (a.pose === "converser") {
        // Expressive two-hand conversation pose
        leftArm.rotation.set(-0.42 - speakWave * 0.2, 0.12, -0.14);
        leftArm.forearm.rotation.set(-0.76 + Math.sin(t * 2.6) * 0.14 * speakWave, 0.2, 0);
        rightArm.rotation.set(-0.45 - speakWave * 0.22, -0.12, 0.14);
        rightArm.forearm.rotation.set(-0.78 - Math.cos(t * 2.6) * 0.14 * speakWave, -0.2, 0);
      } else {
        // Relaxed attentive pose with one hand gently raised
        leftArm.rotation.set(-0.14, 0, -0.08);
        leftArm.forearm.rotation.set(-0.28, 0, 0);
        rightArm.rotation.set(-0.36 - speakWave * 0.22, -0.1, 0.12);
        rightArm.forearm.rotation.set(-0.66 - Math.sin(t * 2.2) * 0.14 * speakWave, -0.18, 0);
      }
    }
  };

  update(0);
  return { group, actors, update };
}
