import pool from "../config/db";
import bcrypt from "bcrypt"

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