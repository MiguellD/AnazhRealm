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

## NACHTRAG 24.11. 17:28 — DIE SITZUNG TRÄGT (GTX 1050, VOR der Stations-Probe; die Radeon misst seit 17:10 nichts mehr)
Gemessen an Runde 23, Kopf eba9bf8f, `messung/eba9bf8f-radeon.json` + `messung/roh/eba9bf8f-radeon/` (Zweig punkte-maschine, Baum der Radeon):
- Sitzung 17:00:24: grenze#1, bildkunst#1, schrift#1, kunst#1, seuche#1 geurteilt; gespraech#2 „Läufer starb (Exit 0xC0000409
  STATUS_STACK_BUFFER_OVERRUN, Kind 24604 nach 11,2 min)“.
- Danach je Sitzung GENAU EINE verlorene Station und ein Neustart: 17:11:42 megastadt#1 „Frist der Probe 80 s gerissen im /umstellen
  hochhaus-dach (der Ruf lief 79,8 s: der Messort trug die Frist)“ · 17:16:35 sprache#1 „… 39 s … /umstellen stadt-voll“ · 17:21:54
  koennen#2 „… 24 s … /umstellen stadt“ · 17:25:05 · 17:25:11 … Jede verlorene Station trägt `offen: undefined` (zählt als erledigt).
- 71 Stationen stehen auf „die Welt der Sitzung trägt nicht mehr (Grundstellung: abweichend vom Grund: creatures worldMeta.kalender
  weather · {"creatures":{"vorher":3,"nachher":0,"fehlt":["Yune ×2","Nox"]},"worldMeta.kalender":{"fehlt":["0.10099999999394"],
  "neu":["0.10099999999393816"]},"weather":"undefined → \"sunny\""})“. Der Kalender-Unterschied ist derselbe Wert in zwei Rundungen.
- Jede Sitzung misst zuerst wieder profiband.K4#1/#2 (2–3 min) und meldet „UNGEMESSEN unter Last: Referenz f 1,456–1,652“.
- Dieselbe Klasse am ganzen 24.11. (Leser-Bericht): 18 Front-Sprossen werden in jeder Runde gefahren und blieben in 261 Mess-Einträgen
  0-mal GRÜN, immer UNGEMESSEN — die Grundstellung (punkte.cjs:3191, weiter :4091–4199) warf „creatures 14 → 0“ an daee7541 und
  bf9be26c, an a8dd22b5 starb die Werkbank (Exit 3221226505). 15 davon urteilen an einer Zahl mit Soll (welten#1, wasser.bild#1,
  kollektiv#2, lenker#1, verstaendigung#1, spieler.hand#1, feuer#2, preis.eingabe#2, gemeinsam#1, schoepfen.satz#1, massstab.sprung#1,
  preis.ankunft#2, evolution-planet#1 …): sie warten nur auf EINE Fahrt, in der die Sitzung trägt.
Mein Anteil: zwei lokale Arbeiter liefen neben der Messung, die Maschine nennt „fremd: radeon-dienst.sh --selbsttest“ — angehalten 17:31.

DER SCHNITT (EINE Welle, Wurzel lesen statt raten; jede Regel mit Selbsttest und Mutante in der bestehenden Familie):
1. DER MESSORT TRÄGT SEINE EIGENE FRIST. Die Frist der Probe beginnt, wenn ihr Messort steht (punkte.cjs:784 „der Messort trug die
   Frist“ darf für eine Probe nie mehr das Urteil sein). Steht der Messort in SEINER Frist nicht: „UNGEMESSEN: Messort <name>“ MIT
   `offen`, die Station kommt in derselben Runde einmal wieder, in einer Sitzung, deren Messort steht.
2. DIE KETTE ENDET. Nach einem Abbruch bringt die Grundstellung die Welt zurück oder die Sitzung startet neu — aber die nächste Sitzung
   beginnt nie wieder mit demselben kalten Bruch (heute: megastadt → sprache → koennen, je 4–5 min, je eine Station verloren).
3. DER VERGLEICH DER GRUNDSTELLUNG. Lies an der Wurzel, welche der drei Abweichungen echt ist: `worldMeta.kalender` vergleicht Text
   zweier Rundungen desselben Werts; `weather: undefined → "sunny"`; `creatures N → 0` nach einem Ortswechsel fort vom Grund. Ein
   falscher Alarm des Vergleichs tötet keine Sitzung; eine echte Abweichung nennt ihren Täter (welche Probe ließ was zurück).
4. profiband.K4 unter Last wird nicht je Sitzung neu gefahren (einmal je Runde, danach `offen` bis zur Ruhe).
5. runde.cjs (stand schon als Punkt 2 deines Auftrags): „durch n/m“ nennt Urteile und Ungemessene getrennt; ungemessen aus einem
   Sitzungs-Bruch ist nicht erledigt.
BEWEIS: EINE Fahrt der 15 genannten Stationen + megastadt#1 + sprache#1 + koennen#2 an einem Gerät, Urteile gegen Ungemessene vorher
(heute: 0 von 18) ↔ nachher. Hast du kein Standardgerät frei, liefere den Zweig `pm-sitzung-traegt` — ich fahre die Fahrt an der Radeon.
NEUE REIHENFOLGE GTX 1050: (1) dieser Schnitt → (2) Stations-Probe `station:` → (3) GIT_DIR → (4) Tat-Wertung → klima-aufwind.
