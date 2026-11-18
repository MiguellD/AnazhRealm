# Lesen: Leib und Körper (koerper-core.js · stamm/koerper-leib.js) — main 18058dba

Feld: koerper-core.js (9 722 Z., der MENSCH-Kern — Tiere baut tetrapoda-core) und stamm/koerper-leib.js (3 510 Z., Wirt für Mensch UND Tier).
Kurzbefund: Der Mensch trägt ein echtes, wenn auch kleines Genom (Achsen in σ, Skelett-Bau, Gesicht, Leib-Raum je Person).
Das Tier trägt KEINS: eine Gattung = eine Zeile mit 5 Zahlen (tetrapoda-core.js:62), ein Ofen-Guss je Gattung, und das
Individuum unterscheidet sich vom Bruder nur durch `group.scale` (der bodySize-Wurf). Weder Alter noch Eltern, Geschlecht, Ort
oder Muster erreichen den Leib eines Tiers.

## (1) WAS TRÄGT — Gesetze, die das Spiel konsumiert (Leser)

Mensch (koerper-core):
- `labProportionen(d)` koerper-core.js:2064 — Kanon Drillis & Contini (0,818 H Schulter, 0,530 H Hüfte, 0,130 H Kopf; `_labKanon` :2088);
  mit `BAU_GESETZ` (:1599) die Gelenk-Lage je Person. Leser: `morphAuf` :2409 (jeder Guss), `leibBauRuhe` :2466, `haarKappe` :1490.
- `BAU_GESETZ` :1599 + `bauWurf` :1644 — 4 Skelett-Achsen (bauBein/Arm/Schulter/Hals), je 3 Ströme summiert, σ-normiert, Spanne ±2,5σ.
  Leser: `_rollHumanoidGenome` stamm/koerper-leib.js:69-72 (Wurf) → `_dialsAusGenom` :78 → Ofen-Key `_ofenMenschKey` :1928.
- `labMorph(p)` :2156 — Dial→Gestalt (effTone fällt mit Alter, totalFat = mass + 0,18·age, Dimorphismus über gender).
  Leser: `morphAuf` :2414, `fettDepot` :1307 (Unterhaut-Fett je Gelenk, MENSCH_FETT :1298).
- `GESICHT_GENOM` :4992 + `gesichtWert`/`gesichtAuf` :4998/:5004 — Auge, Mund, Braue, Haaransatz aus [0,1]-Achsen. Leser: `morphAuf` :2421, `haarKappe` :1499.
- `KOPF_MASS` :1564 / `kopfMass` :1570 — headRatio (Genom 0,92–1,16) skaliert den Kopf um das Kinn. Leser: `morphAuf` :2414.
- `LEIB_RAUM` :1659 + `leibRaumPunkt` :1724 — SMPL-artiger Raum (gender, mass, tone, age, kopf, hairVol, haaransatz, 3 Kappen-Achsen,
  4 Bau-Achsen; je Achse Knoten). Leser: `_tonTafel` stamm/koerper-leib.js:1546 / `_tonZeile` :1572 (Punkt je Person in der Ton-Tafel,
  4 096 Zeilen, `TON_TAFEL` :3279), Satz der Menge (`_gangSatz`, außerhalb des Felds).
- `menschPalette` :2011 / `MENSCH_TON` :1742 — Farbe folgt dem Samen (9 Töne). Leser: `_tonZeile`, `_tonFaktor` stamm/koerper-leib.js:1713.
- `LEIB` :5072 — dichteKgM3 985, kopfM 0,2125 m, Kapsel, Sturz (schadlosMs 7,7), Sprung (abdruckM 0,4, refKg 89). Leser: `leibMasse` :5439,
  `leibMassstab` :5433, Wirt `_leibMasse` stamm/kreatur-verhalten.js:770 (über `_leibVolumen`).
