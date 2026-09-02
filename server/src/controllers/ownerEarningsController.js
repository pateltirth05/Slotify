import pool from "../config/db.js";


export const getOwnerPayments = async (req, res) => {
  try {
    const ownerId = req.user.userId;

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
        p.paid_at,
        p.created_at,
        p.updated_at,

        u.name AS customer_name,
        u.email AS customer_email,

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

      JOIN users u
        ON u.id = p.customer_id

      JOIN resources r
        ON r.id = b.resource_id

      JOIN grounds g
        ON g.id = r.ground_id

      WHERE p.owner_id = $1

      ORDER BY p.created_at DESC
      `,
      [ownerId]
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (error) {
    console.error("Get owner payments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN payment_method = 'ONLINE'
              AND status = 'PAID'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_online_earnings,

        COALESCE(
          SUM(
            CASE
              WHEN payment_method = 'ONLINE'
              AND status = 'PAID'
              AND settlement_status = 'SETTLED'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS settled_amount,

        COALESCE(
          SUM(
            CASE
              WHEN payment_method = 'ONLINE'
              AND status = 'PAID'
              AND settlement_status = 'PENDING'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS pending_settlement

      FROM payments

      WHERE owner_id = $1
      `,
      [ownerId]
    );

    const earnings = result.rows[0];

    res.json({
      success: true,
      earnings: {
        total_online_earnings: Number(
          earnings.total_online_earnings
        ),
        settled_amount: Number(
          earnings.settled_amount
        ),
        pending_settlement: Number(
          earnings.pending_settlement
        )
      }
    });

  } catch (error) {
    console.error("Get owner earnings error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};