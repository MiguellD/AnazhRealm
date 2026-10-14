# Bericht 1410-1 — EIN Programm je Signatur auch für die instanzierten Foundry-Bauten

**Status: ZWISCHENSTAND.**

**Ergebnis:** Zweig welle-m-e-instanz, Basis integ-probe 08b57ed8 (gemergt in 90737338), Kopf 9a218940 [ci voll].
- **Programme:** Die instanzierten Foundry-Bauten bauen je Signatur EIN Programm. Echte Foundry-Bauten bis zum ersten
  Weltbild: 70–72 → 15–17. Die 66–67 Instanz-Bauten fallen als eigene Klasse ganz weg.
- **Bauzeit:** 2,7–3,7 → 0,6–1,0 s. Alle Bauten bis zum Bild: 120–131 / 5,1–6,0 s → 60–66 / 3,0–3,7 s.
- **Weltbild:** zweit 22,1 / 22,0 → 20,0 / 20,3 s, kalt gleich (28,4 / 29,0 → 27,9 / 29,8 s).
- **GPU** (gpu-bank am Tor nah, am Tor-Rest und am Genesis-Blick): im Rauschen.
- **Bild** A ↔ B bei gleichem Einschwingen: im Rausch-Boden.
- **CI:** Lauf 38547552490 am Kopf 9a218940 läuft. Das Ergebnis folgt als Nachtrag.

## Der Schnitt (die Wurzel gelesen, kein Vendor-Patch)

- **Der Schlüssel:** r184 hängt `e.uuid` an den Schlüssel jedes Render-Objekts, für das
  `isInstancedMesh || count > 1 || morphTargetInfluences` gilt (`RenderObject.getMaterialCacheKey`). Darum baute jede
  InstancedMesh ihr eigenes Programm.
- **Der Zeichner** (`_instanzZeichner`, `_instanzZeichnerKlasse`, stamm/20c.js):
  - Die Senke bleibt die InstancedMesh, die die Welt liest: Zählungen, Kehraus, Linsen und `_instanzZahl`.
  - Gezeichnet wird sie von ihrem Kind, dem Zeichner. Er ist ein Mesh mit `count` 1 über einer InstancedBufferGeometry-Fassade.
  - Die Fassade teilt jedes Attribut der Senken-Geometrie (dieselben Objekte) und trägt `instanceCount` = `count` der Senke.
  - r184 zählt Instanzen aus `geometry.instanceCount` und hängt keine uuid mehr an.
- **Die Instanz-Daten:**
  - Die Matrizen liest der Shader aus einem Storage-Puffer (`StorageInstancedBufferAttribute`). Der Knoten
    `SenkenMatrizen` (updateType object) setzt je Render-Objekt den Puffer seiner Senke; r184 klont die Bindung je
    Render-Objekt, das Programm teilt sich.
  - Die Farbe kommt als Fassaden-Attribut `instanzFarbe`.
- **Die Reihe im Shader:** Der Instanz-Knoten stapelt sich vor dem positionNode, wie r184s InstanceNode.
  - Der Haken sitzt auf `NodeMaterial.setupPosition` in `_configureRenderer`. Er stellt die Matrix für `_weltNaht` an
    den Builder (Lehre 22).
  - Der Anker in diag-vendor-anker pinnt die Reihe.
- **Die Projektion** (heute): Die Senke projiziert als LOD ohne Takt. Ein LOD zeichnet nicht; seine Kinder erben die
  Reihe der Eltern.
  - Als Gruppe setzte sie die Reihe ihres Zeichners auf ihre eigene renderOrder (`if(e.isGroup)r=e.renderOrder`).
  - Anker: `else if(e.isLOD)!0===e.autoUpdate&&e.update(t);`.
- **Linse** (`gate:kamera-treue`, Probe SENKE):
  - Zwei Senken eines Stoffs teilen EINEN Knoten-Zustand; zwei r184-InstancedMesh: zwei.
  - Der Zeichner zeichnet bild-gleich mit r184s InstancedMesh derselben Matrizen (1,0, Soll ≥ 0,999).
  - Ohne Senke ist die Bühne < 0,98.
  - Vier Selbsttests feuern.
- **Mitgezogen:**
  - `_werferWahl`/`_werferBoxDazu`: Die Senke ist das Blatt, der Zeichner kein eigener Werfer.
  - `_diaetRefresh`: Der Instanz-Wächter liest die Senke.
  - `_gpuKehraus`/`_instanzAbschied`: Sie lösen auch die Render-Objekte des Zeichners.
  - `_instanzZahl`: Sie schreibt `instanceCount` der Fassade.
  - Der Draw-Zähler der Linsen liest die Instanzen hinter dem Zeichner.

## Gemessen (OMEN, GTX, echte GPU, Basis 08b57ed8)

