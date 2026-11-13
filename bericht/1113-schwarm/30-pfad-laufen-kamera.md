# 30 v1-Pfad Schritt 2: laufen und sehen — der Rig der Third-Kamera springt, wo er gleiten soll

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")
- Ein Bild des EIGENEN Leibs in Third oder Ego am Dorf der Ankunft habe ich heute nicht gesehen. Die Bilder des Tages
  (`scratchpad/dorf-main-0.5.png`, `scratchpad/genom-spiel/gruppe.png`) sind freie Kameras (Pose `-708/39,59/-876,94`,
  `gruppe.abnahme.json:54`), kein Spieler. Was sie für dieses Blatt zeigen: am Dorf steht ein zweigeschossiges weißes Haus
  mit Tür und zwei bis drei Stufen davor (rechts, um x 1610–1700, y 495–515). Dorthin geht der Spieler, sobald er ankommt:
  Tür, Stufe, Innenraum — genau der Gang, der unten rot ist.
- Bild aus der Messung `PM/messung/roh/ec281422-radeon/leib.K3_2-third-0.5.png`: der Spieler klein, rot, mittig unter
  Wasser, die Kamera hinter ihm, Sicht grün-trüb; `leib.K3_2-ego-1.5.png`: Grund und Spiegel von unten. Kein Fehler im Bild.
- Was der Spieler FÜHLT (gemessen, nicht gesehen): im Sprint durch die Haustür zittert die Third-Kamera seitlich —
  Ruck p95 0,035 m je Bild, höchstens 0,865 m in einem Bild (`ec281422-radeon/leib.K4_2.out:123`).

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)
- Der EINE Kamera-Schreiber ist `_loopCamera` (`stamm/koerper-bewegung.js:1786–2160`). Third zu Fuß hat fünf Freiheitsgrade:
  1. Arm (`:2053–2063`): `if (!(arm >= 0) || t <= arm) arm = t;` — jedes Hindernis zieht ihn im SELBEN Bild heran, nur
     hinaus gleitet er (`armRuhe`).
  2. Aufstieg des Drehpunkts (`:1974–1999`) und 3. Schulter (`:2009–2032`): `gleit()` (`:1988–1991`) gleitet nur, wenn
     `frei > alt` — hinein springen beide.
  4. Säule (`_kamSaeule`, `:1973`, `:2207–2248`): tritt bis `PLAYER_WALL_RADIUS` waagrecht aus jeder Strahl-Box —
     ohne jedes Gleiten, Ziel T und lookAt springen mit.
  5. Körper-Höhe: Third liest `player.position.y` starr (`:1926`, `:1970`, `:1997`). Die Treppen-Glättung
     (`_smoothBodyY`, SmoothViewOnStairs, `:2089–2121`) lebt NUR im Ego-Zweig; der Rig-Wechsel nullt sie (`:1867`).
     Das ist die Klasse aus F1 („Zustand, den nur ein Modus schreibt", `GED/spieler-uebergaenge.md:16–20`).
- Das Gesetzbuch KANN: `koerper-core.js:711` `kamera: { armRadiusM: 0.3, armRuhe: 0.0016 }` — zwei Zahlen. Der Fahr-Rig im
  Kern (`vehicle-core.js:3206` `posEase 0.0016`, `chaseKamera` mit Feder und Dämpfer) trägt Ort, Azimut, Elevation und FOV
  als Gesetz. Die Fuß-Kamera konsumiert vom Kern nur Radius und Ruhe; Schulter 0,6 m, Spielraum 0,05 m, Übergang
  (`:2652`, `:2656`, `:2660`) sind Stamm-Konstanten. Die Meisterkarte nennt den Hebel selbst: „Die Kamera zu Fuß: EIN Rig
  wie in Fahrt … Glättung wie chaseKamera" (`PM/src/g5.js:277`, leib.K4+1, v1).
- Der Ruck ist ROT seit 26.10. (`scripts/diag-kamera-laub.cjs:37`); w18-kamera-haus (96dad1b8, 07.11.) senkte ihn
  0,060 → 0,034–0,046 und schreibt „Offen: Ruck Sprint > 0,02". Heute am ec281422 (Radeon, echter Takt mit festem
  Takt-Muster `__MUSTER`, `diag-kamera-laub.cjs:735–749`, also lastfrei): stamm 0,0018 · fels 0,0018 · haus 0,0064 ·
  innen 0,0111 · **innen-sprint 0,0350** · steil 0,0034 · steil-sprint 0,0035 m (`leib.K4_2.out:119–125`). Nur der
  Sprint im Haus reißt. Der Sprinter kommt dabei nur bis 2 m an den Anker (Gehen 0,43 m, `:122–123`).
