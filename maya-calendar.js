var MayaCalendar=(function(){
/**
 * maya-calendar.js — Cholq'ij / Ab' / Long Count engine (K'iche' tradition)
 * Correlation: GMT 584283 (matches the tables in Barrios, "El Libro del Destino").
 * Pure ES module, zero dependencies, timezone-safe (works on Y/M/D integers).
 */

const CORRELATION = 584283;

const NAWALES = [
  "Imox", "Iq'", "Aq'ab'al", "K'at", "Kan", "Kame", "Kej", "Q'anil", "Toj", "Tz'i'",
  "B'atz'", "E", "Aj", "I'x", "Tz'ikin", "Ajmaq", "No'j", "Tijax", "Kawoq", "Ajpu"
];

const HAAB_MONTHS = [
  "Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax",
  "Sak", "Kej", "Mak", "K'ank'in", "Muwan", "Pax", "K'ayab'", "Kumk'u", "Wayeb'"
];

/**
 * Ab' conventions. Both share the Cholq'ij; only the year start differs.
 *  - classic: Long-Count-era Ab' (epoch = 8 Kumk'u). 0 Pop 2026 = 30 Mar 2026 (2 Kej).
 *  - kiche:   living highland count as used by Barrios/Ajq'ijab'.
 *             Calibrated so 0 Pop 2026 = 18 Feb 2026 (Year Bearer 1 Kej).
 *             Offset from classic = 40 days.  ← NEEDS VALIDATION against your own Mam dates.
 */
const HAAB_EPOCH_OFFSET = { classic: 348, kiche: 348 + 40 };

const mod = (n, m) => ((n % m) + m) % m;

/** Gregorian (proleptic) → Julian Day Number. Integer math, no Date object. */
function gregorianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
    - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    y: 100 * b + d - 4800 + Math.floor(m / 10),
    m: m + 3 - 12 * Math.floor(m / 10),
    d: e - Math.floor((153 * m + 2) / 5) + 1
  };
}

/** Days elapsed since the Long Count epoch (13.0.0.0.0 4 Ajpu 8 Kumk'u). */
const daysSinceEpoch = (jdn) => jdn - CORRELATION;

function cholqij(days) {
  const number = mod(days + 3, 13) + 1;          // epoch day = 4
  const index = mod(days + 19, 20);              // epoch day = Ajpu (index 19)
  return { number, index, nawal: NAWALES[index], label: `${number} ${NAWALES[index]}` };
}

function haab(days, convention = "kiche") {
  const pos = mod(days + HAAB_EPOCH_OFFSET[convention], 365);
  const monthIndex = Math.floor(pos / 20);
  const day = pos % 20;
  return { position: pos, day, monthIndex, month: HAAB_MONTHS[monthIndex], label: `${day} ${HAAB_MONTHS[monthIndex]}` };
}

function longCount(days) {
  let n = days;
  const kin = mod(n, 20); n = Math.floor(n / 20);
  const winal = mod(n, 18); n = Math.floor(n / 18);
  const tun = mod(n, 20); n = Math.floor(n / 20);
  const katun = mod(n, 20); n = Math.floor(n / 20);
  const baktun = n;
  return { baktun, katun, tun, winal, kin, label: `${baktun}.${katun}.${tun}.${winal}.${kin}` };
}

/** Year Bearer (Mam) = Cholq'ij of day 0 Pop of the current Ab' year. */
function yearBearer(days, convention = "kiche") {
  const h = haab(days, convention);
  const startDays = days - h.position;
  const yb = cholqij(startDays);
  const start = jdnToGregorian(startDays + CORRELATION);
  return { ...yb, yearStart: start };
}

/** Main entry point. */
function mayaDate(y, m, d, opts = {}) {
  const convention = opts.haabConvention || "kiche";
  const jdn = gregorianToJDN(y, m, d);
  const days = daysSinceEpoch(jdn);
  const day = cholqij(days);
  const yb = yearBearer(days, convention);
  return {
    gregorian: { y, m, d },
    jdn, days,
    cholqij: day,
    yearBearer: yb,
    haab: haab(days, convention),
    longCount: longCount(days),
    headline: `${day.label} ${yb.label}`
  };
}

/** Convenience: from a JS Date in local time. */
function mayaDateFromDate(date, opts) {
  return mayaDate(date.getFullYear(), date.getMonth() + 1, date.getDate(), opts);
}

return {CORRELATION,NAWALES,HAAB_MONTHS,HAAB_EPOCH_OFFSET,mod,gregorianToJDN,jdnToGregorian,daysSinceEpoch,cholqij,haab,longCount,yearBearer,mayaDate,mayaDateFromDate};})();
