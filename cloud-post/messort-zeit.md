# Vorprüfung messort-zeit — eine Szene ist ein Messort mit Ort, Zeit und Wetter, mit EINEM Leser

ZWISCHENSTAND · Karte 2 gebucht 105 von 1 718 (diese Abgabe bucht keine Sprosse; sie baut den Messort, an dem Sprossen messen).

**Geschnitten.** Ein Messort trägt `zeit { uhr, tag, wetter, wort }`, und `werkbank umstellen --ort` ist ihr einziger Leser: er
spricht sie mit den Worten des Spielers, prüft, was die Welt nahm, und wartet nach dem Sprung der Uhr auf das Licht des Orts. Dazu
zwei neue Orte als Funktion des Gelände-Kerns mit Beleg (Höhe, Spiegel, Abstand): `kueste` und `ufer`.
**Gemessen.** __GEMESSEN__
**Ehrlich offen.** __OFFEN__

## Schnitt 1 — die Zeit des Orts, EIN Leser

- `spec/profiband/haushalt.json`: das Feld `zeit` (additiv) an `kueste` und `ufer`; die neun bestehenden Orte tragen keins und
  laufen wie zuvor.
- `scripts/lib/band-urteil.cjs` `ortZeitWorte(zeit)`: aus der Zeit die Worte des Spielers — `setze uhrzeit <uhr>`, `setze wetter
  <wetter>`, das freie `wort` — und für den Tag der Welt-Akt `set_season`. Einen Chat-Satz für die Jahreszeit kennt der Parser
  nicht; der Akt ist das Programm, das die Welt-KI zum Wort „fruehling“ schreibt (offen unten).
- `scripts/werkbank.cjs` `umstellen --ort`: jeder Satz geht durch `parseChatToDsl` (kein Satz → laut ROT), dann durch
  `processChatCommand` (Quelle „human“), der Akt durch `dslRun`. Der Halt der Messung weicht nur für diese Worte, der Übergang des
  Wetters fällt. Dann prüft der Leser die Welt, nie die Worte: Uhr, Wetter und Saison gegen den Ort, sonst bricht er mit Log. Die
  Bühne hält, was die Welt nahm (`window.__ortZeit`, `scripts/lib/ausgabe-aufnahme.cjs` `buehne`), in jedem Takt und Bild; nach dem
  Sprung der Uhr ist der Himmel der neuen Stunde frisch (`_himmelFrisch`), und das Einschwingen wartet auf das Licht des Orts.
- `/bild` urteilt den Inhalt an der Uhr, die die Bühne hält (`AA.inhaltUrteil(…, uhr)`): ein Abend-Bild wird nicht am Mittag
  gerichtet.
- Die Ausgabe von `umstellen` trägt die Zeit des Orts unter `ortZeit` (wie `__ortZeit`). Unter `zeit` brach der erste Lauf an
  `ufer` nach 869 s am Ende mit TypeError ab: das Ende jedes Befehls liest `zeit.rot` als Urteil der Böe (`bild --zeit`), und die
  Ausgabe ging verloren. `befehlUrteil` nennt eine Ausgabe mit `zeit` ohne `rot` ROT beim Namen und druckt sie; die Täter-Zeile
  steht im Selbsttest von `werkbank bild` (in check:statik), das Ende von main stürzt an ihr mit Exit 2.
- Die Linse (Familie gate:profiband, kein neues Gate): H17 liest die Worte jedes Orts mit dem Parser des Stamms. Täter-Zeile S23z
  im Selbsttest: ein Messort mit `zeit.uhr`, den `umstellen --ort` nicht stellt (ohne Uhr-Satz) → ROT.

## Schnitt 2 — Küste und Flussufer aus dem Gelände-Kern

Der Beleg ist EINE Funktion mit zwei Wirten (`scripts/lib/welt-orte.cjs` `belegMessen`, `belegUrteil`): längs des Blicks das
erste nasse Stück (`_nassAt`, Schritt 0,25 m), dort der Spiegel des Körpers (`_koerperWasser`), die Art des Wassers (Fluss, wenn
der Spiegel des Flusses ihn trägt, Meer auf dem Meeresspiegel, sonst See), der Hang vom Spieler zum Wasser, die Breite des
Flusses (`_hydroDistAt`) und die Äsung am Ort (`_kreaturNahrung`). gate:profiband H1 misst die Zahlen am Gesetz, `umstellen --ort`
die Art in der Welt (die Welt trägt den Pegel, der die Flüsse hebt; die Zahl ist Gesetz, die Art ist Welt).

| Ort | Spieler | Blick | Höhe | Wasser | Spiegel | Abstand | Hang | Breite | Äsung | Zeit |
|---|---|---|---|---|---|---|---|---|---|---|
| kueste | 859,3 / 10 430,3 | 1 141 / 10 480 | −2,45 m | Meer | −3,00 m | 35 m | 0,90° | — | 0,851 | 0,7 · herbst · bewoelkt |
| ufer | −118 / −838 | −91,8 / −809 | 22,23 m | Fluss | 21,96 m | 4,75 m | 3,29° | 8,65 m | 0,799 | 0,35 · fruehling · sonne |

