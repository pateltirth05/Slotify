import express from "express";

import {
  getOwnerPayments,
  getOwnerEarnings
} from "../controllers/ownerEarningsController.js";

import { protect } from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"

const router = express.Router();


// Get owner's payment history
router.get(
  "/payments",
  protect,
  requireRole("OWNER"),
  getOwnerPayments
);


// Get owner's earnings summary
router.get(
  "/earnings",
  protect,
  requireRole("OWNER"),
  getOwnerEarnings
);


export default router;