- Die Linse misst den Ruck auf `Kamera − Leib` (`diag-kamera-laub.cjs:746`): ein starr mitspringender Rig auf der Stufe
  (Freiheitsgrad 5) ist für sie unsichtbar.
- leib.K1 (Latenz, Soll p95 ≤ 50 ms): heute ROT am ec281422 — ego/gehen 76,1 · third/gehen 92,5 ms (`leib.K1_1.out:12–16`),
  aber bei Bild 49,4 ms (die Fahrt lief neben der CI). Über alle Läufe folgt das Urteil der Bildzeit: GRÜN bei Bild
  16,4–17,7 ms (eeaff9d6, ea07267e, e7a28b06), ROT bei 20,4–49,4 ms (fe57747a, ed7d3d23, ef5863a3, f46b9e81, ec281422).
  Seit n 50 → n 15 je Reihe ist p95 = Höchstwert (`haenger-linse.cjs:1311`): ein Ausreißer genügt (ego/wechsel 228,9 und
  236,8 ms an der GTX, `fe57747a-gtx`, `ed7d3d23-gtx`). Das ist eine Frage der Last, kein Code-Bruch.
- K6 auf der GTX 1050 (`gate:kamera-leib:echt`, `package.json:120`): ROT 17:53 nach GRÜN 17:44 am selben Baum mit
  „DIE WELT STEHT NICHT nach 3757 Takten: Fege-Takt nahWiese wartet, nahStreu wartet" (`KO/FUND-REGISTER.md:246`). Den
  Wurf macht die Vorbedingung `__weltStehtNach` (`scripts/lib/welt-boot.cjs:302–325`, gerufen in
  `diag-kamera-laub.cjs:294`), nicht das Maß des Leibs (`strafeMass`, `:249`). Kein Kamera-Befund.

## Die EINE begrenzende Entscheidung
Der Fuß-Rig springt nie mehr: JEDER Freiheitsgrad (Arm, Aufstieg, Schulter, Säule, Höhe) folgt EINEM Gesetz aus
`koerper-core` `fx.bewegung.kamera`, mit begrenzter Rate in BEIDE Richtungen. Die Sicherheit („nie im Bau") kommt aus dem
Wurf gegen die VORAUSGESAGTE Lage des Leibs (Lage + Tempo × Vorlauf), nicht mehr aus dem Sprung. Der Ritt bleibt bei
`chaseKamera`, byte-alt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)
- **Stufen (alle in einer Welle):**
  1. Gesetz: `koerper-core.js:711` bekommt `vorlaufS` (Vorlauf des Wurfs) und `hineinMs` (höchste Rate hinein) neben
     `armRuhe`; additiv, Golden byte-gleich.
  2. Arm `:2056–2063`: hinein mit `hineinMs × dt` statt `arm = t`; der Wurf `:2053` geht von T zur Wunsch-Lage des
     vorausgesagten Leibs.
  3. `gleit()` `:1988–1991` wird symmetrisch: Aufstieg und Schulter gleiten hinein wie hinaus.
  4. Säule `:1973`: ihr Versatz geht durch dasselbe `gleit` (neuer Zustand `_kamSaeuleV`, genullt im Rig-Wechsel `:1868`).
  5. Höhe: der Tiefpass `_smoothBodyY` (`:2092–2121`) wird EIN Höhen-Glätter für beide Sichten. Third liest ihn in `:1926`,
     `:1970`, `:1997`. Der Reset `:1867` gilt nur noch bei einem Sprung > `CAMERA_STEP_MAX_LAG` (`:2721`).
