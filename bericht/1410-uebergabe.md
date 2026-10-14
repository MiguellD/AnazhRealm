# Übergabe OMEN 14.10. (Woche bei 97 %) — für den Agenten nach dem Reset am 20.10.

**Status: ZWISCHENSTAND + Übergabe.** Rolle: GPU-Messstation (GTX 1060) und Werkplatz. Aufträge kommen vom Koordinator
als Karte, Antwort an den Absender.

## ERSTER Messauftrag der nächsten Woche (NOTBREMSE 14.10., nicht begonnen)

**Gehend-ABAB boden-stufen 9e2f9c7c gegen main 062ec357** (der Zweig trägt K51-3 bis K51-6: Geomorph, nur lesende
Nachbarn morphen, kein Wald- und Sichthöhen-Neubau beim reinen Stufenwechsel; main mit dem Schatten-Takt eingemergt).
- **Vorbereitet** (lokal, unberührt):
  - `abab-m062` (A, main 062ec357);
  - `abab-p9e2` (B, 9e2f9c7c);
  - `abab-im062` (Instrument 062ec357).
  - node_modules-Junctions FEHLEN noch (PowerShell `New-Item -ItemType Junction … abab-b542\node_modules`).
  - Der Wiesen-Patch FEHLT noch: Der Haushalt am Kopf sagt −900/−850; den Eintrag aus mess-wiese 54c78ff3 nur im
    Instrument setzen.
- **Ablauf** wie `1410-boden2-abab.md`:
  - `p3/k1410f/gehen.sh` kopieren, `H` und `INS` auf `abab-im062`;
  - je Seite 2 Sitzungen im Wechsel (A B, dann B A).
  - Urteil: Frame p95 und CPU p95 beim Einströmen („gehen 1“) und eingeschwungen („gehen 2“) gegen main.
  - Bleibt der Einström-Frame über 33 ms: `p3/k1410j/gehen-profil.sh` (Profil gehend sofort nach dem Stehen) je Seite,
    Täter je Frame mit `profil-diff`-Logik.
- **Abgabe:** `bericht/1410-boden3-abab.md`, kurze Zeile an den Koordinator.
- **Vergleich:**
  - K51-4 lag beim Einströmen bei 41,6 ms gegen main 25–33;
  - Täter waren die Folge-Kette (Chunk-Neubau ≈ 1 ms, Wald-Setzung +2,7 ms, Sichthöhen +1,5 ms);
  - K51-6 soll genau die Wald- und Sichthöhen-Neubauten schneiden.

## Zweige und Köpfe (Stand 14.10. abends; main = 062ec357 seit dem Abend, darin 7d7e2022)

| Zweig | Kopf | Stand |
|---|---|---|
| takt-wurzel | 7d7e2022 | **= main**. 1410-3: in Ruhe je Frame höchstens EINE Schatten-Kaskade, bewegt das alte Gesetz; CI 38612457191 13/13 |
| welle-m-e-instanz | d6e4b259 | in main. 1410-1, der Zeichner (EIN Programm je Signatur für Instanz-Senken) + Draw-Zähler-Nachzug |
| welle-m-e-stoffe | 69a9e170 | in main. 1310-18 |
| gtx-ratschen-1410 | 704fc303 | **nicht in main.** Sechs GTX-Ratschen (Wiese K55, Genesis 0/0, Dorf × Ego/Third) + Mint-Fix 7d720cf7 (die Gesamt-Zeile höchstens die Summe ihrer Zeilen); CI 13/13. Zu mergen MIT K55 mess-wiese 54c78ff3 (auch nicht in main): der Haushalt am Kopf sagt Wiese noch −900/−850, Genesis steht schon 0/0 (K43-3) |
| koordination | dieser Commit | alle Berichte 1410-* |

- **Lokale Bäume** (`C:\Users\micha\Desktop\AnazhRealm-OMEN`, node_modules als Junction auf `abab-b542`):
  - Messbäume je Kopf (abab-p5e2, abab-pf09, abab-pd47, abab-p672 …);
  - Instrument-Kopien mit lokalem Wiesen-Patch (abab-i5e2, abab-if09, abab-id47).
  - Nach dem Merge von K55 braucht das Instrument keinen Patch mehr. Dann frisch vom Kopf.
- **Werkzeug** (`p3/`):
  - `k1410h/serie.sh`: ABAB, überspringt gemessene Boots; ein Band-Urteil ist kein Neulauf-Grund.
  - `k1410c/auswertung.cjs`: Mittel, Δ, 2σ.
  - `k1410c/profil-diff.cjs`: CPU-Profil je FRAME, `selbst|gesamt`.
  - `k1410g/`:
    - `prof.sh`: Profil am Ort;
    - `zaehl*.sh`: die Diät je Frame;
    - `schatten.sh` / `bewegung.sh`: zwei Gesetze in EINER Sitzung, stehend und gehend+drehend.
  - `k1410f/gehen.sh` und `gehen-profil.sh`: Gehen 4 m/s über 60 m im echten Loop.
  - `k1410d/serie.sh`: Ratschen-Serie.
  - `k1410/ci-warte.sh <run>`: CI per API, `gh` gibt es nicht.

## Der CPU-Rest je Ort gegen 5,8 ms (Frozen E, GTX, Regler voll, stehend; ABAB 1410-3)

| Ort × Sicht | CPU-Takt p95 am Kopf | Rest bis 5,8 |
|---|---|---|
| Wiese Ego | 5,8 | 0 (hält) |
| Wiese Third | 6,4 | 0,6 |
| Genesis Ego | 6,3 | 0,5 |
| Genesis Third | 7,5 | 1,7 |

- Die Zahlen gelten mit RUHENDER Kamera, wie die Messfolge misst. Gehend gilt das alte Schatten-Gesetz; dort liegt der
  CPU-Takt p95 ohnehin bei 14–16 ms, das ist der Strom.
- **Die benannten Täter je Frame** (Genesis Third, `bericht/1410-3/`):
  1. Der **Render-Objekt-Pfad**: ≈ 30 µs CPU je Befehl in r184 (`renderObject` → `_renderObjectDirect`); 106–140
     Befehle an Genesis.
  2. Die **Kreaturen außerhalb des Bilds**: `updateCreatures` 0,75 ms mit 0 Tieren im Bild, darin `_tickKreaturZiegel`
     188 µs und `_kreaturHuellenKontakt` 111 µs. Takt an den Schirm binden (Gebot 7); erwartet −0,3 bis −0,5 ms.
  3. **`updateMatrixWorld`** 0,44 ms Selbstzeit, statische Unterbäume. Nur mit einer Linse für später angehängte Kinder.
- **Kein Täter:** die Observer-Diät. Von 708 Knoten-Besuchen laufen 29; die 1,6 ms von `_diaetGeteiltSchreiben` sind der
  verschachtelte Schatten-Render.

## Die Radeon-Ratschen fehlen am neuen Ort

- **Lage:** Alle sechs (Wiese, Genesis, Dorf × Ego, Third) sind gemessen an V18.545.0 (14.10.) am ALTEN Wiesen-Ort
  −900/−850 und am alten Genesis-Ort 36/0. Nach dem Merge von K55 passen sie nicht zum Haushalt.
- **Gebraucht:** die Serie auf der Radeon-Maschine (nicht OMEN) am Kopf, sobald gtx-ratschen-1410 und K55 gemergt sind.
  - je Ort × Sicht 2 Serien aus Erst- und Zweit-Boot, also 4 Läufe, nach `p3/k1410d/serie.sh` (`INSTR`, `WT` auf den Kopf);
  - dann `node scripts/werkbank.cjs ratsche --neu --ort <ort> <4 Läufe>`.
  - Der Mint-Fix 7d720cf7 kommt mit gtx-ratschen-1410. Danach `gate:profiband` H2b für alle 12.

## Die Gehend-ABAB der Boden-Stufen nach K51-6

- **Stand:**
  - K51-3 (9d3292de) und K51-4 (672ad0b2) halten stehend und eingeschwungen gehend.
  - Beim EINSTRÖMEN gehend reißen beide Frame p95 41,6 ms > 33 (main 25–33).
  - Täter je Frame (Profil an K51-4): die Folge-Kette des Stufen-Wechsels:
    - Chunk-Neubau ≈ 1 ms;
    - Wald-Setzung `_forestStehtFrei` +1,84, `_forestCellDarts` +0,88;
    - Sichthöhen der Baum-Stufen ≈ +1,5.
  - Der Morph selbst kostet +0,13 (`1410-boden2-abab.md`, Nachtrag).
- **Zu messen nach K51-6** (Zweig boden-stufen, zuletzt 0e4a0812):
  - wie `1410-boden2-abab.md`: `p3/k1410f/gehen.sh` gegen den main-Kopf, Wiese K55, je Seite 2 Sitzungen im Wechsel;
  - Urteil über Frame p95 und CPU p95 beim Einströmen (Lauf „gehen 1“) und eingeschwungen („gehen 2“);
  - dazu `gehen-profil.sh` (Profil gehend sofort nach dem Stehen), wenn der Einström-Frame über 33 bleibt.
  - Basis-Vorbehalt: gegen den gemergten Kopf messen, nicht gegen einen älteren Zweig-Stand.

## Lehren dieser Woche (Agenten-Erinnerung, hier kurz)

- **Siegel-Wörter** („Schluss“ …) auch nicht in Zweig-, Auftrags- und Berichtsnamen, die in eine Merge-Message wandern.
- **Takt-Gesetz ändern:** Wer eines ändert, sucht vorher in `scripts/playtest.cjs` nach der Methode. Der volle Playtest
  prüft alte Gesetze. Ein abgebrochener CI-Lauf kann echte Röte tragen: Jobs mit `failure` lesen.
- **Bild-A/B:** mit 400 Takten Einschwingen (Inhalt kommt verschieden früh an).
- **Profile:** je FRAME normieren. Eine Selbstzeit-Zuordnung im laufenden Tick mit einer Hülle nachprüfen.
- **`werkbank bild`** markiert die Schatten-Map neu: ein Schatten-Hinker ist damit unsichtbar.

## Pflicht-OFFEN Rest

- **E:** CPU-Takt p95 an drei von vier Orten über 5,8 (0,5 / 0,6 / 1,7 ms); die Radeon-Ratschen am neuen Ort.
- **B:** Weltbild kalt ≈ 28–30 s.
