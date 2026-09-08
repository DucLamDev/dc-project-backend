import { createGuest, deleteGuest, findGuestByName, importGuests, listGuests, updateGuest } from "../services/guest.service.js";
import { parseGuestFile } from "../utils/parseGuestFile.js";

export async function lookupGuest(req, res) {
  const guest = await findGuestByName(req.app, req.query.name);
  res.json({
    found: Boolean(guest),
    guest: guest
      ? {
          fullName: guest.fullName,
          allowedPlusOnes: guest.allowedPlusOnes
        }
      : null
  });
}

export async function getGuests(req, res) {
  res.json(await listGuests(req.app));
}

export async function postGuest(req, res) {
  const guest = await createGuest(req.app, req.body);
  res.status(201).json(guest);
}

export async function patchGuest(req, res) {
  const guest = await updateGuest(req.app, req.params.id, req.body);
  res.json(guest);
}

export async function removeGuest(req, res) {
  await deleteGuest(req.app, req.params.id);
  res.status(204).send();
}

export async function uploadGuests(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const rows = await parseGuestFile(req.file);
  const imported = await importGuests(req.app, rows);
  res.status(201).json({ imported: imported.length });
}
