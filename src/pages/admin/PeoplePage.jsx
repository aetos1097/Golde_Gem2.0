import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, municipalityApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

export default function PeoplePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypes, setDocTypes] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const docTypeMap = useMemo(
    () => Object.fromEntries(docTypes.map((d) => [d.id, `${d.code} - ${d.name}`])),
    [docTypes]
  );
  const muniMap = useMemo(
    () => Object.fromEntries(municipalities.map((m) => [m.id, `${m.departmentName} - ${m.name}`])),
    [municipalities]
  );

  const columns = useMemo(() => [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      render: (row) =>
        [row.firstName, row.secondName, row.firstLastName, row.secondLastName]
          .filter(Boolean)
          .join(' ') || '-',
    },
    {
      key: 'document',
      label: 'Documento',
      render: (row) =>
        row.documentNumber
          ? `${docTypeMap[row.documentTypeId]?.split(' - ')[0] || ''} ${row.documentNumber}`.trim()
          : '-',
    },
    { key: 'mobile', label: 'Celular', render: (row) => row.mobile || '-' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    {
      key: 'municipality',
      label: 'Municipio',
      render: (row) => muniMap[row.municipalityId] || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (row) => <StatusBadge active={row.isActive} />,
    },
  ], [docTypeMap, muniMap]);

  const load = useCallback(async () => {
    setLoading(true);
    const [peopleRes, docRes, muniRes, usersRes] = await Promise.all([
      adminApi.getAllUsers().catch((err) => { console.error('people:', err); return { data: [] }; }),
      adminApi.getAllDocTypes().catch((err) => { console.error('docTypes:', err); return { data: [] }; }),
      municipalityApi.getAll().catch((err) => { console.error('municipalities:', err); return { data: [] }; }),
      adminApi.getUsersWithoutPerson().catch((err) => { console.error('availableUsers:', err); return { data: [] }; }),
    ]);
    setItems(peopleRes.data || []);
    setDocTypes(docRes.data || []);
    setMunicipalities(muniRes.data || []);
    setAvailableUsers(usersRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const baseFields = useMemo(() => [
    { name: 'firstName', label: 'Primer Nombre', type: 'text', required: true },
    { name: 'secondName', label: 'Segundo Nombre', type: 'text' },
    { name: 'firstLastName', label: 'Primer Apellido', type: 'text', required: true },
    { name: 'secondLastName', label: 'Segundo Apellido', type: 'text' },
    {
      name: 'documentTypeId',
      label: 'Tipo de Documento',
      type: 'select',
      required: true,
      options: docTypes.map((d) => ({ value: d.id, label: `${d.code} - ${d.name}` })),
    },
    { name: 'documentNumber', label: 'Número de Documento', type: 'text', required: true },
    { name: 'mobile', label: 'Celular', type: 'text', required: true, placeholder: '3001234567' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'correo@ejemplo.com' },
    { name: 'address', label: 'Dirección', type: 'text', required: true, placeholder: 'Cra 10 #20-30' },
    { name: 'neighborhood', label: 'Barrio', type: 'text', required: true, placeholder: 'Centro' },
    {
      name: 'municipalityId',
      label: 'Municipio',
      type: 'searchable-select',
      required: true,
      placeholder: 'Buscar municipio...',
      options: municipalities.map((m) => ({
        value: m.id,
        label: `${m.departmentName} - ${m.name}`,
      })),
    },
  ], [docTypes, municipalities]);

  const createFields = useMemo(() => [
    {
      name: 'userId',
      label: 'Usuario al que pertenece',
      type: 'searchable-select',
      required: true,
      placeholder: availableUsers.length
        ? 'Buscar usuario sin perfil...'
        : 'No hay usuarios disponibles',
      options: availableUsers.map((u) => ({
        value: u.userId,
        label: `${u.username} (${u.email})`,
      })),
    },
    ...baseFields,
  ], [availableUsers, baseFields]);

  const editFields = useMemo(() => [
    ...baseFields,
    {
      name: 'isActive',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  ], [baseFields]);

  const openCreate = () => {
    setEditing(null);
    setModalMode('create');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing({
      ...row,
      isActive: row.isActive ? 'true' : 'false',
    });
    setModalMode('edit');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (modalMode === 'create') {
        const { userId, ...personData } = values;
        if (!userId) throw new Error('Debe seleccionar un usuario');
        await adminApi.createPersonForUser(userId, personData);
        toastSuccess('Persona creada');
      } else {
        const payload = {
          ...values,
          isActive: values.isActive === 'true' || values.isActive === true,
        };
        await adminApi.updateUser(editing.id, payload);
        toastSuccess('Persona actualizada');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      const msg = err.message || 'Error al guardar';
      setFormError(msg);
      alertError('Error', msg);
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete(
      'Confirmar eliminación',
      `Eliminar (desactivar) persona "${row.firstName} ${row.firstLastName}"?`
    );
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteUser(row.id);
      load();
      toastSuccess('Persona desactivada');
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar');
    }
  };

  const createDisabled = availableUsers.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Personas
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gestión de datos personales y de contacto
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={createDisabled}
          title={createDisabled ? 'Todos los usuarios ya tienen persona' : 'Crear persona'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
        searchPlaceholder="Buscar por nombre, documento, email..."
        defaultPageSize={10}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={modalMode === 'create' ? 'Crear Persona' : 'Editar Persona'}
        fields={modalMode === 'create' ? createFields : editFields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
