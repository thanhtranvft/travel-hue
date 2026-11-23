import * as THREE from "three";
import { box, mat } from "../../../../core/shared/architecture/shared.js";

function createVendorCanvasTexture(width, height, draw) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createNonLa(radius = 0.24, height = 0.16) {
  const g = new THREE.Group();
  const brim = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 18, 1, true),
    mat("#e8d39c", 0.78, 0.02, { side: THREE.DoubleSide }),
  );
  brim.position.y = height * 0.5;
  brim.castShadow = true;
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.66, 0.012, 6, 16),
    mat("#c5a86b", 0.85),
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = height * 0.22;
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.03, 10),
    mat("#d5ba7d", 0.78),
  );
  tip.position.y = height + 0.005;
  g.add(brim, band, tip);
  return g;
}

function createVendorPerson({
  shirtColor = "#5e7f7a",
  pantsColor = "#24292e",
  hat = "non-la",
  apronColor = null,
  seated = false,
  withFan = false,
} = {}) {
  const g = new THREE.Group();
  const skinMat = mat("#dfb591", 0.72);
  const shirtMat = mat(shirtColor, 0.82);
  const pantsMat = mat(pantsColor, 0.86);
  const hairMat = mat("#262220", 0.85);

  const hipY = seated ? 0.42 : 0.78;

  // Legs
  for (const sx of [-0.095, 0.095]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.058, seated ? 0.34 : 0.52, 4, 8),
      pantsMat,
    );
    if (seated) {
      leg.rotation.x = -Math.PI * 0.46;
      leg.position.set(sx, hipY - 0.04, 0.18);
    } else {
      leg.position.set(sx, 0.36, 0);
    }
    leg.castShadow = true;
    g.add(leg);

    const sandal = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.05, 0.21),
      mat("#47392e", 0.82),
    );
    sandal.position.set(sx, 0.025, seated ? 0.38 : 0.04);
    g.add(sandal);
  }

  // Torso (áo bà ba / shirt)
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.165, 0.36, 5, 10),
    shirtMat,
  );
  torso.position.set(0, hipY + 0.27, 0);
  torso.castShadow = true;
  g.add(torso);

  if (apronColor) {
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.44, 0.04),
      mat(apronColor, 0.78),
    );
    apron.position.set(0, hipY + 0.14, 0.16);
    g.add(apron);
  }

  // Head + hair bun + hat
  const headY = hipY + 0.64;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 12), skinMat);
  head.position.set(0, headY, 0);
  head.castShadow = true;
  g.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
  );
  hair.position.set(0, headY + 0.02, -0.01);
  g.add(hair);

  if (hat === "non-la") {
    const nonLa = createNonLa(0.25, 0.165);
    nonLa.position.set(0, headY + 0.065, 0.01);
    nonLa.rotation.x = 0.06;
    g.add(nonLa);
  } else if (hat === "cap") {
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      mat("#2a4d78", 0.75),
    );
    crown.position.set(0, headY + 0.04, 0);
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12, 1, false, -0.7, 1.4),
      mat("#213d5e", 0.75),
    );
    visor.position.set(0, headY + 0.04, 0.08);
    g.add(crown, visor);
  } else {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), hairMat);
    bun.position.set(0, headY + 0.02, -0.14);
    g.add(bun);
  }

  // Left & right arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const armPivot = new THREE.Group();
    armPivot.position.set(sx * 0.21, hipY + 0.43, 0);
    const sleeve = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.05, 0.34, 4, 8),
      shirtMat,
    );
    sleeve.position.y = -0.18;
    const hand = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 8, 8),
      skinMat,
    );
    hand.position.y = -0.38;
    armPivot.add(sleeve, hand);

    if (sx > 0 && withFan) {
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.015, 10),
        mat("#d8bc78", 0.85),
      );
      fan.rotation.z = Math.PI / 2;
      fan.position.set(0.02, -0.44, 0.12);
      armPivot.add(fan);
    }

    armPivot.rotation.x = -0.45;
    g.add(armPivot);
    arms.push(armPivot);
  }

  g.userData.arms = arms;
  return g;
}

function createPlasticStool(color = "#d63232") {
  const g = new THREE.Group();
  const m = mat(color, 0.55, 0.04);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.04, 0.28),
    m,
  );
  top.position.y = 0.28;
  top.castShadow = true;
  g.add(top);
  for (const sx of [-0.1, 0.1]) {
    for (const sz of [-0.1, 0.1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.016, 0.28, 6),
        m,
      );
      leg.position.set(sx, 0.14, sz);
      leg.rotation.z = -sx * 0.16;
      leg.rotation.x = sz * 0.16;
      g.add(leg);
    }
  }
  return g;
}

function createBambooBasketWithComNam(variant = 0) {
  const g = new THREE.Group();

  // Woven bamboo basket built via LatheGeometry
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.24, 0.01),
    new THREE.Vector2(0.32, 0.14),
    new THREE.Vector2(0.35, 0.26),
    new THREE.Vector2(0.32, 0.27),
    new THREE.Vector2(0.29, 0.13),
    new THREE.Vector2(0.21, 0.04),
    new THREE.Vector2(0, 0.04),
  ];
  const basket = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 18),
    mat("#b88c4f", 0.88),
  );
  basket.castShadow = basket.receiveShadow = true;
  g.add(basket);

  // Darker bamboo rim binding
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.335, 0.02, 7, 18),
    mat("#8d6432", 0.85),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.265;
  g.add(rim);

  // Fresh green banana-leaf lining inside basket
  const leaf = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.24, 0.04, 14),
    mat("#3e8438", 0.72),
  );
  leaf.position.y = 0.19;
  g.add(leaf);

  // Mound of white & sesame cơm nắm rice balls + leaf packets
  const riceOffsets = [
    [0, 0.25, 0, 0.085],
    [-0.12, 0.24, 0.08, 0.075],
    [0.12, 0.24, 0.07, 0.078],
    [-0.08, 0.24, -0.11, 0.074],
    [0.11, 0.24, -0.1, 0.076],
    [0.02, 0.31, 0.01, 0.068],
  ];
  for (let i = 0; i < riceOffsets.length; i++) {
    const [rx, ry, rz, rr] = riceOffsets[i];
    const isWrapped = variant % 2 === 1 && i % 2 === 0;
    const ball = new THREE.Mesh(
      isWrapped
        ? new THREE.CapsuleGeometry(rr * 0.75, rr * 1.1, 5, 10)
        : new THREE.SphereGeometry(rr, 10, 8),
      mat(isWrapped ? "#4b913f" : "#f7f4ea", isWrapped ? 0.74 : 0.86),
    );
    ball.scale.set(1.08, 0.86, 1.0);
    if (isWrapped) ball.rotation.set(0.3, i * 0.8, Math.PI * 0.42);
    ball.position.set(rx, ry, rz);
    ball.castShadow = true;
    g.add(ball);
  }

  // Small jar of muối vừng (roasted sesame salt)
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.11, 10),
    mat("#d9a84c", 0.5),
  );
  jar.position.set(0.18, 0.25, 0.16);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.058, 0.025, 10),
    mat("#c62f2f", 0.55),
  );
  lid.position.set(0.18, 0.315, 0.16);
  g.add(jar, lid);

  return g;
}

export function createXoiPushcartCouple() {
  const group = new THREE.Group();
  group.name = "quang-trung-xoi-cart";
  const animated = [];

  // 1) Pushcart chassis (sky-blue & warm yellow street-food cart)
  const cart = new THREE.Group();
  const steelMat = mat("#c8d0d8", 0.28, 0.82);
  const paintBlue = "#1a79c9";
  const paintCream = "#f5efe0";

  // Lower skirt & counter cabinet
  cart.add(
    box([1.56, 0.68, 0.82], paintBlue, [0, 0.56, 0]),
    box([1.6, 0.08, 0.88], paintCream, [0, 0.93, 0]),
    box([1.48, 0.54, 0.04], "#f7df74", [0, 0.56, 0.415]),
  );

  // Front printed signboard ("XÔI SÁNG NÓNG HỔI")
  const signTex = createVendorCanvasTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#d92b2b";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffe578";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffec7d";
    ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("XÔI NÓNG SÁNG", w / 2, h * 0.37, w - 32);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("XÔI GẤC · XÔI XÉO · CƠM NẮM", w / 2, h * 0.74, w - 32);
  });
  const frontSign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 0.42),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#d92b2b",
      map: signTex,
      roughness: 0.5,
    }),
  );
  frontSign.position.set(0, 0.58, 0.44);
  cart.add(frontSign);

  // 4 bicycle-style pushcart wheels grounded at y = 0
  for (const sx of [-0.62, 0.62]) {
    for (const sz of [-0.36, 0.36]) {
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.036, 8, 16),
        mat("#232528", 0.85),
      );
      tire.rotation.y = Math.PI / 2;
      tire.position.set(sx, 0.2, sz);
      tire.castShadow = true;
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.07, 8),
        steelMat,
      );
      hub.rotation.z = Math.PI / 2;
      hub.position.set(sx, 0.2, sz);
      cart.add(tire, hub);
    }
  }

  // Push handlebar on right end
  cart.add(
    box([0.04, 0.04, 0.68], "#88939e", [0.88, 0.92, 0]),
    box([0.14, 0.04, 0.04], "#88939e", [0.81, 0.92, -0.32]),
    box([0.14, 0.04, 0.04], "#88939e", [0.81, 0.92, 0.32]),
  );

  // Glass showcase cabinet (left 2/3 of counter)
  const cabW = 0.96;
  const cabH = 0.58;
  const cabD = 0.66;
  const cabX = -0.22;
  for (const cx of [cabX - cabW / 2, cabX + cabW / 2]) {
    for (const cz of [-cabD / 2, cabD / 2]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, cabH, 0.035),
        steelMat,
      );
      post.position.set(cx, 0.97 + cabH / 2, cz);
      cart.add(post);
    }
  }
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#e6f5ff",
    transparent: true,
    opacity: 0.32,
    roughness: 0.1,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const glassBox = new THREE.Mesh(
    new THREE.BoxGeometry(cabW - 0.02, cabH - 0.02, cabD - 0.02),
    glassMat,
  );
  glassBox.position.set(cabX, 0.97 + cabH / 2, 0);
  cart.add(glassBox);
  cart.add(box([cabW + 0.04, 0.04, cabD + 0.04], "#dce3ea", [cabX, 0.97 + cabH, 0]));

  // Colorful xôi trays inside glass display (xôi gấc, xôi xéo, xôi đậu xanh)
  for (const [tx, color] of [
    [-0.48, "#d94b28"],
    [-0.22, "#e5b832"],
    [0.04, "#a6c25b"],
  ]) {
    const pan = new THREE.Mesh(
      new THREE.BoxGeometry(0.23, 0.06, 0.44),
      steelMat,
    );
    pan.position.set(tx, 1.0, 0);
    const mound = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 8),
      mat(color, 0.85),
    );
    mound.scale.set(0.95, 0.52, 1.65);
    mound.position.set(tx, 1.04, 0);
    cart.add(pan, mound);
  }

  // Aluminum steamer pot (nồi đồ xôi) on right side of cart top
  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.18, 0),
    new THREE.Vector2(0.21, 0.14),
    new THREE.Vector2(0.19, 0.32),
    new THREE.Vector2(0.21, 0.34),
    new THREE.Vector2(0, 0.34),
  ];
  const steamer = new THREE.Mesh(
    new THREE.LatheGeometry(potProfile, 16),
    steelMat,
  );
  steamer.position.set(0.48, 0.97, 0);
  steamer.castShadow = true;
  const lid = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.09, 16),
    steelMat,
  );
  lid.position.set(0.48, 1.35, 0);
  cart.add(steamer, lid);

  // Subtle animated steam puffs rising from steamer
  const steamMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.32,
    roughness: 1,
    depthWrite: false,
  });
  const steamPuffs = [];
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), steamMat);
    puff.position.set(0.48 + (i - 1) * 0.04, 1.44 + i * 0.14, 0);
    cart.add(puff);
    steamPuffs.push({ mesh: puff, baseY: 1.42, phase: i * 2.1 });
  }

  // Tall striped vendor sun umbrella (ô che nắng)
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.032, 2.38, 8),
    mat("#6b747d", 0.4, 0.7),
  );
  pole.position.set(-0.08, 1.24, -0.25);
  cart.add(pole);
  const canopyTex = createVendorCanvasTexture(256, 256, (ctx, w, h) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#1c78c8" : "#f7f9fc";
      ctx.fillRect((i * w) / 8, 0, w / 8 + 1, h);
    }
  });
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(1.18, 0.42, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: canopyTex ? "#ffffff" : "#1c78c8",
      map: canopyTex,
      roughness: 0.78,
      side: THREE.DoubleSide,
    }),
  );
  canopy.position.set(-0.08, 2.42, -0.25);
  canopy.castShadow = true;
  cart.add(canopy);

  group.add(cart);

  // 2 plastic stools beside cart for waiting students
  const stool1 = createPlasticStool("#d93636");
  stool1.position.set(-0.98, 0, 0.32);
  const stool2 = createPlasticStool("#1d70b8");
  stool2.position.set(0.98, 0, 0.42);
  group.add(stool1, stool2);

  // 2) Husband & wife couple tending the xôi cart
  const wife = createVendorPerson({
    shirtColor: "#2f8f83",
    pantsColor: "#1f2429",
    hat: "non-la",
    apronColor: "#d95b5b",
    seated: false,
  });
  wife.position.set(-0.34, 0, -0.66);
  wife.rotation.y = 0.08;
  group.add(wife);

  const husband = createVendorPerson({
    shirtColor: "#638cb5",
    pantsColor: "#283038",
    hat: "cap",
    apronColor: "#e6e1d3",
    seated: false,
  });
  husband.position.set(0.48, 0, -0.64);
  husband.rotation.y = -0.18;
  group.add(husband);

  animated.push((time) => {
    const wArms = wife.userData.arms;
    if (wArms?.[1]) wArms[1].rotation.x = -0.55 + Math.sin(time * 2.4) * 0.22;
    if (wArms?.[0]) wArms[0].rotation.x = -0.35 + Math.cos(time * 1.9) * 0.1;
    wife.rotation.y = 0.08 + Math.sin(time * 0.9) * 0.08;

    const hArms = husband.userData.arms;
    if (hArms?.[0]) hArms[0].rotation.x = -0.5 + Math.sin(time * 2.1 + 1.0) * 0.18;
    if (hArms?.[1]) hArms[1].rotation.x = -0.5 + Math.cos(time * 2.1 + 1.0) * 0.16;
    husband.rotation.y = -0.18 + Math.sin(time * 0.7 + 1.2) * 0.09;

    for (const p of steamPuffs) {
      const cycle = ((time * 0.55 + p.phase) % 1);
      p.mesh.position.y = p.baseY + cycle * 0.42;
      p.mesh.scale.setScalar(0.75 + cycle * 0.85);
    }
  });

  return { group, animated };
}

