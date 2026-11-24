# Vorprüfung licht-stetig — die Helligkeit über den Tag als stetige Funktion der Sonnenhöhe

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 77 von 1 718 (diese Abgabe bucht keine Sprosse — gebucht wird
erst, wenn der Richter im Zweig `punkte-maschine` sie grün misst). Zweig `licht-stetig`, geschnitten von origin/main, vereint mit
main 9d4319c0 (w28-klang-leib); das Urteil der Vorprüfung am Kopf liegt in `koordination` unter `probe-post/licht-stetig/`.

**Geschnitten:** vier Erzeuger der Stufen im EINEN Baustein `welt-licht.js` — das zweite Dämmerlicht (Zwilling) fällt, der Boden
des Messers ist der Mond der Stunde, die Bestrahlungs-Tafel, die Durchlass-Tafel und Ψ_ms mischen im Logarithmus des
exponentiellen Gesetzes, Ψ_ms liegt dicht um den Horizont; dazu die Linse, die den Täter beim Namen nennt (Täter-Pass, 35 von 35).
**Gemessen:** wiese −18° +1,72 EV → unter 0,1; genesis −6° −0,45 / +0,44 → unter 0,1; wiese −5° −0,12 → −0,09; genesis 10° −0,10
ROT → −0,10 GRÜN an der Grenze; im Lauf der Uhr am Sonnenuntergang je 0,18° Sonne −0,006 … −0,018 EV. **Ehrlich offen:** die
Rest-Kante des Abends am Genesis-Ort (der Empfänger M1 des Messers), die ganze Bahn und Third, die Sterne nach Grenzgröße, die
fehlenden Leser von nacht#1 (Schatten-Kontrast am Feuer) und himmel#1 (Leuchtdichte gegen Messung) — Zeile für Zeile unten.

Auftrag: die Helligkeit des Bildes ist über den Tag eine stetige Funktion der Sonnenhöhe — kein sichtbarer Sprung zwischen zwei
benachbarten Augenblicken, an keinem Ort. `TAG_SOLL.sprung` (0,1 EV je Uhrschritt) bleibt, die Linse ist nicht geweitet.

## Die Stufen, ihre Erzeuger, der Schnitt

Jede Stufe hatte ihren Erzeuger im Licht, das die Kamera misst, oder in den Tafeln, aus denen das Bild sein Himmelslicht nimmt —
und alle am EINEN Baustein `welt-licht.js` (Welt und Bühne der Studios rufen ihn). Die Klasse: ein Schalter oder eine lineare
Mischung, wo das Licht der Dämmerung exponentiell mit der Sonnenhöhe fällt (0,4–0,5 Dekaden je Grad).

