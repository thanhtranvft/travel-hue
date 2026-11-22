import model from "./model/osm.json" with { type: "json" };
export const id = "quoc-hoc";
export const loadModel = async () => ({ default: model });
