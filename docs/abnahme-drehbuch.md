# Das Abnahme-Drehbuch — DIE EINE Schöpfer-Runde (V18.492, 18 Schritte)

> **Zweck:** EINE Browser-Session, die das ERLEBNIS des Feld-Stands bestätigt. Alles hier ist
> vorab maschinell verifiziert (Merge-Gate „Alle Invarianten OK" + npm run check + Domänen-Gates
> + Boot-Sonde echtes WebGPU). Die Runde ist ABNAHME — der Scope/Ship-Entscheid des Schöpfers,
> **KEIN Merge-Tor**: kein Arbeiter wartet auf das Auge (BETRIEBSGESETZ #4); Maßstab der Arbeit
> bleiben Studio-Gesetze + Zahlen + Absenz-Grep + die eigene Blick-Sonde. Die alte
> 20-Schritt-Matrix-Runde (V18.490.1) ist gefallen — git trägt sie.
>
> **Vorbereitung:** `npm run start` · Browser auf die Welt · HUD/Flugschreiber an. Je Punkt ein Wort.

| # | Schritt | Kriterium | ✔/Wort |
|---|---------|-----------|--------|
| 1 | Frischer Boot, einmal umsehen | Welt hell/lebendig; der Horizont steht bis 40 km (Fern-Ring + Panorama); KEINE Wasser-Spiegelung in ungeladenen Löchern; Konsole 0 Fehler/0 Destroyed-Warns | |
| 2 | Auf die Wiese schauen, nah und fern | Gras ist Boden-FUNKTION: nah Halm-Schattierung im Boden, fern Meadow-Grund — HUD: 0 Gras-Instanzen/0 Gras-Tris | |
| 3 | Chat `dorf 7 18`, von fern nähern | ferne Bauten SICHTBAR als Feld-Gestalt (nicht weggecullt); Häuser verschieden: Kirche (Kuppel), Gasthaus, Scheunen | |
| 4 | An ein Haus heran (< 16 m), durch die Tür | die Hand-Blase trägt die Interaktion: Tür öffnet physisch, Betreten lebt, Kollision == Optik | |
| 5 | Einen Bau anvisieren und abbauen | Interaktion lebt trotz Feld-Gestalt (der unsichtbare Interaktions-Träger) — der Bau fällt sichtbar | |
| 6 | `fahrzeug_gt` spawnen, aufsitzen | Sitz IM Cockpit; Chase-Cam fährt hinter dem Wagen; in geschlossener Kabine ist der Fahrer unsichtbar | |
| 7 | Fahren (auch mit Pfeiltasten), Handbremse in der Kurve | Zweispur-Gefühl: Karosserie legt sich, Heck bricht kontrolliert aus (Drift emergent); Pfeile == WASD | |
| 8 | Tiere im Gang beobachten (nah) | das Tier IST sein Feld: die Glieder animieren im Gang (Matrix der Matrix), die Zerlegung trägt die Auflösung | |
| 9 | 5 Wölfe dazu spawnen, HUD `weltMarch` lesen | Einträge steigen (~+60), Bricks nur ~+12 — EIN geteilter Glieder-Satz für alle (die Dedup sichtbar) | |
| 10 | Sprint + Parkour: Wandsprung, C-Rutsch bei Tempo, Klettern | Gesetze fühlbar: Sprint deutlich schneller (×4.5), Rutsch feuert, Klettern zehrt Ausdauer | |
| 11 | Dolch → Grossschwert → Keule wechseln, zuschlagen | Schwung flink→träge, Reichweite kurz→lang, Schaden matt→wuchtig; Hit-Stop energie-skaliert | |
| 12 | Eine Kreatur NACHTS ansehen | Augen glimmen DEZENT (0.3); das Feld leuchtet NICHT aus sich selbst — es gehorcht derselben Tag/Nacht-Farbe wie die Welt | |
| 13 | Zum Genesis-Ring, durch die Membran | Bodennebel atmet in Membran-Farben, EIN warmes Licht pulst; Hindurchgehen IST Betreten | |
| 14 | Symphonie an; Genre wechseln (LoFi → Trap → Bossa → Cinematic) | Drums UND Harmonie/Lead/Bass klingen distinkt; LoFi kippt harmony-lastig | |
| 16 | Werkstatt öffnen, einen Bauplan wählen, in der Welt platzieren | v1.0-Schritt 3: ≤ 3 Klicks vom Öffnen bis zum stehenden Werk; der Werkstatt-Regler prägt, was platziert wird | |
| 17 | Chat OHNE KI: `pflanz mir einen eichenhain am wasser` | v1.0-Schritt 4 (Grundstufe): 6 Studio-Eichen wachsen am nächsten Ufer, geerdet, keine im Wasser | |
| 18 | KI an (Einstellungen → Begleiter, eigener Schlüssel): „lass mir ein paar Birken und ein Fachwerkhaus wachsen" | v1.0-Schritt 4: die KI antwortet UND die Welt verändert sich (spawn_studio — dieselben Baupläne wie die Werkstatt) | |
| 15 | Schnell umsehen, dann ~2 min stehen; HUD + Konsole | Auflösung fällt bei Bewegung imperzeptibel und kehrt flicker-frei zurück; Konsole bleibt still; der Flugschreiber-Trace POSTet — Tris/dc/weltMarch gegen den letzten Trace lesen | |

**Stehende Ein-Wort-Defaults** (bestätigt, nur bei Widerspruch melden): Materialisierungs-Pop
der Hand-Blase = Streaming, kein eigener Fall · glutbrunnen/glut_var = bewusste
Nicht-Studio-Silhouette (Welt-Substanz) · fliegende Inseln + start_plattform = Welt-Substanz.

**Abschluss:** 18 ✔ = das Wort des Schöpfers über Scope/Ship (Schritt 15 zuletzt: sein Trace ist der FPS-Boden-Beweis, p95 ≤ 33 ms). Optional danach:
`npm run look-golden -- --mint` auf dem Schöpfer-Holz — das Golden bewacht ab dann jeden Push.
