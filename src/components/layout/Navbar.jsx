import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/client';

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) { setPhotoUrl(null); return; }
    profileApi.getMe()
      .then((res) => setPhotoUrl(res.data?.photoUrl || null))
      .catch(() => setPhotoUrl(null));
  }, [user, location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-user-menu]')) setUserMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Inicio', icon: homeIcon },
    { to: '/productos', label: 'Productos', icon: gemIcon },
    ...(user ? [{ to: '/chat', label: 'Mis Chats', icon: chatIcon }] : []),
    ...(user ? [{ to: '/mis-ordenes', label: 'Mis Ordenes', icon: orderIcon }] : []),
    ...(user ? [{ to: '/mi-empresa', label: 'Mi Empresa', icon: companyIcon }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Panel Admin', icon: adminIcon }] : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${scrolled ? 'shadow-lg' : ''}`}
        style={{
          background: scrolled ? 'var(--nav-bg)' : 'var(--nav-bg)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          {/* Hamburger - LEFT on mobile */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="0" y1="1" x2="22" y2="1" />
              <line x1="0" y1="8" x2="15" y2="8" />
              <line x1="0" y1="15" x2="19" y2="15" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/Logo/logo.PNG"
              alt="Golden Gems"
              className="w-11 h-11 md:w-13 md:h-13 rounded-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <span className="font-display text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>GOLDEN</span>
              <span className="font-display text-lg font-light tracking-wide" style={{ color: 'var(--gold)' }}> GEMS</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { to: '/', label: 'Inicio' },
              { to: '/productos', label: 'Productos' },
              ...(user ? [{ to: '/chat', label: 'Mis Chats' }] : []),
              ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="nav-link text-sm"
                style={isActive(to) ? { color: 'var(--gold)' } : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full transition hover:ring-2"
                  style={{ '--tw-ring-color': 'var(--gold)' }}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-emerald-mid), var(--color-emerald-dark))',
                        color: 'var(--color-gold-light)',
                      }}
                    >
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </span>
                </button>

                {/* Desktop dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl border py-2 overflow-hidden hidden md:block"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--card-shadow-hover)',
                    }}
                  >
                    <div className="px-4 py-2.5 border-b mb-1" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--gold)' }}>
                        {user.username}
                      </p>
                    </div>
                    {[
                      { to: '/perfil', label: 'Mi Perfil' },
                      { to: '/chat', label: 'Conversaciones' },
                      { to: '/mis-ordenes', label: 'Mis Ordenes' },
                      { to: '/mi-empresa', label: 'Mi Empresa' },
                      ...(isAdmin ? [{ to: '/admin', label: 'Panel Admin', gold: true }] : []),
                    ].map(({ to, label, gold }) => (
                      <Link
                        key={to}
                        to={to}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: gold ? 'var(--gold)' : 'var(--text-secondary)' }}
                        onClick={() => setUserMenuOpen(false)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,164,40,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Cerrar Sesion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Ingresar
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-5 py-2 text-sm font-semibold rounded-full cursor-pointer transition hover:shadow-lg hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-emerald-mid), var(--color-emerald-dark))',
                    color: 'var(--color-gold-light)',
                  }}
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" />
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MOBILE DRAWER — slides from LEFT                   */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 md:hidden transition-all duration-500"
        style={{
          background: mobileOpen ? 'rgba(4,18,12,0.65)' : 'transparent',
          backdropFilter: mobileOpen ? 'blur(4px)' : 'none',
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        onClick={closeMobile}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 left-0 h-full z-50 md:hidden flex flex-col overflow-hidden"
        style={{
          width: 300,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          borderRight: '1px solid var(--border)',
          boxShadow: mobileOpen ? '8px 0 40px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Drawer header */}
        <div className="relative px-6 pt-6 pb-5">
          {/* Close button */}
          <button
            onClick={closeMobile}
            className="absolute top-5 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,164,40,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            aria-label="Cerrar menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="2" x2="16" y2="16" />
              <line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          </button>

          {/* Brand */}
          <Link to="/" onClick={closeMobile} className="flex items-center gap-3">
            <img src="/Logo/logo.PNG" alt="Golden Gems" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <span className="font-display text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>GOLDEN</span>
              <span className="font-display text-lg font-light tracking-wide" style={{ color: 'var(--gold)' }}> GEMS</span>
              <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Joyeria Premium
              </p>
            </div>
          </Link>

          {/* Gold accent line */}
          <div
            className="mt-5 h-px w-full"
            style={{
              background: 'linear-gradient(90deg, var(--gold) 0%, transparent 100%)',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          {navLinks.map(({ to, label, icon }, i) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="flex items-center gap-3.5 px-3 py-3 rounded-xl mb-1 transition-all duration-200"
                style={{
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'rgba(212,164,40,0.08)' : 'transparent',
                  animationDelay: `${i * 60}ms`,
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(212,164,40,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    background: active ? 'rgba(212,164,40,0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? 'var(--gold)' : 'var(--text-muted)',
                  }}
                >
                  {icon}
                </span>
                <span className="text-sm tracking-wide">{label}</span>
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section — user or auth buttons */}
        <div className="px-4 pb-6 pt-2">
          {/* Subtle divider */}
          <div
            className="h-px w-full mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)',
            }}
          />

          {user ? (
            <div>
              {/* User profile row */}
              <Link
                to="/perfil"
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,164,40,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-emerald-mid), var(--color-emerald-dark))',
                      color: 'var(--color-gold-light)',
                    }}
                  >
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.username}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ver perfil</p>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {logoutIcon}
                </span>
                Cerrar Sesion
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => { closeMobile(); onLoginClick(); }}
                className="w-full py-3 rounded-xl text-sm font-medium border transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  background: 'transparent',
                }}
              >
                Ingresar
              </button>
              <button
                onClick={() => { closeMobile(); onRegisterClick(); }}
                className="w-full py-3 rounded-xl text-sm font-semibold transition hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-gold-bright), var(--color-gold))',
                  color: 'var(--color-emerald-deep)',
                }}
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── Icons (compact inline SVGs) ── */
const homeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const gemIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 12 22 2 8.5" />
    <line x1="2" y1="8.5" x2="22" y2="8.5" />
    <line x1="12" y1="2" x2="7" y2="8.5" />
    <line x1="12" y1="2" x2="17" y2="8.5" />
    <line x1="7" y1="8.5" x2="12" y2="22" />
    <line x1="17" y1="8.5" x2="12" y2="22" />
  </svg>
);

const chatIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const orderIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const companyIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const adminIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const logoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
