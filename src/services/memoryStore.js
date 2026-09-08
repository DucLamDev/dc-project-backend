import { normalizeName } from "../utils/normalize.js";

const initialGuests = [
  "Camille Martin",
  "Julien Bernard",
  "Sophie Moreau",
  "Taylor Morgan",
  "Alex Carter"
];

let guests = initialGuests.map((fullName, index) => ({
  id: `guest-${index + 1}`,
  fullName,
  normalizedName: normalizeName(fullName),
  email: "",
  phone: "",
  allowedPlusOnes: 1,
  notes: "",
  createdAt: new Date(),
  updatedAt: new Date()
}));

let rsvps = [];

export const memoryStore = {
  async findGuestByName(fullName) {
    const normalizedName = normalizeName(fullName);
    return guests.find((guest) => guest.normalizedName === normalizedName) || null;
  },

  async listGuests() {
    return guests;
  },

  async createGuest(payload) {
    const guest = {
      id: crypto.randomUUID(),
      ...payload,
      normalizedName: normalizeName(payload.fullName),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    guests = [guest, ...guests.filter((item) => item.normalizedName !== guest.normalizedName)];
    return guest;
  },

  async updateGuest(id, payload) {
    guests = guests.map((guest) =>
      guest.id === id
        ? {
            ...guest,
            ...payload,
            normalizedName: normalizeName(payload.fullName || guest.fullName),
            updatedAt: new Date()
          }
        : guest
    );
    return guests.find((guest) => guest.id === id);
  },

  async deleteGuest(id) {
    guests = guests.filter((guest) => guest.id !== id);
  },

  async bulkCreateGuests(rows) {
    const created = [];
    for (const row of rows) {
      if (!row.fullName) continue;
      created.push(await this.createGuest(row));
    }
    return created;
  },

  async upsertRsvp(payload) {
    const normalizedName = normalizeName(payload.fullName);
    const guest = guests.find((item) => item.normalizedName === normalizedName) || null;
    const record = {
      id: crypto.randomUUID(),
      guest: guest?.id,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    rsvps = [record, ...rsvps.filter((item) => normalizeName(item.fullName) !== normalizedName)];
    return record;
  },

  async listRsvps() {
    return rsvps;
  }
};
