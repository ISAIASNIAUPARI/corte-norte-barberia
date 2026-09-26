import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import "./session-journey.css";

gsap.registerPlugin(ScrollTrigger);

/* La sesión en Corte Norte: una escena fijada que el scroll recorre en seis momentos.
 * Cada momento usa solo 2–4 objetos; entran, trabajan y salen. */

const A = (n: string) => `/assets/sesion/${n}.webp`;

const moments = [
  { key: "entrar", label: "Entrar", title: ["Primero,", "el sillón."], text: "Cuero, cobre y un espejo sin prisa. Aquí empieza la pausa." },
  { key: "preparar", label: "Prepararse", title: ["La capa", "cae despacio."], text: "Papel al cuello, toalla a mano. Lo de afuera se queda afuera." },
  { key: "corte", label: "El corte", title: ["Máquina, peine", "y tijera."], text: "Primero la forma, después el carácter. Cada pasada tiene intención." },
  { key: "detalle", label: "El detalle", title: ["Donde se nota", "el oficio."], text: "Espuma tibia, navaja firme y el pulso de quien sabe." },
  { key: "cuidado", label: "Cuidado", title: ["Lo que hace", "que dure."], text: "Aceite para la barba, cera para el peinado y aire tibio para terminar." },
  { key: "resultado", label: "Resultado", title: ["Te levantas", "más nítido."], text: "La misma persona que entró. Solo que se nota mejor." },
];

// [clase, archivo, alt] — alt vacío para piezas decorativas
const objects: [string, string, string][] = [
  ["mirror", "espejo", ""],
  ["chair", "silla", "Sillón de barbería Corte Norte"],
  ["paper", "papel", ""],
  ["cape", "capa", "Capa de barbería"],
  ["towel", "toalla", ""],
  ["comb", "peine", ""],
  ["hair", "cabello", ""],
  ["clipper", "maquina", "Máquina profesional"],
  ["scissors", "tijeras", ""],
  ["hair2", "cabello", ""],
  ["razor", "navaja", "Navaja de barbero"],
  ["brush", "brocha", ""],
  ["dryer", "secador", ""],
  ["pomade", "pomada", "Pomada Corte Norte"],
  ["oil", "aceite", ""],
];

