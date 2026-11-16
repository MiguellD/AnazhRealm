# Der Blind-Leser — Befund und Entscheidung (16.11., Zweig vorrat2-blind-leser)

Gebaut, headless geprüft, am Fenster ungemessen. Keine Sprosse gehoben, keine gemeldet.

**R11 wörtlich:** „Wo ein Mensch urteilen muss, urteilt ein blindes Panel von ≥ 12 Menschen ohne Projektwissen im Zwei-Wege-Zwang
(2AFC über ≥ 40 Paare, 50 % heißt ununterscheidbar) oder ein eingefrorenes Modell, das auf 200 vom Panel gewerteten Ankern ≥ 0,8
Übereinstimmung zeigt und halbjährlich an einem frischen Panel nachgeeicht wird; Korpus, Schwelle und Anker werden vor dem ersten Lauf
mit Quelle eingefroren.“ R6 macht „plausibel/stimmig/glaubhaft/echt“ zum Blindpaar gegen den Korpus der Perspektive; R5 nennt das
Blindpaar gegen das Foto als Stufe der Prüfhärte. Die Korpora liegen nicht im Repo (REGELN.md, Tafel „Referenz-Korpus“).

## Die Sprossen 1–2 mit Blind-Richter: 96 (Lese-Batterie: ~20 — sie zählte nur die nächste Sprosse je Leiter)

Der Richter-Text steht EINMAL in `vision/meisterkarte-2.json`; `node meisterkarte-quelle/punkte/stationen/blind.cjs --sprossen`
druckt jede Zeile mit ihm. Die Linse im Selbsttest wird ROT beim Namen, sobald eine Sprosse 1–2 ein Blind-Wort trägt und keine Form hat.

**S — Spiel gegen Spiel, Wahrheit aus dem Zustand der Welt (39), verlangt: Blindpaar oder Blind-Wahl aus k:**
planet.geologie.lagerstaette 1 (Jury, 3 Genesen) · planet.relief.formschatz 1 (Blind-Klassifikation) · planet.erde.gestalt 1
(Ortskundige, 1 aus 10) · leben.pflanzen.arten 2 · leben.tiere.lebenszyklus 2 (Panel) · leben.wasser.bild 2 · leben.wasser.lebensraeume 2
(Klassifikator) · leben.evolution.zeitreise 1 (Panel) · leben.evolution.erbe 2 (1 aus 100) · mensch.leib.verschieden 1 (Prüfer) ·
mensch.leib.tracht 1, 2 (Prüfer) · mensch.leib.ausdruck 1 (Prüfer) · mensch.sport.kunst 1 · mensch.geist.netz 2 · mensch.geist.generationen 2
· mensch.geist.innenleben 1 (Panel, 5 s Film) · mensch.geist.absicht 1 · mensch.stadt.form 2 · mensch.stadt.breite 1 (1 aus 6) ·
mensch.bau.bedarf 1 · mensch.bau.bauen 2 · mensch.fahrzeug.gestalt 1 · mensch.macht.stand 1 · mensch.kultur.sprache 1 ·
mensch.kultur.gestalt 1 (1 aus 10) · mensch.kultur.glaube 2 · mensch.kultur.bildkunst 2 (1 aus 10) · mensch.kopplung.kultur 1 ·
mensch.zeit.spanne 1 · mensch.zeit.erleben 2 · mensch.zukunft.technik 2 (R10-Leser) · erleben.schoepfen.hebel 2 (≤ 60 %) ·
erleben.schoepfen.gespraech 2 · erleben.klang.stimme 2 · erleben.klang.musik 1 (Hörer) · same.physik.stoffe 1, 2 (Jury) ·
same.entfaltung.vielfalt 1 (Panel, 1 aus 10).

**F — gegen Foto, Film, Erd-Daten oder Vergleichstitel (47), verlangt: Blindpaar gegen den Korpus (meist 2AFC ≤ 70–90 %):**
planet.geologie.platten 1 · vulkan 1, 2 · gebirge 1 · unterwelt 2 · lagerstaette 2 · einschlag 2 · planet.relief.formschatz 2 · boden 1 ·
planet.wasser.tiefsee 2 · planet.wetter.wolken 1, 2 · fremde-atmosphaeren 1 · planet.zeit.archiv 2 · planet.kosmos.galaxien 1 ·
same.kopplung.erdsaat 1 · leben.pflanzen.arten 1 · lebenslauf 2 · dichte 1 · leben.tiere.arten 2 · leben.oeko.zerfall 2 · sukzession 2 ·
leben.evolution.mikroben 1 · mensch.leib.gesicht 2 · mensch.stadt.groesse 1, 2 · messlatte 1, 2 · mensch.bau.huelle 1, 2 ·
mensch.fahrzeug.gestalt 2 · mensch.nahrung.flur 2 · frucht 1 · strom 2 · jenseits 2 · mensch.wirtschaft.technik 2 · mensch.kultur.gestalt 2 ·
mensch.zeit.erde 1 · mensch.zukunft.medien 2 · maschinenwesen 1 · erleben.spieler.hand 2 · erleben.schoepfen.satz 2 · gesetz 2 ·
erleben.bild.flaeche 2 · kamera 2 · erleben.kopplung.bild 2 · same.entfaltung.schirm 2.

