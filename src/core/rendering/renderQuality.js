export function renderQuality({ coarse = false, width = 1280, dpr = 1 } = {}) {
  const mobile = coarse || width < 760;
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return {
    mobile,
    pixelRatio: Math.min(safeDpr, mobile ? 2 : 1.5),
    shadows: !mobile,
    physicsHz: mobile ? 60 : 120,
    maxSubsteps: mobile ? 4 : 12,
    grassSamples: mobile ? 6000 : 12000,
    grassSpan: mobile ? 120 : 145,
    crowdDistance: mobile ? 115 : 145,
    staticDistance: mobile ? 1050 : 1450,
  };
}
