import * as fallback from "./map.js";
import * as area from "../../../modules/areas/AreaModel.js";

const useArea = () => Boolean(area.currentRegion);

export const getFeatures = () => (useArea() ? area.features : fallback.features);
export const getRoads = () => (useArea() ? area.roads : fallback.roads);
export const getMainRoads = () =>
  useArea() ? area.mainRoads : fallback.mainRoads;
export const getRiver = () => (useArea() ? area.river : fallback.river);
export const getSites = () => (useArea() ? area.sites : fallback.sites);
export const getMappedSignals = () =>
  useArea() ? area.mappedSignals : fallback.mappedSignals;
export const getCorridorCrossings = () =>
  useArea() ? area.corridorCrossings : fallback.corridorCrossings;
export const getById = (id) => (useArea() ? area.byId(id) : fallback.byId(id));
export const getPointsOf = (feature) =>
  useArea() ? area.pointsOf(feature) : fallback.pointsOf(feature);
export const getRingsOf = (feature) =>
  useArea() ? area.ringsOf(feature) : fallback.ringsOf(feature);
export const getCentroid = (feature) =>
  useArea() ? area.centroid(feature) : fallback.centroid(feature);
export const getBoardwalkWayIds = () =>
  useArea() ? area.boardwalkWayIds : fallback.boardwalkWayIds;
