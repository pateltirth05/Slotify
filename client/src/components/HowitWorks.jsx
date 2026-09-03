import React from 'react'

const HowitWorks = () => {
  return (
   <section
  className="section"
  id="how"
  style={{
    background: '#fff',
    borderTop: '1px solid var(--c-line)',
    borderBottom: '1px solid var(--c-line)',
  }}
>
  <div className="container">
    <div className="eyebrow" style={{ justifyContent: 'center' }}>
      THREE STEPS
    </div>
    <h2 style={{ textAlign: 'center', margin: '8px 0 40px' }}>
      Booking a ground is this simple
    </h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--c-success-bg)',
            color: 'var(--c-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            margin: '0 auto 16px',
          }}
        >
          1
        </div>
        <h3>Search the Ground</h3>
        <p style={{ color: 'var(--c-ink-soft)', marginTop: '8px' }}>
          Filter grounds by location, date and time to see what's free.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--c-success-bg)',
            color: 'var(--c-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            margin: '0 auto 16px',
          }}
        >
          2
        </div>
        <h3>Pick your slot</h3>
        <p style={{ color: 'var(--c-ink-soft)', marginTop: '8px' }}>
          Choose an open time slot and confirm your match details.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--c-success-bg)',
            color: 'var(--c-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            margin: '0 auto 16px',
          }}
        >
          3
        </div>
        <h3>Pay &amp; play</h3>
        <p style={{ color: 'var(--c-ink-soft)', marginTop: '8px' }}>
          Secure your booking with instant payment and show up to play.
        </p>
      </div>
    </div>
  </div>
</section>
  )
}

export default HowitWorks