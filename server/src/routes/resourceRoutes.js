import express from "express"
import protect from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware"
import { createResource } from "../controllers/resourceController"
const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createResource)


export default router;