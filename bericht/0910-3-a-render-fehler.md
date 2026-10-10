# Bericht 0910-3 A: die WebGPU-Fehler der Leben-Schau 2 — die Verdeckungs-Abfrage beim Aussteigen und das zerstörte Tiefen-Abbild

Auftrag: `auftrag/0910-3-omen-render-fehler-und-vram-gelb.md`, Teil A.
Kopf: **welle-m-render-fehler 1457bfa9** (per `git ls-remote`), ab main 7dd944e6, zwei Commits (3ff2c5da, 1457bfa9). CI: Lauf 38009485719 auf 1457bfa9, 5 von 5 grün.

## In drei Sätzen

**Wurzeln:**
- **A2** („No occlusion queries are active“): r184 schließt die Occlusion-Query nach ZÄHLER, nicht nach „offen“. Ein
  Stellvertreter des Berg-Culls wird gezählt, aber nicht begonnen, wenn ihn die Erst-Zeichnung verschiebt, auf seine Pipeline
  wartet oder die Pipeline als gescheitert gilt. Dann schließt `finishRender` eine Abfrage, die es nicht gibt, und
  `resolveOccludedAsync` legt die Lücke ins WeakSet.
- **A1** („Destroyed texture [Texture "szene:tiefenabbild"]“): Die Observer-Diät sah das neu angelegte Tiefen-Abbild nie,
  denn `equals()` sieht keine Textur-Knoten. Nur der resize-Handler band das Wasser neu. Ein `setPixelRatio` (die DPR-Kappe,
  Frames nach dem resize-Ereignis) ließ jedes Wasser-Objekt an der zerstörten Textur zeichnen, Frame für Frame.

**Geschnitten:**
- A2 im EINEN Block „Verdeckungs-Abfrage“ in `_configureRenderer`:
  - der Pass-Bruch schließt die offene Abfrage im alten Pass;
  - `finishRender` schließt nur eine offene;
  - das Auflösen überspringt Lücken.
- A1 in der EINEN Refresh-Entscheidung der Diät, Wächter (6): Ändert sich eine Textur eines Vorher-Knotens, frischt das
  Render-Objekt EINMAL auf.

**Linsen vorher ROT → nachher GRÜN (WebGPU auf swiftshader, CI-Schritte mit Gruppe):**
- `gate:verdeckungs-abfrage` (neu, Gruppe 2): main ROT mit 12 Verletzungen beim Namen, Kopf GRÜN.
- `gate:fenster-wechsel` E (neue echte Stufe, Gruppe 3): main ROT bei E5b beim Namen, Kopf GRÜN.

## A2 — die Verdeckungs-Abfrage beim Aussteigen am Bach

**Wer beginnt und beendet:** Der Berg-Cull (`_archRegionBundleCull` → `_bundleQueryTick`) hängt je fernem Region-Bündel einen
unsichtbaren Kasten mit `occlusionTest` in die Szene, transparent, jeden 10. Frame. r184 macht daraus:
- Die Render-Liste zählt ihn (`occlusionQueryCount`).
- `draw` beginnt die Query und schließt sie TRÄGE beim Draw des nächsten Objekts (`lastOcclusionObject`).
- `finishRender` schließt, sobald `occlusionQueryCount > occlusionQueryIndex`.
- `resolveOccludedAsync` legt jedes Objekt mit 0 Proben in ein WeakSet.

**Drei Wege, auf denen ein gezähltes Objekt nicht beginnt oder die offene Query falsch endet:**
1. **verschoben / wartet:** Der Stellvertreter ist neu (oder neu in einem Render-Kontext). Die Erst-Zeichnung verschiebt ihn,
   wenn der Bau-Rahmen des Aufrufs voll ist, oder wartet auf seine asynchrone Pipeline. Gezählt, nicht begonnen →
   `finishRender` schließt eine Abfrage, die nicht offen ist.
2. **Gift:** r184 hält `pushErrorScope` über den asynchronen Pipeline-Bau offen. Jeder fremde Validierungsfehler dazwischen
   landet dort, die Pipeline gilt für immer als gescheitert, ihr Stoff zeichnet nie. Das ist die EINE THREE-Zeile der Schau.
   Ist es die Pipeline des Stellvertreters, wiederholt sich Weg 1 in jedem Probe-Frame.
3. **Bruch:** Folgt auf den Stellvertreter direkt ein Leser der Szenen-Tiefe, bricht `copyFramebufferToTexture` den Pass bei
   offener Query („ended with incomplete occlusion query“). Am Bach liest zuerst die Nah-Wiese, der Weg blieb dort still; er
   ist eine Schwester, die eine eigene Station bewacht.

**Was das Aussteigen ändert:** Mit dem Spiel-Takt kommen neue Bauten (der Körper, die Sicht `third` → `first`). Das füllt den
Bau-Rahmen, und der Stellvertreter fällt auf Weg 1.

**Nachgestellt:**

| Ort | main / roh | Kopf / mit Eingriff |
|---|---|---|
| Werkbank (GTX 1060), Aussteige-Ablauf am Bach, Hüllen ab | 14 GPU-Meldungen: 7× „No occlusion queries are active“, 7× ungültiger Command-Buffer (`renderContext_6` 6×, `_2` 1×); 13× „weak set“; 4 THREE-Zeilen (geschluckt); 0 von 14 gezählten Abfragen begonnen | frischer Boot: 0 / 0 / 0; gezählt 11, die Erst-Zeichnung wartete 19× und verschob 109× |
| Werkbank, je Weg 20 Frames, frische Pipeline je Lauf | verschoben 20 + 20 + 20 weak set; Gift 19 + 19 + 20; Bruch: der erste Fehler vergiftete die eigene Pipeline des Stellvertreters, danach 17 + 17 + 20 | je 0 |
| Werkbank, Station Bruch am Ufer | 20× „ended with incomplete occlusion query index 0“ + 20× ungültiger Command-Buffer | 0; 20 Brüche bei offener Abfrage |
| **gate:verdeckungs-abfrage** (swiftshader) | **ROT, 12 Verletzungen** (unten) | **GRÜN** |

**Die Linse** (`scripts/diag-verdeckungs-abfrage.cjs`, `npm run gate:verdeckungs-abfrage`, CI-Gruppe 2, Selbsttest in
`npm run check`):
- **A — der Ablauf am Bach der Mess-Wiese** (−872/−728), durch den echten Spiel-Takt (`_gameLoopTick`):
  - Ein Region-Bündel jenseits des Bachs lässt den Berg-Cull seinen Stellvertreter bauen, jeden Frame ein Probe-Fenster.
  - Der GT am Ufer, Aufsitzen aus der Ego-Sicht, Fahrt zum Wasser, Bremsen, AUSSTEIGEN, Blick übers Wasser.
- **B — Bruch:** vorgebauter Stellvertreter, direkt danach ein Leser von `_szeneTiefe`.
- **G — Gift:** ein gezählter Stellvertreter mit gescheiterter Pipeline.
- **ROT bei jeder WebGPU-Validierung beim Namen:** `uncapturederror`, die GPU-Wache des Stamms (auch die von r184s
  Fehler-Bereichen geschluckten) und jeder Seitenfehler.
- **Nicht vakuös:** aufgesessen, ausgestiegen, die Sicht wechselte, der Stellvertreter gezählt, das Wasser gezeichnet,
  Brüche bei offener Abfrage > 0, Gift-Draws > 0.
- **Selbsttest am echten Frame:** B und G ohne die drei Hüllen müssen „incomplete occlusion query“, „No occlusion queries are
  active“ und „weak set“ nennen.

| | main 7dd944e6 | Kopf |
|---|---|---|
| Ablauf | 14× „No occlusion queries are active“, 14× `[Invalid CommandBuffer from CommandEncoder "renderContext_3"]`, GPU-Wache `three: No occlusion queries are active` (die Pipeline des Stellvertreters vergiftet: 0 von 17 begonnen), 16× „Invalid value used in weak set“ | 0 Fehler; gezählt 17, begonnen 16 (1× gezählt, nicht begonnen: abgefangen) |
| Bruch | 20× „ended with incomplete occlusion query index 0 of [QuerySet "occlusionQuerySet_3"]“ + 20× ungültiger Command-Buffer | 0; 20 Brüche bei offener Abfrage |
| Gift | 20× „No occlusion queries are active“ + 20×, 19× „weak set“ | 0; 20 Gift-Draws |
| Selbsttest ohne Hüllen | nennt alle drei | nennt alle drei (20/20, 20/20, weak set 1 und 19) |
| Dauer | 385 s | 499 s |