**E — Schätzung oder Ja/Nein ohne Zwangswahl (4):** mensch.leib.spur 1 · mensch.zeit.spanne 2 · mensch.geist.absicht 2 ·
mensch.stadt.vertikal 2. **N — Neulinge oder Agent spielen, kein Blind-Urteil (6):** erleben.schoepfen.gespraech 1 ·
erleben.sinn.ziele 2 · entdeckung 1, 2 · staunen 1 · sog 1. **Kein Urteil (14, Maß gegen Referenz-Zahl):** in `KEIN_URTEIL`.

## Die Entscheidung

**EIN Protokoll, der Richter ist eine Funktion; im Zug richtet das eingefrorene lokale Modell, das Panel eicht es.** Das Blindpaar
(k-Wahl, Seite und Reihe aus dem Samen des Sitzes, ≥ 40 Versuche, exakte Binomial-Schwelle gegen 1/k, Fang-Aufgaben, sha256 des Plans
vor dem ersten Lauf) ist dieselbe Form für Panel und Modell. Das Modell ist `qwen3.6:latest` am Laptop (ollama 127.0.0.1:11434, der
Anbieter der KI-Stationen in g4.js/g5.js; qwen35moe 36B Q4_K_M, der Vision-Turm `v.blk.*` steht im GGUF — schon geladen, kein Download,
kein fremder Dienst). Es urteilt nur mit Eich-Akte: 200 Anker, gewertet von ≥ 12 Menschen über DENSELBEN Plan (der Bogen: eine
HTML-Datei ohne Server, Antwort als JSON), Übereinstimmung ≥ 0,8, ≤ 183 Tage, derselbe Digest — sonst `zugelassen: false` beim Grund.

**Grund:** R11 erlaubt genau zwei Sitze; ein Panel ist am Kopf jedes Zugs nicht wiederholbar (Z4 verlangt die frische Messung), das
Modell ist es. Ein blinder Richter bestünde jedes „≤“ mit 50 % — darum entlarvt das Protokoll Seiten-Wahl und verfehlten Fang, bevor
es urteilt. Die Eingabe sind die PNGs, die die Sitzung schon schreibt (`werkbank bild --wahl 0` 1920 × 1080, k4-bild.cjs;
`pngDatei` in sitzung-seite.js:312); jede Sprosse braucht weiter ihre Probe, die das Paar an ihrer Pose schießt, und P in derselben Fahrt.

## Was der Schöpfer setzen muss — bis dahin fällt KEINE der 96

1. **Das Eich-Panel:** ≥ 12 Menschen ohne Projektwissen, je ~200 Versuche am Bogen (~20 min), halbjährlich frisch. Ohne sie ist das
   Modell nach R11 nicht zugelassen und keine S-Sprosse fällt. Danach trägt das Modell **31 der 39 S**; 8 brauchen das Panel in jeder
   Fahrt, weil das Modell weder hört noch Film sieht oder Ortskunde verlangt ist (klang.stimme 2, klang.musik 1, physik.stoffe 1 + 2,
   geist.innenleben 1, sport.kunst 1, geist.netz 2, erde.gestalt 1 — dazu die Erd-Daten der Erd-Saat).
2. **Die Referenz-Korpora:** die 47 F-Sprossen urteilen gegen Fotos, Filme, Erd-Höhenmodelle und Bilder der Vergleichstitel; ihr
   Herunterladen und Einfrieren mit Quelle entscheidet nur er. Bis dahin warten alle 47, auch mit geeichtem Modell.
3. E (4) und N (6) trägt dieses Werkzeug nicht — E bräuchte eine Lesart als Zwangswahl, die den Richter änderte (nur der Schöpfer).

## Stand des Spikes

`meisterkarte-quelle/punkte/stationen/blind.cjs` (683 Zeilen), `node … --selbsttest` GRÜN 9/9, 1,2 s, ohne Netz und Modell: Fall 1
zwei gleiche Bilder → Zufall (23/40, kritisch 26, p 0,22) · Fall 2 klar verschiedenes Paar → erkannt (40/40, p 9·10⁻¹³) · Fall 3 immer
links → blind (erste Stelle 80/80, p 2·10⁻²⁴; Fang 19/40), obwohl 18/40 „ununterscheidbar“ aussähe · Protokoll-Datei rechnet sich nach,
gefälschter Plan und gefälschtes Urteil werfen · R11 am Plan (39 Versuche, ≤ ohne Fang werfen) · Zulassung (Panel 12 ja, 11 + ein
Links-Drücker nein, Modell mit 2 Ankern nein, mit 200 ja, anderer Digest nein) · Bogen zieht dieselben Versuche · Sprossen-Linse an
der Karte GRÜN, Mutante ROT beim Namen. Ungelaufen: `--modell` gegen qwen3.6 (GPU, verboten in dieser Welle) und `--bogen` vor Menschen.
Stand: Protokoll und Zulassung 100 %, Modell-Sitz gebaut und ungeprüft, Sprossen-Wirkung 0 % bis zur Eich-Akte. Kein gN.js, kein
punkte.cjs berührt; eine Station `karte2.*` hängt sich erst nach der Eichung an `protokoll()`.
