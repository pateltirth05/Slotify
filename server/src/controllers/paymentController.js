import pool from "../config/db.js";
import razorpay from "../config/razorpay.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const { booking_id } = req.body;

    // Check booking ID
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    // Get booking and verify that it belongs to this customer
    const bookingResult = await pool.query(
      `
      SELECT
        b.id,
        b.customer_id,
        b.total_amount,
        b.status,
        b.payment_method,
        b.payment_status,
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
      [booking_id, customerId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    // Only ONLINE bookings can create Razorpay orders
    if (booking.payment_method !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "This booking is not an online payment booking"
      });
    }

    // Don't create another order after payment is already completed
    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed"
      });
    }

    // Booking must still be active
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be paid"
      });
    }

    // Convert rupees to paise
    const amountInPaise = Math.round(
      Number(booking.total_amount) * 100
    );

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be at least ₹1"
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking.id}`,
      notes: {
        booking_id: String(booking.id),
        customer_id: String(customerId),
        owner_id: String(booking.owner_id)
      }
    });

    // Save payment record
    const paymentResult = await pool.query(
      `
      INSERT INTO payments (
        booking_id,
        customer_id,
        owner_id,
        amount,
        currency,
        payment_method,
        razorpay_order_id,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'INR',
        'ONLINE',
        $5,
        'CREATED'
      )
      RETURNING
        id,
        booking_id,
        amount,
        currency,
        payment_method,
        razorpay_order_id,
        status,
        settlement_status,
        created_at
      `,
      [
        booking.id,
        customerId,
        booking.owner_id,
        booking.total_amount,
        razorpayOrder.id
      ]
    );

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",

      payment: paymentResult.rows[0],

      razorpay: {
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });

  } catch (error) {
    console.error("Create Razorpay order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment order"
    });
  }
};