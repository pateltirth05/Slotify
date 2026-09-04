import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerGroundDetails() {
  const { id } = useParams();

  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const response = await api.get(`/grounds/${id}`);

        setGround(response.data.ground);
      } catch (error) {
        console.error("Fetch ground details error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load ground details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGround();
  }, [id]);

  const getGroundImage = (photos) => {
    if (Array.isArray(photos) && photos.length > 0) {
      return photos[0];
    }

    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&q=80";
  };

  const getSports = () => {
    if (!ground?.resources || ground.resources.length === 0) {
      return "No sports added";
    }

    const sports = [
      ...new Set(
        ground.resources
          .map((resource) => resource.sport_type)
          .filter(Boolean)
      ),
    ];

    return sports.length > 0
      ? sports.join(" · ")
      : "No sports added";
  };

  const getFacilities = () => {
    if (
      !Array.isArray(ground?.facilities) ||
      ground.facilities.length === 0
    ) {
      return "No facilities added";
    }

    return ground.facilities.join(" · ");
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <OwnerSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button className="hamburger-btn" type="button">
              ☰
            </button>

            <h2>Ground Details</h2>

            <Link
              to="/owner/grounds"
              className="btn btn--outline btn--sm"
            >
              ← Back to My Grounds
            </Link>
          </div>

          <div className="admin-body">
            <p>Loading ground details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !ground) {
    return (
      <div className="admin-shell">
        <OwnerSidebar />

        <main className="admin-main">
          <div className="admin-topbar">
            <button className="hamburger-btn" type="button">
              ☰
            </button>

            <h2>Ground Details</h2>

            <Link
              to="/owner/grounds"
              className="btn btn--outline btn--sm"
            >
              ← Back to My Grounds
            </Link>
          </div>

          <div className="admin-body">
            <p style={{ color: "red" }}>
              {error || "Ground not found"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="hamburger-btn" type="button">
            ☰
          </button>

          <h2>{ground.name}</h2>

          <Link
            to="/owner/grounds"
            className="btn btn--outline btn--sm"
          >
            ← Back to My Grounds
          </Link>
        </div>

        <div className="admin-body">
          {/* Ground information */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
            }}
          >
            <img
              src={getGroundImage(ground.photos)}
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
              }}
              alt={ground.name}
            />

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.9rem",
                    }}
                  >
                    {ground.name}
                  </h2>

                  <div
                    style={{
                      color: "var(--c-ink-faint)",
                      fontSize: ".9rem",
                      marginTop: "4px",
                    }}
                  >
                    📍 {ground.location}
                  </div>
                </div>

                <span
                  className={`badge ${
                    ground.status === "ACTIVE"
                      ? "badge--active"
                      : "badge--inactive"
                  }`}
                >
                  {ground.status === "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <p
                style={{
                  color: "var(--c-ink-soft)",
                  fontSize: ".92rem",
                  marginBottom: "16px",
                }}
              >
                {ground.description || "No description added."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="detail-block__label">
                    Supported Sports
                  </div>

                  <div className="detail-block__value">
                    {getSports()}
                  </div>
                </div>

                <div>
                  <div className="detail-block__label">
                    Facilities
                  </div>

                  <div className="detail-block__value">
                    {getFacilities()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources heading */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "28px 0 16px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.1rem",
                fontWeight: 800,
              }}
            >
              Resources
            </h3>

            <Link
              to={`/owner/grounds/${ground.id}/resources/add`}
              className="btn btn--primary btn--sm"
            >
              + Add Resource
            </Link>
          </div>

          {/* Resources */}
          {ground.resources && ground.resources.length > 0 ? (
            <div className="resource-grid">
              {ground.resources.map((resource) => (
                <div
                  className="resource-card"
                  key={resource.id}
                >
                  <div className="resource-card__top">
                    <div>
                      <div className="resource-card__name">
                        {resource.name}
                      </div>

                      <div className="resource-card__sport">
                        {resource.sport_type === "Football"
                          ? "⚽"
                          : resource.sport_type === "Cricket"
                          ? "🏏"
                          : "🎾"}{" "}
                        {resource.sport_type}
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        resource.status === "ACTIVE"
                          ? "badge--active"
                          : "badge--inactive"
                      }`}
                    >
                      {resource.status === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="resource-card__price">
                    ₹{formatPrice(resource.price_per_hour)}{" "}
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: ".85rem",
                        color: "var(--c-ink-faint)",
                        fontWeight: 600,
                      }}
                    >
                      / hour
                    </span>
                  </div>

                  <div className="resource-card__hours">
                    {formatTime(resource.opening_time)} –{" "}
                    {formatTime(resource.closing_time)}
                  </div>

                  <div className="resource-card__actions">
                    <Link
                      to={`/owner/resources/${resource.id}/edit`}
                      className="btn btn--outline btn--sm"
                    >
                      Manage Resource
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🎾</div>

              <h3 style={{ marginBottom: "8px" }}>
                No resources added yet
              </h3>

              <p style={{ marginBottom: "20px" }}>
                Add a resource to start accepting bookings.
              </p>

              <Link
                to={`/owner/grounds/${ground.id}/resources/add`}
                className="btn btn--primary"
              >
                + Add Resource
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerGroundDetails;