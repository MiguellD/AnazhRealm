# Bericht 0910-5: der Spieler wirft in der Ego-Sicht seinen Schatten — EIN Ebenen-Schalter am Leib

Auftrag: `auftrag/0910-5-omen-ego-schatten.md` (koordination 6f0b8a46); Entscheidung 11.10. §3.3 („in `_applyEgoSicht` gilt
EINE Regel: die Ebenen-Regel“).
Kopf: **welle-m-ego-schatten 0097998b** (per `git ls-remote`), ab main 7dd944e6, vier Commits (59f580b0 der Schnitt,
a2e00597 Gegenprobe und Vendor-Anker, 11bb9c36 der Name des Merkfelds, 0097998b leer: CI erneut). CI an 0097998b: Lauf
38038945137, alle fünf Jobs grün (check 4,3 min, erst-zeichnung 8,4 min, Gruppen 18,6 / 18,6 / 20,3 min;
`0910-5/ci-38038945137.json`).

## In drei Sätzen

**Geschnitten:** `_applyEgoSicht` schaltet keine Sichtbarkeit mehr, sondern Ebenen. Im 1st verlässt der Leib die Ebene 0
der Haupt-Kamera und liegt auf `SHADOW_TWIN_LAYER`: die Kaskaden werfen ihn ganz, das Auge sieht ihn nie. `visible` bleibt
unberührt, ein Zwilling bleibt in den Kaskaden, das Gerät in der Hand bleibt auf Ebene 0.

**Gemessen:**
- `gate:ego-schatten` (neu, CI Gruppe 3): main 7dd944e6 und integ-probe 76c036b0 ROT, je nur „LEIB WIRFT NICHT“ (Ego 0 px
  gegen 692 bzw. 777 px in der 3rd-Person). Kopf GRÜN in 9 Läufen (Ego 697–712 px, IoU 1,0, 0 px Leib vor dem Auge), der
  Probe-Merge auf integ-probe GRÜN. Je 14–17 s lokal.
- Werkbank (GTX 1060, EINE Welt, Methode getauscht), Klasse `spieler` in der Ego-Sicht: auf main k0 0 → 8 Befehle /
  162 412 Dreiecke, Hauptbild 0 → 0. Auf dem Probe-Merge mit integ-probe trägt der Zwilling der Grobstufe den Wurf:
  k0 0 → 5 Befehle / 37 964 Dreiecke.
- Merge mit welle-lf-kampf 7ccab2f4 nach §3.3 (Teil 5): lfs `gate:kampf-gefuehl` fällt am rohen Merge („8 Haut-Meshes“,
  sie zählt `visible`). Mit der Ebenen-Zeile ist sie GRÜN am Merge und am lf-Kopf allein, und beide Gegenproben fallen beim
  Namen. Der volle Playtest am Merge: „Alle Invarianten OK“.
- Bild-Paar Ego (Ausgabe-Pfad): im Schatten-Streifen am Boden Helligkeit 88,2 → 68,9 (auf main) und 90,0 → 68,3 (Probe-
  Merge); daneben 102,0 und 102,6 → 102,8.

**Ehrlich offen:**
- Auf dem Zweig allein (ab 7dd944e6) zeigt der Boden nur den Stummel des Schattens: `normalBias` 1 m. Das Bias-Gesetz aus
  0710-12 steht seit V18.538 auf main; mit dem Merge fällt der Punkt.
- Das Ego-Auge sitzt 0,45 m über den Augen des Leibs (1,60 m über der Körper-Mitte, die Augen bei 1,15 m).
- Der Merge mit welle-lf-kampf (V18.539) ist gelöst und geprüft (Teil 5), liegt aber noch nicht im Zweig: lfs
  `gate:kampf-gefuehl` zählt die Haut über `visible` und braucht dafür eine Linsen-Zeile (`0910-5/lf-merge/`).

## Teil 1: der Schnitt

**Wurzel:** Die Regel setzte `visible = false` an Kopf-Part und `_creatureSkin`-Hülle. Ein unsichtbarer Knoten fällt in
r184 aus JEDER Projektion, auch aus den Kaskaden. Lehre 26 sagt es schon: unsichtbar für die Haupt-Kamera heißt Ebene,
nie Transparenz.

