import pool from "../config/db";

export const createGround=async(req,res)=>{
    try {
        const {name,description,photos,location,city,facilities}=req.body

        // Validate required fields
    if (!name || !location || !city || !description || !facilities ) {
      return res.status(400).json({
        success: false,
        message: "Name, location, city ,description are required",
      });
    }

    const ownerId=req.user.userId;
    const result=await pool.query(
        `INSERT into grounds (owner_id,name,description,photos,location,city,facilities) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,owner_id,name,description,photos,location,city,facilities,status,created_at,updated_at`,[ ownerId,
        name,
        description,
        photos || [],
        location,
        city,
        facilities ]
    )
    return res.status(201).json({
        success:true,
        message:"Ground created successfully",
        ground:result.rows[0]
    })
    } catch (error) {
         console.error("Create ground error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    }
}