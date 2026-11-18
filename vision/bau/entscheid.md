# ENTSCHEID — das EINE Gesetz des Bauens (Richter, main 18058dba, nur gelesen)

Alle drei Dateien liegen vor (tafel.md, entwurf-stoff-statik.md, entwurf-mensch-nutzung.md); gelesen ganz, dazu die acht Lese-Blätter
a–h ganz und das Muster vision/leben/entscheid.md. An der Quelle selbst nachgeprüft: fachwerk-core.js:155–224, 416–495, 1076–1093,
2117–2276, 4065–4137, 4400–4517, 5905–5933, 9519–9538 · schmiede-core.js:2876–2965 · gelaende-core.js:1440–1471, 5755–5779, 5835–5909,
Exporte :7776, :7778, :7887 · phyto-core.js:92–121, 3035–3070, Export :7106 · stamm/siedlung-bewohner.js:830–879 · stamm/siedlung-satz.js
:760, :796, :1980 · stamm/siedlung-wege.js:2018, 2242–2245, 2970–2985 · cores.manifest.json ganz · package.json:100, 132, 135, 146, 163.
Gerechnet mit node am ECHTEN Kern (fachwerk-core.js im vm geladen, kein Spiel-Code geändert; Skripte preis2.cjs, heute.cjs im Scratchpad):
bauRezept ohne Haushalt 4,02 µs, mit Haushalt (Packer) 11,08 µs je Haus (5·10⁴ Rufe, warm); DORF nH 90 2,26 ms je Plan; 30 Pläne nH 90:
1 691 Wohnhäuser, Breite Q10/Q50/Q90 7/10/14 m, D ≥ 5 m bei 97 %, Traufe Q10/Q90 3,10/7,80 m, 3,11 Leute je Wohnhaus, Spearman
(Breite, wohl) 0,09.

Nachgeprüfte tragende Behauptungen: A — Balkenlage liegt auf JEDEM Ständer und spannt die volle Tiefe (FC:466–470, `bx` aus bayMax
FC:420); Durchbiegung 15 × 21 bei e 1,7 m, D 7: 146 mm, σ_d 47,5 MPa (nachgerechnet gleich); Kreuzholz aus d 0,258 = 0,149 × 0,211
(gleich); L_max mit meiner vereinfachten Kriechzahl 3,80/4,53/4,78 m gegen A 3,54/4,23/4,47 m — Größenordnung bestätigt, der
EN-Nachweis gehört in den Spike; STOFF_GESETZ holz ist EINE Zeile E 1,1e10 (sc:2893), ρ verweist auf RHO.holz (sc:2910); schneePegel ist
geschlossen und exportiert (gc:1467, :7887), forestNische trägt wF/wT/wE und ist exportiert (pc:3037, :7106). B — jeder Welt-Ruf von
bauRezept trägt `null` (FC:4436, 4450, 4462, 4468, 4473 gelesen); leuteVon liest `hp.leute` VOR der Flächenformel (FC:9531), der Wirt
liest `FC.leuteVon(sl.ov)` (SB:839); `hp.parzelle` hat keinen Erzeuger (FC:2255); das Kaufhaus ist gekappt W ≤ 8,5 (FC:2187). Offen
gefunden: „Eiche 0,330 m" (pc:120) steht neben `trunkR` (pc:110, ein Radius) — Radius oder Durchmesser ist an der Quelle nicht entschieden.

## (0) STAND NACH SPIKE UND GEGENPRÜFUNG (Kopf des Kapitels, 18.11. 22:07) — Welle 1 ist in dieser Form NICHT baureif

Dieser Abschnitt steht ÜBER dem Entscheid des Richters und gilt, wo er ihm widerspricht. Quellen: `spike-100-haeuser.md`,
`pruefung-spike.md` (22 Urteile gegengerechnet), `pruefung-quelle.md` (54 Behauptungen an der Quelle, 41 stimmen, 13 falsch/ungenau).
Nichts davon ist am Bild geprüft; gerechnet wurde am echten Kern (Kopie byte-gleich, SHA geprüft).

**Was der Zensus trägt (hält an der Quelle).** Die Tafel: 882 Größen nach Dubletten, 769 gesetzt ohne Anker, 58 mit Anker, 55 folgen;
40 Zwillinge, 31 Tote, 16 Details, die im Nah-Bild nicht tragen (9 mit Bestandsbild). Die drei Wurzel-Befunde halten: jeder Welt-Ruf von
`bauRezept` trägt `null` als Haushalt (FC:4381–4473, 5775); kein Tragwerks-Maß liest Stoff (`STOFF_GESETZ` 0 Leser in FC); die graue
Fenster-Tafel ist der nach außen offene Flügel mit Deckkraft 0,92 vor leerer Öffnung (FC:1084/1089, 2089).

**Was am Gesetz FÄLLT (zwei der fünf Behauptungen aus §5, sicher).**
- Behauptung 1 (jede Tiefe trägt ihre Ständerreihe): WIDERLEGT. Die Reihe trifft Treppe oder Tür in 52 von 94 Häusern (55 %) auch in
  der günstigsten Lage, Schwelle 10 %. Der Konflikt hängt am geerbten Längs-Flur (FC:422, 385–389), nicht an der Statik.
- Behauptung 3c (die Häuser unterscheiden sich sichtbar mehr): WIDERLEGT. Traufe-Spanne 2,67 m gegen 4,70 m heute an denselben
  2 595 Losen; die Gesetz-Stadt hat 3 Breiten statt 21, 32 Formen statt 440, die häufigste Form trägt 28 % statt 6 % der Häuser —
  sie wird gleichförmiger, nicht reicher. Das Los als 15 m ÷ [3, 2, 1] ist dafür die Wurzel.

**Was am Gesetz NICHT ENTSCHIEDEN ist.** 3a (zirkulär am Prototyp), 3d und 5c (Köpfe 4,75–5,62, ×1,51–×1,81 — hängen an den
Gesinde-Annahmen ohne Anker), 4 (Mauer: nach dem §5-Satz 2 von 30 Städten über 0,8, aber jede Stadt der frühen Neuzeit fällt; Grenze
213 E/ha), 5b (der Gesetz-DORF ist nie gebaut gemessen; heute kalt 4,1–5,2 ms reißt die 3,5 ms schon). 1b (≥ 20 Bauaufnahmen) ist
offline nicht prüfbar.

**Was am Gesetz HÄLT.** Die Statik selbst (drei Häuser von Hand nachgerechnet: der heutige Balken 15 × 21 über 7,46 m η 2,24, w 145 mm
gegen 25 mm; das Gesetz-Haus mit 4,17 m Schiff η 0,46): heute tragen 0 von 100 Häusern, 97 % der spannenden Balkenlinien liegen über
L_max. Aber der Wortlaut „kein Balken trägt“ ist falsch — 400 von 844 Linien liegen auf einer Wand, und Querwände stützen die
Seitenstreifen (pruefung-quelle F2). Der Preis je Rezept: 1,1–1,5 µs warm, 9,1–10,7 µs kalt (heute 0,6–0,7 / 2,7–4,2).

**Korrekturen am Text des Richters (gelten ab jetzt).**
- §3 „Verdopplungszeit halbiert sich“ ist falsch (F1): Rate und Kosten steigen gleich, ERSTER PUNKT 13 verliert seinen Grund.
- §4 Die acht Bahnen haben KEINEN ausschließlichen Datei-Besitz (F4–F8): DEFCOL, fensterSchlaeft, glasdunkel, STADT_MASSEN, PROXYHAUS
  und der Herd liegen in je zwei Bahnen; FC:3110–4059 (DORF_NORM, STADT_FORM, kachelNetz, viertelWort), exportSettlement FC:9722 ff.,
  PRESETS FC:5775, stamm/studio-bruecke.js und scripts/diag-fachwerk-contract.cjs gehören keiner Bahn.
- §4 B3 `tragwerk(P, P.ort ?? Heimat)` ist fail-soft und fällt (F9): ohne `ort` wirft der Bau.
- Kleinere Zahlen: Kamin nicht „1 je Haus“ (F3: ROUND, kuppel, modern/glas tragen keinen); Lehm 0,09/0,06 ist kein Zwilling (F10);
  Los-Ziehungen 9–10 statt „bis zu acht“ (F11); Glas-Vorstand ab 0,37 m (F13).
- Ungeprüft und damit NICHT belegt: die Gesamtzählung 196 fallen / 14 Anker / 559 bleiben, Spearman 0,09, 3,11 Leute je Haus,
  2,26 ms je Plan (die Skripte des Richters liegen nicht im Repo).

**Urteil des Kopfes.** Die RICHTUNG steht (Adresse → Haushalt → Programm; Stoff des Orts → Tragwerk; Betrieb → Zustände), die FORM
von Welle 1 fällt an zwei Stellen: der Grundriss muss aus dem Programm kommen, BEVOR ein Tragwerk Ständerreihen setzt (sonst steht die
Stütze in der Treppe), und das Los darf nicht drei Stufen einer Hofstätte sein (sonst wird die Stadt gleichförmiger als heute). Keine
Bau-Welle vor einem zweiten Spike, der genau das prüft.

**ERSTE PUNKTE DER NÄCHSTEN RUNDE (in dieser Reihenfolge; sie ersetzen §6, was dort steht und hier fehlt, fällt mit dem Grund
„hängt an einem der sechs“).**
1. Grundriss aus dem Programm (Herd, Flur, Treppe als Folge der Räume) als Prototyp, dann Behauptung 1a neu: Ständerreihe gegen
   Treppe/Tür ≤ 10 % — erst dann ist entschieden, ob die Schiffigkeit fällt oder der Längs-Flur.
2. Das Los als stetige Größe (Hofstätte, Teilung, Erbteilung über die Zeit) statt 15 ÷ [3, 2, 1]; Schwelle am sichtbaren Maß:
   Zahl der Formen je Stadt, Anteil der häufigsten Form, Breiten-Stufen — nicht schlechter als heute (440 / 6 % / 21).
3. GEWERBE und Gesinde mit Anker (Quelle nachschlagen, nicht aus dem Gedächtnis), dann 3d und 5c entscheiden.
4. Bahnen neu schneiden: je Name des Absenz-Greps genau ein Besitzer, Rest 0; der Weg des `ort` durch den Worker-Kanal
   (studio-bruecke.js:1476 ff.) und nach `kachelMassen` (SW:2061) festgelegt, ohne `?? Heimat`.
5. Die Zählungen ins Repo (Skripte der Tafel und des Richters) und zweitzählen: 769 / 196 / 14 / 559.
6. Die fehlenden Bilder am main-Kopf: das 300-m-Paar an derselben Kamera, Moos auf Fachwerkholz, das Raumprogramm innen,
   die graue Fenster-Tafel nah — sieben Befunde der Tafel haben kein Bild, alle neun Bilder stammen von älteren Ständen.

## DIE ENTSCHEIDUNG

Ein Haus ist eine ADRESSE im Samen — (Siedlung · Los · Baujahr) —, und alles an ihm ist die Antwort zweier Fragen an diese Adresse:
WER WOHNT UND WIRKT HIER (Haushalt aus Wohlstands-Klasse und Gewerbe → Raumprogramm → Fläche) und WOMIT WIRD HIER GEBAUT (der Stoff
des ORTS: das Holz der Wald-Nische, der Schnee des Pegels, der Grund → Querschnitt → Spannweite → Schiffe, Geschosshöhe, Wandstärke,
Deckung und Neigung). Das Los gibt die Breite (die Hofstätte, geteilt nach der Klasse), das Programm die Fläche und damit Tiefe und
Geschosse, das Tragwerk teilt die Tiefe in Schiffe statt sie zu kappen; die EPOCHE gibt das Werkzeug (lichte Höhe, Brüstung,
Licht-Anteil, Scheibengröße), der BETRIEB (der Takt der Bewohner) gibt die Zustände (Rauch, Flügel), die KULTUR behält nur die Sitte
(Neigung über der Grenzneigung, Figur, Anstrich). Das ist EIN Gesetz in EINER Quelle: der Block `BAU_GESETZ` in fachwerk-core.js neben
`bauProgramm`, gefüttert vom Wirt mit dem Ort, gelesen von jedem Bau, jeder Stufe und jedem Bewohner. Gepfropft: Adresse, Haushalt,
Programm und Los aus Entwurf B, Stoff, Statik, Deckung und Wand aus Entwurf A. Welle 1 tötet 196 der 769 Stellwerte ohne Anker der Tafel
(25 %, ohne die Stoff-Paletten 122 von 384 = 32 %), gibt 14 einen Anker und lässt 559 benannt stehen; im Bild trägt jede Tiefe ihre
Ständerreihe, der Kaufmann steht breit am Markt, die Buden schmal am Rand, kein Fenster steht als Tafel vor der Wand, kein Haus springt an
der 300-m-Grenze, und mittags raucht nur, wer kocht oder schmiedet.

**Die Richtung des Koordinators — bestätigt, an vier Stellen geschärft, an einer widersprochen.**
- Bestätigt: Adresse im Samen; Programm aus Bewohnern und Gewerbe (Gegen-Gesetz steht schon, nur ohne Schreiber: FC:2229, 9531); Tragwerk
  aus Stoff und Spannweite.
- Geschärft (a): die Adresse ist erst dann eine, wenn das LOS in jeder Stufe dasselbe ist — heute liegen zwei Los-Setzer auf demselben Netz
  (FC:4067 eingestanden, Tafel Z27); eine Adresse ohne gemeinsames Los ist ein Etikett.
- Geschärft (b): der Stoff ist der des ORTS, nicht der Kultur — sonst wird „Stoff" die nächste Tafel (heute 99 Kultur-Hex, FC:2122–2153).
- Geschärft (c): die Spannweite begrenzt nicht das Haus, sie TEILT es — Tiefe aus Programm und Los, Schiffe = ⌈D / L_max⌉; keine
  Tiefen-Klammer (die dreifache W/D-Klammer Z14 fällt).
- Geschärft (d): die Kultur bleibt als SITTE — die Statik zieht die Neigung nur schwach (A §2: 1,43–1,67 kN/m² zwischen 30° und 60°), das
  Alpenhaus baut 32° gegen das Lastminimum (FC:2134); Neigung über der Grenzneigung, Figur, Anstrich sind Kultur, kein Gesetz.
