import express from "express";

import {
  createAvailabilityBlock,
  getResourceBlocks,
  deleteAvailabilityBlock
} from "../controllers/availabilityBlockController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();


// ==========================================
// OWNER CREATES A BLOCK
// ==========================================

router.post(
  "/",
  protect,
  requireRole("OWNER"),
  createAvailabilityBlock
);


// ==========================================
// GET BLOCKS FOR A RESOURCE
// ==========================================

router.get(
  "/resource/:resourceId",
  protect,
  requireRole("OWNER"),
  getResourceBlocks
);


// ==========================================
// OWNER REMOVES A BLOCK
// ==========================================

router.delete(
  "/:id",
  protect,
  requireRole("OWNER"),
  deleteAvailabilityBlock
);


export default router;