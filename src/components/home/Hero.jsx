import { Link } from 'react-router-dom';
import { useReveal } from '../../hooks/useReveal';

export default function Hero() {
  const revealRef = useReveal();

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />
        <div className="hero-ring hero-ring-3" />
      </div>

      <div ref={revealRef} className="hero-content max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full pt-24 pb-16">
        <div className="text-center lg:text-left">
          <p className="text-gold-bright text-sm font-semibold tracking-[0.2em] uppercase mb-4 reveal">Colecciones Exclusivas</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 reveal reveal-delay-1">
            GOLDEN GEMS:<br/>
            <span className="italic font-light text-gold-light">Donde la Naturaleza<br/>se Convierte en Lujo</span>
          </h1>
          <p className="text-cream-dark/80 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 mb-10 reveal reveal-delay-2">
            Joyas Unicas y Eticas, Cultivadas con Cuidado.<br/>
            Nuestra Coleccion de Temporada.
          </p>
          <Link to="/productos" className="btn-cta inline-block px-10 py-4 rounded-full text-sm reveal reveal-delay-3">
            DESCUBRE NUESTRA COLECCION
          </Link>
        </div>

        <div className="hidden lg:flex justify-center items-center relative">
          <div className="relative">
            <img src="/Joyas/anillo1.jpeg" alt="Anillo de esmeralda en oro" className="hero-jewelry w-80 h-80 object-cover rounded-3xl border-2 border-gold-bright/30" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-2xl overflow-hidden border-2 border-gold-bright/30 shadow-2xl">
              <img src="/Joyas/manilla.jpeg" alt="Manilla de oro con esmeralda" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center pt-1">
          <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
