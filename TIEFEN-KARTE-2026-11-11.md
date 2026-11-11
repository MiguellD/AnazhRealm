# TIEFEN-KARTE 2026-11-11 — zweiter Opus-Schwarm (Befund, kein Plan, kein Scope: der Scope bleibt docs/PFLICHT-OFFEN.md; baut auf HEBEL-KARTE-2026-11-11.md auf)
64 Linsen, 47 Hebel an der Spitze, 411 gefallen. Gelesen wurde nur, gelaufen ist nichts (kein Boot, keine GPU, kein Profil). Der Kritiker hat an origin/main c4010773 nachgelesen, die Stellen stimmen:
klang.js:989/1002-1003 · siedlung-ort.js:801/817 · vegetation-streu.js:1630 · kreatur-verhalten.js:228/2523 · kreatur-leben.js:2407 · bild-schatten.js:1281 · siedlung-wege.js:1322/1350/1469 · feld-dsl.js:107 · koerper-core.js:4802-4803.
Nicht nachgelesen: g6.js kaltKontrolle (punkte-maschine), vendor CSM, bild-sicht.js:667/2654. Selbst angesehen wurde nur 1111-belag-stadt-voll-0.5.png. Die übrigen Bildurteile kommen aus den Linsen, viele Bilder sind 10–24 Tage alt.

## 1 Was das Auge sah
- Stadt-Platz (1111-belag-stadt-voll-0.5.png, selbst gesehen): Die Menge sind Klötzchen-Leiber mit den Händen im Schritt. Ab ~15 m wirft die Feld-Menge keinen Fußschatten, Laub-Konfetti schwebt vor dem Himmel, Gras wächst in den Vorplatz-Streifen, kein Wagen im Bild.
- Fassade (1111-zoom-stadt-wand, 1111-putz-wand-gtx-stadt-vierer): Fensterlöcher ohne Gewände, ein Putzton für alle Häuser, keine Kehle an Sockel und Traufe. Ursachen: fachwerk-core.js:1062 `fr='holz'`→putz, `_kontaktVerdeckung` hat 1 Leser.
- Menge (third-0.5, 1111-w28-stadt-voll-markt): Die Oberarme kleben am Rumpf. Der Kontrapost legt −0,19/+0,17 rad Adduktion auf (koerper-core.js:4802-4803, nachgelesen).
- Wiese nah (a-bodennah, a-nadel): Der Grund ist heller als die Klingen, weil die Narbe nur indirekt wirkt (stoff-material.js:1909 `schatten.mul(_zu)`).
- Tier (gtx-k3-ausschnitt-2x, 22.10.): Bär und Reh tragen im Schatten einen warmen Saum, weil der Fell-Glanz als emissiveNode eingeht (studio-stoff.js:528).
- Meer (bericht/1110-2/bilder/ufer-meer.png): Weiße Kamm-Flecken auf ruhiger See, Ursache ist das Literal crest 0,62 (bild-sicht.js:1457).
- Nacht (bericht/1810-f6-gtx/nacht/B1/blick.png, 24 Tage alt): Die Laubkarte ist grün statt mondblau, staebchenSicht zieht nach Grau (bild-kosten.js:2189).
- Kronen (k21-87537d3f, k41-ab2f gegen k21-818b466d): Laub-Fetzen schweben über zerfallenen Kronen, Sträucher fehlen. Dazwischen liegen 35 Merges.
- Stark, nicht anfassen: Halm-Wiese (Ähren, Farbverlauf), Kronenschatten im Gras, Laternen- und Leib-Schatten nah, Rauch, Fachwerk-Silhouette, Ring-Grundriss, Fuchs/Reh-Allometrie.

## 2 Die stärksten Hebel
1. [C · S · 0,8] Bewohner-Wagen bekommen die Fahrt-Stimme — klang.js:1002-1003: K=4 nächste VK.wagen 'faehrt' in `wagen` (gas W.T.gas). Der Rücksprung :989 prüft sattel/los/stimmen, er muss den Verkehr mitzählen.
   erwartet s.fahrt.size 0 → 1–4 ohne Sattel, Doppler 1,04→0,96, Fahrt-Takt p95 ≤ 0,35 ms · Probe: diag-klang-zensus stadt-voll ohne Sattel; size heute > 0 → tot