export default function SessionJourney({ onBook }: { onBook: () => void }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const q = (s: string) => el.querySelector(`.sj-${s}`) as HTMLElement;
      const vw = (n: number) => () => (window.innerWidth * n) / 100;
      const vh = (n: number) => () => (window.innerHeight * n) / 100;
      const copies = gsap.utils.toArray<HTMLElement>(".sj-copy", el);
      const nums = gsap.utils.toArray<HTMLElement>(".sj-num", el);

      gsap.set(".sj-obj, .sj-light", { xPercent: -50, yPercent: -50 }); // centrado por GSAP (no por CSS translate)

      const mm = gsap.matchMedia();
      mm.add(
        { small: "(max-width: 800px), (max-width: 1100px) and (orientation: portrait)", large: "(min-width: 801px)", reduce: "(prefers-reduced-motion: reduce)" },
        (c) => {
          const { small, reduce } = c.conditions as { small: boolean; reduce: boolean };
          const k = small ? 0.6 : 1; // menos recorrido en móvil


          // llegada: la silla aparece mientras la sección entra en pantalla (antes de fijarse)
          gsap.timeline({
            scrollTrigger: { trigger: el, start: "top 85%", end: "top top", scrub: 1, invalidateOnRefresh: true },
          })
            // anima la capa contenedora, no los objetos: así no compite con el timeline principal
            .fromTo(".sj-objects", { autoAlpha: 0, yPercent: 16, scale: 0.92 }, { autoAlpha: 1, yPercent: 0, scale: 1, ease: "power3.out" }, 0)
            .fromTo(".sj-light", { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.out" }, 0);

          const marks: number[] = [];
          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 1.4 },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: () => "+=" + window.innerHeight * (small ? 5 : 6.5),
              pin: ".sj-stage",
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const t = self.animation!.time();
                let n = 0;
                marks.forEach((m, i) => { if (t >= m) n = i; });
                setActive((p) => (p === n ? p : n));
                gsap.set(".sj-progress i", { scaleX: self.progress });
              },
            },
          });

          // estado inicial DENTRO del timeline: si ScrollTrigger recalcula a mitad de la escena
          // (fuentes, imágenes, barra del navegador en móvil) vuelve a partir de aquí y no del estado actual
          tl.set(".sj-obj", { autoAlpha: 0, x: 0, y: 0, rotation: 0, scale: 1 }, 0)
            .set(q("chair"), { autoAlpha: 1 }, 0)
            .set(q("mirror"), { autoAlpha: 0.95 }, 0)
            .set([...copies, ...nums], { autoAlpha: 0, y: 0, yPercent: 0 }, 0)
            .set([copies[0], nums[0]], { autoAlpha: 1 }, 0);

          const swap = (i: number, at: number) => {
            marks[i] = at + 0.5; // el índice cambia junto con el texto
            tl.to(copies[i - 1], { autoAlpha: 0, y: -24, duration: 0.6, ease: "power2.in" }, at)
              .fromTo(copies[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.9 }, at + 0.5)
              .to(nums[i - 1], { autoAlpha: 0, yPercent: -12, duration: 0.8, ease: "power2.in" }, at)
              .fromTo(nums[i], { autoAlpha: 0, yPercent: 12 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, at + 0.4);
          };
          marks[0] = 0;

          /* 01 · Entrar: la silla y el espejo respiran */
          tl.to(q("chair"), { rotation: -1.5, duration: 1, ease: "sine.inOut" }, 0.2)
            .to(q("mirror"), { y: vh(-3), duration: 1.2, ease: "none" }, 0);

          /* 02 · Prepararse: capa, papel, toalla — de uno en uno */
          swap(1, 1.1);
          tl.to(q("mirror"), { autoAlpha: 0, x: vw(6 * k), duration: 1 }, 1.1)
            .to(q("chair"), { autoAlpha: 0.35, scale: 0.92, y: vh(4), duration: 1.2 }, 1.3)
            .fromTo(q("cape"), { autoAlpha: 0, y: vh(-70), rotation: -8 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.6, ease: "power2.out" }, 1.4)
            .fromTo(q("towel"), { autoAlpha: 0, x: vw(40 * k), y: vh(8) }, { autoAlpha: 1, x: 0, y: 0 }, 2.6);
          if (!small) tl.fromTo(q("paper"), { autoAlpha: 0, x: vw(-35), rotation: -18 }, { autoAlpha: 1, x: 0, rotation: -4 }, 2.1);

          /* 03 · El corte: la escena se despeja y entran las herramientas */
          swap(2, 4.3);
          tl.to(q("cape"), { autoAlpha: 0, y: vh(-50), duration: 1.1, ease: "power2.in" }, 4.3)
            .to(q("towel"), { autoAlpha: 0, x: vw(35 * k), duration: 1, ease: "power2.in" }, 4.4)
            .to(q("paper"), { autoAlpha: 0, x: vw(-30), duration: 1, ease: "power2.in" }, 4.4)
            .to(q("chair"), { autoAlpha: 0, y: vh(20), duration: 1, ease: "power2.in" }, 4.4)
            .fromTo(q("clipper"), { autoAlpha: 0, y: vh(45), rotation: 14 }, { autoAlpha: 1, y: 0, rotation: -6, duration: 1.5 }, 5.1)
            .fromTo(q("scissors"), { autoAlpha: 0, x: vw(40 * k), y: vh(-18), rotation: 80 }, { autoAlpha: 1, x: 0, y: 0, rotation: 16, duration: 1.6 }, 5.6)
            .to(q("clipper"), { rotation: 2, y: vh(-1.5), duration: 1, ease: "sine.inOut" }, 7)
            .to(q("scissors"), { rotation: 6, duration: 1, ease: "sine.inOut" }, 7.1);
          if (!small) {
            tl.fromTo(q("comb"), { autoAlpha: 0, x: vw(18), rotation: -62 }, { autoAlpha: 1, x: 0, rotation: -28, duration: 1.5 }, 4.9)
              .fromTo(q("hair"), { autoAlpha: 0, y: vh(-22) }, { autoAlpha: 0.85, y: vh(16), duration: 2.6, ease: "none" }, 5.8);
          }

          /* 04 · El detalle: más cerca, más preciso */
          swap(3, 8);
          tl.to(q("clipper"), { autoAlpha: 0, y: vh(40), duration: 1, ease: "power2.in" }, 8)
            .to(q("scissors"), { autoAlpha: 0, x: vw(35 * k), rotation: 60, duration: 1, ease: "power2.in" }, 8)
            .to(q("comb"), { autoAlpha: 0, x: vw(-20), rotation: -80, duration: 1, ease: "power2.in" }, 8.1)
            .to(q("hair"), { autoAlpha: 0, duration: 0.6 }, 8)
            .fromTo(q("razor"), { autoAlpha: 0, x: vw(28 * k), rotation: 58, scale: 0.9 }, { autoAlpha: 1, x: 0, rotation: 14, scale: 1, duration: 1.5 }, 8.5)
            .fromTo(q("brush"), { autoAlpha: 0, y: vh(40) }, { autoAlpha: 1, y: 0, duration: 1.4 }, 9.1)
            .to(q("razor"), { rotation: -22, x: vw(-2 * k), duration: 1.6, ease: "sine.inOut" }, 10);   // una pasada lenta
          if (!small) tl.fromTo(q("hair2"), { autoAlpha: 0, y: vh(-8) }, { autoAlpha: 0.6, y: vh(10), duration: 2, ease: "none" }, 9.6);

          /* 05 · Cuidado y styling */
          swap(4, 11.8);
          tl.to(q("razor"), { autoAlpha: 0, x: vw(35 * k), rotation: 60, duration: 1, ease: "power2.in" }, 11.8)
            .to(q("brush"), { autoAlpha: 0, y: vh(35), duration: 1, ease: "power2.in" }, 11.9)
            .to(q("hair2"), { autoAlpha: 0, duration: 0.6 }, 11.8)
            .fromTo(q("pomade"), { autoAlpha: 0, y: vh(34), rotation: -14 }, { autoAlpha: 1, y: 0, rotation: -3 }, 12.3)
            .fromTo(q("oil"), { autoAlpha: 0, x: vw(26 * k), rotation: 20 }, { autoAlpha: 1, x: 0, rotation: 5 }, 12.8);
          if (!small) tl.fromTo(q("dryer"), { autoAlpha: 0, x: vw(36), y: vh(-26), rotation: -34 }, { autoAlpha: 1, x: 0, y: 0, rotation: -12, duration: 1.5 }, 13.3);

          /* 06 · Resultado: composición limpia, la silla vuelve */
          swap(5, 15.3);
          tl.to(q("pomade"), { autoAlpha: 0, y: vh(30), duration: 1, ease: "power2.in" }, 15.3)
            .to(q("oil"), { autoAlpha: 0, x: vw(26 * k), duration: 1, ease: "power2.in" }, 15.4)
            .to(q("dryer"), { autoAlpha: 0, x: vw(30), y: vh(-20), duration: 1, ease: "power2.in" }, 15.4)
            .fromTo(q("chair"), { autoAlpha: 0, y: vh(18), scale: 0.9, rotation: 0 }, { autoAlpha: 1, y: 0, scale: small ? 0.9 : 0.96, duration: 1.6, immediateRender: false }, 16)
            .fromTo(q("mirror"), { autoAlpha: 0, x: 0, y: vh(8) }, { autoAlpha: 0.4, y: 0, duration: 1.6, immediateRender: false }, 16.2);
          tl.to({}, { duration: 0.8 });

          // microinteracción: parallax suave con el cursor (solo desktop y sin reduced-motion)
          if (!small && !reduce) {
            const layer = el.querySelector(".sj-objects") as HTMLElement;
            const xTo = gsap.quickTo(layer, "x", { duration: 0.8, ease: "power3" });
            const yTo = gsap.quickTo(layer, "y", { duration: 0.8, ease: "power3" });
            const onMove = (e: PointerEvent) => {
              xTo((e.clientX / window.innerWidth - 0.5) * -18);
              yTo((e.clientY / window.innerHeight - 0.5) * -12);
            };
            el.addEventListener("pointermove", onMove);
            return () => el.removeEventListener("pointermove", onMove);
          }
        },
      );
    }, root);

    // precarga los objetos cuando la sección se acerca (lazy + opacidad 0 podía retrasarlos)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.querySelectorAll<HTMLImageElement>(".sj-obj").forEach((img) => { img.loading = "eager"; });
      io.disconnect();
    }, { rootMargin: "150% 0px" });
    io.observe(el);

    // fuentes e imágenes cambian alturas de secciones anteriores → recalcular posiciones
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => { window.removeEventListener("load", refresh); io.disconnect(); ctx.revert(); };
  }, []);

  return (
    <section ref={root} id="sesion" className="sj-section" aria-label="Una sesión en Corte Norte">
      <div className="sj-stage">
        <div className="sj-light" aria-hidden="true" />
        <div className="sj-nums" aria-hidden="true">
          {moments.map((m, i) => <span className="sj-num" key={m.key}>0{i + 1}</span>)}
        </div>

        <div className="sj-objects">
          {objects.map(([cls, file, alt]) => (
            <img key={cls} className={`sj-obj sj-${cls}`} src={A(file)} alt={alt} aria-hidden={alt ? undefined : true} loading="lazy" decoding="async" draggable={false} />
          ))}
        </div>

        <div className="sj-copywrap">
          <p className="eyebrow sj-eyebrow">Una sesión en Corte Norte</p>
          {moments.map((m, i) => (
            <div className="sj-copy" key={m.key} aria-hidden={active !== i}>
              <h2 className="sj-title">{m.title[0]}<br /><em>{m.title[1]}</em></h2>
              <p>{m.text}</p>
              {i === moments.length - 1 && (
                <button className="fill-button sj-cta" onClick={onBook} tabIndex={active === i ? 0 : -1}><span>Reservar mi silla</span> <ArrowUpRight size={16} /></button>
              )}
            </div>
          ))}
        </div>

        <div className="sj-foot" aria-hidden="true">
          <div className="sj-progress"><i /></div>
          <ol className="sj-steps">
            {moments.map((m, i) => (
              <li key={m.key} className={i === active ? "is-on" : i < active ? "is-done" : ""}><b>0{i + 1}</b>{m.label}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
