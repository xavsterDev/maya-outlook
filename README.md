# Maya Calendar Outlook Add-in — Step 1: Engine

## Files
- `src/maya-calendar.js` — ES module. `mayaDate(y,m,d,{haabConvention})` → cholq'ij, year bearer, Ab', Long Count, headline.
- `src/nawales.json` — per-nawal attributes and day-energy text (DRAFT, paraphrased from Barrios; validate before publishing).
- `test/test.mjs` — anchor-date tests. Run: `node test/test.mjs`

## Conventions
- Correlation GMT 584283 — verified against Barrios' Tabla Calendárica (1900, 2012) and 13.0.0.0.0 = 4 Ajpu.
- Ab' `kiche` convention: 0 Pop 2026 = 18 Feb 2026 → Year Bearer 1 Kej. Offset +40 days vs classic Ab'. NEEDS VALIDATION.
- `classic` convention available for comparison (gives 2 Kej / 30 Mar 2026).

## Headline format
`<number> <nawal> <YB number> <YB nawal>` — e.g. `1 Iq' 1 Kej`.
