# Bericht 1110-9 Teil 1 — E am Stand integ-probe da90ee92 (GTX 1060)

1. **Gemessen** (je Boot frisch, Regler voll, mit Takt):
   - Die Wiese hält alle fünf Kriterien von E.
   - Die Genesis reißt vier: Dreiecke 2,27 M statt 680k (3,3×), VRAM 141,8 statt 118 MB, CPU-Takt p95 7,6 statt 5,8 ms, Befehle 226 statt 208.
   - Das Dorf liegt mit 125,2 MB beim VRAM über dem Soll.
2. **Der Täter des größten Abstands** sind die Tore des Genesis-Rings auf L0. Ihre Budget-Zeile (porta-core) sagt `tris 184000, band 60000`: Ein Tor kostet dreimal seinen Anteil am Band. Vier Tore im Blick tragen 1,2 M Dreiecke in Hauptbild und Schatten, ihre L0-Puffer liegen resident, und ihre 170–517 Objekte je Tor treiben den Render-Pfad der CPU.
3. **Instrument erweitert:** Die Genesis-Folge misst jetzt Lauf voll, das Mess-Dorf hat eine eigene Folge, jeder Lauf trägt seinen Takt (`welle-m-e-messung` 3ccdcaea).

Auftrag: `auftrag/1110-9-omen-e-messung.md` (koordination 3fb7408c). Seite und Instrument: integ-probe **da90ee92** per `git ls-remote` (Seiten-Wache sha256 346743340e2d84dd je Boot). Rohdaten: `bericht/1110-9/` (`boots/`, `taeter/`, `auswertung.md`).

## Die Tabelle (Median der Boots; Wiese 3, Genesis 3, Dorf 2; `auswertung.md`)

| Kriterium | Soll | Wiese | Genesis | Dorf | Täter beim Namen |
|---|---|---|---|---|---|
| Frame p95 (Regler voll) | ≤ 33 ms | 16,8 | 25,1 | – | – |
| CPU-Takt p95 | ≤ 5,8 ms | 5,4 | **7,6 (+1,8)** | – | Genesis: der Render-Pfad je Objekt (siehe unten) |
| Befehle | ≤ 208 | 83 | **226 (+18)** | 105 | Genesis: Klasse `bau` 156 (Soll 40) — Tore L0 |
| Dreiecke | ≤ 680k | 471k | **2 274k (+1 594k, 3,3×)** | 605k | Genesis: `bau` 1 806k (Soll 60k) — Tore L0 |
| VRAM | ≤ 118 MB | 112,4 | **141,8 (+23,8)** | **125,2 (+7,2)** | Genesis: Szene-Puffer 56,5 MB (Wiese 27,4), davon Tor-L0; Dorf: `bauSatz` 9,3 MB |

**Takt:** Die GPU lief in jedem Lauf am Leistungs-Deckel, 1699–1733 MHz (`boots/*.json` `kurz.laufVoll.takt`).

**Je Boot:**

| Boot | Frame p95 | CPU p95 | Befehle | Dreiecke | VRAM | MHz |
|---|---|---|---|---|---|---|
| w1 / w2 / w3 | 16,8 / 16,8 / 16,8 | 5,1 / 5,4 / 5,6 | 82 / 83 / 83 | 472k / 468k / 471k | 112,4 / 112,4 / 112,5 | 1711 / 1720 / 1731 |
| g1 / g2 / g3 | 25,1 / 25,1 / 25,1 | 7,5 / 7,6 / 8,1 | 226 je | 2 274k je | 141,8 / 141,8 / 141,5 | 1711 / 1733 / 1699 |
| d1 / d2 | – | – | 105 je | 605k je | 125,6 / 124,7 | – |

Alle 8 Boots: Urteil der Folge GRÜN, exit 0 (`fortschritt.log`).

## Die Täter an der Genesis

**Die Klasse `bau` im Band** (g1, `boots/g1.json` → `messung.roh.zensus`):

| Tor (L0) | Dreiecke | davon haupt / k0 / k1 | Befehle | Abstand |
|---|---|---|---|---|
| drachentor | 506k | 297k / 191k / 18k | 24 (Instanzen 24) | 10–20 m |
| maurentor | 314k | 184k / 119k / 12k | 25 | 11 m |
| verkalkt | 295k | 168k / 117k / 9k | 24 | 9–13 m |
| geisttor | 89k | 59k / 30k / – | 8 | 13 m |

