# 64 Die Lücke zur Ziellinie v1.0 und zur Vision: zehn Lücken zwischen dem EINEN gespielten Pfad und dem Spiel von heute

Kürzel: SPIEL = `.claude/worktrees/leib-kanon-urteil` (main ec281422) · KO = `.claude/worktrees/koord-hebel` · PM = `w3/pm/meisterkarte-quelle/punkte` ·
BILD = Scratchpad der Sitzung. Die Ziellinie steht in SPIEL `docs/roadmap.md:13-34` (fünf Schritte und der FPS-Boden), der Scope in `docs/PFLICHT-OFFEN.md:16-20` (A B C E F).

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- **Ankunft am Rondell** (`KO/probe-post/w28-platte-fein/02c27132-genesis-0.5.png`, Mittag): ein graues Pflaster fast über die halbe Bildhöhe. Der
  Bogenverband verschwimmt ab 5 m zu Rauschen. Vier Tore: die Steinbögen sind fleckig grau-weiß, der rechte Bogen hat ausgebrochene Platten und Lücken.
  In den Rasen-Keilen stehen gelb-grüne Zacken. Dahinter steht eine dunkle Laubwand, darüber ein schieferblauer Himmel mit weißen Wolken. Es gibt
  **kein Lebewesen** im Bild, kein Dorf, keine Zone. Das ist Gesetz: `kegelM: 150` / `residentM: 210` (SPIEL `fachwerk-core.js:9707`).
- **Dorf am Weg k 5** (`BILD/dorf-main-0.5.png` = `BILD/genom-spiel/gruppe.png`): Der Himmel ist über die ganze Breite dunkel-marine, auch am Horizont.
  Der Boden ist ein brauner gesprenkelter Teppich mit violetten Schlieren statt Wegen, ohne Kante. Das Haus ist ein glatter weißer Kasten mit
  aufgemalten Fenstern. Die Bewohner haben einen Ballon-Oberkörper und stehen barfuß. Am Hang liegen große flache Wiesen-Zacken.
- Von Werkstatt, KI-Satz, Tor-Durchgang, Teilen und der Fahrt habe ich **kein Bild gesehen**. Was der Spieler dort erlebt, steht unten nur als Zahl.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
Ohne Messung gilt die **Mechanik aller fünf Schritte als „gehalten“**: `spielgang.K1#1` 5/5 in EINER Sitzung, 93 Eingaben, „ankommen Kontrolle 822 ms“
(PM `stand.json:3567-3579`, an d3708675, **headless am Null-Renderer**, PM `stationen/g5.js:422-439`). Die Spur kennt keinen Schritt „teilen“: die Halte-Tafel
endet bei `benutzen` (`g5.js:509-515`). Am echten Gerät dauert derselbe Schritt „ankommen“ dagegen 12–22 s. Die Lücke liegt im **Bild und im Takt**, nicht in der Mechanik.
Die zehn Lücken, geordnet nach Fläche im ersten Bild × Häufigkeit im Pfad:

