// Gruppe II — Leben (Meisterkarte 2.0, Stand main dc6702ab)
module.exports = {
  gruppe: {
    key: "leben",
    titel: "II · LEBEN — Pflanze, Tier, Ökologie, Mensch, Affekt, Haar und Fell, Luft und Wasser",
    intro: "Leben ist Gesetz mit Gedächtnis: jede Gattung, jeder Bewohner, jede Pflanze ist eine Funktion aus dem Gesetzbuch, und die Welt fühlt und wertet mit. AAAA heißt hier: man sieht Leben, wo man hinschaut, es reagiert auf den Spieler, und es erinnert sich."
  },
  bereiche: [
    {
      key: "vegetation",
      titel: "Vegetation — Wiese, Böe, Wald von innen, Natur-Wand, Jahreszeit",
      dom: "`phyto-core.js` (treeParams, planForestCell) · `stamm/vegetation-*.js` · `stamm/stoff-material.js` (Halm, Wind) · `stamm/daten.js` NAH_WIESE",
      v1: "v1 (laufen und sehen) · A (boden-nah) · E (nahWiese)",
      aaaa: "Vom Halm am Stiefel bis zum Wald am Hang ist jede Pflanze EINE Funktion von Ort und Zeit. Die Wiese steht in jedem Ring von 0 bis 40 m mit LAI ≥ 1,7 und einer Farbton-Streuung ≥ 10,7°, ohne Saum bei 14–18 m. Jede Böe wandert sichtbar über Gras und Kronen. Im Wald steht der Spieler zwischen Stämmen mit Unterholz, und die Sonne fällt in Flecken durch die Kronen, im Gegenlicht in Strahlen. Kein Halm steht im Haus oder im Wasser. Das Jahr ändert die Gestalt, nicht nur die Farbe: Laubkronen tragen im Winter ≤ 30 % Deckung, die Wiese ist niedriger. Alles im Profi-Band (nahWiese ≤ 4 Befehle / 80k Dreiecke, baum ≤ 40 / 150k). **Wo wir die Besten schlagen:** Tsushima und Horizon malen Dichte-Karten, Forza Horizon 4 baut vier Saison-Fassungen, Nanite verlangt Asset-Ketten; bei uns lesen Stufe, Saison und Wuchs dieselbe Ableitung (treeParams · planForestCell · wiesenTint) — der Setzling vor der Nase und der Baum am Hang sind dieselbe Zahl, im Browser auf einer iGPU.",
      beste: [
        "**Ghost of Tsushima** (GDC 2021, Wohllaib): die Halme entstehen je Kachel im Compute-Pass, nah 15 und fern 7 Vertices; ferne Kacheln doppelt so groß bei gleicher Halmzahl; der Wind ist ein gescrolltes 2D-Perlin-Feld plus ein Sinus je Halm.",
        "**Horizon Zero Dawn** (GDC 2017, van Muijden): die GPU platziert zur Laufzeit aus Dichte-Funktionen, deterministisch und lokal stabil.",
        "**Red Dead Redemption 2** (Rockstar 2018; Bauer, SIGGRAPH 2019): Wald mit Unterholz, Licht-Strahlen durch die Kronen im Volumen-Nebel derselben Atmosphäre.",
        "**Forza Horizon 4** (Playground 2018): die Jahreszeit wechselt wöchentlich für alle Spieler; die Welt ist dafür je Saison gebaut.",
        "**Synthetic Silviculture** (Makowski et al., SIGGRAPH 2019, ToG 38(4):131): Ökosystem-Wachstum mit Lichtkonkurrenz über mehrere Skalen."
      ],
      kriterien: [
        {
          name: "Die Wiese wurzelt dicht und bunt bis zum Saum (0–40 m)",
          punkte: 0,
          staffel: "1 = eine Pose (Ort × Sicht × Uhr) grün in allen festen Ringen, im Budget · 2 = Mess-Wiese UND Genesis, Ego UND Third, Uhr 0,5 und 0,3, beide Geräte",
          messung: "werkbank bild --klasse '^(nahWiese:.*|streuSatz|bodenSatz)$' --abstand --ist boden-nah mit FESTEN Ringen 2–5 / 5–10 / 10–20 / 20–40 m (nicht NAH_WIESE.radius): laiWirk ≥ 1,7 je Ring, Saum-Sprung |ΔLAI| ≤ 15 % zwischen Nachbar-Ringen, farbtonStreuung ≥ 10,7° in 2–5 m; Kamera des Spiels, Ausgabe-Größe; Budget über werkbank zaehlen: nahWiese ≤ 4 Befehle / 80k Dreiecke.",
          beleg: "Gemessen ist EINE Pose: Radeon, Ego, Mess-Wiese, laiWirk 1,855 (Ringe 2,05 / 1,54 / 1,66), farbtonStreuung 11,10 — am Stand cbc222cc+geaendert und am Kopf f2904a72 veraltet. Nach dem neuen Lineal ist schon diese Pose ROT: der Ring 5–10 m trägt LAI 1,54 < 1,7 (Täter der Tafel: „5–10 m vor dem Auge: Lücke 0,05 → LAI 1,55“). An Genesis zeichnet die Nah-Wiese 0–3 Befehle / 0–1 764 Dreiecke (spec/profiband/ratsche-genesis-*.json); an der Wiese überzieht GTX Third das Budget mit 83 716 > 80k Dreiecken. Die Büschel enden bei NAH_WIESE radius 14 + rand 4 m (`stamm/daten.js:447`). Am Kopf f2904a72 gemessen (21.10., Radeon --echt, Mess-Wiese Ego −278/−1038, `werkbank bild --wahl 0 --abstand`, Messschuld M3, ROT): laiWirk je Band 2–5 m 2,04 · 5–10 m 1,51 · 10–14 m 1,58 · 14–30 m 0,09 · 30–80 m 0,00 (Nilson, G 0,5, Halm = nahWiese + streuSatz, Grund = bodenSatz) — der Ring 5–10 m und alles jenseits der Nah-Wiese liegen unter 1,7; die Bänder der Linse sind nicht die festen Ringe 10–20/20–40 m, die fallen aber schon mit 14–30 m. Roh: koordination `bericht/2110-messschuld-radeon/m3-*`.",
          schlupfloch: "Die alte Tafel zählte nur im Ring NAH_WIESE.radius der gemessenen Welt: ein kleinerer Radius machte die Linse grüner, den Saum bei 14–18 m wertete sie nie. Feste Ringe, Genesis als Pflicht-Pose, „+geaendert“ zählt nicht, die Dreiecks-Grenze und das ABAB gegen Budget-Schieben.",
          aenderung: "Synthese gab 1 auf einem veralteten Stand, den das neue Lineal selbst ROT nennt → 0 (B25); das ROT am Ring 5–10 m ist das Vorher von H1."
        },
        {
          name: "Die sichtbare Böe: EIN wanderndes Feld über Gras und Krone",
          punkte: 0,
          staffel: "1 = nah (0–15 m) an einem Gerät: zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit · 2 = jeder Ring bis 300 m, Gras ↔ Krone r ≥ 0,6 längs uWindDir, Ruhe → Sturm hebt die Varianz ≥ 3×, Ego und Third, beide Geräte",
          messung: "NEU: werkbank bild --zeit Δt nimmt zwei Ausgabe-Frames unter laufender _bildZeit bei fester Kamera; Rausch-Boden aus einer TAAU-Referenz bei Wind 0; Kreuzkorrelation Gras ↔ Krone mit der Laufzeit Abstand/Böen-Tempo ±20 %. Die Kopplung an den Klang zählt Klang K2, die Formung des Winds Wetter K5.",
          beleg: "Ungemessen: keine Linse misst Bewegung. Im Code liegt EIN Term `_windSwayOffset` (`stamm/stoff-material.js:87`) mit WIND_BOE, 6 Biege-Sphären (GRAS_BEND_SLOTS, `:2715`); die Parallax-Halm-Schicht jenseits von 18 m liest keinen Wind, die Karte trägt einen eigenen Term.",
          schlupfloch: "TAAU-Flimmern und ein eigener Sinus je Schicht erzeugen Varianz ohne gemeinsames Feld: Rausch-Boden aus der Wind-0-Referenz und die Kreuzkorrelation bei physikalischer Laufzeit — nur EINE wandernde Böe besteht.",
          aenderung: "Der Klang-Teil wanderte nach Klang K2 (B16, V25); die Karte 1.0 gab 1 für die Existenz des Codes → 0."
        },
        {
          name: "Der Wald von innen: Stämme, Unterholz, Licht durch die Kronen",
          punkte: 0,
          staffel: "1 = im Mischwald (Ego, Mittag) Stamm-Dichte und Unterholz-Deckung im Band der REF und Licht-Flecken am Boden aus der Kaskade, an einem Gerät · 2 = auch im Gegenlicht (Strahlen durch die Kronen, Uhr 0,3) und an einer Lichtung, beide Geräte, im Haushalt baum ≤ 40 Befehle / 150k Dreiecke",
          messung: "werkbank bild an der Spielgang-Station wald gegen REF real-mischwald: Stämme je Bildbreite, Unterholz-Deckung 0–2 m, Licht-Flecken-Anteil (Varianz der Boden-Luma unter Kronen gegen offenen Boden), Strahl-Kontrast im Gegenlicht ≥ 1,1; die Flecken müssen mit der Sonne wandern (zwei Uhrzeiten).",
          beleg: "Bäume stehen als Studio-Mesh und Karte bis 384 m, `planForestCell` setzt die Stämme; Unterholz und Licht-Flecken sind im Bild ungemessen; Volumen-Licht gibt es nicht; das Kronendach-Mesh ist ein Flag-Zwilling mit Default aus (`stamm/dirigent-kern.js:338`, `stamm/bild-himmel.js:544`).",
          schlupfloch: "Ein gemaltes Licht-Fleck-Muster bewegt sich nicht mit der Sonne: die Flecken kommen aus der Kaskade, zwei Uhrzeiten verschieben sie; Luft-Nebel als Strahl-Ersatz scheitert am Gegenlicht-Kontrast.",
          aenderung: "Neu (V21): der Umriss zählt LOD K1, der Kamm-Saum Ferne K3 — frei wurde die Tiefe, die RDR2 und Tsushima tragen und die keine Karte maß."
        },
        {
          name: "Die Natur-Wand: kein Halm im Haus, kein Halm im Wasser",
          punkte: 0,
          staffel: "1 = Halm- und Büschel-Pixel 0 in jeder Haus-Box des Start-Dorfs an einem Gerät · 2 = jedes Haus und jedes Wasser, auch gesetzte Bauten, beide Geräte",
          messung: "werkbank bild mit Klassen-Maske (Schuss ohne Haus-Klasse, damit verdeckte Halme zählen) in jeder Haus-Box des Körper-Satzes und unter dem Wasser-Spiegel, Ego im Haus und Third davor. Der Pop unter Bewegung zählt LOD K2.",
          beleg: "FIEL 23.10. AUF 0 nach R6 (Kopf 3528f2d0): der gezeichnete Büschel-Pfad trägt Welt-Byte — `stamm/vegetation-wiese.js` 751a7ac6 (`_streuNahSatz` legt die Nah-Streu über `_bauSatzLege` mit Slot-Stempeln statt über `_chunkSatzEin(_satzBlock)`, die Ernte über Swap-Remove) und `stamm/vegetation-baum.js` be20b015 (`_naturRaeumen` fragt `_blockerUmPlatz` statt aller Bauten, das `_aufWeg`-Gitter je Form neu; das Start-Dorf erwacht in Raten, `_dorfErwachen`). gate:haus-welt W9 headless zählt am Kopf nur am Gesetz (R3). Neumessung Messschuld M41. Davor: Seit main f2904a72 ist der Grund jedes Hauses Plan-Datum (S4 grund-datum, Merge 10ac79b0 / V18.546.30 e076ff8f): gate:haus-welt W9 headless 24 Häuser, Büschel und Dichte in den Boxen 0, Waise 0/52 (CI 39498582018 grün an f2904a72) — eine Zählung am Gesetz, kein Bild. Das Bild (`diag-haus-welt --phasen=grund --bild`, Halm- und Boden-Pixel je Box aus dem Ausgabe-Pfad) gab 0/0/0 in 48 Blicken an der Radeon — am Zweig-Stand f0082575, vor 9c5b4220 (der Erdbau wirft nur die getroffenen Chunks), 7e95bfd4/c4681791 (der Grund des gesetzten Hauses aus dem Plan) und 1794d878: der gemessene Pfad änderte sich danach. Gemessen am Kopf f2904a72 (21.10., Radeon 890M, Messschuld M24, in vier Läufen gleich): das Start-Dorf (18 Häuser um 12/110, vor dem Akt gebaut) und das gesetzte Haus des Spielers auf der Wiese (48/0, 372 Büschel im 16-m-Kreis) — 27 Boxen, 52 Blicke aus dem Ausgabe-Pfad: Halm 0 px, Boden 0 px, Büschel am Gesetz 0 in 27/27, gezeichnete Büschel in der Box 0 in 26/26 (der verdeckte Halm existiert nicht); die Gegenprobe vor der Tür sieht 58 113 Halm-Pixel (der Blick ist nicht blind). Offen benannt: eine Box (haus_skandinavisch 44/124, haupt) hat kein freies Auge, auch nicht bei 1,0/1,6 m mit 0,1 m Rand; das Auge steht 1,3 m über der Diele (Werkzeug), Third davor ungemessen; W9 Waise und Ausstattung sind im Bild-Lauf blind (der Zug des Start-Dorfs lief vor der Phase). Roh: koordination `bericht/2110-messschuld-radeon/m24-*`. Vorher 24 von 25 Häusern innen grün, 119 Büschel im Anbau (SYSTEMKARTE D2, 18.10.). Wasser ungemessen.",
          schlupfloch: "Haus-Böden abzudecken versteckt den Halm: die Klassen-Maske zählt ihn auch verdeckt. Ein Zwillings-Zähler im Quelltext bringt keinen Punkt mehr.",
          aenderung: "EIN Heim der Wiese im Haus (vorher auch Siedlung K3, Bauen K2, Spielgang K4; B26, V19); der Pop ging zu LOD K2 (V20); gemessen 21.10. am Kopf 0 → 1 (M24).; nach R6 (751a7ac6 Nah-Streu, be20b015 `_naturRaeumen`) 23.10. 1 → 0."
        },
        {
          name: "Die Jahreszeit als Gestalt: Laub und Wiese",
          punkte: 0,
          staffel: "1 = Kronen-Deckung der Laubbäume (Maske f:eiche|birke|buche) im Winter ≤ 0,3 × Sommer, an einer Pose · 2 = dazu Wiesen-LAI im Winter ≤ 0,5 × Sommer und der Austrieb im Frühling, beide Geräte",
          messung: "Zeitraffer-Linse an der Mess-Wiese: werkbank bild mit Saison-Phase 0,375 / 0,625 / 0,875 über das Spieler-Wort (steht seit wetter-saat, 428fb6fe). Schnee-Decke zählt Wetter K4, Wachstum Stoffe K5, die Spur der Tat Feld K4.",
          beleg: "Im Code steht wörtlich „DIE SAISON IST EINE FARBE“ (`stamm/bild-himmel.js:777-790`): EINE Uniform uSeasonMul, jeder Körper Golden-Sommer gebacken; Laubfall und Wiesen-Höhe fehlen.",
          schlupfloch: "Den Winter grau-braun zu färben (heute) erfüllt die Farbe, nicht die Gestalt: gezählt wird die Deckung (Pixel-Anteil der Krone).",
          aenderung: "Wachstum und Spur wanderten in ihre Heime (Stoffe K5, Feld K4; V-Wachstum)."
        }
      ],
      hebel: [
        { name: "Die Wiese bis zum Saum: das Tsushima-Kachel-Gesetz in festen Ringen, Wind im Relief", k: ["vegetation.K1+1", "vegetation.K2+1"], t: [1.5, 2], wurzel: "`stamm/daten.js:NAH_WIESE`: Ringe bis 40 m, die ferne Kachel mit doppelter Kante bei gleicher Büschelzahl; `stamm/vegetation-wiese.js` baut die Kacheln; die Parallax-Halm-Schicht (`stamm/stoff-material.js:1856ff`) liest `_windSwayOffset` (`:87`) als Scherung. Vorher Messschuld M3 (feste Ringe ROT).", pflicht: "A (boden-nah) · E (nahWiese ≤ 4/80k; GTX Third 83 716)", v1: true },
        { name: "Saison als Gestalt: laubDeckung als zweiter Kanal der EINEN Uniform", k: ["vegetation.K5+1"], t: [2, 2], wurzel: "`foundry-core.js:SAISON_GESETZ` bekommt laubDeckung(phase, art); `stamm/bild-himmel.js:_tickSeason` (kein Neubau).", pflicht: "—", v1: false },
        { name: "Der Wald von innen: Licht-Flecken und Strahlen aus der Kaskade, Unterholz aus planForestCell", k: ["vegetation.K3+1"], t: [2, 3], wurzel: "Schatten-Kaskade unter Kronen (`stamm/bild-kosten.js` SCHATTEN_KASKADE) + Strahlen über die EINE Luft (`stamm/bild-himmel.js` Luft-Knoten); Unterholz-Schicht aus `phyto-core.js:planForestCell`.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Seit 20.09. tragen 174 Commits laub/krone/impostor und 63 Commits Nah-Wiese/Halm/Büschel im Betreff; die Wertung blieb bei einer Pose. Die Wellen polierten die Karte L2 (Dither, Alpha, Kante 0,2635) und die Nah-Kachel an der EINEN Mittag-Pose (Radeon, Ego, Mess-Wiese) — und die Linse las ihren Ring aus dem Code, den sie misst.",
        anders: "Gemessen wird an festen Ringen bis 40 m, unter Bewegung und am Ankunftsort Genesis, wo heute 0–3 Befehle Nah-Wiese stehen: es zählt, wo der Spieler steht. Die Kanten-Kosmetik an der Karte endet (LOD K1 richtet den Umriss aus dem Gesetz); der Wald bekommt sein Inneres statt einer schöneren Kante."
      }
    },
    {
      key: "tiere",
      titel: "Tiere — Verband, Jagd, Gang, Lebensraum, Begegnung",
      dom: "`tetrapoda-core.js` · `stamm/kreatur-*.js` · `scripts/lib/kreatur-proben.cjs` · `worlds/tetrapoda`",
      v1: "Feature-Stopp bis v1.0 — außer der Kosten-Seite (E)",
      aaaa: "Die Herde ist ein DATUM des Gesetzbuchs. 20–30 Hirsche ziehen als Verband mit Leittier über den Hang; der erste, der den Wolf wittert, hebt den Kopf, und binnen 1 s flieht der ganze Verband ausgerichtet (Φ ≥ 0,8, Kohäsion ≥ 0,9) und sammelt sich hinter der Kuppe. Das Rudel aus vier Wölfen umstellt und reißt mit der Quote der Natur (20–40 % gegen den erwachsenen Hirsch) und frisst ≥ 60 s; der Fuchs kommt binnen 120 s ans Aas. Die Fußfolge wechselt mit der Froude-Zahl (Schritt → Trab bei Fr ≈ 0,5, Trab → Galopp bei 2–3). Der Bär steht am Fluss, der Hirsch äst ≈ 50 % des Tages. Auf 10 Spielminuten Gang sieht der Spieler ≥ 3 Tiere, in 30 min eine Herde ≥ 20 — bei ≤ 1 ms KI je 150 Tiere an der GTX. **Wo wir die Besten schlagen:** RDR2 (≈ 6 300 Motions, Tags von Hand) und Horizon (Rollen von Hand); bei uns kommt der Gang aus Froude, der Verband aus Couzin, die Jagd aus MacNulty, der Lebensraum aus dem Gelände-Kern — jede neue Gattung aus dem Studio trägt das ohne eine Zeile Animation, und das Labor zeigt dieselbe Herde.",
      beste: [
        "**Red Dead Redemption 2** (Rockstar 2018): ≈ 200 Arten und ≈ 6 300 Motions in EINEM Fortbewegungs-System; Gangwechsel auf den Fußfall synchronisiert, Utility-Motive wählen den Satz (GDC 2021, Kleanthous).",
        "**Horizon Zero Dawn**: > 25 Maschinen-Typen, Herden mit Rollen über „The Collective“, HTN je Maschine, sechs Navmeshes nach Körpergröße (Beij 2017, Berteling GDC 2018).",
        "**Couzin et al. 2002** (J. theor. Biol. 218:1–11): drei Zonen (Abstoßung, Ausrichtung, Anziehung) ergeben ohne Skript Schwarm, Torus oder ausgerichtete Gruppe.",
        "**MacNulty et al.** (Yellowstone-Wölfe): der Jagderfolg steigt mit der Rudelgröße bis ≈ 4 Jäger — unser Soll der Riss-Quote; Alexander & Jayes 1983: Gangwechsel bei gleicher Froude-Zahl."
      ],
      kriterien: [
        {
          name: "Verband: Zusammenhalt, Ausrichtung, Alarm-Kette, Identität",
          punkte: 1,
          staffel: "1 = (a) Kohäsion an einem Gerät · 2 = (a)–(d) auf beiden Geräten mit der Bild-Serie „Herde am Hang“",
          messung: "Band herde in `scripts/lib/kreatur-proben.cjs` mit dem echten Wurf `_kreaturWurf` (scheue Hirsche, Wurf 3–7), wandernd UND fliehend: (a) Kohäsion beim Wandern ≥ 0,9, auf der Flucht ≥ 0,8; (b) Ausrichtung Φ = |Σv̂|/N ≥ 0,8 über laufende Glieder (|v| > 1 m/s); (c) der letzte Flüchter läuft ≤ 1,0 s nach dem ersten; (d) die Verbands-ID hält 600 s, fremde Verbände verschmelzen nie. Spielgang-Station Herde am Hang: Ego auf 40 m, die Herde flieht als EIN Pulk im Bild.",
          beleg: "S6 auf main (475a446a, V18.546.20 ffa8fac8): Band herde hält Kohäsion wandernd ≥ 0,9 und fliehend ≥ 0,8 bei jedem Push; GTX: Kohäsion 1,000 gegen 0,805, Ausrichtung 0,973 gegen 0,751 (koordination `bericht/1810-s6-gtx.md`). Code: `_kreaturVerbinden` (`stamm/kreatur-leben.js:1632`), `verbandZug` (`tetrapoda-core.js:1591`), `_kreaturVerbandAlarm` (`stamm/kreatur-verhalten.js:183`). Φ steht nur im Bericht, (c) und (d) sind ungemessen.",
          schlupfloch: "Glieder, die an einem Punkt kleben, ergeben Kohäsion 1 und ein triviales Φ: das Band ist ROT bei vakuöser Probe (Glieder ≥ 3, Fluchtanteil ≥ 0,1), dazu Mindestabstand, Fluchtweg ≥ 30 m und Φ nur über laufende Tiere."
        },
        {
          name: "Der Jagd-Kreislauf: Pirsch, Umstellen, Hetze, Riss, Fressen, Aas",
          punkte: 0,
          staffel: "1 = Hetze und Riss mit HP aus dem Leib-Gesetz, Quote im Band über ≥ 10 Seeds · 2 = dazu Fressen ≥ 60 s, der Kadaver lockt Fuchs oder Bär ≤ 120 s, Station Wolfsrevier im Bild beider Geräte",
          messung: "Jagd-Band C mit echter HP aus dem Leib (Masse), 20 Seeds: 4 Wölfe gegen den erwachsenen Hirsch 20–40 %, 1 Wolf < 10 %, gegen ein Kitz > 60 % (MacNulty); der Kadaver wird Geruchs-Quelle (`_scentAt`).",
          beleg: "Seit main f2904a72 (tiere-kreislauf, V18.546.33 5bef501f) reißt das Rudel mit echtem Leben: gate:kreatur-takt jagdkreis (A) — 3 Wölfe gegen einen gesunden Hirsch (168 HP) an 10 Orten einer Saat, Riss 403–585 s an 7/10 in 600 s (5311e7f1; Täter jagd-hp, die verwundete Beute, ROT mit Riss 6,5 s); der Leib wird Kadaver (56,5 → 0 kg in 120 s), Fuchs und Bär kommen aus 35 m und fressen 34,8 / 21,5 s (`scripts/lib/kreatur-proben.cjs:2037-2098`; CI 39498582018 grün an f2904a72). Die 1 trägt das nicht: die Quote ist Riss je 600-s-Fenster an Orten statt je Jagd über ≥ 10 Saaten, gemessen nur mit 3 Wölfen gegen den Erwachsenen, und 70 % liegt über dem Band 20–40 % (MacNulty); 1 Wolf und Kitz ungemessen. Fressen < 60 s, kein Bild.",
          schlupfloch: "Mit hp = 1e6 zählte ein Biss als Jagd; mit HP 1 wäre die Quote 100 %: die Quote hat ein Band nach oben UND unten, die HP kommt aus dem Leib, und der Kadaver muss gelesen werden (Ankunft des Fuchses).",
          aenderung: "Die 1 der Synthese stand auf einer Pose ohne Spieler (hp 1e6) → 0 (B27)."
        },
        {
          name: "Gang und Leib: der Fuß steht, die Gangart folgt dem Tempo, Labor = Welt",
          punkte: 1,
          staffel: "1 = der Fuß steht (Schlupf ≤ 0,05) · 2 = Fußfolge aus Fr für alle 4 Gattungen, Tastgrad im Band, Querhang 20°, Labor = Welt über die Phasen, Third-Bild aus 10 m",
          messung: "gate:tier-gang (Schlupf des Stand-Fußes ≤ 0,05; Gangart und Tastgrad je Gattung bei v̂ 0,3 · 0,74 · 1,2 · 3,5 in Welt UND Labor, REF Schritt 0,6–0,7, Trab 0,4–0,6, Galopp 0,25–0,35; Welt − Labor ≤ 0,05 Zyklus) + gate:kreatur-takt Teil querhang (Hang 20,8° und Rampe 29,9°: Bein-Lot ≤ 10°, Schlupf ≤ 0,05); Schritt → Trab bei Fr ≈ 0,5, Trab → Galopp bei 2–3; Kreuz-Probe Stimmung × Tempo; das Gang-Bild aus 10 m (`werkbank bild … --ziel gang` mit der Bühne `gang-buehne.js`, je Tier drei Füße am Boden).",
          beleg: "FIEL 23.10. AUF 1 nach R6 (Kopf 3528f2d0): tier-satz (86b1cd55/9017bdb4/877ad25b) lässt in `updateCreatures` jedes Tier jenseits von `KREATUR_SATZ.nahLeiber` 4 über `_tierSatzGang` gehen (`stamm/kreatur-verhalten.js:3435`, `stamm/kreatur-leben.js:2117`): 16 gebackene Phasen × 3 Bänder (Fr 0,25/1,5/4), gemischt nach Phase × Gewicht. Die Staffel 2 verlangt Labor = Welt über die Phasen und den Tastgrad im Band in der Welt; `scripts/diag-tier-gang.cjs` kennt `_satz` nicht (die Gang-Bühne mit 4 Tieren misst nur Leiber), der Tastgrad der Satz-Tiere ist ungemessen (R10). Die 1 hält frisch: Tier-Gang voll 14/18 grün an 3528f2d0 (Leib) und die Probe `tiersatz` in gate:kreatur-takt (4/18) mit der Wand Schlupf ≤ 0,05 grün am Kopf, integ-zug-CI 39886536255 (die Zahl 0,036 ist die Zweig-Meldung b37dd6ec vor den Merges). Neumessung Messschuld M42. Davor: SCHNITT tier-gang-k3, auf main e5003509 (V18.546.59, Merge e1c32323), mit Welt-Byte und Linse. Linse 063ed69f: gate:tier-gang urteilt den Tastgrad je Gangart in Welt und Labor — ROT an der Basis (Welt Schritt 0,52–0,54, Labor 0,50, Galopp 0,19–0,20, Welt − Labor bis 0,49 Zyklus). Schnitt 8b560b2a im Gesetz: `gangSchritt` (`tetrapoda-core.js`) gibt dem Stand-Fuß den Tastgrad seiner Gangart (Schritt 0,65, Trab 0,5, Galopp 0,3; die Menschen-Reihe byte-gleich), 86d8d41c die Körper-Kugel trägt die gestreckten Beine. Radeon und Null-Renderer am Zweig 86d8d41c: Welt Schritt 0,52–0,54 → 0,64–0,68, Labor 0,50 → 0,65, Galopp 0,19–0,20 → 0,25–0,30, Welt gegen Labor ≤ 0,03 Zyklus, Querhang 20,8° Schlupf 0,024, Zweig-CI 39710523861 grün; das Third-Bild aus 10 m (koordination `auftrag/2210-tier-gang-gtx/radeon-k3-schritt-10m.png`: Hirsch, Bär, Fuchs, Wolf im Profil im Schritt). GTX am Kopf e5003509 (OMEN, koordination `bericht/2210-tier-gang-gtx.md`): gate:tier-gang GRÜN — Tastgrad Welt Schritt 0,64–0,68, Trab 0,48–0,52, Galopp 0,25–0,30, Labor Schritt 0,64–0,66, Trab 0,50, Galopp 0,29–0,32, Welt − Labor ≤ 0,03 Zyklus, Gangart und Tastgrad je Gattung 32/32 in Welt und Labor, Schlupf unter Last 0,002–0,004; gate:kreatur-takt querhang GRÜN — Hang 20,8° Bein-Lot 7,5/7,7°, Schlupf 0,024, Rampe 29,9° Schlupf 0,026/0,021; das Bild aus 10 m (`gtx-k3-schritt-10m.png`, Ausschnitt 2×) mit je drei Füßen am Boden, keiner schwebt → Staffel 2 an beiden Geräten. Frisch: `git log 86d8d41c..e5003509` über `tetrapoda-core.js`, `stamm/kreatur-*.js` und `stamm/koerper-leib.js` trägt nur halten-latenz (der Pick und `ein` am Glied-Treffer, kein Gang); die GTX-Hälfte lief am Kopf selbst. Benannt offen: der Galopp-Takt des Wolfs 3,98 Hz (Natur ≈ 3), der Fuchs galoppiert genau an der Kante 0,25.",
          schlupfloch: "Den Galopp an die Stimmung flee zu hängen bestünde beim Flucht-Tempo zufällig: die Kreuz-Probe Stimmung × Tempo zeigt, dass nur Fr entscheidet; Labor = Welt wird über die Phasen gemessen, nie über den Code-Text; der Tastgrad ist ein Band nach oben UND unten je Gangart, nie eine Zeile im Gesetz.",
          aenderung: "Die 1 stand auf dem Schlupf; geschnitten 1 → 2 (tier-gang-k3, e5003509): der Tastgrad kommt aus dem Gesetz, beide Geräte im Bild.; nach R6 (tier-satz, `_tierSatzGang`) 23.10. 2 → 1."
        },
        {
          name: "Lebensraum und Tagesrhythmus (Art × Ort × Uhr)",
          punkte: 0,
          staffel: "1 = ≥ 0,9 der Geburten in der Boden-Klasse der Gattung, mit Gegenprobe bei anderem Seed · 2 = dazu das Tages-Budget je Gattung ±20 % am Ethogramm, Trinken aus Durst (Mutante „Durst aus“ → 0), am Fluss Bären-Sichtung ≥ 2× wahrscheinlicher",
          messung: "Familie diag-kreatur-leben: 200 Würfe über das Gelände (Landform aus dem Gelände-Kern: Hirsch Wiese und Waldrand, Wolf Wald, Bär Fluss und Hang); Zeitraffer über 24 Spielstunden (die Uhr ist Spieler-Wort).",
          beleg: "Die Art wählt `_pickFaunaSoulAtPlayer` über Tags × Feld mit 0,15 Rauschen (`stamm/kreatur-leben.js:1439-1458`); weil die Seelen bewusst tag-identisch sind (Lehre 8), entscheidet praktisch das Rauschen; lebensraum 0 Treffer; Hunger nur als Magen des Räubers am Kadaver (tiere-kreislauf), Durst 0 Treffer.",
          schlupfloch: "Arten von Hand an Koordinaten zu setzen oder einen Zeitplan zu skripten erfüllte Anteile ohne Gesetz: Seed-Wechsel und Bedürfnis-Mutante beweisen das Lesen.",
          aenderung: "Staffel neu (B28)."
        },
        {
          name: "Begegnung im Bild, Dichte und Kosten beim Namen",
          punkte: 0,
          staffel: "1 = ≥ 3 Tier-Sichtungen im Ausgabe-Bild je 10 Spielminuten an einem Gerät · 2 = dazu eine Herde ≥ 20 im Bild in 30 min, updateCreatures ≤ 1,0 ms p95 bei 150 Tieren im 500-m-Ring an der GTX, die Ratsche tier eingerastet, beide Geräte",
          messung: "Spielgang über 10 Spielminuten (werkbank lauf --wandern kreis, Ego und Third) an Wiese und Genesis; Sichtung = Klassen-Maske tier ≥ 200 px; kein Tier erscheint im Blick; Kosten beim Namen über werkbank zerlegen/takt in Bau-Ereignissen; Prüfbühne mit fester Herde für die Ratsche.",
          beleg: "Am Kopf 3528f2d0 (23.10.) weiter ungemessen, Sichtungen zählt niemand. tier-satz zeichnet jedes Tier jenseits der 4 nächsten im Satz — Zug 1 GTX an 1ef4042c (Sturm mit 50 Tieren): Befehle 115 → 76, Dreiecke p95 857k → 645k, VRAM +2,6 MB; das sind Kosten, keine Sichtung, und updateCreatures ≤ 1 ms ist nicht belegt (Radeon 2,77/3,16 gegen Basis 2,71–3,00 ms). Davor: Gedeckelt durch maxCreatures 20 (`stamm/dirigent-kern.js:254`), FAUNA_TARGET 8 und FAUNA_MAX 20 (`stamm/kreatur-leben.js:1690/1706`, `stamm/daten.js:125-130`); geboren wird ≥ 130 m fern außerhalb des Blicks; die Ratsche tier steht in allen 12 Ratschen auf frei (spec/profiband/ratsche-*.json) — die Kosten der Tiere wiegt niemand. Sichtungen ungemessen.",
          schlupfloch: "„≥ 150 im 500-m-Ring“ erfüllen Tiere hinter dem Hügel: gezählt werden Sichtungen im Ausgabe-Bild; die frei-Ratsche versteckte die Kosten, die Prüfbühne mit fester Herde schließt das."
        }
      ],
      hebel: [
        { name: "Den Verband ganz messen und halten: Φ im Band, Alarm-Kette ≤ 1 s, ID 600 s, Herde am Hang im Bild", k: ["tiere.K1+1"], t: [1, 1], wurzel: "`scripts/lib/kreatur-proben.cjs` Bühne herde (Φ, Δt Alarm, ID) + `stamm/kreatur-verhalten.js:_kreaturVerbandAlarm` (Kette über Sichtweite).", pflicht: "—", v1: false },
        { name: "Begegnung im Bild: ferne Verbände als EIN Agent, Ratsche tier, Dichte über die Kappe am Schirm", k: ["tiere.K5+1"], t: [2, 2.5], wurzel: "Separation über das FLOCK_CELL-Gitter statt O(n²) (`stamm/kreatur-verhalten.js`); ein ferner Verband rechnet nur über sein Leittier (aiDiv-Band); Prüfbühne mit fester Herde; die Bestands-Zahl kommt aus Ökologie H1, nicht aus einem höheren Deckel.", pflicht: "— (Last: E, der CPU-Takt reißt heute schon)", v1: false }
      ],
      feststeck: {
        versucht: "Nach S6 jagte eine ganze Welle ein CPU-Takt-Plus von +0,1 ms an der GTX: 9+9 frische Welten im ABAB, CDP-Profile, Arm X, drei widerlegte Kandidaten (`bericht/1910-s6-takt.md`); der Verband trägt davon 0,015 ms, +0,08 ms blieben ohne Namen, der Dichte-Hebel wartet dahinter.",
        anders: "Die Kosten der Tiere werden BEIM NAMEN und je Tier im Frame-Zerleger gerichtet (updateCreatures in ms je 150 Tiere, in Bau-Ereignissen statt Wanduhr-Differenzen, Lehre 26), und ferne Verbände rechnen als EIN Agent — die Kosten hängen an Verbänden im Schirm, nicht an Köpfen (Gebot 7)."
      }
    },
    {
      key: "oekologie",
      titel: "Ökologie — Bestand, Kaskade, Furcht, und der Spieler im Kreislauf",
      dom: "`tetrapoda-core.js` VERHALTEN · `stamm/kreatur-*.js` · `stamm/feld-sprache.js` (Emotion, Bindung) · `stamm/feld-leben.js` (Deposit)",
      v1: "Feature-Stopp bis v1.0",
      aaaa: "Bestände entstehen aus Nahrung × Lebensraum, nicht aus einem Deckel: wer im Tal alle Wölfe erlegt, sieht in drei Spieltagen ≥ 30 % mehr Hirsche und ≥ 20 % weniger Jungwuchs — die Kaskade von Yellowstone. Furcht ist EIN Gesetz: das Wesen erinnert, wer es schlug, der Ort erinnert den Riss, und die Herde meidet beides. Der Spieler steht im Kreislauf: im Wolfsrevier wird er gepirscht und umstellt, sein Affekt antwortet mit Furcht und nach dem Fall des Jägers mit Triumph; ein gebundenes Tier folgt ihm, und Stimmung steckt an. Fern rechnen Bestände als Zahl, nah als Körper. **Wo wir die Besten schlagen:** Eco simuliert Ökologie neben einem schlichten Bild, Rain World pflegt Beziehungs-Tafeln je Art von Hand, Nemesis erinnert nur Orks; bei uns liest die Kaskade dasselbe Feld wie Pflanze, Licht und Klang, und jede neue Gattung aus dem Studio trägt sie ohne eine Zeile.",
      beste: [
        "**Eco** (Strange Loop Games): jeder Bestand in einer Simulation, gefällte Wälder zerstören Lebensräume, Aussterben ist endgültig, der Meteor schlägt nach 30 Tagen ein (Standard) — Ökologie ist das Spiel.",
        "**Rain World** (Videocult 2017): > 100 Kreaturen mit Beziehungs-Tafeln zu Kreaturen, Objekten und Orten — ein Ökosystem, das auch ohne den Spieler läuft.",
        "**Ripple & Beschta 2012** (Biol. Conserv. 145:205–213): nach der Rückkehr der Wölfe 1995/96 sanken die Wapiti, Weiden und Espen wuchsen höher (97 Espenbestände 2010 nachgemessen) — unser Soll der Kaskade.",
        "**Middle-earth: Shadow of Mordor** (Monolith 2014), Nemesis: der Ork, der den Spieler tötete, erinnert die Begegnung und steigt auf — das Muster für ein Wesen mit Gedächtnis."
      ],
      kriterien: [
        {
          name: "Die trophische Kaskade: Räuber · Beute · Pflanze",
          punkte: 0,
          staffel: "1 = jede Art bleibt in [⅓×, 3×] des Starts, ohne Aussterben und ohne Ausbruch, über ≥ 8 Seeds · 2 = die drei Richtungen (Wölfe weg → Hirsche +≥ 30 % und Jungwuchs −≥ 20 %; Hirsche bejagt → Wölfe nehmen ab) mit Konfidenz-Intervall, das 0 nicht schneidet; die Mutante „Fraß-Leser aus“ ist ROT",
          messung: "Zeitraffer-Linse (Familie diag-kreatur-leben), 6 Spielstunden je Szenario in einem Tal mit echten Regeln, ≥ 8 Seeds je Szenario, deterministisch je Seed.",
          beleg: "Es gibt keine Bestände: Geburten sind gedeckelt (FAUNA_MAX 20, maxCreatures 20; `stamm/daten.js:125-130`, `stamm/dirigent-kern.js:254`), der Tod kommt nur aus dem Alter (`stamm/kreatur-leben.js:1759`); Verbiss fehlt; der Räuber frisst seit tiere-kreislauf den Kadaver in den Magen (satt jagt er keine Beute), aber kein Fraß ändert eine Geburt.",
          schlupfloch: "Ein Skript-Zähler „Wölfe < 1 → Hirsche++“ täuscht die Kaskade vor: die Mutanten-Probe verlangt echte Leser. Bei 20 Tieren wären +30 % zwei Tiere — Rauschen: darum ≥ 8 Seeds und ein Intervall (B33).",
          aenderung: "Aus Leben-Feld K3; unentscheidbar, solange der Deckel den Bestand setzt (B33) — K2 kommt zuerst."
        },
        {
          name: "Bestand aus Nahrung × Lebensraum, der Deckel ist nur die Kosten-Kappe",
          punkte: 0,
          staffel: "1 = Geburt und Tod folgen der Nahrung an einem Ort (Mutante Nahrung halbiert → Bestand fällt) · 2 = überall; fern als Zahl, nah als Körper; die Kappe am Schirm ändert nur, wer gezeichnet wird, nie den Bestand; im Profi-Band",
          messung: "werkbank eval über Spielzeit-Sprünge, Gegenlauf mit halbierter Nahrung; Kosten im Zerleger (updateCreatures) in derselben Sitzung.",
          beleg: "Der Deckel ist heute der Bestand (FAUNA_MAX 20); geboren wird ≥ 130 m fern außerhalb des Blicks; die Nahrung des Räubers (Kadaver, Magen; tiere-kreislauf, 5bef501f) lenkt nur sein Verhalten, nie Geburt oder Tod.",
          schlupfloch: "Den Deckel zu heben (20 → 150) bläht nur die Zahl und belastet E: die Mutante verlangt das Gesetz (V32).",
          aenderung: "Neu als EIN Bestands-Gesetz statt zweier Bauten (Tiere H4 hob den Deckel, Leben-Feld H3 ersetzte ihn; V32)."
        },
        {
          name: "EIN Furcht-Gesetz: das Wesen erinnert, der Ort erinnert",
          punkte: 0,
          staffel: "1 = ein Wesen, das der Spieler schlug, hält bei der nächsten Begegnung Abstand (Median ≥ 2× ein Kontroll-Wesen), ein gefüttertes nähert sich, ohne Modell, über Speichern · 2 = dazu deponiert ein Riss Furcht am Ort, und die Herde meidet die Zelle (Aufenthalt −50 % gegen den Gegenlauf)",
          messung: "werkbank eval am Spieler-Weg mit echten Verben; Gegenlauf mit gelöschtem Gedächtnis bzw. Feld-Furcht 0.",
          beleg: "`_creatureRemember` schreibt (`stamm/kreatur-leben.js:1088`); gelesen von Spezialisierung, Snapshot, Prompt (`stamm/feld-nexus.js:1116`) und Hof-UI (`werkstatt-hof.js:577`) — kein Verhaltens-Leser für Furcht oder Vertrauen (0 Treffer memory.some/filter/find im Stamm); `_depositEmotion` existiert, kein Riss deponiert.",
          schlupfloch: "Erinnerungen, die nur UI und Prompt lesen, zählen nicht: Konsum heißt Abstand und Weg in der Welt.",
          aenderung: "Aus KI K3(a) und Leben-Feld (Furcht) zusammengeführt — zwei geplante Bauten für dieselbe Furcht (V32)."
        },
        {
          name: "Der Spieler im Kreislauf: Beute sein, Furcht und Triumph",
          punkte: 0,
          staffel: "1 = im Wolfsrevier wird der Spieler in 10 Spielminuten ≥ 1× gepirscht und umstellt (im Bild) · 2 = seine Emotion-Achsen antworten (Furcht beim Umstellen, Triumph nach dem Fall des Jägers) gegen einen Gegenlauf, beide Geräte",
          messung: "Spielgang-Station Wolfsrevier, Ego und Third; die Emotion aus der Situation (`_playerSituationWohl`), nie gestempelt.",
          beleg: "das-lebendige-feld §6: die Jagd auf den Spieler steht über den `_scentAt`-Gradient; das Bedrohtsein und der Fall des Jägers sind nicht als Affekt geknüpft; ungemessen.",
          schlupfloch: "Einen Affekt zu stempeln (fear setzen) täuscht: gelesen wird δ aus der Situation.",
          aenderung: "Neu (V13)."
        },
        {
          name: "Bindung und Ansteckung",
          punkte: 1,
          staffel: "1 = ein gebundenes Tier folgt ≥ 10 min über Hindernisse · 2 = die Ansteckung verschiebt die Stimmung des Spielers messbar gegen einen Gegenlauf mit bond = 0, und die Bindung übersteht den Reload",
          messung: "Spielgang über 10 Spielminuten mit einem gebundenen Tier; Mutation bond = 0 als Gegenlauf.",
          beleg: "GEMESSEN 21.10. am Kopf main 816f26b4 (Radeon 890M, Fenster, Messschuld M19, koordination `bericht/2110-messschuld-radeon-2.md` § M19): ab der Mess-Wiese ein Tier 4 m hinter dem Spieler, „folge mir“ im Chat (Enter, Text, Enter per CDP) → „die nächste Kreatur folgt mir“, Aufgabe `follow_player`, bond 0,14; danach 10 min gehen (W gehalten, alle 20 s ein Schwenk der Gier), je Sekunde der Abstand: 597 Proben, 0 fehlend, die Aufgabe die ganze Zeit `follow_player`, Abstand p50 3,56 m, p95 3,57 m, max 14,1 m (98,5 % ≤ 10 m), bond 0,14 → 1,0; der Weg am Gesetz geprüft: 684 m, Höhe 27,6–101,7 m, Hang bis 44°, 160 s am Hang > 15°, 14 s im Wasser → Staffel 1. Frisch: `git log 816f26b4..b9537781` über Chat-DSL, feld-sprache, Verhalten und Hof ist leer (kreatur-leben trägt nur einen Kommentar). Offen: der Wald am Weg ungezählt, |dy| bis 18,4 m ungeklärt; für die 2 fehlen der Gegenlauf bond = 0 (Ansteckung), der Reload und die GTX. `_tickEmotionContagion` (`stamm/feld-sprache.js:1031`).",
          schlupfloch: "Ein Tier, das per Leinen-Skript folgt, ohne bond zu lesen, fällt an der Mutation bond = 0.",
          aenderung: "Neu (V13); gemessen 21.10. 0 → 1 (M19)."
        }
      ],
      hebel: [
        { name: "EIN Bestands-Gesetz: Geburt und Tod aus Nahrung × Lebensraum", k: ["oekologie.K2+1"], t: [2, 2], wurzel: "`tetrapoda-core.js` VERHALTEN bekommt fress und Bestands-Bilanz; `stamm/kreatur-leben.js` Geburt und Tod aus der Nahrung statt aus FAUNA_MAX; die Kappe am Schirm wählt nur, wer Körper ist.", pflicht: "— (Last: E, Kosten-Kappe am Schirm)", v1: false },
        { name: "Der Spieler als Beute, der Affekt antwortet", k: ["oekologie.K4+1"], t: [1, 1], wurzel: "Pirsch auf den Spieler über `_scentAt` (steht) → Emotion-Achsen über `_playerSituationWohl` (`stamm/feld-sprache.js`).", pflicht: "—", v1: false },
      ],
      feststeck: {
        versucht: "Nie begonnen: die Teile stehen einzeln (Jagd auf den Spieler, `_creatureRemember`, `_depositEmotion`, bond), aber kein Leser verbindet sie, und der Deckel FAUNA_MAX 20 macht jede Bestands-Frage zu Rauschen.",
        anders: "Zuerst das Bestands-Gesetz (Nahrung × Lebensraum), dann ist die Kaskade entscheidbar; Furcht als EIN Gesetz aus zwei Quellen statt zweier Bauten."
      }
    },
    {
      key: "mensch",
      titel: "Menschen und Bewohner — Besiedlung, Tag, Wege, Leib, Begegnung",
      dom: "`koerper-core.js` · `stamm/koerper-leib.js` · `fachwerk-core.js` (leute · rolle · wohl) · `stamm/kreatur-*.js` · `stamm/feld-nexus.js`",
      v1: "Feature-Stopp bis v1.0",
      aaaa: "Jede Siedlung, die das Fachwerk-Gesetz plant, wird von genau den Menschen bewohnt, die ihr Gesetz zählt (leute · rolle · wohl): ≥ 200 Bewohner in einer Stadt, ≥ 40 nah voll animiert. Jeder ist ein Seed mit eigenem Leib aus dem Genom (Körperhöhe ±8 %, keine zwei gleich), mit Heim, Werk und 4–10 Wegen am Tag über die Gassen und durch die Tür. Sein Tag ist f(seed, t): um 10 Uhr steht der Schmied am Amboss, um 2 Uhr schläft er; fern kostet er 0, und wer ankommt, findet ihn auf ±2 m am richtigen Ort. Auf 3 m wendet er in ≤ 0,5 s den Kopf und weicht ohne Berührung aus; er erinnert die letzte Begegnung und spricht aus seinem Datensatz. **Wo wir die Besten schlagen:** Rockstar pflegt Routinen von Hand, Warhorse baut KI-LOD für 2 400 NPCs; bei uns ist der Tag eine reine Funktion, keine Simulation — die Stadt lebt fern umsonst und durch jedes Jahrhundert, und das Körperstudio zeigt den Schmied, dem man im Dorf begegnet.",
      beste: [
        "**Kingdom Come: Deliverance II** (Warhorse 2025): ≈ 2 400 NPCs, etwa die Hälfte in Kuttenberg, jeder mit Tagesablauf; KI-LOD plus GOAP und Modular Behavior Trees.",
        "**Red Dead Redemption 2**: 1 200 Darsteller, 500 000 Dialogzeilen, Routinen von Hand in einer Blase um den Spieler, Euphoria-Körper.",
        "**Shadows of Doubt** (ColePowered): Hunderte Bürger je Spielstand mit Name, Job und Wohnung, 4–10 Wege am Tag, vorab geplant; das Gedächtnis verblasst nach Vertrautheit.",
        "**Middle-earth: Shadow of Mordor**, Nemesis: der Ork erinnert die Begegnung — das Muster für Gedächtnis."
      ],
      kriterien: [
        {
          name: "Besiedlung und Skala: der Plan wird Körper",
          punkte: 0,
          staffel: "1 = Start-Dorf voll: Körper mit Menschen-Leib je Siedlung ÷ Σ leute = 1,0 ±0,05, ≥ 10 Menschen im Bild am Dorfplatz an einem Gerät · 2 = Stadt ≥ 200 mit ≥ 40 nah animiert, ABAB an der GTX nicht schlechter",
          messung: "NEUER Bewohner-Zensus in der Familie kreatur-proben am Start-Dorf und an einer Stadt mit nH ≥ 27; Spielgang-Station Dorfplatz (Ego und Third, Mittag); Selbsttest: ein Haus ohne Bewohner ist ROT beim Namen.",
          beleg: "FIEL 23.10. AUF 0 nach R6 (Kopf 3528f2d0): der gezeichnete Pfad trägt Welt-Byte — `stamm/siedlung-ort.js` und `stamm/siedlung-satz.js` (stadt-takt 468ece98 Liste in Raten zu 4 Häusern je Takt, 60d2c6ba der Satz schreibt nur geänderte Slots), `stamm/siedlung-bewohner.js` (1d76aeca Wege), `stamm/stoff-instanz.js` (tier-satz 86b1cd55/9017bdb4/877ad25b: der Bewohner-Satz geht über den generischen Baustein `_gangSatz`, der Gang-Puffer trägt Knochen-Matrizen, Skinning auf der GPU statt Ecken-Lagen), `stamm/siedlung-ort.js` (stadt-erwachen be20b015: das Start-Dorf erwacht in Raten) und `stamm/studio-bruecke.js` (9367ab90). Am Kopf läuft nur gate:kreatur-takt bewohner auf dem Null-Renderer (R3: kein Bild). Neumessung Messschuld M40. Davor: GEMESSEN 22.10. am Kopf 6cfce28a (Laufzeit-Baum von main 73f28224; Radeon 890M im Fenster 1920×1080, Messschuld M32, koordination `bericht/2210-messschuld-6cfce.md` § M32): Linse `bewohner` (`diag-kreatur-takt --werkbank --proben bewohner`, zwei Sitzungen) Quote 81/81 = 1,0 im Fenster (2×) und headless, am Dorfplatz um 10 Uhr 41 (Ego) / 37 (Third) gegangene Menschen im Blick; eigene Zählung an der Spiel-Kamera (Third, Stand am Platz-Rand wie die Linse, Uhr als Spieler-Wort `setze uhrzeit`, Loop 12 s; gezählt im Frustum, gezeichnet, Sichtlinie frei, in 8 s ≥ 0,5 m gegangen): 8 Uhr 37/36 im Bild, davon 12/12 gehend, 10 Uhr 35/34, davon 10/9 gehend, 60 fps; Bild aus dem Ausgabe-Pfad `m32-platz-8uhr-third.png` (angesehen: Gasse zwischen Fachwerkhäusern, Marktstand, drei Bewohner auf 5–15 m in Schrittstellung, am Gassen-Ende ≈ 15) → Staffel 1. Werkzeug-Bruch: `werkbank schirm` bricht am Kopf mit „--tiere undefined“ (ruft `lauf` ohne `tiere`, `m32-4.txt`), Ersatz war das Ausgabe-Bild. Für die 2 fehlen die Stadt (≥ 200, ≥ 40 nah animiert) und das ABAB an der GTX (Dorf 8 Uhr CPU-Takt p95 5,0 → 5,3 ms schlechter, `bericht/2210-abab-bewohner-gang.md`). Davor: FIEL 22.10. AUF 0 nach R6: bewohner-wege 3d1f6b14 (Merge 71313b7a) ändert mit Welt-Byte den gezeichneten Pfad — der Satz rückt nur die Bewegten (`_bewohnerSatzSchreiben(S, bewegt)`), Wegsuche über das Blocker-Netz, `_bewohnerTritt`, koerper-core `tagesPlan` (Morgengang über den Platz, mittags daheim), Umzug nach `stamm/siedlung-bewohner.js` (403ea4cc); `git log 2476a4aa..6cfce28a -- stamm/siedlung-bewohner.js koerper-core.js` nicht leer. Am Kopf hält gate:kreatur-takt `bewohner` nur die Mechanik (Quote 1,0 ±0,05, Frustum ≥ 10, Satz-Schlupf ≤ 0,05; Null-Renderer, R3: kein Bild). Davor: SCHNITT bewohner (b9537781) und bewohner-tag (Merge d27e981e, auf main e3dd2b67, V18.546.63), mit Welt-Byte: jeder Bewohner des Plans ist ein Leib mit Rig, nah geht er das Gang-Gesetz, im Satz (8–64 m) geht die Instanz dasselbe Gesetz (Gang-Puffer je Gestalt, 16 Phasen + Stand, `_bewohnerGangKnoten` vor der Instanz-Matrix), fern (> 64 m) geht das Rig vor `_kzLeib`; Wurf aus NUR-WURF koerper 3, Mengen-Stufe L2 3 995 → 1 695 Dreiecke (Vertrags-Akt, 518 Ofen-Klassen byte-gleich). Gemessen an der Radeon im sichtbaren Fenster (Linse `bewohner` der Familie kreatur-proben, `diag-kreatur-takt --proben bewohner`, an 2476a4aa): Start-Dorf Steintal, 18 Häuser, Σ leute 81, Leiber 81 (Quote 1,0), 0 Häuser ohne Bewohner, 81 von 81 gingen im Tag (Weg > 0,5 m, Leib mit Rig), am Dorfplatz um 10 Uhr 41 (Ego) / 37 (Third) gegangene Menschen im Blick (Frustum, gezeichnet als Leib, Satz oder Feld, Sichtlinie frei von Grundrissen), höchstens 4 als eigener Leib (nahLeiber 4), Satz-Schlupf 0,023 über 318 m (headless 0,028); Selbsttest 8 Täter ROT beim Namen (darunter Haus ohne Bewohner, die Menge als Leib, der gleitende Satz). Bilder im Ausgabe-Pfad (Radeon, Third, Uhr 8 als Spieler-Wort, an 19afd5cb, befund bewohner-tag: dorf-third-2/3): ≈ 14 Menschen in Gasse und am Platz, die Schrittstellung wechselt zwischen den Bildern (angesehen) → Staffel 1. Am Dorf Klasse bewohner 242k → 72k von 80k Dreiecken (Ego und Third). Für die 2 fehlen die Stadt (≥ 200, ≥ 40 nah animiert) und das ABAB an der GTX: Dorf 8 Uhr CPU-Takt p95 5,0 → 5,3, Belegung p95 6,65 → 7,11 ms bei Dreiecken 466k → 421k, Befehle gleich (OMEN, koordination `bericht/2210-abab-bewohner-gang.md`) — schlechter. R6: seit 2476a4aa trägt der Bewohner-Pfad nur den Merge von c0151abb (`_weltOffen` zählt die Leiber, `_kzLeib` backt vorab), k8-huf (Pfote der Tiere) und wiederkehr (die Marke `werk`); Zweig-CI 39729459507 grün am Merge. Davor: Kein Menschen-Körper in irgendeiner Siedlung: CREATURE_SOULS (`stamm/kreatur-leben.js:1862`) kennt nur Tier-Seelen, `_kreaturGrundFrei` (`:1573-1578`) verbietet jede Geburt in der Box einer Siedlung, maxCreatures 20 deckelt alle Körper; rolle, leute und wohl formen nur Häuser.",
          schlupfloch: "Statisten-Puppen als statische Meshes erfüllten die Zählung: gezählt werden nur Körper mit Leib-Löser und Bewegung > 0 im Tag; Gegenprobe Haus mit leute 0 → 0 Körper.",
          aenderung: "Gemessen 22.10. (bewohner-tag, Radeon) 0 → 1; nach R6 (bewohner-wege) 22.10. 1 → 0; am Kopf 6cfce28a gemessen (M32) 22.10. 0 → 1.; nach R6 (stadt-takt, tier-satz, stadt-erwachen) 23.10. 1 → 0."
        },
        {
          name: "Tagesablauf: Rolle × Uhr × Ort",
          punkte: 1,
          staffel: "1 = ein Bewohner trifft ≥ 0,9 seiner Soll-Orte über 24 Spielstunden · 2 = alle Bewohner einer Siedlung, 4–10 Wege am Tag, Wiederkehr nach 1 h Abwesenheit auf ±2 m",
          messung: "NEUE Zeitraffer-Linse auf der Uhr des Spieler-Worts; der Plan ist bei gleichem Seed bit-gleich; Bild der Station Schmiede: um 10 Uhr besetzt, um 2 Uhr leer; Selbsttest: ein um 6 h verschobener Plan ist ROT.",
          beleg: "FRISCH AM KOPF 6cfce28a (22.10.): bewohner-wege 3d1f6b14 änderte `tagesPlan` (morgenPlatzH 1, mittags daheim), die Radeon-Zahl an 2476a4aa ist damit alt; gate:kreatur-takt `bewohner` (CI-Gruppe 4, integ-CI Run 39820208133 an 6cfce28a und 39816505091 an b0b2d8ed grün) prüft das Soll neu: trefferMin ≥ 0,9 über 24 Spielstunden, planGleich, Schmiede 10 Uhr > 0 und 2 Uhr = 0, Sprünge 0, Blick ≥ 0,9, ohne Platz 0, Wege 4–10 (Tagesablauf-Mechanik, R3); Wege 4–7 erfüllen den Wege-Teil der 2. GEMESSEN am Kopf 6cfce28a (22.10., Messschuld M32, koordination `bericht/2210-messschuld-6cfce.md` § M32): headless trefferMin 1,0 (81/81), planGleich, Schmiede 10/2 Uhr 2/0, Sprünge 0, Blick 0,97, ohne Platz 0 → Staffel 1 bestätigt. Benannter Befund an der 2: im Fenster der Radeon ist die Linse in beiden Sitzungen ROT — trefferMin 0,825, drei Feld-Bewohner unter 0,9 (wohnhaus/feld #724672 87–88 %, #45665 82–83 % zweimal); Staffel 1 hält auch dort (78 von 81 ≥ 0,9), am echten Renderer bricht „alle Bewohner“. Davor: SCHNITT bewohner-tag (aac5b0d6, Merge d27e981e, auf main e3dd2b67), mit Welt-Byte: koerper-core VERHALTEN (TAGES_GESETZ, `berufVon`, `tagesPlan`, additiv, Goldens unberührt) — der Tag ist eine reine Funktion von Same, Rolle, Heim, Werk, Stunde und Platz; `_bewohnerListe` gibt jedem Tür, Stand, Platz und Werk, `_tickBewohner` liest den Plan, der Leib geht den Wege-Graph des Dorf-Plans, drinnen ungezeichnet. Gemessen an der Radeon im Fenster (Linse `bewohner`, an 2476a4aa): 24 Spielstunden im Zeitraffer der Spieler-Uhr (`_uhrSetzen`, 240 Ereignisse zu 0,1 h, dazwischen der Bewohner-Takt), je Bewohner die Soll-Orte aus `tagesPlan` — Treffer min 1,0 für 81 von 81 (Soll ≥ 0,9), der Plan bei gleichem Samen bit-gleich, Station Schmiede um 10 Uhr 2 am Werk, um 2 Uhr 0, Sprünge > 2 m je Takt im Nahbereich 0, durch die Hauswand 0, der Blick der Stehenden 0,969 von 195 auf ihr Ziel, ohne Platz 0; Selbsttest: der um 6 h verschobene Plan (`bewohner-plan6`) ist ROT beim Namen (Treffer min 0,104) → Staffel 1. Für die 2 fehlen 4–10 Wege am Tag und die Wiederkehr nach 1 h Abwesenheit auf ±2 m (ungemessen). R6 wie K1. Davor: Kein Tagesplan; koerper-core hat kein Kapitel VERHALTEN; der Akt-Katalog lebt nur im Skript von `worlds/koerperstudio` (Math.random).",
          schlupfloch: "Ein Teleport an den Soll-Ort erfüllte den Anteil: K3 verlangt Gangzeit auf Wegen, im Nahbereich sind Sprünge > 2 m je Frame ROT.",
          aenderung: "Staffel neu (B31); gemessen 22.10. (bewohner-tag, Radeon) 0 → 1."
        },
        {
          name: "Wege und Raum: Gassen, Türen, keine Durchdringung",
          punkte: 1,
          staffel: "1 = 0 Durchdringung und Eintritt zu 100 % über die Tür im Start-Dorf · 2 = 24 h ohne Steckenbleiber in einer Stadt, Gangzeit auf Wegen ≥ 0,85, ≥ 100 m Weg je Bewohner und Tag, Ausweichen ohne Berührung",
          messung: "NEUE Wege-Linse; Selbsttest: ein Haus quer über dem Weg ist ROT am Täter.",
          beleg: "SCHNITT bewohner-wege 3d1f6b14 (Merge 71313b7a, integ 6cfce28a), mit Welt-Byte: die Wegsuche der Bewohner liest das EINE Blocker-Netz (`_bewohnerWand`, `_streckeBoxAbstand2`), der Leib tritt auf die Stufen vor der Tür (`_bewohnerTritt`), koerper-core VERHALTEN morgenPlatzH 1. Die Linse kam vorher (6636bc57) und war an der Basis e3dd2b67 ROT: Durchdringung 82 Takte (baum_tanne 37, haus_skandinavisch #431794 11, marktstand 9, felsbogen 8), Wege 2–6, Strecke min 5 m; am Zweig-Kopf (gate:kreatur-takt `bewohner`, Null-Renderer — Kontakt-Mechanik, R3, Präzedenz Siedlung K1): Durchdringung 0, Tür 248/248, Wege 4–7, Strecke min 46 m, Gangzeit auf Wegen 0,947; Selbsttest bewohner-quer (#4242) und bewohner-wand ROT beim Namen → Staffel 1. Frisch: gate:kreatur-takt prüft wandN === 0 und tuer === durch und ist in integ-CI Run 39820208133 an 6cfce28a grün (voll 4/18). GEMESSEN am Kopf 6cfce28a (22.10., Messschuld M32): headless Durchdringung 0, Tür 247/247, Wege 4–7, Strecke min 46 m, Gangzeit auf Wegen 0,946; im Fenster der Radeon Durchdringung 0, Tür 251/251, Gangzeit 0,942 → Staffel 1 bestätigt. Für die 2 fehlen die Stadt (nH ≥ 27), 24 h ohne Steckenbleiber, ≥ 100 m je Bewohner (heute min 46 m) und Ausweichen ohne Berührung. Der Weg ging über das Blocker-Netz, nicht über den exportSettlement-Graph. Davor: Keine Wegsuche (astar|navmesh|findPath 0 Treffer); die Wege-Karte ist nur eine Zeichen-Schicht (`stamm/siedlung-satz.js`); den graph streicht der Export (`fachwerk-core.js:exportSettlement` `:5377ff`), dims.tuer hat keinen Leser.",
          schlupfloch: "Bewohner, die im Haus bleiben, machen keine Fehler: Mindest-Strecke und 4–10 Wege aus K2.",
          aenderung: "Staffel neu (B31); Schnitt bewohner-wege 22.10. 0 → 1."
        },
        {
          name: "Körper, Vielfalt, Ausdruck — und die Kosten einer Menge",
          punkte: 0,
          staffel: "1 = mensch-kopf GRÜN im Third an der Kamera des Spiels an einem Gerät, frisch am Kopf · 2 = 50 Bewohner aus 50 Seeds ohne zwei gleiche, Körperhöhe ±8 %, Gesichtsmaße in MENSCH_SOLL, ≤ 150k Dreiecke und ≤ 1 ms CPU, beide Geräte",
          messung: "Soll-Tafel mensch-kopf (Third, Kamera aus `_loopCamera`), Gestalt-Distanz je Seed-Paar; Kosten über werkbank zaehlen und takt. Kleidung und Haar zählt der Bereich Haar, Fell, Kleidung.",
          beleg: "Der EINE Mensch steht und wird als Spieler-Leib konsumiert (bauMensch); mensch-kopf wurde an der Radeon geheilt (Gesicht 0,5 → 1, V18.546.9), trägt aber am Kopf f2904a72 kein Ist („gesicht ungemessen“, sollTafelUrteil). Messschuld M7 (21.10., gelesen statt geschossen): an der Third-Kamera des Spiels ist das Gesicht nie im Bild — `_loopCamera` dreht den Leib auf die Gier (`player.rotation.y = yaw`) und stellt die Kamera zu Fuß `cameraThirdDistance` HINTER ihn (`stamm/koerper-bewegung.js:1595` und `:1686-1687`, camX = x − sin(yaw)·d); die Tafel-Pose `--gesicht 0.7` steht vor dem Kopf und ist keine Pose des Spiels. Die 1 verlangt eine Spieler-Pose mit Blick von vorn (Mitspieler, Ich-Bühne, Spiegel). `_rollHumanoidGenome` (`stamm/koerper-leib.js:5`) hat keinen Aufrufer: Vielfalt 0, Kosten einer Menge ungemessen.",
          schlupfloch: "Ein einziger schöner Spieler-Kopf erfüllte die alte Messung: Vielfalt und Kosten an 50 Bewohnern machen sie zur Menge.",
          aenderung: "Die 1 stand auf einer Tafel-Zeile ohne Ist → 0 (B03, B29)."
        },
        {
          name: "Begegnung, Gespräch, Gedächtnis",
          punkte: 0,
          staffel: "1 = ohne Modell im Bild: Kopf-Zuwendung ≤ 0,5 s auf 3 m, Ausweichen ohne Berührung, die Erinnerung lenkt den Abstand · 2 = das Gespräch mit echtem Anbieter (Host im Netz-Log) zitiert ≥ 2 Fakten aus dem Datensatz in ≤ 3 s und bezieht sich auf die vorige Begegnung, beide Geräte",
          messung: "NEUE Begegnungs-Probe in Ego auf 3 m; Faktentreue automatisch gegen den Bewohner-Datensatz (Rolle, Haus, Stunde); Gewalt in der Nähe lässt Umstehende fliehen.",
          beleg: "Es gibt keine Menschen-Bewohner; `maybeAnswerCreature` (`stamm/feld-nexus.js:1404`) spricht nur Tiere an, nur mit LLM und ohne Gedächtnis; Drehbuch-Schritt 18 (Modell) ist offen.",
          schlupfloch: "Eine Stimmen-Attrappe bekam in der Synthese 1 Punkt; ein Stub zählt 0 (B30). Generischer LLM-Smalltalk klingt lebendig: Faktentreue und Bezug auf die vorige Begegnung werden geprüft.",
          aenderung: "Die 1-Stufe „headless mit Stimmen-Attrappe“ fiel (B30)."
        }
      ],
      hebel: [
        { name: "Die Stadt lebt: ≥ 200 Bewohner, ≥ 40 nah animiert, und der Gang kostet an der GTX nichts", k: ["mensch.K1+1"], t: [0.5, 1], wurzel: "Gemergt bis 3528f2d0: der Bewohner-Satz auf dem generischen Baustein mit Knochen-Matrizen und Skinning auf der GPU (tier-satz 9017bdb4/877ad25b), der Satz schreibt nur geänderte Slots und die Liste kommt in Raten zu 4 Häusern (stadt-takt 60d2c6ba/468ece98), EIN Glieder-Memo `_gattungGlieder` (9367ab90). Der Rest: der Bewohner-Zensus der Linse `bewohner` (`scripts/lib/kreatur-proben.cjs`) an einer Stadt mit nH ≥ 27 (≥ 200, ≥ 40 nah animiert) und `_tickBewohner` 1,52–1,82 > 1 ms (drei Schleifen über alle Bewohner je Takt, befund stadt-takt) gegen das Dorf-ABAB der GTX. Die 1 kommt zuerst per Messschuld M40 zurück, der Hebel trägt die 2.", pflicht: "— (Last: E, Kosten der Menge im ABAB)", v1: false },
        { name: "Begegnung ohne Modell: Kopf-Zuwendung, Ausweichen, Gedächtnis-Abstand", k: ["mensch.K5+1"], t: [1, 1], wurzel: "Leib-Löser (`stamm/koerper-leib.js`) für die Kopf-Zuwendung; Furcht-Gesetz aus Ökologie K3 lenkt den Abstand.", pflicht: "—", v1: false },
        { name: "Vielfalt und Kosten von 50 Bewohnern", k: ["mensch.K4+1"], t: [1, 1], wurzel: "Genom mit Seed (`_rollHumanoidGenome`), LOD-Kette wie beim Tier; Messung mensch-kopf an der Spiel-Kamera (Messschuld M7) zuerst.", pflicht: "— (Last: E)", v1: false }
      ],
      feststeck: {
        versucht: "Kein Feststecken durch Wellen: bewohner (b9537781) gab jedem Haus seine Leiber, bewohner-tag (e3dd2b67) den Tag als Gesetz der Uhr und den gehenden Satz. bewohner-wege (integ 6cfce28a) die Wege über das EINE Blocker-Netz und durch die Tür. Offen stehen die Stadt, die Vielfalt und die Begegnung.",
        anders: "Kein „NPC-System“ bauen: den Bewohner als Kreatur mit Menschen-Leib verdrahten (S6) und den Tag als reine Funktion der Uhr fassen, ohne Simulations-Takt."
      }
    },
    {
      key: "affekt",
      titel: "Die Welt fühlt und wertet mit — δ, Emotion, Nexus, Stimme, Musik",
      dom: "`stamm/feld-sprache.js` (WERTUNG, Emotion) · `stamm/feld-dsl.js` · `stamm/feld-nexus.js` · `stamm/klang.js` (GENRES) · `stamm/bild-himmel.js` (Tint, Schreiber)",
      v1: "Feature-Stopp bis v1.0",
      aaaa: "Die Welt ist der dritte Mitspieler: sie wertet, was geschieht, mit EINER Gleichung (TD-δ) und antwortet am Ort. Die erste gute Tat bewegt Licht und Klang binnen 2 s an genau dieser Stelle, die zehnte gleiche nur noch ≤ 30 % (Gewöhnung). Die Emotion formt die Welt über Regeln mit Quelle: getragene Trauer macht den Regen am Ort wahrscheinlicher, Freude lockt die Tiere. Der Nexus schreibt Regeln, wo das Feld arm ist; die mit δ > 0 überleben und wirken im Blick. Die Welt sagt, was sie tat und warum („es regnet, weil …“), und die Musik liest dasselbe Feld: Tonart aus der Valenz, Tempo aus der Erregung, nie zweimal dieselbe Phrase. **Wo wir die Besten schlagen:** der AI-Director von Left 4 Dead lenkt Spannung nach Drehbuch-Regeln, Journey führt die Musik mit dem Spieler; bei uns schreiben Mensch, Nexus und KI dieselbe DSL in EIN Gesetz, das wertet und lernt — deterministisch, gespeichert, teilbar.",
      beste: [
        "**Left 4 Dead** (Valve 2008; Michael Booth, „The AI Systems of Left 4 Dead“, AIIDE 2009): der AI-Director schätzt die emotionale Intensität jedes Spielers und setzt Ruhe- und Spitzen-Phasen — Dramaturgie aus dem Zustand des Spielers.",
        "**Journey** (thatgamecompany 2012, Musik Austin Wintory): die Musik folgt Ort und Handlung des Spielers; **No Man's Sky** (Paul Weir, GDC 2017): Pulse setzt die Musik zur Laufzeit aus Stems zusammen.",
        "**Schultz, Dayan & Montague 1997** (Science 275:1593): Dopamin kodiert den Vorhersagefehler δ = Ergebnis − Erwartung — das Gesetz unserer WERTUNG; die Gewöhnung fällt umsonst heraus."
      ],
      kriterien: [
        {
          name: "Die Wertung antwortet am Ort: der δ-Kreis",
          punkte: 0,
          staffel: "1 = Gewöhnung (δ von Tat 10 ≤ 0,3 × Tat 1) und Antwort am Ort (ΔE ≥ 2 am Ort der Tat gegen die Nachbarzelle, oder ein Klang-Parameter am Ort) an einer Pose · 2 = eine schädliche Tat kehrt das Vorzeichen um, nach 30 min Ruhe Baseline, Tag und Nacht, Ego und Third, beide Geräte",
          messung: "Spielgang-Sequenz über werkbank eval mit echten Verben (pflegen, fällen, töten), 10× in 5 min; δ aus der Situation (lebendig + HP, `_playerSituationWohl`), nie aus der Emotion; Antwort im Ausgabe-Pfad binnen 2 s.",
          beleg: "WERTUNG mit playerTau 30 s, fieldTau 120 s, appraisalGain 0,4 (`stamm/feld-sprache.js:1136`); die sichtbare Antwort ist ein globaler Tint an der Spieler-Position (auraTintStrength 0,3, `stamm/bild-himmel.js:1060-1075`); geprüft nur headless, im Spiel ungemessen.",
          schlupfloch: "„ΔE ≥ 2 am Spieler“ erfüllte der globale Tint, ohne Ort — die Täuschung, die Feld K5 verbietet (B32): er trägt 0; die Emotion direkt zu stempeln täuscht ebenso.",
          aenderung: "Aus Leben-Feld K4; die Antwort muss örtlich sein (B32)."
        },
        {
          name: "Die Emotion formt die Welt — über Regeln mit Quelle",
          punkte: 0,
          staffel: "1 = eine getragene Stimmung verschiebt am Ort EINE Größe (Wetter-Wahrscheinlichkeit, Kreatur-Laune, Klang oder Materie-Antwort) gegen den Gegenlauf mit eingefrorener Emotion-Achse · 2 = alle vier, jede Kopplung als DSL-Regel mit Quelle, deterministisch aus Saat + Akten",
          messung: "werkbank eval über 30 Spielminuten, echte Taten tragen die Stimmung; Gegenlauf mit gefrorener Achse; Peer-Gleichheit nach Feld K2.",
          beleg: "Die Welt wünscht sich das Wetter (`wetterWunsch`, `stamm/dirigent-takt.js:956/966`: Nexus, Gesetze, Emotion); das Schreiber-Gesetz kennt die Quelle (`_himmelSchreiber`); das-lebendige-feld §6/§7 verlangt die festen Trigger als emergente Regeln. Ungemessen.",
          schlupfloch: "Ein fester Trigger (Trauer → Regen) täuscht Kopplung vor und ist nicht teilbar: nur eine Regel mit Quelle, die die Mutation der Achse zieht, zählt.",
          aenderung: "Neu: Pfeiler 2 der Vision („Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang“) hatte kein Kriterium (V03)."
        },
        {
          name: "Der Nexus spielt mit: schreibt, wertet, lernt — sichtbar",
          punkte: 0,
          staffel: "1 = Selektion gemessen: der Anteil der Regeln mit value > 0 steigt vom ersten zum letzten Drittel UND schlägt den Gegenlauf mit gemischtem δ · 2 = ≥ 70 % der Feuer an Zellen unter dem Median von lebendig, ≥ 1 Wirkung je 5 Spielminuten im Blick (Leser aus Feld K5), _tickWorldRules ≤ 0,2 ms, 0 verbotene Ops, beide Geräte",
          messung: "werkbank lauf mit Nexus an und Zeitraffer ×10 (30 Spielminuten ≈ 3 min), Mutations-Gegenlauf mit gemischtem δ; Kosten über werkbank takt.",
          beleg: "Der Nexus komponiert (dslComposeRule), wertet (`_tickWorldRules` `stamm/feld-dsl.js:621`, `_measureRuleReward` `:752`) und evolviert alle 24 s (`stamm/dirigent-kern.js:365`); die Bänder V1733–V1743 (`scripts/playtest/feld.cjs:321ff`) zeigen die Mechanik headless; die Wirkungen landen in Overlays ohne Leser am Ort.",
          schlupfloch: "Ein Zähler erneuerter Regeln stiege auch bei zufälliger Wertung: der Gegenlauf mit gemischtem δ. Ein Nexus, der ständig Wetter wechselt, ist sichtbar, nicht wertvoll: Lokalität und Budget.",
          aenderung: "Dreimal gezählt (Physik-Feld K4, Leben-Feld K5, KI K4) mit drei Soll für EINE Gleichung → EIN Heim hier (B01, V14)."
        },
        {
          name: "Die Welt erklärt sich: die Stimme des Felds",
          punkte: 0,
          staffel: "1 = jede Tat von Nexus oder KI im Blick schreibt eine Zeile mit Ort, Ursache und Gesetz in die Dialog-Box, Faktentreue gegen state 100 %, ≤ 1 Zeile je 30 s (Vorlage ohne Modell) · 2 = „warum regnet es?“ nennt den wahren Schreiber, mit Modell erzählend (Korpus-Prädikat), beide Geräte",
          messung: "Spielgang über 30 Spielminuten mit Nexus; automatische Prüfung jeder Zeile gegen state (Ort, Regel, Schreiber).",
          beleg: "Pfeiler 5 der Vision: „Die KI spricht — dialogue-box mit echter narrativer Stimme, nicht nur Logs“; `_himmelSchreiber` kennt den Schreiber; eine Erklärungs-Zeile gibt es nicht. Ungemessen.",
          schlupfloch: "Generische Zeilen klingen lebendig: geprüft wird die Faktentreue gegen state und der wahre Schreiber.",
          aenderung: "Neu (V12)."
        },
        {
          name: "Die Musik liest das Feld",
          punkte: 0,
          staffel: "1 = ein Leser: Tonart/Modus folgt der Valenz von `auraAt.emotion` am Spieler (die Mutation der Achse ändert die Spektral-Merkmale am Abgriff) · 2 = Tempo und Dichte aus der Erregung, Wetter und Uhr wechseln die Schicht, keine Phrase wiederholt sich binnen 10 min, die Musik duckt sich unter Schritt, Ruf und Gespräch um ≥ 6 dB",
          messung: "Klang-Abgriff am Master über 10 Spielminuten mit Mutation der Emotion-Achse; Wiederholungs-Suche über Chroma-Fenster.",
          beleg: "Die Lofi-Schicht `klang:GENRES` (`stamm/klang.js:4/:33`) existiert; der Klang-Zensus misst ausdrücklich, während sie ruht; ungemessen.",
          schlupfloch: "Eine Playlist je Wetter wäre ein Zustands-Schalter: die Mutation der Emotion-Achse am Abgriff verlangt das Feld.",
          aenderung: "Neu: Pfeiler 4 (Multisensorik) hatte keine Musik (V04)."
        }
      ],
      hebel: [
        { name: "Die Emotion als DSL-Regel mit Quelle", k: ["affekt.K2+1"], t: [1.5, 1.5], wurzel: "`wetterWunsch` (`stamm/dirigent-takt.js:956`) und die Kreatur-Laune werden Regeln des Felds mit Quelle (`stamm/feld-dsl.js`), keine festen Trigger.", pflicht: "—", v1: false },
        { name: "Der Nexus sichtbar am Spieler (nach Feld H1)", k: ["affekt.K3+1"], t: [1, 1], wurzel: "`stamm/feld-dsl.js:_tickWorldRules` (`:621`), `_measureRuleReward` (`:752`); `stamm/feld-nexus.js` dslComposeRule bevorzugt Zellen mit δ < 0 im Blick.", pflicht: "—", v1: false },
        { name: "Die Erklärungs-Zeile", k: ["affekt.K4+1"], t: [1, 1], wurzel: "`_himmelSchreiber` und `_tickWorldRules` schreiben je Tat eine Zeile (Ort, Ursache, Gesetz) in die Dialog-Box.", pflicht: "—", v1: false },
        { name: "Die Musik liest das Feld", k: ["affekt.K5+1"], t: [1.5, 1.5], wurzel: "`stamm/klang.js` GENRES liest `auraAt.emotion` am Spieler; Duck-Bus unter Schritt, Ruf und Stimme.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Gemessen wurde das Feld als Existenz: 21 headless Checks (`scripts/playtest/feld-leben.cjs`, „LIFE_FIELD-Konstante existiert“, „auraAt-Shape“), die Doku nennt die Vision „verkörpert“. Am Spieler ändert sich lokal nichts: die Antwort ist ein globaler Tint, die Musik ruht in jeder Messung.",
        anders: "Richten am Ort der Tat und im Gegenlauf: die Wertung zählt nur, wenn sie lokal antwortet und die echte δ mehr Wirkung behält als die gemischte. Der erste Schnitt ist eine Umstellung der Leser (Feld H1), kein neues System."
      }
    },
    {
      key: "haar",
      titel: "Haar, Fell und Kleidung",
      dom: "`koerper-core.js` (Haar) · `tetrapoda-core.js:33-49/:817` (Fell) · `fachwerk-core.js` EPOCHEN · `worlds/koerperstudio` · `worlds/tetrapoda`",
      v1: "nach v1.0 (Feature-Stopp)",
      aaaa: "Haar, Fell und Kleidung sind Gesetz — der Schöpfer nennt „Haare“ als ersten Beweis des Prozeduralen. Fell trägt Strich, Unterwolle und Farbe aus der Gattung, Haar Strähnen aus dem Genom, Kleidung Schnitt und Stoff aus der Epoche des Hauses: nah als Strähne und Tuch, fern als Schale und Karte, jede Stufe mit demselben Ton. Mähne, Haar und Mantel wehen im EINEN Wind und schwingen mit dem Leib; Nässe macht sie dunkler und schwer. **Wo wir die Besten schlagen:** UE-Groom und TressFX simulieren die Strähnen eines Assets, RDR2 lässt Mähnen über die Spielzeit wachsen — von Hand gebaut; bei uns trägt jede Gattung und jeder Bewohner sein Haar aus dem Gesetz, ohne ein Asset.",
      beste: [
        "**AMD TressFX** (Tomb Raider 2013): Laras Haar als Tausende simulierte Strähnen auf der GPU.",
        "**Unreal Groom** (ab UE 4.24): Strähnen-Haar mit Hair Cards als Stufe für die Ferne.",
        "**Red Dead Redemption 2**: Mähne und Schweif der Pferde wachsen über die Spielzeit, Fell wird nass und schmutzig.",
        "**Shadow of the Colossus** (Team Ico 2005): das Fell der Kolosse als geschichtete Schalen — Fell-Tiefe auf alter Hardware."
      ],
      kriterien: [
        {
          name: "Fell aus dem Gesetz im Bild",
          punkte: 0,
          staffel: "1 = Klasse fell in der Soll-Tafel (Soll aus externer REF), GRÜN auf Armlänge (0,7 m) und im Third (4 m) an einem Gerät · 2 = jede Gattung, L0 bis Karte ohne Ton-Sprung, beide Geräte",
          messung: "werkbank bild --klasse fell: Strich-Kohärenz gegen REF, Albedo im realen Band, Ton je Stufe; Mutation einer Fell-Zeile ändert das Bild.",
          beleg: "Das Fell-Gesetz steht (`tetrapoda-core.js:33-49`, `:817`); PFLICHT A „Fell“ fiel am 14.10. (K28: der Kopf trägt sein Fell wie der Rumpf) — seither änderte S6 tetrapoda-core, die Messung ist am Kopf veraltet, und die Soll-Tafel hat keine Klasse fell.",
          schlupfloch: "Eine Fell-Textur ohne Gesetz bestünde das Bild an einer Gattung: die Messung je Gattung mit Mutation verlangt das Gesetz.",
          aenderung: "Neu (V09, B72)."
        },
        {
          name: "Haar aus dem Gesetz",
          punkte: 0,
          staffel: "1 = Klasse haar (Strähnen-Kohärenz gegen REF, Albedo-Band) an einem Gerät · 2 = 50 Seeds ohne zwei gleiche Frisuren, beide Geräte",
          messung: "werkbank bild --klasse haar auf Armlänge und im Third; Gestalt-Distanz je Seed-Paar.",
          beleg: "Haar steht im Körper-Kern (`koerper-core.js`, 30 Treffer); mensch-kopf zählt Haar nur als Fleck; ungemessen.",
          schlupfloch: "Ein Haar-Helm je Rolle bestünde die Klasse: 50 Seeds ohne zwei gleiche verlangen das Genom."
        },
        {
          name: "Bewegung: im EINEN Wind und mit dem Leib",
          punkte: 0,
          staffel: "1 = Mähne bzw. Haar korreliert mit dem Wind am Ort (r ≥ 0,6) · 2 = dazu Trägheit beim Lauf (Nachschwingen), Nässe dunkler und schwerer",
          messung: "werkbank bild --zeit an Pferd und Bewohner, Wind-Korrelation wie Vegetation K2; Lauf-Stop-Probe für das Nachschwingen.",
          beleg: "Haar und Fell sind starr; der Wind-Term liest sie nicht; ungemessen.",
          schlupfloch: "Ein Vertex-Sinus wäre Bewegung ohne Feld: die Korrelation mit dem Wind am Ort und die Trägheit verlangen Wind-Leser und Löser."
        },
        {
          name: "Kleidung aus der Epoche, als Tuch am Leib",
          punkte: 0,
          staffel: "1 = Bewohner tragen Kleidung aus der Epoche ihres Hauses (zwei Epochen im Bild unterscheidbar) · 2 = Tuch des EINEN XPBD-Lösers, 0 Durchdringung beim Gang, Labor = Welt",
          messung: "Spielgang-Station Dorfplatz in zwei Epochen; Durchdringungs-Probe beim Gang.",
          beleg: "Kleidung als Gesetz gibt es nicht; die Epoche formt nur Häuser (`fachwerk-core.js` EPOCHEN `:2806-2814`).",
          schlupfloch: "Ein Kleid-Mesh je Rolle ohne Epoche bestünde K1 nicht: die Epoche des Hauses muss den Schnitt ziehen (Mutation).",
          aenderung: "Aus Menschen K4 (Kleidung) hierher (B72)."
        },
        {
          name: "Haar und Fell zahlen am Schirm",
          punkte: 0,
          staffel: "1 = Strähnen nah, Schale/Karte fern, im Haushalt der Klasse (tier ≤ 30 Befehle) an einem Gerät · 2 = beide Geräte, E hält",
          messung: "werkbank zaehlen an einer Prüfbühne mit fester Herde und 10 Bewohnern.",
          beleg: "Ungemessen; die Ratsche tier steht auf frei (spec/profiband/ratsche-*.json).",
          schlupfloch: "Strähnen nur nah an der Messstelle: die Prüfbühne zählt die feste Herde in jeder Distanz."
        }
      ],
      hebel: [
        { name: "Haar und Fell im EINEN Wind", k: ["haar.K3+1"], t: [1, 1], wurzel: "Fell- und Haar-Stoff lesen `_windSwayOffset` (`stamm/stoff-material.js:87`) wie die Krone.", pflicht: "—", v1: false },
        { name: "Strähnen-Gesetz für das Haar mit Karten-Stufe", k: ["haar.K2+1", "haar.K5+1"], t: [3, 3], wurzel: "`koerper-core.js` Haar-Kapitel: Strähnen aus dem Genom nah, Karten-Schale fern (Lehre 19: die Reduktion im Asset).", pflicht: "—", v1: false },
        { name: "Kleidung als Tuch des Lösers (nach Physik H1)", k: ["haar.K4+1"], t: [2, 2], wurzel: "Schnitt aus EPOCHEN des Hauses, Tuch im XPBD-Löser von koerper-core.", pflicht: "—", v1: false },
        { name: "Fell-Schale je Stufe mit EINEM Ton", k: ["haar.K1+1"], t: [1.5, 1.5], wurzel: "`tetrapoda-core.js:817` Fell → Schalen-Stufe aus derselben Zeile; Klasse fell in der Soll-Tafel mit externer REF (Messschuld M23).", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Nie begonnen: die SYSTEMKARTE §6 führt „Fell/Haar“ als Domäne ohne Karte; das Fell-Gesetz bestand einmal als Pflicht-Beweis (K28), seither misst es niemand.",
        anders: "Fell und Haar werden Klassen der Soll-Tafel mit externer Referenz, dann EIN Wind und EIN Löser — keine eigene Haar-Simulation daneben."
      }
    },
    {
      key: "luftwasser",
      titel: "Leben in Luft und Wasser — Vögel, Fische, Insekten",
      dom: "neues Gesetzbuch (ein neuntes Studio) · `tetrapoda-core.js` verbandZug · `klang-core.js` (Vogel-Ruf)",
      v1: "nach v1.0 (ein neues Gesetzbuch)",
      aaaa: "Über der Wiese ziehen Schwärme, im Bach stehen Forellen gegen die Strömung, über dem Feld summen Bestäuber. Jeder Ruf hat einen Körper: was der Spieler hört, kann er sehen. Schwarm und Fischzug folgen derselben Verbands-Zahl wie die Herde (Couzin), Fische lesen die Strömung des Kerns, Vögel fliehen vor dem Spieler und landen auf den Bäumen der Welt, Bestäuber folgen den Blüten des Felds. Fern rechnet ein Schwarm als EIN Agent. **Wo wir die Besten schlagen:** RDR2 setzt ≈ 200 Arten von Hand, Abzû baut Fischschwärme je Szene; bei uns entsteht jede Art aus einem Gesetzbuch und liest die Welt, in der sie lebt.",
      beste: [
        "**Reynolds, Boids** (SIGGRAPH 1987): Separation, Ausrichtung, Zusammenhalt — drei Regeln für Schwarm und Herde.",
        "**Abzû** (Giant Squid 2016): Tausende Fische als Schwärme in Echtzeit, Räuber jagen Beute.",
        "**Red Dead Redemption 2**: ≈ 200 Arten, darunter Vögel und Fische mit eigenem Verhalten.",
        "**Couzin et al. 2002**: dieselben drei Zonen tragen Fischschwarm, Vogelschwarm und Herde."
      ],
      kriterien: [
        {
          name: "Der Vogel fliegt und ruft aus seinem Körper",
          punkte: 0,
          staffel: "1 = ein Vogel-Körper aus einem Gesetzbuch fliegt und ruft · 2 = jeder Vogel-Pegel im Klang-Zensus hat einen Körper (Konsum-Kette Ruf ← Leib), ohne Körper ROT",
          messung: "Spielgang an der Wiese: Klassen-Maske vogel und Klang-Abgriff; Konsum-Kette Ruf ← Leib (Mutation: Leib weg → Ruf weg).",
          beleg: "In der Welt gibt es keinen Vogel: vogel|bird 0 Treffer in `stamm/` und `tetrapoda-core.js`, nur `klang-core.js` ruft ihn (12 Treffer) — Klang K1 verlangt einen Vogel-Pegel ≥ −52 dB an der Wiese.",
          schlupfloch: "Ein Klang ohne Körper bricht „gesehen = gehört“: die Kette Ruf ← Leib wird geprüft.",
          aenderung: "Neu (V05)."
        },
        {
          name: "Schwärme aus dem Verbands-Gesetz",
          punkte: 0,
          staffel: "1 = Vogel- oder Fischschwarm mit Φ ≥ 0,8 und Kohäsion ≥ 0,9 aus `verbandZug` · 2 = Flucht vor dem Spieler als EIN Pulk, Landung auf Bäumen der Welt",
          messung: "Band schwarm in kreatur-proben mit derselben Verbands-Zahl wie die Herde.",
          beleg: "`verbandZug` (`tetrapoda-core.js:1591`) trägt die Herde; `worlds/schwarm` ist eine fremde 2D-Boid-Seite ohne Bezug zur Welt.",
          schlupfloch: "Ein eigener Boid-Code wäre ein Zwilling des Verbands: die Probe verlangt dieselbe Funktion."
        },
        {
          name: "Fische lesen die Strömung",
          punkte: 0,
          staffel: "1 = Fische stehen gegen die Strömung des Kerns (Ausrichtung zur Strömung ≥ 0,8) · 2 = sie meiden den Spieler, folgen dem Pegel und sind unter Wasser sichtbar (Leib K3)",
          messung: "werkbank eval am Bach: Ausrichtung gegen die Strömung aus gate:kopplung F1.",
          beleg: "Es gibt keine Fische; die Strömung advektiert am Bewegungs-Chokepoint (gate:kopplung F1).",
          schlupfloch: "Fische auf festen Bahnen sähen gut aus: die Mutation der Strömung muss die Ausrichtung ziehen."
        },
        {
          name: "Insekten und Bestäuber lesen das Feld",
          punkte: 0,
          staffel: "1 = die Dichte der Bestäuber korreliert mit dem Blüten-Anteil am Ort (r ≥ 0,5) · 2 = sie folgen der Pflege-Geste (Feld K5) und der Uhr",
          messung: "werkbank bild --zeit an der Mess-Wiese mit Klassen-Maske insekt.",
          beleg: "Es gibt keine Insekten.",
          schlupfloch: "Ein Partikel-Schwarm ohne Feld-Leser: die Korrelation mit Blüten am Ort und die Pflege-Mutation verlangen das Feld."
        },
        {
          name: "Ein Schwarm ist fern EIN Agent",
          punkte: 0,
          staffel: "1 = 100 Vögel im Bild ≤ 0,3 ms CPU an der GTX-CPU · 2 = dazu im Haushalt ≤ 10 Befehle, beide Geräte",
          messung: "werkbank zerlegen/takt an einer Prüfbühne mit festem Schwarm.",
          beleg: "Ungemessen: es gibt keinen Schwarm in der Welt; die Herde rechnet heute je Kopf (Tiere H2 legt die Separation auf das FLOCK_CELL-Gitter und ferne Verbände auf das Leittier).",
          schlupfloch: "Schwärme nur außerhalb des Blicks: die Prüfbühne zählt den Schwarm im Bild."
        }
      ],
      hebel: [
        { name: "Fische in der Strömung", k: ["luftwasser.K3+2"], t: [2, 2], wurzel: "Strömung aus `_waterLevelAt`/F1-Chokepoint als Leser der Fisch-Ausrichtung.", pflicht: "—", v1: false },
        { name: "Bestäuber als Leser von auraAt", k: ["luftwasser.K4+1"], t: [2, 2], wurzel: "`stamm/feld-leben.js:auraAt` lebendig/Blüte am Ort.", pflicht: "—", v1: false },
      ],
      feststeck: {
        versucht: "Nie begonnen; benannt nach den acht Studios (Gedächtnis studio-vollendung: als Nächstes Motorrad, Vögel, Aufzug). Die Wiese klingt heute nach Vögeln, die es nicht gibt.",
        anders: "Zuerst den Ruf an einen Körper binden (der Zensus nennt den Phantom-Vogel ROT), dann das Gesetzbuch über den Vertrag andocken, ohne eine Wirt-Zeile."
      }
    }
  ]
};
