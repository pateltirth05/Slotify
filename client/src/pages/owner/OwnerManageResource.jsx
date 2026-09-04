import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerManageResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grounds, setGrounds] = useState([]);

  const [formData, setFormData] = useState({
    groundId: "",
    name: "",
    sportType: "Football",
    pricePerHour: "",
    openTime: "06:00",
    closeTime: "23:00",
    status: "ACTIVE",
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sports = [
    "Football",
    "Cricket",
    "Badminton",
    "Tennis",
    "Basketball",
    "Volleyball",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourceResponse, groundsResponse] =
          await Promise.all([
            api.get(`/resources/${id}`),
            api.get("/owner/grounds"),
          ]);

        const resource = resourceResponse.data.resource;

        setGrounds(groundsResponse.data.grounds || []);

        setFormData({
          groundId: resource.ground_id || "",
          name: resource.name || "",
          sportType: resource.sport_type || "Football",
          pricePerHour:
            resource.price_per_hour || "",
          openTime:
            resource.opening_time?.slice(0, 5) ||
            "06:00",
          closeTime:
            resource.closing_time?.slice(0, 5) ||
            "23:00",
          status: resource.status || "ACTIVE",
        });

        setExistingPhotos(
          Array.isArray(resource.photos)
            ? resource.photos
            : []
        );
      } catch (error) {
        console.error(
          "Fetch resource for edit error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load resource details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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

    if (!formData.groundId) {
      setError("Please select a ground.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Resource name is required.");
      return;
    }

    if (!formData.pricePerHour) {
      setError("Price per hour is required.");
      return;
    }

    if (Number(formData.pricePerHour) <= 0) {
      setError(
        "Price per hour must be greater than 0."
      );
      return;
    }

    if (formData.openTime >= formData.closeTime) {
      setError(
        "Closing time must be later than opening time."
      );
      return;
    }

    try {
      setSaving(true);

      const resourceData = {
        ground_id: formData.groundId,
        name: formData.name,
        sport_type: formData.sportType,
        price_per_hour: formData.pricePerHour,
        opening_time: formData.openTime,
        closing_time: formData.closeTime,
        status: formData.status,
      };

      await api.put(
        `/resources/${id}`,
        resourceData
      );

      /*
       * Upload new images only if the owner selected them.
       * Existing photos are not removed automatically.
       */
      if (images.length > 0) {
        const imageData = new FormData();

        images.forEach((image) => {
          imageData.append("images", image);
        });

        await api.post(
          `/resources/${id}/photos`,
          imageData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      /*
       * After saving, return to the resource's ground.
       */
      navigate(
        `/owner/grounds/${formData.groundId}`
      );
    } catch (error) {
      console.error(
        "Update resource error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update resource."
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

            <h2>Manage Resource</h2>

            <Link
              to="/owner/resources"
              className="btn btn--outline btn--sm"
            >
              ← Back to Resources
            </Link>
          </div>

          <div className="admin-body">
            <p>Loading resource details...</p>
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

          <h2>Manage Resource</h2>

          <Link
            to="/owner/resources"
            className="btn btn--outline btn--sm"
          >
            ← Back to Resources
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

          <form
            onSubmit={handleSubmit}
            style={{ maxWidth: "640px" }}
          >
            <div className="form-sections">

              {/* 1. Resource Details */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    1
                  </span>
                  Resource Details
                </div>

                <div className="field">
                  <label htmlFor="ground">
                    Ground
                  </label>

                  <select
                    id="ground"
                    name="groundId"
                    value={formData.groundId}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Ground
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
                </div>

                <div className="field">
                  <label htmlFor="rname">
                    Resource Name
                  </label>

                  <input
                    type="text"
                    id="rname"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Football Ground A"
                  />
                </div>

                <div className="field--row">
                  <div className="field">
                    <label htmlFor="sport">
                      Sport Type
                    </label>

                    <select
                      id="sport"
                      name="sportType"
                      value={formData.sportType}
                      onChange={handleChange}
                    >
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

                  <div className="field">
                    <label htmlFor="price">
                      Price Per Hour (₹)
                    </label>

                    <input
                      type="number"
                      id="price"
                      name="pricePerHour"
                      value={
                        formData.pricePerHour
                      }
                      onChange={handleChange}
                      placeholder="1500"
                      min="1"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Operating Hours */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    2
                  </span>
                  Operating Hours
                </div>

                <div className="field--row">
                  <div className="field">
                    <label htmlFor="open">
                      Opening Time
                    </label>

                    <input
                      type="time"
                      id="open"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleChange}
                    />

                    <span className="hint">
                      Displays as 06:00 AM
                    </span>
                  </div>

                  <div className="field">
                    <label htmlFor="close">
                      Closing Time
                    </label>

                    <input
                      type="time"
                      id="close"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleChange}
                    />

                    <span className="hint">
                      Displays as 11:00 PM
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Resource Images */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    3
                  </span>
                  Resource Images
                </div>

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
                          alt={`Resource ${
                            index + 1
                          }`}
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

                <div
                  className="upload-grid"
                  style={{
                    gridTemplateColumns:
                      "repeat(3,1fr)",
                  }}
                >
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

              {/* 4. Status */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">
                    4
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
                        Bookable by players
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
                        Hidden from booking
                      </div>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="form-actions">
              <Link
                to={`/owner/grounds/${formData.groundId}`}
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

export default OwnerManageResource;