2. [C · S · 0,6] Stadt-Pose an die Trasse — siedlung-ort.js:801/817: Die Kegel 1–3 verwerfen jede Sicht über eine Fahrbahn. Regel `trasse` in die EINE `_ortPose`, die Pose `stadt` (nicht stadt-voll) mit imBild.fahrzeug 0.005.
   erwartet heute ABNAHME ROT „kein fahrzeug“, danach ≥ 0,5 % Fahrzeugpixel in 3/3 Läufen · Probe: werkbank bild --ort stadt an main · Achtung: Kegel 4–6 ohne spurfrei sind schon Rückfall, ROT erst belegen
3. [B · S · 0,5] GTX-Kaltboot zählt wieder — vegetation-streu.js:1630 `_streuRegionWartet`: Eine Region, die nach dem Weltbild schon zeichnet und nur auf ein Upgrade wartet, gilt nicht als Lücke.
   erwartet ankunft.K1#1 GTX zählt in ≥ 3/4 Kaltboots (heute 0 von 11 Köpfen seit 78d37554) · Probe: 1 GTX-Kaltboot, 4 Regionen bei Kontrolle +60 s; noch offen → Wecker schneiden, sichtbar → Urteil
4. [B · S · 0,5] Gespeicherte Tiere hinter `_kreaturenBereit` — kreatur-verhalten.js:2523 `headless || hasPending`: hasPending fällt, `_tickBootPhase3` gießt nach dem Bild, vor dem ersten Bestand-Takt.
   erwartet GTX Zweit-Boot mit Stand −2,5…−3,1 s (P1c 18.10., ungemessen an main) · Probe: diag-boot-stage --echt --profil 2↔2; Restore vor Bild < 0,4 s → tot · Kommentar :2516 nennt „Identität“, hängt an 5
5. [E · S · 0,4] Bestand-Kennung aus dem Stand — kreatur-leben.js:2407 `id = key.peer.(_annahmeN+1)` (Sitzungs-Zähler). Im selben Commit grundProbe (punkte.cjs:2365) mit Gang 300 m + Mutante 'bestand'.
   erwartet 160 creatures-Gründe (df6c4721-radeon) → 0, pflicht.E#1 Radeon wird messbar · Probe: grundprobe + Gang an main; bleibt GRÜN oder weicht nur die Lage ab → tot
6. [E · M · 0,4] Ferne Kaskaden k1/k2 ruhen in stehender Welt — bild-schatten.js:1281 `_loopShadowUpdate` + :1639 SCHATTEN_TAKT: fällig nur bei Sonnen-Drift > ½ Texel, `_regt` oder `_passTrifftBox`.
   erwartet GTX Genesis Third CPU p95 6,3 → ≤ 5,8 ms, Schatten-Renders/Bild 0,83 → ≤ 0,55 · Probe: OMEN ABAB 4↔4 mit fernFaktor 1e9; B−A < 0,3 ms → tot
7. [A · S · 0,55] Opake Welt-Stoffe lesen die bezahlte GTAO-Kontaktverdeckung — stoff-material.js:1924 (einziger Leser, nur Boden) → `_leuchtStoff` :2037 bzw. Satz-Stoff siedlung-satz.js:60. Halm/Laub/Haar/Glas bleiben draußen.
   erwartet Luma Sockelband ÷ Wandmitte ~0,95–1,0 → 0,55–0,8, GTX ≤ +0,3 ms, Programme gleich · Probe: Radeon werkbank dorf@0.5 + Hauptgasse; Δ < 0,05 oder Halo → tot
8. [Erlebnis · S · 0,55] Wege-Karte ohne stille 900er-Kappe — siedlung-wege.js:1322 `MAX = plan.kappe || 900` (kein Erzeuger setzt kappe), 7 Abbrüche bis :1560, Vorplätze :1469.
   erwartet gemalte Formen stadt-voll 900 → alle (Zahl geschätzt, nie gezählt), Gras im Fußband der Fronten −80 % · Probe: headless Σ Formen + übersprungene Vorplätze; ≤ 900 → tot
9. [Erlebnis · S · 0,7] Brandfront wird Bedrohung — kreatur-verhalten.js:228: vor dem wild-Return Glut im noticeRadius über `_brandGlutUm` (feld-leben.js:2742) als Bedrohung.
   erwartet Herde 15 m vom Herd: Flucht binnen 10 s 0 → ≥ 80 %, ohne Brand ±0 · Probe: headless `_brandEntfachen`; flieht an main schon ≥ 50 % → tot
10. [v1 · S · 0,7] KI-Tat reist zum Mitspieler — feld-dsl.js:107 `ctx.source === "human"`: auch 'llm:*' zulassen, Programme mit Kopf 'rule' ausgenommen.
   erwartet diag-mp-sync neuer Fall: Werke bei B 0/1 → 1/1 · Probe: zwei Seiten headless, spawn_studio als llm:grok; B steht schon bei 1 → tot
11. [Erlebnis · S · 0,5] Der Tag läuft auf der Welt-Uhr — bild-himmel.js:2543 `Math.min(1.0, currentTime-last)` (Wanduhr) gegen spielZeit (Deckel 0,1): timeOfDay = f(Anker, spielZeit).
   erwartet Tag-s/ΔspielZeit 2,5 → 1,00, `_weltUhrNimm(+900)` springt den Tag mit · Probe: 400 Takte à 250 ms + Sprung; heute 1,0 ± 0,02 → tot · FUND-REGISTER:168
12. [Erlebnis · M · 0,65] Gang folgt der Weg-Richtung — koerper-core.js:4735 leibGangTakt bekommt Δ Weg↔Leib-Gier (Phase rückwärts bei |Δ|>90°), IK misst längs der Weg-Richtung (koerper-leib.js:850).
   erwartet Quer-Schlupf Stand-Fuß p95 ≈ Geh-Tempo → ≤ 0,05 m/s, Lock-Lösungen rückwärts → 0 · Probe: headless Wiese Third, T.vor=−1 4 s, T.quer=1 4 s; Schlupf < 0,1 m/s → tot
13. [Erlebnis · S · 0,65] Reibellipse je Achse — vehicle-core.js:3999-4000 (Fx am vollen capL) + :3978 handLatMul: Fy ≤ √((μW)²−Fx²), handLatMul fällt.
   erwartet |a|/μg Bremsen im Bogen ~1,41 → ≤ 1,02, Bremsweg geradeaus ±1 % · Probe: headless VC.fahrKraefte (Muster diag-fahr-leben:308); heute ≤ 1,05 → tot
14. [A · M · 0,65] Fell-Glanz wird Licht statt Emission — studio-stoff.js:528 `emissiveNode = add` → `_haarLichtModell` (:43) mit Kamm kd als Tangente.
   erwartet Tier-Luma ÷ Boden nachts −30 %, Kantenstreifen im Schatten ≤ Fellmitte · Probe: Wegwerf-Klon FELL_LOOK rim/sheen/spec 0, gang-buehne Mittag + 0 h; Δ < 3 % → tot
15. [A · S · 0,5] Arm-Ruhe als Boden in leibRigPose — koerper-core.js:4802-4803: Schulter-z nach allen Deltas gegen `_armRuhe` auf ≥ 0 klemmen, RUHE-Urteil zusätzlich an der Stand-Zeile.
   erwartet armRuheUrteil.innen an der Stand-Pose > 0 → 0 · Probe: headless leibRigPose w=0; innen heute 0 → Täter sitzt in Retarget oder Mengen-Hülle
16. [A · S · 0,45] Strauch-Kante 0,205 → 0,276 bisektieren — b3613272 (Relief) gegen 4f4b15a4 (phyto-core +225), die Linse bleibt unberührt.
   erwartet Strauch L2 Tafel-Pose Radeon ≤ 0,21, A-Tafel 12/12 möglich · Probe: werkbank bild --ist laub-kante an beiden (je ~1,5 min); beide auf derselben Seite → tot

