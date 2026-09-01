import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createBooking, getMyBookings } from "../controllers/bookingController.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  requireRole("CUSTOMER"),
  getMyBookings
);
router.post(
  "/",
  protect,
  requireRole("CUSTOMER"),
  createBooking
);


export default router;