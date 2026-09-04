import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerGrounds() {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const handleDelete = async (groundId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this ground?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/grounds/${groundId}`);

    setGrounds((prev) =>
      prev.filter((ground) => ground.id !== groundId)
    );
  } catch (error) {
    console.error("Delete ground error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to delete ground"
    );
  }
};
  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const response = await api.get("/owner/grounds");
        // Backend returns all grounds, so show only
        // grounds belonging to the logged-in owner.
        setGrounds(response.data.grounds || []);
      } catch (error) {
        console.error("Fetch owner grounds error:", error);
        setError(
          error.response?.data?.message || "Failed to load your grounds"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  const getGroundImage = (photos) => {
    if (Array.isArray(photos) && photos.length > 0) {
      return photos[0];
    }

    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80";
  };

  const getFacilities = (facilities) => {
    if (!Array.isArray(facilities) || facilities.length === 0) {
      return "No facilities added";
    }

    return facilities.slice(0, 3).join(" • ");
  };

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="hamburger-btn" type="button">
            ☰
          </button>

          <h2>My Grounds</h2>

          <div className="topbar-right">
            <button className="bell-btn" type="button">
              🔔
              <span className="bell-dot"></span>
            </button>

            <Link
              to="/owner/grounds/add"
              className="btn btn--primary btn--sm"
            >
              + Add Ground
            </Link>
          </div>
        </div>

        <div className="admin-body">
          {loading && <p>Loading grounds...</p>}

          {!loading && error && (
            <p style={{ color: "red" }}>{error}</p>
          )}

          {!loading && !error && grounds.length > 0 && (
            <div className="owner-grounds-grid">
              {grounds.map((ground) => (
                <div className="owner-ground-card" key={ground.id}>
                  <div className="owner-ground-card__media">
                    <span className="owner-ground-card__status">
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
                    </span>

                    <img
                      src={getGroundImage(ground.photos)}
                      alt={ground.name}
                    />
                  </div>

                  <div className="owner-ground-card__body">
                    <div className="owner-ground-card__name">
                      {ground.name}
                    </div>

                    <div className="owner-ground-card__loc">
                      📍 {ground.location}
                    </div>

                   <div className="owner-ground-card__sports">
  {Array.isArray(ground.sports) && ground.sports.length > 0
    ? ground.sports.join(" • ")
    : "No sports added"}
</div>

                    <div className="owner-ground-card__facilities">
                      {getFacilities(ground.facilities)}
                    </div>

                    <div className="owner-ground-card__meta">
                      {ground.resource_count || 0} Resources
                    </div>

                    <div className="owner-ground-card__actions">
                      <Link
                        to={`/owner/grounds/${ground.id}`}
                        className="btn btn--outline btn--sm"
                      >
                        View
                      </Link>

                      <Link
                        to={`/owner/grounds/${ground.id}/edit`}
                        className="btn btn--primary btn--sm"
                      >
                        Edit
                      </Link>
                      <button
  type="button"
  onClick={() => handleDelete(ground.id)}
  className="btn btn--danger btn--sm"
>
 Delete
</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && grounds.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">🏟️</div>

              <h3 style={{ marginBottom: "8px" }}>
                No grounds added yet
              </h3>

              <p style={{ marginBottom: "20px" }}>
                Create your first sports ground to start accepting
                bookings.
              </p>

              <Link
                to="/owner/grounds/add"
                className="btn btn--primary"
              >
                + Add Ground
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerGrounds;