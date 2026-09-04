import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function Owner() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOwnerDashboard = async () => {
      try {
        const response = await api.get("/dashboard/owner");

        setDashboard(response.data.dashboard);
      } catch (error) {
        console.error("Owner dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load owner dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDashboard();
  }, []);

  // Get owner initials
  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Format amount as Indian currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format PostgreSQL time into 12-hour format
  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get badge class according to booking status
  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "badge badge--upcoming";

      case "COMPLETED":
        return "badge badge--completed";

      case "PENDING":
        return "badge badge--pending";

      case "CANCELLED":
        return "badge badge--cancelled";

      default:
        return "badge";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-shell">

        <OwnerSidebar />

        <main className="admin-main">

          <div className="admin-topbar">

            <button className="hamburger-btn">
              ☰
            </button>

            <h2>Dashboard</h2>

            <div className="topbar-right">

              <button className="bell-btn">
                🔔
              </button>

              <div className="owner-identity">

                <div className="owner-identity__avatar">
                  {getInitials(user?.name)}
                </div>

                <div>
                  <b>{user?.name || "Owner"}</b>
                  <div className="role-tag">
                    Owner
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="admin-body">
            <p>Loading dashboard...</p>
          </div>

        </main>

      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="admin-shell">

        <OwnerSidebar />

        <main className="admin-main">

          <div className="admin-topbar">

            <button className="hamburger-btn">
              ☰
            </button>

            <h2>Dashboard</h2>

            <div className="topbar-right">

              <button className="bell-btn">
                🔔
              </button>

              <div className="owner-identity">

                <div className="owner-identity__avatar">
                  {getInitials(user?.name)}
                </div>

                <div>
                  <b>{user?.name || "Owner"}</b>
                  <div className="role-tag">
                    Owner
                  </div>
                </div>

              </div>

            </div>

          </div>

          <div className="admin-body">
            <p>{error}</p>
          </div>

        </main>

      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="admin-shell">

      {/* =========================
          SIDEBAR
      ========================= */}

      <OwnerSidebar />


      {/* =========================
          MAIN
      ========================= */}

      <main className="admin-main">

        {/* =========================
            TOPBAR
        ========================= */}

        <div className="admin-topbar">

          <button className="hamburger-btn">
            ☰
          </button>

          <h2>Dashboard</h2>

          <div className="topbar-right">

            <button className="bell-btn">
              🔔
              <span className="bell-dot"></span>
            </button>

            <div className="owner-identity">

              <div className="owner-identity__avatar">
                {getInitials(user?.name)}
              </div>

              <div>
                <b>
                  {user?.name || "Owner"}
                </b>

                <div className="role-tag">
                  Owner
                </div>
              </div>

            </div>

          </div>

        </div>


        {/* =========================
            BODY
        ========================= */}

        <div className="admin-body">

          {/* Greeting */}

          <div
            className="dash-greeting"
            style={{ marginBottom: "24px" }}
          >

            <h2>
              Good morning,{" "}
              {user?.name
                ? user.name.split(" ")[0]
                : "Owner"}
            </h2>

            <p>
              Here's what's happening with your
              sports facilities.
            </p>

          </div>


          {/* =========================
              STAT CARDS
          ========================= */}

          <div className="stat-grid">

            {/* Total Bookings */}

            <div className="stat-card">

              <div className="stat-card__top">

                <div className="stat-card__icon">
                  📅
                </div>

              </div>

              <b>
                {dashboard?.total_bookings ?? 0}
              </b>

              <span>
                Total Bookings
              </span>

            </div>


            {/* Upcoming Bookings */}

            <div className="stat-card">

              <div className="stat-card__top">

                <div className="stat-card__icon">
                  ⏳
                </div>

              </div>

              <b>
                {dashboard?.upcoming_bookings ?? 0}
              </b>

              <span>
                Upcoming Bookings
              </span>

            </div>


            {/* Completed Bookings */}

            <div className="stat-card">

              <div className="stat-card__top">

                <div className="stat-card__icon">
                  ✅
                </div>

              </div>

              <b>
                {dashboard?.booking_status?.COMPLETED ?? 0}
              </b>

              <span>
                Completed Bookings
              </span>

            </div>


            {/* Total Revenue */}

            <div className="stat-card">

              <div className="stat-card__top">

                <div className="stat-card__icon">
                  💰
                </div>

              </div>

              <b>
                {formatCurrency(
                  dashboard?.total_earnings
                )}
              </b>

              <span>
                Total Revenue
              </span>

            </div>

          </div>


          {/* =========================
              RECENT BOOKINGS
          ========================= */}

          <div
            className="table-card"
            style={{ marginBottom: "24px" }}
          >

            <div className="table-card__head">

              <h3
                style={{
                  fontFamily:
                    "var(--font-body)",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                Recent Bookings
              </h3>

              <Link
                to="/owner/bookings"
                className="btn btn--ghost btn--sm"
              >
                View All
              </Link>

            </div>


            <table>

              <thead>

                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Ground</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>

              </thead>


              <tbody>

                {dashboard?.recent_bookings?.length > 0 ? (

                  dashboard.recent_bookings.map(
                    (booking) => (

                      <tr key={booking.id}>

                        <td>
                          <b>
                            #{booking.id}
                          </b>
                        </td>

                        <td>
                          {booking.customer_name || "-"}
                        </td>

                        <td>
                          {booking.ground_name || "-"}
                        </td>

                        <td>
                          {booking.resource_name || "-"}
                        </td>

                        <td>
                          {formatDate(
                            booking.booking_date
                          )}
                        </td>

                        <td>
                          {formatTime(
                            booking.start_time
                          )}
                          {" – "}
                          {formatTime(
                            booking.end_time
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            booking.total_amount
                          )}
                        </td>

                        <td>

                          <span
                            className={getStatusClass(
                              booking.status
                            )}
                          >
                            {booking.status}
                          </span>

                        </td>

                        <td>

                          <Link
                            to={`/owner/bookings/${booking.id}`}
                            className="btn btn--outline btn--sm"
                          >
                            View
                          </Link>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td colSpan="9">
                      No bookings found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* =========================
              MY GROUNDS HEADER
          ========================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >

            <h3
              style={{
                fontFamily:
                  "var(--font-body)",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              My Grounds
            </h3>

            <Link
              to="/owner/grounds"
              className="btn btn--ghost btn--sm"
            >
              Manage All
            </Link>

          </div>


          {/* =========================
              MY GROUNDS
          ========================= */}

          <div
            className="owner-grounds-grid"
            style={{ marginBottom: "28px" }}
          >

            {dashboard?.grounds?.length > 0 ? (

              dashboard.grounds.map(
                (ground) => (

                  <div
                    className="owner-ground-card"
                    key={ground.id}
                  >

                    <div className="owner-ground-card__media">

                      <span className="owner-ground-card__status">

                        <span
                          className={
                            ground.status === "ACTIVE"
                              ? "badge badge--active"
                              : "badge"
                          }
                        >
                          {ground.status}
                        </span>

                      </span>

                      <img
                        src={
                          ground.photos?.[0] ||
                          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80"
                        }
                        alt={ground.name}
                      />

                    </div>


                    <div className="owner-ground-card__body">

                      <div className="owner-ground-card__name">
                        {ground.name}
                      </div>

                      <div className="owner-ground-card__loc">
                        📍 {ground.location || "-"}
                      </div>

                      <div className="owner-ground-card__meta">
                        {ground.resource_count || 0} Resources
                      </div>

                      <Link
                        to={`/owner/grounds/${ground.id}`}
                        className="btn btn--outline btn--block btn--sm"
                      >
                        Manage
                      </Link>

                    </div>

                  </div>

                )
              )

            ) : (

              <p>
                No grounds found.
              </p>

            )}

          </div>


          {/* =========================
              MOST BOOKED RESOURCE
          ========================= */}

          <h3
            style={{
              fontFamily:
                "var(--font-body)",
              fontSize: "1.1rem",
              fontWeight: 800,
              marginBottom: "16px",
            }}
          >
            Most Booked Resource
          </h3>


          {dashboard?.most_booked_resource ? (

            <div className="most-booked">

              <div className="most-booked__icon">
                🏏
              </div>

              <div className="most-booked__bar-wrap">

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: ".9rem",
                  }}
                >

                  <b>
                    {
                      dashboard
                        .most_booked_resource
                        .resource_name
                    }

                    {" — "}

                    {
                      dashboard
                        .most_booked_resource
                        .ground_name
                    }

                  </b>

                  <span
                    style={{
                      color:
                        "var(--c-ink-faint)",
                    }}
                  >
                    {
                      dashboard
                        .most_booked_resource
                        .booking_count
                    }{" "}
                    bookings this month
                  </span>

                </div>


                <div className="most-booked__bar-track">

                  <div
                    className="most-booked__bar-fill"
                    style={{
                      width: "78%",
                    }}
                  ></div>

                </div>

              </div>

            </div>

          ) : (

            <div className="most-booked">

              <div className="most-booked__icon">
                🏟️
              </div>

              <div>
                <b>
                  No bookings this month
                </b>

                <p>
                  Your most booked resource
                  will appear here.
                </p>
              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Owner;