import { Router } from "express";
import { lookupGuest } from "../controllers/guest.controller.js";

const router = Router();

router.get("/lookup", lookupGuest);

export default router;
