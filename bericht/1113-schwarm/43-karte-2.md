# 43 Meisterkarte, Scheibe 3 von 8 (Index mod 8 = 2): bauen · klang · physik · streaming

Quelle: `w3/pm/meisterkarte-quelle/punkte/stand.json` (kopf ec281422), 33 Domänen alphabetisch, Index 2 · 10 · 18 · 26.
Gebucht in der Scheibe: bauen 9 · klang 9 · physik 7 · streaming 5 = 30/40. Offen: **9 Punkte in 8 Kriterien**.

## Was es den Spieler kostet (kein Bild der Fahrt gesehen)
- Bild gesehen: `scratchpad/dorf-main-0.5.png`, Dorf am Mittag. Der Hang verdeckt die Ferne. Am Kamm stehen drei Baumgruppen
  vor dunkel-marinem Himmel. Ob dort Karten fehlen, kann man von hier aus nicht sehen. Ein Bild der Fahrt (Sprint/GT) gibt es von heute nicht.
- Streaming: Im GT (63,8 m/s) fehlt in **1263 von 1780 Bildern** (71 %) ein Ding im Blick. Am meisten fehlen Karten
  (37 201 Ding-Bilder), dazu 1 093 Bäume und 983 Bauten (headless, eb3cc7f3, 07.11.). Seit 08.11. hat sogar der SPRINT (5,2 m/s) Lücken:
  4 771 von 5 412 Bildern. Die Zeugen sind Karten in 211–218 m (6aa7a5a6, 10.11., Probe-Zahl unter Fremd-Last).
- Bauen: Ein Werk erscheint in der Werkstatt kalt erst nach **3,9 s** im Bild, über die Hotbar kalt nach 4,6 s (GTX ec281422).
  Im Rezeptbuch zeigt Third das Werk in Stufe 1 statt in L0.
- Klang: Auf der Radeon kostet der Klang 0,40 ms Haupt-Faden pro Bild (Soll 0,2). Aussetzer gibt es keine.
- Physik: Die Flanke des gestoßenen Bären steckt an der Mauer 1,6 cm tief **im Bild**.

## Was die Quelle sagt
| Id | geb. | fehlt | Ist ↔ Soll (Quelle) |
|---|---|---|---|
| streaming.K1 | 0/2 | #1 headless ungemessen (R6 Linse + Fremd-Last der Farm); #2 ohne Station | Sprint 4771/5412, GT 1754/1794 Lücken-Bilder ↔ 0 (messung/6aa7a5a6-headless.json) |
| streaming.K2 | 0/2 | wie K1 (EIN Lauf `FAHRT`, g6.js:2504) | baum 58,4 % · karte 49,8 % · bau 92,4 % · boden 97,7 % ↔ je ≥ 95 % (ebd.) |
| streaming.K3 | 1/2 | #2 ohne Station (kurs-B Z. 194) | #1 gehalten: Radeon 33,77 ms (e6f0cf7e), GTX 49,9 ms ↔ ≤ 50 (715754fc, 29.10.) |
| klang.K5 | 1/2 | #2: Radeon frisch ROT, GTX gehalten GRÜN | Radeon gehen 0,40 · fahrt 0,34 · nacht 0,33 ↔ ≤ 0,2 ms, Last f 1,063 im Band (ec281422-radeon); GTX 0,14/0,2/0,18 (2d5f4146) |
| bauen.K1 | 1/2 | #2: GTX frisch ROT, Radeon „Fahrt riss 1800 s" | 6/8 in L0; werkstatt kalt 3881 / warm 1812 ms, hotbar 4631/1826 ↔ ≤ 1000 (ec281422-gtx) |
| physik.K2 | 1/2 | #2: Radeon frisch ROT, GTX Schloss nie bekommen | Bär im Bild Eindringen 0,016 ↔ ≤ 0,01 m; 2 Verstöße „BILD ≠ KOLLISION gestossen 68,68 m/s @144 → mauer" (ec281422-radeon) |
| physik.K4 | 1/2 | #2 ohne Station | Staffel 2 = Seil, Tuch und Hängebrücke (meisterkarte.json physik.K4) |
| physik.K5 | 1/2 | #2 ohne Station | Staffel 2 = Sturz → Ragdoll → Aufstehen für Spieler, Tier und Mensch, r ≥ 0,8 |

