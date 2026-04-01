import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ requiredRole }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (requiredRole === 'Admin' && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
        <h1 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>403</h1>
        <p style={{ color: 'var(--text-muted)' }}>No tienes permisos para acceder a esta seccion.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <Outlet />;
}
