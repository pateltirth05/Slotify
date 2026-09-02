import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
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

// export const getGrounds=async(req,res)=>{
//      try {
//         const result=await pool.query(
//             "SELECT * FROM grounds WHERE status='ACTIVE'"
//         )
//         return res.status(200).json({
//     success: true,
//     grounds:result.rows
// });
//      } catch (error) {
//         console.error("Get grounds error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//      }
// }

export const getGrounds = async (req, res) => {
  try {
    const {
      city,
      sport,
      min_price,
      max_price,
    } = req.query;

    let query = `
      SELECT DISTINCT
        g.*
      FROM grounds g
      LEFT JOIN resources r
        ON r.ground_id = g.id
      WHERE g.status = 'ACTIVE'
    `;

    const values = [];
    let paramIndex = 1;

    // City filter
    if (city) {
      query += ` AND LOWER(g.city) = LOWER($${paramIndex})`;
      values.push(city);
      paramIndex++;
    }

    // Sport filter
    if (sport) {
      query += ` AND LOWER(r.sport_type) = LOWER($${paramIndex})`;
      values.push(sport);
      paramIndex++;
    }

    // Minimum price filter
    if (min_price) {
      query += ` AND r.price_per_hour >= $${paramIndex}`;
      values.push(min_price);
      paramIndex++;
    }

    // Maximum price filter
    if (max_price) {
      query += ` AND r.price_per_hour <= $${paramIndex}`;
      values.push(max_price);
      paramIndex++;
    }

    query += ` ORDER BY g.created_at DESC`;

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      grounds: result.rows,
    });
  } catch (error) {
    console.error("Failed to get grounds:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

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

export const deleteGround=async(req,res)=>{
    try {
        const {id}=req.params
 const result=await pool.query(
            `SELECT * FROM grounds WHERE id=$1`,[id]
        )
        if(result.rows.length===0)
        {
            return res.status(404).json({
                success:false,
                message:"Ground not found"
            })
        }
        const ground=result.rows[0]
        if(ground.owner_id !== req.user.userId)
        {
            return res.status(403).json({
    success: false,
    message: "You are not authorized to update this ground",
  });
        }

        await pool.query(
            `DELETE FROM grounds where id=$1`,[id]
        )
        return res.status(200).json({
            success:true,
            
            message:"Ground Deleted Successfully"
        })
    } catch (error) {
        console.error("Update grounds error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
        }
    }

    export const uploadGroundPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // 1. Check whether a file was uploaded
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image"
      });
    }

    // ==========================================
    // 2. Check whether the ground exists
    //    and belongs to the logged-in owner
    // ==========================================

    const groundResult = await pool.query(
      `
      SELECT id, name, photos
      FROM grounds
      WHERE id = $1
        AND owner_id = $2
      `,
      [id, req.user.userId]
    );

    if (groundResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ground not found or you do not own this ground"
      });
    }

    const ground = groundResult.rows[0];

    // ==========================================
    // 3. Upload image to Cloudinary
    // ==========================================

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `slotify/grounds/${id}`
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // ==========================================
    // 4. Get existing photos
    // ==========================================

    const existingPhotos = ground.photos || [];

    // ==========================================
    // 5. Add new Cloudinary URL
    // ==========================================

    const updatedPhotos = [
      ...existingPhotos,
      uploadResult.secure_url
    ];

    // ==========================================
    // 6. Save URLs in PostgreSQL
    // ==========================================

    const result = await pool.query(
      `
      UPDATE grounds
      SET photos = $1
      WHERE id = $2
      RETURNING id, name, photos
      `,
      [updatedPhotos, id]
    );

    // ==========================================
    // 7. Send response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Ground photo uploaded successfully",
      ground: result.rows[0]
    });

  } catch (error) {
    console.error("Upload ground photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload ground photo"
    });
  }
};

export const deleteGroundPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photo_url } = req.body;

    // ==========================================
    // 1. Validate photo URL
    // ==========================================

    if (!photo_url) {
      return res.status(400).json({
        success: false,
        message: "Photo URL is required"
      });
    }

    // ==========================================
    // 2. Find ground + verify ownership
    // ==========================================

    const groundResult = await pool.query(
      `
      SELECT id, name, photos
      FROM grounds
      WHERE id = $1
        AND owner_id = $2
      `,
      [id, req.user.userId]
    );

    if (groundResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ground not found or you do not own this ground"
      });
    }

    const ground = groundResult.rows[0];
    const existingPhotos = ground.photos || [];

    // ==========================================
    // 3. Check whether photo belongs to ground
    // ==========================================

    if (!existingPhotos.includes(photo_url)) {
      return res.status(404).json({
        success: false,
        message: "Photo not found"
      });
    }

    // ==========================================
    // 4. Extract Cloudinary public ID
    // ==========================================

    const urlWithoutQuery = photo_url.split("?")[0];

    const uploadIndex = urlWithoutQuery.indexOf("/upload/");

    if (uploadIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary image URL"
      });
    }

    let publicIdWithExtension = urlWithoutQuery
      .substring(uploadIndex + 8)
      .replace(/^v\d+\//, "");

    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");

    if (lastDotIndex !== -1) {
      publicIdWithExtension = publicIdWithExtension.substring(
        0,
        lastDotIndex
      );
    }

    const publicId = publicIdWithExtension;

    // ==========================================
    // 5. Delete image from Cloudinary
    // ==========================================

    const cloudinaryResult = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image"
      }
    );

    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete image from Cloudinary"
      });
    }

    // ==========================================
    // 6. Remove URL from PostgreSQL
    // ==========================================

    const updatedPhotos = existingPhotos.filter(
      (photo) => photo !== photo_url
    );

    const result = await pool.query(
      `
      UPDATE grounds
      SET photos = $1
      WHERE id = $2
      RETURNING id, name, photos
      `,
      [updatedPhotos, id]
    );

    // ==========================================
    // 7. Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Ground photo deleted successfully",
      ground: result.rows[0]
    });

  } catch (error) {
    console.error("Delete ground photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete ground photo"
    });
  }
};