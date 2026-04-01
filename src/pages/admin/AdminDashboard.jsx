import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, LayoutGrid, FileText, Zap, FileType } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

const cards = [
  { key: 'users', label: 'Usuarios', icon: Users, to: '/admin/usuarios', fetch: () => adminApi.getAllUsers() },
  { key: 'roles', label: 'Roles', icon: Shield, to: '/admin/roles', fetch: () => adminApi.getAllRoles() },
  { key: 'modules', label: 'Modulos', icon: LayoutGrid, to: '/admin/modulos', fetch: () => adminApi.getAllModules() },
  { key: 'forms', label: 'Formularios', icon: FileText, to: '/admin/formularios', fetch: () => adminApi.getAllForms() },
  { key: 'actions', label: 'Acciones', icon: Zap, to: '/admin/acciones', fetch: () => adminApi.getAllActions() },
  { key: 'docTypes', label: 'Tipos Documento', icon: FileType, to: '/admin/tipos-documento', fetch: () => adminApi.getAllDocTypes() },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      const results = {};
      await Promise.allSettled(
        cards.map(async (card) => {
          try {
            const res = await card.fetch();
            results[card.key] = res.data?.length ?? 0;
          } catch {
            results[card.key] = '-';
          }
        })
      );
      setCounts(results);
      setLoading(false);
    };
    loadCounts();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Bienvenido, {user?.username}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Panel de administracion de Golden Gems</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ key, label, icon: Icon, to }) => (
          <Link
            key={key}
            to={to}
            className="rounded-2xl p-6 border transition-all hover:-translate-y-1"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,164,40,0.1)', color: 'var(--gold)' }}>
                <Icon size={24} />
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {loading ? '...' : counts[key]}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
