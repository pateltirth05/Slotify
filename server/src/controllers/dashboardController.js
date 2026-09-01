
import pool from "../config/db.js";
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // 1. Total grounds
    const groundsResult = await pool.query(
      `SELECT COUNT(*) AS total_grounds
       FROM grounds
       WHERE owner_id = $1`,
      [ownerId]
    );

    // 2. Active grounds
    const activeGroundsResult = await pool.query(
      `SELECT COUNT(*) AS active_grounds
       FROM grounds
       WHERE owner_id = $1
       AND status = 'ACTIVE'`,
      [ownerId]
    );

    // 3. Total resources
    const resourcesResult = await pool.query(
      `SELECT COUNT(*) AS total_resources
       FROM resources r
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE g.owner_id = $1`,
      [ownerId]
    );

    // 4. Total bookings
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) AS total_bookings
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE g.owner_id = $1`,
      [ownerId]
    );

    // 5. Upcoming bookings
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) AS upcoming_bookings
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE g.owner_id = $1
       AND b.status IN ('PENDING', 'CONFIRMED')
       AND (
         b.booking_date > CURRENT_DATE
         OR (
           b.booking_date = CURRENT_DATE
           AND b.end_time > CURRENT_TIME
         )
       )`,
      [ownerId]
    );

    // 6. Total earnings
    const earningsResult = await pool.query(
      `SELECT COALESCE(SUM(b.total_amount), 0) AS total_earnings
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE g.owner_id = $1
       AND b.status IN ('CONFIRMED', 'COMPLETED')`,
      [ownerId]
    );

    // 7. Booking status summary
    const statusResult = await pool.query(
      `SELECT
    b.status,
    COUNT(*) AS count
FROM bookings b
JOIN resources r
    ON b.resource_id = r.id
JOIN grounds g
    ON r.ground_id = g.id
WHERE g.owner_id = $1
GROUP BY b.status`,
      [ownerId]
    );

    // Convert status rows into an easy object
    const bookingStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    statusResult.rows.forEach((row) => {
      bookingStatus[row.status] = Number(row.count);
    });

    // 8. Recent bookings
    const recentBookingsResult = await pool.query(
      `SELECT
         b.id,
         b.booking_date,
         b.start_time,
         b.end_time,
         b.duration,
         b.total_amount,
         b.status,
         r.name AS resource_name,
         g.name AS ground_name,
         u.name AS customer_name
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       JOIN users u
         ON b.customer_id = u.id
       WHERE g.owner_id = $1
       ORDER BY b.created_at DESC
       LIMIT 5`,
      [ownerId]
    );

    return res.status(200).json({
      success: true,
      dashboard: {
        total_grounds: Number(groundsResult.rows[0].total_grounds),

        active_grounds: Number(
          activeGroundsResult.rows[0].active_grounds
        ),

        total_resources: Number(
          resourcesResult.rows[0].total_resources
        ),

        total_bookings: Number(
          bookingsResult.rows[0].total_bookings
        ),

        upcoming_bookings: Number(
          upcomingResult.rows[0].upcoming_bookings
        ),

        total_earnings: earningsResult.rows[0].total_earnings,

        booking_status: bookingStatus,

        recent_bookings: recentBookingsResult.rows,
      },
    });
  } catch (error) {
    console.error("Failed to get owner dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};