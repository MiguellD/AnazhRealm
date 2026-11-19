# MUSTER UND BREMSEN — Leser-Blatt (Opus, 19.11.2026, main dabd69bb, koordination per git show)

Kürzel: K = `origin/koordination`, M = Gedächtnis `memory/`, LAGE = K:LAGE.md (851 Zeilen). Marken: [m] gezählt · [q] gelesen · unbelegt.

## 0 Drei Zahlen vorn
- **37 ungelandete Zweige** ≤ 7 Tage, 4 davon als „Abgabe“ markiert, der älteste seit 12.11. [m `ungelandet.cjs` an dabd69bb]; 1 998 Remote-Refs [m].
- **Pflicht-OFFEN unverändert seit 31.10.** (19 Tage, letzter Commit an `docs/PFLICHT-OFFEN.md` 2026-10-31) [m]; CLAUDE.md:73 trägt weiter „ff88b82d, 18.10.“ — seit K:vision/ORDNUNG.md §4 Nr. 3 (15.11.) benannt, ungeheilt [m].
- **Landungen je Tag fallen 16 → 10 → 4** (17.–19.11.), Karte 2 steht seit 17.11. bei 35–39 statt der in K:vision/PLAN-1712.md §3 gesetzten ≥ 60 am 20.11. [m].

## 1 Die Muster (≥ 3 Tage), nach Kosten geordnet — je: Belege · bestehende Regel · warum sie nicht wirkte · EINE Heilung als Werkzeug

**M1 Tokens verbrennen ohne Landung** — 23.10. „12 h, 30 % Tokens, kaum Fortschritt“ (M:meter-statt-apparat.md:3) · 31.10. 60 % in 16 h, +6 (M:bauen-statt-auftraege.md:3) · 01.11. 8 h, 42 %, 161 (M:punkte-statt-karussell.md:3) · 15.11. sieben Wellen 66 Agenten 60,9 M Tokens, 0 Landungen (K:vision/BREMSEN.md §2) · 19.11. „in fast 12 h alle Tokens“ (M:reagieren-statt-dirigieren-1911.md:10). **5 Tage.**
Regel: M:token-waage, M:punkte-je-token, BREMSEN Bremse 1 („jeder Schnitt eine eigene Abgabe, ohne Abgabe in 4 h fällt offen“). Warum nicht: die Regel lebt als Prosa; kein Leser misst Tokens je Landung im Takt — `get_usage` wird von Hand gelesen (M:reagieren…:16).
Heilung: der Messname `wellen-landung` (BREMSEN §DIE DREI BREMSEN) wird eine Zeile im Kopf von `messplatz-blick.cjs --kurz`: Tokens neu seit letzter Landung je Modell (aus den Workflow-Journalen, wie BREMSEN §2 sie zählte) ÷ Landungen; über 10 M ohne Landung färbt sie die erste Zeile ROT. Leser: der Koordinator bei jedem Takt — er liest den Blick ohnehin (M:zug-wahrheit-am-blick).

**M2 Bauen ohne Landung — die Äste wachsen** — 01.11. 17 halbfertige Cloud-Zweige im Heil-Karussell (M:punkte-statt-karussell.md:3) · 12.11. „30 Abgaben, 9 warten, 0 gebucht“ (M:engpass-messen-cloud-zuerst.md:3) · 18.11. Bergung 15 Familien, 36 ungelandet (LAGE STAB-WECHSEL-Block „UNGELANDET“) · 19.11. 39 (M:reagieren…:12), heute 37 [m]. **4 Tage.**
Regel: M:ungelandete-zweige-kontowechsel, M:bergung-1811. Warum nicht: `ungelandet.cjs` meldet nur Menge und Inhalt-%, kein Alter, keine Frist, kein Besitzer.
Heilung: `zug/dienst/ungelandet.cjs` gibt je Zweig Alter (letzter Commit) und Besitzer aus; ein Zweig > 72 h ohne Abgabe-Commit wandert in `refs/archiv/<datum>` mit einer Zeile „fällt offen“ in LAGE — derselbe Griff, den der Vorarbeiter am 18.11. von Hand für 33 Alt-Zweige tat (LAGE STAB-WECHSEL „Aufgeräumt“). Leser: der Blick.

**M3 Integration und Messung > 40 min statt < 10** — 29.10. „Messung eines Teilsystems über 10 min“ (M:pruef-theater-ende.md:3) · 13.11. „Prüftheater bremst jeden Zwischenschritt“ (M:bild-fuehrt-klasse-ganz.md:3) · 18.11. „derselbe Film … > 40 min statt < 10“ (M:derselbe-film-takt-1811.md:3); Stempel → main p50 1 h 06 min (LAGE:76), 51 min (LAGE:93). **3 Tage.**
Regel: „Station ≤ 60 s“ (M:pruef-theater-ende). Warum nicht: keine Zahl Stempel → main steht als Tor; die Batterie fährt voll 18/18 je Zweig unabhängig vom Inhalt.
Heilung: `scripts/ci-kopf.cjs` (Kopf-Richter, landete mit `w28-urteil-je-inhalt-2`, LAGE:113) wählt die Linsen nach dem Inhalt-Hash je Domäne aus `w28-funktion-welt` (LAGE:113, z618 LAGE 01:41): nur geänderte Domänen und ihre Leser fahren. Ob die Auswahl heute schon Linsen weglässt: **unbelegt** (nicht gelesen). Messname `stempel-bis-main` p50 im Blick.

**M4 Die Linse ist der Täter, nicht die Welt** — 18.11. 05:10 Linse urteilt postMessage-Abstand (LAGE:6) · 18.11. 14:19 Selbsttest vakuös (LAGE:74) · 18.11. 18:45 Studio-Dither-Linse (LAGE:121) → 19:50 „Wurzel in der Linse, nicht im Spiel“ (LAGE:124) · 19.11. 10:01 Lichtmesser führt einen Zwilling der Kronen-Gestalt (LAGE:213), 10:24 zweiter Zwilling (LAGE:216) · 19.11. 13:00 Fahr-Linse frisst fünf Abgaben (LAGE:232). Vorher: 30.10. M:rot-selbst-sehen, 15.11. „hängst an eigendefinierten Deckeln“ (M:mut-eigene-deckel-1511.md:3). **≥ 4 Tage, 7 Fälle in 32 h [m].**
Regel: M:richter-macher („Linsen urteilen Verhalten, nie Text“), M:mut-eigene-deckel. Warum nicht: eine Linse trägt keinen Zwilling-Beweis — sie misst mit eigener Nachbildung (Kronen-Gestalt, Boden waagrecht) statt mit dem Leser des Spiels.
Heilung: jede rote Zug-Fahrt schreibt in `zug-nie-leer.log` die Spalte Täter = LINSE|WELT (das Urteil steht heute in Prosa in LAGE); eine Linse mit zwei LINSE-Toren in 7 Tagen wird im Selbsttest der Familie ROT, bis sie ihre Größe aus dem Kern-Export liest statt sie nachzubauen.

**M5 Iteration am Parameter statt Zielbild vor dem Schnitt** — 15.11. Spike NACH dem Bau, Schnitte 1 und 4 gebaut und zurückgenommen (BREMSEN §2 „Baum“) · 17.11. Feuer/Magma Stunden (M:pflicht-zeile-und-zielbild-1711.md:3) · 18.11. Strahler: zwölf Entscheide an einem Tag (LAGE:7 … LAGE:97), „eine 180°-Wendung nach der anderen“ (M:zensus-vor-bau-1811.md:3) · 19.11. Leben-Kosten-Prämisse fällt „zum dritten Mal“ (LAGE:226), Lichtmesser Spike 1–4 (LAGE:216–226). **4 Tage.**
Regel: Spike vor Bau (M:genialitaet, M:samen-befund-methode). Warum nicht: „Soll vorab“ steht nur, wo der Arbeiter es freiwillig committet (LAGE 03:06 „Soll vorab f49bba45“).
Heilung: das Stempel-Werkzeug verweigert, wenn der erste Commit des Zweigs nicht `soll.json` ist (Zahl, Pose, Schwelle) und ein späterer Commit sie ändert. Leser: der Koordinator beim Stempeln.

**M6 Der Mess-Dienst verhungert oder steht still, der Blick sagt „ok“** — 15.11. `HAND_NACH_S=600`, letzter GRÜN-Lauf 13.11. 05:28 (BREMSEN §3) · 18.11. Schneider verhungern am GPU-Schloss (LAGE:8), Landungs-Dienst wich 24-mal Hand-Aufträgen (LAGE:99) · 19.11. 25 Köpfe, KEINE Liste zu Ende (LAGE:166); drei Tage Radeon-Messung kamen nie an, Blick „RADEON ok“, 260-mal „cannot rebase“ (LAGE:197); GTX 0 von 1 428 seit 07:10 UTC (LAGE:218). **3 Tage, 5 Stillstände.**
Regel: BREMSEN Bremse 2, M:geraet-nie-warten („15 min ohne Fortschritt = Alarm“). Warum nicht: der Alarm ist Gedächtnis-Prosa; `pushe()` (radeon-dienst.sh:105–112, LAGE:197) scheitert fail-soft.
Heilung: die „Runde“ (K 0b74e987a, LAGE:189 „lebt noch NICHT im Dienst“) einschalten und den Puls um EINE Spalte erweitern: Stationen gebucht in den letzten 15 min; 0 → die erste Blick-Zeile heißt STEHT mit Gerät. `pushe()` endet ROT statt still.

