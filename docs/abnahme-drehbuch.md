# Das Abnahme-Drehbuch — DIE EINE Schöpfer-Runde (V18.462)

> **Zweck:** Die EINE Browser-Session, die ALLE Sign-off-Schulden tilgt (roadmap §0,
> Trichter-Stufe 1). Alles hier ist VORAB selbst-verifiziert (Gates + eigene settled
> swiftshader-Schüsse) — die Runde ist ABNAHME, keine Diagnose-Sitzung. Reihenfolge
> einhalten; je Punkt steht das Kriterium (eine Zahl oder ein Bild), ein Wort genügt.
>
> **Vorbereitung:** `npm run server` · Browser auf die Welt · HUD an. Diese Datei daneben.

## 0 · Vorab lesen (2 min)

- **dc = Σ drawCalls EINES Frames über alle Pässe. Erwartetes Band bei voller Bühne:
  ~900–1600.** (NICHT 436 = Fehldeutung, NICHT 38108 = Regression der V18.427-Klasse.
  Herleitung: git-Historie, `docs/analyse/hud-lesenotiz-w8.md`.)

## 1 · W8-Abnahme (der Paritäts-Sign-off)

| # | Blick | Kriterium | ✔/Wort |
|---|-------|-----------|--------|
| 1.1 | HUD nach ~2 min Spiel | dc stabil im Band 900–1600 | |
| 1.2 | `npm run diag:parity` → Bild-Paar sichten | Kriterium 1: „nicht mehr unterscheidbar" | |
| 1.3 | Boot kalt + warm (Stoppuhr) | warm ≤ ~3 s Welt-sichtbar (diag-boot-stage-Band) | |
| 1.4 | Dither-Blende beim Gehen auf Wald zu | kein LOD-Pop, Blende im Band | |
| 1.5 | Ankunft/„stiller Saug" beim Chunk-Eintritt | kein sichtbarer Pop | |
| 1.6 | Wiese-bis-Kante · Busch-Teppich · Back-Licht | die V18.422-Reste gefallen? | |

## 2 · Die zwei Dinge, die NUR du kannst

1. **`npm run look-golden -- --mint`** auf deiner GPU (einmal dein Auge — danach
   bewacht die 0.92-MSSIM-Maschine jeden Push; das Golden fehlt seit V18.359,
   weil der Container den WebGPU-Frame nicht capturen kann).
2. **`anazhRealmPerf.json`** — einfach spielen; der Flugschreiber POSTet automatisch.
   Prüfen: `version` im Trace ≥ 18.427.

## 3 · Der LOOK-Stau (die Galerie — je ein Blick, ein Wort)

Alles frisch gebaut und headless auge-geprüft (artifacts/ trägt die Referenz-Schüsse):

| Blick in der Welt | Referenz-Schuss | Kriterium |
|---|---|---|
| Dein Avatar (3rd-Person) | `avatar-kleid-default-w24.png` | Studio-Garderobe: Hemd·Hose·Sneaker·Haar |
| `werde wolf` | `auge-buehne-welt.png` | Zottel-Läufe · Kragen · Mähne · Rute |
| Frisuren (Werkstatt-Dials) | `avatar-frisuren-w14.png` | lang/afro/zopf/dutt unterscheidbar |
| Der Himmel (Tag · bedeckt · Nacht) | `himmel-*.png` | Studio-Wolkenfeld (Parallaxe, sonnenbeschienene Kerne) |
| Wasser (Teich · Fern-See) | `wasser-*.png` | Beer-Lambert-Farbe · Himmel-Spiegel · Glitzerpfad |
| Auto-Dörfer (Fachwerk) | `asset2-haus.png` / `portal-fachwerk.png` | Studio-Häuser in der Welt |
| Bäume nah/fern | `asset-*.png` | Vorlagen-Bäume, Impostor-Ferne ruhig |
| Die 7 Lab-Portale | `portal-*.png` | jedes bootet + rendert |
| Klinge in der Hand | `asset-waffe.png` | Schmiede-Langschwert |
| Tore | `asset-tor.png` | Porta-Membran |
| Emotions-Posen (`wut`, `freude` im Chat) | — | Profil sichtbar im Gang |

## 4 · Die drei Ein-Wort-Entscheide (Defaults stehen — Herkunft: Paritäts-Plan §3, git-Historie)