## 3 Ketten
- C hörbar und sichtbar: Trassen-Pose (2) → Bild-Paar je KI-Wagen (siedlung-verkehr.js:1297 bildAlt, Alpha über k·FIXED_DT) → Fahrt-Stimme (1) → Ortsraum (klang.js:1047 auf s.umwelt.bus + StereoPanner)
  warum: Heute ist die Abnahme blind, erst die Trasse urteilt über Gleiten und Klang, die Alpha-Lage gibt dem Doppler einen ruckfreien Ort · erster Handgriff: main ROT an stadt@0.5 mit imBild.fahrzeug belegen
- B messbar, dann leer: Kaltboot zählt (3) → Tier-Guss hinter `_kreaturenBereit` (4) → Tuch-Gitter als Fracht im Foundry-Ofen (koerper-fahrt.js:347, 648 ms am Zweig 4538471f)
  warum: Ohne Richter bleibt jeder B-Schnitt ungebucht, danach räumen beide dasselbe Fenster Weltbild→Kontrolle · erster Handgriff: GTX-Kaltboot, 4 Regionen mit _deferredFoundry/_bildWartet ausgeben
- E Ruhe kostet nichts: Nachprofil Genesis Third an main → Tuch-Löser schläft vor der Ecken-Schleife (koerper-core.js:7077-7129) → k1/k2 ruhen (6) → Wette Kaskaden-Memo
  warum: Die 6,3 ms stammen vom 03.11., erst die Verteilung zeigt, ob Tuch (~0,2) und Kaskaden (~0,4) bis 5,8 reichen · erster Handgriff: 600 Takte, performance.now() um tuchTakt und renderShadow
- Messkette Radeon: Bestand-Kennung (5) → Welt-Tod an der Grundstellung schiebt in kopf.offen (punkte.cjs:3077/3085 → Fortsetzung :3255) → Buchen am Mess-Kopf (Schwarm 1, Nr. 1)
  warum: EINE Ursache (`_annahmeN`) erzeugt 160 Gründe und 116/124 ungemessene Proben · erster Handgriff: kreatur-leben.js:2407 und grundProbe-Gang im selben Commit
- EINE Welt-Uhr: Tag auf spielZeit (11) → Schwarm fällt bei Dämmerung auf die Krone (kreatur-fauna.js:141-144, 'ruht' statt false, M · 0,7) → tagesPlan liest nass (koerper-core.js:3209)
  warum: Der Schwarm fliegt auf spielZeit, abgeschaltet wird er über die Sonne der Wanduhr; Plan und Wetter driften 2,5× · erster Handgriff: bild-himmel.js:2536-2550, Probe +900
- Metropole wird Material: Kappe fällt (8) → Kontakt-Verdeckung (7) → Gewände je Stil (fachwerk-core.js:181/1062, Rahmen stein/metall) → Putzton je Haus aus dem Samen (fachwerk-core.js:2015)
  warum: dieselben Stadtbilder, kein neuer Pass, kein Draw · erster Handgriff: siedlung-wege.js:1322 MAX und alle `n < MAX` streichen
- Ein Licht-Gesetz, jeder Leser (A): Kontakt am opaken Stoff (7) → Narbe dämpft die Boden-Sonne (stoff-material.js:1909 × halmNarbe.direkt × _wieseGrund) → Fell als Licht (14) → Wasser liest `_sonnenSicht` (bild-sicht.js:1246)
  warum: Bezahlte Gesetze haben einen Leser, wo vier nötig sind · erster Handgriff: Kontakt-Block :1922-1932 aus der Bedingung himmelsSicht lösen
- A laub-kante: wahres ROT in die A-Zeile (Schwarm 1, Nr. 9) → Strauch-Bisektion (16) → Wette Laub-Fetzen über 818b466d..87537d3f
  warum: dieselbe Klasse im selben Fenster um den 09.11., eine Radeon-Sitzung · erster Handgriff: werkbank bild --ist laub-kante an b3613272 und 4f4b15a4

