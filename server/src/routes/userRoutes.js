import express from "express";

import {
    changePassword,
  getMyProfile,
  updateMyProfile
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.put("/me/password", protect, changePassword);
export default router;