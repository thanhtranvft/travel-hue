export const id = "south-bank";
export const loadModel = () => import("./model/osm.json", { with: { type: "json" } });
