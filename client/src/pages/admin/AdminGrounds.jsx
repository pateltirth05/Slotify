import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
const AdminGrounds = () => {
  const [grounds, setGrounds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [updatingId, setUpdatingId] = useState(null);

  const [admin, setAdmin] = useState({
    name: "Administrator",
  });

  // -----------------------------
  // HELPERS
  // -----------------------------

  const getInitials = (name) => {
    if (!name) return "A";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
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

  // -----------------------------
  // LOAD GROUNDS
  // -----------------------------

  const loadGrounds = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/grounds");

      setGrounds(response.data.grounds || []);
    } catch (err) {
      console.error(
        "Failed to load grounds:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load grounds."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrounds();
  }, []);

  // -----------------------------
  // UPDATE GROUND STATUS
  // -----------------------------

  const handleStatusChange = async (ground) => {
    const newStatus =
      ground.status === "ACTIVE"
        ? "BLOCKED"
        : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "BLOCKED"
          ? "block"
          : "activate"
      } ${ground.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(ground.id);

      await api.patch(
        `/admin/grounds/${ground.id}/status`,
        {
          status: newStatus,
        }
      );

      setGrounds((currentGrounds) =>
        currentGrounds.map((item) =>
          item.id === ground.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to update ground status:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update ground status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // -----------------------------
  // FILTER GROUNDS
  // -----------------------------

  const filteredGrounds = grounds.filter(
    (ground) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        ground.name
          ?.toLowerCase()
          .includes(searchText) ||
        ground.location
          ?.toLowerCase()
          .includes(searchText) ||
        ground.city
          ?.toLowerCase()
          .includes(searchText) ||
        ground.owner_name
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        ground.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // -----------------------------
  // SUMMARY
  // -----------------------------

  const totalGrounds = grounds.length;

  const activeGrounds = grounds.filter(
    (ground) => ground.status === "ACTIVE"
  ).length;

  const blockedGrounds = grounds.filter(
    (ground) => ground.status === "BLOCKED"
  ).length;

  // -----------------------------
  // UI
  // -----------------------------

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

          <h2>Grounds</h2>

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
            style={{
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "1.7rem",
              }}
            >
              Manage Grounds
            </h2>

            <p>
              View and manage all sports grounds
              listed on Slotify.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div
            className="stat-grid"
            style={{
              gridTemplateColumns:
                "repeat(3, 1fr)",
            }}
          >
            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  🏟️
                </div>
              </div>

              <b>{totalGrounds}</b>

              <span>Total Grounds</span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  ✅
                </div>
              </div>

              <b>{activeGrounds}</b>

              <span>Active Grounds</span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  🚫
                </div>
              </div>

              <b>{blockedGrounds}</b>

              <span>Blocked Grounds</span>
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
                  placeholder="Search by ground, location or owner..."
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

              {/* STATUS FILTER */}
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

              {/* CLEAR FILTERS */}
              {(search ||
                statusFilter !== "ALL") && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* GROUNDS TABLE */}
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
                All Grounds
              </h3>

              <span>
                {filteredGrounds.length} ground
                {filteredGrounds.length !== 1
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
                Loading grounds...
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
                  onClick={loadGrounds}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ground</th>
                    <th>Location</th>
                    <th>Owner</th>
                    <th>Resources</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGrounds.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign:
                            "center",
                          padding: "40px",
                        }}
                      >
                        No grounds found.
                      </td>
                    </tr>
                  ) : (
                    filteredGrounds.map(
                      (ground) => (
                        <tr
                          key={ground.id}
                        >
                          {/* GROUND */}
                          <td>
                            <div className="td-user">
                              <div
                                className="td-user__avatar"
                                style={{
                                  overflow:
                                    "hidden",
                                }}
                              >
                                {ground.photos &&
                                ground.photos
                                  .length >
                                  0 ? (
                                  <img
                                    src={
                                      ground
                                        .photos[0]
                                    }
                                    alt={
                                      ground.name
                                    }
                                    style={{
                                      width:
                                        "100%",
                                      height:
                                        "100%",
                                      objectFit:
                                        "cover",
                                    }}
                                  />
                                ) : (
                                  "🏟️"
                                )}
                              </div>

                              <div>
                                <b>
                                  {ground.name ||
                                    "-"}
                                </b>

                                {ground.city && (
                                  <div
                                    style={{
                                      fontSize:
                                        "12px",
                                      color:
                                        "#888",
                                      marginTop:
                                        "3px",
                                    }}
                                  >
                                    {ground.city}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* LOCATION */}
                          <td>
                            {ground.location ||
                              ground.city ||
                              "-"}
                          </td>

                          {/* OWNER */}
                          <td>
                            {ground.owner_name ||
                              "-"}
                          </td>

                          {/* RESOURCES */}
                          <td>
                            {ground.resource_count ??
                              0}
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={
                                ground.status ===
                                "BLOCKED"
                                  ? "badge badge--blocked"
                                  : "badge badge--active"
                              }
                            >
                              {ground.status ||
                                "ACTIVE"}
                            </span>
                          </td>

                          {/* CREATED */}
                          <td>
                            {formatDate(
                              ground.created_at
                            )}
                          </td>

                          {/* ACTION */}
                          <td>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              disabled={
                                updatingId ===
                                ground.id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  ground
                                )
                              }
                            >
                              {updatingId ===
                              ground.id
                                ? "Updating..."
                                : ground.status ===
                                  "ACTIVE"
                                ? "Block"
                                : "Activate"}
                            </button>
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

export default AdminGrounds;