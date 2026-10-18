# Bericht 1810 B5 (Phase 1: der Befund) — die Studio-Lieferungen vor dem ersten Weltbild

**Status: ZWISCHENSTAND.** Gefunden, gemessen, offen — der Schnitt läuft (Phase 2, frischer Schneider auf `b5-lieferung` ab integ
f45ee994, wie korrigiert ohne B4).

- **Gefunden:** Der kritische Pfad zu Weltbild und Leib ist die EINE Worker-Schlange (`_foundryAuftrag`/`_foundryPumpe`/
  `_foundryAuftragD2`, studio-bruecke.js:952–1040). Sie rangiert nach Abstand und Kegel, nie nach dem Bedarf des ersten Bilds.
  - Der Leib wartet auf `mensch` L0 (4,4 s Studio-Bau hinter dem Blatt-Atlas in w0), obwohl L1 bei 4,23 s liegt.
  - Der Start-Dorf-Export startet erst bei 4,44 s im FIFO.
  - 7 ortlose Aufträge (Nah-Wiese, Gesetz-Fit) stehen auf Rang ∞ und warten 8,5 s.
  - Detail, das das Bild nicht zeigt, belegt vorher 10,8 von 22,6 s Faden-Arbeit.
- **Gemessen** (GTX, 11 Kalt-Läufe, 26 echte Läufe insgesamt):
  - integ-probe: Weltbild kalt 16,58 s (16,08–17,04), Leib 10,46 s (9,77–11,56).
  - Ohne Start-Dorf: 13,99 s.
  - Zweit-Boot: 11,98 s und Leib 6,49 s; 107–109 von 108–110 Lieferungen kommen von der Platte.
  - Nach einer Versions-Stufe (`bump-version`): 12,81 s, die Platte trifft weiter. Der `?v=` macht nicht kalt, nur Kern, Brücke oder
    Manifest. **Die Prämisse von PFLICHT-OFFEN B** („IDB geleert, wie nach jedem Versions-Update") **trifft nicht zu.**
  - Der Haupt-Faden ist bis zum Bild 97 % belegt; t(Weltbild) folgt seiner Summe 1:1.
- **Ehrlich offen:** B ≤ 5 s fällt mit B5 allein nicht. Selbst mit jeder Lieferung von der Platte steht das Bild bei 12,0 s, denn der
  Haupt-Faden trägt Boden-Ring, Horizont, den Erst-Bau der Stoffe (2,4–3,3 s, darin `_diaetGang` 1,0–1,5 s, das bringt B4) und die
  Karten (1 je Lade-Bild). Ausgelieferte Packs sind nicht gebaut.

Der ganze Befund mit Ankern: `bericht/1810-b5/befund/befund.md` (≤ 60 Zeilen). Dazu `zahlen.md`, `roh/*.txt|md` (Tafeln, Profile,
Ketten), die Instrument-Patches und Auswerter. Die Lauf-JSON, Profile und Bilder (202 MB) liegen auf der OMEN in `p3/n1810/b5/roh/`.
