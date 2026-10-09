# Bericht 0710-4 + 0710-5 — die Impuls-Klasse ganz, der Stoß im Sim-Schritt

**Kopf:** `welle-m-impuls` KOPF (auf `welle-m-fahren` 7f97d339) · OMEN · headless (Null-Renderer) + Bilder am echten Renderer
**Commits:** 54480d58 (Klasse 1+2) · 7bb086e9 (Klasse 3) · I3 (0710-5) · I4 (Klasse 4)

## Geschnitten

1. **EINE Masse je Leib** (54480d58): die Dichte lebt im Kern (tetrapoda `MASSSTAB.dichteKgM3` 1000, koerper `LEIB.dichteKgM3` 985,
   vehicle `FAHR.masseDichte` 150), das Volumen ist die Gestalt — `_leibVolumen` misst die geschlossene Haut (Divergenz-Satz,
   jede Kante gerade oft), `_leibMasse` = Volumen × Skala³ × Kern-Dichte für Tier und Mensch, `_fahrMasse` = carPhys-Volumen ×
   FAHR.masseDichte. Gefallen: `STOSS.dichteLeib`, `STOSS.dichteWagen`, `_kreaturMasse` (die Kapsel aus der Hüft-Höhe).
   ARENA.gefuehl.wucht 6 → 2,7 (an der Gestalt-Masse geeicht).
2. **Der Biss stößt** (54480d58): `_bissStoss` — die Vorhand des Jägers (tetrapoda `BISS.masseAnteil` 0,3 seiner Leib-Masse) im
   Tempo des Ansprungs; alle drei Biss-Wege (Beute, Spieler, Gegenwehr) durch das EINE Gesetz.
3. **Leib an Leib** (7bb086e9): die Teilnehmer-Sprache des Gesetzes (`_stossKoerper` · `_stossAuf` · `_stossPaar`);
   `_leibKontakte` löst Tier-Tier und Tier-Spieler als Strecke gegen Strecke — Durchdringung trennt nach Masse, Annäherung
   tauscht Impuls; der Wagen kennt den Spieler zu Fuß als Leib, der Spieler stößt Wagen über seinen Bauwerks-Löser.
4. **Der Stoß im Sim-Schritt** (0710-5): `_kreaturStossSchritt` im festen Schritt — Weg in Teil-Schritten ≤ halber Leib-Radius,
   je Teil-Schritt die EINE Hülle; die Höhe des gleitenden Leibs setzt der Sim-Schritt; `_leibKontakte` ebenda. Die Masse liest die
   Kette der lokalen Skalen statt `getWorldScale`. Die Handbremse hält einen geparkten Wagen gegen den Stoß eines Menschen.
   Playtest Kampf D prüft `opts.stoss` (Schaden UND Stoß), die Gegenprobe zeigt das tote Feld `knockback`.
5. **Der Reiter im Wagen** (Klasse 4, I4): die Sitz-Pose legt die Oberschenkel auf die Sitzfläche und setzt den Leib dorthin,
   wo die Gestalt ihn trägt (`_sitzLage`): das Hüftgelenk über den Sitz-Anker des Kerns (exportDrive.sitz, Fahrerseite), der
   Blick längs der Fahrt (nie mit der Maus), der Rumpf neigt sich ab der Lehne des Kerns, bis der Scheitel den Kopf-Freiraum
   unter der Dachlinie hält; der Kopf bleibt aufrecht. Die Maße misst die HAUT einmal je Rig (`_sitzLeib`: Hüftgelenk 0,16 m
   über der Oberschenkel-Unterseite), die Neigung je Wagen die Knochen (`_sitzNeigung`). vehicle-core additiv:
   FAHR.sitzLehneRad 0,13 (die Sitzreihe liest sie, byte-gleich) · kopfFreiraumM 0,05 · sitzLehneMaxRad 1,15.

## Gemessen

