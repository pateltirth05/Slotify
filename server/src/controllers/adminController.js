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
          pending_online: Number(stats.pending_online_settlement)
        }
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