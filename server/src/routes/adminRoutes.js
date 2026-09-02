import express from "express";

import {
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus,
  getAdminGrounds,
  updateGroundStatus,
  getAdminResources,
  updateResourceStatus,
  getAdminBookings,
updateAdminBookingStatus,
getAdminPayments,
settleAdminPayment
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"

const router = express.Router();


// Admin dashboard
router.get(
  "/dashboard",
  protect,
  requireRole("ADMIN"),
  getAdminDashboard
);
router.get(
  "/users",
  protect,
  requireRole("ADMIN"),
  getAdminUsers
);

router.patch(
  "/users/:id/status",
  protect,
  requireRole("ADMIN"),
  updateUserStatus
);
router.get(
  "/grounds",
  protect,
  requireRole("ADMIN"),
  getAdminGrounds
);

router.patch(
  "/grounds/:id/status",
  protect,
  requireRole("ADMIN"),
  updateGroundStatus
);


router.get(
  "/resources",
  protect,
  requireRole("ADMIN"),
  getAdminResources
);

router.patch(
  "/resources/:id/status",
  protect,
  requireRole("ADMIN"),
  updateResourceStatus
);
router.get(
  "/bookings",
  protect,
  requireRole("ADMIN"),
  getAdminBookings
);

router.patch(
  "/bookings/:id/status",
  protect,
  requireRole("ADMIN"),
  updateAdminBookingStatus
);
router.get(
  "/payments",
  protect,
  requireRole("ADMIN"),
  getAdminPayments
);
router.patch(
  "/payments/:id/settlement",
  protect,
  requireRole("ADMIN"),
  settleAdminPayment
);
export default router;