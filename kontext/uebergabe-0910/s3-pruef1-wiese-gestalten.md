**Gegenprüfung S3 wiese-gestalten (Kopf 9877c57b, Basis 76c9624d)**

**(a) Korrektheit**
- Die Senken der Nah-Wiese hängen jetzt einzeln in der Szene. Alle Wechsel-Fälle sind gedeckt:
  - Saison: `_nahWieseSenkeFaellt` nimmt die Senke aus `a.mesh.parent` (anazhRealm.js:35986).
  - Wachsen: `_senkeMesh` nimmt das alte Mesh aus seinem Eltern-Knoten.
  - Die Täter-Faltung `_taeterName` liefert `nahWiese:L1` und `nahWiese:L2` (14794).
  - `zerlegen --nur nahWiese` greift weiter, weil es die Haushalt-Klasse nach ihren Tätern auflöst (zerlege-linse.cjs:1281-1304). Der OMEN-Auftrag misst also, was er messen soll.
  - Reload, Snapshot und P2P sind unberührt: die Gestalt wird aus dem Samen abgeleitet (`_foundryVariantFor` :75830). Der Wirt liest den Gestalten-Index nirgends außer als Bau-Samen.
- Strom-Erhalt in `emitGrass` ist korrekt. Die Würfe passieren vor dem `continue`, die Segment-Schleife würfelt nicht, und L0 bleibt byte-gleich (Breite × 1).
- **ROT, Rispe auf 3 m:**
  - Im Bildpaar `wiese-basis-3m.png` ↔ `wiese-final-3m.png` (Ausschnitt 840–1120 × 460–660) wird aus dem nickenden 7-Strahl-Büschel eine V-/Möwen-Form.
  - Ursache: die Granne mit 2 Segmenten knickt statt zu bogen (foundry-core.js:2288, Biegung je Segment; Zeile :394 `segmente: 2`).
  - Damit trifft das eigene Ausschlusskriterium des Champions gegen 3 × 2 („V-Flocke“) auf 3 m auch die gewählte 4 × 2.
  - Der Halm-Kontrast fällt auf Armlänge 7,65 → 6,60 (−14 %) und fern 14,59 → 12,91 (−11,5 %).
  - Die Aussage „der Spieler sieht dieselbe Sommerwiese“ stimmt deshalb nicht.
  - Nach E8 müsste die Zeile offen steigen. Eine Variante mit 3 Segmenten ist ungeprüft: 3 × 3 (+2 Dreiecke je Rispe, Kern ≈ 852/1 080) oder 4 × 3 (Welt ≈ 55k). Nach meiner Schätzung bleiben beide unter der Ratsche 57 066; heute liegt die Welt bei 51 432.

**(b) Klasse ganz geschnitten?**
- **ROT, Gestalten-Lüge nicht ganz geschnitten:**
  - Fahrzeuge haben V = 16 (vehicle-core.js:39), aber nur 8 Lacke (`lackIndex`, Modulo 8, :277-281).
  - Ich habe den Bau-Abdruck über alle Gestalten 1..V an der echten Brücke gebaut. Bei allen 5 Fahrzeug-Rezepten gilt Gestalt 1 = 9, 2 = 10 … 8 = 16. Das sind 40 byte-gleiche Zwillinge.
  - Die Wand vergleicht nur Same 1 mit Same 2 (diag-asset-contract.cjs:447) und sieht sie nicht. Ihre Meldung „Lügen 0“ ist falsch.
  - B2c im Vertrag behauptet „vehicle 16 tragen eine echte Achse“ (docs/studio-vertrag.md:131).
  - Fachwerk ist sauber: 35 × 16 verschieden, Ausstattung 2/3/2 verschieden, phyto 14 verschieden.
  - Nötig sind: V aus dem Lack-Gesetz (8), eine Wand über alle Gestalten 1..V (Zahl der verschiedenen Abdrücke = V) und render-config im selben Akt.
- Die übrigen Abweichungen sind mit Zahl und Grund benannt: Zeile 1 040 statt 1 000, `critical.seeds [1, 7]` bleibt (Same 7 ist auch bei V = 8 eine echte Gestalt), die Regel heißt `^nahWiese:L[12]$`.
- Kein Zwilling, kein Flag, kein fail-soft. Der alte Name und `nw.gruppe` sind in gate:altlasten gesperrt.

