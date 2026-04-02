import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, EyeOff, KeyRound } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertSuccess, alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const columns = [
  { key: 'email', label: 'Email', render: (row) => row.email || '-' },
  { key: 'username', label: 'Usuario', render: (row) => row.username || '-' },
  {
    key: 'name',
    label: 'Nombre Completo',
    render: (row) => [row.firstName, row.secondName, row.firstLastName, row.secondLastName].filter(Boolean).join(' ') || '-',
  },
  {
    key: 'document',
    label: 'Documento',
    render: (row) => row.documentNumber ? `${row.documentTypeName || ''} ${row.documentNumber}`.trim() : '-',
  },
  {
    key: 'roles',
    label: 'Roles',
    render: (row) =>
      row.roles?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r) => (
            <span
              key={r}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(212,164,40,0.15)', color: 'var(--gold)' }}
            >
              {r}
            </span>
          ))}
        </div>
      ) : (
        '-'
      ),
  },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  { key: 'createdAt', label: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
];

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [roles, setRoles] = useState([]);
  const [docTypes, setDocTypes] = useState([]);

  // Detail / password modal
  const [detailUser, setDetailUser] = useState(null);
  const [showHash, setShowHash] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, docTypesRes] = await Promise.all([
        adminApi.getAllUsersDetailed(),
        adminApi.getAllRoles(),
        adminApi.getAllDocTypes(),
      ]);
      setItems(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setDocTypes(docTypesRes.data || []);
    } catch (err) { console.error('Error loading admin users:', err); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createFields = [
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'usuario@email.com' },
    { name: 'username', label: 'Usuario', type: 'text', required: true, placeholder: 'nombre_usuario' },
    { name: 'password', label: 'Contrasena', type: 'password', required: true, placeholder: 'Minimo 8 caracteres' },
    { name: 'firstName', label: 'Primer Nombre', type: 'text', required: true },
    { name: 'secondName', label: 'Segundo Nombre', type: 'text' },
    { name: 'firstLastName', label: 'Primer Apellido', type: 'text', required: true },
    { name: 'secondLastName', label: 'Segundo Apellido', type: 'text' },
    { name: 'documentTypeId', label: 'Tipo Documento', type: 'select', required: true, options: docTypes.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })) },
    { name: 'documentNumber', label: 'Numero Documento', type: 'text', required: true },
    { name: 'roleIds', label: 'Roles', type: 'multicheck', options: roles.map((r) => ({ value: r.id, label: r.name })) },
  ];

  const editFields = [
    { name: 'firstName', label: 'Primer Nombre', type: 'text', required: true },
    { name: 'secondName', label: 'Segundo Nombre', type: 'text' },
    { name: 'firstLastName', label: 'Primer Apellido', type: 'text', required: true },
    { name: 'secondLastName', label: 'Segundo Apellido', type: 'text' },
    { name: 'documentNumber', label: 'Numero Documento', type: 'text' },
    { name: 'documentTypeId', label: 'Tipo Documento', type: 'select', options: docTypes.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })) },
    { name: 'roleIds', label: 'Roles', type: 'multicheck', options: roles.map((r) => ({ value: r.id, label: r.name })) },
  ];

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (modalMode === 'edit') {
        const { roleIds, ...personData } = values;
        await adminApi.updateUser(editing.personId || editing.id, personData);
        if (roleIds && roleIds.length > 0) {
          await adminApi.updateUserRoles(editing.userId, { roleIds });
        }
      } else {
        await adminApi.createUser(values);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(modalMode === 'edit' ? 'Usuario actualizado' : 'Usuario creado');
    } catch (err) {
      setFormError(err.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete('Confirmar eliminacion', `Eliminar usuario "${row.firstName} ${row.firstLastName}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteUser(row.personId || row.id);
      load();
      toastSuccess('Usuario eliminado');
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar usuario');
    }
  };

  const openCreate = () => { setEditing(null); setModalMode('create'); setFormError(''); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setModalMode('edit'); setFormError(''); setModalOpen(true); };

  const openDetail = (row) => {
    setDetailUser(row);
    setShowHash(false);
    setChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      alertError('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      alertError('Error', 'Las contraseñas no coinciden');
      return;
    }

    setPasswordLoading(true);
    try {
      await adminApi.changePassword(detailUser.userId, { newPassword, confirmPassword });
      alertSuccess('Listo', 'Contraseña actualizada exitosamente');
      setChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      load();
    } catch (err) {
      alertError('Error', err.message || 'Error al cambiar la contraseña');
    }
    setPasswordLoading(false);
  };

  const truncateHash = (hash) => {
    if (!hash) return '-';
    return hash.length > 30 ? hash.substring(0, 30) + '...' : hash;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{items.length} registros</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
        >
          <Plus size={16} /> Crear
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={items}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={openDetail}
      />

      {/* Detail Modal */}
      {detailUser && (
        <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDetailUser(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setDetailUser(null)} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-muted)' }}>
              <span className="text-xl">&times;</span>
            </button>

            <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Detalle del Usuario
            </h2>

            {/* User Photo */}
            <div className="flex items-center gap-4 mb-6">
              {detailUser.photoUrl ? (
                <img src={detailUser.photoUrl} alt="foto" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: 'var(--gold)' }} />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--color-emerald-mid), var(--color-emerald-dark))', color: 'var(--color-gold-light)' }}>
                  {detailUser.firstName?.[0]?.toUpperCase() || detailUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {[detailUser.firstName, detailUser.secondName, detailUser.firstLastName, detailUser.secondLastName].filter(Boolean).join(' ')}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{detailUser.email}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoField label="Email" value={detailUser.email} />
              <InfoField label="Usuario" value={detailUser.username} />
              <InfoField label="Primer Nombre" value={detailUser.firstName} />
              <InfoField label="Segundo Nombre" value={detailUser.secondName || '-'} />
              <InfoField label="Primer Apellido" value={detailUser.firstLastName} />
              <InfoField label="Segundo Apellido" value={detailUser.secondLastName || '-'} />
              <InfoField label="Tipo Documento" value={detailUser.documentTypeName || '-'} />
              <InfoField label="Numero Documento" value={detailUser.documentNumber || '-'} />
              <InfoField label="Roles" value={detailUser.roles?.join(', ') || '-'} />
              <InfoField label="Estado" value={detailUser.isActive ? 'Activo' : 'Inactivo'} />
              <InfoField label="Creado" value={new Date(detailUser.createdAt).toLocaleString()} />
              <InfoField label="User ID" value={detailUser.userId} small />
            </div>

            {/* Password Section */}
            <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Contraseña (Hash)
                </h3>
                <button
                  onClick={() => setShowHash(!showHash)}
                  className="flex items-center gap-1 text-xs transition hover:opacity-80"
                  style={{ color: 'var(--gold)' }}
                >
                  {showHash ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showHash ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div
                className="p-3 rounded-lg text-xs font-mono break-all mb-3"
                style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }}
              >
                {showHash ? detailUser.passwordHash : truncateHash(detailUser.passwordHash)}
              </div>

              {!changingPassword ? (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
                  style={{ background: 'rgba(212,164,40,0.15)', color: 'var(--gold)', border: '1px solid var(--gold)' }}
                >
                  <KeyRound size={14} /> Cambiar Contraseña
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Nueva Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-input text-sm"
                      placeholder="Minimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-input text-sm"
                      placeholder="Repetir contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
                    >
                      {passwordLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => { setChangingPassword(false); setNewPassword(''); setConfirmPassword(''); }}
                      className="px-4 py-2 rounded-lg text-sm transition hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={modalMode === 'edit' ? 'Editar Usuario' : 'Crear Usuario'}
        fields={modalMode === 'edit' ? editFields : createFields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

    </div>
  );
}

function InfoField({ label, value, small }) {
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`${small ? 'text-xs font-mono' : 'text-sm'}`} style={{ color: 'var(--text-primary)' }}>
        {value || '-'}
      </p>
    </div>
  );
}