**Der Zwilling im Streaming (Zeitlinie bewiesen):**
- Das Spiel lässt seit **w22-wald-geburt** (main a4dc2fa64, 08.11. 10:12) jede Karte eines Feld-Wurfs an ihrem EINTRITT eintreten.
  Der liegt bei `min(h, max(R, _laubRand() − saum))` (`stamm/studio-bruecke.js:3421-3428`, gelesen in `stamm/vegetation-baum.js:2814-2823`).
  Daraus folgen 208–240 m (Laub-Rand 240: `stamm/dirigent-regler.js:1989`, Saum 0–32 m: studio-bruecke.js:3826). Der Abstand wird direkt vom Spieler gemessen, ohne den Vorlauf der Bahn.
- Die Station rechnet den Bedarf einer Karte mit eigenem Recht: `imLaub` an PERF_FOLIAGE_RADIUS_MAX und `rand = KEGEL` bzw.
  `_archKartenHorizont(e)` OHNE `eintritt` (`stationen/g6.js:2328-2339`). Für die Station ist eine Karte in 211 m Bedarf, für das Gesetz ist sie noch nicht eingetreten.
- Vorher und nachher: Am 07.11. (eb3cc7f3) hatte der Sprint **0 von 3610** Bildern mit Lücke. Nach der Landung hatte der Sprint 2880/2880 (da0e790f), 3350/3350 (78d37554) und 4771/5412 (6aa7a5a6).
  Die Zeugen sind immer Karten in 211–243 m.
- Der echte Rest bleibt auch nach dem Zwilling: Schon am 07.11. riss der GT bei 63,8 m/s (1263/1780; K2 boden 90,7 · baum 82,2 · karte 71,2 %).
  Seit z244 fährt der GT 63,8 statt 16 m/s (FUND-REGISTER Z. 90). Das Gesetz kann bei 16 m/s **0 Lücken**: w7-rang, `_bedarfWeg`/`_bedarfAbstand`, studio-bruecke.js:1869-1974
  (FAHRT_ZWEIG g6.js:2509). Bei 64 m/s gelingt das nicht.
- Die Messung steht seit 10.11.: Der Fremd-Last-Zeuge zählt die Läufer-Dienste der Farm (`provjobd` 13,8 CPU-s) als fremd (FUND Z. 113).
  `punkte.cjs` kennt diese Dienste bis heute nicht (grep `provjobd`: 0 Treffer). Ohne Maß ist das UNGEMESSEN (punkte.cjs:1532-1536, g6.js:4336).

**Physik K2:** w27-wagen-spalt (in main) misst den Leib-Radius je Achse an der **Bind-Pose** (`stamm/koerper-leib.js:2291 _tierQuerMass`).
Gemessen wurde headless „Bär Spalt 0,010–0,012, Eindringen 0" (b94633a3d). Im Bild auf der Karte bei 144 fps zeigt der gezeichnete Lauf-Skin 1,6 cm mehr.
**Klang K5:** Die Träger der Bilder über dem Soll sind `_playSchrittOneShot` 0,12, `_lofiPlayGroove` 0,07 und `_raumStrahlen` 0,06 ms
(roh/ec281422-radeon/klang.K5_2.json). Dieselbe Phase gehen hatte bei dc9eacb0 **1019 Bilder für 10 m** (0,21 ms), bei ec281422 **601 Bilder für 11 m** (0,40 ms).
Pro Meter sind das 102 statt 55 Bilder: Die Bildrate auf der Radeon hat sich etwa halbiert. Die Klang-ms pro Bild steigen mit der Bildzeit (Musik und Schritt pro Zeit, `stamm/klang.js:988`).
**Bauen K1:** In den Phasen (roh/ec281422-gtx/bauen.K1_2.out) liegt die Zeit in eingabe 2322 ms (werkstatt kalt), bild 4194 ms (hotbar GT kalt) und l0 1353 ms (Eiche kalt).
Rezeptbuch Third zeigt „Bau-Hash ≠ L0" auf BEIDEN Geräten (auch dc9eacb0-radeon).

