import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, Clock3, Instagram, MapPin, Menu, Phone, Scissors, Star, X } from "lucide-react";

const assets = {
  hero: "/assets/hero-barberia.webp",
  barber: "/assets/barbero-trabajando.webp",
  classic: "/assets/corte-clasico.webp",
  fade: "/assets/fade-contemporaneo.webp",
  beard: "/assets/arreglo-barba.webp",
  shave: "/assets/afeitado-ritual.webp",
  interior: "/assets/interior-principal.webp",
  chair: "/assets/sillon-estacion.webp",
  tools: "/assets/herramientas-barberia.webp",
  portrait: "/assets/retrato-barbero.webp",
  product: "/assets/producto-cuidado.webp",
  contact: "/assets/contacto-final.webp",
};

const services = [
  { number: "01", name: "Corte clásico", detail: "Tijera, máquina y acabado a navaja", price: "$18", image: assets.classic },
  { number: "02", name: "Fade contemporáneo", detail: "Degradado personalizado + styling", price: "$22", image: assets.fade },
  { number: "03", name: "Barba de autor", detail: "Perfilado, toalla caliente y aceite", price: "$16", image: assets.beard },
  { number: "04", name: "Ritual completo", detail: "Corte + barba + tratamiento express", price: "$34", image: assets.shave },
];