**Schnitt** (`_applyEgoSicht`, die Marke `_gehalten` in `_refreshHeldMesh`):
- Die Regel geht jeden Knoten von Kopf-Part und Hülle, denn Ebenen erbt kein Kind.
- Im 1st verschiebt sie nur, was auf Ebene 0 liegt, nach `SHADOW_TWIN_LAYER` und merkt die alte Maske (`_maskeVorEgo`).
  Die Haupt-Kamera sieht nur Ebene 0. Die Schatten-Kamera des Lichts sieht Ebene 2, und jede Kaskade klont das.
- 3rd gibt genau die gemerkte Maske zurück. Ein Knoten, der schon nur in den Kaskaden lebt, bleibt, wie er ist.
- `visible` schreibt sie nie. Die Stufen-Regel (`_menschFernToggle`, auf integ-probe `_gelenkStufe`) behält ihr Wort.
- Kosten: 3 µs je Aufruf (63 Knoten, je Frame aus `_loopCamera`).

**Grenzfälle:**
- **Wechsel 1st ↔ 3rd (V):** `setCameraMode` ruft die Regel sofort. Die Linse prüft die Rückgabe jeder Maske.
  Der Playtest V8.29.1 wandert mit: statt des Quell-Musters `headPart.visible` prüft er den Schalter am Leib (73 Knoten).
- **Gerät / Waffe in der Hand:** Das Gerät hängt am Handgelenk, also IN der Hülle. Bisher verschwand es mit ihr.
  - Jetzt trägt es `_gehalten` und bleibt auf Ebene 0: das Auge sieht es, es wirft.
  - r184 projiziert die Kinder jedes Knotens ohne Ebenen-Test. So zeichnet das Gerät an Knochen auf Ebene 2 trotzdem.
    `gate:vendor-anker` hält beide Stellen (170 → 172 Anker).
- **Konflikt welle-lf-kampf:** zwei Stücke in `_applyEgoSicht`. Lösung nach §3.3 und geprüft am lf-Kopf 7ccab2f4: Teil 5.
  Mein Entwurf sagte hier, `gate:kampf-gefuehl` bleibe erfüllt. Das war falsch: ich hatte nur die Kette des Geräts gelesen,
  die Linse aber nicht am Merge laufen lassen. Sie zählt auch die Haut im 1st über `visible`.
- **Reiten / Fahren:**
  - In der geschlossenen Kabine setzt `_loopCamera` den ganzen Avatar unsichtbar (`player.visible`). Dort wirft der Wagen,
    nicht der Leib, wie bisher.
  - Auf offenem Sitz oder Reittier gilt dieselbe Regel wie zu Fuß: der Reiter wirft in der Ego-Sicht.
- **Mehrspieler:** Die Regel liest nur `state.playerMesh`. Den Peer-Leib baut der andere Client selbst; Ebenen reisen
  nicht über den Kanal. Ein Peer sieht den Leib wie heute.
- **Zwilling (integ-probe, S3):**
  - Die Grobstufe des Menschen wirft dort als Zwilling auf Ebene 2. Die feine Stufe wirft nicht.
  - Im Probe-Merge (integ-probe 76c036b0 + 59f580b0) läuft die Regel ohne Konflikt. Im 1st liegen alle 14 Meshes auf
    Ebene 2. Im 3rd tragen die 8 feinen Meshes Maske 1 und die 6 der Grobstufe Maske 4.
  - Eine Regel, die im 3rd blind Ebene 0 einschaltet, hätte den Zwilling der Haupt-Kamera gezeigt. Die Linse nennt das
    „ZWILLING“.

## Teil 2: Kosten — Klasse `spieler` je Pass (`werkbank zaehlen`, GTX 1060)

Gezählt in EINER Welt; „vorher“ ist die alte Methode, live getauscht.

