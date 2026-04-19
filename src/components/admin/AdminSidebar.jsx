import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Shield, LayoutGrid, FileText, Zap, FileType, MapPin, Phone, Building2, Package, Tag, ChevronLeft, ChevronRight, X } from 'lucide-react';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/personas', icon: UserCog, label: 'Personas' },
  { to: '/admin/roles', icon: Shield, label: 'Roles' },
  { to: '/admin/modulos', icon: LayoutGrid, label: 'Modulos' },
  { to: '/admin/formularios', icon: FileText, label: 'Formularios' },
  { to: '/admin/acciones', icon: Zap, label: 'Acciones' },
  { to: '/admin/tipos-documento', icon: FileType, label: 'Tipos Documento' },
  { to: '/admin/regiones', icon: MapPin, label: 'Regiones' },
  { to: '/admin/contactos', icon: Phone, label: 'Contactos' },
  { to: '/admin/empresas', icon: Building2, label: 'Empresas' },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/tipos-producto', icon: Tag, label: 'Tipos Producto' },
];

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <img src="/Logo/logo.PNG" alt="Logo" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>GOLDEN</span>
            <span className="font-display text-sm font-light" style={{ color: 'var(--gold)' }}> GEMS</span>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Admin</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'admin-link-active' : 'hover:bg-black/5'}`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(212,164,40,0.1)' : undefined,
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center py-4 border-t transition hover:bg-black/5"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col border-r flex-shrink-0 transition-all duration-300 sticky top-0 self-start h-screen overflow-y-auto"
        style={{
          width: collapsed ? 64 : 256,
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside
            className="absolute left-0 top-0 h-full w-64 flex flex-col"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <button onClick={onMobileClose} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
