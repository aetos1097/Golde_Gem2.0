import { useState, useEffect, useCallback } from 'react';
import { Plus, Zap, Tag } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { toastSuccess, alertError, alertConfirmDelete } from '../../utils/alerts';

export default function ActionsPage() {
  const [tab, setTab] = useState('actions');
  const [actions, setActions] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [actionFormLoading, setActionFormLoading] = useState(false);
  const [actionFormError, setActionFormError] = useState('');

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeFormLoading, setTypeFormLoading] = useState(false);
  const [typeFormError, setTypeFormError] = useState('');

  const loadTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const res = await adminApi.getAllActionTypes();
      setActionTypes(res.data || []);
    } catch (err) { console.error('Error loading action types:', err); }
    setLoadingTypes(false);
  }, []);

  const loadActions = useCallback(async () => {
    setLoadingActions(true);
    try {
      const res = await adminApi.getAllActions();
      setActions(res.data || []);
    } catch { /* ignore */ }
    setLoadingActions(false);
  }, []);

  useEffect(() => { loadTypes(); loadActions(); }, [loadTypes, loadActions]);

  const typeOptions = actionTypes.map((t) => ({ value: t.id, label: `${t.code} — ${t.description}` }));

  const actionFields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Crear Usuario' },
    { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'CREATE_USER' },
    { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion de la accion' },
    { name: 'actionTypeId', label: 'Tipo de Accion', type: 'select', required: true, options: typeOptions },
  ];

  const typeFields = [
    { name: 'code', label: 'Codigo', type: 'text', required: true, placeholder: 'READ, WRITE, DELETE...' },
    { name: 'description', label: 'Descripcion', type: 'textarea', required: true, placeholder: 'Operaciones de lectura/consulta' },
  ];

  const actionColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'code', label: 'Codigo' },
    { key: 'description', label: 'Descripcion', render: (row) => row.description || '-' },
    { key: 'actionTypeCode', label: 'Tipo', render: (row) => row.actionTypeCode || '-' },
    { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  ];

  const typeColumns = [
    { key: 'code', label: 'Codigo' },
    { key: 'description', label: 'Descripcion' },
    { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
    { key: 'createdAt', label: 'Creado', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
  ];

  const handleSubmitAction = async (values) => {
    setActionFormLoading(true);
    setActionFormError('');
    try {
      if (editingAction) {
        await adminApi.updateAction(editingAction.id, values);
      } else {
        await adminApi.createAction(values);
      }
      setActionModalOpen(false);
      setEditingAction(null);
      loadActions();
      toastSuccess(editingAction ? 'Acción actualizada' : 'Acción creada');
    } catch (err) {
      setActionFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
    }
    setActionFormLoading(false);
  };

  const handleDeleteAction = async (row) => {
    const result = await alertConfirmDelete('Eliminar acción', `Eliminar "${row.name}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteAction(row.id);
      loadActions();
      toastSuccess('Acción eliminada');
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar');
    }
  };

  const handleSubmitType = async (values) => {
    setTypeFormLoading(true);
    setTypeFormError('');
    try {
      if (editingType) {
        await adminApi.updateActionType(editingType.id, values);
      } else {
        await adminApi.createActionType(values);
      }
      setTypeModalOpen(false);
      setEditingType(null);
      await loadTypes();
      toastSuccess(editingType ? 'Tipo actualizado' : 'Tipo creado');
    } catch (err) {
      setTypeFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
    }
    setTypeFormLoading(false);
  };

  const handleDeleteType = async (row) => {
    const result = await alertConfirmDelete('Eliminar tipo', `Eliminar "${row.code}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteActionType(row.id);
      loadTypes();
      toastSuccess('Tipo eliminado');
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar');
    }
  };

  const openEditAction = (row) => {
    setEditingAction(row);
    setActionFormError('');
    setActionModalOpen(true);
  };

  const openEditType = (row) => {
    setEditingType(row);
    setTypeFormError('');
    setTypeModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setTab('actions')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition"
          style={{
            color: tab === 'actions' ? 'var(--gold)' : 'var(--text-muted)',
            borderBottom: tab === 'actions' ? '2px solid var(--gold)' : '2px solid transparent',
          }}
        >
          <Zap size={16} /> Acciones
        </button>
        <button
          onClick={() => setTab('types')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition"
          style={{
            color: tab === 'types' ? 'var(--gold)' : 'var(--text-muted)',
            borderBottom: tab === 'types' ? '2px solid var(--gold)' : '2px solid transparent',
          }}
        >
          <Tag size={16} /> Tipos de Acción
        </button>
      </div>

      {tab === 'actions' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{actions.length} acciones</p>
            <button
              onClick={() => { setEditingAction(null); setActionFormError(''); setActionModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
            >
              <Plus size={16} /> Crear Acción
            </button>
          </div>
          <AdminTable
            columns={actionColumns}
            data={actions}
            loading={loadingActions}
            onEdit={openEditAction}
            onDelete={handleDeleteAction}
          />
        </>
      )}

      {tab === 'types' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{actionTypes.length} tipos</p>
            <button
              onClick={() => { setEditingType(null); setTypeFormError(''); setTypeModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
            >
              <Plus size={16} /> Crear Tipo
            </button>
          </div>
          <AdminTable
            columns={typeColumns}
            data={actionTypes}
            loading={loadingTypes}
            onEdit={openEditType}
            onDelete={handleDeleteType}
          />
        </>
      )}

      <FormModal
        isOpen={actionModalOpen}
        onClose={() => { setActionModalOpen(false); setEditingAction(null); }}
        title={editingAction ? 'Editar Acción' : 'Crear Acción'}
        fields={actionFields}
        initialValues={editingAction || {}}
        onSubmit={handleSubmitAction}
        loading={actionFormLoading}
        error={actionFormError}
      />

      <FormModal
        isOpen={typeModalOpen}
        onClose={() => { setTypeModalOpen(false); setEditingType(null); }}
        title={editingType ? 'Editar Tipo de Acción' : 'Crear Tipo de Acción'}
        fields={typeFields}
        initialValues={editingType || {}}
        onSubmit={handleSubmitType}
        loading={typeFormLoading}
        error={typeFormError}
      />
    </div>
  );
}
