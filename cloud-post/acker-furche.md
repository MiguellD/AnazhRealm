# acker-furche — Übergabe (WIP, 23.11.)

Zweig `acker-furche` · Karte 2: 58 von 1 718 (diese Arbeit hat keine Sprosse gebucht) · ZWISCHENSTAND

## Geschnitten
- Die Prismen `siedlung-acker` und die Feld-Halme `siedlung-frucht` sind vom Acker gefallen (Vorprüfung 2). Die Furche ist jetzt Relief des Bodens aus EINEM Gesetz (phyto-core `furcheImAcker` · `ACKER_FURCHE` · `ackerStand`); Normale und Ton entstehen im Boden-Stoff (`_ackerFurche`, stamm/siedlung-wege.js), am Rand bleibt der Rain.
- Weg T (Arbeitsbaum, noch ohne Probe): die Richtung quer zu den Furchen trägt die Wege-Karte (RGBA, Kanäle B/A, `WEGE_KARTE.belag.furche`). Die Uniform-Rahmen `_ackerRahmenU` sind gefallen; der Stand liegt in `_ackerStandU`, sein Takt ist `_ackerKoerperTakt`. Die Hand malt ihre Richtung selbst (`_ackerStueckeMalen`).
- Die Frucht (Weizen) ist ein Stempel des Gras-Gesetzes; ihre Reihen stehen auf den Welt-Kämmen q = k·0,3 m (`_ackerFruchtStuecke`), das Jahr kommt aus `fruchtImJahr`.

## Gemessen
- flur#1 vorher (main 5b36f69a): 1 Acker im Bild, 0,73 %, 8 Äcker, 0,00141 km². Nachher: ungemessen.
- frucht#1 vorher: 270 Prismen-Strecken; Spektrum acker 7,42σ, acker-fern 4,63σ, dorf 4,29σ (Rausch-Basis 3,91σ). Nachher: ungemessen.
- S0 Boden-Programm: CI main 103347, Budget 104162; Vorprüfung 2 lag bei 106919 (ROT). Weg T lokal (wgsl-fang): 81395 → 82470, also Δ +1075. Erlaubt sind Δ ≤ 811 (Luft 815; das CI-Δ ist das lokale Δ + 4).
- Das Bild von Vorprüfung 2 (Radeon, mein eigenes Auge): der Acker ist grün getönt, Furchen sind weder auf 3 m noch auf 17 m lesbar. Das Abnahme-Urteil sagt GRÜN, das Auge sagt ROT.
- Atlas-Ratsche EXIT 0, stamm:lint EXIT 0, prettier --check (stamm) EXIT 0. `npm run check` lief auf Weg T nicht.

## GPU-Proben (Run-IDs)
- 45250148633 Vorprüfung 1 (043473f7): die Vorher-Bilder acker, acker-fern und dorf.
- 45253526200 Vorprüfung 2 (d5077a7c): Bilder `probe-post/acker-furche/d5077a7c-*.png` (koordination); S0 ROT 106919.
- 45256814886 Vorprüfung 3 (b9b40c2d): ROT, weil das GPU-Schloss nicht genommen wurde; keine Bilder. Der Code-Check dazu (45256814919) ist ebenfalls ROT.

## Offen (Adresse)
- `bild:acker` / mensch.nahrung.flur#1: die Furchen sind im Bild unlesbar, die Ursache ist zuerst zu klären. Verdacht: die Deckung mischt den Erd-Ton weg (`uAckerErde` × (1 − Deckung)), oder `kipp` erreicht die Normale nicht.
- gate:pruefbuehne-licht S0: es fehlen noch ≥ 264 Zeichen (mit Marge 375). Kandidaten: die Literale über `_f32` (der Unterarbeiter wurde ohne Änderung angehalten), die Scholle vorskaliert, q negiert statt `negate`.
- mensch.nahrung.frucht#1 (Reihen ≥ 3σ, Ego im Feld) und flur#1 (Fläche am Dorfrand): die Nachher-Messung steht aus.
- mensch.nahrung.frucht: das Studio fachwerk ruft das Gesetz, zeichnet aber Ton und Frucht noch nicht über es (`worlds/fachwerk/fachwerk.js:361`).
- mensch.nahrung.hand: bei den Stücken der Hand folgen Deckung, Ton und Reife dem Dorf. FUND-REGISTER: die Wege-Karte wächst durch RGBA um 4 MB.

## Nächster Handgriff
Die Bild-Ursache am WGSL klären (`fang-t`: die Acker-Mischung im Boden-Fragment, der Weg von `kipp` zur Normale), dann S0 um ≥ 375 Zeichen senken, dann „Vorprüfung acker-furche 4 … [gpu-probe: bild:acker@0.5, bild:acker-fern@0.5, bild:dorf@0.5, gate:pruefbuehne-licht] [ci voll]“.
