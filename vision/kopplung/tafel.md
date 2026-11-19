# DIE TAFEL DER KOPPLUNG — Zensus über acht Lese-Blätter

Stand: Arbeitszweig = main-Kopf b7ed841 (18058dba + 9 Versions-Stufen); `origin/koordination` 9102d555a.

Grundlage:
- die acht Blätter `vision/kopplung/lesen-{feuer,wetter,wasser,stoff,pflanzen,wesen,gitter-uhr,richter}.md`;
- `git show origin/koordination:vision/meisterkarte-2.json`;
- die Station `git show origin/koordination:meisterkarte-quelle/punkte/stationen/g1.js` (im Blatt als `k:g1.js`);
- die Messungen unter `origin/koordination:meisterkarte-quelle/punkte/messung/` (im Blatt als `km:<sha>-<gerät>.json`).

Schreibweise:
- Pfade ohne Ordner liegen in `stamm/`; die Kerne (`*-core.js`), `voxel-worker.js` und `welt-licht.js` liegen im Wurzelverzeichnis.
- Zahlen aus den Proben eines Blatts tragen den Namen des Blatts. Die Tafel selbst ließ nur Zähl- und Grep-Proben laufen (siehe 0).

## 0. Was für diese Tafel lief und was nicht

Gelaufen (headless, jeweils unter 2 s):
- `node /tmp/claude-0/-home-user-AnazhRealm/d169edf0-889e-5d2b-b305-7451b621a8b7/scratchpad/tafel/register.cjs`
  - das Register der Deduplizierung;
  - prüft, dass jede der 291 Blatt-Zeilen einem Schlüssel zugeordnet ist und kein Schlüssel unbenutzt bleibt;
  - Ergebnis: Rohzeilen 291, Größen 224 (Zahlen in 1.1).
- `git merge-base --is-ancestor ea884aa6f <sha>` für die gemessenen Köpfe:
  - d39e0d6e: nein;
  - 1f300260, 18058dba, b7ed8419: ja.
- Die Radeon-Messungen in `km:` wurden durchgesehen:
  - genau eine Radeon-Messung liegt nach ea884aa6f: `km:21f279f5-radeon.json`;
  - sie trägt `kaskade` nicht (Treffer 0).
- Grep über `stamm/` und die Kerne im Wurzelverzeichnis, Treffer in Dateien:
  - je 0 Treffer: `blitz|Blitz`, `Funkenflug`, `Flashover`, `Tsunami`, `Erdbeben`, `Wärmeinsel`, `Düne`, `Kronenfeuer`, `Lahar`, `Aschewolke`, `Panik`, `Evakuier`, `Methan`, `Hangrutsch`, `Feuersturm`, `Erd-Saat|erdSaat`, `Gletscher`, `Asteroid`, `Schneelast`, `Rauchschicht`, `Terraform`;
  - Treffer, aber nur Gen-Zeit oder Bild (als Laufzeit-Kopplung nicht erhoben): `Erosion` (gelaende-core.js:361), `Sediment` (planet-core.js:294), `Ausbruch` (planet-core.js:876), `Einschlag` (Fahrzeug- und Körper-Stöße), `Furt`, `Zipf`, `Ruine`, `Stelzen`;
  - `Regenschatten` hat 1 Treffer, `planet-core.js:1866/2017`.

Nicht gelaufen (keine GPU, kein Fenster):
- die Station `kaskade#1` selbst;
- jede Bild- oder p95-Zahl am Kopf;
- das Bett im Spiel-Ring 4;
- eine Kaskade an der Radeon nach ea884aa6f.

---

## 1. ZÄHLUNG

### 1.0 Die Regel

**FOLGT** gilt in zwei Fällen:
- Die Größe ist ohne eigene freie Zahl hergeleitet: aus Saat, Gelände, Uhr oder anderen Zensus-Größen.
- Sie ist eine Naturkonstante oder ein Literatur-Messwert, die Quelle steht im Code, und die Umrechnung stimmt.

**GESETZT** gilt in diesen Fällen:
- eigene Zahl ohne Anker (Look, Linse, „Erst-Wurf");
- Tafelwert ohne Quelle;
- Raster- oder Takt-Literal;
- Rauschen ohne Gesetz.

Eine Zeile, die eine gesetzte Konstante selbst nennt, zählt GESETZT — außer diese Konstante hat eine eigene Zeile im Register.

**Ohne Einheit** zählt:
- Stellwerte, Klassen, Wörter, Flags und Zähl-Literale.

Nicht zu „ohne Einheit" gehören physikalisch dimensionslose Größen: ecc, WAF, L/B, kg/kg, r, α.

Jede Größe zählt einmal, in der Domäne ihres Schreibers. Deshalb gilt:
- Raster- und Takt-Literale des Brands (`bettGitter`, `schrittS`, `budgetMs` …) zählen unter Gitter/Uhr.
- `lebendig` zählt unter Pflanzen.
- `brenn.*` zählt unter Stoff.
- `naesse` und `_feuchteAt` zählen unter Wasser.
- Die Richter-Domäne zählt nur die Größen der Richter selbst (r1–r19 des Richter-Blatts).

### 1.1 Die Zahlen

| Domäne | n | FOLGT | GESETZT | ohne Einheit | in ≥ 2 Blättern |
|---|---|---|---|---|---|
| Feuer | 33 | 18 | 15 | 8 | 11 |
| Wetter | 24 | 5 | 19 | 16 | 5 |
| Wasser / Boden-Feuchte | 29 | 15 | 14 | 11 | 5 |
| Stoff | 20 | 10 | 10 | 5 | 10 |
| Pflanzen | 19 | 6 | 13 | 18 | 5 |
| Wesen | 23 | 4 | 19 | 13 | 2 |
| Gitter / Uhr | 57 | 2 | 55 | 12 | 11 |
| Richter | 19 | 0 | 19 | 1 | 0 |
| **gesamt** | **224** | **60 (26,8 %)** | **164 (73,2 %)** | **84 (37,5 %)** | **49** |

Zum Vergleich die Summe der Blätter vor der Deduplizierung:
- 291 Zeilen;
- 83 FOLGT, 207 GESETZT, 1 unbestimmt;
- 108 ohne Einheit.

Durch die Deduplizierung fallen 67 Zeilen weg. Die meistgenannten Größen:
- `naesse` steht in 6 Blättern;
- `rain` und `heilDauer` stehen in je 5 Blättern;
- `brenn.sigma`, `brenn.last`, `brenn.tiefe` und `brenn.mx` stehen in je 4 Blättern.

Gitter/Uhr trägt die meisten GESETZT. Nur zwei Uhren folgen:
- die Welt-Uhr `spielZeit` (dirigent-takt.js:48);
- die Kreatur-Zeit (kreatur-verhalten.js:3139).

Alle 28 Raster sind Literale. Die 16-m-Zelle allein steht viermal: feld-leben.js:3078, feld-sprache.js:1420, daten.js:204, stoff-material.js:277–278.

### 1.2 Widersprüchlich bewertete Größen — entschieden am Code

| # | Größe | Bewertung der Blätter | Entscheid | Code |
|---|---|---|---|---|
| 1 | `lebendig` (Brennlast) | Pflanzen F · Feuer, Stoff G | **G** | feld-leben.js:2971–2972 `lambdaLebendig` 200, „Erst-Wurf aus genese-plan §Γ3"; Simplex-Rauschen, kein Bestand |
| 2 | `brenn` σ, last, heiz, mx | Feuer, Richter F · Stoff, Pflanzen G | **F** | bau-vorlagen.js:1553–1555 (Anderson 1982, FM1/FM9 in SI umgerechnet), :1646–1649 |
| 3 | `tZuend` | Feuer F · Stoff G | **F** | bau-vorlagen.js:1562–1563 (Quelle genannt), :1619–1641 |
| 4 | `c` | Feuer F · Stoff G | **F** | bau-vorlagen.js:1562–1565 (ToolBox/CRC) |
| 5 | `L_v` | Feuer F · Stoff G | **F** | bau-vorlagen.js:1644 (2 257 000 J/kg, Naturkonstante) |
| 6 | `mineral` S_T/S_e | Feuer F · Stoff G | **F** | feld-brand.js:890 (Rothermel 1972), :976 |
| 7 | `feuchte.trocken` 0,06 | Feuer G · Richter F | **G** | feld-brand.js:888, :975 — Stellvertreter einer fehlenden Gleichgewichts-Feuchte: Zustand statt Gesetz |
| 8 | `lbMax` 8 | Feuer G · Richter F | **F (unsicher)** | feld-brand.js:891 (Anderson 1983), :977 |
| 9 | `_feuchteAt` | Feuer, Stoff, Pflanzen F · Wasser G | **G** | gelaende-boden.js:3220–3233: `hoeheGewicht` 0,85 „V6 (Look-Finale…)", `flussReichweite` 26, `hoeheNah`/`hoeheFern` 1,5/7 |
| 10 | `naesse` | Feuer, Stoff, Wesen F · Wetter, Wasser, Richter G | **G** | stoff-material.js:3788–3803: `benetzenS` 150 und `verdunstS` 480 ohne Quelle; der Anker „Regen 0,6 nach 10 min 0,91" (:3776–3778) setzt das Gesetz selbst |
| 11 | Brand-Feuchte M | Stoff F · Wasser G | **F** | die Form feld-brand.js:282–285; ihre Koeffizienten haben eigene Zeilen (Nr. 7, `faser`, `nass`) |
| 12 | Luft-Temperatur | Feuer F · Wetter G | **G** | gelaende-core.js:1313–1320 (Funktion von y, Saison, Sicht-Uhr und Wetter; Wolken- und Regen-Abzug gesetzt) |
| 13 | Windrichtung | Wesen F · Wetter G | **G** | phyto-core.js:4305–4306 (Mäander ±41°, gesetzte Wellen) |
| 14 | `timeOfDay` | Gitter F · Wetter G | **G** | bild-himmel.js:2712–2750 (`_uhrSetzen`, ein Regler) |
| 15 | Grün-Kanal der Boden-Karte | Pflanzen unbestimmt | **G** | daten.js:635 `gruenSchwelle` 0,04 = smoothstep(0, 0,04, g − (r+b)/2), eine Farb-Schwelle; Durchreichung voxel-worker.js:671–680 |

Umwertungen nach der Regel, ohne Gegenstimme eines zweiten Blatts:
- Feuer: Rauch-Steigen F → G (T = 300 K fest, feld-brand.js:746).
- Wasser: Grund B F → G (k gesetzt); Schnee-Pegel F → G (`fall` gesetzt).
- Stoff: L und k des Eises G → F (bau-vorlagen.js:1644); Asche-Albedo G → F (Jin & Roy 2005 im Kommentar).
- Pflanzen:
  - Nährstoff → G;
  - Gras-Bedeckung F → G;
  - Kronenlicht der Platzierung F → G;
  - Wald-`sd` F → G;
  - Streu-Dichte F → G;
  - Vergilben F → G (Deckel 0,45).

### 1.3 Widersprüche im Wert zwischen Blättern — geklärt

| Gegensatz | Klärung | Code |
|---|---|---|
| R unter klar 0,074 (Feuer) · 0,076 (Richter) · 0,077 | Verschiedene Last `leb` 0,73 / 0,8 / 1. Unter dem Wind-Deckel hängt R an der Last. | feld-brand.js:302, :330 |
| Erste Nachbarin 79 s (Feuer) · 105 s (Richter, aus 210 s Zellbreite) | Anderer Herd-Ort: Die Feuer-Probe zündet 5,6 m vor dem Rand. Die Station zündet in der Zellmitte (8 m / 0,076 m/s). | k:g1.js:1392, :1586; feld-brand.js:388–412 |
| R im Sturm 1,80 (Feuer) · 2,661 (Richter) · 1,574 | Der Wind-Deckel `min(0,9·I_R, u)` hängt an I_R, also an Last und Feuchte. | feld-brand.js:330 |
| „`_feuchteAt` liest keinen Regen" (Wetter, Feuer, Gitter, Richter, Stoff) · „Regen über den Pegel" (Wasser, Pflanzen) | Der Code gibt den Pegel-Weg. Er wirkt nur am Ufer von See und Fluss, mit einem Hub von höchstens +0,20 m (an der Krone des Betts gekappt; Wasser-Blatt, Pegel-Probe). Fern vom Wasser stimmt „liest keinen Regen". | gelaende-core.js:1627–1631, :7690, :7696–7722; gelaende-boden.js:1554 |
| M-Koeffizient 0,35 · 0,29 × boden | Beides stimmt: 0,29 = `faser` − `trocken` = 0,35 − 0,06. | feld-brand.js:284 |
| Soll „≥ 200 Zellen" (Brief) · „≥ 200 Pixel" (Richter) | **Pixel.** | k:g1.js:1660 (`fB >= 200`, Flammen-Pixel; Zellen nur `>= 1`) |
| Anker des Regens im Wasser-Blatt „4300–4305" | Falsch. Richtig ist phyto-core.js:4287–4293 (`WX_GESETZ`). | phyto-core.js:4287–4293 |
| `ereignis` „heute": JSON 1 · MD 0 | Die Karte ist in sich uneinig. | meisterkarte-2.json; MEISTERKARTE-2.md:5288 |
| Richter-B6: „warum wieder −248/−1080?" | Gelöst, siehe 3.A1. | k:g1.js:1425 |
| Leiter-Belege `same.physik.feuer` (feld-leben.js:2477–2620) und `ereignis` (gelaende-core.js:1787–1801) | **Veraltet (Karte ≠ Code).** Der Brand liegt heute in feld-brand.js:194–339, die Lava in gelaende-core.js:1808–1848. An den alten Zeilen steht der Lava-Index bzw. `pegelHub`. | feld-brand.js:194; gelaende-core.js:1808 |

---

## 2. DIE FLUSS-MATRIX

Die Zeile ist der Geber, die Spalte der Nehmer. Jede Zelle nennt die fließende Größe mit ihrem Leser. **FEHLT** heißt: kein Leser im Spielpfad. **Zwilling** heißt: zwei Quellen derselben Größe.

| Geber ↓ / Nehmer → | Feuer | Wetter | Wasser / Boden-Feuchte | Stoff | Pflanzen | Wesen | Gitter / Uhr | Bild / Klang |
|---|---|---|---|---|---|---|---|---|
| **Feuer** | Ankunft `an` der Nachbarin, feld-brand.js:388–448 | **FEHLT** — kein Plume, keine Wärme ins Temperatur-Feld; die Temperatur ist eine reine Funktion (gelaende-core.js:1313–1355) | **FEHLT** — die Narbe ändert keinen Abfluss; `pegelHub` liest nur PEGEL (gelaende-core.js:1796ff) | Asche als Tat feld-brand.js:575 → Decke `_deckeMalen` siedlung-wege.js:459; Holz und Werk: **FEHLT** | Narbe 0,3 / 72 h / +0,4 `_narbeAt` feld-leben.js:2689–2691 (TAT_NARBE :3102) → Sukzession vegetation-wiese.js:2204; Krone: **FEHLT** | Furcht `_brandGlutUm` feld-brand.js:538–548 → kreatur-furcht.js:87–103; Schaden: **FEHLT** (Rufer von `damagePlayer` nur dirigent-takt.js:1144, feld-dsl.js:1842, kreatur-verhalten.js:1553); Bewohner: **FEHLT** (siedlung-* lesen kein Brand-Feld) | eigener Takt `schrittS` 1 s, feld-brand.js:487–495; Glut-Block 64 m :542 | Flammen ≤ 384 aus ≤ 32 Zellen bis 160 m (feld-brand.js:930–937) → :651; Licht der Ellipse dirigent-kern.js:1806; Ohr cs²·glut klang.js:383 bis 256 m (:917); Rauch :720–764 |
| **Wetter** | Wind `_windAt` → feld-brand.js:321; Nässe → M :284; Temperatur → Q_ig :315. **Zwilling des Orts:** Wetter am Spieler (dirigent-takt.js:1733) gegen Brand am Ort | Wort aus der Front `wetterAt` phyto-core.js:4423 | rain → `naesse` bild-himmel.js:3078–3080; `nassTage` :3076; Pegel `_pegelTakt` :3085. **Zwilling des Regen-Orts:** Klima des Pegels an (0, 0) (wasser-hydro.js:254–255) gegen Wetter am Spieler | Nässe → Shader bild-himmel.js:3082 (poröse Stoffe dunkler); `nassTage` → Werk-Alter siedlung-satz.js:797 | **FEHLT** — Wuchs, Saison und Vergilben lesen kein `weather`, `naesse` oder `_temperaturAt` (Grep über vegetation-*: 0); nur der Halm-Shader liest den Wind (Bild) | Bewohner `regen.ab` koerper-core.js:5218/5341 über `_weatherFieldFor()` ohne Ort (siedlung-bewohner.js:2223); Vögel und Bestäuber `rain` kreatur-fauna.js:42, :624; Gemüt `_weatherIsWet` feld-leben.js:1749; Witterung im Wind koerper-seele.js:1822. **Zwilling:** „Regnet es?" mit 6 Antworten (3.Z9). Herden: **FEHLT** (kreatur-verhalten/-leben: Grep `rain`/`naesse` 0) | Zug 120 s daten.js:170; Übergang 45 s daten.js:143 | Licht `grey`/`sun` phyto-core.js:4288–4293; Wolken `cloudCover` bild-himmel.js:1763; Partikel :1082; Musik klang.js:2058. **Zwilling:** Deckung (3.Z10), Wolke ≠ Front (3.Z14) |
| **Wasser / Boden-Feuchte** | `_feuchteAt` → `boden` feld-brand.js:268, :284; `_nassAt` sperrt :224. **Zwilling:** Stamm gelaende-boden.js:1538–1563 gegen Faden voxel-worker.js:2090–2128 | **FEHLT** — `wetterAt` liest keinen Wasser-Zustand (phyto-core.js:4423–4449), keine Verdunstung | Pegel → Spiegel gelaende-core.js:7690, :7696 | `_feuchteAt` → Werk-Alter siedlung-satz.js:792; Eis-Dicke (Wasser-Blatt) | `_feuchteAt` → Wuchs vegetation-wiese.js:2081, erde-Achse :2370, Streu vegetation-streu.js:19; Regen → Wuchs: **FEHLT** | nicht erhoben (kein Blatt nennt einen Leser von Pegel oder Feuchte in kreatur-*/siedlung-*) | Hydro 128² × 16 m, Ursprung −1024 (gelaende-core.js:6176–6212) | Wasser-Mesh; Neu-Mesh jeden 4. Takt wasser-zellen.js:2494; Pfütze gelaende-boden.js:2509, bild-himmel.js:3058 |
| **Stoff** | `brenn` σ/last/tiefe/heiz/mx (bau-vorlagen.js:1646–1649) über `_stoff(_kontaktStoffAt)` feld-brand.js:244, :302–310; ρ schmiede-core.js:2907 → β feld-brand.js:303. **Zwilling:** Brennbarkeit dreifach (3.Z20) | **FEHLT** — Asche-Albedo und Versiegelung → Temperatur: kein Leser in gelaende-core.js:1313–1355 | Poren `NAESSE.poren` stoff-material.js:3796ff → Shader; `versickern` wirkungslos :2239 | Tag-Verwandter eines eigenen Stoffs bau-buch.js:1561–1570 | Asche Kanal G → Sukzession vegetation-wiese.js:2204, `SUKZESSION` :3188 | Tag `dichte` → Tempo bau-buch.js:2522–2531; `heatResist` → toter Leser koerper-seele.js:317–319 | — | Tag `dichte` → AO stoff-material.js:759; Asche-Farbe dreifach (3.Z24); Schritt-Klang auf Asche = Gras (gelaende-kollision.js:1121–1134 nennt `asche` nie) |
| **Pflanzen** | Last `lebendig` feld-brand.js:222, :302; Art: Grün-Kanal gelaende-kollision.js:1132, Kronen-Streu :1130. **Zwilling dreifach:** `lebendig` / `groundCover` vegetation-wiese.js:172 / Grün-Kanal (3.Z1) | **FEHLT** — keine Verdunstung, kein Albedo-Leser | **FEHLT** — `pegelHub` liest keinen Bewuchs (gelaende-core.js:1792 nur `PEGEL.spende`) | nicht erhoben (Holz-Ernte) | Bodenlicht-Zwilling vegetation-wiese.js:43 / :2490 | Fraß senkt Leben `_depositLife` feld-leben.js:2047–2083; Nahrung `_kreaturNahrung` kreatur-leben.js:2337 (Inhalt nicht gelesen) | `lebendig` hat kein Raster (λ 200 m, feld-leben.js:2972); Overlay auf 16 m | Wiese, Streu und Wald auf eigenen Rastern (daten.js:505–530; vegetation-streu.js:85–87; phyto-core.js:3158) |
| **Wesen** | Fackel kampf.js:2298, :2421–2446; Brennglas koerper-fahrt.js:2294, :3258. Löschen: **FEHLT**. Tritt → Bett: **FEHLT** (`_kontaktStoffAt` fragt `_pfadFeldAt` nie, gelaende-kollision.js:1121–1134) | Spieler-Wort `_setWeather` feld-dsl.js:943 (eine Tat, setzt das EINE Wetter) | Erdbau → Hydro nur über `hydroInit` (gelaende-core.js:2823, :6194); ob ein später gelegter Graben die Seen neu fasst: nicht verifiziert | Bau: Werk-Alter `_werkAlterFaerbe` siedlung-satz.js:913 (Rufer siedlung-instanz.js:1199) | Tritt `TRITT` siedlung-wege.js:2907–2919 → Wiese und Wagen; Rodung als Tat feld-leben.js:2626–2642 | Furcht und Gemüt (intern) | Bestand 50,07 m kreatur-leben.js:3733; Bewohner 5 m siedlung-bewohner.js:3968 | nicht erhoben |
| **Gitter / Uhr** | Welt-Uhr feld-brand.js:486; `schrittS`/`sprungS` :894–895; Budget :914 | Welt-Uhr dirigent-takt.js:1714. **Uhr-Bruch:** die Temperatur liest die Sicht-Uhr (bild-himmel.js:2879) | Pegel 1 s wasser-hydro.js:262; Prozess-Tag 3600 s daten.js:165. **Uhr-Bruch:** der Automat zählt Bilder (wasser-zellen.js:2124, :2191) | Prozess-Tag → Werk-Alter siedlung-satz.js:796 | Zerfall lazy feld-leben.js:2365; Narbe 72 Prozess-h :3102. **Uhr-Bruch:** die Sukzession läuft im Deko-Job (dirigent-takt.js:2179, :2200–2201) | Bestand 10 s kreatur-leben.js:2722. **Uhr-Bruch:** `creatureAnimationTime` (kreatur-verhalten.js:3139) | Jahr 2400 s (dirigent-kern.js:311) gegen Tag 3600 s; Region-Takt 1000 (dirigent-takt.js:189) | Sicht-Uhr bild-himmel.js:2648 |
| **Bild / Klang** | **Umkehr und Zwilling:** Die Bett-Art kommt aus der Boden-Karte des Bilds (`gruenSchwelle` daten.js:635 → voxel-worker.js:671–680 → gelaende-kollision.js:1132) und aus der Wege-Karte (siedlung-wege.js:421–440) | Sicht-Uhr (Regler bild-himmel.js:2712–2750) → Temperatur :2879 | — | — | — | Sicht-Uhr → Bewohner-Stunde siedlung-bewohner.js:2157, Tag-Phase der Tiere kreatur-leben.js:2063 | Der Bild-Takt treibt Wetter-Zug und Kreatur-Zeit (dirigent-takt.js:251); die Welt-Uhr läuft nur im rAF (:48, :426) | — |

### 2.1 Die fehlenden Kopplungen, geordnet nach Wirkung auf das Spiel

| # | Fehlende Kopplung | Wirkung im Spiel | Anker |
|---|---|---|---|
| K1 | Regen/Nässe **je Ort** → Brennstoff- und Boden-Feuchte (statt eines Welt-Skalars und einer Geometrie-Funktion) | Gras brennt nur in 0,0–0,1 % der Welt-Zeit (Wetter-Blatt P2). Regen am Spieler löscht jeden Brand der Welt. Bewölkt trocknet nie. | bild-himmel.js:3078–3080; feld-brand.js:284; gelaende-boden.js:1538–1563 |
| K2 | Pflanzen-Bestand → Brennstoff (Last, Art, Tiefe) als Funktion der Welt statt Bild-Karte und Rauschen | Brennbar ist nur, was um das Auge gebaut ist. Die Last widerspricht dem sichtbaren Gras. Fern liegt nichts im Bett. | feld-brand.js:222, :302; gelaende-kollision.js:1130–1133 |
| K3 | Luftfeuchte, Temperatur und eine trocken-windige Wetter-Lage → trockene Brennstoff-Feuchte | Das Feuer ist entweder windstill (klar, 0,074 m/s) oder nass (jedes Wort mit Wind ≥ 0,3 regnet) — eine Front im Band 0,5–2 m/s gibt es nur im Stub. | feld-brand.js:975 (`trocken` fest); phyto-core.js:4287–4293 |
| K4 | Feuer → Leib (Schaden), Bewohner meiden, Rauch → Nase und Sicht | Die Flamme tut niemandem etwas; Dörfer bleiben stehen; Rauch ist nur Bild. | koerper-seele.js:317–319; siedlung-*: Grep 0; feld-brand.js:720–764 |
| K5 | Feuer → Holz, Bauten, Krone | Häuser und Bäume brennen nicht; ein Stadtbrand ist unmöglich. | Tag `brennbar` bau-vorlagen.js:1769 hat keinen Feuer-Leser; Kronenfeuer: Grep 0 |
| K6 | Regen → Wuchs | Die Pflanze kennt kein Wetter; Dürre und Regenzeit sind unsichtbar im Bewuchs. | vegetation-*: Grep `weather`/`naesse` 0 |
| K7 | Feuer → Wetter (Plume, Feuer-Wind, Wärme) | Kein Feuersturm, kein Rauchturm mit Auftrieb aus dem Feld. | gelaende-core.js:1313–1355 |
| K8 | Feuer → Abfluss (Narbe → Pegel) | Kein Hochwasser nach dem Brand (stoerung#3). | gelaende-core.js:1786–1796 |
| K9 | Relief → Regenschatten am Ort | Luv und Lee regnen gleich; Regenschatten gibt es nur planetar. | phyto-core.js:4423–4449; planet-core.js:2017 |
| K10 | Wetter → Herden suchen Schutz | Tiere stehen im Sturm wie im Sonnenschein (wetter-welt#4). | kreatur-verhalten/-leben: Grep 0 |
| K11 | Wesen löschen Feuer | Kein Eimer, kein Graben als Brandschneise im Gesetz. | `_kontaktStoffAt` gelaende-kollision.js:1121–1134 |
| K12 | Kälte und Hitze am Leib | Die Temperatur trifft nur die Zünd-Wärme. | feld-brand.js:315 |
| K13 | Blitz (Gewitter × Trockenheit → Zündung) | Kein Brand von selbst; 100 Jahre ohne Zutun ergeben 0 Ereignisse (gewalt-Beleg). | Grep `Blitz`: 0 |
| K14 | Temperatur → Schnee | Der Schnee-Pegel folgt einem gesetzten `fall`. | Wasser-Blatt |
| K15 | Jahreszeit → Wetter | Die Front kennt keine Saison. | phyto-core.js:4423–4449 (Parameter: saat, x, z, t, ort) |
| K16 | Tritt → Bett | Ein Trampelpfad ist keine Brandschneise. | gelaende-kollision.js:1121–1134 |

---

## 3. DIE BRÜCHE BEIM NAMEN

### WARUM BREITET SICH FEUER NICHT AUS

Zwei Ebenen sind zu trennen:
- **(A)** Warum die Station ROT ist.
- **(B)** Warum die Welt-Physik keine Ausbreitung trägt, die der Spieler sieht.

Die Korrektur des Richter-Blatts gilt. `kaskade#1` urteilt in k:g1.js:1660 nach dieser Bedingung:

> `hw && e.trockenS >= 60 && e.brennt.zellen >= 1 && e.brennt.flammenListe >= 1 && fB >= 200 && e.regenS <= 60 && e.nachRegen === 0 && e.erloschen.zellen === 0 && fC <= 20`

Daraus folgt:
- Die 200 sind warme Flammen-PIXEL, keine Zellen.
- „≥ 200 Zellen in 60 s" wäre 51 200 m². Das verlangt einen Kopf von 3,7–12 m/s (Ellipse) oder 2,13 m/s in jede Richtung (Kreis, r = 127,7 m in 60 s).
- Das trägt keine Gras-Physik; die CSIRO-Formel gibt 0,23 m/s bei 1,44 m/s Wind (Richter-Blatt 5.b).

#### (A) Die Station — der Herd-Filter ist tot

| # | Täter | Zahl | Anker |
|---|---|---|---|
| **A1** | **Der Bett-Filter der Station liest einen alten Vertrag.** Die Station rechnet den Anteil als `f.leb / auraAt(...).lebendig`. Seit ea884aa6f („die Maske nur an der Bett-Kante") gibt `_brandStoff` die Last GANZ zurück (`leb = auraAt(x, z).lebendig` an der Zellmitte) und den Anteil im eigenen Feld `anteil: n / N`. Die Station fragt `auraAt` an derselben Zellmitte (`xz` k:g1.js:1392). Der Quotient ist deshalb immer genau 1, und `BETT_VOLL` 0,99 filtert nichts. Der Herd fällt auf die erste Gras-Zelle der Ring-Folge. Das ist −248/−1080, die Kies-Zelle mit Anteil 0,2 (eigener Kommentar k:g1.js:1420–1423). Die Flammen stehen nur auf der Bett-Maske (feld-brand.js:229–231). | Herd −248,−1080 mit „Bett 1": `km:18058dba-gtx.json` gibt +35 px bei 4 Flammen, `km:1f300260-gtx.json` gibt +24 px bei 4 Flammen. Soll ≥ 200 px. | k:g1.js:1424–1425, :1430, :1438; feld-brand.js:222, :256–262 |
| A2 | Das ROT ist nicht an die GTX gebunden. Das letzte GRÜN der Radeon liegt VOR ea884aa6f: `km:d39e0d6e-radeon.json` mit Herd −248,−1064, +261 px und 32 Flammen. ea884aa6f ist kein Vorfahr von d39e0d6e, aber Vorfahr von 1f300260, 18058dba und b7ed8419. Die einzige Radeon-Messung danach (`km:21f279f5-radeon.json`) trägt die Kaskade nicht. | Radeon nach ea884aa6f: Kaskade **nicht gemessen** | `git merge-base --is-ancestor` (siehe 0) |
| A3 | Das Trocken-Glied prüft Existenz: `zellen >= 1` erfüllt der Herd allein. Unter `sunny` (k:g1.js:1395–1398) erreicht die Front von der Zellmitte den Rand nach 8 m / 0,076 m/s ≈ 105 s, also nach den 60 s. „Hält im Trockenen" kann deshalb nicht reißen, und eine zweite Zelle prüft keine Roh-Zeile. | 105 s > 60 s | k:g1.js:1587, :1660 |
| A4 | Die Uhr der Station ist nicht die Uhr des Spiels. In der Trocken-Phase tickt nur `_tickBrand`; Spiel-Schleife, `_naesseTakt` und Wetter-Zug laufen nicht. Der Regen läuft in der vollen Schleife, aber mit 1 s Spielzeit je Bild. | 60 s / 300 s Schritte | k:g1.js:1400–1403, :1596 |

#### (B) Die Welt-Physik — die Befunde (i)–(v), geprüft und präzisiert

| # | Befund | Präzisiert (Zahl) | Anker |
|---|---|---|---|
| **B1 (i)** | **Das Tempo unter klar.** U₁₀ ist der Stellwert `WX_GESETZ.klar.wind` 0,06 × `sturmMS` 24 = 1,44 m/s; dazu kommen `_windWob` (±18 %) und die Form. Auf Flammenhöhe (WAF 0,386 aus der Tiefe 0,42 m) bleiben ≈ 0,48 m/s. Daraus folgt R = 0,074–0,077 m/s, je nach Last. | Die erste Nachbarin brennt nach 79,3 s (Herd 5,6 m vom Rand, Feuer-Probe) bzw. nach ≈ 105 s (Zellmitte, Station). Brennende Zellen nach 60 / 300 / 3 600 s: 1 / 6 / 44 (+62 Asche) (Feuer-Blatt). CSIRO ergibt bei gleichem Wind 0,23 m/s (Richter-Blatt). Der Code liegt unter klar also beim Faktor 0,33. ρ_p gras 350 → 513 kg/m³ macht das Feuer LANGSAMER (0,030 m/s windstill, Stoff-Probe); ρ_p ist also nicht der Grund. Der Wind-Kanal hieß „Böen-Amplitude" (daten.js:105–108): ein Look-Stellwert treibt das Tempo. | phyto-core.js:4288, :4318; stoff-material.js:239–240; feld-brand.js:321–338, :388–448 |
| **B2 (iv)** | **Kein Wetter-Wort ist trocken UND windig.** | Jedes Wort mit `wind` ≥ 0,3 trägt `rain` ≥ 0,12, also über `regenAb` 0,05. Der stärkste trockene Wind ist nebel mit 0,1 → 2,4 m/s → R ≈ 0,144 m/s. Unter bewölkt erstickt Gras nach 30,4 s (Wetter-Blatt P1). | phyto-core.js:4287–4293; stoff-material.js:3789 |
| **B3 (iii)** | **Die Nässe ist EIN Skalar der Welt, ohne Ort und ohne Himmels-Sicht.** Ihr Ziel ist binär: `rain > regenAb` ergibt 1, sonst 0. Der Regen am Spieler löscht jeden Brand der Welt. | Regen erstickt Gras nach 6,1 s (Station 7 s auf dem 1-s-Raster) und Laub nach 19,8 s. Bewölkt (0,12 > 0,05) trocknet nie. Das Trocknen von Nässe 1 bis Gras-brennbar (0,024) braucht 605 s (klar) bzw. 980 s (nebel); das längste trockene Fenster im Zug ist 360 s (Mittel 248 s). Gras ist also in 0,0–0,1 % der Welt-Zeit brennbar (Wetter-Blatt P2/P3). Die Nässe-Kurve ist nachgerechnet: t = 150/0,6 · ln(1/0,976) = 6,07 s. | bild-himmel.js:3078–3080; feld-brand.js:284; stoff-material.js:2229–2240 |
| **B4 (ii)** | **Das Bett liegt nur am gebauten Ring — fail-soft.** `_kontaktStoffAt` nennt „gras" nur bei Grün ≥ 0,5 der Boden-Karte gebauter Chunks und „laub" nur bei Kronen-Streu ≥ 0,5 im Fenster der Wege-Karte. Sonst fällt es still auf `_terrainMaterialAt`, das nie „gras" oder „laub" liefert. Wo `lebendig` gewinnt, liefert es „erde" (erde = lebendig + feuchte·0,35), und erde trägt kein `brenn`. Der Grün-Kanal selbst ist eine Farb-Schwelle (smoothstep 0…0,04 auf g − (r+b)/2). | Null-Renderer Ring 2: 1 926 von 2 401 Zellen „ohne Karte", Asche ≤ 146 m vom Spieler (Feuer-Blatt). Spiel-Ring 4 = ±194 m: **nicht gemessen**. Laub fehlt jenseits von 2 048 m. | gelaende-kollision.js:1130–1133; gelaende-boden.js:12–21, :108; vegetation-wiese.js:2362–2400 (:2370); daten.js:635; siedlung-wege.js:421–440 |
| **B5 (v)** | **Die Last ist Saat-Rauschen und wird nie verbraucht.** w0 = `last` × min(1, `lebendig`); `lebendig` = Simplex mit λ 200 m + Overlay − Narbe, nicht die gezeichnete Bedeckung. Die Tat `brand` sperrt die Zelle bis zur Heilung, eine Masse geht nicht ab. | `lebendig`: p05 0,159 · p50 0,499 · p95 0,84; 4,42 % unter `minStoff` 0,15 (Pflanzen-Blatt). R hängt am Wind-Deckel an der Last: ×3,9 bzw. ×14 (Stoff-Blatt). Ab Rest 0,3 steht sichtbares Gras im Bild, bleibt aber bis zur Heilung unbrennbar: ≈ 67 Welt-Stunden auf offener Wiese (Pflanzen-Blatt). | feld-brand.js:217, :222, :302, :330, :575; feld-leben.js:1874, :2972; vegetation-wiese.js:3188 |
| B6 | **Die Bild-Reichweite.** Das Feuer wird höchstens 160 m um das Auge gezeichnet, mit höchstens 32 Zellen und 384 Flammen je Bild. | Eine Front über 32 Zellen ist im Bild nicht ganz. | feld-brand.js:930, :936–937 |
| B7 | **Die Nachbarin erbt die Feuchte der Quelle.** Ob eine wartende Zelle erlischt, urteilt `mx`/`boden` der Quelle; ihr eigenes Bett zählt erst beim Zünden. | — | feld-brand.js:448, :509–510, :377–378 |
| B8 | **Die Boden-Feuchte wird einmal je Brand gemerkt.** Ein Pegel, der während des Brands steigt, erreicht das Feuer nicht. | — | feld-brand.js:218–219, :268 |

Die Lage in einem Satz je Ebene:
- **(A)** Die Station zündet wegen eines toten Filters (k:g1.js:1425) eine Teil-Bett-Zelle und sieht dort 4 Flammen.
- **(B)** Selbst eine Voll-Bett-Zelle läuft unter klar 0,074 m/s (B1). Jede windigere Lage ist nass (B2, B3). Jenseits des gebauten Rings gibt es kein Bett (B4).

### Die übrigen Brüche als Klassen

#### Zwillinge (Z)

| # | Größe | Quelle 1 | Quelle 2 (3) |
|---|---|---|---|
| Z1 | „wie viel Gras steht hier" | Last `lebendig` feld-brand.js:222, :302 | Bedeckung `groundCover` vegetation-wiese.js:172 · Bett-Art Grün-Kanal gelaende-kollision.js:1132 |
| Z2 | `lebendig`, zwei Zustände | `worldFieldAt` (gefroren) vegetation-streu.js:20 → phyto-core.js:7065 | `auraAt` = Substrat + Overlay − Narbe feld-leben.js:1874 |
| Z3 | Wald-Dichte | `sd` (fbm) phyto-core.js:2788 | `lebendig` der Streu phyto-core.js:7065 (bestätigt siedlung-wege.js:121) |
| Z4 | Bodenlicht | `_bodenLichtFeld` vegetation-wiese.js:43 | `_canopyLightAt` :2490 (Leser vegetation-baum.js:1343; benannt in UNDERGROWTH :3234–3238) |
| Z5 | Boden-Feuchte | `_feuchteAt` gelaende-boden.js:1538–1563 | `feuchteAt` im Faden voxel-worker.js:2090–2128 (von Hand gespiegelt, :2087–2089) |
| Z6 | Wasser-Spiegel | `wasserSpiegel` ohne Stau gelaende-core.js:7696–7722 | `atlasSpiegel` mit Stau :7757–7758 |
| Z7 | Grundwasser | Grund B gelaende-core.js:1702–1716 | „Wassertisch" = Meeresspiegel wasser-zellen.js:206; daten.js:429–436 |
| Z8 | Ort des Regens | Wetter am Spieler dirigent-takt.js:1733 | Klima des Pegels an (0, 0) wasser-hydro.js:254–255 · Bewohner-Wirt ohne Ort siedlung-bewohner.js:2223 (Leser `_wetterAmOrt` bild-himmel.js:2843 steht bereit, ungerufen) |
| Z9 | „Regnet es?" | `_weatherIsWet` (INTENSITY ≥ 1) bild-himmel.js:2863 · Nässe-Ziel rain > 0,05 :3078 · Partikel rain > 0,01 :1082 | Bewohner 0,3 ± 0,15 koerper-core.js:5342 · Brennglas `=== "sunny"` koerper-fahrt.js:2294 · Sturm-Gefühl `=== "stormy"` feld-leben.js:1757 |
| Z10 | Bewölkung | `cloudCover` aus WEATHER_INTENSITY daten.js:42 → bild-himmel.js:1763 (regen 0,9 > bewölkt 0,74) | `grey`/`sun` aus WX_GESETZ phyto-core.js:4288–4293 (regen grey 0,6 < 0,74) |
| Z11 | Windrichtung | Mäander ±41° phyto-core.js:4357 (Gras, Rauch, Feuer, Regen) | θ0 der Wolken und der Front bild-himmel.js:1769, phyto-core.js:4428 (Abstand bis 41°, Soll ±20°) |
| Z12 | Wind-Form | am Auge, Shader dirigent-takt.js:2468–2470 | am Ort, CPU stoff-material.js:238 |
| Z13 | Labor-Wind | `uWindDir` fest foundry-core.js:66; eigene Böe :809; Impostor worlds/terrain/phytogenesis.js:2310 | `WIND_BOE` daten.js:141 |
| Z14 | Wolke gegen Front | fbm-Wolke mit globaler Schwelle welt-licht.js:901–944 auf eigener Wolken-Uhr dirigent-takt.js:60, :1745–1750 | Regen-Bänder der Front phyto-core.js:4423 |
| Z15 | Einstrahlung | Brennglas 1000 W/m² hinter dem Wort-Tor koerper-fahrt.js:3258, :2294 | Kanal `sun` (Nässe, Temperatur, Licht) · Durchlass der Atmosphäre im Licht |
| Z16 | Tag-Uhr | Kommentar „die Uhr des Spielers ist SICHT: kein Prozess liest sie" bild-himmel.js:2746 | `_temperaturAt` liest `timeOfDay` :2879 → Brand feld-brand.js:315 |
| Z17 | 16-m-Zelle | `LIFE_FIELD.cell` feld-leben.js:3078 | `WERTUNG.cell` feld-sprache.js:1420 · `HYDROSPHERE.cell` daten.js:204 · Wind-Form stoff-material.js:277–278 |
| Z18 | Chunk-Konfiguration | Main gelaende-boden.js:2725–2740 | Worker voxel-worker.js:1988–1991 |
| Z19 | Länge des Jahrs | dirigent-kern.js:311 | Fallbacks bild-himmel.js:933, :970; speicher-laden.js:543 |
| Z20 | Brennbarkeit | Tag `brennbar` bau-vorlagen.js:1769, :1879, :1931 (Bild, Kampf, Spawn) | `tZuend` :1621–1641 · Spalte `brenn` :1646–1649 (nur diese zwei liest das Feuer) |
| Z21 | Dichte | ρ (Kern) schmiede-core.js:2884–2910 | Tag `dichte` bau-vorlagen.js:1758ff (AO, Tempo) · `RHO.holz` schmiede-core.js:456 gegen `BOGENMAT.holz.rho` :2837 · `ARENA_RHO` :4184 |
| Z22 | Wärmeleitung | Tag `wärmeleitung` bau-vorlagen.js:1760ff | Eis-k :1644 |
| Z23 | Reibung | `ZIELMAT.mu` schmiede-core.js:2812–2822 | SI-μ bau-vorlagen.js:1621–1641 |
| Z24 | Asche-Farbe | Palette foundry-core.js:107 | `tonAsche` fachwerk-core.js:7023–7031 · `BRAND.versengt` feld-brand.js:898 |
| Z25 | Holz-Vergrauung | `ALTER.holz` bau-vorlagen.js:1685 | `AUS_SILBER` fachwerk-core.js:6857 |
| Z26 | Luft-Temperatur am Brand | Q_ig aus dem Temperatur-Feld feld-brand.js:315 | Rauch-Auftrieb mit T = 300 K fest :746 |
| Z27 | Fläche einer Zelle | `glut` = 1 über die ganze Zelle für 600–870 s feld-brand.js:421, :515 (Ohr klang.js:383) | Front-Ellipse (Licht dirigent-kern.js:1806; Narbe und Flammen feld-brand.js:112–119, :669–682) |
| Z28 | Bedingung der Ausbreitungs-Richter | stoffe.K2#1 und `--brand`: cloudy + `st.naesse = 0` (diag-stand-takt.cjs:2899–2900, :872) | Spiel: cloudy → Nässe-Ziel 1 (bild-himmel.js:3078). Gebucht ist 0,911 m/s, eine Front, die die gekoppelte Welt nicht trägt. |
| Z29 | Teich-Spiegel | `becken.spiegel` fachwerk-core.js:12164, :12290 (ohne Leser) | Füllhöhe der Hydrosphäre — ob beide gleich sind: nicht verifiziert |

#### fail-soft (FS)

| # | Stiller Ersatz | Anker |
|---|---|---|
| FS1 | Bett ohne Boden-Karte → `_terrainMaterialAt` (nie gras/laub) | gelaende-kollision.js:1132–1133 |
| FS2 | Laub-Streu außerhalb des Fensters der Wege-Karte → 0 | siedlung-wege.js:421–440 |
| FS3 | `_feuchteAt` bei `_genVersion() < 2` → 0 | gelaende-boden.js:1539 |
| FS4 | Nässe fehlt → 0 im Brand | feld-brand.js:284 |
| FS5 | Unbekanntes Wort → sunny; Intensität 0 | bild-himmel.js:2823, :2806, :2863; klang.js:2058 |
| FS6 | Laden ohne Wort → „sunny" | speicher-laden.js:331 |
| FS7 | Saat fehlt → „anazh-realm-seed" | bild-himmel.js:1769, :2847; stoff-material.js:215; dirigent-takt.js:1746 |
| FS8 | Kein Spieler → Wetter an (0, 0) | dirigent-takt.js:1733 |
| FS9 | `timeOfDay` fehlt → 0,5 | bild-himmel.js:1384 |
| FS10 | Jahr fehlt → 2400 s | bild-himmel.js:933, :970; speicher-laden.js:543 |
| FS11 | Meeresspiegel `: 0` gegen `baseHeight − meerUnterBasis` gegen `ort.meerUnterBasisM` | gelaende-core.js:7697, :7756, :1395; wasser-zellen.js:12, :206, :963; bild-himmel.js:485 |
| FS12 | Ein eigener Stoff (DSL) liest die Zeile seines Tag-nächsten Verwandten (Zündung, Bett) | bau-buch.js:1561–1570 |
| Karte ≠ Code | kreatur-furcht.js:46 und kreatur-verhalten.js:3301 nennen `_verhaltenGesetz` „fail-soft"; der Code ist fail-closed | kreatur-verhalten.js:3701–3705 |

#### Tote Schreiber (TS) — geschrieben, im Spielpfad nie gelesen

| # | Größe | Anker |
|---|---|---|
| TS1 | `BRAND.licht` 4 (nur die Mutanten diag-stand-takt.cjs:1499, :1771; „Bis hier leuchtete …" dirigent-kern.js:1721) | feld-brand.js:913 |
| TS2 | `wetterAt(...).front` und `.feuchte` (der Wirt liest sie nicht, bild-himmel.js:2852) | phyto-core.js:4453 |
| TS3 | Planeten-Wind `windX`/`windZ` (`ORT_FELDER.wetter` trägt nur die Quoten, gelaende-core.js:5701) | planet-core.js:2336 |
| TS4 | Gefühls-Übergang 8–120 s (beide Rufer übergeben `zug`, dirigent-takt.js:1740, feld-dsl.js:943) | bild-himmel.js:3138–3139 |
| TS5 | Asche-Zeile ρ 600, c 840, E, σ (gelesen wird nur `rauheit`, stoff-material.js:3249) | schmiede-core.js:2904 |
| TS6 | `BOGENMAT.*.rho` | schmiede-core.js:2837–2839 |
| TS7 | `NAESSE.versickern` 0,3 (Faktor = 1) | stoff-material.js:2239 |
| TS8 | `BESTAND_GESETZ.rasterM` 50 (nur das Prüf-Tupel kreatur-leben.js:3818) | tetrapoda-core.js:2200 |
| TS9 | `becken.spiegel` (Grep `becken` in stamm/, gelaende-core.js, voxel-worker.js: 0) | fachwerk-core.js:12164, :12290 |
| TS10 | Für Wesen: Rauch-Teilchen und Byram `iw` (nur Bild) | feld-brand.js:720–764, :437 |
| TS11 | `glut.tZuend` 623 K ohne `brenn`: die Glut-Fläche des Bodens trägt kein Bett | bau-vorlagen.js:1633; vegetation-wiese.js:2372; gelaende-kollision.js:1126 |

#### Tote Leser (TL) — gelesen, von keinem Schreiber im Spielpfad gespeist

| # | Leser | Anker |
|---|---|---|
| TL1 | `heatResist`-Zweig in `damagePlayer` — keine Feuer-Quelle ruft `damagePlayer` (Rufer nur dirigent-takt.js:1144, feld-dsl.js:1842, kreatur-verhalten.js:1553) | koerper-seele.js:317–319 |
| TL2 | Der Bett-Filter der Station liest `f.leb` als Anteil-Last; diesen Vertrag schreibt `_brandStoff` seit ea884aa6f nicht mehr (= A1) | k:g1.js:1425 gegen feld-brand.js:256–262 |
| TL3 | `_wetterAmOrt` — Leser am Ort, vom Bewohner-Wirt nicht gerufen | bild-himmel.js:2843; siedlung-bewohner.js:2223 |

#### Uhr-Brüche (UB)

| # | Bruch | Anker |
|---|---|---|
| UB1 | Die Temperatur (also die Zünd-Wärme) liest die Sicht-Uhr, einen Regler. `timeOfDay` ist NON_BROADCASTABLE, zwei Mitspieler haben also zwei Temperaturen. | bild-himmel.js:2879, :2712–2750; feld-dsl.js:949 |
| UB2 | Der Wasser-Automat macht einen Schritt je Bild, Rate 0,25, ohne dt: bei 30 Hz fließt er halb so schnell wie bei 60 Hz und holt nach einem Sprung nichts nach. | wasser-zellen.js:1641, :2124, :2191 |
| UB3 | Die Welt-Uhr läuft nur im rAF. In einem verdeckten Tab steht die Welt; bei der Rückkehr kommen höchstens 0,1 s dazu. | dirigent-takt.js:24–25, :48, :426 |
| UB4 | Das Jahr dauert 2400 s, der Prozess-Tag 3600 s; ein Jahr ist also 2/3 Tag. Der Kern rechnet mit `jahrTage` 365. Die Brand-Narbe (72 Prozess-h) dauert 4,5 Saison-Jahre. | dirigent-kern.js:311; daten.js:165–166; gelaende-core.js:1319, :1335; feld-leben.js:3102 |
| UB5 | Der Region-Takt vergleicht Sekunden mit 1000: gemeint ist 1 s, gerechnet wird alle 1000 s. | dirigent-takt.js:27, :186–189 |
| UB6 | Zweite Welt-Uhr der Tiere: `creatureAnimationTime` läuft nur in Bild-Takten; die Furcht-Fristen hängen daran. | kreatur-verhalten.js:3139; kreatur-leben.js:808 |
| UB7 | Die Takte hängen an der Bau-Frist: Leben-Stufen und Sukzession fallen aus, solange der Boden baut. Die Hydro-Kacheln laufen auf der Wanduhr. | dirigent-takt.js:2179, :2200–2206 |
| UB8 | Die Nässe ist ein Integral über den Pfad, keine Funktion der Uhr. Das widerspricht dem Kommentar „… und Nässe folgen ihr als Funktion". | bild-himmel.js:3077–3080; dirigent-takt.js:1754 |
| UB9 | Wetter-Zug und Sicht-Tag ticken nur in Bild-Takten. | dirigent-takt.js:251 → :1714; :153 |
| UB10 | Drei Maße für dasselbe Wasser: Der Film trocknet in 10,3 min Welt-Uhr (= 4 Spielstunden am Sicht-Tag 60 min), der Pegel rechnet 1 h als 1 Tag. | stoff-material.js:3790–3791; daten.js:165 |
| UB11 | Die Station misst auf eigener Uhr (= A4). | k:g1.js:1400–1403, :1596 |

#### Einheiten-Brüche (EB)

| # | Bruch | Anker |
|---|---|---|
| EB1 | Wind = Stellwert × 24 m/s. Der Kanal war eine „Böen-Amplitude" des Looks. | phyto-core.js:4288–4293, :4318; daten.js:105–108 |
| EB2 | Regen ohne Einheit (`rain` 0,6); Pegel 1 ≙ 10 mm/h, Gefäß 1 ≙ 0,005 m/s = 18 000 mm/h — Faktor 1 800. | phyto-core.js:4293; gelaende-core.js:1579; bau-teile.js:3135 |
| EB3 | Nässe (Stellwert 0–1) wirkt linear × 2,5 kg/kg auf M. Der Anker ist die Sättigung der Streu (Matthews 2006), die Linearität ist gewählt. | feld-brand.js:284, :889, :975 |
| EB4 | `lebendig` (Stellwert) skaliert die Last in kg/m². | feld-brand.js:302 |
| EB5 | ρ_p gras 350 statt 513 kg/m³; δ gras = Halm-Höhe des Bilds 0,42 m statt FM1 0,3048 m. | schmiede-core.js:2907; stoff-material.js:3825–3827 |
| EB6 | Sekunden gegen Millisekunden im Region-Takt (= UB5). | dirigent-takt.js:27, :189 |
| EB7 | Prozess-Stunden und -Tage (Narbe 72 h, Tritt 20 Tage) gegen Welt-Sekunden (Nässe 150/480 s). | feld-leben.js:3102; siedlung-wege.js:2912; stoff-material.js:3790–3791 |
| EB8 | Sprosse `same.physik.feuer#2` ist in sich uneinig: „10⁴ m², 2 000 Zellen". 10⁴ m² sind 39 Zellen à 16 m; 2 000 Zellen à 16 m sind 51,2 ha. | meisterkarte-2.json |

#### Flüchtigkeit / Speicher (SP)

| # | Was geht verloren | Anker |
|---|---|---|
| SP1 | Das Brand-Feld wird nicht persistiert; die Grundstellung leert es, ein Reload löscht den Brand. | feld-brand.js:204; speicher-laden.js:2691–2701 |
| SP2 | `naesse` steht nicht in der Stand-Tafel (Wetter, Zug und Pegel schon); nur `nassTage` reist. | speicher-welten.js:1129, :1322–1345; bild-himmel.js:3076 |
| SP3 | Der Wasser-Automat (`waterLevelCells`) wird nicht persistiert, mit dem Boden-Ring verworfen und neu aus der statischen Flut gebaut. | wasser-zellen.js:1788–1795; gelaende-fern.js:2459–2464 |
| SP4 | `emotionField` und `wohlBaseline` stehen nicht im Stand. | Grep stamm/speicher-*.js: 0 |
| SP5 | Das Leben jenseits der nahen Regionen wird nicht persistiert. | feld-leben.js:2165–2182 |
| SP6 | Das Bett ist je Zelle gemerkt (`_brandBett`), samt `boden` (= B8). | feld-brand.js:218–219 |
| SP7 | Der Wuchs `w` wird beim Schreiben der Tat eingefroren. | vegetation-wiese.js:2211–2219 |
| SP8 | Die Hydrosphäre wird einmal je Region gerechnet; ob ein später gelegter Erdbau die Seen neu fasst: nicht verifiziert. | voxel-worker.js:1717; gelaende-core.js:2823, :6194 |

---

## 4. DAS RASTER UND DIE UHR

### 4.1 Raster

| Feld | Raster | Ursprung | deckungsgleich mit der Hydrosphäre? | Anker |
|---|---|---|---|---|
| Leben-Overlay, Gefühl, Wertung | 16 m | 0 | ja | feld-leben.js:3078, :2718–2763; feld-sprache.js:1420 |
| Brand (Zelle) | 16 m; Glut-Block 4 × 4 = 64 m; Bett-Maske 8² = 2 m | 0 | ja (die Maske nicht) | feld-brand.js:911, :916 |
| Taten / Narbe / Lava | 16-m-Index über einer Liste | 0 | ja | feld-leben.js:2626–2693 |
| Wind-Form-Merker | 16 m × 64 Richtungen | 0 | ja | stoff-material.js:272–281 |
| **Hydrosphäre** | 16 m, 128² je 2048-m-Kachel | −1024 = −64 · 16 | — (Bezug) | gelaende-core.js:6176–6212; daten.js:199–205 |
| Voxel / Wasser-Automat | 1,8 m in Chunks von 43,2 m (LOD bis 14,4 m) | 0 | **nein** — trifft eine 16-m-Kante alle 144 m, eine Chunk-Kante alle 432 m; 47,41 Chunks je Kachel | gelaende-boden.js:2712–2741; wasser-zellen.js:1641ff |
| Boden-Karte (Grün-Kanal) | step/4 = 0,45–3,6 m je LOD, nur geladene Chunks | Chunk | nein | gelaende-boden.js:19–59; daten.js:463–464 |
| Wege-Karte / Laub-Streu / Tritt | 0,5 / 2 m (Clipmap 512 / 2048 m); 1 / 4 m; 0,5 m | Spieler bzw. 0 | nein | siedlung-wege.js:2907–2923, :2987–2995 |
| Bestand der Tiere | Region S = 200,29 m, Zelle 50,07 m (√π-Seite) | 0 | **nein** (inkommensurabel) | kreatur-leben.js:2216–2340, :3731–3737 |
| Wiese / Streu / Wald | 6 und 12 / 3,4, 2,4, 2,1 / 12 m | Ring | nein | daten.js:505–530; vegetation-streu.js:85–87; phyto-core.js:3158 |
| Bewohner / Blocker / P2P-Region | 5 / 8 / 345,6 m | — | nein | siedlung-bewohner.js:3968; gelaende-kollision.js:1449; netz-p2p.js:3415 |
| Fern-Neigung | 31,25 m, ±8 km | Anker | nein | gelaende-fern.js:2654–2658 |
| **Wetter** | **kein Raster** — Funktion `wetterAt(saat, x, z, t, ort)`, an EINEM Punkt gelesen (Spieler) | — | — | phyto-core.js:4423; dirigent-takt.js:1733 |
| **Wind** | kein Raster — Funktion, Form auf 16 m gemerkt | — | — | stoff-material.js:233–281 |
| **Temperatur** | kein Raster — Funktion von y, Saison, Sicht-Uhr und Wetter | — | — | gelaende-core.js:1313–1355; bild-himmel.js:2874–2882 |
| **Nässe** | kein Raster — EIN Skalar der Welt | — | — | bild-himmel.js:3080 |
| **Boden-Feuchte** | kein Raster — Funktion aus Fluss-Abstand und Höhe über dem Spiegel | — | (liest die Hydrosphäre) | gelaende-boden.js:1538–1563 |
| **Last `lebendig`** | kein Raster — Simplex λ 200 m (Overlay auf 16 m) | — | — | feld-leben.js:1849–1881, :2972 |
| Pegel | EIN Zustand der Welt (≈ 50 Zahlen), die Marke je Chunk | — | — | wasser-hydro.js:226–243, :323–347 |

### 4.2 Uhr

| Uhr | Was sie tickt | Anker |
|---|---|---|
| **Welt-Uhr** `spielZeit` (rAF, Deckel 0,1 s; Sprung ab 60 s) | Brand (1 s; Sprung-Modus ab 10 s; Budget 0,25 ms je Bild), Nässe (exakt), Pegel (1 s), Wetter-Zug (120 s-Raster), Saison (Δt / 2400 s), Bestand (10 s), Leben-Zerfall (lazy), Prozess-Tag (spielZeit / 3600) | dirigent-takt.js:48, :2699–2701; feld-brand.js:470–499; bild-himmel.js:3065; wasser-hydro.js:262; kreatur-leben.js:2722; feld-leben.js:2365, :2606 |
| **Sicht-Uhr** `timeOfDay` (Regler, dz / (dayLength · 60)) | Licht und Himmel, **und** Temperatur → Zünd-Wärme, Esse, Lava; Brennglas-Sonne; Bewohner-Stunde; Tag-Phase der Tiere | bild-himmel.js:2648, :2879, :1384; siedlung-bewohner.js:2157; kreatur-leben.js:2063 |
| **Bild-Zähler** (kein dt) | Wasser-Automat (Rate 0,25 je Takt, Neu-Mesh jeder 4.) | wasser-zellen.js:2124, :2191, :2494 |
| **Bild-Takt** (deltaBild) | Kreatur-Zeit (Furcht-Fristen), Wetter-Zug, Sicht-Tag | kreatur-verhalten.js:3139; dirigent-takt.js:251, :153 |
| **Wanduhr** | Hydro-Kacheln (alle 1000 ms), P2P-Region (Schwelle 1000 s) | dirigent-takt.js:2204–2206, :189 |
| **Physik** (1/60 s fest, höchstens 8 Schritte) | Körper | koerper-bewegung.js:2623; dirigent-takt.js:1191–1233 |
| **Wolken-Uhr** (0–3600 s Saat-Versatz) | Wolkenschicht | dirigent-takt.js:60, :1745–1750 |
| **Station** | eigene Uhr: `_tickBrand` allein bzw. 1 s je Bild | k:g1.js:1400–1403, :1596 |

---

## 5. DIE SPROSSEN

Lese-Art der Karte (wie im Richter-Blatt):
- Messname = `id#nr` mit `umfang` — `tiefe`;
- Soll = `richter`.

Markierung:
- **B** = physikalisch begründet: das Soll ist an eine Messgröße der Welt oder der Literatur gebunden.
- **W** = gewählt: Schwelle oder Quote ohne Quelle.
- **U** = unsicher: ein Anker ist genannt, aber Band oder Bezug ist fraglich.
- Mischformen stehen getrennt da.

„Grep 0" verweist auf die Grep-Probe in Abschnitt 0.

**Zusammengelegt:** `same.kopplung.relief` und `same.kopplung.seuche` gibt es in meisterkarte-2.json nicht mehr als Leitern. Aktiv sind also NEUN `same.kopplung.*`-Leitern mit 61 Sprossen; dazu kommen `same.physik.feuer` (8) und `planet.kopplung.wetter-welt` (6).
- relief → planet.geologie.vulkan, planet.geologie.gebirge, planet.relief.wandel („Lava, Kegel, Verwerfung als bleibende Form sind die Leitern der Geologie", MEISTERKARTE-2.md:5378).
- seuche → mensch.menge.seuche, leben.oeko.partner („Ansteckung auf echten Kontakten, 10² → 10¹⁰: eine Leiter; Erreger über Arten zählt die Wechselbeziehung", MD:5394).

### same.kopplung.aufwaerts — heute 0, kern 0, fuss ungemessen

| # | Messname (umfang — tiefe) | Soll (richter) | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | eine Tat (gebautes Haus, Rodung 1 ha), wirkt bis 1 km — steht im Steigflug, wo sie gebaut wurde; Pegel, Wuchs, Wild ändern sich | Haus bauen, aufsteigen: Pixel aus 400 m an seiner Stelle; Bildpaar an 10 Orten im Umkreis | Die Tat reist (`worldMeta.taten` speicher-welten.js:1145); die Narbe ändert den Wuchs (feld-leben.js:2689–2691). Der Pegel liest keine Tat (gelaende-core.js:1786–1796). Die Siedlung liest Natur nur als Verbot und Kosten (Leiter-Beleg fachwerk-core.js:8623, :3861). | K8, SP3 | W |
| 2 | ein Dorf rodet 10 km² — Wald weicht Feld, Wild zieht ab; sichtbar aus 10 km | Waldanteil im Umkreis 5 km fällt mit der Bevölkerung (r ≥ 0,6); Bildpaar aus 10 km ΔE ≥ 5 an der Tat, sonst ≤ 1 | Wald-Dichte aus `sd` bzw. `lebendig` (Z3); keine Bevölkerung → Wald (Leiter-Beleg: „keine Tat verschiebt ihren Elternknoten") | Z3, Z2 | W |
| 3 | eine Stadt (10⁵) ändert ihr Tal (10 km) — Rodung → Erosion → Versandung; Damm → Stausee; Wärmeinsel 1–3 K | Sediment im Hafen ≥ 2× der Wald-Saat; Temperatur Stadt ↔ Umland gegen gemessene Wärmeinseln | Erosion nur zur Gen-Zeit (gelaende-core.js:361); Stau-Spiegel `atlasSpiegel` :7757; Wärmeinsel Grep 0; die Temperatur kennt keine Siedlung (gelaende-core.js:1313–1355) | K7-Klasse (Stoff → Wetter FEHLT), Z6 | B (Wärmeinsel) · W (2×) |
| 4 | ein Damm verschiebt ein Delta 100 km flussab — die Küste zieht sich zurück wie hinter echten Dämmen; aus dem Orbit sichtbar | Bildpaar Delta vor ↔ nach 10 Jahren; Fläche der Änderung Orbit ↔ Boden ±10 % | kein Sediment-Transport zur Laufzeit erhoben (Sediment nur Gen-Zeit, planet-core.js:294, :1439) | SP3, UB2 | W |
| 5 | Megastadt (10⁷), Region — Wärmeinsel ≥ 3 K nachts, Versiegelung → Sturzflut, abgepumptes Tiefenwasser → Senkung | Hochwasser-Spitze ≥ 1,5× nach Versiegelung; Senkung cm/a im Faktor 3 von Jakarta | Grep `Wärmeinsel` 0; Pegel ohne Versiegelung (gelaende-core.js:1792) | K8-Klasse, Z7 | B (Jakarta) · W (1,5×) |
| 6 | ein Ausbruch kühlt einen Kontinent ein Jahr — Ernten, Wanderung und Himmel gekoppelt; Aschewolke im Orbitbild | Abkühlung gegen Pinatubo (~0,5 K) ±50 %; Bodenlicht unter der Wolke ±15 % | `Aschewolke` Grep 0; Ausbruch nur als Hotspot-Relief (planet-core.js:876) | K7, Z14 | B |
| 7 | eine Zivilisation formt ihren Planeten über Jahrhunderte — Landbau formt Biome, Industrie → Klima → Meeresspiegel; aus dem Orbit und im Planetenscheibchen sichtbar | Orbitbild vor ↔ nach 300 Jahren an 100 Saaten plausibel ≥ 90 %; Erwärmung je CO₂-Verdopplung 2–5 K | nicht erhoben (CO₂ nur planet-core.js) | UB4 (Jahr 2400 s) | B (2–5 K) · W (≥ 90 %) |
| 8 | Fremd-Zivilisationen auf 100 Planeten — Terraforming, Atmosphären-Umbau, Selbstvernichtung oder Gleichgewicht | Anteil der Planeten, die sich vom Zustand ohne Zivilisation messbar unterscheiden ≥ 80 % (Bildpaar Orbit) | nichts (Terraform Grep 0) | — | W |

### same.kopplung.erdsaat — heute 0, kern 0, fuss ungemessen

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 1 Ort, 1 Ereignis-Typ — der Ort der Erd-Saat trägt die echte Gefahr (Vesuv am Golf) | Bildvergleich gegen Relief-Modell; der Vulkan bricht von selbst aus | keine Erd-Saat (Leiter-Beleg; Grep `Erd-Saat` 0) | K13-Klasse (nichts von selbst) | W |
| 2 | 10 Orte, Epoche wählbar — Ausbruch, Beben, Brand mit Rate im Real-Band | simulierte Wiederkehr Faktor 3 der historischen | Brand nur als Tat; Blitz Grep 0 | B2, B3, K13 | B |
| 3 | Pompeji 79, Lissabon 1755, London 1666 — Ablauf aus Gesetzen: Säulen-Phase → pyroklastischer Strom; Beben → Brand → Tsunami | Zeitachse gegen Quellen (Plinius, Augenzeugen 1755) Faktor 2 je Phase; Blind-Bildvergleich | Tsunami, Erdbeben Grep 0; Feuer nimmt keine Bauten | K5 | B |
| 4 | 100 Ereignisse über 5 000 Jahre — Fernfolgen (Tambora → 1816, Pest → Löhne) entstehen ohne Skript | Anteil, deren dokumentierte Fernfolge messbar eintritt ≥ 50 % | nichts | UB4 | W |
| 5 | Quartär, 10⁶ Jahre — Eiszeiten, Meeresspiegel, Gletscher, Ende der Megafauna | Meeresspiegel-Kurve gegen Rekonstruktion Faktor 1,5; Gletscher-Maximum am Ort ±20 % | Gletscher Grep 0; Meeresspiegel fest bzw. fail-soft (FS11) | FS11 | B |
| 6 | Erdgeschichte 4,5·10⁹ Jahre — Schneeball-Erde, Massenaussterben, Deccan-Trapps bereisbar | fünf große Aussterben: Zeitpunkt Faktor 2, Arten-Verlust Faktor 1,5 | nicht erhoben | — | B |

### same.kopplung.ereignis — heute 1 (JSON) / 0 (MD), kern 0, fuss ungemessen

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | eine 16-m-Zelle, 0 Menschen — Glut, Lava erstarrt zu Stein | Bild der Zelle in Glut und erstarrt, beide Geräte | Lava gelaende-core.js:1808–1848 (`erstarrt` :1848), feld-leben.js:2452ff; Brand-Glut feld-brand.js:421 (der Beleg zitiert veraltete Zeilen, 1.3) | — | W (Existenz) |
| 2 | 1 ha, 10 Menschen — Feuerfront mit Wind und Hang; Bewohner weichen | Frame p95 während 1 ha brennt; Bewohner meiden die Front = 100 % | 1 ha = 39 Zellen; unter klar nach 300 s 6 Zellen (Feuer-Blatt); Bewohner lesen keinen Brand (siedlung-* Grep 0); p95 im brennenden Hektar nie gemessen | B1–B4, K4 | W |
| 3 | 1 km², 10³ Menschen — Wald- oder Lavafeld mit Rauch, Glut, Fluss; ein Dorf flieht | Bildvergleich gegen Foto (Brandfront, Pahoehoe); Fluchtwege folgen dem Gelände | Rauch ohne Leser außer dem Bild (TS10); Bild ≤ 32 Zellen ≤ 160 m (B6) | K4, B6 | W |
| 4 | 100 km², 10⁵ Menschen — Stadtbrand über 10⁴ Gebäude, pyroklastischer Strom; Panik, Helfer, Stau | Blind-Urteil gegen historische Bilder ≥ „glaubhaft" bei 70 %; Räumungszeit Faktor 2 gegen Evakuierungs-Modell | Feuer nimmt keine Bauten; Panik und Evakuier Grep 0 | K5, K4 | W (70 %) · B (Modell) |
| 5 | 10⁴ km², 10⁷ Menschen (Megastadt) — Tsunami über 1 000 km Küste, Beben M8 unter der Stadt | Wellen-Ankunft an 10 Küstenorten ±10 % gegen √(g·h); 100 Stichproben-Personen handeln (keine Statisten-Schleife) | Tsunami Grep 0; der Wasser-Automat hat keinen Impuls und ist flüchtig | UB2, SP3 | B |
| 6 | 10⁶ km², 10⁸ Menschen — Supervulkan VEI 8, Kontinent unter Asche, Wanderung | Aschedicke gegen Distanz Faktor 2 (Toba/Yellowstone); Himmel-Bild über 3 Jahre | nichts | UB4 | B |
| 7 | Planet, 10⁹–10¹⁰ Menschen — Einschlag 10 km: Feuerball, globaler Brand, Impakt-Winter, aus jeder Perspektive | Flug Krater → Antipode ohne Ladebild; Bildvergleich gegen Chicxulub-Modellierung | nichts (`Einschlag` nur Fahrzeug- und Körper-Stöße) | — | U |

### same.kopplung.gewalt — heute 0, kern 0, fuss ungemessen

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 1 Klasse von selbst, 1 km², 100 a — Blitz-Brand aus Trockenheit × Gewitter des EINEN Wetters | 100 Spieljahre Zeitraffer: Brände je km² und Jahr im Faktor 3 der Real-Rate | Blitz Grep 0; kein Wort ist trocken und windig; Gras ist in 0,0–0,1 % der Zeit brennbar | K13, B2, B3, UB4 | U (die Real-Rate nennt keine Quelle) |
| 2 | 3 Klassen (Brand, Hochwasser, Dürre), 10³ km², 10³ a — Rate aus dem Klima; Hochwasser verlässt das Bett | Häufigkeits-Kurven gegen GWIS und HQ100, Steigung im Faktor 1,5 | Dürre senkt den Pegel (wasser-hydro.js:74–78); Hub ≤ +0,20 m, das Wasser verlässt das Bett nicht (gelaende-core.js:7690); Klima nur an (0, 0) (Z8) | Z8, B3, K1 | B |
| 3 | 6 Klassen (+ Beben, Ausbruch, Hangrutsch), Kontinent, 10⁴ a — b 0,8–1,2; VEI-Raten; Rutsch nach Neigung × Nässe | 8 Saaten × 10⁴ Jahre: b-Wert und VEI-Raten im Real-Band | Hangrutsch Grep 0; die Nässe hat keinen Ort (B3) | B3 | B |
| 4 | Auslöser-Ketten (Beben → Tsunami, Dürre → Brand, Ausbruch → Gletscherlauf) — jede Folge-Gefahr hat ihren Auslöser IN der Welt | Tsunamis mit Auslöser in der Welt = 100 %; Rate je Küstenkilometer Faktor 3 | Dürre → Brand FEHLT: der Pegel schreibt keine Brennstoff-Feuchte | K1 | W (100 %) · B (Rate) |
| 5 | Erd-Saat, Planet, 10⁶ a — die Gefahr-KARTE stimmt, nicht nur die Rate | Beben-Rate je 1°-Zelle ↔ GEM r ≥ 0,7; Vulkane ↔ GVP r ≥ 0,7; Krater N(>D) ∝ D^−2,7 | nichts | — | B · W (r ≥ 0,7) |
| 6 | Fremd-Planeten, 10⁹ a — Gefahren ohne Erd-Namen aus Wärmefluss, Masse, Atmosphäre | 100 Fremd-Planeten: Fremdwelt-Probe (R10) — Gefahr-Klasse und Rate aus Wärmefluss, Masse und Atmosphäre vorhergesagt Rang ≥ 0,7; ≥ 1 namenlose Gefahr je 10 Planeten | nichts | — | W |

### same.kopplung.kaskade — heute 0, kern 0, fuss gemessen (alt feld.K1)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 2 Glieder, eine Zelle — Regen löscht Brand | Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte | Löschen: `_brandFeuchte` feld-brand.js:284 → Erlöschen :509–510, 7 s (k:g1.js:1596). Station ROT: +35 px (GTX), Radeon nach ea884aa6f nicht gemessen | **A1**, A3, A4, B1, B3 | W — „hält im Trockenen" ist als Test leer (A3); 7 s ist U (rain ohne Einheit, EB2) |
| 2 | 4 Glieder an einem Ort (Regen → Nässe → Stoff → Brand → Licht) — jedes Glied liest seinen Vorgänger | Spielgang Sturm: Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4 | feld.K1 headless, ein Brand-Schritt nach 20 min Sprung (fahr-proben.cjs:401–477); Licht über die Ellipse dirigent-kern.js:1806 (`BRAND.licht` tot, TS1). Im Sturm erstickt Gras nach 3,6 s | B3, UB9, A4 | W |
| 3 | Bruch → Körper → Fluid, 10³ m³ — Damm bricht, Wasser trägt Trümmer, Trümmer stauen | N = 20 Saaten: Anteil, in dem jedes Glied im Bild eintritt ≥ 90 % | Wasser-Automat: Füllgrad ohne Impuls, ohne dt, flüchtig (wasser-zellen.js:1641–1786) | UB2, SP3 | W |
| 4 | Beben → Bruch → Brand, ein Viertel — Einsturz nach Lastpfad, Brand aus Herd und Stoff, Ausbreitung nach Bauweise | N = 20: vollständige Ketten ≥ 80 %, Festhalte-Probe je Glied | Erdbeben Grep 0; Feuer nimmt keine Bauten (Z20) | K5, Z20 | W |
| 5 | Beben → Bruch → Brand → Flut, eine Küstenstadt — aus Gesetz, nicht aus Drehbuch | N = 20 Küstenstadt-Saaten: vollständige Ketten ≥ 70 %; Wellen-Ankunft ±10 % gegen √(g·h) | Tsunami Grep 0 | K5, UB2 | W (70 %) · B (√(g·h)) |
| 6 | Ausbruch → Asche → Dachlast → Einsturz → Lahar → Ernte, eine Region — 6 Glieder über Stoff, Fluid, Tragen, Leben | N = 20 Vulkan-Saaten: ≥ 5 von 6 Gliedern im Bild | Lahar Grep 0 | — | W |
| 7 | Ketten, die nie als Klasse geschrieben wurden, auf 100 Fremd-Planeten — Methan-Brand, Gletscherlauf unter Vulkan, Säureregen-Einsturz | Anteil der Planeten mit ≥ 1 Kette von ≥ 3 Gliedern, jedes einer sichtbaren Ursache zugeordnet, ≥ 80 % | Methan Grep 0 | — | W |

### same.kopplung.kohaerenz — heute 0, kern 0, fuss gemessen (alt gelaende.K4)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 2 Glieder, ein Ort — Wasser folgt dem Relief | 100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 % | Stream-Power-Flüsse, EIN Wasser-Spiegel (gelaende.K4, Leiter-Beleg); die 100-Saaten-Stichprobe nie gefahren | Z6 | B · W (95 %) |
| 2 | 4 Glieder, 10 km² — Relief → Wasser → Feuchte → Pflanze | 100 Saaten: Pflanzen-Dichte gegen Abstand zum Wasser monoton fallend in ≥ 80 % | `_feuchteAt` (Fluss-Abstand + Höhe) → erde-Achse vegetation-wiese.js:2370, Wuchs :2081. Die Wald-Dichte (`sd`) und die Brennlast (`lebendig`) lesen sie nicht | Z1, Z3, Z5 | U (monoton ist kein Naturgesetz) |
| 3 | 6 Glieder, 10³ km² — Regenschatten; Städte an Furt, Mündung, Pass | Städte an Fluss/Küste/Pass ≥ 70 %; Niederschlag Luv/Lee ≥ 2:1 | Regenschatten nur planetar (planet-core.js:2017); die Front am Ort liest kein Relief (phyto-core.js:4423–4449); Furt im Wege-Plan (siedlung-ort.js:3391, nicht erhoben) | K9, Z8 | B (Luv/Lee) · W (70 %) |
| 4 | 8 Glieder, 10⁵ km², 10³ Städte — Handelswege über Pässe und Flüsse, Märkte an Knoten | Straßennetz-Umweg ≤ 1,2 × günstigster Gelände-Pfad; Zipf-Steigung 0,8–1,2 bis 10⁷ | nicht erhoben (Zipf in fachwerk-core.js, koerper-core.js) | — | B (Zipf) · W (1,2) |
| 5 | 10 Glieder, Kontinent — Lehm im Trockenen, Holz im Wald, Stein im Gebirge, Speise und Glaube aus Ort | Blindtest: 20 Stadtbilder ihrem Biom zugeordnet ≥ 70 % | nicht erhoben | — | W |
| 6 | 10 Glieder ab der Platte, Planet, 10⁹ Bewohner — Gebirge an Plattengrenzen, Wüsten am 30°-Gürtel, Kulturräume an Barrieren | 100 Planeten-Saaten: Geograf trennt sie blind nicht von Erdkarten-Ausschnitten ≥ 50 % | nicht erhoben (planet-core.js) | — | W |
| 7 | fremde Physik, 10³ Planeten-Typen — die Kette hält, wo die Erde keine Referenz hat | 1 000 Fremd-Saaten: Siedlungen mit sichtbarer Ursache (Wasser, Pass, Stoff, Schutz) ≥ 90 % | nichts | — | W |

### same.kopplung.stoerung — heute 0, kern 0, fuss gemessen (alt stoffe.K5)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 1 Domäne, Stunden — Brand schwärzt die Zelle | Bildpaar Zelle vor / nach dem Brand, beide Geräte | Asche als Tat feld-brand.js:575 → Decke siedlung-wege.js:459; die Flammen und die Narbe stehen auf der Bett-Maske (feld-brand.js:229–231) | B4, A1 (Teil-Bett-Herd) | W (Existenz) |
| 2 | 3 Domänen (Boden, Pflanze, Licht), 1 Jahr — Asche düngt, Gras → Busch → Wald | Zeitsprung 1 Spieljahr: Nachwuchs auf Asche, r(Tempo, Feuchte × Licht) ≥ 0,5 | Sukzession r = 0,825 headless (k:g1.js:5388; `--nachwuchs` nur auf der Punkte-Maschine); Wuchs eingefroren bei der Tat (SP7); ein Jahr dauert 2400 s, die Narbe 4,5 Jahre | UB4, SP7, Z4 | W |
| 3 | 5 Domänen (+ Tier, Wasser), 10 Jahre — Tiere fliehen und kehren zurück, Abfluss steigt | Tierdichte −50 % sofort, Rückkehr in 3–10 a; Pegel-Spitze ≥ 1,3× | Brand-Flucht der Herde in CI ohne Station (diag-kreatur-leben.cjs:143–197); Tierdichte ohne Richter; Abfluss FEHLT | K8, UB6 | U |
| 4 | 7 Domänen (+ Siedlung, Wirtschaft), 100 Jahre, 10⁵ Bewohner — Ernteausfall → Preise → Abwanderung | VEI 5 nahe Stadt: Bevölkerung −20 % binnen 5 a, Kornpreis ×2; Wiederaufbau im Bildpaar nach 50 a | nicht erhoben | K6 | U |
| 5 | 9 Domänen (+ Verkehr, Macht), 10³ Jahre, 10⁷ Bewohner — Hafen versandet → Handelsweg wandert → Stadt verfällt, andere wächst | Tsunami-Saat: verlegt neu entstehende Häfen ≥ 50 %; Straßennetz-Diff | nichts | — | W |
| 6 | 10 Domänen (+ Kultur), 10⁴ Jahre — gefahrangepasste Bauweise, Flutmythen, Gedenken, wo die Gefahr wohnt | 100 Saaten: Gefahr-Rate ↔ Anteil angepasster Bauten im Bild r ≥ 0,6 | nichts | — | W |
| 7 | Mutation an der WURZEL, 10⁶–10⁸ Jahre, Planet — Platte gekippt → andere Küste, Städte, Sprachen; Einschlag → Aussterben → Radiation | 10/10 Glieder am selben Ort geändert (Bildpaar Weltkarte); Arten-Verlust 50–80 %, Erholung in 5–10 Mio. a | nicht erhoben | — | B (Paläontologie) · W (10/10) |

### same.kopplung.terraform — heute 0, kern 0, fuss ungemessen

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | EIN Eingriff, EINE Region: Wetter lenken über einer Stadt — Regen fällt, wo er gesät wird; nebenan fehlt er | Bildpaar mit und ohne Eingriff an derselben Saat: Regenmenge im Zielgebiet höher, im Lee tiefer; Bilanz ±10 % | Das Spieler-Wort `_setWeather` (feld-dsl.js:943) setzt das EINE Wetter der Welt; „nebenan fehlt er" ist bei einer Nässe je Welt nicht darstellbar | B3, Z8, K9 | W |
| 2 | ein Meer anlegen, eine Wüste begrünen: 10⁵ km², 10² Jahre — Küste, Klima und Leben ziehen nach | Sprung +100 a: neues Ufer mit Bewuchs und Siedlung; Gegenlauf ohne Eingriff: die Wüste bleibt | einzige Umformung: der Graben füllt sich (gelaende.K2, Leiter-Beleg); Hydro nur bei `hydroInit` (SP8) | SP8, K6 | W |
| 3 | Geo-Technik am ganzen Planeten: Spiegel, Aerosol, Kohlenstoff-Entzug — die Mitteltemperatur folgt dem Eingriff; Nebenfolgen (der Monsun kippt) treten auf | Temperatur-Antwort je Eingriff im Band der Klima-Rechnung (2–5 K je Verdopplung); ≥ 1 ungewollte Folge im Bild; Gegenlauf ohne Eingriff | nichts | K7-Klasse | B (2–5 K) · W |
| 4 | Industrie im All: Bergbau auf Asteroiden, Aufzug, Ring — Stoff fließt sichtbar vom All zur Stadt; die Stadt wächst daran | Gegenlauf Aufzug gekappt → die Bautätigkeit der Stadt fällt binnen Jahren; Stoff-Bilanz ±20 % | nichts (Asteroid Grep 0) | — | W |
| 5 | Terraforming einer toten Welt über 10³–10⁴ Jahre — Druck, Wasser, erstes Leben, dann Wälder — in der Folge, die die Physik verlangt | 10 Halte: Luftdruck, Meeresfläche, Bewuchs im Bild in richtiger Folge; Gegenlauf Eingriff abgebrochen → die Welt fällt zurück | nichts | — | W |
| 6 | 100 Saaten: jede Zivilisation formt anders — die Art des Eingriffs folgt Technik, Welt und Wille | Fremdwelt-Probe (R10): Eingriff aus dem Orbitbild gelesen Rang ≥ 0,7; Gegenlauf je Saat | nichts | — | W |

### same.kopplung.zeitreise — heute 0, kern 0, fuss gemessen (alt stoffe.K5, feld.K4)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | Lichtung aus 10 Fällungen, 1 Spielstunde — bleibt über Reload, wächst nach | Baum-Anteil ≤ 30 %, Stümpfe sichtbar, beide Geräte | Taten im Stand (speicher-welten.js:1145); feld.K4 headless | — | W |
| 2 | Tat + 1 Spieljahr vorwärts — Sukzession, Werk gealtert, gleich nach Reload | Pflanzen zurück, Sukzessions-Reihe, Alter nach Reload gleich | Werk-Alter aus Prozess-Tag und `nassTage` (siedlung-satz.js:788–799); der Brand selbst überlebt keinen Reload, die Nässe reist nicht | SP1, SP2, UB4 | W |
| 3 | Sprung 10–100 Jahre vorwärts — Bau gealtert, Pfad verfestigt, Lichtung Wald, Name am Ort | alle Spuren gleichzeitig im Soll ihrer Leiter | Welt-Uhr-Sprung ab 60 s (dirigent-takt.js:2701); Brand im Sprung-Modus (feld-brand.js:489–494); die Nässe ist ein Integral (UB8), der Wasser-Automat holt nichts nach (UB2) | UB2, UB8, SP7 | W |
| 4 | Sprung rückwärts vor die Tat und zurück — Werk fehlt, Wiese ungetreten — nach Rückkehr wieder da | Bildpaar t₀−1 ↔ t₀+1: Werk-Pixel 0 % ↔ ≥ 95 % | `_werkAlter` klemmt die Zeit auf 0 (`Math.max(0, …)` siedlung-satz.js:796): ein Werk vor seinem Akt erscheint ungealtert statt abwesend | — | W |
| 5 | Sprung 10³ Jahre, Megastadt — Tat als Ruine, Schicht und Erzählung, widerspruchsfrei | Grabung bei t+1000 trifft die Tat als Schicht ±1 m; Bewohner nennen sie | nicht erhoben (Ruine als Bild-Klasse in fachwerk-core.js u. a.) | — | W |
| 6 | jeder Sprung in der Geschichte jedes Planeten (10⁹ a), Milliarden Taten — jede Tat in jeder späteren Epoche an ihrem Ort richtig gealtert, für alle gleich | N = 100 Zufallspaare (Tat, Zeit): richtige Sichtbarkeit und Alters-Stufe = 100 %, Widersprüche = 0 | `timeOfDay` NON_BROADCASTABLE (feld-dsl.js:949) → „für alle gleich" reißt an der Temperatur | UB1 | W |
| 7 | zwischen Welten: Tat auf Planet A sichtbar auf B (Licht, Signal, Kolonie) — nach der Laufzeit, die das Gesetz verlangt, nie davor | 100 Taten: Sichtbarkeit auf B zur richtigen Zeit | nichts | — | B (Lichtlaufzeit) |

### same.physik.feuer — heute 0, kern 0, fuss gemessen (alt stoffe.K2, stoffe.K3)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | 1 Zelle — zündet am Zündpunkt, nass nicht; Eis trägt, Lava erstarrt | Fackel an trockenes / nasses Gras: zündet / zündet nicht; Eis trägt den Spieler, y am Spiegel ±5 cm | Fackel kampf.js:2298, :2421–2446; nass: `_nassAt` feld-brand.js:224 und M ≥ mx :310; Eis `PHASE` bau-vorlagen.js:1644; Lava gelaende-core.js:1848 | B4 (das Bett hängt am Auge) | B · W (±5 cm) |
| 2 | eine Wiese (10⁴ m², 2 000 Zellen) — Front mit Wind und Hang 0,5–2 m/s, Halt an Fluss, Fels, nassem Gras; Regen löscht | Front-Tempo im Rothermel-Band, Halt in 100 % der Proben, Bild-p95 ≤ 33 ms während 2 000 Zellen brennen, beide Geräte | FRONT-MIT 0,911 m/s nur im Stub (cloudy + Nässe 0, diag-stand-takt.cjs:2899–2900; stand-linse.cjs:454). Im gekoppelten Spiel: klar 0,074, bewölkt erstickt nach 30 s. 2 000 Zellen kosten 7,4 ms headless (feld-brand.js:458). Das Bild zeichnet ≤ 32 Zellen (:937). p95 nie gemessen | B1, B2, B3, B6, Z28, EB8 | U — 0,5–2 m/s ohne Angabe von Wind und Feuchte, „10⁴ m² / 2 000 Zellen" uneinig (EB8) |
| 3 | ein Haus innen (10³ m³) — Raum zu Raum, Flashover, Rauchschicht unter der Decke, Glas springt | Flashover nach 3–10 min; Raum-Temperatur gegen ISO 834 ±20 % | Flashover, Rauchschicht Grep 0 | K5 | B |
| 4 | 1 km² Wald — Übergang Boden → Krone, Funkenflug bis 1 km | Anteil Fronten, die einen 20-m-Fluss überspringen, im Real-Band (Sturm ja, Windstille nein) | Kronenfeuer, Funkenflug Grep 0; Bäume fallen nur über die Narbe | K5, B4 (Laub nur im Fenster) | U (Real-Band ohne Quelle) |
| 5 | ein Viertel (10³ Gebäude, 10⁵ m²) — Holz und Stroh brennen, Stein hält, Brandgassen stoppen; Stahl verliert ab ≈ 550 °C Festigkeit | Holz- gegen Steinstadt gleicher Saat: verbrannter Anteil ≥ 5:1; Stahlhalle knickt nach Minuten, nicht Sekunden, nicht nie | Tag `brennbar` ohne Feuer-Leser (Z20) | K5, Z20 | B (550 °C) · W (5:1) |
| 6 | eine Stadt (10⁶ Gebäude, 10⁷ m²) — Feuersturm zieht eigenen Wind | Wind am Brandrand ≥ 2× Umgebung; Holzstadt mit Ostwind gegen London 1666 (≈ 1,8 km² in 4 Tagen) Faktor 2 | Feuersturm Grep 0; das Feuer schreibt keinen Wind | K7, K5 | B (London) · U (2×) |
| 7 | Landschaft bis Kontinent (10⁹–10¹² m²), Brandsaison — Waldbrand über Wochen, Rate aus Klima, Ökosystem liest die Asche | Brandfläche gegen FARSITE derselben Lage ±30 %; Erd-Saat: Fläche je Jahr und Biom im Faktor 1,5 gegen GWIS | Das Ausbreitungsgesetz ist FARSITE-artig (feld-brand.js:374–451); Bett jenseits des Rings fehlt; der Brand ist flüchtig; die Saison kennt kein Wetter | B4, B5, SP1, K15 | B |
| 8 | planetar, Äonen, fremde Welten — O₂ 15–35 % (Karbon), Methan-Seen, Eis-Vulkane; jede Phase nach ihrem Diagramm | N = 100 Planeten-Saaten: Phase sichtbarer Oberflächen-Stoffe stimmt mit Phasendiagramm ≥ 95 %; Saat mit O₂ 30 %: Brandfläche ≥ 3× der heutigen | Phasen nur Eis/Wasser (bau-vorlagen.js:1644); Methan Grep 0 | — | B · U (3×) |

### planet.kopplung.wetter-welt — heute 1, kern 1, fuss kern (alt wetter.K2, wetter.K5, licht.K5)

| # | Messname | Soll | Code heute | blockiert durch | Mark. |
|---|---|---|---|---|---|
| 1 | Licht und Himmel — dieselbe Front dimmt Sonne, färbt Himmel | Bildpaar klar/Sturm an derselben Pose: Richtlicht gedimmt, Himmel grau | `grey`/`sun` phyto-core.js:4288–4293 → Licht; licht.K5 an beiden Geräten (Leiter-Beleg) | Z10, Z14 | W |
| 2 | jeder Beweger liest den Wind — Lee schwächer, Tal-Düse stärker | ein Sturmbild: Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°, Lee < frei < Düse | `_windAt` stoff-material.js:233–252 mit Form; 6 Leser (wetter.K5, headless). Der Mäander erreicht 41° gegen θ0 der Wolken | Z11, Z12, Z13 | B (Richtung) · W (±20°) |
| 3 | Nässe, Pfützen, Pegel — poröse Stoffe dunkler, Pfützen in Senken | Luma porös nass/trocken 0,5–0,8; Pfützen in Senken r ≥ 0,5 | Nässe → Shader bild-himmel.js:3082; Mulde gelaende-boden.js:2509; Pegel bild-himmel.js:3085. Nässe EIN Skalar (B3) | B3, SP2 | U (Luma-Band ohne Quelle) |
| 4 | Lebewesen und Bewohner — Tiere suchen Schutz, Bewohner fliehen den Regen | Anteil im Freien bei Sturm ≤ 30 % des klaren Werts; Bildpaar Marktplatz | Bewohner `regen.ab` koerper-core.js:5218, :5341 über das Wort am Spieler (siedlung-bewohner.js:2223); Herden: FEHLT | K10, Z8, Z9 | W |
| 5 | Gelände über 10 Spieljahre — Starkregen gräbt Rinnen, Dünen wandern, Landfall versetzt Küste | Bildpaar vor/nach an derselben Pose: Dünenversatz in Windrichtung, Küstenlinie messbar verändert | Düne Grep 0; Erosion nur zur Gen-Zeit (gelaende-core.js:361) | UB4, SP3 | B (Richtung) · W |
| 6 | Zivilisation, 100 Orte — Bauform folgt dem Klima | Dachneigung ↔ Schneelast r ≥ 0,5; Innenhof, Stelzen, Windturm ≥ 3× häufiger in ihrer Klimazone | Schneelast Grep 0; Stelzen in fachwerk-core.js (nicht erhoben) | K14 | U |

Zählung der Markierungen über alle 75 Sprossen (`node …/scratchpad/tafel/marken.cjs vision/kopplung/tafel.md`):
- B steht in 30 Sprossen, W in 52, U in 12;
- rein gewählt sind 35, rein begründet 12, rein unsicher 9, gemischt 19.

Die Sprossen, zu denen heute Code läuft, sind: kaskade#1–2, physik.feuer#1–2, wetter-welt#1–4, stoerung#1–2, ereignis#1–2.
- Nur zwei von ihnen tragen ein begründetes Soll: physik.feuer#1 (nass zündet nicht, Eis trägt) und wetter-welt#2 (eine Windrichtung).
- Alle übrigen sind gewählt oder unsicher.
- Die begründeten Sollwerte liegen sonst ab Sprosse 3 aufwärts, wo kein Code läuft.

---

## 6. ZWEI ZAHLEN FÜR DIE ENTWERFER

### 6.1 Was eine Kopplung heute je Takt kostet

| Kopplung | Zahl | Herkunft |
|---|---|---|
| Brand-Front je Zelle und Schritt | 7,4 ms für 2 000 brennende Zellen = **3,7 µs je Zelle und Schritt** | **Zitat** feld-brand.js:458 („headless, Radeon-Laptop"); stammt aus der Zeit VOR der Teilung in feld-brand.js; am Kopf **nicht gemessen** |
| Brand-Budget | 0,25 ms je Bild, mindestens 8 Zellen. Bei 3,7 µs/Zelle sind das ≈ 68 Zellen je Bild (gerechnet, nicht gemessen); die Linse zählt ≤ 64 Einheiten je Zelle und Schritt. | feld-brand.js:914–915; scripts/lib/stand-linse.cjs:396 |
| Brand-Bild | ≤ 384 Flammen aus ≤ 32 Zellen bis 160 m — Kosten **nicht gemessen** | feld-brand.js:930–937 |
| Nässe | ein Skalar je Takt (O(1)) — **nicht gemessen** | bild-himmel.js:3060–3087 |
| Pegel-Faltung | 5,4 ms einmal je neuer Marke | Zitat wasser-hydro.js:203 |
| Bestand / Feld-Takt | ≈ 0,25 ms je Takt (10 s) | Zitat kreatur-leben.js:3728 |
| Wasser-Automat Neu-Mesh | ≈ 4 ms (jeder 4. Bild-Takt) | Zitat wasser-zellen.js:2491–2493 |
| Planer gesamt | Median 10,0 / p95 16,4 ms | Zitat dirigent-takt.js:1881 |
| Rahmen (Profi-Band E) | GTX CPU-Takt p95 4,7–6,3 ms (reißt an Genesis Third 6,3 > 5,8) | CLAUDE.md, Stand; Beleg `koordination:bericht/1810-f6-gtx.md` |
| p95 im brennenden Hektar, Sturm-Bild an der Radeon | **nicht gemessen** | ereignis#2, wetter-welt-Beleg |

### 6.2 Zellen auf dem Schirm und im Wirkkreis (16-m-Zellen, 256 m²)

| Kreis | Ausdehnung | Zellen |
|---|---|---|
| Glut-Block (Furcht und Licht suchen in Blöcken) | 64 m | 4 × 4 = 16 je Block |
| Furcht (`noticeRadius`) | r 22 m | ≈ 6 |
| Wiese der Sprosse physik.feuer#2 | 10⁴ m² | 39 |
| Brand-Bild | r 160 m | ≈ 314 (Kreis; Quadrat 400), davon höchstens **32** gezeichnet |
| Chunk-Ring 4 (Vorgabe, dirigent-kern.js:659) | 9 × 43,2 = 388,8 m Seite (±194 m) | ≈ 590 |
| Ohr des Brands | r 256 m | ≈ 804 |
| Wege-Karte nah | 512 m | 1 024 |
| Chunk-Ring 12 (Maximum, bild-sicht.js:2845) | 25 × 43,2 = 1 080 m Seite | ≈ 4 556 |
| Wege-Karte fern / Hydro-Kachel | 2 048 m | 16 384 |
| Fern-Neigung | ±8 km | ≈ 10⁶ |

Die Bindung „Kosten an Schirm + Änderung":
- Der Ring-4-Schirm trägt ≈ 590 Zellen.
- Das Budget von 0,25 ms je Bild trägt ≈ 68 Zell-Schritte (gerechnet).
- Ein Brand-Schritt dauert 1 s Welt-Uhr; bei 60 Hz kommen 60 Bilder je Schritt.
- Rechnung, nicht gemessen: Das Budget reicht für ≈ 4 000 brennende Zellen je Welt-Sekunde. Das entspricht dem Ring-12-Schirm.
- Das Bild zeichnet davon 32.

---

## Anhang — das Register (224 Größen)

`°` = ohne Einheit; F = FOLGT, G = GESETZT; in Klammern die Blatt-Zeilen. Erzeugt mit `register.cjs --liste` (siehe 0).

**Feuer (33)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| Nachbarschaft 8 | G° | feuer#4 |
| `minStoff` 0,15 | G° | feuer#5, stoff#10, pflanzen#28 |
| Bett-Klasse | G° | feuer#7 |
| Mineral | F | feuer#15, stoff#19 |
| `trocken` 0,06 | G | feuer#19, richter#28 |
| `faser` 0,35 | F | feuer#20, richter#28 |
| `nass` 2,5 | F | feuer#21, richter#28 |
| M | F | wasser#28, stoff#11, pflanzen#24 |
| WAF | F | feuer#26 |
| Gefälle | F | feuer#27 |
| R | F | feuer#28 |
| ecc | F | feuer#29 |
| `lbMax` | F | feuer#29, richter#33 |
| Rückfeuer | F | feuer#30 |
| t_r | F | feuer#31 |
| `ende` | F | feuer#32 |
| `an` | F | feuer#33 |
| `glut` | G° | feuer#34, wesen#6 |
| H·w | F | feuer#35, stoff#21 |
| Byram / Flammenlänge | F | feuer#36 |
| Rauch-Rate | G | feuer#37, stoff#29 |
| Rauch-Steigen | G | feuer#38 |
| Rauch-α | F | feuer#39 |
| Rauch-Bild | G° | feuer#40 |
| `schein` | G° | feuer#41 |
| `hoerM` | G | feuer#42 |
| `BRAND.licht` | G° | feuer#45 |
| Q_ig | F | stoff#20 |
| `versengt` | G° | stoff#27 |
| Flammen-K | G | stoff#28 |
| Brennglas-Fleck | G | wetter#32, stoff#30 |
| Brennglas-Radius | G | wesen#28 |
| Wind-Deckel | F | richter#32 |

**Wetter (24)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| Wort | F° | wetter#1 |
| Front f | G° | wetter#2 |
| Front-Feuchte | G° | wetter#3 |
| `zugMS` | G | wetter#4 |
| `rain` | G° | wetter#7, wasser#1, wesen#8, richter#24 |
| `fog` | G° | wetter#8 |
| `sun` | G° | wetter#9 |
| `grey` | G° | wetter#10 |
| `wind` | G° | wetter#11, richter#22 |
| `cloudCover` | G° | wetter#12 |
| INTENSITY | G° | wetter#13 |
| Windrichtung | G | wetter#17, wesen#17 |
| `staerke` | F° | wetter#18 |
| Böe | G° | wetter#19 |
| `_windWob` | G° | wetter#20 |
| Form | F° | wetter#21 |
| U₁₀ | G | feuer#25, wetter#22 |
| `sturmMS` | G | richter#23 |
| `uWindStrength` | G° | wetter#23 |
| Temperatur | G | feuer#24, wetter#24 |
| Höhen-Kühlung | F | wetter#25 |
| Wolke an der Temperatur | G | wetter#26 |
| Saison-Phase | F° | wetter#30 |
| Sonnenstand | G | wetter#31 |

**Wasser (29)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| Regen-Stempel | F° | wasser#2 |
| Regen-Mittel | F° | wasser#3 |
| `naesse` | G° | feuer#23, wetter#15, wasser#4, stoff#13, wesen#26, richter#27 |
| `versickern` | G° | wasser#5 |
| `regenAb` | G° | richter#25 |
| `benetzenS` | G | gitter#60, richter#26 |
| `verdunstS` | G | gitter#61 |
| `_feuchteAt` | G° | feuer#22, wasser#6, stoff#12, pflanzen#17 |
| `PEGEL.spende` | G | wasser#8 |
| `PEGEL.regen` | G | wetter#14, wasser#9 |
| F_j | F° | wasser#10 |
| Lag j | F° | wasser#11 |
| Grund B | G° | wasser#12 |
| Pegel-Zustand | F | wasser#13 |
| Schnee-Pegel | G | wasser#14 |
| Schmelze | F | wasser#15 |
| Hub | F | wasser#16 |
| Meeresspiegel | G | wasser#17 |
| See-Spiegel | F | wasser#18 |
| Fluss-Spiegel | F | wasser#19 |
| Fluss-Breite | F | wasser#20 |
| Strömung | G | wasser#21 |
| Wasser-Feld | F | wasser#22 |
| WATER | F° | wasser#23 |
| Füllgrad | G° | wasser#24 |
| Stau | F | wasser#25 |
| Gefäß | G | wasser#26 |
| `nassTage` | F | wetter#16, wasser#27 |
| Eis-Dicke | F | wasser#29 |

**Stoff (20)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| ρ | G | feuer#14, stoff#1, pflanzen#23 |
| c | F | feuer#17, feuer#18, stoff#2 |
| T_zünd | F | feuer#16, stoff#3 |
| σ | F | feuer#10, stoff#4, pflanzen#20, richter#30 |
| Last | F | feuer#9, stoff#5, pflanzen#18, richter#30 |
| Tiefe | G | feuer#11, stoff#6, pflanzen#19, richter#31 |
| Heizwert | F | feuer#12, stoff#7, pflanzen#21 |
| mx | F | feuer#13, stoff#8, pflanzen#22, richter#29 |
| L_v | F | feuer#18, stoff#14 |
| Eis L, k | F | stoff#15 |
| Tag `wärmeleitung` | G° | stoff#16 |
| Tag `brennbar` | G° | stoff#17 |
| Tag `dichte` | G° | stoff#18 |
| Asche-Kanal | F° | stoff#22, pflanzen#8 |
| Asche-Zeile | G | stoff#23 |
| Asche-Albedo | F | stoff#24 |
| Esse | G | stoff#31 |
| `BOGENMAT.rho` | G | stoff#32 |
| `ARENA_RHO` | G | stoff#33 |
| `ZIELMAT` | G° | stoff#34 |

**Pflanzen (19)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| `lebendig` | G° | feuer#6, stoff#9, pflanzen#1 |
| Overlay | G° | pflanzen#2 |
| Narbe | G° | feuer#43, stoff#25, pflanzen#3, wesen#22 |
| Heil-Dauer | G | feuer#43, stoff#25, pflanzen#4, wesen#22, gitter#59 |
| Wuchs | F° | pflanzen#5 |
| `wasserBasis` | G° | wasser#7 |
| Nährstoff | G° | feuer#43, stoff#25, pflanzen#6, wesen#22 |
| Sukzession | G° | stoff#26, pflanzen#7 |
| Gras-Bedeckung | G° | pflanzen#9 |
| Grün-Kanal | G° | pflanzen#10 |
| Kronen-Streu | F° | pflanzen#11 |
| Bodenlicht | F° | pflanzen#12 |
| Kronenlicht Platz | G° | pflanzen#13 |
| `sd` | G° | pflanzen#14 |
| Streu-Dichte | G° | pflanzen#15 |
| Baum-Alter | F° | pflanzen#16 |
| Saison-Tönung | F° | pflanzen#25 |
| Vergilben | G° | pflanzen#26 |
| Orts-Wuchs | F° | pflanzen#27 |

**Wesen (23)**

| Größe | Urteil | Blatt-Zeilen |
|---|---|---|
| `noticeRadius` | G | wesen#1 |
| `wariness` | G° | wesen#2 |
| `flee` | G° | wesen#3 |
| `fluchtWeg` | G° | wesen#4 |
| Ort der Bedrohung | F | wesen#5 |
| Flucht-Tempo | F | wesen#7 |
| Bewohner `regen.ab` | G° | wesen#9, richter#34 |
| `regenfest` | G° | wesen#10 |
| `planH` | G | wesen#11 |
| Wetter-Gemüt | G° | wesen#12 |
| Gefühl `glut` | G° | wesen#13 |
| `heatResist` | G° | wesen#14 |
| `SCENT.rangeM` | G | wesen#15 |
| `windFactor` | G° | wesen#16 |
| `jagd.scent` | G | wesen#18 |
| Vogel-Lied | G° | wesen#19 |
| Schwarm | G° | wesen#20 |
| Bestäuber | G° | wesen#21 |
| Fraß | F° | wesen#23 |
| `TRITT.tritte` | G | wesen#24 |
| `TRITT.erholTage` | G | wesen#24, gitter#58 |
| Schnee-Tritt | F | wesen#25 |
| `FORAGE.reach` | G | wesen#27 |

**Gitter/Uhr (57)**
- Die Zeilen G1–G28 und U1–U29 des Gitter-Blatts: G1 = feuer#1, richter#20; G13 = feuer#8; U6 = feuer#2, richter#21; U7 = feuer#3; U8/U9 = feuer#44; U16/U17 = wetter#5/6; U19 = wetter#28; U21 = wetter#27; U22 = wetter#29.
- FOLGT nur U1 `spielZeit` und U28 `creatureAnimationTime`.
- Ohne Einheit: G9, G12, G13, G14, G17, G27, U4, U9, U11, U25, U26, U27.
- U30–U33 des Blatts sind dieselben Größen wie `TRITT.erholTage`, Heil-Dauer, `benetzenS` und `verdunstS` und zählen dort.

**Richter (19)**
- r1–r19 des Richter-Blatts (Trocken-Dauer, Zellen, `fB`, Warm-Regel, Sätze, `regenS`, `fC`, Herd-Ring, `BETT_VOLL`, `KRONE_OFFEN`°, FRONT-MIT, FRONT-GEGEN, BRAND-BLIND, Köpfe, REGEN, Brand-Flucht, Ketten-Tiefe, Pegel-Hub P4, Sukzession r).
- Alle sind G.
- Die Zeilen r20–r34 sind Größen anderer Domänen und zählen dort.
