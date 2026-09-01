import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { cancelBooking, createBooking, getBookingById, getMyBookings, getOwnerBookings } from "../controllers/bookingController.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  requireRole("CUSTOMER"),
  getMyBookings
);
router.get(
  "/owner",
  protect,
  requireRole("OWNER"),
  getOwnerBookings
);
router.post(
  "/",
  protect,
  requireRole("CUSTOMER"),
  createBooking
);

router.get(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  getBookingById
);

router.delete(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  cancelBooking
);
export default router;