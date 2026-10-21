# ÜBERGABE 21.10.2026 (Koordinator, NOTBREMSE bei 98 % um ~21:30; Reset 27.10. 08:00)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Dann `auftrag/2210-wochenplan.md` (Regeln + Reihe der neuen Woche)
und das Gedächtnis `memory/uebergabe-stand.md` + `memory/punkte-je-token.md`.

## Köpfe
- **main = 5951786f** (V18.546.52): … + e-bauart-spitze, kamera-fuss, anfahren (OMEN-ABAB nicht langsamer, bericht/2110-abab-anfahren.md;
  Wiese-GPU +0,15 benannt; Genesis +0,2 aus dem Vorlauf davor benannt unter E).
- **integ-probe = 816f26b4** (V18.546.53) = main + erstes-haus (massBau 46,9 → 7,7 ms je Haus, byte-gleich). CI lief beim Bremsen —
  zuerst lesen (ci-lesen.sh 816f26b4…), dann OMEN-ABAB 2+2 → main-FF.
- **Meisterkarte 29/330** (Licht K2, Leib K1, Leib K4 neu; Artifact https://claude.ai/artifact/Un9gX5VgRzYy77kzKUGeM2).

## Zweige
| Zweig | Kopf | Zustand | nächster Schritt | Notiz |
|---|---|---|---|---|
| bewohner | 212730ad | in Arbeit (Notbremse) | Mengen-Stufe im Ofen-Vertrag (Golden 460 → 496 Klassen, mensch-L2) und integ 816f26b4 gemergt; Rest laut befund.md: Instanz-Senken ab ~8 m, nah ≤ 4 animiert, Profi-Band Dorf gegen Basis, Decke ≤ 0, [ci voll] | worktrees/bewohner/befund.md |
| haus-innen | f2c89b4e (WIP) | in Arbeit (Notbremse) | Linse W10 trägt W1-Gang/W3-Treppe/W9-Keller (6705848f [ci voll]); WIP danach ungeprüft — befund.md lesen | worktrees/haus-innen/befund.md |
| naesse | 74b460a4 | 70 %, gepusht, keine CI | Nässe-Zustand + EIN Stoff-Term (Wiese 1,000 → 0,772, Dorf draußen 0,759, innen 1,000); offen: gate:naesse:echt + Frost/Ego-Schatten/licht-weg auf echter GPU, gpu-bank, [ci voll]; Dächer ohne Hülle | worktrees/naesse/befund.md |
| anfahren | abe3f4b7 | GEMERGT (main) | — | — |
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
