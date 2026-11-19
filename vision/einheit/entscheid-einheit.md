# EINHEIT — Entscheid des Koordinators (19.11., nach dem Blatt `EINHEIT.md`)

Anlass, Wort des Schöpfers: „Bauen wir immer wieder einzelne LOD-Systeme, für jedes Studio, jedes Gesetz? Wieso bauen wir nicht in
Einheit, optimieren in den Studios die Grundgesetze … in der ersten Ebene geformt, vom Licht bis zum Material, über alle Zeit“.
Der Zensus bestätigt es mit Zahl: 28 Stufen-Systeme, 20 unabhängige Entscheider, 16 Meter-Grenzen für „nah“; 58 von 64
Haus-Wechseln und 5 von 5 Wagen hängen an geliehenen Baum-Zahlen (12 / 26 m, `foundry-core.js:432`). 15 Stoff-Quellen, Holz mit
8 Rauheiten. 3 Achsen vom Jahr zur Epoche. Gelesen am Baum b7ed8419, nicht am Kopf dabd69bb — jede Zeile:Datei wird vom Schneider
am Kopf nachgelesen, bevor er schneidet.

## E1 — drei Grundgesetze, je EINE Quelle (angenommen wie im Blatt §2–§4)

1. **STUFE:** `d_k = g · max(b_k, w_k, haelt_k)` — Farbbild-Versatz, Wurf-Versatz, Reichweite der Handlung; Sitz
   `FoundryCore.stufeGrenze`; jedes Studio liefert je Vorlage und Stufe `{b, w, haelt}`, gemessen gegen die eigene L0; fehlt die
   Zeile, bricht es laut (`_kernPflichtBruch`). Die Stufe bleibt ganzzahlig, die Grenze wird stetig.
2. **STOFF:** `STOFF_GESETZ` (`schmiede-core.js:2860`) ist die EINE Tafel; `stoffAntwort(name, schicht, alterTage, naesse)`; ein
   Studio liefert je Teil nur Name und Schicht. `envMapIntensity` fällt in derselben Klasse.
3. **ZEIT:** zwei Größen — `jahr` (Gegenwart des Orts, EINE Achse EPOCHEN `fachwerk-core.js:3622`) und `baujahr` je Objekt. Der
   Wagen liest `jahr`; das Gespann (Tier an der Deichsel) landet in derselben Welle, ein Karren ohne Tier landet nicht.

## E2 — die Reihenfolge (Zensus steht → Spike mit Soll vor der Rechnung → EINE Welle je Gesetz)

1. **Schritt 0, heute:** die Kurve `b`/`w` über den Abstand in Node messen (32 Häuser × L1/L2, 5 Wagen × L1, d ∈ {3, 6, 12, 26,
   50, 100} m). Ohne GPU, Opus. Die Vorhersage des Entwurfs (0,24 m, −67 %) ist gefallen, weil unbelegt.
2. **Spike STUFE** an Haus UND Wagen zugleich; die Soll-Tafel S1–S6 des Blatts §5 gilt wörtlich und steht als `soll.json` im ERSTEN
   Commit. Meine Vorhersage, vor der Messung: S1 hält an ≥ 60 von 69 Zeilen, S2 reißt an mindestens einem Stil ohne `w`, S5 bleibt
   im Rauschen. Spike nein = stopp.
3. **Welle a (Stufe)**, Klasse nach §6a, Maß Absenz-Grep 0. Dann Stoff-Spike (EINE Holz-Zeile für Wagen und Haus, Bildpaar
   Werkstatt) → Welle b → Welle c (Zeit, mit Gespann).

## E3 — was das für laufende Kapitel heißt

- **HERDE (H1):** das Posen-Gesetz (Phase, Hals, Tätigkeit der Gruppe, Satz-Pose aus Phase und Tätigkeit) baut JETZT als eigene
  Welle — es ist kein Stufen-System. Die Kappen `nahLeiber` 4 und `maxCreatures` 20 und `ANALOG_NAH_M` (`kreatur-leben.js:3722`)
  wandern offen aus H1 in die Klasse §6a: sie fallen mit `stufeGrenze`, nicht ein zweites Mal einzeln. Folge für die Soll-Tafel H3:
  S6 urteilt erst an Welle a; S1–S5 urteilen an der Herden-Welle.
- **HAUS-FERNE:** `tonUebertrag` und das L1-Soll stehen in §6a — kein weiterer Einzel-Schnitt an der Haus-Ferne in der Licht-Welle.
- **VERKEHR (Pflicht C):** die Epoche des Wagens ist Welle c; „Millionen“ braucht den Fluss je Spur (Sim, Bild und Culling sind
  heute O(N)) — offen, Messname `verkehr-ms-20-gegen-2000`.
- **SCHLIERE bei Fahrt:** Wurzel ist die zeitliche Auflösung (nur Spieler und Hand-Gerät sind Träger der Reprojektion,
  `bild-kosten.js:2647–2665`), nicht der Stoff. EIN Schnitt: jeder fahrende Wagen im Blick wird Träger; Messname
  `lack-luma-fahrt`. Er läuft nach dem Stufen-Spike.

## E4 — die Heilungen der Muster (Blatt §7)

1. Soll vorab: gilt ab sofort an meinem Stempel — keine Vorprüfung ohne Soll-Datei im ersten Commit der Welle.
2. Puls und `wellen-landung` im Blick, `pushe()` endet ROT: bestellt nach Schritt 0, als EIN Opus-Schnitt am Zug-Dienst.
3. Äste mit Frist — gesetzt am 19.11. nach dem Wort des Schöpfers („du der dirigent, du machst die regeln“): ein Zweig ohne
   Abgabe-Commit, ohne Push seit 72 h, ohne laufenden Besitzer und nicht in der Zug-Schlange wandert nach
   `refs/archiv/<datum>/<name>` (derselbe SHA, erst pushen und per ls-remote prüfen, dann der Kopf-Zweig weg) und bekommt in
   LAGE die Zeile „fällt offen“ mit SHA und Grund. Nie vernichten: ein Push holt ihn zurück. Ausgenommen: main, integ-probe,
   koordination, punkte-maschine, die Dienst-Zweige, jeder Zweig mit Stempel in der Schlange. Die 15 Familien der Bergung
   (`bericht/1811-bergung.md`) bekommen VOR dem ersten Lauf je einen Besitzer mit Datum oder fallen offen mit Grund — das
   Archiv begräbt nichts still. Das Werkzeug (`ungelandet.cjs --frist`, erst Trocken-Liste, dann Lauf) baut ein Opus-Arbeiter
   mit dem Puls aus Punkt 2, sobald ein Arbeiter-Platz frei ist.

## E5 — ehrlich

- Die Rate: 5,0 Sprossen je Tag gegen nötige 60,1. Sprosse für Sprosse erreicht der Plan am 17.12. etwa 175 von 1 718. Die drei
  Grundgesetze tragen mindestens 339 Sprossen; ob sie die Rate wirklich heben, zeigt die erste gelandete Welle a, nicht dieses Blatt.
- `PLAN-1712.md` trägt 0 der 14 Wörter des Schöpfers vom 19.11.; die Reihenfolge E2 gehört dorthin (Zeile 33) — ich trage sie nach.
- Galaxien, Zeit vor −5000 und nach 2150: weder Gesetz noch Zensus (61 Sprossen, 1 gebucht). Offen, Messname `kosmos-zensus`.
- Kein Bild und kein GPU-Lauf in diesem Blatt; jede Zahl ist am Code gelesen, nicht gemessen.

## E6 — nach Schritt 0 (19.11., Blatt `stufe-kurve.md`, Zahlen `stufe-kurve.json`; Node, Samen 1, ohne GPU)

