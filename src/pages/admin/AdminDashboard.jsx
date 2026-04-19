import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Package, ShoppingCart, CreditCard, DollarSign, Shield, Zap, Tag, MessageCircle, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/client';

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
}

function KpiCard({ icon: Icon, label, value, sub, to, tone = 'gold' }) {
  const tones = {
    gold: { bg: 'rgba(212,164,40,0.1)', fg: 'var(--gold)' },
    green: { bg: 'rgba(34,197,94,0.1)', fg: '#22c55e' },
    red: { bg: 'rgba(239,68,68,0.1)', fg: '#ef4444' },
    blue: { bg: 'rgba(59,130,246,0.1)', fg: '#3b82f6' },
    amber: { bg: 'rgba(245,158,11,0.1)', fg: '#f59e0b' },
  };
  const style = tones[tone] || tones.gold;
  const content = (
    <div
      className="rounded-2xl p-5 border transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: style.bg, color: style.fg }}>
          <Icon size={22} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function SectionTitle({ children }) {
  return (
    <h3 className="font-display text-sm font-semibold uppercase tracking-wider mt-8 mb-4" style={{ color: 'var(--text-muted)' }}>
      {children}
    </h3>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Error al cargar estadísticas');
      }
      setLoading(false);
    };
    load();
  }, []);

  const v = (n) => loading ? '...' : (n ?? 0).toLocaleString('es-CO');

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Bienvenido, {user?.username}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Panel de administración de Golden Gems</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <SectionTitle>Negocio</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Ingresos totales"
          value={loading ? '...' : formatCurrency(stats?.totalRevenue)}
          sub="Pagos completados"
          tone="green"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Órdenes totales"
          value={v(stats?.totalOrders)}
          sub={`${v(stats?.paidOrders)} pagadas · ${v(stats?.pendingOrders)} pendientes`}
          tone="gold"
        />
        <KpiCard
          icon={CreditCard}
          label="Pagos"
          value={v(stats?.totalPayments)}
          sub={`${v(stats?.completedPayments)} completados`}
          tone="blue"
        />
        <KpiCard
          icon={Building2}
          label="Empresas activas"
          value={v(stats?.activeCompanies)}
          sub={`${v(stats?.totalCompanies)} totales`}
          to="/admin/empresas"
          tone="gold"
        />
      </div>

      <SectionTitle>Estado de órdenes</SectionTitle>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Clock} label="Pendientes" value={v(stats?.pendingOrders)} tone="amber" />
        <KpiCard icon={CheckCircle} label="Pagadas" value={v(stats?.paidOrders)} tone="blue" />
        <KpiCard icon={Truck} label="Entregadas" value={v(stats?.deliveredOrders)} tone="green" />
        <KpiCard icon={XCircle} label="Canceladas" value={v(stats?.cancelledOrders)} tone="red" />
      </div>

      <SectionTitle>Catálogo y usuarios</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Package}
          label="Productos activos"
          value={v(stats?.activeProducts)}
          sub={`${v(stats?.totalProducts)} totales`}
          to="/admin/productos"
          tone="gold"
        />
        <KpiCard
          icon={Tag}
          label="Tipos de producto"
          value={v(stats?.totalProductTypes)}
          to="/admin/tipos-producto"
          tone="gold"
        />
        <KpiCard
          icon={Users}
          label="Usuarios activos"
          value={v(stats?.activeUsers)}
          sub={`${v(stats?.totalUsers)} registrados`}
          to="/admin/usuarios"
          tone="blue"
        />
        <KpiCard
          icon={MessageCircle}
          label="Conversaciones"
          value={v(stats?.totalConversations)}
          tone="gold"
        />
      </div>

      <SectionTitle>Seguridad</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={Shield} label="Roles" value={v(stats?.totalRoles)} to="/admin/roles" tone="gold" />
        <KpiCard icon={Zap} label="Acciones" value={v(stats?.totalActions)} to="/admin/acciones" tone="gold" />
        <KpiCard icon={Tag} label="Tipos de acción" value={v(stats?.totalActionTypes)} to="/admin/acciones" tone="gold" />
      </div>
    </div>
  );
}