- **kueste.** 10,5 km vom Ursprung: von 120 Strahlen aus dem Ursprung trägt Strahl 87 das breiteste Watt; in seiner Umgebung
  (±1,5 km, Raster 25 m) die Stelle 0,2–0,8 m über dem Meer, ohne Fluss am Ort, mit dem Meer als erstem Wasser in 30–120 m und
  dem breitesten Watt längs des Blicks (476 m zwischen +1,5 m und −1,5 m um den Spiegel, 0,36°). Der Hang des Belegs (0,90°) hält
  die Klasse „flach“ 0–2° der Kartierung des Harle-Seegatts (Mascioli et al. 2023, Journal of Maps 19,
  https://doi.org/10.1080/17445647.2022.2154175); `hangMax` 2 ist diese Klasse.
- **ufer.** In der Heim-Region die offene Bank am Fluss (`flussRand` 4,3 m halbe Breite): Wiesen-Probe ohne Krone im Ring,
  Waldrand im Kranz, 0,27 m über dem Ruhe-Spiegel, das Wasser 4,75 m vor dem Spieler, der Blick quer zum Gegenufer.
  `aesungMin` 0,5 ist die Hälfte des vollen Lebens des Felds.
- **Der Täter, den der Wirt verbarg.** Die erste Küste (1 191,1 / 9 928,8) hielt am Gesetz, und die Welt stellte den Spieler in
  eine Mündung: „Küste 1191.1/9928.8: längs des Blicks steht kein Meer (fluss bei 0 m)“. Der Wirt rechnete nur die Hydrosphäre
  der Heimat; 10 km fern las er den Meeresspiegel, die Welt dort ihre Kachel mit dem Fluss. Wurzel: `wirtAmGesetz(root, true)`
  rechnet die Kacheln um den Ort wie der Faden (`wasserUm`: Teilung wie `_ensureHydroTilesAround`, `hydroComputing` wie
  `hydroRegion`). Linse S20c (gate:profiband): die Mündung → ROT „kein Meer (fluss bei 0 m)“, und der Wirt ohne Kachel liest dort
  „meer“ — der Täter beim Namen. Weiter in S20c: Höhe +1 m → ROT mit Zahl, ein Blick ohne Wasser → ROT, Art `ufer` am Meer → ROT,
  `quelle` fehlt → ROT.
- **Das Meer im Bild des Wassers.** Die neue Küste hielt am Gesetz, und die Welt nannte das Wasser in 35 m „see“ (nach 1 214 s):
  dort liest der Spiegel des Körpers den Automaten (`_wasserBildAt`), und das Meer steht bei −2,9999999999999996, der Wirt ohne
  Chunks liest den Atlas, genau −3. Die Art fragte nach Gleichheit. Wurzel: `belegMessen` urteilt Meer wie Fluss auf 1 cm. Linse
  S20c: der Wirt im Bild des Wassers (−3 + 4e‑16) hält, die Art auf Gleichheit (der Stand davor) nennt dort „see“ → ROT.

__BILDER__

## Die neun bestehenden Orte — `umstellen --ort wiese` vorher ↔ nachher

Gleiche Werkbank (swiftshader, chrome-headless-shell 148), gleicher Befehl, vorher auf main 78ed3167, nachher auf dem Kopf. Die
Ausgabe trägt in beiden Läufen dieselben 15 Schlüssel; 13 sind byte-gleich (sha256 der Ausgabe ohne die zwei Zeit-Felder: d6e3923cd73e
↔ d6e3923cd73e) — Spieler −280,4 / −1045,6, Blick, die ganze Wiesen-Messung (y 27,48 · Hang 1,81° · Krone 0,043 · 4 Bäume · Kranz
0,428 · Horizont 2,6° · Gras 1), 25 Chunks, Gier −1,9717, keine Zeit, kein Beleg. Verschieden sind nur die zwei Felder, die die
Wanduhr zählen: `ms` 916 620 ↔ 1 290 364 und `takte` 440 ↔ 499 (Takte bis Ring und Welt stehen; im Nachher-Lauf lief zu Beginn
37 s lang gate:altlasten auf denselben vier Kernen). Die Lage und das Verhalten des Orts sind gleich; die Ausgabe als Ganzes ist es
nicht, weil sie die Zeit des Laufs mitschreibt.

## Schnitt 3 — Kandidat `quelle` an den Soll-Zeilen der Stationen (nur Vorschlag; die Stationen im Zweig `punkte-maschine` blieben unberührt)

**Befund.** Die 36 Stationen in `meisterkarte-quelle/punkte/stationen/` tragen im Text 1 221 Soll-Zeilen (`{ wort, richtung,
wert, wortlaut, feld }`), keine trägt eine Quelle; 99 messen laut Wortlaut „gegen“ ein Gegenüber, darunter Peterson-Barney,
Koschmieder, Walker's Law, DMSP/VIIRS und Seshat. Wer die Zahl prüfen will, findet sie heute nur im Kopf des Autors.

**Der Kandidat.** Ein Feld `quelle: "Autor Jahr URL"` an der Soll-Zeile, deren Zahl von außen kommt — ein String, drei Teile, die
URL zuletzt (DOI bevorzugt). Beispiel an `formant_abweichung_pct` (k2-erleben):

```js
{ wort: "formant_abweichung_pct", richtung: "≤", wert: 15,
  wortlaut: "F0 und Formanten am Abgriff gegen Peterson-Barney-Tafel ±15 % nach Leibmaßen", feld: "richter",
  quelle: "Peterson Barney 1952 https://doi.org/10.1121/1.1906875" }
```

und hier am Messort selbst getragen (`beleg.quelle` der Küste): „Mascioli et al. 2023 https://doi.org/10.1080/17445647.2022.2154175“.
Der Leser wäre der Richter der Station (er druckt die Quelle neben dem Preis); die Wand wäre eine Zeile in der bestehenden Familie
der Stationen: eine Soll-Zeile, deren Wortlaut „gegen <Name>“ sagt, ohne `quelle` → ROT. Ob und wo — das setzt der Koordinator.

## Ehrlich offen

__OFFEN_LISTE__
