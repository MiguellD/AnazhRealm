> **ENTWURF — Zwischenstand-Sicherung, UNGEPRÜFT.** Die CI-Zeilen sind noch offen; der Bericht folgt nach 0910-7.

# Bericht 0910-5: der Spieler wirft in der Ego-Sicht seinen Schatten — EIN Ebenen-Schalter am Leib

Auftrag: `auftrag/0910-5-omen-ego-schatten.md` (koordination 6f0b8a46).
Kopf: **welle-m-ego-schatten 0097998b** (per `git ls-remote`), ab main 7dd944e6, vier Commits (59f580b0 der Schnitt,
a2e00597 Gegenprobe und Vendor-Anker, 11bb9c36 der Name des Merkfelds, 0097998b leer: CI erneut). CI: CI-ZEILE

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
- Bild-Paar Ego (Ausgabe-Pfad): im Schatten-Streifen am Boden Helligkeit 88,2 → 68,9 (auf main) und 90,0 → 68,3 (Probe-
  Merge); daneben 102,0 und 102,6 → 102,8.

**Ehrlich offen:**
- Auf main allein zeigt der Boden nur den Stummel des Schattens: `normalBias` 1 m, das Bias-Gesetz aus 0710-12 liegt in
  integ-probe.
- Das Ego-Auge sitzt 0,45 m über den Augen des Leibs (1,60 m über der Körper-Mitte, die Augen bei 1,15 m).
- Konflikt mit welle-lf-kampf in `_applyEgoSicht` (zwei Stücke, Lösung unten).

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
- **Konflikt welle-lf-kampf (c9c00777):**
  - Probe-Merge auf 59f580b0: genau zwei Konflikt-Stücke, beide in `_applyEgoSicht` (Kopf-Kommentar und Rumpf).
  - Die Marke `_gehalten = true` in `_refreshHeldMesh` ist in beiden Zweigen dieselbe Zeile und mergt sauber.
  - welle-lf-kampf verbirgt im 1st jedes Haut-Mesh einzeln über `visible` (mit `_egoWar`). Das Schwert bleibt sichtbar,
    aber der Leib wirft weiter nicht.
  - Lösung beim Merge: den Rumpf dieses Zweigs nehmen. Er hält die Ausnahme von welle-lf-kampf (`_gehalten`) und braucht
    `_egoWar` nicht, weil er `visible` nie schreibt.
  - `gate:kampf-gefuehl` (pose-ich) prüft `visible` entlang der Kette des Geräts und bleibt damit erfüllt.
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
- Kosten: lokal 14–17 s. In der CI CI-LINSE.

## Teil 4: das Bild-Paar (Ego, Ausgabe-Pfad, TRAA-Phase und Himmels-Uhr fest)

Sonne 23,4° hoch von −67°, Blick 49° hinab, der Schatten fällt 35° rechts der Blickachse. Freie Wiese ohne Baum-Schatten.

| Paar | vorher | nachher | Schatten-Streifen | daneben |
|---|---|---|---|---|
| main-Basis (−965/−853) | `ego-vorher.jpg` | `ego-nachher.jpg` | 88,2 → 68,9 | 102,0 → 102,0 |
| Probe-Merge mit integ-probe (−965/−780) | `probe-ego-vorher.jpg` | `probe-ego-nachher.jpg` | 90,0 → 68,3 | 102,6 → 102,8 |

- Vorher liegt in der Ego-Sicht kein Schatten des Spielers am Boden.
- Nachher läuft ein dunkler Streifen vom Fuß ins Bild. Auf dem Probe-Merge wirft ihn der Zwilling unter dem Bias-Gesetz.
- Der Boden steigt am Probe-Ort entlang des Schattens um 0,2 m je Meter: erwartet sind dort 2,7 m statt 4,4 m in der Ebene.

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
  - Ein grüner CI-Lauf dieses Zweigs steht damit noch aus.

## Offen (mit Zahl)

1. **Der Stummel auf main allein:**
   - `normalBias` 1 m schiebt die Boden-Probe einen Meter hoch, also wirft nur der Leib über 1 m.
   - Am Boden der Werkbank war der Schatten bei 25° Sonne etwa 0,6 m lang statt 3,75 m, auch in der 3rd-Person (die dort
     wie auf main wirft).
   - Das Bias-Gesetz aus 0710-12 (welle-m-schatten, in integ-probe; dort trägt das Licht 0,083 m) gibt den vollen Umriss.
   - Mit V18.538 fällt der Punkt.
2. **Das Ego-Auge über dem Kopf:**
   - `_loopCamera` setzt das Auge 1,60 m über die Körper-Mitte, eine Konstante. Am Standard-Menschen der Mess-Wiese liegen
     die Augen-Meshes bei +1,14–1,19 m, der Scheitel bei +1,25 m, die Sohle bei −0,68 m.
   - Das Auge sitzt also 0,35 m über dem Scheitel und 0,45 m über den Augen. Auf `linse-buehne.png` (3. Bild) sieht man
     aus dem Ego-Auge auf den Scheitel hinab.
   - Nicht Teil dieses Schnitts; benannt für Schritt 2 „laufen + sehen“.
3. **Kosten auf main:** 8 Befehle / 162 412 Dreiecke in k0 je Frame der Ego-Sicht, dieselben wie in der 3rd-Person. Mit dem
   Zwilling aus integ-probe sind es 5 / 37 964.
4. **Merge mit welle-lf-kampf:** zwei Konflikt-Stücke in `_applyEgoSicht`, Lösung in Teil 1.