**M7 Einzel-Systeme statt EINES Gesetzes (das Wort von heute)** — 13.11. „Kopplungen nicht vorausgesehen“ (M:bild-fuehrt-klasse-ganz.md:3) · 18.11. „konstruieren wie in EINEM Studio“ (M:derselbe-film-takt-1811.md:3); `hydroRegion` antwortet still mit der Heimat-Kachel (LAGE:29) · 19.11. Formel-Zwilling Leben (LAGE:220), „der Zwilling fährt“ (LAGE:211), FUND „Mass-Zwilling des fernen Fensters“ (K:FUND-REGISTER, Commit 19.11.) · 19.11. das Wort zu LOD je Studio. **3 Tage.**
Gezählt am Code [m]: das Budget je Stufe hat EINE Form (`lod.budget`, 23 Dateien lesen sie; foundry-bruecke.js:397 trägt sie je Kern), aber die Frage **„welche Stufe bei welcher Entfernung“ beantworten mindestens sechs Stellen verschieden**: `LOD_DISTANCES` stamm/vegetation-streu.js:2877 · `lodPlan(rin, rout)` fachwerk-core.js:4584 · Drei-Ring `lodTick` worlds/fachwerk/fachwerk.js:131 · `updateTreeLOD` worlds/terrain/phytogenesis.js:2731 · `SEIL_NAH_M = 40` stamm/koerper-seele.js:1809 · `ANALOG_NAH_M = 64` stamm/kreatur-leben.js:3762. 51 Stamm-Dateien nennen „lod“ [m].
Heilung: EINE Funktion `stufeFuer(radiusM, distM, schirmZeilen)` in foundry-core.js (Kosten je Schirm-Pixel, Gebot 7); die sechs Stellen rufen sie, eigene Distanz-Konstanten fallen; eine Absenz-Linse in der Atlas-Familie nennt jede neue `*_NAH_M`/`rin`-Zahl beim Namen.

**M8 Fable-Kontingent leer, Opus liegt brach** — 15.11. Fable-Arbeiter starben am Limit (BREMSEN §2 „Planet-Reise“; ORDNUNG §4 Nr. 11) · 16.11. Reset bei 99 % (LAGE:446) · 18.11. „nutzt kaum das Opus-Volumen“ (M:dirigent-werkzeuge-1811.md:3), 00:30 Fable 96 % (LAGE:149) · 19.11. Fable 87 % ↔ alle 74 %, drei Fable-Schneider (M:reagieren…:12). **4 Tage.**
Regel: M:modell-haushalt, M:notbremse (98 % misst das falsche Kontingent, ORDNUNG §4 Nr. 11). Warum nicht: das Modell wählt die Hand beim Agenten-Start.
Heilung: die Brief-Vorlage der Arbeiter (Baustein in `koordination/auftrag/`) trägt das Modell als Pflichtfeld, und `messplatz-blick` zeigt Fable-% minus Alle-% — über +10 Punkte steht „NUR OPUS“ in der Kopfzeile.

**M9 Pflicht-OFFEN steht, die Zeile wird nur zitiert** — 31.10. „A bis E müsste längst erledigt sein“ (M:bauen-statt-auftraege.md:3) · 13.11. „du jagst die 5 s“ (M:bild-fuehrt-klasse-ganz.md:3) · 17.11. „Pflicht offen fast in jeder Nachricht, ohne dass was geschieht“ (M:pflicht-zeile-und-zielbild-1711.md:3). **3 Tage.**
Zwilling: CLAUDE.md BETRIEBSGESETZ 2 „Die Frozen-Liste ist der EINZIGE Scope“ ↔ K:vision/PLAN-1712.md §7 „B ruht · F ruht“ und Karte 2 (1 718 Sprossen) als Zähler (LAGE:710).
Heilung: `vision/buche-2.cjs` schreibt den Status-Satz je Eintrag aus der Karte 2 (B = `same.preis.ankunft`, E = `same.preis.takt`, C = `mensch.netz.verkehr` + `massenverkehr`, PLAN-1712 §7); die Einträge selbst setzt weiter nur der Schöpfer.

**M10 Wissen veraltet und widerspricht sich** — 30.10. „Regeln gesetzt, nicht umgesetzt“ (M:regeln-am-ort.md:3) · 15.11. 12 Widersprüche (ORDNUNG §4) · 19.11. „vergisst du all die learnings“ (M:reagieren…:10). Heute [m]: LAGE 851 Zeilen gegen die Regel ≤ 80 (ORDNUNG §6); FUND-REGISTER Kopf „Stand 02.11.“ (Z3), 391 Einträge, 29 mit Erledigt-Wort; zwei gleich betitelte Abschnitte „18.11. 15:47/15:50 Graben des Geheges“; Gedächtnis 133 Dateien statt der vorgeschlagenen 22 (ORDNUNG §0: 102 am 15.11.).
Heilung: ein Selbsttest in `zug/dienst/` (läuft mit `start.sh`) wird ROT bei LAGE > 80 Zeilen, FUND-REGISTER-Kopf älter als 7 Tage, CLAUDE.md-Stand-SHA ≠ main-Vorfahre der letzten 3 Tage; der Koordinator sieht es im Blick.

