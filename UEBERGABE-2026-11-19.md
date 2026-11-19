# Übergabe 19.11.2026, 16:31 — Koordinator an der Radeon (Konto 15, letzte Fable-Sitzung)

Dieses Blatt ersetzt die Fassung mit den Nachträgen. Budget 16:40: Woche alle Modelle 87 %, Fable 98 % (diese Sitzung endet, sobald Fable voll ist — dann liegen Abgaben im Zweig und im Scratch), Extra-Usage aus; die
Woche endet am 24.11. 09:00 Ortszeit. Wer weitermacht: LAGE-Block lesen, dieses Blatt lesen, `messplatz-blick.cjs --kurz` fahren,
dann stempeln. Geräte (OMEN GTX 1060, GTX 1050) laufen auf Opus und melden nur Abgabe an EINEM Kopf oder harten Block.

## 1 Köpfe (per ls-remote, 16:31)
main 986eff04 · integ-probe 00f9064a (Zug z625, Batterie läuft) · koordination: siehe LAGE.

## 2 Im Zug und gestempelt
| Zweig | Stand | Nächster Handgriff |
|---|---|---|
| `w28-laub-kante-2` 80471c53 (Lichtmesser) | fährt allein in z625, Vorprüfung war 18/18 | landet von selbst bei grüner Batterie. Kosten als Zahl an der Leiter `same.preis.ankunft`: Kalt-Ankunft Radeon Genesis 11,5 → 21,0 s, Wiese +2,5 s. NICHT zurückziehen (Wort des Schöpfers 19.11.: der Kaltstart ist kein Tor). |
| `w28-licht-eine-skala` cec1add5 (Licht Welle 1) | z624 ROT am echt-Bein des OMEN: „K9 NACHT nachtOben 0 · nachtUnten 0“ (Wasser-Bild), „RAUCH: der Kamin legte keinen Satz an“ (Post-Kette) | Rest liegt beim Macher GTX 1050 (Zweig `licht-eine-skala` 21e5a4d6); bei Abgabe neue Vorprüfung, neuer Stempel-Name `w28-licht-eine-skala-2` |
| `w28-laub-kante` 76d36e57 | wartet | landet mit dem Zug; kreuzt die Licht-Wellen in `spec/asset-contract/v1/golden/manifest.json` + `recipes.json` — wer später landet, prägt neu |
| `w28-bau-rezept` ff2b8341 | rote Batterie (Kreatur-Linse, Probe `bewohner`: 4 Steckenbleiber an der werkstatt, Durchdringung 40 Takte) | Heiler läuft, siehe 3.2 |
| `w28-kern-sprossen` df03a17c | rote Batterie (Wege 3 statt 3–8, Haltung 1,299° über Soll 1°; Täter die eigenen Charakterzüge in `koerper-core.js`) | der bau-rezept-Heiler nimmt ihn nach seiner Abgabe, ohne Rückfrage (7.4) |

Befund zum Fresser: `zug/fresser-kreatur-linse.md` (kein gemeinsamer Täter, main ist grün).

