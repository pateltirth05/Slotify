import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbard from "../components/Navbard";
import Footer from "../components/Footer";
import api from "../services/api.js";

const formatTime12Hour = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
};

const formatDate = (date) => {
  if (!date) return "";

  const dateOnly = String(date).slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) return "";

  const dateObject = new Date(year, month - 1, day);

  return dateObject.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "";

  const dateObject = new Date(dateTime);

  if (Number.isNaN(dateObject.getTime())) {
    return "";
  }

  return dateObject.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
      return "badge badge--upcoming";

    case "COMPLETED":
      return "badge badge--completed";

    case "CANCELLED":
      return "badge badge--cancelled";

    default:
      return "badge";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Upcoming";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bookings/${id}`);

        setBooking(response.data.booking);
      } catch (error) {
        console.error("Get booking details error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      const response = await api.delete(`/bookings/${id}`);

      setBooking((previousBooking) => ({
        ...previousBooking,
        booking_status:
          response.data.booking?.status || "CANCELLED",
      }));
    } catch (error) {
      console.error("Cancel booking error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to cancel this booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbard />

        <div
          className="container"
          style={{
            maxWidth: "760px",
            paddingTop: "60px",
            paddingBottom: "64px",
          }}
        >
          <p>Loading booking details...</p>
        </div>

        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbard />

        <div
          className="container"
          style={{
            maxWidth: "760px",
            paddingTop: "60px",
            paddingBottom: "64px",
          }}
        >
          <p
            style={{
              color: "var(--c-danger)",
              marginBottom: "20px",
            }}
          >
            {error || "Booking not found."}
          </p>

          <Link
            to="/my-bookings"
            className="btn btn--outline"
          >
            Back to My Bookings
          </Link>
        </div>

        <Footer />
      </>
    );
  }

  const bookingStatus = booking.booking_status;

  const groundName =
    booking.ground?.name || "Ground";

  const groundLocation =
    booking.ground?.location || "";

  const resourceName =
    booking.resource?.name || "Resource";

  const sportType =
    booking.resource?.sport_type || "";

  const pricePerHour =
    Number(booking.pricing?.price_per_hour || 0);

  const duration =
    Number(booking.duration || 0);

  const totalAmount =
    Number(booking.pricing?.total_amount || 0);

  const paymentMethod =
    booking.payment?.method || "ONLINE";

  const paymentStatus =
    booking.payment?.status || "UNPAID";

  const paymentMethodLabel =
    paymentMethod === "ONLINE"
      ? "UPI / Card"
      : "Pay at Ground";

  const paymentStatusLabel =
    paymentStatus === "PAID"
      ? "Paid"
      : paymentStatus === "FAILED"
      ? "Failed"
      : "Unpaid";

  return (
    <>
      <Navbard />

      <div
        className="container"
        style={{
          maxWidth: "760px",
          paddingTop: "32px",
          paddingBottom: "64px",
        }}
      >
        {/* Back */}
        <Link
          to="/my-bookings"
          className="eyebrow"
          style={{ marginBottom: "20px" }}
        >
          ← BACK TO MY BOOKINGS
        </Link>

        {/* Error */}
        {error && (
          <div
            style={{
              color: "var(--c-danger)",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* Booking Header */}
        <div
          className="card"
          style={{ marginBottom: "20px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "var(--r-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--c-surface-soft)",
                  fontSize: "38px",
                  flexShrink: 0,
                }}
              >
                🏟️
              </div>

              <div>
                <h2 style={{ fontSize: "1.7rem" }}>
                  {groundName}
                </h2>

                <div
                  className="ground-card__loc"
                  style={{ marginTop: "6px" }}
                >
                  📍 {groundLocation}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className={getStatusClass(
                      bookingStatus
                    )}
                  >
                    {getStatusLabel(bookingStatus)}
                  </span>

                  <span
                    style={{
                      fontSize: ".85rem",
                      color: "var(--c-ink-soft)",
                    }}
                  >
                    {resourceName}
                    {sportType
                      ? ` • ${sportType}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="confirm-id"
              style={{
                fontSize: ".95rem",
                padding: "8px 14px",
              }}
            >
              #{booking.id}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="card">
          <div className="card__head">
            <h3>Match Details</h3>
          </div>

          <div className="summary-row">
            <span>Date</span>

            <span
              style={{
                fontWeight: "700",
                color: "var(--c-ink)",
              }}
            >
              {formatDate(booking.date)}
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
              {formatTime12Hour(
                booking.start_time
              )}{" "}
              –{" "}
              {formatTime12Hour(
                booking.end_time
              )}
            </span>
          </div>

          <div className="summary-row">
            <span>Duration</span>

            <span
              style={{
                fontWeight: "700",
                color: "var(--c-ink)",
              }}
            >
              {duration}{" "}
              {duration === 1 ? "hour" : "hours"}
            </span>
          </div>

          <div className="summary-row">
            <span>Resource</span>

            <span
              style={{
                fontWeight: "700",
                color: "var(--c-ink)",
              }}
            >
              {resourceName}
            </span>
          </div>

          {sportType && (
            <div className="summary-row">
              <span>Sport</span>

              <span
                style={{
                  fontWeight: "700",
                  color: "var(--c-ink)",
                }}
              >
                {sportType}
              </span>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="card">
          <div className="card__head">
            <h3>Payment Summary</h3>
          </div>

          <div className="summary-row">
            <span>
              {duration}{" "}
              {duration === 1
                ? "hour"
                : "hours"}{" "}
              × ₹
              {pricePerHour.toLocaleString(
                "en-IN"
              )}
            </span>

            <span>
              ₹
              {(
                pricePerHour * duration
              ).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="summary-row total">
            <span>Total</span>

            <span>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
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
              {paymentMethodLabel}
            </span>
          </div>

          <div className="summary-row">
            <span>Payment status</span>

            <span
              style={{
                fontWeight: "700",
                color: "var(--c-ink)",
              }}
            >
              {paymentStatusLabel}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card">
          <div className="card__head">
            <h3>Status Timeline</h3>
          </div>

          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Booking created */}
            <li
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    "var(--c-green)",
                  marginTop: "6px",
                  flexShrink: 0,
                }}
              ></span>

              <div>
                <b style={{ fontSize: ".9rem" }}>
                  Booking created
                </b>

                <div
                  style={{
                    fontSize: ".8rem",
                    color:
                      "var(--c-ink-faint)",
                  }}
                >
                  {formatDateTime(
                    booking.created_at
                  )}
                </div>
              </div>
            </li>

            {/* Payment */}
            {paymentStatus === "PAID" && (
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      "var(--c-green)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                ></span>

                <div>
                  <b
                    style={{
                      fontSize: ".9rem",
                    }}
                  >
                    Payment received — ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </b>

                  <div
                    style={{
                      fontSize: ".8rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    {formatDateTime(
                      booking.payment
                        ?.paid_at
                    )}
                  </div>
                </div>
              </li>
            )}

            {/* Confirmed */}
            {bookingStatus === "CONFIRMED" && (
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      "var(--c-green)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                ></span>

                <div>
                  <b
                    style={{
                      fontSize: ".9rem",
                    }}
                  >
                    Booking confirmed
                  </b>

                  <div
                    style={{
                      fontSize: ".8rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    Your slot is confirmed.
                  </div>
                </div>
              </li>
            )}

            {/* Cancelled */}
            {bookingStatus === "CANCELLED" && (
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      "var(--c-danger)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                ></span>

                <div>
                  <b
                    style={{
                      fontSize: ".9rem",
                    }}
                  >
                    Booking cancelled
                  </b>

                  <div
                    style={{
                      fontSize: ".8rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    This booking has been
                    cancelled.
                  </div>
                </div>
              </li>
            )}

            {/* Match day */}
            {bookingStatus !== "CANCELLED" && (
              <li
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      "var(--c-line)",
                    marginTop: "6px",
                    flexShrink: 0,
                  }}
                ></span>

                <div>
                  <b
                    style={{
                      fontSize: ".9rem",
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    Match day —{" "}
                    {formatDate(
                      booking.date
                    )}
                  </b>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {(bookingStatus === "PENDING" ||
            bookingStatus === "CONFIRMED") && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel Booking"}
            </button>
          )}

          <Link
            to={`/grounds/${booking.ground?.id}`}
            className="btn btn--ghost"
          >
            View Ground
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookingDetails;