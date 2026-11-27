import * as THREE from "three";

export const POETIC_HORIZON_COLOR = "#d6eefc";
export const POETIC_BG_COLOR = "#6ec0f5";

const SKY_VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocalDir;

  void main() {
    vLocalDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uZenithColor;
  uniform vec3 uMidSkyColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uSunColor;
  uniform vec3 uCloudLightColor;
  uniform vec3 uCloudShadowColor;
  uniform vec3 uSunDir;
  uniform float uTime;

  varying vec3 vLocalDir;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm4(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      v += amp * noise2(p);
      p = rot * p * 2.04 + vec2(17.1, 31.7);
      amp *= 0.5;
    }
    return v;
  }

  float fbm3(vec2 p) {
    float v = 0.0;
    float amp = 0.52;
    mat2 rot = mat2(0.86, -0.51, 0.51, 0.86);
    for (int i = 0; i < 3; i++) {
      v += amp * noise2(p);
      p = rot * p * 2.12 + vec2(9.3, 13.8);
      amp *= 0.48;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vLocalDir);
    float h = clamp(dir.y, 0.0, 1.0);

    // Rich sunlit Hue daylight gradient: bright luminous mist at horizon -> airy cerulean -> clear azure zenith
    float lowMix = pow(clamp(h / 0.28, 0.0, 1.0), 0.72);
    vec3 sky = mix(uHorizonColor, uMidSkyColor, lowMix);
    float highMix = smoothstep(0.16, 0.86, h);
    sky = mix(sky, uZenithColor, highMix);

    // Soft atmospheric sunlight bloom & warm horizon scattering
    float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
    float horizonWarmth = pow(sunDot, 2.2) * (1.0 - smoothstep(0.0, 0.28, h));
    sky = mix(sky, uSunColor, horizonWarmth * 0.18);

    float broadHalo = pow(sunDot, 5.0) * 0.14 + pow(sunDot, 32.0) * 0.34;
    float sunDisc = smoothstep(0.99915, 0.99972, sunDot) * 1.15;
    sky += uSunColor * (broadHalo + sunDisc);

    // Poetic layered white clouds (feathery cirrus wisps + sunlit altocumulus puffs)
    float horizonFade = smoothstep(0.018, 0.165, dir.y);
    if (horizonFade > 0.001) {
      float domeProj = max(dir.y, 0.0) + 0.145;
      vec2 cloudUv = dir.xz / domeProj;

      // Layer 1: High feathery cirrus streaks
      vec2 cirrusUv = cloudUv * vec2(0.72, 1.32) + vec2(uTime * 0.0020, uTime * 0.0007);
      float warp = fbm3(cirrusUv * 0.65 + vec2(4.2, 1.9));
      float cirrusRaw = fbm3(cirrusUv + vec2(warp * 0.55, -warp * 0.35));
      float cirrusMask = smoothstep(0.50, 0.80, cirrusRaw) * 0.42 * horizonFade;
      sky = mix(sky, uCloudLightColor, cirrusMask);

      // Layer 2: Soft sunlit cumulus / altocumulus clusters
      vec2 puffUv = cloudUv * 1.28 + vec2(uTime * 0.0036, -uTime * 0.0011);
      float puffDensity = fbm4(puffUv);
      float puffDetail = fbm3(puffUv * 2.25 - vec2(uTime * 0.0014, 0.0));
      float puffShape = puffDensity * 0.78 + puffDetail * 0.26;
      float puffAlpha = smoothstep(0.52, 0.78, puffShape) * 0.88 * horizonFade;

      // Subtle cloud shading: bright sunlit white tops, delicate sky-blue underside
      float shadeFactor = clamp((puffShape - 0.50) * 2.6 + sunDot * 0.32, 0.0, 1.0);
      vec3 puffColor = mix(uCloudShadowColor, uCloudLightColor, shadeFactor);
      puffColor += uSunColor * (pow(sunDot, 8.0) * 0.12 * puffAlpha);
      sky = mix(sky, puffColor, puffAlpha);
    }

    gl_FragColor = vec4(sky, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createPoeticSky({
  radius = 2200,
  sunDirection = new THREE.Vector3(-0.48, 0.52, -0.70).normalize(),
} = {}) {
  const geometry = new THREE.SphereGeometry(radius, 48, 32);
  const uniforms = {
    uZenithColor: { value: new THREE.Color("#136de0") },
    uMidSkyColor: { value: new THREE.Color("#4db7f7") },
    uHorizonColor: { value: new THREE.Color(POETIC_HORIZON_COLOR) },
    uSunColor: { value: new THREE.Color("#fff7e2") },
    uCloudLightColor: { value: new THREE.Color("#ffffff") },
    uCloudShadowColor: { value: new THREE.Color("#cce6fa") },
    uSunDir: { value: sunDirection.clone().normalize() },
    uTime: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: SKY_VERTEX_SHADER,
    fragmentShader: SKY_FRAGMENT_SHADER,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "hue-poetic-sky-dome";
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;

  return {
    mesh,
    material,
    uniforms,
    update(time = 0, position = null) {
      uniforms.uTime.value = time;
      if (position && Number.isFinite(position.x) && Number.isFinite(position.z)) {
        mesh.position.set(position.x, 0, position.z);
      }
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
