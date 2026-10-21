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
          beleg: "Ungemessen; die Mechanik steht: signBlueprint (`stamm/netz-identitaet.js:546`, gerufen `werkstatt-bauen.js:1799`), makeInvitationCode (`netz-p2p.js:60`, gerufen `werkstatt-sozial.js:238`), world-bundle-Pull (`netz-p2p.js:911`); v1-Schritt 5 „als Bauplan teilen“ hat im Drehbuch (`docs/abnahme-drehbuch.md`, 18 Schritte) keinen Schritt.",
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
          staffel: "1 = auf der festen 2-km-Route entlang Weg und Feldweg (Wiese → Wald → Dorf) 0 Steckenbleiber und ≥ 80 % der Takte über 0,8 × vmax, an einem Gerät · 2 = auch 25°-Hang und Furt, Ego und Third, beide Geräte",
          messung: "Spielgang-Station fahrt: das Fahrer-Skript folgt dem Wegenetz des Gesetzes, nie querfeldein; gezählt aus der Fahr-Telemetrie. Lücken und Tempo-Decke zählen Streaming K1, das Band Profiband K1.",
          beleg: "Im Bündel-ABAB vom 20.10. (GTX) fuhr nur etwa die Hälfte der Takte voll schnell (Anteil 8–12 m/s 0,49–0,53), der Wagen blieb im Wald hängen, der Fahrer setzte zurück (`bericht/2010-buendel-abab.md`); eine Route auf dem Wegenetz fuhr niemand.",
          schlupfloch: "Eine Route über die leere Ebene besteht immer: die feste Route führt durch Wald und Dorf auf Wegen, die das Gesetz legt.",
          aenderung: "Neu: „Tempo mit Welt“ zählte doppelt mit Streaming und Profi-Band (V26, V27); hier bleibt, was nur der Fahrer erlebt."
        },
        {
          name: "Die Kamera atmet das Tempo — EIN Rig aus dem Kern",
          punkte: 1,
          staffel: "1 = FOV (+≥ 8°) und Arm (+≥ 15 %) aus v/vmax in Garage UND Welt gemessen · 2 = dazu Azimut auf dem Fahrtvektor im Drift (Fehler ≤ 15°), Maus-Orbit mit Rückkehr nach 1–1,5 s, seitlicher Ruck p95 ≤ 0,02 m je Bild, EIN FOV-Schreiber",
          messung: "Garage G7 + gate:fahr-leben (Familie kamera), Welt und Garage; der Leser-Grep über `window.__codeOf` zählt die FOV-Schreiber.",
          beleg: "Seit kamera-tempo (Merge fac65067, main 57a9f2ab) trägt der Kern das Tempo: FAHR.kamera fovV/distV/tempoEase/driftFolge/rueckS (additiv, vehicle-contract byte-gleich), chaseKamera(c, g, s, dt, K, z, vmax) mit chaseGreif für Garage und Welt, `_kamFov` der EINE FOV-Schreiber. Gemessen am Kopf 57a9f2ab an der Radeon: WELT (werkbank --echt, Ausgabe-Pfad 1920×1080, Third, der GT auf freier Bahn bei −160/−1046, Vollgas): Ruhe FOV 75° · Arm 9,89 m → bei 15,09 m/s (0,94 vmax 16,0) FOV 84,40° (+9,4°) · Arm 11,69 m (+18,2 %); GARAGE (gate:garage-labor G7 + Messung bei vmax, r184 WebGPU): Ruhe 34° · 9,89 m → bei 15,21 m/s (0,95 vmax) 43,07° (+9,1°) · 11,68 m (+18,1 %), camera.fov = Ruhe + Tempo (zeigt 0), Orbit 25°, Rückkehr 1,06 s. gate:fahr-leben (Null-Renderer, echter `_gameLoopTick`): T5 Kern fovMax +10°, Arm +0,2, Drift 9°, Knick 0,08, Ritt fov bei 10 m/s +4,78°, zeigt 0,005°, Orbit 69°, Rückkehr 1,08 s, Schreiber [`_kamFov`]; T4 Ruck p95 0,016 m, FOV-Sprung beim Sicht-Wechsel 0,41° je Bild. Alles im Soll der 2 — es fehlt das zweite Gerät (M27). Ein erster Welt-Lauf an der Mess-Wiese fuhr bei 13,4 m/s in den Wald (+7,6° · +14,9 %, verworfen: keine freie Bahn). Roh: koordination `bericht/2110-mk-kopf/tempo-welt-*`, `garage-mk.log`, `fahr-leben.log`.",
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
        { name: "Reifen mit Spitze, μ aus der EINEN Stoff-Zeile, 240 Hz in 4 Unter-Schritten (nach Stoffe H1)", k: ["fahrzeug.K1+2"], t: [1.5, 2], wurzel: "`vehicle-core.js:fahrKraefte` (`:2863`, Seitenkraft `:2913-2914`) → D·sin(C·atan(B·α)); fahrSchritt (`:3003/:3015`) mit e.mu aus der Stoff-Zeile unter `_bodenSichtAt` × der EINEN Nässe; `stamm/koerper-bewegung.js` FIXED_DT `:2108`; Golden-Re-Mint als Vertrags-Akt (Lehre 11).", pflicht: "—", v1: true },
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
          punkte: 0,
          staffel: "1 = der Spieler geht durch die Tür bis Keller und Dachboden ohne Vertikal-Sprung > 0,3 m in einem Frame (Anti-Clip-Hub = ROT), an einem Haus · 2 = jedes Haus des Start-Dorfs, Innenraum lesbar (Luma ≥ 15 % des Außen-Schattens, Schatten K4), beide Geräte",
          messung: "Spielgang-Station haus: Tür öffnen, Treppe, Keller (kellerY −2,40 m), Dachboden, Ego und Third, mittags und nachts.",
          beleg: "Das Gesetz trägt die Form: Treppen-Norm, Herd, Möbel (fachwerk-core), Türen 16/16, Sockel 0 m (K10, PFLICHT C fiel am 15.10.). Seit main f2904a72 (S4 grund-datum) ist der Keller hohl, und der Leib geht per W-Taste die Keller-Treppe hinab: gate:haus-welt W9 Keller-Fuß −2,28 m in 6/6 (Null-Renderer, Mechanik). Die 1 fehlt: der Dachboden, der Vertikal-Sprung je Frame und die Tür sind ungemessen, der Anti-Clip steht weiter (`stamm/koerper-bewegung.js:868`).",
          schlupfloch: "Den Keller zählen statt zu begehen: die Station geht hinein; Labor und Welt durch ein abgedunkeltes Labor anzugleichen: die Albedo zählt Material K1 absolut.",
          aenderung: "Die 1 der Synthese stand auf Gesetz-Merkmalen, während die Klasse haus am Kopf kein Ist trägt (B60) → 0; Labor = Welt zählt Studios K4, der Ton Material K3 (V16, V22)."
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
          beleg: "Der Export wächst linear mit ≈ 35 ms je Haus (am Kopf in Node gemessen: nH 12 → 0,45 s, nH 120 → 4,4 s, nH 300 → 10,0 s), weil massBau je Haus VOR dem Layout läuft (`fachwerk-core.js:5388-5392`).",
          schlupfloch: "Ein schneller Platzhalter-Würfel als erstes Haus ist fail-soft: der Bau-Hash der Studio-L-Kette im Bild.",
          aenderung: "Die Last der Stadt zählt Profiband K1 (Messort stadt; V26), die Bewohner zählen Menschen."
        }
      ],
      hebel: [
        { name: "Export mit Rang: Plan und Grundrisse sofort, massBau je Haus über die Foundry-Schlange nah zuerst", k: ["siedlung.K5+1"], t: [0.5, 1], wurzel: "`fachwerk-core.js:exportSettlement` (`:5377-5392`: ext aus FOOTPRINT statt massBau) + `stamm/siedlung-ort.js:spawnSettlement` (`:1779`) über `stamm/studio-bruecke.js:_foundryAuftrag`.", pflicht: "B (das Start-Dorf liegt im Kalt-Pfad)", v1: true },
        { name: "Das Stadt-Tor: EPOCHEN.groesse wird nZiel, SIEDLUNG mit Rang-Größe-Verteilung, mauer und graph reisen im Export, vier Klemmen werden EINE", k: ["siedlung.K2+2"], t: [1, 1.5], wurzel: "`fachwerk-core.js` EPOCHEN (`:2806-2814`) · SIEDLUNG (`:2844`) · exportSettlement (`:5452ff`) · ortPlan (`:5551`) + `stamm/siedlung-ort.js` Klemmen (`:1786`, `:1814`, `:1935`, `:2232`); Golden-Re-Mint siedlung.json als Vertrags-Akt.", pflicht: "—", v1: false },
        { name: "Die Trasse liest das Gelände: dorfLayout bekommt hoeheAt", k: ["siedlung.K3+2"], t: [1.5, 2], wurzel: "`fachwerk-core.js:dorfLayout` (`:3043`) mit ctx.hoeheAt aus gelaende-core; EIN Grundriss-Leser.", pflicht: "—", v1: false },
        { name: "Das Haus von innen als Station: Tür → Treppe → Keller → Dachboden, der Anti-Clip fällt (der Keller ist seit S4 hohl)", k: ["siedlung.K1+1"], t: [1, 1.5], wurzel: "`stamm/koerper-bewegung.js` Anti-Clip (`:868`) + der Dachboden-Zugang im fachwerk-Plan; der Keller-Gang von W9 (`scripts/diag-haus-welt.cjs`) wird die Station haus mit Sprung-Wand je Frame; geteilt mit Bauen H2.", pflicht: "—", v1: true },
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
          punkte: 0,
          staffel: "1 = Taste → bewegter Leib im Ausgabe-Bild p95 ≤ 50 ms an einem Gerät (gehen, Sicht-Wechsel) · 2 = jedes Verb (gehen, springen, schwingen, einsteigen), beide Geräte",
          messung: "Spielgang-Station leib: Eingabe-Ereignis (CDP) bis zum ersten Ausgabe-Bild mit Bewegung im Leib-Band, je 50 Proben, Ego und Third.",
          beleg: "Bewegung ist nie am Render-Signal (Lehre 13), FIXED_DT 1/60 (`stamm/koerper-bewegung.js:2108`); die Latenz bis zum Pixel misst niemand.",
          schlupfloch: "Taste bis Sim-Schritt wäre die Eigenmeldung: gezählt wird bis zum Pixel (das Maß von LDAT).",
          aenderung: "Neu (V02)."
        },
        {
          name: "Der Fuß steht: Hang, Stufe, Sprung aus dem Leib-Gesetz",
          punkte: 0,
          staffel: "1 = Fuß p95 ≤ 3 cm am 25°-Hang und auf Stufen, 0 Steckenbleiber auf dem Spielgang, an einem Gerät · 2 = dazu Sprung-Höhe und -Weite aus dem Leib-Gesetz (Mutation von Leib-Masse/Kraft zieht sie), Ego und Third, beide Geräte",
          messung: "werkbank eval + bild: Fuß gegen das gezeichnete Mesh (`_bodenSichtAt`) an 200 Kontakten, Gang über Hang und Treppe.",
          beleg: "Seit boden-rolle (Merge c393726c) steht der Schuh flach auf dem Fuß (Ofen-Akt, 2/460 Klassen), die Leib-Sohle auf der Kapsel-Sohle (`PLAYER_FOOT_OFFSET`), die Sohle kippt mit dem Boden (`_gaitSohlenKipp`). Gemessen am Kopf 57a9f2ab an der Radeon (gate:koerper-stand K8, der tiefste gezeichnete Schuh-Vertex im Fuß-Lock des Gangs gegen `__gezeichnet`, 200 Kontakte) in drei Läufen (Standard/Ego/Third): 25°-Hang 3,1/2,8/2,9 cm, Mess-Wiese 3,4/3,2/3,2 cm — am Hang auf der Grenze und ±0,3 cm je Lauf (soleH misst die Pose des ersten Takts), Stufen und der Spielgang ungemessen: ROT. Täter beim Namen (befund boden-rolle): der starre Fuß rollt über den Ballen, die Schuh-Spitze taucht im Abrollen 3–5,7 cm ein — es fehlt das Zehen-Gelenk. Roh: koordination `bericht/2110-mk-kopf/k8-*.log`.",
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
          punkte: 0,
          staffel: "1 = Third nie im Fels oder in der Wand (0 Fels-Pixel im Nahbereich der Kamera), Ruck ≤ 0,02 m p95 beim Gehen, an einem Gerät · 2 = auch am Steilhang, im Haus, beim Sprint, beide Geräte",
          messung: "Spielgang über Hang, Gasse und Haus in Third; Pixel-Probe auf Fels/Wand vor der Kamera, Ruck aus der Kamera-Bahn.",
          beleg: "Kamera = EINE Kugel; der Kontakt-Löser trägt PM_ClipVelocity (`stamm/koerper-bewegung.js:238-325`); die Bild-Probe (Kamera im Fels) gibt es nicht.",
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
        { name: "Gamepad analog für jedes Verb", k: ["leib.K5+2"], t: [1.5, 1.5], wurzel: "Eingabe-Schicht in `stamm/koerper-bewegung.js` (Tastatur und Achsen über EINE Verb-Tafel), Rumble aus dem Fahr- und Treffer-Zustand.", pflicht: "—", v1: true }
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
          punkte: 0,
          staffel: "1 = Eingabe → erstes Schwung-Bild ≤ 50 ms und Hit-Stop sichtbar im Ausgabe-Bild an einem Gerät · 2 = Klang und Funken aus dem Stoff-Paar (Spektrum je Paar verschieden), Ego und Third, beide Geräte",
          messung: "Station halten: CDP-Eingabe bis zum ersten Bild mit Schwung-Pose; Klang-Abgriff je Stoff-Paar (Stahl/Holz, Stahl/Stein, Holz/Fell).",
          beleg: "Hit-Stop und Kamera-Impuls existieren (gate:kampf-gefuehl B/C); Latenz bis zum Bild und Stoff-Paar-Klang sind ungemessen.",
          schlupfloch: "Ein Treffer-Klang je Waffe statt je Paar: das Spektrum muss mit dem getroffenen Stoff wechseln."
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
        { name: "Die Gefühl-Station und der Klang des Stoff-Paars", k: ["halten.K2+1"], t: [1, 1], wurzel: "`_kampfKlingenKontakt` (`stamm/kampf.js:464`) → `_substanzKlang` (`stamm/klang.js:455`) je Stoff-Paar; Funken aus dem Paar.", pflicht: "—", v1: true },
        { name: "Das Werkzeug nach der Form", k: ["halten.K3+1"], t: [1, 1], wurzel: "`_geraetGraebt` (`stamm/kampf.js:807`) und Fällen/Ernten lesen die Affordanz aus der Geometrie (`stamm/bau-teile.js:202-450`) statt eines Werkzeug-Namens.", pflicht: "—", v1: true },
        { name: "Der ballistische Bogen", k: ["halten.K4+2"], t: [1.5, 1.5], wurzel: "`_heldBogenRecipe` (`stamm/kampf.js:750`): Abschuss aus der Zug-Kraft, Bahn im Fix-Takt, Pfeil als Welt-Zustand.", pflicht: "—", v1: false },
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
          beleg: "signBlueprint (`stamm/netz-identitaet.js:546`), world-bundle-Pull (`netz-p2p.js:911`); eine Bibliothek gibt es nicht.",
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
        { name: "Vertrauens-Korpus und Whitelist-Probe", k: ["ultiversum.K5+2"], t: [1.5, 1.5], wurzel: "Lade-Pfad geteilter Regeln und Baupläne (`stamm/feld-dsl.js`, `stamm/netz-identitaet.js`), Injektions-Korpus in spec gegen maybeAnswerWithLlm.", pflicht: "— (Sicherheit des Teilens, v1-Schritt 5)", v1: true }
      ],
      feststeck: {
        versucht: "Nie als Bereich gerichtet: fuseWorlds, Signaturen und Einladungen stehen als Mechanik; die Karte maß das Tor nur als Transit.",
        anders: "Nach v1.0 (state-of-realm: das Ultiversum „wächst erst nach v1.0 weiter“); jetzt nur die Sicherheit des Teilens, weil v1 teilt."
      }
    }
  ]
};
