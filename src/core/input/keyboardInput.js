const physicalKeys = {
  KeyW: "w",
  KeyS: "s",
  KeyA: "a",
  KeyD: "d",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  Space: " ",
  ShiftLeft: "shift",
  ShiftRight: "shift",
};
export function drivingKey(event) {
  return (
    physicalKeys[event.code] ||
    ([
      "w",
      "s",
      "a",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
      " ",
      "shift",
    ].includes(event.key?.toLowerCase())
      ? event.key.toLowerCase()
      : null)
  );
}