| # | v1-Schritt | Lücke (Ist ↔ Soll, Quelle) | Gesetzbuch KANN ↔ Welt KONSUMIERT |
|---|---|---|---|
| 1 | 2 sehen | Der Himmel am Mittag ist 1,5–2 Blenden zu dunkel (Auge). Die Leuchtdichte der Kuppel hat kein Soll (Blatt 15). | `ATMO_GESETZ` (`foundry-core.js:283-307`) → `himmelFarbe` (`welt-licht.js:565`). Die Bestrahlung ist GRÜN, das Pixel nicht. Kein Arbeiter (UEBERGABE:35, :61). |
| 2 | 1+2 | Pflaster und Boden: Rauschen ab 5 m, brauner Teppich, Wege ohne Kante | Das Bordstein-Gesetz liegt nur im Labor `worlds/fachwerk/fachwerk.js:300-312`. Der Maler ist `stamm/siedlung-wege.js` `_wegeKarteMale` (UEBERGABE:40). |
| 3 | 2 | Mensch: Ballon, Kleid gerissen, scheint zu schweben | Das Kleid ist eine Voxel-Hülle (`koerper-core.js:254`, `foundry-core.js` `backeHuelle`). Der Bau aus dem Genom (z426) ist unter dem Kleid nicht zu sehen (UEBERGABE:31). |
| 4 | 2 | Häuser sind Kästen ohne Stoff. Studio↔Welt 0/7, Bild-Differenz 23,9–46,1 % ↔ ≤ 2,1 % (`studios.K4`, kurs-B:151) | Das Fachwerk-Labor zeigt Ziegel, Balken und Pfannen, die Welt zeigt sie nicht (UEBERGABE:32, :36). |
| 5 | 2 | Wiese: flache Zacken. `vegetation.K1` −16,9/−18,3 % ↔ ≤ 15 % (kurs-B:124) | `w28-wiese-fern` reißt in Ego 37,5 → 45,3 ms (UEBERGABE:43) |
| 6 | 1 | Ankunft kalt: GTX 1060 12,03 s ↔ 10, Radeon 12,95 s ↔ 5, GTX 1050 22,1 s (Blatt 33, kurs-B:141) | 43 Pipelines und 1,99 MB Programm-Text vor dem Bild. Die Probe zählt den Text, nennt kalt aber nur die Anzahl (`scripts/diag-boot-stage.cjs:204`). |
| 7 | 3+4 | Das gesetzte Werk steht 1–5 s im Datum, aber nicht im Bild. `bauen.K1#2` hotbar kalt 4631 / warm 1826 ↔ ≤ 1000 ms (Blatt 31) | EINE Frist `_bauFrist` (`stamm/dirigent-takt.js:1847`, `BAU_FRIST_MS = 6` :2455). Sie kennt Vortritt nur aus dem Hunger, nie aus dem Akt. Den KI-Satz mit Schlüssel (Drehbuch 18, `docs/abnahme-drehbuch.md:30`) hat nie jemand gefahren. |
| 8 | 5 | Tor: in Third 3 Welt-Wechsel statt 1, eine Schwarz-Tafel 2,9–9,7 s mit Luma 0,002–0,043 (Blatt 32, `tore.K1` 0/2) | Ein frisches Tor ist sofort scharf (`stamm/siedlung-tor.js:610` `armed: true`). Das Gesetz „nur von außen“ steht nur in der Probe (`g5.js:941`). |
| 9 | Boden | FPS-Boden E: seit dem 18.10. gibt es keine gültige Zahl, die Karte steht bei 0/8 (Blatt 40) | Die Gang-Probe ruft `/band` mit `capMs 8000` (`g6.js:1366`) gegen den Werkbank-Deckel 240 s. Darum schwingt kein Band ein. |
| 10 | Vision/F/C | Die Breite fehlt im Spielpfad: Arena-Leser in `stamm/` = 0, Strecke 0, Kind 0, Wagen am Dorf 0. Das Feld ist nur headless (affekt/feld) | `ARENA_HOF` (`schmiede-core.js:4691`) wird nur vom Labor gelesen. Der Plan sagt „bleibt Fläche“ (`fachwerk-core.js:9653`) = Sage a, tue b (Blatt 29). C: der Richter fehlt, die Mechanik fährt (Blatt 21). |

## Die EINE begrenzende Entscheidung
**v1 schließt am ERSTEN BILD und am ERSTEN AKT, nicht an der Breite.** Die Reihenfolge der Schnitte richtet sich nach der Fläche im Ankunftsbild und nach der
Häufigkeit im Pfad (Lücken 1–8). Keine neue Zone (Strecke, Kind, Silhouette) und keine eigene 5-s-Jagd beginnt, bevor der Himmel und das Werk des Willens
gelandet sind. Lücke 6 (B) läuft nur als Kosten-Zeile in jeder Abgabe mit. Lücken 9 und 10 sind Richter bzw. Haken: sie laufen nur, wo sie 0 Spiel-Byte
bzw. Aufwand S kosten. Das schreibt nur den Kurs vom 13.11. (UEBERGABE:18-24) auf die Ziellinie um. Kein Soll und keine Schwelle bewegen sich.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
Diese Welle trägt EINEN Schnitt ohne Arbeiter: **der sichtbare Himmel als EINE Klasse** (Lücke 1, Wirkung 5, kein Zweig).
- **Stufen:**
  1. Kuppel der Welt am Dorf und am Rondell, angesehen aus Auge, Hügel und Dach.
  2. Die Himmels-Tafel, die Glas, Lack und Wasser spiegeln (`welt-licht.js:952-970`). Sie folgt von selbst.
  3. Der Grund der Studio-Bühne (`welt-licht.js:1053ff`). Er ist heute schwarz (`BILD/studio-welt/`, Blatt 15:9).
  4. Die Dämmerung 0,27 und 0,05 wird nur angesehen.
