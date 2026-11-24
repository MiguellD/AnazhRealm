# Auftrag an GTX 1050 Meister: die Front der Leiter `planet.kopplung.land-meer-luft` (24.11. 07:40, Koordinator)

**Für die GTX 1050 gilt abweichend vom Brief unten:** du bist der Meister am Gerät (Opus), kein lokaler Arbeiter der Radeon. Bäume legst du an
DEINEM Gerät an (Namen frei, zwei getrennte Bäume: `klima-hebung` von origin/main, `pm-klima-front` von origin/punkte-maschine). Die Zensus-Tafel
geht als `bericht/2411-klima-front-zensus.md` nach koordination (Plumbing) statt in den Scratch der Radeon. Hast du WebSearch/WebFetch, dann suche
die Profi-Quelle mit Zahl für die Hebungs-Rate selbst (IPERKA) — in Suchanfragen nie Namen, Adressen oder Projekt-Interna. Die Bild-Pflichten
(#1 Kammlinie, #5 Bildpaar) fährst du SELBST an deiner GPU, je Lauf ≤ 180 s, am Schloss hinter der Runde; die Bilder legst du als
`probe-post/klima-hebung/…png` ab und beschreibst in einem Satz, was DU siehst — ich sehe sie danach selbst an. main steht auf 87bb259c
(klima-kontinent ist gelandet, z706). Melde nur Abgabe oder Block.

---

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du bist `champion` (Opus) an der Radeon, EIN Auftrag: die FRONT der Leiter
`planet.kopplung.land-meer-luft` (Karte 2) fällt — Sprossen #1, #2 und #5. #3 (Nebel 4,46×) und #4 (5,05 K) sind am Kopf von main erreicht, zählen
aber nicht, solange #1 und #2 rot stehen (Punkte gibt nur die lückenlose Folge).

## Lage (lies selbst nach, rate nichts)

- `git ls-remote origin refs/heads/main refs/heads/punkte-maschine` — main trägt `klima-kontinent` (das Klima des Planeten ist EIN Gesetz in
  `planet-core.js` `planetKlimaR`, ~Zeile 2201; Sperre und Föhn ~2085/2196: Feuchte fällt über das Hindernis mit e^(−Δh/2,5 km)).
- Der Bericht des Vorgängers: `git show origin/main:cloud-post/klima-kontinent.md`, Abschnitt „Ehrlich offen“. Seine Messung:
  - #1 `luvLee` 1,258 (Soll ≥ 2): 55 % der „Kämme“ der Station sind Plateau-Buckel mit < 300 m Abfall auf einer Seite (dort gibt das Sperr-Band
    ~1,1). Kämme mit ≥ 800 m Abfall auf BEIDEN Seiten geben 2,92. Die Station sucht im 3°-Takt (333 km) und löst die Kette nicht auf.
  - #2 `rang` 0,211 (Soll ≥ 0,7): den Regen ordnen die Breiten-Gürtel; der Prädiktor der Station (Meeresabstand, Schatten) liest die Breite nicht.
  - #5 `leeProzent` −9,5 % (Soll ≤ −50 %): die Station findet ~200 m Hebung, und die höchsten Kämme haben ein gesättigtes Lee (nass am Boden ≈ 0,025).
