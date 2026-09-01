import pool from "../config/db.js";

export const getAvailability = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { date } = req.query;

    // 1. Check if date was provided
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // 2. Validate date format
    const dateValue = new Date(`${date}T00:00:00`);

    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // 3. Check that the date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateValue < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot check availability for a past date",
      });
    }

    // 4. Find the resource
    const resourceResult = await pool.query(
      `SELECT id, ground_id, name, sport_type,
              price_per_hour, opening_time, closing_time, status
       FROM resources
       WHERE id = $1`,
      [resourceId]
    );

    // 5. Resource doesn't exist
    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const resource = resourceResult.rows[0];

    // 6. Don't show availability for inactive resource
    if (resource.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This resource is currently inactive",
      });
    }

    // 7. Get bookings for this resource and date
    const bookingResult = await pool.query(
      `SELECT id, start_time, end_time
       FROM bookings
       WHERE resource_id = $1
       AND booking_date = $2
       AND status IN ('PENDING', 'CONFIRMED')
       ORDER BY start_time`,
      [resourceId, date]
    );

    // 8. Return availability information
    return res.status(200).json({
      success: true,

      date: date,

      resource: {
        id: resource.id,
        ground_id: resource.ground_id,
        name: resource.name,
        sport_type: resource.sport_type,
        price_per_hour: resource.price_per_hour,
        opening_time: resource.opening_time,
        closing_time: resource.closing_time,
      },

      booked_slots: bookingResult.rows.map((booking) => ({
        booking_id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
      })),
    });
  } catch (error) {
    console.error("Failed to get availability:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};



export const createBooking = async (req, res) => {
  try {
    const {
      resource_id,
      booking_date,
      start_time,
      end_time,
    } = req.body;

    // 1. Validate required fields
    if (!resource_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Resource, date, start time and end time are required",
      });
    }

    // 2. Validate date format
    const dateValue = new Date(`${booking_date}T00:00:00`);

    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // 3. Check that booking date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateValue < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot book a past date",
      });
    }

    // 4. Check that start time is before end time
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // 5. Find the resource
    const resourceResult = await pool.query(
      `SELECT
        id,
        name,
        price_per_hour,
        opening_time,
        closing_time,
        status
       FROM resources
       WHERE id = $1`,
      [resource_id]
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const resource = resourceResult.rows[0];

    // 6. Check resource status
    if (resource.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This resource is currently inactive",
      });
    }

    // 7. Check booking is within resource operating hours
    if (
      start_time < resource.opening_time ||
      end_time > resource.closing_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking time is outside resource operating hours",
      });
    }

    // 8. Calculate duration in hours
    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);

    const durationInHours =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationInHours <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking duration",
      });
    }

    // 9. Calculate total amount
    const totalAmount =
      Number(resource.price_per_hour) * durationInHours;

    // 10. Check for overlapping bookings
    const conflictResult = await pool.query(
      `SELECT id
       FROM bookings
       WHERE resource_id = $1
       AND booking_date = $2
       AND status IN ('PENDING', 'CONFIRMED')
       AND start_time < $4
       AND end_time > $3
       LIMIT 1`,
      [
        resource_id,
        booking_date,
        start_time,
        end_time,
      ]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This time period is already booked",
      });
    }

    // 11. Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings
       (
         resource_id,
         customer_id,
         booking_date,
         start_time,
         end_time,
         duration,
         total_amount,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING *`,
      [
        resource_id,
        req.user.userId,
        booking_date,
        start_time,
        end_time,
        durationInHours,
        totalAmount,
      ]
    );

    // 12. Return booking
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: bookingResult.rows[0],
    });
 } catch (error) {
  console.error("Failed to create booking:", error);

  if (error.code === "23P01") {
    return res.status(409).json({
      success: false,
      message: "This time period is already booked",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server error",
  });
}
};


export const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration,
        b.total_amount,
        b.status,
        b.created_at,
        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type,
        g.id AS ground_id,
        g.name AS ground_name,
        g.city,
        g.location
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE b.customer_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Failed to get customer bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration,
        b.total_amount,
        b.status,
        b.created_at,
        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type,
        g.id AS ground_id,
        g.name AS ground_name,
        g.city,
        g.location
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE b.id = $1
       AND b.customer_id = $2`,
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to get booking:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking belonging to the logged-in customer
    const bookingResult = await pool.query(
      `SELECT *
       FROM bookings
       WHERE id = $1
       AND customer_id = $2`,
      [id, req.user.userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // Already cancelled
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Completed booking cannot be cancelled
    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be cancelled",
      });
    }

    // Cancel booking
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'CANCELLED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to cancel booking:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration,
        b.total_amount,
        b.status,
        b.created_at,

        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type,

        g.id AS ground_id,
        g.name AS ground_name,
        g.city,
        g.location,

        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email

       FROM bookings b

       JOIN resources r
         ON b.resource_id = r.id

       JOIN grounds g
         ON r.ground_id = g.id

       JOIN users u
         ON b.customer_id = u.id

       WHERE g.owner_id = $1

       ORDER BY b.booking_date ASC, b.start_time ASC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Failed to get owner bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Check status was provided
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // 2. Allowed statuses
    const allowedStatuses = [
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // 3. Find booking through the owner's ground/resource
    const bookingResult = await pool.query(
      `SELECT
        b.*,
        r.ground_id,
        g.owner_id
       FROM bookings b
       JOIN resources r
         ON b.resource_id = r.id
       JOIN grounds g
         ON r.ground_id = g.id
       WHERE b.id = $1
       AND g.owner_id = $2`,
      [id, req.user.userId]
    );

    // 4. Booking not found or not owned by this owner
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // 5. Validate status transition

    if (
      booking.status === "PENDING" &&
      !["CONFIRMED", "CANCELLED"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition",
      });
    }

    if (
      booking.status === "CONFIRMED" &&
      !["COMPLETED", "CANCELLED"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be changed",
      });
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed booking cannot be changed",
      });
    }

    // 6. Update status
    const result = await pool.query(
      `UPDATE bookings
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update booking status:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};