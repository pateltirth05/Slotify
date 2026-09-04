import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function Admin() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const { user } = useAuth();
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch admin dashboard:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = String(date).slice(0, 10);
    const [year, month, day] =
      dateString.split("-");

    if (!year || !month || !day) return "-";

    const formattedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (Number.isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  const getInitials = (name) => {
    if (!name) return "AD";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getBookingStatusClass = (status) => {
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

  const getRoleClass = (role) => {
    if (role === "OWNER") {
      return "role-badge role-badge--owner";
    }

    return "role-badge role-badge--customer";
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button
              type="button"
              className="hamburger-btn"
            >
              ☰
            </button>

            <h2>Admin Dashboard</h2>
          </div>

          <div className="admin-body">
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-shell">
        <AdminSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button
              type="button"
              className="hamburger-btn"
            >
              ☰
            </button>

            <h2>Admin Dashboard</h2>
          </div>

          <div className="admin-body">
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

const adminDashboard = dashboard?.dashboard || {};

const users = adminDashboard.users || {};
const grounds = adminDashboard.grounds || {};
const resources = adminDashboard.resources || {};
const bookings = adminDashboard.bookings || {};
const revenue = adminDashboard.revenue || {};

const recentBookings = adminDashboard.recentBookings || [];
const recentUsers = adminDashboard.recentUsers || [];

return (
  <div className="admin-shell">
    <AdminSidebar />

    <main className="admin-main">
      {/* TOPBAR */}
      <div className="admin-topbar">
        <button
          type="button"
          className="hamburger-btn"
        >
          ☰
        </button>

        <h2>Admin Dashboard</h2>

        <div className="topbar-right">
          

          <div className="owner-identity">
            <div className="owner-identity__avatar">
             {getInitials(user?.name)}
            </div>

            <div>
              <b><b>{user?.name || "Administrator"}</b></b>

              <div className="role-tag">
                Administrator
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-body">
        {/* GREETING */}
        <div
          className="dash-greeting"
          style={{ marginBottom: "24px" }}
        >
          <h2 style={{ fontSize: "1.7rem" }}>
            Admin Dashboard
          </h2>

          <p>
            Monitor and manage the Slotify platform.
          </p>
        </div>

        {/* STATS */}
        <div
          className="stat-grid"
          style={{
            gridTemplateColumns: "repeat(5,1fr)",
          }}
        >
          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon">
                👥
              </div>
            </div>

            <b>{users.total || 0}</b>

            <span>Total Users</span>
          </div>

          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon">
                🏟️
              </div>
            </div>

            <b>{grounds.total || 0}</b>

            <span>Total Grounds</span>
          </div>

          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon">
                🎾
              </div>
            </div>

            <b>{resources.total || 0}</b>

            <span>Total Resources</span>
          </div>

          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon">
                📅
              </div>
            </div>

            <b>{bookings.total || 0}</b>

            <span>Total Bookings</span>
          </div>

          <div className="stat-card">
            <div className="stat-card__top">
              <div className="stat-card__icon">
                💰
              </div>
            </div>

            <b>
              {formatAmount(revenue.total)}
            </b>

            <span>Total Revenue</span>
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div
          className="table-card"
          style={{ margin: "24px 0" }}
        >
          <div className="table-card__head">
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              Recent Bookings
            </h3>

            <Link
              to="/admin/bookings"
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
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No recent bookings.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <b>#{booking.id}</b>
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
                      {formatAmount(
                        booking.total_amount
                      )}
                    </td>

                    <td>
                      {booking.payment_method || "-"}{" "}
                      /{" "}
                      {booking.payment_status || "-"}
                    </td>

                    <td>
                      <span
                        className={getBookingStatusClass(
                          booking.status
                        )}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="btn btn--outline btn--sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RECENT USERS */}
        <div className="table-card">
          <div className="table-card__head">
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              Recent Users
            </h3>

            <Link
              to="/admin/users"
              className="btn btn--ghost btn--sm"
            >
              View All
            </Link>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No recent users.
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="td-user">
                        <div className="td-user__avatar">
                          {getInitials(user.name)}
                        </div>

                        <b>{user.name}</b>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={getRoleClass(
                          user.role
                        )}
                      >
                        {user.role === "OWNER"
                          ? "Owner"
                          : user.role === "ADMIN"
                          ? "Administrator"
                          : "Customer"}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge--active">
                        {user.status || "ACTIVE"}
                      </span>
                    </td>

                    <td>
                      {formatDate(user.created_at)}
                    </td>

                    <td>
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="btn btn--outline btn--sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  );
}

export default Admin;