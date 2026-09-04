import React from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Constructions = () => {
  return (
   
    <div className='admin-shell'>
      <AdminSidebar/>
    
    <main className="not-found-wrapper" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div >
        {/* Visual Graphic */}
        <div style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <span style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(5rem, 15vw, 8rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: 'var(--c-accent, #10b981)',
            opacity: 0.15,
            letterSpacing: '-2px'
          }}>
            404
          </span>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--c-accent, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
            }}>
              <span style={{ fontSize: '2rem', color: '#fff' }}>🏏</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
          fontWeight: 700,
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          Out of Bounds!
        </h1>
        
        <p style={{
          fontSize: '1rem',
          opacity: 0.8,
          marginBottom: '32px',
          lineHeight: 1.6
        }}>
          The page you're looking for was caught in the slips or is currently under maintenance. Let’s get you back on the pitch.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/admin/dashboard" className="btn btn--primary btn--lg">
            Back to Home
          </Link>
          <a href="#contact" className="btn btn--ghost btn--lg">
            Report Issue
          </a>
        </div>
      </div>
    </main>
    </div>
  );
};

export default Constructions;