Gemessen mit `wechselProbe`, derselben Messung wie gate:haus-fern P: alle 69 Wechsel lägen mit max(b, w) NÄHER als heute, keiner
ferner, im Median beim 0,31-fachen (Haus L1 3,0 m statt 12, L2 11,5 m statt 26); bei 27 Zeilen liegt `b` unter 3 m. Dreiecke im
Blick rechnerisch (1 Haus je 400 m², Ring 6–100 m): Haus 68 125 → 45 909 (−32,6 %), Wagen −2,0 %.
Meine drei Vorhersagen: zwei getroffen (Limousine `b` < 12 m; 31 von 32 Häusern unter 1 px bei 12 m), eine verfehlt — der Versatz
fällt jenseits 26 m etwa wie 1/d (Median 0,89), nicht langsamer.

Was die Messung an Gesetz und Soll ändert (kein Soll wird bewegt; zwei Zeilen fallen als Richter, mit Grund):
1. **`b` misst heute nur die Silhouette** (`kantenVersatz`), keine inneren Kanten — Fachwerk, Fensterkreuz, Sprosse. Gerade bei
   `b` < 3 m ist der Farbbild-Versatz damit ungemessen. **Entscheid: `b_k` ist der Abstand, an dem das BILD der Stufe k vom Bild
   der L0 nicht mehr zu unterscheiden ist** — gemessen am gezeichneten Bild beider Stufen an derselben Kamera, nicht am Umriss.
   Die Silhouetten-Messung bleibt als untere Schranke.
2. **S1 fällt als Richter:** die Grenze liegt genau dort, wo dieselbe Messung 1 px trägt — die Zeile kann nicht rot werden.
   **S2 fällt am Haus als Richter:** `w` ist an allen 64 Zeilen 0, weil L0, L1 und L2 denselben Werfer (Stufe 3) tragen
   (`fachwerk-core.js:100–102`). Damit ist auch der Satz des Blatts „ohne `w` verlören 15 Häuser ihren Schatten“ widerlegt.
3. **Fund, sichtbar:** der Werfer des Hauses weicht bei 12 m um 9,4 px vom Umriss der L0 ab, gleich für jede Stufe — der Schatten
   passt nah nicht zum Haus. Der Wurf ist selbst eine Stufe und folgt demselben Gesetz: `w_k` wählt den WERFER, nicht nur die Grenze.
4. **Der Spike wird ein Bild-Spike an echter GPU** (Radeon, nach dem Rest des Lichtmessers). Soll, gesetzt VOR der Messung:
   - B1 Umschalt-Bild: am Wechsel-Abstand der Stufe k ändert das Umschalten L0 ↔ Lk an derselben Kamera höchstens 1 % der
     Pixel der Objekt-Maske um mehr als 8 / 255 (Luma), an 6 Vorlagen (3 Häuser verschiedener Stile, darunter japanisch; 3 Wagen).
   - B2 Werfer: der Schatten des Hauses bei 12 m weicht ≤ 1 px vom Schatten der L0 ab (heute 9,4 px am Umriss).
   - B3 Handlung: Tür und Sitz stehen innerhalb `haelt` in L0, 100 %.
   - B4 Dreiecke im Blick an der Pose stadt-voll: gemessen, nicht gerechnet; die Rechnung −32,6 % ist die Vorhersage.
   - B5 Frame p95 im ABAB: Differenz ≤ Rauschen der zwei A-Läufe.
   Meine Vorhersage: B1 reißt an den Fachwerk-Stilen bei der Silhouetten-Grenze (das innere Fachwerk fehlt der L1) und `b` aus dem
   Bild liegt bei ihnen zwischen 6 und 12 m; B2 ist heute ROT; B4 landet zwischen −15 und −30 %.
5. Unbelegt und so benannt: nur Samen 1 · japanisch/chinesisch L2 springen bei 6 m auf 40 px ohne Erklärung · `fachwerk-core.js`
   weicht am gelesenen Baum um 361 Zeilen von main ab · `haelt`, `g` und die Hysterese sind ungemessen.
