# Bericht 0710-4 + 0710-5 — die Impuls-Klasse ganz, der Stoß im Sim-Schritt, der Reiter im Wagen

**Kopf:** `welle-m-impuls` **f3240335** (auf `welle-m-fahren` 7f97d339) · OMEN · headless (Null-Renderer) + Bilder am echten Renderer
(GTX 1060, Ausgabe-Pfad der Werkbank)

| Commit | Inhalt |
|---|---|
| 54480d58 | Klasse 1 + 2: EINE Masse je Leib (Haut-Volumen × Kern-Dichte), der Biss stößt |
| 7bb086e9 | Klasse 3: Leib an Leib tauscht Impuls |
| 20b0a5ef | 0710-5: der gestoßene Leib im festen Sim-Schritt, Playtest Kampf D auf `opts.stoss`, A3e3 mit echten Leibern |
| f8a539c6 | Klasse 4: der Reiter IM Wagen (Wirt + additive FAHR-Zeilen), Linse L9 |
| b7573745 | Klasse 4, Nachschnitt nach dem Auge: Füße über dem Bauch, Knie zur Mitte; L9 misst die Haut gegen Hülle und gezeichnete Haut |
| f3240335 | 0710-5, Nachschnitt nach dem Abgleich mit integ-probe: der gestoßene Schwimmer bleibt an seiner Linie; Sitzen aus dem Wasser |

## Geschnitten

1. **EINE Masse je Leib:** Die Dichte lebt im Kern (tetrapoda `MASSSTAB.dichteKgM3` 1000, koerper `LEIB.dichteKgM3` 985, vehicle
   `FAHR.masseDichte` 150), das Volumen ist die Gestalt. `_leibVolumen` misst die geschlossene Haut, `_leibMasse` gilt für Tier und
   Mensch, `_fahrMasse` für den Wagen. Gefallen sind `STOSS.dichteLeib`, `STOSS.dichteWagen` und `_kreaturMasse`. Die Wucht der Arena
   geht von 6 auf 2,7.
2. **Der Biss stößt:** `_bissStoss` (tetrapoda `BISS.masseAnteil` 0,3, im Tempo des Ansprungs) läuft auf allen drei Wegen.
3. **Leib an Leib:** `_stossKoerper` / `_stossAuf` / `_stossPaar` und `_leibKontakte` lösen Strecke gegen Strecke. Durchdringung
   trennt nach Masse, Annäherung tauscht Impuls. Der Wagen kennt den Spieler zu Fuß als Leib, der Spieler stößt Wagen.
4. **Der Stoß im Sim-Schritt (0710-5):**
   - `_kreaturStossSchritt` arbeitet in Teil-Schritten von höchstens dem halben Leib-Radius, je Teil-Schritt gegen die EINE Hülle.
   - Die Höhe des gleitenden Leibs setzt der Sim-Schritt an Land.
   - `_leibKontakte` läuft ebenfalls im Sim-Schritt.
   - Die Masse liest die Kette der lokalen Skalen statt `getWorldScale`.
   - Die Handbremse hält gegen den Stoß eines Menschen.
   - **ROT 2:** Playtest Kampf D prüft `fromPos + stoss` (Schaden UND Stoß weg vom Angreifer). Die Gegenprobe zeigt, dass das tote
     Feld `knockback` nicht stößt; der alte Check war leer.
   - **Eigener Fehler aus 54480d58:** Playtest A3e3 biss mit einem körperlosen Stub, und `_leibMasse` brach fail-closed. Der Check
     war rot und ließ `state.creatures` auf den Stubs stehen. Die Per-Push-CI fährt nur playtest:fast. Jetzt beißt ein echter Wolf
     einen echten Fuchs.
5. **Der Reiter IM Wagen (Klasse 4):** `_applySeatPose` legt die Oberschenkel waagerecht auf die Sitzfläche, `_sitzLage` setzt
   den Wurzel-Knochen:
   - das Hüftgelenk über den Sitz-Anker des Kerns (exportDrive.sitz, Fahrerseite);
   - der Blick längs der Fahrt, nie mit der Maus;
   - der Rumpf neigt sich ab der Lehne des Kerns, bis der Scheitel den Kopf-Freiraum unter der Dachlinie hält; der Kopf bleibt aufrecht;
   - das Knie beugt sich höchstens so weit, dass die Sohle über dem Bauch des Wagens bleibt; die Knie gehen zur Mitte.

   Die Maße misst die Haut einmal je Rig (`_sitzLeib`). Neigung und Knie werden je Wagen aus den Knochen gelöst (`_sitzNeigung`,
   `_sitzKnie`).

   vehicle-core bekommt additive FAHR-Zeilen: `sitzLehneRad` 0,13 (die Sitzreihe des Baus liest sie, byte-gleich), `kopfFreiraumM`
   0,05 und `sitzLehneMaxRad` 1,15 (dein Entscheid (1)). Wer aus dem Wasser aufsitzt, sitzt aufrecht (die Gruppe verliert die
   Schwimm-Kippung).
