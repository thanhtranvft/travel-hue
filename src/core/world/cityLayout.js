// One source for road geometry, spawn points, traffic and the minimap.
// Prototype coordinates in metres; not surveyed GPS positions.
export const CITY = {
  riverHalfWidth: 15,
  roadCenter: 32,
  roadWidth: 14,
  promenade: 18,
  treeLine: 23,
  sidewalk: 42,
  houseLine: 54,
  bounds: { x: 145, z: 90 },
};
export const BRIDGE = {
  x: 9,
  z: 0,
  width: 16,
  length: 48,
  deck: 2.18,
  rampLength: 10,
  ground: 0.23,
};
export const bridgeHeight = (z) => {
  const distance = Math.abs(z - BRIDGE.z),
    half = BRIDGE.length / 2;
  if (distance <= half) return BRIDGE.deck;
  return (
    BRIDGE.ground +
    Math.max(0, 1 - (distance - half) / BRIDGE.rampLength) *
      (BRIDGE.deck - BRIDGE.ground)
  );
};
