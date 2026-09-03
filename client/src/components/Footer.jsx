import React from 'react'
import "../style/style.css"
import { Link } from 'react-router-dom'
const Footer = () => {
  return (
   <footer className="footer" id="contact">
  <div className="container">
    <div className="footer__grid">
      <div>
        <div className="footer__brand">
          <span style={{ color: 'var(--c-accent)' }}>●</span> SLOTIFY
        </div>
        <p style={{ marginTop: '12px', fontSize: '.88rem', maxWidth: '280px' }}>
          The easiest way to find and book cricket turfs near you.
        </p>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><Link to={"/"}>Find Grounds</Link></li>
          <li><Link to={"/login"}>List Your Ground</Link></li>
         
        </ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul>
          <li><Link to={"/construction"}>Help Center</Link></li>
          <li><Link to={"/construction"}>Cancellation Policy</Link></li>
          <li><Link to={"/construction"}>Contact Us</Link></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><Link to={"/construction"}>About</Link></li>
          <li><Link to={"/construction"}>Terms</Link></li>
          <li><Link to={"/construction"}>Privacy</Link></li>
        </ul>
      </div>
    </div>
    <div className="footer__bottom">
      <span>© 2026 SLOTIFY. All rights reserved.</span>
      <span>Book Easily ,anywhere.</span>
    </div>
  </div>
</footer>
  )
}

export default Footer