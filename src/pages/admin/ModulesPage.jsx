import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const fields = [
  { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'ADMIN_SECURITY' },
  { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Seguridad' },
  { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion del modulo' },
  { name: 'icon', label: 'Icono', type: 'text', placeholder: 'shield' },
  { name: 'displayOrder', label: 'Orden', type: 'number', placeholder: '0' },
];

const columns = [
  { key: 'code', label: 'Codigo' },
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripcion', render: (row) => row.description || '-' },
  { key: 'icon', label: 'Icono', render: (row) => row.icon || '-' },
  { key: 'displayOrder', label: 'Orden' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
];

export default function ModulesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllModules();
      setItems(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (editing) {
        await adminApi.updateModule(editing.id, values);
      } else {
        await adminApi.createModule(values);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(editing ? 'Módulo actualizado' : 'Módulo creado');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete('Confirmar eliminación', `Eliminar módulo "${row.name}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteModule(row.id);
      load();
      toastSuccess('Módulo eliminado');
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{items.length} registros</p>
        <button
          onClick={() => { setEditing(null); setFormError(''); setModalOpen(true); }}
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
        onEdit={(row) => { setEditing(row); setFormError(''); setModalOpen(true); }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Modulo' : 'Crear Modulo'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

    </div>
  );
}