## 4 Von den Besten
- GTAO (Jimenez 2016, Activision): Kontakt auf alle opaken Stoffe; `_kontaktVerdeckung` wird schon gerechnet → Hebel 7.
- Kajiya-Kay (1989): Fell durch dasselbe Faser-Lichtmodell wie Haar, `_haarLichtModell` studio-stoff.js:43 → Hebel 14.
- Monahan (1980): Weißkappen-Anteil W(U)=3,84e-6·U^3,41 statt crest 0,62 (bild-sicht.js:1457); foundry-core.js:155 schaum.kamm hat 0 Leser. S · 0,6, Probe Ufer-Pose Wind 0,06/0,8.
- Kirk & O'Brien (TOG 2011): skotopisches V'(λ) mit blauer Stäbchen-Chromatizität, bild-kosten.js:2189 staebchenSicht (S · 0,45, F6 erst neu aufnehmen).
- Pacejka mit Reibellipse: ein μ·N-Budget je Achse, vehicle-core.js:3999 → Hebel 13.
- Euler-Bernoulli-Stab: Treffer im gemessenen f1 der Klinge (schmiede-core.js:1821 rechnet ihn, klang.js:812 liest ihn nicht) → Dolch ≠ Langschwert.
- Fixed-Step mit Render-Alpha (Gaffer „Fix Your Timestep“): KI-Wagen wie der Spieler-Leib, dirigent-takt.js:1105 → siedlung-verkehr.js:1297.
- Factorio-Determinismus (FFF #340): ID aus dem Zustand, nie aus dem Sitzungs-Zähler → kreatur-leben.js:2407 (Hebel 5).
- Inhalts-Hash statt Hand-Format (Bevy-Pipeline-Cache): stempelVon aus Schale + lesen + ecken (studio-bruecke.js:924), FOUNDRY_PLATTE_FORMAT=5 fällt (S · 0,6).
- Freistand-Solitär am Waldrand (Forstlehre Traufbaum): phyto-core.js:2458 FREISTAND mit Lücken-Winkel ≥ 0,8π.

## 5 Konsum-Tiefe je Studio (Schätzung der Linsen aus Leser-Zählung, nichts gemessen)
- tetrapoda ~80 %: Haltung je Tätigkeit fehlt (ziehen wedelt joy ±1,40 rad) · MOTION-Zeile ziehen, MOTION_PROFILE_MAP.kreatur.moving
- schwarm (VOGEL_GESETZ) ~85 %: sonneMin/regenMax/sichtM schalten hart · 'ruht' statt false (Kette Welt-Uhr)
- portale ~75 %: Stempel-Kollision liest die Rezept-Hülle · Hülle je Gestalt ins Bau-Ergebnis, gelaende-kollision.js:1373
- neuntes-buch ~65 %: LEHREN/messen und siteTag ohne Welt-Leser · kein Schnitt gehalten
- fachwerk ~60 %: Oberfläche 0 %, 14/32 Kulturen Rahmen = Wandton · STILMODE.rahmen
- schmiede ~60 %: Mechanik ~85 %, Bild/Klang ~25 % (f1 ohne Hörer, pbrHaut tot) · f1 in `_trefferPaar`
- garage ~60 %: Zeit-Achse 0/6, Kulturen im Verkehr 0/5, Reibkreis fehlt · Hebel 13
- phytogenesis ~55 %: Individuum 2 von N, Waldrand 0 · Wette Traufbaum
- koerperstudio ~55 %: Emotionen der Bewohner 0/6 (emotions=null siedlung-bewohner.js:1448/1512) · {chaos, sorrow} aus furchtErinnert, Kampf am Avatar
- klang ~45 %: Umwelt ~90 %, Fahrt ~30 % (nur Spieler), Schritt ohne Raum · Hebel 1 + Ortsraum
- huelle ~45 %: Sitzung und gezeichnete Kosten-Leiste ohne Welt-Leser · kein Schnitt gehalten
- skeleton ~35 %, begegnung ~15 %: nicht im v1-Pfad, kein Eintrag · keiner
- gelaende ~85 % Tiefe, Weite schmal (Genesis 1 von 5 Landschaften) · kein Hebel gehalten

## 6 Wetten
- Kaskaden-Schatten einmal filtern (Array-Tiefe statt 3× ausrollen, bild-schatten.js:1006/1137, vendor unberührt): Σ Übersetzung −1,0…−1,5 s · Probe baustein kaskade1 + uebersetz-sonde ×3; < 0,6 s → tot.
- Bestrahlung aus der vorhandenen Himmels-Sonde statt PMREM-CubeUV (bild-sicht.js:667-712, nicht nachgelesen): Σ −0,5…−0,9 s · Probe umgebung-sonde; < 0,4 s → tot.
- Statische Kaskaden-Tiefe als Memo (Bau/Boden/Tore, neu nur bei Regung): Genesis Third p95 6,3 → ≤ 5,8 ms · Probe GTX ABAB 2+2 als Obergrenze; < 0,5 ms → tot. Vorher den Clear in r184 renderShadow lesen.
- Baum-Hülle als Beipack `__huelle` aus dem Werk-Faden (Muster __krone foundry-bruecke.js:968): lange Aufgaben 15–51 ms → 0 · Probe CPU-Profil 60 s Waldgang; < 50 ms gesamt → tot.
- Laub-Fetzen über 35 Merges bisektieren (818b466d..87537d3f): Kandidaten cf3ea982, a40143ca, 8a9bf124, 970a0e63 · 6 Kaltboots Radeon ~25 min; kein scharfer Sprung → verloren.
- Traufbaum: Ein Randbaum mit freier Halbseite wächst als Solitär (vegetation-baum.js:1019), Krone bis 0,15–0,3 H · Karten > +15 % → tot.
- Feld-Menge wirft Fußschatten im selben feldMarch (bild-sicht.js:1784, Kasten um die Wurf-Spur): Kies ≤ 0,65 der Leuchte · Pass > 0,5 ms oder Verhältnis > 0,85 → tot. Gesehen: ferne Menge ohne Schatten.

## 7 Muster, die mehrere Linsen unabhängig sahen
- Bezahlt, aber ungelesen: GTAO nur am Boden (licht, stoff und auge fanden denselben Leser stoff-material.js:1924), schaum.kamm, Sonnen-Sicht im Wasser, Fell als Emission.
- Stille Kappe an EINER Bedingung: wege MAX 900, dslRun nur 'human', Klang nur Sattel, wild-Return vor der Glut. Eine Zeile entscheidet, ob die Stadt lebt, klingt und reist.
- Zwei Uhren: Wanduhr-Tag gegen spielZeit, Sim-Schritt gegen Bild (Verkehr ohne Alpha). Peer, Laden und Schwarm driften.
- Der Haupt-Faden backt, was Faden oder Platte liefern könnten: Tier-Restore synchron, tuchGitter, Baum-Skelett, ruhende Kaskaden. B und E sind dieselbe Klasse.
- Der Richter verschweigt Messungen: kaltKontrolle offen.length===0, Welt-Tod ohne Fortsetzung, Puls-Waage `if (n > 1)` (diag-ci-deckung.cjs:838).
- Gleichförmigkeit und harte Ränder: eine Stand-Zeile für die Menge, ein Putzton, 514 Hz für alle Klingen, Bool-Tests statt Gesetz-Verlauf (Schwarm-Pop, Sicht-Rand-Blinken kreatur-fauna.js:154).

## 8 Geprüft und gefallen
- Stadt-Trassen-Pflaster aus dem Kern: in main seit d3634d3f (w28-stadt-boden, `belagVon` siedlung-wege.js:1342, nachgelesen).
- Hotspot in der Narbe: ein Fleck von wenigen Grad, kein Gewinn im Band. Gras-castShadow und GTAO im Halm: teuer und flimmernd (w6-kontakt).
- Erosions-Rinnen T3: vom Kern verworfen (gelaende-core.js:371). Grammatik-Baum: gesperrt durch gate:no-second-treebuilder.
- Mehr Gestalten je Art, Jugend-Gestalt, Winterkleid/Geweih: kosten Ofen und VRAM gegen B und gehen nicht in 1 h.
- B-Spline auf Catmull-Rom und geschärfte Alpha widersprechen K20 (Treppe 0,477 → 0,25). Anisotropie GTX≠Radeon: von der Zeitreihe widerlegt.
- Interior Mapping, Canvas-Karten durchs Portal, 2D-Mauerverband: kein uv, kein freier Puffer, neue Programme gegen B.
- Charlie-Sheen und Kontakt-AO am Fell: Zwilling bzw. Selbstverdunkelung wie beim Halm.
- Tor-Live-Ziel, Flipbook, Wellengleichungs-Compute, Stable Fluids: verletzen das Tor-Gesetz (siedlung-tor.js:335) oder kosten Programme/VRAM gegen B/E.
- Wasser-Kronenschatten über CSM: Das Wasser ist MeshBasic, `empfang:true` wirkt dort nicht.
- Instrumenten-Physik, FDN-Hall, HRTF je Quelle, Murmuration per TSL: Feature unter Feature-Stopp oder Zwilling.
- Skelett-Fallback und k10 streichen: Normalisierung bzw. Anker der Prüf-Pose S1L.
- Tiere als CPU-Riss: KI-Uhr p99 0,4–0,5 ms bei 0 Tieren im Bild, der Riss liegt woanders. Nah-Kreis anheben, Ruhe-Band mit Phase: falsche Richtung.

## 9 Blinde Flecken
- Nichts lief: Jede Zahl ist eine Erwartung auf alter Basis (P1c 18.10., CPU-Riss 03.11., Tuch am Zweig 4538471f). Zuerst an main nachmessen.
- Die 2,5 GB im Renderer sind nicht zerlegt (ein Heap-Profil ohne ArrayBuffer), Foundry-Fäden bis 550 MB je Faden ungeklärt.
- Aktuelle Bilder fehlen für Wagen (31.10.), Tier (22.10.), Nacht (18.10.), Wasser (17.10.) und den Third-Spieler. w27-tiere-sicht war GRÜN ohne Tier.
- Der Ursprung von 1,79 MB WGSL je Boot (MeshStandard 127k je Programm) ist nicht zerlegt; dort kann die Wurzel der ~9 s Übersetzung liegen.
- Für 8,4 ms Karten-Fragment und die Radeon-Ankunft hat keine Linse eine neue Stelle gefunden.

## 10 Die ersten 90 Minuten des nächsten Kontos
1. GTX (OMEN), 1 Kaltboot an main: `diag-boot-stage --echt`, bei Kontrolle und +60 s die 4 Regionen aus `_streuRegionWartet` (vegetation-streu.js:1630) ausgeben → entscheidet Hebel 3.
2. Headless stadt-voll ohne Sattel: `diag-klang-zensus` liest s.fahrt.size und zählt Wagen 'faehrt' ≤ 160 m, dazu Σ Wege-Formen gegen 900 → Hebel 1 und 8 in einem Lauf.
3. Radeon: `werkbank bild --ist laub-kante` an b3613272 und 4f4b15a4 (je ~1,5 min) → Hebel 16.
4. Headless Genesis Third im Stand, 600 Takte: performance.now() um tuchTakt (koerper-core.js:7069) und renderShadow → Verteilung des E-Risses vor jedem Schnitt.
5. grundprobe + Gang 300 m an main (punkte.cjs:2365): ROT an creatures:bestand belegt Hebel 5, dann kreatur-leben.js:2407 schneiden.
6. `werkbank bild --ort stadt` an main mit lokal ergänztem imBild.fahrzeug: ROT belegt die Blindheit von C, danach die trasse-Pose (siedlung-ort.js:801).
7. Headless 400 Takte à 250 ms + `_weltUhrNimm(+900)` → Verhältnis Tag/ΔspielZeit (bild-himmel.js:2543); liegt es bei 2,5, die Uhr-Kette starten.