- Die Station: Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js` ~Zeile 430–590 (s1 … s6 der Leiter; Soll, `gruen`,
  Attrappen ~538–590). Die Richter-Texte der Karte (bindend, `vision/meisterkarte-2.json` im selben Zweig):
  - #1 Umfang „1 Gebirge“: „Niederschlag Luv/Lee ≥ 2:1 an 30 Saaten; im Bild grün/braun an der Kammlinie getrennt“
  - #2 Umfang „Kontinent“: „Wüstenanteil gegen Meeresabstand und Schatten Rang ≥ 0,7 an 10 Saaten“
  - #5 Umfang „Hebung über 10⁶ a“, Preis „P, Zeitsprung ≤ 5 s“: „Bildpaar Region vor/nach Hebung: grün → Steppe; Niederschlag Lee −50 %“

## Meine Entscheide (Koordinator) — du prüfst sie am Zensus und baust

1. **#1 ist ein Stations-Schnitt, kein Gesetz-Schnitt.** Der Umfang der Sprosse ist EIN GEBIRGE. Ein Buckel mit < 300 m Abfall ist keines. Die
   Station sucht den Kamm einer Kette: entlang der Wind-Richtung des Orts das Höhen-Maximum mit Abfall ≥ 800 m auf beiden Flanken, in der Auflösung
   der Kette (aus dem Höhen-Feld des Kerns gefolgt, nicht im 3°-Raster). Luv- und Lee-Messpunkt liegen auf den Flanken in fester Bruchteil-Lage
   des Abfalls. Der Gegenlauf im Flachland (heute `gegenLuvLee` ≈ 1,05) bleibt. PFLICHT gegen Selbstbetrug: die Mutante „Sperr-Band aus“
   (e-Faltung → ∞) muss an DENSELBEN Kämmen rot fallen (Verhältnis ~1), und die Zahl der Kämme je Saat steht im Zeugen (≥ 1 Gebirge an 30 Saaten;
   Saaten ohne Gebirge zählen als „kein Gebirge“, nicht als bestanden).
2. **#2 ist ein Stations-Schnitt.** „Wüste folgt Meeresabstand und Regenschatten“ ist eine Aussage bei gleicher Breite — die Gürtel der Hadley-Zelle
   sind ein dritter Faktor. Der Rang wird INNERHALB der Breiten-Gürtel gemessen (partieller Rang: Orte eines Kontinents je Gürtel von z. B. 10°,
   Rang je Gürtel, gemittelt mit der Zahl der Orte als Gewicht) — oder, wenn der Zensus etwas Besseres zeigt, in der Form, die du an der Quelle
   begründest. Der Gegenlauf (permutierter Prädiktor) bleibt ≈ 0.
3. **#5 ist ein MACHER-Schnitt im Kern.** „Hebung über 10⁶ a“ heißt Kilometer, nicht 200 m: 0,5–2 mm/a × 10⁶ a = 0,5–2 km (Anden ~1 mm/a,
   Himalaya/Taiwan bis 5 mm/a). Das Sperr-Band gibt −50 % bei Δh = 2,5 km · ln 2 = 1,73 km. ZENSUS ZUERST: was hebt die Zeit-Achse des Kerns in
   10⁶ a an einer konvergenten Grenze (welche Funktion, welche Rate, liest sie die Konvergenz-Geschwindigkeit)? Ist die Rate zu klein oder
   konstant, dann wird sie EINE Funktion der Konvergenz-Geschwindigkeit der Platten im Kern (Quelle mit Zahl suchen und am Gesetz zitieren — IPERKA:
   eigene Quelle + Profis mit Zahl; du hast kein WebSearch, also zitiere, was im Kern schon als Quelle steht, und nenne mir die Lücke). Die Station
   misst das Lee dort, wo es vor der Hebung NICHT am Boden liegt (junges Gebirge, das aus dem Flachland steigt) — ein gesättigtes Lee kann nicht
   weiter trocknen, das ist kein Gegenbeweis.
4. Bild-Pflichten (#1 grün/braun an der Kammlinie, #5 Bildpaar grün → Steppe): du schießt KEINE Bilder lokal. Du nennst mir je Sprosse Saat, Ort
   und Blick (Breite, Länge, Richtung) und den Ruf der Bild-Probe; ich lasse sie an der GPU fahren.

## Zensus (Schritt 1, ≤ 30 min, node am Export, keine GPU)

Je Saat (10 für den Zensus): alle Ketten mit ≥ 800 m Abfall beidseits (Zahl, Höhe), Luv/Lee an ihnen (Median, Streuung), Erholungs-Länge der
Feuchte im Lee; für #2 der Rang roh ↔ je Gürtel; für #5 die Hebung des Kerns je 10⁶ a an 20 konvergenten Grenzen und das Lee davor/danach.
Die Tafel geht nach `C:/Users/micha/AppData/Local/Temp/claude/9fd86081514dce1c/020b359f-6bff-4326-a9cc-a8805834c858/scratchpad/klima-front/zensus.md`.
Zeigt der Zensus, dass ein Entscheid oben falsch ist (z. B. echte Ketten geben < 2), dann STOPP an dieser Sprosse mit der Zahl — und baue, was das
Gesetz selbst braucht (dann ist es ein Macher-Schnitt in `planetKlimaR`: lineares Hang-Aufwind-Gesetz, Smith & Barstad 2004 — Quelle ∝ Feuchte ×
U·∇h mit Verzögerung τ ≈ 1 000 s — statt Abreicherung allein).

## Bau (zwei Zweige, jeder EIN Schreiber)

- **Macher** `klima-hebung` von `origin/main` in einem EIGENEN Baum (`git worktree add C:/Users/micha/AnazhRealm-klima -b klima-hebung <main-sha>`;
  existiert der Baum, nimm ihn): der Kern-Schnitt für #5 (und nur, wenn der Zensus es verlangt, #1/#2 im Gesetz). `node scripts/diag-planet.cjs`
  (+ `--selftest`, `--anker`, `--bytes`), `node scripts/diag-kopplung.cjs`, `node scripts/diag-betriebsgesetz.cjs`, `node scripts/stamm-umzug.cjs
  --lint`. Bericht `cloud-post/klima-hebung.md` IM ZWEIG (Kopf, je Sprosse Stand mit Zahl, Offenes mit Leser), KEINE Zeile in `docs/README.md`.
  EIN Push „Vorprüfung klima-hebung (auf main <sha8>): … [gpu-probe: gate:kopplung, gate:wetter-wache, bild:wiese@0.5] [ci voll]“.
- **Station** `pm-klima-front` von `origin/punkte-maschine` in einem eigenen Baum (`C:/Users/micha/AnazhRealm-pm-klima`): der Schnitt an
  `k2-zusammenspiel.js` (#1 Kamm einer Kette, #2 Rang je Gürtel, #5 Lee eines jungen Gebirges), `gruen`/Attrappen/Mutanten angepasst, die
  Selbstprobe der Station grün (finde ihren Ruf in `meisterkarte-quelle/punkte/` — lies, nicht raten). REGEL: ändert sich ein Richter-Text oder ein
  Soll einer Sprosse, fallen im SELBEN Commit die alten Akten dieser Sprosse (sonst bricht `buche-2.cjs` die ganze Buchung). Push mit `[skip ci]`.
  NICHT in `punkte-maschine` mergen — das buche ich.

## Verboten / Grenzen

Kein `npm run check`, kein voller Playtest, kein Ollama, keine GPU, kein Browser. Kein Warten auf CI. Nie im Haupt-Klon
`C:/Users/micha/AnazhRealm-profiband` arbeiten (nur lesen), nie `.claude/worktrees/koordination` anfassen, nie force-push, nie `git stash`.
Commit-Messages: deutsch, Zahlen vorher ↔ nachher, keine Siegel-Wörter (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU), am Ende
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Zeitkasten: 90 min; nach 45 min ohne Push ein Zwischen-Commit lokal.

## Bericht (drei Sätze + Tafel)

Geschnitten · Gemessen (je Sprosse vorher ↔ nachher am Export, Saaten-Zahl) · Offen (Sprosse · Grund · Messname · Leser). Dazu: beide Köpfe mit
sha40, der Pfad der Zensus-Tafel, je Bild-Pflicht Saat/Ort/Blick. Karte 2 gebucht n von 1 718 — n aus `vision/karte-2-stand.json` am Kopf von
`origin/punkte-maschine` gelesen, nie aus dem Kopf.
