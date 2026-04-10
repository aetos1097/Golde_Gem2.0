import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const fields = [
  { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'CC' },
  { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Cedula de Ciudadania' },
];

const columns = [
  { key: 'code', label: 'Codigo' },
  { key: 'name', label: 'Nombre' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  { key: 'createdAt', label: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
];

export default function DocumentTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllDocTypes();
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
        await adminApi.updateDocType(editing.id, values);
      } else {
        await adminApi.createDocType(values);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(editing ? 'Tipo actualizado' : 'Tipo creado');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete('Confirmar eliminación', `Eliminar "${row.name}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteDocType(row.id);
      load();
      toastSuccess('Tipo de documento eliminado');
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
        title={editing ? 'Editar Tipo de Documento' : 'Crear Tipo de Documento'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

    </div>
  );
}
