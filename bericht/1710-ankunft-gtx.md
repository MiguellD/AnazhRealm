# Bericht 1710 Ankunft kalt GTX — integ f829df97 (V18.546.14), 4 Kalt-Starts

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 17.10. (PFLICHT-OFFEN B):
- Die Ankunft kalt auf der GTX am integ-Kopf f829df97. Die letzte GTX-Zahl war alt; seither kamen B3a, B3c und B3d.
- `diag-boot-stage --bild` mit leerer Platte, 4 Starts: Zeit bis Kontrolle und Weltbild kalt, dazu der Haupt-Faden vor dem ersten Bild,
  zerlegt.

## Urteil

- **Weltbild kalt = Kontrolle: 16,0 · 17,3 · 17,7 · 17,1 s** (Median 17,2). Heute früh an 985a923b + streu-rang waren es 20,0–21,6 s
  (`bericht/1610-ankunft-menge.md`), also rund −3,6 s.
  - Das Bild steht ganz (K2.png: Genesis-Platz, Portale, Wald, Himmel).
  - Ziel B (≤ 5 s) bleibt um den Faktor 3,4 offen.
- **Das Buch kommt bei 2,5–2,7 s statt 7,1 s (B3a).** Die erste Asset-Anfrage geht damit um 4,4 s früher hinaus. Das Weltbild kommt aber
  nur 3,6 s früher.
- **Der kritische Pfad ist jetzt der Boden-Ring und dahinter der Horizont, nicht mehr die Werk-Bahnen:**
  - Der Ring steht von ~5 s bis ~13 s auf „Ring 1 von 3“ und ist erst bei 14,7–14,9 s ganz (heute früh: 8,4 s).
  - Der Horizont hängt von 7 s bis 14 s bei 11 % und wächst erst danach auf 100 % (15,7–17,3 s). In K1 und K4 schließt er knapp vor
    Bauten bzw. Streu.
  - Karten, Bauten und Streu schließen bei 15,3–16,7 s (heute früh: 19,9–21,1 s).
- **Der Haupt-Faden ist ab dem Renderer zu 96–99 % belegt.** 39–48 lange Aufgaben bis zum Bild, zusammen 13,3–14,3 s, 15–20 davon über
  300 ms.
  - Die Linse benennt 5,8–6,9 s davon: Erst-Bau 3,0–3,7 s, Streu 1,4–1,8 s.
  - Das CPU-Profil nennt als größte Einzel-Methode den Gang der Uniform-Diät `AnazhRealm._diaetGang` (bild-kosten.js:3447) mit 0,94–1,0 s
    Selbstzeit.

## Die Starts

| Start | Weltbild = Kontrolle s | Buch angenommen s | erste Werk-Anfrage s | Aufträge bis Bild | zuletzt offen (s): boden · karten · bauten · streu · horizont | lange Aufgaben (Σ, > 300 ms) |
|---|---|---|---|---|---|---|
| K1 | 16,01 | 2,70 | 2,7 | 126 | 14,94 · 15,34 · 15,68 · 15,61 · 15,68 | 48 (13,3 s, 15) |
| K2 | 17,29 | 2,60 | 2,6 | 130 | 14,88 · 15,69 · 16,27 · 16,66 · 17,09 | 39 (14,1 s, 18) |
| K3 | 17,65 | 2,70 | 2,7 | 130 | 14,65 · 16,09 · 16,36 · 16,68 · 17,26 | 44 (14,3 s, 20) |
| K4 | 17,14 | 2,53 | 2,5 | 130 | 14,95 · 16,11 · 16,45 · 16,87 · 16,29 | 47 (14,3 s, 20) |

Die übrigen Terme schließen früher: welt 1,3–2,4 · buch 2,5–2,7 · leib 9,1–9,7 · dorf 8,8–11,1 · pflanzung 10,8–13,4 s (Median über
K1–K4, Proben im 0,5-s-Raster).

## Der Haupt-Faden vor dem ersten Bild

CPU-Profil 0,5 ms, mit Takt-Marken auf die Seiten-Uhr gelegt. Die Phasen-Marken folgen der Seite; die Reihenfolge hat B3a geändert, die
Foundry kommt jetzt mit `init`.

| Phase (Marke → nächste) | ab s | Haupt-Faden ms | idle | was ihn trägt (Selbstzeit ms) |
|---|---|---|---|---|
| Navigation | 0 | 77–137 | 16–58 % | – |
| Skripte bis Instanz/Foundry | 0,12–0,18 | 1 165–1 482 | 8–10 % | native (Übersetzen) 514–621 · `_chatEcho` feld-leben.js:604 106–157 · `_holzWahl` dirigent-regler.js:527 57–94 · phyto-core `grow` 36–69 |
| Foundry-Faden geboren → DOM fertig | 1,30–1,66 | 783–1 030 | 0 % | zu ~99 % native „(program)“, JS < 25 ms |
| DOM fertig → Renderer | 2,11–2,23 | 509–529 | 0 % | gelaende-core 133–150 · wasser-hydro 70–87 · gelaende-boden 83–85 (erster Chunk, Hydrosphäre) |
| Renderer/Spieler → erster Chunk (Ring 0) | 2,64–2,74 | 1 409–1 422 | 0–1 % | three.webgpu 646–679 (`build`, `_getChildren`, `getDataFromNode`) · gelaende-boden 219–246 (`_voxelExtractSurfaceVertices`, `_voxelHoehlenGraph`) |
| Ring 0 → Weltbild | 3,97–4,16 | 11 913–13 494 | 1–4 % | siehe unten |

**Ring 0 → Weltbild** (11,9–13,5 s Haupt-Faden):

