import model from "./model/osm.json" with { type: "json" };
export const id = "north-bank";
export const loadModel = async () => ({ default: model });
