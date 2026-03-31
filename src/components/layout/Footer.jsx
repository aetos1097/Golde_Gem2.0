export default function Footer() {
  return (
    <footer className="py-16 px-6" id="contact">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/Logo/logo.PNG" alt="Golden Gems Logo" className="w-16 h-16 rounded-full object-cover" />
            <div>
              <span className="font-display text-xl font-bold text-gold-light">GOLDEN</span>
              <span className="font-display text-xl font-light text-gold-bright"> GEMS</span>
            </div>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">Descubre gemas Premium.<br/>Joyas cultivadas con amor y etica.</p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="w-9 h-9 rounded-full border border-gold-bright/30 flex items-center justify-center hover:bg-gold-bright/10 transition" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-gold-bright/30 flex items-center justify-center hover:bg-gold-bright/10 transition" aria-label="Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-gold-bright/30 flex items-center justify-center hover:bg-gold-bright/10 transition" aria-label="WhatsApp">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.49-.682-6.32-1.852l-.442-.291-2.633.883.883-2.633-.291-.442A9.955 9.955 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-gold-bright)' }}>Navegacion</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li><a href="/">Inicio</a></li>
            <li><a href="/productos">Productos</a></li>
            <li><a href="#">Esmeraldas</a></li>
            <li><a href="#">Nosotros</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-gold-bright)' }}>Newsletter</h4>
          <p className="text-sm opacity-70 mb-4">Recibe novedades y ofertas exclusivas.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Tu email" className="newsletter-input flex-1 text-sm" />
            <button type="submit" className="w-10 h-10 rounded-full bg-gold-bright flex items-center justify-center text-emerald-deep hover:bg-gold-light transition flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </button>
          </form>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--color-gold-bright)' }}>Contacto</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li>Celular de contacto info</li>
            <li>+1 323 306 7670</li>
            <li>www.goldengems.com</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gold-bright/20 flex flex-col md:flex-row items-center justify-between text-sm opacity-60">
        <p>Golden Gems &copy; 2026. Todos los derechos reservados.</p>
        <p>Esmeraldas colombianas premium</p>
      </div>
    </footer>
  );
}
