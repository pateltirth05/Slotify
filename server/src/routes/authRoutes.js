import express from "express"

import { registerUser,login } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"
import { requireRole } from "../middleware/roleMiddleware.js"
const router=express.Router()

router.post("/register",registerUser)
router.post("/login",login)
// router.get("/me",protect,(req,res)=>{
//     res.status(200).json({
//         success:true,
//         user:req.user
//     })
// })
router.get("/owner-test", protect, requireRole("OWNER"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are an owner",
    user: req.user,
  });
});
export default router;