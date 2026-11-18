# PLANET — KURZ (Zwischenstand 18.11., Zweig `zensus-planet`, main b7ed8419, `planet-core.js` planet-h2-4)

**Zensus** (`zensus.md`, `zensus.json`, `zaehle.cjs`): 584 Größen, davon 88 Technik und 496 Welt-Maße. Von den Welt-Maßen folgen 100, 51 sind gesetzt mit Anker, **345 gesetzt ohne Anker (70 %)**, **38 haben keinen Leser** und **104 einen benannten Zwilling** (Kern ↔ Heimat: 30 Klassen, z. B. lapse 6,5 K/km ↔ 0,1108 K/m). Alle 658 Orte sind gegen den Baum geprüft, mit 0 Fehlern (`zensus/pruef-orte.cjs`).
**Die Welt heute:**
- Heimat: eine unbegrenzte Ebene, in der Entfernung eine Funktion (die Höhe bei 1 000 km kostet 1,46 µs), in der Fläche ein Sack (~430 KB je neue Adresse, OOM bei 2 044 MB). Sie kehrt alle 1 330 km wieder; Klima, Tag und Jahr haben keinen Ort.
- Kern: eine Funktion (Höhe 6–8 µs), gelesen nur über „reise“. Ohne Reise ist die Konsum-Tiefe 0.

**Gesetz** (`gesetz.md`):
1. P(Same, u, t) gibt jede Größe, u auf der Kugel; die Zeit t in [−4 000, +1 000] Ma ist ein Argument, kein Zustand.
2. Die Stufen lesen nur nach unten, zur selben Zeit: S0 Körper → S1 Platten → S2 Relief → S3 Meer → S4 Klima → S5 Wasser → S6 Gestein/Boden → S7 Biom, dazu Tag und Jahr aus S0 und u.
3. Jede Stufe ist an EINER Adresse auswertbar. Was nicht lokal ist (Spiegel, Lauf des Wassers), wird je (Same, t) auf festen Proben gelöst (4 096 bzw. N_W 40 000), unabhängig vom Radius.
4. Der Same zieht zehn Physik-Daten (Radius, Schwere, Wasser, Kruste, Neigung, Stern, Tag, Jahr, Drehsinn, Alter). Alles andere folgt, ist Gesetz mit Quelle oder bleibt benannt.
5. Die Heimat ist EINE Adresse: anker = `planetAnker(plan, 0, ortGesetz())` und Q = Q_Heimat + Δ. Am Anker ist Δ ≡ 0, Tag eins bleibt byte-gleich.

**Urteil je heute gesetzter Größe** (`urteil.cjs`, 396 Größen): FOLGT 59 · FÄLLT 16 · SAME 38 · GESETZ 39 · BAND 119 · TECHNIK 15 · **BLEIBT 110**. Im Kern sind 105 von 162 von Hand gestimmt (65 %).

**Spike** (`spike.md`, `spike/*.cjs`, das Soll stand vor dem Lauf fest):

| Probe | Soll | gemessen | Urteil |
|---|---|---|---|
| a Kosten | 4R÷R ≤ 1,35; Höhe ≤ 8, Klima ≤ 25, Wasser ≤ 8 µs | 1,11; 8,02 · 55,3 · 10,5 µs | TRÄGT BEDINGT |
| b Stetigkeit | 0 Sprünge > 0,01 m bzw. 0,001 K | Platte 102 · Scholle 223 · Kruste 74 · Küste 390 von 400 | TRÄGT BEDINGT |
| c Erde | c1–c6 in jeder Saat | c3 reißt in 2/10 (×0,76, ×0,83), sonst im Soll | TRÄGT BEDINGT |
| d 100 Planeten | nächster Nachbar ≥ 3 × Rausch | 0/100 darunter, erst bei 40 000 Adressen | TRÄGT BEDINGT |
| e drei Zeiten | Drift 1–10 cm/a; mitgeführt ≥ 70 % | 3,29 cm/a; 84,3–98,0 % | TRÄGT |
| f Naht | Δ = 0 am Anker in 5/5 | 5/5; \|ΔT\| 0,00047 K bei 10 m | TRÄGT |

**Bahnen** (`bahnen.md`; sie laufen nacheinander, Halt heute → Soll):
- **B1** Naht dem Paar (`planet-core.js:1342–1408`): Sprünge 102 · 223 · 74 → 0.
- **B4** Anden-Bogen (`:1280–1286`): c3 8/10 → 10/10.
- **B2** Küste ohne Schalter, EINE PET (`:1944–2094`): 390 → 0, 55,3 → ≤ 25 µs, PET-Stellen 2 → 1.
- **B3** S5 in den Kern: c6 im Soll, Wasser 10,5 → ≤ 8 µs.
- **B5** Anker bei fuss 16 (`:2205–2243`): Meer 1/30 → 0, Wald 0 8/30 → 0, Tundra 3/30 → 0; erde-29 abgelehnt 135/200 → 0.

**FÄLLT — 16 Setzer:** Meer-Vorgaben b4, b5, b11, b12 · Höhen-Deckel a36 · `terrainSteepness` a88 · Samen-Vorgabe d4 · fünf Sonnen-Schwellen d72–d76 · `BEZUG_MA` e135 (fällt mit B1) · drei Δ ≡ 0 e217, e222, e223.
**Fällt aus den Bahnen, mit Grund:**
- kein Spike: S6, Tag und Jahr;
- kein Richter: die Heimat als Adresse im Spiel (`ort.leser` zählt Existenz, nicht Konsum), das Grundwasser, die 105 BLEIBT;
- Wurzel nicht zerlegt: die Kosten — `diag-planet.cjs --kosten` steht auf main ROT (platten +82 %, radius 1,382).
- Keine Sprosse fällt durch eine Bahn allein: Jede verlangt ihren Richter im Spiel und P.
