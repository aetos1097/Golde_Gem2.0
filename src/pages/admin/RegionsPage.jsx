import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';

const columns = [
  { key: 'departmentName', label: 'Departamento' },
  { key: 'code', label: 'Código DANE' },
  { key: 'name', label: 'Municipio' },
  { key: 'isActive', label: 'Estado', render: (row) => <StatusBadge active={row.isActive} /> },
];

export default function RegionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (filter) {
        const res = await adminApi.getMunicipalitiesByDepartment(filter);
        setItems((res.data || []).map((m) => ({
          ...m,
          departmentName: departments.find((d) => d.id === filter)?.name || '',
        })));
      } else {
        const res = await adminApi.getAllMunicipalities();
        setItems(res.data || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter, departments]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await adminApi.getAllDepartments();
      setDepartments(res.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{items.length} registros</p>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm border"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={items}
        loading={loading}
      />
    </div>
  );
}
