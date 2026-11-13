# 51 Die sieben Samen-Twists gegen die Quelle

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- `scratchpad/genom-spiel/frontal.png` (Dorf der Ankunft, Mittag): der Bewohner vorn trägt einen Oberkörper wie einen Ballon,
  an beiden Achseln stehen Stoff-Fetzen ab; links ein Gehender, dessen Hemd an der Seite offen ist. Am Hang hinten
  flache gelbgrüne Zacken statt Gras. Himmel dunkel-marine. Haus glatt weiß, ohne Stoff.
- `scratchpad/dorf-main-0.5.png`: der ganze Hang über dem Platz ist eine Reihe großer flacher Wimpel (Gras), die Wege
  als violette Schlieren ohne Kante, die Bewohner mit breiten Schulter-Kugeln.
- `KO/probe-post/w28-leib-nah/7-paar-nah-heute-kandidat.jpg`: links heute — rotes und weißes Hemd reißen an Arm und
  Seite, Fetzen flattern; rechts der Kandidat — beide Hemden geschlossen, Saum am Oberarm, die Schultern noch wuchtig.
  Hinter beiden Paaren dieselben Gras-Wimpel (das Gras ändert der Zweig nicht).
- Keiner der sieben Twists ist im Bild als eigener Schritt zu sehen; was das Auge an der Ankunft trifft, gehört Kandidat 3.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
SPIEL = main ec281422. Je Kandidat: wo er heute steht, ob beweisbar, welche Zahl er träfe.

| # | Kandidat | Quelle heute | Stand | Zahl |
|---|---|---|---|---|
| 1 | Stufen-Übersetzung (Ubershader) | `stamm/bild-kosten.js:529–548`: wer keine fertige Pipeline hat, zeichnet nicht und meldet sich bei `_erstWartet`; das erste Bild wartet auf JEDEN Bürger | VERWORFEN im Spike GTX 1050 (`KO/bericht/1113-stoff-stufe-null.md:11–25`, Zweig `w28-stoff-stufe-null` 0343f9e8, FUND-REGISTER:245 tot) | kalt 16,8 → 13,7 s, aber erstes Bild weiß ohne Kaskaden-Schatten, Ablösung 15,0 s, Bild-Abstand 38 → 96 ms, Σ lange Aufgaben 7,1 → 11,0 s |
| 2 | Welt-Speicher nach Hash | `stamm/studio-bruecke.js:1010–1016` (Lieferung hängt an den Kernen, die ihr Bau LAS), `:1065–1082` (Schlüssel `f~rest~kern:sha`, Register der Fassungen) | GELANDET z425 (`02c27132`, Merge a3a30307) | vorher 113 von 113 Lieferungen neu bei 2 byte-anderen (`:1015–1016`); Stufe 2 (Urteil nach Ergebnis-Hash) und 3 (Register im Lauf) NICHT freigegeben (GED `reihenfolge-abschliessen-live-tausch.md:29`) |
| 3 | Bauplan (Form in Glied-Koordinaten, Stufe = Abtastdichte) | Mensch: Genom-Skelett z426 (`45805bda`, EIN Leser `labProportionen`); Halm: Trieb mit Stützen `foundry-core.js:3116–3135`, `emitGrass` `:3154`; Stamm: Radius aus `hd` `phyto-core.js:99–103`; Kleid: Poncho `dicke: 0` `koerper-core.js:254` → Voxel-Hülle `backeHuelle` `foundry-core.js:9181`, Aufruf `:9355` (vox 0,06) | TEILWEISE: Mensch-Relief, Genom, Halm nah im Spiel; Kleid, Stamm, Halm ab 5 m offen | Silhouetten nah je 50: 7–8 → 50 (z426); Halm L1 33–37 mm → Trieb, L2 noch 121–133 mm (`foundry-core.js:3127`); vegetation.K1#1 Naht −18,3 % (Soll ≤ 15 %, FUND-REGISTER:193) |
| 4 | Fernfeld / bandbegrenzt | Halm-Ferne als Büschel unter dem Schirm (`w28-wiese-fern` 476a3ed9); Karten-Rand erfunden über σ 6 Texel (`w28-samen-karten-stufe` 5d6f899e, BEFUND F5–F7) | WIP, Kosten reißen | Ego 37,5 → 45,3 ms (+7,3, Third neutral), Dreiecke 365 797 → 351 275; Karte verlegt 10–18 % (Buche) / 29–33 % (Fichte) der Gestalt-Fläche, Kandidat Fichte 29 → 14 % |
| 5 | Licht als Feld | `stamm/stoff-material.js:3754` `LICHT_POOL.plaetze: 4`; `_lichtPoolTerm` `:2414`, Plätze je Stoff `:687–694` | Befund `w28-samen-lichtweg` d8887125: trifft die NACHT, nicht die Ankunft (Pool = 8 % des Fragment-Texts) | Licht-Pass beleuchtet 6 von 7 sichtbaren Laternen-Füßen (heute 0), reißt an Glas/Rauch/Haar; Karten-Messung fehlt |
| 6 | Erwachen als Ankunft | ankunft.K2 verlangt 0,00 % Lücke bis zur Ruhe (PM `stand.json:179`); Stufe-0-Bild des Spikes zeigt, wie grob aussähe (weiß, `probe-post/w28-stoff-stufe-null/2-stufe0-erstbild.jpg`, nicht angesehen) | NICHT BEWEISBAR ohne Wort des Schöpfers: es bewegt ein Soll (Kurs §2.10) | träfe ankunft.K3 (≤ 5 s), bräche K2 |
| 7 | Faule Simulation | `stamm/kreatur-leben.js:2236–2262`: Region holt ihre versäumten Takte beim Lesen nach, höchstens `aufholS` 3600 (`:3391`); Bewohner spielen ihren Tag nach (`siedlung-bewohner.js:3447–3449`, `ankunftH 3`, `ankunftWenden 12` `:3489–3490`) | SCHON IM KERN (w27) | kein neuer Samen; Gedächtnis führt ihn als Kandidat |

