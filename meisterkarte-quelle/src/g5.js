// Gruppe V — Welten und Wege (Meisterkarte 2.0, Stand main dc6702ab)
module.exports = {
  gruppe: {
    key: "wege",
    titel: "V · WELTEN UND WEGE — Tore, Fahrt, Siedlung, Leib, Halten, der gespielte Pfad, das Ultiversum",
    intro: "Der Spieler erlebt die Welt mit seinem Leib, auf seinen Wegen und durch seine Tore. AAAA heißt hier: jeder Weg — gehen, fahren, halten, durchs Tor, zum Mitspieler — fühlt sich an, als wäre die Welt nur für diesen Schritt gebaut, und hinter jedem Tor wartet eine Welt aus Gesetz."
  },
  bereiche: [
    {
      key: "tore",
      titel: "Tore zu anderen Welten — Durchgang, Membran, Mitnahme, Mitspieler, Teilen",
      dom: "`stamm/netz-portal.js` (enterPortal, Übergabe) · `stamm/siedlung-ort.js` (Tor-Takt) · `stamm/speicher-laden.js` (Welt-Wechsel) · `stamm/netz-p2p.js` · `worlds/tor-ziele.json`",
      v1: "v1 (teilen) · A (tor-ziel)",
      aaaa: "Der Spieler geht am Genesis-Ring auf ein Tor zu. Ab 30 m atmet die Membran: bunt, höchstens 5 % milchweiß, und sie zeigt genau die Ansicht, in der er gleich stehen wird (Spearman r ≥ 0,5 gegen das erste Ziel-Bild, mittags wie nachts). Er geht hindurch und hat warm nach ≤ 1 s (kalt ≤ 2 s) die Kontrolle in der Ziel-Welt — ohne Schwarz- oder Weißbild, mit seinem Leib und dem, was er trägt; Esc bringt ihn in ≤ 1 s an dieselbe Schwelle zurück. Ein Mitspieler auf einem zweiten Gerät sieht ihn mit Pose-Latenz p95 ≤ 150 ms und baut mit; ein Bauplan reist per Code und steht beim Empfänger nach ≤ 10 s byte-gleich. **Wo wir die Besten schlagen:** Portal und Rift Apart verbinden kuratierte Level, Roblox verbindet Welten über Ladeschirme; bei uns ist jede Welt hinter dem Tor ein Gesetzbuch, ihr Ziel-Bild folgt aus Seed und Quell-SHA, und durchs Tor reist ein Plan aus Kilobytes, im Browser und P2P ohne Server-Farm.",
      beste: [
        "**Portal** (Valve 2007, Technik nach Lengyel 2005): die Öffnung zeigt die Zielwelt live aus einer zweiten Kamera mit der Portal-Transformation, schräger Nah-Clip-Ebene und Stencil — 0 Ladebilder beim Durchgang.",
        "**Ratchet & Clank: Rift Apart** (Insomniac 2021) und Spider-Man 2: der Riss-Sprung dauert Bruchteile einer Sekunde, Schnellreise 1,33 s (IGN); die Übergangs-Animation trägt das Laden, die Zielwelt wärmt vor.",
        "**Valve Source Multiplayer Networking**: 20 Snapshots/s, 100 ms Interpolations-Puffer, Lag-Kompensation am Server — der Maßstab für die Pose eines Mitspielers.",
        "**Roblox**: ≈ 80–90 Mio. täglich aktive Spieler (2024), Millionen Spieler-Welten über TeleportService verbunden, Teilen per Link; der Sprung ist ein Ladeschirm, jede Welt ein Asset-Paket."
      ],
      kriterien: [
        {
          name: "Der Durchgang: Studio-Tor und Welt-Tor — Schwelle → Kontrolle und zurück",
          punkte: 0,
          staffel: "1 = eine Zeile (Studio-Tor oder Welt-Tor) ≤ 2 s an einem Gerät · 2 = beide Zeilen im Soll (warm ≤ 1 s, kalt ≤ 2 s, Heimkehr ≤ 1 s) an beiden Geräten",
          messung: "Spielgang-Station tor: der Spieler geht mit W in Ego und Third durch jedes Studio-Tor des Genesis-Rings und durch ein Welt-Tor in eine schon besuchte Welt (andere worldId). t beginnt am Kreuzen der Apertur (`stamm/siedlung-ort.js:757` → enterPortal) und endet bei der ersten angenommenen Eingabe, deren Wirkung im Ausgabe-Bild der Ziel-Welt sichtbar ist; kein Zwischenbild ganz schwarz oder weiß (Luma 0,05–0,95), kein Frame > 100 ms; dann Esc. Gemessen in derselben Sitzung wie E (VRAM, CPU-Takt); vorgewärmt wird nur das nächste Tor im Blick. ≥ 4 Läufe je Gerät.",
          beleg: "Ungemessen. enterPortal (`stamm/netz-portal.js:491`) baut ein Vollbild-iframe (`_buildPortalOverlay` `:133`), das die Studio-Seite kalt mit eigenem Renderer bootet; der Welt-Wechsel lädt die Seite neu (`_weltWechselNeuLaden` → `window.location.reload()`, `stamm/speicher-laden.js:907-915`) — der Spieler zahlt den Warm-Boot, an der GTX ≈ 12 s. diag-portal-konformanz zeichnet `ersteReady` nur auf dem Null-Renderer, ohne Soll.",
          schlupfloch: "Die `ready`-Nachricht zählen (sie kommt vor dem Bild), auf dem Null-Renderer messen, einen Ladeschirm zeigen, der die Kontrolle meldet; oder alle acht Studio-iframes verdeckt ab der Ankunft vorbooten und die Kosten unsichtbar in B und E schieben (B55): t endet erst an einer Eingabe mit Wirkung im Bild, die Luma-Wand prüft jedes Zwischenbild, E gilt in derselben Sitzung.",
          aenderung: "Der Durchgang zählte dreimal (Studios K5, Tore K1, Ankunft K4) mit drei Soll → EIN Heim, zwei Zeilen (V15)."
        },
        {
          name: "Die Membran zeigt, wohin du gehst — Kontinuität statt Postkarte",
          punkte: 0,
          staffel: "1 = an einer Pose und einem Gerät: Spearman r ≥ 0,5 zwischen Membran und Ankunfts-Bild, milchweiss ≤ 0,05, oeffnungBunt ≥ 20, Stempel frisch · 2 = Ego und Third, mittags und nachts, beide Geräte, jedes Tor",
          messung: "Station tor, zwei Bilder aus dem Ausgabe-Pfad: die Membran mit dem Spieler 3 m vor der Apertur und das Ausgabe-Bild der Welt-Engine nach der ersten angenommenen Eingabe, die die Kamera ≥ 1° gedreht hat (ein Overlay-Bild ist im Selbsttest ROT); ein Panorama mit veraltetem Stempel ist ROT (H5 sperrt).",
          beleg: "Die Klassen tor-fern, tor-bunt und tor-ziel tragen am Kopf f2904a72 kein Ist („ungemessen“, sollTafelUrteil); zuletzt grün an je einer Mittag-Pose (Radeon, zielTreue 0,685 gegen die gebackene Postkarte `worlds/tor-ziele.json`, gebacken auf ANGLE D3D11). Am main-Abzug gemessen (diag-studio-huelle): 6 von 10 Panoramen an den Quellen, garage, schmiede, koerperstudio und tetrapoda veraltet — „benannt, sperrt nicht“ (`scripts/diag-studio-huelle.cjs:159`), ein fail-softes Tor.",
          schlupfloch: "zielTreue gegen die Postkarte belohnte die Postkarte — veraltet und aus fremder Engine, grün, während der Spieler woanders ankommt; ist das erste Bild nach dem Durchgang das Panorama selbst (Lade-Hintergrund), wäre r = 1 ohne Kontinuität (B56): Referenz ist das Welt-Bild nach gedrehter Kamera.",
          aenderung: "Die 1 der Synthese stand auf Tafel-Zeilen ohne Ist (B03, B45) → 0; das Panorama-Bild zählt nur hier."
        },
        {
          name: "Was der Spieler trägt, reist mit",
          punkte: 0,
          staffel: "1 = Leib, Inventar und Gehaltenes stehen nach Tor hin und zurück byte-gleich, an einem Gerät · 2 = auch Reittier/Fahrzeug und die Rundreise eines Werks Studio → Welt → Studio mit gleichem Bau-Hash, für jede Ziel-Seite",
          messung: "Station tor mit Zustands-Abdruck (Leib-Genom, Inventar, wield, Bau-Hash des getragenen Werks) vor und nach dem Durchgang und nach der Heimkehr.",
          beleg: "Das Adress-Portal lädt die Seite neu (joinWorldFromCode → `_weltBetreten`); das Studio-Tor ist ein iframe mit eigener Sitzung; die Übergabe nimmt nur koerper und kreatur an (`stamm/netz-portal.js:1276`). Ungemessen.",
          schlupfloch: "Ein ok-Flag der Übergabe statt des Zustands: der Abdruck vergleicht Bytes.",
          aenderung: "Die Engine-Ladung (H6) und Studio = Welt im Bild zählen Studios K4 (B39, V16); der Synthese-Beleg „byte-gleich übergeben 4 von 12“ war falsch — am Code 2 (B46). Neu ist der Leib am Tor (aus dem 10/10: „mit seinem Leib und dem, was er trägt“)."
        },
        {
          name: "Mitspieler: man sieht sich, man baut zusammen — zwei echte Geräte",
          punkte: 0,
          staffel: "1 = zwei physische Geräte im LAN, der Peer im Bild von B (Klassen-Teilung > 0, nie im Ursprung) · 2 = Pose-Latenz p95 ≤ 150 ms (Tastendruck an A → Leib im Ausgabe-Bild von B), ein Bau von A steht bei B ≤ 1 s mit gleichem Bau-Hash, Rejoin ≤ 31 s nach 3 s Ausfall",
          messung: "Neuer Teil echt in der gate:mp-sync-Familie: Radeon-Maschine und OMEN (GTX) über signaling-server, 10 min, Ego und Third.",
          beleg: "gate:mp-sync in der CI (`.github/workflows/check.yml:1299`): zwei Seiten in EINEM Browser auf einer Maschine (`scripts/diag-mp-sync.cjs:303`), Ursprung 0, Rejoin ≤ 31 s, Graben reist; smoke-copresence zeigt zwei Browser in worlds/begegnung; diag-p2p-gestalt: die Studio-Gestalt reist mit. Pose-Latenz, Peer im Bild und echtes Netz ungemessen.",
          schlupfloch: "Zwei Tabs auf einer Maschine mit localhost-Signal haben Latenz ≈ 0, und gezählt würden Nachrichten statt Pixel — genau die 1 der Synthese (B54): zwei physische Geräte, die Messung im Ausgabe-Bild von B, der Bau-Hash statt eines ok-Flags.",
          aenderung: "Die 1 der Synthese stand auf zwei Seiten einer Maschine (B54) → 0; die Gleichheit der Welt-Funktion zählt Feld K2."
        },
        {
          name: "Teilen in EINER Geste: Bauplan oder Welt reist per Code",
          punkte: 0,
          staffel: "1 = ein Fluss (Bauplan oder Welt) an einem Gerät: A teilt, B (anderes Gerät, frisches Profil, IDB leer) öffnet; das Werk steht an B's Pose mit gleichem Bau-Hash und studioOv, Signatur gültig, ≤ 10 s · 2 = beide Flüsse (Welt per Einladungs-Code, Kontrolle ≤ 5 s) an beiden Geräten, Bauplan ≤ 4 KB",
          messung: "Spielgang-Station teilen.",
          beleg: "Ungemessen; die Probe (T) von gate:praegung-welt zählt nicht (24.10.: die Buchung 61 → 80 zählte sie als 1, sie fällt auf 0): B ist ein zweiter BrowserContext im selben Chrome (`scripts/diag-praegung-welt.cjs:297`), „an B's Pose“ eine NDC-Projektion am Null-Renderer (`:421`, `:505`), kein anderes Gerät und kein Bild. Die Mechanik steht: signBlueprint (`stamm/netz-identitaet.js:546`, gerufen `werkstatt-bauen.js:1799`), makeInvitationCode (`netz-p2p.js:60`, gerufen `werkstatt-sozial.js:238`), world-bundle-Pull (`netz-p2p.js:911`); v1-Schritt 5 „als Bauplan teilen“ hat im Drehbuch (`docs/abnahme-drehbuch.md`, 18 Schritte) keinen Schritt.",
          schlupfloch: "JSON exportieren und im selben Profil wieder importieren, oder ok zählen: frisches Profil auf dem anderen Gerät, Bau-Hash und Bild an B's Pose.",
          aenderung: "EIN Heim des Bauplans zwischen Geräten (vorher auch Bauen K5, Speicher K5; V17)."
        }
      ],
      hebel: [
        { name: "Die Tor-Station ROT, dann der Durchgang als Lade-Hülle: das nächste Tor im Blick wärmt vor (Rift-Apart-Prinzip)", k: ["tore.K1+1"], t: [1.5, 2], wurzel: "`stamm/siedlung-ort.js` Tor-Takt (`:725-757`, rec._act und Apertur-Kreuzung → enterPortal) + `stamm/netz-portal.js:_buildPortalOverlay` (`:133`): die Ziel-Seite bootet verdeckt ab Wachheit; die Linse in `scripts/diag-v1-pfad.cjs` STATIONEN zuerst.", pflicht: "— (E liest den zweiten Kontext im selben ABAB)", v1: true },
        { name: "Ziel = Ankunft: das Panorama an der Ankunfts-Pose auf der Welt-Engine gebacken, mit SHA-Stempel, H5 sperrt", k: ["tore.K2+1"], t: [1, 1], wurzel: "`worlds/huelle/huelle.js:panorama()` + `worlds/tor-ziele.json` (Stempel; `scripts/diag-studio-huelle.cjs:159` von Warnung auf ROT) + der Membran-Graph `stamm/siedlung-ort.js` (Membran ×2 mit `worlds/portale/porta.js`, SYSTEMKARTE W3).", pflicht: "A (tor-ziel)", v1: true },
        { name: "Das Welt-Tor ohne Neuladen", k: ["tore.K1+1", "tore.K3+1"], t: [4, 6], wurzel: "`stamm/speicher-laden.js:_weltWechselNeuLaden` (`:907`): die Welt wird in der lebenden Seite getauscht; Renderer, Programme, Buch und Worker bleiben, der Welt-Zustand fällt über `_instanzAbschied`/`_gpuKehraus`, die Ziel-Welt kommt über `_weltbildSteht` an.", pflicht: "—", v1: false },
        { name: "Mitspieler echt: zwei Geräte, Pose-Latenz und Peer im Bild als Linse ROT, dann der Täter", k: ["tore.K4+1"], t: [1, 1.5], wurzel: "`scripts/diag-mp-sync.cjs` (neuer Teil echt) + `stamm/netz-portal.js:_portalPoseDeliver` (`:932`) / Snapshot-Interpolation in `stamm/netz-p2p.js`.", pflicht: "—", v1: true },
        { name: "Teilen in EINER Geste: Signatur → Code → spawn_blueprint mit studioOv beim Empfänger", k: ["tore.K5+2"], t: [1.5, 1.5], wurzel: "`stamm/werkstatt-bauen.js:1799` (signBlueprint → Code) + `stamm/feld-dsl.js:spawn_blueprint` (`:1196`) + `stamm/netz-p2p.js:joinWorldFromCode` (`:102`); dazu der Teilen-Schritt im Drehbuch.", pflicht: "— (v1-Schritt 5)", v1: true }
      ],
      feststeck: {
        versucht: "Am BILD der Membran liefen mindestens fünf Wellen (tor-stufen 14.10., tor-membran und tore-fern 15.10., welle-m-e-torwurf, K11 Glut, K43 Flügel, D8 Tor als Fenster), die drei Tor-Klassen standen mittags grün — durch ein Tor ist nie ein Spieler gemessen gegangen, und die Ziel-Referenz ist eine Postkarte aus fremder Engine. Wir haben das Tor als Objekt gerichtet, nicht als Weg.",
        anders: "Das Tor vom Reisenden aus richten: die Station tor geht hindurch und misst Zeit, Kontinuität (Membran ↔ erstes Ziel-Bild) und Heimkehr; erst danach ist die Schönheit der Membran ein Kriterium, und ihre Referenz ist die Ankunft."
      }
    },
    {
      key: "fahrzeug",
      titel: "Fahrzeuge und Fahrgefühl — Reifen, Weg, Kamera, Übergänge, Rückmeldung",
      dom: "`vehicle-core.js` (fahrSchritt, chaseKamera, LACK_GESETZ) · `stamm/koerper-fahrt.js` · `stamm/koerper-bewegung.js` (FIXED_DT, `_loopCamera`) · `worlds/garage` · `scripts/diag-fahr-leben.cjs`",
      v1: "v1 (benutzen: fahren)",
      aaaa: "Ein Wagen aus dem Gesetz (vehicle-core) fährt auf dem Wegenetz durch Wiese, Wald und Dorf, ohne steckenzubleiben. Die Reifen haben eine Kurve mit Spitze bei 6–10° und ≥ 15 % Abfall und greifen auf Weg, Gras, Schotter, Nässe und Schnee anders (Bremsweg Gras/Weg ≥ 1,5×, nass ≥ 1,3×), aus derselben Stoff-Zeile, die den Boden malt; der Kern rechnet mit ≥ 240 Hz. Die Rig-Kamera aus dem Kern atmet das Tempo (FOV +≥ 8°, Arm +≥ 15 %, Azimut auf dem Fahrtvektor), jeder Übergang — Ego↔Third, Auf- und Absteigen in Fahrt, Hang — bleibt ohne Sprung. Klang, Federung, Spur, Staub, Spritzwasser und Rumble lesen denselben Fahr-Zustand. Lücken und Tempo-Decke richtet Streaming, das Band Profiband. **Wo wir die Besten schlagen:** Forza und BeamNG tunen jeden Wagen und jede Strecke einzeln; bei uns folgen Kamera und Grip aus den Maßen und dem Boden-Gesetz — jedes prozedurale Fahrzeug ist ab dem ersten Bild getunt.",
      beste: [
        "**Forza Motorsport 2023** (Turn 10): Reifen-Kontakt mit 8 Punkten bei 360 Hz statt 1 Punkt bei 60 Hz; die Physik vom Bild entkoppelt.",
        "**BeamNG.drive**: Soft-Body mit ≈ 400 Knoten und 4 000 Balken je Wagen bei 2 000 Hz in EINEM Integrator.",
        "**Burnout Paradise** (Criterion 2008) und **Marvel's Spider-Man** (Insomniac, GDC 2019 Ruskin): offene Stadt in 60 fps bei Höchsttempo, das Streaming an das Bewegungstempo gebunden.",
        "**GTA V** und die Tempo-Studie 2017 (EUDL 10.1007/978-3-319-55834-9_14): die Chase-Cam kehrt nach ≈ 1 s hinter den Wagen zurück; größeres FOV und höhere Kamera steigern das gefühlte Tempo, starke Bewegungsunschärfe senkt es."
      ],
      kriterien: [
        {
          name: "Das Fahr-Gesetz: Reifen, μ aus der EINEN Stoff-Zeile × Nässe, Takt",
          punkte: 0,
          staffel: "1 = (a) Seitenkraft mit Spitze bei 6–10° Schlupf und ≥ 15 % Abfall ODER (b) μ je Boden aus der EINEN Stoff-Zeile IN DER WELT gemessen (Bremsweg 50 → 0 km/h Gras/Weg ≥ 1,5×) · 2 = (a) + (b) + nass ≥ 1,3× aus der EINEN Nässe + Sim-Takt im Fahr-Schritt ≥ 240 Hz, Labor = Welt S1 ≤ 0,01 m",
          messung: "gate:fahr-leben, neuer Teil K7 Reifen (K6 heißt schon Verwindung, `scripts/diag-fahr-leben.cjs:294/324`), Node ≤ 1 min; der Bremsweg auf zwei Böden IN DER WELT (Konsum), nie nur in der Garage. Das Gamepad zählt Leib K5.",
          beleg: "Labor und Welt fahren EIN Gesetz (`vehicle-core.js:3003` fahrSchritt, Zweispur mit Schlupfwinkel; S1 ≤ 0,01 m). Die Seitenkraft ist eine gesättigte Gerade (`:2914` `Math.min(cap, G.CA_F * slipF)`), der Grip je Rezept fest (`:2913` `cap = G.maxGrip * G.grip`, `mu` `:3015`), er liest weder Boden noch Wetter; FIXED_DT 1/60 (`stamm/koerper-bewegung.js:2108`).",
          schlupfloch: "Die Pacejka-Kurve in den Kern legen, während die Welt μ konstant weiterreicht: der Bremsweg wird in der Welt gemessen. Ein Grip-Faktor je Boden-Name im Wirt wäre ein Zwilling der Stoff-Zeile: μ kommt aus derselben Zeile, die Farbe und Masse trägt.",
          aenderung: "EIN Heim der Fahrdynamik (Physik K5 fiel; V28). Die 1 der Synthese galt Labor = Welt ohne Staffel (B02, B17) → 0. Neuer Teil-Name K7 statt des besetzten K6 (B17)."
        },
        {
          name: "Die Fahrt kommt durch: das Wegenetz trägt das Rad",
          punkte: 0,
          staffel: "1 = auf der festen 2-km-Route entlang Weg und Feldweg (Wiese → Wald → Dorf) 0 Steckenbleiber und ≥ 80 % der Takte über 0,8 × vmax, an einem Gerät · 2 = auch 25°-Hang und Furt, Ego und Third, und der Verkehr der Stadt (PFLICHT-OFFEN C): um 10 und 23 Uhr fährt jeder Wagen des Gesetzes mit seinem Fahrer am Steuer, keiner steckt, keiner berührt Bewohner, Wagen oder Bau, beide Geräte",
          messung: "Spielgang-Station fahrt: das Fahrer-Skript folgt dem Wegenetz des Gesetzes, nie querfeldein; gezählt aus der Fahr-Telemetrie. Lücken und Tempo-Decke zählen Streaming K1, das Band Profiband K1. Der Verkehr der Stadt (die 2): gate:fahr-leben `--verkehr` als Probe der Sitzung (`fahrVerkehr`), die Metropole von stadt-voll.",
          beleg: "Am Kopf 3528f2d0 (23.10.) ROT, GTX (Zug 3, `bericht/2310-abab-zug3.md` § Fahrt): der Fahrer hängt an 2 von 4 Boots (v50 2,7–3,8 m/s, Anteil 8–12 m/s 0,32–0,39; die vollen Boots 9,9/10,0 m/s, 0,65/0,72), weiter keine Route auf dem Wegenetz; fahrt-takt senkt nur den Geomorph-Posten (Radeon 2,59 → 1,64 ms). Davor: Im Bündel-ABAB vom 20.10. (GTX) fuhr nur etwa die Hälfte der Takte voll schnell (Anteil 8–12 m/s 0,49–0,53), der Wagen blieb im Wald hängen, der Fahrer setzte zurück (`bericht/2010-buendel-abab.md`); eine Route auf dem Wegenetz fuhr niemand.",
          schlupfloch: "Eine Route über die leere Ebene besteht immer: die feste Route führt durch Wald und Dorf auf Wegen, die das Gesetz legt.",
          aenderung: "Neu: „Tempo mit Welt“ zählte doppelt mit Streaming und Profi-Band (V26, V27); hier bleibt, was nur der Fahrer erlebt. Die 2 strenger um PFLICHT-OFFEN C (w4-sitzung-reif, 30.10.): der Verkehr der Stadt ist die Fahrt, die durchkommt, für die Wagen des Gesetzes am Steuer ihrer Bewohner — C wohnt hier, kein anderes Kriterium der Karte misst ihn."
        },
        {
          name: "Die Kamera atmet das Tempo — EIN Rig aus dem Kern",
          punkte: 2,
          staffel: "1 = FOV (+≥ 8°) und Arm (+≥ 15 %) aus v/vmax in Garage UND Welt gemessen · 2 = dazu Azimut auf dem Fahrtvektor im Drift (Fehler ≤ 15°), Maus-Orbit mit Rückkehr nach 1–1,5 s, seitlicher Ruck p95 ≤ 0,02 m je Bild, EIN FOV-Schreiber",
          messung: "Garage G7 + gate:fahr-leben (Familie kamera), Welt und Garage; der Leser-Grep über `window.__codeOf` zählt die FOV-Schreiber.",
          beleg: "GEMESSEN 21.10. an beiden Geräten: GTX (OMEN, aff61247 = Kamera-Stand von main d3a626ee, --echt 1920×1080, bericht/2110-gtx-messschuld.md) Welt FOV +9,42°, Arm +18,3 %, Drift ≤ 10,9° zur Fahrtrichtung, Rückkehr nach 69° Maus-Orbit 1,10 s; Radeon (mk-2110) FOV +9,4°, Arm +18,2 %, Garage +9,1°/+18,1 %, Rückkehr 1,06–1,08 s, Ruck p95 0,016 m, EIN FOV-Schreiber → Staffel 2. Vorher: Seit kamera-tempo (Merge fac65067, main 57a9f2ab) trägt der Kern das Tempo: FAHR.kamera fovV/distV/tempoEase/driftFolge/rueckS (additiv, vehicle-contract byte-gleich), chaseKamera(c, g, s, dt, K, z, vmax) mit chaseGreif für Garage und Welt, `_kamFov` der EINE FOV-Schreiber. Gemessen am Kopf 57a9f2ab an der Radeon: WELT (werkbank --echt, Ausgabe-Pfad 1920×1080, Third, der GT auf freier Bahn bei −160/−1046, Vollgas): Ruhe FOV 75° · Arm 9,89 m → bei 15,09 m/s (0,94 vmax 16,0) FOV 84,40° (+9,4°) · Arm 11,69 m (+18,2 %); GARAGE (gate:garage-labor G7 + Messung bei vmax, r184 WebGPU): Ruhe 34° · 9,89 m → bei 15,21 m/s (0,95 vmax) 43,07° (+9,1°) · 11,68 m (+18,1 %), camera.fov = Ruhe + Tempo (zeigt 0), Orbit 25°, Rückkehr 1,06 s. gate:fahr-leben (Null-Renderer, echter `_gameLoopTick`): T5 Kern fovMax +10°, Arm +0,2, Drift 9°, Knick 0,08, Ritt fov bei 10 m/s +4,78°, zeigt 0,005°, Orbit 69°, Rückkehr 1,08 s, Schreiber [`_kamFov`]; T4 Ruck p95 0,016 m, FOV-Sprung beim Sicht-Wechsel 0,41° je Bild. Alles im Soll der 2 — es fehlt das zweite Gerät (M27). Ein erster Welt-Lauf an der Mess-Wiese fuhr bei 13,4 m/s in den Wald (+7,6° · +14,9 %, verworfen: keine freie Bahn). Roh: koordination `bericht/2110-mk-kopf/tempo-welt-*`, `garage-mk.log`, `fahr-leben.log`.",
          schlupfloch: "Ein FOV-Sprung misst +8° und ruckelt; ein fünfter FOV-Schreiber streitet mit Kampf und Fernglas: Ruck-p95, Azimut-Fehler und die Ein-Schreiber-Regel.",
          aenderung: "Die 1 der Synthese war „chaseKamera im Kern“ (Existenz, B58) → 0. Am Kopf 57a9f2ab in Welt UND Garage bei 0,94–0,95 vmax gemessen → 1; die 2 wartet auf die GTX (M27)."
        },
        {
          name: "Übergänge unter Bewegung: Sicht-Wechsel, Auf- und Absteigen, Hang",
          punkte: 2,
          staffel: "1 = an einem Gerät im Bild gehalten · 2 = an beiden Geräten im Bild, und bei jeder neuen vmax-Stufe neu gemessen",
          messung: "gate:fahr-leben T4 (Mechanik) + Station fahrt im Bild: nach Ego → Third in voller Fahrt steht der Azimut binnen 10 Bildern ≤ 10° an der Gier, jede zeichnende Stufe ≤ 2 m an der Physik-Lage, Bild-Deckung in Third 1; Auf- und Absteigen in Fahrt und am Hang ohne Kamera-Sprung > 0,5 m je Bild.",
          beleg: "f1-rest auf main 5768586a: Absteigen in Fahrt 14,4/1,55 → 0,25/0,21 m je Bild, Deckung nach Ego→Third 0,76/0,70 → 1/1, Streu-Geister 9 → 0; T4 stand vorher ROT (2daec674). Im Bild belegt nur an der GTX (Bündel-ABAB 20.10. an f5b66780: der GT steht an B deckend in der Bildmitte; f5b66780 → dc6702ab ändert nur Karten-Bake und siedlung-bauten, die Fahrt-Quellen sind unberührt). T4 selbst läuft auf dem Null-Renderer (`scripts/diag-fahr-leben.cjs:2298-2304`); gemessen bei 6–10 m/s. Das Radeon-Bild am Kopf f2904a72 (21.10., Messschuld M8, derselbe Blick wie an der GTX: koordination `bericht/2010-buendel-abab/blick.js` über `werkbank eval`, echte GPU, 1920×1080, Steilhang −61,6/−37,3 17,4°, bergab 7,7–8,2 m/s): Third 70 Bilder → Ego 76° gedreht → Third — in den Bildern 1–3 nach dem Wechsel steht der GT deckend in der Bildmitte (ndc 0/−0,08, im Bild 3/3, Abstand 9,96 m), Azimut gegen den Kurs 0 · 3,5 · 5,2°, jede zeichnende Stufe 1,71 m an der Physik-Lage (Roh: koordination `bericht/2110-messschuld-radeon/m8-*`). Der Fahrt-Pfad seit f5b66780 ist unberührt (koerper-fahrt.js nur die Leib-Wahl `_leibDerSeele`). Im Bild gesehen: Wiesen-Halme stehen durch die Kabine des GT (die Natur-Wand des Wagens, kein Punkt hier).",
          schlupfloch: "Bei 6–10 m/s gemessen könnte derselbe Rig bei höherer vmax brechen: die 2 fällt automatisch, wenn eine neue vmax-Stufe ohne T4 im Bild gemergt wird.",
          aenderung: "Synthese gab 2 ohne Staffel; im Bild ist nur ein Gerät belegt → 1 (B57); das Radeon-Bild am Kopf 21.10. → 2 (M8)."
        },
        {
          name: "Rückmeldung: der Körper fühlt die Fahrt",
          punkte: 0,
          staffel: "1 = ≥ 3 Kanäle mit gemessenem Paar aus dem Ausgabe-Pfad bzw. am Klang-Abgriff · 2 = 6/6 (Motor-Klang, sichtbare Federung, Reifenspur aus dem Schlupf, Staub und Spritzwasser je Boden, Kamera-Rauheit je Boden, Rumble)",
          messung: "Je Kanal ein Bild- bzw. Klang-Paar (Drift auf Schotter gegen Weg); die Spur muss nach einem Drift im Ausgabe-Bild stehen, Staub nur auf Schotter.",
          beleg: "Gelesen werden Motor-Klang (`stamm/klang.js:619`, klang-core Motor-Gesetz) und sichtbare Federung (`stamm/koerper-fahrt.js` `:1090ff`) — beides ohne gemessenes Paar; Reifenspur, Staub, Quietschen, Rumble: 0 Treffer; Spur und Rauch leben nur in worlds/garage.",
          schlupfloch: "Ein Leser-Grep zählt auch einen Leser, der nichts zeichnet — die „2 von 6“ der Synthese (B59): je Kanal das Paar im Ausgabe-Pfad.",
          aenderung: "Die 1 der Synthese war eine Leser-Zählung (B59) → 0."
        }
      ],
      hebel: [
        { name: "Die Station fahrt auf dem Wegenetz ROT, dann der Täter", k: ["fahrzeug.K2+1"], t: [1.5, 1.5], wurzel: "Fahrer-Skript nach dem Wegenetz des Gesetzes (`fachwerk-core.js` roads/feldwege); Täter am Weg-Rand, an der Furt oder am Hang-Grip beim Namen.", pflicht: "—", v1: true },
        { name: "Spur, Staub, Spritzwasser und Rumble aus dem EINEN Fahr-Zustand", k: ["fahrzeug.K5+2"], t: [2, 2], wurzel: "`stamm/koerper-fahrt.js:_rittSchritt` (`:1090`) als einziger Ausgang des Fahr-Zustands; die Garage-Spur (worlds/garage) fällt in den Kern.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Die Kamera ist gelöst (F1 brauchte ≈ 15 Commits). Fest sitzt F5 „Tempo mit Welt“: der Zweig fahrt-vorausschau (5 Commits, 18.10.) liegt ungemergt, 125 hinter main; vmax steht seit Wochen bei 58 km/h, und das ABAB vom 20.10. zeigt, dass die GTX schon bei 36 km/h reißt (CPU-Takt p95 31 ms, Frame p95 35,4 ms) — die Schlangen-Reihenfolge ist nicht die einzige Wand.",
        anders: "Die Fahrt ist der härteste Test von Gebot 7: in Bewegung ändert sich alles, die Kosten sind die Änderung. Zuerst ms je gefahrenem Meter beim Namen messen, die Fahrt als Zelle ins Band holen (Profiband K1), vorausschauen entlang des Gesetzes (Wegenetz, Gelände) statt entlang des Tempo-Vektors (Streaming H1), und vmax erst hinter der grünen Linse heben — das Ziel-Tempo ist ein Entscheid über das Spiel, kein Hebel."
      }
    },
    {
      key: "siedlung",
      titel: "Siedlung — das Haus von innen, die Stadt, das Gelände, die Jahrhunderte",
      dom: "`fachwerk-core.js` (EPOCHEN, SIEDLUNG, ortPlan, exportSettlement) · `stamm/siedlung-*.js` · `gelaende-core.js` (ERDBAU) · `stamm/koerper-bewegung.js` (Anti-Clip)",
      v1: "v1 (ankommen: Start-Dorf, betreten) · B",
      aaaa: "Jede Welt-Zelle trägt die Siedlung, die ihr Boden, ihr Wasser und ihre Epoche verlangen; die Größen folgen dem Rang-Größe-Gesetz, und binnen 2 km vom Spawn sieht der Spieler von einem Hügel eine ummauerte Stadt. Wählt er ein Jahr (1320 · 1560 · 1860 · 1935), wächst dieselbe Stadt in Jahresringen — der alte Kern bleibt zu ≥ 80 % im jüngeren —, und nach v1.0 wächst sie in Spielzeit aus ihren Bewohnern. Die Gassen laufen auf den Höhenlinien (Gefälle p95 ≤ 12 % vor dem Erdbau). Jedes Haus ist durch die Tür bis in Keller und Dachboden begehbar, ohne Anti-Clip-Hub. Das erste Haus steht nach ≤ 0,5 s, egal ob 12 oder 300 Häuser. **Wo wir die Besten schlagen:** AC Unity baut EIN Paris von Hand in einer Epoche, CityEngine und die City Sample rechnen offline und liefern Gigabytes; unser Plan ist eine Funktion (Seed, Ort, Epoche) im Browser, deren Kosten am Schirm hängen, und die Jahrhunderte sind ein Parameter, keine neuen Assets.",
      beste: [
        "**Esri CityEngine / CGA** (Parish & Müller, SIGGRAPH 2001; Müller et al., SIGGRAPH 2006): Städte aus Eingabekarten, die Kette Hauptstraße → Netz → Parzelle → Masse → Fassade → Ornament; die Straße weicht Gelände und Wasser.",
        "**Assassin's Creed Unity**, Paris 1789 (Ubisoft 2014): > 5 000 NPC im Bild, jedes vierte Gebäude eingerichtet, kein Ladeschirm zwischen Straße, Haus und Untergrund.",
        "**The Matrix Awakens / City Sample** (Epic, UE5 2021): ≈ 7 000 Gebäude, 260 km Straße aus Houdini-Regeln, offline gebacken.",
        "**Manor Lords** (Slavic Magic 2024): Burgage-Parzellen frei an die Straße, mit Hinterhof und drei Ausbaustufen, Straßen folgen den Hügeln."
      ],
      kriterien: [
        {
          name: "Das Haus von innen: Tür, Treppe, Keller, Dachboden",
          punkte: 1,
          staffel: "1 = der Spieler geht durch die Tür bis Keller und Dachboden ohne Vertikal-Sprung > 0,3 m in einem Frame (Anti-Clip-Hub = ROT), an einem Haus · 2 = jedes Haus des Start-Dorfs, Innenraum lesbar (Luma ≥ 15 % des Außen-Schattens, Schatten K4), beide Geräte",
          messung: "Spielgang-Station haus: Tür öffnen, Treppe, Keller (kellerY −2,40 m), Dachboden, Ego und Third, mittags und nachts.",
          beleg: "SCHNITT haus-innen, gemergt in main b9537781 (V18.546.55), mit Welt-Byte: 2b31ea31 „Der Stab trägt keinen Leib“ (`stamm/gelaende-kollision.js:_blockerFugen`: eine Box schmaler als ein Fuß, `PLAYER_STAB` 0,15 m, trägt keinen Leib — der Täter war die Schacht-Brüstung `railSeg`, deren Holm die Haft-Regel als Boden nahm) und 60b26c9b „Klettern heißt hinein“ (`stamm/koerper-bewegung.js:_loopPlayerMovement`: geklettert wird nur mit dem Blick ≤ 45° neben der Wand-Normalen; Erdungs-Cache, Sprung-Frische und `_wandKontaktAt` auf der Schritt-Uhr `_simZeit`). Linse gate:haus-welt W10 DER SPIELGANG (`scripts/diag-haus-welt.cjs`, 6705848f trägt W1-Gang, W3 Treppe und W9 Keller; 24600579 wartet im Bau-Ereignis): EIN Gang ohne Versetzen per W-Taste (`_stepFixedSim`) von 1 m vor der Tür → Flur → um den Schacht → Keller → zurück → jeder Lauf bis zum Dachboden, auch an beiden Spur-Rändern ±0,12 m, je Sim-Schritt der Hub: am Kopf 8 Gänge grün, Hub ≤ 0,20 m (Tritt-Steigung), 0 Kletter-Schritte, Keller −2,28 m = Soll, Dachboden 7,81/7,80 m → Staffel 1 (Mechanik am Null-Renderer, R3). An der Basis ROT: Hub 0,56–0,59 m in einem Schritt in 7/7 Gängen, Selbsttest `kletter` (Basis-Regel) 843 Kletter-Schritte in 8/8 Gängen; die Selbsttests stab, kletter, wand und huelle feuern je genau ihr W. Zweig-CI 39673975786 22/22, integ-CI an b9537781 22/22 samt echt. Quelle: `git log 2709b3a1..24600579`, befund haus-innen. Für die 2 fehlen jedes Haus des Start-Dorfs, das Innen-Bild (Luma ≥ 15 % des Außen-Schattens) und beide Geräte; die Labor-Begehung (fachwerk walkUpdate) hat dieselbe Haft-Regel ohne Stab (Studio-Code unter Byte-Beweis, offen benannt).",
          schlupfloch: "Den Keller zählen statt zu begehen: die Station geht hinein; Labor und Welt durch ein abgedunkeltes Labor anzugleichen: die Albedo zählt Material K1 absolut.",
          aenderung: "Die 1 der Synthese stand auf Gesetz-Merkmalen, während die Klasse haus am Kopf kein Ist trägt (B60) → 0; Labor = Welt zählt Studios K4, der Ton Material K3 (V16, V22); Schnitt haus-innen 0 → 1 (W10, b9537781)."
        },
        {
          name: "Die Stadt in Reichweite, nach Rang und Größe",
          punkte: 0,
          staffel: "1 = in ≥ 6 von 8 Saaten mit zufälligem Spawn steht binnen 2 km eine ummauerte Stadt (Auto-Zellen, nie Chat), sichtbar vom Hügel an einem Gerät · 2 = Zipf-Exponent 0,8–1,2 über 32 × 32 km mit Konfidenz-Intervall, Export trägt mauer und graph, mittags und in der Dämmerung, beide Geräte",
          messung: "diag-settlement, neuer Teil C: Zensus der Auto-Zellen mit Größen-Histogramm weiler…metropole; Bild vom Hügel aus dem Ausgabe-Pfad.",
          beleg: "Gemessen am Kopf (Node, Radeon-Laptop, ein Lauf): exportSettlement mit nH 12 → dorf (16 Slots), nH 120 → grossstadt (127), nH 300 → metropole (307); der Export trägt kein `mauer` und kein `graph`. Die Welt würfelt nH 8..17 (SIEDLUNG nHMin 8 / nHSpan 10, `fachwerk-core.js:2844`; `stamm/siedlung-ort.js:1935`), die DSL klemmt bei 120 (`:1786`): in der Welt gibt es nur Dörfer.",
          schlupfloch: "Eine Sonderregel am Genesis-Spawn bestünde „Stadt binnen 2 km“, ein Zipf-Fit über 8 × 8 km wäre Rauschen (B61): zufällige Spawns über 8 Saaten, 32 × 32 km mit Intervall; eine Chat-Stadt zählt nicht.",
          aenderung: "Saaten-Pflicht und größeres Fenster (B61); die Jahrhunderte wanderten nach K4."
        },
        {
          name: "Gelände-Treue: der Grundriss liest den Boden",
          punkte: 0,
          staffel: "1 = Gassen-Gefälle p95 ≤ 12 % VOR der Erdbau-Glättung in ≥ 4 Saaten · 2 = dazu Hangdörfer über slopeMax 0,35 hinaus, Erdbau-Median je Haus als Kosten, EIN Grundriss-Leser statt drei",
          messung: "diag-settlement über ≥ 4 Saaten; der Erdbau-Median in m³ steht als Kosten daneben. Halm-Pixel im Grundriss zählen Vegetation K4.",
          beleg: "ortPlan hat Erdbau-Klassen (Platte ≤ 1,5 m, Hanghaus ≤ 4 m, darüber Stelzen; Fuß-Gefälle 12 %, Brücken; `fachwerk-core.js:5551ff`) — Existenz; dorfLayout(plan, ext, seed) ist geländeblind (`:3043`), die Ortwahl nimmt nur flache Orte (slopeMax 0,35, `:2844`); drei Grundriss-Leser (`vegetation-baum.js:1828`, `siedlung-ort.js:1384`, `feld-leben.js:2101`). Das Gefälle vor dem Erdbau ist nie gemessen.",
          schlupfloch: "Das Gelände nachträglich glätten, bis jede Gasse unter 12 % liegt: gemessen VOR dem Erdbau, der Erdbau-Median steht als Kosten daneben.",
          aenderung: "Die 1 der Synthese war die Existenz der Erdbau-Klassen (B60) → 0."
        },
        {
          name: "Durch die Jahrhunderte — als Parameter, dann als Wachstum",
          punkte: 0,
          staffel: "1 = dieselbe Zelle unter 1320/1560/1860/1935: der ältere Kern liegt zu ≥ 80 % im jüngeren (Jahresringe), die Epoche moderne ergibt stadt, die Epoche bestimmt Rolle, Bauart und Kleidung im Export · 2 = der Ort wächst in Spielzeit aus Bewohnern, wohl und lebendig (deterministisch aus Saat + Akten), das Haus des Spielers wird Kern eines Rings, sichtbar vom Hügel (nach v1.0)",
          messung: "diag-settlement Teil J (Jahresringe, Überdeckung je Slot); Teil W über Ereignis-Takte für das Wachstum.",
          beleg: "EPOCHEN.groesse gibt es (`fachwerk-core.js:2806-2814`); Epoche moderne mit nH 18 → markt (am Kopf in Node gemessen); Jahresringe ungemessen; in Spielzeit wächst nichts.",
          schlupfloch: "Ein Label je Epoche statt Überdeckung: die Jahresringe messen, welche Slots erhalten bleiben; ein Zeitplan, der Häuser setzt, ist kein Wachstum aus Bewohnern (die Mutation wohl → 0 hält es an).",
          aenderung: "Neu: Spieler-Bauen (Synthese-K4) wohnt in Bauen K2–K4 (B53, V18); frei wurde das Jahrhundert des Schöpfers (V10)."
        },
        {
          name: "Das erste Haus steht sofort",
          punkte: 0,
          staffel: "1 = erstes Haus sichtbar ≤ 0,5 s nach dem Erwachen der Zelle, unabhängig von nH (12 gegen 300), als Studio-L-Kette (Bau-Hash im Bild), an einem Gerät · 2 = beide Geräte",
          messung: "Station dorf: Zelle wecken bei nH 12 und 300, Zeit bis zum ersten Haus mit seinem Bau-Hash im Ausgabe-Bild. Die Stadt im Profi-Band ist eine Zelle von Profiband K1.",
          beleg: "Am Kopf 3528f2d0 (23.10.) ROT: stadt-erwachen be20b0153 ist gelandet (über 8ad675c8/6e376d2e) — Zug 2 GTX an 40d00ade (`bericht/2310-abab-zug2.md`, M36 an B): Bau-Hash gleich 2/2 je nH (68df1b3c), der Erwachen-Hänger 461–469 → 108/125 ms, aber nH 300 erstes Haus gezeichnet erst nach 4,67/4,82 s (die Raten bauen spielernah zuletzt) → ROT gegen 0,5 s; seither hebt material-albedo den L2-Bake in fachwerk-core 45 → 66 ms, auch diese Zahl ist nach R6 alt. Davor: GEMESSEN 22.10. an der GTX (OMEN, b0b2d8ed laufzeit-gleich mit 6cfce28a = main 73f28224, Messschuld M36, koordination `bericht/2210-messschuld-gtx-6cfce.md` § M36): werkbank --echt Station dorf, Regler frei, Zelle −4,−6 (512 m südlich des Dorfs) per Zell-Info nH 12 oder 300, der Spieler geht mit 4 m/s durch den Vorlauf-Ring, bis sie bei 260 m erwacht, 4 frische Boots: nH 300 erstes Bild nach dem Erwachen 461–469 ms, Haus gezeichnet nach 653/655 ms → ROT gegen 0,5 s (ab dem Sichtradius 185/195 ms); nH 12 Haus gesetzt nach 4–11 ms, aber 237 m vor dem Spieler hinter dem Bauten-Radius (`architectureCullingRadius` 107–120 m), gezeichnet 32,9 s nach dem Erwachen, ab dem Sichtradius 139/172 ms. Täter beim Erwachen nH 300 (`m36/d-nh300.txt`): `_autoSettlementSpawnCell` synchron 192 ms — `_ortPlanSetzen` 95,6 (davon `_erdbauWirkt` 45,4), `_spawnSettlementErlebnis` 95,3 (davon `_dorfLaterneSetzen` ×104 38,1, `_stlWegeBuild` 25,1) —, dazu ≈ 270 ms unbenannt im ersten Bild mit den neuen Bauten. Bau-Hash: nH 12 gleich in 3 Läufen (f5558d2c), nH 300 UNGLEICH zwischen Boots (ae2874f6 gegen 40614f1, Anker −835,27 gegen −835,10, dasselbe erste Haus 3,7 m versetzt) — die Ort-Wahl der großen Zelle ist nicht bit-gleich. Bleibt 0. Benannter Befund an der Staffel (hier nicht entschieden, die Staffel bleibt): „≤ 0,5 s nach dem Erwachen“ misst bei nH 12 den Sichtradius (Erwachen bei 260 m gegen 107 m Bauten-Radius), nicht den Bau — ob die Zeit ab dem Bild zählt, in dem das Haus stehen kann, ist eine Definitions-Frage; nH 300 ist auch unter dieser Lesung ROT (Hänger beim Erwachen, Bau-Hash ungleich). Davor: STAND 22.10. (siedlung-k5 07751d22 + vorrat-pingpong da6203ef, integ 6cfce28a; gate:settlement C-K5 an der OMEN-GTX an da6203ef, koordination `bericht/2210-vorrat-pingpong/settlement-neu.out`; der K5-Pfad bis 6cfce28a gleich): mit Vorlauf (gehend in die Zelle) steht das erste Haus nach 25 ms (nH 12) bzw. 107 ms (nH 300), das nächste zuerst (RANG: ersterM = naechstM); ohne Vorlauf (Teleport, Start-Dorf, KI-Akt) 449 ms / 3 807 ms bei 306 Bau-Ereignissen; Ort-Wahl im Haupt-Thread 3 ms je Bild → 0, die Welt am Dorf ruht nach 3 s statt nie. Die Linse misst bis zur ersten Hebung (`_spawnSettlementSlot`), nicht bis zum Haus im Ausgabe-Bild; das einzige Bild mit Bau-Hash auf echter Hardware ist die Radeon-Station dorf ohne Vorlauf an bdb2765b (nH 12 haus_holzhuette 160 ms, b3ff531b; nH 300 haus_renaissance 2 119 ms, b43da6dd) — ROT bei nH 300; das Vorlauf-Bild nur swiftshader an f2836b75 (104 ms, kein Gerät, Lehre 17). Davor: Der Export wächst linear mit ≈ 35 ms je Haus (am Kopf in Node gemessen: nH 12 → 0,45 s, nH 120 → 4,4 s, nH 300 → 10,0 s), weil massBau je Haus VOR dem Layout läuft (`fachwerk-core.js:5388-5392`).",
          schlupfloch: "Ein schneller Platzhalter-Würfel als erstes Haus ist fail-soft: der Bau-Hash der Studio-L-Kette im Bild.",
          aenderung: "Die Last der Stadt zählt Profiband K1 (Messort stadt; V26), die Bewohner zählen Menschen."
        }
      ],
      hebel: [
        { name: "Export ohne Vorlauf und die Raten nah zuerst: das erste Haus ≤ 0,5 s auch bei nH 300, Teleport und KI-Akt (Rang, Vorlauf-Ring, Ort-Faden und das Erwachen in Raten stehen)", k: ["siedlung.K5+1"], t: [0.5, 1], wurzel: "Gemergt sind der Rang, der Vorlauf-Ring und die Ort-Wahl im Faden (siedlung-k5 07751d22, vorrat-pingpong da6203ef) und seit 3528f2d0 stadt-erwachen be20b0153: der Ort der Welt-Zelle ist eine Funktion von Saat und Gesetz (Bau-Hash gleich 2/2 je nH, 68df1b3c), das Erwachen geht in Raten je Takt (`_dorfErwachen`; GTX-Hänger 461–469 → 108/125 ms, Zug 2 an 40d00ade); „ext aus FOOTPRINT statt massBau“ ist verworfen (Zwilling, befund siedlung-k5). Der Rest: die Raten bauen spielernah zuletzt — nH 300 erstes Haus nach 4,67/4,82 s (GTX); die Reihe der Raten nach dem Abstand zum Spieler, und `fachwerk-core.js:exportSettlement` rechnet massBau je Haus vor dorfLayout (∝ nH, 2,2–3,9 s an der Radeon), ohne Vorlauf reißt nH 300 die 0,5 s; dazu der Bau-Hash im Ausgabe-Bild an einem echten Gerät. Der L2-Bake stieg mit material-albedo 45 → 66 ms.", pflicht: "B (das Start-Dorf liegt im Kalt-Pfad)", v1: true },
        { name: "Das Stadt-Tor: EPOCHEN.groesse wird nZiel, SIEDLUNG mit Rang-Größe-Verteilung, mauer und graph reisen im Export, vier Klemmen werden EINE", k: ["siedlung.K2+1"], t: [1, 1.5], wurzel: "`fachwerk-core.js` EPOCHEN (`:2806-2814`) · SIEDLUNG (`:2844`) · exportSettlement (`:5452ff`) · ortPlan (`:5551`) + `stamm/siedlung-ort.js` Klemmen (`:1786`, `:1814`, `:1935`, `:2232`); Golden-Re-Mint siedlung.json als Vertrags-Akt.", pflicht: "—", v1: false },
        { name: "Die Trasse liest das Gelände: dorfLayout bekommt hoeheAt", k: ["siedlung.K3+1"], t: [1.5, 2], wurzel: "`fachwerk-core.js:dorfLayout` (`:3043`) mit ctx.hoeheAt aus gelaende-core; EIN Grundriss-Leser.", pflicht: "—", v1: false },
        { name: "Das Haus von innen für jedes Haus des Start-Dorfs: Innen-Luma lesbar, beide Geräte (der Gang steht seit haus-innen)", k: ["siedlung.K1+1"], t: [1, 1.5], wurzel: "Der Spielgang W10 (`scripts/diag-haus-welt.cjs`) geht heute die ersten 8 Häuser des Drehbuch-Dorfs; der Rest: jedes Haus des Start-Dorfs (befund siedlung-k5: die LOFT-Brüstung `fachwerk-core.js:776` macht W10 „attic 0,87 m neben“ für haus_gotisch@-123 und haus_provenzalisch@-172 ROT) und das Innen-Bild aus dem Ausgabe-Pfad (Luma ≥ 15 % des Außen-Schattens, Schatten K4) an Radeon und GTX; die Labor-Begehung (`worlds/fachwerk` walkUpdate) liest den Stab unter Byte-Beweis.", pflicht: "—", v1: true },
        { name: "Die Jahresringe", k: ["siedlung.K4+1"], t: [1.5, 1.5], wurzel: "`fachwerk-core.js` ortPlan mit Epoche als Parameter: die Slots des älteren Jahres sind Teilmenge des jüngeren.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Das Stadt-Tor steht seit dem 18.10. als nächster Hebel, ohne eine Welle (kein Commit an EPOCHEN, SIEDLUNG oder dem Export-Tor); die Stadt galt als Feature unter dem Feature-Stopp und als Last für B und E, und die E-Messorte rechnen mit ruhendem Dorf-Zug, damit diese Last nie erscheint.",
        anders: "Die Stadt ist kein Feature, sie ist der Beweis von Gebot 7 („die Welt ist eine Funktion, kein Sack“): zuerst der Export mit Rang (er trägt B), dann der Messort stadt im Band; danach ist die Größe bis zur Metropole ein Parameter und die Jahrhunderte des Schöpfers dieselbe Funktion mit anderem Jahr."
      }
    },
    {
      key: "leib",
      titel: "Der Spieler-Leib — Eingabe, Fuß, Wasser, Kamera zu Fuß, Gamepad",
      dom: "`stamm/koerper-bewegung.js` · `stamm/koerper-leib.js` · `stamm/koerper-seele.js` · `koerper-core.js`",
      v1: "v1 (laufen und sehen)",
      aaaa: "Der Spieler fühlt seinen Leib vor allem anderen: die Taste bewegt ihn in ≤ 50 ms im Bild, der Fuß steht am 25°-Hang und auf der Stufe, Sprung-Höhe und -Weite folgen aus dem Leib-Gesetz. Am Ufer geht er ins Wasser, schwimmt und taucht ohne Sprung, und unter Wasser sieht er die EINE Wasser-Wahrheit; in der Höhle fällt das Licht ab. Die Kamera zu Fuß steht nie im Fels und ruckt nicht; ein Gamepad lenkt jedes Verb analog. **Wo wir die Besten schlagen:** For Honor und TLOU2 suchen ihre Bewegung in Motion-Capture-Datenbanken, BotW macht jede Fläche kletterbar mit einem Ausdauer-Wert von Hand; bei uns folgen Schritt, Sprung und Schwimmen aus dem Leib-Gesetz, das auch Tier und Bewohner trägt (Labor = Welt im Körperstudio).",
      beste: [
        "**For Honor** (Ubisoft; Simon Clavet, GDC 2016 „Motion Matching and The Road to Next-Gen Animation“): die Bewegung wählt je Frame den passenden Clip aus einer Motion-Capture-Datenbank.",
        "**The Legend of Zelda: Breath of the Wild** (Nintendo 2017): fast jede Fläche ist kletterbar, Ausdauer begrenzt — der Leib als Werkzeug der Erkundung.",
        "**NVIDIA Reflex + LDAT** (2020): System-Latenz vom Klick bis zum Pixel am Schirm gemessen, nicht in der Engine.",
        "**Subnautica** (Unknown Worlds 2018): Ufer, Schwimmen und Tauchen ohne Ladeschirm, Unterwasser-Sicht aus Tiefe und Licht."
      ],
      kriterien: [
        {
          name: "Die Taste bewegt den Leib im Bild: Eingabe-Latenz",
          punkte: 2,
          staffel: "1 = Taste → bewegter Leib im Ausgabe-Bild p95 ≤ 50 ms an einem Gerät (gehen, Sicht-Wechsel) · 2 = jedes Verb (gehen, springen, schwingen, einsteigen), beide Geräte",
          messung: "Spielgang-Station leib: Eingabe-Ereignis (CDP) bis zum ersten Ausgabe-Bild mit Bewegung im Leib-Band, je 50 Proben, Ego und Third.",
          beleg: "GEMESSEN 22.10. — Staffel 2, jedes Verb an beiden Geräten (`werkbank latenz --proben 50`, Mess-Wiese, CDP-Taste bis zum ersten Ausgabe-Bild mit Bewegung, p95 Ego/Third ≤ 50 ms; schwingen = hieb, die Klinge von halten-latenz). Radeon 890M an e86600bd mit 60d189a9 (die Bühne eines Verbs fällt vor dem nächsten, auf main), EIN Ruf über fünf Verben, 0 von 500 Proben fehlen (koordination `bericht/2210-radeon-beweise.md` § leib.K1): gehen 42,5/35,7 · wechsel 25,8/23,6 · springen 31,2/27,0 · einsteigen 27,6/25,6 (der GT gezeichnet, sonst bricht die Linse laut) · hieb 22,7/30,7 ms; Gegenprobe gehen allein in frischer Sitzung Ego 42,9/42,2, Third 43,4/43,9. GTX 1060 (OMEN) am Code von f3865c80 (latenz-verben 10c879c0, die Verben springen und einsteigen in der Linse, seit V18.546.62 auf main; `bericht/2210-latenz-verben.md`): springen 27,8/39,7 · einsteigen 38,3/22,9 (GT gezeichnet, `gt-third.png`; der Höchstwert 224 ms ist die erste Probe nach dem Bau des GT) · hieb 20,3/31,1 ms (Hit-Stop 14/10 Bilder), an f3865c80 hieb 35,2/31,2 (`bericht/2210-leib-k1-staffel2.md`); gehen 41,0/40,9 und wechsel 19,2/23,3 ms an 2160be58 (`bericht/2110-gtx-messschuld-3.md`) — seither trägt der Geh-Pfad nur 60b26c9b (der Erdungs-Cache auf der Uhr des Schritts: 33 ms Wanduhr → 2 × FIXED_DT, Klettern nur gegen die Wand; auf der flachen Wiese bleibt der Leib geerdet), am Code von f3865c80 im Sammel-Lauf (n 5) gehen 38/36,7, wechsel 30,6/25,2 ms → die 2. R6: f3865c80..e3dd2b67 über `stamm/koerper-*.js` und `stamm/kampf.js` leer; koerper-core und foundry-core tragen seither nur die Mengen-Stufen 2 und 3 der Bewohner (518 Ofen-Klassen byte-gleich, der Spieler-Leib unberührt). Davor: GEMESSEN 21.10. an main 5951786f (anfahren: Sim bis zur Wanduhr, Bewegung vor Physik, kAcc 14 → 40), `werkbank latenz`, je 50 Proben: GTX (OMEN, bericht/2110-abab-anfahren.md) Gehen p95 Ego 64,5 → 37,1 ms, Third 69,6 → 42,6 ms, Wechsel 26,7/20,0 ms; Radeon warm Ego 42,3, Third 40,7, Wechsel 22,6/19,2 ms (frisch gebootet Ego 57,6 durch lange Aufgaben des Einschwingens) → Staffel 1. Staffel 2 an der GTX gemessen 21.10. an main 2160be58 (OMEN, `werkbank latenz --proben 50` mit Mess-Patch für Space und KeyE, koordination `bericht/2110-gtx-messschuld-3.md`): p95 Ego/Third gehen 41,0/40,9 · wechsel 19,2/23,3 · springen 40,0/34,2 · einsteigen 26,9/21,5 ms — vier Verben im Soll (beim Einsteigen war das Mesh des GT nicht gebaut, gemessen ist Leib und Kamera); schwingen ist ungemessen (kein Verb im Spiel-Pfad gefunden), an der Radeon fehlen springen und einsteigen; `latenz` kennt am Kopf nur gehen und wechsel — die 1 bleibt. Vorher: Bewegung ist nie am Render-Signal (Lehre 13), FIXED_DT 1/60 (`stamm/koerper-bewegung.js:2108`); die Latenz bis zum Pixel misst niemand.",
          schlupfloch: "Taste bis Sim-Schritt wäre die Eigenmeldung: gezählt wird bis zum Pixel (das Maß von LDAT).",
          aenderung: "Neu (V02); 22.10. jedes Verb an beiden Geräten gemessen 1 → 2."
        },
        {
          name: "Der Fuß steht: Hang, Stufe, Sprung aus dem Leib-Gesetz",
          punkte: 0,
          staffel: "1 = Fuß p95 ≤ 3 cm am 25°-Hang und auf Stufen, 0 Steckenbleiber auf dem Spielgang, an einem Gerät · 2 = dazu Sprung-Höhe und -Weite aus dem Leib-Gesetz (Mutation von Leib-Masse/Kraft zieht sie), Ego und Third, beide Geräte",
          messung: "werkbank eval + bild: Fuß gegen das gezeichnete Mesh (`_bodenSichtAt`) an 200 Kontakten, Gang über Hang und Treppe.",
          beleg: "Seit boden-rolle (Merge c393726c) steht der Schuh flach auf dem Fuß (Ofen-Akt, 2/460 Klassen), die Leib-Sohle auf der Kapsel-Sohle (`PLAYER_FOOT_OFFSET`), die Sohle kippt mit dem Boden (`_gaitSohlenKipp`). Gemessen am Kopf 57a9f2ab an der Radeon (gate:koerper-stand K8, der tiefste gezeichnete Schuh-Vertex im Fuß-Lock des Gangs gegen `__gezeichnet`, 200 Kontakte) in drei Läufen (Standard/Ego/Third): 25°-Hang 3,1/2,8/2,9 cm, Mess-Wiese 3,4/3,2/3,2 cm — am Hang auf der Grenze und ±0,3 cm je Lauf (soleH misst die Pose des ersten Takts), Stufen und der Spielgang ungemessen: ROT. Täter beim Namen (befund boden-rolle): der starre Fuß rollt über den Ballen, die Schuh-Spitze taucht im Abrollen 3–5,7 cm ein — es fehlt das Zehen-Gelenk. GTX an main 2160be58 (M26-Lauf): Fuß Ego 3,4/3,1, Third 3,4/3,1 cm (Wiese/Hang) — weiter über 3. Zehen-Spike 21.10. an 2160be58 (Mess-Patch an K8, kein Gelenk, koordination `bericht/2110-zehe-spike.md`, Messschuld M28): ohne die vordersten 28 % bzw. 20 % des Schuhs Wiese 3,6 → 1,6/2,3, Hang 3,3 → 2,2/2,5 cm — die Obergrenze des Gewinns liegt unter 3 cm, der Täter ist die starre Schuh-Spitze; das Gelenk, Stufen und der Spielgang sind nicht gebaut — die 0 bleibt. Roh: koordination `bericht/2110-mk-kopf/k8-*.log`, `bericht/2110-zehe-spike/`.",
          schlupfloch: "Ein Offset am Fuß schiebt den Mittelwert: p95 am Hang; ein fester Sprung-Wert besteht die Höhe: die Mutation verlangt das Gesetz.",
          aenderung: "Der Spieler-Teil aus Gelände K5 (V02)."
        },
        {
          name: "Wasser und Höhle: Ufer, Schwimmen, Tauchen, Sicht unter Wasser",
          punkte: 0,
          staffel: "1 = Ufer → Schwimmen → Tauchen ohne Sprung (Lage, Kamera) an einem Gerät · 2 = Unterwasser-Bild aus der EINEN Wasser-Wahrheit (Sicht-Abfall nach Tiefe gegen REF), Höhle mit Licht-Abfall, beide Geräte",
          messung: "Spielgang-Station see (1816/−6168): Kamera-Bahn und Leib-Lage je Frame beim Übergang; Unterwasser-Luma gegen Tiefe; Höhle über gate:hoehlen-sicht als Mechanik plus Bild.",
          beleg: "schwimm: 144 Treffer im Stamm; gate:hoehlen-sicht existiert ohne Bereich; Übergang und Unterwasser-Bild sind ungemessen.",
          schlupfloch: "Ein blauer Filter unter dem Spiegel wäre Kulisse: der Sicht-Abfall nach Tiefe aus der Wasser-Wahrheit.",
          aenderung: "Neu (V02; Sicht-Räume aus der Fehlliste B)."
        },
        {
          name: "Die Kamera zu Fuß",
          punkte: 1,
          staffel: "1 = Third nie im Fels oder in der Wand (0 Fels-Pixel im Nahbereich der Kamera), Ruck ≤ 0,02 m p95 beim Gehen, an einem Gerät · 2 = auch am Steilhang, im Haus, beim Sprint, beide Geräte",
          messung: "Spielgang über Hang, Gasse und Haus in Third; Pixel-Probe auf Fels/Wand vor der Kamera, Ruck aus der Kamera-Bahn.",
          beleg: "GEMESSEN 21.10. an main 5951786f (kamera-fuss: der Kugel-Wurf hält vor der ersten Haut), gate:kamera-leib Teil gang (Stamm, Fels, Haus im echten Spiel-Takt, rückwärts heran + 360°-Orbit, Radeon): Kugel in der Wand 49 → 0 von 1096 Bildern, 0 Fels-/Rinde-Pixel im Nahbereich, Ruck p95 0,0077 m → Staffel 1; offen: Blick bei Arm 0, Tür-Flügel ohne Leib, Stamm durchsichtig statt Halt; Staffel 2 (Steilhang, Sprint, GTX) ungemessen. Vorher: Kamera = EINE Kugel; der Kontakt-Löser trägt PM_ClipVelocity (`stamm/koerper-bewegung.js:238-325`); die Bild-Probe (Kamera im Fels) gibt es nicht.",
          schlupfloch: "Eine weit hinausgeschobene Kamera vermeidet Fels und verliert den Leib: die Leib-Deckung im Bild hält in derselben Probe.",
          aenderung: "Aus Physik K2 umgezogen (V02)."
        },
        {
          name: "Das Gamepad lenkt jedes Verb analog",
          punkte: 0,
          staffel: "1 = Gehen, Kamera und Fahren analog über den Achs-Wert (Lenkwinkel stetig) · 2 = jedes Verb, Rumble aus dem Zustand, Belegung frei",
          messung: "Station leib mit simuliertem Gamepad (Achs-Folge als Eingabe-Quelle), Lenkwinkel und Leib-Tempo gegen den Achs-Wert.",
          beleg: "`getGamepads` 0 Treffer im Stamm; die Eingabe ist digital 0/1.",
          schlupfloch: "Ein Achs-Wert, der auf 0/1 gerundet wird, besteht „Gamepad an“: die Stetigkeit über den Achs-Wert.",
          aenderung: "Aus Fahrzeug K1(d) umgezogen (B17, V02)."
        }
      ],
      hebel: [
        { name: "Das Zehen-Gelenk: der Fuß rollt über den Ballen statt durch den Boden (der Rest von Gelände H5), dann Stufen und Spielgang im K8", k: ["leib.K2+1"], t: [1.5, 2], wurzel: "`koerper-core.js` Bein-Baum (Zehen-Glied) → Ofen skinJoints, Rig und `_gaitIKPrep` (soleH aus der Ruhe-Pose statt aus dem ersten Takt), tetrapoda gangRolle 0,46 E; Studio-Kern unter Byte-Beweis (Lehre 11). Linse: gate:koerper-stand K8 fuss (Ratsche 4,5/4,2) mit einer Treppe am Hang.", pflicht: "—", v1: true },
        { name: "Schwimmen und Tauchen aus der EINEN Wasser-Wahrheit", k: ["leib.K3+1"], t: [2, 2], wurzel: "Übergang am Spiegel (`_waterLevelAt`), Unterwasser-Sicht über die Luft-Formel mit Wasser-β (`stamm/bild-himmel.js` Luft-Knoten).", pflicht: "—", v1: false },
        { name: "Die Kamera zu Fuß: EIN Rig wie in Fahrt", k: ["leib.K4+1"], t: [1, 1], wurzel: "`stamm/koerper-bewegung.js:_loopCamera` (`:1579`): Kugel mit Kollision gegen Fels und Blocker, Glättung wie chaseKamera.", pflicht: "—", v1: true },
      ],
      feststeck: {
        versucht: "Nie als Bereich gerichtet: der Leib des Spielers war Beleg in Gelände K5 und Physik K2, das Gamepad ein Halbsatz in Fahrzeug K1; die Schöpfer-Funde F1–F6 zeigten, dass Übergänge unter Bewegung ungemessen sind.",
        anders: "Der Leib bekommt seine eigene Station: Latenz bis zum Pixel, Fuß am Hang, Wasser, Kamera, Gamepad — gemessen im Gang, nicht in Ruhe."
      }
    },
    {
      key: "halten",
      titel: "Halten und Führen — Klinge, Werkzeug, Bogen (das Verb wield)",
      dom: "`stamm/kampf.js` (2 051 Zeilen) · `stamm/koerper-seele.js:1152` wieldBlueprint · `schmiede-core.js` · `worlds/schmiede` · `scripts/diag-kampf-gefuehl.cjs`",
      v1: "v1 (benutzen: halten)",
      aaaa: "Was die Schmiede baut, führt der Spieler: die Schwung-Dauer folgt der Trägheit der Klinge, Treffer-Impuls und Schaden folgen aus Masse × Schneide × Schlagtempo, Hit-Stop und Funken aus dem Stoff-Paar. Die Axt fällt, der Spaten gräbt, die Sichel erntet — nach ihrer Form, nicht nach einem Tag. Der Pfeil fliegt ballistisch und bleibt stecken. Lebenswerte, Sturz, Tod und Wiederkehr sind Zustand. **Wo wir die Besten schlagen:** TotK verklebt Waffen aus fertigen Teilen und addiert Werte, Kingdom Come II und For Honor balancieren jede Waffe von Hand; bei uns ist die geschmiedete Klinge ein Gesetz, und ihr Treffer folgt daraus — Labor = Welt.",
      beste: [
        "**The Legend of Zelda: Tears of the Kingdom** (Nintendo 2023): Fuse verklebt Waffe und Teil, die Angriffswerte addieren sich — Kombinatorik aus fertigen Objekten.",
        "**Kingdom Come: Deliverance II** (Warhorse 2025): Nahkampf mit Hiebrichtungen, Paraden und Meisterschlag, jede Waffe von Hand balanciert.",
        "**Hit-Stop** (Masahiro Sakurai, „Masahiro Sakurai on Creating Games“): das Bild hält beim Treffer für wenige Frames an, damit der Treffer fühlbar wird.",
        "**For Honor** (Ubisoft 2017), Art of Battle: Richtungs-Angriff und -Block als Lesart des Gegners."
      ],
      kriterien: [
        {
          name: "Der Treffer aus dem Gesetz: Trägheit, Masse, Schneide, Tempo",
          punkte: 1,
          staffel: "1 = Schwung und Treffer folgen der Trägheit des Werks (Dauer ∝ √I ±5 % an echten Blueprints, Klingen-Sweep am Chokepoint) — Mechanik · 2 = Schaden und Impuls aus Masse × Schneide × Tempo, eine Mutation in schmiede-core ändert Treffer UND Labor-Werk, im Bild beider Geräte",
          messung: "gate:kampf-gefuehl am echten Chokepoint (`_beginPlayerSwing`, `_kampfSweepTick`, `damageCreature`) + Mutations-Probe an schmiede-core; Bild-Station halten.",
          beleg: "gate:kampf-gefuehl (`scripts/diag-kampf-gefuehl.cjs`, headless am echten Chokepoint): (A) Dauer ∝ √I ±5 % aus `_swingDynamics` zweier echter Blueprints, (B) der Sweep trifft neben dem Fadenkreuz genau einmal, hinter dem Rücken nie, (C) Hit-Stop friert die Anzeige, nicht die Sim, (D) Tod-Kippen. Schaden aus `_kampfKraft` (`stamm/kampf.js:622`), Güte aus `_schmiedeGueteAnteil` (`:774`); die Masse kennt ρ nur für 4 Schmiede-Stoffe.",
          schlupfloch: "Ein Schadens-Wert je Waffe von Hand bestünde die Probe: die Mutation einer schmiede-core-Zahl verlangt das Gesetz.",
          aenderung: "Neu (V01); die 1 steht auf gemessener Gesetz-Mechanik am Chokepoint."
        },
        {
          name: "Das Gefühl: Eingabe → Schwung, Hit-Stop, Funken und Klang aus dem Stoff-Paar",
          punkte: 1,
          staffel: "1 = Eingabe → erstes Schwung-Bild ≤ 50 ms und Hit-Stop sichtbar im Ausgabe-Bild an einem Gerät · 2 = Klang und Funken aus dem Stoff-Paar (Spektrum je Paar verschieden), Ego und Third, beide Geräte",
          messung: "Station halten: `werkbank latenz --verb hieb --sicht third,ego --proben 30` (`scripts/werkbank.cjs` latenzAn, Urteil `latenzUrteil` in `scripts/lib/haenger-linse.cjs`): Klick per CDP (der erste Klick fängt den Zeiger), Start `mousedown.timeStamp`, Ende die Marke `getCurrentTexture`, an der die rechte Hand ≥ 1 cm aus ihrer Lage steht; die Zeit im Hörer des Spiels; Hit-Stop = längste Folge präsentierter Bilder nach dem Treffer mit stehender Schwung-Uhr und stehender Hand; ROT bei p95 > 50 ms, einem Verb ≠ hieb oder Hit-Stop-Median < 2 Bilder. Klang-Abgriff je Stoff-Paar (Stahl/Holz, Stahl/Stein, Holz/Fell).",
          beleg: "SCHNITT halten-latenz, auf main e5003509 (V18.546.59), mit Welt-Byte und Linse. Das Vorher: 21.10. am Kopf 816f26b4 (Radeon, Messschuld M18) Third p95 126, Ego p95 151 ms, Täter `tryMouseBreak` 64–86 ms synchron, darin `_pickCreatureAtCrosshair` (Raycaster über jede Haut jedes Tiers, SkinnedMesh rechnet die Knochen je Vertex). Linse 6ff6a229 (`werkbank latenz --verb hieb`) ROT an der Basis (Radeon, Mess-Wiese, frisch gebootet, je 30 Proben, Langschwert, Wolf-Puppe): Third p50 90,1 / p95 115,8 ms, Ego p50 92,8 / p95 105,6 ms, im Hörer 76,8 / 77,8 ms. Schnitt 11774d4d: `_pickCreatureAtCrosshair` (`stamm/kampf.js`) fragt die EINE Körper-Gestalt — der Strahl des Fadenkreuzes gegen `_kreaturGliedTreffer` hinter dem Grob-Tor `_trefferErreichbar` (`stamm/studio-bruecke.js`, dieselben Kapseln wie Klinge, Pfeil und Biss), der früheste Eintritt gewinnt; Bogen-Ziel und Trank-Übergabe fallen mit (derselbe Chokepoint). Gleiche Bedingung: Third p50 19,2 / p95 30,5 ms, Ego p50 18,1 / p95 36,0 ms, im Hörer 2,0 / 1,3 ms, Hit-Stop 13 / 12 präsentierte Bilder im Ausgabe-Pfad (Soll ≥ 2; Beweisbild Third: zwei präsentierte Bilder mit derselben Schwung-Uhr 0,2175, nur das Gras weht) → Staffel 1; Zweig-CI 39711623849 21/21 (Befund am Radeon-Platz, `.claude/worktrees/halten-latenz/befund.md`, nicht im Baum). Frisch: `git log 11774d4d..e5003509` über `stamm/kampf.js`, `stamm/studio-bruecke.js`, `stamm/kreatur-verhalten.js` und die Linse ist leer bis auf den Merge; tier-gang-k3 gibt der Haut-Kugel der Tiere die gestreckten Beine (`_tierReichKugel`, `stamm/koerper-leib.js` — das Grob-Tor liest `_kreaturLeib.reichweite`, nicht die Kugel), speicher-h1 halbiert den Speicher-Takt (10 → 5 s, `stamm/dirigent-kern.js`) abseits des Hörers; nicht nachgefahren. Offen für die 2: der Stoff-Paar-Klang und die Funken (ungemessen), das Ego-Bild des Hit-Stops (Ego nur gezählt), die GTX.",
          schlupfloch: "Ein Treffer-Klang je Waffe statt je Paar: das Spektrum muss mit dem getroffenen Stoff wechseln. Eine Schwung-Pose ohne Bild zählt nicht: das Ende ist die präsentierte Textur mit bewegter Hand, und ein Verb ≠ hieb ist ROT.",
          aenderung: "Gemessen ROT (M18, 21.10.), geschnitten 0 → 1 (halten-latenz, e5003509): der Pick fragt die Gestalt statt der Haut."
        },
        {
          name: "Das Werkzeug wirkt nach seiner Form",
          punkte: 0,
          staffel: "1 = Axt fällt, Spaten gräbt, Sichel erntet über die echte Eingabe, und eine umgeformte Klinge (Axt mit Spaten-Blatt) wirkt nach der neuen Form · 2 = jede Werkzeug-Form der Schmiede, Verschleiß aus dem Stoff",
          messung: "Station halten: Werkzeug-Satz aus der Schmiede, Wirkung am Baum, am Boden, an der Wiese; Form-Mutation.",
          beleg: "`_geraetGraebt` (`stamm/kampf.js:807`), Verschleiß (`:774`); ob die Form oder ein Tag entscheidet, misst keine Probe.",
          schlupfloch: "Ein Tag „axt“ am Werk: die Form-Mutation verlangt die Geometrie."
        },
        {
          name: "Der Bogen schießt ballistisch, der Pfeil bleibt",
          punkte: 0,
          staffel: "1 = Flugbahn folgt Abschuss-Tempo und Schwerkraft (±5 % gegen die Parabel) · 2 = der Pfeil steckt im getroffenen Ding und bleibt über den Reload, Zug-Kraft aus dem Bogen-Gesetz",
          messung: "werkbank eval: Abschuss unter drei Winkeln; Treffer-Ort gegen die Rechnung; Speicher-Rundlauf.",
          beleg: "`_heldBogenRecipe` (`stamm/kampf.js:750`); Flugbahn und steckender Pfeil ungemessen.",
          schlupfloch: "Ein Hitscan mit Pfeil-Bild besteht keinen Winkel: die Parabel."
        },
        {
          name: "Lebenswerte, Sturz, Tod und Wiederkehr als Zustand",
          punkte: 0,
          staffel: "1 = Fall-Schaden aus dem Aufprall-Tempo, Tod und Wiederkehr am Ort mit Zustand (Inventar, Bindung) über Speichern, an einem Gerät · 2 = Lebenswerte lesen Werk und Nahrung (Mutation), beide Geräte",
          messung: "Station halten: Sturz aus 3 Höhen, Tod durch Wolf, Wiederkehr; Zustands-Abdruck vor und nach.",
          beleg: "Lebenswerte = Zustand (`recomputePlayerStats`); Sturz und Wiederkehr als Spieler-Weg ungemessen. Furcht und Triumph zählt Ökologie K4.",
          schlupfloch: "Ein fester Schaden je Sturz besteht einen Fall: drei Höhen."
        }
      ],
      hebel: [
        { name: "Der Treffer aus Masse × Schneide × Tempo (Mutation schmiede-core)", k: ["halten.K1+1"], t: [1, 1], wurzel: "`stamm/kampf.js:_kampfKraft` (`:622`) liest Masse aus der EINEN Stoff-Zeile und Schneide aus schmiede-core; Bild-Station halten.", pflicht: "—", v1: true },
        { name: "Klang und Funken aus dem Stoff-Paar, das Ego-Bild des Hit-Stops, beide Geräte (die Latenz steht seit halten-latenz)", k: ["halten.K2+1"], t: [1, 1], wurzel: "Die Latenz hält seit 11774d4d (p95 30,5/36,0 ms, im Hörer 2,0/1,3 ms, Radeon; die Linse `werkbank latenz --verb hieb`); der Rest: `_kampfKlingenKontakt` (`stamm/kampf.js:464`) → `_substanzKlang` (`stamm/klang.js:454`) je Stoff-Paar mit Spektral-Abgriff (Stahl/Holz, Stahl/Stein, Holz/Fell), Funken aus dem Paar, das Hit-Stop-Bild in Ego, dieselbe Station an der GTX.", pflicht: "—", v1: true },
        { name: "Sturz, Tod und Wiederkehr", k: ["halten.K5+1"], t: [1, 1], wurzel: "Fall-Schaden aus dem Aufprall-Tempo im Kontakt-Löser; Wiederkehr über den Speicher-Zustand.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Nie als Bereich gerichtet: `stamm/kampf.js` trägt 2 051 Zeilen und ein Gate, das die Schwung-Physik am Chokepoint hält — die SYSTEMKARTE §6 nennt „Schmiede (Verb wield)“ als Domäne ohne Karte, und das Werk der Schmiede zählte nur als Masse und als Regler.",
        anders: "Das Halten vom Spieler aus richten: was er mit dem geschmiedeten Werk TUT (Treffer, Gefühl, Werkzeug, Bogen, Sturz), mit Mutation am Gesetzbuch."
      }
    },
    {
      key: "spielgang",
      titel: "Der gespielte Pfad — EINE Sitzung, erster Eindruck, Bedienung, Zugänglichkeit, Sprache",
      dom: "`scripts/diag-v1-pfad.cjs` (Stationen) · HUD/UI im Stamm · `docs/abnahme-drehbuch.md` · `docs/roadmap.md` §0.v1",
      v1: "v1 (die Ziellinie selbst)",
      aaaa: "Der v1-Pfad ist EIN gespielter Lauf: ankommen, laufen und sehen, in der Werkstatt bauen, mit der KI erschaffen, benutzen und teilen — in einer Sitzung, ohne Konsole, und jeder Schritt hält seine Zahl. Wer zum ersten Mal kommt, findet die Verben ohne Anleitung; das HUD antwortet in ≤ 200 ms und deckt ≤ 5 % des Bilds; Untertitel, Farb-Modus und Bewegungs-Komfort sind da; die Welt spricht Deutsch und Englisch. **Wo wir die Besten schlagen:** TLOU2 trägt über 60 Zugänglichkeits-Optionen, gebaut für ein Spiel; bei uns liest jede Option das EINE Gesetz (Untertitel aus dem Klang-Gesetz, Farb-Modus aus der Albedo-Tafel), und jede neue Gattung, jedes neue Studio ist ohne Zusatz zugänglich.",
      beste: [
        "**The Last of Us Part II** (Naughty Dog 2020): über 60 Zugänglichkeits-Optionen (Text-to-Speech, Kontrast-Modus, Navigationshilfe).",
        "**Portal** (Valve 2007): Lernen durch Raum — jede Kammer lehrt ein Verb ohne Text.",
        "**Celeste** (2018): der Assist-Modus macht das Spiel für jeden spielbar, ohne das Spiel zu ändern.",
        "**web.dev Core Web Vitals**: INP ≤ 200 ms als Maß der Antwort auf eine Eingabe."
      ],
      kriterien: [
        {
          name: "Die fünf Schritte in EINER Sitzung, jeder mit seiner Spieler-Zahl",
          punkte: 0,
          staffel: "1 = ≥ 3 von 5 Schritten in EINER Sitzung gemessen gehalten an einem Gerät · 2 = 5/5 an beiden Geräten, der Speicher-Rundlauf am Ende trägt alle Werke byte-gleich",
          messung: "Ein Lauf ohne Neuladen und ohne Konsole, aus aufgenommenen Spieler-Eingaben: ankommen (Ankunft K1) → laufen und sehen (A-Spiegel am Gang-Bild) → bauen (Bauen K1) → mit der KI erschaffen (KI K1) → benutzen (Bauen K5, Fahrzeug, Halten) → teilen (Tore K5). Jede Zahl wohnt in ihrem Bereich; hier zählt, dass sie in EINER Sitzung zusammen halten.",
          beleg: "Kein Lauf misst die Schritte zusammen; am main hält nur die KI-Grundstufe headless (V-k5, eine Negativ-Probe). Ankunft GTX kalt 15,25 s, A am Kopf 12/12 veraltet, ≤ 3 Klicks und Teilen ungemessen; das Drehbuch (18 Hand-Schritte) macht den Schöpfer zum ersten Messgerät und hat keinen Teilen-Schritt.",
          schlupfloch: "Jeden Schritt in einem eigenen Boot prüfen, wo der Zustand des vorigen fehlt, oder eine Konsolen-Abkürzung: EINE Sitzung aus Spieler-Eingaben, Speicher-Rundlauf am Ende.",
          aenderung: "Der Bau des Replay-Gangs (Synthese K1) ist Richter-Arbeit ohne Punkte (B62), die Spieler-Matrix ein Spiegel (B64), die Bildzeit Profiband K1 (B63), die KI-Station KI K1 (V29)."
        },
        {
          name: "Der erste Eindruck erklärt sich",
          punkte: 0,
          staffel: "1 = ein Blind-Spieler (frischer Agent, nur Bild und Eingabe, keine Doku) findet gehen, umsehen, Sicht-Wechsel, Werkstatt, Satz und Tor in ≤ 3 min — ≥ 4 von 6 — an einem Gerät · 2 = 6/6 bei 3 von 3 Blind-Spielern, beide Geräte",
          messung: "Blind-Lauf im echten Fenster (`werkbank start --echt`), gezählt am Eingabe- und Ereignis-Strom; Text am Schirm ≤ 1 Zeile je Verb.",
          beleg: "Die Abnahme ist eine Schöpfer-Runde von Hand (`docs/abnahme-drehbuch.md`, 18 Schritte); kein Blind-Lauf; ungemessen.",
          schlupfloch: "Ein Tutorial-Text, der jeden Schritt vorsagt: die Text-Menge am Schirm ist begrenzt; ein Agent mit Doku-Zugang ist nicht blind.",
          aenderung: "Neu (Fehlliste B: Onboarding)."
        },
        {
          name: "Bedienung: HUD und Menü antworten, ohne das Bild zu verdecken",
          punkte: 0,
          staffel: "1 = HUD und Menü antworten INP ≤ 200 ms und das HUD deckt ≤ 5 % des Bilds, an einem Gerät · 2 = Text ≥ 16 px bei 1080p, Tastenbelegung frei, beide Geräte",
          messung: "Event-Timing-API am echten Fenster über den Spielgang; HUD-Maske aus dem Ausgabe-Bild.",
          beleg: "Ungemessen: keine Linse misst die HUD-Antwort (INP) oder die Bild-Deckung; eine Tastenbelegung gibt es im Stamm (keybind|rebind 106 Treffer), gemessen wird sie nirgends.",
          schlupfloch: "Ein ausgeblendetes HUD deckt nichts und erklärt nichts: K2 in derselben Sitzung.",
          aenderung: "Neu (Fehlliste B: HUD und Bedienung)."
        },
        {
          name: "Zugänglichkeit aus dem Gesetz",
          punkte: 0,
          staffel: "1 = Untertitel für jede Stimme und jeden Ruf aus dem Klang-Gesetz ODER ein Farb-Modus (jede Klassen-Grenze unter Deuteranopie-Simulation ΔE ≥ 10) · 2 = beides und Bewegungs-Komfort (FOV, Kopfwackeln, Unschärfe aus)",
          messung: "Ruf-Ereignisse gegen Untertitel-Zeilen (100 %); Klassen-Masken unter Farbsehschwäche-Simulation des Ausgabe-Bilds.",
          beleg: "untertitel|subtitle und colorblind|farbseh|deuteranop haben 0 Treffer im Stamm; der Bewegungs-Komfort ist ungemessen.",
          schlupfloch: "Untertitel nur für Dialog, nicht für Rufe und Klang-Hinweise: die Ereignis-Liste ist die des Klang-Gesetzes.",
          aenderung: "Neu (Fehlliste B: Zugänglichkeit)."
        },
        {
          name: "Die Welt spricht die Sprache des Spielers",
          punkte: 0,
          staffel: "1 = jede UI-Zeile aus EINER Text-Quelle in DE und EN (0 harte Strings, Zählung), an einem Gerät umgeschaltet · 2 = die KI antwortet in der Sprache des Spielers (Korpus-Teil EN aus KI K1)",
          messung: "Zählung harter Strings über `window.__codeOf`; Schuss je Sprache.",
          beleg: "Ungemessen: keine Zählung harter Strings; i18n|locale hat im Stamm 18 Treffer, eine Sprach-Tafel für die UI ist nicht nachgewiesen.",
          schlupfloch: "Eine Übersetzung des Menüs allein: die Zählung umfasst HUD, Werkstatt, Chat-Antworten.",
          aenderung: "Neu (Fehlliste B: Sprache)."
        }
      ],
      hebel: [
        { name: "Onboarding aus dem Ort: der Verb-Hinweis steht am Ding, nicht im Text", k: ["spielgang.K2+1"], t: [1, 1], wurzel: "Hinweis-Schicht an Werkstatt, Tor und Chat (je EIN Satz, aus KIND_POLICY der Verben).", pflicht: "—", v1: true },
        { name: "HUD und Menü am INP-Maß", k: ["spielgang.K3+1"], t: [1, 1], wurzel: "UI-Schicht des Stamms; Event-Timing im Spielgang.", pflicht: "—", v1: true },
        { name: "Untertitel aus dem Klang-Gesetz, Farb-Modus aus der Albedo-Tafel", k: ["spielgang.K4+1"], t: [1.5, 1.5], wurzel: "`stamm/klang.js` Ereignisse → Untertitel-Zeile; Farb-Modus als Post-Abbildung über die Klassen-Grenzen.", pflicht: "—", v1: false },
        { name: "EINE Text-Quelle für DE und EN", k: ["spielgang.K5+1"], t: [1.5, 1.5], wurzel: "Text-Tafel statt harter Strings im Stamm.", pflicht: "—", v1: false }
      ],
      feststeck: {
        versucht: "Der Spielgang wurde zweimal gebaut (V1-Pfad-Linse 06.10., SG1 17./18.10.), seine Stationen liegen auf einem ungemergten Zweig (spielgang c5178e1b, 115 hinter main), und main prüft weiter Chokepoints auf dem Null-Renderer; der Schöpfer fand F1–F6 in 2 min Spiel, das Drehbuch macht ihn zum ersten Messgerät.",
        anders: "Einen Spieler AUFNEHMEN statt ihn zu imitieren (Richter H1): der deterministische Spieler-Schritt steht (`stamm/dirigent-takt.js:799`); dieser Bereich zählt dann nur, was der Spieler erlebt — die Sitzung, den ersten Eindruck, die Bedienung."
      }
    },
    {
      key: "ultiversum",
      titel: "Das Ultiversum — Welten als Gesetz, Fusion, Bibliothek, Vertrauen",
      dom: "`stamm/speicher-*.js` (fuseWorlds, Welten) · `stamm/feld-dsl.js` (Regeln, Whitelist) · `stamm/netz-*.js` (Signatur, Einladung) · `docs/das-lebendige-feld.md` §4.5",
      v1: "nach v1.0 (Feature-Stopp) — außer K5 (Sicherheit des Teilens)",
      aaaa: "Eine Welt ist ein Satz DSL-Bäume, deterministische Saaten und Spieler-Geschichte, mit eigenem Gesetz: Gelände-Funktion, Physik-Konstanten, Kreatur-Verhalten, Wetter, Himmel. Durch ein Tor betritt der Spieler eine Welt mit anderer Schwerkraft und anderem Himmel; zwei Welten heiraten (fuseWorlds) und mischen ihre Regeln, deterministisch auf jedem Gerät. Die Bibliothek trägt signierte Welten, Regeln und Baupläne von wenigen KB, auffindbar und forkbar — die Bibliothek von Alexandria, voll open source. Spieler schreiben Gesetze und teilen sie, und eine fremde Welt kann meine nicht töten. **Wo wir die Besten schlagen:** Roblox verbindet Asset-Pakete über Ladeschirme, Minecraft-Datapacks ändern Regeln EINER Engine; bei uns ist jede Welt eine Funktion aus Gesetz und Saat, die Bibliothek wiegt Kilobytes.",
      beste: [
        "**Roblox**: Millionen Spieler-Welten, verbunden über TeleportService, Teilen per Link — jede Welt ein Asset-Paket.",
        "**Minecraft** Datapacks und Mods: Regeln und Inhalte per Datei, getragen von Community-Bibliotheken.",
        "**Dreams** (Media Molecule 2020): jede Schöpfung im selben Renderer, remixbar, mit Herkunft je Element."
      ],
      kriterien: [
        {
          name: "Das Welt-Gesetz: Konstanten, die ein Leser liest",
          punkte: 0,
          staffel: "1 = zwei per Tor erreichbare Welten mit verschiedenen Konstanten (g, Wetter-Tafel, Himmel, Gelände-Parameter), jede Konstante hat einen Leser (Mutation ändert Bild bzw. Leib) · 2 = alle Kapitel des Gesetzes je Welt, beide Geräte",
          messung: "Welt-Tor (Tore K1) in eine Welt mit anderem g und Himmel; Sprung-Höhe und Himmels-Bild als Leser.",
          beleg: "Welten sind Saat + Edits + Regeln (state-of-realm §4); eine Konstante je Welt mit Leser ist ungemessen.",
          schlupfloch: "Eine Konstante im Speicher, die keiner liest: die Mutation ändert Bild bzw. Leib.",
          aenderung: "Neu (V06)."
        },
        {
          name: "Welten heiraten: Fusion deterministisch",
          punkte: 0,
          staffel: "1 = fuseWorlds(A, B) byte-gleich auf zwei Geräten · 2 = 0 Schreibe auf den frozen Kern, die gemischten Regeln werten nach Affekt K3",
          messung: "Fusion auf Radeon und OMEN mit gleichen Eingaben; Byte-Vergleich des Ergebnis-Stands.",
          beleg: "fuseWorlds (`stamm/speicher-laden.js:1239`, `_confirmWorldFusion` `:1145`); ungemessen.",
          schlupfloch: "Eine Fusion, die nur Namen mischt: der Byte-Vergleich der Regel-Programme.",
          aenderung: "Neu (V06)."
        },
        {
          name: "Die Bibliothek: signiert, klein, forkbar",
          punkte: 0,
          staffel: "1 = Welten, Regeln und Baupläne liegen signiert vor, je Gesetz ≤ 8 KB, auffindbar über einen Code · 2 = forkbar mit Herkunfts-Kette, offen lesbar",
          messung: "Größe je Eintrag, Signatur-Prüfung, Fork mit Herkunft.",
          beleg: "w3s-bibliothek 24b9ccaa: die Bibliothek ist EIN Verzeichnis über der EINEN Hülle des Teilens (`stamm/netz-identitaet.js` bibliothekLege · bibliothekFinde · bibliothekForke, Eingang `_bibliothekPruefe`, Signatur `_werkCode`), Eintrag = Gesetz (Bauplan-Programm, rule-Programm, Welt: Saat · Gelände · Wetter · Regeln · Akten aus der Stand-Tafel), Code = SHA-256 der Bytes; praegung-welt --bibliothek: Welt 1041 B, Regel 335 B, Bauplan 428 B, Mesh 17850 B ROT, Byte-Mutante ROT an der Signatur, Fork mit Kette [Welt, Fork]. Offen: die Feed-Karte und der Pull eines Codes über das Mesh.",
          schlupfloch: "Mesh-Bytes statt Gesetz in der Bibliothek: die Größe je Eintrag.",
          aenderung: "Neu (V06; Schöpfer: „die Bibliothek von Alexandria, voll open source“)."
        },
        {
          name: "Spieler schreiben Gesetze und teilen sie",
          punkte: 0,
          staffel: "1 = ein Spieler schreibt eine DSL-Regel im Spiel, sie wirkt und reist zum Mitspieler · 2 = ein Spieler-Gesetzbuch dockt über Studios K5 an",
          messung: "Spielgang: Regel im Spiel schreiben, Wirkung im Bild, Mitspieler sieht sie.",
          beleg: "Die DSL steht (70 Ops), Regeln reisen als dsl im Signaling; ein Schreib-Werkzeug für Spieler gibt es nicht.",
          schlupfloch: "Eine Regel aus einer Vorlage auswählen ist kein Schreiben: die Regel muss neu sein (Hash).",
          aenderung: "Neu (Fehlliste B: Modding und Open Source)."
        },
        {
          name: "Vertrauen: eine fremde Welt kann meine nicht töten",
          punkte: 0,
          staffel: "1 = eine geteilte Regel oder Welt mit verbotenen Ops wird beim Laden benannt abgewiesen (RULE_FORBIDDEN_EFFECT_OPS), 0 Schreibe auf den frozen Kern · 2 = ein Korpus aus Prompt-Injektionen in Bauplänen, Namen und Regeln lenkt die KI nicht (0 ausgeführte fremde Anweisungen), die Signatur-Prüfung schlägt bei Manipulation an",
          messung: "Whitelist-Probe beim Laden; Injektions-Korpus gegen den KI-Pfad; manipulierter Bauplan gegen verifyBlueprintSignature.",
          beleg: "RULE_FORBIDDEN_EFFECT_OPS (das-lebendige-feld §4.5), verifyBlueprintSignature; geprüft nur am eigenen Regel-Pfad, nie mit fremden Inhalten.",
          schlupfloch: "Nur eigene Inhalte testen: der Korpus ist feindlich geschrieben.",
          aenderung: "Neu (Fehlliste B: Vertrauen und Sicherheit)."
        }
      ],
      hebel: [
        { name: "Welt-Konstanten mit Leser", k: ["ultiversum.K1+1"], t: [2, 2], wurzel: "worldMeta trägt g, Himmel, Wetter-Tafel; Leib-Löser und Himmel lesen sie.", pflicht: "—", v1: false },
        { name: "Die Fusion auf zwei Geräten", k: ["ultiversum.K2+1"], t: [1.5, 1.5], wurzel: "`stamm/speicher-laden.js:1239` fuseWorlds deterministisch (Saat-Mischung, Regel-Merge ohne Wanduhr).", pflicht: "—", v1: false },
        { name: "Die Bibliothek", k: ["ultiversum.K3+1"], t: [3, 3], wurzel: "Signierte Einträge aus signBlueprint und world-bundle, Index über Codes.", pflicht: "—", v1: false },
        { name: "Regeln im Spiel schreiben und teilen", k: ["ultiversum.K4+1"], t: [2, 3], wurzel: "DSL-Editor als Werkstatt-Modus über `stamm/feld-dsl.js`.", pflicht: "—", v1: false },
      ],
      feststeck: {
        versucht: "Nie als Bereich gerichtet: fuseWorlds, Signaturen und Einladungen stehen als Mechanik; die Karte maß das Tor nur als Transit.",
        anders: "Nach v1.0 (state-of-realm: das Ultiversum „wächst erst nach v1.0 weiter“); jetzt nur die Sicherheit des Teilens, weil v1 teilt."
      }
    }
  ]
};
