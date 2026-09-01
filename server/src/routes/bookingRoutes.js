import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireRole("CUSTOMER"),
  createBooking
);

export default router;