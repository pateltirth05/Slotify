import React from 'react'

const Hero = () => {
  return (
    <header className="hero">
  <div className="container">
    <div className="hero__grid">
      <div>
        <div className="eyebrow">CRICKET GROUNDS, BOOKED SIMPLY</div>
        <h1>
          Find your next <em>pitch</em> in under a minute
        </h1>
        <p className="lead">
          Browse verified turfs near you, check live slot availability, and lock in your match — no phone calls, no waiting on owners to reply.
        </p>
        <div style={{ display: 'flex', gap: '14px' }}>
          <a href="#grounds" className="btn btn--primary btn--lg">
            Browse Grounds
          </a>
          <a href="signup.html" className="btn btn--outline btn--lg">
            List Your Ground
          </a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat">
            <b>120+</b>
            <span>Grounds listed</span>
          </div>
          <div className="hero__stat">
            <b>18,400</b>
            <span>Matches booked</span>
          </div>
          <div className="hero__stat">
            <b>4.8★</b>
            <span>Average rating</span>
          </div>
        </div>
      </div>
      <div className="hero__art">
        <img
          src="https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&q=80"
          alt="Floodlit cricket turf at dusk"
        />
        <div className="hero__art-badge">
          <div>
            <div style={{ fontWeight: 800, fontSize: '.9rem' }}>
              Green Valley Turf
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--c-ink-faint)' }}>
              Available today, 6–10 PM
            </div>
          </div>
          <span className="badge badge--upcoming">Open now</span>
        </div>
      </div>
    </div>
  </div>
</header>
  )
}

export default Hero