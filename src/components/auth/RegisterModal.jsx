import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { alertError, alertSuccess } from '../../utils/alerts';

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    firstLastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      alertError('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      alertError('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        firstLastName: form.firstLastName,
      });
      await alertSuccess('Cuenta creada', 'Tu cuenta ha sido creada exitosamente');
      onClose();
    } catch (err) {
      alertError('Error', err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl px-6 py-5 relative"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="text-center mb-4">
          <img src="/Logo/logo.PNG" alt="Golden Gems Logo" className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Crear Cuenta</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Unete a Golden Gems</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
              <input type="text" name="firstName" className="form-input" placeholder="Juan" value={form.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Apellido</label>
              <input type="text" name="firstLastName" className="form-input" placeholder="Perez" value={form.firstLastName} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Usuario</label>
            <input type="text" name="username" className="form-input" placeholder="juanperez" value={form.username} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" className="form-input" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contrasena</label>
            <input type="password" name="password" className="form-input" placeholder="Min. 6 caracteres" value={form.password} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmar contrasena</label>
            <input type="password" name="confirmPassword" className="form-input" placeholder="Repite tu contrasena" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition disabled:opacity-50"
            style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Ya tienes cuenta?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold" style={{ color: 'var(--gold)' }}>
            Ingresar
          </button>
        </p>
      </div>
    </div>
  );
}
