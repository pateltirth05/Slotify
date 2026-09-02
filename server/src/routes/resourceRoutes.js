import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createResource, deleteResource, deleteResourcePhoto, getResourceById, getResourcesByGround, updateResource, uploadResourcePhoto } from "../controllers/resourceController.js"
import { getAvailability } from "../controllers/bookingController.js"
import upload from "../middleware/uploadMiddleware.js"
const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createResource)
router.get("/ground/:groundId",getResourcesByGround)
router.get("/:resourceId/availability",getAvailability)
router.post(
  "/:id/photos",
  protect,
  requireRole("OWNER"),
  upload.single("photo"),
  uploadResourcePhoto
);
router.delete(
  "/:id/photos",
  protect,
  requireRole("OWNER"),
  deleteResourcePhoto
);
router.get("/:id",getResourceById)
router.put("/:id",protect,requireRole("OWNER"),updateResource)
router.delete("/:id",protect,requireRole("OWNER"),deleteResource);
export default router;