export default function Spinner({ size = 40, label = 'Cargando...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <div
        className="border-[3px] border-t-transparent rounded-full animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--gold)',
          borderTopColor: 'transparent',
        }}
        role="status"
        aria-label={label}
      />
      {label && (
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
