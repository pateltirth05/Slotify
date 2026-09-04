import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerAddGround() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "Ahmedabad",
    facilities: [],
    status: "ACTIVE",
  });

  const [images, setImages] = useState([]);
  const [selectedSports, setSelectedSports] = useState([]);

  const [loading, setLoading] = useState(false);
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

      return previous.filter((sport) => sport !== value);
    });
  };

  const handleFacilityChange = (event) => {
    const { value, checked } = event.target;

    setFormData((previous) => {
      if (checked) {
        return {
          ...previous,
          facilities: [...previous.facilities, value],
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
    const selectedFiles = Array.from(event.target.files);

    setImages(selectedFiles);
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");

  if (!formData.name.trim()) {
    setError("Ground name is required.");
    return;
  }

  if (!formData.description.trim()) {
    setError("Description is required.");
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

  if (selectedSports.length === 0) {
    setError("Please select at least one sport.");
    return;
  }

  if (formData.facilities.length === 0) {
    setError("Please select at least one facility.");
    return;
  }

  try {
    setLoading(true);

    // -----------------------------------
    // STEP 1: Create the ground
    // -----------------------------------

    const response = await api.post("/grounds", {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      city: formData.city,
      facilities: formData.facilities,
    });

    const createdGround = response.data.ground;

    // -----------------------------------
    // STEP 2: Upload ground photos
    // -----------------------------------

    if (images.length > 0) {
      for (const image of images) {
        const imageData = new FormData();

        imageData.append("photo", image);

        await api.post(
          `/grounds/${createdGround.id}/photos`,
          imageData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
    }

    // -----------------------------------
    // STEP 3: Go to ground details
    // -----------------------------------

    navigate(`/owner/grounds/${createdGround.id}`);
  } catch (error) {
    console.error("Create ground error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to create ground."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="hamburger-btn" type="button">
            ☰
          </button>

          <h2>Add Ground</h2>

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
                  <span className="form-section__num">1</span>
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
                  <span className="form-section__num">2</span>
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
                  <span className="form-section__num">3</span>
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
                  style={{ marginBottom: "20px" }}
                >
                  {sports.map((sport) => (
                    <label key={sport.value}>
                      <input
                        type="checkbox"
                        value={sport.value}
                        checked={selectedSports.includes(
                          sport.value
                        )}
                        onChange={handleSportChange}
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
                        onChange={handleFacilityChange}
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
    <span className="form-section__num">4</span>
    Ground Images
  </div>

  <p
    style={{
      fontSize: ".85rem",
      color: "var(--c-ink-faint)",
      marginBottom: "14px",
    }}
  >
    Upload multiple images. First image will be the cover photo.
  </p>

  <div className="upload-grid">
    <label className="upload-slot">
      + Cover Photo
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
    </label>

    <label className="upload-slot">
      + Add Photo
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
    </label>

    <label className="upload-slot">
      + Add Photo
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
    </label>

    <label className="upload-slot">
      + Add Photo
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
    </label>
  </div>

  {images.length > 0 && (
    <p
      style={{
        fontSize: ".85rem",
        color: "var(--c-ink-faint)",
        marginTop: "10px",
      }}
    >
      {images.length} image
      {images.length > 1 ? "s" : ""} selected
    </p>
  )}
</section>

              {/* 5. Status */}
              <section className="form-section">
                <div className="form-section__title">
                  <span className="form-section__num">5</span>
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
                      checked={formData.status === "ACTIVE"}
                      onChange={handleChange}
                    />

                    <div>
                      <b>Active</b>

                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "var(--c-ink-faint)",
                        }}
                      >
                        Visible and bookable by players
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
                      checked={formData.status === "INACTIVE"}
                      onChange={handleChange}
                    />

                    <div>
                      <b>Inactive</b>

                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "var(--c-ink-faint)",
                        }}
                      >
                        Hidden from search and booking
                      </div>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="form-actions">
              <Link
                to="/owner/grounds"
                className="btn btn--outline"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Ground"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default OwnerAddGround;