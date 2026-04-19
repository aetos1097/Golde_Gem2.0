import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { productTypeApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const fields = [
  { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Anillos' },
  { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'RINGS' },
  { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Categoría de anillos...' },
  { name: 'icon', label: 'Icono (opcional)', type: 'text', placeholder: 'ring' },
];

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'code', label: 'Codigo' },
  { key: 'description', label: 'Descripcion', render: (row) => row.description || '-' },
  { key: 'icon', label: 'Icono', render: (row) => row.icon || '-' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  { key: 'createdAt', label: 'Creado', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
];

export default function ProductTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productTypeApi.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.error('Error cargando tipos de producto:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        name: (values.name || '').trim(),
        code: (values.code || '').trim(),
        description: values.description || '',
        icon: values.icon || '',
      };
      if (editing) {
        await productTypeApi.update(editing.id, payload);
      } else {
        await productTypeApi.create(payload);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(editing ? 'Tipo de producto actualizado' : 'Tipo de producto creado');
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
      await productTypeApi.delete(row.id);
      load();
      toastSuccess('Tipo de producto eliminado');
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
        title={editing ? 'Editar Tipo de Producto' : 'Crear Tipo de Producto'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
