# DER KRITISCHE PFAD — Konto 14, die ersten 24 Stunden (Befund 4)

1. **Zuerst landet der Preis des Orts:** `w28-preis-ort` fcd4661e heilen (Code-Check ROT in drei Schritten, alle mit „KERN-PFLICHT verletzt … unlesbar") und mit höchstens drei Proben neu abgeben; `w28-wange` 073b6d17 fährt daneben; jede andere Welle mischt erst NACH dieser Landung.
2. **Warum:** der Preis ist der EINE Chokepoint — er hält Pflicht E, er hält jede der 1 718 Sprossen der Meisterkarte 2 auf 0 (20 Richter-Akten mit 22 Fahrten: Richter GRÜN in 22, Preis ROT in 21, eine ohne Preis-Urteil; Radeon an main p95 58,59 ms gegen 33, VRAM 132,3 gegen 118 MB), und `w28-preis-ort` teilt Dateien mit drei der vier anderen offenen Zweige — solange er nicht landet, mischt jeder von ihnen zweimal.
3. **Erfolg nach 24 h, gemessen:** (a) ≥ 4 der Abgaben preis-ort · wange · himmel-korn · baum-schirm in main (git log --first-parent); (b) die Preis-Akte `leben.pflanzen.kraft.1` an der neuen main an BEIDEN Geräten mit Heap ≤ 400 MB, VRAM ≤ 118 MB, Wachstum ≤ 5 MB/min — dann reißt nur noch die Bild-Zeit; (c) das erste Radeon-ABAB von E am Kopf gefahren (die Zahl steht, gleich welche Farbe).

Stand der Messung: 15.11. 11:22–11:40 (Get-Date), main = integ-probe 4ee205bd [m: git ls-remote], koordination d1e5e7cd [m].
Marken: [m] von mir gemessen oder gerechnet · [q] gelesen · [s] geschätzt.

## 0 Die Lage in sechs Zahlen

| Zahl | Wert | Quelle |
|---|---|---|
| Landungen je Tag (Merges „… in integ-probe", first-parent) | 05.11 16 · 06.11 32 · 07.11 38 · 08.11 30 · 09.11 17 · 10.11 29 · 11.11 28 · 12.11 22 · 13.11 10 · 14.11 27 · 15.11 5 | [m] `git log origin/main --first-parent --since=2026-11-05` |
| letzte Landung | z446 GELANDET 06:25:05; seitdem kein Zug, weil kein grüner Zweig wartet | [q] `w4/zug-nie-leer.log` letzte Zeilen |
| Pflicht-OFFEN gefallen seit 13.11. | 0 von 5 | [q] `docs/PFLICHT-OFFEN.md` an 4ee205bd |
| Meisterkarte 2 | 0 / 1 718 gebucht, 19 im Kern; Zeile 3 sagt „kein Richter je gefahren" — das ist überholt: `vision/richter/` trägt 20 Akten (4 Leitern, 22 Fahrten): Richter GRÜN in 22, Preis ROT in 21, eine ohne Preis-Urteil (`leben.pflanzen.kraft.1.337846dc-gtx`, alte Form) | [q] `vision/MEISTERKARTE-2.md:1–3`, [m] `git show` + ConvertFrom-Json über alle 20 Akten |
| Tokens der fünf abgeschlossenen Workflows seit 14.11. | 21,34 M (Meisterkarte 12,44 · Preis 3,55 · Planet 1,86 + 2,98 · Fernfeld 0,52) — in main gelandet daraus: 0 Commits | [m] node über `tasks/w*.output` (`totalTokens`); fünf weitere Ausgaben ohne gültiges JSON (gestoppt) |
| größter offener Zweig | `w28-preis-ort`: 27 Commits, 35 Dateien, +1 843 / −326 | [m] `git diff --stat origin/main...origin/w28-preis-ort` |

**Antwort auf „ist die Integration schneller?":** der Zug ist nicht die Bremse (Abgabe → Landung 0,4–1,8 h am 14./15.11. [q Rahmen]; seit 06:25 steht er leer). Die Bremse ist der Weg von der Welle zur Abgabe: fünf Wellen mit 21,34 M Tokens endeten in 0 Landungen, die eine reife Abgabe (Preis) ist am Code-Check ROT [q `cloud-post/w28-preis-ort.md` 11:18].

## 1 Pflicht-OFFEN je Eintrag

| | jüngste Zahl (Datum, Quelle) | seit 13.11. bewegt | nächster Schnitt · Annahme · Richter |
|---|---|---|---|
| **A** AAAA je Klasse | 14.11., Soll-Tafel an main 5096d179 am exakten Richter: ROT laub-kante · mensch-kopf 0,833 · fell Third · haar ×2 · Tor-Pose; GRÜN boden-nah 2,23 · boden-nah-farbe 10,9 · laub-Zweiton 0 · fell Arm 0,56 · wasser 0,79 [q FUND-REGISTER, Commit 3958461a]. Doku-Zahl noch 17.10.: laub-kante 0,2635 > 0,22 [q PFLICHT-OFFEN] | gelandet w28-gesicht (z440), w28-gesicht-grob (z445) [q zug-Log]; abgegeben w28-wange (mensch-kopf, Wange) | **Schnitt:** baum-schirm Schnitt 3 (die Karten `fimp:atlas:L2`). **Annahme:** dieselbe Karte trägt laub-kante (PFLICHT-OFFEN: „von unten") UND 5,4 / 6,7 ms GPU an Wiese / Spawn [q `vision/preis/befund-gpu.md`] — EIN Schnitt bewegt A und E. **Richter:** K5 (`scripts/lib/abnahme-urteil.cjs`) an der Mittag-Pose + gate:schirm-stufen |
| **B** Ankunft ≤ 5 s kalt | GTX 1060 18.10.: Weltbild kalt 16,6 s; Radeon 17.10.: ~11 s [q PFLICHT-OFFEN]. Seit 18.10. KEINE neue Kalt-Zeile an einem der zwei Messplätze [m `git log origin/koordination --since=2026-11-01 -i --grep=kalt`] | nur Befunde an der GTX 1050: Bild ab Navigation 22,1 s, 43 Pipelines, 16 davon unter 0,1 % der Pixel mit Übersetzung Σ 17,2 s [q `bericht/1113-bild-wartet.md`]; „Welt steht" kalt 33,6 / 35,6 s [q FUND-REGISTER 14.11.] | **Schnitt:** das erste Bild wartet nicht auf die 16 Pipelines unter 0,1 %. **Annahme:** ihre Übersetzung liegt in der EINEN GPU-Schlange vor den 8 sichtbaren; die Wand-Ersparnis ist unbekannt (Σ ≠ Wand) — erst Spike mit drei Fällen. **Richter:** `diag-boot-stage --kalt --echt` an Radeon + GTX 1060 (gate:ankunft L2a) |
| **C** Verkehr | 0 Stationen messen einen Wagen mit Bewohner am Steuer [q PFLICHT-OFFEN] | gelandet w28-stadt-grammatik (z441), w28-stadt-funktion (z445) [q zug-Log]; w28-stadt-netz landet nicht (Gehen 40,7 % der Bilder > 33 ms, Bedingung ≤ 6,3 %) [q `erwachen/omen-2026-11-15.md`] | ruht 24 h (Voraussetzung Stadt-Gipfel unter E steht nicht). Richter wäre das C-KRITERIUM (20 Wagen, 10 min, nH 300) — keine Station existiert |
| **E** Profi-Band | GTX 1060 18.10. ABAB: p95 16,8 ms, CPU-Takt 6,3 > 5,8 (Genesis Third) [q PFLICHT-OFFEN]. Preis-Akten Karte 2: Radeon main a6555b12 p95 58,59 · größtes Bild 183,91 · Heap n. GC 398,4 · VRAM n. GC 132,3 [q `vision/richter/leben.pflanzen.kraft.1.a6555b12-radeon.json`, af097591]; Radeon Kopf preis 8ddf3de9 p95 58,68 · 108,4 · 256,5 · 125,0 [q a648be7d]; GTX 1060 main 68d24688 p95 33,34 · 191,65 · Heap 432,3 · VRAM 137,1 [q 99378530] | Befund GPU Radeon: Laub 7,8 ± 1,0 ms, Karten 5,4 / 6,7 ms, Gras-Ferne 2,7 ms von 26,3; gedrosselte iGPU × 1,7–1,9 → p95 41,7–50,0 ms „was immer die Welt schneidet" [q `befund-gpu.md:67–71`]; halbe Auflösung −14,2 ms [q FUND-REGISTER 14.11.]. Das Radeon-ABAB am Kopf steht weiter aus | **Schnitt 1:** preis-ort landen (Speicher). **Schnitt 2:** baum-schirm Schnitt 3 (Bild-Zeit). **Spike 3:** Auflösung mit Hochrechnung über die TRAA. **Annahme:** der Preis-Lauf 58,6 ms ist der gedrosselte Zustand (f 1,3) plus CPU — erst EINE Zerlegung des Preis-Laufs (Messname `preis-lauf-zerlegt`), sonst schneidet man am falschen Posten. **Richter:** Preis-Akte an beiden Geräten + `diag-profiband` ABAB |
| **F** Prüfplatz | Plan `bericht/pruefplatz/plan.md`; seit 13.11. keine Zone-Messung gefunden [m `git log --since=2026-11-10 -i --grep` Spielplatz/Arena/Wagen] | — | ruht 24 h: jede Zone muss E halten, E hält nicht |

## 2 Offene Fäden — Kopf, Stand, was fehlt

Köpfe [m `git ls-remote origin`, 11:24]; alle Basen = main 4ee205bd [m `git merge-base`].

| Faden | Kopf | gebaut | gemessen | fehlt bis Landung | h [s] | Gerät | Modell |
|---|---|---|---|---|---|---|---|
| **w28-preis-ort** | fcd4661e (ABGABE 10:56) | Speicher folgt dem Blick; Heilung 2 (Weg a, `stamm/siedlung-satz.js:1525`) | Heap 331 → 221 MB, VRAM 120 → 116 MB, Wachstum 8,4 → 2,7 MB/min, T18 21/21 = 0 [q UEBERGABE-15 SICHERN 2] | Code-Check ROT 10/18 Kreatur-Linse Teil 3 (`leib:Gestalt … unlesbar`), 12/18 Takt-Wand T18 („Saat steht nicht", `phyto:lod.budget … unlesbar` ×9), 14/18 Fernwald + Stall-Akte [q cloud-post 11:18, Lauf 43701660493]; GPU-Probe ABGEWIESEN „4 Proben, höchstens 3 je Push" [q probe-post fcd4661e]. Annahme [s]: EIN Täter — der freigegebene Speicher nimmt eine Kern-Tafel mit, die `_kernPflichtWand` liest; erst lesen, dann schneiden | 2–4 | Radeon (CPU-Check, GPU nur Probe) | Opus |
| **w28-wange** | 073b6d17 (ABGABE 10:46) | Form der Wange (Matros/Momoh/Yaremchuk 2009), `MENSCH_GESTALT.gesicht` | gate:mensch-anatomie GRÜN; wangeVor −0,96 → +0,24, Sonne 40 → 68 % [q `erwachen/gtx1050-2026-11-15.md`] | GPU-Probe ROT nur an gate:kamera-leib:echt „DIE WELT STEHT NICHT … Tore offen 10" [q probe-post 073b6d17]; dieselbe Klasse stand ROT an w28-gesicht 73113dc9 und w28-leib-genom 45805bda, w28-gesicht landete trotzdem (z440) [q Commits 43fedcf1, 6c522dc8] — kein Täter im Zweig belegt. Fehlt: Code-Check-Urteil im Zug-Log | 0,5 | GTX 1050 | Opus |
| w28-himmel-korn | 6323f43d | Spalte `korn`: erde 0,95 · stein 0,75 | UNGEMESSEN: sechs Paare, Linse (K), Nacht S0, Albedo-Tafel [q SICHERN 2] | messen, schießen, Abgabe oder offen fallen | 2 | Radeon | Opus |
| w28-baum-schirm | bef69ba3 | Schnitte 1, 2, 4, 5 offen gefallen; Labor zieht nach (`_occG`/`_occW`, `_laubZiel`) | Gegner Gesetz: die Spike-Zahl von Schnitt 3 ist nicht die entschiedene (Anteil der ganzen GPU-Zeit, SE 3,36 gegen 1 Punkt) [q SICHERN 2] | Entscheid Schnitt 3 am entschiedenen Maß, nach der Preis-Landung neu mischen (2 geteilte Dateien) | 3–5 | Radeon | Fable |
| w28-planet-kern | 71dfb7af (47 Commits) | Reise-Worte, EIN Jahr, ortErbgut | Konsum im Spiel 0 % [q Rahmen]; F1 hoch: `_planetAnker` holt den Samen der Welt (`stamm/gelaende-chunks.js:627`) [q SICHERN 2] | F1 + elf Funde, `reise <B> <L>` selbst spielen, vier Orte schießen, Schöpfer zeigen | 6–10 | Radeon | Fable (F1), Opus (Gegner lesen) |
| w28-stadt-netz | c5f725ab | Kern STADT_NETZ, Häuser-Zug als Bauer der EINEN Frist, Vorlauf als Bau-Zeit | Gehen 40,7 % > 33 ms · 442 ms; Bedingung ≤ 6,3 % · ≤ 258 ms, Fahren ≤ 16,0 % · ≤ 192 ms — nicht erreicht [q `erwachen/omen-2026-11-15.md`] | Ferne aus Stufe 1 (`kachelMassen`, `stamm/siedlung-masse.js`), je zwei Läufe gegen main | 6–8 | OMEN | Fable (Kern), Opus (messen) |
| w28-satz-gesicht | lokal = main | nichts | Prämisse „der Satz trägt kein Gesicht" NICHT belegt [q erwachen gtx1050] | ein Bild des Satzes — erst dann ein Zweig | 1 | GTX 1050 | Opus |

## 3 Abhängigkeiten

- **Datei-Besitz** [m `git diff --name-only origin/main...origin/<zweig>`, Dateien unter stamm/ · voxel-worker]: preis-ort × baum-schirm `dirigent-takt.js`, `siedlung-bauten.js` · preis-ort × planet-kern `dirigent-ankunft.js`, `gelaende-chunks.js`, `voxel-worker.js` · preis-ort × stadt-netz `dirigent-takt.js`, `vegetation-baum.js` · himmel-korn × baum-schirm `stoff-material.js` · himmel-korn × planet-kern `daten.js` · baum-schirm × stadt-netz `dirigent-takt.js` · planet-kern × stadt-netz `gelaende-boden.js`. **Folge:** preis-ort ist der Knoten; landet er zuerst, mischt jeder andere EINMAL. `dirigent-takt.js` tragen drei Zweige: baum-schirm landet vor stadt-netz.
- **GPU-Schloss Laptop:** Messdienst (`punkte-radeon-sitzung`, Port 27804), CI-Läufer radeon-890m und lokale Arbeiter teilen EIN Schloss → höchstens drei GPU-Arbeiter; der Preis-Heiler braucht für `npm run check` kein Schloss.
- **Preis vor Karte 2:** R3 („eine fehlende Preis-Zahl ist ROT", `vision/REGELN.md:9`) — keine Welle in Richtung Sprossen hebt die Zahl, solange die Bild-Zeit der Radeon reißt; Preis-Treppe Ort: p95 ≤ 33 ms, kein Bild > 100 ms, Heap ≤ 400 MB, VRAM ≤ 118 MB, Wachstum ≤ 5 MB/min [q `vision/REGELN.md:36`].
- **Fable** nur für: baum-schirm Schnitt 3, stadt-netz `kachelMassen`, planet F1. Alles andere Opus.

## 4 Fahrplan der ersten 24 Stunden (Stunde 0 = Konto-Start)

**Stunde 0–1, alle:** `zug/dienst/start.sh --blick`; Zug-Log und `probe-post/` lesen; `git ls-remote` je Faden. Keine neue Welle, kein Schwarm.

**Radeon (Laptop, ≤ 3 GPU-Arbeiter)**
- **R1 · h 0–4 · Opus:** preis-ort heilen. Annahme: EIN Täter hinter den drei roten Schritten (KERN-PFLICHT unlesbar). Richter: die drei Schritte lokal GRÜN (`npm run check`), Abgabe mit ≤ 3 Proben, Zug GELANDET.
- **R2 · h 0–2 · Opus, parallel:** himmel-korn messen (sechs Paare, K, S0, Albedo). Richter: Linse K + Bildpaar; Abgabe oder offen gefallen.
- **R3 · h 4–6 · Messdienst:** Preis-Akte `leben.pflanzen.kraft.1` an der neuen main. Richter: Heap ≤ 400, VRAM ≤ 118, Wachstum ≤ 5 — erwartet GRÜN; p95 und größtes Bild erwartet ROT (Kopf 58,68 / 108,4 ms). Dazu `preis-lauf-zerlegt`: CPU · GPU · Drossel-Faktor f.
- **R4 · h 6–14 · Fable:** baum-schirm Schnitt 3 nach Neu-Mischen. Annahme: die Karte trägt laub-kante und 20–31 % der GPU. Richter: K5 laub-kante ≤ 0,22, gate:schirm-stufen, Preis-Akte GPU-Anteil Karten.
- **R5 · h 14–20 · Opus:** das Radeon-ABAB von E am Kopf (Wiese + Genesis × Ego + Third), danach der Spike Auflösung + TRAA mit drei Fällen. Richter: `diag-profiband` ABAB, Spike nein = stopp.

**OMEN (GTX 1060, eine Kette)**
- **O1 · h 0–8 · Fable:** stadt-netz Ferne Stufe 1. Richter: Gehen ≤ 6,3 % · ≤ 258 ms und Fahren ≤ 16,0 % · ≤ 192 ms, je zwei Läufe gegen main.
- **O2 · nach R1-Landung:** Preis-Akte GTX 1060 an der neuen main (`punkte-gtx-sitzung`) — erst mit ihr zählt R3 an BEIDEN Geräten. Annahme: Heap 432 → ≤ 400 folgt dem Speicher-Schnitt.

**GTX 1050 (eine Kette)**
- **G1 · h 0–1 · Opus:** Wange durch den Zug begleiten; Richter: GELANDET.
- **G2 · h 1–2 · Opus:** EIN Bild des Satzes — Prämisse „kein Gesicht" ja/nein.
- **G3 · h 2–8 · Opus:** B-Spike: das erste Bild wartet nicht auf die 16 Pipelines < 0,1 %. Richter: Bild ab Navigation kalt, n = 3, Basis 22,1 s; Spike nein = stopp. Bei ja: Auftrag an R für die Kalt-Zeile der Radeon.

**Was NICHT gemacht wird (ruht, mit Ursache):**
- planet-kern — Konsum 0 %, F1 hoch, 47 Commits, drei Dateien geteilt mit preis-ort; erst nach R1-Landung und nur Opus-Lesen der Gegner, kein GPU-Platz in 24 h.
- jede Neufassung der Meisterkarte 2 — 12,44 M Tokens, 0 Sprossen; die Zahl bewegt sich erst mit dem Preis. Nur Zeile 3 berichtigen (20 Akten, 22 Fahrten, Preis ROT in 21).
- C Verkehr und F Breite — beide verlangen, dass E hält.
- Opus-Schwärme mit mehr als drei Agenten, neue Befund-Wellen, neue Pläne.

Offen beim Namen (nicht gemessen in diesem Blatt): Code-Check-Urteil `w28-wange` (`zug-nie-leer.log`) · Täter der KERN-PFLICHT-Brüche an fcd4661e (gelesen nur der rote Text, nicht der Code) · `preis-lauf-zerlegt`.

Geschnitten: kein Code — EINE Reihenfolge: preis-ort → wange → himmel-korn → baum-schirm Schnitt 3 → E-ABAB; planet, Karte 2, C, F ruhen.
Gemessen: Landungen 05.–15.11. je Tag; 21,34 M Tokens in fünf Workflows, 0 in main; 20 Richter-Akten / 22 Fahrten, Richter GRÜN 22, Preis ROT 21; Datei-Überschneidung der sechs Zweige; preis-ort 27 Commits / 35 Dateien.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
