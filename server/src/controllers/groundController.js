import pool from "../config/db.js";

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

export const getGrounds=async(req,res)=>{
     try {
        const result=await pool.query(
            "SELECT * FROM grounds WHERE status='ACTIVE'"
        )
        return res.status(200).json({
    success: true,
    grounds:result.rows
});
     } catch (error) {
        console.error("Get grounds error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
     }
}

export const getGroundById=async(req,res)=>{
    try {
        const {id}=req.params;
       
        const result =await pool.query(
            `SELECT * FROM grounds WHERE id = $1`,[id]
        )
        if(result.rows.length===0)
        {
            return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
        }
        return res.status(200).json({
            success:true,
            ground:result.rows[0]
        })
    } catch (error) {
         console.error("Get ground error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
     }
    }

    export const updateGround=async(req,res)=>{
        try {
            const {id}=req.params
        
    const {
        name,
        description,
        photos,
        location,
        city,
        facilities,
        status
        } = req.body;
   
        const findground=await pool.query(
            `SELECT * FROM grounds WHERE id=$1`,[id]
        )
        if(findground.rows.length===0)
        {
            return res.status(404).json({
                success:false,
                message:"Ground not found"
            })
        }
        const ground=findground.rows[0]
        if(ground.owner_id !== req.user.userId)
        {
             return res.status(403).json({
    success: false,
    message: "You are not authorized to update this ground",
  });
        }

        const result=await pool.query(
            `UPDATE grounds
SET
    name = COALESCE($1, name),
    description = COALESCE($2, description),
    photos = COALESCE($3, photos),
    location = COALESCE($4, location),
    city = COALESCE($5, city),
    facilities = COALESCE($6, facilities),
    status = COALESCE($7, status),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $8
RETURNING *`,[name,description,photos,location,city,facilities,status,id]
        )

        return res.status(200).json({
            success:true,
            ground:result.rows[0]
        })
        } catch (error) {
             console.error("Update grounds error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
        }
        
    }