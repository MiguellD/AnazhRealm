# Bericht 2110 Messschuld Radeon 2: am Kopf main 816f26b4 (V18.546.53), Radeon 890M, Fenster 1920×1080

**Status: ZWISCHENSTAND.** Ich habe nur gemessen und nichts geschnitten, ins Repo ging kein Commit. Die Rohdaten liegen in `bericht/2110-messschuld-radeon-2/`, die Mess-Skripte (Scratch, nicht im Baum) in `…/skripte/`.
Station: Der save-server lief auf :7960. Weil `isSaveServerHost` nur :4312 kennt, ist :7960 für das Speichern der Browser-Pfad des Spielers. Die Werkbank lief auf :7962, die Gates auf 7964–7966. Jeden echten Lauf habe ich unter dem GPU-Schloss `messschuld-2` gefahren. Einmal musste ich 270 s auf ein fremdes Schloss warten.
Fremdlast: Neben meinen Läufen fuhren andere Arbeiter headless auf der GPU, darunter Werkbänke auf :7951/:7953 (dorf, `licht --naesse`), `diag-regler-wirkt` und `diag-kreatur-takt`. Jede Zeit-Zeile nennt deshalb die fps, die im selben Lauf an der Mess-Wiese gemessen wurden.

## M2 Gelände K2 (a) Graben-Bild: heute 0, **Urteil 1**
- **Staffel 1:** (a) im Ausgabe-Bild an einem Gerät, also EINE Fläche, nie über dem Spiegel und ≤ 2 s gefüllt.
- **Messung:** Der Spiel-Loop lief, die Kamera war Third. Am Fluss nächst Genesis wählten 5 Saaten je einen Ufer-Punkt. Je Punkt ein Graben 1 m und 3 m jenseits der Krone (3,34–3,68 m). Gegraben habe ich über die echte Eingabe: Fadenkreuz auf den Punkt, CDP-Klick, Verb `graben`. Je präsentiertem Bild habe ich die gezeichneten Wasser-Flächen über ±4,5 m gezählt, mit derselben Messung wie wasser-linse `wasserGraben`.
- **Zahl:** 9 von 10 Gräben gegraben. Der erste traf ein Bauwerk (Verb `abbau`).
  - In allen Bildern aller 9 Gräben: `doppelt` 0 und `über dem Spiegel` 0.
  - Gefüllt (90 % des Endstands) nach 143–211 ms bei 1 m (4 Saaten) und nach 336 ms bei 3 m (Saat 11).
  - Bild 2 s nach dem Hieb: eine glatte Fläche, die an den Fluss anschließt (`m2-s11-a3-vor.png` gegen `-2s.png`, selbst angesehen).
- **Offen:** Bei 4 Saaten überlappt der 3-m-Graben den 1-m-Graben (nass vorher 213–258), dort ist er nicht getrennt urteilbar. Der Damm (b), die Ferne (d), Ego und die GTX fehlen für die 2.
- **Roh:** `m2-graben.json`, `m2-s11-a3-*.png`, Skript `skripte/m2-graben.cjs`.

## M15 Klang K2 gesehen = gehört: heute 0, **Urteil 1**
- **Staffel 1:** Wind an einem Gerät, Kreuzkorrelation Halme ↔ Pegel des Wind-Busses r ≥ 0,6.
- **Messung:** 60 s an der Mess-Wiese, Ego, Böen frei, Tiere gehalten, Klang über den Knopf „Klang" (CDP-Klick).
  - Bild: CDP-Screencast des präsentierten Fensters, 499 Bilder. Gemessen habe ich die mittlere |ΔLuma| im Boden-Ausschnitt, in 0,5-s-Fenstern.
  - Ohr: Analyser am Gain der Wind-Stimme (Bandpass 210 Hz, an der Erzeugung gefunden), 1 231 Proben.
- **Zahl:** r = **0,80** bei Lag 0 (n = 119 Fenster), Lag ±3 s nur noch 0,25–0,36. Variationskoeffizient Bild 0,23, Ohr 0,53. Last: 44,1 fps an der Mess-Wiese.
- **Offen:** Für die 2 fehlen das Ufer (Pegel ↔ Strömung), der Regen und die GTX.
- **Roh:** `m15-wind.json`, Skript `skripte/m15-wind.cjs`.

