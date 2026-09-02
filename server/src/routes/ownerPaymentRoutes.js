import express from "express";

import {
  getOwnerPaymentDetails,
  saveOwnerPaymentDetails
} from "../controllers/ownerPaymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireRole("OWNER"),
  getOwnerPaymentDetails
);

router.put(
  "/",
  protect,
  requireRole("OWNER"),
  saveOwnerPaymentDetails
);

export default router;