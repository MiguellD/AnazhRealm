# Vorprüfung nerv-schwung — `mensch.sport.koerper#1`

ZWISCHENSTAND (24.11., Zweig `nerv-schwung` über `nerv-bewegung` 5ce568cb): Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 82 von 1 718
(`vision/karte-2-stand.json` am Kopf von `origin/punkte-maschine`). Die Sprosse bucht der GPU-Lauf der Station `k2-mensch-sport`; bis
dahin steht sie. Von den 24 Profi-Bändern des Auftrags halten 20 (83 %); die vier offenen stehen unten mit Datei und Zeile.

**Geschnitten:**

- Die Gang-Pose des Menschen ist EINE Kurve auf der Froude-Achse: `leibSchwung` (koerper-core.js:6269). Sie bestimmt Knie im Schwung,
  Knie beim Aufsatz, Art des Aufsatzes, Rumpf, Arm und Ellbogen. Gelesen wird sie in `leibRigPose` (koerper-core.js:8019) für Spieler,
  Bewohner und Körper-Studio.
- Die Wurzel des Spagats ist gekappt (tetrapoda-core.js:1551). Die Hermite-Tangente des Schwungs wuchs wie (1 − Tastgrad) / Tastgrad,
  im Sprint auf 3,85 S, und der Fuß flog außer Reichweite. Die Tiere tragen das Feld nicht und bleiben byte-gleich.
- `VERB_TAFEL.ziele`/`kontakt` fallen (0 von 11 steuerten). `GANG_ARME` fällt.
- Der Bewohner-Zwilling fällt: `tempoEinheit × TAGES_GESETZ.gang` (Fr 0,195) wird zu `leibGehen` (Fr 0,25 wie der Spieler,
  stamm/siedlung-bewohner.js:1538).
- Der Wirt rollt Ferse und Vorfuß beim Lock (stamm/koerper-leib.js:864).

**Gemessen:** Welt mit Null-Renderer, der echte Spielpfad (Taste vor, Sprint, Wirt mit Fuß-IK), flachste freie Bahn von 30 m,
vorher 5ce568cb ↔ nachher:

| Größe | Gehen 1,58 m/s | Laufen 3,50 m/s | Sprint 6,28 m/s | Band |
| --- | --- | --- | --- | --- |
| Knie-Spitze im Schwung ° | 59,9 → 57,5 | 110,7 → 110,6 | 107,2 → 123,1 | 60 · 90–110 · ≥ 120 |
| Knie beim Aufsatz ° | 10,9 → 10,9 | 15,9 → 15,0 | 27,4 → 31,6 | ≈ 5 · — · 30–40 |
| Aufsatz vor der Hüfte m | 0,314 → 0,314 | 0,313 → 0,315 | 0,288 → 0,296 | Sprint 0,2–0,3 |
| Fuß beim Aufsatz ° (+ Ferse) | +17,0 → +17,0 | +8,8 → −1,0 | 0,0 → −4,3 | Ferse · Mittelfuß · Vorfuß |
| Hüfte vor, max ° | 41,7 → 42,2 | 75,0 → 70,1 | 72,5 → 79,2 | Sprint 70–90 |
| Rumpf ° | 0,5 → 3,1 | 0,5 → 7,1 | 0,5 → 9,0 | 2–5 · 5–10 · 5–10 |
| Arm-Schwung gesamt ° | 32,8 → 24,6 | 42,9 → 58,7 | 56,1 → 71,2 | 20–30 · — · 60–90 |
| Ellbogen ° (Median) | 16,6 → 16,5 | 82,7 → 60,9 | 86,1 → 85,8 | fast gestreckt · — · ≈ 90 |
| Duty | 0,600 → 0,600 | 0,339 → 0,339 | 0,200 → 0,200 | 0,6 · < 0,5 · 0,25–0,3 |
| Gleiten des Knöchels mm | 21,9 → 7,7 | 20,2 → 2,8 | 22,1 → 3,8 | darf nicht steigen |

Im Sprint reicht die Hand im Rückschwung bis 0,08 m hinter die Hüfte (vorher blieb sie 0,12 m davor).

Das Bildpaar liegt unter `…/scratchpad/nerv/blick2/` (`vorher-*`/`nachher-*`). Messort genesis, 12 Uhr, Seitenansicht, Radeon `--echt`.

- **Vorher, Sprint beim Aufsatz:** Das hintere Bein hängt fast gestreckt nach hinten (der Spagat). Beide Hände stehen vor dem Bauch.
- **Nachher, Sprint beim Aufsatz:** Das hintere Bein faltet sich und die Ferse schlägt hoch zum Gesäß. Das Vorderbein setzt leicht
  gebeugt auf, der Rumpf neigt sich nach vorn. Die nahe Hand liegt an der Hüfte im Rückschwung, die ferne Hand ist vorn.
- **Gehen:** Vorher und nachher fast gleich. Die Ferse setzt zuerst auf, die Arme schwingen leicht.

Linsen, lokal:

- gate:koerper-kern ist grün; der Selbsttest erkennt 34 von 34. V7 ist neu (keine Prosa, Schwung an Gehen und Sprint), V8 ist neu
  (die Kurve ist stetig und ihre Enden liegen im Band). Die Täter „Prosa“ und „Stufe“ fallen.
- gate:tier-gang ist grün, der Selbsttest ebenfalls.
- Daten-Vertrag v7 ist grün. Golden koerper-core wurde neu geprägt (fa15e4116c7d → 1827ac1f7d23). Grund sind genau drei neue Felder
  `fx.bewegung.gang.schwung*`; der Tiefen-Diff der PRESETS zeigt keine weitere Änderung.

Abdruck `werkbank abdruck --gegen 5ce568cb` (ANDERS 7):

- D5 Mensch: Lagen der Bewohner-Gestalten und `bewohner-satz`. Beides gewollt (Pose und Tempo).
- Nur im dorf: D1 `voxelChunks[-18,-23].zellenFest`, D3 `wegeKarte.kronen.summe`, D7 Impostor-Atlas und D9 `_blockerNetzStand._hausHuelle`.
  Sie folgen mutmaßlich dem neuen Tempo der Bewohner (Fr 0,195 → 0,25: andere Wege, andere Tritte). Einzeln bewiesen ist das nicht.

**Offen:**

1. Sprint-Duty 0,200 statt 0,25–0,3 und Kadenz 3,05 statt 3,6–4,5 Schritte/s. Beide hängen am Impuls-Gleichgewicht
   2·Tastgrad·Φ = 1 mit Φ = LEIB.kraft 2,0 × Können 1,213 = 2,43 (koerper-core.js:5306, gate:koerper-kern V5). Sie zu heben hieße, das
   Sprint-Tempo und den Sprung neu zu eichen. Das ist ein eigener Schnitt am Kraft-Gesetz, nicht an der Pose.
2. Knie beim Aufsatz im Gehen 10,9° statt ≈ 5°. Die Kette reicht nur 0,995 (tetrapoda-core.js:1564 `gangReich`), dazu kommt die
   Fersen-Wippe. Die Pose kann es nicht strecken, ohne dass der Fuß gleitet.
3. Knie-Spitze beim Laufen mit 3,5 m/s liegt bei 110,6°, also 0,6° über dem Band 90–110. Das ist die Lage der Kurve zwischen den Enden
   (`schwungWechsel` 0,5, koerper-core.js `fx.bewegung.gang`).
4. Im Sprint springt der Oberschenkel beim Abheben um ≈ 14° in einem Takt. Der Lock löst bei 6,3 m/s mit 10 cm je Takt
   (stamm/koerper-leib.js `_gaitLegIK`); das war schon vorher so. Im Bild der Mitte des Schwungs sitzt das Becken tief
   (Becken-Tiefe 0,135 L, gate:tier-gang).
5. gate:kreatur-takt `bewohner` (Budget 660 s) lief lokal nicht unter dem Deckel von 3 min: Die Seite stürzte bei 179 s am Timeout
   ab. Der Bewohner geht jetzt Fr 0,25 statt 0,195; das Urteil fällt in der CI-Batterie.
