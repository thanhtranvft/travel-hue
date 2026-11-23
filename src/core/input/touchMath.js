export function stickInput(dx, dy, radius, deadZone = 0.12) {
  if (!(radius > 0) || !Number.isFinite(dx) || !Number.isFinite(dy))
    return { x: 0, y: 0, throttle: 0, steer: 0 };
  const length = Math.hypot(dx, dy),
    scale = length > radius ? radius / length : 1,
    x = (dx * scale) / radius,
    y = (dy * scale) / radius,
    magnitude = Math.min(1, length / radius);
  if (magnitude <= deadZone)
    return { x: dx * scale, y: dy * scale, throttle: 0, steer: 0 };
  const power = (magnitude - deadZone) / (1 - deadZone);
  return {
    x: dx * scale,
    y: dy * scale,
    throttle: (y > 0.25 ? -1 : 1) * power,
    steer: x === 0 ? 0 : -Math.sign(x) * Math.abs(x) ** 1.15,
  };
}

export function stickVector(dx, dy, radius, deadZone = 0.12) {
  if (!(radius > 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) {
    return { x: 0, y: 0, dirX: 0, dirY: 0, power: 0, angle: 0 };
  }
  const length = Math.hypot(dx, dy),
    scale = length > radius ? radius / length : 1,
    x = dx * scale,
    y = dy * scale,
    normX = x / radius,
    normY = y / radius,
    magnitude = Math.min(1, length / radius);
  if (magnitude <= deadZone) {
    return { x, y, dirX: 0, dirY: 0, power: 0, angle: 0 };
  }
  const power = (magnitude - deadZone) / (1 - deadZone);
  const angle = Math.atan2(normX, -normY);
  return { x, y, dirX: normX, dirY: normY, power, angle };
}
