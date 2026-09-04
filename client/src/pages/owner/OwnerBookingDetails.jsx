import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bookings/owner/${id}`);

        setBooking(response.data.booking);
      } catch (error) {
        console.error("Failed to fetch booking details:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = String(date).slice(0, 10);
    const [year, month, day] = dateString.split("-");

    if (!year || !month || !day) return "-";

    const formattedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (Number.isNaN(formattedDate.getTime())) return "-";

    return formattedDate.toLocaleDateString("en-IN", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const timeString = String(time).slice(0, 8);
    const [hours, minutes] = timeString.split(":");

    if (hours === undefined || minutes === undefined) {
      return "-";
    }

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (duration) => {
    if (duration === null || duration === undefined) {
      return "-";
    }

    const value = Number(duration);

    if (Number.isNaN(value)) {
      return "-";
    }

    return `${value} ${value === 1 ? "Hour" : "Hours"}`;
  };

  const formatAmount = (amount) => {
    const value = Number(amount);

    if (Number.isNaN(value)) {
      return "₹0";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "badge badge--upcoming";

      case "PENDING":
        return "badge badge--pending";

      case "COMPLETED":
        return "badge badge--completed";

      case "CANCELLED":
        return "badge badge--cancelled";

      default:
        return "badge";
    }
  };

  const getPaymentStatusClass = (status) => {
    if (status === "PAID") {
      return "badge badge--paid";
    }

    return "badge";
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");

      const response = await api.patch(`/bookings/${id}/status`, {
        status: newStatus,
      });

      setBooking((previousBooking) => ({
        ...previousBooking,
        booking_status: response.data.booking.status,
      }));
    } catch (error) {
      console.error("Failed to update booking status:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update booking status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    await updateStatus("COMPLETED");
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    await updateStatus("CANCELLED");
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <OwnerSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button
              type="button"
              className="hamburger-btn"
            >
              ☰
            </button>

            <h2>Booking Details</h2>

            <Link
              to="/owner/bookings"
              className="btn btn--outline btn--sm"
            >
              ← Back to Bookings
            </Link>
          </div>

          <div className="admin-body">
            <p>Loading booking details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="admin-layout">
        <OwnerSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button
              type="button"
              className="hamburger-btn"
            >
              ☰
            </button>

            <h2>Booking Details</h2>

            <Link
              to="/owner/bookings"
              className="btn btn--outline btn--sm"
            >
              ← Back to Bookings
            </Link>
          </div>

          <div className="admin-body">
            <p>{error || "Booking not found."}</p>
          </div>
        </main>
      </div>
    );
  }

  const bookingStatus = booking.booking_status;
  const paymentMethod = booking.payment?.method;
  const paymentStatus = booking.payment?.status;

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <button
            type="button"
            className="hamburger-btn"
          >
            ☰
          </button>

          <h2>Booking #{booking.id}</h2>

          <Link
            to="/owner/bookings"
            className="btn btn--outline btn--sm"
          >
            ← Back to Bookings
          </Link>
        </div>

        <div className="admin-body">
          {error && (
            <div
              style={{
                marginBottom: "20px",
                color: "var(--c-danger)",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <span
              className={getStatusClass(bookingStatus)}
              style={{
                fontSize: ".9rem",
                padding: "8px 18px",
              }}
            >
              {bookingStatus}
            </span>
          </div>

          <div className="booking-detail-grid">
            <div>
              {/* CUSTOMER */}
              <div className="card">
                <div className="card__head">
                  <h3>Customer</h3>
                </div>

                <div
                  className="detail-block__value"
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "6px",
                  }}
                >
                  {booking.customer?.name || "-"}
                </div>

                <div
                  style={{
                    color: "var(--c-ink-soft)",
                    fontSize: ".9rem",
                  }}
                >
                  {booking.customer?.email || "-"}
                </div>
              </div>

              {/* GROUND */}
              <div className="card">
                <div className="card__head">
                  <h3>Ground</h3>
                </div>

                <div
                  className="detail-block__value"
                  style={{
                    fontSize: "1.05rem",
                  }}
                >
                  {booking.ground?.name || "-"}
                </div>

                <div
                  style={{
                    color: "var(--c-ink-soft)",
                    fontSize: ".9rem",
                    marginTop: "4px",
                  }}
                >
                  📍 {booking.ground?.location || "-"}
                </div>
              </div>

              {/* RESOURCE */}
              <div className="card">
                <div className="card__head">
                  <h3>Resource</h3>
                </div>

                <div
                  className="detail-block__value"
                  style={{
                    fontSize: "1.05rem",
                  }}
                >
                  {booking.resource?.name || "-"}
                </div>

                <div
                  style={{
                    color: "var(--c-ink-soft)",
                    fontSize: ".9rem",
                    marginTop: "4px",
                  }}
                >
                  ⚽ {booking.resource?.sport_type || "-"}
                </div>
              </div>

              {/* BOOKING */}
              <div className="card">
                <div className="card__head">
                  <h3>Booking</h3>
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
                    {formatTime(booking.start_time)} –{" "}
                    {formatTime(booking.end_time)}
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
                    {formatDuration(booking.duration)}
                  </span>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="card">
                <div className="card__head">
                  <h3>Payment</h3>
                </div>

                <div className="summary-row">
                  <span>Method</span>

                  <span
                    style={{
                      fontWeight: "700",
                      color: "var(--c-ink)",
                    }}
                  >
                    {paymentMethod || "-"}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Payment Status</span>

                  <span
                    className={getPaymentStatusClass(
                      paymentStatus
                    )}
                  >
                    {paymentStatus || "-"}
                  </span>
                </div>

                <div className="summary-row total">
                  <span>Amount</span>

                  <span>
                    {formatAmount(
                      booking.pricing?.total_amount
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* BOOKING STATUS */}
            <div
              className="card"
              style={{
                position: "sticky",
                top: "100px",
              }}
            >
              <div className="card__head">
                <h3>Booking Status</h3>
              </div>

              <span
                className={getStatusClass(bookingStatus)}
                style={{
                  fontSize: ".85rem",
                  padding: "7px 16px",
                  marginBottom: "20px",
                  display: "inline-flex",
                }}
              >
                {bookingStatus}
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {bookingStatus === "CONFIRMED" && (
                  <>
                    <button
                      type="button"
                      className="btn btn--primary btn--block"
                      onClick={handleComplete}
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "Mark Completed"}
                    </button>

                    <button
                      type="button"
                      className="btn btn--danger btn--block"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "Cancel Booking"}
                    </button>
                  </>
                )}

                {bookingStatus === "PENDING" && (
                  <>
                    <button
                      type="button"
                      className="btn btn--primary btn--block"
                      onClick={() =>
                        updateStatus("CONFIRMED")
                      }
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "Confirm Booking"}
                    </button>

                    <button
                      type="button"
                      className="btn btn--danger btn--block"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "Cancel Booking"}
                    </button>
                  </>
                )}

                {bookingStatus === "COMPLETED" && (
                  <div
                    style={{
                      color: "var(--c-ink-soft)",
                      fontSize: ".9rem",
                    }}
                  >
                    This booking has been completed.
                  </div>
                )}

                {bookingStatus === "CANCELLED" && (
                  <div
                    style={{
                      color: "var(--c-ink-soft)",
                      fontSize: ".9rem",
                    }}
                  >
                    This booking has been cancelled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerBookingDetails;