import express from "express";

import {
  createRazorpayOrder,
  markCashPaymentAsPaid,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.post(
  "/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/verify",
  protect,
  verifyRazorpayPayment
);
router.patch(
  "/cash/mark-paid",
  protect,
  requireRole("OWNER"),
  markCashPaymentAsPaid
);
export default router;