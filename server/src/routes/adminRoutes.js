import express from "express";

import {
  getAdminDashboard,
  getAdminUsers,
  updateUserStatus
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

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

export default router;