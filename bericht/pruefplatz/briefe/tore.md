Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 11 (Byte-Beweis, Re-Mint als Vertrags-Akt), 18, 19, 21 und 23. Der Plan steht in koordination
`bericht/pruefplatz/plan.md` (§2, §3 Slot-Tafel, §4, §5). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht der
Koordinator.

# TORE — zehn Tore auf Studio-Niveau, jede Membran bunt in L1 und L2 zu jeder Uhr, die drei Teile-Tore werden porta-Gestalten (Welle b)

**Pflicht-OFFEN:**
- A: tor-fern, tor-bunt und tor-ziel nah an S1L/S1M (L1, 10,6 m vor T10/T1) und fern an S3 (L2, 37,4 m).
- Heute ROT: Membran-Buntheit C*ab in L1 18,64 Mittag und 10,61 Nacht (a-spawn-gtx3), in L2 12,6 und nachts 2,6 (a-spawn-gtx2); Soll ≥ 20.

**Chokepoint:** porta-core, das Gesetzbuch der Tore. Die Stufen stehen in porta-core.js:86-89 (L1 ab 9,5 m, L2 ab 12 m, hyst 0,1;
L3 NUR-WURF), die Palette in `membranPalette`.

**Was stirbt:**
- die drei Teile-Tore als offene Primitive (bau-vorlagen.js: Lyra :677, Vitruv :726, Tier-Tor :761); ihre Teile bleiben nur als
  unsichtbare Substanz, wie bei `welt_portal`;
- die drei Tore ohne Membran (siedlung-ort.js:643).

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `teile-tore-third.png`: Vitruv ist ein grauer Quarz-Torus zwischen zwei Holzpfosten, Lyra ein Holzrahmen mit 3 Saiten.
- `spawn-third-alt.png`: das Tier-Tor aus Holzbeinen mit Balken und Kopf-Kugel.
- `genesis-ego-tore.png`: das Niveau der sieben — Quader mit Fuge, Gitter-Filigran, eine Membran mit dem Panorama des Ziels.

**Ziel-Bild:** Die drei werden porta-Gestalten auf dem Niveau der sieben, mit dem Motiv ihres Studios:
- Lyra-Tor (klang): Joch und Arme der Leier bilden den Bogen, die Saiten sind Licht-Fäden.
- Vitruv-Tor (koerperstudio): Kreis und Quadrat in Bronze, der Mensch als Relief im Scheitel.
- Tier-Tor (tetrapoda): ein Bogen aus Geweih und Knochen.

Jedes trägt eine Membran mit seinem Ziel-Panorama (`worlds/tor-ziele.json`).

**Wo sie stehen:** Die Slot-Tafel des Plans setzt sie auf k 5–7 (Süden), außerhalb der Bildwinkel von S1 (Ankunft) und S2 (Messort E).

**Vorbild:** die Bilder in Peach's Castle (Mario 64): das Tor zeigt, wohin es führt.

## Bauen (porta-core additiv; die sieben bleiben byte-gleich)

1. Die drei Gestalten in PRESETS und den Stufen L0–L3 wie die sieben, Saat statt Zufall. Labor = Welt: worlds/portale/porta.js zeigt sie
   aus demselben Kern.
2. bau-vorlagen.js: `welt_klang`, `welt_koerperstudio` und `welt_tetrapoda` tragen `studioGestalt` (wie `welt_portal`, ab :1279); ihre
   Teile bleiben unsichtbare Substanz (Tags, Blocker, Auslöser).
3. Die Membran ist bunt in L1 und L2 und zu jeder Uhr:
   - nachts nach dem EINEN Licht-Gesetz (`kelvin`, EIN Pool), ohne Sonderweg;
   - Soll C*ab ≥ 20, milchweiß ≤ 0,05 — für alle zehn Tore.
4. **Übergabe an mess:** die drei Gestalt-Namen für den Tor-Ausdruck der Soll-Tafel (heute 7 Gestalten).

## Budget (porta's eigene Bänder, porta-core.js:86-89 — kein zweites Buch)

| Stufe | Dreiecke | Befehle |
|---|---|---|
| L0 | ≤ 76 000 (Band 60 000) | 9 |
| L1 | ≤ 34 000 | 6 |
| L2 | ≤ 12 500 (Band 6 000) | 6 |
| L3 NUR-WURF | ≤ 12 000 | 1 |

- VRAM ≤ +0,5 MB für die drei neuen Gestalten.
- Die Tore am Kern misst der Spike S0 des Koordinators (L2 im Bild plus L3-Wurf je Tor in den Kaskaden); seine Zahl steht danach als
  `soll` im Messort genesis.

## Dateien (Besitz)

