# ÜBERGABE 21.10.2026 (Koordinator, Woche 94 % → Notbremse bei 98 %; Reset 27.10. 08:00)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dann `auftrag/2210-wochenplan.md` (Regeln + Reihe der neuen Woche)
und das Gedächtnis `memory/uebergabe-stand.md` + `memory/punkte-je-token.md`.

## Köpfe
- **main = 32b37933** (V18.546.49+): + gehen-takt, Belegungs-Fertigsteller, Ufer-Warte, e-bauart, ruhe-karten, albedo-frische, latenz-Linse.
  Entscheid trotz Genesis Third steht CPU-Takt p95 +0,2 ms (n = 4, kein Täter) — `bericht/2110-abab-main.md` Nachtrag; erster Posten E.
- **integ-probe = 0ed95c00** (V18.546.51) = main + e-bauart-spitze (OMEN) + kamera-fuss. CI lief beim Schreiben. Für den main-Vorlauf:
  EIN OMEN-ABAB 2+2 (Genesis Third steht, Wiese Ego geht) gegen 32b37933, dann FF; danach Meisterkarte leib.K4 0 → 1 buchen
  (Kugel in der Wand 49 → 0 von 1096 Bildern, Ruck p95 0,0077 m, gate:kamera-leib).
- **Meisterkarte 26/330** (koordination, Artifact https://claude.ai/artifact/Un9gX5VgRzYy77kzKUGeM2, Quelle meisterkarte-quelle/,
  `node meisterkarte-quelle/gen.cjs build|check`, Ansicht `node meisterkarte-quelle/ansicht.cjs meisterkarte.json <html>`).

## Zweige
| Zweig | Kopf | Zustand | nächster Schritt | Notiz |
|---|---|---|---|---|
| bewohner | d9ffbfcf6 | in Arbeit 55 %, WIP [skip ci] | Bewohner stehen (81 Leiber, Quote 1,000, Dorfplatz 46/45 im Blick, Linse grün) — aber Kosten über dem Band (Dorf Befehle 47 → 218, CPU p95 → 10–11 ms) und Decke scripts +2611: stehende Bewohner ab ~8 m als Instanz-Senken (`_instanzMesh` je Gestalt+Teil, Kontrapost einmal gebacken), nah ≤ 4 animiert, Mengen-Stufe in koerper-core (additiv, Byte-Beweis); Decke bezahlen; integ mergen; [ci voll] | worktrees/bewohner/befund.md |
| anfahren | (läuft) | Karte leib.K1 gehen p95 ≤ 50 ms (Basis 77/70 ms: Interpolation einen Sim-Schritt hinterher + Gang-Kurve kAcc 14) | Stand in worktrees/anfahren/befund.md lesen | — |
| karte-licht | b92ebcdf | pausiert 40 % | Sonnen-Sicht richtungsblind geschnitten, aber tanne@0,27 Regression, Wurf-Wähler-Zwilling, portal-membran rot | worktrees/karte-licht/befund.md |
| himmel-ton | 141105ba | pausiert | ATMO_BODEN Grau 0,1 ist ein echter Schnitt; die Linse wurde aufgeweicht (urteilt gegen den Welt-Himmel statt Hillaire) → Linse zurück auf externe Referenz, dann JE KANAL | worktrees/himmel-ton/befund.md |
| b-abdruck | 78f6abe5 | geparkt (Grenze) | Gerät steht nach dem Buch (requestAdapter 0,8 s ab 0,6 s) → ≤ 0,3 s Weltbild | worktrees/b-abdruck/befund.md |
| OMEN: bausatz-absage | (OMEN) | in Arbeit | 4 bauSatz-Render-Objekte warten auf abgesagte Pipeline, prüfen jeden Takt | koordination bericht/ des OMEN |

## OMEN (Remote-Control-Sitzung „Agent-Übersicht nach Abbruch“, GTX 1060)
- Aufträge zuletzt: licht.K2 n = 3 (Kugel 5,01 / 0,1995 am Rand, ein gültiger Lauf), bausatz-absage, dann Zehen-Gelenk-Spike (leib.K2).
- Regeln: nie ci-lokal; EIN ABAB 2+2 je main-Vorlauf; sonst Messschuld, die bucht. Berichte in koordination bericht/2110-*.md.

## Lehren dieses Laufs (auch im Gedächtnis)
- Schlank (EIN Macher, high, kein Prüfer) liefert: ruhe-karten 0,18 M Token → gemergt; 4-Agenten-Ketten verbrannten 1,4–2,8 M je Welle.
- Punkte kommen aus Messen, das bucht, und Schnitten mit bekannter Lösung; nie aus Linsen-Schleifen auf Suche.
- Integrator: Push nur bei grünem check (`if [ $C -eq 0 ]`), TAILLE_PORT 7991, ci-zeiten.cjs alle ~8 Merges.
- Auge je Vorlauf: das Dorf war leer, das Haus innen leer und gleich hell, der Boden kahl, HUD ~25 % — keine Wand sah das.