| Stand · Blick | Hauptbild | k0 | k1 |
|---|---|---|---|
| main-Regel · Ego | 0 | 0 | 0 |
| Kopf · Ego | 0 | **8 / 162 412** | 0 |
| Kopf · 3rd (dieselbe Pose) | 8 / 162 412 | 8 / 162 412 | 0 |
| integ-probe-Regel · Ego (Probe-Merge) | 0 | 0 | 0 |
| Probe-Merge · Ego | 0 | **5 / 37 964** | 0 |
| Probe-Merge · 3rd | 8 / 162 412 | 5 / 37 964 | 0 |

Werte: Befehle / Dreiecke. Die Zahlen des Probe-Merge decken sich mit studio-s3-kreatur (90307589: „Mensch 162 412/8 →
37 964/5“). Auf main wirft die feine Stufe (8 Meshes, ein Haut-Mesh allein 88 244 Dreiecke). Auf
integ-probe wirft die Grobstufe als Zwilling (5 Meshes). In der 3rd-Person zahlt der Leib den Wurf heute schon.
Rohdaten: `0910-5/zaehlen-*.json`.

## Teil 3: die Linse `gate:ego-schatten` (scripts/diag-ego-schatten.cjs)

**Aufbau:**
- Der echte Renderer (swiftshader, kienspan, Schatten an) an einer eigenen Bühne, wie `gate:kamera-treue` und
  `gate:ziel-zensus`.
- Der echte Leib: der Mensch aus dem Ofen, NACH dem Foundry-Buch. Seine Ankunft gießt den Avatar neu; eine Bühne am alten
  Leib maß im ersten Entwurf einen Körper, den keine Regel mehr erreichte.
- Die echte Regel über `setCameraMode` und `_loopCamera`, die echte Haupt-Kamera am Auge.
- Ein Licht, dessen Schatten-Kamera die Ebenen des Spiel-Lichts trägt. Sonne 30° hoch, seitlich hinter dem Leib.
- Fünf Schüsse zu 192×108: Ego mit und ohne Wurf, ohne Leib, dieselbe Pose (dieselbe Kamera) im 3rd mit und ohne Wurf.

**Urteil:**
- LEIB WIRFT NICHT: Ego 0 px Schatten.
- UMRISS: IoU < 0,9 gegen das 3rd, ohne die Bildpunkte, die im 3rd der Leib selbst deckt.
- AUGE: Leib-Bildpunkte im Ego-Bild oder ein sichtbares Leib-Mesh auf Ebene 0.
- GERÄT · ZWILLING · ZURÜCK (Masken und `visible`) · VERTRAG (Haupt-Kamera ohne Ebene 2, Schatten-Kameras mit) · BLIND.
- GEGENPROBE: fünf eingeschmuggelte Regeln fallen je beim Namen (die von main, „Ebene 0 bleibt“, „fremde Ebene“, „das
  Gerät mit“, „Zwilling geweckt“).
- Selbsttest ohne Browser in `npm run check`.

| Stand | Urteil | Ego-Schatten | 3rd-Schatten | Leib vor dem Auge |
|---|---|---|---|---|
| main 7dd944e6 (2 + 1 Läufe) | ROT „LEIB WIRFT NICHT“ | 0 px | 692–705 px | 0 px |
| integ-probe 76c036b0 | ROT „LEIB WIRFT NICHT“ | 0 px | 777 px | 0 px |
| Kopf 59f580b0 / a2e00597 (5 + 4 Läufe) | GRÜN | 697–712 px | gleich, IoU 1,0 | 0 px |
| Probe-Merge integ-probe 76c036b0 + 59f580b0 (Linse a2e00597) | GRÜN | 694 px | gleich, IoU 1,0 | 0 px |
| Probe-Merge V18.538 66005ca6 + 0097998b | GRÜN | 693 px | gleich, IoU 1,0 | 0 px |

- `0910-5/linse-buehne.png`: v. l. n. r. die Regel von main im Ego (kein Schatten), der Kopf im Ego (der Umriss vom Fuß bis
  zum Kopf), dieselbe Pose im 3rd, die Gegenprobe „Ebene 0 bleibt“.
- Die Gegenprobe „fremde Ebene“ blieb auf dem Probe-Merge zuerst grün: sie ließ den Zwilling stehen, und der warf weiter.
  Seit a2e00597 nimmt sie den ganzen Leib aus den Kaskaden und fällt auf allen Ständen.
- Kosten: lokal 14–17 s. In der CI 17 s (Lauf 38038945137, Gruppe 3, Schritt 99; `0910-5/ci-38038945137.json`).

## Teil 4: das Bild-Paar (Ego, Ausgabe-Pfad, TRAA-Phase und Himmels-Uhr fest)

Sonne 23,4° hoch von −67°, Blick 49° hinab, der Schatten fällt 35° rechts der Blickachse. Freie Wiese ohne Baum-Schatten.

| Paar | vorher | nachher | Schatten-Streifen | daneben |
|---|---|---|---|---|
| main-Basis (−965/−853) | `ego-vorher.jpg` | `ego-nachher.jpg` | 88,2 → 68,9 | 102,0 → 102,0 |
| Probe-Merge mit integ-probe (−965/−780) | `probe-ego-vorher.jpg` | `probe-ego-nachher.jpg` | 90,0 → 68,3 | 102,6 → 102,8 |

- Vorher liegt in der Ego-Sicht kein Schatten des Spielers am Boden.
- Nachher läuft ein dunkler Streifen vom Fuß ins Bild. Auf dem Probe-Merge wirft ihn der Zwilling unter dem Bias-Gesetz.
- Der Boden steigt am Probe-Ort entlang des Schattens um 0,2 m je Meter: erwartet sind dort 2,7 m statt 4,4 m in der Ebene.

## Teil 5: der Merge mit welle-lf-kampf nach Entscheidung §3.3 (`0910-5/lf-merge/`)

§3.3: in `_applyEgoSicht` gilt EINE Regel, die Ebenen-Regel. Das gehaltene Gerät bleibt auf Ebene 0, lfs `_egoVerborgen`
fällt. welle-lf-kampf kommt mit V18.539, dieser Zweig mit V18.540: der Integrator trifft den Konflikt beim Merge dieses Zweigs.

**Probe-Merge 0097998b + welle-lf-kampf 7ccab2f4** (beide per `git ls-remote`):
- Zwei Konflikt-Stücke, beide in `_applyEgoSicht` (Kopf-Kommentar und Rumpf). Lösung: beide Stücke von dieser Seite.
  Danach stehen `_egoVerborgen` und `_egoWar` nirgends mehr, weder im Stamm noch in `scripts/`.
- Die Marke `_gehalten = true` in `_refreshHeldMesh` ist in beiden Zweigen dieselbe Zeile und mergt sauber.
- lfs `gate:kampf-gefuehl` fällt am rohen Merge: „pose-ichregel: im 1st zeichnen 8 Haut-Meshes“ (`kampf-merge-roh.txt`).
  Die Linse zählt die Haut mit `traverseVisible`, also nur über `visible`. Unter der Ebenen-Regel bleibt die Haut sichtbar
  und liegt auf Ebene 2: die Haupt-Kamera zeichnet sie nicht, die Kaskaden werfen sie.
- Der Linsen-Schnitt (`kampf-gefuehl-ebene.patch`, 14 Zeilen in `scripts/diag-kampf-gefuehl.cjs`):
  - „Zeichnet“ fragt, was r184s `_projectObject` fragt: jeder Ahne sichtbar UND die eigene Ebene in der Haupt-Kamera.
  - Das gilt für die Haut im 1st und für das Gerät im Treffer-Takt. Der Rückstand 3rd → 1st → 3rd vergleicht `visible`
    und Ebenen-Maske.

