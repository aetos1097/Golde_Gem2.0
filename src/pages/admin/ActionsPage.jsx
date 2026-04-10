import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { toastSuccess, alertError } from '../../utils/alerts';

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'code', label: 'Codigo' },
  { key: 'description', label: 'Descripcion', render: (row) => row.description || '-' },
  { key: 'actionTypeCode', label: 'Tipo', render: (row) => row.actionTypeCode || '-' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
];

export default function ActionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionTypes, setActionTypes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllActions();
      const data = res.data || [];
      setItems(data);
      // Extract unique action types from existing data
      const types = new Map();
      data.forEach((a) => { if (a.actionTypeId) types.set(a.actionTypeId, a.actionTypeCode || a.actionTypeDescription); });
      setActionTypes([...types.entries()].map(([value, label]) => ({ value, label })));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Crear Usuario' },
    { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'CREATE_USER' },
    { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion de la accion' },
    { name: 'actionTypeId', label: 'Tipo de Accion', type: 'select', required: true, options: actionTypes },
  ];

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      await adminApi.createAction(values);
      setModalOpen(false);
      load();
      toastSuccess('Acción creada');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
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
        title="Crear Accion"
        fields={fields}
        initialValues={{}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
