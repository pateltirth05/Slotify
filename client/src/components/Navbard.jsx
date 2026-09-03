import React from 'react'
import "../style/style.css"
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

const Navbard = () => {
      const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
   <>
  <nav className="navbar">
  <div className="navbar__inner">
    <Link to={"/"} className="navbar__brand">
      SLOTIFY<span className="dot" style={{ marginLeft: '6px' }}></span>
    </Link>
    <ul className="navbar__links">
      <li> <Link
            to="/grounds"
            className={`navbar__link ${
              isActive("/grounds") ? "navbar__link--active" : ""
            }`}
          >Explore Grounds</Link></li>
      {user && user.role === "CUSTOMER" && (
           <li> <Link
              to="/my-bookings"
              className={`navbar__link ${
                isActive("/my-bookings") ? "navbar__link--active" : ""
              }`}
            >
              My Bookings
            </Link></li> 
          )}

         <li><Link
            to="/about"
            className={`navbar__link ${
              isActive("/about") ? "navbar__link--active" : ""
            }`}
          >
            About Us
          </Link></li> 
    </ul>
    <div className="navbar__actions">
        {!user?( 
    <>
    <Link to={"/login"} className="btn btn--ghost btn--sm">Log In</Link>
      <Link to={"/register"} className="btn btn--primary btn--sm">Sign Up</Link>
       </>  
    ):(
             <>
             

              <div className="navbar__actions">
  {user && (
    <Link to="/profile" className="navbar__avatar">
      {user.name
        ? user.name
            .split(" ")
            .map((part) => part.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "U"}
    </Link>
  )}
</div>
            </>
          )
}
    </div>
  </div>
</nav>
   </>
  )
}

export default Navbard