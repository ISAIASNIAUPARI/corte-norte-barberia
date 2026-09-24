import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Instagram, MapPin, Phone, Scissors, X } from "lucide-react";

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
  { number: "01", name: "Corte clásico", detail: "Tijera, máquina y acabado a navaja", price: "$18", time: "40 min", image: assets.classic },
  { number: "02", name: "Fade contemporáneo", detail: "Degradado personalizado + styling", price: "$22", time: "45 min", image: assets.fade },
  { number: "03", name: "Barba de autor", detail: "Perfilado, toalla caliente y aceite", price: "$16", time: "30 min", image: assets.beard },
  { number: "04", name: "Ritual completo", detail: "Corte + barba + tratamiento express", price: "$34", time: "75 min", image: assets.shave },
];

const gallery = [
  { src: assets.classic, label: "Corte clásico", tone: "Madera / precisión" },
  { src: assets.fade, label: "Fade limpio", tone: "Textura / contraste" },
  { src: assets.beard, label: "Barba de autor", tone: "Ritual / detalle" },
  { src: assets.chair, label: "La estación", tone: "Cuero / cobre" },
  { src: assets.tools, label: "Las herramientas", tone: "Acero / oficio" },
  { src: assets.shave, label: "Toalla caliente", tone: "Calma / tradición" },
];

const navItems: [string, string][] = [
  ["La casa", "casa"],
  ["Servicios", "servicios"],
  ["Galería", "galeria"],
  ["El barbero", "barbero"],
  ["Visítanos", "contacto"],
];

// Horario en hora de Guayaquil (UTC-5). 0 = domingo.
const HOURS: Record<number, [number, number] | null> = { 0: [10, 15], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 19] };
const WHATSAPP = "593990001840";
const EASE = [0.23, 1, 0.32, 1] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
}

function guayaquilNow() {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 - 5 * 3600000);
}

function useOpenStatus() {
  const [status, setStatus] = useState(() => computeStatus());
  useEffect(() => {
    const t = setInterval(() => setStatus(computeStatus()), 60000);
    return () => clearInterval(t);
  }, []);
  return status;
}

function computeStatus() {
  const now = guayaquilNow();
  const h = HOURS[now.getDay()];
  const hour = now.getHours() + now.getMinutes() / 60;
  if (h && hour >= h[0] && hour < h[1]) return { open: true, text: `Abierto ahora · cierra ${h[1]}:00` };
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const hh = HOURS[d.getDay()];
    if (!hh || (i === 0 && hour >= hh[0])) continue;
    const day = i === 0 ? "hoy" : i === 1 ? "mañana" : d.toLocaleDateString("es-EC", { weekday: "long" });
    return { open: false, text: `Cerrado · abrimos ${day} ${hh[0]}:00` };
  }
  return { open: false, text: "Cerrado" };
}

/* ---------- Motion primitives ---------- */

function Lines({ lines, as = "h2", className, delay = 0 }: { lines: ReactNode[]; as?: "h1" | "h2" | "h3"; className?: string; delay?: number }) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-12% 0px" }} transition={{ staggerChildren: 0.11, delayChildren: delay }}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <motion.span className="line-inner" variants={{ hidden: { y: "110%", rotate: 2 }, show: { y: "0%", rotate: 0, transition: { duration: 1, ease: EASE } } }}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