- **Vor dem Schnitt der Spike** (EINE warme Welt, bestehende `werkbank licht`): Texel × `U.licht` × `toenung` × Belichtung gegen das Pixel. Der Fall
  entscheidet den Ort: entweder `marsch` (`welt-licht.js:467-537`) oder ein Faktor auf dem Weg der Kuppel (`bild-himmel.js:249`, `fogNode` :2338-2343).
  E0 wird nie angefasst (Blatt 15:58-66).
- **Leser-Liste:**
  - Kuppel `bild-himmel.js:249`
  - Luft `bild-himmel.js:2307/2340` (Dunst der Ferne, `gate:luft-tiefe:echt`)
  - Umgebung/PMREM `welt-licht.js:571, 832-837`
  - Bestrahlungs-Tafel `:579-603` → Belichtung `:667`
  - Wasser `stamm/wasser-hydro.js:820`
  - Himmels-Summe der Ankunft `stamm/dirigent-ankunft.js:1630`
  - Bühne `welt-licht.js:1053ff`
  - `welt-licht.js` ist ein Kern: additiv oder Byte-Beweis.
- **Kosten-Zeile:** 0 ms je Bild, kein neuer Pass. Die Tafel zeichnet nur bei Änderung neu (`bild-himmel.js:1610-1635`). B ±0 Programme.
- **Kriterien:**
  - `licht.K2` 1/2, Verhältnis 5,27/5,46 im Band 5–12,5, ist die **Leitplanke**: es bleibt GRÜN (Station licht.K2#1/#2).
  - `licht.K1` Karte Luma 126 bleibt.
  - Die Leuchtdichte der Kuppel trägt kein Kriterium. Beweis ist das Bildpaar Dorf + Rondell vorher↔nachher an fester Kamera, Uhr 0,5.
- **Die beiden folgenden Schnitte** (je eine Klasse, Briefe aus den Blättern 31 und 32, nicht hier ausgeschrieben):
  - Der Vortritt des Willens in `_bauFrist` (`dirigent-takt.js:1847`; Satz `siedlung-satz.js:133`, Knoten `bild-kosten.js:745/876`, Vorbau `siedlung-bauten.js:1386`).
    Kriterium `bauen.K1#2`, Kosten je Takt unverändert 6 + 3 ms.
  - Der Tor-Durchgang: `siedlung-tor.js:610` unbewaffnet geboren, und `speicher-laden.js:1240-1245` hält das letzte Bild statt der Tafel.
    Kriterium `tore.K1`, erwartet 0 Punkte: das ist Erlebnis, keine Buchung.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- **Himmel:** kein Zweig. `w27-ferne-ton-5` 80bcd308 berührt `fogNode` (nicht gelesen, ob er die Helligkeit ändert). Es fehlen Spike, Schnitt und Bildpaar.
- **Lücken 2–5 sind besetzt (WIP):**
  - `w28-weg-koerper` b1ffbea3
  - `w28-leib-nah` ace30e73 (GTX 1050)
  - OMEN-Kette `w28-mp-boden` f97fe692 → `w28-stadt-grammatik` 156cc903 → `w28-fassade` b038852b / `w28-stoff-fuge` 212b6de9
  - `w28-wiese-fern` 476a3ed9 (UEBERGABE:66-73, :87)
- **Lücke 7:** kein Zweig. Lücke 8: `origin/w16-tor-durchgang` d4aef5b5 trägt beide Klassen, an der Radeon gemessen (Luma 0,043 → 0,382,
  t Median 9,2 → 4,0 s). Er liegt 1600 Commits hinter main: neu schneiden aus dem Rumpf, nicht mergen (Blatt 32:68-73).
- **Lücke 9:** kein Zweig. Eine Probe in PM `g6.js`, drei Haushalt-Regeln (Blatt 40). Lücke 10: Arena-Haken ohne Zweig, Aufwand S (Blatt 29).
  C-Richter ohne Zweig, 0 Spiel-Byte (Blatt 21).
- **Blocker für JEDE Radeon-Station:** Werkbank-Absturz Exit 3221226505 an 36f9d45a, unbenannt (UEBERGABE:53).

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprueche)
- Die Wurzel des dunklen Himmels ist **nicht benannt**. Der Faktor Tafel → Pixel ist ungemessen (die Regel verbietet GPU). Das Rondell-Bild zeigt
  den Himmel heller (schieferblau) als das Dorf-Bild (marine). Unterschied von Pose, Wetter oder `toenung` am Dorf (`bild-himmel.js:1203-1227`)? Nicht gelesen.
