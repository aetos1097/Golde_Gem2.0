import { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Plus, ImagePlus, Trash2, Star } from 'lucide-react';
import { productApi, companyApi, productImageApi, productTypeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FormModal from '../components/admin/FormModal';
import { alertError, alertConfirmDelete, toastSuccess } from '../utils/alerts';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [imageProduct, setImageProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [compRes, ptRes] = await Promise.all([
          companyApi.getAll(),
          productTypeApi.getAll(),
        ]);
        setCompanies(compRes.data || []);
        setProductTypes(ptRes.data || []);
        if (compRes.data?.length > 0) {
          setSelectedCompany(compRes.data[0]);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    init();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const res = await productApi.getByCompany(selectedCompany.id);
      setProducts(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedCompany]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const fields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Anillo Esmeralda' },
    { name: 'description', label: 'Descripcion', type: 'textarea', placeholder: 'Descripcion del producto...' },
    { name: 'referencePrice', label: 'Precio (COP)', type: 'number', required: true, placeholder: '2500000' },
    { name: 'isNegotiable', label: 'Negociable', type: 'select', options: [{ value: true, label: 'Si' }, { value: false, label: 'No' }] },
    {
      name: 'productTypeId', label: 'Categoria', type: 'select', required: true,
      options: productTypes.map((pt) => ({ value: pt.id, label: pt.name })),
    },
  ];

  const handleSubmit = async (values) => {
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        ...values,
        companyId: selectedCompany.id,
        referencePrice: parseFloat(values.referencePrice),
        isNegotiable: values.isNegotiable === 'true' || values.isNegotiable === true,
      };
      if (editing) {
        await productApi.update(editing.id, payload);
      } else {
        await productApi.create(payload);
      }
      setModalOpen(false);
      setEditing(null);
      loadProducts();
      toastSuccess(editing ? 'Producto actualizado' : 'Producto creado');
    } catch (err) {
      setFormError(err.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (product) => {
    const result = await alertConfirmDelete('Eliminar producto', `Eliminar "${product.name}"?`);
    if (!result.isConfirmed) return;
    try {
      await productApi.delete(product.id);
      loadProducts();
      toastSuccess('Producto eliminado');
    } catch (err) {
      alertError('Error', err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !imageProduct) return;
    if (!file.type.startsWith('image/')) { alertError('Error', 'Solo imagenes'); return; }
    setUploading(true);
    try {
      await productImageApi.upload(imageProduct.id, file);
      loadProducts();
      toastSuccess('Imagen subida');
    } catch (err) {
      alertError('Error', err.message);
    }
    setUploading(false);
    setImageProduct(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (productId, imageId) => {
    try {
      await productImageApi.delete(productId, imageId);
      loadProducts();
      toastSuccess('Imagen eliminada');
    } catch (err) {
      alertError('Error', err.message);
    }
  };

  const handleSetPrimary = async (productId, imageId) => {
    try {
      await productImageApi.setPrimary(productId, imageId);
      loadProducts();
      toastSuccess('Imagen principal actualizada');
    } catch (err) {
      alertError('Error', err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Panel Empresa</h1>
            {selectedCompany && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{selectedCompany.name}</p>
            )}
          </div>
          <div className="flex gap-3">
            {companies.length > 1 && (
              <select
                className="form-input"
                value={selectedCompany?.id || ''}
                onChange={(e) => setSelectedCompany(companies.find((c) => c.id === e.target.value))}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => { setEditing(null); setFormError(''); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
            >
              <Plus size={16} /> Nuevo Producto
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>No hay productos aun</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crea tu primer producto para empezar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-2xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                      <img src={product.primaryImageUrl || '/Joyas/anillo1.jpeg'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.productTypeName}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: 'var(--gold)' }}>{formatPrice(product.referencePrice)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setImageProduct(product); fileInputRef.current?.click(); }}
                      className="p-2 rounded-lg transition hover:opacity-80"
                      style={{ background: 'rgba(212,164,40,0.1)', color: 'var(--gold)' }}
                      title="Subir imagen"
                    >
                      <ImagePlus size={16} />
                    </button>
                    <button
                      onClick={() => { setEditing(product); setFormError(''); setModalOpen(true); }}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 rounded-lg text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Image gallery */}
                {product.images?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {product.images.map((img) => (
                      <div key={img.id} className="relative group">
                        <img src={img.url} alt={img.altText} className="w-16 h-16 rounded-lg object-cover border" style={{ borderColor: img.isPrimary ? 'var(--gold)' : 'var(--border)' }} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-1">
                          {!img.isPrimary && (
                            <button onClick={() => handleSetPrimary(product.id, img.id)} className="text-yellow-400" title="Hacer principal">
                              <Star size={12} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteImage(product.id, img.id)} className="text-red-400" title="Eliminar">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Editar Producto' : 'Crear Producto'}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={handleSubmit}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
