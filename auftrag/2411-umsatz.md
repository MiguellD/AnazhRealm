# AUFTRAG 24.11. 16:40 — Konto 19 (Koordinator Fable an der Radeon): der Umsatz Anspruch → Buchung

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Der Befund (gemessen, Belege mit Datei:Zeile; Werkzeug `bericht/2411-werkzeug/umsatz-tafel.cjs`)
Am 24.11. landeten 33 beanspruchte Sprossen, 5 buchten. Verloren: 15 UNGEMESSEN (11 durch EINEN Absturz der Radeon-Sitzung,
„Werkbank Exit 3221226505“, 54 Einträge in einer Sekunde) · 9 ROT NACH DER LANDUNG (alle w28-bewohner-satz2) · 2 GRÜN UNGEBUCHT (ein
Radeon-ROT vom 21.11. sperrt kraft#2 und jahreslauf#2) · 1 Preis „UNGEMESSEN unter Last“ · 1 hinter der Front. Seit dem 22.11. sind
34 von 106 Ansprüchen rot nach der Landung. Die drei Wurzeln:
1. `K.leser` / `K.nicht` setzen ROT ohne Bedingung (`stationen/k2-mensch.js:131–132`): die Fähigkeit steht in main, die Station sieht
   sie nie (gespraech#2 seit ca3384f3; netz#1, absicht#2, koennen#2, kunst#1, krieg#1 ebenso; seuche#1 liest `Object.keys(b)` und
   sieht den Getter des Satzes nicht).
2. Alle 1 640 Stationen der Karte 2 brauchen ein Gerät, die GPU-Probe nimmt keinen Stations-Ruf an: kein Macher sieht sein Urteil vor
   der Landung.
3. Die Radeon meldet „durch 77/77“ mit 13 Urteilen und 61 `ungemessen`: Einträge ohne Feld `offen` zählen als erledigt
   (`zug/dienst/runde.cjs:198–203`).

## OMEN (GTX 1060) — DIE MESSFUNKTIONEN, vor scherbe-liegt
Zuerst sport-regeln: nach der Landung von w28-ort-ausstattung (z718, trägt die R4-Heilung 3bbb5b23) main einmischen, die Röte
„Studio-Dither-Blende“ und „Stand-Takt“ am Kopf c0e41d18 im Job-Log lesen (Täter-Zeile wörtlich), neuer Vorprüf-Kopf.
Dann EIN Zweig `pm-leser-welle` (punkte-maschine): die Messfunktion jeder Station, deren Fähigkeit in main steht und die nur ROT sagt.
Erste Reihe (bewohner-satz2): `k2-mensch-geist.js` gespraech#2 (:198–212, :434–436), netz#1 (:489), absicht#2 (:609) ·
`k2-mensch-sport.js` koennen#2 (:670), kunst#1 (:795) · `k2-mensch-menge.js` seuche#1 (:335, :645) · `k2-mensch-macht.js` krieg#1
(:805), megastadt#1 (:935, die Wache als Bau kommt mit ort-ausstattung). Zweite Reihe: die übrigen Zeilen „ROT NACH DER LANDUNG“ der
Umsatz-Tafel (pm-beobachter, pm-seite-ohne-m, pm-nacht-front, acker-kette, eine-huelle, front-planet-leben), je Station erst lesen,
ob die Fähigkeit in main steht (Kern-Kommentar, `git log -S`), sonst bleibt sie rot mit ihrem Täter.
Regeln: das Soll steht WÖRTLICH aus dem `richter` der Karte (kein Macher ändert das Soll); die Station liest den EINEN Export der
Fähigkeit (Konsum, kein Zwilling); jede Station einmal am main-Kopf gefahren (`node punkte.cjs run --sha <main40> --geraet gtx --nur
<id>`) und das Urteil mit Zahl im Bericht — GRÜN oder ehrlich ROT mit dem Täter in der Welt (Datei:Funktion). Selbsttest der Station:
eine Mutante, die die Fähigkeit nimmt, macht sie ROT. Abgabe: Zweig-Kopf + `bericht/2411-leser-welle.md` (je Sprosse: vorher → nachher,
Zahl gegen Soll). Die GTX-Runde weicht dieser Arbeit (landung.halt), sie bucht ohnehin nur die Spitze.

## GTX 1050 — DER WEG DES URTEILS (nach ruhe-gesetz, VOR klima-aufwind)
1. Die vierte Form der GPU-Probe `station:karte2.<leiter>#<n>[+<id>…][@<pm-ref>]` (gpu-probe.yml:111–121 Einlass, :379–399 Fall):
   sparse Baum von koordination oder `<pm-ref>` wie punkte-farm.yml:180–186, `PUNKTE_GPU_LAUF` als Durchreicher (das Schloss hält der
   Job schon, Marke `GPU_LAUF_HAELT=ci`), `node punkte.cjs run --sha $GITHUB_SHA --geraet <radeon|gtx> --nur <ids>` in EINER warmen
   Sitzung; Deckel 120 s + 60 s je Station; das Urteil je Station als Zeile im Probe-Post und oben in cloud-post/<zweig>.md;
   gate:apparat Klinge 7 kennt die vierte Form, mit Selbsttest. Kein Buchen aus der Probe — es ist das Vorurteil des Machers.
2. `runde.cjs`: ein `ungemessen` ohne Urteil aus einem Sitzungs-Absturz ist NICHT erledigt (die Station kommt in derselben Runde neu,
   höchstens zweimal, dann „ungemessen: <grund>“ mit `offen`); die Zeile „durch n/m“ nennt Urteile und Ungemessene getrennt.
   Selbsttest: 54 Absturz-Einträge → die Radeon ist nicht „durch“.
3. Die Fixtur-Klasse GIT_DIR (meine Nachricht 16:27).

## Radeon (zwei lokale Macher, Bäume AnazhRealm-front-pl und AnazhRealm-acker)
Haus (haus-stoff → haus-dach, `mensch.bau.bauen#1`) und Fahrzeug-Gattung (`mensch.fahrzeug.gestalt#1`): jeder fährt vor der Abgabe
die ECHTE Station seiner Sprosse am eigenen Kopf auf der Radeon und beansprucht nur, was sie GRÜN urteilt.

## Brief-Satz für JEDEN Macher ab heute
„Lies vor dem ersten Schnitt die Station deiner Sprossen (Zweig punkte-maschine, `meisterkarte-quelle/punkte/stationen/`, Feld `wo`
und die Messfunktion). Sagt sie `K.leser` oder `K.nicht`, gehört ihre Messfunktion zu deiner Abgabe (Zweig `pm-<name>`, Soll wörtlich
aus der Karte). Beansprucht wird nur eine Sprosse, deren Station am Vorprüf-Kopf GRÜN lief.“

## NACHTRAG 24.11. 16:47 — die Teilung, damit nichts doppelt gebaut wird
- GELANDET 16:44: z718 w28-ort-ausstattung, main = eba9bf8f (V18.546.404). Runde 23 misst seit 16:47 an diesem Kopf.
- Die ERSTE Reihe der Messfunktionen (die acht aus bewohner-satz2) schreibt seit 16:45 ein lokaler Arbeiter an der Radeon, Zweig
  `pm-leser-welle`. OMEN nimmt sie NICHT.
- OMEN, sobald wach: (1) sport-regeln auf main eba9bf8f, die zwei Röten lesen, neuer Vorprüf-Kopf. (2) Die ZWEITE Reihe als Zweig
  `pm-leser-welle2`: die Zeilen „ROT NACH DER LANDUNG“ der Umsatz-Tafel (`bericht/2411-umsatz-tafel.md`) außer bewohner-satz2 — je
  Station erst lesen, ob die Fähigkeit in main steht. Regeln wie oben. Melde dich an die Adresse des Koordinators mit Kopf und Zahl.
- GTX 1050: Reihenfolge (2) Stations-Probe → (3) runde.cjs → (4) GIT_DIR → Tat-Wertung (Wertung am Moment des Wirkens UND die Probe wartet
  auf `_feldFolgeSteht`, EINE Welle) → klima-aufwind. Fällt ein Zug-Kandidat zweimal an tat-k1, springt die Tat-Wertung nach vorn.
