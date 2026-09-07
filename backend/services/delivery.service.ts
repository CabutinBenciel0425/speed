import {
  BASE_DELIVERY_FEE,
  MINIMUM_DISTANCE,
  MINIMUM_DISTANCE_WITH_ADDITIONAL,
  PRICE_PER_MINIMUM_DISTANCE,
} from "../config/constants.js";
import openRoute from "../lib/openRoute.js";

export const computeDistance = async (
  merchantCoordinates: [number, number],
  customerCoordinates: [number, number],
) => {
  const response = await openRoute.post("/v2/directions/driving-car", {
    coordinates: [merchantCoordinates, customerCoordinates],
  });

  (console.log(merchantCoordinates), console.log(customerCoordinates));

  const summary = response.data.routes[0].summary;

  return {
    distanceKm: summary.distance / 1000,
    durationMinutes: Math.ceil(summary.duration / 60),
  };
};

export const computeDeliveryFee = (distanceKm: number) => {
  if (distanceKm <= MINIMUM_DISTANCE) {
    return BASE_DELIVERY_FEE;
  }

  const extra = distanceKm - MINIMUM_DISTANCE;
  const extraBlocks = Math.ceil(extra / MINIMUM_DISTANCE_WITH_ADDITIONAL);
  const additionalCost = extraBlocks * PRICE_PER_MINIMUM_DISTANCE;

  return BASE_DELIVERY_FEE + additionalCost;
};
