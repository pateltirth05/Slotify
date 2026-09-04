import pool from "../config/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export const registerUser=async(req,res)=>{
    try {
        
        const {name,email,password,role }=req.body;
    
        if(!name || !email || !password || !role){
            return res.status(400).json({
                success:false,
                message:"Name,email, password and role are required",
            })
        }
        const allowedRoles=["CUSTOMER","OWNER"];

        if(!allowedRoles.includes(role)){
            return res.status(400).json({
                message:"Invalid role"
            })
        }
        const existingUser=await pool.query(
            "SELECT id FROM users WHERE email=$1",[email]
        )
        if(existingUser.rows.length>0)
        {
            return res.status(409).json({message:"User with this email already exists"})
        }
       const passwordHash=await bcrypt.hash(password,10);
       const result=await pool.query(
        `INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,created_at`,[name,email,passwordHash,role]
       )

       return res.status(201).json({
        success:true,
        message:"User registered successfully",
        user:result.rows[0],
       })
    } catch (error) {
        console.error("Registration error:",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}
export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email || !password)
        {
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
            })
        }
         const result=await pool.query(`SELECT id,name,email,password_hash,role,status FROM users where email=$1`,[email]);
         if(result.rows.length===0)
         {
            return res.status(401).json({ success: false,
        message: "Invalid email or password",})
         }
         const user=result.rows[0];
         if (user.status === "BLOCKED") {
  return res.status(403).json({
    success: false,
    message: "Your account has been blocked by the administrator.",
  });
}
         const isPasswordCorrect=await bcrypt.compare(password,user.password_hash)

         if(!isPasswordCorrect)
         {
              return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
         }

         const token=jwt.sign({
            userId:user.id,
            role:user.role
         },
        
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        )
        return res.status(200).json({
            success:true,
            message:"Login Successful",
            token,
              user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
        })
    } catch (error) {
        console.error("Registration error:",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        }) 
    }
}