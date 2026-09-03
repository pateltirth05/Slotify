import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/style.css";

import Navbard from "../components/Navbard.jsx";
import Footer from "../components/Footer.jsx";

import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const BookingCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const bookingData = location.state;

  const [paymentMethod, setPaymentMethod] =
    useState("ONLINE");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
    ------------------------------------------
    Booking data protection
    ------------------------------------------
  */

  if (!bookingData) {
    return (
      <>
        <Navbard />

        <main
          className="container"
          style={{
            paddingTop: "80px",
            paddingBottom: "80px",
          }}
        >
          <h2>Booking details not found</h2>

          <p
            style={{
              marginTop: "12px",
              color: "var(--c-ink-soft)",
            }}
          >
            Please select a date and time from the
            resource booking page before continuing.
          </p>

          <button
            type="button"
            className="btn btn--primary"
            style={{
              marginTop: "20px",
            }}
            onClick={() => navigate("/grounds")}
          >
            Explore Grounds
          </button>
        </main>

        <Footer />
      </>
    );
  }

  const {
    resource,
    selectedDate,
    startTime,
    endTime,
    duration,
    totalAmount,
  } = bookingData;

  /*
    ------------------------------------------
    Formatting helpers
    ------------------------------------------
  */

  const formatTime12Hour = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const period = hours >= 12 ? "PM" : "AM";

    const hour12 = hours % 12 || 12;

    return `${hour12}:${String(minutes).padStart(
      2,
      "0"
    )} ${period}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const dateObject = new Date(
      `${date}T00:00:00`
    );

    return dateObject.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const resourceImage =
    resource?.photos?.[0] ||
    "/placeholder-ground.jpg";

  /*
    ------------------------------------------
    Create booking
    ------------------------------------------
  */

  const createBooking = async () => {
    const response = await api.post(
      "/bookings",
      {
        resource_id: resource.id,
        booking_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        payment_method: paymentMethod,
      }
    );

    return response.data.booking;
  };

  /*
    ------------------------------------------
    Create Razorpay order
    ------------------------------------------
  */

  const createRazorpayOrder = async (bookingId) => {
    const response = await api.post(
      "/payments/create-order",
      {
        booking_id: bookingId,
      }
    );

    return response.data;
  };

  /*
    ------------------------------------------
    Verify Razorpay payment
    ------------------------------------------
  */

  const verifyPayment = async (
    bookingId,
    razorpayResponse
  ) => {
    const response = await api.post(
      "/payments/verify",
      {
        booking_id: bookingId,
        razorpay_order_id:
          razorpayResponse.razorpay_order_id,
        razorpay_payment_id:
          razorpayResponse.razorpay_payment_id,
        razorpay_signature:
          razorpayResponse.razorpay_signature,
      }
    );

    return response.data;
  };

  /*
    ------------------------------------------
    Handle online payment
    ------------------------------------------
  */

  const handleOnlinePayment = async (booking) => {
    const orderData =
      await createRazorpayOrder(booking.id);

    if (!window.Razorpay) {
      throw new Error(
        "Razorpay checkout could not be loaded."
      );
    }

    const options = {
      key: orderData.razorpay.key_id,

      amount: orderData.razorpay.amount,

      currency: orderData.razorpay.currency,

      name: "Slotify",

      description: `Booking for ${resource.name}`,

      order_id:
        orderData.razorpay.order_id,

      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },

      theme: {
        color: "#1f7a4d",
      },

      handler: async function (response) {
  try {
    const verification = await api.post("/payments/verify", {
      booking_id: booking.id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });

    const bookingDetailsResponse = await api.get(
      `/bookings/${booking.id}`
    );

    navigate(`/booking-confirmation/${booking.id}`, {
      state: {
        booking: bookingDetailsResponse.data.booking,
        payment: verification.data.payment,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    setError(
      error.response?.data?.message ||
        "Payment verification failed. Please contact support."
    );

    setLoading(false);
  }
},

      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Razorpay payment failed:",
          response
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      }
    );

    razorpay.open();
  };

  /*
    ------------------------------------------
    Handle checkout submit
    ------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      /*
        1. Create actual booking
      */

      const booking =
        await createBooking();

      /*
        2. Online payment
      */

      if (paymentMethod === "ONLINE") {
        await handleOnlinePayment(
          booking
        );

        return;
      }

      /*
        3. Cash payment

        Booking stays PENDING + UNPAID.
        Owner can handle payment later.
      */

      navigate(
        `/booking-confirmation/${booking.id}`,
        {
          state: {
            booking,
            payment: null,
          },
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Booking checkout error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create your booking. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <>
      <Navbard />

      <div
        className="container"
        style={{
          paddingTop: "40px",
          paddingBottom: "64px",
        }}
      >
        {/* Stepper */}

        <div className="stepper">

          <div className="stepper__step is-done">
            <div className="stepper__num">
              ✓
            </div>

            <div className="stepper__label">
              Booking Details
            </div>
          </div>

          <div className="stepper__line"></div>

          <div className="stepper__step is-active">
            <div className="stepper__num">
              2
            </div>

            <div className="stepper__label">
              Payment
            </div>
          </div>

          <div className="stepper__line"></div>

          <div className="stepper__step">
            <div className="stepper__num">
              3
            </div>

            <div className="stepper__label">
              Confirmation
            </div>
          </div>

        </div>

        {/* Error */}

        {error && (
          <div
            className="alert alert--error"
            style={{
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Checkout */}

        <div className="checkout-grid">

          {/* LEFT */}

          <div className="checkout-panel">

            <h3
              style={{
                marginBottom: "20px",
              }}
            >
              Confirm your details
            </h3>

            <form
              onSubmit={handleSubmit}
            >

              {/* User details */}

              <div className="field--row">

                <div className="field">

                  <label htmlFor="name">
                    Full name
                  </label>

                  <input
                    type="text"
                    id="name"
                    value={
                      user?.name || ""
                    }
                    readOnly
                  />

                </div>

                <div className="field">

                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <input
                    type="tel"
                    id="phone"
                    value={
                      user?.phone || ""
                    }
                    readOnly
                  />

                </div>

              </div>

              {/* Payment method */}

              <h3
                style={{
                  margin:
                    "28px 0 16px",
                }}
              >
                Choose payment method
              </h3>

              {/* Online */}

              <label
                className={`pay-option ${
                  paymentMethod ===
                  "ONLINE"
                    ? "is-selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={
                    paymentMethod ===
                    "ONLINE"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "ONLINE"
                    )
                  }
                />

                <div>

                  <b>
                    UPI / Card
                  </b>

                  <div
                    style={{
                      fontSize:
                        ".8rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    Pay securely
                    online using
                    Razorpay
                  </div>

                </div>

              </label>

              {/* Cash */}

              <label
                className={`pay-option ${
                  paymentMethod ===
                  "CASH"
                    ? "is-selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="CASH"
                  checked={
                    paymentMethod ===
                    "CASH"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "CASH"
                    )
                  }
                />

                <div>

                  <b>
                    Pay at Ground
                  </b>

                  <div
                    style={{
                      fontSize:
                        ".8rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    Pay directly
                    at the ground
                  </div>

                </div>

              </label>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="btn btn--primary btn--block btn--lg"
                style={{
                  marginTop: "24px",
                }}
              >
                {loading
                  ? "Processing..."
                  : paymentMethod ===
                    "ONLINE"
                  ? `Pay ${formatAmount(
                      totalAmount
                    )} & Confirm Booking`
                  : "Confirm Booking"}
              </button>

            </form>

          </div>

          {/* RIGHT */}

          <aside
            className="booking-card"
            style={{
              position: "static",
            }}
          >

            <h3
              style={{
                marginBottom: "16px",
              }}
            >
              {resource?.name}
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
              }}
            >

              <img
                src={resourceImage}
                alt={
                  resource?.name
                }
                style={{
                  width: "80px",
                  height: "60px",
                  borderRadius:
                    "var(--r-sm)",
                  objectFit: "cover",
                }}
              />

              <div>

                <div
                  style={{
                    fontWeight: "700",
                    fontSize: ".9rem",
                  }}
                >
                  {formatDate(
                    selectedDate
                  )}
                </div>

                <div
                  style={{
                    fontSize: ".85rem",
                    color:
                      "var(--c-ink-faint)",
                  }}
                >
                  {formatTime12Hour(
                    startTime
                  )}
                  {" – "}
                  {formatTime12Hour(
                    endTime
                  )}
                </div>

              </div>

            </div>

            {/* Price */}

            <div className="summary-row">

              <span>
                {duration}{" "}
                {Number(duration) ===
                1
                  ? "hour"
                  : "hours"}{" "}
                ×{" "}
                {formatAmount(
                  resource?.price_per_hour
                )}
              </span>

              <span>
                {formatAmount(
                  totalAmount
                )}
              </span>

            </div>

            {/* Total */}

            <div
              className="summary-row total"
            >

              <span>
                Total
              </span>

              <span>
                {formatAmount(
                  totalAmount
                )}
              </span>

            </div>

            {/* Payment message */}

            <div
              className="alert alert--info"
              style={{
                marginTop: "16px",
              }}
            >
              {paymentMethod ===
              "ONLINE"
                ? "🔒 Your payment is secured and encrypted."
                : "💵 Pay directly at the ground."}
            </div>

          </aside>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookingCheckout;