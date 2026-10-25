# Bewertung 25.10.2026 — AnazhRealm aus allen Perspektiven, mit SWOT

Erdung vor der Woche ab 29.10. Gemessen an main 8f1802b1 (V18.546.91), dem Auge auf der Radeon am 25.10. und den Zahlen der Woche.

## Die Zahlen

| | |
|---|---|
| Alter | erster Commit 18.04.2026; 5 918 Commits auf main, 3 748 davon in 30 Tagen (~125 je Tag) |
| Spiel-Code | Stamm 125 119 Z. (52 Dateien, EINE Klasse) · 10 Kerne 40 789 Z. · Studios 16 901 Z. → **~183 k** |
| Prüf-Apparat | scripts/ **206 451 Z.** in 214 Dateien · 140 Gates · check.yml 1 611 Z. in 18 Gruppen → größer als das Spiel |
| Ziel v1.0 | EIN gespielter Pfad bei p95 ≤ 33 ms auf jedem Standardgerät; Meisterkarte **95/330 (29 %)** |
| Pflicht-Offen | A AAAA je Klasse · B Ankunft (GTX kalt 16,6 s, Ziel 5 s) · C Verkehr (neu) · E Profi-Band (GTX Frame p95 16,8 ms ok, CPU-Takt 6,3 > 5,8 ms; Radeon-ABAB am Kopf seit 14.10. offen) |
| Effizienz | 43 → 95 Punkte für 98 % Wochen-Budget = 0,53 Punkte/% (Ziel 1); 14 Züge; das Budget war in 1,5 Tagen verbraucht |
| Dokumente | 10 .md in docs/ — schlank, die Chronik ist git log |

## Perspektiven

- **Spieler:** Wo das Gesetz ganz fließt, ist es schön: Mess-Wiese, Birkenhang, Tageslicht, Fachwerkhaus. An den Übergängen bricht es:
  Gras endet nach ~10 m in einer Fläche, die Nacht ist leer und die Kuppeln bleiben hell, Portal-Bögen sind kantig, die Ankunft dauert
  kalt ~17 s. Spielbar als Erkundung, noch nicht als „ein gespielter Pfad“ von Ankunft bis Teilen.
- **Architektur:** Die stärkste Seite. Welt als Funktion, EINE Quelle je Domäne, Studios als Gesetzbücher mit Vertrag v1.2, der Wirt
  erzeugt nichts selbst. Schwäche: der Stamm ist mit 125 k Zeilen EINE Klasse — Kontext-Kosten für jeden Agenten.
- **Leistung/Hardware:** Ehrlich gemessen auf zwei echten GPUs (GTX 1060, Radeon 890M) mit ABAB und Haushalt. Nur zwei Geräte; Telefon und
  Mac sind offen, swiftshader in der CI verbirgt Präzisionsfehler.
- **Qualitätssicherung:** Diszipliniert (Linsen mit Selbsttest, Täter beim Namen) — aber zu schwer: der Apparat ist größer als das Spiel,
  Gruppe 18 wurde auf Zweigen nie grün, ein Wackler (L2a) blockierte vier Zweige und am 25.10. 19:12 sogar einen reinen Doku-Zug.
- **Prozess:** Stark verbessert: Züge, Buchung und Messplatz ohne LLM, Mess-Takt, Einlass, Übergaben. Schwach: dem Dringenden hinterher,
  A/B/E bekamen diese Woche keine Karte; Sammelzüge stauen.
- **Ökonomie:** 0,53 Punkte je %; Sprint-Leerlauf-Rhythmus (1,5 Tage Vollgas, 4 Tage Pause); Agenten kosten 200–250 k Token je Karte.
- **Wissen/Risiko:** Ein Mensch plus wechselnde Agenten und Accounts; das Wissen lebt in Gedächtnis-Dateien, koordination und git.
  Das Zug-Werkzeug (`artifacts/profiband/werkzeug`, gitignored) lag nur auf dem Laptop — seit 25.10. gesichert in koordination
  `sicherung/werkzeug-2026-10-25/`.
- **Offenheit:** Öffentliches Repo, CI-Minuten frei; einzigartige Position (prozedurale Gesetzes-Welt im Browser, WebGPU).

## SWOT