export function createComNamHawker({
  style = "ganh",
  shirtColor = "#8a684e",
  facingYaw = 0,
} = {}) {
  const group = new THREE.Group();
  group.name = "quang-trung-com-nam-vendor";
  const animated = [];

  if (style === "ganh") {
    // Traditional Vietnamese quang gánh: 2 woven baskets + curved bamboo carrying pole
    const bLeft = createBambooBasketWithComNam(0);
    bLeft.position.set(-0.46, 0, 0.1);
    const bRight = createBambooBasketWithComNam(1);
    bRight.position.set(0.46, 0, 0.06);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56, 0.38, 0.1),
      new THREE.Vector3(0, 0.47, 0.08),
      new THREE.Vector3(0.56, 0.38, 0.06),
    ]);
    const pole = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 14, 0.022, 8, false),
      mat("#b98f4a", 0.82),
    );
    pole.castShadow = true;

    const stool = createPlasticStool("#a65a38");
    stool.position.set(0, 0, -0.44);

    const vendor = createVendorPerson({
      shirtColor,
      pantsColor: "#212529",
      hat: "non-la",
      seated: true,
      withFan: true,
    });
    vendor.position.set(0, 0, -0.48);

    group.add(bLeft, bRight, pole, stool, vendor);
    animated.push((time) => {
      const arms = vendor.userData.arms;
      if (arms?.[1]) {
        arms[1].rotation.x = -0.68 + Math.sin(time * 3.8) * 0.24;
        arms[1].rotation.z = 0.14 + Math.cos(time * 3.8) * 0.1;
      }
      vendor.rotation.y = Math.sin(time * 0.8) * 0.1;
    });
  } else {
    // Raised round bamboo tray (mẹt cơm nắm) on folding stool + thermos
    const stand = createPlasticStool("#3164a8");
    stand.scale.set(1.3, 1.35, 1.3);
    stand.position.set(0, 0, 0.16);
    const tray = createBambooBasketWithComNam(1);
    tray.scale.set(1.22, 0.72, 1.22);
    tray.position.set(0, 0.36, 0.16);

    // Thermos flask beside tray
    const thermos = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.08, 0.34, 12),
      mat("#b82b2b", 0.45, 0.25),
    );
    thermos.position.set(0.45, 0.17, 0.05);
    const thermosCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.075, 0.06, 12),
      mat("#f0eee8", 0.4),
    );
    thermosCap.position.set(0.45, 0.36, 0.05);

    const stool = createPlasticStool("#c83d3d");
    stool.position.set(0, 0, -0.44);

    const vendor = createVendorPerson({
      shirtColor,
      pantsColor: "#25292e",
      hat: "non-la",
      seated: true,
      withFan: true,
    });
    vendor.position.set(0, 0, -0.48);

    group.add(stand, tray, thermos, thermosCap, stool, vendor);
    animated.push((time) => {
      const arms = vendor.userData.arms;
      if (arms?.[1]) {
        arms[1].rotation.x = -0.62 + Math.sin(time * 3.4 + 0.9) * 0.22;
      }
      vendor.rotation.y = Math.sin(time * 0.7 + 1.1) * 0.11;
    });
  }

  group.rotation.y = facingYaw;
  return { group, animated };
}
