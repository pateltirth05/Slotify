import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        SLOTIFY<span className="dot" style={{ marginLeft: "6px" }}></span>
      </div>

      <nav className="admin-nav">

        <NavLink
          to="/owner/dashboard"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/owner/grounds"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          🏟️ My Grounds
        </NavLink>

        <NavLink
          to="/owner/resources"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          🎾 Resources
        </NavLink>

        <NavLink
          to="/owner/availability"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          🗓️ Availability
        </NavLink>

        <NavLink
          to="/owner/bookings"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          📅 Bookings
        </NavLink>

        <NavLink
          to="/owner/earnings"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          💰 Earnings
        </NavLink>

        <NavLink
          to="/owner/payment-details"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          🏦 Payment Details
        </NavLink>

        <NavLink
          to="/owner/profile"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          👤 Profile
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="owner-logout-btn"
        >
          🚪 Logout
        </button>

      </nav>
    </aside>
  );
}

export default OwnerSidebar;