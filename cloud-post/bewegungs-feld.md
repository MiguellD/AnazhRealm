# Vorprüfung bewegungs-feld — das Feld der zeitlichen Auflösung trägt die Bewegung der Dinge

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 122 von 1 718 (diese Abgabe bucht keine Sprosse — die Station
`erleben.bild.auge#5` hat keinen Leser, siehe unten).

**Geschnitten:** Der Szenen-Pass schreibt je Fragment die Bewegung SEINES Dings seit dem Bild davor in einen dritten Eintrag
`bewegung` (rg16f, Mischung Normal), und die zeitliche Auflösung (`_traaKameraBewegung`) liest Kamera + Ding aus dieser EINEN
Quelle — Reprojektion, Klemme, Gewicht und `lass` lesen dasselbe Feld. Je Vertex trägt der EINE Bewegungs-Knoten
(`_bewegungKnoten`) die Strecke d = PV · (W · p − W_vor · (p + Δ)): die Welt-Matrix des vorigen Bilds (`_bewegungVorWelt`, je
Zeichen-Objekt), die Instanz-Matrix des vorigen Bilds (Arena `_block` → `instanceMatrixVor`, Senke ohne Arena
`_bewegungSenke`) und die Knochen des vorigen Bilds (r184 SkinningNode, `_bewegungKnochen`). Eine Haut im Modus attached trägt
ihre Welt in den Knochen: W_vor fällt dort weg (sonst zählte ihr Schritt doppelt — K6 Kopf 7,4 % ROT, jetzt grün). Jede
Vor-Matrix trägt den Stempel ihres Bilds (`__bewegungBild`, e[3]); der Shader nimmt sie nur mit dem Stempel DIESES Bilds — was
die Diät ruhen lässt, steht. Der Stempel steigt vor dem ersten Pass des Bilds (`_bewegungTakt`, aus dem Schatten-Takt; vorher
schrieb der Schatten-Pass die Vor-Matrizen mit der Nummer des alten Bilds), Kosten an der Änderung: eine Senke, die nicht
schreibt, kopiert nichts. Der Träger-Zwilling (Takt, Teile und Tafel des Trägers) ist gelöscht — kein Flag, kein
zweiter Weg (grep 0 Treffer im Stamm). Das Gerät verlangt die Varyings seines Adapters (`GERAET_GRENZEN`
`maxInterStageShaderVariables`, Radeon 28): mit 16 sagte die Pipeline des Satz-Stoffs ab, die Stadt stand ohne Häuser.

**Gemessen** (Radeon 890M, `werkbank --echt` 1920×1080, Ziel 1440×810, Ort `stadt-voll`, Third, gleiche zwei Blicke, gleiche
Kamera; vorher main 2da17e2e, nachher dieser Stand; je Seite DREI Läufe im Wechsel A B A B (vorher 3 · 4 · 5, nachher 11 · 12 ·
13), Mittel; Geister-Fläche = Anteil der Pixel, deren Ausgabe der zeitlichen Auflösung nach 6 s Lauf von der Referenz derselben
Welt nach 32 ruhenden Bildern abweicht):

| Messname | vorher | nachher |
|---|---|---|
| bewegte Dinge ohne ihre Bewegung (Zensus, K8-Gesetz, Band ⅔ … 1,5) | 230 von 230 (100 %) | 55 von 425 (12,9 %), Deckung eingeschlossen |
| — Bewohner (Haut, Satz) / Wagen, Räder, Instanzen der Wahl | ohne Ziel / ohne Ziel | 14 von 167 / 41 von 258 |
| Länge Feld ÷ Weg, wo das Feld das Ding trifft (n 385) | — | Median 1,03 · p5 0,92 · p95 1,18 |
| Geister-Fläche Blick 1 (Markt, Verkehr) > 0,04 / > 0,08 | 1,310 % / 0,577 % | 1,146 % / 0,328 % |
| Geister-Fläche Blick 0 > 0,04 / > 0,08 | 0,629 % / 0,174 % | 0,420 % / 0,037 % |
| Geister-Fläche in Ruhe > 0,04, Blick 1 / Blick 0 | 0,092 % / 0,272 % | 0,122 % / 0,282 % |
| GPU je Bild (gpu-bank 120 × 3), Paar A B | 15,00 / 18,11 ms | 15,04 / 20,00 ms |

Die Geister über 0,08 fallen im Markt um 43 %, im Blick 0 um 79 %; die Ruhe steht (Rauschen der Welt: 0,03–0,17 %). Der Preis
je Paar: +0,04 ms und +1,89 ms — im zweiten Paar stieg auch die CPU (14,98 → 17,66 ms, 146 → 204 bewegte Dinge im Bild, nicht
GPU-gebunden); Mittel +0,97 ms, unter dem Deckel +1,5 ms. Ein Lauf dieses Stands an der Radeon streut 13,9–20,0 ms.

Das Bildpaar: `cloud-post/bewegungs-feld-bild/` (rot = Geister-Pixel > 0,04): vorher zieht der Lieferwagen am Turm eine
geschlossene Schliere, nachher trägt der Wagen nur seinen Umriss (Freilegung, die Geschichte ist dort neu).

**Die Profis (das Band):** Salvi, GDC 2016 „An Excursion in Temporal Supersampling“ — Geschwindigkeit je Pixel für jedes bewegte
Ding, sonst Schlieren; AMD FSR 2 Dokumentation — „motion vectors for all covered pixels“, auch für Instanzen und Häute;
Yang/Liu/Salvi 2020, CGF 39 „A Survey of Temporal Antialiasing Techniques“ — Bewegung je Objekt als Grundbedingung der
Reprojektion. Band: Anteil sichtbar bewegter Dinge ohne Bewegung ≤ 5 % (Profi 0 %); die Länge des Felds folgt dem Weg im Median
1,03 (p5–p95 0,92–1,18). Gemessen 12,9 % ohne — der Zensus zählt Deckung mit: 23 der 29 genannten Beispiele sind Teile der
Wagen (Räder, Achsen der Wahl), deren Mitte hinter einem Passanten oder dem Marktstand liegt (Bild nachher13, Lieferwagen am
Turm), das Feld dort trägt den Deckenden; die übrigen 6 sind EIN Bewohner 1,8 m vor der Kamera (ein Gelenk zieht 1,8 Pixel, sein
Feld ±10 Pixel unter 0,5). Das Band ≤ 5 % ist darum am sichtbaren Ding nicht belegt — Adresse unten.

**Die Linse (Gebot 10):** `gate:kamera-leib:echt` K8 (Familie diag-kamera-laub, bestehend) — je sichtbarem bewegtem Ding der Weg
seines am weitesten ziehenden Punkts gegen das Feld; ROT am Täter (main: das Ziel fehlt, jedes Ding ohne Bewegung), der Schmuggel
(Stempel eingefroren, Knochen ohne Vor) wird je Lauf genannt, Selbsttest 7 Fälle grün. Konsum-Leser: `_traaKameraBewegung`.
Geschärft in dieser Abgabe: (1) die Zeile des Rück-Lesens (WebGPU legt jede Zeile auf 256 Byte — ohne den Schritt las der
Zensus ab der Bildmitte ein fremdes Ding und meldete drei Viertel ohne Bewegung); (2) das Band ⅔ … 1,5 statt ½ … 2 (die doppelt
zählende Haut lag bei 2 und hieß getragen); (3) das Fenster wächst mit dem Weg, höchstens 12 Pixel; (4) ein Sprung über ⅛ der Bildbreite (ein Platz der
Arena nimmt ein anderes Ding, 767 Pixel in einem Bild) zählt `sprung`, nie bewegt. Die Tiefe des Szenen-Passes als Richter
über Deckung ist geprüft und verworfen: das Rück-Lesen gab 0 an 465 von 465 Punkten — ein Gesetz, das stumm 0 liest, urteilt nicht. K8 am Kopf: gate:kamera-leib:echt GRÜN an diesem Kopf (Radeon, 75 s): K8 leib 10 von 11 getragen, Schmuggel leib 0 von 11 und andere 0 von 1; K6 Kopf 0–1,9 %, Leib 0,3–1,3 %.

## Ehrlich offen (mit Grund und Adresse)

- **Wind und Wasser** (Laub im Wind, Wellen): ihre Bewegung entsteht im Vertex-Shader aus der Zeit, kein Vor — sie stehen im
  Feld. Adresse `erleben.bild.auge#5`. Messname: Geister-Fläche am Wald-Messort.
- **Der Gang im Satz der Bewohner** (`_gangSatzKnoten`, Glieder schwingen im Vertex-Shader): die Instanz trägt ihre Matrix, die
  Glieder nicht. Adresse `gate:kamera-leib:echt` K8 (zählt je Instanz nur die Mitte).
- **Schatten bewegter Dinge auf ruhendem Grund** ziehen eine Spur (der Grund steht, sein Schatten wandert; im Bildpaar die Linie
  unter dem Wagen) — Bewegung je Ding heilt das nie. Adresse `erleben.bild.auge#5`.
- **Durchsichtige Beweger** (Rauch, Glas) schreiben Deckung 0: das Ding dahinter behält seine Bewegung. Adresse `erleben.bild.auge#5`.
- **Das erste Bild** nach Ruhe der Diät oder nach einem Stufen-Wechsel trägt keine Bewegung (kein Stempel: die Geschichte ist
  dort neu) — Gesetz, kein Fehler; Messname K8 `sprung`.
- **Deckung im Zensus:** K8 und der Zensus lesen das Feld am weitesten ziehenden Punkt; liegt er hinter einem anderen Ding, liest
  er dessen Bewegung (12,9 % gemessen, Band ≤ 5 % am sichtbaren Ding nicht belegt). Der Richter braucht die Tiefe oder die Kennung
  je Pixel im Rück-Lesen (die Tiefe las 0). Adresse `gate:kamera-leib:echt` K8 (`ohneMax` 0,2 trägt die Deckung bis dahin).
- **WebGL2-Rückfall:** die Instanz trägt keine eigene Bewegung (das Vor kostete 4 von 16 Attribut-Orten, W5). Adresse `gate:webgl-probe` W5.
- **Geräte mit 16 Varyings** tragen keine Ding-Bewegung (laut gemeldet: „DAS FELD DER BEWEGUNG: das Gerät trägt 16 Varyings“).
  Adresse `gate:webgl-probe`.
- **γ der Ruhe 1,25 → 1,0** und die längste Bewegung im 3×3 (Salvi) — nicht genommen: die Geister-Fläche in Ruhe steht bei 0,12 %,
  ohne Bildbeweis kein Schnitt. Adresse `erleben.bild.auge#5`.
- **Sprosse `erleben.bild.auge#5`** (Geister-Fläche ≤ 1 % gegen 16-fach zeitabgetastete Referenz): die Station hat keinen Leser
  (Station im Zweig punkte-maschine: „kein Leser — /bild schießt EIN Bild ohne Zeitabtastung“). Ein Kandidat für den Leser liegt bei:
  `cloud-post/bewegungs-feld-station/geister-zensus-seite.js` (Referenz = dieselbe Welt nach 32 ruhenden Bildern). Sache des Richters.

## Beanspruchte Sprossen

Keine. `erleben.bild.auge#5` liest an keinem Kopf (kein Leser); auge#1, mensch.bau.huelle#2, leben.pflanzen.dichte#3,
erleben.bild.flaeche#2, erleben.bild.nacht#4 lesen nichts, was dieser Schnitt ändert (kein Beweis an der Station, keine Anmeldung).