6. **Der gestoßene Schwimmer:** `_kreaturSchwimmt` ist die EINE Wasser-Regel für Frame-Takt und Stoß-Schritt. Im Wasser hält der
   Frame-Takt die Schwimm-Linie auch für einen gleitenden Leib.

## Gemessen

| Linse | vorher | nachher |
|---|---|---|
| T14 Masse (kg, Wirt) | Fuchs 35,4 · Wolf 140,5 · Hirsch 435,6 · Bär 254,8 · Mensch 0 · GT 1341,4 (Zwillinge im Wirt) | 15,0 · 64,0 · 94,2 · 335,4 · 98,8 · 1341,4 = Gestalt |
| T15 Biss Δv Hirsch / Spieler (m/s) | 0 / 0 | Fuchs 0,053 / 0,051 · Wolf 0,25 / 0,24 · Bär 0,85 / 0,83 |
| tier-separation (D) Fuchs → Bär | 0,35 m ineinander, 0 m/s | 0,000 m, Δv 2,66 / 0,12 m/s (Massen 22,4) · (E) Spieler 0,67 m/s · (F) 0 |
| fahr-leben L6 Spieler ↔ GT | Wagen hielt den Spieler ohne Folge; GT 0,139 m im Spieler | Prall im Stoß selbst gemessen (Rest −2 %, Wagen 0,000 m), GT → Spieler 4,50 m/s |
| L7 Bär 13,7 m/s vor 0,35-m-Wand (60 / 30 / gemischt) | 0/10 · 9/10 · 9/10 (bis 31,8 m dahinter) | 0/10 · 0/10 · 0/10 |
| L8 Lockstep nach 200 Sim-Schritten (Wagen / Bär) | 0,061 / 1,386 m | 0 / 0 m |
| L9 Scheitel gegen Dachlinie (GT · Supersport · Limousine · Kompakt · SUV) | +0,99 · +1,03 · +0,78 · +0,76 · +0,62 m | −0,05 · −0,05 · −0,05 · −0,05 · −0,09 m |
| L9 Lehne | 0° | 60,6° · 63,9° · 36,3° · 32,5° · 7,4° |
| L9 Schenkel über dem Polster / Hüfte neben dem Anker / Blick | +0,63 m / 0,41–0,61 m / 90° | 0,00 m / 0,00 m / 0° |
| L9 Haut außerhalb der Hülle / durch die gezeichnete Haut | — (nach dem Wirt-Schnitt: 5,4 % unter dem Bauch, bis 0,174 m; Kompakt 1,8 % seitlich) | 0 / 0,0 % je Art |
| L10 gestoßener Fuchs in 3,2 m Wasser, gegen seine Schwimm-Linie | gleitend bis −2,77 m (auf dem Grund) | tiefstens +0,12 m |
| Reiter-Oberkante am echten Renderer, über der Rad-Ebene (GT / Supersport / Limousine / SUV) | 2,175 / 2,13 / 2,185 / 2,265 m | 1,15 / 1,07 / 1,37 / 1,573 m (Dachlinie 1,2 / 1,12 / 1,42 / 1,66) |

**Bild-Paare** (`bericht/0710-4/reiter-{vorher,nachher}-{gt,supersport,limousine,suv}-{seite,schraeg}.jpg`):
- Vorher steht der Reiter mit dem Oberkörper durchs Dach und schaut zur Maus.
- Nachher sitzt er im Wagen, mit Blick längs der Fahrt und den Händen am Lenkrad.

Für den Schuss hängt seine Gestalt mit gleicher Welt-Lage in der Szene, denn die Werkbank blendet den Spieler aus. Im Spiel
verbirgt die geschlossene Kabine den Reiter render-only.

Supersport seitlich: Rumpf und Arm wirken wie auf dem Türblatt (`reiter-nachher-supersport-tuer-zoom.jpg`). Ein Strahl von der
Kamera trifft vor dem Rumpf ein undurchsichtiges Teil der Tür (Deckkraft 1) und vor den Ellbogen das Glas (Deckkraft 0,42). Der
Strahl-Test der Linse findet 0,0 % der Haut seitlich außen. Gesehen wird also durch die Scheibe, kein Durchstoß.

**Wände (Kopf f3240335):** check, lint, format:check, kampf-gefuehl, tier-separation, fahr-leben (+ Selbst-Test), vehicle-drive,
vehicle-/schmiede-/asset-/daten-/ofen-contract (Kern byte-gleich), kreatur-leben, koerper-kern, tier-anatomie, playtest:fast,
playtest „Alle Invarianten OK".

