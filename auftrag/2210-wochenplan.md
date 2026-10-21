# Wochenplan ab Reset 27.10. (Koordinator, 21.10. abends) — Punkte je Token

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Bilanz 20.–21.10. (Meisterkarte 16 → 26/330, Woche 0 → 90 %)
- Getragen: Messen, das bucht (Messschuld Radeon +3 für 0,39 M Token, mk-2110 +3 für 0,30 M, OMEN-GTX +1 fast umsonst); Schnitte mit
  bekannter Wurzel (Belegung: Drawer im Render-Baum, −28 % GTX; ruhe-karten schlank 0,18 M → gemergt).
- Verbrannt: 4-Agenten-Ketten (Finder/Schneider/Prüfer/Nachbesserung, xhigh) — Licht/Ferne 1,8 M, karte-licht + himmel-ton 2,8 M ohne
  Merge, gehen-takt 1,4 M ohne Punkt; 5–6 Radeon-Agenten zugleich (Mess-Läufe bei 15–21 fps); OMEN ci-lokal + drei Mess-Serien für e-bauart
  (−0,1 ms); Karten, die keine Staffel überschreiten (Belegung −28 % = 0 Punkte, weil 7,3 > 5,8).

## Die Regeln der Woche (entschieden)
1. Karte nur mit Zahl gegen die Staffel-Linie: wo steht sie, was überschreitet sie, mit welcher externen Referenz (Lehre 18).
2. `karten-welle.js` nur `direkt: true, schlank: true` (EIN Macher, high, kein Prüfer-Agent); der Koordinator liest Diff + Zweig-CI.
3. ≤ 3 GPU-Karten zugleich auf der Radeon; kein fremdes Schloss; Zahlen unter Fremdlast sind kein Beweis.
4. OMEN: nie ci-lokal; je main-Vorlauf EIN ABAB 2+2 (Genesis Third steht, Wiese Ego geht); sonst Messschuld, die bucht.
5. Das Auge: nach jedem main-Vorlauf 5 min im echten Fenster (Spawn, Dorf, Haus, Wiese, Fahrt) — Bilder an den Schöpfer.
6. Spike sagt „trägt nicht“ → sofort stoppen und als Feststeck-Zeile mit Zahl.

## Reihe (zuerst Messen, das bucht — dann Schnitte mit bekannter Lösung)
- M1 leib.K1 Eingabe-Latenz Taste → bewegter Leib p95 ≤ 50 ms (vermutlich schon erfüllt, ungemessen = 0).
- M2 siedlung.K5 erstes Haus ≤ 0,5 s nach Erwachen der Zelle; M3 bauen.K1 Werk über echte DOM-Ereignisse (Zählung).
- S1 mensch.K1 Bewohner: der Plan wird Körper (≥ 10 Menschen am Dorfplatz) — Auge 21.10.: das Dorf ist LEER (benannt offen seit 17.10.).
- S2 leib.K4 Kamera zu Fuß nie im Fels/Stamm (Grok WE-05: 41/50 Posen) — Kugel-Sweep gegen das EINE Blocker-Netz.
- S3 siedlung.K1 Haus von innen: Tür → Keller → Dachboden ohne Sprung; Auge 21.10.: Innen leer, gleichförmig hell wie draußen.
- S4 Wasser (Grok #2): Grund im Flachen, Tiefenfarbe, Schaumsaum — Referenz Horizon FW / Bruneton-Wasser; gelaende.K3 → 2.
- S5 leib.K2 Fuß gleitet nicht (Grok AN-01) + Schritt-Takt (Klang).
- S6 Nässe im Regen (Grok #8): Weg und Lack glänzen, Bild dunkler — wetter/licht.
- Geparkt mit Befund: karte-licht (40 %), himmel-ton (ATMO_BODEN Grau 0,1 echt, Linse aufgeweicht), b-abdruck (Gerät nach dem Buch).
- B (Ankunft ≤ 5 s GTX): Feststeck — nächster Versuch nur mit Spike ≤ 1 Tag (Welt-Faden oder Adapter beim ersten Byte).

## Das Auge am integ-Kopf 1011d41d (21.10., Radeon, 1280×720)
- Spawn: Tore lesbar; HUD (Konsole + Leiste) deckt ~25 % des Bilds; rechts ragt eine flache beige Torhülle ins Bild.
- Dorf mittags: Fachwerk steht, Licht und Schattenflecken gut; Boden kahle Erde ohne Wege/Pflaster, Fenster flache Rechtecke, KEINE Menschen.
- Dorf bei Uhr 0,27 (Spieler-Wort `regler`): warme Fassaden, Stimmung trägt.
- Haus innen (haus_gotisch): begehbar, aber leer, Wände einfarbig, innen so hell wie außen (kein Innenlicht).
- Wiese/Wald am Hügel: dichtes Gras, gutes Licht — das stärkste Bild.
- Gehen: W 4 s gehalten = 4,5 m (≈ 1,1 m/s) — prüfen, ob gewollt (Gehen 1,4 m/s real, Spiele 4–6 m/s).
- Eine Stadt gibt es in der Standard-Welt nicht (nur Messort mit dorfZug) — siedlung.K2.

## Für den OMEN (GTX-Messplatz, eigene Sitzung — lies das beim Start der neuen Woche)
1. Immer EINE Sache zur Zeit; der Koordinator gibt die Reihenfolge, keine Serie ohne Auftrag.
2. Nie ci-lokal (die ganze CI-Batterie lokal) — die GitHub-CI fährt sie am Zweig-Kopf. Lokal nur check + playtest:fast + die echt-Wände,
   deren Mechanik der Schnitt berührt.
3. Je main-Vorlauf EIN ABAB 2+2 (Genesis Third steht, Wiese Ego geht: Frame p95, gpu-bank, CPU-Takt p95, Belegung); bei knappem Urteil n = 4,
   dann Entscheid — keine Bisektion, keine Folge-Serien, wenn „nicht langsamer“.
4. Sonst Messschuld, die bucht: EINE Messung je Meisterkarte-Kriterium am Kopf (Zahl + Rohdatei + Bericht), kein A/B.
5. Ein Spike sagt „trägt nicht“ → sofort stoppen und mit Zahl melden. Ein Täter erst „beim Namen“, wenn er über ≥ 2 Boots je Seite steht.
6. Das GPU-Schloss nur je einzelnem echten Lauf halten; ein echt-Rot erst nachstellen (allein auf der Maschine), bevor eine Karte daraus wird.
7. Vollgas bis 98 % des Kontos (die OMEN-Sitzung zählt mit), dann WIP pushen + Übergabe im Startordner + bericht/…-uebergabe.md.
