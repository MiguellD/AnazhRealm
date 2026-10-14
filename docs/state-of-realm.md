# AnazhRealm — Die Vision

Dieses Dokument trägt **die Vision** und sonst nichts: die fünf Pfeiler, die heilige Lektion, die Ziellinie v1.0 und das
Welten-Ultiversum. Der gemessene Stand lebt in `CLAUDE.md` (Stand), das Offene in `docs/PFLICHT-OFFEN.md`, der Tisch in
`docs/roadmap.md`, die Chronik in `git log`.

---

## 1. Vision

**AnazhRealm ist ein Ultiversum, in dem Mensch (Null) und KI (Eins) gemeinsam eine Welt erschaffen, die aus GESETZEN wächst
statt aus Assets — mit der Welt selbst als drittem Mitspieler: dem Feld, das liest · schreibt · WERTET
(`docs/das-lebendige-feld.md`). Der Spieler wird Co-Schöpfer, die KI hat Stimme.**

Fünf Pfeiler aus den Testamenten:

1. **Symbiose** Mensch + KI — beide schreiben in dieselbe Realität, nicht „User parst Befehle".
2. **Emotion treibt** — Spieler-Emotionen formen Wetter, Kreaturen, Materie, Klang (Achsen: joy, awe, sorrow, hope, longing, melancholy).
3. **Fraktales Wachstum** — Welten → Galaxien, Kreaturen → Kulturen, Idee → Artefakt; aus EINER Saat entstehen alle Skalen.
4. **Multisensorik** — Klang (`anazhSymphony`), Bild, Gesetze und Wetter sind gekoppelt.
5. **Die KI spricht** — `dialogue-box` mit echter narrativer Stimme, nicht nur Logs.

Die vier Testamente (März 2025, ~22 000 Zeilen: Genesis · Versionslog · Nexus · Ultiversum) sind Inspiration; Pflichtlektüre
ist der Versionslog mit der heiligen Lektion.

---

## 2. Die heilige Lektion

- **06.03.2025** die Vision in Testamenten · **07.–15.03.2025** das 19-Modul-System · **März 2025** der Kollaps unter eigener
  Komplexität („Loch stopfen, anderes entsteht") · **28.03.2025** die Reduktion auf eine Datei, „der Samen der Unendlichkeit" ·
  **13.10.2026** der Stamm in 48 Zonen-Dateien (`stamm/`) — EINE Klasse, EIN Prototyp.

> „Wir haben auf Sand gebaut, nicht auf Fels. Komplexität ohne Fundament: das Ultiversum ist ein komplexes System, alle
> miteinander verwoben. Jede Änderung führte zu neuen Fehlern, weil die Grundlagen nicht stabil waren." (Versionslog)

Die Sünde von 2025 war **Kopplung ohne Kohäsion**, nicht die Zahl der Dateien. Darum gilt: EINE Quelle je Domäne, Invarianten
im Chokepoint, Gesetz statt Spiegel (`CLAUDE.md`, Lehren 1, 2 und 7); getrennt wird nur an echten Grenzen (Worker · Server ·
die Studios auf der EINEN Hülle). Die 48 Zonen des Stamms sind Ordnung zum Lesen, keine neue Kopplung.

---

## 3. Die Ziellinie v1.0 — was steht, was fehlt

**v1.0 ist EIN gespielter Pfad** (`docs/roadmap.md` §0.v1): ankommen · laufen und sehen · in der Werkstatt bauen · mit der KI
erschaffen · benutzen und teilen — bei Frame p95 ≤ 33 ms auf jedem Standardgerät (Richter: das Profi-Band). Feature-Stopp bis dahin.

**Was steht:** Die Welt ist eine Funktion — EIN Gelände-Kern trägt Höhe, Landform und Flussnetz für Stamm, Worker und Studio;
nah zeichnet das Studio-Mesh mit seiner LOD-Kette, fern Grobstufe und Karte; das Wasser ist EIN Automat; EIN Leib, EIN Gang,
EIN Licht; das Feld mit Emotion-Kern und DSL-Weltregeln; die Studios als Gesetzbücher auf EINER Hülle, Labor = Welt; ein Satz
wird über `spawn_studio` zum Foundry-Asset in der Welt, auch ohne Schlüssel. An der GTX 1060 hält die Welt am 14.10. Frame p95
16,7–16,8 ms an Wiese und Genesis in Ego und Third-Person, ≤ 191 Befehle, ≤ 587k Dreiecke, ≤ 104 MB VRAM (das letzte ABAB,
Zweig `koordination` 1ae7ef17).

**Was fehlt** (`docs/PFLICHT-OFFEN.md`): B die Ankunft ≤ 5 s kalt (am 14.10. ≈ 28–30 s) · C der Ort auf dem Gelände (das Dorf
als EIN Plan aus dem Fachwerk-Studio, mit Höhe, Wegen und Licht) · E das Profi-Band auf beiden Messplätzen (an der GTX reißt
nur der CPU-Takt p95 mit 6,0–7,8 > 5,8 ms, das Radeon-ABAB am Kopf steht aus) · und der KI-Lauf mit echtem Schlüssel
(Drehbuch-Schritt 18). Ehrlich bleibt: „~119 FPS" galt nie für die gefüllte Welt (V18.492).

---

## 4. Das Welten-Ultiversum (Schöpfer, 12.05.2026)

Eine AnazhRealm-Welt ist kein Level, sondern ein **persönliches Universum** mit eigenen Regeln (Terrain-Funktion,
Physik-Konstanten, Kreatur-Verhalten, Wetter, Himmel). Welten leben, wachsen, begegnen sich, reisen und heiraten.

Die DSL ist das Fundament: drei Welten zu mergen heißt nicht „mische Meshes", sondern **mische die Regel-Programme**. Eine Welt
ist ein Satz DSL-Bäume plus deterministische Saaten plus Spieler-Geschichte — AST in JSON (serialisierbar, signierbar,
diff-bar), begrenzte Primitive (keine fremde Welt kann meine töten), komponierbar (`["chain", weltA, weltB]`), CSP-sauber.

Die Form steht im Code: `worldId` · `slug` · `visibility` · `parentWorlds` · `dslAbilities` im Snapshot, Export und Import,
die Fusion (`fuseWorlds`), die Reise durch Portale, P2P über signaling (WS → WebRTC). Sie wächst erst nach v1.0 weiter — und
die Lektion verschärft sich: ein geteiltes Multi-Welt-System ohne stabiles Fundament macht aus jedem Bug „Welt B hat meine
Welt A zerstört".