**CI:**
- 37696340913 (20b0a5ef): nur fahr-leben L3 rot (dein Log). Die Stoß-Probe nennt jetzt den Partner des ersten Kontakts, jeden
  Partner ohne Annäherung und die Tiere in der Gasse.
- 37702556246 (f8a539c6): check grün, playtest bis Schritt 74 grün (fahr-leben eingeschlossen), Schritt 75 an der 45-min-Kappe
  abgebrochen.
- 37709343976 (f3240335): läuft beim Bericht (playtest-Job bei Schritt 11); das Ergebnis folgt als Nachricht.

## Offen

- **Wagen-Tiefe** (Posten der Studio-Welle S3): GT und Supersport liegen bei 61–64°.
  - Ihre Tiefe vom Bauch bis zur Dachlinie beträgt 0,89 / 0,855 m, der Bedarf ~1,1 m (sitzender Mensch ~1,0 + 0,05 Freiraum).
  - Der Bauch ist die Schwellerlinie (ySill = fahrhoehe + 0,18). Akku und Bodenplatte liegen darauf, das Polster auf der Platte.
  - Peers sähen den liegenden Fahrer durchs Glas. Die Lehne des Baus (0,13 rad) folgt seiner Neigung nicht.
  - Die Kabine des Kompakt ist am Fußraum eng (die Füße stehen zur Mitte).
- **Lockstep im Wasser:** Im Wasser setzt der Frame-Takt die Höhe eines gleitenden Leibs, der Sim-Schritt liest sie. An Land ist
  der Stoß bildratenfrei (L8).
- **GELB (benannt, nicht geschnitten):** etwa 0,5 s Phantom-Fahrt nach einem Klemm-Stoß; der gestoßene Bär gleitet aufrecht statt
  zu stolpern; die Wucht des Schlags stößt nie auf den Angreifer zurück.
- **Karren:** In der Welt gibt es keinen Karren-Bauplan (`fahrzeug_wagen` ist nur die Substanz-Spende). Ein Teile-Werk sitzt über
  seinen sitz-Punkt, aufrecht, ohne Dach.
- **Lauf-Streuung in fahr-leben, ursächlich nicht isoliert:**
  - In 1 von 7 Läufen lief der Spieler zu Fuß mit 6,94 m/s in den GT (sonst 0,81–1,44, die Kadenz folgt der Emotion).
  - In einem Lauf wich L8 vor dem Stoß-Kontakt ab (Schritt 46, Wagen x). Seitdem ruht der Spawner während der Probe, und die Spur
    nennt die Tiere nahe dem Wagen.

## Konflikte

- **integ-probe** (6a3ab82d, enthält Welle L wasser 7a860106): 2 Stellen in anazhRealm.js, beide in `updateCreatures`.
  - **Stelle 1** (die Schwimm-Bedingung im 50-m-Block): Die integ-probe-Fassung nehmen. Die Regel lebt dort für jede Kreatur über
    `_koerperWasser` und `_wasserlinie`.
  - **Stelle 2** (die Höhe): `if (!creature.userData._stossV || waterSurface !== null) creature.position.y = baseY + hopOffset;`
  - **`_kreaturSchwimmt` danach auf die integ-probe-Regel umstellen:** schwimmt, wenn `_koerperWasser` über dem Grund
    > max(`schwimmTiefeM`, `_wasserlinie`). Leser sind der Frame-Takt (statt der Inline-Bedingung) und `_kreaturStossSchritt`, dort
    ohne die 50-m-Wand (`nahW`). Dann trägt der Spiegel einen gleitenden Schwimmer in der ganzen Welt.
- **welle-lf-werkstatt** (e4e9cc66) und **welle-lf-v1-ankunft** (ab2dc00b): ohne Konflikt.
- **welle-l-wasser** (af617a45), Kern:
  - `git merge-file` auf vehicle-core.js gegen die Basis cf9a07ba: 0 Konflikte.
  - wasser fügt `FAHR.huelleDichte` 3,0 (relative Dichte des gefluteten Materials) und `exportDrive.huelle.dichte` hinzu.
  - welle-m-impuls fügt `FAHR.masseDichte` 150 kg/m³ (geschlossene Hülle mit Kabinenluft) und die drei Sitz-Zeilen hinzu. Das
    sind zwei Größen, kein Zwilling.
- **Golden-Zeilen:** welle-m-impuls bewegt KEINE (spec/ unberührt; die FAHR-Zeilen stehen nicht in exportDrive, seatRow ist
  byte-gleich). wasser bewegt in v1 recipes.json eine Zeile (exportDrive.huelle.dichte) und in v1 manifest.json eine Zeile. Der
  Integrator prägt nach dem letzten Merge EINMAL neu.
