// Shared prototype data for the client app (conta.html).
// Fictional demo data. In the product this comes from the API.
window.DBB = (() => {
  const TZ = "America/Sao_Paulo";
  const EQUIPE = [
    { id: "rafael", nome: "Rafael", foto: "assets/equipe/rafael.webp" },
    { id: "bruno", nome: "Bruno", foto: "assets/equipe/bruno.webp" },
    { id: "caio", nome: "Caio", foto: "assets/equipe/caio.webp" },
    { id: "bigode", nome: "Bigode", foto: "assets/equipe/bigode.webp" },
    { id: "leo", nome: "Léo", foto: "assets/equipe/leo.webp" },
    { id: "vini", nome: "Vini", foto: null }
  ];
  // Same order/indexes as index.html, so links and history stay compatible
  const SERVICOS = [
    { g: "Cabelo", n: "Cabelo", d: "Corte completo, com degradê", p: 60, m: 30, top: 1 },
    { g: "Cabelo", n: "Corte máquina", d: "Sem degradê", p: 43, m: 20 },
    { g: "Cabelo", n: "Corte Kids", d: "Até 10 anos", p: 57, m: 30, top: 1 },
    { g: "Cabelo", n: "Recorte do cabelo", d: "Pezinho", p: 22, m: 10 },
    { g: "Barba", n: "Barba", d: "Toalha quente e navalha", p: 52, m: 30, top: 1 },
    { g: "Barba", n: "Barba na máquina", d: "Sem toalha quente e sem lâmina", p: 38, m: 20 },
    { g: "Barba", n: "Acabamento da barba", d: "Linhas da bochecha e pescoço", p: 22, m: 10 },
    { g: "Barba", n: "Tonalização de barba", p: 44, m: 20 },
    { g: "Combos", n: "Cabelo e Barba", p: 105, m: 60, top: 1 },
    { g: "Combos", n: "Cabelo, Barba e Sobrancelha", p: 116, m: 60 },
    { g: "Combos", n: "Combo executivo", d: "Cabelo, barba, sobrancelha e limpeza nasal", p: 132, m: 60, top: 1 },
    { g: "Combos", n: "Cabelo, Barba e Limpeza nasal", d: "Cera quente", p: 124, m: 60 },
    { g: "Combos", n: "Cabelo e Barba na máquina", d: "Sem toalha quente e sem lâmina", p: 98, m: 50 },
    { g: "Combos", n: "Corte máquina e Barba", d: "Corte sem degradê", p: 86, m: 40 },
    { g: "Cuidados", n: "Sobrancelha", d: "Na navalha", p: 24, m: 10 },
    { g: "Cuidados", n: "Limpeza dos pelos do nariz", d: "Cera quente", p: 26, m: 10 },
    { g: "Cuidados", n: "Hidratação capilar", p: 26, m: 10 },
    { g: "Cuidados", n: "Cabelo e Hidratação", p: 80, m: 30 },
    { g: "Cuidados", n: "Relaxamento capilar", p: 110, m: 60, from: 1 },
    { g: "Cuidados", n: "Tonalização de cabelo", p: null, m: 20 },
    { g: "Cuidados", n: "Prótese capilar + corte", d: "Aplicação", p: 250, m: 120 }
  ];
  const HORAS = { 0: null, 1: [540, 1200], 2: [540, 1200], 3: [540, 1200], 4: [540, 1200], 5: [540, 1200], 6: [510, 960] };
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  const now = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "numeric", minute: "numeric", hour12: false, year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(new Date()).map(x => [x.type, x.value]));
    return { wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), min: (+p.hour % 24) * 60 + +p.minute, y: +p.year, mo: +p.month, d: +p.day };
  };
  const days = (n = 14) => {
    const { y, mo, d } = now(), base = Date.UTC(y, mo - 1, d, 12), out = [];
    for (let i = 0; i < n; i++) {
      const dt = new Date(base + i * 864e5), wd = dt.getUTCDay();
      out.push({ i, wd, y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate(), open: !!HORAS[wd] });
    }
    return out;
  };
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; };
  // Simulated availability (same rule as the site)
  const slots = (day, bar, dur) => {
    const h = HORAS[day.wd]; if (!h) return [];
    const nowMin = day.i === 0 ? now().min : -1, out = [];
    for (let m = h[0]; m + dur <= h[1]; m += 30) {
      if (m <= nowMin + 15) continue;
      out.push({ m, taken: hash(`${day.i}-${bar || "any"}-${m}`) < (bar && bar !== "any" ? .42 : .18) });
    }
    return out;
  };
  const brl = v => v == null ? "Consultar" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { EQUIPE, SERVICOS, HORAS, DIAS, now, days, slots, brl, hhmm };
})();
