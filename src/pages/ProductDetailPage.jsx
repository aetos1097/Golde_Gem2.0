import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, chatApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function ProductDetailPage({ onLoginClick }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    productApi.getById(id)
      .then((res) => {
        setProduct(res.data);
      })
      .catch(() => navigate('/productos'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStartChat = async () => {
    if (!user) {
      onLoginClick();
      return;
    }
    setStartingChat(true);
    try {
      const res = await chatApi.startConversation(product.id);
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      alert(err.message || 'Error al iniciar conversacion');
    } finally {
      setStartingChat(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const res = await chatApi.getWhatsAppLink(product.id);
      window.open(res.data, '_blank');
    } catch {
      alert('Error al generar enlace de WhatsApp');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="inline-block w-10 h-10 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : [product.primaryImageUrl || '/Joyas/anillo1.jpeg'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm font-medium transition hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Volver
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden aspect-square mb-4" style={{ background: 'var(--bg-secondary)' }}>
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 transition"
                    style={{ borderColor: i === selectedImage ? 'var(--gold)' : 'var(--border)' }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
              {product.productTypeName || 'Joyeria'}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            {product.companyName && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                por <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{product.companyName}</span>
              </p>
            )}
            <p className="text-3xl font-bold mb-6" style={{ color: 'var(--gold)' }}>
              {formatPrice(product.referencePrice)}
            </p>

            {product.isNegotiable && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: 'var(--color-emerald-mid)', color: 'var(--color-gold-light)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
                </svg>
                Precio negociable
              </div>
            )}

            {product.description && (
              <div className="mb-8">
                <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Descripcion</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {product.isNegotiable && (
                <button
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-wide uppercase transition flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--color-emerald-mid)', color: 'white' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                  </svg>
                  {startingChat ? 'Iniciando...' : 'Negociar Precio'}
                </button>
              )}
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-wide uppercase transition flex items-center justify-center gap-2"
                style={{ background: '#25D366', color: 'white' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.49-.682-6.32-1.852l-.442-.291-2.633.883.883-2.633-.291-.442A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
