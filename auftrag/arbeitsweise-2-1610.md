# Arbeitsweise 2.0 — Selbstkritik und der große Pfad (Koordinator, 16.10.)

Auf die Frage des Schöpfers: „Effizienz, Ergebnis je Token hat Luft — größere Schritte möglich? Welche Fehler passieren uns
regelmäßig? Wie machen es die Besten, und was können sie nicht?“ Belege: diese Woche (14.–16.10.), `bericht/1610-klarheits-audit.md`,
`auftrag/riesen-schultern-1610.md`.

## 1. Was diese Woche wirklich geschah (Zahlen)

- Gemergt nach main: ~25 Wellen (K59 … D10 V1 D3-2 F1 G1 W1 B2 L2 B3 FW T2 M2 V2). Woche 0 → 95 %.
- Je gemergter Karte ~1,0–1,8 M Tokens (R2 mit einem Prüfer), Spikes 0,3–0,45 M. „Ein Bruchteil“ ist das nicht.
- Die Ankunft GTX kalt 29 → ~20 s; das Ziel 5 s braucht ~15 s mehr.
- Der Prüf-Apparat: `scripts/` 103 512 → 222 816 Zeilen vom 01.10. bis 16.10. — er wuchs doppelt so schnell wie alles andere.

## 2. Die Fehler, die uns REGELMÄSSIG passieren (Klassen, nicht Einzelfälle)

1. **Wände anbauen statt Code ersetzen.** Gebot 10 ohne Gegengewicht: jede Fehler-Klasse bekam eine Linse, keine fiel. → Seit 16.10.
   die DECKE (D3): `scripts/` sinkt nur. Neue Regel: eine neue Linse ERSETZT eine alte (Text → `__consumes`), nie zusätzlich.
2. **Linsen urteilen in Wanduhr statt Ereignis** (Lehre 26 stand, wurde nicht gehalten): fenster-ES, Membran-Milch, Ego-Schatten,
   Voxel V9.43-b, Ziel-Zensus, Settlement O — ~8 CI-Wiederholungen in einer Nacht. → REGEL: eine Linse, die ohne Code-Änderung
   kippt, ist selbst ROT und wird vor der nächsten Karte in Ereignis-Zeit gebracht oder fällt.
3. **Parallele Karten auf geteilten Dateien.** F1 und L2 bauten je eine `tafelText`, D3-2 und V1 kollidierten in `playtest.cjs`,
   F1 und G1 bauten dieselbe Geräte-Grenze. → REGEL: der Koordinator vergibt je Welle DATEI-BESITZ; geteilte Dateien (Tafel, Werkbank,
   Playtest, 25c) nur seriell.
4. **Schätzen statt messen.** B3 schätzte −3,4 s und brachte −0,23 s; T2 traf Licht-R² nur bei der Buche. → REGEL: jede Karte beginnt
   an einem Profil des ECHTEN Pfads (B1-Werkzeug, `werkbank takt`), die Erwartung steht in ms aus dem Profil, nicht aus dem Spike-Proxy.
5. **Die CI sieht den echten Renderer nicht.** Der 17-Textur-Absage-Fehler (D3-2 + D10) und die zerstörte Horizont-Karte (B2) kamen
   bis main — swiftshader/kienspan fährt ohne Schatten. → K65 Echt-Gruppe (bestehende Gates auf dem GTX-Runner), Vorrang.
6. **Koordinator-Handwerk:** falsche Uhrzeiten in der Übergabe, Prettier über `scripts/`, Heredoc-Backslashes, Sitzungs-Neustart
   unbemerkt (OMEN-Nachrichten verloren). → Uhrzeit nur aus `date`, Adresse nach jedem Neustart an den OMEN, Regex-Skripte per Write.
7. **Kleine Karten statt großer Schnitte.** Viele R2-Karten zu je einem Symptom (Ankunft in fünf Scheiben, Laub in drei) — jede
   zahlt Bauer + Prüfer + Merge + OMEN. Gebot 2 sagt: der GROSSE Schnitt, die Klasse in EINER Welle.

## 3. Der große Pfad — Architektur-Schnitte, die viele offene Punkte auf einmal zahlen