- **E-C** — Materialisierungs-Pop kalter Bäume (`_foundryRewarmColdTrees`): eigener
  Fall von „kein LOD-Pop"? *(Hinweis: W8-Schritt 6 führte E-C als „entschieden",
  §3 trägt kein Häkchen — diese Runde macht es eindeutig.)* Default: **nein, kein
  eigener Fall** — sonst: Zeit-Fade als Nachschlag.
- **E-E** — `glutbrunnen`/`glut_var*`: **bewusste Nicht-Studio-Silhouette** (Default,
  steht schon als Code-Kommentar) oder künftige Vertrags-Domäne?
- **E-F** — fliegende Inseln + `start_plattform`: **Welt-Substanz, die bleibt**
  (Default — ein Render-Regime-Gate auf Worldgen wäre die falsche Naht)?

## 5 · Nervensystem DoD 5 (das Wort)

> „Eine neue Domäne anzudocken fühlt sich nicht mehr wie 100 Versionen an."
> — stimmt das? (DoD 1–4 sind gemessen ✓; dieses Wort schließt den Bogen.)

## 6 · Abschluss

Jedes ✔ hier + das gemintete Golden + der perf-Trace = **W8 DONE, Trichter-Stufe 1
getilgt**. Danach ist der Tisch frei für den nächsten großen Bogen (roadmap §0.4,
Empfehlung: (a) der lebendige Körper → (b) Seelen-Vertiefung).

## 7 · Die Vollendungs-Runde (V18.490 — die neun Schnitte am eigenen Auge)

> Mechanisch fertig (Gates + Merge-Gate grün); dieses Kapitel ist DEIN Browser-Wort.
> `npm run server` · Browser auf die Welt · HUD an. Je Punkt ein Wort.

| # | Schritt | Kriterium | ✔/Wort |
|---|---------|-----------|--------|
| 7.1 | Chat `dorf 7 18` | Häuser sind KEINE Klone: Kirche (Kuppel), Gasthaus, Scheunen sichtbar verschieden | |
| 7.2 | An einer Hauswand entlang + durch die Tür | Kollision == Optik (kein unsichtbarer Riegel, Tür-Lücke begehbar) | |
| 7.3 | Zu einer Auto-Siedlung wandern | dieselbe Rollen-Vielfalt wie 7.1 (kein Kultur-Default-Feld) | |
| 7.4 | `fahrzeug_gt` spawnen, aufsitzen | der Sitz liegt IM Cockpit (tief, ~GT-Schweller), nicht auf dem 1-m-Wagen-Bock | |
| 7.5 | Absteigen, gegen die Karosserie laufen | die Kollision folgt der GT-Länge (~4.6 m: Bug/Heck/Greenhouse spürbar) | |
| 7.6 | Dolch → Grossschwert → Keule in die Hand | Schwung flink (0.25 s) → träge (0.8 s+), Reichweite kurz→lang, Schaden matt→wuchtig | |
| 7.7 | Eine Kreatur nachts ansehen | Augen glimmen DEZENT (0.3), kein Scheinwerfer-Glühen | |
| 7.8 | Frischer Boot ohne Studio-Wahl | Haut/Haar aus der Palette (kein Einheits-Tan); Peer ohne Übergabe sieht auf beiden Clients GLEICH aus | |
| 7.9 | Zum Genesis-Ring gehen | am Tor-Fuß atmet Bodennebel in Membran-Farben; ein warmes Licht pulst am nächsten Tor | |
| 7.10 | Durch die Membran gehen | Hindurchgehen IST Betreten (kein E nötig) | |
| 7.11 | Symphonie an, Genre wechseln (LoFi → Trap → Bossa → Cinematic) | Drums UND Harmonie/Lead/Bass klingen VERSCHIEDEN (kein Einheits-Dreieck-Pad) | |
| 7.12 | Im Wald: buche + erle suchen | buche wirkt mammut-mächtig, erle weiden-hängend — und die Kollision folgt der Silhouette | |
| 7.13 | Himmel + Wasser ansehen | UNVERÄNDERT (die Zwillinge fielen byte-treu — kein Look-Bruch) | |
| 7.14 | 4× Gewand ablegen/anziehen, Panel | Puffer-Speicher kehrt auf die Grundlinie zurück (kein Wachstum) | |
| 7.15 | HUD nach ~2 min | dc im Band ~900–1600 stabil (die neuen Nähte kosten kein Regime) | |
