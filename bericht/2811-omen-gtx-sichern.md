# OMEN (GTX 1060) — Stand beim Sichern, 28.11. 09:55

Grund: der Koordinator meldete um 09:45 „SICHERN“, sein Wochen-Budget ist am Ende. Nichts misst mehr. Die Hand-Reihe (`p3/n2411/wechsel/reihe.sh`) ist seit 08:20 leer und hat sich beendet („leer seit 3600 s“). Danach habe ich keinen Lauf mehr begonnen.
Alle Hand-Läufe liefen über `grenze.sh`-Slots mit 1200 s und `vr2.cjs` (Lauf a = die Station, wie sie gesetzt ist).

## Geschoben (Richter GRÜN + Preis GRÜN, Kopf auf der main-Linie)

- **extreme#1, #2, #3** am main `bbb97563`, pm-Stand `1541e944`. Akte geschoben auf **punkte-maschine `9a128151`**.
  - Wortlaut der Akte: „Richter GRÜN · Preis GRÜN: p95 24.86 ms · max 25.29 ms · Heap 249.6 MB gehalten (Spitze 281.8) · VRAM 128.6 MB gehalten (Spitze 128.7) · 608 Bilder · Referenz f 1.136 · Einlauf 43.5 s (Lesewert): p95 25.07 ms, max 216.74 ms · der Lauf selbst p95 24.94 ms (1278 Bilder)“
  - Station #1: „GRÜN karte2.planet.wetter.extreme#1 · S1 regenMaxMm 117,8 mm gegen Soll ≥ 100 mm ✓ · ueberAueM 0,3 m gegen Soll > 0 m ✓ · … Bild (Beleg) fehlt (/bild: … ABNAHME ROT [kein nahWiese im Bild: 0.0 % < 15.0 %]) · Sitzung · Exit 0 · 1.44 min“
  - Station #2: „GRÜN … S2 dauerTage 6,9 gegen Soll 6 ± 50 % ✓ · amplitudeK 6,517 gegen Soll 5 ± 50 % ✓“
  - Station #3: „GRÜN … S3 faktor 1,709 gegen Soll ≤ 2 ✓ · Zeuge: die Jahresmaxima der Welt streuen (Gumbel über 100 Spieljahre)“
  - Der Slot lief 318 s.

## Gefahren, nicht geschoben (wörtlich)

### platten#1
- Lauf am main `bbb97563`, pm `9834d6fd`. Dieser pm-Stand trägt `8c0ec40d`, aber **noch nicht** den Lebenszeichen-Schnitt `e20826e1`. Exit 0 nach 476 s.
- Richter-Zeile wörtlich: „ROT  karte2.planet.geologie.platten#1 · S1 saaten 30 gegen Soll ≥ 30 ✓ · achseP30 4,386 gegen Soll ≥ 4 ✓ · guertelProzent 74,287 % gegen Soll ≥ 70 % ✓ · auge: Pose {"px":0,"py":1800,"pz":2600,"lx":0,"ly":0,"lz":-2600} · Vorbild Schummerung einer realen Gebirgsregion 10⁴ km² (Copernicus DEM), Blindpaar R11 · Bild fehlt (kein Bild im Deckel der Leiter) — R11 Prüfer („Blindpaar Schummerung gegen reale Region“): das Urteil spricht der Blind-Prüfer, die Station behauptet kein GRÜN · gemessen vor dem Abbruch: Deckel 327 s gerissen: Stille seit 138.6 s nach 327 s (kein Lebenszeichen: keine Zeile der Probe, kein Bild der Welt) · Sitzung · Exit 1 · 5.45 min“
- „KARTE2 keine Akte planet.geologie.platten S 1 …: der Richter fehlt in der Station: R11 Prüfer …“
- Die bestellten Zusatzwerte (Zeuge der Station): saaten 30 · antworten 45164 · **abgebrochen 0** · **achseKovP30 1,715** · achseMedian 6,796 · guertelKovProzent 5,745 · bergZellen 32777 · komponenten 120 · gedeckelt 21 · laengsteKm 8800,975 · breiteKmP50 704,607 / P80 1051,426.
- Die Uhr bis Ende Teil B und Teil E steht in der Akte nicht als eigenes Feld; ich habe sie nicht gefunden. Der Deckel riss 138,6 s Stille vor dem Ende (327 s), am Stand ohne `e20826e1`.

