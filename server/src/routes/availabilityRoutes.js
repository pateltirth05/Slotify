import express from "express";
import { getAvailability } from "../controllers/bookingController.js";

const router = express.Router();

router.get(
  "/:resourceId",
  getAvailability
);

export default router;