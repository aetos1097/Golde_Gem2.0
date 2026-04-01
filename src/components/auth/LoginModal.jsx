import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { alertError } from '../../utils/alerts';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      onClose();
    } catch (err) {
      alertError('Error', err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-8 relative"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="text-center mb-8">
          <img src="/Logo/logo.PNG" alt="Golden Gems Logo" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bienvenido</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email o usuario
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="tu@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Contrasena
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition disabled:opacity-50"
            style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          No tienes cuenta?{' '}
          <button onClick={onSwitchToRegister} className="font-semibold" style={{ color: 'var(--gold)' }}>
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
