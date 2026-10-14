# Übergabe OMEN 14.10. (Woche bei 91 %) — für den Agenten nach dem Reset am 20.10.

**Status: ZWISCHENSTAND + Übergabe.** Rolle: GPU-Messstation (GTX) und Werkplatz. Aufträge kommen vom Koordinator als
Karte.

## Zweige und Köpfe

| Zweig | Kopf | Stand |
|---|---|---|
| welle-m-e-instanz | d6e4b259 | in integ-probe und main. 1410-1, der Zeichner: EIN Programm je Signatur für instanzierte Foundry-Bauten; dazu der Nachzug des Draw-Zählers |
| welle-m-e-stoffe | 69a9e170 | in main. 1310-18: EIN Foundry-Graph je Signatur, Portal-Gestalt als Uniform |
| gtx-ratschen-1410 | 704fc303 [ci voll] | CI 38567269108 grün 13/13, noch nicht gemergt. Sechs GTX-Ratschen und der Mint-Fix 7d720cf7. Der Koordinator mergt mit K55 mess-wiese 54c78ff3 und K43-3 (Genesis 0/0 im Haushalt) |
| koordination | 496e1bdf + diese Übergabe | Berichte 1410-1, 1410-2, letzte ABAB (`1410-schluss-abab.md`), GTX-Ratschen |

- Kopf origin/main 495bf199, origin/integ-probe db940ecd. Beide tragen d6e4b259.
- **Lokale Bäume** (`C:\Users\micha\Desktop\AnazhRealm-OMEN`, node_modules als Junction auf `abab-b542`):
  - `abab-z545`: main 9fb869a5, die A-Seite der letzten ABAB.
  - `abab-p551`: 51cc19af, die B-Seite und die Seite der Ratschen-Serie.
  - `abab-i551a`/`abab-i551b`: Instrument 51cc19af mit lokalen Patches. `i551a` trägt den Haushalt (Wiese K55,
    Genesis 36/0). `i551b` trägt Wiese K55, Genesis 0/0, den Draw-Zähler d6e4b259, den Mint-Fix 7d720cf7 und die sechs
    geprägten Ratschen.
  - Nach dem Merge von gtx-ratschen-1410 + K55 + K43-3 braucht das Instrument KEINE lokalen Patches mehr. Dann ein frischer
    Worktree vom Kopf.
  - Älteres: `abab-p546`/`abab-i546a`/`abab-i546b` (1410-2), `abab-i19`, `abab-s18`. Sie können fallen.
- **Werkzeug in `p3/`:**
  - `k1410c/serie.sh` und `k1410b/serie3.sh`: ABAB mit Seiten-Wache. Ein Band-Urteil ist ein Befund, kein Neulauf-Grund.
  - `k1410c/auswertung.cjs`: Mittel, Δ, 2σ.
  - `k1410c/profil-diff.cjs`: CPU-Profil der Messfolge je FRAME, `selbst|gesamt`.
  - `k1410d/serie.sh`: die Ratschen-Serie, je Ort × Sicht 2 × (Erst + Zweit).
  - `k18/bild2.sh`: Bild-Paare und gpu-bank am Tor, `INS=`, `TICKS=400`.
  - `k1410/zaehl2.sh`: Befehle je Klasse an einer Pose.
  - `k1410/ci-warte.sh <run>`: CI über die API lesen, `gh` gibt es nicht.

## Was die Radeon-Ratschen brauchen

- **Lage:** Die sechs Radeon-Ratschen (Wiese, Genesis, Dorf × Ego, Third) sind gemessen an V18.545.0 (14.10.), am ALTEN
  Wiesen-Ort −900/−850 und am alten Genesis-Ort 36/0. Nach dem Merge von K55 und K43-3 passen sie nicht mehr zum Haushalt.
- **Die Radeon-Serie auf demselben Kopf**, auf der Radeon-Maschine, nicht auf dem OMEN:
  - je Ort × Sicht 2 Serien aus Erst- und Zweit-Boot, also 4 Läufe;
  - `p3/k1410d/serie.sh` mit `INSTR`/`WT` auf den Kopf;
  - dann `node scripts/werkbank.cjs ratsche --neu --ort <ort> <4 Läufe>`.
- **Ablauf:** 24 Läufe, auf der GTX ≈ 60 min. Der Mint-Fix 7d720cf7 muss im Kopf sein, sonst feuert H2b an der
  Gesamt-Zeile vramMB.
