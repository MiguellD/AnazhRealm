# Entscheid und Auftrag an OMEN: die FAHRT-Wand bindet die Fahrt, die fährt — nicht den Katalog (24.11. 07:40, Koordinator)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dieser Schnitt geht VOR `scherbe-liegt`: er ist das Tor für jede neue Station
(pm-erbe-geburt, pm-nerv-bewegung, pm-auge-der-art, pm-faecher-kopplung, pm-faecher-planet) und damit für die Buchung von fünf gestempelten Machern.

## Dein Block R4 — mein Wort

Keine der drei Optionen. Nicht die Wand heben (sie stieg 3 → 4 → 5 → 6 → 10 → 12, jedes Mal fielen `liste`, `run` und `buchen` an BEIDEN Geräten),
nicht `sekJeTeil` senken, nicht eine Ausnahme für Anspruchs-Stationen. Die Wand misst die falsche Größe: `pruefeStationen` (punkte.cjs:419)
summiert die Deckel des ganzen KATALOGS (289 Läufe, Σ ~21 000 s). Seit dem 21.11. fährt kein Gerät den Katalog — die Runde fährt K1 + K2 der
Front. Der Katalog wächst mit der Karte (1 718 Sprossen), die Summe reißt also bei JEDER neuen Station. Gebot 7: Kosten binden an Schirm +
Änderung, nie an Weltgröße.

## Der Schnitt (meisterkarte-quelle/punkte/punkte.cjs, Zeilen am Kopf 980311f9)

1. `pruefeStationen` (:419): die Zeile `fehler.push(...fahrtUrteil(ok));` fällt. Der Katalog trägt KEINE Summe. Es bleibt je Station ihr eigener
   Deckel (:354 „Deckel … über dem Teil der Fahrt“) und (a) „befehl auf einer Karte“ (:367).
2. `fahrtUrteil(stationen, geraete = <alle Karten>)` (:513): zweiter Parameter, sonst unverändert.
3. `run` (:4769): nach `auswahl(opt)` und VOR dem Zweig `opt.trocken` — die Fahrt DIESER Sitzung (`meine`, also die Liste der Runde oder `--nur`)
   an DIESEM Gerät: `fahrtUrteil(meine, [opt.geraet])`; rot → `throw new Error("FAHRT-ROT: …")` mit den drei größten beim Namen (Exit 2 wie
   heute). headless ausgenommen wie bisher. So zeigt auch `run --trocken` die Röte.
4. Die Kommentare :82–86 und :493–510 sagen danach, was gilt (die Chronik 3 → 12 bleibt als ein Satz: „bis 24.11. summierte die Wand den
   Katalog und riss bei jeder neuen Station“); `FAHRT_TEILE_MAX = 12` bleibt, keine neue Zahl.
5. Selbsttest (:7026): „FAHRT-ROT an der echten Liste“ wird zu ZWEI Aussagen an derselben geblähten Liste (jeder Deckel 120 s):
   `pruefeStationen(echtGross).fehler` trägt KEINE Zeile `^(radeon|gtx): die Fahrt` (liste und buchen fallen nicht mehr), UND
   `fahrtUrteil(<Stationen>, ["radeon"])` sowie `["gtx"]` sind je rot mit „die größten:“ (die Sitzung über die ganze Liste risse beim Namen).
   Dazu EIN neuer Fall: eine Teil-Liste von 20 Stationen derselben geblähten Liste ist grün (die Runde fährt). (c) an den Konstanten bleibt.
6. Suche jede weitere Stelle, die „liste, run und buchen fallen dort“ voraussetzt (grep `fahrtUrteil|fahrtSumme|FAHRT-ROT`; `eichtafel` :3973
   druckt nur) und `runde.cjs`/`buche.sh`, falls sie die Fahrt-Zeile lesen.

## Beweis (proportional)

`node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c`: vorher 269 von 273 (die 4 alten Röten beim Namen notieren), nachher dieselben 4
und die neuen Fälle grün. Dann die Konsum-Probe am echten Fall: mit `pm-auge-der-art` 42009563 in einem Seiten-Baum gemergt `run --trocken
--nur <deine Station>` → fährt (vorher Exit 2), und `liste` Exit 0. Zahl in die Message: Σ Katalog GTX/Radeon vorher (21 080 / 21 287 s gegen
20 880 s), die Fahrt deiner `--nur`-Sitzung nachher in Teilen.

## Abgabe

EIN Commit auf `punkte-maschine` per Plumbing (kein Force; lehnt der Push ab: frischer Kopf, von vorn), `[skip ci]`, Betreff „FAHRT-Wand bindet
die Fahrt, die fährt …“. Lebende Dienste: die Datei wird nur ERSETZT (nie gelöscht), die Schleifen lesen sie beim nächsten Lauf neu. Danach
Meldung an mich mit dem Kopf — ich merge dann die Stationen in dieser Reihe: pm-erbe-geburt → pm-nerv-bewegung → pm-auge-der-art →
pm-faecher-kopplung → pm-faecher-planet, je mit Blick auf den nächsten Buchungs-Puls. Danach `scherbe-liegt` (auftrag/2411-scherbe-liegt.md),
danach `ci-post-erbt`.

## Dazu gesehen (für ci-post-erbt, kein eigener Lauf)

Jeder Stempel `w28-*` stößt GPU-Probe und Batterie am Stempel-Kopf NEU an (07:33 w28-bewohner-satz: beide `queued`), obwohl der Baum der des
grünen Vorprüfungs-Kopfs ist. Der Zug sah w28-erbe-geburt deshalb 07:29 nicht bereit und fuhr z707 mit EINEM Zweig. Der Stempel erbt beides vom
Kopf mit gleichem Baum (tree-sha), ohne neuen Lauf.
