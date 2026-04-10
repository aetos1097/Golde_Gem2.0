import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const titles = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Usuarios',
  '/admin/roles': 'Roles',
  '/admin/modulos': 'Modulos',
  '/admin/formularios': 'Formularios',
  '/admin/acciones': 'Acciones',
  '/admin/tipos-documento': 'Tipos de Documento',
  '/admin/empresas': 'Empresas',
  '/admin/productos': 'Productos',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = titles[location.pathname] || 'Admin';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
