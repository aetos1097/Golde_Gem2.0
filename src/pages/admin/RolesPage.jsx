import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { toastSuccess } from '../../utils/alerts';

const fields = [
  { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Admin' },
  { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion del rol' },
];

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'description', label: 'Descripcion', render: (row) => row.description || '-' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  { key: 'createdAt', label: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
];

export default function RolesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllRoles();
      setItems(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      await adminApi.createRole(values);
      setModalOpen(false);
      load();
      toastSuccess('Rol creado');
    } catch (err) {
      setFormError(err.message);
    }
    setFormLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{items.length} registros</p>
        <button
          onClick={() => { setFormError(''); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
        >
          <Plus size={16} /> Crear
        </button>
      </div>

      <AdminTable columns={columns} data={items} loading={loading} />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Crear Rol"
        fields={fields}
        initialValues={{}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
