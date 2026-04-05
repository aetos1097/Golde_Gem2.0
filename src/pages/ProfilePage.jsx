import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Trash2, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi, lookupApi, preferencesApi, companyApi, productTypeApi, municipalityApi } from '../api/client';
import { alertError, toastSuccess } from '../utils/alerts';

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [person, setPerson] = useState(null);
  const [docTypes, setDocTypes] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    firstLastName: '',
    secondLastName: '',
    documentNumber: '',
    documentTypeId: '',
    mobile: '',
    email: '',
    address: '',
    neighborhood: '',
    municipalityId: '',
  });

  const [companies, setCompanies] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [prefs, setPrefs] = useState({
    preferredCompanyId: '',
    preferredCategories: [],
    showAllCompanies: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [dtRes, muniRes] = await Promise.all([
        lookupApi.getDocumentTypes().catch(() => ({ data: [] })),
        municipalityApi.getAll().catch(() => ({ data: [] })),
      ]);
      setDocTypes(dtRes.data || []);
      setMunicipalities(muniRes.data || []);
      try {
        const meRes = await profileApi.getMe();
        if (meRes.success && meRes.data) {
          setPerson(meRes.data);
          setForm({
            firstName: meRes.data.firstName || '',
            secondName: meRes.data.secondName || '',
            firstLastName: meRes.data.firstLastName || '',
            secondLastName: meRes.data.secondLastName || '',
            documentNumber: meRes.data.documentNumber || '',
            documentTypeId: meRes.data.documentTypeId || '',
            mobile: meRes.data.mobile || '',
            email: meRes.data.email || '',
            address: meRes.data.address || '',
            neighborhood: meRes.data.neighborhood || '',
            municipalityId: meRes.data.municipalityId || '',
          });
        }
      } catch {
        // Person doesn't exist yet — show empty form to create
      }
      const [compRes, ptRes, prefRes] = await Promise.all([
        companyApi.getAll().catch(() => ({ data: [] })),
        productTypeApi.getAll().catch(() => ({ data: [] })),
        preferencesApi.get().catch(() => ({ data: null })),
      ]);
      setCompanies(compRes.data || []);
      setProductTypes(ptRes.data || []);
      if (prefRes.data) {
        setPrefs({
          preferredCompanyId: prefRes.data.preferredCompanyId || '',
          preferredCategories: prefRes.data.preferredCategories || [],
          showAllCompanies: prefRes.data.showAllCompanies ?? true,
        });
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (person) {
        res = await profileApi.update(person.id, form);
      } else {
        res = await profileApi.createMe(form);
      }
      if (res.success) {
        setPerson(res.data);
        toastSuccess( person ? 'Datos actualizados correctamente' : 'Perfil creado correctamente');
      }
    } catch (err) {
      alertError('Error', err.message || 'Error al guardar');
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !person) return;

    if (!file.type.startsWith('image/')) {
      alertError('Error', 'Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alertError('Error', 'La imagen no puede pesar mas de 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await profileApi.uploadPhoto(person.id, file);
      if (res.success) {
        setPerson(res.data);
        toastSuccess( 'Foto actualizada');
      }
    } catch (err) {
      alertError('Error', err.message || 'Error al subir la foto');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = async () => {
    if (!person?.photoUrl) return;
    setUploading(true);
    try {
      const res = await profileApi.deletePhoto(person.id);
      if (res.success) {
        setPerson(res.data);
        toastSuccess( 'Foto eliminada');
      }
    } catch (err) {
      alertError('Error', err.message || 'Error al eliminar la foto');
    }
    setUploading(false);
  };

  const handleCategoryToggle = (id) => {
    setPrefs((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(id)
        ? prev.preferredCategories.filter((c) => c !== id)
        : [...prev.preferredCategories, id],
    }));
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const payload = {
        preferredCompanyId: prefs.preferredCompanyId || null,
        preferredCategories: prefs.preferredCategories,
        showAllCompanies: prefs.showAllCompanies,
      };
      const res = await preferencesApi.update(payload);
      if (res.success) toastSuccess('Preferencias actualizadas');
    } catch (err) {
      alertError('Error', err.message || 'Error al guardar preferencias');
    }
    setSavingPrefs(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
          {person ? 'Mi Perfil' : 'Completar Perfil'}
        </h1>

        {/* Photo Section */}
        {person && <div className="rounded-2xl p-8 mb-6 border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="relative inline-block">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4"
                style={{ borderColor: 'var(--gold)' }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4"
                style={{
                  background: 'linear-gradient(135deg, var(--color-emerald-mid), var(--color-emerald-dark))',
                  color: 'var(--color-gold-light)',
                  borderColor: 'var(--gold)',
                }}
              >
                {person.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition hover:scale-110 disabled:opacity-50"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
              title="Cambiar foto"
            >
              <Camera size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          <p className="mt-3 font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {person.firstName} {person.firstLastName}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>

          {person.photoUrl && (
            <button
              onClick={handleDeletePhoto}
              disabled={uploading}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition disabled:opacity-50"
            >
              <Trash2 size={14} /> Eliminar foto
            </button>
          )}

          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--gold)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Subiendo...</span>
            </div>
          )}
        </div>}

        {!person && (
          <div className="rounded-2xl p-6 mb-6 border text-center" style={{ background: 'rgba(212,164,40,0.08)', borderColor: 'var(--gold)' }}>
            <User size={32} style={{ color: 'var(--gold)', margin: '0 auto' }} />
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Completa tus datos personales para activar tu perfil.
            </p>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSave} className="rounded-2xl p-8 border space-y-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Datos Personales</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Primer Nombre <span className="text-red-500">*</span>
              </label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Segundo Nombre <span className="text-red-500">*</span>
              </label>
              <input name="secondName" value={form.secondName} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Primer Apellido <span className="text-red-500">*</span>
              </label>
              <input name="firstLastName" value={form.firstLastName} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Segundo Apellido <span className="text-red-500">*</span>
              </label>
              <input name="secondLastName" value={form.secondLastName} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select name="documentTypeId" value={form.documentTypeId} onChange={handleChange} required className="form-input">
                <option value="">Seleccionar...</option>
                {docTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>{dt.code} - {dt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Numero de Documento <span className="text-red-500">*</span>
              </label>
              <input name="documentNumber" value={form.documentNumber} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <h2 className="font-display text-lg font-bold mb-2 pt-4 border-t" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>Datos de Contacto</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Celular <span className="text-red-500">*</span>
              </label>
              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                required
                maxLength={20}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={200}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              maxLength={300}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Barrio <span className="text-red-500">*</span>
              </label>
              <input
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
                required
                maxLength={200}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Municipio <span className="text-red-500">*</span>
              </label>
              <select name="municipalityId" value={form.municipalityId} onChange={handleChange} required className="form-input">
                <option value="">Seleccionar...</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>{m.departmentName} - {m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition disabled:opacity-50 hover:opacity-90"
            style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
          >
            <Save size={16} />
            {saving ? 'Guardando...' : person ? 'Guardar Cambios' : 'Crear Perfil'}
          </button>
        </form>

        {/* Preferences Section */}
        {person && (
          <form onSubmit={handleSavePrefs} className="rounded-2xl p-8 border space-y-5 mt-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Settings size={20} style={{ color: 'var(--gold)' }} />
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Preferencias</h2>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Empresa preferida
              </label>
              <select
                value={prefs.preferredCompanyId}
                onChange={(e) => setPrefs((p) => ({ ...p, preferredCompanyId: e.target.value }))}
                className="form-input"
              >
                <option value="">Todas las empresas</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Categorias de interes
              </label>
              <div className="flex flex-wrap gap-2">
                {productTypes.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handleCategoryToggle(pt.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition"
                    style={{
                      background: prefs.preferredCategories.includes(pt.id) ? 'var(--gold)' : 'transparent',
                      color: prefs.preferredCategories.includes(pt.id) ? '#1a1a1a' : 'var(--text-secondary)',
                      borderColor: prefs.preferredCategories.includes(pt.id) ? 'var(--gold)' : 'var(--border)',
                    }}
                  >
                    {pt.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.showAllCompanies}
                onChange={(e) => setPrefs((p) => ({ ...p, showAllCompanies: e.target.checked }))}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--gold)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Mostrar productos de todas las empresas
              </span>
            </label>

            <button
              type="submit"
              disabled={savingPrefs}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm tracking-wide uppercase transition disabled:opacity-50 hover:opacity-90"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
            >
              <Save size={16} />
              {savingPrefs ? 'Guardando...' : 'Guardar Preferencias'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