## M15 Klang K4 Körper aus Stoff: heute 0, **Urteil 1**
- **Staffel 1:** Spektral-Schwerpunkt der Schritte je Stoff ≥ 300 Hz verschieden, ODER der Motor folgt der Drehzahl.
- **Messung:** Je Stoff 10 s Gehen mit W gehalten, an einem Ort, den `_terrainMaterialAt` im Umkreis von 10 m einheitlich nennt. Abgegriffen habe ich mit einem Analyser an jedem Schritt-Gain, gefunden über den Stapel `_playSchrittOneShot`. Je Burst der Schwerpunkt, gruppiert nach dem Stoff des Schritts.
- **Zahl:** Median erde **359 Hz** (n 19, p10–p90 228–463), glut **1 721 Hz** (n 22, 1 531–1 896), stein **2 404 Hz** (n 23, 2 115–2 538). Der kleinste Abstand ist 682 Hz, die Bänder überlappen nicht.
- **Offen:** Holz und Wasser habe ich nicht gemessen, ebenso Landung, Doppler und Motor. Die GTX fehlt.
- **Roh:** `m15-schritt.json`, Skript `skripte/m15-schritt.cjs`.

## M15 Klang K5 Kosten und Aussetzer: heute 1, **Urteil 1**
- **Staffel:**
  - 1 = Kosten an das Hörbare gebunden.
  - 2 = dazu ≤ 0,2 ms p95 in Bewegung und 0 Aussetzer in 10 min, beide Geräte.
- **Messung:** `diag-klang-zensus` am Kopf (headless, :7966): GRÜN. Die Welt-Abfragen je Klang-Takt wachsen nicht mit 4 000 Bauten und 200 Läufen (bauten 167 → 0). Im 21-min-Spielgang (M14) habe ich die Haupt-Faden-ms von `symphonyTick` + `_schrittKlangTick` + `_tierRuf` je Bild gemessen, dazu `AudioContext.playbackStats`.
- **Zahl:**
  - Klang-ms je Bild p95: gehen 0,1 ms (max 6,3), Fahrt-Phase 0,3, gehen nachts 0,5 ms (max 11,2).
  - **0 Aussetzer** in 1 270 s Wiedergabe (underrunEvents 0).
- **Offen:** Die 2 bricht schon an der Radeon (0,3/0,5 > 0,2 ms), die GTX ist ungemessen.
- **Roh:** `m15-gate-klang-zensus.log`, `m14-spielgang.json` (`klangTakt`, `audioA/B`).

## M16 Speicher K1 Tab-Tod im Browser-Pfad: heute 0, **Urteil 0 (ROT)**
- **Staffel 1:** Tab-Tod an einem Gerät, der geladene Stand ≤ 10 s alt, 0 korrupt, 0 halbe Welten.
- **Messung:** Host :7960 (kein save-server-Pfad), echtes Spiel im Fenster, W gehalten. Getötet habe ich den Browser-Prozess hart (`taskkill /F /T`), 20-mal:
  - 10-mal am Schreib-Haken, je 2 nach .bak, Platz, Versionen, IDB-put und Index;
  - 10-mal zu zufälliger Zeit (6–36 s).
  - Danach Neustart mit demselben Profil. Die geladene Pose habe ich gegen das Schreib-Log aller Zyklen gestellt; die .bak-Kopie zählt dabei nicht als Zeitpunkt.
- **Zahl:**
  - Welt-ID 20/20 gleich, 0 korrupt, 0 Rettungs-Meldungen.
  - Alter des Stands: an jedem Haken **10,00–10,01 s**; die Schreiber vor dem Tod gehen also ganz verloren, localStorage und IDB.
  - Zufall 0,9–9,8 s, aber einmal **30,77 s** (Weg-Verlust 7,8 m). **5 von 20 > 10 s.**