Die Tore allein tragen 1 204k Dreiecke, mit ihren Membranen 1 268k. Die nahe Kaskade k0 zeichnet `bau` mit 647k, denn Stufe 0 wirft selbst, nach der Budget-Zeile `schatten 0`.

**Die Budget-Zeile** (porta-core.js:61 ff.):
- `gate: { 0: { tris: 184000, band: 60000, draws: 13, schatten: 0 }, fernform: "gesetz" }`, dazu `kindStages.gate = [0]`.
- Im Ring steht der Spieler 11 m vor den Toren, also innerhalb der Nah-Grenze `d0` 12 m. L0 ist dort die richtige Stufe, auch eine L1 griffe nicht.
- Die Goldens des Vertrags v4 (`spec/asset-contract/v4/golden/gates.json`): 90 720 – 116 074 Ecken je Tor-L0.

**VRAM** (Puffer der Genesis, `boots/g1.json` `messung.puffer`): bodenSatz 17,3 · maurentor-L0 5,5 · verkalkt-L0 5,1 · maschine-L0 4,8 · drachentor-L0 4,3 · kathedrale-L0 3,6 · bauSatz 2,9 MB. Die Tor-Puffer liegen resident, auch für Tore außer Sicht.

**CPU-Takt** (`taeter/genesis-takt.txt`, `taeter/genesis-profil.txt`):
- Mit ruhendem Render liegt der Spiel-Takt an der Genesis bei p95 3,3 ms. Die Differenz zum Lauf (7,6 ms) ist der Render.
- Das Profil unter Regler voll verteilt sich auf den Pfad je Objekt: `updateMatrixWorld` 1,9 %, `_diaetRefresh` 1,3 %, `update`, `setVertexBuffer`, `_projectObject`, `equals` je ~1 %.
- Die render-Wanduhr liegt an der Genesis bei 4,2–4,6 ms gegen 2,4–2,8 ms an der Wiese.
- Laut Vertrag hat ein Tor 170–517 Objekte.

**Das Dorf:** VRAM 125,2 MB, davon `bauSatz` 9,3 MB (Wiese 2,7) für die Häuser des gebauten Dorfs. Befehle und Dreiecke im Soll.

## Teil 2 — die Entscheidung

**Der größte Abstand** sind die Dreiecke an der Genesis (3,3×). Sein Täter, die Tore auf L0, trägt dort auch Befehle, VRAM und CPU-Takt.

**Die Wurzel ist das Asset.** Die eigene Budget-Zeile des Tors gibt ihm 60k im Band, gebaut sind 184k. Nach Lehre 19 heilt ein LOD, das nicht reduziert, am Studio. Der Host kann es nicht tragen, weil L0 im Ring die richtige Stufe ist.

**Der Schnitt:** `welle-m-e-tor`, porta-core, das Tor-L0 auf seine Band-Zeile.
- Die Detail-Größen des Tors (Segmente, Ornament-Teilung) halten 60k Dreiecke und ≤ 13 Befehle.
- Die Gestalt bleibt dieselbe (Bild-Paar am Ausgabe-Pfad an Armlänge und 11 m, wie A1).
- Der Wurf folgt dem neuen L0.

**Das ist ein Re-Mint der Tor-Goldens** (Vertrag v4, 16 Fälle), also ein Vertrags-Akt unter Byte-Beweis. Ich fange damit an, sobald du ihn freigibst. Bis dahin lese ich `buildGate`, um zu benennen, welche Teile die 184k tragen.

## Status: ZWISCHENSTAND · Übergabe

- **Pflicht-OFFEN Rest:** A · B · C · E stehen. E ist an der Genesis gemessen offen, mit Zahl.
- **Instrument:** `welle-m-e-messung` 3ccdcaea (omen-messfolge: Genesis mit Lauf voll, Dorf-Folge, Takt je Lauf), Selbsttest GRÜN.
- **Worktree:** `e-mess` (integ-probe da90ee92).
