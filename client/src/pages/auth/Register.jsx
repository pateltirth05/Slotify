import React from 'react'
import "../../style/style.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService.js";
const Register = () => {
     const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    
    role: "CUSTOMER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

  

   

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
 <>
  <div className="auth-shell">
    <div className="auth-visual">
      <div className="auth-visual__brand">
        <span style={{ color: 'var(--c-accent)' }}>●</span> SLOTIFY
      </div>
      <div className="auth-visual__quote">
        "As a ground owner, listing my turf took ten minutes. Bookings started coming in the same week."
        <div style={{ marginTop: '16px', fontSize: '.9rem', opacity: 0.8 }}>
          — Meera Shah, ground owner, Ahmedabad
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px' }}>
        <div>
          <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'block' }}>4.8★</b>
          <span style={{ fontSize: '.8rem', opacity: 0.75 }}>Average rating</span>
        </div>
        <div>
          <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'block' }}>15+</b>
          <span style={{ fontSize: '.8rem', opacity: 0.75 }}>Cities covered</span>
        </div>
      </div>
    </div>
    <div className="auth-card-wrap">
      <div className="auth-card">
        <Link to={"/"} className="eyebrow" style={{ marginBottom: '24px' }}>
          BACK TO HOME
        </Link>
        <h1>Create your account</h1>
        <p className="sub">Join Pitch and book grounds in a couple of taps.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Tirth Patel"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tirth@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
<div className="field">
            <label htmlFor="password">Choose Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="CUSTOMER">Customer</option>
            <option value="OWNER">Ground Owner</option>
          </select>
          </div>

          {error && <p>{error}</p>}

          <button type="submit" disabled={loading} className="btn btn--primary btn--block btn--lg">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  </div>
</>
  )
}

export default Register