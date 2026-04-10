import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, companyApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, toastSuccess } from '../../utils/alerts';

export default function CompaniesPage() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    // Cargar por separado para que el fallo de uno no tumbe al otro
    try {
      const companiesRes = await companyApi.getAll();
      setItems(companiesRes.data || []);
    } catch (err) {
      console.error('Error cargando empresas:', err);
    }
    try {
      const usersRes = await adminApi.getAllUsersDetailed();
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const userId = (u) => u.userId || u.UserId || u.id;
  const userDisplay = (u) => {
    const fullName = [u.firstName || u.FirstName, u.firstLastName || u.FirstLastName].filter(Boolean).join(' ');
    return fullName || u.username || u.Username || u.email || u.Email || '(sin nombre)';
  };
  const userEmail = (u) => u.email || u.Email || '';

  const ownerLabel = (ownerId) => {
    const u = users.find((x) => userId(x) === ownerId);
    if (!u) return ownerId;
    return `${userDisplay(u)} (${userEmail(u)})`;
  };

  const columns = [
    { key: 'name', label: 'Nombre', render: (row) => row.name || '-' },
    { key: 'nit', label: 'NIT', render: (row) => row.nit || row.nIT || row.NIT || '-' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    { key: 'phone', label: 'Teléfono', render: (row) => row.phone || '-' },
    { key: 'ownerId', label: 'Propietario', render: (row) => ownerLabel(row.ownerId) },
    {
      key: 'isDefault',
      label: 'Principal',
      render: (row) => row.isDefault ? (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(212,164,40,0.2)', color: 'var(--gold)' }}>
          Principal
        </span>
      ) : '-',
    },
    { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
    { key: 'createdAt', label: 'Creado', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' },
  ];

  const currentDefault = items.find((c) => c.isDefault);

  const fields = [
    {
      name: 'ownerId',
      label: `Usuario propietario${users.length === 0 ? ' (cargando...)' : ` (${users.length} disponibles)`}`,
      type: 'searchable-select',
      required: true,
      placeholder: 'Buscar usuario...',
      options: users.map((u) => ({
        value: userId(u),
        label: `${userDisplay(u)} — ${userEmail(u)}`,
      })),
    },
    { name: 'name', label: 'Nombre de la empresa', type: 'text', required: true, placeholder: 'Joyería Esmeralda S.A.' },
    { name: 'nit', label: 'NIT', type: 'text', required: true, placeholder: '900123456-7' },
    { name: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de la empresa...' },
    { name: 'logo', label: 'Logo (URL)', type: 'text', placeholder: 'https://...' },
    { name: 'phone', label: 'Teléfono', type: 'text', placeholder: '3001234567' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'contacto@empresa.com' },
    { name: 'whatsAppNumber', label: 'WhatsApp', type: 'text', placeholder: '573001234567' },
    {
      name: 'isDefault',
      label: currentDefault
        ? `Empresa principal (actual: ${currentDefault.name} — será reemplazada)`
        : 'Empresa principal',
      type: 'select',
      options: [
        { value: false, label: 'No' },
        { value: true, label: 'Sí (solo una puede serlo)' },
      ],
    },
  ];

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        ownerId: values.ownerId,
        name: (values.name || '').trim(),
        nit: (values.nit || '').trim(),
        description: values.description || '',
        logo: values.logo || '',
        phone: values.phone || '',
        email: values.email || '',
        whatsAppNumber: values.whatsAppNumber || '',
        isDefault: values.isDefault === 'true' || values.isDefault === true,
      };
      await adminApi.createCompany(payload);
      setModalOpen(false);
      load();
      toastSuccess('Empresa creada. El usuario ahora tiene rol Empresa.');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Error al crear empresa');
    }
    setFormLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{items.length} empresas</p>
        <button
          onClick={() => { setFormError(''); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
          style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
        >
          <Plus size={16} /> Crear Empresa
        </button>
      </div>

      <AdminTable columns={columns} data={items} loading={loading} />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Crear Empresa"
        fields={fields}
        initialValues={{}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