| Größe | 08b57ed8 | Instanz-Schicht |
|---|---|---|
| Foundry-Bauten bis Weltbild (kalt · zweit, je 2 Boots) | 72 · 71 / 71 · 70 | 15 · 15 / 17 · 15 |
| ihre Zeit s | 3,72 · 2,80 / 3,44 · 2,66 | 0,95 · 0,75 / 1,03 · 0,64 |
| alle Bauten bis Weltbild / Zeit s | 122 · 131 / 120 · 131 — 6,04 · 5,33 / 5,89 · 5,06 | 62 · 65 / 66 · 60 — 3,56 · 3,18 / 3,66 · 2,99 |
| Weltbild s (kalt · zweit) | 28,41 · 22,14 / 29,02 · 21,98 | 27,88 · 20,01 / 29,82 · 20,26 |
| gpu-bank Tor nah ms (400 Takte, 2 Läufe) | 19,82 · 19,84 | 19,87 · 19,90 |
| ohne Membran | 16,89 · 17,06 | 16,90 · 16,95 |
| ohne Tor (Rest) | 10,66 · 10,70 | 10,59 · 10,60 |
| Genesis-Blick | 9,95 · 9,85 | 9,89 · 9,93 |

- **Bilder:** je Stand 2 Sitzungen, Wiese · Genesis · Dorf je vier Blicke, zwei Tore nah. A ↔ B im Rausch-Boden
  (`vergleich.cjs` EXIT 0).
- **Gruppe gegen LOD** (60 Takte, 2 Läufe je Stand):
  - gpu-bank Tor-Rest: 08b57ed8 10,15 · 10,43; LOD 10,32 · 10,32; Gruppe 10,22 · 10,31.
  - Bild Gruppe ↔ LOD im Rausch-Boden.
  - Der Rest von +0,29 ms der alten Basis (stoffe gegen instanz) kehrt auf 08b57ed8 nicht wieder.
  - Die LOD-Projektion ist eine Korrektur der Reihe, ohne messbaren Gewinn.

## Fallen der Messung

- **Die Ankunft verschiebt den Inhalt.**
  - Bei 60 Takten Einschwingen zeigte der Genesis-Blick Süd auf B die Nah-Streu (`streuSatz` 4 Befehle, 16 422 Dreiecke),
    auf 08b57ed8 nicht.
  - Nach 400 Takten trägt sie auch 08b57ed8 (4 Befehle, 17 468 Dreiecke).
  - Weniger Programm-Bauten lassen den Takt früher Kacheln bauen. Bild-A/B darum bei 400 Takten.
- Die Kehren der älteren Serien gelten weiter: Flügel-Glättung 200 Ticks, Karten-Füllung nach dem Einschwingen.

## Die Stelle mit K44 (gestalten-ehrlich: Gestalten-Register und Puffer-Teilung)

Ich besitze den Weg der Instanz-Daten in den Shader. Wir schneiden uns an drei Stellen:

1. **Die Fassade des Zeichners** (`_instanzZeichnerKlasse`, Getter `geometry` → `_fassade`):
   - Sie übernimmt jede Attribut-Referenz der Senken-Geometrie, auch die zero-copy geteilten Vertex-Puffer der
     LOD-Fassade (`_lodInstanceFacade`, stamm/17c.js) und deren instanzierte aH0/aH0L/aKarte.
   - Teilt K44 Puffer neu, folgt der Zeichner beim nächsten Zugriff, ohne eigene Kopie.
   - Eine K44-Teilung, die Attribute der Senke ersetzt statt mutiert, ist darum sicher. Eine, die die Fassade umgeht
     (eigene Geometrie am Zeichner), nicht.
2. **Die Zahl der Vertex-Puffer** (GTX: maxVertexBuffers 8):
   - Die Matrix liegt jetzt im Storage-Puffer, nicht mehr in den Vertex-Puffern. Der Zeichner trägt `instanzFarbe` als
     +1 nur bei `instanceColor`.
   - Jede K44-Teilung, die Puffer aufspaltet, zählt gegen dieselbe Grenze.
3. **Die Freigabe:** `_instanzAbschied` und `_gpuKehraus` lösen die Render-Objekte des Zeichners. Wer im
   Gestalten-Register Senken wiederverwendet, muss über `_instanzAbschied` gehen.

## Pflicht-OFFEN Rest

- **B (Ankunft):** Weltbild zweit −2 s durch weniger Bauten, kalt unverändert ≈ 28–30 s. Der Bau-Term ist nicht mehr der
  größte. Benannt, nicht geschnitten.
- **E (Profi-Band):** GPU unverändert, siehe 1410-2.

## Status ZWISCHENSTAND + Übergabe

- **Zweig** welle-m-e-instanz:
  - WIP b5b4fd42 · e7240087 · 6a6ab71e;
  - Merge 90737338 (08b57ed8);
  - d49b2a25 · 5fff9e54;
  - Kopf 9a218940 [ci voll]. Die CI ist zu lesen.
- **Rohdaten** `bericht/1410-1/`: bau2-auswertung, gpu-bank-tor, vergleich-*, zaehl-sued-*, waende-*, Skripte. Die
  Bilder liegen im Arbeits-Klon `p3/k18/bild` P1–P4 · L1–L4 · Q1–Q2.
- **Wände lokal** am Kopf, alle EXIT 0 (`p3/k1410/waende3/summe.txt`):
  - vendor-anker · kamera-treue (SENKE) · schatten-werfer · freie-slots · foundry-impostor · foundry-crossfade ·
    sicht-arbeit · scatter-lod · streu-fern;
  - playtest:fast 22 ✅ / 0 ❌;
  - CI-Puls lokal 17/17 (`p3/es/ci-lokal.cjs`, NUR=puls).
