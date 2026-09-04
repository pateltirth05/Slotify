import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        SLOTIFY
        <span
          className="dot"
          style={{ marginLeft: "6px" }}
        ></span>
      </div>

      <nav className="admin-nav">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          👥 Users
        </NavLink>

        <NavLink
          to="/admin/grounds"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          🏟️ Grounds
        </NavLink>

        <NavLink
          to="/admin/construction"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          🎾 Resources
        </NavLink>

        <NavLink
          to="/admin/construction"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          📅 Bookings
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          💳 Payments
        </NavLink>

        <NavLink
          to="/admin/settlements"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
        >
          🏦 Settlements
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            isActive ? "is-active" : ""
          }
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

export default AdminSidebar;