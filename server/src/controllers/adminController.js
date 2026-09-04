import pool from "../config/db.js";


// ================================
// ADMIN DASHBOARD
// ================================

export const getAdminDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT

        -- Users
        (SELECT COUNT(*)
         FROM users) AS total_users,

        (SELECT COUNT(*)
         FROM users
         WHERE role = 'CUSTOMER') AS total_customers,

        (SELECT COUNT(*)
         FROM users
         WHERE role = 'OWNER') AS total_owners,

        (SELECT COUNT(*)
         FROM users
         WHERE role = 'ADMIN') AS total_admins,


        -- Grounds
        (SELECT COUNT(*)
         FROM grounds) AS total_grounds,

        (SELECT COUNT(*)
         FROM grounds
         WHERE status = 'ACTIVE') AS active_grounds,


        -- Resources
        (SELECT COUNT(*)
         FROM resources) AS total_resources,

        (SELECT COUNT(*)
         FROM resources
         WHERE status = 'ACTIVE') AS active_resources,


        -- Bookings
        (SELECT COUNT(*)
         FROM bookings) AS total_bookings,

        (SELECT COUNT(*)
         FROM bookings
         WHERE status = 'PENDING') AS pending_bookings,

        (SELECT COUNT(*)
         FROM bookings
         WHERE status = 'CONFIRMED') AS confirmed_bookings,

        (SELECT COUNT(*)
         FROM bookings
         WHERE status = 'CANCELLED') AS cancelled_bookings,

        (SELECT COUNT(*)
         FROM bookings
         WHERE status = 'COMPLETED') AS completed_bookings,


        -- Revenue
        (SELECT COALESCE(SUM(amount), 0)
         FROM payments
         WHERE status = 'PAID') AS online_revenue,

        (SELECT COALESCE(SUM(total_amount), 0)
         FROM bookings
         WHERE payment_method = 'CASH'
         AND payment_status = 'PAID') AS cash_revenue,


        -- Total revenue
        (
          (SELECT COALESCE(SUM(amount), 0)
           FROM payments
           WHERE status = 'PAID')
          +
          (SELECT COALESCE(SUM(total_amount), 0)
           FROM bookings
           WHERE payment_method = 'CASH'
           AND payment_status = 'PAID')
        ) AS total_paid_revenue,


        -- Pending settlements
        (SELECT COALESCE(SUM(amount), 0)
         FROM payments
         WHERE status = 'PAID'
         AND settlement_status = 'PENDING') AS pending_online_settlement

    `);

    const stats = result.rows[0];
const recentBookingsResult = await pool.query(`
  SELECT
    b.id,
    b.booking_date,
    b.total_amount,
    b.payment_method,
    b.payment_status,
    b.status,

    u.name AS customer_name,

    g.name AS ground_name,

    r.name AS resource_name

  FROM bookings b

  JOIN users u
    ON u.id = b.customer_id

  JOIN resources r
    ON r.id = b.resource_id

  JOIN grounds g
    ON g.id = r.ground_id

  ORDER BY b.created_at DESC

  LIMIT 5
`);
const recentUsersResult = await pool.query(`
  SELECT
    id,
    name,
    email,
    role,
    status,
    created_at

  FROM users

  ORDER BY created_at DESC

  LIMIT 5
`);
  res.status(200).json({
  success: true,

  dashboard: {
    users: {
      total: Number(stats.total_users),
      customers: Number(stats.total_customers),
      owners: Number(stats.total_owners),
      admins: Number(stats.total_admins)
    },

    grounds: {
      total: Number(stats.total_grounds),
      active: Number(stats.active_grounds)
    },

    resources: {
      total: Number(stats.total_resources),
      active: Number(stats.active_resources)
    },

    bookings: {
      total: Number(stats.total_bookings),
      pending: Number(stats.pending_bookings),
      confirmed: Number(stats.confirmed_bookings),
      cancelled: Number(stats.cancelled_bookings),
      completed: Number(stats.completed_bookings)
    },

    revenue: {
      online: Number(stats.online_revenue),
      cash: Number(stats.cash_revenue),
      total: Number(stats.total_paid_revenue)
    },

    settlements: {
      pending_online: Number(
        stats.pending_online_settlement
      )
    },

    recentBookings: recentBookingsResult.rows,

    recentUsers: recentUsersResult.rows
  }
});

  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard"
    });
  }
};
export const getAdminUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      users: result.rows
    });

  } catch (error) {
    console.error("Admin get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users"
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!status || !["ACTIVE", "BLOCKED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or BLOCKED"
      });
    }

    if (Number(userId) === Number(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot change their own status"
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        role,
        status,
        created_at,
        updated_at
      `,
      [status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Admin update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status"
    });
  }
};
export const getAdminGrounds = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        g.id,
        g.name,
        g.description,
        g.location,
        g.city,
        g.photos,
        g.facilities,
        g.status,
        g.created_at,
        g.updated_at,

        u.id AS owner_id,
        u.name AS owner_name,
        u.email AS owner_email

      FROM grounds g

      JOIN users u
        ON u.id = g.owner_id

      ORDER BY g.created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      grounds: result.rows
    });

  } catch (error) {
    console.error("Admin get grounds error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get grounds"
    });
  }
};
export const updateGroundStatus = async (req, res) => {
  try {
    const groundId = req.params.id;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE"
      });
    }

    const result = await pool.query(
      `
      UPDATE grounds
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        owner_id,
        status,
        updated_at
      `,
      [status, groundId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ground not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Ground status changed to ${status}`,
      ground: result.rows[0]
    });

  } catch (error) {
    console.error("Admin update ground status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update ground status"
    });
  }
};
export const getAdminResources = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.name,
        r.sport_type,
        r.price_per_hour,
        r.opening_time,
        r.closing_time,
        r.status,
        r.photos,
        r.created_at,
        r.updated_at,

        g.id AS ground_id,
        g.name AS ground_name,
        g.owner_id,

        u.name AS owner_name,
        u.email AS owner_email

      FROM resources r

      JOIN grounds g
        ON g.id = r.ground_id

      JOIN users u
        ON u.id = g.owner_id

      ORDER BY r.created_at DESC
      `
    );

    res.status(200).json({
      success: true,
      resources: result.rows
    });

  } catch (error) {
    console.error("Admin get resources error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get resources"
    });
  }
};
export const updateResourceStatus = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE"
      });
    }

    const result = await pool.query(
      `
      UPDATE resources
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        ground_id,
        name,
        sport_type,
        status,
        updated_at
      `,
      [status, resourceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Resource status changed to ${status}`,
      resource: result.rows[0]
    });

  } catch (error) {
    console.error("Admin update resource status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update resource status"
    });
  }
};
export const getAdminBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        b.id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.duration,
        b.total_amount,
        b.status,
        b.payment_method,
        b.payment_status,
        b.paid_at,
        b.created_at,
        b.updated_at,

        u.id AS customer_id,
        u.name AS customer_name,
        u.email AS customer_email,

        g.id AS ground_id,
        g.name AS ground_name,

        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type

      FROM bookings b

      JOIN users u
        ON u.id = b.customer_id

      JOIN resources r
        ON r.id = b.resource_id

      JOIN grounds g
        ON g.id = r.ground_id

      ORDER BY
        b.booking_date DESC,
        b.start_time DESC,
        b.created_at DESC
      `
    );

    res.json({
      success: true,
      bookings: result.rows
    });

  } catch (error) {
    console.error("Get admin bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const updateAdminBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED"
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status"
      });
    }

    const bookingResult = await pool.query(
      `
      SELECT
        b.id,
        b.status,
        b.payment_status,
        b.customer_id,
        r.name AS resource_name
      FROM bookings b
      JOIN resources r
        ON r.id = b.resource_id
      WHERE b.id = $1
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      CANCELLED: [],
      COMPLETED: []
    };

    if (
      booking.status !== status &&
      !allowedTransitions[booking.status].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change booking status from ${booking.status} to ${status}`
      });
    }

    const updatedBooking = await pool.query(
      `
      UPDATE bookings
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, bookingId]
    );

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error("Update admin booking status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.booking_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.status AS payment_status,
        p.settlement_status,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.paid_at,
        p.created_at,
        p.updated_at,

        customer.id AS customer_id,
        customer.name AS customer_name,
        customer.email AS customer_email,

        owner.id AS owner_id,
        owner.name AS owner_name,
        owner.email AS owner_email,

        g.id AS ground_id,
        g.name AS ground_name,

        r.id AS resource_id,
        r.name AS resource_name,
        r.sport_type,

        b.booking_date,
        b.start_time,
        b.end_time,
        b.status AS booking_status

      FROM payments p

      JOIN bookings b
        ON b.id = p.booking_id

      JOIN users customer
        ON customer.id = p.customer_id

      JOIN users owner
        ON owner.id = p.owner_id

      JOIN resources r
        ON r.id = b.resource_id

      JOIN grounds g
        ON g.id = r.ground_id

      ORDER BY p.created_at DESC
      `
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (error) {
    console.error("Get admin payments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
export const settleAdminPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    const paymentResult = await pool.query(
      `
      SELECT
        p.id,
        p.booking_id,
        p.owner_id,
        p.amount,
        p.payment_method,
        p.status,
        p.settlement_status
      FROM payments p
      WHERE p.id = $1
      `,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const payment = paymentResult.rows[0];

    // Settlement is only for online payments
    if (payment.payment_method !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "Only online payments can be settled"
      });
    }

    // Customer payment must already be completed
    if (payment.status !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment must be PAID before settlement"
      });
    }

    // Prevent duplicate settlement
    if (payment.settlement_status === "SETTLED") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been settled"
      });
    }

    const updatedPayment = await pool.query(
      `
      UPDATE payments
      SET
        settlement_status = 'SETTLED',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        booking_id,
        owner_id,
        amount,
        currency,
        payment_method,
        status,
        settlement_status,
        paid_at,
        updated_at
      `,
      [paymentId]
    );

    res.json({
      success: true,
      message: "Payment settled successfully",
      payment: updatedPayment.rows[0]
    });

  } catch (error) {
    console.error("Settle admin payment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};