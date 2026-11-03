# w8-ultiversum-k1 — das Gesetz der Welt hinter einem Welt-Tor (ultiversum.K1, Staffel 1, headless)

Station `meisterkarte-quelle/punkte/stationen/g5.js` `ultiversum.K1#1` (Null-Renderer, EINE Seite, ~25 s): A (die Welt der Seite) →
`obtainPortalForWorld("ferne")` → das Tor gesetzt und betreten (`enterPortal` → `_weltTorBetreten`, die Tür `_weltBetreten`, Wechsel am
Ort) → B → das Heimtor `heimtor-<A>` → A. Je Welt das Gesetz im Speicher (`worldMeta.gesetz`) und je Konstante ihr Leser.

| Konstante | Leser | A (Erde) | B (Ferne) | A2 |
|---|---|---|---|---|
| Schwere | `state.gravity` → Leib-Löser, echter Sprung im Takt | −9,81 · Scheitel 0,323 m (v 2,599) | −3,71 · Scheitel 1,54 m (v 3,411) | = A |
| Himmel | `_atmoGesetz` → Medium `betaR`, Blau ÷ Rot | 5,2273 | 0,3846 | = A |
| Wetter-Tafel | `_wetterAmOrt` (240 Orte × Zeiten), je Zeile der Front | sunny 69 · cloudy 55 · rainy 55 · stormy 32 · foggy 29 | sunny 72 · foggy 78 · cloudy 54 · stormy 36 · kein Regen | = A |
| Gelände | `_erbgut` → Höhe des Kerns, Relief ÷ Erde (41 × 41, 120 m) | ×1 | ×1,43–2,00 (je Saat der geborenen Ferne) | = A |

main d880c8e8: ROT „die Welt trägt kein Gesetz (worldMeta.gesetz)“. Spiel-Zweig `w8-ultiversum-k1`: GRÜN, Exit 0.
Mutanten (13 Proben): dieselbe Konstante in beiden Welten ×4 ROT beim Namen; ein Leser, der seine Konstante nicht liest, ×4 ROT beim
Namen (Sprung ≠ v²/2g, Blau ÷ Rot ≠ Rayleigh-Tiefe, Worte gegen die Tafel, Regler/Relief); die Rückkehr unter dem fremden Gesetz,
das vergessliche Tor, kein Heimtor, kein Gesetz ROT. `punkte.cjs selbsttest --ohne 3c` GRÜN 131/131 (456 Proben), `liste` Fehler 0.

Die Station nennt nur Pfade, die am main stehen; sie braucht keine Datei, die nur der Spiel-Zweig trägt — sie braucht seinen Code
(`worldMeta.gesetz`, `_weltTorBetreten`, `_heimTorSetzen`, `ULTIVERSUM`), am main bleibt sie ROT.

## Bericht (Zwischenstand)

- **Geschnitten:** EIN Gesetz je Welt in ihrem Speicher — `stamm/speicher-welten.js` `_weltGesetz` (Schwere · Himmel · Wetter-Tafel ·
  Gelände, fail-closed, das Erbgut zieht aus `worldMeta.erbgut` hinein; reist als Abweichung von der Erde), `state.gravity` ist sein
  Accessor (`stamm/dirigent-kern.js`), die Leser `_atmoGesetz`/`_atmoTakt` (`stamm/bild-himmel.js`), `_wetterAmOrt`, `_erbgut`
  (`stamm/gelaende-boden.js`); das Welt-Tor `_weltTorBetreten` + `_heimTorSetzen` (`stamm/netz-portal.js`), die Tafel `ULTIVERSUM`
  (`stamm/daten.js`), das Ziel in der Werkstatt und `richte portal … auf ferne`; `ERBGUT_PROTOKOLL` 2 → 3.
- **Gemessen:** Sprung 0,323 → 1,54 m, Blau ÷ Rot 5,2273 → 0,3846, kein Regen in der Ferne, Relief ×1 → ×1,43–2,00, zurück = A;
  `npm run check`, `playtest:fast` (21/0), voller Playtest (Alle Invarianten OK), gate:weltgrenze, gate:gelaende-studio,
  gate:worker-dichte GRÜN; `scripts/` −3 Atome.
- **Ehrlich offen:** kein Bild der Ferne (keine Welt-Bilder in der Cloud) — der rote Himmel ist als Zahl des Mediums gemessen, nicht
  als Ausgabe-Bild; die Staffel 2 (alle Kapitel des Gesetzes, beide Geräte) bleibt; das Labor `worlds/terrain` liest die Ferne nicht.

FUND: `stamm/netz-identitaet.js:1214` pinCurrentWorld · die Wand 256 KiB des Mitträger-Abbilds · tore.K5/Φ5 · der Playtest-Stand
liegt bei 262 096 von 262 144 Bytes (48 B Luft): jedes neue Feld im Stand reißt Φ5 Q14–Q18 (hier: 184 B des vollen Erd-Gesetzes).
