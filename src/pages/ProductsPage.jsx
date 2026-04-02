import { useState, useEffect } from 'react';
import { productApi, companyApi, preferencesApi, productTypeApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';
import { useReveal } from '../hooks/useReveal';

const fallbackProducts = [
  { id: '1', name: 'Anillo Esmeralda Clasico', productTypeName: 'Anillos', referencePrice: 2450000, primaryImageUrl: '/Joyas/anillo1.jpeg' },
  { id: '2', name: 'Manilla Dorada con Esmeralda', productTypeName: 'Manillas', referencePrice: 4000000, primaryImageUrl: '/Joyas/manilla.jpeg' },
  { id: '3', name: 'Anillo Trebol Esmeralda', productTypeName: 'Anillos', referencePrice: 2900000, primaryImageUrl: '/Joyas/anillo3.jpeg' },
  { id: '4', name: 'Manilla Delicada Esmeralda', productTypeName: 'Manillas', referencePrice: 4000000, primaryImageUrl: '/Joyas/manilla2.jpeg' },
  { id: '5', name: 'Anillo Solitario Esmeralda', productTypeName: 'Anillos', referencePrice: 3200000, primaryImageUrl: '/Joyas/anillo4.jpeg' },
  { id: '6', name: 'Anillo Elegancia Verde', productTypeName: 'Anillos', referencePrice: 2750000, primaryImageUrl: '/Joyas/anillo5.jpeg' },
  { id: '7', name: 'Manilla Esmeralda Royal', productTypeName: 'Manillas', referencePrice: 4100000, primaryImageUrl: '/Joyas/anillo6.jpeg' },
  { id: '8', name: 'Manilla Oro Tejido', productTypeName: 'Manillas', referencePrice: 5600000, primaryImageUrl: '/Joyas/manilla3.jpeg' },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [personalizedLabel, setPersonalizedLabel] = useState('');
  const revealRef = useReveal();

  useEffect(() => {
    const init = async () => {
      const [compRes, ptRes] = await Promise.all([
        companyApi.getAll().catch(() => ({ data: [] })),
        productTypeApi.getAll().catch(() => ({ data: [] })),
      ]);
      setCompanies(compRes.data || []);
      setProductTypes(ptRes.data || []);

      // Apply user preferences if logged in
      if (user) {
        try {
          const prefRes = await preferencesApi.get();
          const prefs = prefRes.data;
          if (prefs) {
            if (prefs.preferredCompanyId && !prefs.showAllCompanies) {
              setSelectedCompany(prefs.preferredCompanyId);
              setPersonalizedLabel('Mostrando tu empresa preferida');
            }
            if (prefs.preferredCategories?.length === 1) {
              setSelectedType(prefs.preferredCategories[0]);
              setPersonalizedLabel((prev) => prev ? prev + ' y categoria' : 'Mostrando tu categoria preferida');
            }
          }
        } catch { /* no preferences set */ }
      }

      loadProducts();
    };
    init();
  }, []);

  const loadProducts = async (query = '') => {
    setLoading(true);
    try {
      const res = await productApi.search(query);
      setProducts(res.data && res.data.length > 0 ? res.data : fallbackProducts);
    } catch {
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const loadByType = async (typeId) => {
    setSelectedType(typeId);
    setPersonalizedLabel('');
    if (!typeId) {
      loadProducts(search);
      return;
    }
    setLoading(true);
    try {
      const res = await productApi.getByType(typeId);
      setProducts(res.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadByCompany = async (companyId) => {
    setSelectedCompany(companyId);
    setPersonalizedLabel('');
    if (!companyId) {
      loadProducts(search);
      return;
    }
    setLoading(true);
    try {
      const res = await productApi.getByCompany(companyId);
      setProducts(res.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedCompany('');
    loadProducts(search);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div ref={revealRef} className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 reveal" style={{ color: 'var(--gold)' }}>Catalogo Completo</p>
          <h1 className="section-title text-4xl md:text-5xl font-bold reveal reveal-delay-1">NUESTROS PRODUCTOS</h1>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 reveal reveal-delay-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-3">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="Buscar joyas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-sm transition" style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}>
              Buscar
            </button>
          </form>

          {companies.length > 0 && (
            <select
              className="form-input w-full md:w-48"
              value={selectedCompany}
              onChange={(e) => loadByCompany(e.target.value)}
            >
              <option value="">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {productTypes.length > 0 && (
            <select
              className="form-input w-full md:w-48"
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); loadByType(e.target.value); }}
            >
              <option value="">Todas las categorias</option>
              {productTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          )}
        </div>

        {personalizedLabel && (
          <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-sm" style={{ background: 'rgba(212,164,40,0.1)', color: 'var(--gold)' }}>
            <span>&#9733;</span> {personalizedLabel} — <button onClick={() => { setSelectedCompany(''); setSelectedType(''); setPersonalizedLabel(''); loadProducts(); }} className="underline">ver todo</button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-display" style={{ color: 'var(--text-secondary)' }}>No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={((i % 4) + 1)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