## Die EINE begrenzende Entscheidung
**Ein Wald-Ding hat EINEN Eintritt: `_archKartenHorizont(e, true)`. Das Spiel baut vor ihm längs der Bahn, die Station zählt ab ihm.**
Die Station hört auf, ein eigenes Bedarfs-Recht für Karten zu führen. Das Spiel trennt „gebaut" (Vorlauf der Bahn, `_bedarfAbstand`, Blende 0) von
„eingeblendet" (am Eintritt, vom Spieler gemessen, `aEin`). Danach ist eine Lücke bei Sprint und GT eine echte Lücke und keine Meinungsverschiedenheit zweier Rechnungen.

## Der Schnitt (die Klasse ganz: alle Lücken des Walds unter Tempo)
- **Stufe 1, Station (pm, S):** In `stationen/g6.js:2337-2341` fragt die Karte eines Feld-Wurfs `r._archKartenHorizont(e, !r._archIsRendered(e))`, statt KEGEL/h selbst zu rechnen.
  `fahrtGueltig` (g6.js:2461) bekommt eine Zeile `r._laubRand() < A.PERF_FOLIAGE_RADIUS_MAX → ROT „Laub-Rand per Regler"`.
  Das ist dasselbe Schlupfloch-Gesetz wie Ring ≥ 4: Soll und Schwelle bleiben unbewegt. Die Proben FAHRT_MAIN/FAHRT_ZWEIG (g6.js:2507-2509) bleiben gültig.
- **Stufe 2, Spiel (M):** `stamm/vegetation-baum.js:2815-2823`. Ein Feld-Wurf misst den Bau mit `_bedarfAbstand` (Vorlauf `BEDARF.vorlaufS`) und
  die Blende ab dem Eintritt vom Spieler (`_archInstanceAdd` aEin). Bis wald-geburt-heil trat an der Bahn ein ganzer Ring auf einmal ein
  (GTX 6ee4408f, 21 Karten ab 186 m, 480 Pop-Pixel). Die Blende in Welt-Takten trägt das jetzt, darum darf der Bau wieder vorauslaufen.
