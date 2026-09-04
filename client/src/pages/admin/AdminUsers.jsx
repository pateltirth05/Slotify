import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [updatingId, setUpdatingId] = useState(null);

  const [admin, setAdmin] = useState({
    name: "Administrator",
  });

  const getInitials = (name) => {
    if (!name) return "A";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      /*
       * Backend may return:
       * { success: true, users: [...] }
       */
      const data = response.data;

      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (user) => {
    const newStatus =
      user.status === "ACTIVE"
        ? "BLOCKED"
        : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "BLOCKED"
          ? "block"
          : "activate"
      } ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user.id);

      await api.patch(
        `/admin/users/${user.id}/status`,
        {
          status: newStatus,
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRoleLabel = (role) => {
    if (role === "OWNER") return "Owner";
    if (role === "ADMIN") return "Administrator";
    return "Customer";
  };

  const getRoleClass = (role) => {
    if (role === "OWNER") {
      return "badge badge--owner";
    }

    if (role === "ADMIN") {
      return "badge badge--admin";
    }

    return "badge badge--customer";
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search
      .toLowerCase()
      .trim();

    const matchesSearch =
      !searchText ||
      user.name
        ?.toLowerCase()
        .includes(searchText) ||
      user.email
        ?.toLowerCase()
        .includes(searchText);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      user.status === statusFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );
  });

  const totalUsers = users.length;

  const customerCount = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  const ownerCount = users.filter(
    (user) => user.role === "OWNER"
  ).length;

  const blockedCount = users.filter(
    (user) => user.status === "BLOCKED"
  ).length;

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

          <h2>Users</h2>

          <div className="topbar-right">
            <button
              type="button"
              className="bell-btn"
            >
              🔔
              <span className="bell-dot"></span>
            </button>

            <div className="owner-identity">
              <div className="owner-identity__avatar">
                {getInitials(admin.name)}
              </div>

              <div>
                <b>
                  {admin.name ||
                    "Administrator"}
                </b>

                <div className="role-tag">
                  Administrator
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-body">
          {/* PAGE HEADER */}
          <div
            className="dash-greeting"
            style={{ marginBottom: "24px" }}
          >
            <h2 style={{ fontSize: "1.7rem" }}>
              Manage Users
            </h2>

            <p>
              View and manage Slotify customers,
              owners and administrators.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div
            className="stat-grid"
            style={{
              gridTemplateColumns:
                "repeat(4, 1fr)",
            }}
          >
            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  👥
                </div>
              </div>

              <b>{totalUsers}</b>

              <span>Total Users</span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  👤
                </div>
              </div>

              <b>{customerCount}</b>

              <span>Customers</span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  🏟️
                </div>
              </div>

              <b>{ownerCount}</b>

              <span>Owners</span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  🚫
                </div>
              </div>

              <b>{blockedCount}</b>

              <span>Blocked Users</span>
            </div>
          </div>

          {/* FILTERS */}
          <div
            className="table-card"
            style={{
              marginTop: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* SEARCH */}
              <div
                style={{
                  flex: "1",
                  minWidth: "240px",
                }}
              >
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              {/* ROLE */}
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
                style={{
                  padding: "12px 14px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">
                  All Roles
                </option>

                <option value="CUSTOMER">
                  Customers
                </option>

                <option value="OWNER">
                  Owners
                </option>

                <option value="ADMIN">
                  Administrators
                </option>
              </select>

              {/* STATUS */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={{
                  padding: "12px 14px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="BLOCKED">
                  Blocked
                </option>
              </select>

              {/* CLEAR */}
              {(search ||
                roleFilter !== "ALL" ||
                statusFilter !== "ALL") && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="table-card">
            <div className="table-card__head">
              <h3
                style={{
                  fontFamily:
                    "var(--font-body)",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                All Users
              </h3>

              <span>
                {filteredUsers.length} user
                {filteredUsers.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                Loading users...
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                <p>{error}</p>

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={loadUsers}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(
                      (user) => (
                        <tr key={user.id}>
                          {/* USER */}
                          <td>
                            <div className="td-user">
                              <div className="td-user__avatar">
                                {getInitials(
                                  user.name
                                )}
                              </div>

                              <b>
                                {user.name ||
                                  "-"}
                              </b>
                            </div>
                          </td>

                          {/* EMAIL */}
                          <td>
                            {user.email ||
                              "-"}
                          </td>

                          {/* ROLE */}
                          <td>
                            <span
                              className={getRoleClass(
                                user.role
                              )}
                            >
                              {getRoleLabel(
                                user.role
                              )}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={
                                user.status ===
                                "BLOCKED"
                                  ? "badge badge--blocked"
                                  : "badge badge--active"
                              }
                            >
                              {user.status ||
                                "ACTIVE"}
                            </span>
                          </td>

                          {/* JOINED */}
                          <td>
                            {formatDate(
                              user.created_at
                            )}
                          </td>

                          {/* ACTION */}
                          <td>
                            {user.role ===
                            "ADMIN" ? (
                              <span
                                style={{
                                  color:
                                    "#888",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                disabled={
                                  updatingId ===
                                  user.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    user
                                  )
                                }
                              >
                                {updatingId ===
                                user.id
                                  ? "Updating..."
                                  : user.status ===
                                    "ACTIVE"
                                  ? "Block"
                                  : "Activate"}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;