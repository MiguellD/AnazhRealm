# 41 Meisterkarte Scheibe 1/8 — affekt · halten · mensch · spielgang · wetter (Index mod 8 = 0)

Quelle: `w3/pm/meisterkarte-quelle/punkte/stand.json` (kopf ec281422, zeit 2026-11-13T19:48Z), `meisterkarte.json` (summe 221),
`punkte/messung/*.json`, `punkte/stationen/g1.js g2.js g5.js`, Regel `punkte.cjs:4197 stufen` (1 = jede #1-Station auf EINEM Gerät grün,
2 = dazu jede #2-Station auf JEDEM Gerät; ohne #2-Station bucht die Maschine den zweiten Punkt nie, `punkte.cjs:4240`).
Scheibe: 38/50 gebucht (affekt 6 · halten 10 · mensch 8 · spielgang 5 · wetter 9), offen 12 Punkte in 10 Kriterien.

## Was es den Spieler kostet (Bild: `scratchpad/genom-spiel/gruppe.png`)
- Im Bild: Dorfplatz am Mittag, neun Menschen, alle stehen still, die meisten mit dem Rücken zur Kamera; Himmel dunkel-marine,
  Wiese als flache gelbgrüne Zacken am Hang, Boden brauner Teppich mit violetten Schlieren. Das passt zu mensch.K1#1
  „18 Menschen im Bild, 0 gehend" (dc9eacb0 radeon) — gezählt wird die Menge, nicht ob einer geht.
- Was die Scheibe kostet: drei Stationen sind seit 06.11. BLIND für die Wetter-Wünsche der Welt (unten), darum steht affekt.K4 auf 0,
  spielgang.K5 auf 1 — und die nächste frische Headless-Fahrt nimmt affekt.K2 einen gehaltenen Punkt (−1). Die letzte Headless-Messung
  überhaupt ist `messung/6aa7a5a6-headless.json` (10.11. 12:08); alles Headless der Scheibe steht seitdem „gehalten" auf alten SHAs.

## Was die Quelle sagt
Offen je Kriterium (Ist ↔ Soll, Grund):
| Id | geb. | fehlt |
|---|---|---|
| affekt.K2 | 1 | #2 ohne Station; #1 gehalten d3708675, letzte frische Messung eb3cc7f3 ROT „0 Züge aus rule:emotion:hope" (Sonne echt 12/15 ↔ starr 3) |
| affekt.K3 | 1 | #2 ohne Station (≥ 70 % Feuer unter Median, `_tickWorldRules` ≤ 0,2 ms, beide Geräte) |
| affekt.K4 | 0 | #1 frisch ROT 6aa7a5a6: 55 Zeilen, **6 falsch**, Klasse `wunsch` **0** („keine wirkende Tat von wunsch"); GRÜN zuletzt d3708675 (0 falsch, wunsch 24). #2 radeon/gtx ROT „ohne Modell (die KI der Sitzung ist aus)" (36f9d45a gtx, dc9eacb0 radeon) |
| mensch.K1 | 1 | #2 kein Werkzeug (`g2.js:6082`): Fahrt-Deckel; das Urteil las `z.voll`, die Linse liefert `stadt.ring` — gemessen 1 089 Bewohner, 149–150 nah, 67–70 im Gang (im Soll ≥ 200/≥ 40), Station liegt in w4-koord-sitzung bdc3c14a |
| mensch.K5 | 1 | #2 ohne Station (Gespräch mit echtem Anbieter, ≥ 2 Fakten in ≤ 3 s) |
| spielgang.K1 | 1 | #2 ohne Station (5/5 an beiden Geräten + Speicher-Rundlauf byte-gleich); #1 gehalten 5/5 headless |
| spielgang.K2 | 0 | keine Maschine (`g5.js:5822`: Blind-Spieler-Agent fehlt) |
| spielgang.K3 | 1 | #2 ohne Station (Text ≥ 16 px, Belegung frei); #1 radeon frisch ROT Menü 312/376 ms ↔ ≤ 200 (1cd1c408, 507beba6), gtx gehalten 80 ms |
| spielgang.K5 | 1 | #2 frisch ROT 6aa7a5a6: „de/en.regel + de/en.nexus nennt nicht den wahren Schreiber: nexus" und „Modell en fremd: (Grok's suggestion declined: The law of player_speed: 1.15–2.00, **jetzt** 2.00.)" |
| wetter.K4 | 1 | #2 kein Werkzeug (`g1.js:3810`, Fahrt-Deckel 03.11.); #1 gehalten Deckung 1, Fuß 0,204 m |

Die Wurzel (gelesen):
- Das Spiel trägt seit `347b34a1c` (w14-wunsch-akt, 06.11. 09:25) die Wünsche der Welt als LISTE `wetterWuensche` mit Welt-Uhr-Stempel
  (`stamm/bild-himmel.js:3062 _wunschAkt`, `:3086 _wunschDesZugs`); der Zug zieht sie in `stamm/dirigent-takt.js:1639 _wetterZugZiehen`
  und setzt den wahren Schreiber NUR mit dem Zug-Objekt (`bild-himmel.js:3030–3031`). Das alte Feld `wetterWunsch` hat in main 0 Leser
  (`git grep` origin/main: nur Kommentar `bild-himmel.js:3060`). Ancestry: 347b34a1c liegt NICHT in d3708675 (letztes GRÜN), aber in eb3cc7f3 (erstes ROT).
- Das Gesetzbuch KANN es: affekt.K2 echt Sonne 12/15 gegen starr 3 auch NACH dem Schnitt (eb3cc7f3) — die Welt konsumiert den Wunsch,
  nur die Stationen sehen ihn nicht. Die Stationen lesen `wetterWunsch` an 9 Zeilen (origin/punkte-maschine):
  `g2.js:951` (gemuetWetter, affekt.K2#1) · `g2.js:1184, 1204` (stimmeGang → Klasse `wunsch` `:1289`, affekt.K4#1) ·
  `g2.js:1362, 1368, 1372, 1385` (warumSzene, affekt.K4#2) · `g5.js:236` (kiSpracheLauf, spielgang.K5#2). Dazu rufen `g2.js:1371` und
  `g5.js:239` `_setWeather("rainy","auto-zug")` OHNE Zug-Objekt → Schreiber wird „front", nie „nexus".
- Zweiter Täter spielgang.K5#2: das Band des Leib-Gesetzes ist hartes Deutsch im Spiel: `stamm/feld-dsl.js:2434` („…, jetzt …"),
  `:2459` („Erde -9.81, jetzt"), `:2444`, `:2449`; es fließt über `feld-dsl.js:316` als `{band}` in `dsl.grund.gesetz`
  (`stamm/daten.js:2946`) in die EN-Absage. Seit d3708675 in jeder Messung dieselbe fremde Zeile.

## Die EINE begrenzende Entscheidung
Die Wetter-Wünsche der Welt werden in JEDER Station an der EINEN Quelle des Spiels gelesen (`wetterWuensche` + `wetterSchreiber` nach
`_wetterZugZiehen`) — das alte Feld `wetterWunsch` stirbt in der Punkte-Maschine ganz (Absenz 9 → 0); kein Soll, keine Schwelle bewegt.

## Der Schnitt
Stufen (eine Welle, zwei Commits — pm und Spiel):
1. pm: `g2.js:951` liest nach dem Zug `s.wetterSchreiber` statt `s.wetterWunsch.quelle`; `g2.js:1184/1204` tauschen das dritte Glied
   von `wetter()` gegen `(st.wetterWuensche||[]).length` und `w.wunsch` gegen „die Liste wuchs"; `g2.js:1366–1385` und `g5.js:233–239`
   leeren `wetterWuensche` und ziehen den Nexus-Fall mit `r._wetterZugZiehen(Math.floor(st.spielZeit/Z)+1)` statt des nackten „auto-zug".
2. Spiel: das Band in `feld-dsl.js:2429–2462` wird Tafel-Zeile (`dsl.band.leib` {min,max,jetzt}, `dsl.band.gravity`, Uhr, Jahreszeit)
   in DE und EN in `stamm/daten.js`; `feld-dsl.js:316` reicht die Zeile, nicht den String.
Leser-Liste VOR dem Schnitt: Spiel unverändert gelesen `bild-himmel.js:3002 _setWeather`, `:3062 _wunschAkt`, `dirigent-takt.js:1639`;
vom Band-Schnitt berührt `feld-dsl.js:316` (Absage), `feld-nexus.js:1069` und `:1161` (Prompt „Die Bänder jetzt:"), `daten.js:2946`;
Zählung `scripts/diag-sprache.cjs` (spielgang.K5#1 muss 0 hart halten).
Kosten-Zeile: 0 ms im Bild (nur Text im Absage-Pfad und Mess-Code); Ankunft unberührt.
Kriterien: affekt.K4 0 → 1 (#1 headless: wunsch 0 → > 0, falsch 6 → 0 erwartet — die falschen Zeilen tragen „dazu N weitere Tat",
die gezählte Folge ohne die Wunsch-Taten ist die wahrscheinliche Ursache, nicht bewiesen) · spielgang.K5 1 → 2 (#2 headless) ·
affekt.K2 hält 1 (sonst −1 an der nächsten Headless-Fahrt). Netto +2, −1 verhindert. Selbsttest: die Mutante „schreiber" bleibt ROT.

## Was schon liegt
- `origin/w14-wunsch-akt` (Spiel-Schnitt, gelandet) — ohne `-pm`-Zweig: die Stationen zogen nie nach.
- `origin/w8-sprache` + `-pm` (die K5#2-Station), `origin/w3s-stimme` + `-koord` (affekt.K4#1), `origin/affekt-emotion` (K2/K3).
- punkte-maschine Kopf 020fce1a2 (13.11. 21:32) trägt die 9 Zeilen unverändert. Bis zur Landung fehlt: der pm-Commit, der Band-Commit
  im Spiel, EINE Headless-Fahrt (affekt.K2#1, K4#1, spielgang.K5#2; ~45 min nach `minuten` 20+6+20) mit KI_ENDPUNKT der Farm.

## Ehrlich offen
- Nicht gelesen: warum die Headless-Farm seit 10.11. 12:08 keine Messung mehr schrieb; `w4-koord-sitzung bdc3c14a` (mensch.K1#2).
- Nicht bewiesen: dass die 6 falschen Zeilen von affekt.K4#1 allein am blinden Wunsch hängen (Zeitpunkt passt, Mechanik plausibel).
- affekt.K4#2 bleibt ROT auch nach dem Schnitt: die GPU-Sitzung trägt kein Modell (die Werkbank müsste ollama am Gerät stellen).
- spielgang.K3#2, spielgang.K1#2, affekt.K2#2, affekt.K3#2, mensch.K5#2: keine Station; spielgang.K2 ohne Maschine. 7 der 12 offenen
  Punkte kann keine Messung buchen. Radeon Menü-INP 312–376 ms ROT blockiert spielgang.K3#2 zusätzlich.
- Widerspruch: kurs-B nennt mensch.K4 0/2; stand.json am ec281422 trägt 2.

## Rang
Wirkung 3 (Takt: +2 Punkte, −1 verhindert, kein Bild) · Aufwand S (9 Zeilen pm + eine Tafel-Zeile je Band) · Risiko: die erste frische
Headless-Fahrt misst ALLE gehaltenen Stationen der Scheibe neu und kann weitere ROT aufdecken, die heute nur die Ratsche verdeckt.
Fünf Punkte der Scheibe, die ein Bild-Schnitt am Dorf der Ankunft nebenbei kippt:
1. mensch.K1#1 (gehalten, radeon) — Kleid-Schnitt `w28-leib-nah` ändert `koerper-core.js` → R6 Konsum, neu gemessen am Dorfplatz 8 Uhr.
2. mensch.K5#1 (gehalten) — Kopf-Zuwendung wird am Kopf-Knoten im Bild gelesen; derselbe Kleid-Schnitt misst sie neu.
3. mensch.K1#2 (+1) — die Stadt am Platz der Ankunft (F, `w28-stadt-grammatik`) macht „Stadt ≥ 200, ≥ 40 nah" am Spielort messbar.
4. spielgang.K3#1 radeon (Menü-INP 312 ms) — jeder Bild-Schnitt mit Mehrkosten am Radeon-Frame hält sie ROT; ohne Kosten bleibt gtx-GRÜN.
5. wetter.K4#2 (+1) — „Kante im Boden-Stoff" (`w28-weg-koerper`) teilt den Stoff mit der Schnee-Decke; die Spur im Schnee braucht ihn.
