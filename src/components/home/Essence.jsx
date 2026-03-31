import { useReveal } from '../../hooks/useReveal';

const cards = [
  {
    title: 'Sostenibilidad y Naturaleza',
    description: 'Cada gema proviene de fuentes eticas y responsables, respetando la tierra y sus comunidades.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67"/>
      </svg>
    ),
  },
  {
    title: 'Artesania Local',
    description: 'Nuestros orfebres colombianos crean cada pieza a mano con tecnicas transmitidas por generaciones.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
      </svg>
    ),
  },
  {
    title: 'Certificacion Premium',
    description: 'Todas nuestras esmeraldas cuentan con certificacion internacional de autenticidad y calidad.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
      </svg>
    ),
  },
];

export default function Essence() {
  const revealRef = useReveal();

  return (
    <section className="py-24 px-6" id="essence" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-primary) 70%, var(--bg-secondary) 100%)' }}>
      <div ref={revealRef} className="max-w-6xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 reveal" style={{ color: 'var(--gold)' }}>Lo Que Nos Define</p>
        <h2 className="section-title text-4xl md:text-5xl font-bold mb-16 reveal reveal-delay-1">NUESTRA ESENCIA</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div key={i} className={`essence-card reveal reveal-delay-${i + 1}`}>
              <div className="essence-icon">{card.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
