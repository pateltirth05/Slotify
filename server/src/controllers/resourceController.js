import pool from "../config/db.js"

export const createResource=async(req,res)=>{
    try {
        const {name,sport_type,price_per_hour,opening_time,closing_time,status,ground_id}=req.body
        if( !ground_id || !name || !sport_type || !price_per_hour || !opening_time || !closing_time)
        {
            return res.status(400).json({
                success:false,
                message:"All the feilds are required"
            })
        }
        if(price_per_hour<=0)
        {
            return res.status(400).json({
                success:false,
                message:"Price per hour must not be zero"
            })
        }
        if(opening_time>=closing_time)
        {
            return res.status(400).json({
                success:false,
                message:"Opening time must be before closing time"
            }) 
        }
        const result=await pool.query(
            `SELECT * FROM grounds WHERE id=$1 AND owner_id=$2`,[ground_id,req.user.userId]
        )
        if(result.rows.length===0)
        {
            return res.status(404).json({
                success:false,
                message:"Ground not found or you dont own this ground"
            })
        }
        const data=await pool.query(
            `INSERT INTO resources(ground_id,name,sport_type,price_per_hour,opening_time,closing_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,[ground_id,name,sport_type,price_per_hour,opening_time,closing_time]
        )
        return res.status(201).json({
            success:true,
            message:"Resource created successfully",
            resource:data.rows[0]
        })
    } catch (error) {
        console.error("Failed to create new Resource",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}