- Widersprochen: „Detail aus Werkzeug und Epoche" erklärt die FORM-Details (Glas, Sprossen, lichte Höhe), aber die Details, die heute am
  lautesten nicht tragen, sind ZUSTÄNDE: der Flügel steht in jedem Fenster 0,62 rad offen (FC:1084/1089), 45 % der Fenster sind opak
  (FC:2751), jeder Kamin raucht immer (SB:95–107; Tafel B1, B9). Sie folgen aus dem BETRIEB, nicht aus der Epoche.

**Widersprüche der Entwürfe — entschieden.**
1. Ort der Rechnung: A liest `__schmiedeCore` und gc aus DORF; B lässt den Wirt die Proben reichen → B. fachwerk-core liest heute keinen
   fremden Kern (Blatt b §1, e §4), und das Labor muss ohne Wirt bauen. Der Wirt reicht `ort`, das Labor die Heimat.
2. Ergebnis im ov (A: ~11 Felder) gegen Funktion beim Leser → Funktion. Das ov trägt die EINGÄNGE (`ort`, `haushalt`); HAUS im Faden,
   `hausMasse` und `leuteVon` rufen dieselbe reine Funktion. Eine Ergebnis-Kopie im ov ist der Stoff, aus dem Z1 (Traufe 5,45 ↔ 5,90) wuchs.
3. W/D/st: A lässt den Kultur-Würfel die Hülle setzen, B das Programm → B. A §5 nennt Programm und Wohlstand selbst außerhalb der Statik;
   gemessen erklärt der Wohlstand heute die Breite nicht (Spearman 0,09).
4. Tiefe: B leiht dMax 11 vom Tragwerk, A teilt in Schiffe → A (keine Klammer, Punkt c).
5. Byte-Vertrag: A verspricht W, D, Lose byte-gleich → fällt mit Punkt 3; jedes Haus ändert sich, benannt in (3).
6. hhMittel 4,75 (Laslett 1972): B als Eingang → Richter-Anker. Die Köpfe folgen aus Kern + Gesinde, 4,75 ist das Maß, an dem es fällt.
7. Balkon: B behält den Würfel FC:4448 → fällt ins Programm (Raum mit Lage `laube`, FC:2251).
8. Grenzneigung: A nimmt ZVDH (Mönch-Nonne 40°) und nennt die mediterrane Praxis 17–25° → die DECKUNG folgt der Region des Orts, Mönch-Nonne
   mit 22° (Mitte der Praxis, unsicher); Kulturen unter der Grenzneigung ihrer Deckung (griechisch 12°, marokkanisch 14°) tragen das
   Lehm-Flachdach — das ist A §5 Punkt 7, hier entschieden statt offen.
9. Geschosshöhe: A lässt die lichte Höhe offen → lichte Höhe je Epoche (MBO §47 ab 1900, davor unsicher, benannt).
10. Mauer: B schiebt sie hinter Punkt 5 → Welle 1; die Formel `min(195, 26 + 8,4·√nG)` (FC:5364) und ihr Zwilling `wasserReich`
    (FC:4626) fallen mit dem Haus, das die Köpfe trägt.
11. Sonderbauten (B offen): bleiben in Welle 1 als benannte Maß-Zeilen; das Gemeinde-Programm ist ERSTER PUNKT 7.

## (1) DAS GESETZ — `BAU_GESETZ` in fachwerk-core.js

### 1.1 Konstanten (jede mit Anker; „unsicher" = aus dem Gedächtnis, nicht nachgeschlagen)
```
BAU_GESETZ = Object.freeze({
  // TRAGWERK
  kmod: 0.8, gammaM: 1.3,          // EN 1995-1-1 Tab. 3.1 (NKL 1, mittlere Dauer) · Tab. 2.3 (Vollholz)
  kdef: 0.6, psi2: 0.3,            // EN 1995-1-1 Tab. 3.2 · EN 1990 Tab. A1.1 (Kat. A)
  gammaG: 1.35, gammaQ: 1.5,       // EN 1990
  wInst: 300, wFin: 250,           // l/300 · l/250, EN 1995-1-1 Tab. 7.2 (Wahl im Band)
  gDecke: 1.5, qWohnen: 2.0,       // kN/m², DIN 1055-1 / EN 1991-1-1 NA — unsicher
  sockel: 0.30,                    // m, Spritzwasser DIN 68800-2 — unsicher
  wandSchlank: 25, sigma0: 1.2,    // h/d · MN/m², DIN 1053-1 — unsicher; Modul NF 0,115/0,24/0,365 (DIN 105, FC:1850 trägt ihn)
  diele: 0.06,                     // m — ohne Anker (FC:860 heute), benannt
  zopf: 0.70,                      // d_Sparren/d_Stamm — ohne Anker, rückgerechnet aus FC:180 (0,10×0,15 = Kreuzholz aus 0,18) ÷ 0,258
  // DECKUNG (ersetzt STIL_GRENZNEIGUNG FC:160): Grenzneigung °, Eigenlast kN/m² Dachfläche
  deckung: { biber:[30,0.75], schindel:[22,0.25], reet:[45,0.70], hohlpfanne:[35,0.75],   // ZVDH-Fachregeln — unsicher
             moench:[22,0.75],                                                         // mediterrane Praxis 17–25 — unsicher
             lehmflach:[2,1.5], flach:[2,0.3] },                                       // Flachdach-Gefälle ≥ 2 % — unsicher
  // MENSCH
  klasse: [0.5, 0.9],              // Quantil-Grenzen arm | mittel | reich — Steuerlisten-Größenordnung, unsicher
  wohl: [0.44, 1.0, 1.8],          // je Klasse, rückgerechnet aus B (Schlafplatz 3,6 · 5 · 7 m²)
  kinder: [2, 2.5, 3],             // überlebende Kinder je Klasse — unsicher
  schlafM2: 2.5, kammerM2: 1.5,    // × (1 + wohl) · Zuschlag je Kammer — unsicher
  herdraum: [9, 2], kueche: [9, 14], stube: [8, 2], stubeAb: 1300, kuecheAb: 1700,   // B 1.1 — unsicher
  hofstaette: [15, 30],            // m, 50 × 100 Fuß, Zähringer Gründungsstädte — unsicher
  dichte: [150, 250],              // E/ha in der Mauer, MA/FNZ — unsicher
  // EPOCHE (das Werkzeug)
  licht: [[1500,2.0],[1800,2.2],[1900,2.6],[1e9,2.4]],     // lichte Höhe m; ab 1900 MBO §47 (1), davor unsicher
  bruestung: [[1900,0.70],[1e9,0.80]],                    // m; ab 1900 MBO §38 (4), davor unsicher
  lichtAnteil: [[1500,1/12],[1800,1/10],[1e9,1/8]],       // Fensterfläche / Netto-Grundfläche; 1/8 MBO §47 (2), davor unsicher
  scheibe: [[1500,0.12],[1700,0.25],[1900,0.5],[1e9,9]],  // größte Scheibe m (Butzen · Mondglas · Zylinderglas · Float) — unsicher
  kaminUeberFirst: 0.40,                                  // m, MFeuV §19 (1) — Wortlaut nicht nachgeschlagen
  heizgrenze: 15,                                         // °C, Gradtag G20/15 (VDI 3807) — unsicher
})
```
Außerhalb von fachwerk-core, in der Quelle ihrer Domäne: drei Holz-Zeilen `eiche` (D30), `kiefer`, `tanne` (C24) in STOFF_GESETZ `REIN`
(schmiede-core.js:2891–2907) mit ρ, E, f_m,k, f_c,0,k nach EN 338 (unsicher; RHO_VON holz sc:2910 zeigt dann auf die Zeile). Der
Stamm-Durchmesser je Art bleibt bis zu `stammD` (ERSTER PUNKT 3) ein benannter Wert je Art (Eiche 0,258 m aus A, ohne Anker).
Mensch-Daten als Zeilen: `GEWERBE` (11 Haushalts-Gewerbe: Gesinde und Räume [id, m², geschoss, lage], ersetzt die `mass`-Ops der
Haushalts-Bauten FC:2184–2200) und `GEWERBE_ANTEIL[band][gruppe]` (Anteil der Haushalte je Gewerbe-Gruppe, B 1.1, unsicher).
Gezählt: 40 benannte Einträge in BAU_GESETZ — 9 mit Norm-Anker (8 × EN, MFeuV), 3 mit Norm-Anker nur ab 1900 (MBO), 2 rückgerechnet
(zopf, wohl), 1 ohne Anker (diele), 25 „unsicher" —, dazu 3 Holz-Zeilen, 11 GEWERBE-Zeilen, 1 Anteils-Tafel.

