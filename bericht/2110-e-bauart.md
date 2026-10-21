# Bericht 2110 E-Bauart (Macher): die Diät hört statt fragt — Zweig e-bauart abc5a0d7 [ci voll]

**Status: ZWISCHENSTAND.** Geschnitten von einem frischen Schneider; sein Bericht wörtlich unten. Rohdaten hier in `bericht/2110-e-bauart/`, alles auf der OMEN in `p3/n2110/ebauart/`.
- **Geschnitten:** EIN Register der Regung (stamm/bild-diaet.js), gelesen von Diät, Bündel-Replay und `_passSicht`; Statisches fällt aus dem Lage-Vergleich.
- **Gemessen (GTX, Genesis Third steht):** Prüfung netto 0,526 → 0,398 ms, `_renderBundles` 1,229 → 1,119, `_diaetRefresh` 1,842 → 1,756; CPU-Takt p95 nicht langsamer, aber nicht gesenkt (5,93 → 5,90, Soll 5,8 in 2/4).
- **Ehrlich offen:** E bleibt bei ~5,9; die nächsten Posten sind das geteilte Schreiben 1,1 ms und die verschachtelte Kaskade 0,56. Die Zweig-CI liest der Koordinator.

---


Zweig `e-bauart`, Kopf **abc5a0d7** `[ci voll]` = Code ff37b2a5 (e-bauart auf integ-probe fdda7c13). Serie 1: A 57a9f2ab gegen
B 27c384f5 (e-bauart auf A). Serie 2: A 57a9f2ab · C fdda7c13 (Belegungs-Schnitt) · D ff37b2a5. EIN Instrument werkbank.cjs aus A.

## Schnitt
- **Register der Regung** (stamm/bild-diaet.js; die Diät-Scheibe zog aus bild-kosten.js, R2 DECKE, stamm-umzug, Fingerabdruck 0):
  EINE monotone Zahl, `_regt` stempelt die Quelle. Melder an der Quelle: der needsUpdate-Setter (BufferAttribute · InterleavedBuffer),
  `updateMatrix` eines Statischen (`_regungMelder`, eine Melder-Registrierung in `_configureRenderer`, außerhalb des Schatten-Blocks),
  der Programm-Melder (Texturen + freie Uniforms EINMAL je Programm und Render), der Stoff-Blick (EINMAL je Stoff und Render).
  Jedes Render-Objekt trägt seinen Stand; das Tor `_diaetRuhig` liest nur Stempel; die volle Prüfung ist der alte Körper (kein Zwilling).
- **Drei Leser, EIN Register:** `_diaetRefresh` → Tor · Replay `_renderBundle` → `needsRefresh` → dasselbe Tor · Pass-Sicht:
  `_bundleWerferHuelle` steht über Bündel-Version + Halter (`_instanzZahl` meldet die Sicht) + Statik, kein Kinder-Gang je Takt.
- **Statisches fällt aus dem Lage-Vergleich:** Welt-Bündel, ihre Gruppen und Sätze matrixAutoUpdate = false (Lage 55 → 36,9, statisch 47,7).

## Linse (EIN Zähler `__diaetZaehler` für werkbank diaet und kamera-treue STAND, EIN Urteil `diaetUrteil`)
- Genesis Third Ruhe: **A ROT** „RUHE: 84,47 Prüfungen ohne Meldung je Frame“ · **B/D GRÜN** 8,03/7,07 voll = gemeldet, 0 ohne Meldung.
- Selbsttest gemuteter Melder ROT: kamera-treue ÄNDERUNG mit stummem `_regt` 0,927/0,949 < 0,98; vendor-anker `ohneMeldung` feuert.
- Atome: scripts **−54** (gate:betriebsgesetz gegen die Merge-Basis).

## Gemessen — GTX 1060, Genesis Third stehend (Roh abab/, abab3/ zellen/*; Tafeln auswertung*.md)
| Größe | A | C (Belegung) | B bzw. D (e-bauart) |
|---|---|---|---|
| CPU-Takt p95 S1 | 5,78 | – | B 5,88 (Δ +0,10 ± 0,41) |
| CPU-Takt p95 S2 | 5,93 | 5,90 | D 5,90 (D−C ±0,00 ± 0,35) |
| p95 ≤ 5,8 | S1 3/4 · S2 1/4 | 2/4 | B 2/4 · D 2/4 |
| CPU-Takt p50 S2 | 4,53 | 4,45 | 4,38 (D−C −0,075, t −2,0) |
| Belegung p95 / p50 S2 (m12) | 10,19 / 7,23 | 7,33 / 5,75 | 7,37 / 5,77 |
| Profil Prüfung netto S2 (ms/Frame) | 0,534 | 0,526 | 0,398 (−25 %) |
| Profil `_renderBundles` / `_diaetRefresh` S2 | 1,231 / 1,846 | 1,229 / 1,842 | 1,119 / 1,756 (t −6,3 / −4,3) |
Gehend und Wiese Ego: alle Seiten im Rauschen. GPU P0 1650–1690 MHz, CPU-Leistung je Boot gleich, kein schwerer Boot.

## Blick
blick-d/genesis-third-D.jpg selbst gesehen: Plattform, Leib, Tore mit Membran, Haus mit Rauch, Bäume, Schatten — nichts fehlt (gleich B).

## Wände
An D: format · lint · check · playtest:fast 21/21 (der 22. Fall fiel in integ e3ffb625) · playtest voll · kamera-treue · fenster-wechsel
· vendor-anker EXIT=0. ci-lokal an D bis 100/160 grün (kopf lokal API-blind), dann Kurswechsel: die volle Batterie fährt die Zweig-CI.
Nach dem Kurswechsel (waende-kurs.log): check · playtest:fast 21/21 · kamera-treue · Frost-Wand auf der Karte (nvidia/pascal) EXIT=0.

## Ehrlich offen
E bleibt bei ~5,9 und reißt 5,8 in 2/4; die nächsten Posten sind das geteilte Schreiben 1,1 ms und die verschachtelte Kaskade 0,56,
nicht mehr in dieser Karte. Das Register nimmt die Prüfung (−25 %) und den Replay (−0,11 ms); im Takt-p95 liegt das unter dem Rauschen.
Der Programm-Melder trägt die Textur-/Uniform-Vergleiche in den Gang (+0,07).

Übergabe: p3/n2110/ebauart/uebergabe.md.
