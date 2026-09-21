import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

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
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Jobs</Link>
          <Link to="/applications" className={location.pathname === '/applications' ? 'active' : ''}>My Applications</Link>
        </nav>
      </div>
      <div className="user-profile">
        <div className="avatar">OP</div>
        <span>Om Prakash</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-muted)' }}>
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </header>
  );
};

export default Header;
