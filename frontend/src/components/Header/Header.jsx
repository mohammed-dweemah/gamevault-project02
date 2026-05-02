import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="header">
      <nav className="header__nav">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">◈</span>
          <span className="header__logo-text">GameVault</span>
        </Link>

        <div className="header__links">
          <Link to="/" className={`header__link ${isActive('/') ? 'header__link--active' : ''}`}>
            Library
          </Link>
          <Link to="/about" className={`header__link ${isActive('/about') ? 'header__link--active' : ''}`}>
            About
          </Link>
          {user && (
            <>
              <Link to="/my-games" className={`header__link ${isActive('/my-games') ? 'header__link--active' : ''}`}>
                My Games
              </Link>
              <Link to="/add-game" className={`header__link header__link--add ${isActive('/add-game') ? 'header__link--active' : ''}`}>
                + Add Game
              </Link>
            </>
          )}
        </div>

        <div className="header__auth">
          {user ? (
            <div className="header__user">
              <span className="header__user-name">👤 {user.name}</span>
              <button className="header__logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={`header__btn header__btn--ghost ${isActive('/login') ? 'header__btn--active' : ''}`}>
                Sign In
              </Link>
              <Link to="/register" className="header__btn header__btn--primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="header__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="header__mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Library</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
          {user ? (
            <>
              <Link to="/my-games" onClick={() => setMenuOpen(false)}>My Games</Link>
              <Link to="/add-game" onClick={() => setMenuOpen(false)}>+ Add Game</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
