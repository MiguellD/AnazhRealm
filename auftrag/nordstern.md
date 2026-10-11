# NORDSTERN — die Ebenen, das Studio-Muster, der Soll-Bild-Atlas

Stand 11.10.2026. main = V18.539 `be1d6e57` · integ-probe = V18.540 `27e369d8` · K09a `gelaende-core` auf `grund-kern` `190902a8` (Manifest 9, Merge offen).
Für den Schöpfer und für jeden Arbeiter. Dieses Blatt setzt **keinen** Pflicht-OFFEN-Eintrag (Rest bleibt A, B, C, E) und ersetzt keine Karte: es ist der Maßstab, an dem jede Karte ihr Soll-Bild und ihre Zahl abliest.

Grundlagen (gelesen, nicht wiederholt): `C:\Users\micha\AnazhRealm-rundgang\audit\VISION-BAUPLAN.md` §2 · `STUDIO-VOLLENDUNG.md` (D1–D12) · `audit\daten\quellen.json` · `artifacts\profiband\richtung-1110\entscheidung.md` (§1.2, §3, §6) · `artifacts\profiband\studios\synthese.md` (§1, §2, §3) · `artifacts\profiband\grund\karten-1010.json` + `k09a-gegenmessung.json` · `artifacts\profiband\aaa-abstand\teil-ergebnisse-1010.json` · `docs\das-lebendige-feld.md`.