| Linse | vorher | nachher |
|---|---|---|
| T14 Masse-Tafel (kg, Wirt) | Fuchs 35,4 · Wolf 140,5 · Hirsch 435,6 · Bär 254,8 · Mensch 0 · GT 1341,4 (Zwillinge im Wirt) | Fuchs 15,0 · Wolf 64,0 · Hirsch 94,2 · Bär 335,4 · Mensch 98,8 · GT 1341,4 = Gestalt |
| T15 Biss Δv am Hirsch / Spieler (m/s) | 0 / 0 (alle sechs) | Fuchs 0,053 / 0,051 · Wolf 0,25 / 0,24 · Bär 0,85 / 0,83 |
| T13 Rückstoß Keule auf Fuchs | — | 2,05 m (Leib 14,7 kg; mit Wucht 6: 9,7 m) |
| tier-separation (D) Fuchs → Bär | 0,35 m ineinander, 0 m/s | 0,000 m, Δv 2,66 / 0,12 m/s (Massen 22,4) |
| (E) Wolf → Spieler | 0,23 m im Spieler | 0,000 m, Spieler 0,67 m/s |
| (F) Lockstep zweier Proben | — | 0 |
| fahr-leben L6 Spieler → GT | Wagen 0 m/s; nach Klasse 3 rutschte der gebremste GT 0,27 m | Fahrt in den Wagen 1,15 → 0,22 m/s, Wagen 0,000 m |
| L6 GT → Spieler | GT 0,139 m im Spieler, Spieler 0 m/s | Spieler 4,50 m/s, tiefste Berührung −0,041 m (ein Schritt) |
| L7 Bär 13,7 m/s vor 0,35-m-Wand (60 / 30 / gemischt) | 0/10 · 9/10 · 9/10 (bis 31,8 m dahinter) | 0/10 · 0/10 · 0/10 |
| L8 Lockstep nach 200 Sim-Schritten (Wagen / Bär) | 0,061 / 1,386 m | 0 / 0 m |
| L9 Reiter: Scheitel gegen Dachlinie (GT · Supersport · Limousine · Kompakt · SUV) | +0,99 · +1,03 · +0,78 · +0,76 · +0,62 m | −0,05 · −0,05 · −0,05 · −0,05 · −0,09 m |
| L9 Lehne (Neigung des Rumpfs) | 0° | 60,6° · 63,9° · 36,3° · 32,5° · 7,4° |
| L9 Oberschenkel über der Sitzfläche / Hüftgelenk neben dem Anker / Blick neben der Fahrt | +0,63 m / 0,41–0,61 m / 90° | 0,00 m / 0,00 m / 0° |

Wände (Kopf): fahr-leben (+ Selbst-Test), tier-separation, kampf-gefuehl, vehicle-drive, vehicle-/schmiede-/asset-/daten-/ofen-contract,
kreatur-leben, koerper-kern, tier-anatomie, check, lint, format:check, playtest:fast, playtest „Alle Invarianten OK". Kerne unter
Byte-Beweis (die Verträge grün; die neuen Kern-Zeilen additiv, kein Golden-Re-Mint).

## Offen

- GELB (benannt, nicht geschnitten): ein Wagen fährt nach einem Klemm-Stoß etwa 0,5 s Phantom-Fahrt; der gestoßene Bär gleitet
  aufrecht statt zu stolpern; die Wucht des Schlags stößt nie zurück auf den Angreifer.
- **Wagen-Tiefe** (Entscheid Koordinator: Posten der Studio-Welle S3): GT und Supersport liegen bei 61–64°, weil ihre Tiefe
  Bauch→Dachlinie 0,89 / 0,855 m beträgt gegen ~1,1 m Bedarf (sitzender Mensch des Körper-Kerns ~1,0 m + 0,05 Freiraum). Der
  Bauch ist die Schwellerlinie (ySill = fahrhoehe + 0,18), Akku und Bodenplatte liegen darauf, das Polster auf der Platte —
  ein Sitz-Datum allein gäbe ≤ 0,06 m. Peers sähen den liegenden Fahrer durchs Glas; die Lehne des Baus (0,13 rad) folgt
  seiner Neigung nicht. Im Spiel verbirgt die geschlossene Kabine den Reiter render-only.
- Karren: kein Karren-Bauplan in der Welt (fahrzeug_wagen ist nur die Substanz-Spende der Fahrzeug-Klasse); ein Teile-Werk
  sitzt über seinen sitz-Punkt, aufrecht, ohne Dach.
- In 1 von 7 lokalen fahr-leben-Läufen lief der Spieler zu Fuß mit 6,94 m/s in den GT (sonst 1,15) — Ursache nicht isoliert,
  die Linse zeigt die Anlauf-Fahrt je Lauf.
- CI 37696340913 (20b0a5ef): L3 traf im CI-Takt zuerst etwas anderes (6,63 statt 7,50 m/s, vier Stöße ohne Annäherung) — die
  Stoß-Probe nennt jetzt den Partner des ersten Kontakts, jeden Partner ohne Annäherung und die Tiere in der Gasse; CI-ERGEBNIS

## Konflikte

- **welle-l-wasser** (af617a45): `git merge-file` auf vehicle-core.js gegen die gemeinsame Basis cf9a07ba — 0 Konflikte. wasser
  fügt FAHR.huelleDichte 3,0 (relative Dichte des gefluteten Materials) und exportDrive.huelle.dichte; welle-m-impuls fügt
  FAHR.masseDichte 150 kg/m³ (geschlossene Hülle mit Kabinenluft, für den Stoß) und die drei Sitz-Zeilen — zwei verschiedene
  Größen, kein Zwilling. **Golden-Zeilen:** welle-m-impuls bewegt KEINE (spec/ unberührt seit 79f25cbd; FAHR-Zeilen nicht in
  exportDrive, seatRow byte-gleich); wasser bewegt v1 recipes.json (1 Zeile: exportDrive.huelle.dichte) und v1 manifest.json
  (1 Zeile). Der Integrator prägt nach dem letzten Merge EINMAL neu.