| Selbstzeit je Methode (Top) | ms | | je Datei | ms |
|---|---|---|---|---|
| `AnazhRealm._diaetGang` bild-kosten.js:3447 | 940–996 | | three.webgpu.min.js | 2 162–2 855 |
| three `build` | 394–472 | | bild-kosten.js | 1 061–1 187 |
| GC | 255–352 | | vegetation-baum.js | 691–1 012 |
| phyto `grow` | 225–280 | | gelaende-fern.js | 559–837 |
| three `createAttribute` | 251–277 | | phyto-core.js | 640–751 |
| `_ortGestaltSame` vegetation-baum.js:887 | 188–289 | | gelaende-boden.js | 622–682 |
| `_waldPlanKasten` vegetation-wiese.js:1580 | 202–252 | | vegetation-streu.js | 639–696 |
| `_fernRingKlassen` gelaende-fern.js:755 | ~191 | | gelaende-chunks.js | 562–695 |

**Die Linse je Sekunde** („blockiert“, summiert bis zum Bild):

| Start | blockiert | Erst-Bau | Streu | Boden | Bauten | Ort-Wahl | Gruppen-Bau | Dorf | Buch |
|---|---|---|---|---|---|---|---|---|---|
| K1 | 13,8 s in 17 s | 3,00 | 1,40 | 0,44 | 0,39 | 0,25 | 0,19 | 0,08 | 0,08 |
| K2 | 14,5 s in 18 s | 3,67 | 1,37 | 0,47 | 0,36 | 0,28 | 0,23 | 0,09 | 0,04 |
| K3 | 14,6 s in 18 s | 3,20 | 1,84 | 0,48 | 0,34 | 0,28 | 0,20 | 0,08 | 0,04 |
| K4 | 14,7 s in 18 s | 3,18 | 1,61 | 0,51 | 0,36 | 0,30 | 0,23 | 0,09 | 0,04 |

Benannt sind 5,8–6,9 s der Blockade. Den Rest trägt das Profil: `_diaetGang` ~1 s, GC, phyto `grow`, Wald-Plan, Ort-Gestalt und
Fern-Ring-Klassen.

## Die Bahnen und die Menge

- **Werk-Bahnen:** werk, werk1 und werk2 sind ab 2,5–3,4 s bis zum Bild belegt, je 12,1–13,8 s von 12,7–14,9 s (82–97 %). Zusammen
  106–110 Aufträge.
- **Bäcker:** Der erste Bäcker sendet ab 4,2–4,3 s, bäcker1 ab 5,8–6,1 s und bäcker2 ab 6,4–7,0 s. Je Bahn 4–8 Karten, 1,4–2,1 s je Karte.
  Ohne den Bäcker-Patch der Station ist die Karte hier nicht zerlegt (`bericht/1610-ankunft-menge.md`: steady 0,98 s).
- **Menge** (Bahn-s bis Bild, Median je Start): im Blick 35,0 · außer Blick 34,5 · ohne Ort 1,6.
  - Häuser im Blick 39 Aufträge, 12,9 Bahn-s (heute früh 17,5).
  - Baum-Karten außer Blick 11, 13,0 Bahn-s.
  - Leib 8,1 Bahn-s.
  - Felsen im Blick 6 statt 18: Die Kristall-Seltenheit gilt jetzt ab dem ersten Chunk.

## Was daraus folgt

- **Der Boden-Ring wartet** (Ring 1 → 3 von ~5 bis 14,9 s), obwohl kein Boden-Term blockiert (Boden 0,44–0,51 s je Start). Er bekommt
  keinen Takt, weil der Haupt-Faden 80–100 % jeder Sekunde blockiert. Heute früh war er bei 8,4 s ganz; seit dem früheren Buch fällt die
  Ingest-Arbeit in seine Wachstumszeit.
- **Der Horizont wächst erst nach dem Ring** und schließt das Bild in K2 und K3 (17,1 / 17,3 s). Ohne diese Folge hielten Bauten und
  Streu das Bild bis 15,6–16,9 s.
- **Die Hebel nach Größe:**
  - Erst-Bau 3,0–3,7 s (die ersten Programme und Gruppen).
  - Streu 1,4–1,8 s.
  - `_diaetGang` ~1 s.
  - Der Ring, der unter einem blockierten Faden nicht wächst.

## Methode

- **Stand:** abab-ak1 = f829df97 (V18.546.14).
- **Linse:**
  - Die Linse des Kopfs `scripts/diag-boot-stage.cjs` (mit `--kalt` = echter Renderer und leeres Profil, `--echt` = Hardware-GPU
    1920×1080, `--bild`, `--sek 180`).
  - Dazu der Stations-Patch (55 Zeilen, nicht im Repo, `station-linse.diff`): CPU-Profil 0,5 ms und die Probe `menge-probe.js` (Aufträge,
    Phasen-Marken, Tor-Terme).
- **Ablauf:** GPU-Schloss je Start, 11:26–11:30, K1–K4 hintereinander. Exit 1 = Urteil der Linse (Weltbild > 5 s); die Messung gilt.
- **Auswertung:** `menge-analyse.cjs` (Phasen und Haupt-Faden aus dem Profil, Bahnen in Antwort-Reihenfolge, Tor-Terme), dazu die
  Summen der Linse je Sekunde.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten liegen in `bericht/1710-ankunft-gtx/`: `K1–K4.json`, `.txt`, `.png`, `analyse-K1-K4.txt`, `serie.sh`,
  `station-linse.diff`.
  - Die CPU-Profile (je ~7 MB) liegen auf dem OMEN in `p3/k1710ak/`.
- **Offen:** B (Ankunft ≤ 5 s kalt) mit 17,2 s am Kopf. Die Hebel oben sind benannt, nicht geschnitten.
