import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/client';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';

const columns = [
  { key: 'department', label: 'Departamento' },
  { key: 'municipalityCode', label: 'Código' },
  { key: 'municipalityName', label: 'Municipio' },
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
        const res = await adminApi.getRegionsByDepartment(filter);
        setItems(res.data || []);
      } else {
        const res = await adminApi.getAllRegions();
        setItems(res.data || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter]);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await adminApi.getDepartments();
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
            <option key={d} value={d}>{d}</option>
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
