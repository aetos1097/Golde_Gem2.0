import { Link } from 'react-router-dom';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function ProductCard({ product, delay = 1 }) {
  const imageUrl = product.primaryImageUrl || '/Joyas/anillo1.jpeg';

  return (
    <Link to={`/producto/${product.id}`} className={`product-card reveal reveal-delay-${delay}`}>
      <div className="product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="product-img" />
      </div>
      <div className="product-info">
        <p className="product-category mb-1">{product.productTypeName || 'Joyeria'}</p>
        <h3 className="product-name mb-2">{product.name}</h3>
        <p className="product-price">{formatPrice(product.referencePrice)}</p>
      </div>
    </Link>
  );
}
