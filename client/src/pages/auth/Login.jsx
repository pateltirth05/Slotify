import React, { useState } from 'react'
import "../../style/style.css";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from "react-router-dom";
const Login = () => {
    const navigate=useNavigate();
    const {login}=useAuth();
    const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const location = useLocation();

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

    try {
      setLoading(true);

      const data = await login(formData);

      const redirectTo = location.state?.redirectTo;
const bookingData = location.state?.bookingData;

if (redirectTo) {
  navigate(redirectTo, {
    state: bookingData,
    replace: true,
  });
} else if (data.user.role === "CUSTOMER") {
  navigate("/");
} else if (data.user.role === "OWNER") {
  navigate("/owner/dashboard");
} else if (data.user.role === "ADMIN") {
  navigate("/admin/dashboard");
} else {
  setError("Invalid user role.");
}
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
        "Invalid email or password."
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
      <span style={{ color: 'var(--c-accent)' }}>●</span> PITCH
    </div>
    <div className="auth-visual__quote">
      "Booked our Sunday match slot in under a minute. No more calling the ground owner five times to confirm."
      <div style={{ marginTop: '16px', fontSize: '.9rem', opacity: 0.8 }}>
        — Rohan Patel, weekend league captain
      </div>
    </div>
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px' }}>
      <div>
        <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'block' }}>120+</b>
        <span style={{ fontSize: '.8rem', opacity: 0.75 }}>Grounds listed</span>
      </div>
      <div>
        <b style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', display: 'block' }}>18k+</b>
        <span style={{ fontSize: '.8rem', opacity: 0.75 }}>Matches booked</span>
      </div>
    </div>
  </div>
  <div className="auth-card-wrap">
    <div className="auth-card">
      <Link to={"/"} className="eyebrow" style={{ marginBottom: '24px' }}>BACK TO HOME</Link>
      <h1>Welcome back</h1>
      <p className="sub">Log in to book your next match, on your terms.</p>
    
      <form onSubmit={handleSubmit}  novalidate>
        <div className="field">
          <label>Email address</label>
          <input type="email" id="email" name="email" placeholder="tirth@gmail.com" value={formData.email} onChange={handleChange} required/>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required/>
        </div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
  <label className="checkbox-row">
    <input type="checkbox" name="remember" /> Remember me
  </label>
  <a href="forgot-password.html" style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--c-green)' }}>
    Forgot password?
  </a>
</div>
        <button type="submit" disabled={loading} className="btn btn--primary btn--block btn--lg">  {loading ? "Logging in..." : "Log In"}</button>
      </form>
 {error && <p>{error}</p>}
      <div className="divider">OR</div>
      <button type="button" className="btn btn--outline btn--block">Continue with Google</button>

      <p className="auth-switch">New to Pitch? <Link to={"/register"}>Create an account</Link></p>
    </div>
  </div>
</div>
    </>
  )
}

export default Login