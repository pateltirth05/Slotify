import pool from "../config/db.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import { createNotification } from "./notificationController.js";
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


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !booking_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required"
      });
    }

   const paymentResult = await pool.query(
  `
  SELECT
    p.id,
    p.booking_id,
    p.customer_id,
    p.owner_id,
    p.amount,
    p.currency,
    p.payment_method,
    p.razorpay_order_id,
    p.status,
    b.status AS booking_status,
    b.payment_status,
    r.name AS resource_name
  FROM payments p
  JOIN bookings b
    ON b.id = p.booking_id
  JOIN resources r
    ON r.id = b.resource_id
  WHERE p.booking_id = $1
    AND p.customer_id = $2
  `,
  [booking_id, customerId]
);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    const payment = paymentResult.rows[0];

    if (payment.payment_method !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "This booking is not an online payment"
      });
    }

    if (payment.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order ID"
      });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been verified"
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${payment.razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed"
      });
    }

    const updatedPayment = await pool.query(
  `
  UPDATE payments
  SET
    razorpay_payment_id = $1,
    razorpay_signature = $2,
    status = 'PAID',
    paid_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $3
  RETURNING
    id,
    booking_id,
    amount,
    currency,
    payment_method,
    razorpay_order_id,
    razorpay_payment_id,
    status,
    settlement_status,
    paid_at,
    updated_at
  `,
      [
        razorpay_payment_id,
        razorpay_signature,
        payment.id
      ]
    );

    const updatedBooking = await pool.query(
  `
  UPDATE bookings
  SET
    payment_status = 'PAID',
    status = 'CONFIRMED',
    paid_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $1
    AND customer_id = $2
  RETURNING *
  `,
  [booking_id, customerId]
);

await createNotification({
  userId: customerId,
  bookingId: booking_id,
  type: "PAYMENT_COMPLETED",
  title: "Payment Received",
  message: `Your payment of ₹${payment.amount} has been received successfully.`
});

await createNotification({
  userId: customerId,
  bookingId: booking_id,
  type: "BOOKING_CONFIRMED",
  title: "Booking Confirmed",
  message: `Your booking for ${payment.resource_name} has been confirmed.`
});
    return res.json({
      success: true,
      message: "Payment verified successfully",
      payment: updatedPayment.rows[0],
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error("Verify Razorpay payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};
export const markCashPaymentAsPaid = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const { booking_id } = req.body;

    // Check booking ID
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    // Find the booking and verify owner
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
        AND g.owner_id = $2
      `,
      [booking_id, ownerId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0];

    // Only CASH bookings can be marked through this endpoint
    if (booking.payment_method !== "CASH") {
      return res.status(400).json({
        success: false,
        message: "This booking is not a cash payment"
      });
    }

    // Don't mark an already-paid booking again
    if (booking.payment_status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment is already marked as paid"
      });
    }

    // Don't allow payment for cancelled bookings
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be marked as paid"
      });
    }

    // Update booking payment status
  // Update booking payment status
const updatedBooking = await pool.query(
  `
  UPDATE bookings
  SET
    payment_status = 'PAID',
    paid_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $1
    AND customer_id = $2
  RETURNING *
  `,
  [
    booking.id,
    booking.customer_id
  ]
);

    return res.json({
      success: true,
      message: "Cash payment marked as paid",
      booking: updatedBooking.rows[0]
    });

  } catch (error) {
    console.error("Mark cash payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cash payment"
    });
  }
};
