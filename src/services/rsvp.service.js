import { RSVP } from "../models/RSVP.js";
import { memoryStore } from "./memoryStore.js";
import { findGuestByName } from "./guest.service.js";
import { normalizeName } from "../utils/normalize.js";

export async function submitRsvp(app, payload) {
  const guest = await findGuestByName(app, payload.fullName);
  const allowOpenRsvp = process.env.ALLOW_OPEN_RSVP === "true";

  if (!guest && !allowOpenRsvp) {
    const error = new Error("Guest not found on the approved guest list.");
    error.status = 404;
    throw error;
  }

  const data = {
    guest: guest?._id || guest?.id,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone || "",
    attendance: payload.attendance,
    dietaryRequirements: ["reception", "both"].includes(payload.attendance) ? payload.dietaryRequirements || "" : "",
    message: payload.message || ""
  };

  if (!app.locals.databaseConnected) {
    return memoryStore.upsertRsvp(data);
  }

  return RSVP.findOneAndUpdate({ fullName: new RegExp(`^${escapeRegExp(payload.fullName)}$`, "i") }, { $set: data, $unset: { partySize: "", menuChoice: "" } }, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    strict: false
  }).lean();
}

export async function listRsvps(app) {
  if (!app.locals.databaseConnected) {
    return memoryStore.listRsvps();
  }

  return RSVP.find().sort({ updatedAt: -1 }).lean();
}

export async function getRsvpStats(app) {
  const [guests, rsvps] = await Promise.all([
    app.locals.databaseConnected ? import("./guest.service.js").then(({ listGuests }) => listGuests(app)) : memoryStore.listGuests(),
    listRsvps(app)
  ]);

  const attending = rsvps.filter((rsvp) => ["ceremony", "reception", "both"].includes(rsvp.attendance)).length;
  const declined = rsvps.filter((rsvp) => rsvp.attendance === "decline").length;

  return {
    attending,
    declined,
    pending: Math.max(guests.length - rsvps.length, 0)
  };
}

function escapeRegExp(value) {
  return normalizeName(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