| # | Erzeuger (main, Datei:Zeile) | Stufe vorher | Schnitt (licht-stetig) |
|---|---|---|---|
| 1 | `welt-licht.js:208` `nachtHimmel`: ein ZWEITES Dämmerlicht (`STERNENLICHT.daemmer`, 3 lx bei −6°) neben der Dämmerung, die die Tafeln der EINEN Atmosphäre schon tragen; eingeblendet mit dem Kanal `nacht`, abgeblendet mit der Dämmerung der Tag-Achse bis −18° — dort die Kante | wiese Uhr 0,2 → 0,202 +1,72 EV (Radeon, bc8f141f), REF −1,25 bei 0,2 | der Zwilling fällt: `nachtHimmel` (`welt-licht.js:198`) ist nur das Sternen-Licht im Maß der Nacht; `daemmer` und `DAEMMER_ENDE` sind gefallen |
| 2 | `welt-licht.js:753` `belichtung`: ein FESTER Boden des Messers (`nachtKnotenE` = Vollmond im Zenit), mit smoothstep vom Horizont bis −6° eingeblendet — er lag in der Dämmerung über dem wahren Licht (Sonne −3°: 3 EV) und knickte die Kamera | (Teil der Stufen bei −6° und der Kante 0,72 → 0,722) | der Boden ist der Mond DER STUNDE (`welt-licht.js:741`, Argument `mond`; `stamm/bild-himmel.js:2192` reicht `−e × _mondDurchlass(−e)`): der Vollmond ohne Wolken-Decke mit dem Durchlass seines Richtlichts — unter offenem Himmel nie über dem Licht, mit der Sonne über dem Horizont 0 |
| 3 | `welt-licht.js:901` `bestrahlung`: der Messer las die Bestrahlungs-Tafel (65 Texel) LINEAR im Licht zwischen zwei Texeln — 1,2° weit, das Licht fällt dort je Texel um das 3,4-Fache: am Anfang jedes Texels stieg er doppelt, an seinem Ende halb so steil wie das Licht | genesis Uhr 0,232 → 0,234 −0,45 EV und 0,234 → 0,236 +0,44 (Radeon, bc8f141f; Täter: Belichtung −1,09 / −0,92) | die Tafel mischt GEOMETRISCH (`welt-licht.js` `TAFEL_BODEN`, `bestrahlung`): im Logarithmus über dem Boden ihrer Auflösung 2^−24; synthetisch (0,45 Dekaden je Grad) 0,227 → 0,015 EV Fehlerschritt je Uhrschritt |
| 4 | `welt-licht.js:29, 389, 395, 443, 510` `durchlass` / `mehrfach` und ihre Pässe: der Filter der GPU mischte die Durchlass-Tafel und Ψ_ms linear im Licht; Ψ_ms trug 32 Texel linear über cos Sonnen-Zenit (3,6° um den Horizont), und die Luft unten im Erdschatten lebt in der Dämmerung allein von ihm — das Himmelslicht knickte an jedem Texel | nach Schnitt 3: genesis 0,232 → 0,234 −0,37 / +0,39 EV (Radeon 7ef6fb25: Belichtung −1,19 / −1,28 gleichmäßig, Himmel +0,49 → +1,05) | die Durchlass-Tafel trägt die optische Tiefe τ, Ψ_ms den Logarithmus über 2^−24 — der Filter mischt exakt für das exponentielle Gesetz; Ψ_ms liegt quadratisch dicht um den Horizont wie die Bestrahlungs-Tafel (`msLage`, μ = c·\|c\|, 64 × 32): bei −5° 1,15° statt 3,6° |

Physik (INFORMIEREN): Brown 1952 / USNO Circular 171 — 3 lx bei −6°, 0,008 lx bei −12°, etwa 0,4 Dekaden je Grad; Kyba et al. 2017 —
der Vollmond trägt höchstens 0,26 lx (`MOND_E`); Hillaire 2020 / Bruneton 2008 — die Tafeln. Das Gesetz zitiert die Zahlen, keine
Tafel wurde kopiert.

## Die Linse, die den Täter beim Namen nennt

`gate:tag-achse:echt` (Familie Tag-Achse, `scripts/lib/licht-linsen.cjs`): reißt ein Schritt (`|log2 Yb/Ya| > TAG_SOLL.sprung`),
schießt die Werkbank an beiden Uhren den TÄTER-PASS (`tagKurve` `teile`, Zeile 1254): dasselbe Bild ohne Wurf, ohne Richtlicht,
ohne Lampen (der Pool je Bild über `_leuchtTakt`), ohne Sterne, ohne Himmelslicht. Der reine Richter `tagTaeter` (Zeile 1443)
zerlegt die Stufe in Belichtung · Sonne · Wurf · Himmel · Sterne · Lampen · Rest (EV) und nennt den Träger — den größten Beitrag mit
dem Vorzeichen der Stufe:

```text
SPRUNG genesis: Uhr 0.232 → 0.234 -0.45 EV — trägt Belichtung -1.09 (Täter-Pass -0.31 EV: Belichtung -1.09 · Sonne -0.00 · …)
```

Selbsttest (35 von 35): je Beitrag ein Mutant mit Schalter (`TAETER-<name>`: die Zeile 0,276 um 20 % heller, der Beitrag trägt ihn) —
jeder fällt ROT und nennt genau seinen Beitrag; ohne Täter-Zeilen steht „ohne Täter-Pass“. Konsum-Leser: `werkbank licht --tag`
(`scripts/werkbank.cjs:3881`) — die Uhren aus `tagTaeterUhren` gehen als zweiter Lauf mit `taeter: true` an `__tagKurve`. Die Linse
führte jeden Schnitt hier: Schnitt 3 nannte sie „Belichtung“, Schnitt 4 „Himmel“.

