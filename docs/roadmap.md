# AnazhRealm — Roadmap (der Weg vorwärts)

> **Der aktive Tisch.** Was vorwärts kommt — in einem Bild, nicht in 1782 Zeilen. Die volle
> Vergangenheit lebt in der **Bibliothek**: `docs/archiv/handover.md` (die Wellen-Chronik +
> Gotcha-Vollarchiv) · `docs/archiv/roadmap-chronik-bis-v18.83.md` (der alte Detail-Backlog) ·
> `docs/archiv/README.md` (der nach Bögen gruppierte Index). Ein Bogen erwacht → sein Detail-Plan
> kommt aus dem Archiv auf den Tisch; er vollendet → zurück in die Bibliothek.
>
> **Stand: V18.83 (`main`), 09.06.2026 — der UI-Putz-Bogen ist rund.**

---

## Regel #0 — die eine Wahrheit (über allem)

**Render · Wasser · Schatten · Hand-Optik sind PIXEL-BLIND headless.** Der Schöpfer-Browser ist
die einzige Wahrheit. Nie 2+ pixel-blinde Wellen tief ohne sein Auge dazwischen; ein bestätigter
Bogen wird gemergt, bevor der nächste beginnt. (Zweimal verletzt in der Wasser-Spirale V18.0–.31 —
jetzt absolut.)

## Wo wir stehen

Das **Fundament steht**: Voxel-Terrain mit echten Höhlen (Tunnel-Netz + Kammern) · Stream-Power-
Erosion · das Wasser-**Datenmodell** (3D-Zellen, Physik, Reaktivität, globaler Ozean) · das
Rückgrat der LOD-Kaskade (U1+U3) · das **lebendige Feld** (lesen·schreiben·werten) + der Emotion-
Kern · die **Crafting-Resonanz** (ein Produkt-Vektor, viele Leser) · der **UI-Putz-Bogen** (6
Kern-Räume + freier Bildschirm). Was fehlt, ist **eine** große Sache — die Wasser-**Dynamik** — plus
die Fundament-Reste (Höhleneingänge/Canyons, ferne Binnengewässer), die LOD-Vollendung und die
offenen Render-Sign-offs.

---

## Der Plan vorwärts — drei Phasen

### Phase 1 — Wasser: echte Fluid-Dynamik ⭐ der große Bogen

**Die Wurzel (gemessen):** Das Wasser ist ein statisches 2.5D-Höhenfeld `L` + eine reaktive Zell-
Füllung bis `L`. Es **fließt nie nach** — kein zellulärer Automat, kein Level pro Zelle. 30 Wellen
(V18.0–.31) drehten am Render-Mesh, während diese Wurzel unberührt blieb.

**Das Ziel:** Wasser fließt dynamisch nach wie Minecraft — ein zellbasierter Automat über
`entry.waterCells` (Level 0–7, bergab-Priorität, sucht sein Niveau). Ein Carve neben Wasser → es
strömt sichtbar hinein; der Render speist sich aus den Fluid-Zellen (das löst auch das Mesh-Falten).

**Zuerst zu klären (eigener Plan, browser-validiert, Merge pro Schritt):** Tick-Budget/Performance
auf streamendem Open-World-Voxel · Determinismus für Multi-User-Seeds · die Grenze frozen-Worldgen ↔
Live-Fluid · Persistenz (überlebt der Fluss-Zustand den Reload?). Detail + die 6-Schichten-Wahrheit:
`docs/archiv/wasser-render-architektur-plan.md`; das Daten-Modell: `docs/archiv/hydrosphere.md`.

### Phase 2 — das Fundament sauber schließen (erst sauber, DANN LOD)

Die physikalische Kette ist eindeutig — `Wasser → H3 → G3`, `sauberes Wasser → U2`:

- **H3 — Seen/Flüsse jenseits ±1024 m** (Region mit dem Spieler mitwandern). Ozean ✅ global
  (V17.117), Binnengewässer noch streng region-gebunden. Determinismus-Bruch → eigener Sign-off.
- **G3 — Höhleneingänge + Canyons** (das Spektakulärste: die `surf−16`-Höhlendecke selektiv öffnen
  → sichtbare Eingänge + vertikale Ravines). **Braucht H3** (sonst blutet Wasser an Eingängen ein).
- **LOD vollenden** (`docs/archiv/lod-kaskade-plan.md`): **U2** Wasser-LOD (heute fest LOD0 = doppelter
  GPU-Preis) · **U4** Deko-Distanz/Dichte/Impostor · **U5** Schatten-CSM · **U6** echtes Clipmap
  (der Draw-Call-Hebel). U2/U5/U6 pixel-blind → Browser-Loop.
- **Render-Sign-offs:** R1 (Schatten-Snap an vertikalen Wänden, gebaut, unbestätigt) · R2 (geflattete
  Normale in die Terrain-Geometrie backen) · R3 (Kanten-Schärfe) · R5 (Textur auf Strukturen).

### Phase 3 — die Seele (wenn das Fundament trägt)

- **Crafting-Schluss** (`docs/archiv/kampf-plan.md` §11): S6-B erntbare Flora (echte Trank-Zutaten) ·
  S9 Gerät in der Hand · S11 deklarative Werkstatt-Animation · S7-C chat/DSL-Vereinheitlichung.
