// Gruppe III — Sicht und visuelle Tiefe (Meisterkarte 2.0, Stand main dc6702ab)
module.exports = {
  gruppe: {
    key: "sicht",
    titel: "III · SICHT UND VISUELLE TIEFE — Licht, Ferne, Material, Schatten, Stufen",
    intro: "Visuelle Tiefe heißt: jede Fläche zeigt ihre Physik, jede Stunde hat ihr Licht, die Ferne trägt Luft, Saum und Schatten, und keine Stufe verrät sich — aus jeder Pose des Spielers, gemessen aus dem Ausgabe-Bild auf beiden Geräten. Die Posen-Matrix aller Klassen ist Bürgschaft (A-Spiegel), kein eigener Punkt."
  },
  bereiche: [
    {
      key: "licht",
      titel: "Licht, Himmel, Wolken und die Tag-Achse",
      dom: "`stamm/bild-himmel.js` (Belichtung, Himmel, Wolken) · `stamm/bild-sicht.js` (Feld-Pass, Panorama, Wasser) · `foundry-core.js` ATMO_GESETZ · `scripts/lib/licht-linsen.cjs`",
      v1: "v1 (sehen) · A (himmel-licht)",
      aaaa: "Über den ganzen Spieltag ist das Ausgabe-Bild EINE stetige Kurve der Sonnenhöhe: kein Sprung über 0,1 EV je 0,72° Sonne, monoton bis Mittag (keine Stunde mehr als 0,15 EV über Mittag), der Mittag absolut verankert. Sonne 10° liegt morgens UND abends 0,5–1,0 EV unter Mittag und ist wärmer (R/B ≥ 1,3× Mittag); die Nacht liegt 3–5 EV darunter und bleibt lesbar (Luma ≥ 22, Purkinje-Blau, Sterne nach Grenzgröße). Sonne zu Himmel steht an jeder Stunde und in jedem Wetter im realen Verhältnis (klar 5–12,5 nach Liu & Jordan, bedeckt ≤ 1,5), gemessen an einer Kugel in der Szene. Jede Fernstufe — Karte, Feld-Pass, Panorama, Wasser — zeigt dieselbe Fläche gleich hell. Wolken sind Volumen mit Silberrand und ziehen ihren Schatten über Wiese und Wald, ≤ 1,0 ms auf der GTX. **Wo wir die Besten schlagen:** Forza fotografiert 24 h Himmel, Tsushima backt LUTs; bei uns rechnen Studio und Welt jede Stunde jedes Wetters an jedem Ort aus EINEM Medium (ATMO_GESETZ, Labor = Welt), und jede Stunde wird als Bildkurve auf zwei Geräten bewiesen.",
      beste: [
        "**Ghost of Tsushima** (Patry, SIGGRAPH 2021 Advances): Belichtung aus der Beleuchtungsstärke statt aus der Bild-Luma, nachts mit Purkinje; Rayleigh/Mie-LUTs je Frame für Sonnen- und Mondwinkel; Dunst als Froxel 128×64×64 bis 100 km in ≈ 0,5 ms (PS4).",
        "**Frostbite** (Lagarde & de Rousiers 2014, Moving Frostbite to PBR): physikalische Kamera in EV100, Sonne bis ≈ 100 000 lx, Belichtungs-Kompensation statt voller Adaption.",
        "**Forza Horizon 5** (Playground 2021): der Himmel als 12K-HDR-Zeitraffer über 24 h; Licht und Wolken aus derselben Aufnahme.",
        "**Horizon Zero Dawn** (Schneider, SIGGRAPH 2015): volumetrische Wolken von Cirrus bis Cumulus im Budget von 2 ms auf der PS4."
      ],
      kriterien: [
        {
          name: "Die Tag-Kurve: monoton, stetig, golden, Nacht lesbar — über die GANZE Bahn",
          punkte: 0,
          staffel: "1 = an einem Gerät in einer Sicht über die ganze Bahn im Soll · 2 = beide Geräte, Ego UND Third",
          messung: "werkbank licht --tag (die S7-Linse, gate:tag-achse:echt), erweitert: Uhr 0…1 in Schritten von 0,01 (um den Horizont 0,002), Spawn und Mess-Wiese, Ego UND Third, Ausgabe-Pfad, ≤ 3 min je Gerät. Soll: Mittag absolut verankert (18-%-Karte Luma 110–130); Sprung ≤ 0,1 EV je Schritt; keine Stunde > Mittag + 0,15 EV; Sonne 10° morgens und abends einzeln −0,5…−1,0 EV und R/B ≥ 1,3× Mittag; Nacht −3…−5 EV bei Luma ≥ 22; die Kurve folgt einer REF-Kurve aus realen HDR-Zeitraffern (Datei in spec/farbe) auf ±0,3 EV.",
          beleg: "S7 ist auf main (Merge 6e0f1a4a in f2904a72): EINE Tag-Achse, Belichtung synchron aus der Bestrahlungs-Tafel, Dämmerungs-Sprung 2,57 → 0,42 EV; gate:tag-achse:echt (SPRUNG, PUMPE, EINBRUCH) GRÜN im echt-Job an der GTX (CI 39498582018 an f2904a72). Die goldene Stunde trifft an der GTX: Mess-Wiese Ego, gleiche Pose, Uhr 0,27 gegen Mittag Helligkeit 63,7 gegen 81,3 (−22 %) an 8ba1510d, an dc6702ab 111,9 (+37 %) (OMEN, koordination `bericht/2010-buendel2-abab.md`). Die ganze Bahn hält nicht: am S7-Kopf (`spec/farbe/tag-kurve.json` kopf, Radeon, Mess-Wiese, Ego) liegt Uhr 0,33 (28,7°) bei Y 0,221 gegen Mittag 0,115 = +0,94 EV ÜBER Mittag (Luma 118,8 gegen 87,4) — die Linse urteilt das Fenster der Dämmerung, nicht die Monotonie; eine REF-Kurve aus HDR-Zeitraffern gibt es in spec/farbe nicht; Third ungemessen. → 0, das Vorher von H1 (M21).",
          schlupfloch: "Das Fenster-Urteil (TAG_SOLL tief [−18; 15]°) ließ den Buckel darüber durch; Grenzen nur relativ zum Mittag bestünde, wer jede Nicht-Mittags-Stunde abdunkelt (B34) — darum der absolute Anker und die REF-Kurve; eine Kurve nur in Ego an einem Blick ist über die Richtung zur Sonne stellbar — darum Ego UND Third, zwei Orte, Luma nur aus dem Ausgabe-Bild.",
          aenderung: "Mittag-Anker und REF-Kurve neu (B34); S7 ist seit f2904a72 auf main, sein Buckel ist das Vorher von H1."
        },
        {
          name: "Licht-Bilanz an einer Kugel in der Szene: Sonne zu Himmel je Stunde und Wetter",
          punkte: 1,
          staffel: "1 = klar am Mittag Verhältnis 5–12,5 und Schatten-Anteil 0,08–0,20 an einem Gerät · 2 = alle Spalten Uhr 0,5/0,27/0,73 × klar/Regen, beide Geräte",
          messung: "Spielgang-Station Mess-Wiese: eine 18-%- und eine Weiß-Kugel als Proben-Leib über das EINE Stoff-Programm der Welt (Albedo-Zeile der Tafel; ein eigenes MeshStandardMaterial auf der Kugel ist im Selbsttest ROT); aus der Luma von Sonnen- und Schattenseite im Ausgabe-Bild Licht-Verhältnis, Schatten-Anteil und Himmels-Azimut. Soll (Liu & Jordan 1960): klar mittags 5–12,5, Schatten-Anteil 0,08–0,20, Himmel zur Sonne ≥ 1,2; Sonne 10° ≥ 2,5; bedeckt ≤ 1,5.",
          beleg: "GEMESSEN 21.10. an der GTX (OMEN, bericht/2110-messschuld2.md): 18-%-Kugel über den Welt-Stoff, klar Mittag, Mess-Wiese, n = 3 gültige Läufe (Spielcode = main 32b37933 bzw. 97d8ee94): Verhältnis Sonne/Himmel 5,013, Schatten-Anteil 0,1995 dreimal bit-gleich → Staffel 1, an der UNTEREN Kante (ohne Scheiben-Verdeckung 4,89 / 0,2045 je ~2 % außerhalb); Weiß-Kugel in der Schulter der Tonkurve zählt nicht; Himmels-Azimut ungemessen. Vorher: Tafel himmel-licht 5,188 · 0,193 · 1,272 (Radeon, cbc222cc), am Kopf veraltet; gelesen aus `_waagrechtIrradianz` in `_dayNightApplyBelichtung` (`stamm/bild-himmel.js:2038-2056`) — derselben Größe, aus der die Belichtung rechnet (SYSTEMKARTE W9: der Richter im Gerichteten). Uhr und Wetter: 0 Proben.",
          schlupfloch: "Wer die Rechnung misst, misst sich selbst: ein Fehler hinter der Rechnung (Stoff-Antwort, Ton-Kurve, Schatten-Knoten) bliebe grün. Eine Kugel mit eigenem Stoff mäße die Probe statt der Welt (B35).",
          aenderung: "Karte 1.0 gab Licht K1 „Mittag GRÜN“ aus der Rechnung der Belichtung → 0; die Kugel muss über den Welt-Stoff zeichnen (B35)."
        },
        {
          name: "EIN Lichtweg: Karte, Fern-Ring, Feld-Pass, Panorama und Wasser zeigen dieselbe Fläche gleich hell",
          punkte: 0,
          staffel: "1 = Karte und Fern-Ring je Uhr 0,5/0,27/0,05 im Band 0,9–1,1 an einem Gerät · 2 = auch Feld-Pass, Panorama und Wasser, beide Geräte",
          messung: "Die F6-Linse (werkbank licht --laub fichte,tanne,ring,haus --karte --uhr), erweitert um Feld-Pass, Panorama und Wasser: Luma-Verhältnis Fernstufe/Gestalt an der Naht je Uhr 0,5/0,27/0,05. Die Sicht im Wetter zählt Ferne K5.",
          beleg: "Der Feld-Pass hat einen eigenen Licht-Term `0.3 + 0.7·N·L/max(sun.y,0.2)` ohne Himmels-Tafel (`stamm/bild-sicht.js:917-921`), das Panorama eine WGSL-Lambert-Kopie (`:1843-1851`), das Wasser uIrr (`:1078-1081`). F6 maß nur die Karte: Nacht 2,18 → 1,11 (GTX 18.10., `bericht/1810-f6-gtx.md`); seither änderte sich der Karten-Bake (`stamm/stoff-instanz.js`, 47 Zeilen zwischen f5b66780 und dc6702ab). Gemessen am Kopf f2904a72 (21.10., Radeon 890M --echt, Messschuld M5, ROT): der Fern-Ring gegen den Boden-Satz am Messort dorf (`werkbank licht --laub ring --karte --uhr 0.5,0.27,0.05`) — Mittag 1,076, Uhr 0,27 1,614 (gegen Mittag 1,50, ΔL* +4,25), Uhr 0,05 1,094 (1,017): in der Dämmerung steht die Ferne 50 % heller als die Nähe, außerhalb 0,9–1,1. Die Karten-Zeilen (fichte, tanne) hingen im selben Lauf nach fichte@0,5 über 12 min ohne Ergebnis (Welt-Loop aus, Ring 2 von 4) und wurden abgebrochen — ungemessen. Roh: koordination `bericht/2110-messschuld-radeon/m5-*`.",
          schlupfloch: "Der Mittag versteckt jeden Hand-Term (bei hoher Sonne fallen 0,3 + 0,7·N·L und Lambert fast zusammen): die Spalten 0,27 und 0,05. Eine Absenz-Probe auf Text wäre Linsen-Kosmetik: es urteilt das Bild-Verhältnis.",
          aenderung: "Die F6-Messung zählte zweimal (Licht K3, Ferne K5) — EIN Heim hier."
        },
        {
          name: "Wolken mit Körper und Schatten",
          punkte: 0,
          staffel: "1 = der Wolken-Schatten wandert mit dem Wolkenfeld über die Wiese (r ≥ 0,6) an einem Gerät · 2 = auch über Wald, Silberrand im Gegenlicht ≥ 1,3, Unterseite dunkler als Oberseite, Himmel ≤ 1,0 ms gpu-bank an der GTX, beide Geräte",
          messung: "werkbank bild mit zwei Frames im Abstand 5 s an der Mess-Wiese, Deckung 0,4 gegen 0; Korrelation der Schatten-Verschiebung am Boden mit dem Wolkenfeld.",
          beleg: "`stamm/bild-himmel.js:90-159` ist EINE 2D-FBM-Projektion (sp = dir.xz/(dir.y+projY)) mit Deckungs-Schwelle (`:1852`); das Licht der Wolke kommt korrekt aus den Tafeln (`:148-159`), aber keine Größe für Wolken-Schatten hat einen Leser, und es gibt kein Volumen.",
          schlupfloch: "Ein bei Deckung dunklerer Himmel erzeugt Varianz ohne Schatten: die Korrelation mit der Verschiebung am Boden verlangt den echten Wurf; ein gemaltes Muster wandert nicht mit dem Wind des Felds."
        },
        {
          name: "Wetter und Nacht als Zustände des EINEN Mediums: Übergang ohne Bruch",
          punkte: 0,
          staffel: "1 = der Wetter-Zug klar → Regen → klar ohne Sprung > 0,1 EV/s an einem Gerät · 2 = Licht-Verhältnis der Kugel unter Regen ≤ 1,5, Sterne bei Neumond > 0, Purkinje B/R ≥ 1,2× Mittag, beide Geräte",
          messung: "Spielgang-Station Wetter-Zug (Wetter als Spieler-Wort, die 45-s-Transition) und Mitternacht klar ohne Feuer, Ausgabe-Luma je Sekunde. Das Nacht-Niveau zählt K1, die Sicht im Wetter Ferne K5.",
          beleg: "Das Gesetz steht: `_luftBeta` aus dem Wetter-Feld (`stamm/bild-himmel.js:2221-2228`), Dämmerung und Sternen-Licht aus der Grenzgröße (`:1308-1327`), Regen als fallender Satz (`:821-911`); keine Linse fährt einen Wetterwechsel im Bild; die Nacht ist am Kopf ungemessen.",
          schlupfloch: "Ein Wetterbild nur im Endzustand verbirgt den Sprung beim Übergang; Nacht-Luma allein ließe ein graues Bild zu: Purkinje und Sterne verlangen die Nacht als Zustand.",
          aenderung: "Nacht-Niveau (K1) und Sicht (Ferne K5) je EIN Heim; hier bleibt der Übergang."
        }
      ],
      hebel: [
        { name: "Das Urteil über die GANZE Bahn: Mittag-Anker, REF-Kurve, der Buckel bei Uhr 0,33 fällt", k: ["licht.K1+2"], t: [1.5, 2], wurzel: "`stamm/bild-himmel.js:_dayNightApplyBelichtung` (EV-Gesetz mit Kompensations-Steigung 0,5–0,7 statt 1, der Weg von Frostbite/UE5; die Tag-Achse `_tagAchse` steht seit 6e0f1a4a auf main) + `scripts/lib/licht-linsen.cjs` tagKurveUrteil über −18…90°; ABAB beider Geräte.", pflicht: "A (himmel-licht)", v1: true },
        { name: "EIN Licht-Baustein für Feld-Pass, Panorama und Wasser", k: ["licht.K3+2"], t: [1, 1.5], wurzel: "`stamm/bild-sicht.js` Feld-Pass `neig` (`:917-921`), Panorama-WGSL (`:1843-1851`), Wasser uIrr (`:1078`): alle lesen Sonne × Schatten und die Bestrahlungs-Tafel der EINEN Atmosphäre.", pflicht: "A", v1: true },
        { name: "Wolken-Volumen und Wolken-Schatten aus HIMMEL_GESETZ", k: ["licht.K4+2"], t: [3, 3], wurzel: "`stamm/bild-himmel.js:_himmelSicht` (`:78-160`) → 2,5D-Dichte (Höhen-Profil × FBM × Deckung), Raymarch in ¼-Auflösung über TAAU (`stamm/bild-kosten.js:_zeitAufloesung` `:1029`); Schatten: dasselbe Feld längs der Sonne als EIN Lookup im receivedShadowNode (`stamm/stoff-material.js:1263`).", pflicht: "— (Last: E ≤ 1,0 ms GTX)", v1: false },
        { name: "Purkinje, das Licht des Wetters und die Übergangs-Linse", k: ["licht.K5+1"], t: [1, 1], wurzel: "Post-Kette `stamm/bild-kosten.js` (Purkinje aus `_daemmerung`, `stamm/bild-himmel.js:1308`); Licht-Verhältnis unter Regen aus WEATHER_FIELD.sun im Richtlicht-Schreiber.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Drei Wellen drehten an der Belichtung — V18.507 (01.10.), D3-N2 und D3 Nachbesserung 2 (15.10.) —, jede mit grüner 18-%-Karte, und das Bild blieb invertiert: die Belohnung „die Karte steht zu jeder Stunde auf Mittelgrau +1 EV“ belohnte das Glätten des Tags. S7 (14 Commits, seit f2904a72 auf main) heilt die Dämmerung — an der GTX ist Uhr 0,27 golden (−22 % gegen Mittag statt +37 %) —, urteilt aber im Fenster −18…15° und lässt Uhr 0,33 mit +0,94 EV über Mittag durch — dieselbe Falle eine Etage höher, die ganze Bahn gemessen nur an der Mess-Wiese, Ego, Radeon.",
        anders: "Die Kamera wird ein Gesetz (EV100 aus der Szenen-Bestrahlung mit Kompensations-Steigung 0,5–0,7 statt 1, der Weg von UE5 und Frostbite); Richter ist die Bildkurve der GANZEN Sonnenbahn gegen eine REF aus realen HDR-Zeitraffern (der Weg von Forza) mit absolutem Mittag-Anker, in Ego und Third, auf beiden Geräten — nie wieder eine Zahl der Belichtung selbst."
      }
    },
    {
      key: "ferne",
      titel: "Ferne bis zum Horizont — Luft, Kante, Kamm-Saum, Fernschatten, Wetter-Sicht",
      dom: "`stamm/gelaende-fern.js` (FERN_RING, Kronen-Albedo) · `stamm/bild-himmel.js` (Luft) · `foundry-core.js` LUFT · `gelaende-core.js`",
      v1: "v1 (sehen) · A (Ferne) · E (Boden-Haushalt)",
      aaaa: "Vom Hügel (Auge 120 m) und aus Augenhöhe sieht der Spieler bis zur Sichtweite der Luft (klar 20 km, Sturm 1,5 km), ohne Welt-Kante: am Rand bleibt ≤ 2 % Restkontrast. Der Kontrast fällt nach Koschmieder e^(−βd) ±15 % bei 1/2/5/8 km und je Kanal: die Ferne wird blau, tiefe Sonne rötet fernes Weiß, die Sonnenseite ist ≥ 1,2× heller. Bewaldete Grate tragen bis 8 km einen Saum mit ≥ 10 m Kronen-Relief und zerfranster Kammlinie. Bei Sonne ≤ 5° werfen Grate Schatten in Täler 2 km dahinter. Im Sturm schrumpft die Sicht, und der Regenvorhang steht aus 2 km sichtbar. Alles ≤ 1,5 ms auf der GTX, im Boden-Haushalt (12 Befehle / 120k Dreiecke). **Wo wir die Besten schlagen:** MSFS streamt Petabytes, Far Cry setzt Wald und Flüsse von Hand; wir rechnen Saum, Fernschatten und Luft aus EINEM Gelände-Kern und `treeParams` für jeden Ort einer endlosen Welt, ohne Bake.",
      beste: [
        "**Ghost of Tsushima** (Patry 2021): Dunst-Froxel 128×64×64 von 10 cm bis 100 km in 0,5 ms (async compute, PS4).",
        "**UE5 SkyAtmosphere** (Hillaire, EGSR 2020): Durchlass-LUT 256×64, Mehrfachstreuung 32×32, Luftperspektive als 32³-Froxel unabhängig von der Bildauflösung, skaliert bis zum iPhone 6s.",
        "**Microsoft Flight Simulator** (Asobo 2020): die ganze Erde aus jeder Höhe bis zum Horizont, Gelände und Wald aus ≈ 2 PB Kartendaten gestreamt.",
        "**Far Cry 5** (Moore, GDC 2018): ein 10 × 10 km Höhenfeld in jeder Entfernung über EINE GPU-Quadtree-Kette; Wald und Flüsse von Hand gesetzt."
      ],
      kriterien: [
        {
          name: "Die Luft macht Tiefe: Kontrast nach Koschmieder, je Kanal, mit heller Sonnenseite",
          punkte: 1,
          staffel: "1 = C = e^(−βd) ±15 % bei 1/2/5/8 km an einem Gerät, Uhr 0,5 · 2 = je Kanal (der Farbton rückt zum Himmel, Δh ≤ 10° bei 8 km), Sonnenseite/Gegenseite ≥ 1,2, bei Sonne 5° fernes Weiß R/B ≥ 1,3, Uhr 0,5 und 0,27, beide Geräte",
          messung: "Spielgang-Station Hügel (Auge 120 m) und Augenhöhe: Grat gegen Himmel bei 1/2/5/8 km im Ausgabe-Bild; β aus einer EXTERNEN Referenz in spec (meteorologische Sichtweite je Wetter, Rayleigh-β je Kanal), nie aus LUFT gelesen.",
          beleg: "GEMESSEN an main d3a626ee (ferne-luft e9f79deb, Radeon 890M --echt, Hügel Genesis +120 m, 4 Azimute, Uhr 0,5 und 0,27, `npm run gate:luft-tiefe:echt`, Referenz Bucholtz in spec/farbe/luft-referenz.json): Koschmieder T/T_soll 0,88–1,07 → Staffel 1; je Kanal Δβ blau−rot 0,83–1,33 × Referenz (grauer β vorher −0,32…0,28); Staffel 2 offen: Farbton bei 8 km 21–29° (Soll ≤ 10°, Karte himmel-ton), Sonnenseite 1,19; GTX: dieselbe Wand im echt-Job an d3a626ee GRÜN (CI 39547307165). Vorher: Das Gesetz steht: geschlossenes Integral des Höhen-Nebels, die In-Streuung ist die Himmels-Sicht der EINEN Atmosphäre (`stamm/bild-himmel.js:2245-2294`). β ist aber EIN grauer Skalar (`_luftBeta` `:2221-2228`), keine Extinktion je Kanal. Im Bild ungemessen.",
          schlupfloch: "Ein Nebel, der die Ferne grau macht, senkt den Kontrast ohne Physik: Farb- und Mie-Bedingung. β aus LUFT prüfte nur, ob der Code sich selbst folgt (B36).",
          aenderung: "Das Soll kommt aus einer externen Referenz (B36)."
        },
        {
          name: "Die Welt hat keine Kante",
          punkte: 1,
          staffel: "1 = Restkontrast am Rand der letzten Fern-Schale ≤ 2 % bei klarem Wetter an einem Gerät, 4 Azimute · 2 = keine waagrechte Kanten-Linie (Struktur-Tensor am Horizont), Hügel und Gipfel, im Boden-Haushalt, beide Geräte",
          messung: "Station Hügel und Gipfel, klar, 4 Azimute: Restkontrast Gelände/Himmel am Rand der letzten Fern-Schale.",
          beleg: "GEMESSEN an main d3a626ee (ferne-luft, Radeon --echt, Hügel +120 m, 4 Azimute, klar): der Feld-Pass schließt die Ferne bis 17,4–21,8 km, Restkontrast am Rand 0,9–1,2 % → Staffel 1 (die Prämisse „Kante bei 8 km“ traf nicht zu: der Feld-Pass ist die letzte Schale); Staffel 2 (Struktur-Tensor, beide Geräte) ungemessen. Vorher: Der Fern-Ring endet bei 8 000 m (`stamm/gelaende-fern.js:1353`), die Luft rechnet bis 20 km (`foundry-core.js:252`, sichtKlarM 20000); am Rand bleiben rechnerisch e^(−3,91·0,4) = 21 % Restkontrast — bei klarem Wetter steht die Welt-Kante als Linie. Im Bild ungemessen.",
          schlupfloch: "Mehr Nebel versteckt die Kante und verliert die Ferne — K1 verbietet das; bei Dunst gemessen wäre die Kante immer unsichtbar: darum klar."
        },
        {
          name: "Bewaldete Grate tragen einen Saum bis 8 km",
          punkte: 0,
          staffel: "1 = am Kamm in 0,4–4 km Kohärenz des Struktur-Tensors < 0,3 gegen REF real-mischwald und Umriss-Schwankung ≥ 3 m bei 2 km, an einem Gerät · 2 = Kronen-Relief ≥ 10 m bis 8 km, Kammlinie ≤ 0,22 wie REF real-felsen, 4 Azimute, 0,5/1/3/8 km, beide Geräte, im Boden-Haushalt",
          messung: "Station Hügel: Grat-Linie im Ausgabe-Bild mit und ohne Wald (Schuss ohne die Kronen-Teile des Fern-Rings); Posen Wiese und Genesis, Mittag und Gegenlicht.",
          beleg: "Die Baum-Karte reicht bis 384 m (FERN_KRONE_NAH, `stamm/gelaende-fern.js:1030`); dahinter ist der Wald nur Farbe (aKrone als Albedo-Attribut, `:238`, `:999-1011`), der Ring trägt kein Relief; das Kronendach-Mesh ist ein Flag-Zwilling mit Default aus (`stamm/bild-himmel.js:417/:544`, `stamm/dirigent-kern.js:338`).",
          schlupfloch: "Ein gemaltes Sägezahn-Band oder ein Kronendach-Mesh nur am Messort: der Schuss mit/ohne Wald an vier Azimuten und drei Distanzen verlangt das Gesetz überall, die Kosten-Grenze verbietet das Mesh-Pflaster; Luft-Nebel glättet den Kamm und ist damit ROT.",
          aenderung: "EIN Heim des Fern-Saums (vorher auch Vegetation K3; B26, V21)."
        },
        {
          name: "Grate werfen Abendschatten in ferne Täler",
          punkte: 0,
          staffel: "1 = bei Sonne 5° Luma Schatten-/Lichthang ≤ 0,4 hinter einem ≥ 2 km fernen Grat an einem Gerät · 2 = die Schattengrenze stimmt mit dem Horizontwinkel des Gelände-Kerns überein (±2 px), Uhr 0,26 und 0,74, ≤ 0,3 ms an der GTX, beide Geräte",
          messung: "Station Hügel bei Sonne 5°: Hang hinter einem fernen Grat.",
          beleg: "Zwei Kaskaden mit maxFar 180–306 m (`stamm/bild-kosten.js:3433-3434`, `stamm/dirigent-ankunft.js:434-448`); jenseits davon nur N·L; Feld- und Panorama-WGSL ohne Schatten-Term (`stamm/bild-sicht.js:1843-1851`). Im Bild ungemessen.",
          schlupfloch: "Eine dunklere Fern-Farbe am Abend imitiert Schatten ohne Lage: der Vergleich der Grenze mit dem Horizontwinkel des Kerns schließt das."
        },
        {
          name: "Die Ferne im Wetter: Sicht, Vorhang, Dunst",
          punkte: 0,
          staffel: "1 = im Sturm Sicht 1,5 km ±15 % im Bild an einem Gerät · 2 = der Regenvorhang einer Front (Wetter K1) ist aus 2 km sichtbar, Nebel im Tal folgt dem Gelände, beide Geräte",
          messung: "Station Hügel mit Wetter als Spieler-Wort (steht seit wetter-saat, 428fb6fe): Kontrast-Abfall gegen Distanz im Sturm; Vorhang als Luma-Kante am Ort der Front.",
          beleg: "Das Gesetz der Luft liest das Wetter (`_luftBeta`, `stamm/bild-himmel.js:2221-2228`, Sichtweiten aus LUFT); kein Bild im Wetter gemessen; einen sichtbaren Vorhang gibt es nicht, weil das Wetter ein globales Wort ist.",
          schlupfloch: "Nur bei klarem Mittag gemessen trägt jede Ferne: der Sturm ist Pflicht; ein Vorhang als Billboard ohne Front wäre Kulisse: er muss am Ort der Front aus Wetter K1 stehen.",
          aenderung: "Die F6-Hälfte (Karte/Gestalt je Uhr) zählte Licht K3 doppelt; hier bleibt das Wetter."
        }
      ],
      hebel: [
        { name: "Die Ferne wird blau: Himmels-Ton am Horizont und Sonnenseite (Karte himmel-ton); die Kante als Struktur an beiden Geräten (Luft je Kanal steht seit d3a626ee, die Fern-Schale ist der Feld-Pass)", k: ["ferne.K1+1"], t: [1, 1.5], wurzel: "`stamm/bild-himmel.js:_luftBeta` (`:2221`) → vec3 aus ATMO_GESETZ betaR, der Luft-Knoten `:2245-2294`; `stamm/gelaende-fern.js:FERN_RING.schalen` (`:1350-1354`) + Schale {aussen 20000, snap 160}, Kosten am Schirm.", pflicht: "A (Ferne); Last: E (Boden-Haushalt 12/120k)", v1: true },
        { name: "Der Fern-Saum aus dem Gesetz (S8)", k: ["ferne.K3+2"], t: [2, 3], wurzel: "`stamm/gelaende-fern.js`: Vertex-Hebung um Kronenhöhe (treeParams) × Deckung aus aKrone (`:238`, `:999-1011`) + Hash je planForestCell (phyto-core) im WGSL; der Flag-Zwilling canopyStreaming fällt (`stamm/bild-himmel.js:416-585`, `stamm/dirigent-kern.js:338`).", pflicht: "A", v1: true },
        { name: "Horizont-Karte aus dem Gelände-Kern", k: ["ferne.K4+2"], t: [2, 2], wurzel: "`gelaende-core.js`: reine Funktion horizontWinkel(x, z, azimut), im Fern-Faden je 0,5° Sonne gebacken; Boden-Stoff (receivedShadowNode, `stamm/stoff-material.js:1263`) und Feld-Pass (`stamm/bild-sicht.js:1843-1851`) lesen sie.", pflicht: "—", v1: false },
        { name: "Die Sicht im Wetter aus EINEM Medium (Wetter K1 steht)", k: ["ferne.K5+1"], t: [1, 1], wurzel: "Luft-Knoten liest das Wetter am Ort statt des globalen Worts; der Vorhang als Dichte-Kante der Front.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "F2b (die Ferne von oben): der Spike ab86edc0/2a005cbc wirkt (Radeon: Deckung C6 0,059 → 0,777, IoU 0,678), steht aber seit 18.10. ungemergt, weil der Atlas von 5,31 auf 15,93 MB wächst — gegen E (VRAM 99,6–111,2 von 118 MB).",
        anders: "Von oben ist eine Krone rund und klein: Hebungs-Ringe mit 40/80° in ¼ der Zellfläche (64×128) kosten ≈ +2,7 MB statt +10,6 (LOD H2). Oder die Hebung kommt aus der Gestalt statt aus der Karte: der Feld-Pass rechnet Kronen schon (`stamm/bild-sicht.js:905-930`, Beer-Lambert laubTiefe)."
      }
    },
    {
      key: "material",
      titel: "Material-Tiefe — PBR aus dem Gesetz, Mikro-Detail, Stufen, Spiegelung",
      dom: "`stamm/stoff-material.js` (Substanz-Kern) · `stamm/stoff-instanz.js` · `spec/farbe/albedo-tafel.json` · `foundry-core.js` FARB-GESETZ",
      v1: "v1 (sehen) · A (haus, boden-nah)",
      aaaa: "Jede Fläche zeigt im Ausgabe-Bild ihre Physik: die Albedo liegt im realen Band (Fels 0,10–0,30, Rinde 0,07–0,12, Laub/Gras 0,15–0,26), Labor = Welt gilt ±5 % in der Albedo, und jede Stufe hat dieselbe Albedo (Stufe/L0 0,95–1,05). Bis zur Armlänge (0,5 m) trägt jeder Stoff Korn, Kavität und Rauheit aus seinen Tags; keine Fläche ist glatt (Nyquist-Anteil ≥ 0,15, glatte 8×8-Blöcke ≤ 10 %, Leistungsspektrum 1/f^β). Glas, Lack, Metall und nasser Stein spiegeln aus EINER Quelle. Rauheit und Glanz sind Daten der Stoff-Zeile, im realen Band gemessen. **Wo wir die Besten schlagen:** Megascans fotografiert jeden Stein, Remember Me malt Pfützen-Masken; wir leiten das Material aus Tags und Stoff-Zeile ab, für jedes Asset, das ein Studio je erzeugt.",
      beste: [
        "**Frostbite** (Lagarde & de Rousiers 2014): Albedo-Band der Dielektrika sRGB 30–240, eine Validierungs-Ansicht der Albedo, Rauheit und Metall als Daten.",
        "**Quixel Megascans in UE5 Valley of the Ancient** (2021): photogrammetrische Albedo, mit Farbkarte kalibriert, Fels 0,1–0,3.",
        "**Far Cry 4** (Ka Chen, GDC 2015): Adaptive Virtual Texture mit 10 Texel/cm am Boden.",
        "**RAGE / GTA** (Vorbild des Schöpfers): Spiegelung per Raytracing in niedriger Auflösung plus Glättung, in Echtzeit."
      ],
      kriterien: [
        {
          name: "Albedo im realen Band, Labor = Welt, echt auf beiden Geräten",
          punkte: 0,
          staffel: "1 = alle Zeilen Welt/Labor 0,9–1,1 und im realen Band, beide Seiten --echt, an einem Gerät · 2 = beide Geräte, Eichung Karte 0,180",
          messung: "werkbank albedo --tafel + diag-albedo-tafel.cjs --labor --echt, beide Seiten auf echter GPU, ≤ 3 min je Gerät.",
          beleg: "`spec/farbe/albedo-tafel.json`: 8 von 10 Zeilen im ±10-%-Band, Haut (0,857) und Lack (1,138) außerhalb; die Labor-Seite nicht echt gemessen (gemessen.labor.echt false, ANGLE D3D11), nur Radeon, am Kopf veraltet (haus/fels-Quellen geändert). Die Welt-Seite am Kopf f2904a72 (21.10., Radeon --echt, `werkbank albedo --tafel`, Messschuld M22, ROT): fels 1,03, haus 0,95, klinge 0,95 im Band; lack 0,04, tor 3,07, haut 0,25, fell 0,67 über der Ratsche; rinde, laub und boden stumm (kein Zug am Exemplar). Roh: koordination `bericht/2110-messschuld-radeon/m22-*`.",
          schlupfloch: "Labor und Welt mit derselben falschen Eichung wären gleich und trotzdem falsch: zusätzlich das reale Band je Klasse; der Ersatz-Renderer verbirgt Präzision und Ton: beide Seiten --echt."
        },
        {
          name: "Mikro-Detail bis Armlänge",
          punkte: 0,
          staffel: "1 = Boden und Fels auf 0,5/1/2 m: nyquist ≥ 0,15 und glatte Blöcke ≤ 10 % an einem Gerät · 2 = Boden, Fels, Rinde, Putz, Holz, Haut, kein Kachel-Muster (1/f^β, β 0–2,4), beide Geräte",
          messung: "werkbank bild mit Armlängen-Schüssen (0,5 / 1 / 2 m), Tafel-Maße detail/nyquist, glatte 8×8-Blöcke (σ Luma < 4), Ego, Kamera des Spiels.",
          beleg: "Der Substanz-Kern trägt Korn, Kavität, Rauheit und Bump aus den Tags (`stamm/stoff-material.js:1130-1170`, `_substanceCharacter` `:1578`, Mikro-Relief `:1206`); gemessen ist nur der Boden-Satz aus 2–14 m: nyquist 0,0495, detail 0,073 (soll-tafel boden-nah, cbc222cc, veraltet).",
          schlupfloch: "Rauschen erfüllt Nyquist ohne Material: das 1/f^β-Band und das Verbot von Kachel-Mustern; ein Schuss nur auf den besten Stoff reicht nicht: je Klasse."
        },
        {
          name: "Dieselbe Albedo in jeder Stufe",
          punkte: 0,
          staffel: "1 = Haus und Fels Stufe/L0 0,95–1,05 bei Uhr 0,5 an einem Gerät · 2 = Haus, Birke, Fichte, Fels, L0/L1/L2/Karte, Uhr 0,5 und 0,27, beide Geräte",
          messung: "werkbank albedo --nah-fern je Stufe (Stoff-Albedo, nicht das belichtete Bild). Der Luma-Sprung im Moment des Wechsels zählt LOD K4, die Byte-Gleichheit der Karte Pipeline K2.",
          beleg: "Am Kopf 3528f2d0 (23.10.) die HAUS-Hälfte der Staffel 1 belegt, der Fels ungemessen → 0 (R10): material-albedo (474d150d/7bc236ed, `fachwerk-core.js` `sichtTon` · `tonUebertrag` · `stufe1Ton`, Vertrags-Akt v6: 65 L2 + 64 L3 neu, L0/L1 byte-gleich; über 6e376d2e auf main). Albedo-Tafel `werkbank albedo --tafel` (Urteil `stufen-ton`, `exemplar.stufe`) Radeon echt an deb906c0/86e5d92a: Haus L0 0,1593 · L1 0,1581 (L1/L0 0,992) · L2 0,1491 → 0,1570 (L2/L0 0,936 → 0,986); offline 64 Häuser L2/L0 im Band 31 → 59; Ausgabe-Bild an derselben Pose (28 m) Luma L2/L1 Mittag 1,039 → 1,060, Uhr 0,27 0,980 → 1,011. fachwerk-core ist am Kopf gleich dem gemessenen Stand (Albedo-Tafel grün in voll 13/18). Fels: die Tafel führt nur Stufe [0] (`kindStages [0]`, Labor/Welt 1,0235), keine Stufen-Zeile — Messschuld M43. Offen für die 2: hochhaus/volle_moderne (L1 ≠ L0), Birke, Fichte, Karte, Uhr 0,27 als Tafel-Zeile, die GTX. Davor: Haus L2/L0 0,788: der Ton der L2 kommt aus der Stufe-1-Fassade (`fachwerk-core.js:1999` wandTonAus, `:2185`); die Birke 16–21 % dunkler als L1, die Karte 7–36 % gegen L1 (SYSTEMKARTE W8, a5669277); `_substanceCharacter` läuft nur am L0-Zweig.",
          schlupfloch: "Ein Hand-Faktor je Stufe gleicht die Zahl an und bricht bei einer anderen Uhr: die zweite Uhr-Spalte; belohnt wird nur EINE Ableitung.",
          aenderung: "EIN Heim des Stufen-Tons (vorher auch Pipeline K2, Siedlung K1; V22).; am Kopf 3528f2d0 die Haus-Hälfte belegt (material-albedo), der Fels ungemessen: bleibt 0."
        },
        {
          name: "Spiegelung aus EINER Quelle: Glas, Lack, Metall, Nässe",
          punkte: 0,
          staffel: "1 = spiegelTreue ≥ 0,5 an Fenster-Glas ODER Lack aus Ego an einem Gerät · 2 = jede glänzende Klasse aus Ego und Third, kein Spiegel-Flimmern unter Bewegung, ≤ 1 ms an der GTX, beide Geräte",
          messung: "werkbank bild an Haus-Fenster, GT-Lack und Klinge; derselbe Baustein, den `_wasserBlick` liest; fehlt die Spur, meldet der Rückfall auf die Himmels-Umgebung laut.",
          beleg: "Spiegelung ist heute Wasser (`_wasserBlick`, `stamm/wasser-hydro.js:1538`); Glas, Lack und Metall reflektieren die Himmels-Umgebung ohne Szene; ungemessen.",
          schlupfloch: "Eine gebackene Umgebung je Ort bestünde ein Standbild: Bewegung und eine zweite Pose verlangen die Spur; ein zweiter Spiegel-Weg neben dem Wasser wäre ein Zwilling.",
          aenderung: "Neu (V08, B73). Das Nässe-Bild der Synthese-K5 zählt Wetter K2 (V23); die Ton-Kette Studio = Welt (Synthese-K2) zählt Studios K4 (B39, V16)."
        },
        {
          name: "Rauheit und Glanz aus der Stoff-Zeile",
          punkte: 0,
          staffel: "1 = Glanz-Breite und -Spitze an der Kugel-Bühne für ≥ 3 Klassen im realen Band einer gemessenen BRDF-Referenz, an einem Gerät · 2 = jede Klasse, beide Geräte, die Rauheit liest die EINE Stoff-Zeile (Mutation)",
          messung: "Prüfbühne mit Kugeln aus den Stoff-Zeilen (wie Licht K2, Welt-Stoff), Highlight-Profil im Ausgabe-Bild gegen eine Referenz-Tafel in spec.",
          beleg: "Rauheit und Metall stehen je Stoff im Substanz-Kern (`stamm/stoff-material.js:1130-1170`), nicht in einer Stoff-Tafel mit Referenz; ungemessen.",
          schlupfloch: "Eine Rauheit von Hand je Asset bestünde ein Band: die Mutation der Stoff-Zeile verlangt die EINE Quelle.",
          aenderung: "Neu."
        }
      ],
      hebel: [
        { name: "Mikro-Detail an den Schirm gebunden", k: ["material.K2+2"], t: [1.5, 1.5], wurzel: "`stamm/stoff-material.js` Mikro-Relief (`:1206`, TERRAIN_BUMP) + Korn des Substanz-Kerns: die Frequenz folgt der Pixelgröße (fwidth), drei Oktaven bis zur Armlänge, im Boden-Satz im Fragment.", pflicht: "A (boden-nah)", v1: true },
        { name: "Stufen-Albedo aus EINER Rechnung (S8): der Rest nach dem Haus-L2", k: ["material.K3+1"], t: [1, 1], wurzel: "Gemergt bis 3528f2d0: der L2/L3-Ton des Hauses aus EINER Rechnung (material-albedo 474d150d/7bc236ed, `fachwerk-core.js` `sichtTon` → `tonUebertrag` → `koerperTeile`, Warm-Pfad `stufe1Ton`; Radeon L2/L0 0,936 → 0,986). Nicht `_substanceCharacter`: der Haus-Stoff ist in jeder Stufe derselbe Satz-Stoff, der Unterschied lag in den Vertex-Farben (befund material-albedo). Der Rest für die 2: hochhaus/volle_moderne (die Turm-L1 ohne Metall-Fassade, 1,5 × im Stoff-Bild), Birke und Fichte gegen ihre Karte (Birke 16–21 % dunkler als L1, Karte 7–36 %), Uhr 0,27 als Tafel-Zeile, die GTX. Die 1 hängt nur am Fels (Messschuld M43).", pflicht: "A (haus)", v1: true },
        { name: "EIN Spiegel-Baustein (¼-Auflösung + TAAU), das Wasser wird sein Leser", k: ["material.K4+1"], t: [3, 3], wurzel: "Spur in ¼-Auflösung über `_zeitAufloesung` (`stamm/bild-kosten.js:1029`); `_wasserBlick` liest denselben Baustein.", pflicht: "— (Last: E ≤ 1 ms GTX)", v1: false },
        { name: "Rauheit und Glanz in die Stoff-Zeile (nach Stoffe H1)", k: ["material.K5+1"], t: [1, 1], wurzel: "Stoff-Tafel im Kern trägt Rauheit/Metall; `_substanceCharacter` liest sie.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Kein Wellen-Feststecken: die Albedo-Tafel ist gebaut, aber die Labor-Seite wurde nie echt gemessen (ANGLE D3D11), und Gleichheit Studio = Welt wurde gemessen statt gebaut (siehe Pipeline).",
        anders: "Gleichheit durch Konstruktion (EINE Bake-Rechnung je Stufe, EINE Stoff-Zeile), dann echt auf beiden Seiten messen."
      }
    },
    {
      key: "schatten",
      titel: "Schatten und indirektes Licht",
      dom: "`stamm/bild-kosten.js` (Kaskaden, Takt) · `stamm/stoff-material.js` (receivedShadowNode, aoNode) · `stamm/bild-himmel.js` (Hemi) · `stamm/dirigent-kern.js` (`_leuchtTakt`)",
      v1: "v1 (sehen) · A · E",
      aaaa: "Schatten sind am Kontakt scharf und werden mit dem Abstand zum Werfer weich wie unter der echten Sonne (Halbschatten ≈ 0,9 cm je Meter bei 0,53°). Die ersten 15 m zeichnen mit Texel ≤ 5 cm (heute 17 cm), ohne Flimmern beim Gehen, Drehen und bei laufender Sonne. Jedes Ding steht: unter Fuß, Sockel, Stamm und Halm sitzt eine Kontakt-Verdeckung (30–60 % des freien Bodens), jede Fläche liest ihre Himmels-Sicht. Licht springt einmal: die sonnige Wiese hellt die Schattenseite der Hauswand um ≥ 10 % auf, durch die Tür ist der Innenraum lesbar, und nachts wirft das nächste Feuer Schatten. Alles ≤ 2,5 ms auf der GTX. **Wo wir die Besten schlagen:** Lumen braucht 4 ms auf der Konsole, Tsushima backt die Himmels-Sicht; wir lesen Himmels-Sicht und Horizont aus dem Gelände-Kern als Funktion, für jeden Ort, ohne Bake.",
      beste: [
        "**UE5 Virtual Shadow Maps** (Epic): je Richtlicht 16k × 16k virtuell in 128²-Seiten; gerendert wird nur, was sich ändert, ≈ 1 Texel je Pixel bis in die Ferne.",
        "**UE5 Lumen**: GI und Reflexion in 4 ms bei 60 fps (Konsole, 1080p intern).",
        "**GTAO** (Jimenez, Wu, Pesce, Jarabo — Activision 2016): Verdeckung über Horizontwinkel mit Mehrfach-Sprung-Näherung, ≈ 0,5 ms auf PS4 in 1080p.",
        "**Ghost of Tsushima** (Patry 2021): Himmels-Sicht und SH-Proben 16×16×3 je 200-m-Kachel, je Frame aus dem Himmel neu belichtet."
      ],
      kriterien: [
        {
          name: "Schatten scharf am Kontakt, weich mit Abstand",
          punkte: 0,
          staffel: "1 = Halbschatten am Fuß ≤ 3 cm an einem Gerät · 2 = Zuwachs ≈ 0,9 cm je m, Uhr 0,5 und 0,3, Kosten ≤ +0,3 ms an der GTX, beide Geräte",
          messung: "Prüfbühne (spec/pruefbuehne): Pfosten 3 m auf ebenem Boden, Ego aus 2 m und Third; Breite des Halbschattens (10–90 % Luma) am Fuß und in 3 m Abstand.",
          beleg: "Kaskaden-Texel 0,17 m nah / 0,47 m fern (SCHATTEN_KASKADE.texelM, `stamm/bild-kosten.js:3457`), Karte ≤ 2048 (`:3459`): jede Kante ≥ 17 cm, ohne Kontakt-Härtung. Im Bild ungemessen.",
          schlupfloch: "Ein Filter, der alle Kanten gleich schärft, flimmert unter Bewegung (K2); am Mittag sind Schatten kurz: Uhr 0,3 verlangt die lange Kante."
        },
        {
          name: "Ruhige Schatten unter Bewegung und laufender Sonne",
          punkte: 0,
          staffel: "1 = ≤ 0,5 % unerklärte Randpixel beim Gehen an einem Gerät · 2 = Gehen 4 m/s, Drehen 1°/Frame, Sonne in der Tageslänge, kein Kaskaden-Sprung im Takt, beide Geräte",
          messung: "werkbank sicht --gehen/--drehen/--sonne plus Bild-Maß: Pixel im Schattenrand mit ΔLuma > 18 je Frame, die weder Kamera noch Sonne erklären; Regler des Spielers (R8).",
          beleg: "Texel-Fang und Bias stehen (`_schattenBias` `stamm/bild-kosten.js:836`, Licht-Stellung `:1787-2068`), die nahe Kaskade rendert spätestens jeden 2. Frame, die ferne im 3-fachen Intervall (SCHATTEN_TAKT `:3440`); unter Bewegung ungemessen (die Linsen prüfen Ruhe und Mittag, SYSTEMKARTE W9).",
          schlupfloch: "Ein Standbild ist immer ruhig, ein weicher Schatten flimmert nie: K1 verlangt die Schärfe gleichzeitig."
        },
        {
          name: "Jedes Ding steht: Kontakt-Verdeckung und Himmels-Sicht",
          punkte: 0,
          staffel: "1 = Kontaktband (0–20 cm) 30–60 % des freien Bodens an Fuß und Sockel an einem Gerät · 2 = auch Stammfuß und Tor-Fuß, klar UND bedeckt, ≤ 0,5 ms an der GTX, beide Geräte",
          messung: "werkbank bild mit Armlängen-Schüssen auf Fuß des Spielers, Haus-Sockel, Stammfuß und Tor-Fuß, Uhr 0,5, klar und bedeckt.",
          beleg: "Die Himmels-Sicht wirkt als aoNode nur am Boden (`opts.himmelsSicht`, `stamm/stoff-material.js:1268-1270`), dazu Kavitäts-AO je Stoff (`stamm/daten.js:613-621`); zwischen den Dingen keine Verdeckung (ssao/gtao 0 Treffer). Im Bild ungemessen.",
          schlupfloch: "Ein in jeden Stoff gemalter dunkler Ring bricht am Hang und am Wasser: vier Familien und bedeckter Himmel, wo nur die Verdeckung trägt."
        },
        {
          name: "Licht springt einmal: Rückstrahlung und Innenraum",
          punkte: 0,
          staffel: "1 = weiße Hauswand im Schatten neben besonnter Wiese: Gewinn ≥ 10 % gegen den Gegenschuss mit Boden-Albedo 0, an einem Gerät · 2 = getönt zur Boden-Farbe, Innenraum durch die offene Tür ≥ 15 % des Außen-Schattens, beide Geräte",
          messung: "Prüfbühne, Uhr 0,5, Luma mit und ohne Rückstrahlung.",
          beleg: "Am Tag trägt nur die Himmels-Umgebung: das Hemi-Licht ist NUR der Nacht-Boden (`hl.intensity = 0.1 · _nachtAnteil`, `stamm/bild-himmel.js:2325`), das Ambient ebenso (`:2202`); die sonnige Wiese strahlt nichts zurück.",
          schlupfloch: "Ein heller Ambient hebt die Wand ohne Physik: Tönung zur Boden-Farbe und der Gegenschuss mit Boden-Albedo 0."
        },
        {
          name: "Nachts wirft das Feuer",
          punkte: 0,
          staffel: "1 = Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer an einem Gerät · 2 = die Gasse in der kelvin-Farbe des Gesetzes (±200 K) lesbar, der gehende Spieler wirft, ≤ 0,4 ms an der GTX, beide Geräte",
          messung: "Station Dorfgasse um Mitternacht mit Feuerstelle oder Laterne (LICHT_GESETZ).",
          beleg: "EIN Leuchtquellen-Gesetz (fachwerk-core LICHT_GESETZ → `_leuchtTakt`, `stamm/dirigent-kern.js:1535`) wirkt als Uniform-Pool im Stoff; kein Licht-Objekt, kein Schatten.",
          schlupfloch: "Eine gemalte Schatten-Textur unter Laternen trägt nicht für bewegte Körper: Pfosten und gehender Spieler."
        }
      ],
      hebel: [
        { name: "Kontakt-Härtung der nahen Kaskade", k: ["schatten.K1+1"], t: [1.5, 1.5], wurzel: "`stamm/bild-kosten.js:SCHATTEN_KASKADE` (`:3456-3466`) + Kaskaden-Geburt (`:2179-2215`): eine Spieler-Kaskade über 15 m mit Texel ≤ 5 cm oder eine PCSS-Blocker-Suche im receivedShadowNode (`stamm/stoff-material.js:1263`).", pflicht: "— (Last: E ≤ 0,3 ms GTX)", v1: true },
        { name: "Himmels-Sicht für jeden Stoff + Bildraum-Verdeckung über TAAU", k: ["schatten.K3+2"], t: [2, 2], wurzel: "`stamm/stoff-material.js:1268-1270`: aoNode für jeden Stoff aus Kavität × Himmels-Sicht des Kerns; GTAO in halber Auflösung in der Post-Kette (`stamm/bild-kosten.js:_zeitAufloesung` `:1029`).", pflicht: "— (Last: E ≤ 0,5 ms GTX)", v1: true },
        { name: "Boden-Rückstrahlung aus dem Ort", k: ["schatten.K4+1"], t: [1, 1], wurzel: "`stamm/bild-himmel.js` Hemi-Schreiber (`:2316-2325`): groundColor = Boden-Albedo am Ort × E_Sonne der Bestrahlungs-Tafel, auch am Tag.", pflicht: "A", v1: true },
        { name: "Schatten-Takt an die Sonnen-Winkelgeschwindigkeit (nur wenn K2 vorher ROT am Täter steht)", k: ["schatten.K2+2"], t: [1, 1], wurzel: "`stamm/bild-kosten.js:_loopShadowUpdate` (`:3184`) + SCHATTEN_TAKT (`:3440`); ohne ROT-Vorher fällt der Hebel offen ohne Punkt.", pflicht: "E", v1: true, bedingt: true },
        { name: "EIN Schatten-Licht für das nächste Feuer", k: ["schatten.K5+2"], t: [1.5, 1.5], wurzel: "`stamm/dirigent-kern.js:_leuchtTakt` (`:1535`): das nächste Licht des Pools wird EIN Punkt-Schatten (Würfel 512², nur Werfer < 15 m), die Kosten hängen am Schirm.", pflicht: "— (Last: E)", v1: false }
      ],
      feststeck: {
        versucht: "Kein Wellen-Feststecken — der Bereich wurde nie gerichtet: Schatten wurden nur in Ruhe und zu Mittag angesehen.",
        anders: "Das Bild-Maß unter Bewegung zuerst (K2 vorher ROT oder grün), dann Kontakt und Sprung; jeder Schnitt am Schirm gebunden."
      }
    },
    {
      key: "lod",
      titel: "Die LOD-Kette ohne Pop — Studio-Mesh → Karte → Impostor",
      dom: "`stamm/stoff-material.js` (`_lodAuge`, Crossfade) · `stamm/stoff-instanz.js` (Karten-Bake) · `foundry-core.js` (impostor) · `stamm/dirigent-regler.js` (foliageRadius)",
      v1: "v1 (sehen, in Bewegung) · A (laub-kante) · E",
      aaaa: "Vom Studio-Mesh (L0) über L1 und Karte (L2) bis zur NUR-WURF-Stufe ist jede Stufe dieselbe Gestalt: der Umriss hält (laub-kante ≤ 0,22 je Stufe, aus jeder Blick-Hebung von −20 bis 80°), die Lichtantwort springt beim Wechsel um < 2 % Luma, der Bild-Fehler am Wechsel ist ≤ 1 Pixel. Beim Gehen (4 m/s), Reiten, Fahren (vmax des Spiels) und beim Wechsel Ego↔Third zählt die Pfad-Linse ≤ 0,05 % Pop-Pixel je Sekunde und 0 Geister — unter dem Regler, mit dem der Spieler spielt. Die Wechsel-Abstände folgen der Pixelgröße am Schirm, nicht der Bildrate. **Wo wir die Besten schlagen:** Nanite und SpeedTree verlangen offline gebaute Assets mit Cluster- oder Hand-LOD; bei uns ist jede Stufe EINE Ableitung aus `treeParams` bzw. dem Gesetzbuch, und die Karte backt im Welt-Renderer aus derselben Gestalt — kein Asset, kein Pop.",
      beste: [
        "**UE5 Nanite** (Karis, SIGGRAPH 2021): Cluster-LOD mit Fehler < 1 Pixel, ≈ 1 Dreieck je Pixel, kein Pop ohne Hand-LOD.",
        "**Fortnite, oktaedrische Impostoren** (Brucks 2018, UE ImpostorBaker): Hemi-Oktaeder-Atlas mit Blend der drei nächsten Ansichten, Wald aus jeder Hebung.",
        "**CDLOD** (Strugar, JGT 2010): Vertex-Morph im Übergangsband, keine Risse und Sprünge beim Stufenwechsel.",
        "**Ghost of Tsushima** Gras (Wohllaib, GDC 2021): vor dem Wechsel morpht die Halm-Form (15 → 7 Vertices), ferne Kacheln blenden 3 von 4 Halmen aus."
      ],
      kriterien: [
        {
          name: "Der Umriss hält in jeder Stufe",
          punkte: 0,
          staffel: "1 = kante ≤ 0,22 je Teil-Klasse (die schlechteste urteilt) an der Tafel-Pose UND einem Spielgang-Bild an einem Gerät, frisch am Kopf · 2 = Ego mit Blick 15° hoch, Third und Hügel, Haus- und Tor-Stufen L1–L3 halten milchweiss und zielTreue, beide Geräte",
          messung: "werkbank bild --klasse 'Laub L0/L1/L2' --ist laub-kante an der Tafel-Pose und an Spielgang-Bildern; Kamera des Spiels.",
          beleg: "fimp:atlas:L2 hat kante 0,2635 > 0,22, die Gestalten 0,16–0,18 (Radeon, 9c8cfab8); am Kopf veraltet (phyto-core geändert); GTX ungemessen. Am Kopf f2904a72 an der Tafel-Pose gemessen (21.10., Radeon --echt, Messschuld M6, ROT): fimp:atlas:L2 0,2604 > 0,22, f:fichte:L1 0,180, f:tanne:L0 0,167, f:tanne:L1 0,172 — das Vorher von LOD H1; ein Spielgang-Bild ungemessen. Roh: koordination `bericht/2110-messschuld-radeon/m6-*`.",
          schlupfloch: "Das Mittel über alle Stufen (0,1862) versteckt den Täter: die schlechteste Teil-Klasse urteilt; eine Pose ohne sichtbare Karte umgeht die Stufe: der Spielgang wählt die Bilder. Alpha-Dither senkt die Kohärenz ohne Gestalt: zweiton muss zugleich 0 sein.",
          aenderung: "EIN Heim von laub-kante (vorher auch Vegetation K3, Pipeline K2, Klassen K1; B26, V21)."
        },
        {
          name: "Kein Pop unter Bewegung und Sicht-Wechsel",
          punkte: 0,
          staffel: "1 = eine Bewegungsart an einem Gerät ≤ 0,05 % Pop-Pixel je Sekunde · 2 = Gehen, Ritt, Fahrt (vmax des Spiels), Ego↔Third alle 5 s, Wiese → Genesis und durch das Start-Dorf, 0 Geister, beide Geräte",
          messung: "Pfad-Linse: Pixel mit ΔLuma > 18, die der reprojizierte Kamera-Fluss (TAAU-Bewegungs-Puffer) nicht erklärt, summiert über 1 s, an jeder Stufen-Grenze von Boden, Baum, Bau und Karte und am Rand des foliageRadius; der Regler des Spielers (Standard-perfTarget) auf dem Gerät, wo er atmet (GTX in Fahrt) — `regler voll` nur für E (R8).",
          beleg: "Unter Bewegung ungemessen. Der Regler lässt den Wald-Rand zwischen 70 und 240 m wandern (`stamm/dirigent-regler.js:1965-1973`); unter `regler voll` setzt die werkbank perfTargetMs = 1000 (`scripts/werkbank.cjs:379`) — der Täter erscheint unter der Pflicht-Pose nie. f1-rest (der Wagen beim Sicht-Wechsel) zählt Fahrzeug K4.",
          schlupfloch: "Ein Dither über viele Frames besteht ΔLuma je Frame: die Summe über 1 s gegen die Erklärung durch die Bewegung; Regler voll nagelt den Rand fest und versteckt den Täter (B05).",
          aenderung: "Pop zählte dreifach mit drei Schwellen (Vegetation K4, LOD K2, Streaming K2) → EINE Linse, EIN Heim (V20); die 1 der Synthese stand auf f1-rest (B37) → 0."
        },
        {
          name: "Aus jeder Blick-Hebung",
          punkte: 0,
          staffel: "1 = Karten-Deckung ≥ 0,75 und IoU ≥ 0,65 bei −20/0/40/80° für Bäume an einem Gerät · 2 = je Familie (Baum, Haus, Tor, Wagen), Atlas im VRAM-Band (≤ 118 MB gesamt), beide Geräte",
          messung: "Tor C6 (diag-foundry-impostor) und werkbank bild an Hügel und hohem Third.",
          beleg: "impostor {views: 8, cellW 128, cellH 256} nur im Azimut (`foundry-core.js:719`), der Bake ist waagrecht (`stamm/stoff-instanz.js:627-640`); C6 Basis-Deckung 0,059; der Spike fern-von-oben erreicht 0,777 / IoU 0,678, ungemergt (Atlas 5,31 → 15,93 MB).",
          schlupfloch: "Mehr Ansichten ohne VRAM-Grenze erfüllen C6 und brechen E: das Band ist Teil des Solls; nur Bäume zu messen ließe Häuser und Wagen aus."
        },
        {
          name: "Der Stufenwechsel in Ruhe ist unsichtbar",
          punkte: 0,
          staffel: "1 = Luma-Sprung je Klasse < 2 % und zweiton 0 bei Uhr 0,5 an einem Gerät · 2 = Uhr 0,5 und 0,27, Boden-Morph p90 ≤ 0,1 m im Bild, beide Geräte",
          messung: "werkbank bild vor und nach einem erzwungenen Wechsel an der Stufen-Grenze (d0/d1 aus PORTAL_RENDER_CONFIG.lod). Die Stoff-Albedo je Stufe zählt Material K3.",
          beleg: "Die Mechanik steht: die Dither-Blende `_lodCrossfadeMaskNode` (`stamm/stoff-material.js:2168-2175`), der Boden morpht nach CDLOD (K51); zweiton 0 an f:fichte:L1, f:tanne:L0/L1, fimp:atlas:L2 (Radeon, 9c8cfab8), am Kopf veraltet; der Luma-Sprung ist im Bild ungemessen; Haus L2/L0 0,788 lässt ROT erwarten.",
          schlupfloch: "Ein Gate auf die Geometrie (p90) prüft Mechanik, nicht Bild; ein langer Dither versteckt den Sprung im Rauschen: Bild-Paar vorher/nachher und zweite Uhr."
        },
        {
          name: "Fehler ≤ 1 Pixel am Wechsel — die Stufe folgt dem Schirm, nicht dem Regler",
          punkte: 0,
          staffel: "1 = je Familie (Baum, Haus, Tor, Wagen) ist am Wechsel-Abstand der Kanten-Versatz L0 ↔ Stufe ≤ 1 px bei 1920×1080, an einem Gerät · 2 = die Wechsel-Abstände bleiben bei 30/60/144 fps und Regler des Spielers ±10 % gleich (Pixelgröße statt Bildrate), beide Geräte",
          messung: "werkbank bild: Klassen-Maske der Gestalt in L0 (erzwungen) gegen die gewählte Stufe am Wechsel-Abstand (Chamfer-Distanz); Wechsel-Abstände je Bildrate. Die Reduktion je Stufe zählt Pipeline K3, die Kosten Profiband K3 — in derselben Sitzung.",
          beleg: "Die Stufe wählt `_lodAuge` aus Abstand und Budget (`stamm/stoff-material.js:2031`), der Wald-Rand folgt der Bildrate (`stamm/dirigent-regler.js:1965-1973`); kein Pixel-Fehler-Maß. Das Nanite-Maß ist Fehler < 1 Pixel.",
          schlupfloch: "Ein Wechsel weit draußen besteht ≤ 1 px und kostet E: die Kosten zählen in derselben Sitzung.",
          aenderung: "Neu: die Synthese-K5 wiederholte das Profi-Band (B38, V26); die Reduktion je Stufe wohnt in Pipeline K3."
        }
      ],
      hebel: [
        { name: "Der Saum aus dem Gesetz: Karten-Umriss mit Nadel-/Blatt-Saum und Alpha-Mips, die die Deckung erhalten", k: ["lod.K1+2"], t: [1.5, 1.5], wurzel: "Karten-Zweig in `stamm/stoff-material.js` (`_lodCrossfadeMaskNode` `:2168ff`, colorNode.a) + das impostor-Rezept in `foundry-core.js` (`:715-719`): Alpha-Mips mit erhaltener Deckung (Castaño 2010), die Saum-Frequenz aus der Blattgröße der Art (treeParams), dazu ein Hebungs-Ring unter 0°. Vorher Messschuld M6 (laub-kante am Kopf).", pflicht: "A (laub-kante)", v1: true },
        { name: "F2b mit Atlas-Diät mergen: Hebungs-Ringe −20/40/80° in ¼ der Zellfläche", k: ["lod.K3+1"], t: [1.5, 1.5], wurzel: "`foundry-core.js` impostor {views, hoehen} (`:719`), der Bake je Ring in `stamm/stoff-instanz.js:627-700` (Zweig fern-von-oben), die Wahl nach der Hebung aus `_lodAuge` (`stamm/stoff-material.js:2031`).", pflicht: "A; Last: E (VRAM)", v1: true },
        { name: "Pop-Linse unter dem Regler des Spielers ROT, dann der Wald-Rand an den Schirm", k: ["lod.K2+1", "lod.K5+1"], t: [1.5, 2], wurzel: "`stamm/dirigent-regler.js:1965-1973` (foliageRadius wandert unter Last 70–240 m): der Rand folgt Pixelgröße × Haushalt statt der Bildrate; Hysterese in `_chooseLODForDistance` (`stamm/vegetation-streu.js:1790`).", pflicht: "— (Last: E)", v1: true },
        { name: "Der Stufenwechsel unsichtbar: Dither und Morph je Klasse", k: ["lod.K4+1"], t: [1, 1], wurzel: "`_lodCrossfadeMaskNode` je Klasse mit Stufen-Morph wie CDLOD; Bild-Paar an der Stufen-Grenze.", pflicht: "A", v1: true }
      ],
      feststeck: {
        versucht: "Seit S2b (die Karte backt im Welt-Renderer, 9c8cfab8) reißt fimp:atlas:L2 von unten (0,2635 > 0,22); danach folgten S2b-n1/n2 und F2b (von oben) — keine Welle zielte auf den Umriss von unten, der Punkt blieb aus. kante ist die Kohärenz des Struktur-Tensors: der Umriss der Karte ist zu gerade, eine Hülle statt eines Nadel-Saums.",
        anders: "Nicht mehr Peilungen, sondern der Saum aus dem Gesetz: Alpha-Mips, die die Deckung erhalten, und ein Saum aus der Blattgröße der Art (treeParams), den TAAU auflöst; dazu EIN Hebungs-Ring unter 0° für den Blick nach oben."
      }
    }
  ]
};
