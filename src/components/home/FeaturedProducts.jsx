import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/client';
import { useReveal } from '../../hooks/useReveal';
import ProductCard from '../products/ProductCard';

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

export default function FeaturedProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const revealRef = useReveal();

  useEffect(() => {
    productApi.search('')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProducts(res.data.slice(0, 8));
        }
      })
      .catch(() => {
        // Use fallback products if API is unavailable
      });
  }, []);

  return (
    <section className="py-24 px-6" id="products" style={{ background: 'var(--bg-secondary)' }}>
      <div ref={revealRef} className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 reveal" style={{ color: 'var(--gold)' }}>Coleccion de Temporada</p>
          <h2 className="section-title text-4xl md:text-5xl font-bold reveal reveal-delay-1">PRODUCTOS DESTACADOS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} delay={((i % 4) + 1)} />
          ))}
        </div>

        <div className="text-center mt-12 reveal">
          <Link to="/productos" className="btn-cta inline-block px-8 py-3 rounded-full text-sm">
            VER TODOS LOS PRODUCTOS
          </Link>
        </div>
      </div>
    </section>
  );
}