- **Danach:** `gate:profiband` H2b grün für alle 12 Ratschen.

## Offen: CPU-Takt p95 6,0–9,6 ms über dem Band (≤ 5,8)

- **Wo:** An allen gemessenen Orten auf der GTX, Ego und Third: Wiese 6,0–7,4, Genesis 6,8–9,6. Main reißt das Band an 3
  von 4 Orten ebenso, 6,0–7,4.
- **Gegen main:** Δ +0,3 bis +0,6 ms (letzte ABAB).
- **Benannte Täter je Frame** (Wiese, Ego + Third, 4 Boots je Seite, `profil-wiese-*.md` in `bericht/1410-schluss/`):

  | Täter | Δ je Frame |
  |---|---|
  | Render-Objekt-Pfad, inklusiv (`renderer._renderObjectDirect` → `renderObject`; +13 Befehle des Bündels) | 3,41 → 4,00 ms (+0,60 ms) |
  | `_projectObject` | +97 µs |
  | `_kaskadenWerferOben` | +54 µs |
  | `updateNode` | +51 µs |
  | `_blockerUmPlatz` | +47 µs |
  | `_fassade` (stamm/20c.js) | +37 µs |
  | Gelände-Kern K16 (`talgrund` +110, `flaeche` +53) gegen die gefallene Wildnis (−216) | netto −53 µs |
  | `_tickRadiatingAffordances` (K54 hält) | −83 µs |

  - `_fassade` ist mein Zeichner aus 1410-1: Der Getter `geometry` gleicht die Attribute je Zugriff mit der Senke ab.
    Ein Versions-Stempel genügt.
- **Messfalle:** Das Profil der Messfolge zählt je Sekunde. Bei 30–45 % mehr Frames auf B je Frame normieren
  (`profil-diff.cjs`). Die Selbstzeit-Zuordnung prüft man im laufenden Tick mit einer Hülle nach (1410-2: das Profil nannte
  die Affordanzen +0,9 ms, direkt waren es +0,055 ms).

## Mein nächster sinnvoller Auftrag

**CPU-Takt p95 ≤ 5,8 ms auf der GTX an Wiese und Genesis, Ego und Third.** Das ist die letzte Röte im Profi-Band E.
1. **Der Render-Objekt-Pfad je Draw:** Profil je Frame. Welche Bündel-Kinder und losen Objekte gehen je Frame durch
   `renderObject`, obwohl sich nichts änderte?
   - Lies r184 `_renderObjectDirect`/`renderObject`/`updateForRender`/`updateNode`.
   - Der Kandidat ist die Observer-Diät für die +13 Befehle des Bündels.
2. **`_fassade`:** ein Versions-Stempel statt Abgleich je Zugriff, −37 µs je Frame.
3. **`_projectObject`:** Tiefe und Zahl der Knoten im Graph (Bündel-Kinder, Zeichner unter Senken).
4. **Messung:** gpu-bank und Messfolge ABAB gegen den Kopf vor dem Schnitt, je Frame normiert.

## Lehren dieser Woche (in der Agenten-Erinnerung, hier kurz)

- **Siegel-Wörter:** „Schluss" darf in KEINER Nachricht stehen, die in eine Commit-Message wandern kann, auch nicht als
  „Schluss-ABAB". `gate:betriebsgesetz` prüft die Kopf-Message.
- **Bild-A/B:** Weniger Programm-Bauten lassen Inhalt früher ankommen (Nah-Streu). Bild-A/B darum mit 400 Takten
  Einschwingen.
- **Ratschen:** Ein Ratschen-Mint aus Läufen mit Zeichnern braucht den Draw-Zähler d6e4b259, sonst stehen Abstände am
  Ursprung.
- **`ci-lokal.cjs`** braucht absolute Pfade.

## Pflicht-OFFEN Rest

- **E (Profi-Band):** GTX-Ratschen neu, Frame p95 / Befehle / Dreiecke / VRAM im Band. Offen sind der CPU-Takt p95 und
  die Radeon-Ratschen am neuen Ort.
- **B (Ankunft ≤ 5 s kalt):** Weltbild kalt ≈ 28–30 s. Erst-Bau zweit −2 s durch 1410-1, kalt unverändert.
