import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createResource, getResourcesByGround } from "../controllers/resourceController.js"
const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createResource)
router.get("/ground/:groundId",getResourcesByGround)

export default router;