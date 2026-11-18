# NACHTRAG zu welle-2-3 — Urteil über die zweite Spike-Runde (Richter, main 18058dba, nur gelesen)

Gelesen habe ich alle vier Blätter ganz, dazu verwandtschaft.cjs ganz, die Mess-Teile von luftwasser.cjs und wuchsformen.cjs,
foundry-core.js :1234–1246, :8370–8395, :8520–8565 und :8632–8714 sowie Karte 2 wörtlich (`git show origin/koordination:vision/
meisterkarte-2.json`, byte-gleich zu mk2.json) für stammbaum, muster, tiere.arten, tiere.bewegung, tiere.lebenszyklus und
pflanzen.arten.

Gefahren habe ich alle vier Skripte selbst, nacheinander. Die Ausgaben stehen in `spike2/richter/*.out`, und jede ist BYTE-GLEICH zur
Referenz, wenn man die Zeit-Zeilen herausnimmt (diff leer):
- verwandtschaft 99 s (über der 60-s-Grenze, Laufzeit im Skript 97,1 s)
- landbauplan 57 s
- luftwasser 5 s (fischSchritt 10⁴ hier 13,80 ms statt 33,25 ms, lastabhängig, beide über dem Deckel 7,36 ms)
- wuchsformen 27 s

Dazu drei eigene Proben im Scratch (`spike2/richter/`). Sie lesen die Kerne wie die Spikes, ohne Zweit-Modell:
- `wahrnehmung.cjs` (35 s) setzt Teile von verwandtschaft.cjs wörtlich zusammen und legt einen Lese-Fehler darüber.
  Anker: DAS 56,3/55,0/57,3/59,0 %, Brown 11 49,7/48,7/46,0/50,7 %, also gleich der Tafel des Spikes.
- `hebel.cjs` (43 s) prüft dasselbe mit mehr sichtbaren Zeichen.
- `kette.cjs` ruft den ECHTEN `__tierFeld`/`__feldWert` (fadenScope OFEN_KERNE) an einer geraden Kugel-Kette.

## 1. WAS TRÄGT / WAS FÄLLT — je Spike mit der Zahl

### 1.1 verwandtschaft — TRÄGT KNAPP am Merkmal. FÄLLT an der Wahrnehmung. stammbaum#1 ist nicht versprochen
TRÄGT (nachgefahren): der Anker (rf.cjs 0,71/0,57/0,43) · Ursache 1, die Stichprobe (innen/Blatt 0,920 an der Kronen-Klade 10
gegen 0,616 bei rf.cjs) · Ursache 2, der Fast-Stern bei 10³/10⁶ (0,108/0,128) · Gegenproben 0 % · Colless 0,1350, E0 200/200 ·
Je-Achse-Raten ohne Wirkung (50 → 50 %), OU schädlich (14 %) · DAS in 4 von 4 Sätzen p50 0,29.

FÄLLT bzw. ist widerlegt (eigene Proben):
- **Das Mittel trägt nicht.** Das mittlere RF von DAS ist 0,334–0,339 > 0,3, selbst bei vollkommener Wahrnehmung. Die Sprosse
  trägt also nur in der Lesart „Median ≤ 0,3 an Kronen-Kladen von genau 10“. Die Karte sagt nur „Robinson-Foulds ≤ 0,3“ und
  „10 Arten mit gemeinsamem Ahn“, die Lesart setzt der Schöpfer. Gemessen ist das am bequemsten der möglichen Fälle.
- **Die Wahrnehmung reißt die Marge.** Mein Modell (gewählt): jede stetige Achse wird mit dem Fehler N(0, s) gelesen, s in Klade-SD;
  jedes Wort wird mit der Wahrscheinlichkeit p falsch gelesen. Gezählt sind 1 200 Kronen-Kladen.
  - Anteil ≤ 0,3 bei s 0 / 0,1 / 0,2 / 0,3 / 0,5: 56,9 / 55,2 / 50,5 / 46,0 / 31,4 %.
  - Bei p 0,05 / 0,1: 53,6 / 50,3 %.
  - Bei s 0,2 zusammen mit p 0,05: 48,7–50,0 % (zwei Rausch-Ströme), p50 0,43.
  - Folge: #1 hält nur, wenn der Bild-Deskriptor jede Achse auf ≤ 0,2 Klade-SD genau liest. Ob er das kann, ist nicht gelaufen;
    die erste Runde maß r am Bild unter r am Merkmal.
- **Der Hebel ist die Zahl der unabhängigen Zeichen, nicht das Gesetz** (hebel.cjs, unter s 0,2 / p 0,05), Anteil ≤ 0,3 (Mittel):
  12 Achsen + 6 Wörter 48,7 % (0,374) · 12 + 12 Wörter 56,4 % (0,340) · 12 + 24 Wörter 63,9 % (0,302) · 24 Achsen + 6 Wörter
  79,0 % (0,237). Unabhängigkeit der Achsen ist angenommen; die Allometrie senkt die wirksame Zahl (nicht gelaufen).
- Der Mantel (stammbaum#4) fällt nicht: 0,329–0,489.

### 1.2 landbauplan — TRÄGT BEDINGT. Die Wurzel ist am echten Kern bestätigt, die Bedingung ist ungebaut
TRÄGT (nachgefahren, byte-gleich): Rumpf max 9,6 · Bein 10,0 · Pfote 0,7 · Ohr 6,9 · Kopf 14,0 mm · Mischung mit 3 Knoten p95 ≤ 4,3 /
max ≤ 16,3 mm (Runde 1: 362) · Halb-Form Wolf|Hirsch 1 Komponente, Durchdringen 0,0 · Pferd baut als Einhuf über spreiz 0.
- **Die Wurzel ist bestätigt** (kette.cjs, der echte `__tierFeld`, r 0,05 H, L 0,30 H, vox/blend aus TIER_HAUT; r und L gewählt).
  Röhre ÷ r bei n = 4/6/8/10/12/16 Gliedern: 0,837 (Taille 0,59) / 0,996 / 1,087 / 1,155 / 1,207 / 1,281; bei r 0,035 H 0,526 → 1,349.
  - Das smin (:8706–8707) ist nicht idempotent, denn smin(a,a) = a − blend/4. Dichte bläht auf, und spärliche Ketten tragen Perlen
    (n 4: Taille 0,59 r).
  - Neutral ist allein Abstand/Radius ≈ 1,2. Eine feste Gliederzahl trifft das nie für alle Arten. Die Kettenröhre ist damit der
    Schnitt an der Wurzel, nicht ein Pflaster.

FÄLLT bzw. ist widerlegt:
- **„Mindestzahl 1“ ist eine Bedingung, keine Messung.** Ohne Röhre liegen 4 von 8 Hals/Rute-Werten über dem Soll: Wolf-Hals p95
  11,7 · Bär-Hals p95 15,1 · Bär-Rute p95 22,3 / max 23,0 · Hirsch-Rute p95 14,0.
- **„Ohne Röhre sind es 2“ ist ungemessen und passt nicht zu main.** main springt im Hals 4/6/4/11 und in der Rute 8/10/2/3.
  „Kurz-dicht Bär/Wolf, lang Hirsch/Fuchs“ trifft weder die Rute (Bär 2, Hirsch 3) noch den Hals (Hirsch 11). Die Zeile fällt.
- Der Treue-Maßstab „gegen main“ an Hals und Rute misst gegen eine aufgeblähte Referenz: der Hirsch-Hals von main mit 11 Gliedern
  ist selbst ~1,18 r. Der Soll von R2 heißt deshalb Röhre = Entwurfs-Radius, unabhängig von n. Die Silhouette von main hält T1 über
  den nun freien Radius.
- Gewählt sind: Soll p95 ≤ 5 / max ≤ 20 mm (das Spike-Soll; R1 von welle-2-3 hatte F1 max ≤ 2), die Ohr-Platzhalter und K = 5.
- Die Halb-Form „mittig“ (66,6/66,3 mm) gilt per Bau der linearen Mischung. Sie zeigt nur, dass sie nicht zu einem Elternteil
  kollabiert.
- Die Simplex-Innenpunkte (Wolf|Bär|Hirsch) sind nicht gelaufen.

### 1.3 luftwasser — TRÄGT für die Luft, mit Auflage für das Wasser. Allein fällt keine Sprosse
TRÄGT (nachgefahren, byte-gleich):
- Budget: L0 ≤ 21 836, L1 ≤ 4 112.
- Die Haut ist geschlossen.
- Der Bruch ist beim Namen bestätigt (`__tierPrims` :8561, `if (minHalb < TIER_HAUT.minVox * vox) return;`):
  - vox wächst mit H, also urteilt minVox je ART;
  - Adler ↔ Albatros max 316,4 mm.
- Mit E6/E7 ist der Satz fest; die Haut-Mischung liegt dann bei p95 0,5 / max 8,3 mm.
- Die Masse aus dem Volumen ist nicht tautologisch: Hering ×0,89, Thun ×0,87, Aal ×2,08.
- Pennycuick gegen den Kern: schlagHz 12 für jeden Vogel (:2392) und 2,5 für jeden Fisch (:2832), live gegrept.

FÄLLT bzw. ist widerlegt:
- „Dünne Primitive mischen 0,0 mm“ gilt per Bau. Die Stationen sind affin im Punkt der Vorlage (duennePunkte, luftwasser.cjs:756);
  gemessen ist allein die Haut-Zahl (0,5/8,3).
- **Die Frequenz-Richter laufen im Zirkel.** `schlagHz` = Pennycuick (Luft) bzw. Strouhal mit St 0,3 (Wasser, gewählt):
  - bewegung#3 („Frequenz gegen Pennycuick“) und die Tiefe „Strouhal 0,2–0,4“ von bewegung#2 fielen per Bau, wie Colless bei
    β = −1: erlaubt als Konsum-Beweis, kein Beweis über die Welt.
  - Ebenso „Schlankheit ↔ Reisetempo“ (arten#3), solange das Tempo aus `schlank` gerechnet wird.
  - Die Hüllkurve „k aus der Schwimmweise“ ist eine Zuweisung. Sie muss eine Funktion der Körperform werden (bewegung#3: „die Weise
    folgt dem Leib, nicht einer Zuweisung“).
- Allein fällt keine Sprosse:
  - arten#2 braucht Feder/Schuppe (E2 leer), Geschlecht, Narbe und das Panel.
  - bewegung#2 braucht einen Laufvogel.
  - bewegung#3 braucht 5 Schwimmweisen samt Rückstoß und Flossenflug.

### 1.4 wuchsformen — der Bau TRÄGT. Die Erkennungs-Zahl ist zur Hälfte Konstruktion
TRÄGT (nachgefahren, byte-gleich): die Kopie entsteht zur Laufzeit aus dem Repo, jede Ersetzung trifft genau einmal
(wuchsformen.cjs:62, :137), ohne `gesetz` 6/6 sha1-gleich · drei Gesetze bauen mit 0 Fehlern · 4 heutige Formen 28/28 am Netz ·
q-Achse stetig (S 0,54 → 2,23) · Strauch ↔ Sukkulente stetig in Dicke und Blatt.
- addMerged :1236–1242 schluckt den Wurf still (gelesen: `catch (e) { merged = null; } if (!merged) return;`). Das ist fail-soft, ein
  Bruch der GOLDENEN DEFINITION.

FÄLLT bzw. ist widerlegt:
- **Die Gesetz-Arten sind von Hand geformt, nicht gezogen.**
  - q um −0,9, tDry 60–300 d und das Moos sind je Form gesetzt (wuchsformen.cjs:295–331).
  - Der Netz-Richter urteilt sie an derselben Größe, die das Gesetz einstellt: der Kletterer an S = H/H_krit, das Moos an
    H < 15 cm und B/H ≥ 3 (R 15–35 cm gesetzt).
  - 7/8 und 10/10 sind deshalb Konsum (die Größe überlebt den Bau), kein Form-Urteil. Dass 4 Gras-Arten als Moos gelesen werden,
    zeigt die fehlende Trennkraft.
- **Die 85 % hängen an einer Tabelle.**
  - Die Mischung n je Wurzel (22/13/20/20/15/10 + 8/12/10, :247–252) ist gewählt; die Sprosse sagt „keine Tabelle“.
  - Gerechnet aus den Raten: ohne Sukkulente 98/108 = 90,7 %. ≥ 90 % hält nur bei einem Sukkulenten-Anteil ≤ 1,3 %.
  - Gleichgewichtet über 7 Formen sind es 82,0 %.
  - Die Zahl gilt erst mit der Mischung aus dem Merkmalsraum.
- **`pflanzenWurzel(m) → "kletter"|"sukkulent"` bricht welle-2-3 §2**, wonach ein Bauplan nie aus Merkmals-Schwellen geurteilt wird.
  Der Spike selbst misst beide Übergänge als STETIG (q, tDry). Kletterer und Sukkulente sind darum Gesetze auf stetigen Achsen der
  Holz-Wurzeln, keine Wurzeln. Moos bleibt eine Wurzel, ein eigenes Bauplan-Wort (Bryophyt, H_kap).
- Sukkulente 4/12, Täter (b) unbenannt. Moos 4 608 > 3 800. Kraut 1/10 (aType 3 fehlt).

## 2. EINTRITT in den Entscheid §1 und in welle-2-3 §2 (EINE Quelle, die Gattungs-Kerne lesen nur)
- **leben-core.js, S1 (Welle 3):**
  - `LEBEN_GESETZ.sicht` (12 stetige Achsen + 6 Wörter, K 3, wortRate [1/350; 0,1], gewählt) und `artWoerter(same, adr)`. Sie kosten
    0 Byte; Spaltung, Alter und ln M bleiben byte-gleich.
  - Dazu `achsen` += `streckung` (nur luft) und `schlank` (nur wasser).
  - `bauplanAn(knoten)` als benanntes Ereignis an einem Spaltknoten; Medium-Wechsel und Moos sind Bauplan-Wörter.
  - Der Entscheid §1.1 wächst NICHT in Welle 1. B1 bleibt eingefroren.
- **tetrapoda-core.js:**
  - T1 (Welle 2): `TIER_BAUPLAN` Hals 12 / Rute 10, `bein.huf/spreiz`, `kopf.ohr{…}`, die Fänge stetig, `jawLen` stetig. EINE Vorlage
    statt hund/bär/hirsch.
  - LW2 (Welle 3): `TIER_BAUPLAN.luft/wasser`, `luftPunkt`/`wasserPunkt`, `schlagHz` als Funktion, die Hüllkurve k(schlank).
  - T5: `artGestalt` liest den Art-Punkt; die Regionen sind ton(basis, wort).
- **foundry-core.js:**
  - R1: der Radius im Rahmen + E7 als Satz-Regel „minVox urteilt an der VORLAGE, nie an der Art“. Damit gilt die Voraussetzung von
    `__tierRaumTafel` (Fuchs: 1 Primitiv ohne Partner, Vögel 6/14).
  - R2: `__kettenRoehre` ersetzt das Glied-für-Glied-smin von Hals und Rute.
  - LW1: E6 `__flaeche` (nie in der Haut) + E5.
  - P2: addMerged fail-closed.
- **phyto-core.js, P1b:** `hKrit`, `stuetz`, `speicher`, `moos` als Kern-API. q und Speicher (V/A) sind erbliche stetige Achsen des
  Pfads (θ aus dem Klima nach Entscheid §6). Der Richter liest nie m.
- **Was zusätzlich beim Namen fällt:** `pfote:'zehe'|'sohle'|'huf'`, `ohrForm`, `fangF > 0.1`, `Math.round(A.schwanz.segs)`,
  `Math.ceil(nLen` (T1) · `schlagHz: 12` und `2.5` (LW2) · die Oktaeder-Pools in kreatur-fauna.js (LW3) · `artGewichte` im Art-Pfad
  (T5) · das polynomiale smin der Ketten (R2) · das stille `catch` in addMerged (P2) · `pflanzenWurzel → kletter|sukkulent` (nie
  gebaut).

## 3. DIE BAHNEN — neu gefasst, je Datei EIN Strang (Hunk-Besitz in foundry wie R1 ∥ laub-kante in welle-2-3)
- **foundry-core.js:** laub-kante (PRESETS :4729–4760) → **R1** → **R2** → **LW1** → **P2**. Gelandet wird in dieser Folge, jede Bahn
  rebased auf die vorige.
  - **R1 raum-ofen**: Refit-Rahmen :7385–7560 + Satz-Regel E7 in `__tierPrims` :8541–8565; dazu `scripts/diag-tier-anatomie.cjs`.
    - Neu im Stopp: „Partner fehlt 0“ an allen 4 Land-Wurzeln. Mutante „minVox je Art“ → ROT am Namen `__tierPrims`.
    - Land-Güsse byte-gleich, denn die Vorlage IST heute die Gattung.
  - **R2 ketten-haut** (NEU): `__tierFeld` :8649–8714 + `__kettenRoehre`; die Linse in diag-tier-anatomie.cjs erst NACH der Abgabe
    von R1.
    - Stopp: kette.cjs als Linsen-Same, Röhre/r ∈ [0,98; 1,02] für n 4…16 bei r 0,035 und 0,05 H (heute 0,53–1,35).
    - Mutante „smin je Glied“ → ROT am Namen `__kettenRoehre`.
    - Gelandet wird mit T1 im Zug der Welle 2: die Güsse ändern sich EINMAL, die Platte wird einmal kalt.
  - **LW1 die-flaeche**: E5 (bakeTierInstance) + E6 (`__tierHaut` :8407ff). Gelandet wird mit LW2 im Zug der Welle 3; ohne
    Erzeuger von `__flaeche` landet E6 nie.
  - **P2 pflanzen-bau**: wie gehabt, dazu die Zeilen für Moos, Kletterer und Sukkulente, Rezept-1 mit Speicher-Achse (N4) und
    addMerged :1234 fail-closed.
- **tetrapoda-core.js:** B3 (W1) → **T1** (W2, verbreitert um die Hunks R1–R8i von landbauplan.cjs) → **LW2** (W3, nach S1) → **T5**
  (W3, + DAS).
- **leben-core.js:** B1 → L1 → **S1** (+ sicht, artWoerter, streckung, schlank, bauplanAn).
- **phyto-core.js:** laub-kante → P1 → **P1b** (+ 3 Gesetze, Täter (b) der Säule beim Namen, Blatt-Kopplung aus dem Wasser-Haushalt
  statt e^(−r/1 cm), Moos ≤ Farn-Zeile).
- **stamm/kreatur-fauna.js:** gehalten von Welle 1 (stamm/kreatur-*) → **LW3 schwarm-leib** (W3, nach T3 und LW2): Fern-Leib mit
  4 Primitiven, fischSchritt in Scheiben.
- **R3** (diag-kreatur-leben.cjs, diag-phyto-tree.cjs, modul-karte): die stammbaum#1-Akte misst ZUERST s am Bild-Deskriptor; der
  Netz-Richter der Pflanzen ist Konsum-Linse, die Sprosse urteilt am Silhouetten-Blindtest mit der Mischung aus `artenAm`.
- **Welle 2:** L1 → T1 ∥ T3 ∥ L2 → L3, mit R2 im selben Zug.
- **Welle 3:** S1 → (LW1 ∥ LW2 ∥ P1b) → (T5 ∥ P2) → (S3 ∥ P3 ∥ LW3) → R3. Gelandet wird einmal.

## 4. DIE NEUEN ZAHLEN
- **Tier-Baupläne für 10² Arten: 3** (Land 1 · Luft 1 · Wasser 1) statt 3 Land + 2 ungemessen.
  - Bedingung für Land 1: R2 hält Röhre/r ∈ [0,98; 1,02]. Ohne R2 bleibt 1 Bauplan mit Hals/Rute über dem Soll (p95 bis 22,3 mm), nie
    „2“.
  - Tafel Land 4,87 MB je Bauplan, ≈ 2,39 MB ohne L0-starr (Hand-Rechnung) gegen 10,55 MB für drei Vorlagen.
  - Luft/Wasser: Pose-Tafel 46/52 KiB. Die Form-Tafel ist nicht gerechnet.
  - Die Flossen brauchen Knoten (p95 21–39 mm affin).
- **Pflanzen für arten#2: 7 Wuchsformen** aus 8 Wurzeln (laub, nadel, strauch, gras, kraut, farn, röhricht, moos) + 2 Gesetzen auf
  stetigen Achsen (Stütz → Kletterer, Speicher → Sukkulente).
  - Heute baut der Kern 4/7, die Kopie 7/7.
  - Am Netz 85 % (102/120) bei gewählter Mischung, Sukkulente 4/12.
  - Gefordert sind ≥ 90 % am Blindtest.

## 5. BILDPAAR main ↔ Kopf und die Sprossen, je tragendem Gesetz (an den Richtern der Karte geprüft)
- **EIN Land-Bauplan + Kettenröhre (T1 + R2, Welle 2).** Werkbank am Messort tiere.mensch#1, Mittag, gleiche Saat.
  - (a) Das Wolfsrudel am Waldrand, Third 15 m, und die Hirsch-Herde, Third 20 m seitlich.
    - SEHEN: Silhouetten wie in main, Hals und Rute als glatte Röhre ohne Perlen und ohne Aufblähung, Pfote und Ohr unverändert.
    - Zahl: Treue je Teil am Spiel-Guss p95 ≤ 5 mm; Meshes 255; Tris, dc und VRAM am Ort unter E.
  - (b) Der Wolf seitlich, Third 10 m, im Übergang Trab → Galopp.
    - Zahl: Fußgleiten ≤ 5 % der Schrittlänge, Gangwechsel bei Froude der Natur ±10 %.
  - Sprosse: **leben.tiere.bewegung#1** KANN fallen. Ihr Richter: „Fußgleiten und Gangwechsel aus der Third-Aufnahme im Fenster“,
    Umfang „1 Bauplan, 4 Gattungen, 10–300 kg“.
  - lebenszyklus#2 bleibt bei Welle 2. Fällt NICHT: arten#2 (Feder/Schuppe, Geschlecht, Narbe, Panel) und muster#4.
- **Luft und Wasser (LW1–LW3, Welle 3).**
  - (a) Vögel über der Spawn-Wiese, Third 20 m, 30° aufwärts.
    - SEHEN: der Spatz mit schnellem Schlag neben dem Greif mit breitem Flügel und langsamem Schlag, kein Klumpen am Arm.
  - (b) Das Gewässer am Spawn, Third 6 m schräg.
    - SEHEN: Rücken dunkel, Bauch hell, die Körperwelle wächst zum Schwanz.
    - Zahlen: Schlag-Verhältnis ≥ 3 und Amplitude Schwanz/Kopf ≥ 3. Sie belegen den KONSUM des Gesetzes, nicht die Welt (Zirkel
      §1.3).
  - Sprossen: keine fällt allein (§1.3). Die Linse fängt die Mutanten „E7 aus“ (316 mm) und „schlagHz konstant“.
- **Die Wuchs-Gesetze (P1b + P2 + P3, Welle 3).**
  - Kletterer: Waldrand der Mess-Wiese, Third 12 m. SEHEN: die dünne Achse windet sich am Nachbarstamm hoch und hängt über die
    Krone.
  - Sukkulente: ein Ort mit t_dry ≥ 200 d, Third 8 m. Ob die Erd-Saat einen solchen Ort in Reichweite der Werkbank trägt, ist nicht
    geprüft.
  - Moos: Ego 1,7 m, 2 m vor die Füße.
  - Zahl: Blindtest am Bild über 100 Saaten aus `artenAm`, ≥ 90 %, und Silhouetten-Paare ≥ 95 %.
  - Sprosse: **leben.pflanzen.arten#2** KANN fallen. Ihr Richter: „100 Saaten → Wuchsform-Blindtest; Silhouetten-Paare
    unterscheidbar ≥ 95 %“. Heute 85 % am Netz bei gewählter Mischung.
- **DAS (S1 + T5 + R3, Welle 3).** Werkbank am Spawn-Platz (der Zoo von F, sobald er in main steht), Third 12 m, 1,7 m.
  - Die 10 Arten einer Kronen-Klade stehen in Zufallsordnung. Dazu die Mutante.
  - SEHEN: Schwestern teilen Strümpfe und Rutenspitze.
  - Erster Schritt: s am Bild-Deskriptor messen.
  - Sprosse: **leben.evolution.stammbaum#1** fällt NUR, wenn s ≤ 0,2 gilt UND der Schöpfer die Lesart Median/Kronen-Klade setzt. Das
    Mittel liegt schon ideal bei 0,337. stammbaum#4 fällt nicht.

## 6. SOFORT — ohne eine gehaltene Datei
- **R1 raum-ofen** (wie in welle-2-3, verbreitert um E7). Ob R1 schon fährt, ist nicht geprüft.
- **R2 ketten-haut**, am Kern-Hunk `__tierFeld` :8649–8714.
  - Welle 1 hält foundry-core.js nicht, laub-kante hält nur PRESETS :4729–4760, R1 hält :7385–7560 und :8541–8565.
  - Die Linsen-Datei schreibt R2 erst nach der Abgabe von R1.
  - R2 ist die Bahn, die die Zahl „1 Land-Bauplan“ entscheidet.
- Sonst startet nichts: phyto-core.js und diag-phyto-tree.cjs hält laub-kante; tetrapoda-core.js, leben-core.js und
  stamm/kreatur-*.js hält Welle 1.

## 7. WIDERLEGT (in dieser Runde, beim Namen)
- „DAS trägt stammbaum#1“ ohne Lesart und Wahrnehmung: das Mittel ist 0,337 und reißt bei s 0,2.
- „Mindestzahl ohne Röhre = 2“: ungemessen, und main-Hals/-Rute passen nicht in zwei Klassen.
- „Dünne Primitive mischen 0,0 mm“ als Befund: es gilt per Bau.
- Frequenz-Richter (bewegung#2 St, bewegung#3 Pennycuick, arten#3 Tempo): Zirkel, solange die Größe gesetzt ist.
- „Schwimmweise → k“ als Zuweisung.
- „Kletterer 7/8, Moos 10/10“ als Form-Urteil: das ist Konsum derselben Größe.
- „85 %“ ohne die Mischung aus dem Merkmalsraum.
- `pflanzenWurzel → kletter|sukkulent` (eine Schwelle als Bauplan).
- „E6/E7 in R1 landen“: E6 ohne Erzeuger landet nie, darum LW1.
- „LW3 frei nach Welle 1“: LW3 braucht T3 und LW2.

## 8. OFFEN — ehrlich
- Wahrnehmung am echten Bild nicht gelaufen (s, p). Das Rausch-Modell ist gewählt. Die Lesart von stammbaum#1 setzt der Schöpfer.
- Die Achsen sind als unabhängig angenommen. Der Preis je Form-Achse in der Tafel liegt bei ≈ 0,2 MB je Knoten (4,87 MB / 24,
  gerechnet), Farb-Wörter kosten nur Instanz-Parameter; GPU nicht gelaufen.
- Die Kettenröhre ist nicht gebaut. Gekrümmte Ketten und der Übergang der Röhre in den Rumpf sind nicht gemessen.
- Gelenk-Winkel in Bewegung und Fußgleiten mit der stetigen Pfote: nicht gelaufen.
- Simplex-Innenpunkte der Mischung nicht gelaufen. Maus- und Elefanten-Rute, Rüssel: offen.
- Feder- und Schuppen-Klassen-Haut, Laufvogel, 5 Schwimmweisen, Fern-Leib als Guss, fischSchritt in Scheiben (13,8–33,3 ms gegen
  7,36): nicht gebaut.
- Aal-Querschnitt ×2,08. Flossen-Knoten auf `schlank`: nicht gelaufen. Kamera unter Wasser: ungeprüft.
- Sukkulente: Täter (b) unbenannt. Moos über der Zeile. Kraut ohne Blüten-Gewebe. Kurzrasen ↔ Moos nicht trennbar.
  Wurzel-Mischung aus `artenAm` nicht gelaufen.
- Laufzeit verwandtschaft 97–99 s > 60 s.
- Pflicht-OFFEN unverändert A · B · C · E · F (docs/PFLICHT-OFFEN.md). Status ZWISCHENSTAND.
