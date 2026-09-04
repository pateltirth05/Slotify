import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { getOwnerGrounds } from "../controllers/ownerGroundController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireRole("OWNER"),
  getOwnerGrounds
);

export default router;