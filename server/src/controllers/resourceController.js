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

export const getResourcesByGround=async(req,res)=>{
    try {
        const {groundId}=req.params
        const result=await pool.query(
            `SELECT * FROM resources WHERE ground_id=$1`,[groundId]
        )
        if(result.rows.length===0)
        {
            return res.status(404).json({
                success:false,
                "resources":[]
            })
        }
        return res.status(200).json({
            success:true,
            resources:result.rows
        })
    } catch (error) {
         console.error("Failed to get all Resource",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}

export const getResourceById=async(req,res)=>{
    try {
        const {id}=req.params;

        const result=await pool.query(
            `SELECT * FROM resources WHERE id=$1`,[id]
        )
        if(result.rows.length===0)
        {
            return res.status(404).json({
                success:false,
                message:"Resource not found"
            })
        }
        return res.status(200).json({
            success:true,
            resource:result.rows[0]
        })
    } catch (error) {
         console.error("Failed to get  Resource by ID",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      sport_type,
      price_per_hour,
      opening_time,
      closing_time,
      status,
    } = req.body;

    // 1. Find the resource
    const resourceResult = await pool.query(
      `SELECT * FROM resources WHERE id = $1`,
      [id]
    );

    // 2. Resource doesn't exist
    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const resource = resourceResult.rows[0];

    // 3. Find the ground and its owner
    const groundResult = await pool.query(
      `SELECT owner_id FROM grounds WHERE id = $1`,
      [resource.ground_id]
    );

    // 4. Ground doesn't exist
    if (groundResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    const ground = groundResult.rows[0];

    // 5. Check ownership
    if (ground.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this resource",
      });
    }

    // 6. Validate price if provided
    if (price_per_hour !== undefined && price_per_hour <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price per hour must be greater than zero",
      });
    }

    // 7. Validate opening and closing time if both are provided
    if (
      opening_time !== undefined &&
      closing_time !== undefined &&
      opening_time >= closing_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Opening time must be before closing time",
      });
    }

    // 8. Update resource
    const result = await pool.query(
      `UPDATE resources
       SET
         name = COALESCE($1, name),
         sport_type = COALESCE($2, sport_type),
         price_per_hour = COALESCE($3, price_per_hour),
         opening_time = COALESCE($4, opening_time),
         closing_time = COALESCE($5, closing_time),
         status = COALESCE($6, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        name,
        sport_type,
        price_per_hour,
        opening_time,
        closing_time,
        status,
        id,
      ]
    );

    // 9. Return updated resource
    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      resource: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update resource:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find resource
    const resourceResult = await pool.query(
      `SELECT * FROM resources WHERE id = $1`,
      [id]
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const resource = resourceResult.rows[0];

    // 2. Find the owner of the ground
    const groundResult = await pool.query(
      `SELECT owner_id FROM grounds WHERE id = $1`,
      [resource.ground_id]
    );

    if (groundResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    const ground = groundResult.rows[0];

    // 3. Check ownership
    if (ground.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this resource",
      });
    }

    // 4. Delete resource
    await pool.query(
      `DELETE FROM resources WHERE id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete resource:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};