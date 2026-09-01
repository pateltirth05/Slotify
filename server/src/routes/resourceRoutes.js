import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createResource, deleteResource, getResourceById, getResourcesByGround, updateResource } from "../controllers/resourceController.js"
const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createResource)
router.get("/ground/:groundId",getResourcesByGround)
router.get("/:id",getResourceById)
router.put("/:id",protect,requireRole("OWNER"),updateResource)
router.delete("/:id",protect,requireRole("OWNER"),deleteResource);
export default router;