Gesetzbuch gegen Konsum (Kandidat 3, das Einzige mit Bild-Wirkung an der Ankunft):
- Der Körper KANN Haut-Stoff mit Saum (`dicke 0,032`, `koerper-core.js:250–254`); der Poncho KONSUMIERT ihn nicht (`dicke 0`,
  „bleibt eine Hülle") — er geht durch die Voxel-Hülle; die Fetzen in `7-paar…jpg` links sind diese Hülle.
- Phyto KANN den Trieb in jeder Stufe abtasten; die L2 tastet ihn mit EINEM Dreieck je Blatt (`foundry-core.js:3134`
  `stuetzen [[0, 1]]`), Breite = Fläche ÷ Dreiecke (`:3126–3128`) — die Wimpel am Hang.
- Phyto KANN den Schirm der Krone messen (Zweig `w28-stamm-krone`); main liest `P.hoeheM / P.hd` (`phyto-core.js:103`),
  Krone/BHD 38,6–41,9 (BEFUND Wiese F17).

## Die EINE begrenzende Entscheidung
In allen drei offenen Stufen von Kandidat 3 erfüllt die Stufe ihr Maß über einen ERSATZ-TRÄGER statt aus der Lage im
Bauplan: der Poncho über eine Voxel-Hülle mit Dicke 0 (`koerper-core.js:254` → `foundry-core.js:9355`), der ferne Halm
über die Breite eines Einzel-Blatts (`foundry-core.js:3126–3134`), der Stamm über die Höhe statt die Krone
(`phyto-core.js:99–103`). Für die Twist-Liste heißt das: kein neuer Twist-Spike (1, 2, 7 sind erledigt bzw. verworfen,
5 gehört der Nacht, 6 dem Schöpfer), bis Kandidat 3 als Klasse GANZ gefallen ist.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Klasse „Form aus dem Bauplan, jede Stufe": drei Stufen, eine Welle, Reihenfolge nach Sichtbarkeit an der Ankunft.
1. KLEID (Mensch nah, 10 m, Menge): Poncho und Hemd als Stoff aus der Haut mit Saum/Bund/Weite, keine Hülle mit Dicke 0.
   Leser (aus `ace30e73`): `koerper-core.js:213` kleidZonen · `foundry-core.js:9353` bakeMenschInstance · `:6467`
   __stoffAusHaut · `:6407` __stoffSpannt · `:7086` __mengenPrims · `koerper-core.js:3730` leibRelief · `:2486/:4488`
   Arm-Luft/Anlage · `:1872` menschPalette · `stamm/siedlung-bewohner.js:313` _bewohnerTracht · `stamm/studio-glieder.js:249`.
   Urteil `koerper-core.js:3104` kleidUrteil, `scripts/diag-mensch-anatomie.cjs:214` (KL1–KL5).
2. STAMM: BHD aus dem Schirm der Krone (`stammAusKrone`), `hd` fällt aus Eiche/Buche/Birke/Weide/Karst. Leser:
   `phyto-core.js:99–103` trunkR · `foundry-core.js:1633/1641` `P._trunkR` · Karte der Stufen (erben dasselbe Skelett,
   BEFUND Wiese F24). Kosten: L0 Eiche 6 954 → 6 016, L1 1 758 → 1 812, Birke L1 im Budget 2 766 (Commit 31f4607c).
3. HALM AB 5 m: die L2 und die Ferne tragen Büschel unter dem Schirm statt Wimpel. Leser: `foundry-core.js:3131–3135`
   HALM_STUFEN · `:3154` emitGrass · `:435` kindStages grass [1, 2] · `stamm/stoff-material.js` `_halmFerne` (Zweig) ·
   `stamm/vegetation-wiese.js` (Zweig, −530/+…). Kosten-Zeile: Ego heute 37,5 ms — Abgabe nur ≤ heute.
Kosten-Zeile der Welle: Dreiecke ≤ heute je Klasse, Ego/Third ≤ heute (Radeon, Mess-Wiese + Dorf), Programm-Zahl vor dem
ersten Bild ≤ 43 (Spike-Zahl, `1113-stoff-stufe-null.md:33`).
Kriterien: vegetation.K1#1 radeon/gtx (Naht −18,3 % ↔ ≤ 15 %, 0 Punkte, „Station seit der Messung geändert",
`stand.json:4419–4421`) · mensch.K4#1 gtx (ungemessen, R6 an koerper-core, `stand.json:5045–5047`) · lod.K4#1 (0,45 %
↔ < 2 %, gehalten, darf nicht fallen) · Pflicht A laub-kante 0,2635 ↔ ≤ 0,22 (gehört der Karte, nicht diesem Schnitt).
Bildpaar: Dorf der Ankunft, Kameras aus `w28-wiese-fern` 476a3ed9 (Augenhöhe, Dorf-Hang, Hügel, Dach) + Bewohner vorn/hinten.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w28-leib-nah` ace30e73 (+ Merge main 694b85d2, 21:34): Bildpaare 7–13, Kandidat schließt die Risse; fehlt Abgabe-Kopf,
  Bildpaar am Dorf vorn/hinten im Spiel, mensch.K4#1 gtx.
- `w28-stamm-krone` 31f4607c: ABGEGEBEN 12.11. 18:54, liegt ohne Arbeiter, „z416 K4 ungeklärt" (FUND-REGISTER:245);
  `kd 21,5` ungeprüft (Commit-Rumpf). Fehlt: das ungeklärte K4 benennen, neu auf main mischen, Zug.
- `w28-wiese-fern` 476a3ed9: WIP, Ego +7,3 ms; fehlt die EINE Gegenprobe (in `_halmFerne` `_laubLichtStoff` aus) und
  main einmischen; vier Kamera-Paare laut Rumpf besser.
- Gelandet und nicht mehr Kandidat: `w28-halm-trieb` (b560adaf), `w28-platte-fein` (z425), `w28-leib-genom` (z426).
- Befunde ohne Schnitt: `w28-samen-karten-stufe` 5d6f899e, `w28-samen-lichtweg` d8887125, `w28-samen-fahrzeug` 5406f47d
  (Fahrzeug-Haut bricht Lehre 11 → braucht das Wort des Schöpfers).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Nicht gelesen: der Code von `w28-leib-nah` (nur Leser-Liste und Bild 7), sein Kosten-Wert je Geburt; was „z416 K4" ist.
- Nicht gesehen: Bilder 8–13 von leib-nah, die Lichtweg-Bilder, das Stufe-0-Bild des Spikes.
- Widerspruch: das Gedächtnis (`samen-twists-kandidaten.md:31`) setzt Kandidat 1 an Platz 1 — der Spike vom 13.11. verwarf
  ihn; Kandidat 7 steht als „unbewiesen", liegt aber seit w27 im Kern. Die Notiz ist veraltet.
- Der Himmel am Mittag (dunkel-marine) trifft keinen der sieben Twists und hat keinen Arbeiter (UEBERGABE §3).
- Ob die Ego-Kosten der Halm-Ferne am Licht oder an der Überzeichnung hängen: ungemessen.
- Ob Fernfeld (4) über die Wiese hinaus (Wald, Menge, Stadt) trägt: kein Befund.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
- Kleid (leib-nah): Wirkung 5 · M · Risiko: der Ofen-Golden und mensch.K4#1 kippen auf der GTX am baum-gleichen Kopf.
- Halm ab 5 m (wiese-fern): Wirkung 4 · M · Risiko: Ego-Kosten reißen, ohne Gegenprobe keine Abgabe.
- Stamm aus Krone (stamm-krone): Wirkung 2 · S · Risiko: das ungeklärte K4 und die ungeprüfte Zahl kd 21,5.
- Twists 1/2/5/6/7 neu öffnen: Wirkung 0 heute · Risiko: Streuung gegen den Kurs (WIP-Grenze).
