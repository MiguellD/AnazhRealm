**Gegenprüfung S3 „kreatur“, Runde 1.** Geprüft wurde der Kopf 168965b9 gegen die Basis 76c9624d. Ich habe nur gelesen und headless gefahren. Worktree und Repo sind unverändert.

**Selbst gefahren**
- `gate:kreatur-kosten` (W) am Kopf ist grün: Wolf 5 756/1, Fuchs 6 082/1, Bär 6 172/1, Hirsch 5 194/1, Mensch 37 964/5, jeweils nah und mittel.
- Derselbe Block (W) am Linsen-Commit 8b0b1793 auf der Basis ist rot beim Namen: Wolf 28 710/7, mittel 0 trotz schatten 1; Mensch 162 412/8; 2 castShadow-Literale; Distanz-Leser 3 Methoden; 3 Konstanten. Exit 1.
- Ebenfalls grün mit Exit 0: `gate:tier-fern`, `gate:ofen-contract` mit Selbsttest (483 Klassen), `gate:asset-contract` (124/124), `gate:studio-vertrag` (46 erkannt), `gate:altlasten` (431 Namen), `gate:betriebsgesetz`, `gate:ci-deckung`.
- check.yml lädt mit js-yaml: genau 2 neue Schritte, Gruppe 2 und Gruppe 3.
- GitHub-CI 37794086490 läuft auf head_sha 168965b9 und ist grün. Beide neuen Schritte liefen dort erfolgreich.

**(a) Korrektheit, Wechsel-Fälle**
- **Rot: der ferne Mensch-Peer friert mitten im Schritt ein.** Stelle: `anazhRealm.js:7748-7755`. Sobald der Peer jenseits ab×(1+hyst) = 44 m die Grobstufe zeigt (`fernAktiv`), läuft `def.animate` nicht mehr. Die Grobstufe hängt jetzt an den L0-Knochen und zeigt deren letzte Pose. Vorher stand dort ein Standbild in Ruhe-Pose. Ein Peer, der weggeht, gleitet also mitten im Schritt erstarrt über den Boden. Eine Stand-Pose wie `_tierBaumNeutralStance` gibt es hier nicht, und keine Linse prüft das. Im Champion-Bericht ist es nicht benannt.
- **Gelb, Werkstatt-Regler mit ov:** Der Pfad `anazhRealm.js:85036/85038` baut mit `eigen` und ist immer kalt. Jede Regleränderung zahlt jetzt den langsameren L1-Guss synchron im Haupt-Thread, beim Hirsch 395 → 764 ms (Lehre 14). Der Prefetch deckt diesen Pfad nicht.
- **Gedeckt:**
  - 1st-Person: der Wrap verbirgt den Zwilling mit, wie vorher.
  - Stufenwechsel mit Hysterese: gate:tier-fern meldet 0 Flips.
  - Frustum-Austritt.
  - Jenseits von 64 m: `cr.visible = false` nimmt den Zwilling mit.
  - Raycaster: nah liegt die L1 auf Layer 2 und wird nicht getroffen.
  - Fell-Bildschirm-Gesetz: die gefaltete L1 trägt `__klasse` fell, nicht straehne.
  - Reload, Saison, Wetter, Tag/Nacht und Höhle: es gibt nur einen werfenden DirectionalLight.
  - Vorschau-Szenen: ohne Schatten.

**(b) Engstelle, Klasse ganz, Entscheide**
- Die Klasse ist an Ofen und Wirt geschnitten:
  - Standbild an der Wurzel weg.
  - castShadow-Literale 2 → 0.
  - Stufen-Schreiber 4 → 1.
  - fail-soft-Zweige 4 → 0.
  - Drei Konstanten fallen, `FORBIDDEN` +5.
- E1, E2, E5 und E6 halten.
- **E8 ist verletzt:** Der Golden-Akt `*-L1|*` wurde geprägt und gepusht, obwohl das Spike-Urteil fiel.
- Die skinJoints-Abweichung 31/33/25/26 statt 27/29/23/24 ist mit Zahl und Grund benannt.
- **Gelb, Doku-Reste:**
  - `foundry-core.js:5001-5002` behauptet „das Fern-Standbild ist starr“. Das ist jetzt falsch.
  - Weitere alte „Standbild“-Kommentare: `foundry-core.js:5878`, `anazhRealm.js:18197, 21767-21790, 22108, 22363`, Gate-Text `diag-kreatur-kosten.cjs:732/744`, `scripts/lib/kreatur-proben.cjs:1215`.

**(c) Linsen**
- Vorher rot, nachher grün, beides von mir nachgefahren.
- Der Selbsttest S5 (Zwilling gestubbt: 34 466/8) ist rot an genau dieser Zeile. tier-fern hat einen eigenen Selbsttest mit gestubbtem Schalter.
- Beide Linsen laufen in der CI.

**(d) Bytes**
- Ofen-Golden: genau 40 Schlüssel `*-L1|*` geändert, 0 neu, 0 weg. L0 ist 297/297 byte-gleich. Dreiecke, Vertices und Meshes je Klasse sind unverändert. Die L1-Gelenke sind 142/142 sha-gleich zu L0.
- render-config.json: nur die 8 deklarierten Felder bei tetrapoda/koerper.
- Die Kerne sind nicht durch prettier gelaufen. Die Linux-CI ist grün.

