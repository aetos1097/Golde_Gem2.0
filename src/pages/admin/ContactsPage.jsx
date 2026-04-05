import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import FormModal from '../../components/admin/FormModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

const columns = [
  { key: 'mobile', label: 'Celular' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Dirección' },
  { key: 'neighborhood', label: 'Barrio' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
  { key: 'createdAt', label: 'Creado', render: (row) => new Date(row.createdAt).toLocaleDateString() },
];

export default function ContactsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [municipalities, setMunicipalities] = useState([]);

  const fields = [
    { name: 'mobile', label: 'Celular', type: 'text', required: true, placeholder: '3001234567' },
    { name: 'email', label: 'Email', type: 'text', placeholder: 'correo@ejemplo.com' },
    { name: 'address', label: 'Dirección', type: 'text', placeholder: 'Cra 10 #20-30' },
    { name: 'neighborhood', label: 'Barrio', type: 'text', placeholder: 'Centro' },
    {
      name: 'municipalityId',
      label: 'Municipio',
      type: 'select',
      options: [
        { value: '', label: 'Sin municipio' },
        ...municipalities.map((m) => ({ value: m.id, label: `${m.departmentName} - ${m.name}` })),
      ],
    },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsRes, munisRes] = await Promise.all([
        adminApi.getAllContacts(),
        adminApi.getAllMunicipalities(),
      ]);
      setItems(contactsRes.data || []);
      setMunicipalities(munisRes.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { ...values };
      if (!payload.municipalityId) delete payload.municipalityId;
      if (editing) {
        await adminApi.updateContact(editing.id, payload);
      } else {
        await adminApi.createContact(payload);
      }
      setModalOpen(false);
      setEditing(null);
      load();
      toastSuccess(editing ? 'Contacto actualizado' : 'Contacto creado');
    } catch (err) {
      setFormError(err.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (row) => {
    const result = await alertConfirmDelete('Confirmar eliminación', `Eliminar contacto "${row.mobile}"?`);
    if (!result.isConfirmed) return;
    try {
      await adminApi.deleteContact(row.id);
      load();
      toastSuccess('Contacto eliminado');
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
        title={editing ? 'Editar Contacto' : 'Crear Contacto'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