Am Weg fiel eine zweite Lücke: die Zitat-Wand von `gate:betriebsgesetz` (`scripts/diag-betriebsgesetz.cjs`, `ZITAT_GATE`) schnitt
den Gate-Namen am Doppelpunkt ab — ein totes `gate:x:nie` schwieg hinter dem lebenden `gate:x`. Das Muster trägt jetzt die Glieder;
der Mutant im Selbsttest (das tote Glied `tier-gang:nie` neben dem lebenden `tier-gang:echt`) war am alten Muster ROT (10 statt 11).

## Gemessen (vorher → nachher, gate:tag-achse:echt, gleiche Uhren)

Die Spitze des Schritts (`TAG <ort>`-Zeile des Probe-Posts) und die Stufen, die der Auftrag nennt — je Ort, Gerät und Kopf:

| Ort | Stelle | vorher (Kopf, Gerät) | nachher (Kopf, Gerät) |
|---|---|---|---|
| wiese | −18°: Uhr 0,2 → 0,202 | +1,72 EV, REF −1,25 (bc8f141f, Radeon) | unter 0,1 (1fca95d5 Radeon; Spitze −0,09 bei 0,766) |
| genesis | −6°: Uhr 0,232 → 0,234 / → 0,236 | −0,45 / +0,44 EV (bc8f141f, Radeon) | unter 0,1 (1fca95d5 Radeon; Spitze −0,10 bei 0,722) |
| genesis | Sonne 10°: Uhr 0,72 → 0,722 | −0,10 ROT (3a87a8fa, GTX 1060) | −0,10 GRÜN an der Grenze (1fca95d5 Radeon · 95b5d4f8 GTX 1050) — die Kante steht, offen unten |
| wiese | −5°: Uhr 0,764 → 0,766 | −0,12 (bc8f141f Radeon) · −0,10 ROT (f53f05ea, GTX 1060) | −0,09 GRÜN (1fca95d5 Radeon · 95b5d4f8 GTX 1050) |

Der Weg (gate:tag-achse:echt, die Spitze je Ort): nach Schnitt 1+2 genesis −0,61 bei 0,234 (Täter Belichtung −1,52, GTX 9c4f439b) ·
nach Schnitt 3 −0,37 / +0,39 (Belichtung gleichmäßig −1,19 / −1,28, Himmel +0,49 → +1,05; Radeon 7ef6fb25) · nach Schnitt 4 genesis
GRÜN, wiese ROT −0,10 bei 0,766 (Belichtung +1,02 gegen Himmel −1,01; GTX f53f05ea) · nach Schnitt 5 beide GRÜN (Radeon 1fca95d5).
gate:nacht-licht:echt GRÜN (9c4f439b), gate:webgl-probe GRÜN an jedem Kopf. Abdruck gegen 9d4319c0 (Kopf cc605055): nur D7 belichtung:21h
an drei Orten (der Mond-Boden statt des festen), 0 in D1–D6, D8, D9. Das Urteil der Vorprüfung am Kopf dieses Zweigs:
`probe-post/licht-stetig/<Kopf>.md` im Zweig `koordination` (gate:tag-achse:echt, gate:pruefbuehne-licht, bild:dorf@0.5, bild:wiese@0.5).

## Der Abend: die Kante 0,72 → 0,722 (gemessen, offen)

Die BLICK-Proben am Nebenzweig `blick-licht-stetig` (nur Messung, nie gemergt) zerlegen den Abend des Genesis-Orts je Schritt 0,002:

- **Die Kamera ist stetig:** ihre Stufe ändert sich im Band [12°, 8°] je Schritt um −0,02 … +0,01 (Radeon 6cc0b30f, GTX 1050
  11281daf) — sie ist nicht der Täter.
- **Die Sonne geht hinter dem Grat unter:** die Sicht des Bildes (`_bildSonnenSicht`) fällt zwischen 16,7° und 6,7° von 0,30 auf
  0,001. Der Sonnen-Anteil des Messers folgt dem Sonnen-Anteil des Bildes.
- **Die Szene fällt schneller als der Messer:** zwischen Uhr 0,714 und 0,724 um bis zu −0,09 EV je Schritt, in Summe −0,34 EV. Die
  Flächen des Bildes (Wände, Hänge) nehmen die tiefe Sonne mit ihrem mittleren N·L, die waagrechte Karte des Messers (M1) mit sin h:
  bei 11,4° trägt die Sonne in der Szene ~46 % des Lichts, im Messer ~25 %. Das ist die Rest-Kante: genesis 0,72 → 0,722 −0,10 EV
  (GRÜN an der Grenze: Radeon 1fca95d5, GTX 1050 95b5d4f8), an der GTX 1050 mit feinen Uhren 0,716 → 0,718 −0,10 ROT — „trägt
  Sonne −0,17 (Täter-Pass −0,07 EV: Belichtung +0,14 …)“ (11281daf).
