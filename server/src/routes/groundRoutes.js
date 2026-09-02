import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createGround ,deleteGround,deleteGroundPhoto,getGroundById,getGrounds, updateGround, uploadGroundPhoto} from "../controllers/groundController.js"
import upload from "../middleware/uploadMiddleware.js"


const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createGround)
router.get("/",getGrounds);
router.post(
  "/:id/photos",
  protect,
  requireRole("OWNER"),
  upload.single("photo"),
  uploadGroundPhoto
);
router.delete(
  "/:id/photos",
  protect,
  requireRole("OWNER"),
  deleteGroundPhoto
);
router.get("/:id",getGroundById)
router.put("/:id",protect,requireRole("OWNER"),updateGround)
router.delete("/:id",protect,requireRole("OWNER"),deleteGround)
export default router;