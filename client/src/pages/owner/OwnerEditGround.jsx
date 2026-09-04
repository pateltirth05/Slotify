import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerEditGround() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    facilities: [],
    status: "ACTIVE",
  });

  const [selectedSports, setSelectedSports] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sports = [
    { value: "Football", label: "⚽ Football" },
    { value: "Cricket", label: "🏏 Cricket" },
    { value: "Badminton", label: "🏸 Badminton" },
    { value: "Tennis", label: "🎾 Tennis" },
    { value: "Basketball", label: "🏀 Basketball" },
    { value: "Volleyball", label: "🏐 Volleyball" },
  ];

  const facilities = [
    "Parking",
    "Flood Lights",
    "Washroom",
    "Drinking Water",
    "Cafeteria",
    "Equipment Rental",
  ];

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const response = await api.get(`/grounds/${id}`);

        const ground = response.data.ground;

        setFormData({
          name: ground.name || "",
          description: ground.description || "",
          location: ground.location || "",
          city: ground.city || "",
          facilities: Array.isArray(ground.facilities)
            ? ground.facilities
            : [],
          status: ground.status || "ACTIVE",
        });

        setExistingPhotos(
          Array.isArray(ground.photos)
            ? ground.photos
            : []
        );

        /*
         * Sports are derived from resources because
         * grounds table does not have a sports column.
         */
        if (
          Array.isArray(ground.resources) &&
          ground.resources.length > 0
        ) {
          const sportsFromResources = [
            ...new Set(
              ground.resources
                .map((resource) => resource.sport_type)
                .filter(Boolean)
            ),
          ];

          setSelectedSports(sportsFromResources);
        }
      } catch (error) {
        console.error("Fetch ground for edit error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load ground details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGround();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSportChange = (event) => {
    const { value, checked } = event.target;

    setSelectedSports((previous) => {
      if (checked) {
        return [...previous, value];
      }

      return previous.filter(
        (sport) => sport !== value
      );
    });
  };

  const handleFacilityChange = (event) => {
    const { value, checked } = event.target;

    setFormData((previous) => {
      if (checked) {
        return {
          ...previous,
          facilities: [
            ...previous.facilities,
            value,
          ],
        };
      }

      return {
        ...previous,
        facilities: previous.facilities.filter(
          (facility) => facility !== value
        ),
      };
    });
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files
    );

    setImages(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Ground name is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    try {
      setSaving(true);

      /*
       * First update the normal ground information.
       */
      const groundData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        city: formData.city,
        facilities: formData.facilities,
        status: formData.status,
      };

      await api.put(
        `/grounds/${id}`,
        groundData
      );

      /*
       * If new images were selected, upload them
       * using the existing ground photo endpoint.
       *
       * If no new images are selected, we don't
       * make an unnecessary upload request.
       */
      if (images.length > 0) {
        const imageData = new FormData();

        images.forEach((image) => {
          imageData.append("images", image);
        });

        await api.post(
          `/grounds/${id}/photos`,
          imageData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      navigate(`/owner/grounds/${id}`);
    } catch (error) {
      console.error("Update ground error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update ground."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

            <h2>Edit Ground</h2>

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

  if (error && !formData.name) {
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

            <h2>Edit Ground</h2>

            <Link
              to="/owner/grounds"
              className="btn btn--outline btn--sm"
            >
              ← Back to My Grounds
            </Link>
          </div>

          <div className="admin-body">
            <p style={{ color: "red" }}>
              {error}
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
          <button
            className="hamburger-btn"
            type="button"
          >
            ☰
          </button>

          <h2>Edit Ground</h2>

          <Link
            to="/owner/grounds"
            className="btn btn--outline btn--sm"
          >
            ← Back to My Grounds
          </Link>
        </div>

        <div className="admin-body">
          {error && (
            <div
              style={{
                color: "red",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-sections">

              {/* 1. Basic Information */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    1
                  </span>
                  Basic Information
                </div>

                <div className="field">
                  <label htmlFor="gname">
                    Ground Name
                  </label>

                  <input
                    type="text"
                    id="gname"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Victory Sports Complex"
                  />
                </div>

                <div className="field">
                  <label htmlFor="desc">
                    Description
                  </label>

                  <textarea
                    id="desc"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell players what makes this ground worth booking..."
                  />
                </div>
              </section>

              {/* 2. Location */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    2
                  </span>
                  Location
                </div>

                <div className="field">
                  <label htmlFor="location">
                    Location
                  </label>

                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Prahladnagar"
                  />
                </div>

                <div className="field">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Ahmedabad"
                  />
                </div>
              </section>

              {/* 3. Sports & Facilities */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    3
                  </span>
                  Sports &amp; Facilities
                </div>

                <label
                  className="hint"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 700,
                    fontSize: ".85rem",
                    color: "var(--c-ink)",
                  }}
                >
                  Supported Sports
                </label>

                <div
                  className="sport-picker"
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  {sports.map((sport) => (
                    <label key={sport.value}>
                      <input
                        type="checkbox"
                        value={sport.value}
                        checked={selectedSports.includes(
                          sport.value
                        )}
                        onChange={
                          handleSportChange
                        }
                      />

                      {" "}
                      {sport.label}
                    </label>
                  ))}
                </div>

                <label
                  className="hint"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 700,
                    fontSize: ".85rem",
                    color: "var(--c-ink)",
                  }}
                >
                  Facilities
                </label>

                <div className="facility-picker">
                  {facilities.map((facility) => (
                    <label key={facility}>
                      <input
                        type="checkbox"
                        value={facility}
                        checked={formData.facilities.includes(
                          facility
                        )}
                        onChange={
                          handleFacilityChange
                        }
                      />

                      {" "}
                      {facility}
                    </label>
                  ))}
                </div>
              </section>

              {/* 4. Ground Images */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    4
                  </span>
                  Ground Images
                </div>

                <p
                  style={{
                    fontSize: ".85rem",
                    color:
                      "var(--c-ink-faint)",
                    marginBottom: "14px",
                  }}
                >
                  Upload multiple images. First
                  image will be the cover photo.
                </p>

                {existingPhotos.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    {existingPhotos.map(
                      (photo, index) => (
                        <img
                          key={photo}
                          src={photo}
                          alt={`Ground ${index + 1}`}
                          style={{
                            width: "100px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      )
                    )}
                  </div>
                )}

                <div className="upload-grid">
                  <label className="upload-slot">
                    + Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>

                  <label className="upload-slot">
                    + Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>

                  <label className="upload-slot">
                    + Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>

                  <label className="upload-slot">
                    + Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <p
                    style={{
                      fontSize: ".85rem",
                      color:
                        "var(--c-ink-faint)",
                      marginTop: "10px",
                    }}
                  >
                    {images.length} new image
                    {images.length > 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                )}
              </section>

              {/* 5. Status */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    5
                  </span>
                  Status
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <label
                    className="pay-option"
                    style={{ flex: 1 }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={
                        formData.status ===
                        "ACTIVE"
                      }
                      onChange={handleChange}
                    />

                    <div>
                      <b>Active</b>

                      <div
                        style={{
                          fontSize: ".8rem",
                          color:
                            "var(--c-ink-faint)",
                        }}
                      >
                        Visible and bookable by
                        players
                      </div>
                    </div>
                  </label>

                  <label
                    className="pay-option"
                    style={{ flex: 1 }}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={
                        formData.status ===
                        "INACTIVE"
                      }
                      onChange={handleChange}
                    />

                    <div>
                      <b>Inactive</b>

                      <div
                        style={{
                          fontSize: ".8rem",
                          color:
                            "var(--c-ink-faint)",
                        }}
                      >
                        Hidden from search and
                        booking
                      </div>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="form-actions">
              <Link
                to={`/owner/grounds/${id}`}
                className="btn btn--outline"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default OwnerEditGround;