export const pendingOffers = new Map<
  string,
  (result: "Accepted" | "Declined" | "Expired") => void
>();
