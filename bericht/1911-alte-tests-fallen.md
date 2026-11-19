# Abgabe 2 — alte-tests-fallen

Kopf: `1d36d131939043853e8f130f099395ed4cea5d85` auf origin (`git ls-remote origin refs/heads/alte-tests-fallen`). Er steht auf 603e26a7 (Zweig altlast-in-die-karte), ein Commit. Ich habe nicht gestempelt und keine Vorprüfung gesetzt.

## Geschnitten (je Zeile ganz, samt AUSNAHMEN · ci-zeiten · tor-klassen · Kommentaren)

- **a3** `gate:fenster-wechsel`: den check.yml-Schritt „Fenster-Wand auf der Karte“, den Alias, `scripts/diag-fenster-wechsel.cjs` und die ci-zeiten-Zeile entfernt. Die Kommentare in stamm (dirigent-kern, wasser-hydro, studio-bruecke) und in schirm-proben nennen sie nicht mehr. WACKEL_RE steht außerhalb des Zweigs. Die Kopie ohne „Fenster-Wand|“ liegt unter `…\scratchpad\altlast\zug.cjs` (Basis koordination b11dd664 `zug/dienst/werkzeug/zug.cjs`, Diff genau Zeile 160, `node --check` ok). Die installierte Datei `artifacts/profiband/werkzeug/zug.cjs` ist byte-gleich mit der Basis und bleibt unberührt.
- **a5/a6**: die zwei Schritte mit continue-on-error (innerHTML, TODO/FIXME) und ihre ci-zeiten-Zeilen entfernt.
- **a12/b4** `gate:arch-feld`: das Skript, den Alias, den FRIST-Eintrag in AUSNAHMEN und den check.yml-Kommentar entfernt; dazu 9 Kommentar-Nennungen in stamm. SKILL Lehre 16 nennt jetzt die Werkbank `--echt`.
- **a13** H7/H8 aus `diag-studio-huelle` entfernt: sitzungsGang, Griff-Zeit, SCHRANKE, Neuladen, zeileUrteil-Urteil, `?bank=12` und 10 Selbsttest-Fälle. Es bleiben der Baum H1–H5/H9/H11/H12 in check:statik und der Gang `--engine` mit H3/H4/H6/H10. Der Fall H10 steht als eigener Selbsttest-Fall. `zeileUrteil` bleibt in `worlds/huelle/huelle.js` als UI der Kosten-Leiste. Der AUSNAHMEN-Eintrag `gate:studio-huelle` wechselt von ROT (Grund war H7/H8) auf FRIST. Grund: Fällt er ganz, ist die (W) von gate:ci-deckung rot, denn der Gang braucht die Karte.
- **a22**: die zwei `mass("ZEIT")` in diag-praegung-welt und ihre Uhr-Variablen (uhr, msA, msW, res.steht) sowie die tor-klassen-Zeile entfernt.
- **b2/b3**: `smoke-webrtc` und `smoke-copresence` samt Aliasen entfernt, ebenso die Prüfung „Zwei-Seiten-Smokes“ in diag-reconnect D. Mit ihnen fiel `zweiImMesh` aus welt-boot (nur sie riefen ihn, 41 Zeilen). Die Kommentare in netz-p2p/netz-portal/diag-mp-sync nennen jetzt den Connected-Trip von erleben.spieler.gemeinsam S 1.
- **b8**: den Alias `stamm:selbsttest` entfernt.
- **c3**: den STAND-curl der alten `meisterkarte-quelle/punkte/stand.json` in gpu-probe.yml entfernt. Dazu fiel in `scripts/lib/urteil-zeile.cjs` alles, was nur ihm diente: mainStation, STATION_RE, GERAET, ABSTURZ, `--stand`/`--geraet`. Das war kein toter Zwilling mehr; jede ROTE Zeile reißt jetzt, BEKANNT heißt nur die Ratsche des Messorts. gate:apparat Klinge 9 hat neue Fälle (laub-kante und pop urteilen ROT), einen neuen Regex für den Aufruf und als Mutante „die ROTE Zeile einer Station gilt als bekannt“.

## Gemessen

- scripts/: 220 Dateien / 220 581 Zeilen → **216 / 218 608** (−1 973; Diff scripts +56 −2 029).
- Absenz-Grep (git grep, ohne vendor) je Name = **0**: gate:fenster-wechsel · diag-fenster-wechsel · Fenster-Wand · gate:arch-feld · diag-arch-feld · smoke-webrtc · smoke-copresence · smoke:webrtc · smoke:copresence · stamm:selbsttest · zweiImMesh · sitzungsGang · innerHTML-Schreibzugriffe · TODO/FIXME-Übersicht · „ZEIT: Klick bis Code“ · „KONTROLLE ≤ 5 s“ · punkte/stand.json · mainStation · STAND_PROBE.
- `check:statik` **Exit 0**. Das Log liegt unter `…\scratchpad\altlast\statik-2.log`; sein einziges ❌ ist die Selbsttest-Mutante von Klinge 9, die als ✅ gemeldet wird.
- `gate:ci-deckung` Selbsttest GRÜN und Lauf **GRÜN**: 219 Wände, 209 in der CI, 10 Ausnahmen (vorher 11), 0 ohne Workflow.
- `gate:betriebsgesetz` **GRÜN** am Kopf; der Siegel-Grep der Commit-Message ergibt 0.
- `gate:apparat` GRÜN samt Selbsttest („alle neun Klingen feuern“). `diag-reconnect` GRÜN. `diag-studio-huelle --selftest` und der Baum GRÜN.
- Byte-Beweis (`stamm.ohneKommentare` HEAD gegen Baum): **11 von 22** berührten Code-Dateien sind ohne Kommentare byte-gleich. Das sind die 7 stamm-Dateien, schirm-proben, netz-p2p, netz-portal und diag-mp-sync. Die 7 übrigen geänderten und die 4 gelöschten Dateien sind genau die Schnitte oben. ESLint über die 7 stamm-Dateien: 0.

## Offen (ehrlich)

- Zwei alte Stationen in punkte-maschine lasen Gefallenes. Beide stehen nicht in der Richter-Tafel der Karte 2:
  - `tore.K5#1` (g5.js ~5862/6649) verlangt die ZEIT-Zeile der Prägung und meldet jetzt „Zeile fehlt: Zeit“.
  - `studios.K2#2`/`K3#2` (g4.js ~533–562) lesen `GRIFFE` und H8.
  Beide fallen in punkte-maschine mit; das habe ich nicht gemacht (anderer Zweig).
- Ohne gebuchten Stand reißt jede GPU-Probe an einer ROTEN Station-Zeile: laub-kante lod.K1#1, pop lod.K2#1 und tag-achse:bahn stehen dann ROT statt BEKANNT. Das ist die gewollte Folge von c3. Die Besitzer dieser Linsen stehen in besitzer.md.
- `werkbank abdruck` habe ich nicht gefahren: keine GPU, kein Welt-Boot. Der Beleg „außerhalb byte-gleich“ ist der Kommentar-Byte-Beweis oben.
- In den Arbeitsbaum ist ein Junction `node_modules` → Haupt-Klon gesetzt (gitignored), damit ESLint läuft. Kein npm ci.
- Die Besitzer-Zeilen (a2/a14, a4, a7, a10, a11, a15–a17, b5) stehen in `…\scratchpad\altlast\besitzer.md`. Befund zu b5: k2-planet.js führt die Zahlen von diag-planet ausdrücklich als Attrappe; kein Ruf gehört in eine Station.

Karte 2: 35 von 1 718 (Stand-Datei)
