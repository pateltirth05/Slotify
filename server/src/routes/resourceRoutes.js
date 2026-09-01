import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createResource, getResourceById, getResourcesByGround } from "../controllers/resourceController.js"
const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createResource)
router.get("/ground/:groundId",getResourcesByGround)
router.get("/:id",getResourceById)
export default router;