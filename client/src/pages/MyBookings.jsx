import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbard from "../components/Navbard";
import Footer from "../components/Footer";
import api from "../services/api.js";
import "../style/style.css"
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

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/bookings/my");

        setBookings(response.data.bookings || []);
      } catch (error) {
        console.error("Get my bookings error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const counts = useMemo(() => {
    return {
      all: bookings.length,

      upcoming: bookings.filter(
        (booking) =>
          booking.status === "PENDING" ||
          booking.status === "CONFIRMED"
      ).length,

      completed: bookings.filter(
        (booking) => booking.status === "COMPLETED"
      ).length,

      cancelled: bookings.filter(
        (booking) => booking.status === "CANCELLED"
      ).length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === "UPCOMING") {
      return bookings.filter(
        (booking) =>
          booking.status === "PENDING" ||
          booking.status === "CONFIRMED"
      );
    }

    if (activeTab === "COMPLETED") {
      return bookings.filter(
        (booking) => booking.status === "COMPLETED"
      );
    }

    if (activeTab === "CANCELLED") {
      return bookings.filter(
        (booking) => booking.status === "CANCELLED"
      );
    }

    return bookings;
  }, [bookings, activeTab]);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(bookingId);
      setError("");

      await api.delete(`/bookings/${bookingId}`);

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking
        )
      );
    } catch (error) {
      console.error("Cancel booking error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to cancel the booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <Navbard />

      <div
        className="container"
        style={{
          paddingTop: "32px",
          paddingBottom: "64px",
        }}
      >
        <div className="eyebrow">YOUR MATCHES</div>

        <h1
          style={{
            fontSize: "2.4rem",
            margin: "8px 0 24px",
          }}
        >
          My Bookings
        </h1>

        {/* Tabs */}
        <div className="tabs">
          <Link
           
            className={activeTab === "ALL" ? "is-active" : ""}
            onClick={() => setActiveTab("ALL")}
          >
            All ({counts.all})
          </Link>

          <Link
            
            className={
              activeTab === "UPCOMING" ? "is-active" : ""
            }
            onClick={() => setActiveTab("UPCOMING")}
          >
            Upcoming ({counts.upcoming})
          </Link>

          <Link
            
            className={
              activeTab === "COMPLETED" ? "is-active" : ""
            }
            onClick={() => setActiveTab("COMPLETED")}
          >
            Completed ({counts.completed})
          </Link>

          <Link
            type="button"
            className={
              activeTab === "CANCELLED" ? "is-active" : ""
            }
            onClick={() => setActiveTab("CANCELLED")}
          >
            Cancelled ({counts.cancelled})
          </Link>
        </div>

        {/* Error */}
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

        {/* Loading */}
        {loading && (
          <div style={{ padding: "40px 0" }}>
            Loading your bookings...
          </div>
        )}

        {/* Empty */}
        {!loading && filteredBookings.length === 0 && (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
            }}
          >
            <h3>No bookings found</h3>

            <p
              style={{
                color: "var(--c-ink-soft)",
                marginTop: "8px",
              }}
            >
              You don't have any bookings in this category.
            </p>

            <Link
              to="/grounds"
              className="btn btn--primary"
              style={{ marginTop: "20px" }}
            >
              Explore Grounds
            </Link>
          </div>
        )}

        {/* Booking List */}
        {!loading &&
          filteredBookings.map((booking) => (
            <div
              className="booking-row"
              key={booking.id}
            >
              <div className="booking-row__img">
                {booking.ground_photo ? (
                  <img
                    src={booking.ground_photo}
                    alt={booking.ground_name || "Ground"}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                    }}
                  >
                    🏟️
                  </div>
                )}
              </div>

              <div className="booking-row__body">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <b>
                    {booking.ground_name || "Ground"}
                  </b>

                  <span
                    className={getStatusClass(
                      booking.status
                    )}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-row__meta">
                  <span>
                    📅 {formatDate(booking.booking_date)}
                  </span>

                  <span>
                    🕐 {formatTime12Hour(booking.start_time)} –{" "}
                    {formatTime12Hour(booking.end_time)}
                  </span>

                 <span>
  🏟️ {booking.resource_name || "Sports Resource"}
</span>
                </div>
              </div>

              <div className="booking-row__actions">
                <Link
                  to={`/bookings/${booking.id}`}
                  className="btn btn--outline btn--sm"
                >
                  Details
                </Link>

                {(booking.status === "PENDING" ||
                  booking.status === "CONFIRMED") && (
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      handleCancel(booking.id)
                    }
                    disabled={
                      cancellingId === booking.id
                    }
                  >
                    {cancellingId === booking.id
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                )}

                {booking.status === "COMPLETED" && (
                  <>
                    <Link
                      to={`/grounds/${booking.ground_id}/resources/${booking.resource_id}`}
                      className="btn btn--outline btn--sm"
                    >
                      Rebook
                    </Link>

                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      disabled
                    >
                      Rate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      <Footer />
    </>
  );
};

export default MyBookings;