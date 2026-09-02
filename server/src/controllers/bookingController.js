import pool from "../config/db.js";
import { createNotification } from "./notificationController.js";
export const getAvailability = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { date } = req.query;

    // ==========================================
    // 1. Validate date
    // ==========================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    const dateValue = new Date(`${date}T00:00:00`);

    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // ==========================================
    // 2. Don't allow past dates
    // ==========================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateValue < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot check availability for a past date"
      });
    }

    // ==========================================
    // 3. Find resource
    // ==========================================

    const resourceResult = await pool.query(
      `
      SELECT
        id,
        ground_id,
        name,
        sport_type,
        price_per_hour,
        opening_time,
        closing_time,
        status
      FROM resources
      WHERE id = $1
      `,
      [resourceId]
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    const resource = resourceResult.rows[0];

    // ==========================================
    // 4. Check resource status
    // ==========================================

    if (resource.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This resource is currently inactive"
      });
    }

    // ==========================================
    // 5. Get bookings
    // ==========================================

    const bookingResult = await pool.query(
      `
      SELECT
        id,
        start_time,
        end_time
      FROM bookings
      WHERE resource_id = $1
        AND booking_date = $2
        AND status IN ('PENDING', 'CONFIRMED')
      ORDER BY start_time
      `,
      [resourceId, date]
    );

    // ==========================================
    // 6. Get availability blocks
    // ==========================================

    const blockResult = await pool.query(
      `
      SELECT
        id,
        start_time,
        end_time,
        reason
      FROM availability_blocks
      WHERE resource_id = $1
        AND block_date = $2
      ORDER BY start_time
      `,
      [resourceId, date]
    );

    // ==========================================
    // 7. Return availability information
    // ==========================================

    return res.status(200).json({
      success: true,

      date,

      resource: {
        id: resource.id,
        ground_id: resource.ground_id,
        name: resource.name,
        sport_type: resource.sport_type,
        price_per_hour: resource.price_per_hour,
        opening_time: resource.opening_time,
        closing_time: resource.closing_time
      },

      booked_slots: bookingResult.rows.map((booking) => ({
        booking_id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time
      })),

      blocked_slots: blockResult.rows.map((block) => ({
        block_id: block.id,
        start_time: block.start_time,
        end_time: block.end_time,
        reason: block.reason
      }))
    });

  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};



export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const {
  resource_id,
  booking_date,
  start_time,
  end_time,
  payment_method
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
if (!payment_method) {
  return res.status(400).json({
    success: false,
    message: "Payment method is required"
  });
}

if (!["ONLINE", "CASH"].includes(payment_method)) {
  return res.status(400).json({
    success: false,
    message: "Invalid payment method"
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
       `
  INSERT INTO bookings (
    resource_id,
    customer_id,
    booking_date,
    start_time,
    end_time,
    duration,
    total_amount,
    payment_method,
    payment_status
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'UNPAID')
  RETURNING *
  `,
  [
    resource_id,
    customerId,
    booking_date,
    start_time,
    end_time,
    durationInHours,
    totalAmount,
    payment_method
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

// export const getBookingById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `SELECT
//         b.id,
//         b.booking_date,
//         b.start_time,
//         b.end_time,
//         b.duration,
//         b.total_amount,
//         b.status,
//         b.created_at,
//         r.id AS resource_id,
//         r.name AS resource_name,
//         r.sport_type,
//         g.id AS ground_id,
//         g.name AS ground_name,
//         g.city,
//         g.location
//        FROM bookings b
//        JOIN resources r
//          ON b.resource_id = r.id
//        JOIN grounds g
//          ON r.ground_id = g.id
//        WHERE b.id = $1
//        AND b.customer_id = $2`,
//       [id, req.user.userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       booking: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Failed to get booking:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server error",
//     });
//   }
// };

export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const customerId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        b.id AS booking_id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration,
        b.total_amount,
        b.status AS booking_status,
        b.payment_method,
        b.payment_status,
        b.created_at AS booking_created_at,
        b.updated_at AS booking_updated_at,

        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,

        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type,
        r.price_per_hour,

        g.id AS ground_id,
        g.name AS ground_name,
        g.location AS ground_location,

        p.id AS payment_id,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.status AS payment_record_status,
        p.created_at AS payment_created_at

      FROM bookings b

      JOIN users u
        ON b.customer_id = u.id

      JOIN resources r
        ON b.resource_id = r.id

      JOIN grounds g
        ON r.ground_id = g.id

      LEFT JOIN payments p
        ON p.booking_id = b.id

      WHERE b.id = $1
        AND b.customer_id = $2

      LIMIT 1
      `,
      [bookingId, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = result.rows[0];

    res.status(200).json({
      success: true,
      booking: {
        id: booking.booking_id,

        ground: {
          id: booking.ground_id,
          name: booking.ground_name,
          location: booking.ground_location
        },

        resource: {
          id: booking.resource_id,
          name: booking.resource_name,
          sport_type: booking.sport_type
        },

        customer: {
          id: booking.customer_id,
          name: booking.customer_name,
          email: booking.customer_email
        },

        date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration: Number(booking.duration),

        pricing: {
          price_per_hour: Number(booking.price_per_hour),
          total_amount: Number(booking.total_amount)
        },

        booking_status: booking.booking_status,

        payment: {
          method: booking.payment_method,
          status: booking.payment_status,
          payment_id: booking.payment_id,
          razorpay_order_id: booking.razorpay_order_id,
          razorpay_payment_id: booking.razorpay_payment_id,
          payment_record_status: booking.payment_record_status,
          paid_at: booking.payment_created_at
        },

        created_at: booking.booking_created_at,
        updated_at: booking.booking_updated_at
      }
    });

  } catch (error) {
    console.error("Get booking details error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get booking details"
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking belonging to the logged-in customer
    const bookingResult = await pool.query(
  `
  SELECT
    b.*,
    r.name AS resource_name,
    g.name AS ground_name,
    g.owner_id
  FROM bookings b
  JOIN resources r
    ON r.id = b.resource_id
  JOIN grounds g
    ON g.id = r.ground_id
  WHERE b.id = $1
    AND b.customer_id = $2
  `,
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
await createNotification({
  userId: req.user.userId,
  bookingId: booking.id,
  type: "BOOKING_CANCELLED",
  title: "Booking Cancelled",
  message: `Your booking for ${booking.resource_name} at ${booking.ground_name} has been cancelled.`
});

await createNotification({
  userId: booking.owner_id,
  bookingId: booking.id,
  type: "BOOKING_CANCELLED",
  title: "Booking Cancelled",
  message: `A customer has cancelled the booking for ${booking.resource_name} at ${booking.ground_name}.`
});
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