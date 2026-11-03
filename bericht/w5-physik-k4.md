# w5-physik-k4 — physik.K4 Staffel 1: das Schmiede-Seil schwingt in der Welt am Leib

**Geschnitten:** EIN Seil-Gesetz im Schmiede-Kern (`schmiede-core.js:2250` `SEIL_GESETZ`, `:2298` `seilSchritt` — Verlet + Abstands-Bedingungen nach
Jakobsen 2001, die Länge hart nach Müller 2012 „follow the leader", Ruhe-Erkennung; `:2414` `seilPosen` die Pose jedes Teils, `:2459` `bauSeil` die
Gestalt) und die Gattung Flegel in der Tafel (`:2617`, Stiel + 7 Glieder + Stachelkugel, `fx.seil` im Buch); die Brücke reicht `seil` (`foundry-bruecke.js:851`),
die Hand hängt das Seil ein (`stamm/koerper-seele.js:845` `_seilAmLeib`) und der Takt rechnet es nach der Haltung (`stamm/dirigent-takt.js:250` →
`stamm/koerper-seele.js:876` `_seilTakt`, fern von `SEIL_NAH_M` 40 m und in Ruhe 0 Schritte); das Labor ruft dieselben drei Kern-Funktionen
(`worlds/schmiede/schmiede.js` `seilTakt`, Werkbank und Prüfstand); die Linse H-S in `gate:nervensystem-schmiede` (Selbsttest: 7 Mutanten ROT beim Namen).

**Gemessen:** Station `physik.K4#1` headless im Baum dieses Zweigs: vorher (main 5fba36ea) ROT „kein Seil am Leib: 0 von 22 Gattungen" → nachher
**GRÜN** „klinge_flegel Schwung 0,489 m, Länge (längs) 0,328–0,332 m, v² 3,195 → 0,251" (Lauf 11,6 s); die Station ist dazu geschärft (Zweig
`w5-physik-k4-pm`, Selbsttest 130/130): die Seil-Länge misst längs des Seils vom Anker des Gesetzes im Buch (vorher die Sehne vom Schaft-Ende —
0,393–0,826 m, ein Hebel, und auch vom Anker hängt jede echte Kette durch, wenn die Hand beim Halt schneller fällt als die Schwere: 0,11 m in 0,13 s),
ein Seil ohne Gesetz im Buch ist ROT; die Linse in der Welt: 279 Schritte, Schwung 0,30 m, Länge ±0,76 %, v² 1,48 → 0,02, ruht, fern 0 Schritte.

**Ehrlich offen:** Staffel 2 (Tuch, Hängebrücke, Phasen-Korrelation mit dem Gras, byte-Diff der Seil-Bahn Labor ↔ Welt bei gleicher Saat) ist nicht
gebaut — der Weg steht (Zustand, Schritt und Pose leben im Kern, beide Leser kopieren nur Matrizen); die Kette kollidiert nicht mit dem Leib, sie
trägt keinen Treffer (der Flegel schlägt über das allgemeine Wucht-Profil), und es gibt keine GPU-Bilder (Cloud ohne GPU).

## Abgabe-Notiz

- Vertrags-Akte im selben Zug, je mit Byte-Beweis: Goldens v5 `klingen.json` +2 Fälle (flegel s7/s12345, alle alten Fälle byte-gleich),
  `arena.json` Hof (der Waffen-Tisch wächst mit der Zahl der Gattungen, Objekte und Ecken gleich), v1 `recipes.json`/`render-config.json`
  (`MINT_NUR_DATEN=1`: nur `flegel` neu), Plattform-Ratsche v5 24 → 25 Fälle, cos/sin 20 → 21 (wie bei der Sichel: gedrehte Ringe).
- `bericht/` im Baum feuert `gate:betriebsgesetz` ZITAT-WAND (8 Befunde: dieser Bericht fehlt in `docs/README.md`, und CLAUDE.md/PFLICHT-OFFEN
  nennen Berichte, die im Zweig `koordination` leben) — ohne den Ordner ist die Wand GRÜN (scripts −2 Atome); der Bericht gehört beim Landen
  nach `koordination`.
- `gate:schmiede-contract` zählt 23 Gattungen; `gate:kampf-gefuehl` Q11 fand die feste Dichte im Flegel-Kopf — die Seil-Massen lesen seitdem den
  Werkstoff (`seilGesetz` → `metallRho`). Die Station-Schärfung landet getrennt: `w5-physik-k4-pm` (von origin/punkte-maschine).

## FUNDE

- `stamm/koerper-seele.js:760` · die Hand teilt nur den MITTELWERT der Anker-Skala heraus; der Rig-Knochen `hand-1` skaliert ungleich (Welt
  0,264/0,282/0,264) — jedes gehaltene Studio-Gerät trägt in der Welt Skalen 0,979/0,983/1,038 und Scherung bis 0,043 (gemessen am Flegel) ·
  halten (W5 „die wahre Größe", gate:nervensystem-schmiede H-F misst nur die Länge längs X) · mittel (eine starre Welt-Matrix je Bild oder gleich
  skalierte Rig-Knochen im Ofen). Das Seil ist davon frei (es trägt Hand⁻¹ · Welt-Pose).
- `stamm/koerper-seele.js` `animatePlayerSoul` · die Hand ruckt im Gang: das Tempo des Seil-Ankers springt zwischen zwei Takten 1,07 → 2,85 →
  1,14 m/s (Takt 88 der Station), beim Halt fällt der Arm 0,11 m in 0,13 s (schneller als die Schwere) · leib/gang · klein–mittel.
- im Zweig `punkte-maschine` `meisterkarte-quelle/src/g1.js` physik.K4 `beleg` · nennt `worlds/schmiede/schmiede.js:1152-1161 stepRope` — das Seil lebt
  seit diesem Zweig im Kern (`schmiede-core.js` `SEIL_GESETZ`), `stepRope` gibt es im Labor nicht mehr · physik.K4 · klein (Text der Soll-Tafel).
