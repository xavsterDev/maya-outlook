(function () {
  const DIR_COLORS = {
    "Este":  { bg: "#B7362E", ink: "#FFFFFF", mark: "#B7362E" },
    "Oeste": { bg: "#221E1C", ink: "#EDE6D6", mark: "#221E1C" },
    "Norte": { bg: "#FBF9F3", ink: "#2A2320", mark: "#9A9083" },   /* chalk band, ash marks */
    "Sur":   { bg: "#E0B22B", ink: "#2A2320", mark: "#C99A14" }
  };
  const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const DAYS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const $ = (id) => document.getElementById(id);

  // Maya bar-and-dot numeral 1..13
  function numeral(svg, n, color, scale) {
    const bars = Math.floor(n / 5), dots = n % 5, s = scale || 1;
    const dotR = 5 * s, gap = 6 * s, barH = 7 * s, barW = Math.max(dots * (dotR * 2 + gap) - gap, 4 * (dotR * 2 + gap) - gap);
    let y = 0, out = "";
    if (dots) {
      const total = dots * (dotR * 2) + (dots - 1) * gap;
      const x0 = dotR;
      for (let i = 0; i < dots; i++) out += `<circle cx="${x0 + i * (dotR * 2 + gap)}" cy="${dotR}" r="${dotR}" fill="${color}"/>`;
      y = dotR * 2 + gap;
    }
    for (let b = 0; b < bars; b++) { out += `<rect x="0" y="${y}" width="${barW}" height="${barH}" rx="${1.5 * s}" fill="${color}"/>`; y += barH + gap * 0.7; }
    svg.setAttribute("viewBox", `0 0 ${barW} ${Math.max(y, dotR * 2)}`);
    svg.setAttribute("height", Math.round(Math.max(y, dotR * 2)));
    svg.setAttribute("width", Math.round(barW));
    svg.innerHTML = out;
  }

  function render(date) {
    const r = MayaCalendar.mayaDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const nw = NAWAL_DATA.nawales[r.cholqij.index];
    const ybw = NAWAL_DATA.nawales[r.yearBearer.index];
    const c = DIR_COLORS[nw.direccion];
    document.documentElement.style.setProperty("--band", c.bg);
    document.documentElement.style.setProperty("--dir", c.mark);
    document.documentElement.style.setProperty("--dir-ink", c.ink);
    const isToday = date.toDateString() === new Date().toDateString();
    $("when").textContent = (isToday ? "Hoy, " : "") + `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    $("today").hidden = isToday;
    numeral($("num-day"), r.cholqij.number, c.mark, 1.8);
    numeral($("num-mam"), r.yearBearer.number, DIR_COLORS[ybw.direccion].mark, 0.8);
    $("day").textContent = r.cholqij.label;
    $("mam").textContent = r.yearBearer.label;
    $("dir").textContent = nw.direccion;
    $("elem").textContent = nw.elemento;
    $("energy").textContent = nw.energiaDelDia.replace(/\s*\(Barrios[^)]*\)/, "");
    $("clave").textContent = nw.clave;
    $("desarrollo").textContent = nw.desarrollo;
    $("yuc").textContent = nw.yucateco;
    $("mex").textContent = nw.mexica;
    $("haab").textContent = r.haab.label;
    $("lc").textContent = r.longCount.label;
    const ys = r.yearBearer.yearStart;
    $("ystart").textContent = `${ys.d} ${MONTHS[ys.m - 1]} ${ys.y}`;
    $("src").innerHTML = NAWAL_DATA._meta.status.startsWith("DRAFT")
      ? `<span class="draft">Texto en borrador, pendiente de validación.</span>` : "";
    document.title = `${r.cholqij.label} · Energía del día`;
    const d = $("date"); d.value = date.toISOString().slice(0, 10);
  }

  function fromInput() {
    const v = $("date").value; if (!v) return;
    const [y, m, d] = v.split("-").map(Number);
    render(new Date(y, m - 1, d));
  }

  // Read the date of the selected Outlook item (appointment start, or message received date).
  function itemDate(cb) {
    try {
      const item = window.Office && Office.context && Office.context.mailbox && Office.context.mailbox.item;
      if (!item) return cb(null);
      if (item.start instanceof Date) return cb(item.start);                       // appointment, read mode
      if (item.start && item.start.getAsync) return item.start.getAsync(r => cb(r.status === "succeeded" ? r.value : null)); // compose
      if (item.dateTimeCreated instanceof Date) return cb(item.dateTimeCreated);   // message
      cb(null);
    } catch (e) { cb(null); }
  }

  function init() {
    itemDate((d) => render(d || new Date()));
    $("date").addEventListener("change", fromInput);
    $("today").addEventListener("click", () => render(new Date()));
  }

  if (window.Office && Office.onReady) Office.onReady(init); else document.addEventListener("DOMContentLoaded", init);
})();