**M11 Infrastruktur stirbt still** — 14.11. Radeon-Absturz, alle fünf Schleifen STEHT, kein Autostart (K:FUND-REGISTER „ABSTURZ DER RADEON“) · 18.11. alle fünf starben am Neustart, Radeon-Schleife 30 h tot (LAGE:4); hunderte Terminals (LAGE:116) · 19.11. Push scheitert still (LAGE:197). **3 Tage.** Heilung = M6 (Puls-Spalte), hier ohne zweites Werkzeug.

## 2 Offene Äste
- **Ungelandet nach Alter [m]:** 12.11. w28-fassade (84 % in main), w28-samen-lichtweg, w28-samen-live-tausch · 13.11. w28-griff-ellbogen, w28-samen-karten-stufe, w28-stoff-stufe-null[Abgabe], w28-weg-koerper, w28-wiese-fern, w28-wiese-mitte · 14.11. w28-baum-ganz, w28-beet-feuchte, w28-rasen-schnitt, w28-stoff-fuge · 15.11. w28-baum-schirm, w28-fruehbild, w28-reise-raeumt · 16.11. w28-damm-ferne, vier w28-heap-* · 18.11. elf Zweige (w28-bau-rezept[Abgabe], w28-kern-sprossen[Abgabe], drei Strahler-Zweige …) · 19.11. sechs (w28-laub-kante[Abgabe] +20 Commits, leben-erbe, licht-eine-skala …).
- **Zwillings-Zweige derselben Frage [m]:** Licht 5 (w28-strahler · strahler-leuchte · w28-strahler-messer · licht-eine-skala · w28-licht-spike) · Heap 4 (stichprobe · spiegel · zensus · haus) · Bau-Rezept 3 (w28-bau-rezept · vorrat12- · vorrat12b-) · Laub-Kante 2 · Kern-Sprossen 2.
- **Fund-Zeilen ohne Folge:** 90 von 391 Einträgen tragen „offen“/„ungelesen“/„ohne Schneider“ [m grep]; welche davon gefallen sind, prüft keiner (Kopf-Regel Z3 „wer heilt, löscht“ greift nicht).
- **Beschlossen, nicht im Dienst:** Gesetz der Runde (LAGE:189) · BREMSEN Bremse 1–3 als Messnamen (`wellen-landung`, `richter-lauf-je-sha`, `heim-quote`) — im Blick **unbelegt**.
- **Widerspruch Plan ↔ Kurs:** PLAN-1712 §2.1 „Richter-Fabrik zuerst“ (23:38, 18.11.) ↔ LAGE:106 (17:01, 18.11.) „Richter-Schwarm GESTRICHEN, der Richter entsteht mit dem gebauten Gesetz“; danach Richter-Falte 61 → 1 017 Zeilen (LAGE:170). Der Kurs drehte zweimal in 7 h.

## 3 Zahlenreihen seit 01.11. [m]
| Tag | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Züge gelandet (Versions-Stufe, first-parent) | 3 | 7 | 6 | 7 | 13 | 10 | 10 | 15 | 9 | 11 | 10 | 9 | 8 | 14 | 8 | 15 | 16 | 10 | 4 |
| Zweig-Merges in integ-probe | 8 | 11 | 11 | 31 | 29 | 32 | 39 | 30 | 17 | 29 | 28 | 22 | 10 | 27 | 18 | 19 | 21 | 15 | 5 |
| „Abgabe“-Commits (Betreff) | 36 | 46 | 51 | 47 | 50 | 85 | 69 | 27 | 34 | 42 | 43 | 63 | 30 | 42 | 29 | 34 | 34 | 15 | 5 |
| Karte 2 am Tagesende (Commits an karte-2-stand.json) | – | – | – | – | – | – | – | – | – | – | – | – | – | – | 3 | 21 | 39 | 35 | 35 |
19.11. bis 11:21. Karte 2 vor 15.11.: nicht gebucht (Zähler ab 15.11., LAGE:710). Die alte Karte steht bei 219/330 eingefroren (LAGE:710).

## 4 Unbelegt
Tokens je Tag seit 01.11. (keine Journale gelesen) · ob `ci-kopf.cjs` heute Linsen nach Inhalt weglässt · ob `messplatz-blick` die Bremsen-Messnamen zeigt · Täter-Verteilung LINSE/WELT vor dem 18.11. · Zeilen der Gedächtnis-Dateien außer der Beschreibungs-Zeile 3.
