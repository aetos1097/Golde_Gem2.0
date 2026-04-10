import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const columns = (modules) => [
  { key: 'code', label: 'Codigo' },
  { key: 'name', label: 'Nombre' },
  { key: 'formReference', label: 'Referencia' },
  { key: 'route', label: 'Ruta', render: (row) => row.route || '-' },
  { key: 'moduleId', label: 'Modulo', render: (row) => modules.find((m) => m.id === row.moduleId)?.name || '-' },
  { key: 'displayOrder', label: 'Orden' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
];

export default function FormsPage() {
  const [items, setItems] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [formsRes, modulesRes] = await Promise.all([adminApi.getAllForms(), adminApi.getAllModules()]);
      setItems(formsRes.data || []);
      setModules(modulesRes.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'FORM_USERS' },
    { name: 'formReference', label: 'Referencia', type: 'text', required: true, placeholder: 'UsersForm' },
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Formulario de Usuarios' },
    { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion' },
    { name: 'route', label: 'Ruta', type: 'text', placeholder: '/admin/usuarios' },
    { name: 'moduleId', label: 'Modulo', type: 'select', required: true, options: modules.map((m) => ({ value: m.id, label: m.name })) },
    { name: 'displayOrder', label: 'Orden', type: 'number', placeholder: '0' },
  ];

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (editing) {
        await adminApi.updateForm(editing.id, values);
      } else {
        await adminApi.createForm(values);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(editing ? 'Formulario actualizado' : 'Formulario creado');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete('Confirmar eliminación', `Eliminar formulario "${row.name}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteForm(row.id);
      load();
      toastSuccess('Formulario eliminado');
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
        columns={columns(modules)}
        data={items}
        loading={loading}
        onEdit={(row) => { setEditing(row); setFormError(''); setModalOpen(true); }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Formulario' : 'Crear Formulario'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />

    </div>
  );
}