### z819 (masse#1 + stoerung#3)
- Lauf am main `bbb97563`, pm `993fca1f` (trägt `8c0ec40d` und `e20826e1`).
- Der Slot endete mit **exit 124 nach 1201 s** und hat nichts geschoben. Lauf b fiel weg, weil Lauf a ans Slot-Ende lief.
- masse#1: „ROT  karte2.leben.tiere.masse#1 · (a)–(d) auf der Karte GRÜN: Kohäsion 1 / 1, Φ 0.998 über 570 Takte, letzter Flüchter 0.32 s (4 aus zweiter Hand), Fluchtweg 31 m, ID 600 s hält (Flucht 5 / 4 s) · Bild-Serie „Herde am Hang“ ROT am Hang 21.2° -550.6/-889.6, Flucht bei 11.1 m: 43 m 5/5 fliehen, 5 sichtbar, 2 Fleck(en) (149 px) · 46.3 m 5/5 fliehen, 5 sichtbar, 1 Fleck(en) (287 px) · 50 m 5/5 fliehen, 5 sichtbar, 1 Fleck(en) (310 px) · Glieder im Pulk je Schuss 5/5/5 (Umfang ≥ 10) · [linse-gpu] nvidia/pascal · Sitzung · Exit 0 · 1.25 min“
- masse#1, Preis: „KARTE2 Akte leben.tiere.masse.1.bbb97563-gtx.json: Richter ROT · Preis GRÜN: p95 26.38 ms · max 41.65 ms · Heap 324.8 MB gehalten (Spitze 349.3) · VRAM 144 MB gehalten (Spitze 144) · 530 Bilder · Referenz f 1.181 · Einlauf 41.3 s (Lesewert): p95 33.39 ms, max 357.59 ms · der Lauf selbst p95 25.39 ms (894 Bilder)“
  - Lesart: das ist dieselbe Klasse wie an der Radeon (ROT bei Preis GRÜN). Es liegt am Gesetz: im Pulk stehen je Schuss 5 Glieder, verlangt sind ≥ 10. Die Herde zählt 5 Tiere.
- stoerung#3 hat **kein Urteil**.
  - Die Welt stand vor der Probe nach 16,4 s.
  - Die Probe lief von ≈ 05:40 bis zum Slot-Ende 05:56, also ≈ 16 min, lebendig und ohne Zeile. Heap 495–633 MB, Spitze 918,7 MB bei 284 s, die Chunks blieben bei 90.
  - Teilbefund liegt in `n0611-pm/meisterkarte-quelle/punkte/messung/roh/bbb97563-gtx/` (`stoerung_3.json.rumpf.json`, `konsum/22480.offen`, Sitzung `sitzung-20261128-053639`).
  - Für den Nächsten: stoerung#3 braucht einen **eigenen** Slot. Mit masse#1 zusammen passt sie nicht in 1200 s; ihr Deckel ist zu klären.

### kunst#1, Fächer für den Prüfer (kunstp2, kunstp3, kunstp4)
- Gefahren am Kopf `b56b51f0`. Spiel-Baum `n1911-los`, DETACHED auf `b56b51f0`. Ort stadt-voll.
- Bilder: 15 nach kunstp2 (1050 s), 30 nach kunstp3 (989 s), **40 nach kunstp4** (780 s).
- Stand: **40 Bilder mit Motiv, 4 Posen ohne Motiv, 44 Posen** (22 Meister, 22 Anfänger). Die letzten 4 Posen liefern kein Bild; jedes weitere `schiesse` kehrt sofort zurück.
- Ablage: `scratchpad/sk/pk5/aus/mensch.sport.kunst.1-b1/` (`faecher.json`, `bild/`, `akte/`).
- **Der Prüfer ist NICHT gefahren.** MIN_PAARE 40 ist genau erreicht.
- Ablauf für den Nächsten, ohne GPU:
  1. `paare.cjs` mit ordnen → klasseBlatt und `--sha b56b51f0`.
  2. Je Teil ein Haiku-Agent, effort low, mit dem eingefrorenen `pruefer-auftrag.md`. Der Bauer darf nicht der Prüfer sein.
  3. `pruefer.cjs urteil` mit der Eichung `ordnen.klasse.claude-haiku-5-5-low.d568b019`.
  4. Erst bei Klasse P (≥ 80 %): **genau eine** Fahrt kunst#1 `--akte` am **b56b51f0** (Befehl des Koordinators von 03:01). Liegt das Ergebnis darunter, gehen die verwechselten Paare wörtlich an den Koordinator, ohne Preis-Fahrt.
