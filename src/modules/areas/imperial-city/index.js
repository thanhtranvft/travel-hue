import model from "./model/osm.json" with { type: "json" };
export const id = "imperial-city";
export const loadModel = async () => ({ default: model });