- **Stufe 3, Spiel (L, die Klasse „Streaming bei 64 m/s"):** Boden, Bäume und Bauten im GT. Gemessen wird an der Rang-Zeit (`_bedarfWeg`, studio-bruecke.js:1869),
  die Schlangen sind gesättigt (FUND Z. 90: „Vorlauf nach Zeit für Ring, Saat, Karten und Streu, Grob zuerst").
- **Leser-Liste:** `_archKartenHorizont` (vegetation-baum.js:2814, 2829; studio-bruecke.js:3421) · `_archIsRendered` (siedlung-bauten.js:1759, dirigent-ankunft.js:868, 1232) ·
  `_weltbildFehlt`/Ladeschirm (dirigent-ankunft.js, zählt den Baum in der Mesh-Zone) · gate:pop und lod.K2#1 (die Geburt am Laub-Rand) · `fahrtLueckeUrteil`/`fahrtEintrittUrteil` (g6.js:2473, 2490).
- **Kosten-Zeile:** Stufe 1 kostet 0 im Spiel. Stufe 2 hält pro Bild höchstens die Karten im Vorlauf `v × vorlaufS` auf Blende 0. Das hängt am Schirm und Tempo, nicht an der Welt.
  Zu messen ist Takt p95 der Fahrt (heute 30,5 ms headless, eb3cc7f3) vorher und nachher, dazu Pflicht B als Kosten-Zeile.
- **Kriterien:** streaming.K1#1 0 ↔ 0 Lücken (headless) · streaming.K2#1 0 ↔ ≥ 95 % je Klasse. Stufe 1+2 räumen den Sprint ab, erst Stufe 3 bucht.
  Die Messung braucht dazu den Farm-Zeugen (FUND Z. 113, S) oder Laptop in Ruhe `w3/zeit-lauer4.sh`.

## Was schon liegt
- `w7-rang` liegt in main: Das Gesetz der Bahn existiert. `w22-wald-geburt` d3ac18c2f liegt in main und hat den Zwilling erzeugt.
- `w26-fahrt-planer` 3da584a4d: WIP, NOTBREMSE-Stand 09.11., nicht in main. Inhalt nicht gelesen.
- physik.K2: `w27-wagen-spalt` liegt in main (Bind-Pose). `w17-bild-kollision` bd1cd9942 (07.11., nicht in main, Basis 5fb21e29) ist veraltet, nicht gelesen.
- bauen.K1: `w28-richter-hand3-pm` 8afcd41a ist NICHT in punkte-maschine. Er nimmt den Mess-Halt `wetterHalten` für bauen.K5#2 heraus.
  Ob er bauen.K1#2 hebt, ist ungeklärt (seine Rumpf-Zeile nennt bauen.K1#2 als Vorläufer, der den Halt stehen lässt).
- main ist jetzt 7f778d44c (z427 w28-karte-stamm). Diff gegen ec281422: Das Eintritts-Gesetz ist unverändert (grep `KartenHorizont|laubRand|feldWurf`: 0).

## Ehrlich offen
- Ob Stufe 1 allein den Sprint auf 0 bringt, ist ungemessen. Eine Karte, die an ihrem Eintritt in die Schlange `nahOffen` geht, ist mindestens ein Takt ungezeichnet.
  Darum gehört Stufe 2 in dieselbe Welle.
- Warum seit 10.11. keine headless-Messung der Fahrt kam: nicht gelesen. Ebenso, ob HOLZ „voll" den Regler `foliageRadius` festhält.
- klang.K5: Die Bildraten-Lesart (102 → 55 Bilder/m) ist meine Deutung, kein Profil. Den Täter zwischen dc9eacb0 und ec281422 (z423–z426) benennt niemand.
- bauen.K1 „Third Stufe 1 statt L0": Ob das Wahrnehmungs-Gesetz in Third zu Recht L1 wählt, ist nicht gelesen. Die Station verlangt L0.
- physik.K4/K5#2 und streaming.K3#2: Es gibt keine Station. Der Kurs verbietet einen neuen Apparat. Ohne gebaute Station und gebautes Gesetz (Tuch/Brücke, Ragdoll, Tor p95 ≤ 33 ms) gibt es 0 Punkte.
- streaming.K3#1: Die GTX hält 49,9 ms gegen ≤ 50 von 29.10. als Ratsche. Eine frische Messung kann kippen.

## Rang
| Schnitt | Wirkung 1–5 | Aufwand | Risiko |
|---|---|---|---|
| Wald-Eintritt EIN Gesetz (Stufe 1+2) | 4 (Fahrt-Bild, K1/K2-Sprint, Takt) | S+M | Stufe 2 kann die Pop-Linse gate:pop reißen, wenn die Blende am Vorlauf-Bau nicht bei 0 hält. |
| physik.K2#2 Quer-Maß aus dem gezeichneten Gang statt Bind-Pose (koerper-leib.js:2291) | 2 | S | Ein breiterer Leib hält Tiere an engen Durchgängen fest (physik.K2#1 Spalt-Zeile beobachten). |
| klang.K5#2 Radeon | 2 | M | Ohne benannten Täter wird es Rätselraten. Erst die Bildrate der Phase gehen klären. |

**Die fünf Punkte, die ein Bild-Schnitt nebenbei kippt:**
1. streaming.K1#1
2. streaming.K2#1

Beide kippen mit dem Wald-/Karten-Schnitt (Wiese fern, karte-stamm), wenn er den Eintritt mitnimmt. Für den GT-Teil reicht das nicht.

3. physik.K2#2: mit dem Leib-Schnitt (Gestalt aus dem Genom, w28-leib-nah). Das Quer-Maß liest dieselbe Haut.
4. klang.K5#2: mit jedem Bild-Schnitt, der die Radeon-Bildzeit im Gehen senkt (Vermutung).
5. bauen.K1#2: mit dem Stufen-Schnitt der Karten/Werke (L0 im Third-Bild des Rezeptbuchs).