### 1.2 Funktionen (rein, ohne Zustand, ohne Wanduhr, ohne eigenen Zufall)
Der Zufall bleibt im DORF-Strom `rnd` (FC:4404): je Los vier Ziehungen an fester Stelle, unbedingt — u_ersatz (nur Ring), u_kultur,
hs, u_wohl. Die bedingte Ziehung FC:4448 und die Ziehungen FC:4446, 4449 fallen (sie gehören dem Programm).
```
adresse(plan, i)                         → {s, i, baujahr}     baujahr wie heute (chronikJahr FC:4430 bzw. FC:4433)
wohlKlasse(rang, u)                      → {q ∈ [0,1], klasse 0|1|2, wohl}   q = (1 − rang + u)/2 (Kern reich = Bodenrente)
gewerbeVon(adr, n, band, groesse, q, lage) → gewerbe-id         Zuteilung nach GEWERBE_ANTEIL über die Gründungsfolge; LAGE (platz ·
                                                                kirche · seite, STADT_GRAMMATIK) entscheidet WO, die Quote WIE VIELE
haushalt(gewerbe, klasse, baujahr)       → {koepfe, kern, gesinde, vieh}     Köpfe = 2 + kinder[klasse] + Σ gesinde
raumProgramm(H, baujahr)                 → [[id, m² netto, geschoss, lage]]  Herdraum/Küche/Stube nach Epoche, Kammern je Schlafplatz,
                                                                GEWERBE[H.gewerbe].raeume
losVon(netz, block, k, klasse)           → {b m, t m, x, z, phi}   b = hofstaette[0] / [3, 2, 1][klasse], t = hofstaette[1]
holzDesOrts(nische)                      → 'eiche'|'kiefer'|'tanne'  argmax(wE, wF, wT) von forestNische (pc:3047)
kreuzholz(d) → {b, h} m                  b = d/√3, h = d·√(2/3)    (Balken, Pfette)
vierkant(d)  → a m                       a = d/√2                  (Ständer, Schwelle, Rähm, Stuhl)
balkenSpann(b, h, holz, e, g, q)         → L_max m   min(Durchbiegung l/300 inst, l/250 fin mit kdef·psi2, Biegung kmod·f_m,k/gammaM)
schiffe(D, Lmax)                         → {n, spann m}   n = ⌈D/Lmax⌉, n − 1 Unterzüge mit Ständerreihe
geschossH(baujahr, h)                    → m   licht(baujahr) + h + diele
geschossFolge(hp, ort)                   → [y0, y1, …, traufe] m   sockel + Σ geschossH — DER EINE Leser für HAUS-`levels` (FC:214),
                                                                `hausMasse` (FC:4120), Flügel, Rundbau, Anbau
schneeLast(sk, alpha)                    → kN/m²   mu1(alpha)·sk (EN 1991-1-3 Tab. 5.2); sk = 9,81·max_Saison schneePegel (gc:1467)
deckungVon(stil, region, pitchKultur)    → deckung-id   alt→biber · huette→schindel · stroh→reet · klinker→hohlpfanne · stein→moench
                                                                in mediterran/antik/fernost, sonst biber · modern/glas→flach;
                                                                pitchKultur < deckung.min ∧ stein → lehmflach
neigung(deckung, pitchKultur)            → °   max(deckung.min, pitchKultur)
pfetten(D, sparrenBH, e, sk, deckung, alpha) → n Felder je Dachseite (1 = Fuß + First, 2 = eine Mittelpfette)
wandDicke(stoff, geschosse, hG)          → m   Fachwerk: vierkant(d); Mauer: kleinstes NF-Modul mit h/d ≤ wandSchlank und σ ≤ sigma0
fensterFuer(raum, wand, gefachLicht, baujahr) → {n, w, h, sprossen}   Fläche ≥ lichtAnteil·A_raum über die Gefache der Außenwand, w ≤
                                                                gefachLicht, h ≤ licht − bruestung, Sprossen = ⌈w/scheibe⌉
tragwerk(hp, ort)                        → {holz, d, a, b, h, schiffe, spann, e, pfetten, wandD, deckung, pitch}
stoffTon(stoff, ort)                     → lin RGB   holz: Ton der Art · stein: Fels am Anker · lehm: kahlGrund (gc:5835)
patina(stoff, alterJahre, nass)          → lin RGB   ALTER-Zeile des Stoffs (bau-vorlagen.js:1684–1692), alter = Welt-Jahr − baujahr
herdBrennt(bewohnerDaheim, stunde, T)    → bool      daheim ∧ (Kochzeit ∨ T < heizgrenze); Werkstatt-Herd: Arbeitszeit des Gewerbes
mauerRadius(E, band)                     → m   √(E / dichte[band] · 10⁴ / π)
selbsttest()                             → {kreuzholz, lmax, geschossH, sk, grenze, koepfe}
```
`ort = {holz, d, sk, felsTon, lehmTon, region}` rechnet der Wirt EINMAL je Siedlung am Anker aus forestNische, schneePegel, kahlGrund und
der Holz-Zeile; das Labor nimmt die Heimat (`ortGesetz(null)`, gc:5843). DORF verlangt `DP.ort` und wirft ohne ihn (kein stiller
Ersatz). Das ov eines Loses trägt `ort` und `haushalt` (~120 Zeichen von 8 192, siedlung-bauten.js:3437); `hp.leute` schreibt bauProgramm
(FC:2274) — damit ist die Kette Programm → hp.leute → leuteVon → SB:839 zum ersten Mal in der Welt beschrieben. bauRezept ohne Haushalt
für eine Haushalts-Rolle wirft.