| **Stärken** | **Schwächen** |
|---|---|
| Gesetzes-Architektur: EINE Quelle je Domäne, Studios als Gesetzbücher, Welt als Funktion | Prüf-Apparat (206 k Z., 140 Gates) größer als das Spiel; er erzeugt eigene Röte (Gruppe 18, L2a) |
| Bildqualität, wo das Gesetz fließt (Wiese, Wald, Tageslicht, Fachwerk) | Übergänge: nah→fern (Gras-Kante), Tag→Nacht, Studio→Welt (Portale), Ankunft 17 s statt 5 s |
| Ehrliche Messung: Punkte als Funktion des SHA, zwei echte GPUs, ABAB, Profi-Band | Die Ziele A, B, E blieben diese Woche ohne Karte; Radeon-ABAB am Kopf seit 14.10. offen |
| Automatik: Züge, Buchung, Messplatz-Dienst laufen ohne LLM | 0,53 Punkte/% statt 1; Sammelzüge stauen, Wackler-Fixe hängen hinter fremder Röte |
| Breite Generatoren: 8 Studios, 5 Wagen-Gattungen, Epochen bis Hochhaus, 4 Labore im Eingang | Stamm = EINE Klasse mit 125 k Z.; ~125 Commits je Tag — hoher Kontext und hoher Wandel |
| Lernende Kultur: Goldene Definition, Betriebsgesetz, Regeln aus Fehlern, ehrliche Null-Buchungen | Wissen verteilt auf Gedächtnis, koordination, lokale Ordner; Sprawl (166 Worktrees, 678 Zweige bis 25.10.) |

| **Chancen** | **Risiken** |
|---|---|
| Stadt-Gipfel als EINE Stressbühne deckt viele Schwächen auf einmal auf → große, gezählte Schnitte für E | Scope-Explosion: Vision (Jahrhunderte, Flugzeuge, Haare) zieht von v1 weg; Feature-Stopp bröckelt |
| Verkehr C + Studio-Eingang (Motorrad, Aufzug, Vögel AAA, Flugkörper) auf dem bestehenden Vertrag — Tiefe mit wenig neuer Architektur | Der Apparat wächst sich selbst: Gates gebären Gates, Röte kommt aus dem Prüfen statt aus dem Spiel |
| Apparat-Diät: Gates in Familien bündeln, CI-Gruppen neu wiegen → schnellere Züge, weniger Wackler | Budget-Rhythmus: Token-Limit erzwingt Sprint und Leerlauf; die letzten 235 Punkte werden teurer |
| Messplatz-Blick (KURS, FRESSER, `--kurz`) + Spur je Agent → Balance wichtig vor dringend messbar | Nur zwei Messgeräte; Telefon, Mac und andere Treiber ungeprüft; WebGPU-Treiber-Unterschiede |
| Tägliches Auge: 10 min Spielen findet, was Gates nicht sehen | Vendor: Lehren hängen an three r184-Interna (Bundles, Attribut-Halten) — ein Update kann viele brechen |
| Offene Quelle: Sichtbarkeit, externe Prüfer (Grok), Gemeinschaft | Ein Mensch, viele Accounts und Sitzungen: Wissensverlust bei Wechseln, lokale Werkzeuge außerhalb von git |

## Urteil

Vision und Architektur: **sehr stark** — selten so konsequent. Bildqualität: **gut**, wo das Gesetz fließt, **mittel** an den Übergängen.
Weg zu v1.0: **etwa ein Drittel** (Karte 29 %, A/B/E offen). Prozess: **gut und steigend**. Effizienz: **unter Ziel**.
Der größte Hebel ist nicht neue Breite, sondern **Tiefe am Ziel**: die Übergänge und die Ankunft heilen, den Apparat verschlanken,
und jeden Tag zuerst eine Karte für A, B, C oder E.

## Die drei Hebel für die nächste Woche

1. **Wichtig vor dringend** (START §7): ≥ 30 % je Tag für A/B/C/E, erste Karte des Tages eine Pflicht-Karte, tägliches Auge.
2. **Wurzel der Röte:** L2a-Fix allein und zuerst, Gruppe 18 heilen, dann die Apparat-Diät (Gates in Familien, CI-Waage).
3. **Stadt-Gipfel messen, dann schneiden:** die Zahl führt; Verkehr C und die Labore folgen auf gesundem Grund.
