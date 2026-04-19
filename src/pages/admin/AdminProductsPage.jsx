import { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Plus, ImagePlus, Trash2, Power } from 'lucide-react';
import { productApi, companyApi, productImageApi, productTypeApi } from '../../api/client';
import FormModal from '../../components/admin/FormModal';
import { alertError, alertConfirmDelete, toastSuccess } from '../../utils/alerts';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price || 0);
}

export default function AdminProductsPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
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
      } catch (err) {
        console.error('Error loading admin products init:', err);
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!selectedCompany) { setProducts([]); return; }
    setLoading(true);
    try {
      const res = await productApi.getByCompanyAdmin(selectedCompany.id);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    }
    setLoading(false);
  }, [selectedCompany]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const fields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Anillo Esmeralda' },
    { name: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Descripción del producto...' },
    { name: 'referencePrice', label: 'Precio (COP)', type: 'number', required: true, placeholder: '2500000' },
    { name: 'isNegotiable', label: 'Negociable', type: 'select', options: [{ value: true, label: 'Sí' }, { value: false, label: 'No' }] },
    {
      name: 'productTypeId', label: 'Categoría', type: 'select', required: true,
      options: productTypes.map((pt) => ({ value: pt.id, label: pt.name })),
    },
    { name: 'initialChatMessage', label: 'Mensaje inicial del chat (opcional)', type: 'textarea', placeholder: 'Si lo dejas vacío, se genera uno automático. Este texto se envía como primer mensaje cuando un comprador inicie la conversación.' },
    { name: 'image', label: 'Imagen del producto', type: 'file', accept: 'image/*', placeholder: 'Seleccionar imagen...' },
  ];

  const handleSubmit = async (values) => {
    if (!selectedCompany) { alertError('Error', 'Selecciona una empresa primero'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        name: values.name,
        description: values.description || '',
        referencePrice: parseFloat(values.referencePrice),
        isNegotiable: values.isNegotiable === 'true' || values.isNegotiable === true,
        initialChatMessage: values.initialChatMessage || '',
        companyId: selectedCompany.id,
        productTypeId: values.productTypeId,
      };
      let productId;
      if (editing) {
        await productApi.update(editing.id, payload);
        productId = editing.id;
      } else {
        const res = await productApi.create(payload);
        productId = res.data?.id;
      }
      if (values.image instanceof File && productId) {
        await productImageApi.upload(productId, values.image);
      }
      setModalOpen(false);
      setEditing(null);
      loadProducts();
      toastSuccess(editing ? 'Producto actualizado' : 'Producto creado');
    } catch (err) {
      setFormError(err.message);
      alertError('Error', err.message || 'Ocurrió un error');
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
    if (!file.type.startsWith('image/')) { alertError('Error', 'Solo imágenes'); return; }
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

  const handleToggleStatus = async (product) => {
    try {
      await productApi.toggleStatus(product.id);
      loadProducts();
      toastSuccess(product.isActive ? 'Producto desactivado' : 'Producto activado');
    } catch (err) {
      alertError('Error', err.message || 'Error al cambiar estado');
    }
  };

  const openEdit = (product) => {
    setEditing({
      ...product,
      isNegotiable: String(product.isNegotiable),
    });
    setFormError('');
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Empresa:</label>
          <select
            className="form-input"
            value={selectedCompany?.id || ''}
            onChange={(e) => setSelectedCompany(companies.find((c) => c.id === e.target.value) || null)}
            style={{ minWidth: 260 }}
          >
            <option value="">Seleccionar empresa...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedCompany && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{products.length} productos</span>
          )}
        </div>
        <button
          onClick={() => {
            if (!selectedCompany) { alertError('Error', 'Selecciona una empresa primero'); return; }
            setEditing(null); setFormError(''); setModalOpen(true);
          }}
          disabled={!selectedCompany}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {uploading && (
        <div className="mb-4 text-sm" style={{ color: 'var(--gold)' }}>Subiendo imagen...</div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
        </div>
      ) : !selectedCompany ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>Selecciona una empresa para ver sus productos</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
          <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>No hay productos aún</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crea el primero para empezar</p>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          background: product.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: product.isActive ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.productTypeName}</p>
                    <p className="text-lg font-bold mt-1" style={{ color: 'var(--gold)' }}>{formatPrice(product.referencePrice)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="p-2 rounded-lg transition hover:opacity-80"
                    style={{
                      background: product.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: product.isActive ? '#22c55e' : '#ef4444',
                    }}
                    title={product.isActive ? 'Desactivar producto' : 'Activar producto'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => { setImageProduct(product); fileInputRef.current?.click(); }}
                    className="p-2 rounded-lg transition hover:opacity-80"
                    style={{ background: 'rgba(212,164,40,0.1)', color: 'var(--gold)' }}
                    title="Subir imagen"
                  >
                    <ImagePlus size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(product)}
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
            </div>
          ))}
        </div>
      )}

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