| Stand | Linse | Urteil | Ich-Regel |
|---|---|---|---|
| Probe-Merge, lf-Linse wie sie ist | `gate:kampf-gefuehl` | ROT „8 Haut-Meshes“, EXIT=1 | hautImErsten 8 |
| Probe-Merge, Linse mit Ebene | `gate:kampf-gefuehl` | GRÜN, EXIT=0 (37 s) | hautImErsten 0, Klinge zeichnet |
| Gegenprobe: das Gerät wandert mit auf Ebene 2 | `gate:kampf-gefuehl` | ROT „im Treffer-Takt zeigt die Ich-Sicht keine Klinge“, EXIT=1 | hautImErsten 0 |
| Gegenprobe: die Haut bleibt auf Ebene 0 | `gate:kampf-gefuehl` | ROT „8 Haut-Meshes“, EXIT=1 | hautImErsten 8 |
| lf-Kopf 7ccab2f4 allein (lfs `visible`-Regel), Linse mit Ebene | `gate:kampf-gefuehl` | GRÜN, EXIT=0 (51 s) | hautImErsten 0, Klinge zeichnet |
| Probe-Merge | `gate:ego-schatten` | GRÜN, EXIT=0 | Ego 697 px, IoU 1,0 |

- Rohdaten: `kampf-merge-roh.txt`, `kampf-merge-ebene.txt`, `kampf-gegenprobe-geraet.txt`, `kampf-gegenprobe-haut.txt`,
  `kampf-lf-kopf-ebene.txt`, `ego-schatten-merge.txt`.
- Am Probe-Merge außerdem: `npm run check` EXIT=0, `gate:vendor-anker` EXIT=0 (172 Anker), `npm run lint` EXIT=0
  (0 Fehler, die 2 Warnungen von main), `prettier --check` sauber. Voller Playtest: „Alle Invarianten OK“, EXIT=0, 189 s, 5 015 ✅ und 0 ❌,
  V8.29.1 grün (`playtest-voll-merge.txt`).

## Prüfungen

- Probe-Merge auf V18.538 (66005ca6 + 0097998b): konfliktfrei, `gate:vendor-anker` 181 Anker grün, `gate:ci-deckung` grün,
  `gate:ankunft --selftest` grün, `gate:ego-schatten` grün (693 px).
- `npm run check` grün, `npm run lint` 0 Fehler (die 2 Warnungen stehen auch auf main).
- Voller Playtest lokal an 59f580b0: „Alle Invarianten OK“ (5 015 Prüfungen), V8.29.1 grün.
- `gate:ci-deckung`: Gruppe 3 trägt 35 Schritte, jeder Schritt genau einmal.
- JEDER Gate-Schritt der CI lokal an 11bb9c36 (115, seriell wie die CI, `bash -eo pipefail`; `0910-5/ci-lokal.log`): 113 grün.
  Rot nur zwei Umgebungs-Fälle:
  - `gate:wasser-leben:bild` bricht im Start ab („render() called before the backend is initialized“). main 7dd944e6 lokal
    genauso, der Kopf im zweiten Lauf grün.
  - `gate:hitch-telemetrie`: zwei Bänder der Erst-Zeichnung, Pipelines unter Windows-swiftshader nach 120 s nicht bereit.
    In der CI an a2e00597 grün (6,9 min); main 7dd944e6 lokal dieselben zwei Bänder rot (1 236 s).
- CI an a2e00597 (Lauf 38025558507) fiel in Gruppe 3, Schritt 90: `gate:ankunft` Selbsttest W8 verbietet den Teilstring
  `egoM` im ganzen Stamm (das gefallene Ego-Radius-Feld), und mein Merkfeld hieß `_egoMaske`. 11bb9c36 nennt es
  `_maskeVorEgo`. Das hätte vor dem Push jeder lokale CI-Schritt gezeigt; seitdem laufen lokal alle.
- CI an 11bb9c36 (Lauf 38031900965): check, erst-zeichnung, Gruppe 1 und 2 grün; Gruppe 3 fiel im echten Lauf von
  `gate:ankunft` (Schritt 90, 1,3 min; die CI-Logs lese ich ohne Admin-Recht nicht). Danach liefen `gate:ego-schatten` und der Rest
  der Gruppe nicht.
  - Lokal am Kopf 7 von 8 Läufen grün. Der eine rote: L2a „mit einer Streu-Region, die auf ihr Asset wartet: kein Fall
    (Vorbedingung)“, die Spieler-Region stand noch nicht. main lokal 8 von 8 grün.
  - Das ist der bekannte Wackler von V18.537: V18.538 (a953c758, fix-ankunft-streu-fall) nennt ihn, „gate:ankunft L2a hatte
    bei 6-facher CPU-Drossel in 2 von 8 Boots keinen Streu-Fall, jetzt 0 von 8“. Mit V18.538 fällt er.
