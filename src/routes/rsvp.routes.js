import { Router } from "express";
import { postRsvp } from "../controllers/rsvp.controller.js";

const router = Router();

router.post("/", postRsvp);

export default router;