### 1.3 Die EINE Quelle
`BAU_GESETZ` und die Funktionen stehen in fachwerk-core.js direkt nach `bauProgramm` (heute nach :2276), im Export `__fachwerkCore`.
Grund gegen einen eigenen Kern (anders als leben-core): das Haus-Gesetz hat keinen Leser außerhalb der Haus-Fabrik — HAUS (Faden,
foundry-bruecke.js:892), DORF und hausMasse (Haupt-Faden), leuteVon (SB:839 über FC) laden fachwerk-core schon (cores.manifest.json:28–33);
fachwerk-core nennt sich schon „EIN Rezept für Labor und Welt" (FC:2166). Ein zweites Haus-Buch wäre der Zwilling. Die Stoff-Zahlen
bleiben im Stoff-Buch (schmiede), die Ort-Zahlen im Gelände- und Pflanzen-Buch; der Wirt verbindet sie.

## (2) WAS FÄLLT — beim Namen, ganz, in derselben Landung

| Domäne (Tafel) | GESETZT ohne Anker | fällt | bleibt, bekommt Anker | bleibt ohne Anker (benannt) |
|---|---|---|---|---|
| D1 Nutzung | 72 | 42 | 0 | 30 |
| D2 Tragwerk | 52 | 22 | 1 | 29 |
| D3 Öffnungen | 47 | 21 | 1 | 25 |
| D4 Dach | 54 | 14 | 9 | 31 |
| D5 Stoffe | 385 | 74 | 3 | 308 |
| D6 Stadtplan | 112 | 12 | 0 | 100 |
| D7 LOD/Ferne | 31 | 11 | 0 | 20 |
| D8 Kultur | 16 | 0 | 0 | 16 |
| **Σ** | **769** | **196** | **14** | **559** |

Von den 58 GESETZT mit Anker fallen 5 Zwillinge (RAHMEN_TIEFE, SCHEIBE_RAND, KREUZ, FLUEGEL_LAGE FC:2785–2788; LEUTE_GESETZ.flaeche
FC:9526), 53 bleiben; die 55 FOLGT bleiben, dazu fallen die gesetzten Koeffizienten zweier FOLGT-Zeilen (Rw FC:5364, wasserReich FC:4626).