- **Widerspruch Ort:** Der Kurs sagt „Arbeit landet am Dorf der Ankunft“. Der Spieler kommt aber am Rondell an (Pose S2). Das Dorf liegt bei r 190
  (`fachwerk-core.js:9648`) und ist im ersten Bild nicht zu sehen. Die Bilder des Tages zeigen das Dorf. Für das Ankunftsbild habe ich nur EIN Bild gesehen.
- **Leere Ankunft:** `kegelM 150` hält jeden Akteur aus dem ersten Blick (Schutz für B). Die Vision („Spielplatz mit Familien“, „lebendiges Feld“) sieht
  dort niemanden. Ob der Schöpfer das so will, ist sein Scope. Nicht entschieden.
- **Pfad nur headless:** `spielgang.K1` misst 822 ms Kontrolle am Null-Renderer. Eine GPU-Sitzung über alle fünf Schritte gibt es nicht, „teilen“ fehlt
  in der Spur. Ein neuer Richter dafür wäre Apparat (Kurs Regel 5), darum kein Schnitt hier.
- Doc-Widerspruch: `docs/das-lebendige-feld.md:264` sagt, der Spieler schreibe Leben nicht als Pflege. `affekt.K1` misst „pflegen“ (Blatt 32:83).
  Nicht geprüft.
- Nicht gelesen: der Code der Lücken 2–5 auf ihren WIP-Zweigen (nur Rümpfe über die UEBERGABE), `stamm/siedlung-wege.js`, `docs/README.md`,
  die Erwachen-Seiten. Nicht gemessen: jede Zahl der Tabelle stammt aus Fremdblättern oder aus PM, keine aus eigenem Lauf.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
| # | Wirkung | Aufwand | Risiko |
|---|---|---|---|
| 1 Himmel | 5 (ein Drittel jedes Bilds) | M (Spike S) | Ein Schnitt an der Tafel verschiebt Bestrahlung und Belichtung jedes Stoffs, darum ist licht.K2 die Leitplanke |
| 7 Wille → Bild | 4 (Schritte 3+4, auch der KI-Satz) | M | Der Vortritt hungert Strom und Wald nach dem Akt aus, `gate:takt` T9 muss halten |
| 8 Tor | 4 (jeder Torgang) | S | Wer IN einer Apertur ankommt, muss erst heraustreten |
| 2–5 Flächen | je 4–5 | M–L, besetzt | Teil-Landung schiebt den Fehler in die Nachbar-Stufe (Kurs 13.11.) |
| 9 E-Richter | 4 im Takt, 0 im Bild | M | Die erste eingeschwungene Zahl kann ROT sein (VRAM 129–151 ↔ 118 MB) |
| 6 B | 2 je Stufe | in den Klassen | Die Zeile darf nie zur Schwelle werden |
| 10 Breite | 3–4 | S (Arena) bis L (Kind) | Breite vor dem ersten Bild wiederholt den Fehler „5 % der Klasse“ |
