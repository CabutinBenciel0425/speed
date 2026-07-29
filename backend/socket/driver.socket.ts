import type { Socket } from "socket.io";
import Driver from "../models/driver.model.js";
import DeliveryOffer from "../models/deliveryOffer.model.js";
import { driverAcceptOffer } from "../services/driver.service.js";
import { pendingOffers } from "../utils/offerWaiting.js";

export async function joinDriverRoom(socket: Socket) {
  const driver = await Driver.findOne({
    user: socket.user._id,
  });

  if (!driver) return;

  socket.join(`driver:${driver._id}`);
}

export function registerDriverEvents(socket: Socket) {
  socket.on("delivery:accept", async ({ offerId }) => {
    const offer = await DeliveryOffer.findById(offerId);

    if (!offer) return;

    if (offer.status !== "Pending") return;

    if (offer.expiresAt < new Date()) return;

    offer.status = "Accepted";

    await offer.save();

    await driverAcceptOffer(offer._id.toString(), offer.driver.toString());

    const resolve = pendingOffers.get(offerId);

    if (resolve) {
      pendingOffers.delete(offerId);

      resolve("Accepted");
    }
  });

  socket.on("delivery:decline", async ({ offerId }) => {
    const offer = await DeliveryOffer.findById(offerId);

    if (!offer) return;

    if (offer.status !== "Pending") return;

    if (offer.expiresAt < new Date()) return;

    offer.status = "Declined";

    await offer.save();

    const resolve = pendingOffers.get(offerId);

    if (resolve) {
      pendingOffers.delete(offerId);

      resolve("Declined");
    }
  });
}
