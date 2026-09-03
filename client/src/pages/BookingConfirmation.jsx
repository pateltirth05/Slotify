import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbard from "../components/Navbard";
import Footer from "../components/Footer";

const formatTime12Hour = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const dateOnly = String(date).slice(0, 10);

  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) {
    return "Date unavailable";
  }

  const dateObject = new Date(year, month - 1, day);

  return dateObject.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const booking = location.state?.booking;
  const payment = location.state?.payment;

  if (!booking) {
    return (
      <>
        <Navbard />

        <div className="container" style={{ padding: "80px 20px" }}>
          <div style={{ textAlign: "center" }}>
            <h1>Booking information not available</h1>
            <p style={{ color: "var(--c-ink-soft)", marginTop: "10px" }}>
              We could not load the details for this booking.
            </p>

            <Link
              to="/my-bookings"
              className="btn btn--primary"
              style={{ marginTop: "24px" }}
            >
              View My Bookings
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  const groundName =
  booking.ground?.name ||
  booking.ground_name ||
  booking.resource?.ground_name ||
  "Ground";

const groundLocation =
  booking.ground?.location ||
  booking.location ||
  booking.ground_location ||
  "";

const bookingDate =
  booking.date ||
  booking.booking_date ||
  booking.bookingDate;

const startTime =
  booking.start_time ||
  booking.startTime;

const endTime =
  booking.end_time ||
  booking.endTime;
  const amount =
    booking.pricing?.total_amount ??
    booking.total_amount ??
    payment?.amount ??
    0;

  const paymentMethod =
    booking.payment?.method ||
    booking.payment_method ||
    "ONLINE";

  const displayPaymentMethod =
    paymentMethod === "ONLINE" ? "UPI / Card" : "Pay at Ground";

  return (
    <>
      <Navbard />

      <div className="container">
        {/* Stepper */}
        <div className="stepper" style={{ marginTop: "40px" }}>
          <div className="stepper__step is-done">
            <div className="stepper__num">✓</div>
            <div className="stepper__label">Booking Details</div>
          </div>

          <div className="stepper__line"></div>

          <div className="stepper__step is-done">
            <div className="stepper__num">✓</div>
            <div className="stepper__label">Payment</div>
          </div>

          <div className="stepper__line"></div>

          <div className="stepper__step is-active">
            <div className="stepper__num">3</div>
            <div className="stepper__label">Confirmation</div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="confirm-wrap">
          <div className="confirm-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 style={{ fontSize: "2.2rem" }}>Booking Confirmed!</h1>

          <p
            style={{
              color: "var(--c-ink-soft)",
              marginTop: "10px",
            }}
          >
            Your slot has been successfully booked.
          </p>

          <div className="confirm-id">
            BOOKING ID: #{bookingId}
          </div>

          {/* Booking Card */}
          <div className="confirm-card">
            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid var(--c-line)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--c-surface-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                }}
              >
                🏟️
              </div>

              <div>
                <b>{groundName}</b>

                <div
                  style={{
                    fontSize: ".85rem",
                    color: "var(--c-ink-faint)",
                  }}
                >
                  📍 {groundLocation}
                </div>
              </div>
            </div>

            <div className="summary-row">
              <span>Date</span>

              <span
                style={{
                  fontWeight: "700",
                  color: "var(--c-ink)",
                }}
              >
                {formatDate(bookingDate)}
              </span>
            </div>

            <div className="summary-row">
              <span>Time</span>

              <span
                style={{
                  fontWeight: "700",
                  color: "var(--c-ink)",
                }}
              >
                {formatTime12Hour(startTime)} –{" "}
                {formatTime12Hour(endTime)}
              </span>
            </div>

            <div className="summary-row">
              <span>Payment method</span>

              <span
                style={{
                  fontWeight: "700",
                  color: "var(--c-ink)",
                }}
              >
                {displayPaymentMethod}
              </span>
            </div>

            <div className="summary-row total">
              <span>
                {paymentMethod === "ONLINE"
                  ? "Amount paid"
                  : "Amount"}
              </span>

              <span>
                ₹{Number(amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <Link to="/my-bookings" className="btn btn--primary">
              View My Bookings
            </Link>

            <Link to="/grounds" className="btn btn--outline">
              Book Another Ground
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookingConfirmation;