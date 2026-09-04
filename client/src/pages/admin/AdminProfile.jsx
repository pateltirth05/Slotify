import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
import "./profile.css"
function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/me");

      const user = response.data.user;

      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);

      setError(
        err.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setError("");

      const response = await api.put("/users/me", {
        name: profile.name,
        phone: profile.phone,
      });

      setProfileMessage(
        response.data.message || "Profile updated successfully."
      );
    } catch (err) {
      console.error("Update profile error:", err);

      setError(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setError("");

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError("Please enter both current and new password.");
      return;
    }

    try {
      setSavingPassword(true);

      const response = await api.put("/users/me/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage(
        response.data.message || "Password updated successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      console.error("Update password error:", err);

      setError(
        err.response?.data?.message || "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = () => {
    if (!profile.name) {
      return "A";
    }

    return profile.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>Profile</h1>
            <p>Manage your administrator account</p>
          </div>

          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {getInitials()}
            </div>

            <div>
              <strong>{profile.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            Loading profile...
          </div>
        ) : (
          <div className="admin-profile-content">
            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {profileMessage && (
              <div className="admin-success">
                {profileMessage}
              </div>
            )}

            {passwordMessage && (
              <div className="admin-success">
                {passwordMessage}
              </div>
            )}

            <div className="admin-profile-grid">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Update your administrator account details.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="admin-form-group">
                    <label htmlFor="name">
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                    />

                    <small>
                      Email address cannot be changed here.
                    </small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <button
                    type="submit"
                    className="admin-primary-btn"
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </form>
              </div>

              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h2>Change Password</h2>
                    <p>
                      Keep your administrator account secure.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="admin-form-group">
                    <label htmlFor="currentPassword">
                      Current Password
                    </label>

                    <input
                      id="currentPassword"
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="newPassword">
                      New Password
                    </label>

                    <input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="admin-primary-btn"
                    disabled={savingPassword}
                  >
                    {savingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>
                </form>
              </div>
            </div>

            <div className="admin-card admin-account-card">
              <div className="admin-card-header">
                <div>
                  <h2>Account Information</h2>
                  <p>Basic information about your admin account.</p>
                </div>
              </div>

              <div className="admin-account-info">
                <div>
                  <span>Role</span>
                  <strong>ADMIN</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{profile.email || "-"}</strong>
                </div>

                <div>
                  <span>Account Status</span>
                  <strong>ACTIVE</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminProfile;