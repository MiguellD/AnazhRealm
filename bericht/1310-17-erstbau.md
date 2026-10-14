# Bericht 1310-17 — der Erst-Bau der Zeichnung beim Namen (B-Term 1)

**Status: ZWISCHENSTAND.**

**Urteil:** Der Erst-Bau ist der **synchrone Knoten-Bau** (TSL → WGSL) je RenderObject auf dem Haupt-Faden. Die Pipelines
entstehen schon asynchron.
- Bis zum ersten Bild laufen **121 Bauten / 6,41 s (kalt)** und **125–126 Bauten / 5,2–5,4 s (zweit)**. Daraus entstehen nur
  **38–42 Pipelines**.
- Der Name: r184 schlüsselt ein Programm nach der **Identität seiner Knoten**. Die Basisklasse liefert
  `customCacheKey(){return this.id}`. Jeder Stoff, dessen Knoten frisch gebaut sind, baut also sein eigenes Programm, auch bei
  gleicher Bauart.
- 125 Bauten verteilen sich auf **35 Bau-Signaturen**. Mit einem Bau je Signatur kostete der Erst-Bau ~1,3 statt 5,2 s.
- **Die Schnitt-Richtung des Auftrags trägt nicht.** Ein Vorbau im Ladeschirm verschiebt den synchronen Bau nur, er spart
  nichts. Gemessen: die Drossel bis zum ersten Bild aufgehoben, kein früheres Bild.
- **Die Richtung, die der Name trägt:** Programme teilen statt vorbauen. Benannt, nicht geschnitten; die Entscheidung liegt bei
  dir (siehe unten).

## Die Messung

`bau-probe.cjs` umhüllt am Renderer `_nodes.getForRender`. Dort baut r184 den Knoten-Graphen eines RenderObjects.
- Je Bau: Zeit, Dauer, Stoff, Knoten, Flags, Objekt mit `userData`, Kamera, Attribute.
- Echte GPU, Boot über den save-server, benanntes Profil (erster Lauf kalt, dann zweit), Welt V18.545 (main 9fb869a5).
- Die Zähler der Welt (`_erstZeichnung`): kalt bauN 114 / 6,9 s, pipeAsync 42; zweit 105 / 5,6 s, pipeAsync 38.
- Verschobene Erst-Zeichnungen (die Drossel `ERST_BAU_MS` = 4): 1 797 kalt, 3 177 zweit.

**Wer baut (zweit, `bau-zweit2.json`, 125 Bauten, 5,19 s):**

| Block | Bauten | Zeit | Signaturen |
|---|---|---|---|
| Foundry-Überblend-Stoff mit Farbe + Leucht (Tore, Bauten; `MeshStandardNodeMaterial`, instanziert) | 24 | 1,19 s | 1 |
| Portal-Membran (`MeshBasicNodeMaterial`, Farbe/Lage/Deckung, 16-Schritt-Marsch) | 5 | 1,01 s (59–504 ms je Bau) | 1 |
| Portal-Nebel (Volumen-Marsch, 16 Schritte) | 4 | 0,73 s (152–196 ms je Bau) | 1 |
| Foundry-Überblend-Stoff mit Farbe allein | 19 | 0,66 s | 1 |
| Schatten-Programme (ortho, alle Kaskaden) | 49 | 0,46 s | wenige |
| Rest (Karte, Rinde, Laub, Boden, Wasser, Himmel, Umgebung, TRAA) | 24 | ~1,1 s | ~30 |

- Kamera: Hauptbild 77 Bauten / 4,93 s, Schatten 49 / 0,46 s. Kalt: 78 / 5,77 s gegen 43 / 0,64 s.
- **Reihenfolge:**

  | Zeit | was gebaut wird |
  |---|---|
  | 4,6 s | Umgebung (PMREM) |
  | 5,2 s | Render-Pipeline und TRAA |
  | 5,3 s | Himmel |
  | 5,5 s | Boden |
  | ab 8,9 s | die Foundry-Stoffe, so wie die Assets ankommen (je Teil ein Bau) |
  | 14,3–15,7 s | die Portale |

- **Warum gleiche Stoffe getrennt bauen** (`schluessel.json`, Werkbank an der Ankunft): 84 Stoffe, jeder mit eigenem
  Programm-Schlüssel.
  - Bei den Überblend-Stoffen unterscheiden sich die Knoten-Schlüssel von `colorNode` und `emissiveNode`. Rauheit und Leucht
    sind Stoff-Werte.
  - Bei Membran und Nebel unterscheiden sich `colorNode`, `opacityNode` und `positionNode`.
  - Der EINE Foundry-Stoff-Bauer (`stamm/20b.js`) baut je Aufruf frische Knoten (Maske, Licht-Pool, Look-Terme).
  - Die Portal-Bauer (`stamm/14.js`, `_nebelMaterialFor` und die Membran) falten die Maße der Gestalt als Konstanten ein. Darum
    sind sie echt verschiedene Shader.

## Der Versuch zur Schnitt-Richtung des Auftrags (Vorbau im Ladeschirm)

- Hinter dem Ladeschirm ist kein Frame sichtbar, also ist die Drossel (ein Bau je Render-Aufruf) dort keine Pflicht. Versuch:
  `ERST_BAU_MS` aufgehoben bis zum ersten Bild, Zweit-Boot A B A B (`bau-zweit-gedr*` / `-frei*`).
- Ergebnis: Weltbild gedrosselt 12,94 / 15,29 s, frei 13,51 / 16,31 s, also kein Gewinn.
- `compileAsync` ändert daran nichts. r184 baut die Knoten auch dort synchron (`_geometries.updateForRender` liest die Attribute
  vor `getForRenderAsync`), und die Pipelines sind schon asynchron.
- Der Vorbau verschiebt die Kosten, er nimmt keine.
- Nebenbefund: Diese vier Läufe trugen einen angesammelten Spielstand im Profil und bauten nur ~57 Programme (2,2 s). Ihr Bild
  kam bei 13–16 s statt 18 s. Das ist ein Hinweis, kein Beweis, dass die Bauzahl auf dem kritischen Pfad liegt.

## Die Richtung, die der Name trägt (benannt, nicht geschnitten)

1. **Foundry-Überblend-Stoffe teilen ihren Graphen.** Der Stoff-Bauer merkt sich die Knoten je Bau-Signatur; was je Stoff
   variiert (Farbe, Rauheit, Leucht), liest die Stoff-Referenz. Dann bauen 43 Stoffe 2 Programme statt 43, das spart
   ~1,75 s Haupt-Faden.
   - Risiko: Ein Knoten, der einen Wert eines Stoffs einfängt, zeichnete dann alle Stoffe mit ihm.
   - Der Umbau trifft den EINEN Stoff-Bauer aller Foundry-Assets und braucht Bild-Beweise über alle Arten.
2. **Die Portal-Gestalt als Uniform je Objekt** statt eingefaltet: Membran und Nebel je EIN Programm, das spart ~1,2 s. Der
   Umbau trifft zwei große Shader-Bauer.
3. **Obergrenze aller Signaturen:** 5,2 → ~1,3 s Haupt-Faden im Zweit-Boot.

## Pflicht-OFFEN Rest

- B bleibt offen. Diese Karte nennt den Erst-Bau beim Namen und schneidet ihn nicht.
- Die Richtung 1 bzw. 2 braucht deinen Auftrag, denn sie baut die Stoff-Bauer um.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit für 1310-17. welle-m-e-ankunft bleibt bei 22884ebf.
- Werkzeug `p3/k17`:
  - `bau-probe.cjs` (jeder Knoten-Bau beim Namen; `K17_UNGEDROSSELT=1` für den Versuch)
  - `schluessel.cjs` (die Programm-Schlüssel der Szene und was sie unterscheidet)
