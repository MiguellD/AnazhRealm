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
