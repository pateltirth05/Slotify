import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { cancelBooking, createBooking, getBookingById, getMyBookings, getOwnerBookings, updateBookingStatus } from "../controllers/bookingController.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  requireRole("CUSTOMER"),
  getMyBookings
);
router.get(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  getBookingById
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
router.patch(
  "/:id/status",
  protect,
  requireRole("OWNER"),
  updateBookingStatus
);


router.delete(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  cancelBooking
);
export default router;