## 3 Arbeiter in Fahrt (Opus, lokal; ihre Abgabe landet in dieser Sitzung — endet sie, liegt das Ergebnis im Zweig und im Scratch)
Scratch-Wurzel: `C:\Users\micha\AppData\Local\Temp\claude\b95c25d6c0e867eb\f6f6f5fc-61d9-4857-94d5-77df7097c28a\scratchpad\`
1. **Herde** — Baum `AnazhRealm-leben`, Zweig `herde-gesetz` cc24899c. Stand und Reste T1–T3 stehen in 7.6. Abgabe: `lebenherdekontakt-nachher3-*.jpg`, `mess-nachher3.json`; die Bögen selbst ansehen. Stempel nur zusammen mit `leben-leser` (a9465011) und `leben-erbe` (3888d21c).
2. **Heiler bau-rezept** — Baum `AnazhRealm-probe2`, Zweig `bau-rezept-tuer` (noch nicht auf origin). Abgabe: `bewohner`
   vorher↔nachher, `gate:haus-welt` W7, Bild `bau-rezept\`. Dann Vorprüfung am Kopf, Stempel `w28-bau-rezept-2`.
3. **Lichtmesser-Nachzug** — BEENDET (7.2). Zweig `licht-lesung-ev` f09c1b75, Schnitt 2b1d162d: die Lesung gilt in EV statt in Grad (`_bildSichtSpanneEV`, Schwelle `BELICHTUNG.async` 0,05 EV, EINE Quelle in `welt-licht.js`), Linse `ladeLesungUrteil` mit Mutant ROT, Selbsttest 29/29 — nur headless; an der GPU ungemessen (A1–A6 unbelegt). Fällt offen mit Grund: ein Schnitt wegen des Kaltstarts hält keine Landung auf und bekommt keine GPU-Zeit vor der Paar-Runde. Der Zweig bleibt.
4. **OMEN:** Los-Hülle (`los-huelle` 34d507d6, schiebt). Rest: `bewohner` 5 Leiber statt ≤ 4, laterne_dorf 2 Takte. Bei Abgabe
   Vorprüfung, Stempel `w28-los-huelle` aus `los\stempel.txt`. Daneben Runde der Stationen (Punkt 5, Buchung je Station).
5. **GTX 1050:** Rest der Licht Welle 1 (oben), danach Welle 2 — erster Punkt die Mond-Phase aus der Welt-Uhr
   (`stamm/bild-himmel.js:1150`, der ewige Vollmond löscht die Sterne).
6. **Cloud:** `leben-erbe` 3888d21c (Epoche + Stand), seit Stunden ohne Push — prüfen, ob die Sitzung noch lebt; Bericht käme als
   `cloud-post/leben-erbe.md`.

## 4 Entschieden, noch ohne Arbeiter (in dieser Reihenfolge)
1. Heiler für `w28-kern-sprossen` (Soll-Zeilen der Probe bleiben).
2. **EINHEIT, Bild-Spike STUFE** (Radeon, GPU): Soll B1–B5 in `vision/einheit/entscheid-einheit.md` E6, vor der Messung gesetzt.
   6 Vorlagen (3 Häuser, darunter japanisch; 3 Wagen). Spike nein = stopp. Danach Welle a → Stoff-Spike → Welle b → Welle c.
   Die Reihenfolge steht auch in `vision/PLAN-1712.md`.
3. `w28-reise-raeumt` 6e659b8e (Bergung, Besitzer zum 20.11.): zuerst seine Linse an der GPU, dann Konflikte gegen main.
4. Träger-Schnitt für fahrende Wagen (`lack-luma-fahrt`), nach dem Stufen-Spike.

## 5 Was heute gesetzt wurde
- **Äste-Frist (E4.3):** 164 Zweige + 6 Bergungs-Äste liegen unter `refs/archiv/2026-11-19/` (derselbe SHA, ein Push holt zurück);
  Verzeichnis `zug/archiv/1911-frist-trocken.txt`, Log `zug/archiv/1911-frist-lauf.log`, Bergungs-Urteile
  `bericht/1911-bergung-aeste-7.md`. Neun „ungeklärte“ Familien stehen mit SHA in LAGE (eb5c321d).
- **Werkzeug** in `zug/dienst/`: `ungelandet.cjs --frist`, Blick mit PULS und LANDUNG, `pushe()` am Radeon-Dienst ROT. An der
  Radeon kommt beim nächsten `start.sh` der Hand-Änderungs-Alarm; er ist dort falsch (installiert = koordination).
- **Regeln:** „angenommen“ erst nach der Batterie · kein Stempel ohne Soll-Datei vor der Welle · eine Preis-Zahl im Stempel braucht
  ABAB mit ≥ 3 Läufen je Seite · der Kaltstart ist kein Tor: Zahl benennen und landen, nie zurückziehen · Regeln des Apparats setzt
  der Koordinator selbst · höchstens 3 lokale Arbeiter, alles Neue als Opus.

## 6 Ehrlich
- Landungen heute 6 (gestern 15), Karte 2: 36 von 1 718, Rate 5,0 je Tag gegen nötige 60,1. Schneller wurde es heute nicht.
- Drei meiner Stempel hielten nicht: bau-rezept und kern-sprossen trugen eine rote Batterie, licht-eine-skala fiel am echt-Bein.
  Die Vorprüfung fährt das echt-Bein der Karten nicht — das ist die Lücke, an der Licht Welle 1 durchkam (Heilung: 7.3).
- Den Lichtmesser-Stempel habe ich wegen der Kalt-Ankunft zurückgezogen und nach dem Wort des Schöpfers wieder eingesetzt.
- Die Stand-Zeile in CLAUDE.md trägt noch V18.546.339; sie fällt mit dem Altlasten-Schnitt (7.1).

## 7 Entscheide 16:40 (Wort des Schöpfers: „wo sind die lösungen?“ · „diese pflicht offen kann ich nicht mehr hören … in den sprossen integriert oder du lässt es“)
1. **EIN Scope, EIN Zähler: die Karte 2.** Die Liste `docs/PFLICHT-OFFEN.md` stirbt; A–F werden benannte Leitern der Karte 2 oder
   fallen offen mit Grund. Opus-Arbeiter im Baum `AnazhRealm-altlast`, Zweig `altlast-in-die-karte` (Commit 1: Liste, CLAUDE.md,
   champion.md, gate:betriebsgesetz; Commit 2: Zensus alter Tests, Klassen ohne Leser fallen). Bei Abgabe: Vorprüfung, Stempel
   `w28-altlast-in-die-karte`. Kein Bericht nennt die Pflicht-Liste mehr — Schluss-Zeile ist „Karte 2: n von 1 718“.
   Der Blick ohne alte Karte (219/330) und ohne PFLICHT-Zeile kommt als Datei nach `altlast\messplatz-blick.cjs` → nach
   `zug/dienst/` buchen.
2. **Die Rate hängt am Paar, nicht am Bau.** Die Richter-Tafel trägt 1 716 Stationen; die GTX fährt Runde 1 am Kopf f68dbf09 mit
   974 von 1 428, die Radeon hatte in Runde 1 nur 25 Stationen in der Liste und steht seit 09:30 „durch“. Gebucht wird nur das Paar.
   **Entscheid: ab dem Ende der GTX-Runde gehört die Radeon-GPU der Runde 2 (volle Liste, derselbe Kopf wie die GTX).** Kein neuer
   GPU-Arbeiter an der Radeon, bis die Runde durch ist; der Nachzug `licht-lesung-ev` ist deshalb beendet (WIP gepusht, fällt offen:
   Schnitt wegen des Kaltstarts). Erster Handgriff morgens: in `zug/runde.txt` prüfen, dass die Radeon-Zeile der Runde 2 die volle
   Liste trägt (nicht wieder 25) — sonst `runde.cjs zurueck` und den Radeon-Dienst neu starten (`bash zug/dienst/start.sh`).
3. **Stempel, die halten:** die Vorprüfung trägt ab jetzt neben `[ci voll]` EIN `[gpu-probe: …]` mit den echt-Wänden der Domäne
   der Welle (Licht: `gate:post-kette` + das Wasser-Bild; Tier: die Kreatur-Probe), damit ein Gerät sie VOR dem Stempel fährt.
   Kein Stempel mit roter oder halber Batterie.
4. **`w28-kern-sprossen`:** der Heiler von bau-rezept nimmt ihn direkt nach seiner Abgabe (dieselbe Probe `bewohner`, Kontext warm).
5. **EINHEIT, Bild-Spike STUFE:** an die GTX 1050 nach ihrem Licht-Rest (B1–B4; B5 misst das Paar) — die Radeon misst nachts.
6. **Herde:** `herde-gesetz` cc24899c, zweites Urteil am Bogen: groß im Bild, Äsen und Flucht geheilt; Reste T1 schwarzer Keil am
   Tier, T2 S4 zurückgefallen (7,97 → 26,37 m/s²), T3 „stehen“ läuft an der GPU (1,17 m/s). Bogen `kontakt-nachher2-hirsch.jpg`.

## 8 Die Hebel-Tafel 17:05 (ersetzt 7.2 — mein Entscheid „Radeon misst die volle Liste“ war falsch)
Gelesen an der Mess-Datei der GTX am Runden-Kopf f68dbf09: von 498 Urteilen 3 grün. Das Paar ist nicht die Bremse. Blatt:
`vision/hebel-tafel.md`, Werkzeug `zug/werkzeug-w3/hebel-tafel.cjs`.
1. Das zweite Gerät misst nur, was das erste GRÜN urteilte. Die Radeon-Zeile der Runde 1 trägt seit 17:03 die drei grünen
   Stationen der GTX (sinn.tod#1, menge.bevoelkerung#2, preis.eingabe#1) — sie misst sie in der nächsten freien Lücke, die
   Buchung folgt von selbst. Die Radeon-GPU bleibt sonst bei den Machern. Runde 2 darf NICHT wieder 1 428 rote Stationen an
   zwei Geräten fahren: vorher die Reihe (`runde.cjs reihe`) auf „rot bleibt liegen, bis eine Landung die Leiter berührt“
   stellen — Auftrag liegt beim Arbeiter `richter-ohne-urteil` (Teil 2), sonst der erste Handgriff.
2. In Fahrt (Opus, lokal, ohne GPU): `richter-ohne-urteil` (167 Stationen ohne Urteil: Frist gerissen, Urteils-Zeile fehlt) und
   `saat-im-lauf` (35 Stationen / 26 Leitern: die Sitzung hält EINE Saat). Abgabe je als Zweig auf origin + Blatt im Scratch
   `hebel\richter-ohne-urteil\abgabe.md` und `hebel\saat-im-lauf\abgabe.md`.
3. Nächste Hebel in dieser Reihenfolge, je EIN Arbeiter: Kosmos (44 Stationen) · Menge (35) · Spieler (28) · „Leser fehlt“ nach
   Leiter (104).
4. Licht Welle 1: Macher-Kopf 9d821539, Vorprüfung 0c1af929 mit `[gpu-probe: gate:post-kette, gate:wasser-leben:bild]`; bei
   18/18 und grüner GPU-Probe Stempel `w28-licht-eine-skala-2`.

## 9 STAND BEIM SICHERN (vorbereitet 20:28, Woche alle Modelle 97 %, Fable 99 %; die Koordinator-Sitzung läuft auf Opus 5.5)

**main** 7d9c4d51 V18.546.344 (z627: licht-eine-skala-2, los-huelle, alte-tests-fallen, saat-im-lauf). Karte 2: 35 von 1 718. Heute 10 Landungen.

**Gestempelt, wartet auf den nächsten Zug:** w28-welt-tag-null c456c97c (tagNull hat EINE Geburt, `_weltGeburt`; Ring 8 GEBURT), w28-kern-sprossen-heil a5f28552 (Haltung des Bewohners 1,299° → 0).

**Vorprüfung läuft:** laub-kante-3 106b754a auf 1b06de47 ([gpu-probe: gate:post-kette, gate:wasser-leben:bild] [ci voll]). Inhalt: die Kamera auf Hand im EINEN Schreiber der Belichtung (`_belichtungHand`), beide Proben-Hüllen umgezogen, mit main gemergt. Bei grüner Batterie stempelst du w28-laub-kante-3. Die Radeon-Kette luft und tag-achse am Baum 1b06de47 fährt der Lichtmesser.

**ROT, ein Heiler daran:** stein-ein-gesetz 3e76deb8 (E8.1: der Stein liest EINE Größe, er streckt nie nach dem Budget). Rot sind Regler wirkt Teil 2 und 3 und Asset-Vertrag v1. Weg: main mergen, die Regler-Linse liest dieselbe ohneStein-Regel wie buildInstance (keine Zeile heben), die v1-Goldens einmal am gemergten Stand neu prägen. Danach neue Vorprüfung mit [gpu-probe: gate:haus-fern, bild:dorf@0.5] [ci voll]. Erst dann merged der GTX 1050 stein-ein-gesetz in einheit-stufe-aus-l0.

**Arbeiter in Fahrt (Opus, lokal), Köpfe 20:28:**
- herde-gesetz 03154644: Hufe, S3, Flucht-Kamera. Vorprüfung mit [gpu-probe: gate:kreatur-leben].
- kosmos-umfang 9814a9ae: Bildpaar, GPU-ms. richter-kosmos 509822dc buchst du nach seiner Landung in punkte-maschine.
- einheit-sicht bde53a30: Spike SICHT, E7, Pixel-Fehler + Hi-Z. Die Zahl aus Schritt 0 steht noch aus.

**Geräte:**
- OMEN: los-huelle-2 1f125464 (die Brandwand liest die Hülle), danach los-wurf.
- GTX 1050: ruht seit 97 % mit Übergabe in koordination bericht/1911-einheit-stufe-aus-l0/UEBERGABE.md. Muster-Phase 0,288 → 0,000 auf einheit-stufe-aus-l0 fa836365. Offen: das Bild B1 an einer Backstein-Pose nach dem Merge von main. Relief als Ton als Kanten-Term im Verband-Gesetz ist entschieden, aber noch nicht begonnen.

**Gebucht seit 16:31:** richter-ohne-urteil (punkte-maschine c784e730), richter-saat (92cbf940). Entscheide E7 und E8 in vision/einheit/entscheid-einheit.md.

**Ehrlich:** Die GPU-Probe von welt-tag-null 265c7f19 gab nach. Gestempelt wurde am GPU-Grün des baumgleichen Spielbaums 44e48a7e; das steht im Stempel-Text. Ob die 177 ungemessenen Stationen zurückkommen (tagNull), zeigt erst die nächste GTX-Runde.

## 10 GESICHERT (21:23, Woche alle Modelle 98 %, Notbremse gezogen)

Alle lokalen Arbeiter sind beendet, ihr Stand ist gepusht (per ls-remote). notbremse.sh lief nur trocken. Die Bäume von heute waren sauber gepusht; die alten w27-/heim3-Bäume melden 36–420 Checkout-Artefakte und werden NIE gesichert. aufraeumen.ps1 lief nicht. main 92b7afd0 V18.546.345 (welt-tag-null gelandet), Zug z629 fährt mit kern-sprossen-heil.

| Zweig | Kopf | Stand | nächster Handgriff |
|---|---|---|---|
| stein-ein-gesetz | 935703a5 (Vorprüfung 2 auf 82429a87) | GPU-Probe ROT: gate:haus-fern „alemannisch/s7: Glas L1: Farbe 0.153 von der L0 entfernt“; bild:dorf@0.5 GRÜN; Code-Check lief noch | die L1 faltet den Stein-Ton in die Fläche (E8.3), keine Schwelle heben; dann neue Vorprüfung |
| laub-kante-3 | 2b52e702 | Satz-Wand an der Wurzel geheilt (diag-chunk-satz.cjs bereichTreu ~1081, 3/20 → 0/20 rot). D9 deterministisch: Dorf beim Mitspieler 29,83 m daneben, main 0 m. Der Anker  (stamm/siedlung-ort.js ~1022) verschiebt sich; Verdacht b8c6c199 (Hangwald) | den Linien-Commit für D9 benennen und heilen, dann Vorprüfung [gpu-probe: gate:post-kette, gate:wasser-leben:bild] |
| herde-gesetz | 4e01beac | headless GRÜN. v18: S3 Hirsch 1,27 → 0,081 rad, Wolf-S1 5/6. Geschnitten: Satz-Austritt (`_kreaturPoseFrisch`), Schnappen, Kamera-Wahl | GPU v19 am Kopf, Wolf-Huf 0,035 m (Soll 0,03), dann Vorprüfung [gpu-probe: gate:kreatur-leben] |
| kosmos-umfang | 647063f7 | main gemergt, EIN Belichtungs-Schreiber (`_sternLicht`), 2-px-Fußabdruck statt Quads; Bildpaar angenommen | Vorprüfung mit [gpu-probe: bild:wiese@0.02]; feld.sh (GPU +5,9 ms trennen); danach richter-kosmos 509822dc buchen |
| einheit-sicht | fb20f497 | E9. A gegen A: Flug-Rauschen 7–19 % am selben Kopf, über dem Rauschen +2,9 bis +3,6 Punkte in 3 von 24 Bildern. Schatten sauber, Ordnung sauber | Wurzel: die Leser der Szene-Tiefe (Wasser, Feld, `_szeneTiefe`) bekommen die Tiefe vor dem späten Zug; die Leser-Kopie gehört hinter den späten Zug, dann S5 neu |
| einheit-stufe-aus-l0 | fa836365 | GTX 1050: Muster-Phase 0,288 → 0,000 | stein-ein-gesetz + main mergen, Bild B1 an einer Backstein-Pose, Relief als Kanten-Term |
| los-huelle-2 | 7cc663f0 | OMEN | erwachen/omen-2026-11-19.md lesen |
