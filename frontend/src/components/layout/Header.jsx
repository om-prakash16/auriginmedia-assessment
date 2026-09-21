import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '3rem' }}>
        <Link to="/" className="header-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
          </svg>
          JobFlow
        </Link>
        <nav className="nav-links">
          {(!user || user.role !== 'admin') && (
            <>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Jobs</Link>
              <Link to="/applications" className={location.pathname === '/applications' ? 'active' : ''}>My Applications</Link>
            </>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin Dashboard</Link>
          )}
        </nav>
      </div>
      <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <div className="avatar" style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontWeight: '500' }}>{user.name}</span>
            <button 
              onClick={logout} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginLeft: '0.5rem' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>Log In</Link>
            <Link to="/signup" style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '500' }}>Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