- **Das Einschwingen nach dem Sprung der Uhr:** wiese 0,70 → 0,702 im Hauptlauf −0,16 EV, im Täter-Pass unter gehaltener Kamera
  −0,01 / −0,02 — ein Schritt der Linse, nicht des Lichts; die grobe Uhr 0,72 liegt ~0,03 EV über ihren feinen Nachbarn. Rückstrahl
  und Schatten-Karten misst der Schuss schon neu; die Ursache ist nicht benannt.

Gemessen und KEIN Täter (die Zahl führte): die Umgebung der Stoffe (`stamm/bild-himmel.js:874` `_ensureSkyEnvironment`) hält ihren
Himmel bis zu einer Drehung der Sonne um 0,5° — so stand es im Code. Die Vorher-Probe 95b5d4f8 (GTX 1050, Uhr 0,747 bis 0,75 je
0,0005 = 0,18° Sonne) zeigt: die Umgebung zeichnet an JEDEM Schritt neu (ihre Sonne = die Sonne, 0,836/0,84 … 0/0), denn ihr
Schlüssel `v` (die Version der Himmels-Sicht) wechselt mit jeder Stufe der Sonne und geht an `gleich` und der Drossel vorbei; das Bild
fällt dort je 0,18° um −0,006 … −0,018 EV. Die Folge der Umgebung (`U.umgebung`, 63e7f7b0) hätte nichts getragen und fiel wieder
(cc605055).

## Offen (mit Adresse)

- **`planet.kosmos.himmelsmechanik#1` — die Rest-Kante des Abends** (genesis 0,714 → 0,724, Spitze −0,10 EV, an der GTX 1050 fein
  0,716 → 0,718 −0,10 ROT; Messname `Sprung` in `gate:tag-achse:echt`): der Empfänger des Messers ist die waagrechte Karte (M1, der
  Anker der Kamera), das Bild nimmt die tiefe Sonne mit dem N·L seiner Flächen. Der Schnitt — der Messer nimmt die Sonne mit dem
  N·L × Sicht des Bildes (der Nebenzweig misst es schon: `blickNLV` in `stamm/bild-schatten.js`) — verlegt den Anker M1 und mit ihm
  REF, GOLD und Karte; er steht offen.
- **`planet.kosmos.himmelsmechanik#1` — die ganze Bahn, Ego und Third, beide Geräte:** gemessen ist die Wand (`--kurz`, 23 Uhren
  und die feinen) in Ego auf Radeon und GTX 1050/1060; `gate:tag-achse:bahn` reißt den Deckel der Probe (480 s je Tor), Third ist
  ungemessen.
- **`planet.kosmos.himmelsmechanik#1` — die Sterne nach Grenzgröße:** in dieser Welle unberührt (`nachtHimmel` trägt das
  Sternen-Licht im Maß der Nacht, kein Gesetz der Grenzgröße).
- **`erleben.bild.nacht#1` — der fehlende Leser:** die Kelvin-Farbe je Quelle liest die Nacht-Linse schon (`nachtSicht`,
  ≤ 200 K, `scripts/lib/licht-linsen.cjs:3820`); den Schatten-Kontrast eines Pfostens 2 m vom Feuer (≥ 3:1) liest keiner — die
  Kontakt-Linse (`kontaktSicht`, Zeile 3426, Pfosten A/B/C) misst nur die Sonne, der Wurf des Feuers (`LICHT_WURF`,
  `stamm/bild-schatten.js:1956`) hat keinen Leser.
- **`erleben.bild.himmel#1` — der fehlende Leser:** keine Linse misst die Leuchtdichte des Himmels in cd/m² gegen einen gemessenen
  Klarhimmel (±0,3 EV); die Wolken-Linse (Zeile 932) misst die Leuchtdichte der Wolke gegen die 18-%-Karte, nicht gegen eine Messung.
- **`gate:tag-achse:echt` — das Einschwingen nach dem Sprung der Uhr** (wiese 0,70 → 0,702 −0,16 EV gegen −0,01 im Täter-Pass):
  die Ursache ist nicht benannt.
