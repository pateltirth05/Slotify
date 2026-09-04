import pool from "../config/db.js";

export const getOwnerGrounds = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        g.id,
        g.name,
        g.description,
        g.photos,
        g.location,
        g.city,
        g.facilities,
        g.status,
        g.created_at,

        COUNT(r.id) AS resource_count,

        COALESCE(
          ARRAY_AGG(DISTINCT r.sport_type)
          FILTER (WHERE r.id IS NOT NULL),
          '{}'
        ) AS sports

      FROM grounds g

      LEFT JOIN resources r
        ON r.ground_id = g.id

      WHERE g.owner_id = $1

      GROUP BY g.id

      ORDER BY g.created_at DESC
      `,
      [ownerId]
    );

    return res.status(200).json({
      success: true,
      grounds: result.rows
    });
  } catch (error) {
    console.error("Get owner grounds error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner grounds"
    });
  }
};