- **Offen:** Edits und Bauten liefen in den Zyklen nicht mit, „halbe Welt" ist nur an der Welt-ID geprüft. Das ist das Vorher von Speicher H1.
- **Roh:** `m16-tabtod.json`, `m16-tabtod.log`, Skript `skripte/m16-tabtod.cjs`.

## M16 Speicher K2 Speichern kostet keinen Frame: heute 1, **Urteil 1**
- **Staffel 1:** ≤ 0,3 ms je Bild (p95), frische Welt, Pfad des Spielers.
- **Messung:** 90 s gehen (W) auf :7960, mit einer Hülle um `saveState` und einem CPU-Profil (100 µs) als Gegenprobe.
- **Zahl:**
  - Je Bild p95 **0 ms** und p99 0 ms (5 324 Bilder, 10 davon mit Save), Mittel 0,014 ms.
  - Je Ruf aber p50 **6,6 ms**, max 14,6 ms (Profil 72,5 ms gegen Hülle 74,9 ms). Stand 210 kB.
- **Offen:** Der Save-Frame selbst ist ein Hänger-Kandidat. Für die 2 fehlen 0,1 ms nach 2 h und 10 000 Edits sowie die GTX. Die frühere GTX-Zahl 0,12 ms je Bild ist kein Ruf-Maß.
- **Roh:** `m16-k2k4.json`, Skript `skripte/m16-k2k4.cjs`.

## M16 Speicher K4 Bild-Rundlauf: heute 1, **Urteil 1**
- **Staffel:**
  - 1 = Zahlen-Rundlauf bewiesen.
  - 2 = bild-diff ≤ 1 % mit Pflicht-Inhalt, beide Geräte.
- **Messung:**
  - Den Zahlen-Rundlauf hält `diag-persistence` am Kopf: 14/14, (L) Löcher nach Reload 300/300.
  - Bild-Rundlauf: Third, ein Stein-Block und ein Edit im Blick, Bühne Mittag. Ausgabe-Bild 1920×1080, dann `saveState`, frischer Prozess mit demselben Profil, dieselbe Pose (dPose 0), Bild.
- **Zahl:** **6,75 %** der Pixel mit |ΔLuma| > 8, mittleres ΔLuma 2,43.
  - Selbst angesehen: Bau und Grube stehen wieder.
  - In der Grube spiegelte vorher Wasser, nachher ist sie trocken.
  - Fernes Geröll links ist nachher dichter.
- **Offen:** Die 2 bricht an der Radeon (Wasser in der Edit-Grube kehrt nicht zurück). Die GTX fehlt.
- **Roh:** `m16-gate-persistence.log`, `m16-k2k4.json`, `m16-k4-vor.png`, `m16-k4-nach.png`.

## M16 Speicher K5 Über Versionen: heute 1, **Urteil 1**
- **Staffel:**
  - 1 = eine Migrations-Klasse bewiesen.
  - 2 = Korpus ≥ 10 alter Versionen unter spec/.
- **Messung:** `diag-persistence` am Kopf: (U) Boden-Umzug, 25 Bauten auf neuem Boden, Abweichung 0 m, Gegenprobe ohne Umzug. Ein Korpus existiert nicht.
- **Offen:** Der Korpus ist ein Bau im Baum, kein Messgegenstand.
- **Roh:** `m16-gate-persistence.log`.

## M18 Halten K2 Eingabe → erstes Schwung-Bild: heute 0, **Urteil 0 (ROT)**
- **Staffel 1:** ≤ 50 ms und Hit-Stop im Ausgabe-Bild, ein Gerät.
- **Messung:** Wie `werkbank latenz`:
  - Start ist `mousedown.timeStamp` (CDP, Zeiger gefangen, ein Tier unter dem Fadenkreuz, Verb `hieb`).
  - Ende ist die Marke `getCurrentTexture`, an der die rechte Hand (`rig.armR.wrist`, Leib-Raum) ≥ 1 cm von ihrer Lage im Bild vor dem Klick steht.
  - 30 Proben je Sicht; die Faust schwingt.
- **Zahl:**
  - Third p50 **95 ms**, p95 **126 ms**. Ego p50 **127 ms**, p95 **151 ms**. Last: 51,5 fps an der Mess-Wiese.
  - Zerlegung: Das erste Bild, das `_swing` trägt, kommt nach 87/117 ms.
  - Täter: `tryMouseBreak` ist 64–86 ms synchron. Davon entfallen auf `_pickCreatureAtCrosshair` je Ruf 125–171 ms unter der Mess-Hülle; das ist der Raycast über alle Kreatur-Meshes, 5 Kreaturen in der Welt.
- **Hit-Stop:** Die Mechanik steht. Im Probe-Lauf steht die Anzeige-Uhr des Schwungs 3 Bilder bei 0,171 nach dem Treffer (33 ms). Im Bild ist er nicht gemessen; in 5 Bild-Versuchen drängte das Tier ab, das Verb wurde `graben`.
- **Roh:** `m18-schwung.json`, `m18-hitstop-probe.txt`, Skripte `skripte/m18-schwung.cjs`, `probe-kette.cjs`, `probe-hit.cjs`.

## M19 Ökologie K5 ein gebundenes Tier folgt 10 min: heute 0, **Urteil 1**
- **Staffel 1:** Ein gebundenes Tier folgt ≥ 10 min über Hindernisse.
- **Messung:**
  - Ab der Mess-Wiese: ein Tier 4 m hinter dem Spieler gesetzt, dann „folge mir" im Chat (Enter, Text, Enter per CDP). Antwort: „die nächste Kreatur folgt mir", Aufgabe `follow_player`, bond 0,14.
  - Danach 10 min gehen (W gehalten), alle 20 s ein Schwenk der Gier, je Sekunde der Abstand.
  - Den Weg habe ich danach am Gesetz geprüft (`getTerrainHeightAt`, `_atlasWaterLevelAt`, Saat `anazh-realm-seed`).
- **Zahl:**
  - 597 Proben, 0 fehlend, die Aufgabe die ganze Zeit `follow_player`.
  - Abstand p50 **3,56 m**, p95 3,57 m, max **14,1 m**; 98,5 % ≤ 10 m. bond 0,14 → 1,0.
  - Spieler-Weg 684 m, Höhe 27,6–101,7 m, Anstieg 106 m, Hang bis 44°.
  - **160 s am Hang > 15°** (max Abstand dort 14,1 m), **14 s im Wasser**.
- **Offen:**
  - Wald am Weg ungezählt (die Kronen-Karte las headless 0).
  - |dy| bis 18,4 m zwischen Tier und Spieler ist ungeklärt.
  - Für die 2 fehlen der Gegenlauf bond = 0 (Ansteckung), der Reload und die GTX.
  - Zwei Vorläufe zählen nicht: Am Genesis-Platz steckte der Spieler 116/120-mal (12 m Weg), im Spielgang ging er nur 126 m.
- **Roh:** `m19-folgen.json`, `m19-weg.json`, Skripte `skripte/m14-spielgang.cjs` (NUR_TIER), `m19-weg.cjs`.

## M14 Profiband K5 20 min Spielgang: heute 0, **Urteil 0 (ROT)**
- **Staffel 1:** an einem Gerät, im Spielgang (ankommen, gehen, fahren, bauen, Tor, Nacht, Weg ≥ 5 km).
  - p95 der letzten 5 min ≤ erste × 1,05;
  - VRAM ≤ 2 MB zurück am Start;
  - buf:ruhend und buf:verwaist = 0.
- **Messung:** 21 min am Stück, Fenster, Spiel-Loop, Klang an.
  - Ablauf: frisch ankommen, Zensus A, 10 min gehen mit dem gebundenen Tier, GT aufsitzen und 6 min Fahrt, „setze uhrzeit mitternacht" im Chat, ein Bau (`spawnArchitecture`, benannt), 4 min gehen, zurück an den Start, Zensus B.
  - Gemessen: rAF-Intervalle je Bild, VRAM-Abgriff, Puffer-Zensus nach GC, JS-Heap nach GC.
- **Zahl:**
  - Frame p95 erste 5 min **16,2 ms**, letzte 5 min **42,3 ms**, Faktor **2,61**. Je Minute steigt p95 ab der Fahrt von 8,8 auf 25–50 ms; p50 nachts gehend 25,1 ms gegen 8,4 ms am Tag. Unter Fremdlast, fps am Start 119.
  - VRAM 113,9 → 127,0 MB (**+13,1 MB**).
  - **JS-Heap nach GC 186 → 1 118 MB (+932 MB)**; meine eigenen Spuren tragen davon ≈ 12 MB.
  - Puffer: szene 24,2 → 35,5 MB, **ruhend 0, verwaist 0**. 0 Aussetzer.
- **Offen:**
  - Der Spielgang ist unvollständig: Der GT stand (E nahm ihn nicht, `mountArchitecture` saß auf, v ≈ 0, 86 m), kein Tor, Weg ≪ 5 km.
  - Die Zeit-Drift trägt Fremdlast, Nacht und Fahrt-Phase gemischt. Heap und VRAM sind lastfrei und ROT; den Täter des Heaps habe ich nicht benannt.
- **Roh:** `m14-spielgang.json`, `m14-spielgang.log`, `m14-last-vor.txt`, Skript `skripte/m14-spielgang.cjs`.

## M13 Profiband K3 Haushalt + Ratsche (Radeon-Hälfte): heute 0, **Urteil 0**
- **Staffel 1:** im Stand an beiden Geräten, frisch am Kopf. Soll: Befehle ≤ 208, Dreiecke ≤ 680k, VRAM ≤ 118 MB, GPU ≤ 12 ms.
- **Messung:** `werkbank band --ort` je Ort × Sicht, Radeon `--echt`, eine Sitzung und Erst-Boot, die Orte nacheinander.
- **Zahl (Befehle / Dreiecke / VRAM / GPU ms):**

  | Ort × Sicht | Befehle | Dreiecke | VRAM MB | GPU ms | Band |
  |---|---|---|---|---|---|
  | Wiese Ego | 90 | 312k | 108,6 | 9,7 | IM BAND |
  | Wiese Third | 105 | 386k | 109,2 | 8,5 | IM BAND |
  | Genesis Ego | 109 | 336k | **123** | 12,6 | ROT |
  | Genesis Third | 139 | 393k | **123** | **27,2** | ROT |
  | Dorf Ego | 99 | 341k | **122** | **26,9** | ROT |
  | Dorf Third | 103 | 414k | **122,4** | **30,1** | ROT |

  - Ratsche: jede Zelle trägt Zeilen über der Ratsche, 1–9 je Zelle. Wiese: nahWiese +20k Dreiecke, baum haupt 32 > 24 Befehle. Genesis: baum haupt 22 > 12. Dorf: bau haupt 53,6k > 31,1k.
- **Offen:** Die GTX-Hälfte fehlt. Die GPU-ms liefen unter Fremdlast (Werkbänke :7951/:7953 aktiv). VRAM ist lastfrei ROT; die Orte kumulieren in einer Sitzung.
- **Roh:** `m13-band-*.log`.

---
**Punkte:** vier Kriterien steigen 0 → 1 (Gelände K2, Klang K2, Klang K4, Ökologie K5), also **+4**. Vier halten ihre 1 (Klang K5, Speicher K2, K4, K5), dazu M13/M14/M16-K1/M18 ROT bei 0.

**Geschnitten:** nichts (nur Messung).
**Gemessen:** Klang K2 r 0,80 · Klang K4 359/1 721/2 404 Hz · Graben 9/10, 0 doppelt, 0 über, gefüllt ≤ 336 ms · Tier folgt 10 min, p95 3,6 m über 160 s Hang > 15° · Tab-Tod 5/20 > 10 s (max 30,8 s) · Schwung p95 126/151 ms · Spielgang p95 ×2,61, Heap +932 MB, VRAM +13,1 MB · Band Radeon 2/6 im Band.
**Pflicht-OFFEN Rest:** A · B · E (docs/PFLICHT-OFFEN.md).
**Status:** ZWISCHENSTAND
