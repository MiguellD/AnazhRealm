# Auftrag 0710-12, Nachtrag: die Gegenprüfung von welle-m-schatten 36191f63 sagt merge-reif ja — mit Gelb

Die unabhängige Gegenprüfung lief am 09.10. und hat nur gelesen. Bestätigt sind:
- Eine einzige Quelle: `_schattenBias`, `biasM` ist gefallen.
- Die Quell-Wand: auf main rot mit 6 Befunden, am Kopf 0.
- Die Gegenprobe „Zähne“ zeigt echte Streifen.
- CI 37964999684 5 von 5 grün.
- merge-tree sauber gegen integ-probe b457515b, studio-s3-kreatur und studio-s3-pflanzen.

Er geht mit V18.538 in integ-probe, zusammen mit S3-kreatur, denn erst dein Bias macht dessen Tier-Schatten sichtbar.
**Reihenfolge bei dir: zuerst der Messauftrag V18.537 (kommt gleich), dann dieser Nachtrag, dann 0910-1 B.**

## Vor der Integration (klein, Pflicht)
1. **Regex** `scripts/diag-schatten-bias.cjs:94`: `/s+/g` hat seinen Backslash verloren und verstümmelt den Täter-Text
   („hadow.bia“). Gemeint ist `/\s+/g`. Schreib ihn mit dem Edit-Werkzeug und führe ihn danach an einem Beispiel-Text aus.
2. **Kommentare**, die nicht mehr stimmen:
   - `anazhRealm.js:350` („normalBias“), `:91599` und `:101687` (Rest `biasM`).
   - `anazhRealm.js:28444–28446`: Er behauptet einen Normal-Versatz entlang der Fläche. r184 nimmt aber die geflachte End-Normale
     (`TERRAIN_NORMAL_FLATTEN` 1,0, `:28447`), am Hang zeigt der Versatz also nach oben. Siehe 4.
3. **Bericht** `bericht/0710-12-schatten-bias.md`: Die Nachher-Tabelle (Z. 101–105) stammt nicht aus `wand-nachher-kopf.txt`.
   - Wolf seitlich: Bericht 0,995, Rohdatei 0,981.
   - Pfosten mittags: Bericht 0,957 (0,68), Rohdatei 0,985 (0,554).
   - Zähne: Bericht 11,20 %, Rohdatei 10,62 %.
   - Fern-Busch: Bericht 27 px, Rohdatei 29; „vorher 1“ steht in keiner Rohdatei.
   - Z. 116 (1 / 1,5 Texel) fehlt im Sweep.
   - Z. 58 nennt „fünf“ Befunde, es sind sechs.
   - Z. 54/162: Die CI fährt nur `--selftest` (check.yml:297–303), das Gate steht nicht in `npm run check`.

   Jede Zahl aus der Rohdatei des Kopfs, sonst ist es keine Zahl.
4. **swiftshader-Modus** des Gates (Kopf-Kommentar :9): `page.goto` ohne `?holz` (`:1225`) landet über `anazhRealm.js:14026` auf
   kienspan, also ohne Schatten-Karte. Der Lauf ohne `--echt` bricht nach 1200 s ohne Urteil ab (EXIT 124). Entweder trägt er
   (Holz-Wahl explizit), oder der Modus fällt, und der Kopf-Kommentar sagt ehrlich „nur --echt“.

## Messen (gelb, als Zahl in den Bericht, kein Merge-Tor)
5. **Hang-Boden:** Akne und Peter-Panning auf dem echten Boden am Hang (20°/35°), vorher ↔ nachher. Der Boden ist DoubleSide
   (`:30009`), und der Versatz läuft entlang der geflachten Normale.
6. **Nah-Wiese als Empfänger:** Sie ist in jedem Schuss ausgeblendet (`diag-schatten-bias.cjs:353–355`). Ein Spielbild mit Gras
   gehört dazu.
7. **Tiefe Sonne für Werfer:** 11°, bisher nur Akne gemessen. Dazu die k0/k1-Übergangszone und Nacht/Mond.
8. **Probe sauber machen:** `isoEbene` (`:686–692`) schaltet die Ebene der ganzen Instanz-Gruppe, dadurch werfen fremde Büsche
   derselben Art mit. Das ist konservativ, verunreinigt die IoU aber.

## Benannt, eigene Klasse (geht nicht an dich)
Die Ego-Sicht ist der Standard-Blick (`cameraMode: "first"`, `:217`). Darin wirft der Spieler keinen Schatten, weil
`_applyEgoSicht` (`:94546–94555`) die Haut ausblendet und damit auch den Wurf. Das ist v1-Schritt 2; ich vergebe es hier.

Bericht: `bericht/0710-12-nachtrag.md` (Kopf, Gate-Exits, CI), die Nachricht nennt nur „neue Datei + Urteil“.