- `leibGroesse(dials)` :5447 — height²·(1+0,25(mass−0,35))·(1+0,1(tone−0,5)). Leser: `_humanDialSizeFactor` stamm/koerper-leib.js:3023 (Stats).
- `PRESETS.mensch.fx.bewegung` :499-695 — speed/jump/schwimmen/parkour/gang/luft (SI, „Realitäts-Eichung"). Leser: `leibGesetz` :5415,
  `_gangZeile` stamm/koerper-leib.js:492 (GANG_FELDER :3201).
- `TAGES_GESETZ` :5126 — Tag eines Menschen als Funktion von Same × Stunde. Leser: Wirt `_bewohnerSoll` (außerhalb).
- `VERB_GESETZ` :5397 (Pendel, Gleitreibung, Brachiation), `leibGangTakt` :6930, `leibRigPose` :7035, `leibZweiKnochen` :6908, `xpbdSchritt` :8175
  (Tuch). Leser: `_gaitTakt` stamm/koerper-leib.js:560, `_animateHumanoidRig` :897, `_twoBoneIK` :527.

Tier (Wirt in koerper-leib, Gesetz in tetrapoda-core):
- Gang: `tetrapoda gangSchritt` (Froude, Tastgrad) über `_gaitGesetz` stamm/koerper-leib.js:481; Pose `core.tierPose` über `_animateTierBaum` :2377-2391.
- Masse = Volumen der geschlossenen Haut × Skala³ × ρ: `_leibVolumen` :3326 (Divergenz-Satz `_geschlossenesVolumen` :3283), gemessen bei Größe 1:
  Fuchs 0,015 · Wolf 0,064 · Hirsch 0,094 · Bär 0,335 · Mensch 0,090 m³ (:3324-3325); ρ Tier 1000 (tetrapoda-core.js:3943 MASSSTAB).
  Leser: `_leibMasse` stamm/kreatur-verhalten.js:770 → Temperament (kreatur-leben.js:636), Beute (kreatur-verhalten.js:334), Biss (:818),
  Kadaver (kreatur-leben.js:1002), Stoß.
- Quer-Maß der Gestalt `_tierQuerMass` stamm/koerper-leib.js:2353 (Kollision = Bild) und Hüft-Höhe `beinL` :2513 (m). Leser: `_kreaturLeib`, Gang.
- Welt-Maßstab `MASSSTAB.meterJeEinheit` 1/3 (tetrapoda-core.js:3943), Leser `_buildCreatureGroup` :2484.

## (2) WÜRFE UND TABELLEN

Tier:
- `_creatureBodySize(idStr)` stamm/koerper-leib.js:2545 — FNV-Wurf `_rollGenome(id, "creature-size").axis("class")` (Roller stamm/bau-teile.js:1479),
  Band-Wahl aus `VERHALTEN.groessen` tetrapoda-core.js:253-258 (klein 18 % 0,6–0,82 · normal 64 % 0,85–1,18 · groß 14,5 % 1,25–1,75 ·
  gigant 3,5 % 1,9–2,7), dann `g.range(Bandname, min, max)`. Kein Gesetz dahinter: liest weder Gattung, Alter, Eltern, Ort noch Nahrung.
  Wirkung: Länge ×4,5 (0,6→2,7), Masse ×91 (bs³ über `_leibMasse`-Skalenkette), HP/Tempo über bs^0,5 (kreatur-leben.js:731),
  Leine ×bs (kreatur-verhalten.js:553), Temperament-Key (kreatur-leben.js:625), Beute/Biss über Masse, Stufen-Grenze `ab × scale`
  (`_gelenkStufe` stamm/koerper-leib.js:410). Kommentar nennt „klein" „Jungtier/Zwerg" — Alter liest er nicht.
- Die Saat des Wurfs ist die SPAWN-NUMMER: `netId = "c" + _creatureNetSeq` (kreatur-leben.js:140-141) → Größe hängt an der Reihenfolge der Spawns;
  Geburt würfelt `"b"+key+"."+floor(rng()·1e9)` (kreatur-leben.js:1993) — das Junge erbt NICHTS vom Wurf der Mutter; Gehege `"g"+p.id`
  (kreatur-gehege.js:64); Peer `_creatureBodySize(e.id)` (netz-p2p.js:1527).
- `TETRAPODA_SOUL_MAP` stamm/koerper-leib.js:3484 — 4 Seelen → 4 Rezepte (wesen→deer, wolf, fuchs→fox, baer→bear). Tabelle.
- `GATTUNGEN` tetrapoda-core.js:62 — 4 Zeilen {size, neck, leg, diet, build}: die ganze Art ist 5 Zahlen von Hand. Basis von `_ofenKreaturDials` :1025.
- `CREATURE_ARCHETYPES` / `CREATURE_SKELETON_G` (kreatur-leben.js:3518) gelesen in `_tetrapodaSoulParts` :2432 — Archetyp-Tabelle, ein ZWEITER
  Körper (die Mechanik-Teile: Tags/Stats/Physik) neben dem Ofen-Leib; nur 4 Dial-Achsen (DIAL_MAP tetrapoda-core.js:823) überschreiben ihn.
  `size` ist dort bewusst unmapped (:3493).
- `herde.wurf` tetrapoda-core.js:279 — Wurfgröße je Gattung (Tabelle mit Literatur), Kopfzahl per rng (kreatur-leben.js:1989).
- `MOTION_HOST_RECIPE = "wolf"` :3399 — JEDES Tier liest die Bewegungs-Profile des Wolfs (`_motionStudioProfile` :2837, `_tetrapodaVerhalten` :2847).
- `_kreaturDiet` :2873 — Ernährung = Dial `diet` der Gattung, Fallback 1 (Fleischfresser) ohne Buch.
- `MOTION_ROLE_SIGNATURES` :3368 / `MOTION_ROLE_FLOOR` 0,55 :3380 — Gewichts-Tafel der Bewegungs-Rollen (Compound-Seelen, nicht Studio-Tier).
- `_animateCompoundMotion` :3032 — Amplituden-Literale (Bein 0,45, Arm 0,3, Flügel 11/5,5 Hz-artig, Kopf 0,05) ohne Anker.

Mensch:
- `_rollHumanoidGenome` stamm/koerper-leib.js:10 — Paletten-PICK aus Tabellen: skinTone (8 Töne SKIN_TONES koerper-core.js:757),
  hairColor (gefiltert ≤ 50° Farbton aus HAIR_COLORS :759), top/bottom/schuh (13 CLOTH_COLORS :179), schnitt (9 HAAR_KAPPE :1477) —
  gleich verteilte Würfe, kein Erbe, keine Herkunft (Hautton unabhängig vom Ort/UV).
- Achsen `sex`, `build`, `muscle`, `alter` (0,05–0,5), `headRatio`, `haarLaenge/Fuelle`, Gesicht — gleich verteilte FNV-Achsen (:36-61);
  nur `kh` (Summe zweier Achsen, ±8 % um 1,72 m :43) und der Bau (`bauWurf`) sind gehäuft. Keine Kopplung (Größe ⟂ Geschlecht ⟂ Statur).
- `_menschAnkerFarben` :1486 — Haut/Haar des Default-Menschen aus FNV(worldSeed) über die Tafel.
- `START_PARAMS` koerper-core.js:77, `MOTION` :80 (10 Profile), `PARAMS` :88 (Slider) — Lab-Literale, „byte-treu".
- `GESTALTEN_JE_REZEPT = 1` koerper-core.js:37 — Gesetz: „der Guss ist seed-invariant … eine Seed-Achse ist ein Re-Mint-Akt" (:33-36).
- `LEIB_SOLL.kanon` :1399 — ANSUR-II-Mittel „QUELLE UNGEPRÜFT … aus dem Gedächtnis des Koordinators" (:1395-1397); BAU_GESETZ-Spannen ebenso (:1590).

## (3) GRÖSSEN MIT EINHEIT (lesbar für ein Erbe-/Evolutions-Gesetz)

Vorhanden:
- Masse kg (Tier: Volumen m³ × 1000 kg/m³; Mensch: × 985) — `_leibVolumen` :3326, `leibMasse` koerper-core.js:5439; gemessen, nicht gesetzt.
- Hüft-Höhe/Beinlänge m (`beinL` :2513, `_gaitBeinMass` :504) — liest das Gang-Gesetz (Froude: Schritt, Tastgrad, Tempo √(gL)).
- Körperhöhe m: Mensch kh (Kopf-Einheit 0,2125 m, PLAYER_KH), Tier Widerrist via MASSSTAB 1/3 m je Einheit × GATTUNGEN.size.
- Quer-Radius je Achse in Hüft-Höhen (`_tierQuerMass`), Volumen-Kugel (`_tierReichKugel` :2318).
- Schwere g (state.gravity, `_gangZeile` :492), Dichte, Sturz-Energie J/kg (LEIB.sturz), Abdruck-Weg m und Bezugs-Masse 89 kg (LEIB.sprung).
- Mensch-Anatomie als Anteil von H (MENSCH_SOLL :1324, LEIB_SOLL.kanon :1399), Bau in σ (BAU_GESETZ :1599).
- Bewegung SI: speed 1,15 m/s Basis, sprintMul, kletterV 0,6 m/s, Haar-Feder 2,5 Hz / Dämpfung 0,35 (HAAR_WIND :3268).

Dimensionslos ohne Einheit (Tier): GATTUNGEN neck/leg (Bruchteil), diet 0–1, build 0–1, size in Lab-Einheiten; bodySize Faktor.

Fehlen ganz (in beiden Dateien nicht gefunden):
- Alter eines Tiers als Wachstum (alterS läuft, kreatur-gehege.js:144, aber kein Leser im Leib); Wachstumskurve (von Bertalanffy o. ä.).
- Geschlecht eines Tiers (kein Feld in GATTUNGEN, kein Dimorphismus).
- Stoffwechsel (Kleiber W ∝ M^0,75), Lebensdauer, Reifealter, Reproduktionsrate je Masse.
- Fell/Haut-Muster, Färbung je Individuum, Narben/Verletzungs-Spuren (grep: keine Narbe/Muster in beiden Dateien).
- Genotyp→Phänotyp-Kette und Erbe Eltern→Kind (die Geburt würfelt neu, kreatur-leben.js:1993).
- Klima-/Ort-Anpassung (Bergmann/Allen) — die Größe liest keinen Ort.

## (4) NAHT — die EINE Stelle

`_ofenKreaturDials(recId, ovOpt)` stamm/koerper-leib.js:1022-1032.
Heute: `basis = core.GATTUNGEN[recId]` (4 Handzeilen) + Buch-Dials (`_tetrapodaStudioDials` :1005) + Prägung/ov → `{dials, istDefault}`.
Ihre Leser: der Ofen-Key und Guss `_ofenKreaturTemplate` :1295-1316 → `_buildCreatureGroup` :2477/:2502 (jeder Tier-Leib, beide Stufen),
`_ofenPrefetchKreaturen` :2173, `_ofenStandBestellen` :2247-2248, `_ofenVorlageBestellen` :2192, `_creatureTemperament` kreatur-leben.js:633.
Damit ist sie der Punkt, an dem „Art = Funktion(Samen)" statt `GATTUNGEN[recId]` eintreten muss.
Sie ist HEUTE NICHT die einzige Tür — drei Leser umgehen sie und müssten mit umziehen:
- `_creatureBodySize` :2545 (die Größe; liest weder Art noch Dials; Schreiber `userData.bodySize` kreatur-leben.js:147-153),
- `_tetrapodaSoulParts` :2422 (Mechanik-Körper aus Archetyp-Tabelle + `_tetrapodaStudioDials`, nicht aus `_ofenKreaturDials`),
- `_kreaturDiet` :2873 (liest `_tetrapodaStudioDials` direkt, Fallback-Literal 1).
Und der Art-Raum selbst ist eine Tabelle: `TETRAPODA_SOUL_MAP` :3484 (4 Seelen), `CREATURE_SOULS[soulName]`-Fallback auf „wesen" :2471.
Für das INDIVIDUUM gibt es am Tier keine Naht: der Memo-Key ist `recId|lod|JSON(dials)` (:1033-1040) — ein Individuum mit eigenen Dials ist
eine eigene Vorlage (Guss, MB, Programme). Das Muster, das beim Menschen Individuen billig trägt, ist `LEIB_RAUM` koerper-core.js:1659
(Vorlage am Mittel-Knoten + Formziel-Tafel + Punkt je Person in der Ton-Tafel) — für Tiere fehlt es.

## (5) PREIS — was Quelle/Kommentar nennen

Je Art (Tier), heute:
- 2 Vorlagen im Memo (lod 0, lod 1) `fest` aus dem Vorrat (:2175); `OFEN_MEMO_RUHEND = 2` (:1371) hält nicht-feste ohne Leib.
- Guss im Faden; Haupt-Faden-Kaltguss nur laut (`_fadenUmgangen` :1303). Vorrat kalt K60: „acht Güsse (Mensch, Reh, Wolf, Fuchs je zwei
  Stufen) hielten den Faden kalt 7 s" (:2152-2153) → ~0,9 s Faden-Zeit je Guss.
- Programme: Erst-Zeichnung je Leib-Prägung und Stufe als Vorbau-Gast (`_ofenStandVorbau` :2278-2302, `_leibVorwaermen` :272 je Seele);
  „GTX 1050 1,4–5,7 s NACH der Wiederkehr" ohne Vorbau (:2271); Frost-Wand S2 +5 Module/+4 Pipelines je ungezeichneter Seele (:262).
  KNOCHEN_RASTER 40 (:3252) faltet Knochenzahl-Klassen, Füllplatz 64 B + 1 Matrix-Mul je Bild.
- Glieder-Vorrat je Gattung (`_gliederBestellen` :2184).
- JS-Speicher: „~9,6 MB JS" je zwei Vorlagen (Mitspieler-Erscheinung, :1326); Werkstatt-Einzelstücke 2,4 → 50,1 MB bei 20 Reglerwerten (:1324).
- Tris/Draws der Tier-Stufen: Zeile in tetrapoda-core PORTAL_RENDER_CONFIG — nicht gelesen (OFFEN).
Je Individuum (Tier): Klon ~1 ms (:2474, :2149), geteilte Geometrie; Draws nach Starr-Bindung — vorher „5 nahe Wölfe = 421 von 474 Draws,
je Wolf 35 starre Teile" (:1069-1070); Bündel-Hülle 425 → 66 µs je Takt für den losen Weg des Leibs (:225). Größe kostet nichts (scale).
Mensch je Stufe (koerper-core.js:48-60): L0 40 000 Tris / 8 Draws · L1 14 000 / 6 (ab 40 m) · L2 Menge 1 700 / 1 · L3 nur Wurf 360 / 1.
Mensch-Leib tauschen: Rohguss 17–36 ms + Gelenk-Gestalt 13–24 ms headless; GTX ego/wechsel p95 228,9 ms vor dem Leerlauf-Tausch (:2136-2137).
Ton-Tafel: 4 096 Zeilen = Obergrenze gleichzeitiger individueller Menschen-Paletten (:3279, Bruch laut :1580).
Was mit der Zahl der Arten wächst: Vorlagen (2 je Art, fest), Guss-Zeit im Faden (~0,9 s je Guss kalt), Programme/Pipelines (je Knochen-Klasse
und Stoff, gefaltet durch KNOCHEN_RASTER), Vorbau-Takte (eine Gattung zur Zeit, `_ofenStandVorbau`), Memo-MB. Mit Individuen-Dials heute:
dasselbe JE INDIVIDUUM (Key enthält die Dials) — Millionen Arten × eigene Individuen sind in diesem Pfad nicht bezahlbar.

## (6) OFFEN

- koerper-core.js nicht Zeile für Zeile ganz gelesen: gelesen 1–190, 476–765, 1280–1800, 2005–2475, 4985–5225, 5370–5520; der Rest
  (Haar-Streu 392–1046, Relief/Urteile 2475–4985, Verben/Pose/Tuch 5520–9722) nur über Funktions-Karte und Stichwort-Grep. Dort keine
  Spur von Tier, Erbe, Narbe, Muster gefunden; die Tuch-/Verb-Physik ist SI, aber nicht genom-gebunden.
- koerper-leib.js 700–890 (Fuß-IK) und 2085–2300 nur überflogen; keine Individuen-Größe dort.
- Tris/Draws/Bake-ms der TIER-Stufen (tetrapoda-core PORTAL_RENDER_CONFIG, `bauTier`, `deriveTierParams` :~830) nicht gelesen.
- Wie viele „Gestalten" je Siedlung der Wirt für Bewohner gießt (`_bewohnerGestalten` siedlung-bewohner.js:291) und ob deren Ofen-Key die
  Bau-Achsen trägt (dann wäre jeder Bewohner mit eigenem Bau eine Vorlage) — nicht geprüft.
- Ob `computeCreatureStats` außer bs^0,5 weitere Größen-Leser hat (kreatur-leben.js:720-735 nur angelesen).