**(e) Zahlen und Bilder (selbst angesehen)**
- Erreicht: Werfer Tier ≤ 6 200/1 und Mensch ≤ 38 000/5. Schatten-Programme der Klasse tier nah 5 → 1.
- **Rot, Spike-Soll IoU ≥ 0,9 verfehlt:** nur die Draufsicht hält (0,916). Sonst:

  | Schuss | IoU |
  |---|---|
  | 8 m Seite | 0,786 / 0,798 |
  | Gang 10 m f1–f3 | 0,71–0,83 |
  | Armlänge | 0,649 |

  Die Bilder `xor-wolf-8m-seite.png` und `xor-wolf-gang-10m-f2.png` zeigen, dass der pfotennahe Lappen eines Vorderbeins fehlt. Die Schattenfläche schrumpft um 6–12 %. Der Auftrag sagte „Fällt eine Zahl: halt an“; der Champion hat trotzdem den Golden geprägt.
  - Die Ursache liegt im Chokepoint dieses Auftrags: `foundry-core.js:4950` (voxFern 0,04 H) mit `:4989` und `:5001-5003`. Die dünnen Unterläufe flL/frL bleiben in der Grobstufe einzelne Primitive ohne die weiche Naht der L0-Haut.
- Erreicht: Sonnenflanke Δ 0,52 %. Der Wolf auf 45 m wirft jetzt (0 → 66 px).
- Im echten Spielbild erreicht kein Tier-Schatten den Boden. Grund ist der Host-Wert `normalBias` 1,0 m (`anazhRealm.js:350`, Boden-IoU 0,012). Das ist ehrlich benannt und liegt außerhalb dieser Familie.
- Benannt: VRAM +0,5 MB statt Plan +0,3 und Haupt-Programme der fernen Stufe 2 → 5. Gesamtwerte der Welt fallen: Vertex-Programme 51 → 49, Pipelines 55 → 52.
- Die Band-Summen „vorher 1, nachher 4“ sind nicht unter gleichen Bedingungen gemessen: nahWiese ist nachher im Bild, vorher nicht. Je Klasse ist das Bild stimmig: spieler k0 8 → 5 Befehle, −124k Dreiecke.
- Eine Radeon-Zeit wurde nicht als Beweis genutzt.

**(f) Handwerk**
- Kein Siegel-Wort in den 6 Messages, auch nicht als Wortteil.
- Co-Authored-By steht in allen 6.
- YAML ist gültig, die CI auf dem Kopf ist grün.
- `?v=` ist unverändert 18.536.0. Das ist Sache des Integrators, siehe (g).

**(g) Für den Integrator**
- **`?v=`-Bump ist Pflicht** für foundry-core, tetrapoda-core, koerper-core und anazhRealm. Der Wirt bricht jetzt laut ab, wenn eine Grobstufe ungeskinnt ist. Ein alter foundry-core im Cache hieße: Magenta-Not-Körper statt Mensch und keine Tiere.
- Der Foundry-Stempel wechselt, das kostet einmal einen kalten Boot mit rund 35 MB.
- **render-config.json und manifest.json** einmal neu prägen (E5).
- **docs/studio-vertrag.md B2c:** Der Satz „Die Baum-Form `wurf.durchmesserM` bleibt; beide Formen trägt derselbe Validator“ widerspricht pflanzen S4, wo der drawRange-Vorsatz fällt und `teil`/`aDeckt` kommt. Er muss umgeschrieben werden.
- **`diag-studio-vertrag.cjs`, Zweig `wurf`:** auf zwei Formen zusammenführen, `teil` und `seh`. Die Regel „nur eine selbst werfende Stufe“ bleibt. Der Loader `SEH_KLASSEN` braucht haar, haut und stoff in `BUDGET_GESETZ.seh`.
- **tetrapoda-core und koerper-core:** Die neuen Kommentarzeilen stehen direkt vor `fernform` (tor, Schnitt F, `"huelle"`) und neben der Zeile `GESTALTEN_JE_REZEPT` (wiese). Das gibt einen Textkonflikt; von Hand und ohne prettier lösen.
- **Ofen-Bereich foundry-core:** Der Export `huelle()` von tor ist additiv. `_kreaturGliederGruppen` überspringt jetzt `_gelenk.fern`; tor muss diese Ausnahme halten.
- **diag-altlasten `FORBIDDEN`:** als Vereinigung mergen, +5.
- **check.yml:** Gruppen 2 und 3, danach `gate:ci-deckung`.
- **Ratsche:** die Zahlen für die Senkung liefert die Integrator-Serie.

Geschnitten: Der Champion hat das Standbild an der Wurzel, zwei castShadow-Literale, drei Wirts-Distanzen, vier Stufen-Schreiber und vier fail-soft-Zweige entfernt; an ihre Stelle treten die Kern-Zeile, ein Leser `_ofenZeile`, die Gelenk-Gestalt und der Schalter `_gelenkStufe`.
Gemessen: Die Linse war an der Basis rot (Wolf 28 710/7, Mensch 162 412/8) und ist am Kopf grün (5 194–6 172/1, 37 964/5), die Golden-Änderung betrifft nur 40 Schlüssel `*-L1|*` (L0 297/297 gleich), aber das Spike-Soll fällt mit IoU 0,65–0,83 gegen ≥ 0,9.
Pflicht-OFFEN Rest: A · B · C · E (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND

merge-reif: nein — (1) Spike-Soll verfehlt (IoU 0,786/0,71–0,83/0,649 < 0,9, Vorderpfoten-Lappen fehlt), trotz der Halt-Regel weitergebaut und den Golden `spec/asset-contract/ofen/golden/bake.json` `*-L1|*` gegen E8 geprägt; die Heilung liegt im Chokepoint dieses Auftrags, `foundry-core.js:4950/4989/5001-5003` (Unterläufe flL/frL in die Haut der Grobstufe); (2) der ferne Mensch-Peer friert jenseits 44 m mitten im Schritt ein statt in Ruhe-Pose, ohne Deckung und unbenannt, `anazhRealm.js:7748-7755`.