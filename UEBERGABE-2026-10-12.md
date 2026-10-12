# ÜBERGABE 12.10.2026 — Notbremse beim Wochenlimit (Reset 17.10. 23:00)

Für die nächste Koordinator-Sitzung und den nächsten OMEN-Agenten. Zuerst lesen: CLAUDE.md (GOLDENE DEFINITION), dann diese Datei,
dann `artifacts/profiband/werkzeug/notbremse.md` (Fortsetzen), `auftrag/architektur-antwort.md` (der Plan), `auftrag/nordstern.md`.

## Stand
- **main = bb554abf = V18.543** (OMEN 1110-12 nicht langsamer). integ-probe = bb554abf.
  - Seit 11.10.: V18.541 → V18.542 → V18.543.
  - Frozen-Liste (docs/PFLICHT-OFFEN.md): **A** (Kopf-Zeile des Fell-Gesetzes, 5,79 px/Strähne), **C** (Ort auf dem Gelände), **E** (Profi-Band, Kriterium steht). B ist in V18.543 gefallen.
- Prozess:
  - `artifacts/profiband/workflows/karte.js`: Karten mit R0–R3 und Übergabe-Kette
  - `workflows/integ.js`: Integration mit args `{version, start, notiz, schloss, versionStufe, stufen:[{key,zweig,was}]}`
  - `werkzeug/ereignis-warte.sh`: ein Wecker je Ereignis, mit `NUR="merge-reif: ja|WORKFLOW"`
  - `werkzeug/ci-lesen.sh` und `ci-warte.sh`: CI per API, gh fehlt
  - `werkzeug/notbremse.sh`
- Integrations-Notizen: `artifacts/profiband/integ-notizen-v18543.md` (Wahrheit je Zweig). V18.544 legt die nächste Sitzung an.

## Zweige (Tabelle wird beim Stopp mit den Köpfen gefüllt — siehe unten „Köpfe beim Stopp“)
| Karte | Branch | Zustand | nächster Schritt |
|---|---|---|---|
| K16 Landform | grund-landform | in Arbeit (R3; ~20 Bauer; Linse grün, Höhlen-Mündungen im Gesetz, CI-Rest) | CI lesen, letzte rote Gruppen heilen, Bilder (Mündung, Auge in der Höhle), dann 2 R3-Prüfer |
| K16b Gelände-Studio | grund-studio | in Arbeit (auf grund-landform heben, nur eigene Punkte) | siehe Karte K16b + integ-notizen-v18542 „K16b PAUSIERT“ |
| K17 Fels-Stoff | grund-fels | in Arbeit (Endspurt-Welle) | Karte K17 |
| K10 Ort auf dem Gelände | ort-gelaende | in Arbeit (R3, der Weg, auf dem C fällt) | Karte K10 |
| K20 Wald-Maß | wald-mass | in Arbeit (Täter: _foundryGestaltFor merkt _ortSame vor der Blocker-Verdrängung) | Merker an den Blocker-Stand, Radeon-Bilder |
| K22 kein stiller Fang | stoff-laut | in Arbeit | Karte K22 |
| K23 Speicher-Wahrheit | speicher-wahrheit | in Arbeit | Karte K23 |
| K24 EINE Baum-Ableitung | baum-ableitung | in Arbeit | Karte K24 |
| OMEN torwurf | welle-m-e-torwurf | in Arbeit (Variante A: Zeile 3 = Rezept-Maß 12 000, „die billigere Stufe wirft“) | `bericht/1110-9-torwurf-uebergabe.md` |

## Nächste Karten (Plan: auftrag/architektur-antwort.md §3, 15 Kandidaten nach Wirkung je Token)
- Zuerst die laufenden zu Ende: K16 → K16b, K17, K10 (C fällt), K20, K22–K24.
- Danach aus dem Plan: Geräte-Regler verlassen die Welt (E), EINE Schwerkraft, Welt = Funktion + Abweichungen, Regler mit Einheit, die Größe als Achse.
- Linse gegen Koordinaten-Literale in Proben: die Lehre aus K16, rund 20 Bauer, weil Proben Orte der alten Welt trugen.
- OMEN: torwurf → Dorf-VRAM (bauSatz 9,3 MB, 125,8 MB > 118) → die 13 Stoff-Befehle je Tor.

## Köpfe beim Stopp
notbremse.sh: Nur wald-mass trug Ungesichertes (WIP fa70065e); grund-fels hatte einen ungepushten Commit (6f9ad505, gepusht). Alle anderen waren sauber.

**Fertig gebaut, wartet auf die Prüfung:** K22 stoff-laut, K23 speicher-wahrheit und K16b grund-studio haben ihren Bau mit [ci voll] gepusht. Fortsetzen mit karte.js, `start: "pruefen"`, `kopf` und `vorher` = oberster Commit-Rumpf. Die übrigen setzen den Bau fort, mit `wt` = bestehender Worktree.

Stand 12.10. ~14:00 (per ls-remote). Der WIP-Rumpf des obersten Commits trägt die Übergabe des Bauers (Kartenkopf 5: ≤ 15 Zeilen); erst lesen: `git log -1 --format=%B <branch>`.

| Branch | Kopf | oberster Commit |
|---|---|---|
| main | bb554abf | V18.543.0 auf integ-probe: die Versions-Stufe nach wald-lebt, feuer-farbe, gang-gesetz, kampf-t24, takt-pause  |
| integ-probe | bb554abf | V18.543.0 auf integ-probe: die Versions-Stufe nach wald-lebt, feuer-farbe, gang-gesetz, kampf-t24, takt-pause  |
| grund-landform | cbe002e4 | WIP K16: Radeon ABAB gemessen, koerper-stand K6 und fahr-leben F lesen ihren Ort aus der Welt [skip ci] |
| grund-studio | 871d8733 | K16b: das Gelaende-Studio auf K16 gehoben - Presets unter der Wand, Start auf der gebauten Welt, die Karte mal |
| grund-fels | 6f9ad505 | WIP K17: der K16-Kopf cbe002e4 ist eingemischt (ohne Konflikt) [skip ci] |
| ort-gelaende | 5042199c | WIP K10: grund-landform f649db71 eingespielt (die Konflikte der zweiten integ-probe-Aufloesung nach K16) [skip |
| wald-mass | fa70065e | WIP Notbremse 2026-10-12_1355: wald-mass - ungeprüfter Zwischenstand beim Wochenlimit [skip ci] |
| stoff-laut | f1528195 | K22 Kein stiller Fang im Stoff-Bau: die Stoff-Wand nennt jeden Fang, 95 brechen laut [ci voll] |
| speicher-wahrheit | 3f671a89 | K23 Edit- und Speicher-Wahrheit: die Edit-Karte je Chunk ohne Deckel, der save-server schreibt ganz, das Chat- |
| baum-ableitung | 2cca63df | WIP K24: die 99 Phaenotyp-Abschriften der Baum-Presets fallen, Wirt und Linsen lesen artPhaenotyp [skip ci] |
| welle-m-e-torwurf | 52ac16d8 | 1110-9 Tor-Wurf: die Tore werfen aus ihrer NUR-WURF-Stufe, geworfen wird von der billigeren Stufe [ci voll] |

OMEN: `bericht/1110-9-torwurf-uebergabe.md` (koord 5465f7c9). Das Band-Delta +1,24 ms ist ungeklärt; der Toggle trennt nicht, weil vermutlich die Erst-Zeichnung mitgemessen wird. Nächster Schritt: ABAB mit Build-Varianten.