const gallery = [
  { src: assets.classic, label: "Corte clásico", tone: "Madera / precisión" },
  { src: assets.fade, label: "Fade limpio", tone: "Textura / contraste" },
  { src: assets.beard, label: "Barba de autor", tone: "Ritual / detalle" },
  { src: assets.chair, label: "La estación", tone: "Cuero / cobre" },
  { src: assets.tools, label: "Las herramientas", tone: "Acero / oficio" },
  { src: assets.shave, label: "Toalla caliente", tone: "Calma / tradición" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    ["La casa", "casa"],
    ["Servicios", "servicios"],
    ["Galería", "galeria"],
    ["El barbero", "barbero"],
  ];

  return (
    <main className="site-shell">
      <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <button className="wordmark" onClick={() => scrollToId("top")} aria-label="Corte Norte, volver al inicio">
          <span className="wordmark-mark"><Scissors size={16} strokeWidth={1.5} /></span>
          <span>Corte<br /><em>Norte</em></span>
        </button>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navItems.map(([label, id]) => <button key={id} onClick={() => scrollToId(id)}>{label}</button>)}
        </nav>
        <button className="nav-cta" onClick={() => setBookingOpen(true)}>Reservar <ArrowUpRight size={15} /></button>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>
      {menuOpen && <div className="mobile-menu">{navItems.map(([label, id]) => <button key={id} onClick={() => { scrollToId(id); setMenuOpen(false); }}>{label}</button>)}<button className="mobile-book" onClick={() => { setBookingOpen(true); setMenuOpen(false); }}>Reservar una cita <ArrowUpRight size={16} /></button></div>}

      <section id="top" className="hero-section">
        <img className="hero-image" src={assets.hero} alt="Interior cálido de Corte Norte" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">Barbería de autor · Guayaquil</p>
          <h1>El oficio<br /><em>de estar bien.</em></h1>
          <p className="hero-copy">Cortes precisos, rituales pausados y una casa hecha para volver a ti.</p>
          <button className="outline-button light-button" onClick={() => setBookingOpen(true)}>Encontrar mi corte <ArrowUpRight size={16} /></button>
        </div>
        <div className="hero-footer"><span>Desde 2018</span><span className="hero-line" /><span>Scroll para descubrir <ArrowDown size={14} /></span></div>
      </section>

      <section id="casa" className="manifesto-section section-pad">
        <div className="manifesto-index">01 <span>/</span> 04</div>
        <div className="manifesto-grid">
          <div className="manifesto-heading"><p className="eyebrow">La casa</p><h2>Menos ruido.<br /><em>Más oficio.</em></h2></div>
          <div className="manifesto-copy"><p className="lead">Corte Norte es una barbería de barrio con obsesión por el detalle. Aquí el tiempo baja un cambio: se conversa, se escucha y se trabaja con las manos.</p><p>Entrar es dejar la prisa en la puerta. Salir es llevarse una versión más nítida de uno mismo.</p><button className="text-button" onClick={() => scrollToId("servicios")}>Conoce nuestra forma de hacer <ArrowUpRight size={15} /></button></div>
        </div>
        <div className="manifesto-image-wrap"><img src={assets.barber} alt="Barbero trabajando con precisión" /><span className="image-note">La precisión también<br />puede sentirse.</span></div>
      </section>

      <section id="servicios" className="services-section section-pad dark-section">
        <div className="section-topline"><p className="eyebrow light">El menú</p><span>Servicios / 2024</span></div>
        <div className="section-title-row"><h2>Tu próximo<br /><em>mejor corte.</em></h2><p>Una carta corta, pensada para que cada visita tenga su propio ritmo.</p></div>
        <div className="services-list">{services.map((service) => <button className="service-row" key={service.number} onClick={() => setBookingOpen(true)}><span className="service-number">{service.number}</span><img src={service.image} alt="" /><span className="service-name">{service.name}<small>{service.detail}</small></span><span className="service-price">{service.price}</span><ArrowUpRight className="service-arrow" size={20} /></button>)}</div>
        <div className="service-note"><Check size={15} /> Todos los servicios incluyen consulta, lavado y acabado.</div>
      </section>

      <section className="ritual-section section-pad">
        <div className="ritual-image"><img src={assets.interior} alt="Interior de la barbería" /><span>02 / El ritual</span></div>
        <div className="ritual-copy"><p className="eyebrow">La experiencia</p><h2>Un buen corte<br />empieza <em>antes.</em></h2><p>Desde que cruzas la puerta, todo está pensado para que bajes el ritmo. Una bebida, una conversación y el ojo entrenado de quien lleva años haciendo lo mismo — pero nunca de la misma manera.</p><div className="ritual-stats"><div><strong>45'</strong><span>de atención<br />sin prisa</span></div><div><strong>01</strong><span>barbero<br />para ti</span></div><div><strong>∞</strong><span>formas de<br />llevarlo</span></div></div></div>
      </section>

      <section id="galeria" className="gallery-section section-pad sand-section">
        <div className="section-topline"><p className="eyebrow">El resultado</p><span>Galería / Selección</span></div>
        <div className="section-title-row"><h2>Hecho para<br /><em>verse bien.</em></h2><p>Un corte no necesita explicar demasiado. Solo sentirse propio.</p></div>
        <div className="gallery-grid">{gallery.map((item, index) => <div className={`gallery-card gallery-${index + 1}`} key={item.label}><img src={item.src} alt={item.label} /><div className="gallery-caption"><span>{item.label}</span><small>{item.tone}</small></div></div>)}</div>
      </section>

      <section id="barbero" className="barber-section section-pad">
        <div className="barber-copy"><p className="eyebrow">Detrás del sillón</p><h2>Manos que<br /><em>recuerdan.</em></h2><p className="lead">"Aprendí que un gran corte no cambia quién eres. Solo hace que se note mejor."</p><p>Mateo lleva más de una década afinando su oficio entre navajas, tijeras y conversaciones. Su especialidad: entender lo que quieres incluso cuando todavía no sabes explicarlo.</p><button className="text-button" onClick={() => setBookingOpen(true)}>Habla con Mateo <ArrowUpRight size={15} /></button></div>
        <div className="barber-portrait"><img src={assets.portrait} alt="Mateo, fundador y barbero de Corte Norte" /><div className="portrait-label"><span>Mateo R.</span><small>Fundador / barbero</small></div></div>
      </section>

      <section className="products-section section-pad dark-section">
        <div className="product-image"><img src={assets.product} alt="Productos de cuidado masculino" /><span className="vertical-label">Cuidado después del corte</span></div>
        <div className="product-copy"><p className="eyebrow light">Para llevar</p><h2>El corte<br /><em>continúa.</em></h2><p>Una selección de productos honestos para que el trabajo del sillón dure hasta tu próxima visita.</p><div className="product-list"><span>01&nbsp;&nbsp; Arcilla mate</span><span>02&nbsp;&nbsp; Aceite de barba</span><span>03&nbsp;&nbsp; Tónico diario</span></div><button className="outline-button light-button" onClick={() => setBookingOpen(true)}>Preguntar por productos <ArrowUpRight size={15} /></button></div>
      </section>

      <section className="quote-section section-pad"><div className="quote-mark">"</div><blockquote>Salí sintiendo que por fin mi pelo y yo estábamos del mismo lado.</blockquote><div className="quote-byline"><span className="quote-line" /> Andrés M. · Cliente desde 2021</div></section>

      <section id="contacto" className="contact-section"><img src={assets.contact} alt="Fachada de Corte Norte al anochecer" /><div className="contact-overlay" /><div className="contact-content"><p className="eyebrow light">La próxima visita</p><h2>Nos vemos<br /><em>en el norte.</em></h2><button className="outline-button light-button" onClick={() => setBookingOpen(true)}>Reservar una cita <ArrowUpRight size={16} /></button></div><div className="contact-details"><div><span className="detail-label"><MapPin size={14} /> Encuéntranos</span><p>Av. Carlos Julio Arosemena<br />Guayaquil, Ecuador</p></div><div><span className="detail-label"><Clock3 size={14} /> Horarios</span><p>Mar — Sáb / 09:00 — 19:00<br />Domingo / 10:00 — 15:00</p></div><div><span className="detail-label"><Phone size={14} /> Hablemos</span><p>+593 99 000 1840<br />hola@cortenorte.ec</p></div></div></section>

      <footer className="site-footer"><div className="footer-brand"><span className="wordmark-mark"><Scissors size={16} strokeWidth={1.5} /></span><span>Corte Norte<br /><em>Barbería de autor</em></span></div><div className="footer-links"><button onClick={() => scrollToId("servicios")}>Servicios</button><button onClick={() => scrollToId("galeria")}>Galería</button><button onClick={() => setBookingOpen(true)}>Reservar</button></div><a className="instagram-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={17} /> @cortenorte</a><span className="copyright">© 2024 Corte Norte</span></footer>

      {bookingOpen && <div className="booking-backdrop" onClick={() => setBookingOpen(false)}><div className="booking-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setBookingOpen(false)}><X size={20} /></button><p className="eyebrow">Agenda tu visita</p><h3>Un buen corte<br /><em>te está esperando.</em></h3><p>Escíbenos por WhatsApp y cuéntanos qué tienes en mente. Te respondemos con horarios disponibles.</p><a className="modal-action" href="https://wa.me/593990001840" target="_blank" rel="noreferrer"><Phone size={16} /> Abrir WhatsApp <ArrowUpRight size={15} /></a><div className="modal-meta"><CalendarDays size={15} /> Mar — Sáb, 09:00 — 19:00</div></div></div>}
    </main>
  );
}

export { assets };
