export function renderQuality({ coarse = false, width = 1280, dpr = 1 } = {}) {
  const mobile = coarse || width < 760;
  return {
    mobile,
    pixelRatio: Math.min(dpr, mobile ? 1 : 1.6),
    shadows: !mobile,
    physicsHz: mobile ? 60 : 120,
    maxSubsteps: mobile ? 4 : 12,
    grassSamples: mobile ? 5000 : 18000,
    grassSpan: mobile ? 110 : 160,
    crowdDistance: mobile ? 95 : 140,
    staticDistance: mobile ? 320 : 1800,
  };
}
