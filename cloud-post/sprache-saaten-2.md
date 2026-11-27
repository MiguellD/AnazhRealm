# sprache-saaten-2 — Stand-Blatt (ZWISCHENSTAND)

Sprosse: `karte2.mensch.kultur.sprache#2` (bucht mit dem gebankten Punkt `sprache#3` zwei Sprossen) · Zweig `sprache-saaten-2` · Kopf 1
auf main 38194f83.

## Täter (gelesen am main 45bad33f, vor dem Schnitt)

- Kein Bewohner sprach einen Satz: die Rede der Menge (`stamm/klang.js` `_bewohnerLautTakt`) gab der Stimme Silben ohne Sprache —
  `klang-core.js` `stimmPuffer` wählte die Vokale aus EINER Tafel, jede Stadt klang gleich. Der Leser des Spiels (`_bewohnerLauf`)
  kannte kein Feld „rede“: der Ruf fällt in den Zweig des Alters („ALTER: die Epoche ohne Jahr (fail-closed)“).
- Das Gesetz trug schon Laute, Silben und Wortschatz je Sprache (fachwerk `spracheVon`, `sprachWort`: 6 Familien × 32 Blätter,
  Swadesh-Liste) — es nannte damit Orte und Leute (sprache#1, #3), sprach aber nie.

## Geschnitten

- fachwerk `SATZ_GESETZ` · `sprachSatz(L, saat)` · `sprachKerne(satz)`: der Satz aus den Wörtern der Grundliste SEINER Sprache, in der
  Folge seiner Familie (Erbe der Ursprache, gewogen nach WALS 81A Folge · 87A Adjektiv · 143A Verneinung · 69A Zeit am Verb · 85A
  Adposition), Rahmen je Verb (wer es tut, woran), die Wörter der Grammatik aus der Ursprache, gewandelt wie jedes Wort des Zweigs.
- `_bewohnerLauf(S, b, "rede", nr)`: die nr-te Rede des Bewohners in der Sprache seines Orts — EIN Ruf, kein zweiter Erzeuger.
- `_bewohnerLautTakt`: der Teil der Rede ist ein Stück SEINES Satzes; seine Silben-Kerne gehen als `ruf.kerne` an die Stimme, ein Satz
  läuft über die Teile, bis er gesprochen ist. `stimmPuffer` spricht die Kerne (STIMME.kern: der nächste Vokal nach Peterson & Barney);
  ein Kern ohne Vokal der Tafel bricht laut.
- Linse (Familie gate:klang-zensus, Mk): „Mk Rede ohne Satz“ · „Mk Satz ≠ Wirt“ · „Mk Satz fremder Laute“; Selbst-Test S29 (die
  Rede verliert die Kerne) und S30 (die Rede spricht die Nummer daneben) → ROT beim Namen.
- Station-Kandidat `cloud-post/sprache-saaten-2-station/` (Diff gegen den Kopf von Zweig `punkte-maschine` 7ea1c36d, BEGRUENDUNG.txt):
  20 Sätze je Ort durch den Leser des Spiels, der Zeuge der Rede (die Menge spricht den Satz des Lesers), der Trenner nach Cavnar &
  Trenkle (N 1–5, P 400, Hälfte gegen Hälfte). Soll und Richter-Satz unverändert.
- Band: Cavnar & Trenkle 1994 (Table 2): Dokumente ≤ 300 Bytes, Profil 400 — 98,3 % richtig; 3 478 Artikel, 8 Sprachen.

## Gemessen (vorher → nachher, gleiche Bedingungen)

- Rumpf DIESES Stations-Kandidaten (Sitzung wie fahreSitzung: save-server + `werkbank start --echt`, Xvfb, SwiftShader; vor dem
  Deckel `/umstellen stadt-voll`): S2 **fehlender Leser („… ALTER: die Epoche ohne Jahr (fail-closed)“) → getrennt 0,923 (48 von 52
  Hälften) · Sätze 20 · U_eff 26 (4 Familien)**; Zeuge 7 von 7 Sprechern sprechen den Satz des Lesers; Probe 14,1 → 14,2 s (Deckel
  45 s). S1 und S3 unverändert (zugeordnet 0,997 → 0,996 · Saaten 4; RF 0,155 · Familien 6). ROT allein am Adapter (keine Karte).
- Linse Mk am Markt von stadt-voll: main „Mk Rede ohne Satz: 263 von 263 Reden der Menge ohne die Kerne eines Satzes, 0 Sprecher mit
  Satz“ → am Kopf GRÜN: 339 Reden, 0 ohne Kerne, 38 von 38 Sätzen gleich dem Satz des Wirts, 0 Kerne fremder Vokale.
- Trennbarkeit des Gesetzes (node, Hälfte gegen Hälfte, P 400): gemischt 12 Sprachen 1,000 · nur mitteleuropa 21 Sprachen 0,881 · nur
  nordisch 22 Sprachen 0,977 · nur mediterran 24 Sprachen 0,854.
- Probe-Tore am Kopf (auf main 38194f83, Xvfb, SwiftShader, eins nach dem anderen, probeUrteil je Log): gate:klang-zensus GRÜN
  (384 s) · gate:studio-begehen GRÜN (220 s) · gate:pruefbuehne-licht ROT „S0 Himmel … Umgebung 1.16e-7, Himmel des Orts 1.07e-7 (das
  1.08-Fache)“ — am main 38194f83 dieselbe Zeile mit denselben Zahlen, geerbt (welt-licht.js, nicht von diesem Schnitt) ·
  gate:weltbild-frost:echt ROT „DER BAU STEHT NICHT … WebGPU Device Lost“ (467 s), am main 38194f83 ohne Urteil nach 28 min hängend.
- check:statik GANZ GRÜN (auf main 38194f83) · format:check GRÜN · lint 0 Fehler (4 Warnungen wie main).

## Offen

- Station nicht gefahren: GPU — der Vor-Richter fährt `karte2.mensch.kultur.sprache#2` mit dem Kandidaten an stadt-voll.
- `anteil` des Satz-Gesetzes (die Hälfte der Nomen mit Adjektiv, ein Achtel der Sätze verneint, die Hälfte mit Ort): QUELLE UNGEPRUEFT
  im Wert — Messname mensch.kultur.sprache#2.
- Eine Familie allein trennt knapper (mediterran 0,854 an 24 Sprachen): stehen am Messort nur Orte EINER Familie, liegt das Maß am
  Soll — Messname mensch.kultur.sprache#2.
- `gate:weltbild-frost:echt` lokal nicht fahrbar: SwiftShader verliert das WebGPU-Device, am main gleich — der Richter ist die Karte im Probe-Ruf.
- `probe-tag` nicht fahrbar: `artifacts/profiband/werkzeug/zug.sh` liegt in keinem Zweig; der Ruf ist von Hand gegen
  `spec/ci/ci-zeiten.json` gehalten (klang-zensus 449 s · studio-begehen 185 s · weltbild-frost:echt 135 s · pruefbuehne-licht 43 s).

Kopf (40 Zeichen): folgt mit dem Vorprüf-Kopf · beanspruchte Sprossen `karte2.mensch.kultur.sprache#2` (mit `karte2.mensch.kultur.sprache#3`
gebankt) · Karte 2 gebucht 134 von 1 718 · Status ZWISCHENSTAND