- **Phase E — Bedrohung/Furcht:** aggressive Kreaturen → der letzte Emotion-Kern-Konsument (W5-Furcht
  + Triumph-δ; lange benannt, nie gebaut).
- **Mana-Symmetrie** (`magieleitung` → eine zweite Ausdauer-Achse) · **Emotion→Regel-Emergenz** (die
  hand-codierten Kopplungen via die Weltregeln-DSL emergent machen) · **W18 — in fremden Welten leben**
  (`docs/archiv/world-portal-w18-plan.md`).

---

## Die offenen Fäden — die geordnete Karte

| Faden | Was | Stand | Blockiert durch |
|---|---|---|---|
| **Fluid-Dynamik** | Wasser fließt nach (Zell-Automat) | geplant, der gewählte Weg | eigener Plan zuerst |
| **Mesh (B)** | gefaltetes Auslauf-Mesh · Fluss-Naht · Wasserfall-Plane | pixel-blind offen | fließt in Fluid ein |
| **H3** | ferne Seen/Flüsse (Region mitwandern) | Ozean ✅, Rest offen | Determinismus-Bruch |
| **G3** | Höhleneingänge + Canyons | fehlt komplett | **braucht H3** |
| **U2** | Wasser-LOD (statt erzwungenem LOD0) | offen | sauberes Wasser |
| **U4/U5/U6** | Deko+Impostor · Schatten-CSM · Clipmap | offen | pixel-blind |
| **R1** | Schatten-Raster an vertikalen Wänden | gebaut (V17.111), Sign-off offen | Browser-Auge |
| **R2/R3/R5** | Normale backen · Kanten · Struktur-Textur | offen | R2 wartet auf finales `terrainFlatten` |
| **Browser-Sign-offs** | J4 Facetten · S9 Hand · A2 Crafting · E1–E3 Sicht-Ring | gebaut, unbestätigt | das Schöpfer-Auge |

---

## Was gebaut ist (stichwortmäßig — das Detail in der Chronik)

Die großen Bögen, je eine Zeile. Voll erzählt in `docs/archiv/handover.md`, nach Bögen indexiert in
`docs/archiv/README.md`.

- **Voxel-Terrain** (V9.07–.19) — Density-Feld · Surface Nets · Höhlen · Carve/Fill.
- **Hydrosphäre** (V9.43–.49) — Drainage-Netz · Seen · Flüsse · Stream-Power-Erosion.
- **Multi-User + Fremd-Engine** (W12–W17) — Portal · Vibe-Pass · Bibliothek · Compute-Sharing · Sandbox-Tor.
- **Render/Tiefe** (V12–V17) — r184 + WebGPU · Toon/Cel · ACES · Mikro-Textur · Gras-Riese · Ghibli-Bäume · geteilte Aerial-Atmosphäre.
- **Das lebendige Feld** (V17.21–.50) — `auraAt` lesen · `_deposit*` schreiben · Vorhersagefehler-δ WERTEN + Emotion-Kern (W1–W5).
- **DSL-Weltregeln** (V17.33–.40) — Mensch · Nexus · KI schreiben am selben `Bedingung→Effekt`-Regel-Satz.
- **Crafting/Resonanz** (V17.59–.85) — ein Produkt-Vektor (Material⊕Form⊕Skala), viele Leser (Rolle·Domäne·Op·Stat).
- **Tiefe-Fundament** (V17.92–.118) — Ruckel · Schwimm · Strukturen · Trapeze · effiziente Höhe · Kavernen · Aquifer · Render-Harmonie · H3-Ozean · Worker-Mesh.
- **Wasser-Render** (V18.0–.31) — die Fläche-auf-`L` (das **statische** Modell, Render-Politur; die Dynamik bleibt Phase 1).
- **UI-Putz-Bogen** (V18.32–.83) — 8 Tabs → 6 Räume auf dem Werkstatt-Designsystem · Omnibox · der freie Bildschirm (Chat unten-links).

---

## Die operative Disziplin (für jede Welle)

1. **Regel #0** — pixel-blinde Arbeit wird browser-validiert, bevor die nächste Welle stapelt.
2. **Miss, rate nicht** — die 73 diag-Skripte sind die Disziplin; der Reproducer mit Output-Lesen *vor* dem Fix.
3. **Verdichte, baue nie parallel** (V17.9) · **Harmonie statt Revert** (V17.23) · **verifiziere KONSUM, nicht Existenz** (V17.31).
4. **Keine halben Schritte** (V17.30) — ist der Plan klar + das Gap benannt, baue das ganze Subsystem an die Wurzel.
5. **Merge-Rhythmus** — ein validierter Bogen = ein Merge. Kein 30-Wellen-Stapel mehr.
6. **Der Tisch bleibt schlank** — ein fertiger Plan wandert sofort in die Bibliothek; die roadmap trägt nur den Pfad.

## Versions-Konvention

MAJOR ist teuer (ein ganzes Zeitalter), MINOR ist die Welle (`V18.84` = die nächste). Pro Welle: ein
Commit + ein Chronik-Eintrag oben in `docs/archiv/handover.md`. Gilt eine Lehre dauerhaft → eine
kuratierte Zeile in `CLAUDE.md / Wichtige Gotchas`.
