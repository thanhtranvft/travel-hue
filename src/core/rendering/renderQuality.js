export function renderQuality({ coarse = false, width = 1280, dpr = 1 } = {}) {
  const mobile = coarse || width < 760;
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return {
    mobile,
    pixelRatio: Math.min(safeDpr, mobile ? 2 : 1.8),
    shadows: !mobile,
    physicsHz: mobile ? 60 : 120,
    maxSubsteps: mobile ? 4 : 12,
    grassSamples: mobile ? 8000 : 18000,
    grassSpan: mobile ? 130 : 160,
    crowdDistance: mobile ? 120 : 140,
    staticDistance: mobile ? 1100 : 1800,
  };
}
