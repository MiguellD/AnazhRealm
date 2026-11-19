# Übergabe 19.11. nachmittags (Konto 15, Koordinator an der Radeon — die letzte Fable-Sitzung)

Stand nach LAGE 75a0ba45 (15:09). Budget gelesen kurz vor 15:13: Woche alle Modelle 84 %, Fable 97 % (Woche endet 24.11. 08:59 Ortszeit),
Extra-Usage aus. Notbremse bei 98 % alle Modelle: TaskStop, notbremse.sh, dieses Blatt nachziehen.
Wer hier weitermacht, liest zuerst den LAGE-Block, dann dieses Blatt, fährt den Blick (`messplatz-blick.cjs --kurz`), dann stempelt er.

## Was heute gelandet und gesetzt ist
- main 986eff04 (z623 grün 14:17). Landungen: heute 6, gestern 15. Karte 2: 35 von 1 718 (Rate 5,0 je Tag gegen nötige 60,1).
- Gestempelt, im Zug wartend: `w28-licht-eine-skala` (cec1add5), `w28-bau-rezept`, `w28-kern-sprossen`, `w28-laub-kante`.
- Regel E4.3 (Äste mit Frist) läuft zum ersten Mal: 164 Zweige → `refs/archiv/2026-11-19/<name>`; Verzeichnis
  `zug/archiv/1911-frist-trocken.txt`, Befehle `…-befehle.txt`. Log des Laufs im Scratch `werkzeug/frist-lauf.log`
  (ENDE-Zeile mit gut/rot). Bricht der Lauf ab: die Befehle sind je Zweig mit Lease gesichert, den Rest ab der letzten GUT-Zeile
  neu fahren; danach `git ls-remote origin 'refs/archiv/2026-11-19/*' | wc -l` gegen die GUT-Zahl.
- Werkzeug in `zug/dienst/`: `ungelandet.cjs --frist [--stunden 72] [--befehle]`, Blick `--kurz` mit PULS und LANDUNG,
  `radeon-dienst.sh` mit `pushe()` ROT. Der Radeon-Dienst liest das erst nach seinem nächsten Start; nicht im Lauf tauschen.
  An der Radeon sind die installierten Dateien von Hand geändert: beim nächsten `start.sh` kommt der Hand-Änderungs-Alarm,
  er ist hier falsch (installiert = koordination 75a0ba45).

## In Fahrt (Opus), je mit dem nächsten Handgriff
1. **Lichtmesser** `laub-messer` e6707798, Vorprüfung 2 = 56777f23 (seit 15:08). Bei „voll 18/18“: Stempel aus dem Scratch
   `licht/bau/stempel.txt` nach NEU `refs/heads/w28-laub-kante-2` (`git commit-tree "$V^{tree}" -p $V -F stempel.txt`; vorher
   Kopf unverändert, Ziel frei, `git merge-tree --write-tree <main> $V | wc -l` = 1). Konflikt mit der Licht-Welle in
   `spec/asset-contract/v1/golden/manifest.json` + `recipes.json`: wer als Zweiter landet, prägt neu. Danach bestellen: der
   Folge-Schnitt Ankunft (Lade-Bilder im vollen Takt, sobald nur der Term „licht“ offen ist, `stamm/dirigent-ankunft.js`), mit
   Kalt-Ankunft vorher↔nachher — das Umstellen kostet heute +1,1 s (Genesis) bis +3,0 s (Wiese) gegen Pflicht B.
2. **Herde** (Bau H1, Baum `AnazhRealm-leben`, Zweig `herde-gesetz`, noch nicht auf origin). Bei Abgabe: die NACHHER-Kontaktbögen
   selbst ansehen (Scratch `leben/herde/kontakt-nachher-*.jpg`), S1–S5 aus `vision/leben/herde/entscheid-herde.md` urteilen, das
   Blatt dem Schöpfer senden. Stempel nur zusammen mit `leben-leser` (a9465011) und `leben-erbe`.
3. **Fresser Kreatur-Linse** (Leser, Baum `AnazhRealm-probe2`, Zweig `kreatur-linse-werk`): Täter beim Namen, Heilung als EIN
   Commit. Vorbild Fahr-Linse: Heil-Commit ohne Arbeitsbaum auf main heben
   (`git merge-tree --write-tree --merge-base <c>^ origin/main <c>` → `git commit-tree <tree> -p <main>`), Vorprüfung, Stempel.
   Verdacht, ungeprüft: dieselbe Wurzel wie die Vendor-Tür der Licht-Welle (`SpriteNodeMaterial`).
4. **Bergung, sieben Äste** (Leser, nur lesen): Blatt im Scratch `bergung/aeste-7.md`, je Ast Urteil a/b/c. Entscheid danach:
   (a) und (c) wandern mit Grund ins Archiv, (b) bekommt einen Besitzer mit Datum.
5. **OMEN (GTX 1060):** Los-Hülle (`los-huelle` 0fa7cc45, zieht main nach) → bei Abgabe Vorprüfung, Stempel `w28-los-huelle`
   aus dem Scratch `los/stempel.txt`. Runde 498/1428 am f68dbf09, Punkt 5 (Buchung je Station) steht.
6. **GTX 1050:** Licht Welle 2, Zensus; erster Punkt die Mond-Phase aus der Welt-Uhr (`stamm/bild-himmel.js:1150`, ewiger Vollmond
   = sternloser Nacht-Himmel).
7. **Cloud** `leben-erbe` 3888d21c (Epoche + Stand): Bericht kommt als `cloud-post/leben-erbe.md`; Ep2 ≤ 4 s und St2 ≤ 0,5 s an
   der langsamen Kern-Klasse lokal nachmessen.

## Als Nächstes zu bestellen (noch kein Arbeiter)
- **EINHEIT, Bild-Spike STUFE** an der Radeon, sobald die GPU frei ist: Soll B1–B5 steht in
  `vision/einheit/entscheid-einheit.md` E6 — vor der Messung gesetzt, wird nicht bewegt. 6 Vorlagen (3 Häuser verschiedener
  Stile, darunter japanisch; 3 Wagen). Spike nein = stopp. Danach Welle a → Stoff-Spike → Welle b → Welle c.
- Träger-Schnitt für fahrende Wagen (`lack-luma-fahrt`), nach dem Stufen-Spike.

## Regeln, die heute neu gelten
- „angenommen“ erst nach der Batterie, nie nach dem Bildpaar allein (mein Fehler 12:58).
- Kein Stempel ohne Soll-Datei vor der Welle (E4.1).
- Regeln des Apparats setzt der Koordinator selbst, ohne Box-Frage; Zweige archivieren (verschieben) ja, vernichten nie.
- Geräte melden nur Abgabe an EINEM Kopf oder harten Block; alles Neue startet als Opus; höchstens 3 lokale Arbeiter.

## Ehrlich offen
- Pflicht-OFFEN Rest A · B · C · E · F unverändert. Die Stand-Zeile in CLAUDE.md trägt noch V18.546.339.
- Karte 2 erreicht bei dieser Rate am 17.12. etwa 175 Sprossen; ob die drei Grundgesetze die Rate heben, zeigt erst Welle a.
- Der zweite Fresser ist noch ohne Namen; `w28-bau-rezept` trägt dazu eine eigene, unbelegte VK-Zeile.
