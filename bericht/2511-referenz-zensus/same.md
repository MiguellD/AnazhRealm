# Zensus Referenz-Szenen — Gruppe same (Erleben: Spieler, Schöpfen, Sinn, Sinne, Kopplung · Same: Physik, Entfaltung, Maßstab, Gedächtnis, Preis, Kopplung)

Stand gelesen: punkte-maschine (vision/kapitel/same.md, erleben.md, front-tafel.md vom 25.11. 06:17, karte-2-stand.json: 105 von 1 718), Stationen k2-same.js / k2-erleben.js / k2-zusammenspiel.js (Auszüge), main (stamm/koerper-frei.js, schmiede-core.js, planet-core.js, fachwerk-core.js, tetrapoda-core.js, spec/profiband/haushalt.json, scripts/lib/stand-linse.cjs).

## Der Befund vorab (der die These in dieser Gruppe verschiebt)

1. **Ein Erd-Samen im Sinn der These existiert nicht.** planet-core.js:264 kennt `PLANET_ERDE` (Radius, g, Neigung, Tag, Jahr) und erdähnliche Saaten (erde-01 … erde-08), aber keine wirkliche Geografie: kein Rom, kein Vesuv, keine Mammutsteppe. tetrapoda-core.js:62 hat genau 4 Gattungen (wolf, fox, bear, deer), 0 Treffer für mammut/megafauna/pleisto. Die ZEIT gibt es teilweise: fachwerk-core.js:4371 `EPOCHEN` von `antike` (Jahr 80, Region `antik`) bis `moderne` (1935). Den ORT der Wirklichkeit trägt erst `karte2.same.kopplung.erdsaat#1` (Front, ungebaut).
2. **Physik hat keinen Ort.** Die Referenzen für same.physik sind Labor-Versuche mit Zahl (Dammbruch, Schüttkegel, Fall, Stoß, Brand auf der Grasfläche) — nachstellbar an JEDEM Messort von heute (Mess-Wiese W0). Die Szene ist darum ein **Referenz-Versuch an einem bestehenden Messort**, nicht ein Ort in der Erdgeschichte.
3. **Wo die These richtig zielt:** ein Soll, das am falschen Ideal schärft. Beispiel `karte2.same.physik.fluid#2/#3`: „Front gegen Ritter 2·√(g·h) ±15 %“ — Ritter ist die reibungsfreie Obergrenze; gemessen liegen Martin & Moyce bei 1,48–1,69·√(gH). Ein Löser MIT Reibung, der die Wirklichkeit trifft, fiele an ±15 % gegen Ritter durch.

## (a) Referenz-Szenen

### Szene 1 — Der Fall- und Stoß-Hof (Referenz-Versuch an der Mess-Wiese W0, Mittag, jede Saat)

Ort/Zeit: Messort `wiese` (spec/profiband/haushalt.json:44, Spieler −280.4/−1045.6), Sommer, Mittag, windstill und dann Böe; die Versuche der Station k2-same.js `koerperLauf` (Fass vom Dach :590ff., Wagen in 10 Kisten) plus Feder und Stein, plus der Scherbenhaufen nach der Druckwelle (DRUCK-SCHLAF).

Bänder:

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Schlaf-Schwelle Tempo | 0,05 m/s (`sleepThreshold = 0.05f * lengthUnitsPerMeter`) | Box2D v3, types.c | https://raw.githubusercontent.com/erincatto/box2d/main/src/types.c |
| Kontakt-Feder | 30 Hz, Dämpfung ζ 10 | Box2D v3 b2DefaultWorldDef | dto. |
| Rückprall-Schwelle | 1,0 m/s (darunter kein Prall) | Box2D v3 restitutionThreshold | dto. |
| Reibung Vorgabe | μ 0,6 | Box2D v3 b2DefaultShapeDef | dto. |
| Ruhe nach Prall (Gesetz) | t_rest = 2·e·v/(g·(1−e)) + Schlaffenster; Fass aus 4 m, v 8,9 m/s, e 0,5 → 1,8 s (e ungeprüft) | Stoßgesetz (Newton), e je Stoff ungeprüft | — |
| Fallzeit 10 m | √(2h/g) = 1,43 s, ±5 % (Karte massstab.physik#1) | Fallgesetz | — |
| Luftwiderstand c_w | Platte quer 1,17, Würfel 1,05, Walze quer 0,8 | Hoerner 1965, zitiert in stamm/koerper-frei.js:1475-1478 (von mir nicht nachgelesen: ungeprüft) | — |
| Endgeschwindigkeit 5-mm-Körper | ~6 m/s ±20 % (Karte massstab.physik#2) | ungeprüft | — |
| Dammbruch-Front ideal | 2,0·√(gH) | Ritter 1892 (zitiert) | https://arxiv.org/pdf/1308.0115 |
| Dammbruch-Front gemessen | 1,48·√(gH) bei H 57 mm, 1,69·√(gH) bei H 114 mm (Mittel t* > 1, trockene Sohle) | Martin & Moyce 1952, Tafel in arXiv 1308.0115 (nur im Suchauszug gelesen, die PDF war unlesbar: halb geprüft) | https://arxiv.org/pdf/1308.0115 · https://nvlpubs.nist.gov/nistpubs/jres/049/3/V49.N03.A08.pdf |
| Schüttwinkel | Sand trocken 34°, nass 45°, Schnee 38°, Asche 40°, Weizen 27°, Erde 30–45° | Wikipedia, Angle of repose (Tafel) | https://en.wikipedia.org/wiki/Angle_of_repose |
| Schüttwinkel Sand | trocken unregelmäßig 35° (Kegel), 39° (Krater) | Dartmouth, Practical Field Methods Kap. 16 (Suchauszug) | https://cushman.host.dartmouth.edu/books/PracticalFM/Chap16.pdf |

Sprossen, die die Szene richtet: `karte2.same.physik.koerper#1`, `karte2.same.physik.koerper#2`, `karte2.same.physik.flug#1`, `karte2.same.massstab.physik#2`, `karte2.same.physik.fluid#1`, `karte2.same.physik.verformung#5` (hinter der Front, nur Band).

Heute im Spiel:
- EIN Starrkörper-Löser `_freiSchritt` (stamm/koerper-frei.js:473ff.), Ruhe-Gesetz :628-645 (`K.ruhe` zählt unter `FREI.ruheMs`, Schlaf nach `FREI.ruheS`, die Nachbarn müssen mitruhen), Konstanten :1458-1479: `ruheMs 0.05` (= Box2D), `ruheS 0.3`, `hertz 30`, `daempfung 10` (= Box2D), `schubMs 3`.
- Die Luft am Körper steht auf main: `FREI.luft` (koerper-frei.js:1471-1478, same.physik.flug#1). Die rote Front-Messung von flug#1 (Feder 2 260 % daneben, „der Löser kennt keine Luft“) stammt von 31ea3847 (20.11.) — VOR diesem Gesetz.
- Reibung je Stoff: schmiede-core.js:2813-2821 (holz μ 0,35, stein 0,5, erde 0,4), gelesen in koerper-frei.js:362 als `K.mu`.
- Messung: Fass ruhe_s 2,283 s gegen ≤ 2 s (Aufprall 0,9 s, Schlaf 3,183 s); DRUCK-SCHLAF: Scherben vor dem Schritt 0,002 m/s, nach dem Löser ≥ 0,05 m/s — der Löser legt das Tempo der Schwelle selbst wieder auf.

Was fehlt: (1) der Löser lässt die Schub-Geschwindigkeit (das Herausdrücken der Durchdringung, bis `schubMs` 3 m/s) im Körper stehen — Box2D v3 „Soft Step“ löst mit Bias, dann einen Relax-Gang OHNE Bias, dann den Rückprall; ohne Relax trägt der ruhende Körper die Bias-Geschwindigkeit ≈ Schlaf-Schwelle und schläft nie (DRUCK-SCHLAF) oder spät (Fass). (2) keine Stoßzahl e je Stoff in der Zeile (nur `prallMs`), darum kein Gesetz für die Ruhe-Zeit. (3) Wasser mit Impuls: nichts (stamm/wasser-zellen.js:3, Zellen ohne Impuls). (4) Werke über 3 Größenordnungen (massstab.physik#2: 1,08 an der Pose).

Wo das Gesetz lebt: stamm/koerper-frei.js `_freiSchritt` (Gänge, :473-650), `_freiKontakt` (:965), `AnazhRealm.FREI` (:1458). Stoff-Zeile: schmiede-core.js `STOFF_GESETZ` (:2862) und die Reib-Tafel :2813.

ERSTE WELLE (ein Schnitt): **der Relax-Gang im Kontakt-Löser** — nach den Gängen mit Feder ein Gang ohne Bias (Box2D v3 Soft Step), der Rückprall erst danach; was stirbt: die stehen bleibende Schub-Geschwindigkeit als Klasse (jeder ruhende Körper: Fass, Kiste, Scherbe, Trümmer). Dateien: stamm/koerper-frei.js (nur). Erwartet an der Front ehrlich: `karte2.same.physik.koerper#1` (Schlaf früher als 2 s nach Aufprall, wenn der Fass-Roll-Anteil es trägt — sonst bleibt sie rot), `karte2.same.physik.flug#1` durch Nachmessen am heutigen main (Luft steht schon), `karte2.same.physik.koerper#2` als dritte nur, wenn Δv ±10 % schon hält (ungemessen) — gezählt **2**, Spanne 1–3. Stunden: 4 (Schnitt 2, DRUCK-SCHLAF + Fass + Feder messen 2). Bildpaar: Ego 1,7 m an der Mess-Wiese, Fass aus 4,5 m, Bild bei t = Aufprall + 2 s vorher ↔ nachher (Zittern sichtbar ↔ Ruhe), dazu der Scherbenhaufen 10 s nach der Welle (Hülle wach ↔ schlafend).

### Szene 2 — Die trockene Wiese im Spätsommer bei Wind (Brand-Versuch, Messort `wiese` / Herd −248/−1080 der Station)

Ort/Zeit: derselbe Herd, den kaskade#1 und stoerung#1 heute schon messen (front-tafel Zeile 82, 84), Spätsommer, Nachmittag, Wind 3–8 m/s, Gras trocken; dann Regen.

Bänder:

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Front-Tempo Grasland (kritisch, Feuchte totes Feinmaterial < 10 %, Aushärtung > 90 %, GFDI > 30) | ≈ 20 % der mittleren 10-m-Windgeschwindigkeit | Fire 2022, 5(2):55 „Wildfire Rates of Spread in Grasslands under Critical Burning Conditions“ (Suchauszug, nicht die Seite: halb geprüft) | https://mdpi.com/2571-6255/5/2/55 |
| Front-Tempo Wald/Busch | ≈ 10 % der 10-m-Windgeschwindigkeit (118 Brandläufe) | Cruz & Alexander 2019, Annals of Forest Science (Suchauszug) | https://link.springer.com/content/pdf/10.1007/s13595-019-0829-8.pdf |
| Front-Tempo Wiese | 0,5–2 m/s mit Wind und Hang (Karte feuer#2) | Rothermel 1972 (zitiert in stamm/feld-leben.js:2477-2620, ungeprüft) | — |
| Halt | 100 % an Fluss, Fels, nassem Gras (Karte feuer#2) | Gesetz | — |
| Regen löscht | ≤ 60 s (Station kaskade#1) | erfunden | — |
| Schwärzung der Zelle | Luma nachher ÷ vorher ≤ 0,5 (Station stoerung#1) | erfunden; Albedo Brandfläche ungeprüft | — |
| Bild-p95 im Brand | ≤ 33 ms bei 2 000 brennenden Zellen | Ziellinie (Profi-Band) | — |

Sprossen: `karte2.same.kopplung.kaskade#1`, `karte2.same.kopplung.stoerung#1`, `karte2.same.physik.feuer#2`, `karte2.same.kopplung.ereignis#2` (BEANSPRUCHT landungen-2211 — nicht zählen).

Heute im Spiel: Rothermel + Albini + Anderson auf dem Feld (stamm/feld-leben.js:2477-2620 laut Karte), Halt an Fluss und Fels. Gemessen (front-tafel :82): trocken nach 60 s **1** brennende Zelle, Flammen im Bild +10 Pixel je Pixel (Soll ≥ 200; 4 Flammen gezeichnet), Regen löscht nach 7 s ✓; stoerung#1 (:84): Luma 0,142 → 0,104 (÷ 0,732, Soll ≤ 0,5), Asche 0 (Soll ≥ 0,99).

Was fehlt: die Front wandert im Ereignis-Fenster nicht (1 Zelle in 60 s — bei 20 % von 5 m/s wären es 60 m), das Bild zeichnet 4 Flammen statt einer je brennender Zelle, die Zelle schreibt keine Asche ins Bild.

Wo das Gesetz lebt: stamm/feld-leben.js (Brand-Feld), stamm/feld-brand.js (laut Front-Tafel :85), Station S1 in g1.js `BRAND_SITZUNG` (nicht gelesen).

ERSTE WELLE: **das Brand-Feld zeichnet sich selbst** — EIN Leser: Flammen-Instanzen und die Aschen-Albedo des Bodens aus den brennenden/verbrannten Zellen des EINEN Feldes, kein Zähler eigener Flammen. Dateien: stamm/feld-brand.js, der Boden-Leser der Albedo (ungelesen). Erwartet: `karte2.same.kopplung.kaskade#1`, `karte2.same.kopplung.stoerung#1` = **2**; feuer#2 erst mit Front-Tempo im Band und p95 im Brand (nicht in dieser Welle gezählt). Stunden 6. Bildpaar: Ego 1,7 m vor dem Herd, t = 60 s trocken ↔ t = 60 s nach Regen, und die Zelle vorher ↔ nach dem Brand.

### Szene 3 — Rotwild am Waldrand in der Dämmerung, Wind quer (Messort `tier`, haushalt.json:588)

Ort/Zeit: Waldrand, Dämmerung, ein Rudel deer, ein Wolf, der Spieler in Orange ↔ Grün ↔ Weiß auf Schnee.

Bänder:

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Zapfen Weißwedelhirsch | kurzwellig ≈ 450–460 nm, mittelwellig 537 nm (Damhirsch 542 nm); kein Lang-Zapfen (dichromat) | Jacobs et al. 1994, J Comp Physiol (über wildlifeonline-Zusammenfassung) | https://www.wildlifeonline.me.uk/animals/article/deer-overview-senses-vision |
| Entdecken / Erkennen / Identifizieren | N50 = 1,0 ± 0,25 · 4,0 ± 0,8 · 6,4 ± 1,5 Zyklen über die kleinste Abmessung | Johnson-Kriterien (Wikipedia, NVESD-Tafel) | https://en.wikipedia.org/wiki/Johnson%27s_criteria |
| Orange ↔ Grün im Hirsch-Auge | Entdeckungsdistanz ±15 % (Karte gesehen#1) | Folge aus der Dichromasie (Gesetz) | — |
| Witter-Reichweite, Flucht-Distanz je Gattung | ungeprüft (keine Quelle gelesen) | — | — |

Sprossen: `karte2.erleben.sinne.geruch#1`, `karte2.erleben.sinne.gesehen#1`, `karte2.erleben.sinne.genom#1`, `karte2.erleben.kopplung.wahrnehmung#2` (BEANSPRUCHT pm-seite-ohne-m — nicht zählen).

Heute: `scentRangeM` 50 m und `noticeRadius` 22 m für alle 4 Gattungen (tetrapoda-core.js:151, :183, laut Front-Tafel :239); Witterung gegen den Wind läuft weiter (stamm/koerper-seele.js:1636 `windMod ≥ minDirectional`, Front-Tafel :52: Suchzeit-Faktor mit gedrehtem Wind 1, Soll ≥ 3); Entdeckung liest keine Farbe (stamm/kreatur-furcht.js:107).

Was fehlt: die Witterung nur windab; Radien je Gattung aus EINER Tafel; ein Farb-Leser der Entdeckung im Rezeptorraum (zwei Kurven).

ERSTE WELLE: **die Witterung folgt dem Wind** — die Fahne der Quelle nur windab (Kegel), gegen den Wind 0; Schnitt an koerper-seele.js `_scentAt`/`windMod` (:1578-1636). Erwartet `karte2.erleben.sinne.geruch#1` = **1**. Stunden 2. Bildpaar: Wolf + Beute, Wind gedreht, Third aus 20 m, die Bahn des Wolfs vorher (gerade zur Beute) ↔ nachher (Suche quer zum Wind). Diese Szene überschneidet die Gruppe leben (Tiere) — dort gehört die Gestalt der Tiere hin.

## (b) Richter-Urteil

| Richter | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|
| karte2.same.physik.koerper#1 (k2-same.js:498) | „Ruhe ≤ 2 s“ | erfunden | band | gemessen wird der Schlaf-Stempel des Lösers (tSchlaf − tLand, k2-same.js:636), nicht die Ruhe; Band: Ruhe-Zeit aus dem Stoßgesetz 2·e·v/(g(1−e)) plus Schlaffenster, Schlaf-Schwelle 0,05 m/s wie Box2D v3. |
| DRUCK-SCHLAF (scripts/lib/stand-linse.cjs:530, :695) | „die letzte Scherbe schläft ≤ 3 s“ (`DRUCK_SCHLAF_S = 3`) | erfunden | bleibt | hat einen echten Fehler im Kontakt-Löser gefunden (der Löser legt 0,05 m/s wieder auf); Soll später ans selbe Band wie koerper#1. |
| karte2.same.physik.flug#1 | „Wurfweiten gegen Rechnung ±10 %“ | gesetz | bleibt | fand den Fehler „keine Luft“; das Gesetz `FREI.luft` steht auf main, die Front-Messung ist von 31ea3847 — nachmessen. |
| karte2.same.physik.fluid#2 / #3 (k2-same.js:1139, :1143) | „Front gegen Ritter 2·√(g·h) ±15 %“ | aussen (Ideal) | band | Ritter ist reibungsfrei; gemessen 1,48–1,69·√(gH) (Martin & Moyce) — Band 1,45–2,0·√(gh), sonst scheitert der wahre Löser. |
| karte2.erleben.spieler.praesenz#1 | „Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms“ | aussen | bleibt | Raaen & Eg: Teilnehmer bemerkten 66 ms und wurden frustriert; 50 ms liegt im Band der Literatur (25–1 000 ms je Gerät). |
| karte2.erleben.schoepfen.hebel#1 | „Wille → Bild ≤ 1 s“ | aussen | bleibt | Nielsen: 1,0 s = Grenze des ungestörten Gedankenflusses; gemessen 9,8 s ist ein echter Fehler. |
| karte2.erleben.sinne.geruch#1 | „Witterung aus oder Wind gedreht → Suchzeit ≥ 3×“ | erfunden | bleibt | fand einen echten Fehler (Witterung gegen den Wind, koerper-seele.js:1636). |
| karte2.erleben.spieler.zeit#1 | „Sonnenbahn gegen Ephemeride der Breite ≤ 1°“ | aussen | bleibt | 46° daneben, Täter benannt (welt-licht.js:711 kennt weder Breite noch Saison). |
| karte2.same.preis.takt#1 | „p95 ≤ 33 ms stehend an beiden Geräten“ | gesetz | bleibt | die Ziellinie selbst (30 Hz); rot um 0,41 ms und am Umfang (1 statt 4 Boots). |
| karte2.same.preis.speicher#1 | Heap ≤ 400 MB, VRAM ≤ 118 MB | erfunden | nur-bericht | ein eigener Deckel ohne Quelle (Schöpfer 16.11./23.11.: „Speicher folgt dem Blick“, nicht 400 MB); meldet, hält keine Landung. |
| karte2.same.kopplung.kaskade#1 (S1 in g1.js BRAND_SITZUNG) | „Flammen im Bild ≥ 200“ Pixel je Pixel | erfunden | band | die Zahl folgt aus dem Gesetz: brennende Zellen nach 60 s (Front-Tempo ≈ 20 % des Winds) × Flammenfläche im Bild bei gegebenem Abstand. |
| karte2.same.kopplung.stoerung#1 | „Luma ÷ ≤ 0,5“, „Asche ≥ 0,99“ | erfunden | band | Soll aus der Albedo der Brandfläche gegen frisches Gras (Quelle fehlt, ungeprüft) — misst sonst die eigene Schwelle. |

## (c) Widerspruch — wo die These hier NICHT trägt

1. **Kein Erd-Samen.** Den wirklichen Ort trägt erst `same.kopplung.erdsaat#1` (Front, unbebaut); planet-core erzeugt erdähnliche Saaten, keine Erde. Die These setzt die teuerste Leiter voraus, bevor eine Szene urteilen kann.
2. **Physik braucht keinen Ort, sondern den Versuch.** Dammbruch, Schüttkegel, Fall und Stoß, Grasbrand sind Labor-Bänder; die Mess-Wiese trägt sie heute schon.
3. **Die Linsen, die viele Läufe kosteten, schärften NICHT falsch:** DRUCK-SCHLAF, Witterung, Sonnenbahn und Feder fanden echte Fehler. Die Zeit fraß der Beweis in der ROT-Zeile, nicht das Soll. Eine Referenz-Szene spart diese Heilung nicht.
4. **Die meisten roten Fronten dieser Gruppe sind „Leser fehlt“ oder „Umfang nicht erzeugbar“** (rolle#2, wegfindung#1, gesetz#1, ziele#2, tod#3, sicht#1, hoeren#1, feld#1, signale#2, gesehen#1, verformung#2, reaktion#3, tragen#2, massstab.physik#2, gleichheit#1, reise#1, spanne#1, bytes#2, zugang#2): ihnen fehlt ein Bau, kein Band.
5. **Die These trägt hier nicht** (je ein Satz):
   - same.preis.* (ankunft, takt, bytes, eingabe, zugang, ausdauer, speicher): urteilen Geräte und Bytes; ihr Band ist das Profi-Band der Ziellinie, kein Ort.
   - same.entfaltung.gleichheit / reise / schirm / abwesenheit / akte: Funktions-Eigenschaften der Entfaltung (Gerät ↔ Gerät, Reload, Zuschauer), referenzlos in der Wirklichkeit.
   - same.entfaltung.vielfalt: braucht Foto-Korpus und Blindtest (Panel), keinen Ort.
   - same.massstab.spanne / treue / nahe / sprung / menge: Bild-Stetigkeit über die Stufen; Referenz wäre ein Foto je Stufe, keine Szene.
   - same.gedaechtnis.alter / pfad / narbe / gesellschaft: Zeitraffer-Leitern; ihre Bänder (Verwitterung, Trampelpfad) sind ortlos; nur schicht#2–3 (Tell 0,5–2 cm/a) zielt auf einen Erd-Ort.
   - same.kopplung.aufwaerts / kohaerenz / gewalt / relief / seuche / zeitreise / terraform: Raten aus Klima und Zeit; Bänder (GWIS, SIR, HQ100) stehen schon in der Karte; ein Ort hilft erst nach erdsaat.
   - erleben.spieler.ort / rolle / hand / gemeinsam / nichtleib / forscher: Verben und Kamera; Bänder sind HMI-Normen, keine Szene.
   - erleben.schoepfen.* (hebel, satz, gesetz, gespraech, teilen, bleiben, schutz): urteilen KI-Lauf, Peers, Korpus und Neulinge (R11).
   - erleben.sinn.* (ziele, legenden, wettkampf, tod, entdeckung, takt, sog, staunen): urteilen Spieler-Erleben über Stunden und Panels.
   - erleben.sinne.sicht / hoeren / feld / signale: brauchen erst den Leser (UV, Echo, Dipol, Tanz); die Bänder (Vasas/Hanley 2024, 60–75° geomagnetisch) stehen schon in der Karte.
   - erleben.kopplung.emergenz / bild / klang / geteilter-sinn / ein-ereignis / epoche-ganz: Ketten über Spielstunden, Peers und Epochen; nur epoche-ganz zielt auf eine Zeit, aber auf eine Zeit der Saat, nicht der Erde.

## (d) Nicht gelesen

- Die Leitern erleben.bild.* und erleben.klang.* (andere Gruppe); von den eigenen Leitern bei erleben.spieler.rolle/hand/gemeinsam, erleben.schoepfen.*, erleben.sinn.* nur Überschrift und Front-Zeile, nicht die Sprossen.
- Die Messfunktionen für flug#1, fluid, tragen und verformung in k2-same.js; k2-erleben.js und k2-zusammenspiel.js nur per grep am Soll; g1.js `BRAND_SITZUNG` (S1 von kaskade/stoerung) gar nicht.
- stamm/dirigent-takt.js (Raffer) nicht geöffnet; der Abschnitt „Die Quelle je Domäne“ der SKILL.md nicht geöffnet; stamm/feld-leben.js (Rothermel) und feld-brand.js nicht geöffnet.
- Die Original-Arbeiten Martin & Moyce 1952, Jacobs 1994, Fire 2022 5(2):55 und die Shuttlecock-Messung nicht selbst gelesen (PDFs nicht lesbar), ihre Zahlen stammen aus Suchauszügen und Zusammenfassungen; Stoßzahlen e je Stoff und die Fall-Endgeschwindigkeit einer Feder: keine Quelle gefunden (ungeprüft).