- porta-core.js
- worlds/portale/porta.js
- stamm/bau-vorlagen.js: nur `welt_klang`, `welt_koerperstudio`, `welt_tetrapoda` und ihre Teile-Listen (:677–:800). Nach deiner Landung
  gehört die Datei ort-wirt (`start_plattform`).
- **NICHT anfassen:** siedlung-ort.js (ort-wirt), fachwerk-core.js (ort-gesetz), soll-tafel.json (mess).

## Wartet auf

- w4-studios-heim im main (porta-core.js, porta.js).
- Starte vom Kopf von integ-probe; merge main, bevor du meldest.

## Beweis (headless, Zahlen vorher → nachher)

- porta-contract: Dreiecke und Befehle je Stufe der drei, in den Bändern oben.
- Golden der sieben byte-gleich. Ein Re-Mint nur der drei neuen Gestalten ist ein Vertrags-Akt mit Grund.
- C*ab und milchweiß der Membran je Stufe (L1, L2) und Uhr (0,5 / 0,3 / 0), gerechnet aus `membranPalette` und `membranUniforms` im
  Labor-Rechner, ohne Welt-Bild.
- gate:portal-konformanz: jede der zehn Welten ist durch ihr Tor erreichbar.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon, Standard-Welt, nach dem Plan; vorher am alten Ring):
- S1L: Kamera 6,16/9,59 → T10 in 10,6 m (das sichere L1-Band 10,45–10,8 m aus porta-core.js:87-88).
- S1M: Kamera −6,16/9,59 → T1.
- S3: 0/−17 → 0/22 (L2, 37,4 m).
- Je Pose `--uhr 0.5|0.3|0` und `--ist tor-bunt|tor-fern|tor-ziel`, in Ego und Third.

**Tor:**
- tor-bunt, tor-fern und tor-ziel GRÜN in Ego und Third, nah (L1) und fern (L2), zu 0,5 / 0,3 / 0.
- ABAB g-third nicht langsamer (OMEN).

## Abgabe

- Zweig: w4-tore-teile. Commit-Betreff: „Abgabe w4-tore-teile: …“.
- Bericht in drei Sätzen, die Liste der GPU-Proben mit Pose und Erwartung und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **genesis-tore** (4ec9f71d) ist dein Vorbild: Ring-Tore L2 → L1 7/7, Stein mit Gesetz, ABAB nicht langsamer.
- **mensch-kopf** riss z107: ein Ofen, der eine Gestalt fail-closed nicht liefert, hält die Welt an. Jede Stufe liefert; `playtest:fast`
  am Kandidaten.
- **Plan Fassung 1** setzte L2 ≤ 1 500 Dreiecke, ein Viertel des porta-eigenen Bands. Es gilt das Band des Gesetzbuchs.

## REGELN (Baustein des Koordinators)

- Eigener Worktree unter %TEMP%/claude/w3/<name>/ (nie im Haupt-Klon, nie in fremden Worktrees); node_modules per Junction auf den Haupt-Klon.
- Fetch-Falle: `git fetch origin "+refs/heads/X:refs/remotes/origin/X"`.
- GPU nur über `artifacts/profiband/werkzeug/gpu-lauf.sh`, je Aufruf ≤ 2 min; NIE eine Serie, ein ABAB oder eine ganze Sitzung lokal —
  die GTX der OMEN misst groß. Der echt-Job jedes Zuges teilt das Schloss: wer es lange hält, hält den Zug auf. headless braucht kein Schloss.
- Werkbank-Ports: 4690–4699 gehören dem echt-Job des Radeon-Läufers (sein Hook beendet dort jeden fremden Hörer beim Job-Start); nimm den Port, den der Brief nennt.
- Werkbank: die Welt steht zwischen Befehlen (`window.__loop(true)` nur fürs Warten, danach `__loop(false)`); Pfade an node als Windows-Pfad.
- Beende nur Prozesse, deren PID du selbst gestartet hast — nie nach Name, Muster oder „Elternprozess fehlt“.
- Sichtbares beweist ein Bild vorher/nachher (Pfad im Bericht).
- Commit-Autor: `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit`; Betreff „Abgabe <zweig>: …“.
- Verbotene Wörter in Commit-Nachrichten: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Nie `git stash`.
- Auf Zweigen läuft nur der Puls der CI — warte nie auf die volle Batterie.
- Bericht in drei Sätzen: geschnitten (Datei:Zeile), gemessen (Zahl vorher → nachher), ehrlich offen.
- CLOUD: eine Cloud-Sitzung hat keine GPU — swiftshader baut jede Pipeline synchron (42–292 s je Programm, ein Kopf-Bild 16 min). Sie liefert
  Code + headless Beweis (Zähler, Byte-Diff, Faden-ms, Selbsttest der Linse) und schießt KEINE Welt-Bilder zum Beweis; die Bilder macht der
  Koordinator auf der Radeon (warme Welt, ~3 min) und der GTX (OMEN-Station).
