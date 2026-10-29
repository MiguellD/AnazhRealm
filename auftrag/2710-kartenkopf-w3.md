# Kartenkopf Woche 3 (ab 27.10. 23:00, neues Konto) — bindend für jeden Arbeiter

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dann `auftrag/2610-kartenkopf-w2b.md` (die Wände 1–9 der
Vorgänger-Röten), `auftrag/2510-kartenkopf-w2.md` und `auftrag/2410-kartenkopf.md` (Macher-Gesetz, Abgabe) — sie gelten weiter.
Dann deine Karte. Nichts sonst ganz lesen. Alle drei liegen im Zweig `koordination` (`git fetch origin koordination`,
`git show origin/koordination:auftrag/<datei>`).

## Das Ziel dieser Woche
Die Meisterkarte steht bei 123/330 (gebucht am 19606f2e). Der Weg zu 330 ist eine Liste von Staffeln, keine Wolke:
45 Kriterien sind voll (90), 34 tragen 1 Punkt (25 davon ohne Station für Staffel 2, 9 mit roter Station), 86 tragen keine Station
(172 Punkte). Jede Karte schließt GANZE Staffeln: Gesetz oder Werkzeug im Spiel-Baum UND die Station, die es misst.

## Die Form jeder Karte (wie w2g, die 8 von 8 Zweigen lieferte)
1. **Zweig X** (Code) von `origin/main`: `git fetch origin main && git checkout -b X origin/main`. Was die Staffel verlangt, im Spiel —
   an der Wurzel, EINE Quelle je Größe (`npm run atlas -- --find <Wort>` vor jedem neuen Helfer). Früh pushen mit `[ci voll]` im
   Betreff (die CI ist der Einlass, fahre.sh Stufe 0), danach die Wände der w2b fahren (Exit-Code je Wand im letzten Commit-Rumpf).
2. **Zweig X-koord** (Station) von `origin/koordination`: die Station in `meisterkarte-quelle/punkte/stationen/g<N>.js` — Befehl im
   Spiel-Baum, Gerät, `urteil` gegen das Soll der Staffel aus `meisterkarte-quelle/src/g<N>.js`, `pfad` für R6. Den `fehlt`-Eintrag
   der Staffel streichst du im selben Commit. `node meisterkarte-quelle/punkte/punkte.cjs selbsttest` GRÜN und
   `punkte.cjs liste` ohne Fehler; das Urteil trocken an deinem eigenen Lauf (GRÜN) und an einer Mutante (ROT).
3. **GPU:** die Cloud hat keine echte GPU. Eine GPU-Station (`geraet: "radeon+gtx"`) druckt `[linse-gpu] <Hersteller>/…`; du lieferst
   Befehl, die headless/swiftshader-Zahl und das erwartete Soll — das Urteil fällt beim Koordinator an Radeon und GTX.
4. **Abgabe:** der letzte Commit beider Zweige beginnt mit `Abgabe` und trägt im Rumpf: Wurzel (Datei:Zeile), Schnitt, Zahl vorher →
   nachher, die Wände mit Exit-Code, was ehrlich halb ist. Kein Siegel-Wort (gate:betriebsgesetz). Unmittelbar vor dem letzten Push
   `git merge origin/main` (Code-Zweig) bzw. `git merge origin/koordination` (koord-Zweig).
5. **Datei-Besitz:** deine Karte nennt ihre Dateien. Fremde Dateien einer laufenden Karte nicht editieren — Stelle und Grund im Rumpf.
6. **Nie warten:** keine Schleife ohne Obergrenze, kein Pollen der CI über 20 min. Ist die CI rot an einem fremden Wackler
   (z. B. STAND-TAKT BRAND-ZELLEN 66 > 64), nenne ihn im Rumpf und gib ab — der Koordinator heilt Wackler in main.

**Nachtrag 28.10. 17:50 (bindend für jede Karte ab w3r):**
7. **Kein swiftshader-Bild in der Cloud.** Bild-, Zeit- und Werkbank-Läufe (`--bild`, `--echt`, `werkbank bild|lauf`, Frame-p95)
   laufen unter swiftshader 20–60 min, hängen an `createRenderPipelineAsync` und urteilen nichts, was die Karte zählt. Die Cloud
   beweist Mechanik: Null-Renderer-Linsen, `--selbsttest`, Mutante ROT, `npm run check`, `gate:apparat`. Das GPU-Urteil fällt an
   der Station auf Radeon und GTX. Im Rumpf steht dann „GPU: an der Station“ statt einer swiftshader-Zahl.
8. **Kurz vor dem Push `git merge origin/main`** — main wandert am Tag um 4–6 Züge; ein Zweig, der gegen einen Kopf von heute früh
   gebaut ist, fällt im Einlass. Linsen enden über das EINE `urteilEnde`/`wandEnde` aus `scripts/lib/welt-boot.cjs`, Seiten-Server
   lauschen über `lausche` — keine eigenen Enden, keine festen Ports.
