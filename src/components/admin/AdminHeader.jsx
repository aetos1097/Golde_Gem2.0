import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, ArrowLeft } from 'lucide-react';

export default function AdminHeader({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-black/5 transition" style={{ color: 'var(--text-primary)' }}>
          <Menu size={20} />
        </button>
        <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition" style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Volver al Sitio</span>
        </Link>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-mid to-emerald-dark flex items-center justify-center text-gold-light text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {user?.username}
          </span>
        </div>
      </div>
    </header>
  );
}
