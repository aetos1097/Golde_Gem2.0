import { useReveal } from '../../hooks/useReveal';

const esmeraldas = [
  {
    name: 'Coleccion Esmeraldas Talladas',
    description: 'Lote de esmeraldas colombianas con diversos cortes: redondo, esmeralda y cuadrado. Calidad premium con brillo y saturacion excepcional.',
    price: 6500000,
    image: '/Joyas/esmeralda1.jpeg',
  },
  {
    name: 'Esmeraldas Redondas Selectas',
    description: 'Set de esmeraldas redondas cuidadosamente seleccionadas. Corte brillante con color verde intenso y excelente transparencia.',
    price: 20000000,
    image: '/Joyas/esmeralda2.jpeg',
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export default function Esmeraldas() {
  const revealRef = useReveal();

  return (
    <section className="py-24 px-6" id="esmeraldas" style={{ background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 50%, var(--bg-primary) 100%)' }}>
      <div ref={revealRef} className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 reveal" style={{ color: 'var(--gold)' }}>Piedras Preciosas</p>
          <h2 className="section-title text-4xl md:text-5xl font-bold reveal reveal-delay-1">ESMERALDAS</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {esmeraldas.map((item, i) => (
            <div key={i} className={`esmeralda-card reveal reveal-delay-${i + 1}`}>
              <div className="esmeralda-img-wrapper">
                <img src={item.image} alt={item.name} className="esmeralda-img" />
              </div>
              <div className="esmeralda-info">
                <h3 className="product-name mb-2">{item.name}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
                <p className="product-price text-2xl">{formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
