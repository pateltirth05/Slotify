import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
import { createGround ,getGroundById,getGrounds, updateGround} from "../controllers/groundController.js"


const router=express.Router()

router.post("/",protect,requireRole("OWNER"),createGround)
router.get("/",getGrounds);
router.get("/:id",getGroundById)
router.put("/:id",protect,requireRole("OWNER"),updateGround)
export default router;