## A1 — das zerstörte Tiefen-Abbild beim Größenwechsel mit laufendem Loop

**Nachgestellt** (Werkbank, GTX 1060, Mess-Wiese 1920×1080, der Loop wieder angeworfen): `setPixelRatio` 1 → 1,5 → 1 → 2 → 1
ergab **223× „Destroyed texture [Texture "szene:tiefenabbild"] used in a submit“**, dazu eine geschluckte Zeile der GPU-Wache.
Die Meldung bleibt Frame für Frame stehen, bis ein Neubau kommt. Die Schau hatte 264.

**Wer hält die alte Textur?** Ein Haken an `createView`, `createBindGroup`, `setBindGroup`, `executeBundles` und
`GPUTexture.destroy` fand den Halter indirekt:
- Keine Bindegruppe, die nach dem Haken entstand, zeigte auf ein zerstörtes Abbild.
- Kein Bundle zeigte darauf.

Die Leser banden also nach dem ersten Wechsel nie neu; ihre Gruppe stammte von vor dem Haken. Es ist das Wasser, unter der
Diät (`_materialObserverDiaet`, eine Bindegruppe je Render-Objekt):
1. Die Diät schreibt beim ersten Wasser-Objekt je Render die geteilten Vorher-Knoten.
2. `_tiefenAbbild` legt dabei das Abbild in neuer Größe an, r184 zerstört die alte GPU-Textur (`updateTexture`).
3. `equals()` meldet „unverändert“, und keine Bindung folgt.

Der resize-Handler (`_tiefenLeserNeuBinden`) baute das Wasser-Material neu und verdeckte das. Den Weg ohne ihn geht die
DPR-Kappe `_applyRenderScale` → `setPixelRatio`, Frames NACH dem resize-Ereignis. Das passt zu „maximiert, DPR 2“.

**Die Probe des Schnitts:** ein Wächter hinter `_diaetRefresh`, live, je vier Wechsel: an **0**, aus **118**, an **0**
(10 Auffrischungen an 2 Objekten, den Wasser-Meshes).

**Der Schnitt** (Diät (6), `AnazhRealm._diaetGang` / `_diaetVorTextur` / `_diaetRefresh`):
- Je Render-Objekt merkt die Diät Id und Version der Texturen seiner Vorher-Knoten.
- NACH dem Gang (der den Neubau ausgelöst haben kann) zieht ein Wechsel EINEN Refresh nach sich.
- Für jeden Stoff ohne solche Knoten kostet das eine Längen-Prüfung.

**Die Linse** (`gate:fenster-wechsel`, neue Stufe E, CI-Gruppe 3; die GPU-freie Wand F1–F3/S1 bleibt):
- **Aufbau:** WebGPU auf swiftshader, holz=nah (Pixel-Kappe 1,25), am Ufer desselben Bachs, der Spiel-Loop LÄUFT.
- **E1–E4:** die Folge der Schau (vergrößern, nochmals, DPR 2, zurück) im Maßstab 2/3, je ≥ 6 Frames.
- **E5:** die Pixel-Ratio allein (1,25, dann 1), wie die Kappe sie stellt, ohne resize-Ereignis.
- **E6:** nicht vakuös: das Wasser zeichnet, 6 Abbild-Stände, die Pixel-Ratio folgte DPR (1 → 1,25) und Kappe.
- **ES:** Selbsttest, E5 ohne Wächter.
- ROT bei jeder Meldung beim Namen.

| | main 7dd944e6 | Kopf |
|---|---|---|
| E1–E4 (Folge der Schau, 2/3) | 0 Meldungen | 0 Meldungen |
| E5a Pixel-Ratio 1,25 | 0 | 0 |
| E5b Pixel-Ratio 1 | **ROT: 3× „Destroyed texture [Texture "szene:tiefenabbild"] used in a submit“** | 0 |
| ES ohne Wächter | 12× und 17× | 3× und 17× |
| Urteil | **ROT** | **GRÜN** (187 s) |

**Ehrlich zur Folge der Schau:**
- Über `setViewport` mit neuem DPR feuert je nach Takt AUCH das resize-Ereignis, dessen Handler das Wasser neu baut. Im
  Maßstab 2/3 blieben E1–E4 darum auch auf main still.
- In voller Größe (958×512 → 1280×720, DPR 2) zeigte der Selbsttest über `setViewport` ohne Wächter 8 Meldungen, im kleinen
  Maßstab keine.
- Der Schritt E5 ist der deterministische Zeuge desselben Wegs. Der Lauf in voller Größe (Kopf, 516 s) liegt bei.

## Wände

| Wand | Urteil |
|---|---|
| gate:verdeckungs-abfrage (neu, swiftshader) | Kopf **GRÜN** (gezählt 17 / begonnen 16, Bruch 20, Gift 20), main **ROT 12** |
| gate:fenster-wechsel (F + neue Stufe E) | Kopf **GRÜN**, main **ROT** (E5b) |
| diag-verdeckungs-abfrage --selftest (in `npm run check`) | 19 Fälle GRÜN |
| gate:vendor-anker | GRÜN, 176 Anker (+6: das träge Ende, `beginRender`, `finishRender`, das WeakSet; `updateTexture` zerstört die alte Ziel-Textur, die Vorher-Knoten am NodeBuilderState) |
| gate:ci-deckung | GRÜN (Gruppe 2 +1 Schritt) |
| lint | 0 Fehler (die 2 Warnungen stehen auf main gleich) |
| format:check | eigene Hunks mit `fmt-eigen` nachgezogen (2 Umbrüche), Diff geprüft |
| CI | Lauf 38009485719 auf 1457bfa9: 5 von 5 grün (check 3,9 · erst-zeichnung 8,2 · playtest 1/3 23,2 · 2/3 32,9 · 3/3 32,4 min) |

Rohdateien: `bericht/0910-3-a/`
- `gate-verdeckung-{vorher-main,kopf}.txt`, `gate-fenster-{vorher-main,kopf,kopf-volle-groesse}.txt`;
- `werkbank-{ablauf,faelle,a1}.txt`;
- die Proben `va.js`, `s1.js`, `occl-fall.js`, `a1.js`, `a1-leser.js`, `a1-waechter.js`.

## Offen (mit Grund)

- **r184s Fehler-Bereich um den asynchronen Pipeline-Bau** schluckt FREMDE Validierungsfehler. Die Pipeline, die gerade
  baut, gilt dann für immer als gescheitert, und ihr Stoff zeichnet nie wieder.
  - Zahlen: main-Ablauf 1 Zeile (die Pipeline des Stellvertreters, danach 0 von 17 begonnen); Werkbank-Ablauf roh 4 Zeilen.
  - Beide Schnitte schließen die bekannten Auslöser. Jeder künftige Validierungsfehler vergiftet aber, was in dem Moment baut.
  - Die GPU-Wache nennt es als `three:`-Zeile, beide Linsen werten sie als ROT.
  - Der Schnitt läge im Vendor-Kompilat (`createRenderPipeline`, 6:590447) und ist nicht gebaut.
- **Der Stellvertreter fragt erst, wenn seine Pipeline steht** (Kopf: 16 von 17 Probe-Frames). Bis dahin kein Verdikt, das
  Bündel bleibt sichtbar (nur GPU-Preis).
- **Nicht auf der Radeon geprüft:** OMEN GTX 1060 (Werkbank) und swiftshader (Linsen). Die Signatur der Schau (Wortlaut,
  `renderContext_N`, weak set, die eine THREE-Zeile) ist nachgestellt, der Original-Takt der Schau nicht.
- **Die zwei Linsen sind in der CI teuer:** Verdeckungs-Abfrage 14,4 min (Gruppe 2, lokal 8 min), Fenster-Wand mit Stufe E 12,7 min
  (Gruppe 3, lokal 3 min). Die Gruppen 2 und 3 stiegen auf 32,9 und 32,4 min (bei host-vram-2 18,3 und 19,8), unter dem
  45-min-Deckel. Der Ablauf wartet nach jedem Takt auf die GPU (die Leine setzt sonst fast jeden Render aus), das trägt die
  Zeit. Ein schlankerer Ablauf (weniger Takte nach dem Aussteigen, kleinere Bühne) ist möglich, wenn die Gruppen Luft brauchen.
