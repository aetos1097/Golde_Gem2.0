import Select from 'react-select';

/**
 * Wrapper sobre react-select que respeta los CSS vars del tema de GoldenGems.
 * Props:
 *  - options: [{ value, label }]
 *  - value: valor seleccionado (string/number)
 *  - onChange: (value) => void — recibe solo el `value` (no el objeto option)
 *  - placeholder, isClearable, isDisabled, required
 *  - isMulti: para selección múltiple
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  isClearable = true,
  isDisabled = false,
  required = false,
  isMulti = false,
  noOptionsMessage = 'Sin resultados',
  ...rest
}) {
  const selected = isMulti
    ? options.filter((o) => (value || []).includes(o.value))
    : options.find((o) => o.value === value) || null;

  const handleChange = (opt) => {
    if (isMulti) {
      onChange((opt || []).map((o) => o.value));
    } else {
      onChange(opt ? opt.value : '');
    }
  };

  return (
    <>
      <Select
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable
        isDisabled={isDisabled}
        isMulti={isMulti}
        noOptionsMessage={() => noOptionsMessage}
        classNamePrefix="gg-select"
        menuPlacement="auto"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{
          control: (base, state) => ({
            ...base,
            background: 'var(--bg-card)',
            borderColor: state.isFocused ? 'var(--gold, #d4a428)' : 'var(--border)',
            borderRadius: 12,
            minHeight: 42,
            boxShadow: state.isFocused ? '0 0 0 1px var(--gold, #d4a428)' : 'none',
            '&:hover': { borderColor: 'var(--gold, #d4a428)' },
          }),
          valueContainer: (base) => ({ ...base, padding: '2px 10px' }),
          input: (base) => ({ ...base, color: 'var(--text-primary)', margin: 0, padding: 0 }),
          singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
          multiValue: (base) => ({
            ...base,
            background: 'rgba(212,164,40,0.15)',
            borderRadius: 6,
          }),
          multiValueLabel: (base) => ({ ...base, color: 'var(--gold, #d4a428)', fontWeight: 500 }),
          multiValueRemove: (base) => ({
            ...base,
            color: 'var(--gold, #d4a428)',
            ':hover': { background: 'rgba(212,164,40,0.3)', color: 'var(--gold, #d4a428)' },
          }),
          placeholder: (base) => ({ ...base, color: 'var(--text-muted)' }),
          menu: (base) => ({
            ...base,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 9999,
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menuList: (base) => ({ ...base, padding: 4 }),
          option: (base, state) => ({
            ...base,
            background: state.isSelected
              ? 'rgba(212,164,40,0.2)'
              : state.isFocused
                ? 'rgba(212,164,40,0.08)'
                : 'transparent',
            color: 'var(--text-primary)',
            borderRadius: 8,
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            ':active': { background: 'rgba(212,164,40,0.25)' },
          }),
          indicatorSeparator: (base) => ({ ...base, background: 'var(--border)' }),
          dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? 'var(--gold, #d4a428)' : 'var(--text-muted)',
            '&:hover': { color: 'var(--gold, #d4a428)' },
          }),
          clearIndicator: (base) => ({
            ...base,
            color: 'var(--text-muted)',
            '&:hover': { color: 'var(--text-primary)' },
          }),
          noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }),
        }}
        {...rest}
      />
      {/* Hidden input para validación HTML nativa con `required` */}
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
          value={isMulti ? ((value || []).length ? 'filled' : '') : (value || '')}
          required
          onChange={() => {}}
        />
      )}
    </>
  );
}
