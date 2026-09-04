import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerResources() {
  const [resources, setResources] = useState([]);
  const [grounds, setGrounds] = useState([]);

  const [selectedGround, setSelectedGround] =
    useState("");

  const [selectedSport, setSelectedSport] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resources");

      setResources(response.data.resources || []);
    } catch (error) {
      console.error(
        "Fetch resources error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load resources."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchGrounds = async () => {
    try {
      const response = await api.get(
        "/owner/grounds"
      );

      setGrounds(
        response.data.grounds || []
      );
    } catch (error) {
      console.error(
        "Fetch grounds error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchResources();
    fetchGrounds();
  }, []);

  const handleDelete = async (resourceId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this resource?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/resources/${resourceId}`);

    setResources((prev) =>
      prev.filter((resource) => resource.id !== resourceId)
    );
  } catch (error) {
    console.error("Delete resource error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to delete resource"
    );
  }
};
  const handleStatusChange = async (
    resource
  ) => {
    const newStatus =
      resource.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "ACTIVE"
          ? "activate"
          : "deactivate"
      } this resource?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(
        `/resources/${resource.id}`,
        {
          ground_id: resource.ground_id,
          name: resource.name,
          sport_type: resource.sport_type,
          price_per_hour:
            resource.price_per_hour,
          opening_time:
            resource.opening_time,
          closing_time:
            resource.closing_time,
          status: newStatus,
        }
      );

      await fetchResources();
    } catch (error) {
      console.error(
        "Update resource status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update resource status."
      );
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-IN"
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      time.slice(0, 5).split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const getSportIcon = (sport) => {
    switch (sport) {
      case "Football":
        return "⚽";

      case "Cricket":
        return "🏏";

      case "Badminton":
        return "🏸";

      case "Tennis":
        return "🎾";

      case "Basketball":
        return "🏀";

      case "Volleyball":
        return "🏐";

      default:
        return "🎾";
    }
  };

  const filteredResources =
    resources.filter((resource) => {
      const groundMatches =
        !selectedGround ||
        String(resource.ground_id) ===
          String(selectedGround);

      const sportMatches =
        !selectedSport ||
        resource.sport_type ===
          selectedSport;

      return (
        groundMatches && sportMatches
      );
    });

  const sports = [
    ...new Set(
      resources
        .map(
          (resource) =>
            resource.sport_type
        )
        .filter(Boolean)
    ),
  ];

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <button
            className="hamburger-btn"
            type="button"
          >
            ☰
          </button>

          <h2>Resources</h2>

          <Link
            to="/owner/resources/add"
            className="btn btn--primary btn--sm"
          >
            + Add Resource
          </Link>
        </div>

        <div className="admin-body">

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <select
              value={selectedGround}
              onChange={(event) =>
                setSelectedGround(
                  event.target.value
                )
              }
              style={{
                padding: "9px 14px",
                borderRadius:
                  "var(--r-pill)",
                border:
                  "1px solid var(--c-line)",
                background: "#fff",
              }}
            >
              <option value="">
                All Grounds
              </option>

              {grounds.map((ground) => (
                <option
                  key={ground.id}
                  value={ground.id}
                >
                  {ground.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSport}
              onChange={(event) =>
                setSelectedSport(
                  event.target.value
                )
              }
              style={{
                padding: "9px 14px",
                borderRadius:
                  "var(--r-pill)",
                border:
                  "1px solid var(--c-line)",
                background: "#fff",
              }}
            >
              <option value="">
                All Sports
              </option>

              {sports.map((sport) => (
                <option
                  key={sport}
                  value={sport}
                >
                  {sport}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <p>Loading resources...</p>
          )}

          {!loading && error && (
            <p style={{ color: "red" }}>
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            filteredResources.length === 0 && (
              <div className="empty-state">
                

                <h3
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  No resources found
                </h3>

                <p
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  Add a resource or change
                  your filters.
                </p>

                <Link
                  to="/owner/resources/add"
                  className="btn btn--primary"
                >
                  + Add Resource
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            filteredResources.length > 0 && (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Ground</th>
                      <th>Sport</th>
                      <th>Price / Hour</th>
                      <th>Opening</th>
                      <th>Closing</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResources.map(
                      (resource) => {
                        const ground =
                          grounds.find(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              String(
                                resource.ground_id
                              )
                          );

                        return (
                          <tr
                            key={
                              resource.id
                            }
                          >
                            <td>
                              <b>
                                {
                                  resource.name
                                }
                              </b>
                            </td>

                            <td>
                              {ground?.name ||
                                "Unknown Ground"}
                            </td>

                            <td>
                              {getSportIcon(
                                resource.sport_type
                              )}{" "}
                              {
                                resource.sport_type
                              }
                            </td>

                            <td>
                              ₹
                              {formatPrice(
                                resource.price_per_hour
                              )}
                            </td>

                            <td>
                              {formatTime(
                                resource.opening_time
                              )}
                            </td>

                            <td>
                              {formatTime(
                                resource.closing_time
                              )}
                            </td>

                            <td>
                              <span
                                className={`badge ${
                                  resource.status ===
                                  "ACTIVE"
                                    ? "badge--active"
                                    : "badge--inactive"
                                }`}
                              >
                                {resource.status ===
                                "ACTIVE"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td className="td-actions">
                              <Link
                                to={`/owner/resources/${resource.id}/edit`}
                                className="icon-btn"
                                title="Edit Resource"
                              >
                                ✎
                              </Link>

                              <button
                                type="button"
                                className="icon-btn"
                                title={
                                  resource.status ===
                                  "ACTIVE"
                                    ? "Deactivate Resource"
                                    : "Activate Resource"
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    resource
                                  )
                                }
                              >
                                {resource.status ===
                                "ACTIVE"
                                  ? "⏸"
                                  : "▶"}
                              </button>
                              
                              <button
  type="button"
  onClick={() => handleDelete(resource.id)}
  className="action-btn delete"
>
  🗑️
</button>
                            </td>
                            
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default OwnerResources;