- Stoppuhr je Bild an stadt-voll an der 1060: ≈ 35–70 s. Dazu kam ein /bild-Hänger von 90 s (kunstp2).

### Früher in der Nacht (schon gemeldet, hier nur zur Vollständigkeit)
- **frontv** am `b56b51f0`:
  - rolle#2, mikroben#4 und innenleben#2 sind Richter ROT am Gesetz, Preis GRÜN.
  - grossform#1 schnitt das Slot-Ende ab (exit 124).
  - Die drei ROT sind laut Koordinator Arbeit für die Macher, nicht für die Messung; nicht wiederholen.
- **grossf** am `b56b51f0`: grossform#1 UNGEMESSEN, „Deckel 355 s gerissen: Stille seit 354.9 s“, 4958 m Reise (Ring 4 → -1). Daraus kam der Lebenszeichen-Schnitt `e20826e1`.
- **nan3** am `896eb419`: muster#1, fremde-physik#1 und erbe#2. Die NaN ist fort; alle drei sind Richter ROT am Gesetz, Preis GRÜN p95 25,06 ms.

## Offen (nicht gefahren)

1. **grossform#1 `--akte`** und **boden#1 OHNE Akte**, beide am main `bbb97563` (oder dem dann gültigen main) mit pm ≥ `e20826e1`.
   - Bestellt um 05:03 „nach platten“. Die Bestellung kam während platten; ich habe die zwei Slots danach **nicht mehr eingereiht**. Das ist mein Versäumnis, sie sind nie gefahren.
   - Sie brauchen zwei getrennte Slots, weil `--akte` für alle Stationen eines `vr2`-Aufrufs gilt.
   - Erwartet laut Koordinator: das Urteil („Orte 20 … k/20“) oder „Deckel N s gerissen (mit Lebenszeichen)“. Fällt grossform#1 weiter an der Stille, dann vor dem ersten Ort: letzte Zeile und Sekunde melden.
   - Der Korpus-Abruf für boden#1 (`hole.cjs`, Wikimedia) wartet auf das Wort des Schöpfers.
2. **Prüfer kunst#1**, danach höchstens eine Fahrt kunst#1 `--akte` am `b56b51f0` (siehe oben).
3. **zyklus**: lebenszyklus#2 am `896eb419`, ohne Akte. Gemeldet werden nur `jungProzent` und „n Tiere des Bestands“. Klasse P: ohne Prüfer-Akte hebt die Fahrt nichts.
4. **bedarf1**: bau.bedarf#1 am `88bc3c51`, Vorprüfung, nichts schieben.
5. **stoerung#3** allein (siehe oben). Der alte Slot „stoerung3“ am `0d0e4c05` ist gestrichen, weil pegel 4 im main liegt.
6. In `reihe.txt` stehen zyklus und bedarf1 als „# HALT-PRUEFER“. Neu starten mit `cd p3/n2411/wechsel; bash reihe.sh > reihe.out 2>&1` (im Hintergrund). Die Zeilen sollten an den dann gültigen main.

## Hinweise für den nächsten Koordinator
- Slots: höchstens 3 Sprossen an stadt-voll je 1200 s. Wenn Lauf a ans Slot-Ende läuft, gehen **alle** Akten des Aufrufs verloren (frontv, z819). Lange Proben wie stoerung#3, grossform#1 und kunstp fahren besser allein.
- `vr2 --akte` schiebt nur Akten mit Richter GRÜN. Akten an UNGELANDETEN Köpfen werden nur gemeldet.
- Im Mess-Baum `n0611-pm` liegen geänderte und gelöschte Dateien aus fremden Läufen, z. B. `messung/referenz-gtx.json` M und `roh/e80f9c5d-gtx/*` D. `holeStand` von `vr2` räumt beim nächsten Lauf auf. Ich habe außerhalb der Slots nichts angefasst.
