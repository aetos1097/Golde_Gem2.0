import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function FormModal({ isOpen, onClose, title, fields, initialValues = {}, onSubmit, loading, error }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (isOpen) {
      const defaults = {};
      fields.forEach((f) => { defaults[f.name] = initialValues[f.name] ?? ''; });
      setValues(defaults);
    }
  }, [isOpen, initialValues, fields]);

  if (!isOpen) return null;

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(values);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  className="form-input min-h-[80px] resize-y"
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : field.type === 'select' ? (
                <select
                  className="form-input"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'multicheck' ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {field.options?.map((opt) => {
                    const checked = (values[field.name] || []).includes(opt.value);
                    return (
                      <label key={opt.value} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition"
                        style={{ borderColor: checked ? 'var(--gold)' : 'var(--border)', background: checked ? 'rgba(212,164,40,0.1)' : 'transparent', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            const current = values[field.name] || [];
                            handleChange(field.name, checked ? current.filter((v) => v !== opt.value) : [...current, opt.value]);
                          }}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  className="form-input"
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  required={field.required}
                  min={field.type === 'number' ? 0 : undefined}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition disabled:opacity-50 mt-2"
            style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}