**(c) Linsen**
- Kosten-Wand Gras: an der Basis rot, jetzt grün. Gestalten-Wand: Selbsttest drachentor wird rot, beide Abdrücke werden gesehen. Die rispe-Form in gate:studio-vertrag hat ihren Selbsttest.
- Alle drei laufen in der CI (check.yml:408, `npm run check`).
- Mein lokaler Lauf von gate:asset-contract (Port 7806) ist grün: 128/128 Goldens, grass[1] 1 040/1 040, grass[2] 118/130.
- Schwäche: die Gestalten-Wand ist für Gestalten über Same 2 blind (siehe b).

**(d) Byte-Disziplin**
- Die geprägte render-config weicht nur in den deklarierten Feldern ab: 33 × gestalten 16 → 1, grass tris und rispe.
- Neu sind nur die 4 Gras-Goldens; manifest steht bei 128.
- Die Kerne sind nicht prettier-formatiert.
- Linux-CI 37793697323 auf 9877c57b: check, playtest 1/3–3/3 und erst-zeichnung alle success.

**(e) Zahlen**
Die Band-JSONs habe ich nachgerechnet:

| Posten | vorher | nachher |
|---|---|---|
| nahWiese Dreiecke | 84 336 | 25 840 + 25 592 = 51 432 |
| Puffer nahWiese | 0,31 MB | 0,21 MB |
| f:drachentor:L0 Befehle | 46 | 24 |
| Puffer drachentor | 8,56 MB | 4,33 MB |

- Die Genesis-Bilder sind im Rauschen gleich; nur die Portal-Flächen sind animiert.
- Keine Radeon-Zeit als Beweis eingetragen.
- Offen: Halm-Kontrast unter dem Soll und schlechter als die Basis (siehe a).

**(f) Handwerk**
- Kein Siegel-Wort (auch nicht als Wortteil), Co-Authored-By in allen 5 Commits, check.yml unberührt, keine neue Datei mit `?v=`-Pflicht.

**(g) Konflikt-Zonen für den Integrator**
- render-config und manifest stammen aus zwei Akten (49fc632e, 9877c57b); der Integrator prägt sie EINMAL.
- foundry-core Budget-Block: die grass-Zeile und der Satz „flower und rock … offen“ liegen neben tree (pflanzen) und flower/rock (tor).
- Kommentar-Blöcke über den Budget-Zeilen in porta-core und schmiede-core, die tor senkt.
- Die Gestalten-Zeilen in tetrapoda-core und koerper-core liegen neben kreatur und der tor-fernform-Zeile. Die vehicle-Korrektur auf V = 8 berührt vehicle-core:39 neben der tor-Zeile :46.
- haushalt.json: nahWiese steht jetzt VOR karten, sonst bucht die Regel `stufe [2]` nahWiese:L2 als Karte. Haus legt dort den Messort dorf an.
- diag-asset-contract (Gestalten-Wand), diag-studio-vertrag (B2c-Regel rispe und Selbsttest-Zeile), B2c-Text, diag-altlasten (+2 Tokens), mint-asset-goldens (GRAS nach WALDBODEN).

Geprüft: der Gras-Schnitt der Nah-Wiese, die Band-Linse je Stufe und die Gestalten-Wand an Basis und Kopf; 40 Fahrzeug-Zwillinge habe ich über die echte Brücke nachgewiesen.
Gemessen: gate:asset-contract lokal 128/128 und Exit 0; Gestalten aller Gestalten 1..V: Fahrzeug 8 von 16 verschieden, fachwerk 16 von 16; nahWiese 84 336 → 51 432 nachgerechnet.
Pflicht-OFFEN Rest: A · B · C · E (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND

Proben (nur lesend):
- C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\4beb74f4-61ea-4e61-954b-e4aececc988f\scratchpad\gestalt-alle.cjs, g.log
- gestalt-phyto.cjs
- crop-wiese-basis-3m.png, crop-wiese-final-3m.png
- ac.log

merge-reif: nein — (1) Gestalten-Lüge nicht ganz geschnitten: vehicle-core.js:39 V = 16 bei 8 Lacken (vehicle-core.js:277-281) ergibt 40 byte-gleiche Zwillinge (1=9 … 8=16, alle 5 Rezepte), die Wand vergleicht nur Same 1/2 (scripts/diag-asset-contract.cjs:447), der Vertrag behauptet eine echte 16er-Achse (docs/studio-vertrag.md:131); (2) Rispe auf 3 m sichtbar verschlechtert: die 2-Segment-Granne knickt zur V-Form (foundry-core.js:394 `segmente: 2`, Biegung :2288), das Soll-Bild „3–5 m Federbusch“ hält nicht, Halm-Kontrast 7,65 → 6,60, eine 3-Segment-Variante unter der Ratsche 57 066 ist ungeprüft (E8).