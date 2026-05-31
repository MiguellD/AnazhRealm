# Render-Realismus — von den Riesen gelernt (Diagnose, V16.2+)

> Schöpfer-Befund nach V16.2: "die wiese sieht noch nicht hyperreal aus... gibt
> es keine spiele die begeistern, three.js beispiele sahen sehr echt aus, lerne
> von all den riesen die das tool nutzen". Web-Recherche (Three.js Journey/
> Bruno Simon, offizielle WebGPU-Beispiele, Awwwards-Gewinner Lusion, 2026-
> Post-Processing-Guides) + GEMESSENE Code-Diagnose. Kein Raten.

## Was die "echten" Three.js-Szenen haben — und AnazhRealm NICHT (gemessen)

| Hebel | echte Demos | AnazhRealm (grep-gemessen) | Wirkung |
|---|---|---|---|
| **Post-Processing** (Bloom/Grading/AO) | immer | **0** (kein EffectComposer/PostProcessing) | "blass" vs "filmisch" |
| **Environment-Map / IBL** (HDRI) | immer | **0** (`scene.environment` nie gesetzt) | GRÖSSTER Realismus-Hebel, billiger als Lichter |
| **PBR-Material** (Standard/Physical) | immer | **0** (nur 7 Toon + 4 Lambert) | ob Oberflächen "echt" auf Licht reagieren |
| **ACES-Tonemap** | immer | **JA** (V15.0) | 1 von 4 — die Voraussetzung steht |

## Die Kern-Erkenntnis (Bruno-Simon-"Realistic-Render"-Rezept)
Realismus = ACES-Tonemap + **HDRI-Environment** + **PBR-Material** + **Post-Processing**.
Wir haben NUR den Tonemap. Die anderen drei sind die ungenutzte Licht-Pipeline.
Realismus kommt NICHT aus mehr Geometrie/Gras — sondern aus dieser Pipeline.

## Vendored-Three.js-Lage (r184, gemessen)
- `pass`, `mrt`, `renderOutput`, `PostProcessing`-Klasse: **DA** (TSL-Barrel + webgpu-Bundle).
- `bloom`, `ao`: **NICHT im Barrel** — liegen in `three/addons/tsl/display/BloomNode.js`
  (bei V12-Migration entfernt). Müssen vendored ODER als eigener TSL-Term gebaut werden.
- Kein `three-addons/`-Verzeichnis aktuell.

## Die ehrliche Identitäts-Weggabelung
Volles PBR + HDRI gäbe den **Toon/Ghibli-Stil auf**, der AnazhRealm IST. Die
schönsten Three.js-Welten sind oft STILISIERT (Lusion, Bruno Simons Auto-Welt),
nicht fotoreal. Ein Browser-Tab erreicht physisch nicht Unreal (Nanite/Lumen/
GB-Foto-Texturen/native GPU). ABER: AnazhRealm ist NICHT am Limit seines eigenen
Stils — die fehlende Licht-Pipeline (Post-FX + IBL-Ambient) ist der echte,
ehrliche Sprung, der "blass" → "beseelt-filmisch" macht, OHNE den Stil zu verraten.

## Plan-Optionen (Schöpfer entscheidet)
- **A — Post-Processing-Bogen (V17)**: Bloom (Highlights leuchten) + Color-Grading
  (satte Farben) + ggf. SSAO. Wirkt auf ALLES gleichzeitig. Bloom-Addon vendoren
  ODER eigener Threshold+Blur+Add-Term. Render-only, moderate FPS-Kosten. GRÖSSTER
  Wow-Sprung pro Aufwand IM eigenen Stil.
- **B — IBL-Ambient (Image-Based Lighting light)**: eine prozedurale/kleine HDRI
  als `scene.environment` → weiches, richtungsabhängiges Umgebungslicht. Hebt JEDE
  Oberfläche, am realistischsten pro Watt. Toon-verträglich wenn dezent dosiert.
- **C — Stil bewusst wählen**: Referenzen sichten (BotW/Sable/Lusion/Ghibli),
  definieren WAS AnazhRealm sein will, gezielt dorthin — statt Unreal nachzujagen.

## Empfehlung
A + B zusammen sind der echte "alles rausholen"-Weg — beide render-/licht-only,
beide stilverträglich, beide treffen die GEMESSENE Lücke. C ist die Weisheit
dahinter (kein Fotorealismus-Holzweg). Sub-Wellen-Disziplin: A zuerst (größter
sichtbarer Sprung), dann B, jeder mit Browser-Audit.
