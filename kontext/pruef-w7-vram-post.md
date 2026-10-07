# Gegenpruefung welle7-vram-post

**Gegenprüfung welle7-vram-post (f9eec2f3..38bd74ad, nur lesend)**

**(a) Diff gegen Behauptung: belegt**
- Ich habe die Zahlen gegen die Artefakte geprüft (`v2-*` und `n7-*` in `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\vigorous-nash-w7-vram-post\artifacts\w7-vram-post\`). Sie stimmen:
  - Ruhe-VRAM 151,2 → 146,9, Tiere 3,2 / 4,0.
  - Nach dem Wandern 182,7 → 157,6, Tiere 10,1 / 8,2, buf:szene 63,9 → 40,5.
  - Boden 26,83 → 20,71, Bau 12,41 → 0,45, Wasser 3,25 → 1,49, Formationen 1,48 → 0,55.
  - Spieler 7,99 → 6,37, tanne:L0 1,90 → 1,71, eiche:L0 1,67 → 1,50.
  - In Ruhe Wasser 3,25 → 0,54; der Bau-Satz fehlt nachher in der Liste.
  - Im Wander-Band sind die VRAM-Zeilen nachher nicht mehr rot.
- Nicht als Datei belegt: die Index-Zahlen „113 von 114“ und „2,83 → 0,26 MB“ sowie die Nachher-Helligkeiten der Einzelschüsse. Es gibt kein `nachher-kennzahlen.json`, nur eines für das Dorf (92,4 stimmt).
- Selbst nachgefahren: `node --check` und `prettier --check` auf `anazhRealm.js` am HEAD, beide mit Exit 0.
- Die GPU-ms-Spalte des Bands taugt nicht als Beleg. Sie springt in Ruhe 108,2 ↔ 36,5 und beim Wandern 36 ↔ 83,3, also in beide Richtungen. Die Frame-Zeit muss gpu-bank messen (Prüfpunkt 3 der Integration).

**(b) Bilder: Nachher gleich gut, keine Verschlechterung**
- Ich habe alle 12 Paare gelesen (Armlänge, 8 m, 25 m, 45 m, abends, Dorf, Dorf nah, Wasser, Wander-Dorf, Wander-Wasser), dazu die Geist-Paare und himmel-nord.
- Silhouette, Dichte und Schatten sind deckungsgleich. Häuser und Wasser stehen auch nach dem Verdichten. Am Himmel kein Banding, kein TRAA-Geist. Der Fuchs (nachher 45 m, vergrößert) ist sauber gehäutet.
- Zwei Auffälligkeiten, beide nicht dieser Welle:
  - **Dunkle Linie über dem See** (`nachher-wasser`): Sie steht auch in `vorher2-wandern-wasser`. Es ist die bekannte Wasser-Naht, die welle5-boden-wasser in 2f89cc5c schneidet.
  - **Ein Reh in der Baumkrone** (`nachher-25m-hain` und `-geist`, oben Mitte): Die Haut ist formtreu. Ein Fehler in den unorm16-Gewichten könnte das Tier nur verzerren oder zerstreuen, nicht als Ganzes anheben. Die Höhe kommt aus der Lage des Tiers, also aus dem Weltzustand (Tiere frei). Das gebe ich der Integration als Beobachtung mit.

**(c) Wurzel am Chokepoint, kein Zwilling, Vendor unberührt**
- `_chunkSatzVerdichten` ersetzt `_chunkSatzLeert` am EINEN Takt (`_tickChunkSatz`). gate:altlasten hält `_chunkSatzLeert` und `s.leerSeit` fern.
- Es gibt keinen zweiten Sicht- oder Werfer-Mechanismus neben `_chunkSatzPass`.
- `_hautGewicht` deckt beide skinWeight-Erzeuger ab: `_ofenStarrBinden` und `_foundryBuildMesh`.
- `_index16` greift am EINEN Index-Weg (`createIndexAttribute`) zur Laufzeit ein. `vendor/` hat 0 Diff-Zeilen, die vier Vendor-Stellen sind über gate:vendor-anker gepinnt.
- Nirgends schreibt jemand einen Uint16-Index teilweise neu: der einzige Index-Schreiber ist `_chunkSatzSchreib`, und der trägt Uint32. Auch BatchedMesh fällt aus.
- **Hinweis, nicht rot: zweimal dieselbe Index-Regel.** Die Worker-Schale `schlank` (`anazhRealm.js:66255`, ≤ 65 536 Vertices) und `_indexSchmal` (`anazhRealm.js:70381`, ≤ 65 535) schmälern beide den Index, mit verschiedenen Schwellen.
  - `_indexSchmal` braucht es trotzdem, weil der Ofen die Kreaturen im Haupt-Thread backt.
  - Ein Netz mit genau 65 536 Vertices hätte unter WebGL2 Index 0xFFFF, den dortigen festen Neustart-Index. Das stammt aus der Zeit vor dieser Welle; auf WebGPU ist es durch `_index16` jetzt sogar behoben.

**(d) Byte-Disziplin und Plattform**
- Kein Kern berührt, Goldens unverändert, kein Worker-Spiegel betroffen.
- Unter WebGL2 tragen normiertes Uint16 und Uint16-Index nativ; `_index16` ist dort wirkungslos.

**(e) Ratsche:** keine Ratschen-Datei geändert, nichts gesenkt.

**(f) Regex, Siegel, typeof, YAML, Ports**
- Keine neue Regex, kein YAML, keine Port-Änderung.
- `typeof be.createIndexAttribute !== "function"` ist korrekt.
- Siegel-Wörter: keine. Als Wortteil steht nur das kleine „rundet“ (38bd74ad, Kommentar `anazhRealm.js` bei der TRAA-Kette). Kleines „rund“ ist nach der Regel legal, RUND gilt nur in Großschreibung.

**(g) Konflikt-Zonen**
- **welle7-baum-mittel 3d2cf0e4:** `_passSicht` / `_instanzWahlPass` und vendor-anker bei Zeile 181. Kein textueller Überlapp: Das nächste Stück liegt 45 Zeilen entfernt vom Kommentar an `_kaskadenZiele`.
- **welle7-boden-hoehle:** `_chunkSatz*` und `gate:chunk-satz` (f)/(k), wie benannt. Bisher 0 Commits.
- **welle5-koerper:** Andere Abschnitte in `diag-kreatur-kosten.cjs` als diese Welle. Die Haut läuft automatisch über `_indexSchmal` und `_hautGewicht`.
- **welle5-architektur:** Andere Stelle in `diag-chunk-satz.cjs` (Zeile 288). Neue Bau-Sätze laufen durch das Verdichten.
- **welle5-boden-wasser und welle5-klang:** Beide hängen wie diese Welle ans Ende von FORBIDDEN in `diag-altlasten.cjs` an. Das ist ein trivialer Konflikt, alle Einträge bleiben.
- Die Wasser-Naht liest `entry._caDach`, nicht die Satz-Views. Sie kollidiert also nicht mit dem Verdichten.

**Offen an die Integration (nicht rot)**
1. **Die Hysterese fehlt nach einem Wachsen.** Ein verdichteter Satz hat Kapazität `ceil(1,25·hoch)`. Wächst er durch Zerstückelung um das 1,5-Fache, landet er genau auf der Schrumpf-Schwelle `1,5 × 1,25 × hoch`.
   - Der Kommentar in `anazhRealm.js:88517` („schrumpft erst wieder, wenn er ein Drittel verliert“) gilt nur ohne Zwischen-Wachsen.
   - Im Modell pendelt ein Wasser-artiger Satz mit hohem Umschlag 4–8 Mal in 30 000 Takten zwischen Wachsen und Verdichten. Mit Schwelle 1,9 bleibt es bei einmal.
   - Für den Boden-Ring zeigt das Modell kein erneutes Wachsen.
   - Das Modell liegt in `scratchpad\wasser-sim.cjs` und `scratchpad\pendel-sim.cjs`.
   - Kosten je Zyklus für das Wasser etwa 1 MB Upload. Nach dem Wandern `s.verdichtet` und `s.wachse` lesen (Prüfpunkt 1).
2. Die Upload- und CPU-Spitze eines Verdichtens ist ungemessen, wie im Bericht benannt.
3. `npm run playtest` (voll) und `diag-taille` sind nicht gefahren.

merge-reif: ja