function Reveal({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function ParallaxImage({ src, alt, className, strength = 60 }: { src: string; alt: string; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  return (
    <motion.div
      ref={ref}
      className={`parallax-frame ${className ?? ""}`}
      initial={{ clipPath: "inset(12% 8% 12% 8%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.3, ease: EASE }}
    >
      <motion.img src={src} alt={alt} style={{ y, scale: 1.18 }} loading="lazy" />
    </motion.div>
  );
}

function CountUp({ to, pad = 0, suffix = "" }: { to: number; pad?: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <strong ref={ref}>{String(val).padStart(pad, "0")}{suffix}</strong>;
}

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>{t}<Scissors size={18} strokeWidth={1.3} /></span>
        ))}
      </div>
    </div>
  );
}

function RotatingBadge({ onClick }: { onClick: () => void }) {
  return (
    <button className="rotating-badge" onClick={onClick} aria-label="Reservar una cita">
      <svg viewBox="0 0 120 120" className="badge-ring">
        <defs><path id="circlePath" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
        <text><textPath href="#circlePath">Reserva tu silla · Corte Norte · Guayaquil ·</textPath></text>
      </svg>
      <span className="badge-core"><ArrowUpRight size={22} strokeWidth={1.5} /></span>
    </button>
  );
}

function ScrollWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

function ScrollQuote({ text }: { text: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <blockquote ref={ref}>
      {words.map((w, i) => <ScrollWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />)}
    </blockquote>
  );
}

/* ---------- Booking ---------- */

function upcomingDays() {
  const base = guayaquilNow();
  const out: Date[] = [];
  for (let i = 0; out.length < 8 && i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const h = HOURS[d.getDay()];
    if (!h) continue;
    if (i === 0 && base.getHours() >= h[1] - 1) continue;
    out.push(d);
  }
  return out;
}

function slotsFor(d: Date) {
  const h = HOURS[d.getDay()];
  if (!h) return [];
  const now = guayaquilNow();
  const sameDay = d.toDateString() === now.toDateString();
  const out: string[] = [];
  for (let t = h[0]; t < h[1]; t += 1) {
    if (sameDay && t <= now.getHours()) continue;
    out.push(`${String(t).padStart(2, "0")}:00`);
  }
  return out;
}

function BookingSheet({ open, initialService, onClose }: { open: boolean; initialService: number | null; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<number | null>(initialService);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const days = useMemo(() => (open ? upcomingDays() : []), [open]);

  useEffect(() => {
    if (open) {
      setService(initialService);
      setStep(initialService !== null ? 1 : 0);
      setDayIdx(null);
      setSlot(null);
    }
  }, [open, initialService]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const day = dayIdx !== null ? days[dayIdx] : null;
  const s = service !== null ? services[service] : null;
  const dayLabel = day ? day.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" }) : "";
  const message = `Hola Corte Norte, soy ${name.trim() || "[tu nombre]"}. Me gustaría reservar: ${s?.name ?? ""} (${s?.price ?? ""}) el ${dayLabel} a las ${slot ?? ""}. ¿Está disponible?`;
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  const steps = ["Servicio", "Fecha", "Confirmar"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="booking-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside
            className="booking-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Reservar una cita"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="sheet-head">
              <p className="eyebrow">Agenda tu visita</p>
              <button className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
            </div>
            <ol className="stepper">
              {steps.map((label, i) => (
                <li key={label} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
                  <button disabled={i > step} onClick={() => setStep(i)}><span>{i < step ? <Check size={11} /> : `0${i + 1}`}</span>{label}</button>
                </li>
              ))}
            </ol>

            <div className="sheet-body">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}>
                    <h3>¿Qué te<br /><em>hacemos hoy?</em></h3>
                    <div className="pick-list">
                      {services.map((sv, i) => (
                        <button key={sv.number} className={`pick-service ${service === i ? "is-selected" : ""}`} onClick={() => { setService(i); setStep(1); }}>
                          <img src={sv.image} alt="" />
                          <span className="pick-name">{sv.name}<small>{sv.detail} · {sv.time}</small></span>
                          <span className="pick-price">{sv.price}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}>
                    <h3>¿Cuándo<br /><em>te esperamos?</em></h3>
                    <div className="day-strip">
                      {days.map((d, i) => (
                        <button key={d.toDateString()} className={`day-chip ${dayIdx === i ? "is-selected" : ""}`} onClick={() => { setDayIdx(i); setSlot(null); }}>
                          <small>{d.toLocaleDateString("es-EC", { weekday: "short" }).replace(".", "")}</small>
                          <strong>{d.getDate()}</strong>
                          <small>{d.toLocaleDateString("es-EC", { month: "short" }).replace(".", "")}</small>
                        </button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {day && (
                        <motion.div key={dayIdx} className="slot-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          {slotsFor(day).map((t) => (
                            <button key={t} className={`slot ${slot === t ? "is-selected" : ""}`} onClick={() => setSlot(t)}>{t}</button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="sheet-hint">Es tu hora preferida — te confirmamos disponibilidad por WhatsApp.</p>
                  </motion.div>
                )}
                {step === 2 && s && day && slot && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }}>
                    <h3>Casi<br /><em>listo.</em></h3>
                    <div className="summary">
                      <div><span>Servicio</span><strong>{s.name}</strong></div>
                      <div><span>Fecha</span><strong className="cap">{dayLabel}</strong></div>
                      <div><span>Hora</span><strong>{slot}</strong></div>
                      <div><span>Total</span><strong>{s.price}</strong></div>
                    </div>
                    <label className="name-field">
                      <span>Tu nombre</span>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamamos?" autoComplete="given-name" />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sheet-foot">
              {step > 0 ? <button className="back-link" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> Atrás</button> : <span className="modal-meta"><CalendarDays size={15} /> Mar — Sáb 09–19 · Dom 10–15</span>}
              {step === 1 && <button className="modal-action" disabled={!slot} onClick={() => setStep(2)}>Continuar <ArrowRight size={15} /></button>}
              {step === 2 && <a className="modal-action" href={waHref} target="_blank" rel="noreferrer" onClick={onClose}><Phone size={15} /> Enviar por WhatsApp</a>}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Lightbox ---------- */

function Lightbox({ index, onClose, onNav }: { index: number | null; onClose: () => void; onNav: (d: number) => void }) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onNav]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div className="lightbox" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="lb-close" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
          <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Anterior"><ChevronLeft size={26} /></button>
          <AnimatePresence mode="wait">
            <motion.figure key={index} onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: EASE }}>
              <img src={gallery[index].src} alt={gallery[index].label} />
              <figcaption><span>{gallery[index].label}</span><small>{String(index + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")} · {gallery[index].tone}</small></figcaption>
            </motion.figure>
          </AnimatePresence>
          <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Siguiente"><ChevronRight size={26} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [active, setActive] = useState("");
  const [booking, setBooking] = useState<{ open: boolean; service: number | null }>({ open: false, service: null });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const status = useOpenStatus();
  const year = new Date().getFullYear();

  const openBooking = (service: number | null = null) => { setMenuOpen(false); setBooking({ open: true, service }); };
  const closeBooking = useMemo(() => () => setBooking((b) => ({ ...b, open: false })), []);
  const closeLightbox = useMemo(() => () => setLightbox(null), []);
  const navLightbox = useMemo(() => (d: number) => setLightbox((i) => (i === null ? i : (i + d + gallery.length) % gallery.length)), []);

  // Page progress
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(heroP, [0, 1], ["0%", "22%"]);
  const heroContentY = useTransform(heroP, [0, 1], [0, -120]);
  const heroFade = useTransform(heroP, [0, 0.75], [1, 0]);

  // Service hover preview that trails the cursor
  const listRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 180, damping: 22 });
  const py = useSpring(my, { stiffness: 180, damping: 22 });
  const rot = useTransform(px, [0, 1200], [-6, 6]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setPastHero(y > window.innerHeight * 0.8);
      setHidden(y > last && y > 400);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    navItems.forEach(([, id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="site-shell">
        <div className="grain" aria-hidden="true" />
        <motion.div className="scroll-progress" style={{ scaleX: progress }} />

        {/* Intro curtain */}
        <motion.div className="intro-curtain" initial={{ y: 0 }} animate={{ y: "-100%" }} transition={{ duration: 1, delay: 0.9, ease: [0.76, 0, 0.24, 1] }} aria-hidden="true">
          <motion.div className="intro-mark" initial={{ opacity: 0, y: 20 }} animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }} transition={{ duration: 1.5, times: [0, 0.3, 0.7, 1] }}>
            <Scissors size={22} strokeWidth={1.3} />
            <span>Corte <em>Norte</em></span>
          </motion.div>
        </motion.div>

        <motion.header className={`site-nav ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "menu-is-open" : ""}`} animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }} transition={{ duration: 0.4, ease: EASE }}>
          <button className="wordmark" onClick={() => scrollToId("top")} aria-label="Corte Norte, volver al inicio">
            <span className="wordmark-mark"><Scissors size={16} strokeWidth={1.5} /></span>
            <span>Corte<br /><em>Norte</em></span>
          </button>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map(([label, id]) => (
              <button key={id} onClick={() => scrollToId(id)} className={active === id ? "is-active" : ""}>
                {label}
                {active === id && <motion.span layoutId="nav-dot" className="nav-dot" />}
              </button>
            ))}
          </nav>
          <span className={`status-pill ${status.open ? "is-open" : ""}`}><i />{status.open ? "Abierto" : "Cerrado"}</span>
          <button className="nav-cta" onClick={() => openBooking()}>Reservar <ArrowUpRight size={15} /></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}>
            <span className={`burger ${menuOpen ? "is-x" : ""}`}><i /><i /></span>
          </button>
        </motion.header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className="mobile-menu" initial={{ clipPath: "circle(0% at 92% 4%)" }} animate={{ clipPath: "circle(150% at 92% 4%)" }} exit={{ clipPath: "circle(0% at 92% 4%)" }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}>
              <nav>
                {navItems.map(([label, id], i) => (
                  <motion.button key={id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: EASE }} onClick={() => { setMenuOpen(false); setTimeout(() => scrollToId(id), 350); }}>
                    <small>0{i + 1}</small>{label}
                  </motion.button>
                ))}
              </nav>
              <motion.div className="mobile-menu-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <span className={`status-line ${status.open ? "is-open" : ""}`}><i />{status.text}</span>
                <button className="modal-action" onClick={() => openBooking()}>Reservar una cita <ArrowUpRight size={16} /></button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section id="top" ref={heroRef} className="hero-section">
          <motion.div className="hero-media" style={{ y: heroImgY }}>
            <motion.img className="hero-image" src={assets.hero} alt="Interior cálido de Corte Norte" initial={{ scale: 1.25 }} animate={{ scale: 1.05 }} transition={{ duration: 2.6, delay: 0.9, ease: EASE }} />
          </motion.div>
          <div className="hero-overlay" />
          <motion.div className="hero-content" style={{ y: heroContentY, opacity: heroFade }}>
            <motion.p className="eyebrow light" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>Barbería de autor · Guayaquil</motion.p>
            <Lines as="h1" lines={["El oficio", <em key="e">de estar bien.</em>]} delay={1.45} />
            <motion.p className="hero-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.9, ease: EASE }}>Cortes precisos, rituales pausados y una casa hecha para volver a ti.</motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.05, duration: 0.9, ease: EASE }}>
              <button className="fill-button" onClick={() => openBooking()}><span>Reservar mi silla</span> <ArrowUpRight size={16} /></button>
              <button className="ghost-link" onClick={() => scrollToId("servicios")}>Ver servicios</button>
            </motion.div>
          </motion.div>
          <motion.div className="hero-badge-wrap" initial={{ opacity: 0, scale: 0.6, rotate: -40 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 2.2, duration: 1.1, ease: EASE }}>
            <RotatingBadge onClick={() => openBooking()} />
          </motion.div>
          <motion.div className="hero-footer" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 2.3, duration: 1 }}>
            <span>Desde 2018</span>
            <span className="hero-line"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.4, duration: 1.4, ease: EASE }} /></span>
            <span className={`status-line ${status.open ? "is-open" : ""}`}><i />{status.text}</span>
            <button className="scroll-cue" onClick={() => scrollToId("casa")}>Descubrir <ArrowDown size={14} /></button>
          </motion.div>
        </section>

        <Marquee items={["Corte clásico", "Fade contemporáneo", "Barba de autor", "Toalla caliente", "Ritual completo", "Navaja"]} />

        {/* MANIFESTO */}
        <section id="casa" className="manifesto-section section-pad">
          <div className="manifesto-index">01 <span>/</span> 04</div>
          <div className="manifesto-grid">
            <div className="manifesto-heading">
              <Reveal><p className="eyebrow">La casa</p></Reveal>
              <Lines lines={["Menos ruido.", <em key="e">Más oficio.</em>]} />
            </div>
            <Reveal className="manifesto-copy" delay={0.15}>
              <p className="lead">Corte Norte es una barbería de barrio con obsesión por el detalle. Aquí el tiempo baja un cambio: se conversa, se escucha y se trabaja con las manos.</p>
              <p>Entrar es dejar la prisa en la puerta. Salir es llevarse una versión más nítida de uno mismo.</p>
              <button className="text-button" onClick={() => scrollToId("servicios")}>Conoce nuestra forma de hacer <ArrowUpRight size={15} /></button>
            </Reveal>
          </div>
          <div className="manifesto-image-wrap">
            <ParallaxImage src={assets.barber} alt="Barbero trabajando con precisión" className="ratio-4-3" />
            <Reveal className="image-note" delay={0.4}>La precisión también<br />puede sentirse.</Reveal>
          </div>
        </section>

        {/* SERVICES */}
        <section id="servicios" className="services-section section-pad dark-section">
          <Reveal className="section-topline"><p className="eyebrow light">El menú</p><span>Servicios / {year}</span></Reveal>
          <div className="section-title-row">
            <Lines lines={["Tu próximo", <em key="e">mejor corte.</em>]} />
            <Reveal delay={0.2}><p>Una carta corta, pensada para que cada visita tenga su propio ritmo. Toca un servicio para reservarlo.</p></Reveal>
          </div>
          <div
            className="services-list"
            ref={listRef}
            onMouseMove={(e) => {
              const r = listRef.current?.getBoundingClientRect();
              if (!r) return;
              mx.set(e.clientX - r.left);
              my.set(e.clientY - r.top);
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div className="service-preview" style={{ x: px, y: py, rotate: rot }} animate={{ opacity: hovered === null ? 0 : 1, scale: hovered === null ? 0.6 : 1 }} transition={{ duration: 0.35, ease: EASE }} aria-hidden="true">
              {services.map((s, i) => (
                <motion.img key={s.number} src={s.image} alt="" animate={{ opacity: hovered === i ? 1 : 0, scale: hovered === i ? 1 : 1.15 }} transition={{ duration: 0.45, ease: EASE }} />
              ))}
            </motion.div>
            {services.map((service, i) => (
              <motion.button
                className="service-row"
                key={service.number}
                onClick={() => openBooking(i)}
                onMouseEnter={() => setHovered(i)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
              >
                <span className="service-number">{service.number}</span>
                <img src={service.image} alt="" />
                <span className="service-name">{service.name}<small>{service.detail} · {service.time}</small></span>
                <span className="service-price">{service.price}</span>
                <span className="service-cta">Reservar <ArrowUpRight size={16} /></span>
              </motion.button>
            ))}
          </div>
          <Reveal className="service-note"><Check size={15} /> Todos los servicios incluyen consulta, lavado y acabado.</Reveal>
        </section>

        {/* RITUAL */}
        <section className="ritual-section section-pad">
          <div className="ritual-image">
            <ParallaxImage src={assets.interior} alt="Interior de la barbería" className="ratio-4-5" strength={50} />
            <span>02 / El ritual</span>
          </div>
          <div className="ritual-copy">
            <Reveal><p className="eyebrow">La experiencia</p></Reveal>
            <Lines lines={["Un buen corte", <>empieza <em>antes.</em></>]} />
            <Reveal delay={0.15}><p>Desde que cruzas la puerta, todo está pensado para que bajes el ritmo. Una bebida, una conversación y el ojo entrenado de quien lleva años haciendo lo mismo — pero nunca de la misma manera.</p></Reveal>
            <Reveal className="ritual-stats" delay={0.25}>
              <div><CountUp to={45} suffix="'" /><span>de atención<br />sin prisa</span></div>
              <div><CountUp to={1} pad={2} /><span>barbero<br />para ti</span></div>
              <div><strong className="infinity">∞</strong><span>formas de<br />llevarlo</span></div>
            </Reveal>
          </div>
        </section>

        {/* GALLERY */}
        <section id="galeria" className="gallery-section section-pad sand-section">
          <Reveal className="section-topline"><p className="eyebrow">El resultado</p><span>Galería / Selección</span></Reveal>
          <div className="section-title-row">
            <Lines lines={["Hecho para", <em key="e">verse bien.</em>]} />
            <Reveal delay={0.2}><p>Un corte no necesita explicar demasiado. Solo sentirse propio.</p></Reveal>
          </div>
          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <motion.button
                className={`gallery-card gallery-${index + 1}`}
                key={item.label}
                onClick={() => setLightbox(index)}
                aria-label={`Ampliar: ${item.label}`}
                initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 1.1, delay: (index % 3) * 0.12, ease: EASE }}
              >
                <img src={item.src} alt={item.label} loading="lazy" />
                <span className="gallery-zoom"><ArrowUpRight size={18} /></span>
                <div className="gallery-caption"><span>{item.label}</span><small>{item.tone}</small></div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* BARBER */}
        <section id="barbero" className="barber-section section-pad">
          <div className="barber-copy">
            <Reveal><p className="eyebrow">Detrás del sillón</p></Reveal>
            <Lines lines={["Manos que", <em key="e">recuerdan.</em>]} />
            <Reveal delay={0.1}><p className="lead">"Aprendí que un gran corte no cambia quién eres. Solo hace que se note mejor."</p></Reveal>
            <Reveal delay={0.2}>
              <p>Mateo lleva más de una década afinando su oficio entre navajas, tijeras y conversaciones. Su especialidad: entender lo que quieres incluso cuando todavía no sabes explicarlo.</p>
              <button className="text-button" onClick={() => openBooking()}>Reserva con Mateo <ArrowUpRight size={15} /></button>
            </Reveal>
          </div>
          <div className="barber-portrait">
            <ParallaxImage src={assets.portrait} alt="Mateo, fundador y barbero de Corte Norte" className="ratio-3-4" strength={40} />
            <Reveal className="portrait-label" delay={0.4} y={16}><span>Mateo R.</span><small>Fundador / barbero</small></Reveal>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="products-section section-pad dark-section">
          <div className="product-image">
            <ParallaxImage src={assets.product} alt="Productos de cuidado masculino" className="ratio-4-3" strength={35} />
            <span className="vertical-label">Cuidado después del corte</span>
          </div>
          <div className="product-copy">
            <Reveal><p className="eyebrow light">Para llevar</p></Reveal>
            <Lines lines={["El corte", <em key="e">continúa.</em>]} />
            <Reveal delay={0.15}><p>Una selección de productos honestos para que el trabajo del sillón dure hasta tu próxima visita.</p></Reveal>
            <div className="product-list">
              {["Arcilla mate", "Aceite de barba", "Tónico diario"].map((p, i) => (
                <motion.span key={p} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: EASE }}>
                  <b>0{i + 1}</b>{p}
                </motion.span>
              ))}
            </div>
            <Reveal delay={0.3}>
              <a className="outline-button light-button" href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola Corte Norte, quiero preguntar por los productos de cuidado.")}`} target="_blank" rel="noreferrer">Preguntar por productos <ArrowUpRight size={15} /></a>
            </Reveal>
          </div>
        </section>

        {/* QUOTE */}
        <section className="quote-section section-pad">
          <div className="quote-mark">"</div>
          <ScrollQuote text="Salí sintiendo que por fin mi pelo y yo estábamos del mismo lado." />
          <Reveal className="quote-byline"><span className="quote-line" /> Andrés M. · Cliente desde 2021</Reveal>
        </section>

        {/* CONTACT */}
        <section id="contacto" className="contact-section">
          <ParallaxImage src={assets.contact} alt="Fachada de Corte Norte al anochecer" className="contact-bg" strength={80} />
          <div className="contact-overlay" />
          <div className="contact-content">
            <Reveal><p className="eyebrow light">La próxima visita</p></Reveal>
            <Lines lines={["Nos vemos", <em key="e">en el norte.</em>]} />
            <Reveal delay={0.2} className="contact-actions">
              <button className="fill-button" onClick={() => openBooking()}><span>Reservar una cita</span> <ArrowUpRight size={16} /></button>
              <span className={`status-line ${status.open ? "is-open" : ""}`}><i />{status.text}</span>
            </Reveal>
          </div>
          <div className="contact-details">
            <Reveal><a href="https://maps.google.com/?q=Av.+Carlos+Julio+Arosemena,+Guayaquil" target="_blank" rel="noreferrer" className="detail-link"><span className="detail-label"><MapPin size={14} /> Encuéntranos</span><p>Av. Carlos Julio Arosemena<br />Guayaquil, Ecuador</p><ArrowUpRight className="detail-arrow" size={16} /></a></Reveal>
            <Reveal delay={0.1}><div className="detail-link"><span className="detail-label"><Clock3 size={14} /> Horarios</span><p>Mar — Sáb / 09:00 — 19:00<br />Domingo / 10:00 — 15:00</p></div></Reveal>
            <Reveal delay={0.2}><a href="tel:+593990001840" className="detail-link"><span className="detail-label"><Phone size={14} /> Hablemos</span><p>+593 99 000 1840<br />hola@cortenorte.ec</p><ArrowUpRight className="detail-arrow" size={16} /></a></Reveal>
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-brand"><span className="wordmark-mark"><Scissors size={16} strokeWidth={1.5} /></span><span>Corte Norte<br /><em>Barbería de autor</em></span></div>
          <div className="footer-links">
            <button onClick={() => scrollToId("servicios")}>Servicios</button>
            <button onClick={() => scrollToId("galeria")}>Galería</button>
            <button onClick={() => openBooking()}>Reservar</button>
          </div>
          <a className="instagram-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={17} /> @cortenorte</a>
          <button className="back-top" onClick={() => scrollToId("top")} aria-label="Volver arriba"><ArrowDown size={16} style={{ transform: "rotate(180deg)" }} /></button>
          <span className="copyright">© {year} Corte Norte</span>
        </footer>

        {/* Mobile sticky booking */}
        <AnimatePresence>
          {pastHero && !booking.open && !menuOpen && (
            <motion.div className="sticky-book" initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ duration: 0.5, ease: EASE }}>
              <span className={`status-line ${status.open ? "is-open" : ""}`}><i />{status.open ? "Abierto ahora" : "Reserva para después"}</span>
              <button onClick={() => openBooking()}>Reservar <ArrowUpRight size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <BookingSheet open={booking.open} initialService={booking.service} onClose={closeBooking} />
        <Lightbox index={lightbox} onClose={closeLightbox} onNav={navLightbox} />
      </main>
    </MotionConfig>
  );
}

export { assets };
