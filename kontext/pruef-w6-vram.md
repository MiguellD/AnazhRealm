# Gegenpruefung welle6-vram

**Gegenprüfung welle6-vram (dc03ffaf, Basis 7a63b9ed)**

Ich habe nur gelesen und vier reine Node-Gates selbst gefahren: `diag-profiband --selftest` (19/19), `diag-profiband`, `diag-pipeline-constitution` und `diag-vendor-anker` liefen alle mit EXIT 0, `diag-betriebsgesetz` war GRÜN. Den GitHub-Lauf 37390519462 konnte ich nicht einsehen, weil `gh` in der Shell fehlt.

**(a) Diff gegen Behauptung**
- **Belegt** (artifacts/w6-vram/*-band.txt, *-puffer.json):
  - Wandern: VRAM 230,5 → 169,6 MB, buf:ruhend 38,0 → 0, buf:verwaist 14,8 → 0, tex:depthBuffer 7,9 → 0.
  - bindingBuffer: 2,6 MB in 7481 Puffern → 1,9 MB in 4254.
  - Ruhe: VRAM 159,2 → 149,5–155,3 MB, Texturen 115,4 → 107,5 MB.
  - Befehle/Dreiecke in Ruhe ohne Tiere: 236 / 2106k → 236 / 2106k.
- **Falsch zugeordnet:** Beim Wandern 247 → 244 sagt der Bericht „die Abweichungen nachher sind Tiere". Die Tiere sind auf beiden Seiten schon abgezogen. Die −3 Befehle sind `f:griechisch:L2` 36 → 33, also ein Haus mal drei Stoffe:
  - vorher-wandern-zaehlen.json gegen nachher-wandern-zaehlen.json,
  - Instanzen 5251 → 5248 (4 von 4 Nachher-Läufen),
  - `szene:f:griechisch:L2` 288 → 264 Puffer.

  Wahrscheinlich ist das Weltzustand. Die Platzierung fasst der Branch nicht an, und in den Läufen stehen keine Seitenfehler. Ein `spawn_temple` (anazhRealm.js:2138) kann Tempel bauen, auch autonom über `source === "nexus"` (anazhRealm.js:2132). Der Vorher-Lauf dauerte 845 s, die Nachher-Läufe 308–667 s. Belegt ist das aber nicht.
- **„+25 Anker":** Im Diff stehen +22 Einträge (scripts/diag-vendor-anker.cjs:164–195; 78 → 100 Zeilen).
- **Ratschen-Serie lief nicht ruhig:** Laut dc03ffaf stammt sie aus nachher3, endserie-2, endserie-3 und nachher4. Drei davon (endserie-2 00:28–00:31, endserie-3 00:32–00:36, nachher4 00:43–00:47) liefen, während die lokale CI auf derselben iGPU fuhr (ci/01.log 00:25 … ci/74.log 01:08). Das verletzt Lehre 19.
- **Unerklärter Kaskaden-Sprung:** In endserie-2 (Zweit-Boot) zieht k1 64 statt 14 Befehle, in allen sechs Proben (baum k1 30, bau 10, formationen 14). `--nur vram` hat diese rote Klassen-LINSE übergangen. Am Endstand gibt es keinen Zweit-Boot-Lauf.

**(b) Bilder**
- Die vier Blicke × Mittag/Abend in Ruhe (vorher gegen nachher3) sind gleich bis auf Wolken und Laub-Wind. Silhouette, Dichte, Schatten und Schärfe sind unverändert.
- Der Schirm-Shot vorher (12:12) gegen bild-nachher-ruhe-schirm (12:11) ist gleich, die Tiefe stimmt.
- bild-nachher3-ruhe-schirm ist nicht vergleichbar (03:16 Nacht, ein Bär im Bild). Im Bericht ist er nicht gelistet.
- In bild-vorher-wandern-mittag-nah-nord.png steht oben rechts ein weißes Haus, in bild-nachher-wandern-mittag-nah-nord.png fehlt es. Das ist das Haus aus (a).
- Der Endstand (c66e5b0f, 8e397c6a) hat kein Bild-Paar. nachher3 wurde um 00:13 aufgenommen, vor diesen Commits.

**(c) Wurzel, Zwilling, fail-soft**
- Die Wurzel sitzt richtig: r184 hält die Residenz. Es gibt einen Chokepoint `_gpuAbschied` (anazhRealm.js:69411), dazu `_instanzAbschied` (69426) für Speicher-Puffer, die nur über ihre Bindegruppe fallen können. Das ist eine andere Ressourcen-Klasse, kein Zwilling. Den Kehraus ruft `_loopRender` (87327).
- **Bundles:** Die Kinder einer Bundle-Gruppe stehen im Graphen und fallen deshalb nie. Wachsen und Fallen setzen `needsUpdate`, bevor der Abschied kommt (62645–62650). Ich finde keinen Pfad, auf dem ein toter Puffer ins Bundle kommt.
- **Leinwand ohne Tiefe** (86560, Rückweg 87305–87312): Außer der Post-Kette zeichnet nichts in die Leinwand. Die Bühnen nutzen eigene Renderer, die Linsen eigene Render-Ziele mit Tiefe.
- **Stille Wächter:** Bei Vendor-Drift laufen sie ohne Log ins Leere (69413, 69472, 86317). Abgesichert ist das nur über gate:vendor-anker.
- **Kosten:** Der Kehraus läuft synchron im Render-Takt, alle 2 s ein Gang durch den Graphen und `memoryMap` (Lehre 14). Ungemessen, also ein Risiko für p95.
- **Klasse nicht ganz zu:** Die Werkstatt-Vorschau baut Senken mit `_instanzMesh` (77387) auf einem eigenen Renderer. Dort bleibt das alte r184-Leck; das Register ist nur am Welt-Renderer installiert (83808).

**(d) Byte-Disziplin**
- Keine Kerne, kein vendor/, keine Goldens, kein voxel-worker, kein `Math.*` angefasst.

**(e) Ratsche und Haushalt**
- Die Ratsche wurde nur gesenkt oder neu gesetzt (`tex:wege-karte` 4, `buf:szene` 40,6).
- `gesamt.vramMB` misst jetzt „gebunden" ohne `buf:tier`. Das ist im Commit begründet und folgt derselben Logik wie die Befehls-Summe (band-urteil.cjs:407).
- Karten-Atlas und Laub-Atlas wurden von Hand nicht gesenkt; das ist begründet.
- Haushalt unverändert.
- Nach dem Wandern ist die LINSE rot: `buf:szene` 49,9 > 40,6 und gebunden 159,5 > 148,7 (nachher6-wandern-band.txt). Der Bericht nennt das offen.

**(f) Regex, Siegel, Gates**
- Einzige neue Regex mit Backslash: diag-pipeline-constitution.cjs, intakt.
- Keine Siegel-Wörter, auch nicht als Wortteil, in den sechs Commit-Messages oder in den hinzugefügten Zeilen.
- `typeof`-Prüfungen sind korrekt. Kein YAML geändert; die Standard-Ports bleiben.
- gate:freie-slots A (diag-freie-slots.cjs:242) ist grün, mit Selbsttest. Der Selbsttest von gate:start-rezept ist laut Bericht grün.

**(g) Konflikt-Zonen**
- **befehle:**
  - `_archInstanceGroupGrow` hat einen Textkonflikt (befehle `g.mesh.dispose()` gegen vram `_instanzAbschied`, vram 62650).
  - Die Satz-Gruppen leben **ohne Eltern** (befehle anazhRealm.js:62823/62855). gate:freie-slots A meldet sie dann fälschlich als „fiel ohne Abschied" (diag-freie-slots.cjs:242). Die Linse muss Satz-Mitglieder (`userData.bauSatz`) als lebend kennen.
  - `_dorfRauchZeichnen`: `R.mesh.dispose()` (befehle:48636) muss zu `_instanzAbschied` werden.
  - Weitere `g.mesh.dispose()` (befehle:52311, 63665) treffen den Altlasten-Token.
  - ratsche.json: befehle schreibt `gemessen` neu; `gemessen.vram` und die VRAM-Schlüssel müssen erhalten bleiben.
- **busch-wiese:**
  - `_nahWieseKachelEntsorgen` fällt dort weg und ist als Altlast verboten.
  - Die neuen Senken nutzen `alt.dispose()` und `a.mesh.dispose()` (busch:32735/32749). Beides muss zu `_instanzAbschied` werden, sonst ist A rot.
  - diag-altlasten: Textkonflikt beim Anhängen der Tokens.
- **boden-schatten:**
  - Zehn Gate-Dateien haben Konflikte, weil zwei Port-Konventionen kollidieren: `DIAG_PORT` dort, `<GATE>_PORT` hier (z. B. diag-godray.cjs:20). Nach dem Merge wäre das ein Zwilling; es muss EINE Konvention werden.
  - `_chunkSatz*` und die Pass-Abschnitte vertragen sich mit dem Kehraus, weil der Satz im Graphen steht.
- **baum-l1:**
  - `diag-page-error.cjs` (Port) und ratsche.json kollidieren textlich.
  - Wechselnde L1-Gruppen laden die vom Kehraus freigegebenen Cache-Gestalten neu hoch; die Upload-Spitzen sind zu messen.
- **Welle 5:** architektur, boden-wasser und klang haben nur Konflikte in den Altlasten-Tokens bzw. im v1-resolve-Port. gegenstaende und koerper haben keine.
- **Nach dem Merge:** Die VRAM-Ratsche 148,7 mit Toleranz +2 bzw. 1 % neu prüfen, denn andere Familien legen Puffer an (Senken der Nah-Wiese, Satz-Abschnitte).

**Pflicht-Prüfungen in der Integration (ruhig, ohne parallele Gates auf der iGPU)**
1. `werkbank takt`: Kosten des Kehraus und die 2-s-Spitze.
2. Ein Zweit-Boot-Band am Endstand: k1 = 14?
3. Ein Wander-Paar mit gleicher Laufzeit: 11 oder 12 griechische Häuser?
4. Ein Bild-Paar am Endstand.

merge-reif: ja
