import React from 'react';
import { Link } from 'react-router-dom';
import '../style/about.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="eyebrow">OUR MISSION</div>
          <h1>
            Connecting players with the <em>perfect pitch</em>, every single day.
          </h1>
          <p className="lead">
            We are building the digital backbone for local sports infrastructure — making ground booking as seamless as ordering food or booking a ride.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story section">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__content">
              <div className="eyebrow">WHY WE STARTED</div>
              <h2>No more endless phone calls or double-booked slots.</h2>
              <p>
                As weekend cricketers ourselves, we spent hours every week calling local ground owners, tracking down slot availabilities over WhatsApp, and showing up to turfs only to find out they were double-booked.
              </p>
              <p>
                In late 2024, we set out to build Pitch to solve this exact problem. Today, Pitch connects thousands of players across major cities directly with verified sports arenas, box cricket fields, and full-scale turf grounds.
              </p>
            </div>
            <div className="about-story__media">
              <img
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80"
                alt="Floodlit cricket pitch at night"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="about-stats section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__number">120+</div>
              <div className="stat-card__label">Verified Grounds</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__number">18,000+</div>
              <div className="stat-card__label">Matches Booked</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__number">15+</div>
              <div className="stat-card__label">Cities Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__number">4.8★</div>
              <div className="stat-card__label">Community Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-values section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">WHAT DRIVES US</div>
            <h2>Built on simple principles</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-card__icon">⚡</div>
              <h3>Instant Confirmation</h3>
              <p>Real-time slot tracking ensures your booking is locked in instantly. Zero manual confirmation delays.</p>
            </div>
            <div className="value-card">
              <div className="value-card__icon">🛡️</div>
              <h3>Verified Venues</h3>
              <p>Every listed ground undergoes physical or manual verification to ensure clean facilities and accurate photos.</p>
            </div>
            <div className="value-card">
              <div className="value-card__icon">🤝</div>
              <h3>Empowering Owners</h3>
              <p>We provide ground managers with modern tools to manage schedules, track revenue, and grow their businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to play?</h2>
            <p>Find open grounds near you and lock in your next match slot in under a minute.</p>
            <div className="cta-actions">
              <Link to="/grounds" className="btn btn--primary btn--lg">
                Explore Grounds
              </Link>
              <Link to="/signup" className="btn btn--outline btn--lg">
                List Your Ground
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;