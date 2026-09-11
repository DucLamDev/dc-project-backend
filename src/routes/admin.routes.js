import multer from "multer";
import { Router } from "express";
import { login, testEmail } from "../controllers/admin.controller.js";
import { getDashboard, exportRsvps } from "../controllers/rsvp.controller.js";
import { getGuests, patchGuest, postGuest, removeGuest, uploadGuests } from "../controllers/guest.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

router.post("/login", login);
router.post("/email-test", requireAdmin, testEmail);
router.get("/dashboard", requireAdmin, getDashboard);
router.get("/export", requireAdmin, exportRsvps);
router.get("/guests", requireAdmin, getGuests);
router.post("/guests", requireAdmin, postGuest);
router.patch("/guests/:id", requireAdmin, patchGuest);
router.delete("/guests/:id", requireAdmin, removeGuest);
router.post("/guests/import", requireAdmin, upload.single("file"), uploadGuests);

export default router;