- **Leser-Liste (wer liest, was sich ändert):**
  - `_kamZiel` → `_fadenkreuzStrahl` (`koerper-bewegung.js:1704`), `stamm/stoff-material.js:3426` (Durchsicht),
    `scripts/diag-ankunft.cjs:1856/1911`, `diag-kamera-laub.cjs:421/759/961`.
  - `_kamArm`: `diag-kamera-laub.cjs:456/486/643` (setzen zurück).
  - `_cameraDesiredY` und `_kamBodenY` (`:1950–1951`): Playtest Pitch-Inversion.
  - `cameraThirdDistance` und `cameraThirdHeight`: `diag-fachwerk-contract.cjs:490`, `speicher-welten.js:3469`.
  - Fahrt: `gate:fahr-leben` T4 (fahrzeug.K4) — der Ritt-Zweig `:1881–1919` und `posEase` `:2059–2060` bleiben unberührt.
  - Durchsicht `uKamZiel` und `uKamNah` (`:1781–1783`).
- **Kosten-Zeile:** gleiche Zahl Feld-Proben je 3rd-Bild (der Wurf ersetzt seine Start-Lage, kommt nicht dazu): Soll
  ≤ Vor-Stand Mittel 35,4 · Median 34 + 4 · höchstens 100 (`diag-kamera-laub.cjs:126`, Urteil `:211`), gemessen in K2.
  Die Bildzeit bleibt ≤ heute, an den Schirm gebunden: fünf Skalare je Bild, keine Welt-Iteration.
- **Kriterien der Meisterkarte:**
  - **leib.K4** Ist 1 ↔ Soll 2. Station leib.K4#2: radeon ROT am ec281422 (innen-sprint 0,035 > 0,02); gtx ungemessen
    („GPU-Schloss nie bekommen", a41ce72d, `PM/stand.json:1726`). Staffel 2 braucht beide Geräte.
  - Halten müssen: leib.K4#1 (Kugel 0, Nah-Pixel 0, Ruck ≤ 0,02), leib.K2 (2), fahrzeug.K4 (2, T4).
- **Bildpaar:** am Dorf der Ankunft, das weiße Haus mit den Stufen: Third, Sprint die Stufen hinauf durch die Tür. Je
  sechs Bilder in festem Takt vorher und nachher, dazu die Kamera-Bahn als Zahl. Die Station misst heute an der
  Mess-Wiese (`welt-orte messort("wiese")`, `leib.K4_2.out:86`); das Paar kommt vom Ort der Ankunft.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)
- `w18-kamera-haus` 96dad1b8 und `leib-k4-kamera-bau` 74f445e9 sind gelandet (0 vor main). Kein offener Zweig trägt den Rig.
- Bis zur Landung fehlt alles aus den Stufen 1–5 und das Bildpaar. Die Linse steht schon: `gate:kamera-leib` Teil gang2
  (`package.json:119`) fährt innen-sprint lastfrei. Kein neuer Apparat.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)
- Welcher der fünf Freiheitsgrade die 0,035 m trägt, ist NICHT gemessen (die Linse zerlegt den Ruck nicht). Kandidaten
  nach Code: der sofortige Arm (`:2057`) und die Säule ohne Gleiten (`:2207`).
- Freiheitsgrad 5 (Höhe in Third) ist eine Lesung des Codes. Die Linse ist dafür blind (sie misst relativ zum Leib), kein
  Bild gesehen. Prüfen im Bildpaar an den Stufen des Hauses.
- Risiko der Entscheidung: hinein zu gleiten kann die Kugel in den Bau tragen; der Vorlauf muss das auffangen.
  K4#1 „Kugel 0 von 1090 Bildern" ist der Richter.
- leib.K1 (−2 in der Buchung) und K6 auf der GTX 1050 sind Last bzw. Einschwingen, kein Code dieses Bereichs; den Ort
  ihrer Heilung (Referenzfahrt, die Frist von `__weltStehtNach`) habe ich nicht gelesen.
- Ungelesen: `stamm/gelaende-kollision.js` über die Methoden-Liste hinaus, `koerper-leib.js`, die Spur F2–F6 im Code.

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)
Wirkung 3 (fühlbar beim ersten Gang ins Haus am Dorf, +1 leib.K4 nach Messung an beiden Geräten) · Aufwand M
(fünf Stellen in `_loopCamera`, zwei Zahlen im Kern) · Risiko: eine zu langsame Rate hinein trägt die Kugel in die Wand —
der Vorlauf und K4#1 halten das.
