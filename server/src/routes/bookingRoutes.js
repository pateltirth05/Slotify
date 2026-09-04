import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { cancelBooking, createBooking, getBookingById, getMyBookings, getOwnerBookingById, getOwnerBookings, updateBookingStatus } from "../controllers/bookingController.js";

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
router.get(
  "/owner/:id",
  protect,
  requireRole("OWNER"),
  getOwnerBookingById
);
router.get(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  getBookingById
);
router.patch(
  "/:id/status",
  protect,
  requireRole("OWNER"),
  updateBookingStatus
);
router.post(
  "/",
  protect,
  requireRole("CUSTOMER"),
  createBooking
);


router.delete(
  "/:id",
  protect,
  requireRole("CUSTOMER"),
  cancelBooking
);

export default router;