Die Besten (Quellen in `riesen-schultern-1610.md`) sind GPU-getrieben, daten-orientiert und kochen vorab. Was sie NICHT können:
ihre Welt ist Daten (Disk, Mocap, Re-Cook, Patches); unsere ist eine FUNKTION — deterministisch, ohne Disk, je Version kochbar,
für jeden gewachsenen Körper bewegbar, über die ganze Welt prüfbar. Daraus fünf große Schnitte, je mit erstem messbaren Schritt:

| # | Schnitt | zahlt | erster Schritt |
|---|---|---|---|
| G1 | **Die GPU-Welt:** Streu als TSL-Compute aus der Boden-Sicht (heute JS-Zellschleife trotz `gpuScatter: true`), alle Senken in EINEN Storage-Puffer je Signatur, EIN Cull-Pass schreibt Indirect-Args, CPU = ein Draw je Signatur | E (CPU-Takt 6,5 > 5,8), B (Haupt-Faden), A (Dichte) | `werkbank takt` Anteil `_tickScatterStreaming` am p95; eine Art (Deck-Streu) auf Compute, GTX-ABAB |
| G2 | **Das Ankunfts-Paket + EIN Bau-Ort:** die CI kocht je Version den Spawn-Umkreis (Chunk-Meshes, Foundry-Assets, Streu) als EIN versioniertes Paket (derselbe Cache, vorgefüllt); der Haupt-Faden backt nichts mehr (Ofen bauTier/bauMensch in den Foundry-Worker) | B (≤ 5 s), Datenfluss | B1-Profil: Anteil Ofen + Integration; das Paket für Genesis |
| G3 | **Studio = Modus der Welt-Engine** (wie das Gelände-Studio): die r128-iframes fallen, das Labor ist die Welt mit ihrem Licht, EIN Export-Kanal `uebergabe` für alle 8 | Studios vereinheitlichen (45 %), Labor = Welt, Datenfluss-Bruch S2, D | ein Studio (Fachwerk) als Modus, Bild Labor = Welt |
| G4 | **Leben als Gesetz-Daten:** Geburt wirft GRUPPEN (Herde, Rudel aus `VERHALTEN.herde`), Art-Liste = Kern-Gattungen (Seelen-Tafel-Zwilling fällt), Kreaturen-Zustand als SoA im Takt-Budget, Boden-IK + Balancer nur nah | Rudel 25 % → sichtbar, Tiere 55 %, Animation 50 %, E | Gruppen-Geburt (klein, sofort sichtbar) |
| G5 | **Das Welt-Raster statt Linsen-Wachstum:** der OMEN fährt je Merge 16 feste Orte × Ego/Third (Takt, Frame, Tris, dc, VRAM, K5); ROT bei > 10 % in einer Zelle; dafür fallen Punkt-Linsen | D3 (Decke), E, A, weniger CI-Flackern | Baseline-Raster am Kopf |

Dazu klein und sofort: D1 Doku-Wahrheit (K1 läuft), D-K2 „ein Wert eine Stelle“ (Gesetz-Leser laut, Ersatz-Literale ROT,
Wetter-Zwilling), die Soll-Tafel am Kopf NEU MESSEN (mehrere Klassen sind nur veraltet ROT: boden-nah 1,756, himmel-licht 5,16,
laub-kante 0,21), T3 holt den T2-GPU-Preis zurück (Bau-Satz zuerst zeichnen −1,4 ms aus dem Zweigipfel-Fund trägt ihn vermutlich).

## 4. Reihenfolge ab 21.10.

1. Woche: D1+K2+Tafel-Neumessung (klein) · K65 Echt-Gruppe · **G1 Spike → Bau** (größter Hebel für E und B) · Bau-Satz-Reihe (T3).
2. Woche: **G2** Ankunfts-Paket + Ofen im Worker (B) · **G4** Gruppen-Geburt + SoA · D2 Stamm nach Domäne (stamm-umzug nach modul-karte).
3. Woche: **G3** Studio = Modus (Fachwerk zuerst) · **G5** Welt-Raster · D3 playtest.cjs nach Modulen, Text-Linsen → `__consumes`.

Je Welle: Datei-Besitz vergeben, Profil vor Schätzung, eine Linse ersetzt eine Linse, Flacker-Linse = ROT.
