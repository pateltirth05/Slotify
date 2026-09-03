import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbard from "../components/Navbard";
import Footer from "../components/Footer";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../style/style.css"
const Profile = () => {
  const { user, logout } = useAuth();

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

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setError("");

        const response = await api.get("/users/me");

        const currentUser = response.data.user;

        setProfile({
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        });
      } catch (error) {
        console.error("Get profile error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load profile."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setProfileSaving(true);
      setProfileMessage("");
      setError("");

      const response = await api.put("/users/me", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });

      setProfile(response.data.user);

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setError("");

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      await api.put("/users/me/password", {
        currentPassword:
          passwordData.currentPassword,

        newPassword:
          passwordData.newPassword,
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
        "Update password error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (profileLoading) {
    return (
      <>
        <Navbard />

        <div
          className="container"
          style={{
            paddingTop: "50px",
            paddingBottom: "64px",
          }}
        >
          Loading profile...
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbard />

      <div
        className="container"
        style={{
          paddingTop: "32px",
          paddingBottom: "64px",
        }}
      >
        <div className="profile-grid">
          {/* Profile Navigation */}
          <nav className="profile-nav">
            <div className="profile-nav__head">
              <div className="profile-nav__avatar">
                {getInitials(profile.name)}
              </div>

              <b>{profile.name}</b>

              <div
                style={{
                  fontSize: ".8rem",
                  color: "var(--c-ink-faint)",
                }}
              >
                {profile.email}
              </div>
            </div>

            <a
              href="#personal"
              className="is-active"
            >
              👤 Personal Info
            </a>

            <a href="#password">
              🔒 Change Password
            </a>

            <Link
              
              className="danger"
              onClick={handleLogout}
            >
              🚪 Log Out
            </Link>
          </nav>

          <div>
            {/* Error */}
            {error && (
              <div
                style={{
                  color: "var(--c-danger)",
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="card" id="personal">
              <div className="card__head">
                <div>
                  <h3>Personal Information</h3>

                  <p>
                    Update your personal and contact
                    information
                  </p>
                </div>

                <div
                  className="profile-nav__avatar"
                  style={{ margin: 0 }}
                >
                  {getInitials(profile.name)}
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="field">
                  <label>Name</label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Email address</label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>Phone number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                {profileMessage && (
                  <p
                    style={{
                      color: "var(--c-green)",
                      marginBottom: "16px",
                    }}
                  >
                    {profileMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={profileSaving}
                >
                  {profileSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card" id="password">
              <div className="card__head">
                <div>
                  <h3>Change Password</h3>

                  <p>
                    Use a strong password you don't use
                    elsewhere
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="field">
                  <label>
                    Current password
                  </label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={
                      passwordData.currentPassword
                    }
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>New password</label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      passwordData.newPassword
                    }
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="field">
                  <label>
                    Confirm new password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                {passwordMessage && (
                  <p
                    style={{
                      color: "var(--c-green)",
                      marginBottom: "16px",
                    }}
                  >
                    {passwordMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={passwordSaving}
                >
                  {passwordSaving
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;