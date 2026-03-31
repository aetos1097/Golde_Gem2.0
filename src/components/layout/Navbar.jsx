import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`nav fixed top-0 left-0 w-full z-50 border-b border-transparent ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/Logo/logo.PNG" alt="Golden Gems Logo" className="w-14 h-14 rounded-full object-cover" />
          <div>
            <span className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>GOLDEN</span>
            <span className="font-display text-xl font-light tracking-wide" style={{ color: 'var(--gold)' }}> GEMS</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link text-sm">Inicio</Link>
          <Link to="/productos" className="nav-link text-sm">Productos</Link>
          {user && <Link to="/chat" className="nav-link text-sm">Mis Chats</Link>}
        </div>

        {/* Right: Icons + Toggle */}
        <div className="flex items-center gap-4">
          {/* User */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-black/5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-mid to-emerald-dark flex items-center justify-center text-gold-light text-sm font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user.username}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl shadow-lg border py-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <Link
                    to="/chat"
                    className="block px-4 py-2 text-sm hover:bg-black/5 transition"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Mis Conversaciones
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition text-red-500"
                  >
                    Cerrar Sesion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-medium rounded-full transition"
                style={{ color: 'var(--text-primary)' }}
              >
                Ingresar
              </button>
              <button
                onClick={onRegisterClick}
                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-emerald-mid to-emerald-dark text-gold-light hover:shadow-lg transition"
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" />

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu fixed top-0 right-0 h-full w-72 z-50 p-8 flex flex-col gap-6 md:hidden ${mobileOpen ? 'open' : ''}`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        <button onClick={() => setMobileOpen(false)} className="self-end p-2" aria-label="Cerrar menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <Link to="/" className="nav-link text-lg" onClick={() => setMobileOpen(false)}>Inicio</Link>
        <Link to="/productos" className="nav-link text-lg" onClick={() => setMobileOpen(false)}>Productos</Link>
        {user && <Link to="/chat" className="nav-link text-lg" onClick={() => setMobileOpen(false)}>Mis Chats</Link>}
        {!user && (
          <>
            <button onClick={() => { setMobileOpen(false); onLoginClick(); }} className="nav-link text-lg text-left">Ingresar</button>
            <button onClick={() => { setMobileOpen(false); onRegisterClick(); }} className="nav-link text-lg text-left">Registrarse</button>
          </>
        )}
      </div>
    </nav>
  );
}