Bild-Regel: nur frei lizenziert oder gemeinfrei. **79 Referenzen** — 59 Commons-Dateien am 11.10. über die Commons-API einzeln geprüft (Lizenz + Urheber), 20 vorhandene Audit-Bilder aus `quellen.json` (Abkürzung `REF\` = `C:\Users\micha\AnazhRealm-rundgang\audit\bilder\referenz\`). `REF\fairuse-intern\` und die Spiel-Bilder `spiel-*.jpg` sind **nie** Soll-Bild. Spiele stehen nur als Prinzip mit Textquelle da.

---

## §0 Drei Sätze

1. AnazhRealm baut seine Welt in neun Ebenen auf EINER Engine: three.js r184 WebGPU ist das Substrat (die „Elementarteilchen“ Licht, Schatten, Luft), Stoff-Gesetze sind die Atome (eine Textur ist nur ihr gebackener Abdruck), darüber Bauteil, Objekt, Ensemble, Ort, Siedlung/Biom, Welt und Ultiversum, und quer durch alle Ebenen das lebendige Feld.
2. Jedes Studio ist eine Werkbank auf dieser einen Engine für eine Säule durch mehrere Ebenen und gilt erst dann als gemeistert, wenn es das Muster M0–M8 mit Zahlen belegt: EIN Kern für Welt und Studio, Regler = Gesetz-Parameter, Soll-Bild und Zahl gegen die Wirklichkeit, Budget je LOD-Stufe, EIN Plan als Export, Bild-Schleife in Minuten.
3. Das Gelände-Studio treibt das Muster als Pilot auf der Welt-Engine (der Kern steht seit K09a), das Fachwerk-Studio plant danach den Ort auf diesem Grund (K10), und Leib, Pflanze, Klinge, Wagen, Tor und Klang folgen nach derselben Checkliste, gemessen an 79 Referenzen und 113 Zielzahlen mit Quelle (§4).

---

## §1 Die Hierarchie 0–8 und das Feld

**Antwort auf die drei Fragen des Schöpfers.** *Elektron und Proton sind three.js?* — Ja, als Bild: Das Substrat ist die Physik des Sichtbaren (Licht, Schatten, Luft, Himmel). Niemand baut sie im Studio neu, jedes Studio zeigt durch sie. *Atome sind Texturen?* — Nein: Atome sind **Stoff-Gesetze** (Albedo, Rauheit, Dichte, Festigkeit, Reibung, Klang). Eine Textur ist ihr Abdruck auf dem Schirm, aus dem Gesetz gebacken (Atlas, Vertex-Farbe), nie gespeichert, nie gemalt. *Darüber die Studios?* — Nicht darüber, sondern **quer**: Jedes Studio ist ein Gesetzbuch, das eine Säule durch mehrere Ebenen trägt (Fachwerk reicht von Stoff bis Siedlung).

Regel der Ebenen (VISION-BAUPLAN §2.3): Nach oben reist nur das Ergebnis (das Dorf braucht vom Haus Grundfläche, Tür und Höhe, nicht seine Balken). Nach unten reisen nur Randbedingungen (der Ort sagt „Hang 6 %, Wasser 120 m“, das Haus entscheidet selbst). Jede Ebene rechnet nach Sichtbarkeit: voll nah, vereinfacht mittel, statistisch fern.

### 0 · Substrat
- **Was:** three.js r184 WebGPU (vendor, nie editiert) + der EINE Render-Pfad der Welt: EIN Himmel, Belichtung aus dem Licht, 2 Schatten-Kaskaden, Koschmieder-Luft, TRAA, Wasser-Optik.
- **Analogie:** Elektron und Proton, die Kräfte, aus denen alles Sichtbare besteht.
- **Studio:** keines eigen. Jede Studio-Ansicht IST die Welt (`__buehne`: Mittag · Sonne · Sommer). Kein r184-Port der r128-Shells als dritter Look-Pfad (synthese §2.2, entscheidung §1.2).
- **Kern:** vendor r184 + Stamm (`_renderScene`, `_ensureSkyEnvironment`, `_foundryTreeMaterial`); Soll: Himmel und Stoff als Modul außerhalb des Stamms (entscheidung §3.4, Modul-Zielkarte §6.6).
- **Perfekt heißt:** 18-%-Karte im Ausgabe-Pfad = Mittelgrau +1 EV (173 von 255); Tag ≈ 100 000 lx ↔ Vollmond 0,05–0,3 lx mit mehreren EV Anpassung (heute < 1 EV); Mond 0,52° mit Phasen (heute 2,7°); Himmel aus Rayleigh/Mie/Ozon < 1 ms; Profi-Band 60 fps · 208 Befehle · 680k Dreiecke · 118 MB auf beiden Messplätzen (E-Kriterium, entscheidung §6.1).

### 1 · Stoff
- **Was:** Material-Gesetze — lineare Albedo (FARB-GESETZ: Hex = sRGB-Absicht), Rauheit, Dichte ρ, E-Modul, Festigkeit, Reibwert μ, Rollwiderstand, Schallgeschwindigkeit c = √(E/ρ).
- **Analogie:** Atome. Ihre Eigenschaften entscheiden alles Höhere; die Textur ist ihr Bild, nicht sie selbst.
- **Studio:** alle lesen; heute verstreut (Werkstatt, Schmiede-Stahl, Fachwerk-HOLZ, Klang-Stoff).
- **Kern:** heute drei Wahrheiten (FARB-GESETZ in foundry-core, `HOLZ` fachwerk-core.js:918 handgesetzt, `MATERIAL_TAG_KEYS` im Stamm). Soll: EINE Stoff-Zeile `{rho, E, f_m, albedo, rough, mu, crr}` je Stoff (VB-07).
- **Perfekt heißt:** jede Albedo im Natur-Band, gemessen mit `diag-albedo-zensus` (Fels ≤ 0,30, Gras 0,18–0,25, Laubbestand 0,15–0,18, Ziegel 0,10–0,15, Kalk 0,75–0,85, Neuschnee 0,8–0,9); Holz hat EINE Zeile nach EN 338 für Haus, Werkzeug und Klang; jeder Belag trägt μ und c_rr.

### 2 · Bauteil
- **Was:** ein tragendes Element, dessen Form aus Last und Stoff folgt: Balken, Ast, Klinge, Knochen, Glied, Rad, Feder, Bogen.
- **Analogie:** Moleküle — Atome nach Bindungsregeln gefügt.
- **Studio:** Fachwerk (Balken), Phytogenesis (Ast, Blatt, Rinde), Schmiede (Klinge, Wurfarm), Garage (Rad, Feder), Körper/Tetrapoda (Knochen, Glied), Portale (Bogen, Ordnung).
- **Kern:** der jeweilige `*-core.js`.
- **Perfekt heißt:** jedes Bauteil folgt sichtbar seiner Formel und die Linse misst sie: Balken h = √(6M/(b·f_m,d)) mit h/L 1/20–1/30; Ast d^Δ = Σ d_i^Δ mit Δ 1,8–2,3; Bogen mit Stützlinie im Stein und t/R ≥ 0,1075; 0 handgesetzte Querschnitte.

### 3 · Objekt
- **Was:** ein Ding mit Verhalten — Haus, Baum, Mensch, Tier, Wagen, Klinge, Tor, Klang-Ereignis.
- **Analogie:** Zelle oder Organismus.
- **Studio:** alle neun.
- **Kern:** alle; Vertrag B1–B6 (`docs/studio-vertrag.md`).
- **Perfekt heißt:** Budget je Stufe (L1 ≤ 35 % von L0, L2 ≤ 10 %, Schatten wirft die gröbere Stufe); ein Individuum aus dem Seed oder ehrlich `gestalten: 1`; jedes Verb (fahren, gehen, treffen, öffnen, wiegen, klingen) Studio = Welt ± 5 %.

### 4 · Ensemble
- **Was:** Objekte mit Abstand, Ordnung und Zusammenspiel — Gasse, Hof, Bestand, Herde, Rudel, Menge, Duell.
- **Analogie:** Gewebe, Kolonie.
- **Studio:** Fachwerk (Gasse), Phytogenesis (Bestand), Tetrapoda (Herde), Körper (Menge, Ninja-Park), Schmiede (Arena).
- **Kern:** fachwerk `DORF_NORM`, phyto `forestStandDensity`, tetrapoda `VERHALTEN`.
- **Perfekt heißt:** Stammzahl nach Reineke N ∝ Dq^−1,605; Herde synchron mit den 2 nächsten Nachbarn; ein Rudel jagt ohne Spieler (Jagd-Frames > 0); Abstände nach Hall 0,46–1,22 m / 1,2–3,7 m; 0 Leib-Durchdringung > 10 cm.

### 5 · Ort
- **Was:** die Stelle, die bestimmt, was dort stehen darf — Bauplatz, Lichtung, Furt, Talboden, Tor-Platz.
- **Analogie:** Biotop.
- **Studio:** Gelände (Pilot) + Fachwerk (Bauplatz). Heute die größte Lücke: der Ort hat keine Bühne, die Welt erfindet die Höhe (Sockel).
- **Kern:** `gelaende-core` (ERDBAU-Term, K10) + fachwerk `SIEDLUNG`.
- **Perfekt heißt:** Dorfplatz ≤ 8 % Hang, Sockel 0 (heute Median 2,72 m), alle Türen zu Fuß erreichbar (heute 0/2), Tor-Platz Höhenstreuung ≤ 1 m (heute 26,5 m), Plan-Hash Studio = Welt.

### 6 · Siedlung / Biom
- **Was:** Dorf mit Wegen und Epoche; Pflanzengesellschaft aus Klima, Feuchte, Licht und Boden.
- **Analogie:** Ökosystem.
- **Studio:** Fachwerk (Siedlung), Phytogenesis (Gesellschaft), Gelände (Klima-Feld).
- **Kern:** fachwerk (Plan v2), phyto (Nische), gelaende (Klima, nach v1).
- **Perfekt heißt:** ≥ 3 Dorfplätze ≤ 8 % je Welt am gebauten Boden (heute 0/16 sanfte km²-Fenster); Wege mit Steigung je Klasse (Karren ≤ 7 %, Fuß ≤ 12 %); 12/12 Stadt-Schichten reisen (heute 8/12); Platz nachts 2–5 lx; Biom stetig aus (T̄, N̄, Feuchte) — nach v1.

### 7 · Welt
- **Was:** Relief, Flussnetz, Erosion, Küste, Klima.
- **Analogie:** Planet.
- **Studio:** **Gelände (NEU, Pilot).**
- **Kern:** `gelaende-core.js` (K09a: Makro-Höhe, Erbgut-Terme, Erosion, Tarn; Stamm und Worker rufen EINEN Kern, der Worker-Spiegel fiel) + Hydrosphäre (noch im Stamm, je 2048-m-Kachel eigene Wasserscheide).
- **Perfekt heißt:** Flint θ 0,3–0,7 mit tragender Regression (heute −0,418, R² 0,027); Senken > 1 m ≤ 1 je km² (heute 32,9); Hammond-Ebenen vorhanden (heute 0/16); Tal-Querprofil b je Typ; Mäander λ ≈ 11 Breiten; ≤ 6 µs je Gelände-Spalte.

### 8 · Ultiversum
- **Was:** Welten, Portale, Mitspieler, Ko-Schöpfung, die Taille (was über die Grenze reist).
- **Analogie:** Kosmos — viele Welten, eine Physik.
- **Studio:** Portale. Gastwelten (fluid, schwarm, begegnung, skeleton, translated) sind keine Studios (Status Gast, ohne DoD; entscheidung §1.2).
- **Kern:** porta-core + `docs/taille-spec.md`.
- **Perfekt heißt:** jedes Studio-Objekt reist Studio → Welt → Studio mit gleichem Fingerabdruck; Taste → Reaktion ≤ 100 ms; Ziel warm ≤ 2 s interaktiv; die Membran zeigt das Ziel (≤ 5 % ausgebrannt).

### quer · Das lebendige Feld (und Klang als sein hörbarer Teil)
- **Was:** EIN Feld, das liest (`auraAt(x,z,t)`), schreibt (`_depositLife`, `_depositEmotion`, DSL/Nexus) und WERTET (Vorhersagefehler δ gegen eine Baseline) — `docs/das-lebendige-feld.md`.
- **Analogie:** das Feld der Physik (Gravitation, Elektromagnetismus): kein Ding, sondern was zwischen den Dingen wirkt, auf jeder Ebene.
- **Studio:** keines eigen. Es wirkt in den Studios als Emotion → Körpersprache (FACS-Gewichte, Körper), Witterung und Furcht (Tetrapoda), Klang (Stoff klingt, Ereignis klingt, Raum klingt).
- **Kern:** Stamm (Feld, Nexus, DSL) + klang-core (`colorExt`, UMWELT).
- **Perfekt heißt:** jede Wertung des Feldes ändert beobachtbar die Welt (Konsum-Probe, nie Existenz); der Wind trägt die Witterung (ein Tier im Lee flieht später als im Luv); jede klingende Quelle trägt ein Gesetz (`gate:klang-zensus`).

### Die Matrix — welche Säule trägt welches Studio

| Ebene | Gelände | Phytogenesis | Fachwerk | Körper | Tetrapoda | Garage | Schmiede | Portale | Klang |
|---|---|---|---|---|---|---|---|---|---|
| 1 Stoff | Fels, Boden, Wasser | Rinde, Blatt | Holz, Lehm, Putz, Ziegel | Haut, Haar, Gewebe | Fell, Haut | Lack, Gummi, Belag-μ | Stahl, Eibe, Horn | Stein, Metall, Membran | Stoff klingt |
| 2 Bauteil | — | Ast, Blatt, Wurzel | Balken, Ständer, Treppe | Knochen, Gelenk, Aktionseinheit | Glied, Pfote | Rad, Feder, Achse | Klinge, Gefäß, Wurfarm | Bogen, Ordnung, Flügel | — |
| 3 Objekt | — | Baum, Strauch, Gras | Haus | Mensch | Wolf, Fuchs, Bär, Hirsch | Wagen | Schwert, Axt, Bogen, Pfeil | Tor | Schritt, Hieb, Motor, Ruf |
| 4 Ensemble | — | Bestand | Gasse, Hof, Markt | Menge, Parcours | Herde, Rudel | — | Duell, Arena | — | — |
| 5 Ort | Talboden, Aue, Furt, Kar | Lichtung, Saum | Bauplatz (ERDBAU) | — | — | Weg, Furt, Brücke | — | Tor-Platz | Raum (Wald, Haus, Höhle) |
| 6 Siedlung/Biom | Klima-Feld | Pflanzengesellschaft | Dorf, Wege, Epoche | Bewohner | — | Wegenetz | — | — | — |
| 7 Welt | Relief, Flussnetz, Küste | — | — | — | — | — | — | — | Wetter |
| 8 Ultiversum | — | — | — | — | — | — | — | Übergang, Taille | Musik, Ko-Präsenz |

Ebene 0 tragen alle gleich: jedes Studio zeigt durch die EINE Welt-Engine, Klang hört durch den EINEN Audio-Bus.

---

## §2 Das Studio-Muster (Definition of Done, messbar)

Ein Studio ist gemeistert, wenn M0–M8 je mit Zahl oder Bild belegt sind. In Commits steht „Muster n/9“, nie ein Siegel-Wort. Die sechs Kernpunkte des Koordinators sind M1–M6; M0, M7 und M8 kommen aus D1, D6 und D12.

| # | Muster | Messung (der Beleg) | Vorlage (bestes Studio, synthese §1) |
|---|---|---|---|
| **M0** | **Substrat-Treue:** Die Studio-Ansicht zeigt durch die Welt-Engine; Farbe = FARB-GESETZ im Kern; EIN Belichtungs-Gesetz | 18-%-Karte Labor = Welt, Δ ≤ 2 % je Kanal; Albedo Labor ↔ Welt je Klasse (die Albedo-Messwand aus S1 messwaende); 0 eigene Fill/Rim/Back in der Welt-Ansicht | Welt-Bühne `__buehne`; neue Studios (Gelände) direkt auf der Welt-Engine |
| **M1** | **EIN Kern für Welt und Studio:** Die Substanz liegt in `<domäne>-core.js`, Studio und Welt rufen dieselbe Funktion | Kern im Manifest; Zwillings-Linse = 0; Byte-Abdruck bzw. Plan-Hash Studio = Welt; Kern-SHA vorher = nachher bei reiner Shell-Arbeit | tetrapoda `bau(F, P)`; gelaende-core (Zwillings-Linse 21 → 0, Makro-SHA gleich) |
| **M2** | **Regler = Gesetz-Parameter:** jede Regler-Zeile in `PARAMS_BY_KIND` mit id, einheit, min, max, step, def, law; die UI wird daraus gebaut | Regler-Zensus 100 % mit Einheit; `regler-wirkt`: tot 0, Budget-Bruch 0; DSL-Manifest = EINE Vokabel-Quelle | garage (Generator + Lehren-Tafel) |
| **M3** | **Soll-Bild + Zahl gegen die Wirklichkeit:** je Studio die §4-Zeile | ≥ 3 Wirklichkeits-, ≥ 1 zeitlose Referenz; ≥ 3 Ziele `{größe, ziel, quelle, heute}`; die Linse misst im Studio UND am gebauten Welt-Boden (K09a: rohe Makro ≠ gebaut) | K09a-Gegenmessung (gebaut neben Makro) |
| **M4** | **Budget je LOD-Stufe** | L0 ≤ Band-Zeile der Klasse, L1 ≤ 35 %, L2 ≤ 10 %, Schatten aus der gröberen Stufe, Fernstufe als Schicht des EINEN Atlas; Befehle/Dreiecke/MB beim Namen (`werkbank zaehlen`, `werkbank band`) | terrain (Budget-Zeile = Bau-Regler, Deckung als Maß) |
| **M5** | **Export als EIN Plan:** das Studio exportiert ein Objekt mit allem, was die Welt braucht; die Welt erfindet nichts | Plan-Hash Studio = Welt; Absenz der Welt-Erfindungen (Sockel-Kasten, hMax-Suche, Ersatz-Versatz); Rundreise Studio → Welt → Studio mit gleichem Fingerabdruck | koerperstudio-Übergabe (Positivliste, fail-closed) |
| **M6** | **Bild-Schleife in Minuten:** Regler → Bild aus dem Ausgabe-Pfad, Soll-Bild daneben | ≤ 1 min je Bild bei offener Welt (`scripts/werkbank.cjs`, ~45 s statt ~5 min Neustart); Bühne eingefroren, Tiere gehalten | werkbank (Lehre 20) |
| **M7** | **Verben im Kern:** `schritt(zustand, eingabe, dt, gesetz)` rein im Kern; Zeit über `glatt(x, ziel, tau, dt)`, nie ein Frame-Lerp | Studio = Welt ± 5 % je Verb (fahren erreicht 1e-15 m); Trajektorien-Golden je Verb | klang `umweltGraph`; vehicle `fahrSchritt` |
| **M8** | **Linse mit Selbsttest** | vorher ROT am Täter beim Namen; in einer bestehenden Familie; Selbsttest; ≤ 3 min CI; benannter Konsum-Leser; Goldens in CI mit Plattform-Probe | schmiede (v5 in CI), fachwerk (Selbsttest 22/22) |

### Abgleich mit STUDIO-VOLLENDUNG D1–D12 (nur was trägt)

| D | Audit-Kriterium | Urteil | im Muster |
|---|---|---|---|
| D1 | gleiche Bühne: r184 je Studio-Shell | **umgeformt.** Ein r184-Port der r128-Shells wäre ein dritter Look-Pfad (synthese §2.2, entscheidung §1.2, §3.4). Neue Studios entstehen auf der Welt-Engine, alte zeigen ihre Welt-Ansicht über die Übergabe; die Zahl (Graukarte Δ ≤ 2 %) bleibt. | M0 |
| D2 | Kern geteilt | trägt | M1 |
| D3 | Gesetze zentral, `Gesetz("kern:Pfad", null)` + Wand | trägt | M1, M2 |
| D4 | Regler mit Einheit, Bereich, Standard | trägt | M2 |
| D5 | LOD-Wächter L1 ≤ 35 %, L2 ≤ 10 % | trägt | M4 |
| D6 | Licht, Ton, Physik wie die Welt | trägt, geteilt: Licht → M0, Physik → M7, Ton → Klang quer | M0, M7 |
| D7 | Selbsttest + Runner-Szene + Basisbild | **umgeformt.** Der Runner bleibt Audit-Daten (entscheidung §2.10); das Bild kommt aus dem Ausgabe-Pfad an der Karten-Szene; der Selbsttest bleibt als Linse | M6, M8 |
| D8 | Rundreise | trägt | M5 |
| D9 | Bedienbarkeit (Tastatur, Kontrast, aria) | **ruht in der EINEN Hülle** (synthese §2.1): einmal dort gemessen, nicht je Studio; nach v1 | — |
| D10 | p95 ≤ 16,7 ms auf der Radeon | **umgeformt.** Zeit misst nur der OMEN; das Studio zählt Befehle, Dreiecke, MB gegen die Band-Zeile; der Welt-Richter ist das E-Kriterium | M4 |
| D11 | Name = Inhalt | aufgegangen: Regler und DSL-Wörter aus den PARAMS | M2 |
| D12 | Studio-Gate in der CI mit `--selftest` | trägt, enger gefasst (F4) | M8 |

**Die Sammlung (die Antwort auf die Frage nach der Meditation).** Klarheit entsteht nicht aus Ruhe, sondern aus drei Blicken vor dem ersten Werkzeug: (1) das Soll-Bild des Studios ansehen (§4: eine Wirklichkeit, eine zeitlose Darstellung), (2) die EINE Zahl lesen (heute → Ziel, mit Quelle), (3) in einer Zeile Chokepoint und „was stirbt“ nennen. Dazu der Kontext-Deckel ~250 k (entscheidung §2.3): Ein frischer Arbeiter mit scharfem Ziel schlägt einen langen Lauf mit verschwommenem. Diese drei Zeilen stehen in jedem Block aus §5.

---

## §3 Die Reihenfolge

**Regel:** Das erste Studio wird über das ganze Muster M0–M8 getrieben, und was es dabei baut, wird die Vorlage der nächsten. Seriell ist nur die Stamm-Kette Gelände → Ort (Platz 1, entscheidung §3.1); die Klassen-Karten der übrigen Studios laufen auf Platz 2 und 3 weiter. Die Reihenfolge hier ist die Reihenfolge, in der ein Studio das GANZE Muster bekommt. Braucht eine Klasse mehr als einen Bauer und eine Nachbesserung, wird die Domäne im Studio neu gebaut statt weiter geflickt (entscheidung §6.8).

| # | Studio | v1-Schritt | Karte(n), die es tragen | Stand 11.10. (Zahl) | was es der nächsten Welle hinterlässt |
|---|---|---|---|---|---|
| 1 | **Gelände** (Pilot, auf der Welt-Engine) | Wurzel für 2 und 3 | **K09a** gelaende-core (`grund-kern` `190902a8`, `[ci voll]`, Merge über integ-probe offen) → **K09b** Modul-Schienen → **G2** Landformen T1/T2/T5 (Schöpfer-Scope: „in v1, nach K09“, entscheidung §6.2) → Gelände-Studio | Makro-SHA 64×64 gleich für 3 Saaten + Bühne; 44/44 Dichte-Gitter maxDiff 0; Zwillings-Linse 21 → 0; gebaut 32,9 Senken/km², 0/16 sanfte Fenster, θ −0,418 | das Studio als Welt-Engine + Hülle (M0, M6); die Realismus-Linse als Datenformat `{größe, ziel, quelle, heute}` (M3); der Funktions-Kern (`funktion: true`) |
| 2 | **Fachwerk** | 2, 3, 5 | **K08** S3-Haus + Türblatt (in V18.540), **K11** EIN Leuchtquellen-Gesetz (Leser der Laternen), **K10** Ort auf dem Gelände: Plan v2 + ERDBAU | Türblatt 4,18 → 0,000 m; Mess-Dorf 97 Befehle / 609k / 123,3 MB (V18.540); Sockel-Median 2,72 m, Türen 0/2, GT 5,2 m in 8 s, Dorf nachts 0 Lichter | EIN Plan als Export (M5, Plan-Hash Studio = Welt); der ERDBAU-Term; das Leuchtquellen-Gesetz |
| 3 | **Körperstudio + Tetrapoda** (EIN Gang-Gesetz) | 2 | **K07** Gang-Gesetz für Zwei- und Vierbeiner, **K06** Kamera-Leib | Kadenz 0,34 Schritte/s; Tier-Gleiten 9–23 %; Kamera unter dem Boden 9/50 | Verben im Kern mit Trajektorien-Golden (M7) |
| 4 | **Phytogenesis** | 2 (sehen) | **O4** die weiße Masse (OMEN); Wind mit `omega`, Laub-Transluzenz, Oben-Ansicht der Karte (synthese Posten 1, 14, 15; ohne Karte) | Baum 39 Befehle / 120–123k Dreiecke (V18.538); Strauch 125 412; Halm-Kontrast 7,95 | die Klima-Lesung der Nische (nach v1) |
| 5 | **Schmiede + Arena** | 5 | **K01** der Hieb trifft (V18.539), **K13** Kampf-Klasse, **S2** steckende Pfeile (Ja, §6.2) | Klick-Pfad-Matrix 96 Fälle; Pfeil-k 1,42 → 0,86·10⁻³/m | EIN Kampf-Gesetz für Spieler, Tier, Mensch |
| 6 | **Garage** | 5 | **K02** Wasser-Fahrt (V18.540), **K12** Fahr-Bahn (Platz, Befreiung, Tacho, Klang); **S1** Tempo aus Leistung nach E | rückwärts 0,1 m in 2,5 s; Vorschau-GT 38–40° am Fels; Tacho 0 Leser | Belag-μ aus der EINEN Wege-Karte |
| 7 | **Portale** | 8 + FPS-Boden | **O2** S3-Tor (L0 ≤ 60 000, L1 neu), **O3** Genesis-Rest; Ziel-Postkarte (synthese Posten 16; ohne Karte) | Tor-Hülle 184 000 Dreiecke auf einer Stufe; Genesis 259 / 2 425k / 156,1 MB | die Rundreise jedes Objekts (M5 über Ebene 8) |
| quer | **Klang** | jede Welle | K07 (Schritt), K11 (Glut aus dem Verzeichnis), K12 (FAHRT-Stimme); `musikGraph` (synthese Posten 9; ohne Karte) | Schritt 2 Töne in 6 s; Lautheit −49,2 bis −23,4 LUFS ohne Master-Ziel; 0/19 Lab-Instrumente im Spiel | der EINE Audio-Bus (Ebene 0 des Hörens) |

**Warum Gelände zuerst:** Die Klage des Schöpfers ist geometrisch (flache Talkessel, Häuser auf Sockeln). Ein Studio, das sein Gesetz nicht auf echtem Grund prüft, liefert Puzzleteile (Memory `studio-zuerst`). An `_terrainMacroSurfaceY` liefen Erbgut, Landformen und ERDBAU zusammen; seit K09a ist das EIN Kern. **Warum Fachwerk danach:** Es ist die einzige Kette mit Code von Ebene 1 bis 6, und der Ort braucht den Grund (entscheidung §3.5).

---

## §4 Der Soll-Bild-Atlas je Studio

Lesehilfe: Zeilenanker `anazhRealm.js:NNNN` und `*-core.js:NNNN` sind Stand V18.538 `66005ca6` (Sammler-Lesung); vor jedem Schnitt am eigenen Worktree nachlesen. „[gerechnet]“ = aus dem Code gerechnet, nicht im Bild gemessen. **„(nach v1)“** = Soll-Bild, kein Auftrag: Feature-Stopp bis v1.0 (roadmap §0.v1, entscheidung §6.2); jede Karte nennt ihren v1-Schritt.

### 4.1 Gelände (Pilot) — mit Wasser und Himmel/Licht als Substrat-Bezug
**Ebenen:** 5 Ort (Talboden, Aue, Kar, Furt) · 6 Klima-Feld · 7 Welt (Relief, Flussnetz, Erosion, Terrassen/Tafelberge, Dünen, Küste); Ebene 0: EINE Luft, EIN Himmel, Wasser-Optik.

> **Soll:** Jedem Hang sieht man an, wohin sein Wasser läuft: weite Auen mit Mäandern und flachem Grund, U-Täler mit Wänden über ebenem Boden, Tafelberge mit Kliff über dem Schutthang, Dünen mit steiler Leeseite. Die fernen Grate verblassen in EINER Luft unter einem Himmel aus Physik, das Wasser spiegelt Ufer, Wolke und Mond, und die Nacht ist dunkel, aber lesbar.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| [Lauterbrunnental vom Männlichen](https://commons.wikimedia.org/wiki/File:Lauterbrunnental_from_M%C3%A4nnlichen,_Bern,_Switzerland,_2012_August.jpg) | CC BY-SA 3.0 · Ximonic (Simo Räsänen) | glaziales Trogtal b ≈ 1,5–2: steile Wände, ebener Boden, Hängetal-Fälle. Heute EIN Tal je Welt (b 2,2), sonst kein Tal-Term. |
| [River Towy, Mäander und Altarm](https://commons.wikimedia.org/wiki/File:River_Towy_Meander_and_Oxbow_Lake_-_geograph.org.uk_-_750727.jpg) | CC BY-SA 2.0 · Anthony Stevenson | Mäander λ ≈ 11 Breiten, Rc 2–3 Breiten, Aue mit Hang < 8 %. Am gebauten Boden heute 0/16 solcher Fenster. |
| [Monument Valley, Mittens + Merrick Butte](https://commons.wikimedia.org/wiki/File:Monument_Valley_USA_Mittens_and_Merrick_Butte_2009.jpg) | Public Domain · Katona András (Hyberoid) | Schicht-Gesetz T5 in einem Bild: Kliff > 60°, Schutthang 33–37°, Pediment 0,5–7°. Die Terrassen-Sperre (< ≈19°) verhindert heute dieses Kliff. |
| [Namib bei Sossusvlei, Barchane](https://commons.wikimedia.org/wiki/File:Namib,_a%C3%A9reas_%282006%29_22.jpg) | CC BY-SA 4.0 · LBM1948 | Sichel-Dünen quer zum Wind, Luv 8–20°, Lee 30–34°, H ≈ B/10. Heute 0 Dünen. |
| [Zabriskie Point, Badlands](https://commons.wikimedia.org/wiki/File:Eroded_badlands_at_Zabriskie_Point,_Death_Valley_National_Park,_California.jpg) | CC BY-SA 4.0 · Christian David | dendritisches Rinnennetz ohne geschlossene Mulde — Gegenbild zu 32,9 Senken je km². |
| `REF\real-see-abend.jpg` ([Llyn Padarn, Commons](https://commons.wikimedia.org/wiki/File:Padarn_lake_mirror_view_at_dusk._%2838057969665%29.jpg)) | CC BY-SA 2.0 · Hefin Owen | Spiegel von Berg, Schnee, Wolke und einem Fensterlicht; Kämme gestaffelt im Dunst. Heute Spiegel-Treue ≈ 0 (128×64-Verlauf). |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Leonardo da Vinci, Karte des Valdichiana (um 1503–06)](https://commons.wikimedia.org/wiki/File:Leonardo_da_Vinci_-_RCIN_912278,_A_map_of_the_Valdichiana_c.1503-6.jpg) | gemeinfrei · Royal Collection | das Flussnetz als Wasser-Gesetz von oben: Einzugsgebiete, Zuflüsse, Senke als benannter See — „Fluss zuerst“ (T2). |
| [Thomas Moran, The Chasm of the Colorado (1873–74)](https://commons.wikimedia.org/wiki/File:Thomas_Moran_-_The_Chasm_of_the_Colorado_-_L.1968.84.2_-_Smithsonian_American_Art_Museum.jpg) | gemeinfrei · SAAM | harte Bänder als Wände, weiche als Hänge, Canyon mit b < 1, Wolkenschatten über der Tiefe — Soll für T5 und die Luft. |
| [Caspar David Friedrich, Der Wanderer über dem Nebelmeer (um 1817)](https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg) | gemeinfrei · Hamburger Kunsthalle | Luftperspektive: Grate gestaffelt nach Abstand, Nebel in den Senken — Soll für EINE Koschmieder-Luft mit Boden-Nebel. |

**Prinzip**
- **Minecraft Java 1.18:** Die Großform ist Daten — Kontinentalität, Erosion, Gipfel/Täler laufen durch monotone Splines zu offset, factor, jaggedness, und dieselben Felder setzen das Biom. Übertrag T1: die Spline-Stützpunkte werden Regler des Gelände-Studios und ersetzen die handgebauten Masken und den Ein-Massiv-Anker. Quelle: <https://minecraft.wiki/w/Density_function>, <https://minecraft.wiki/w/Noise_router>.
- **Ghost Recon Wildlands (Houdini):** Netze zuerst, das Gelände folgt — Flüsse nur bergab, Straßen nach geringstem Widerstand, jedes Netz stempelt Höhe und Material lokal. Übertrag: das Flussnetz T2 setzt die Täler, der ERDBAU-Term (K10) stempelt Weg und Parzelle in dieselbe Funktion. Quelle: <https://80.lv/articles/procedural-world-building-in-ghost-recon-wildlands/>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Sanfte Fläche (Hammond, 1 km², sanft = > 50 % mit Hang < 8 %) | Ebenen-Klassen in Tiefland und Aue; ≥ 3 Dorfplätze je Welt (Hang ≤ 8 %, Spanne ≤ 3 m) | <https://pubs.usgs.gov/sim/3085>; STUDIO-VOLLENDUNG §4 | gebaut 0/16 Fenster sanft, Hang < 8 % auf 9,3 %, p50 25,6 %, p90 47,8 %, Spanne p50 156,5 m; Prüfbühne 1/1 (k09a-gegenmessung.json) |
| Flint-Konkavität θ (S = ks·A^−θ) | 0,3–0,7 (Ref. 0,45) mit tragender Regression, 30-m-Raster wie GLO-30 | <https://esurf.copernicus.org/articles/12/1347/2024/> | gebaut −0,418 bei R² 0,027; Makro 0,714 bei R² 0,231 |
| Geschlossene Senken > 1 m (außer benannten Seen, Karen, Karst) | ≤ 1 je km², < 1 % der Landfläche | Lindsay & Creed 2005, Hydrol. Processes 19(16); Priority-Flood Wang & Liu 2006 | 32,9 je km²; 12,7 % > 1 m, 4,4 % > 5 m |
| Abfluss-Dichte + Horton | 2–5 km/km²; Rb 3–5, RL 1,5–3,5, RA 3–6 | <https://hess.copernicus.org/articles/28/3119/2024/>; Strahler | 1,9–2,0 km/km² (Makro); Rb, RL, RA ungemessen |
| Tal-Querprofil z = a·y^b | fluvial b ≈ 1,28, glazial 1,54, Trog → 2; je Talabschnitt aus dem Flussnetz | Svensson 1959; <https://arxiv.org/pdf/0901.1177> | EIN Tal je Welt (talBlendExp 2,2, :101496); Canyons ohne Gefälle |
| Mäander | λ = 10–14 Breiten (Mittel 11), Rc = 2–3 Breiten | Leopold & Wolman 1960, <https://pubs.usgs.gov/publication/70185557> | Mäander-Term 0; 7/16 Flüsse münden in den Kachelrand |
| Schicht-Gesetz | Kliff ≥ 60°, Schutthang 33–37°, Pediment 0,5–7°, Schwemmfächer 1,6–3,4° | karten-1010 (T5); <https://docs.quadspinner.com/Reference/Profile/Terrace.html> | Terrassen 26 m nur bei Hang < ≈19° (Sperre :27403); kein Kliff, kein Schutthang |
| Dünen (Wüsten-Maske) | Lee 30–34°, Luv 8–20°, Barchan H ≈ B/10 (1,5–10 m, Basis 40–150 m); Typ aus dem Windregime | <https://perso.liris.cnrs.fr/aparis/public_html/projects/paris2019_Deserts.html>; <https://arxiv.org/pdf/cond-mat/0308100v1> | 0 Dünen, 0 Wüsten-Maske |
| (nach v1) Klima-Feld | T = T0 − 6,5 K/km·h + ΔT_Saison; N mit Luv/Lee aus ∇h·Wind; Biom und Baumgrenze lesen beide | ICAO-Standardatmosphäre; VB-02 | kein T-, kein N-Feld |
| Fließgeschwindigkeit | v = (1/n)·R^(2/3)·S^(1/2); Körper, Bild, Klang und Boot lesen dieselbe Zahl | <https://en.wikipedia.org/wiki/Manning_formula> | überall 1,2 m/s × centerness (:33808) |
| Wasser-Optik | Fresnel ≈ 2 % senkrecht (n 1,333), streifend → 100 %, Ufer/Wolke/Mond im Spiegel; Snell-Fenster 97,2° (Grenzwinkel 48,6°) | Fresnel-Gleichung; <https://physics.it.com/dictionary/critical-angle> | Spiegel 128×64-Verlauf; unter Wasser 0 % Oberfläche (BackSide-Cull :36412–36415) |
| Beleuchtungsstärke (Ebene 0) | Sonne ≈ 100 000 lx, bedeckt 1 000–2 000, Vollmond 0,05–0,3, Sterne 0,0002–0,002; mehrere EV Anpassung; Nachtwolke dunkler als die 18-%-Karte | <https://en.wikipedia.org/wiki/Lux>; <https://en.wikipedia.org/wiki/Daylight> | Belichtung bei 1,0 gedeckelt (< 1 EV); Nachtwolken in Tageshelligkeit (:15606–15625) |
| Himmel + Mond (Ebene 0) | Rayleigh/Mie/Ozon in wenigen LUTs < 1 ms; Mond 0,52° mit Phasen | Hillaire 2020, <https://diglib.eg.org/handle/10.1111/cgf14050> | Farbtabelle mit Magenta 0xc04a7a (:20062–20090); Mond 2,7°, ohne Phasen, Mondlicht 0,22 konstant |
| Boden-/Fels-Albedo (linear) | Fels ≤ 0,30, Sand 0,35–0,40, Gras 0,18–0,25, Neuschnee 0,8–0,9, Wasser 0,06–0,10 | <https://www.e-education.psu.edu/earth103/node/1002> | Fels 0,42–0,54 roh (foundry-core.js:4602–4612) |
| Kosten je Gelände-Spalte | ≤ 6 µs mit allen Termen, ≤ 3 µs in Ebenen; Chunk-Bau-Takt p95 ≤ +10 % | karten-1010 (Budget T0–T8); K10-Budget | 2,4–3,5 µs (26 noise2D); Erosion global synchron (36 Iter., ±26 m) |

### 4.2 Fachwerk
**Ebenen:** 1 Stoff (Eiche, Nadelholz, Lehm, Kalk, Ziegel) · 2 Bauteil (Balken aus Spannweite, Ständer, Riegel, Sparren, Treppe) · 3 Haus (32 Kulturen) · 4 Gasse, Hof, Markt · 5 Bauplatz am Hang (ERDBAU) · 6 Dorf, Wege-Graph, Epoche, Licht bei Nacht.

> **Soll:** Ein Dorf wächst aus seinem Hang. Eichenständer stehen im Takt unter einem Meter, und die Höhe jedes Balkens folgt sichtbar seiner Spannweite. Die Gassen laufen längs der Höhenlinie und werden in der Falllinie zur Treppe; jede Tür ist zu Fuß erreichbar. Nachts hebt warmes Licht von etwa 1 900 K den Platz auf 2–5 lx, der Rest bleibt im Mondlicht bei 0,1–0,3 lx. Jede Epoche hat ihre eigene Formensprache, kein umgefärbter Bausatz.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| [Egerländer Fachwerkhaus im Rohbau](https://commons.wikimedia.org/wiki/File:Fachwerkhaus_Rohbau.jpg) | CC BY-SA 3.0 · Richard Huber | Ebene 2 ohne Ausfachung: Schwelle, Ständer, Riegel, Streben, Rähm; Ständertakt ≈ 1 m, Querschnitte 10–18 cm. Heute bayMax 1,7 m. |
| `REF\real-fachwerk.jpg` ([Obergasse 11, Alsfeld](https://commons.wikimedia.org/wiki/File:Obergasse_11_in_Alsfeld.jpg)) | CC BY-SA 4.0 · Krzysztof Golik | dunkle Eiche gegen Kalkputz, Vorkragung je Geschoss, Fensterachsen im Ständertakt. Heute jetty 0,0 als Standard. |
| [Freudenberg, „Alter Flecken“](https://commons.wikimedia.org/wiki/File:Freudenberg_-_historischer_Stadtkern_%22Alter_Flecken%22.jpg) | CC BY-SA 4.0 · Rob M. | das Dorf aus EINER Grammatik: Zeilen am Hang, gleiche Firstrichtung, Dachlandschaft als Silhouette. Heute ein loses Häuserfeld aus 8–17 Slots. |
| [Schiltach, Marktplatz](https://commons.wikimedia.org/wiki/File:Schiltach_Marktplatz_img02.jpg) | CC BY 4.0 · Andreas Praefcke | der Platz liegt selbst im Gefälle und nimmt die Höhe ohne Podest-Kasten auf. Heute Sockel-Median 2,72 m, Türen 0/2. |
| [Masuleh, Gilan](https://commons.wikimedia.org/wiki/File:Masuleh_Village.jpg) | CC BY-SA 4.0 · Mojtaba Matboyi | Hang im Extrem (> 100 m im Dorf): das Dach ist Hof und Weg des Hauses darüber — Wegeklasse „Dach = Weg“, Gegenbild zum Sockel. |
| `REF\real-fachwerk-nacht2.jpg` ([Haltern, Gänsemarkt bei Nacht](https://commons.wikimedia.org/wiki/File:Haltern_am_See,_G%C3%A4nsemarkt_--_2013_--_4951-2.jpg)) | CC BY-SA 4.0 · Dietmar Rabich | zwei Laternen, Lichtpools auf nassem Pflaster, warme Fenster, schwarzer Himmel. Heute ist das Dorf um 02:15 schwarz. Achtung: lang belichtet, heller als das Auge. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Matthäus Merian, Marburg (Topographia Hassiae)](https://commons.wikimedia.org/wiki/File:De_Merian_Hassiae_151.jpg) | gemeinfrei | die Siedlung am Hang als EIN Organismus; Merians Vogelschau ist die 60-m-Totale, in der das Studio den Ort prüft. |
| [John Atkinson Grimshaw, Street Scene in Moonlight (1875)](https://commons.wikimedia.org/wiki/File:John_Atkinson_Grimshaw_-_Street_Scene_in_Moonlight.jpg) | gemeinfrei | die Nacht mit zwei Lichtern: kühler Mond über Dächern, warmes Fenster- und Gaslicht auf der Straße. Heute leuchten Wolken heller als das Dorf. |
| [Flandin & Coste, Persépolis — Vue cavalière (1851)](https://commons.wikimedia.org/wiki/File:Pers%C3%A9polis._Vue_cavali%C3%A8re_du_plateau._%28Planche_double.%29_%28NYPL_b12482496-1542779%29.jpg) | gemeinfrei · Scan NYPL | die Terrasse IST die Architektur: Plattform aus dem Hang, Stützmauer, Prunktreppe — Soll-Bild für das ERDBAU-Vokabular. |

**Prinzip**
- **Esri CityEngine / CGA (Müller, Wonka, Haegler, Ulmer, Van Gool 2006):** jede Epoche eine eigene Regel-Grammatik (Parzelle → Masse → Fassade → Geschoss → Achse → Bauteil). Übertrag: STILMODE (fachwerk-core.js:139–147) tauscht heute nur Material-Rollen; das Epochen-Regelbuch wird Geometrie-Grammatik im Kern, ins ov reist nur das Ergebnis. Quelle: ACM TOG 25(3):614–623, doi 10.1145/1141911.1141931.
- **Dörfer auf beliebigem Gelände (Emilien, Bernhardt, Peytavie, Cani, Galin 2012):** Interessen-Funktionen je Bautyp (Hang, Wasser, Erreichbarkeit, Dominanz); jeder Bau bekommt sofort seinen Weg; Fassaden dürfen scheitern, bis Tür und Treppe den Boden nicht schneiden. Übertrag: das Studio plant den Ort auf der Gelände-Funktion, die Welt importiert EINEN Plan, Sockel-Kasten und hMax-Suche fallen. Quelle: <https://perso.liris.cnrs.fr/egalin/Articles/2012-villages.pdf>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Holz als EINE Stoff-Zeile | C24: f_m,k 24 N/mm², E0,mean 11 000 N/mm², ρ_mean 420 kg/m³; D30: f_m,k 30, ρ_mean ≈ 640 (ρ_k 530); Haus, Möbel, Klang lesen sie | EN 338:2016 Tab. 1/3 (D30-Dichte an der Norm prüfen); VB-07 | HOLZ handgesetzt (spanMax 0,78/1,12, fachwerk-core.js:918); drei Wahrheiten |
| Balkenhöhe aus Spannweite | h = √(6M/(b·f_m,d)), M = q·L²/8; w_inst ≤ L/300; h/L 1/20–1/30, darüber Unterzug | EN 1995-1-1 Tab. 7.2 | balkenH fest 0,21 m (:129): 1/24 bei 5 m, 1/48 bei 10 m |
| Ständertakt + Gefach | ≤ 1,0 m (close studding < 0,6 m); Bänder ≈ 45°; Querschnitte 10–18 cm | de.wikipedia Fachwerkhaus; immoportal Glossar | bayMax 1,7 m, post 0,16 m (:130–131) |
| Hang-Zugang | Sockel ≤ 1,5 m + Außentreppe 2s + a = 590–650 mm; alle Türen erreichbar, Weg ab 6 m vor der Tür | DIN 18065 (baunetzwissen, Blondel); VB-04; aaa-abstand stadt | innen 0,64 m (stimmt); Sockel-Median 2,72 m, Kasten bis 64,6 m über dem Erdweg, Türen 0/2, fundamentMaxDh 9 m (:2122) |
| Platz- und Weg-Steigung | Dorfplatz ≤ 8 %, Haus ≤ 15 %; Karren ≤ 7 %, Fuß ≤ 12 %, steiler: Treppengasse oder Serpentine | Practical Action, Improving paths and tracks; VB §4.3 | slopeMax 0,35 an EINEM Punkt; Dorf-Spanne 22 m (Ziel ≤ 3 m); Wege ohne Höhe |
| Dorfplätze je Welt | ≥ 3 mit Hang ≤ 8 %, am gebauten Boden | STUDIO-VOLLENDUNG §4 | gebaut 0/16 sanfte km²-Fenster (K09a) |
| Albedo der Stoffe | Ziegel 0,10–0,15, Putz hell 0,40–0,45, Kalk 0,75–0,85, Eiche hell 0,25–0,35, Sandstein 0,20–0,40, Terrakotta solar 0,47 | engineeringtoolbox Light Reflecting Factors; Roma Tre (Terrakotta) | FARB-GESETZ gilt seit V18.531; Band je Stoff ungemessen |
| Dachneigung je Deckung | Biberschwanz Doppeldeckung ≥ 30°; Flachdach als Weg ≈ 0° | ZVDH-Fachregel Dachziegel | pitchDeg 8–62° je Kultur, ohne Neigungs-Wand |
| Licht bei Nacht | Platz/Gasse 2–5 lx (P4–P6), Rest 0,1–0,3 lx; 1 850–2 000 K; Fernlichter als EIN instanzierter Draw; Lichter > 0 | EN 13201-2:2015; GFZ Potsdam (Vollmond 0,26 lx); Courrèges, GTA V Graphics Study | 0 Laternen, 0 Fenster; einziges PointLight am Portal (:52429); Export streicht Laternen (:4198–4211) |
| Innenraum-Licht | Tageslichtquotient 2–5 %; Luma innen : außen 1:5–1:20 | BS 8206-2 / BRE | ≈ 1:1 (leben-schau-2, Bild 20) |
| Kosten der Siedlung | L1 ≤ 35 %, L2 ≤ 10 %; Haus-Fernstufe als Karte im EINEN Atlas (≤ 2 Befehle), 26–64 m ohne Sprung | D5; synthese §3.0 Posten 2; Profi-Band | Mess-Dorf 97 Befehle / 609k / 123,3 MB (V18.540); gotisch L2 9 786 > 7 000 |
| Stadt-Schichten Labor = Welt | 12/12 reisen (Laternen, Brücken als Wege-Etikett; Mauer nach K10); Plan-Hash Studio = Welt | aaa-abstand stadt; K10 | 8/12; Export streicht Mauer, Laternen, Fluss, Brücken |
| (nach v1) Epochen-Reichweite | Persien als eigenes Regelbuch (Terrasse ≈ 125 000 m², Stützmauer, flache Prunktreppe, Iwan); Silhouetten-Abstand zweier Kulturen > 0 | worldhistory.org/persepolis; CGA 2006 | 6 Regionen ohne Persien; griechisch = spanisch = andalusisch = renaissance auf 8 m |

### 4.3 Körperstudio (mit Ninja-Park)
**Ebenen:** 1 Haut, Haar, Gewebe · 2 Knochen, Gelenk, Aktionseinheit · 3 Mensch, Gesicht, Kleid, Gang · 4 Bewohner, Menge, Parcours; quer: Emotion → Körpersprache, Schritt/Atem/Stimme.

> **Soll:** Ein Mensch geht mit 1,3 m/s und etwa 1,8 Schritten pro Sekunde, der Fuß steht, der Blick führt den Kopf. Er blinzelt 17-mal pro Minute, lächelt mit Wange und Mund und trägt das Kleid seiner Epoche. Spieler, Mitspieler und Bewohner tragen dieselbe Bewegungs-Laufzeit aus koerper-core, die auch das Studio zeigt.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| `REF\real-gang-muybridge.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:A_naked_man_walking._Collotype_after_Muybridge,_1887._Wellcome_L0075726.jpg)) | CC BY 4.0 · Wellcome; Muybridge gemeinfrei | Gangphasen mit Fersen-Aufsatz, Abrollen, Arm-Gegenschwung; Schrittlänge auszählbar gegen heute 3,4 m. |
| `REF\real-mensch-profil.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Man_profile_portrait_%285689483847%29.jpg)) | keine Einschränkungen · Bergen Public Library | Kopf/Hals-Proportion, Nasenrücken, Kieferlinie — Referenz für Hals-Kette und Kiefer, die das 14-Gelenk-Skelett nicht hat. |
| `REF\real-gesicht.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Elderly_Gambian_woman_face_portrait.jpg)) | CC BY-SA 2.0 · Ferdina | Haut, Falten als Spur der Mimik, Augenglanz und Lid — Soll für FACS auf Armlänge. |
| `REF\real-parkour.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Parkour_speed_vault.jpg)) | gemeinfrei · Danhje | Hand-Stütz, Hüfte über dem Hindernis, Ganzkörper-Ballistik — Sprung Studio = Welt. |
| [Farmer at Colonial Williamsburg](https://commons.wikimedia.org/wiki/File:Farmer_at_Colonial_Williamsburg_-_Sarah_Stierch.jpg) | CC BY 4.0 · Sarah Stierch | Arbeitskleidung des 18. Jh. am echten Körper — gegen T-Shirt und Sneaker im Dorf von 1718. |
| [Broad Walk, Regent's Park](https://commons.wikimedia.org/wiki/File:Broad_Walk,_Regent's_Park_-_geograph.org.uk_-_365027.jpg) | CC BY-SA 2.0 · Stephen McKay | Fußgänger-Menge mit Gruppen, Abständen, gestreutem Tempo — heute 0 Bewohner. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Leonardo da Vinci, Vitruvianischer Mensch (um 1490)](https://commons.wikimedia.org/wiki/File:Da_Vinci_Vitruve_Luc_Viatour.jpg) | gemeinfrei | das Proportions-Gesetz als Bild: Kopf 1/8, Fuß 1/7, Hand 1/10, Spannweite = Höhe. |
| [Albrecht Dürer, Vier Bücher von menschlicher Proportion (1528)](https://commons.wikimedia.org/wiki/File:Illustration_from_D%C3%BCrers_Vier_Bucher_von_Menslicher_Proportion,_Nuremberg,_1528_MET_DP816816.jpg) | CC0 · MET | verschiedene Körpertypen aus Maßregeln — Vielfalt aus EINEM Gesetz (Gestalt-Regler, Genom). |
| [Pieter Bruegel d. Ä., Bauernhochzeit (1567)](https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_Peasant_Wedding_-_Google_Art_Project.jpg) | gemeinfrei · KHM Wien | Dorfmenschen in Arbeits- und Festkleidung, beim Essen, Tragen, Reden — Bewohner und Körpersprache im Ensemble. |

**Prinzip**
- **Motion Matching (Ubisoft, Simon Clavet, GDC 2016):** die Pose folgt aus einer Kostenfunktion über Fuß-Lagen, Geschwindigkeiten und die gewünschte Trajektorie der nächsten ≈ 1 s; Start, Stopp, Wende ohne Zustandsgraph. Übertrag: das Gang-Gesetz liefert die Pose, die Kostenfunktion dient als Richter, keine Mocap-Datenbank. Quelle: <https://gamedeveloper.com/programming/most-inspiring-game-animation-tech-talks-of-2016>.
- **FACS → Blendshapes (Ekman & Friesen 1978):** das Gesicht ist eine Summe von Aktionseinheiten mit Intensität A–E. Übertrag: die Emotion des Feldes schreibt AU-Gewichte, Lab und Welt lesen dieselbe Tafel. Quelle: <https://en.wikipedia.org/wiki/Facial_Action_Coding_System>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Kadenz + Schrittlänge | 1,34 m/s bei 90–120 Schritten/min (≈ 1,8/s), Schritt 0,6–0,7 m; bei 1,15 m/s ≥ 1,5/s | <https://www.physio-pedia.com/Gait>; Weidmann 1993; K07 | kalib 4,0 × Bein ≈ 3,4 m → 0,34–0,5 Schritte/s (koerper-core.js:560; :17234–17235) |
| Gehen → Laufen | bei Fr ≈ 0,5 (≈ 2,0 m/s) eigene Laufpose mit Flugphase | <https://en.wikipedia.org/wiki/Transition_from_walking_to_running> | Sprint = dieselbe Sinus-Pose × 1,3 (:17301) |
| Tastgrad | Gehen 0,55–0,7; Laufen ≈ 0,39 | Alexander 2004, J Anat 204:321; <https://pmc.ncbi.nlm.nih.gov/articles/PMC10588426/> | kein Tastgrad-Gesetz; Lock bis 98 % Reichweite, dann Sprung (:17440–17443) |
| Fußgleiten + Schritt-Takt | Gleiten < 5 %; Töne = Frequenz × Zeit ± 15 % | K07 | Runner 130,5/132,3 %; 2 Töne in 6 s |
| Schwerpunkt-Hub | ≈ 5 cm Spitze-Spitze vertikal und seitlich | Lin, Gfoehler & Pandy 2014, J Biomech, doi 10.1016/j.jbiomech.2014.02.002 | additiver Sinus, Amplitude ungemessen (:17450–17579) |
| Proportion | Kopf 1/8, Fuß 1/7, Hand 1/10, Spannweite = Höhe | Vitruv/Leonardo; Dürer 1528 | Guss 5,7 → 6,6 Köpfe (koerper-core.js:751, :1060); Trochanter 0,530 H stimmt |
| Skelett-Vertrag | ≥ H-Anim LOA-1 (18 Gelenke); Ziel LOA-2 (71: Wirbel, Hals, Kiefer, Finger) | ISO/IEC 19774-1, HAnim 2.0 | 14 + Wurzel; spine = chest = torso, neck = head (foundry-core.js:6190, :6419, :6431) |
| Lidschlag + Blick | 17/min Ruhe, 26/min Gespräch, 4,5/min Lesen; Augen führen, Kopf folgt | Bentivoglio et al. 1997, Mov Disord 12(6) | periodischer Puls ohne Blickziel (:17584–17621); Dual AUGEN_VIS |
| Mimik | FACS AU 1–28, A–E: Duchenne AU6+12, Trauer 1+4+15, Wut 4+5+7+23 | Ekman & Friesen 1978 | Kopf-Haut starr; 0 Freiheitsgrade für Kiefer, Mund, Braue |
| Budget | L0 ≤ 40 000; L1 mit Haar-Karte | koerper-core.js:40–41 (B2c) | L0 162 412; L1 kahl ab 40 m; Guss synchron 0,8–2,8 s |
| (nach v1) Bewohner-Dichte | ≈ 4,75 Personen je Haushalt: 18 Häuser ≈ 85 Bewohner | Laslett & Wall 1972, Household and Family in Past Time | 0 Menschen-NPC (:101160) |
| Abstände + Menge | Gespräch 0,46–1,22 m, Fremde 1,2–3,7 m; Menge 1,34 m/s (0,97–1,65) | Hall 1966 (Proxemik); Weidmann 1993 | kein Zweibeiner-Akteur |
| (nach v1) Kleidung 1700–1750 | Mann: Hemd, Weste, Rock, Kniebundhose, Strümpfe, Schnallenschuh, Dreispitz; Frau: Hemd, Schnürmieder, Unterrock, Schürze, Haube, Brusttuch | <https://en.wikipedia.org/wiki/1700%E2%80%931750_in_Western_fashion> | tshirt/pullover/tank/poncho, sneaker/boot (koerper-core.js:166–200) |
| Labor = Welt | 0 Duale (AUGEN_VIS, KPMUL_VIS, NINJA_VIS); 39 Verhalten als Kern-Daten mit Welt-Leser | aaa-abstand lesen:animation; D2/D3 | 3 Duale (koerper-core.js:1051–1075); 39 Verhalten nur in koerperstudio.js:21–60 |

### 4.4 Tetrapoda
**Ebenen:** 1 Fell, Haut-Albedo · 2 Glied, Pfote, Rumpf- und Hals-Kette · 3 Wolf, Fuchs, Bär, Hirsch · 4 Herde, Rudel, Jäger und Beute; quer: Witterung, Furcht, Neugier; Ruf und Pfote.

> **Soll:** Ein Wolfsrudel trabt mit 8–9 km/h geschlossen über den Hang und wechselt bei Froude 2–3 in den Galopp mit Flugphase. Jede Pfote steht in der Standphase ohne Gleiten, und die Hirschherde flieht als ein Körper. Jedes Tier ist ein Individuum aus seinem Seed, im Studio und in der Welt aus demselben tetrapoda-core.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| `REF\real-pferd-muybridge.jpg` ([The Horse in Motion](https://commons.wikimedia.org/wiki/File:The_Horse_in_Motion_high_res.jpg)) | gemeinfrei · Muybridge 1878 | Galopp-Phasen mit Flugphase Bild für Bild: Tastgrad, Fußfolge, Rumpf-Nicken. Heute kein Galopp. |
| `REF\real-fuchs-trab.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:A_red_fox_trots_along_the_park_road,_just_past_Eielson_Visitor_Center,_in_Denali_National_Park_and_Preserve_on_June_28,_2019._%28d4855f7a-0be9-4419-b501-5c51d3c58b3b%29.JPG)) | gemeinfrei · NPS / Emily Mesner | diagonale Beinpaare, stehende Pfote, ruhige Rückenlinie — Soll für Stand-Gleiten < 5 %. |
| `REF\real-baer-gang.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Brown_bear_walking_on_red_clay.jpg)) | CC0 · Joselodos | Sohlengänger mit Abrollen und schwerem Rumpf-Schwanken — gegen den gleitenden Bären „wie ein Schild“. |
| `REF\real-wolfjagd-elch.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Wolves_hunting_elk.jpg)) | gemeinfrei · Doug Smith, NPS | Rudel an der Beute: Abstände, Umzingelung, Galopp im Schnee — heute 0 Jagd-Frames in der Standard-Welt. |
| [Rothirsch-Herde hangauf (Angus)](https://commons.wikimedia.org/wiki/File:Large_herd_of_Red_Deer_heading_upwards_-_geograph.org.uk_-_2882803.jpg) | CC BY-SA 2.0 · Richard Law | geschlossener Zug mit Reihen und Nachbarabständen — Soll für Kohäsion (heute 20 %). |
| [Junction Butte Pack aus dem Flugzeug](https://commons.wikimedia.org/wiki/File:Junction_Butte_Pack_photographed_from_a_fixed-wing_during_wolf_study_%2849235371881%29.jpg) | gemeinfrei · Yellowstone NP (Dan Stahler) | Rudel-Formation von oben, Spur im Schnee — Draufsicht für Rudel-Zug und Ring. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Muybridge, Animal Locomotion Pl. 707: Hund „Dread“ im Galopp (1887)](https://commons.wikimedia.org/wiki/File:Dog_Dread_galloping_%28rbm-QP301M8-1887-707a~animation_2to8%29.gif) | gemeinfrei | der Galopp eines Caniden, direkte Vorlage für den Wolf: Rotations-Galopp, Rückenbeugung, Flugphase. |
| [George Stubbs, The Anatomy of the Horse (1766)](https://commons.wikimedia.org/wiki/File:The_Anatomy_of_the_Horse,_including_a_particular_description_of_the_bones,_cartilages,_muscles,_fascias,_ligaments,_nerves,_arteries,_veins,_and_glands_MET_DP353983.jpg) | CC0 · MET | Knochen und Muskelschichten des Vierbeiners: Gliedlängen, Gelenkwinkel, Rumpf-Kette. |
| [Albrecht Dürer, Feldhase (1502)](https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Hare,_1502_-_Google_Art_Project.jpg) | gemeinfrei · Albertina | Fell als Strich-Richtung je Körperort, Glanz im Auge, Masse im Sitz — Soll für Fellmuster und Gesicht. |

**Prinzip**
- **Boids (Craig Reynolds, SIGGRAPH 1987):** Herde und Rudel aus drei überlagerten lokalen Kräften je Tier (Trennung, Ausrichtung, Zusammenhalt), ohne Anführer. Übertrag: herdeZug, Jagd-Zug und Witterung wirken als Summe auf JEDES Tier, statt Äste einer spieler-zentrierten Gemüts-Kaskade zu sein (anazhRealm.js:22757–22886). Quelle: <https://en.wikipedia.org/wiki/Boids>.
- **Red Dead Redemption 2 (Rockstar 2018), nur Prinzip:** ≈ 200 Arten in einem Ökosystem, das ohne Spieler läuft; Wölfe umzingeln, Aasfresser riechen Kadaver, der Wind trägt die Witterung. Übertrag: die Räuber-Beute-Kette hängt am Ort und am Gesetz, nie am Beziehungs-Modus des Spielers. Quelle: <https://gematsu.com/2018/09/red-dead-redemption-2-details-wildlife-hunting-fishing-and-horses>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Schritt → Trab | Fr = v²/(g·h) ≈ 0,35: Wolf (h ≈ 0,8 m) ≈ 1,7 m/s, Hirsch (1,1 m) ≈ 1,9 m/s | Griffin, Kram, Wickler & Hoyt 2004, J Exp Biol 207:4215 | eine Gangart (tetrapoda-core.js:1312–1326) |
| Trab → Galopp | Fr 2–3: Wolf ≈ 4,0–4,9, Hirsch ≈ 4,6–5,7 m/s, mit Flugphase | Alexander 1984, Int J Robotics Research 3(2):49–59 | Flucht im Trab-Profil bis 7,5–9 m/s (Fr ≈ 7–10); Kommentar :22798 „galoppiert“ ohne Galopp |
| Schrittlänge | λ/h = 2,3·Fr^0,3; Wolf bei 9 m/s λ ≈ 3,7 m, ≈ 2,4 Hz | Alexander 1976, Nature 261:129–130 | λmax ≈ 1,43 m; gemessen 5,5–6,6 Hz bei 7,5–9 m/s |
| Tastgrad | Schritt ≥ 0,6, Trab 0,4–0,5, Galopp < 0,4 (bis ≈ 0,3) | Alexander 2004, <https://pmc.ncbi.nlm.nih.gov/articles/PMC1571302> | 0,5 für jedes Tempo (:1316) |
| Fußgleiten | < 5 % für Wolf, Fuchs, Bär; Schwelle `gate:tier-gang` 0,2 → 0,05 als Ratsche | K07 | 9–23 %; Querhang 27° 0,191; Hinterbeine 10,2–12,8° (Soll ≤ 10°) |
| Tempo-Band Wolf | Dauerlauf 8–9 km/h über Stunden, Sprint 50–60 km/h; Verfolgung ≥ 1 km, bis ≥ 20 min | <https://en.wikipedia.org/wiki/Hunting_behavior_of_gray_wolves> | Flucht 27–32 km/h im Trab; Deckel vMax 15 m/s |
| Räuber-Beute | Rudel (optimal 4 auf Wapiti) jagt autonom, Herde flieht geschlossen; Jagd-Frames > 0 je Wildnis-Probe | wie oben; Rockstar zu RDR2 | Modus frieden: 0 Jagd-Frames in 57 s; Raubtiere entstehen nie von selbst; Ring-Lücke p50 166° |
| Herden-Zusammenhalt | Synchron mit den 2 nächsten Nachbarn; Kohäsion als Kraft auf jedes Tier | Rands et al. 2014, PeerJ 2:e344 | herdeZug nur im Neugier-Zweig (:22845); 20 % |
| Durchdringung im Lauf | 0 Paar-Frames > 10 cm | Leib-Löser tetrapoda-core.js:241–249 (im Stand 753/870 → 0, 79f3e920) | 515 Paar-Frames > 10 cm, tiefste −0,30 m |
| Budget je Tier | L0 ≤ 20 000, L1 ≤ 3 000 ab 35 m | tetrapoda-core.js:42–54 (B2c) | Wolf 55 302 · Fuchs 58 066 · Bär 60 520 · Hirsch 53 432 |
| Individuen aus dem Seed | 0 byte-gleiche Kopien bei verschiedenem Seed | synthese §3.7; D2 | 16 byte-gleiche Kopien (foundry-core.js:4408) |
| Labor = Welt | Labor liest Ofen-Körper, Gang, Verhalten aus dem Kern; 0 Math.random | D2/D6 | 0 Leser, 13× Math.random, r128 |

### 4.5 Phytogenesis (worlds/terrain; phyto-core + foundry-core)
**Ebenen:** 2 Ast (Leonardo), Blatt, Rinde · 3 Baum, Strauch, Gras, Blume · 4 Bestand (Dichte, Kronendeckung) · 5 Lichtung, Saum, Bachtal · 6 Pflanzengesellschaft (Nische aus Klima, Feuchte, Licht, Boden).

> **Soll:** Der Wald wächst nach seinem Standort: hohe, schlanke Stämme im Bestand, breite Solitäre im Offenen, Kronen mit Lücken zueinander, Laub, das im Gegenlicht leuchtet und nach Größe im Wind schwingt. Darunter liegt am Feuchte-Gradienten ein Unterwuchs aus Farn, Streu und Moos; die Wiesen bleiben dicht bis zum Horizont, und von oben sieht man denselben Wald wie von unten.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| `REF\real-mischwald.jpg` ([Mischwald in Südtirol](https://commons.wikimedia.org/wiki/File:Mischwald_in_S%C3%BCdtirol.jpg)) | CC BY 4.0 · Bartleby08 | Buchenlaub transluzent gegen den Himmel, hell-graue Rinde mit Moosfuß, dunkle Fichtenkegel, Lichtung als Grasboden. |
| `REF\real-felsen.jpg` ([Mischwald am Hang der Rudka](https://commons.wikimedia.org/wiki/File:2017_Las_mieszany_na_stoku_Rudki,_Masyw_%C5%9Anie%C5%BCnika,_Sudety.jpg)) | CC BY-SA 4.0 · Jacek Halicki | die Gesellschaft als Mosaik: Fichte am Kamm, darunter Buche, Lärche, Birke — Soll für Bestands-Mosaik, Fern- und Saisonfarbe. |
| `REF\real-fluss.jpg` ([Tenter Bach](https://commons.wikimedia.org/wiki/File:Tenter_Bach_%282%29_-_im_Wald_s%C3%BCdl._des_Quellgebietes.jpg)) | CC BY-SA 4.0 · DiAuras | Unterwuchs am Feuchte-Gradienten: Farn am Bach, Laubstreu am Hang, Totholz mit Moos, Trampelpfad. |
| [Kronenschüchternheit, FRIM Malaysia](https://commons.wikimedia.org/wiki/File:Crown_shyness_at_frim,_malaysia.png) | CC BY-SA 4.0 · Kestrel115 | die Lücke zwischen den Kronen — das Gesetz liegt im Kern (forestPrioWins, pack 1,16), im Bild muss es von unten und oben lesbar sein. |
| [Solitäreiche Marbach](https://commons.wikimedia.org/wiki/File:Solit%C3%A4reiche_Marbach_ND_Sommer_2014_v_S.jpg) | CC BY-SA 4.0 · Rikiwiki2 | Freistand-Habitus: tiefer Kronenansatz, breite Krone, kurzer dicker Stamm — die Gestalt folgt dem Ort, nicht der Art allein. |
| [Salbei-Glatthaferwiese, Breitbrunn](https://commons.wikimedia.org/wiki/File:Salbei-Glatthaferwiese_in_Breitbrunn.jpg) | CC BY-SA 4.0 · Stephan van Helden | artenreiche Mähwiese mit Blühaspekt, dicht bis in die Mittelsicht — gegen die dünne Wiese (Studio-Gras 14 + 4 m). |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Albrecht Dürer, Das große Rasenstück (1503)](https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Das_gro%C3%9Fe_Rasenst%C3%BCck.jpg) | gemeinfrei · Albertina | die Wiese als Gesellschaft auf Augenhöhe: Gräser, Löwenzahn, Wegerich, dichtes Gewirr ohne Wiederholung. |
| [John Constable, Study of the Trunk of an Elm Tree (um 1821)](https://commons.wikimedia.org/wiki/File:Constable_-_Study_of_the_Trunk_of_an_Elm_Tree,_c.1821,_786-1888.jpg) | gemeinfrei · V&A | Rindenrelief, Moos, Licht auf der Rundung, Wurzelanlauf in den Boden — heute eine glatte Röhre mit Bohlen-Wurzeln. |
| [Iwan Schischkin, Morgen im Kiefernwald (1889)](https://commons.wikimedia.org/wiki/File:Shishkin,_Ivan_-_Morning_in_a_Pine_Forest.jpg) | gemeinfrei · Tretjakow-Galerie | schlanke Stämme im Morgennebel, Lichtschäfte durch Kronenlücken, gebrochener Baum als Totholz. |

**Prinzip**
- **SpeedTree (Wind und Fernstufe):** Stamm langsamer als Ast, Ast langsamer als Blatt-Kräuseln; nur EINE Ast-Ebene schwingt eigenständig; die Fernstufe hat 8 Billboards um Y plus eines von oben. Übertrag: die Welt liest `omega` und die Ebenen-Ordnung; die Karte bekommt eine Oben-Ansicht (Hemi-Oktaeder). Quelle: <https://docs.unity3d.com/speedtree-modeler/manual/wind-games.html>, <https://docs.unity3d.com/560/Documentation/ScriptReference/BillboardAsset.html>.
- **Horizon Zero Dawn (Guerrilla, GDC 2017):** Platzierung als deterministische, lokal stabile Dichte-Regeln; verschiebt man Berg oder Fluss, folgt die Vegetation ohne Neu-Dekoration. Übertrag: die Nische liest Klima, Feuchte, Licht, Boden als stetige Felder; Biom-Wechsel sind Funktionswerte, keine Tabelle. Quelle: <https://www.guerrilla-games.com/read/gpu-based-procedural-placement-in-horizon-zero-dawn>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Leonardo-Exponent Δ (d^Δ = Σ d_i^Δ) | Δ = 1,8–2,3 je Art (Leonardo: 2) | Eloy 2011, <https://arxiv.org/pdf/1105.2591> | Presets 2,05–2,40 ± 0,1; 4/17 über 2,3 (foundry-core.js:4090–4413) |
| Stamm-Schlankheit H/D | Bestand H/D 40–100 (Plenter ≈ 60 bei 50 cm BHD, Starkholz ≈ 40, > 80 schneebruch-anfällig); Solitär gedrungener; H ∝ D^(2/3) (McMahon: Bäume ≈ ¼ der Knickhöhe, Linie ≈ 34,9·D^(2/3) m — Koeffizient am Original prüfen) | McMahon 1973, Science 179:1201–1204; waldwissen.net (Plenter, Fichte) | H = (k/2)·D^(2/3), k 13–22 → H/D ≈ 7–25 (14–50 mit trunkMul 0,5); Eiche ≈ 13,7 m bei 1,10 m Fuß [gerechnet, phyto-core.js:75–77] |
| Baumhöhe Altbestand | Buche 30–45, Fichte 30–50, Stieleiche 15–35 (bis 45), Birke 15–25 m; aus Standort und Alter | Steckbriefe Stadt Brandenburg 2026; austria-forum Rotbuche | Laubbaum ≈ 7,5–20,5 m, Tanne ≈ 11–29 m [gerechnet] |
| Bestandsdichte | Reineke N ∝ Dq^−1,605; gegen die Ertragstafel (Schober 1995) jung/mittel/alt | Reineke 1933; <https://www.frontiersin.org/articles/10.3389/ffgc.2020.00062/full> | nur pack 1,16 × Kronenradius: ≈ 48/ha Eiche bis ≈ 170/ha Fichte [gerechnet] |
| Kronendeckung von oben, nah = fern | Deckung der Chunk-Zone = Fern-Farbe ± 10 Pp; ΔE00 ≤ 2,3 an der Ring-Kante; 0 Splitter bei 60/120/420 m | FAO FRA (Wald = Deckung > 10 %); aaa-abstand lesen:natur | von oben Splitter (Deckung ≈ 0); Ring-Kante weiß ↔ oliv; Karte ohne Oben-Ansicht (foundry-core.js:601) |
| Wind | f0 ∝ DBH/H² (Fichte ≈ 0,4 Hz, Ahorn simuliert 0,26 Hz); Stamm < Ast < Blatt; Sturm ≠ Brise | Moore & Maguire 2004, Trees 18(2):195–203; <https://pmc.ncbi.nlm.nih.gov/articles/PMC6597771> | omega ungelesen (foundry-core.js:627); eigene Sinus-Formel, Sturm ≈ Brise |
| Laub-Licht | Laubholz Durchlass ≈ Reflexion, Nadel Durchlass < Reflexion; R(550 nm) ≈ 0,13; Gegenlicht-Laub leuchtet | PROSPECT-D, <https://rtm-suite.wur.nl/python/toolsrtm/leaf.html> | keine Transluzenz, nur Fresnel-Aufhellung (foundry-core.js:588–591); Laub-Luma Eiche Labor 65 ↔ Welt 96 |
| Bestandes-Albedo | Laubwald 0,15–0,18, Nadelwald 0,08–0,15, Grasland 0,18–0,25; von oben im Ausgabe-Pfad | <https://www.e-education.psu.edu/earth103/node/1002> | als Bestand ungemessen |
| (nach v1) Baumgrenze | Wachstumszeit-Mittel < 6,4 °C (≥ 94 Tage > 0,9 °C) über T = T0 − 6,5 K/km·h; darüber Krummholz, Rasen, Fels | Paulsen & Körner 2014, Alpine Botany 124(1):1–12 | keine Baumgrenze (kein Klima-Feld) |
| (nach v1) Biom- und Flora-Breite | Biom-Gewichte stetig aus (T̄, N̄, Feuchte) nach Whittaker; ≥ 6 Felder mit eigenem Körper, 0 Aliase | Whittaker 1975; VB-03 | 23 Presets, 4 Aliase (Kiefer→Fichte, Erle→Weide, Palme→Weide, Zypresse→Tanne; :73998–74009) |
| Pflanzengesellschaft (Zeigerwerte) | Ellenberg L, T, K (1–9), F (1–12), R, N (1–9); Bestands-Mittel trifft den Standort ± 1 Stufe | Ellenberg et al. 2001; NW-FVA Waldartenliste 2011 | Nische ohne Zeigerwerte, ohne Licht unter Kronen (phyto-core.js:1963–1988) |
| Wiese | Halm-Kontrast auf Armlänge ≥ 10; geometrische Halme bis ≥ 30 m, dahinter Boden-Funktion ohne Wiederholung | aaa-abstand lesen:natur; <https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass> | 7,95 (10,99 → 8,20 → 7,95); Studio-Gras 14 + 4 m |
| Budget je LOD-Stufe | Baum ≤ 40 Befehle, ≤ 150 000 Dreiecke; Strauch ≤ 40 000; L1 ≤ 35 %, L2 ≤ 10 % | synthese §3.0 (W5); D5 | Baum 39 Befehle, 120–123k (V18.538, vorher 52 / 417k); Strauch 125 412 |

### 4.6 Schmiede (mit Arena)
**Ebenen:** 1 Stahl (Härte, Zähigkeit K_IC, Anlassfarbe), Eibe, Horn · 2 Klinge, Querschnitt, Gefäß, Wurfarm · 3 Schwert, Axt, Dolch, Bogen, Pfeil · 4 Duell, Spieler gegen Rudel, Arena; quer: Anschlag, Treffer, Glut der Esse.

> **Soll:** Eine Klinge, deren Masse, Balance und Härtelinie aus Last und Stahl folgen, schwingt in 0,25–0,6 s und trifft mit der Energie ihres Wirkpunkts. Ihr Hieb kündigt sich mindestens 0,25 s vorher an, sie klingt nach ihrem Grundton, und ihr Pfeil fliegt mit 63 m/s und bleibt stecken. Arena und Welt lesen EIN Kampf-Gesetz.

**Wirklichkeit**

| Bild / Ton | Lizenz · Urheber | warum |
|---|---|---|
| `REF\real-zweihaender.jpg` ([Walters 51.1335](https://commons.wikimedia.org/wiki/File:German_-_Two-handed_Sword_-_Walters_511335.jpg)) | gemeinfrei | Klinge, Fehlschärfe, Parierhaken, Griff eines echten Zweihänders — Proportion und Balance-Punkt. |
| [Katana (Masamune zugeschrieben), Hamon](https://commons.wikimedia.org/wiki/File:Katana_-_Masamune_-_Cropped_image_to_show_the_hamon.jpg) | CC BY-SA 4.0 · Kakidai | die Härtelinie als emergente Grenze zwischen harter Schneide und zähem Rücken — Soll für `hamonGesetz` (schmiede-core.js:2572). |
| [Traditional Blacksmith Forge](https://commons.wikimedia.org/wiki/File:Traditional_Blacksmith_Forge.jpg) | CC BY-SA 4.0 · Bellina 09 | Esse, Glut, Luftzug — Glühfarbe und Leuchtquelle. |
| `REF\real-hema.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Tarr_Bence_L%C3%A1szl%C3%B3,_HEMA_-_Historical_European_Martial_Arts.jpg)) | CC BY-SA 4.0 · Cyberguru | Hut, Distanz, Klingenbahn — die Pose gleicht dem Treffer-Volumen. |
| `REF\real-langbogen.jpg` ([Longbow Archer](https://commons.wikimedia.org/wiki/File:Longbow_Archer.jpg)) | CC BY 2.0 · Andrew Kuznetsov | Auszug, Biegelinie der Wurfarme, Anker am Gesicht — Bogen-Balkentheorie und Mündungsgeschwindigkeit. |
| [Stahlschmieden, Museum Szreniawa (Ton)](https://commons.wikimedia.org/wiki/File:WWS_Smithysteelforging2.ogg) | CC BY 4.0 · Work With Sounds / Museum of Municipal Engineering | Hammer auf glühendem Stahl und Amboss — Hör-Richter für Anschlag und Treffer aus f1 und Stoff. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Joseph Wright of Derby, An Iron Forge (1772)](https://commons.wikimedia.org/wiki/File:Joseph_Wright_of_Derby_%281734-1797%29_-_An_Iron_Forge_-_T06670_-_Tate.jpg) | gemeinfrei · Tate | das glühende Eisen als EINE Lichtquelle der Szene — Glut als Leuchtquelle (K11). |
| [Fiore dei Liberi, Fior di Battaglia, Getty fol. 22r (um 1410)](https://commons.wikimedia.org/wiki/File:Getty_Ms._Ludwig_XV_13_22r_-_Fiore_dei_Liberi_-_Four_Figures_with_Swords_-_Google_Art_Project.jpg) | gemeinfrei · Getty | Huten und Hiebe als lehrbare Daten — Kampf als Gesetz statt Literal-Pose. |
| [Gerrit Lundens, Drei Schmiede bei der Arbeit](https://commons.wikimedia.org/wiki/File:Gerrit_Lundens_-_Three_blacksmiths_at_work_in_a_forge.jpg) | gemeinfrei | Arbeitsablauf an Esse und Amboss, Werkzeug und Haltung — die Schmiede als Ort. |

**Prinzip**
- **Kingdom Come: Deliverance (Warhorse 2018), nur Prinzip:** fünf Hieb-Zonen plus Stich; die perfekte Parade im Fenster kostet keine Ausdauer, jeder Hieb und Block kostet sie. Übertrag: EIN Kampf-Zustands-Gesetz (Telegraph → Hieb → Erholung → Taumeln) für Spieler, Tier, Mensch. Quelle: <https://kingdomcomedeliverance.wiki.gg/wiki/Basic_Combat>.
- **Euphoria (NaturalMotion), nur Prinzip:** Treffer-Reaktion und Sturz aus Körper-, Muskel- und Motorik-Simulation statt Clips. Übertrag: Taumeln und Fallen folgen aus Impuls und Masse (AnazhRealm.STOSS), nie aus Literalen. Quelle: <https://en.wikipedia.org/wiki/Euphoria_(software)>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Hieb-Dauer + Winkelgeschwindigkeit | explosiv 0,25–0,35 s, Standard ≥ 0,6 s; Spitze 1 000–2 000 °/s (13,6–14,1 m/s) | <https://science-and-fiction.org/swordfighting/cuts.html>; quellen.json (HEMA) | √I: Langschwert ≈ 0,52 s, Großschwert ≈ 0,81 s, Dolch 0,25 s — im Band |
| Treffer-Energie | brauchbar < 100 J, Körpergrenze ≈ 330 J (Langbogen 170 lb ≈ 130 J); Wirkpunkt ≈ ⅓ Klinge ab Parierstange; dieselbe Waffe streut nicht × 5 | science-and-fiction; George Turner, <https://thearma.org/spotlight/GTA/motions_and_impacts3.htm> | V18.538: Hebel an der ersten Kontaktstelle (:81316), Großschwert 15–18 J nah, 91 J bei 1,7 m; 972127d8 (V18.539) trägt die Energie — nachmessen |
| Telegraph + Parade-Fenster | Ankündigung ≥ 0,25 s vor dem Treffer; Parade im Fenster ohne Ausdauer | science-and-fiction (Reaktion ≈ 250 ms); KCD Basic Combat | keine Kampf-Phasen-Uhr; Ritter-KI nur schmiede.js:749; 9/12 Bisse ohne Geste |
| Hieb-Richtungen + Stich | fünf Zonen plus Stich; Urteil trennt Schnitt, Stich, Schlag | KCD; `trefferUrteil` schmiede-core.js:3192 | vAx = 0, edgeQ = 1 immer (:81372–81383); eine Literal-Pose (:81887–81906) |
| Pfeilflug | v0 63–64 m/s (60-g-Pfeil, 150-lb-Mary-Rose-Nachbau); 64,29 → 49,07 m/s über 314 m, k ≈ 0,86·10⁻³/m | Strickland & Hardy 2005, The Great Warbow; maryrose.org | k 1,42·10⁻³/m (AR-02) |
| Pfeil im Ziel | steckt in Tier, Wand, Scheibe (stickArrow, Pool 40), Lab = Welt | schmiede.js:1446; entscheidung §6.2 (S2: ja) | despawnt bei Tier und Wand (:81838–81847) |
| Glühen + Anlassfarben | sichtbares Glühen ab 525 °C (Draper); hellstroh 205, dunkelstroh 226, braun 260, purpur 282, dunkelblau 310, hellblau 337 °C | <https://en.wikipedia.org/wiki/Draper_point>; <https://en.wikipedia.org/wiki/Tempering_(metallurgy)> | feste Anlassfarbe ohne Temperatur (schmiede-core.js:458); Hamon emergent aus K_IC (stimmt) |
| Klang der Klinge | f1 = (4,73²/2π)·√(EI/μ)/L² und Stoff; Treffer-Energie steuert den Pegel | schmiede-core.js:1769 (Gesetz vorhanden) | EIN Oszillator 0,16 s aus Tags; Faust = schwere Klinge; Bogen stumm (klang-core.js:1159–1166) |
| Ausdauer je Hieb | Kosten ∝ Arbeit (Masse, Trägheit); starke Hiebe und Blocks mehr, perfekte Parade 0 | KCD; AR-04 | flach 5 je Hieb, Dolch = Vorschlaghammer (koerper-core.js:566) |
| Budget Klinge | L0 ≤ 8 000 + L1 | B2c (synthese §1) | eine Stufe; Blatt 13 724 für jede Länge [gerechnet] |
| Arena = Welt | gleicher Hieb, gleicher Schuss: Schaden und Flugbahn ± 5 % | STUDIO-VOLLENDUNG §3.8 | Pfeil-k und Ausdauer nur in der Arena; Welt liest 5 Zahlen (:3087–3121) |

### 4.7 Garage (mit Wegen)
**Ebenen:** 1 Lack, Gummi, Reibwert des Belags · 2 Rad, Feder, Achse, Reifen · 3 Fahrzeug · 4–6 Fahrbahn, Furt, Brücke, Wegenetz; quer: Motor, Abrollen, Wind; Wasser.

> **Soll:** Der Wagen fährt auf einer Bahn, die das Gelände-Gesetz trägt: Grip und Rollwiderstand hängen am Belag, die Furt bremst ihn bis zur Watttiefe, der Motor singt seine Drehzahl, der Tacho zeigt km/h, und nach einem Stoß kommt er frei. Probefahrt und Welt rechnen denselben fahrSchritt.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| `REF\real-rallye-sprung-front.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Nikolai_Landa_w%C3%A4hrend_einem_Sprung.jpg)) | CC BY-SA 4.0 · Nikolai Landa | Federweg, Radstellung, Nick-Lage in der Luft — ballistische Vertikale und Landung. |
| `REF\real-drift2.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Drifting_car_on_racetrack.jpg)) | CC BY-SA 4.0 · Duniti | Schräglauf, Reifenrauch, Wanken — Reibkreis und Spur, die heute nur in garage.js leben. |
| [Pkw in der Furt, River Esk, Grosmont](https://commons.wikimedia.org/wiki/File:Car_crossing_the_ford_over_the_River_Esk,_Grosmont_-_geograph.org.uk_-_6580096.jpg) | CC BY-SA 2.0 · Humphrey Bolton | Wassertiefe am Rad, Bugwelle, Schritttempo — gegen 43 km/h durch 0,61 m Wasser (Schau 2). |
| [Hohlweg, Hechlingen](https://commons.wikimedia.org/wiki/File:Hohlweg,_Hechlingen,_Bavaria,_March_2025_01.jpg) | CC BY-SA 4.0 · Calistemon | der Weg als Gelände-Form (Böschung, Fahrbahn, Randbewuchs), nicht nur Farbe. |
| [Spurrillen bei Hillfield Farm](https://commons.wikimedia.org/wiki/File:Rutted,_muddy_track_near_Hillfield_Farm_-_geograph.org.uk_-_5308921.jpg) | CC BY-SA 2.0 · Trevor Littlewood | Schlamm und Spurrillen als Belag mit eigenem Grip und Rollwiderstand. |
| `REF\real-bergrennen.jpg` ([Commons](https://commons.wikimedia.org/wiki/File:Up_Hill_Climb_-_Oman_Air_Redline_Racing_Porsche_997_GT3_Cup.jpg)) | CC BY-SA 2.0 · Daniel Herrick | Straße am Hang mit Kurvenlage und Randbegrenzung — Fahrbahn als Bauwerk am Gelände. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [John Constable, The Hay Wain (1821)](https://commons.wikimedia.org/wiki/File:John_Constable_-_The_Hay_Wain_%281821%29.jpg) | gemeinfrei · National Gallery | ein Karren in der Furt, Wasser bis zur Nabe, der Weg führt hinein und hinaus — Furt, Weg und Fahrzeug als EINE Szene. |
| [Meindert Hobbema, Die Allee von Middelharnis (1689)](https://commons.wikimedia.org/wiki/File:Meindert_Hobbema_-_The_Alley_at_Middelharnis_-_WGA11427.jpg) | gemeinfrei · National Gallery | Weg mit Spurrillen, Gräben und Baumreihe als Fluchtlinie — der Weg ordnet die Landschaft und bleibt frei von Bewuchs. |

**Prinzip**
- **Forza Horizon (Playground 2012), nur Prinzip:** EINE Fahrphysik auf vielen gemeldeten Bodenarten; der Belag ändert den Grip, nicht das Gesetz. Übertrag: `_fahrBoden` liefert Belag-μ, Träger und Wassertiefe aus der EINEN Wege-Karte statt nur einer Höhe. Quelle: <https://gematsu.com/2012/06/forza-horizon-release-date-details-screenshots>.
- **Death Stranding (Kojima Productions 2019), nur Prinzip:** Spieler bauen Brücken und Straßen, die andere asynchron nutzen; der Weg ist ein Ergebnis des Spiels. Übertrag: Wege zwischen Orten werden geplant und gebaut, als Überlagerung, die die Neu-Erzeugung überlebt und über P2P reist. Quelle: <https://en.wikipedia.org/wiki/Death_Stranding>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Befreiung + Stand | nach Stoß frei ≤ 2 s; rückwärts ≥ 3 m in 2,5 s; Vorschau-GT an 10 Toren ≤ 15° und ohne Berührung | K12 | Vollgas endet nach 15–28 m; rückwärts 0,1 m; GT am Fels 38–40° |
| Grip je Belag (μ) | Asphalt trocken ≈ 0,9, nass ≈ 0,6; Kies gewalzt 0,6–0,7 / nass 0,3–0,5; Schnee, trockenes Eis 0,2; nasses Eis 0,1 | <https://www.engineeringtoolbox.com/tractive-effort-d_1783.html> | `_fahrBoden` liefert nur eine Höhe (:54253–54264); Vertrag ohne μ (vehicle-core.js:2554) |
| Rollwiderstand c_rr | Asphalt 0,01–0,015; Kies gewalzt 0,02; lose 0,04–0,08; loser Sand 0,2–0,4 | <https://engineeringtoolbox.com/rolling-friction-resistance-d_1303.html> | FAHR.rollDecel belagblind (vehicle-core.js:2405–2407) |
| Reifenkraft + Querbeschleunigung | Magic Formula mit D = Belag-μ; Skidpad ≈ 1,2 g (911 GT3: 1,21 g) | Pacejka; quellen.json (MotorTrend) | Reibkreis Zweispur (:2534–2895); 1,62 g (GA-02) |
| Fahrt im Wasser | Watttiefe 250–500 mm; ab ≈ 300 mm schwimmt ein Pkw; Widerstand bremst auf Schritttempo | <https://www.whatcar.com/advice/owning/how-to-drive-through-flood-water/n1221> | Schau 2: 43 km/h durch 0,61 m; K02 (V18.540) trägt den Wasser-Term — am Spielpfad nachmessen |
| Motor-Grundton | f = (U/min / 60) × (Zylinder / 2): 4 Zyl. bei 3 000 U/min = 100 Hz; Drehzahl über 0…vmax | Saab WIS, Engine Order Classification; K12 | 0 Motor-, Abroll-, Reifen-Klang (klang-core :396) |
| Tacho | Anzeige = Betrag(v_längs) × 3,6 km/h = Zahl der Probefahrt | vehicle-core.js:2215 (FAHR.kmh 3,6); K12 | Welt 0 Leser; Garage-HUD × 12 statt × 3,6 (garage.js:456) |
| Steigung je Wegeklasse | Karren ≈ 7 % (1:14), Tragtier 1:10, Fuß ≤ 12 %, Wohnstraße 5–8 %; darüber Treppe oder Serpentine | Practical Action; Wakefield Design Code B4.5.2 | keine Wege zwischen Orten; Wege-Karte = Farbe ohne Steigung (:69200–69213) |
| Wegbreite ländlich | einstreifig 3,0–3,5 m | RLW 99 (Regelquerschnitt Wirtschaftswege) | Dorf strasseW 5,0 / laneW 3,2 (fachwerk-core.js:2108); Feldwege fehlen |
| Kamera beim Fahren | 0 Fahrbilder mit der Kamera in Ästen oder Fels | K06 | 5 Fahrbilder in Fichtenästen |
| Budget Fahrzeug | L0 ≤ 20 000 + L1 im Kern | B2c; D5 | nur L0, 31 852 (vehicle-core.js:43) |
| (nach E) Endtempo aus Leistung | vmax aus Leistung, Luft- und Rollwiderstand; Ref. 911 GT3 311 km/h, 0–100 in 3,4 s; GT ≥ 55 m/s mit Luftphase | quellen.json (Porsche); entscheidung §6.2 (S1: ja, nach E) | Deckel ≈ 16 m/s (58 km/h) aus F0 80,5 (:2386–2394) |
| Labor = Welt | Welt == Labor ≤ 1e-15 m; Spur und Rauch aus dem Kern | 59ec5315; D2/D6 | Fahr-Schritt erfüllt; Spur/Rauch nur garage.js:261–311 |

### 4.8 Portale
**Ebenen:** 8 Übergang zwischen Welten, Taille, Studio-Eingänge im Genesis-Ring; getragen von 3 (Tor: Ordnungen, Flügel, Fundament, Glut-Kante) und 1 (Stein, Metall, Membran).

> **Soll:** Ein Tor, das statisch trägt: die Stützlinie liegt im Stein, kein Quader schwebt. Wie ein romanisches Stufenportal oder ein Muqarnas-Iwan weicht es in Ordnungen in die Tiefe. Es steht frei auf ebenem Platz, und in seiner atmenden Membran schimmert die Zielwelt wie ein Seifenfilm statt weißem Ausbrand. Auf E antwortet die Schwelle in unter 100 ms, der schwere Flügel schwingt über Sekunden auf, die Glut leuchtet feuerwarm, und in unter 2 s steht man drüben.

**Wirklichkeit**

| Bild | Lizenz · Urheber | warum |
|---|---|---|
| [Fürstenportal, Bamberger Dom](https://commons.wikimedia.org/wiki/File:Bamberg_Dom_F%C3%BCrstenportal_1.jpg) | CC BY 3.0 · Andreas Praefcke | Säulen und Archivolten treten Ordnung um Ordnung zurück — Vorbild der porta-Ordnungen; das Gewände zeigt, was die glatten Seitenflächen tragen müssten. |
| [Shah-Moschee Isfahan, Portal](https://commons.wikimedia.org/wiki/File:Mosque_Shah_-_Portal.jpg) | CC BY-SA 4.0 · Farhad Tafreshi | Muqarnas als gebaute fraktale Tiefe bis in die Halbkuppel — Soll für Filigran und Facette. |
| [Bab Mansour, Meknès](https://commons.wikimedia.org/wiki/File:Bab_Mansour_gate.jpg) | CC BY 3.0 · Jerzy Strzelecki | Hufeisenbogen im Rahmen, Zellij und Flechtband — das Armlängen-Detail, das heute fehlt. |
| [Fushimi Inari Taisha, Senbon-Torii](https://commons.wikimedia.org/wiki/File:Fushimi_Inari_Taisha_tunnel.jpg) | CC BY-SA 4.0 · Hyppolyte de Saint-Rambert | die Passage als Folge von Schwellen mit Licht in Streifen — heute hinter der Membran schwarz. |
| [Soap Film 1](https://commons.wikimedia.org/wiki/File:Soap_Film_1.jpg) | CC BY 4.0 · Simon Raffy | die reale Membran: Farbe aus der Filmdicke, wandernde Bänder, nichts brennt aus. |
| [Klosterruine Eldena](https://commons.wikimedia.org/wiki/File:Klosterruine_Eldena_1.jpg) | CC BY-SA 4.0 · Geolina163 | was steht, steht auf Auflagern; Schutt am Fuß — Richter für das Preset „Ruine“, dessen Quader heute über Luft schweben. |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [Flammarion-Holzstich (1888)](https://commons.wikimedia.org/wiki/File:Flammarion.jpg) | gemeinfrei | der Wanderer steckt den Kopf durch den Himmelsrand — die Membran ist eine Grenze, hinter der etwas liegt. |
| [Piranesi, Carceri, Tafel XIV „The Gothic Arch“ (1761)](https://commons.wikimedia.org/wiki/File:Giovanni_Battista_Piranesi_-_Le_Carceri_d'Invenzione_-_Second_Edition_-_1761_-_14_-_The_Gothic_Arch.jpg) | gemeinfrei | Tiefe aus Bögen hinter Bögen und Licht als Staffel — nicht aus Dreiecken (gegen 184k je Tor). |
| [Caspar David Friedrich, Abtei im Eichwald (1809/10)](https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Abtei_im_Eichwald_-_Google_Art_Project.jpg) | gemeinfrei | das Tor als Schwelle im Dämmerlicht, Nebel am Boden, dunkler Vordergrund, heller Himmel hinter dem Bogen. |

**Prinzip**
- **Portal (Valve 2007), Technik nach Lengyel (2005):** der Rahmen zeigt die Zielwelt aus einer zweiten, durch das Portal transformierten Kamera; schräge Nah-Clip-Ebene, Stencil auf die Öffnung, Rekursion gedeckelt. Übertrag auf das Profi-Band: Live-Sicht nur am aktiven Tor in der Nähe, sonst die gebackene Ziel-Postkarte (+1 Textur, 0 Pässe). Quelle: <https://terathon.com/lengyel/Lengyel-Oblique.pdf>.
- **Ratchet & Clank: Rift Apart (Insomniac 2021), nur Prinzip:** der Riss-Übergang trägt das Laden; eine Übergangs-Animation verdeckt den Rest. Übertrag: Membran-Atem und Durchschreiten sind die Lade-Hülle des Handshakes (enter/ready); die Zielwelt wärmt vor, sobald der Spieler sich nähert. Quelle: <https://www.axios.com/2021/07/20/sony-ps5-insomniac-ratchet-clank>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Bogen-Statik | Stützlinie in jeder Ordnung ganz im Mauerwerk; Halbkreisbogen t/R ≥ 0,1075 (Heyman 0,106); 0 Steine ohne Auflager | Heyman, The Stone Skeleton; Ochsendorf/Milankovitch | jambW heuristisch (porta-core.js:188–192); Ruinen-Quader schweben |
| Spitzbogen | gleichseitig: Radius = Spannweite, k = R/M = 2 | <https://en.wikipedia.org/wiki/Pointed_arch> | Regler k 1,0–3,4, Standard 2,6 (:81) |
| Kosten je Tor | L0 ≤ 60 000, L1 ≤ 21 000, L2 ≤ 6 000; ≤ 13 Draws je Tor; 0 Leck je Preset-Wechsel | porta-core.js:62; D5 | Hülle 184 000 auf EINER Stufe; 7 Tore am Spawn; Labor Kathedrale 1 445–1 605 Draws, +2 567 Geometrien je 7 Wechsel |
| Membran zeigt das Ziel | Y > 240 im Apertur-Fenster ≤ 5 %; Postkarte erkennbar; Farbe in Dünnfilm-Bändern | synthese §3.3 Nr. 3; Soap Film 1 | milchig-weiße Ellipse, dahinter schwarz |
| Tür als Zeitgesetz | planEval(t) unabhängig von dt; Studio = Welt ± 5 %; schwerer Flügel Sekunden (90° → 12° in ≥ 5 s) | 2010 ADA Standards §404.2.8.1; D6 | Labor 0,07 je Frame ↔ Welt 0,12 je Takt (porta.js:229 ↔ :48580); halber Weg ≈ 0,17 s |
| Glut-Licht | 1 850–2 000 K; Lichtmenge aus dem EINEN Leuchtquellen-Gesetz (K11), Portal-Licht im Pool | Kerzenflamme 1 850 K (PMC8261006); K11 | 0xffd9a0 ≈ 4 000 K [gerechnet]; r128-Einheiten; Welt-Glut ohne × π |
| Tor-Platz | 7 Ring-Tore streuen in der Bodenhöhe ≤ 1 m, Hang ≤ 8 %; kein Baum, keine Streu im Fußabdruck | bild-befund-portale §4; VB §4.3 | 44,5–71,0 m (26,5 m auf 22 m); Drachentor steht im Baum |
| Übergangs-Antwort | Taste → Reaktion ≤ 100 ms; Ziel warm ≤ 2 s interaktiv, kalt ≤ 5 s | <https://web.dev/articles/rail> | ungemessen; skeleton ohne Handshake (PO-03) |
| Stein- und Metall-Albedo | Stein 0,20–0,40 (Granit 0,20–0,25); Metall nach dem Farb-Gesetz ohne Grünstich; Labor = Welt auf Armlänge | engineeringtoolbox; Lehre 21 | Stein Y 0,295–0,321 (im Band); Metall HSL-Grün #4e7d51; Labor linear statt sRGB, Y-Verhältnis 0,41–0,53 |
| Gesetz-Anzeige = Bau | angezeigte = gebaute Ordnungen in 7/7 Presets | bild-befund-portale | 4/7 |
| Gestalten ehrlich | Seed als echte Achse (16 Bau-Hashes je Rezept) oder `gestalten: 1` | synthese §3.3 Nr. 2 | 16 gemeldet, 1 gebaut (porta-core.js:16–21, 56) |
| Rundreise durchs Portal | jedes Studio-Objekt Studio → Welt → Studio mit gleichem Fingerabdruck | D8 | Übergabe nur Körper + Tetrapoda; Portale ohne Export |

### 4.9 Klang (quer; klang-core)
**Ebenen:** 0 EIN Audio-Bus, EIN Ohr · 1 Stoff klingt (Schritt-Timbre, Klingen-Grundton, Minnaert-Blasen) · 3 Ereignis (Schritt, Hieb, Motor, Ruf, Stimme) · 5–7 Raum (Wald-Hall, Haus-Hülle, Höhle, Wetter) · 8 Musik, Ko-Präsenz.

> **Soll:** Die Welt klingt ab der ersten Geste. Jede Quelle — Wind, Wasser, Ruf, Schritt, Motor, Hieb — ist ein Ort plus ein Gesetz und läuft durch EIN Ohr mit Abstand, Hülle und Raum, gemischt auf −24 LUFS. Mit geschlossenen Augen hört man, wo man ist und was sich bewegt.

**Wirklichkeit (Ton)**

| Aufnahme | Lizenz · Urheber | warum |
|---|---|---|
| [Wolf howls](https://commons.wikimedia.org/wiki/File:Wolf_howls.ogg) | gemeinfrei | Grundton, Gleit-Kontur, Dauer eines großen Caniden — Richter für den Ruf mit f0 aus der Körpergröße. |
| [Hirschbrunft Gaggafeld](https://commons.wikimedia.org/wiki/File:Hirschbrunft_Gaggafeld.flac) | CC BY-SA 4.0 · 32-Fuß-Freak | tiefe Formanten und Echo im Bergkessel — ein großes Tier ruft lauter und weiter als ein Fuchs. |
| [Laubwald im Morgengrauen, Virginia](https://commons.wikimedia.org/wiki/File:2020-04-28_deciduous_forest.wav) | CC BY-SA 4.0 · Strebo7 | Morgenchor mit Dichte, Abständen, Raumanteil — Richter für Vogel- und Laubstimmen des UMWELT-Gesetzes. |
| [Bourne Woods, Regen und Wind](https://commons.wikimedia.org/wiki/File:Bourne_woods_rain_2020-05-10_0804.mp3) | CC BY-SA 4.0 · Robert EA Harvey | Regen-Textur und Böen im Wald als Außenpegel — daran misst sich die Hülle. |
| [Footstep on Gravel](https://commons.wikimedia.org/wiki/File:Footstep_on_Gravel_%28Gravity_Sound%29.mp3) | CC BY 4.0 · Gravity Sound | Kies als Schauer kleiner Stöße — Material-Klasse körnig gegen fest. |
| [2006 Porsche Cayman S, Motor](https://commons.wikimedia.org/wiki/File:2006_Porsche_Cayman_S_engine_sound.wav) | CC BY-SA 3.0 · John64 | Flat-6 vom Stand bis Autobahntempo mit Lastwechsel und Gangwechsel — Richter für den Fahr-Klang (heute 0). |

**Zeitlos**

| Bild | Lizenz | warum |
|---|---|---|
| [E. F. F. Chladni, Klangfiguren (1787)](https://commons.wikimedia.org/wiki/File:Clafig1.jpg) | gemeinfrei | Klang als sichtbares Gesetz: Schwingungsmoden als Knotenlinien — Klang aus Form und Stoff. |
| [Athanasius Kircher, Phonurgia nova (1673): Sprachrohre](https://commons.wikimedia.org/wiki/File:A._Kircher,_%22Phonurgia_nova...%22,_speaking_trumpets_Wellcome_L0025676.jpg) | CC BY 4.0 · Wellcome Collection | Schall durch Raum, Hülle und Öffnungen geführt — Vorlage für Räume, Portale und die Hülle am Ohr. |

**Prinzip**
- **Wwise Spatial Audio, Rooms & Portals:** Räume sind Objekte, Portale leiten den Hall und beugen den Direktschall; der Beugungswinkel wird Obstruktion (Dämpfung + Tiefpass). Übertrag: Hörer-y, Medium und Hülle in die EINE Hör-Stufe; Haus, Höhle, Seegrund dämpfen nach Gesetz. Quelle: <https://audiokinetic.com/en/blog/rooms-and-portals-with-wwise-spatial-audio>.
- **Wwise-Switch je Oberfläche:** das Material ist ein Switch je Spielobjekt, nie ein globaler State. Übertrag: das Material kommt aus der SICHTBAREN Fläche (Boden-Karte, Diele, Streu) für jeden Akteur, ohne Default-Fläche (fail-closed). Quelle: <https://blog.audiokinetic.com/footsteps-material-management-using-wwise-unreal-engine-4-unity-3d/>.

**Ziele**

| Größe | Ziel | Quelle | heute |
|---|---|---|---|
| Start beim Ankommen | Klang ab der ersten Nutzergeste (AudioContext.resume), in 100 % der v1-Läufe | <https://developer.chrome.com/blog/autoplay> | enabled: false (:733); Start nur über Knopf (:46589) oder Chat-Satz (:25882) |
| Lautheit Gesamtmix | −24 LUFS ± 2 LU (Konsole), −18 ± 2 (mobil); True Peak ≤ −1 dBTP | IESD Mix Ref Levels v03.02; Sony ASWG | −49,2 bis −23,4 LUFS an 6 Orten ohne Master-Ziel |
| Hülle am Ohr | Außenhülle ≥ 30 dB; unter Wasser dumpfer Tiefpass; Portale beugen | DIN 4109-1:2018 (Baunetz Wissen); Wwise Rooms & Portals | Regen in Höhle, Haus, Seegrund gleich −26,0 dB; Glut durch 32 m Fels hörbar (Q16, :10091–10168) |
| Hall im Wald | T60 ≈ 1,2–3 s, typisch ≈ 2 s (30-m-Pfad, 7 Bestände) | Albert et al. 2015, JASA 138(2):735–747 | keine Hall-Zonen |
| Tier-Ruf nach Masse | Frequenz ∝ M^−0,4, Reichweite ∝ M^0,6: der Bär ruft tiefer und weiter als der Fuchs | Fletcher 2004, JASA 115(5):2334, <https://www.phys.unsw.edu.au/music/people/publications/Fletcher2004.pdf> | f0 ∝ L^−0,9 (≈ M^−0,3); Pegel nur am Abstand; Bär so laut wie Fuchs (klang-core.js:449–459) |
| Schritt-Takt + Material | Töne = Frequenz × Zeit ± 15 % bei 1,15 und 5,16 m/s; Material aus der sichtbaren Fläche, mindestens fest ↔ körnig; Peers und Tiere klingen | K07; Giordano et al. 2012, JASA 131(5):4002 | 2 Töne in 6 s; Gras, Streu, Weg, Diele, Sand, Schnee ohne Timbre; ein Rufer (:58521) |
| Motor-Stimme | Grundton = U/min/60 × Zylinder/2, Drehzahl über 0…vmax, dazu Abrollen und Wind | Saab WIS; K12 (klang-core FAHRT) | keine Fahrzeug-Stimme (:396) |
| EINE Hör-Stufe | jede Quelle: −6 dB je Abstandsverdopplung, Luft-Tiefpass, Hörschwelle −64 dB, Deckel 7 Stimmen | klang-core.js:397–401, :952–981 (für die Umwelt vorhanden) | SUBSTANZ-Ereignisse ohne Position direkt am Master (:10333–10337) |
| Physik der Umwelt-Stimmen | Minnaert f·r ≈ 3,26 m/s (1 mm ≈ 3,3 kHz); Dolbear N = 4T − 160 (°F) | <https://en.wikipedia.org/wiki/Minnaert_resonance>; <https://en.wikipedia.org/wiki/Dolbear%27s_law> | erfüllt: Gesetz ↔ Offline-Render ≤ 0,5 dB (604f9391) |
| Musik aus dem Studio | 19/19 Lab-Instrumente klingen über EINEN `musikGraph` aus dem Kern; Form-Takte treffen | synthese §3.8 | 0/19; Lofi trifft 2/8 iiVI-Positionen, Blues 3/12 |

---

## §5 Was jeder Arbeiter-Prompt künftig zitiert

Ein Arbeiter-Prompt beginnt wie bisher mit dem Kartenkopf (entscheidung §4). Danach kopiert er den **Kopf-Block** und den Block **seines** Studios — wörtlich, ohne Ergänzung. Die Zahlen „heute“ sind der Stand dieses Blatts; die Karten-Linse misst sie vor dem Schnitt neu.

**Kopf-Block (jeder Prompt)**
```
NORDSTERN (artifacts/profiband/nordstern/nordstern.md) — Kopf
Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion.
EBENEN: 0 Substrat (three r184 WebGPU: Licht, Schatten, Luft) · 1 Stoff · 2 Bauteil · 3 Objekt · 4 Ensemble · 5 Ort · 6 Siedlung/Biom · 7 Welt · 8 Ultiversum · quer das Feld.
STOFF ≠ TEXTUR: die Textur ist der gebackene Abdruck des Stoff-Gesetzes, nie gespeichert, nie gemalt.
NACH OBEN reist nur das Ergebnis, NACH UNTEN nur die Randbedingung.
MUSTER M0–M8: Substrat-Treue · EIN Kern · Regler = Gesetz · Soll-Bild + Zahl · Budget je LOD · EIN Plan · Bild-Schleife · Verben im Kern · Linse mit Selbsttest. Commit: „Muster n/9“.
SAMMLUNG vor dem ersten Tool: (1) Soll-Bild deines Studios ansehen (§4) (2) die EINE Zahl lesen: heute → Ziel, Quelle (3) eine Zeile: Chokepoint + was stirbt.
ZAHL: im Studio UND am gebauten Welt-Boden; vorher ↔ nachher auf derselben Bühne (__buehne); Bild aus dem Ausgabe-Pfad.
SCOPE: „(nach v1)“ ist Soll-Bild, kein Auftrag. Pflicht-OFFEN und Feature-Stopp setzt nur der Schöpfer.
```

**Gelände**
```
STUDIO Gelände (Pilot, Welt-Engine) · Ebenen 5–7 + 0 (Luft, Himmel, Wasser) · Kern gelaende-core (K09a) · Karten K09b, G2 T1/T2/T5
SOLL: Jedem Hang sieht man an, wohin sein Wasser läuft — Auen, U-Täler, Kliff über Schutthang, Dünen; EINE Luft, ein Himmel aus Physik.
BILD: Lauterbrunnental (Trog) · River Towy (Mäander) · Monument Valley (Kliff/Schutthang/Pediment) · Friedrich, Nebelmeer (Luft)
ZAHL: Senken > 1 m ≤ 1/km² (heute 32,9) — Lindsay & Creed 2005
ZAHL: Flint θ 0,3–0,7 mit tragender Regression (heute −0,418, R² 0,027) — esurf 12/1347/2024
ZAHL: ≥ 3 Dorfplätze ≤ 8 % je Welt, Hammond-Ebenen vorhanden (heute 0/16 sanfte km²-Fenster) — USGS SIM 3085
ZAHL: Schicht-Gesetz Kliff ≥ 60°, Schutthang 33–37°, Pediment 0,5–7° (heute Terrassen-Sperre < 19°)
BUDGET: ≤ 6 µs je Spalte, Chunk-Bau-Takt p95 ≤ +10 % (OMEN)
PRINZIP: Großform als Daten-Splines (Minecraft 1.18), Netze zuerst (Ghost Recon Wildlands)
MESSEN: gebaut (_chunkSurfaceAt) neben Makro, 30-m-Raster, Rohdatei nach artifacts/profiband/grund/
```

**Fachwerk**
```
STUDIO Fachwerk · Ebenen 1–6 · Kern fachwerk-core (+ gelaende-core für den Ort) · Karten K08 (V18.540), K11, K10
SOLL: Ein Dorf wächst aus seinem Hang; Balken folgen der Spannweite; Gassen längs der Höhenlinie, Treppe in der Falllinie; nachts 2–5 lx am Platz.
BILD: Fachwerk-Rohbau Neualbenreuth · Obergasse 11 Alsfeld · Freudenberg · Masuleh · Merian, Marburg · Grimshaw, Moonlight
ZAHL: Sockel-Median 2,72 m → 0, Türen erreichbar 0/2 → alle, GT auf dem Dorfweg 5,2 m/8 s → ≥ 60 m — K10
ZAHL: Plan-Hash Studio = Welt; 12/12 Schichten reisen (heute 8/12)
ZAHL: Balken h/L 1/20–1/30, w ≤ L/300 aus EN 338 C24/D30 (heute balkenH 0,21 fest)
ZAHL: Dorf nachts Lichter = Laternenzahl des Plans (heute 0), 1 850–2 000 K — EN 13201 P4–P6
BUDGET: Mess-Dorf Befehle ≤ Stand nach K08 (Karte K10: 93; V18.540 gemessen 97), Dreiecke ≤ 609k + 5 %; Haus-Fern = Karte im EINEN Atlas
PRINZIP: CGA-Grammatik je Epoche (Müller 2006), Dorf auf beliebigem Gelände (Emilien 2012)
MESSEN: gate:settlement erweitert; Bild-Paar Tag/Nacht an der Stelle von Auge 03/05
```

**Körperstudio**
```
STUDIO Körperstudio (+ Ninja-Park) · Ebenen 1–4 · Kern koerper-core · Karten K07 (EIN Gang-Gesetz), K06 (Kamera-Leib)
SOLL: 1,3 m/s bei ≈ 1,8 Schritten/s, der Fuß steht, der Blick führt den Kopf; 17 Lidschläge/min; dieselbe Laufzeit für Spieler, Peer, Bewohner.
BILD: Muybridge-Gang (Wellcome) · Profil (Bergen PL) · Gesicht (Ferdina) · Vitruvianischer Mensch · Bruegel, Bauernhochzeit
ZAHL: Kadenz bei 1,15 m/s ≥ 1,5 Schritte/s (heute 0,34) — physio-pedia, Weidmann 1993
ZAHL: Gleiten < 5 %, Töne = Frequenz × Zeit ± 15 % (heute 130 %, 2 Töne/6 s)
ZAHL: Tastgrad Gehen 0,55–0,7, Laufen ≈ 0,39 — Alexander 2004
ZAHL: 0 Duale (AUGEN_VIS, KPMUL_VIS, NINJA_VIS; heute 3)
BUDGET: L0 ≤ 40 000 (heute 162 412), L1 mit Haar-Karte
PRINZIP: Motion Matching als Richter (Clavet 2016), FACS-AU-Gewichte aus dem Feld
MESSEN: gate:tier-gang auf den Spieler-Leib erweitert; Bildfolge 6 Bilder in festen Sim-Schritten an s0-atrium
```

**Tetrapoda**
```
STUDIO Tetrapoda · Ebenen 1–4 · Kern tetrapoda-core · Karten K07 (EIN Gang-Gesetz), K06
SOLL: Rudel trabt 8–9 km/h geschlossen, Galopp mit Flugphase bei Fr 2–3; Pfote ohne Gleiten; Herde flieht als ein Körper; Individuum aus dem Seed.
BILD: Muybridge, Horse in Motion · Fuchs im Trab (NPS) · Bär im Gang · Wolves hunting elk (NPS) · Muybridge, Hund Dread
ZAHL: Gangwechsel Schritt→Trab Fr ≈ 0,35, Trab→Galopp Fr 2–3 (heute eine Gangart) — Griffin 2004, Alexander 1984
ZAHL: Gleiten < 5 %, Ratsche gate:tier-gang 0,2 → 0,05 (heute 9–23 %)
ZAHL: λ/h = 2,3·Fr^0,3 (heute λmax 1,43 m, 5,5–6,6 Hz) — Alexander 1976
ZAHL: Jagd-Frames > 0 ohne Spieler (heute 0 in 57 s); Kohäsion mit 2 Nachbarn — Rands 2014
BUDGET: L0 ≤ 20 000 (Wolf heute 55 302), L1 ≤ 3 000 ab 35 m
PRINZIP: Boids als Summe je Tier (Reynolds 1987), Ökosystem ohne Spieler (RDR2)
MESSEN: dieselbe Gang-Linse wie Körper; 0 Paar-Frames > 10 cm Durchdringung
```

**Phytogenesis**
```
STUDIO Phytogenesis (worlds/terrain) · Ebenen 2–6 · Kerne phyto-core + foundry-core · Karten O4 (weiße Masse); Wind/Transluzenz/Oben-Ansicht ohne Karte
SOLL: Der Wald wächst nach seinem Standort — schlank im Bestand, breit im Offenen, Kronen mit Lücken, Laub leuchtet im Gegenlicht, nah = fern = oben.
BILD: Mischwald Südtirol · Rudka-Hang (Mosaik) · Tenter Bach (Unterwuchs) · Solitäreiche Marbach · Dürer, Rasenstück · Schischkin
ZAHL: Kronendeckung Chunk-Zone = Fern-Farbe ± 10 Pp, ΔE00 ≤ 2,3 an der Ring-Kante (heute Splitter von oben)
ZAHL: H/D im Bestand 40–100 (heute ≈ 7–25 [gerechnet]) — waldwissen, McMahon 1973
ZAHL: Wind f0 ∝ DBH/H², Stamm < Ast < Blatt (heute omega ungelesen) — Moore & Maguire 2004
ZAHL: Halm-Kontrast Armlänge ≥ 10 (heute 7,95); Bestandes-Albedo Laub 0,15–0,18
BUDGET: Baum ≤ 40 Befehle / 150 000 Dreiecke (heute 39 / 120–123k), Strauch ≤ 40 000 (heute 125 412)
PRINZIP: Wind-Hierarchie + Oben-Billboard (SpeedTree), Dichte-Regeln als Felder (Horizon Zero Dawn)
MESSEN: werkbank albedo / diag-albedo-zensus nah gegen fern am selben Ort; Blick 60/120/420 m
```

**Schmiede**
```
STUDIO Schmiede (+ Arena) · Ebenen 1–4 · Kern schmiede-core · Karten K01 (V18.539), K13, S2 steckende Pfeile
SOLL: Masse, Balance, Härtelinie aus Last und Stahl; Hieb 0,25–0,6 s, Telegraph ≥ 0,25 s; Pfeil 63 m/s, er bleibt stecken; EIN Kampf-Gesetz.
BILD: Zweihänder Walters · Katana-Hamon (Kakidai) · HEMA (Cyberguru) · Wright of Derby, An Iron Forge · Fiore dei Liberi
ZAHL: Klick-Pfad-Matrix 96/96 Fälle Schaden > 0 (K13)
ZAHL: Pfeil-k 0,86·10⁻³/m (heute 1,42·10⁻³) — Strickland & Hardy 2005
ZAHL: Treffer-Energie < 100 J brauchbar, Wirkpunkt ⅓ Klinge; dieselbe Waffe streut nicht × 5
ZAHL: Arena = Welt ± 5 % in Schaden und Flugbahn
BUDGET: Klinge L0 ≤ 8 000 + L1 (heute 13 724, eine Stufe)
PRINZIP: Zonen + Parade-Fenster (Kingdom Come), Sturz aus Impuls und Masse (Euphoria)
MESSEN: diag-kampf-gefuehl über den KLICK-Pfad; Bild 3rd, Horizont-Blick, Klinge im Wolf
```

**Garage**
```
STUDIO Garage · Ebenen 1–6 (Weg) · Kern vehicle-core · Karten K02 (V18.540), K12; S1 Tempo nach E
SOLL: Grip und Rollwiderstand am Belag, die Furt bremst bis zur Watttiefe, der Motor singt die Drehzahl, Tacho km/h, nach dem Stoß frei.
BILD: Furt River Esk · Hohlweg Hechlingen · Spurrillen Hillfield · Rallye-Sprung (Landa) · Constable, The Hay Wain
ZAHL: frei ≤ 2 s nach Stoß; rückwärts ≥ 3 m in 2,5 s (heute 0,1 m) — K12
ZAHL: Vorschau-GT an 10 Toren ≤ 15°, ohne Berührung (heute 38–40° am Fels)
ZAHL: Tacho = Betrag(v_längs) × 3,6 = Probefahrt; Motor f = U/min/60 × Zyl/2
ZAHL: Belag-μ Asphalt 0,9 … nasses Eis 0,1; c_rr 0,01 … 0,4 (heute belagblind)
BUDGET: L0 ≤ 20 000 (heute 31 852) + L1
PRINZIP: EINE Fahrphysik, viele Beläge (Forza Horizon); Wege als gebaute Überlagerung (Death Stranding)
MESSEN: diag-fahr-leben (S1 Welt == Labor), gate:klang-zensus
```

**Portale**
```
STUDIO Portale · Ebene 8 (+ 3, 1) · Kern porta-core · Karten O2 S3-Tor, O3 Genesis-Rest; Ziel-Postkarte ohne Karte
SOLL: Ein Tor, das statisch trägt, in Ordnungen in die Tiefe weicht, frei auf ebenem Platz steht; die Membran zeigt das Ziel wie ein Seifenfilm.
BILD: Fürstenportal Bamberg · Shah-Moschee Isfahan · Soap Film 1 · Klosterruine Eldena · Piranesi, Carceri XIV · Flammarion
ZAHL: Stützlinie im Stein, t/R ≥ 0,1075, 0 Steine ohne Auflager — Heyman
ZAHL: Membran ausgebrannt ≤ 5 % der Apertur (heute milchig-weiß)
ZAHL: Tor-Platz Höhenstreuung ≤ 1 m (heute 26,5 m); Taste → Reaktion ≤ 100 ms — web.dev RAIL
ZAHL: Gesetz-Anzeige = Bau 7/7 (heute 4/7); gestalten ehrlich (heute 16 gemeldet, 1 gebaut)
BUDGET: L0 ≤ 60 000, L1 ≤ 21 000, L2 ≤ 6 000 (heute 184 000 auf einer Stufe)
PRINZIP: zweite Kamera nur nah, sonst gebackene Postkarte (Lengyel 2005); Übergang trägt das Laden (Rift Apart)
MESSEN: Haus-fern-Linse auf porta übertragen; Band an Wiese und Genesis nicht schlechter
```

**Klang**
```
STUDIO Klang (quer) · Ebenen 0, 1, 3, 5–8 · Kern klang-core · Karten K07 (Schritt), K11 (Glut), K12 (FAHRT); musikGraph ohne Karte
SOLL: Die Welt klingt ab der ersten Geste; jede Quelle ist Ort + Gesetz durch EIN Ohr mit Abstand, Hülle, Raum; −24 LUFS.
BILD/TON: Wolf howls · Hirschbrunft Gaggafeld · Laubwald im Morgengrauen · Footstep on Gravel · Chladni, Klangfiguren
ZAHL: Lautheit −24 LUFS ± 2 LU, True Peak ≤ −1 dBTP (heute −49,2 … −23,4 ohne Master-Ziel) — IESD
ZAHL: Hülle ≥ 30 dB (heute Regen in Höhle = Haus = Seegrund −26,0 dB) — DIN 4109-1
ZAHL: Ruf f ∝ M^−0,4, Reichweite ∝ M^0,6 (heute Bär = Fuchs) — Fletcher 2004
ZAHL: Wald-Hall T60 ≈ 2 s (1,2–3) — Albert et al. 2015; Schritt-Töne = Frequenz × Zeit ± 15 %
BUDGET: Hörschwelle −64 dB, Deckel 7 Stimmen, EINE Hör-Stufe für jede Quelle
PRINZIP: Rooms & Portals, Material-Switch je Objekt (Wwise)
MESSEN: gate:klang-zensus; Gesetz ↔ Offline-Render ≤ 0,5 dB (Vorbild 604f9391)
```
