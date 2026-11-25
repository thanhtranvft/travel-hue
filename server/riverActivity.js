const BIA_DECK_CENTER = { x: 480.44, z: -498.06 };

export const RIVER_FISH_REWARDS = {
  "ca-bong": { title: "Cá bống sông Hương", points: 15 },
  "ca-chep": { title: "Cá chép vàng", points: 25 },
  "ca-loc": { title: "Cá lóc đồng", points: 35 },
  "ca-dieu-hong": { title: "Cá điêu hồng", points: 45 },
  "ca-hoang-de": { title: "Cá tiến vua Ngự Hà", points: 65 },
};

export const BOAT_CRUISE_REWARD = {
  title: "Du ngoạn sông Hương",
  points: 15,
};

export function handleRiverRewardAction(p, message, room, now = Date.now()) {
  if (!p || !message || message.action !== "river_reward") return false;
  if (p.region !== "quoc-hoc") return false;
  const area = room.areas?.get(p.region);
  if (!area || !room.contains(area.region, p.x, p.z)) return false;

  const kind = message.kind === "boat_cruise" ? "boat_cruise" : "fish_catch";
  let points = 0;
  let label = "";
  let speciesId = null;

  if (kind === "fish_catch") {
    if (now - (p.lastFishRewardAt || 0) < 2200) return false;
    const distFromBia = Math.hypot(
      (p.x || 0) - BIA_DECK_CENTER.x,
      (p.z || 0) - BIA_DECK_CENTER.z,
    );
    if (distFromBia > 105) return false;
    const spec = RIVER_FISH_REWARDS[message.speciesId] || RIVER_FISH_REWARDS["ca-bong"];
    speciesId = RIVER_FISH_REWARDS[message.speciesId] ? message.speciesId : "ca-bong";
    points = spec.points;
    label = spec.title;
    p.lastFishRewardAt = now;
    p.fishCount = (p.fishCount || 0) + 1;
  } else {
    if (p.stance !== "boat") return false;
    if (now - (p.lastBoatRewardAt || 0) < 6000) return false;
    points = BOAT_CRUISE_REWARD.points;
    label = BOAT_CRUISE_REWARD.title;
    p.lastBoatRewardAt = now;
  }

  p.riverScore = (p.riverScore || 0) + points;
  if (p.tagStats) {
    p.tagStats.score = (p.tagStats.score || 0) + points;
  }

  room.send(p, {
    type: "mode_event",
    event: "river_reward",
    kind,
    speciesId,
    label,
    points,
    riverScore: p.riverScore,
    fishCount: p.fishCount || 0,
  });
  return true;
}
