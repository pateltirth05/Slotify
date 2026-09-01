import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getOwnerDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/owner",
  protect,
  requireRole("OWNER"),
  getOwnerDashboard
);

export default router;