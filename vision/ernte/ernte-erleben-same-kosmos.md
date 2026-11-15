# Ernte-Liste Meisterkarte 2 — erleben (40) · same (28) · kosmos (9)

Stand 2026-11-15 21:09, nur gelesen (Karte, Stationen g1–g6, stand.json, Spiel-Klon am Kopf 2b826a89). Keine Fahrt, keine GPU.

## 1) Zählung (97 geprüfte Sprossen: S1 jeder Leiter, S2/S3 nur, wo die Sprosse davor heute wahr ist; klang.raum S2 auf Auftrag trotz S1 = F)

| T | N(S) | N(M) | N(L) | F | P | unklar |
|---|---|---|---|---|---|---|
| 2 | 8 | 10 | 0 | 38 | 10 | 29 |

- Die beiden T stehen SCHON in der Tafel (klang.K4#2 → erleben.klang.ereignis S1 und S2). Neue T-Zeilen: **0**.
- Keine der fünf genannten Kern-Sprossen hat eine `alt`-Station, die ihren Richter GENAU misst. Der Grund ist entweder headless (klang.K3, klang.K1, spielgang.K1), eine andere Zahl (ankunft.K1: ein Kalt-Boot mit Soll 5/10 s gegen ≥ 4 Boots mit Preis 60 s) oder eine fehlende Größe (klang.raum S1: ITD).
- Z3: eine N-Sprosse ≥ 2 zählt erst, wenn S1 steht. klang.raum S2 ist N(S), hebt aber nichts, solange S1 F ist.

## 2) Tabelle

Abkürzung: `st/` = `…\scratchpad\ernte\quelle\stationen\`, `stand` = stand.json (Gerät, SHA). Spiel-Pfade sind relativ zum Klon `C:\Users\micha\AnazhRealm-profiband`.

### erleben

| leiter | sprosse | urteil | klasse | station oder probe | beleg (Datei:Zeile) | aufwand |
|---|---|---|---|---|---|---|
| erleben.spieler.praesenz | 1 | F | – | Taste→Bild an der Radeon p95 81,6–235 ms gegen 50 ms | stand leib.K1#1 radeon rot; leib.K1#1 st/g5.js:4150; Karte-Beleg §25.K1 | – |
| erleben.spieler.rolle | 1 | N | Ort | EINE Sitzung, vier Verb-Gruppen (gehen: Tier flieht · bauen: Werk steht · fahren: Wagen fährt · kämpfen: Treffer). Je Gruppe ein Bildpaar vorher/nachher an fester Kamera, Klassen-Masken-Diff über dem Rauschen (Werkzeug: die bild-diff-Hülle aus speicher.K4#2) | bauen.K5#2 st/g4.js:2065 (radeon 4ee205bd, gtx b4bcf19c GRÜN) · halten.K1#2 st/g5.js:4963 (beide GRÜN) · fahrzeug.K2#1 st/g5.js:5612 (beide GRÜN) · Flucht luftwasser.K2#2 st/g2.js:5416 (headless) | M |
| erleben.spieler.rolle | 2 | F | – | kein Bewohner übernehmbar; Bewohner tragen einen Beruf, keine Spieler-Verben | stamm/siedlung-bewohner.js:783-798 (Karte-Beleg) | – |
| erleben.spieler.hand | 1 | F | – | Eingabe→Wirkung an der Radeon über 50 ms | stand halten.K2#1 radeon rot (gtx GRÜN 41 ms); st/g5.js:4548 | – |
| erleben.spieler.wegfindung | 1 | unklar | – | zu prüfen: Landmarke 1–3 km an 50 Saaten mit Kontrast ≥ 0,1; nie gemessen | stamm/bau-vorlagen.js:855 (Karte-Beleg, Formation im Genom) | (L) |
| erleben.spieler.zeit | 1 | F | – | Sonnenbahn ohne Breite, keine Ephemeride | welt-licht.js:696-714 (Karte-Beleg kosmos.himmelsmechanik); licht.K1#1 gtx rot | – |
| erleben.spieler.gemeinsam | 1 | F | – | zwei physische Geräte nie verbunden gemessen (§22.K4 0/2) | stamm/netz-p2p.js:451 (Karte-Beleg) | – |
| erleben.spieler.nichtleib | 1 | F | – | keine Perspektive ohne Leib | Karte-Beleg | – |
| erleben.spieler.forscher | 1 | F | – | kein Instrument (Fernrohr 0) | Karte-Beleg (Grep 14.11.) | – |
| erleben.schoepfen.hebel | 1 | F | – | Bildvergleich Studio ↔ Welt reißt; Wille→Bild an beiden Geräten rot | stand studios.K4#1/#2 rot an beiden (st/g4.js:2156); bauen.K1#2 rot (st/g4.js:1657); Statik 10/10 nur headless (bauen.K3#2) | – |
| erleben.schoepfen.satz | 1 | unklar | – | zu prüfen: der Korpus im echten Fenster und Hänger > 100 ms (ki.K5#2 offen); heute 41/41 nur headless | stand ki.K1#2 headless 039509b2; st/g4.js:1308 | (M) |
| erleben.schoepfen.gesetz | 1 | N | Ort | Regel im Spiel schreiben, zwei Peers in EINER GPU-Sitzung, Bildpaar der Wirkung bei A und bei B | ultiversum.K4#1 st/g5.js:5524 (headless GRÜN: „A schreibt …, es wirkt bei beiden“) | M |
| erleben.schoepfen.gesetz | 2 | P | – | Blindvergleich gegen Studio-Werke | Richter | – |
| erleben.schoepfen.gespraech | 1 | P | – | 20 Neulinge | Richter | – |
| erleben.schoepfen.teilen | 1 | N | Ort | Bauplan exportieren und im selben Profil importieren, Bildpaar an derselben Pose (bild-diff-Hülle von speicher.K4#2, Soll ≤ 1 %) | tore.K5#1 st/g5.js:5232 (headless GRÜN, Bau-Hash A = B 9c183437) | M |
| erleben.schoepfen.teilen | 2 | unklar | – | zu prüfen: fremdes Gerät mit frischem Profil (§22.K5 1/2) | Karte-Beleg | – |
| erleben.schoepfen.schutz | 1 | N | Ort | geteilte Welt mit verbotener Op laden, Bildpaar der eigenen Welt vorher/nachher plus die benannte Abweisung im DOM | ultiversum.K5#1 st/g5.js:4794 (headless GRÜN); stamm/feld-dsl.js:194 RULE_FORBIDDEN_EFFECT_OPS | M |
| erleben.schoepfen.schutz | 2 | unklar | – | zu prüfen: Korpus ≥ 100 Injektionen; heute 7 (ultiversum.K5#2) | stand ultiversum.K5#2 headless | – |
| erleben.sinn.ziele | 1 | N | Ort | affekt.K1#2 (GPU) um die Zehn-Taten-Folge erweitern: dieselbe Tat 10×, dB am Ort und an der Nachbarzelle (Zahl druckt schon affekt.K1#1 / diag-weltakt-wache) | affekt.K1#2 st/g2.js:4705 (beide GRÜN); affekt.K1#1 st/g2.js:4608 (δ 0,1607 → −0,0018, Nachbar 0 dB) | S |
| erleben.sinn.ziele | 2 | P | – | Blind-Spieler | Richter | – |
| erleben.sinn.legenden | 1 | unklar | – | zu prüfen: führt eine Tagebuch-Zeile zu einer Spur im Bild; nie gefahren | stamm/dienst.js:385, stamm/kreatur-leben.js:898 (Karte-Beleg) | (M) |
| erleben.sinn.tod | 1 | unklar | – | zu prüfen: das Gefährt bleibt nach dem Tod, wo es fiel (nicht gemessen); Radeon ohne Messung | halten.K5#1 st/g5.js:4890 (gtx GRÜN: Anker 0,0 m, Abdruck gleich; radeon rot) | (M) |
| erleben.sinn.entdeckung | 1 | P | – | Blind-Agent (R11) | Richter | – |
| erleben.sinn.takt | 1 | unklar | – | zu prüfen: „tote Minute“ hat im Spiel kein Maß | Karte-Beleg (ungemessen) | (M) |
| erleben.sinn.sog | 1 | P | – | 12 blinde Neulinge | Richter | – |
| erleben.sinn.staunen | 1 | P | – | blinde Spieler | Richter | – |
| erleben.sinne.sicht | 1 | F | – | kein Spektrum, kein UV | Karte-Beleg (Grep 0) | – |
| erleben.sinne.hoeren | 1 | F | – | kein Echo-Sinn | Karte-Beleg | – |
| erleben.sinne.geruch | 1 | unklar | – | zu prüfen: Gegenlauf (Witterung aus → Suchzeit ≥ 3×) laut Karte nur headless; Station in g1–g6 nicht gefunden | stamm/koerper-seele.js:1578-1604 (Karte-Beleg) | (M) |
| erleben.sinne.feld | 1 | F | – | kein Magnetfeld | Karte-Beleg | – |
| erleben.sinne.genom | 1 | unklar | – | dieselbe Messgröße wie sinne.geruch S1 (R9); zählt dort | Karte-Beleg | – |
| erleben.sinne.signale | 1 | F | – | kein Warnruf | Karte-Beleg (Grep 0) | – |
| erleben.sinne.gesehen | 1 | F | – | Wild bemerkt über Radien, nicht über Farbe | Karte-Beleg | – |
| erleben.bild.ferne | 1 | unklar | – | Koschmieder steht an beiden Geräten (0,87–1,06); zu prüfen: „Ferne = Nähe ≥ 0,8 an 12 Posen“, nie gefahren | stand ferne.K1#1/#2 beide GRÜN (st/g3.js:2487, 2554) | (M) |
| erleben.bild.nacht | 1 | F | – | Schatten-Kontrast 0,2484:1 statt ≥ 3:1 | stand schatten.K5#1 radeon rot 63655917 | – |
| erleben.bild.flaeche | 1 | F | – | Halbschatten steht (0,95/0,96 cm/m an beiden), aber Albedo gegen Tabellenwert rot | stand material.K1#1/#2 rot an beiden (st/g3.js:2908); schatten.K1#2 GRÜN | – |
| erleben.bild.himmel | 1 | unklar | – | zu prüfen: Himmels-Leuchtdichte gegen gemessenen Klarhimmel; nur das Verhältnis 5–12,5 ist gemessen | licht.K2#1 st/g3.js:2351 (beide GRÜN, anderes Maß) | (M) |
| erleben.bild.auge | 1 | unklar | – | zu prüfen: Pixel-Varianz der ganzen ruhenden Fläche; gemessen sind nur die Schatten-Reprojektion (0,00 %, Radeon) und die Pop-Pixel (0,0439 %/s, Radeon) | schatten.K2#1, lod.K2#1 (stand, nur radeon) | (M) |
| erleben.bild.kamera | 1 | F | – | keine freie Kamera, kein Fotomodus | Karte-Beleg (Grep 0) | – |
| erleben.klang.raum | 1 | F | – | Laufzeitunterschied (ITD) fehlt im Spiel: der Raum schwenkt nur den Pegel (StereoPanner) | klang-core.js:1012, 1191, 1277 (createStereoPanner); stamm/klang.js:370 (`glut.pan`); klang.K3#1 st/g6.js:3680 misst nur ILD, headless | – |
| erleben.klang.raum | 2 | N | Ort | klangRaumProbe (RT60 je Ort, Verdeckung, Bau-Dichte-Mutation) in die GPU-Sitzung beider Geräte heben; Urteil klangRaumUrteil unverändert. Zählt nach Z3 erst mit S1 | klang.K3#2 st/g6.js:3735 (headless GRÜN: RT60 0,283/0,649/1,522/3,195 s, Haus −11,2 dB); Probe st/g6.js:1963, KLANG_RAUM st/g6.js:2268 | S |
| erleben.klang.ereignis | 1 | **T** (bestehend) | Ort | klang.K4#2 | st/g6.js:3815 (Schritte ≥ 3 Stoffe, n ≥ 5, Abstand ≥ 300 Hz); stand beide GRÜN 4ee205bd | – |
| erleben.klang.ereignis | 2 | **T** (bestehend) | Ort | klang.K4#2 | st/g6.js:3815 (Motor r, Landung r ≥ 0,9, Doppler); stand Motor r 1,0000 an beiden | – |
| erleben.klang.ereignis | 3 | P | – | Jury, dann Klassifikator | Richter | – |
| erleben.klang.landschaft | 1 | N | Ort | den Orte-Teil des Klang-Zensus (Soll je Ort, „jeder Pegel hat einen Körper“) wie den Körper-Teil von klang.K4#2 in die GPU-Sitzung holen; im selben Lauf klang.K2#1 (Wind r) | klang.K1#1 st/g6.js:3457 (headless GRÜN: 20 Vogel-Leiber, Dorf glut −27,2 dB); klang.K2#1 st/g6.js:3585 (r 0,79/0,73, beide GRÜN); Vorbild: Kommentar st/g6.js:3815ff. | S |
| erleben.klang.landschaft | 2 | F | – | keine 20 Wagen in der Welt (Verkehr = PFLICHT C, keine Station) | docs/PFLICHT-OFFEN.md C | – |
| erleben.klang.stimme | 1 | F | – | Bewohner sprechen nicht; nur speechSynthesis | stamm/werkstatt-hud.js:71-89 (Karte-Beleg) | – |
| erleben.klang.musik | 1 | P | – | Hörer-Blindtest | Richter | – |
| erleben.klang.getuemmel | 1 | N | Ort | 10 min Spielgang an beiden Geräten mit Spitzen-Messer am Master-Abgriff (max dBFS) und dem Duck-Teil aus affekt.K5#2 | Spitzen-Wand klang-core.js:420, 1154; Duck Schritt 8,51 · Ruf 10 · Gespräch 12 dB (affekt.K5#2 st/g2.js:4858, headless); klang.K5#2 st/g6.js:3952 (0 Aussetzer in 28 s) | M |
| erleben.klang.getuemmel | 2 | F | – | Bewohner sprechen nicht, also keine WER | wie klang.stimme | – |

### same

| leiter | sprosse | urteil | klasse | station oder probe | beleg (Datei:Zeile) | aufwand |
|---|---|---|---|---|---|---|
| same.physik.koerper | 1 | N | Ort | physik.K3#1-Probe (Kisten und Fass, Ruhe, Zittern, Boden-Spalt) in die GPU-Sitzung; der Spalt aus dem Bild | physik.K3#1 st/g1.js:3571 (headless GRÜN: Ruhe 0,87 s, Zittern 0,00 cm, Boden 0,002 m) | M |
| same.physik.koerper | 2 | unklar | – | zu prüfen: Δv gegen die Impulsbilanz (gemessen nur GT 9,13 → 8,93 m/s an einem Fass) | stand physik.K3#1 | – |
| same.physik.tragen | 1 | F | – | Knicken mit Eichfaktor knickSicherheit 500, absolut nicht wahr | stamm/bau-buch.js:2580-2591 (Karte-Beleg) | – |
| same.physik.fluid | 1 | N | Ort | eigener Lauf der Graben-Probe K2_PROBE (zweiter Eintrag, R9); der Richter ist wörtlich der von gelaende.K2#1, der schon mensch.nahrung.erdbau S1 hebt | gelaende.K2#1 st/g1.js:1693-1720 (Gräben über das Verb, „über dem Spiegel 0“, gefüllt 34–367 ms, beide GRÜN) | S (R9) |
| same.physik.fluid | 2 | F | – | Zellen-Wasser ohne Impuls | stamm/wasser-zellen.js:3 (Karte-Beleg) | – |
| same.physik.feuer | 1 | unklar | – | zu prüfen: zündet eine Fackel trockenes Gras, nasses nicht (nicht gelesen). Eis trägt (stoffe.K3#1, headless) | stoffe.K3#1 st/g1.js:3275 | (M) |
| same.physik.verformung | 1 | N | Ort | physik.K4#1-Probe (Flegel am Leib, Seillänge längs) in die GPU-Sitzung beider Geräte | physik.K4#1 st/g1.js:3677 (headless GRÜN: Länge 0,328–0,328 m) | M |
| same.physik.verformung | 2 | unklar | – | zu prüfen: Fahne ↔ Gras r, Hängebrücke unter 90 kg | – | – |
| same.physik.reaktion | 1 | F | – | keine Massenbilanz Holz → Asche + Rauch | Karte-Beleg | – |
| same.physik.flug | 1 | F | – | kein Luftwiderstand | Karte-Beleg | – |
| same.physik.stoffe | 1 | P | – | Blind-Jury | Richter | – |
| same.entfaltung.gleichheit | 1 | unklar | – | zu prüfen: Horizont-Linie Radeon ↔ GTX an derselben Pose; nie gemessen (headless byte-gleich) | Karte-Beleg; feld.K2 | (M) |
| same.entfaltung.schirm | 1 | unklar | – | zu prüfen: Radeon stehend am Kopf (PFLICHT E, ABAB steht aus) | stand profiband.K1/K3 rot an beiden | – |
| same.entfaltung.reise | 1 | unklar | – | zu prüfen: Anteil ganzer Bilder im 1-km-Gang; streaming.K1#1 ohne Zahl | stand streaming.K1#1 headless rot | (M) |
| same.entfaltung.abwesenheit | 1 | F | – | Wiederkehr nach 1 h: max 1,826 m (Radeon) / 1,204 m (GTX) gegen ≤ 1 m | mensch.K2#2 st/g2.js:5211, stand (radeon, gtx) | – |
| same.entfaltung.vielfalt | 1 | P | – | Panel | Richter | – |
| same.entfaltung.akte | 1 | N | Ort | speicher.K4#2 setzt vor dem Reload 100 Taten statt drei (Schleife über Bau/Grube/Wasser an Rasterorten), Urteil bild-diff ≤ 1 % unverändert | speicher.K4#2 st/g6.js:4229 (0,71/0,80 %, beide GRÜN); feld.K2#1 st/g1.js:2779 (Edits byte-gleich über Reload) | S |
| same.entfaltung.akte | 2 | N | Ort | wie S1 mit 10³ Edits, dazu Stand-Bytes je Tat und t(Kontrolle) mit ↔ ohne Taten | speicher.K3#2 st/g6.js:4165 (headless GRÜN, ≤ 100 kB je 1000 Edits) | M |
| same.entfaltung.akte | 3 | unklar | – | zu prüfen: zwei Gäste im Bild; alte Stände laden headless 138/138 (speicher.K5#2) | stand speicher.K5#2 | – |
| same.massstab.spanne | 1 | F | – | Fern-Saum ROT, flache Ebene | Karte-Beleg | – |
| same.massstab.nahe | 1 | unklar | – | zu prüfen: Spektrum gegen Fotos der Bodenklasse; kein Korpus | Karte-Beleg | – |
| same.massstab.sprung | 1 | F | – | Preis der Sprosse reißt: GTX p95 49,9 ms > 33, Radeon ganz nach 45–58 s > 30 s | streaming.K3#1 st/g6.js:2991, stand | – |
| same.massstab.physik | 1 | unklar | – | Fall stimmt (Aufprall 12,6 m/s aus 8 m, nur GTX); zu prüfen: Bremsweg gegen μ, Radeon | halten.K5#1 st/g5.js:4890; fahrzeug.K1#2 headless | (M) |
| same.gedaechtnis.alter | 1 | unklar | – | Δ Albedo oben 0,038, aber nord 0,008 ↔ süd 0,007: „Nord- und Wetterseite verschieden“ ist fraglich; nur headless | stoffe.K4#1 st/g1.js:3742, stand | (M) |
| same.gedaechtnis.pfad | 1 | N | Ort | stoffe.K4#2-Pfad-Teil (100 Gänge, Büschel auf/neben dem Weg, über Reload) in die GPU-Sitzung, Büschel aus dem Bild gezählt | stoffe.K4#2 st/g1.js:3763 (headless GRÜN: Weg 13 → 3, daneben 17 → 17, über Reload) | M |
| same.gedaechtnis.pfad | 2 | unklar | – | zu prüfen: treten Bewohner den Pfad aus | stamm/dirigent-takt.js:1163 (Karte-Beleg) | – |
| same.gedaechtnis.schicht | 1 | F | – | Boden ohne Geschichte | Karte-Beleg | – |
| same.preis.ankunft | 1 | N | Ort | ANKUNFT_KALT ×4 je Gerät, Urteil kaltKontrolle mit Soll ≤ 60 s (heute Radeon 8,78 s, GTX 16,6 s) | ANKUNFT_KALT st/g6.js:1170, ankunft.K1#1 st/g6.js:2903 (EIN Boot, Soll 5/10 s); scripts/diag-boot-stage.cjs:502-504 (t(Kontrolle) per W); stand ankunft.K2#1 radeon 818b466d 8,78 s | S |
| same.preis.ankunft | 2 | unklar | – | zu prüfen: Umfang Dorf statt Spawn; Lücke ≤ 2 % nur an der Radeon (ankunft.K2#1 gtx rot) | stand ankunft.K2#1 | – |
| same.preis.takt | 1 | unklar | – | zu prüfen: Radeon stehend am Kopf (PFLICHT E) | Karte-Beleg | – |
| same.preis.bytes | 1 | N | Ort | Byte-Zähler (CDP `Network.loadingFinished`, encodedDataLength) in ANKUNFT_KALT; Soll ≤ 50 MB roh. Datei-Summe 15,2 MB ist die Schranke; Mehrfach-Laden durch Worker ist ungeprüft | Karte-Beleg (12,9 + 2,3 MB); diag-boot-stage.cjs ohne Byte-Zähler (Grep) | M |
| same.preis.bytes | 2 | unklar | – | zu prüfen: Studio-Besuch, ≤ 20 MB | – | – |
| same.preis.eingabe | 1 | F | – | Eingabe → Pixel an der Radeon 235 ms > 100 ms | stand leib.K1#1 radeon rot; Karte-Beleg erleben.spieler.praesenz | – |
| same.preis.zugang | 1 | N | Ort | spielgang.K5#1-Probe (DOM-Zählung harter UI-Zeilen, Umschalten DE/EN) in die GPU-Sitzung beider Geräte, die Code-Zählung bleibt draußen (R2) | spielgang.K5#1 st/g5.js:5339 (headless GRÜN: DOM 0 von 580) | S |
| same.preis.zugang | 2 | N | Ort | spielgang.K4#1 (Zeile je Klang-Ereignis) und K4#2 (ΔE unter Machado, Komfort) am Ausgabe-Bild beider Geräte | st/g5.js:5457, 5493 (headless GRÜN: 39/39, ΔE min 23,9) | S |
| same.preis.zugang | 3 | unklar | – | zu prüfen: v1-Pfad mit halbierter Tastenmenge | – | – |
| same.preis.ausdauer | 1 | F | – | Heap +185 MB/min an der Radeon | Karte-Beleg profiband.K5 | – |
| same.preis.speicher | 1 | F | – | Radeon Heap 486 MB > 400, VRAM 159,4 > 118 | Karte-Beleg profiband.K5 | – |

### kosmos

| leiter | sprosse | urteil | klasse | station oder probe | beleg (Datei:Zeile) | aufwand |
|---|---|---|---|---|---|---|
| planet.kosmos.himmelsmechanik | 1 | F | – | Tag-Bahn springt: Radeon +0,94 EV bei Uhr 0,33 | Karte-Beleg; stand licht.K1#1 gtx rot | – |
| planet.kosmos.sternhimmel | 1 | unklar | – | das Spiel liest die Grenzgröße je Sonnenhöhe; zu prüfen: kommen die Anker HIMMEL.grenzgroesse aus einer realen Tafel (R2: nie am eigenen Code) | stamm/bild-himmel.js:388, 1112 | (M) |
| planet.kosmos.sterne | 1 | F | – | die Sonne hat kein Alter | Karte-Beleg | – |
| planet.kosmos.systeme | 1 | F | – | jahrTage 365 ist eine Zahl, keine Bahn | gelaende-core.js:1304 (Karte-Beleg) | – |
| planet.kosmos.welten | 1 | unklar | – | Heimat-Bilanz 5,46/5,27 an beiden; Fremdwelt-Zenit rostig gesetzt; zu prüfen: Licht-Bilanz an der Fremdwelt | licht.K2#1 st/g3.js:2351; stamm/daten.js:68-81; ultiversum.K1#1 headless | (M) |
| planet.kosmos.ereignisse | 1 | F | – | keine Meteore | Karte-Beleg | – |
| planet.kosmos.eigengesetz | 1 | F | – | EINE Physik | Karte-Beleg | – |
| planet.kosmos.kunstwelten | 1 | F | – | keine gebaute Welt | Karte-Beleg | – |
| planet.kosmos.galaxien | 1 | F | – | keine Galaxie als Ort | Karte-Beleg | – |

## 3) JSON

```json tafel
[
  { "station": "klang.K4#2", "leiter": "erleben.klang.ereignis", "sprosse": 1, "richter": "gleich", "bestehend": true },
  { "station": "klang.K4#2", "leiter": "erleben.klang.ereignis", "sprosse": 2, "richter": "gleich", "bestehend": true }
]
```

```json klassen
[
  { "leiter": "erleben.klang.ereignis", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.klang.ereignis", "sprosse": 2, "klasse": "Ort" },
  { "leiter": "erleben.spieler.rolle", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.schoepfen.gesetz", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.schoepfen.teilen", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.schoepfen.schutz", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.sinn.ziele", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.klang.raum", "sprosse": 2, "klasse": "Ort" },
  { "leiter": "erleben.klang.landschaft", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "erleben.klang.getuemmel", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.physik.koerper", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.physik.fluid", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.physik.verformung", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.entfaltung.akte", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.entfaltung.akte", "sprosse": 2, "klasse": "Ort" },
  { "leiter": "same.gedaechtnis.pfad", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.preis.ankunft", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.preis.bytes", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.preis.zugang", "sprosse": 1, "klasse": "Ort" },
  { "leiter": "same.preis.zugang", "sprosse": 2, "klasse": "Ort" }
]
```

## 4) Die fünf billigsten N(S)

1. **same.preis.ankunft S1** — Station `ankunft.K0#1` (oder eine Staffel 0 von ankunft.K1) auf `probe: ANKUNFT_KALT` (st/g6.js:1170), `geraet: ["radeon","gtx"]`, `beide: true`, mit vier Wiederholungen je Gerät. Das Urteil ruft dasselbe `kaltKontrolle(j, lauf)` wie ankunft.K1#1 (st/g6.js:2903) und urteilt mit Soll ≤ 60 s statt 5/10 s; die Zahl trägt alle vier t(Kontrolle). Heute 8,78 s (Radeon, stand ankunft.K2#1) und 16,6 s (GTX, 18.10.), also GRÜN mit Abstand; die Tafel-Zeile lautet `{station:"ankunft.K0#1", leiter:"same.preis.ankunft", sprosse:1, richter:"gleich"}`.
2. **erleben.sinn.ziele S1** — affekt.K1#2 (st/g2.js:4705, GPU, beide GRÜN) bekommt den Teil, den heute nur affekt.K1#1 headless fährt (st/g2.js:4608, scripts/diag-weltakt-wache.cjs): dieselbe Tat 10× am Ort, dB am Ort und an der Nachbarzelle. Das Urteil: Antwort Tat 10 ≤ 0,3 × Tat 1 UND Nachbar 0 dB, im selben Lauf wie Vorzeichen und Ertrag. Danach wird die Tafel-Zeile von „fehlt“ auf „gleich“ umgestellt; nichts Neues am Spiel.
3. **same.entfaltung.akte S1** — speicher.K4#2 (st/g6.js:4229, bild-diff 0,71/0,80 % an beiden) setzt vor dem Reload 100 Taten statt drei, mit einer Schleife über die vorhandenen Taten-Helfer an einem Raster um die Pose. Das Urteil bleibt bild-diff ≤ 1 % mit Pflicht-Inhalt, dazu die Zahl der zurückgekehrten Taten (100/100). Damit fällt der Grund „Umfang“ der bestehenden Tafel-Zeile, und sie wird „gleich“.
4. **same.preis.zugang S1** — eine GPU-Staffel von spielgang.K5#1 (st/g5.js:5339, headless DOM 0 von 580): dieselbe DOM-Zählung harter UI-Zeilen und der Wechsel DE ↔ EN, an beiden Geräten in der warmen Sitzung. Die Code-Zählung fällt aus dem Urteil (Grep hebt nie, R2); es zählt nur das DOM. Der Preis ist die Zeile Ort (0 zusätzliche Kosten im Fenster der Probe).
5. **erleben.klang.landschaft S1** — in die GPU-Sitzung kommt der Orte-Teil des Klang-Zensus (Soll je Ort, jeder Pegel mit Körper; heute headless klang.K1#1, st/g6.js:3457). Er wird genauso geholt wie klang.K4#2 den Körper-Teil von diag-klang-zensus am SHA holt (st/g6.js:3815ff.). Im selben Lauf fährt die Wind-Probe von klang.K2#1 (r 0,79/0,73); GRÜN ist beides zusammen.

Nachgereicht, nicht unter den fünf: **same.physik.fluid S1** wäre der kleinste Eingriff, ein zweiter Eintrag auf K2_PROBE. Es ist aber dieselbe Messgröße, die schon mensch.nahrung.erdbau S1 hebt (R9: „die andere Sprosse braucht ihren eigenen Lauf“). Ob der Graben zum Fluid oder zum Erdbau gehört, ist eine Zuordnungsfrage der Karte, die vor der Station steht.
