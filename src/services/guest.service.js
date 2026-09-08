import { Guest } from "../models/Guest.js";
import { memoryStore } from "./memoryStore.js";
import { normalizeName } from "../utils/normalize.js";

export async function findGuestByName(app, fullName) {
  if (!fullName) return null;

  if (!app.locals.databaseConnected) {
    return memoryStore.findGuestByName(fullName);
  }

  return Guest.findOne({ normalizedName: normalizeName(fullName) }).lean();
}

export async function listGuests(app) {
  if (!app.locals.databaseConnected) {
    return memoryStore.listGuests();
  }

  return Guest.find().sort({ createdAt: -1 }).lean();
}

export async function createGuest(app, payload) {
  const data = {
    ...payload,
    normalizedName: normalizeName(payload.fullName)
  };

  if (!app.locals.databaseConnected) {
    return memoryStore.createGuest(data);
  }

  return Guest.findOneAndUpdate({ normalizedName: data.normalizedName }, data, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }).lean();
}

export async function updateGuest(app, id, payload) {
  const data = {
    ...payload,
    normalizedName: normalizeName(payload.fullName)
  };

  if (!app.locals.databaseConnected) {
    return memoryStore.updateGuest(id, data);
  }

  return Guest.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteGuest(app, id) {
  if (!app.locals.databaseConnected) {
    return memoryStore.deleteGuest(id);
  }

  return Guest.findByIdAndDelete(id);
}

export async function importGuests(app, rows) {
  const normalizedRows = rows
    .map((row) => ({
      fullName: row.fullName || row.name || row.Nom || row["Nom complet"] || row["Full Name"],
      email: row.email || row.Email || "",
      phone: row.phone || row.Phone || row.Telephone || "",
      allowedPlusOnes: Number(row.allowedPlusOnes || row.plusOnes || row["Plus Ones"] || 0),
      notes: row.notes || row.Notes || ""
    }))
    .filter((row) => row.fullName);

  if (!app.locals.databaseConnected) {
    return memoryStore.bulkCreateGuests(normalizedRows);
  }

  const operations = normalizedRows.map((row) => ({
    updateOne: {
      filter: { normalizedName: normalizeName(row.fullName) },
      update: { $set: { ...row, normalizedName: normalizeName(row.fullName) } },
      upsert: true
    }
  }));

  if (!operations.length) return [];
  await Guest.bulkWrite(operations);
  return normalizedRows;
}
