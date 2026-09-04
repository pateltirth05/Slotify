import { useEffect, useState } from "react";
import api from "../../services/api";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const response = await api.get("/users/me");

        const user = response.data.user;

        setProfile({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        setProfileError(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await api.put("/users/me", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      const updatedUser = response.data.user;

      setProfile({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
      });

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      setProfileError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setUpdatingPassword(true);

      await api.put("/users/me/password", {
        currentPassword:
          passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Password updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update password:",
        error
      );

      setPasswordError(
        error.response?.data?.message ||
          "Failed to update password"
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "OW";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">
        {/* TOPBAR */}
        <div className="admin-topbar">
          <button
            type="button"
            className="hamburger-btn"
          >
            ☰
          </button>

          <h2>Profile</h2>
        </div>

        <div
          className="admin-body"
          style={{ maxWidth: "640px" }}
        >
          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <>
              {/* OWNER IDENTITY */}
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  className="owner-identity__avatar"
                  style={{
                    width: "64px",
                    height: "64px",
                    fontSize: "1.4rem",
                  }}
                >
                  {getInitials(profile.name)}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.15rem",
                    }}
                  >
                    {profile.name || "-"}
                  </div>

                  <div
                    style={{
                      color: "var(--c-ink-faint)",
                      fontSize: ".88rem",
                    }}
                  >
                    {profile.email || "-"}
                  </div>
                </div>
              </div>

              {/* PERSONAL INFORMATION */}
              <div className="card">
                <div className="card__head">
                  <div>
                    <h3>Personal Information</h3>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="field">
                    <label htmlFor="name">
                      Name
                    </label>

                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">
                      Phone
                    </label>

                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {profileError && (
                    <p
                      style={{
                        color: "var(--c-danger)",
                        fontSize: ".9rem",
                        marginBottom: "15px",
                      }}
                    >
                      {profileError}
                    </p>
                  )}

                  {profileMessage && (
                    <p
                      style={{
                        color: "var(--c-success)",
                        fontSize: ".9rem",
                        marginBottom: "15px",
                      }}
                    >
                      {profileMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* CHANGE PASSWORD */}
              <div className="card">
                <div className="card__head">
                  <div>
                    <h3>Change Password</h3>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="field">
                    <label htmlFor="currentPassword">
                      Current Password
                    </label>

                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={
                        passwordData.currentPassword
                      }
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="field--row">
                    <div className="field">
                      <label htmlFor="newPassword">
                        New Password
                      </label>

                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={
                          passwordData.newPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="confirmPassword">
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={
                          passwordData.confirmPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p
                      style={{
                        color: "var(--c-danger)",
                        fontSize: ".9rem",
                        marginBottom: "15px",
                      }}
                    >
                      {passwordError}
                    </p>
                  )}

                  {passwordMessage && (
                    <p
                      style={{
                        color: "var(--c-success)",
                        fontSize: ".9rem",
                        marginBottom: "15px",
                      }}
                    >
                      {passwordMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={updatingPassword}
                  >
                    {updatingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerProfile;