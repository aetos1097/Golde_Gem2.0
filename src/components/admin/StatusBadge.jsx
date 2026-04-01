export default function StatusBadge({ active }) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: active ? '#16a34a' : '#dc2626',
      }}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}