**D1 (42):** wohnhaus.geschosse/grundriss FC:2183 (2) · Fläche je Person FC:2183 + LEUTE_GESETZ.flaeche/wohlFlaeche FC:9526 (3) ·
LEUTE_GESETZ.max FC:9526 (1) · `mass` von gasthaus, schmiede, pfarrhaus, werkstatt, backhaus, patrizierhaus FC:2184–2200 → GEWERBE (6) ·
Packer capK, Deckel 165, capL, F0, Mindestfuß, W/D-Klammer FC:2255–2270 → Los (b, t) und Hof des Programms (6) · Los-Würfel Keller,
Anbau, arm, Balkon, Grundriss FC:4446–4449 (5) · +1 Geschoss FC:4444 (1) · Scheunen-Quote und Hof-Anbau-Neigung FC:4476, 4481 →
Haushalt ackerbuerger / deckung (2) · Grund-Satz gasthaus und schmiede, je-Folge handwerk und markt, Wohnturm- und Patrizier-Regel
FC:4323–4340 → GEWERBE_ANTEIL / wohlKlasse (6) · Raum-Gewichte, Mindesttiefe, Herd-Schnitt, Raum-Minimum FC:601–621 → Räume des
Programms (4) · Innenwand FC:897 → wandDicke (1) · Möbel-Würfel Kammer/Stube/Küche FC:1232–1240 → Köpfe und Schlafplätze (3) ·
Keller-Inventar FC:1254 → Lager-Räume (1) · TAGES_GESETZ.angebot KC:5177–5187 → GEWERBE (1).
**D2 (22):** egH, ogH FC:178 → geschossH (2) · post, sill, raehm, balkenB, balkenH, spar, pfetteB, pfetteH FC:179–180 → vierkant/kreuzholz
(8) · sparH FC:180 und jetty FC:171, tot (2) · Kellerhöhe, Keller-Default FC:212–213 (2) · Gefach-Backstein 0,32 × 0,15 FC:641/733 → NF
(1) · Wanddicke glatt/Brandwand/Turm/Loch FC:678, 1773, 1683, 1513/1534 → wandDicke (4) · Firststuhl-Stiel FC:792–794 → vierkant (1) ·
Flügel-Traufe egH·0,86 FC:521 und Rundbau-Lage FC:1628–1642 → geschossFolge (2). Anker neu: foundH → sockel 0,30 (DIN 68800-2).
**D3 (21):** winEG/winOG off, ch FC:476 → bruestung + fensterFuer (4) · Fenstertakt FC:479 → lichtAnteil (1) · winW-Fallback FC:631, tot
(1) · Flügel 0,62 rad nach außen FC:1084/1089 → Flügel in der Öffnung, Zustand aus Betrieb (1) · FENSTER_SCHLAF + Raster FC:2751–2756 (2) ·
acht Teilbau-Maßsätze FC:1277–1754 → fensterFuer (8) · Ausfachung um die Öffnung FC:640–644/678 → wandDicke (1) · Fern-Scheibe/-Rahmen
FC:2806–2812 → fern liest das nahe Fenster (2) · PROXYHAUS-Fenster FC:4553–4557 (1). Anker neu: Anbau-Tor → Wagen lichtM (BRUECKE_GESETZ
FC:4662, Blatt f#133).
**D4 (14):** pitchDeg 50 FC:171 (1) · Rezept-Klemme 8–62 FC:2207 → deckung.min (1) · Quergiebel/Kreuzdach-Überstand FC:1391, 1411 → der
eine Überstand (2) · Gauben-Bedingung und -Zahl FC:256 → Räume im Dach (2) · Giebelfenster FC:713 → fensterFuer (1) · Anbau-Gefälle und
-Traufe FC:538–541 → deckung / geschossFolge (2) · Balkon-Dächlein FC:1450–1452 → deckung (1) · Kamin-Existenz und Herd-Lage FC:919,
586–592 → Küche des Programms (2) · Rauch immer an SB:95–107 → herdBrennt (1) · PROXYHAUS FC:4542, 4559, 4565 (1). Anker neu:
STIL_GRENZNEIGUNG + alt FC:160, 165 → DECKUNG (7) · Ziegelmaß FC:233 → Format der Deckung (1) · Kaminkopf +0,9 FC:928 → 0,40 MFeuV (1).
**D5 (74):** Rollen-Block FC:2065–2091: Farben holz, blockholz, stamm, stein, lehm, gefach → stoffTon (6), glasdunkel (4), laternenglas (4)
· DEFCOL FC:2119 (15) · KULTUR.col FC:2122–2153: holz 11 (Falunrot FC:2147 bleibt als Anstrich), stamm 7, gefach 4 (niedersächsisch
bleibt Backstein), stein 2, glas 2 (26) · VERBAND mauerwerk.grund, deckung breite/deck/grund, fachwerk feldM/riegelM/staenderM/riegelStarkM,
texDach-Literal FC:1848–1851, 2063 (9) · STEIN_GESETZ.farbe porta-core.js:303 → Fels am Anker (3) · AUS_SILBER, AUS_ROST, AUS_MOOS_NORD
FC:6861–6865 → ALTER (3) · WERK_ALTER.seh.stoff „stein" siedlung-satz.js:1980 (1) · Zaun-Holz siedlung-wege.js:2731, Werkstatt stein/holz
bau-vorlagen.js:1756/1763 (3). Anker neu: metall r/m → MERL eisen (sc:2922) (2) · mauerwerk.versatz 0,5 → Läuferverband (1).
**D6 (12):** STADT_FORM schlank, stab, breitMax/tiefMax FC:3892 (3) · DORF_NORM.gap → b − W, budget tot FC:3649/4516 (2) ·
Parzellen-Gedächtnis, Wohl-Gradient, Breite aus Wohl FC:4437–4439 (3) · gasseTeilung, gasseAb/Hinter FC:4353 → Hofstätten-Tiefe (2) ·
Straßen-Gedächtnis FC:5405–5410, Setzer-Fuge FC:5530 → losVon (2).
**D7 (11):** STADT_FERNE.ueberM siedlung-wege.js:2983 (1) · STADT_MASSEN einzugM, platzM, eckeM, geschossM, sockelM, flachGrad FC:4072 (6) ·
Masse-Literale 3 / 0,8 / 0,6 / 1 FC:4110 → losVon (4).

Absenz-Grep am Kopf (stamm/, fachwerk-core.js, porta-core.js, scripts/ = 0):
`STIL_GRENZNEIGUNG|PROXYHAUS|FENSTER_SCHLAF|fensterSchlaeft|glasdunkel|laternenglas|DEFCOL|STADT_MASSEN|wohlFlaeche|AUS_SILBER|AUS_ROST|\bjetty\b|sparH`
und in DORF `bauRezept\([^)]*null` = 0. Kein Schalter „Gesetz aus"; die Mutante für den Richter ist ein Probe-Eingriff nur in der Probe.

Was ausdrücklich BLEIBT (benannt, ohne Anker): die Stoff-Paletten der Kultur (308, davon ziegel 47, putz 15 — Brand und Kalk brauchen
Gestein je Ort, gc:3349 trägt ihn nicht), die Plan-Grammatik der Straßen und Orte (100), Überstand 0,42/0,32 (Schlagregen, kein Gesetz
gefunden), bayMax 1,7 (Gefach-Maß ohne Quelle), die Maß-Zeilen der Sonderbauten (zunfthaus, kapelle, torhaus, zeughaus, speicher, Kirche,
Burg, Halle, Downtown), Möbel-Maße, Hof (nur Labor).

## (3) DER PREIS

- **Rechenzeit je Haus** (gemessen, preis2.cjs): bauRezept heute 4,02 µs ohne, 11,08 µs mit Haushalt. Jedes Wohn-Los läuft künftig
  durch den Packer: +7,1 µs; Statik 0,23 µs (A, gemessen am Prototyp); Haushalt und Programm ~1 µs (Vermutung). DORF nH 90 heute
  2,26 ms → gerechnet ~2,9 ms (+28 %); losVon ungemessen. Je Siedlung einmal am Anker: forestNische, schneePegel, kahlGrund — Mikrosekunden.
- **Byte- und Samen-Vertrag:** vor der Los-Schleife bleibt der Strom byte-gleich (Region, Jahr, Spanne, nZiel, Kernel, gr0, Chronik-Anker,
  FC:4409–4426); IN der Schleife rückt er (vier unbedingte Ziehungen statt bis zu acht, eine davon heute bedingt FC:4448) → die Kultur je
  Los, W, D, st, Höhen, Lose, Mauer und Bewohnerzahl ändern sich in JEDER Welt. Benannte Wandlung, keine stille. Werke des Spielers (Studio,
  21 Regler) behalten W/D/st, ändern Höhe, Querschnitt und Fenster. Alle Bake-Platten kalt → die erste Ankunft zahlt (Pflicht B).
- **Speicher und Takt:** Köpfe je Wohnhaus 3,11 → Ziel 4,75 (+53 %) → Bewohner-Sätze je Stadt +~50 % (SB:837–880), gate:kreatur-takt
  bewohner zahlt (ungemessen). `wachstum` rechnet Kraft ∝ Leute (FC:4262): die Verdopplungszeit (~21 min, FC:4251) halbiert sich, solange
  `kraftJeS` (FC:4254) steht. Geometrie: +1 Unterzug + W/a Ständer je weiterem Schiff, +1 Mittelpfette je Dachseite ab D ≳ 6,8 m (A) —
  unter 1 % der 132 000 Dreiecke L0 (FC:100).
- **LOD-Vertrag:** `hausMasse` behält sein Format (7 Zahlen je Haus, FC:4112) und liest `geschossFolge` und den einen Überstand → Traufe nah =
  fern (Z1–Z3); `kachelMassen` setzt auf `losVon` → dasselbe Los in Stufe 1 und 2 (Z9, Z27). Walm, Flügel, Turm fern (Z4, Z8) bleiben
  Welle 2. Neu zu messen: LOD_SCHIRM.fehler.haus (64 Werte, vegetation-streu.js:2926–2958), gate:studio-huelle H9 (huelle.js:1659),
  gate:settlement (diag-settlement.cjs), gate:haus-welt (diag-haus-welt.cjs).

## (4) DIE BAHNEN — Welle 1, acht Bahnen, ausschließlicher Datei-Besitz

Reihenfolge: **B1 zuerst** (Signaturen §1.2 eingefroren, Selbsttest grün, ≤ ½ Tag); dann **B2–B7 parallel** gegen den eingefrorenen Kern,
jede Bahn ändert nur ihre Zeilen und RUFT das Gesetz; **B8 zuletzt**. Gelandet wird EINMAL, alle acht im selben Zug (ein Kern ohne Leser
landet nie; B3 löscht, was B2 nicht mehr liest). Bereiche in fachwerk-core.js nach Funktion, Zeilen am main 18058dba; Abgabe je Bahn wie
leben/entscheid.md §4 (`abdruck --gegen 18058dba`, außerhalb der eigenen Zeilen byte-gleich).

### B1 bau-kern
- Dateien: fachwerk-core.js NEU `BAU_GESETZ` + §1.2 nach `bauProgramm` (nach :2276) und der Export-Block `__fachwerkCore` (samt Abgang
  der Exporte von PROXYHAUS); schmiede-core.js `REIN`/`RHO_VON` (:2878–2910, drei Holz-Zeilen).
- Zielbild: keins allein — `__fachwerkCore.BAU_GESETZ` und `selbsttest()` in der Konsole der Blick-Sonde am Spawn.
- Fällt, wenn: kreuzholz(0,258) ≠ 0,149 × 0,211 ± 1 mm; balkenSpann(0,15, 0,21, eiche, 1,7, 1,5, 2,0) außerhalb 3,5–3,9 m; schneeLast der
  Heimat ≠ 1,51 ± 0,05 kN/m² (A); geschossH(1650, 0,211) ≠ 2,471 m; Boot-Δ der neuen Zeilen > 2 ms.

### B2 bau-mensch
- Dateien: fachwerk-core.js `BAU_NUTZUNG`…`bauProgramm` (:2165–2276), `STADT_GRAMMATIK`…`DORF` (:4303–4517), `LEUTE_GESETZ`/`leuteVon`
  (:9519–9538); koerper-core.js `TAGES_GESETZ.angebot` (:5176–5188); stamm/siedlung-ort.js (der Wirt: `_bauOrtAn`, DP.ort an jedem
  DORF-Ruf); worlds/fachwerk/fachwerk.js (Labor: Heimat-Ort, applyMeta behält leute/keller statt sie zu verwerfen, fachwerk.js:630–631).
- Zielbild F1: Messort „dorf 7 4750", die Marktgasse am Kern, Third-Kamera 20 m seitlich auf 2 m, 12:00, gleiche Saat. main: Reihe gleich
  breiter Kästen, das Kaufhaus schmal (Tafel B2, welt-tag-fern.jpg). Kopf: das Kaufmannshaus über die ganze Hofstätte (~15 m) am Markt,
  Buden der Tagelöhner (~5 m) zum Rand, Bäcker mit Laden im EG.
- Fällt, wenn: Spearman(Breite, Wohlstand) über 30 Pläne nH 90 < 0,6 (main 0,09); Köpfe je Wohnhaus außerhalb 4,75 ± 0,75 (main 3,11);
  Absenz-Grep der Bahn ≠ 0.

### B3 bau-gefüge
- Dateien: fachwerk-core.js `HAUS`-Kopf bis `geruest` (:155–475: STIL_GRENZNEIGUNG, grenzNeigung, Default-Block, levels, axis, fundament,
  postsRing, plateRing, geruest) und `riegel`…`chimney` (:640–960: gefache, wandFelder, giebel, dachwerk, dachdeckung, innenwaende, herd).
- Schnitt: Default-Block → `tragwerk(P, P.ort ?? Heimat)`; Balkenlage im Abstand e statt auf jedem Ständer; Unterzug + Ständerreihe je
  Schiff; Mittelpfetten; DECKUNG statt STIL_GRENZNEIGUNG; Wände nach wandDicke; Herd in der Küche des Programms, Kaminkopf +0,40.
- Zielbild F2: Spawn-Dorf der Heimat, das alemannische Haus D 9 (Messort von paar2-fachwerk-26m.jpg), Kamera innen EG Raummitte längs
  der Tiefe und im Dachraum, 12:00. main: Balken frei über 9 m, nur Fuß- und Firstpfette (FC:776–777). Kopf: Unterzug mit Ständerreihe
  teilt das EG in zwei Schiffe à 4,5 m, je Dachseite eine Mittelpfette.
- Fällt, wenn: Anteil der Wohnhäuser (30 Pläne) mit spann ≤ L_max < 100 % (main 0 %: 97 % haben D ≥ 5 m, A: jede Tiefe ≥ 5 m bricht);
  Traufe eines Hauses ≠ geschossFolge ± 1 mm.

### B4 bau-öffnung
- Dateien: fachwerk-core.js `wallSpec` bis Raumteilung (:476–639), `tueren`…`moebel`/`furnish` (:961–1260), Teilbauten bis Masse-Export
  (:1261–1810).
- Schnitt: EIN `fensterFuer` statt elf Maß-Sätzen; Flügel geschlossen in der Öffnung, Scheibe in der Laibung; kein glasdunkel-Ruf;
  Raumteilung aus den Räumen des Programms; Betten = Schlafplätze; Teilbau-Wände nach wandDicke, Rundbau nach geschossFolge.
- Zielbild F3: die Giebelwand von paar2-tag-nah.jpg, Third 6 m frontal, 12:00 und 22:00; dazu die Schmiede innen. main: graue Tafel vor
  jedem Fenster, 45 % opak (Tafel B1); Schmiede innen Stube/Kammer. Kopf: Glas in der Laibung, nichts vor der Wand; Esse und Amboss im
  Werkraum.
- Fällt, wenn: Vorstand von Glas vor der Wandfläche > 0,02 m (main bis 0,58·w = 0,41–0,61 m, Blatt c §4); Fensterfläche/Raumfläche
  außerhalb lichtAnteil(baujahr) ± 10 % in > 5 % der Räume; Absenz-Grep `0.62` an FC:1084/1089 ≠ 0.

### B5 bau-los-ferne
- Dateien: fachwerk-core.js `fensterSchlaeft`…`koerperListe` (:2740–3110), `STADT_MASSEN`…`planMassen` (:4060–4137), `PROXYHAUS`
  (:4540–4566), `trasseLenk`…`wasserReich` (:4587–4662), `strassengraph`…`dorfLayout`/`tryPlace` (:5262–5700); stamm/siedlung-wege.js
  (ganz, samt Zaun-Holz :2731); stamm/vegetation-streu.js (ganz; LOD_SCHIRM.fehler.haus neu gemessen).
- Schnitt: EIN `losVon` für Kachel und Plan; `hausMasse` liest geschossFolge und den einen Überstand; Mauer aus mauerRadius(Σ Köpfe);
  PROXYHAUS und FENSTER_SCHLAF gelöscht; Fern-Fenster aus dem nahen.
- Zielbild F4: Messort „dorf 7 4750", ein Stadthaus aus 290 m und 310 m (`nahM` SW:2985), dieselbe Kamera, 12:00 (Tafel ERSTER PUNKT 1).
  main: Traufe springt +0,45 / 1,15 / 2,55 m (2 / 4 / 8 G.), Dach −0,17 m je Traufseite; beim Erwachen steht jedes Haus auf einem anderen
  Los (FC:4067). Kopf: kein Sprung, kein Umzug.
- Fällt, wenn: |Δ Traufe| nah↔fern > 0,001 m an irgendeinem Haus der Kachel; Δ Lage beim Erwachen > 0,01 m; Mauerradius der Stadt 36
  nicht aus E (main 76 m, FC:5364; gerechnet 50–65 m).

### B6 bau-stoff
- Dateien: fachwerk-core.js `VERBAND_GESETZ`…`kulturFromSeed` (:1840–2164: Verband, materials, DEFCOL, tintM, KULTUR) und `AUS_*`
  (:6840–6870); porta-core.js; stamm/siedlung-satz.js; stamm/bau-vorlagen.js.
- Schnitt: stoffTon(ort) für holz/stamm/gefach/stein/lehm; DEFCOL, glasdunkel, laternenglas, Kultur-Holz und -Glas gelöscht; Verband liest
  das Raster und die Deckung des Hauses; Häuser altern als ihr Stoff (seh holz → holz) ab ihrem baujahr, nicht ab Welttag 0
  (siedlung-satz.js:796).
- Zielbild F5: dasselbe alemannische Haus an der Heimat (Eiche) und an einem Ort, an dem forestNische Tanne gewinnt, Third 10 m, 12:00;
  dazu in der Ring-Stadt ein Los von ~1450 neben einem von ~1850. main: Holz 0x6e4f30 überall, Moos auf den Balken (Tafel B4).
  Kopf: Holzton der Art des Orts, alte Balken silbergrau (ALTER.holz, USDA), junge frisch.
- Fällt, wenn: ΔE₀₀ Holz Heimat ↔ Tannen-Ort < 5 (main 0; Schwelle Vermutung); Patina-Stufe 1450 ≤ 1850 (main gleich); Moos auf Fachwerkholz > 0.

### B7 bau-betrieb
- Datei: stamm/siedlung-bewohner.js (Rauch :7–119 liest herdBrennt; Beruf :874 aus dem Gewerbe des Haushalts statt der Rolle).
- Zielbild F6: Spawn-Dorf, Third 40 m über dem Anger, Sommer 06:30 · 12:00 · 19:00. main: mittags raucht jeder Kamin (Tafel B9,
  welt-tag-fern.jpg). Kopf: mittags rauchen Bäcker, Schmied, Wirt; morgens und abends die Wohnhäuser.
- Fällt, wenn: Anteil rauchender Kamine 12:00 Sommer > 30 % (main ~100 %) oder 19:00 < 70 %.

### B8 bau-richter
- Dateien: scripts/diag-settlement.cjs, scripts/diag-haus-fern.cjs, scripts/diag-haus-welt.cjs, scripts/diag-studio-huelle.cjs,
  worlds/huelle/huelle.js (H9), spec/stamm/modul-karte.json (Vermutung: Ort wie im Leben-Entscheid, nicht gelesen) — als letzter Schritt.
- Schnitt: in der bestehenden Familie gate:settlement die Bau-Probe am ECHTEN DORF-Export (30 Saaten nH 90): spann ≤ L_max, Spearman,
  Köpfe, Traufe nah = fern; Selbsttest: Mutante „bauRezept ohne Haushalt" → ROT am Namen `haushalt`, Mutante „Balken-Literal 0,21" → ROT
  am Namen `balkenSpann`. diag-haus-fern.cjs:300 liest den Überstand aus dem Gesetz.
- Zielbild: die Paare F1–F6 in einer Akte unter vision/bau/, je mit main-Bild und Kopf-Bild.
- Fällt, wenn: Gate-Teil > 3 min CI; eine Mutante bleibt GRÜN.

**Was der Spieler nach Welle 1 sieht:** am Markt das breite Haus des Kaufmanns, zum Rand die schmalen Buden; in der Diele eine Ständerreihe,
wo die Tiefe sie verlangt; Fenster mit Glas in der Wand und Sprossen nach dem Jahrhundert; Holz, das nach dem Wald des Orts aussieht und
mit dem Alter des Hauses graut; kein Haus, das an der 300-m-Grenze wächst oder beim Näherkommen das Los wechselt; Rauch, wo gekocht wird.

## (5) WAS DER SPIKE WIDERLEGEN MUSS — vor jeder Bau-Welle

Der Spike läuft in node am ECHTEN Kern (fachwerk-core.js im vm, wie preis2.cjs), die Gesetz-Funktionen als Prototyp im Scratch, kein
Spiel-Code. Zahl an allen Wohn-Losen der 30 Pläne nH 90 (heute 1 691), Bild-Probe an 100 Häusern der Saaten 1–2.
1. **Jede Tiefe trägt, ohne das Haus zu zerschneiden.** Widerlegt, wenn in > 10 % der Häuser die Ständerreihe eines Schiffs durch die
   Treppe (STAIR), eine Tür oder einen Raum < 1,8 m Breite läuft — oder wenn an ≥ 20 Bauaufnahmen (A §6: Hallenhaus, Ernhaus,
   Schwarzwaldhaus, Kontorhaus) die Tiefe je Schiff > 1,3·L_max oder Geschosshöhe − Balkenhöhe außerhalb 1,9–2,6 m in > 20 % liegt.
2. **Das Programm passt in sein Los.** Widerlegt, wenn > 10 % der Lose W < 4,5 m oder st > Kultur-st + 2 verlangen (B Spike a) oder die
   Traufe die doppelte Tiefe übersteigt (heute die Klemme `stab`, FC:4494).
3. **Die Häuser unterscheiden sich sichtbar, am richtigen Maß.** Widerlegt, wenn Spearman(Breite, Wohlstand) < 0,6 (heute 0,09), Breite
   Q90/Q10 < 2,0 (heute 2,00), die Traufe-Spanne Q90 − Q10 < 60 % von heute (4,70 m) oder die Köpfe je Wohnhaus außerhalb 4,75 ± 0,75.
4. **Die Stadt passt in ihre Mauer.** Widerlegt, wenn Σ Los-Fläche der Mauer-Epoche > 0,8 × Ringfläche mauerRadius² · π in > 10 % der
   städtischen Pläne.
5. **Der Preis bleibt am Schirm.** Widerlegt, wenn bauRezept mit Gesetz > 20 µs je Haus (heute 4,02/11,08), DORF nH 90 > 3,5 ms (heute
   2,26) oder Köpfe > ×1,7 (Bewohner-Sätze).

Fällt 1, fällt die Schiffigkeit als Gesetz (nicht die Zahl); fällt 3, fällt die Umkehr Haus ← Mensch, und das Gesetz wird neu geschrieben,
nicht nachgeregelt.

## (6) ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. Der Spike (5) mit seinen fünf Zahlen — erst danach eine Bau-Welle.
2. `losVon` an Dörfern ohne Kachel: an der Quelle lesen, ob `strassengraph` (FC:5262) Blöcke als Flächen liefert; sonst trägt B5 die
   Einheit der Lose nur in der Kachel-Stadt, und das muss vor dem Start von B5 feststehen (B ERSTER PUNKT 5).
3. `stammD(art, ort)` als reine Funktion aus phyto; „Eiche 0,330 m" (pc:120) Radius oder Durchmesser klären — bis dahin ist d je Art ein
   benannter Wert und `zopf` ein rückgerechneter.
4. Anker nachschlagen und belegen oder ersetzen: EN 338 (D30 E₀,mean 10 oder 11 GPa), ZVDH-Grenzneigungen, MBO §38/§47, MFeuV §19,
   Hofstätte 50 × 100 Fuß, Dichte 150/250 E/ha, Schlafplatz, Kinder, GEWERBE-Gesinde und -Anteile, Holz-Ton je Art.
5. Bilder am main 18058dba als Vorher-Seite der Paare F1–F6 (Tafel ERSTER PUNKT 6: alle Bestandsbilder sind älter).
6. Grund und Größe aus Tragfähigkeit statt Hash (siedlungsGroesse FC:3700–3706, GROESSE_N FC:3680; B Punkt 7) — Welle 2; Zipf
   (gate:settlement Z3) wird dann Messung.
7. Gemeinde-Programm der Sonderbauten (Kirche Sitzplätze je Einwohner, Rathaus, Torhaus aus Wagenbreite, Zeughaus, Speicher aus dem Handel)
   — die 5 bleibenden `mass`-Zeilen und Kirche/Burg/Halle/Downtown fallen dann oder bleiben mit Grund.
8. Walm, Flügel und Turm in der Ferne (Z4, Z8): `hausMasse` trägt nur den Kasten; mit dem Programm erreichen L-Häuser die Welt öfter (B §4).
9. Fensterlicht nachts aus dem Betrieb (Bewohner daheim) als Zustand je Fenster — heute in den Bake gebacken (FC:2444–2478).
10. Klima am Haus: Grenzneigung aus Regen-Intensität, Überstand aus Schlagregen, Rinne und Fallrohr aus Niederschlag (Tafel B5, B16).
11. Hof in die Welt (`hofFuer` FC:3513–3562 liest dann den Haushalt: Holzlege, Stall, Beete).
12. Ziegel- und Kalkfarbe aus dem Gestein des Orts — verlangt Lithologie je Ort im Planeten (gc:3349 ist EIN Fels für die Welt).
13. `kraftJeS` (FC:4254): Anker (Geburtenüberschuss je Kopf und Jahr) oder Fall, bevor Welle 1 die Köpfe um ~50 % hebt.