- CI an 0097998b (Lauf 38038945137, dieselbe Quelle wie 11bb9c36): alle fünf Jobs grün, `gate:ankunft` 77 s,
  `gate:ego-schatten` 17 s (`0910-5/ci-38038945137.json`).

## Offen (mit Zahl)

1. **Der Stummel auf main allein:**
   - `normalBias` 1 m schiebt die Boden-Probe einen Meter hoch, also wirft nur der Leib über 1 m.
   - Am Boden der Werkbank war der Schatten bei 25° Sonne etwa 0,6 m lang statt 3,75 m, auch in der 3rd-Person (die dort
     wie auf main wirft).
   - Das Bias-Gesetz aus 0710-12 (welle-m-schatten; dort trägt das Licht 0,083 m) gibt den vollen Umriss. Es steht seit
     V18.538 auf main (66005ca6). Der Zweig zweigt von 7dd944e6 ab; der Punkt fällt beim Merge (Probe-Merge V18.538 +
     0097998b: Ego 693 px, Teil 3).
2. **Das Ego-Auge über dem Kopf:**
   - `_loopCamera` setzt das Auge 1,60 m über die Körper-Mitte, eine Konstante. Am Standard-Menschen der Mess-Wiese liegen
     die Augen-Meshes bei +1,14–1,19 m, der Scheitel bei +1,25 m, die Sohle bei −0,68 m.
   - Das Auge sitzt also 0,35 m über dem Scheitel und 0,45 m über den Augen. Auf `linse-buehne.png` (3. Bild) sieht man
     aus dem Ego-Auge auf den Scheitel hinab.
   - Nicht Teil dieses Schnitts; benannt für Schritt 2 „laufen + sehen“.
3. **Kosten auf main:** 8 Befehle / 162 412 Dreiecke in k0 je Frame der Ego-Sicht, dieselben wie in der 3rd-Person. Mit dem
   Zwilling aus integ-probe sind es 5 / 37 964.
4. **Merge mit welle-lf-kampf:** gelöst und am Probe-Merge geprüft (Teil 5). Im Zweig steht er erst, wenn V18.539 auf main
   liegt. Bis dahin trägt `0910-5/lf-merge/` die Lösung: beide Stücke nach dieser Seite und die 14 Zeilen der lf-Linse.

## Pflicht-OFFEN Rest

A · B · C · E stehen (`docs/PFLICHT-OFFEN.md` an main 66005ca6; D fiel mit V18.508). Dieser Schnitt nimmt keinen Eintrag.
E (das Profi-Band) berührt er mit den Kosten aus Teil 2: auf main +8 Befehle / 162 412 Dreiecke in k0 je Frame der
Ego-Sicht, mit dem Zwilling aus integ-probe +5 / 37 964.

## Status: ZWISCHENSTAND · Übergabe

- Zweig welle-m-ego-schatten 0097998b (per `git ls-remote`), ab main 7dd944e6, CI 38038945137 5/5, keine offene Änderung im
  Worktree.
- Nach §3.3: Integrator nach unabhängiger R2-Prüfung, V18.540.
- Merge mit V18.539 (welle-lf-kampf): `0910-5/lf-merge/` trägt die Lösung. Beide Stücke in `_applyEgoSicht` kommen von dieser
  Seite, dazu `kampf-gefuehl-ebene.patch`. Der Patch ist regel-neutral (am lf-Kopf allein GRÜN, EXIT=0) und kann darum schon mit lf in
  V18.539 gehen; sonst gehört er in den Merge dieses Zweigs.
- Werkzeuge: `p3/es/` (ci-lokal.cjs = alle CI-Schritte seriell, ego.cjs, maske.cjs), `p3/es/lf/` (die Läufe von Teil 5).
