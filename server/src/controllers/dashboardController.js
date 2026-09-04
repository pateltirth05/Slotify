
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
// 9. My grounds
const myGroundsResult = await pool.query(
  `
  SELECT
    g.id,
    g.name,
    g.location,
    g.photos,
    g.status,
    COUNT(r.id) AS resource_count
  FROM grounds g
  LEFT JOIN resources r
    ON r.ground_id = g.id
  WHERE g.owner_id = $1
  GROUP BY g.id
  ORDER BY g.created_at DESC
  LIMIT 2
  `,
  [ownerId]
);
// 10. Most booked resource this month
const mostBookedResourceResult = await pool.query(
  `
  SELECT
    r.id,
    r.name AS resource_name,
    g.name AS ground_name,
    COUNT(b.id) AS booking_count
  FROM bookings b
  JOIN resources r
    ON b.resource_id = r.id
  JOIN grounds g
    ON r.ground_id = g.id
  WHERE g.owner_id = $1
    AND b.status IN ('CONFIRMED', 'COMPLETED')
    AND b.booking_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND b.booking_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  GROUP BY r.id, r.name, g.name
  ORDER BY booking_count DESC
  LIMIT 1
  `,
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

    grounds: myGroundsResult.rows,

    most_booked_resource:
      mostBookedResourceResult.rows.length > 0
        ? mostBookedResourceResult.rows[0]
        : null,
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


export const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.userId;

    // 1. Total bookings
    const totalBookingsResult = await pool.query(
      `SELECT COUNT(*) AS total_bookings
       FROM bookings
       WHERE customer_id = $1`,
      [customerId]
    );

    // 2. Upcoming bookings
    const upcomingBookingsResult = await pool.query(
      `SELECT COUNT(*) AS upcoming_bookings
       FROM bookings
       WHERE customer_id = $1
       AND status IN ('PENDING', 'CONFIRMED')
       AND (
         booking_date > CURRENT_DATE
         OR (
           booking_date = CURRENT_DATE
           AND end_time > CURRENT_TIME
         )
       )`,
      [customerId]
    );

    // 3. Completed bookings
    const completedBookingsResult = await pool.query(
      `SELECT COUNT(*) AS completed_bookings
       FROM bookings
       WHERE customer_id = $1
       AND status = 'COMPLETED'`,
      [customerId]
    );

    // 4. Cancelled bookings
    const cancelledBookingsResult = await pool.query(
      `SELECT COUNT(*) AS cancelled_bookings
       FROM bookings
       WHERE customer_id = $1
       AND status = 'CANCELLED'`,
      [customerId]
    );

    // 5. Total spent
    const totalSpentResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_spent
       FROM bookings
       WHERE customer_id = $1
       AND status IN ('CONFIRMED', 'COMPLETED')`,
      [customerId]
    );

    // 6. Recent / upcoming bookings
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
         r.sport_type,
         g.name AS ground_name,
         g.city
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE b.customer_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC
       LIMIT 5`,
      [customerId]
    );

    return res.status(200).json({
      success: true,

      dashboard: {
        total_bookings: Number(
          totalBookingsResult.rows[0].total_bookings
        ),

        upcoming_bookings: Number(
          upcomingBookingsResult.rows[0].upcoming_bookings
        ),

        completed_bookings: Number(
          completedBookingsResult.rows[0].completed_bookings
        ),

        cancelled_bookings: Number(
          cancelledBookingsResult.rows[0].cancelled_bookings
        ),

        total_spent: totalSpentResult.rows[0].total_spent,

        recent_bookings: recentBookingsResult.rows,
      },
    });
  } catch (error) {
    console.error("Failed to get customer dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};