# Post an w28-rasen-schnitt

## 14.11. 15:00 — w28-rasen-schnitt (Cloud): KEINE Abgabe — Stand 5787be8a (WIP mit Probe-Marke) und was fehlt

- Das Mähen ist ganz gefallen: Halm-Höhe der Keile und Karte der Schale wie main (`rasenSchnitt` und der Rasen-Grund weg); LP am Kopf: Keile 913 Büschel, Skala 1,046 mit und ohne Pflege.
- Die Wurzel am Anger (Feuchte → Klasse): `_bodenFarbeAt` + Faden-Spiegel mischen nicht mehr zum Braun der feuchten Erde, sie dunkeln den Grund um denselben Betrag je Kanal bis zu ihrer Helligkeit — G − (R+B)/2 (die Wiesen-Wache, aus der Farbe liest die Boden-Karte ihr Grün) bleibt. Urteil der Wache bei Feuchte 1 gegen 0 an den Keilen: main 0,250 → Kopf 0,033.
- OFFEN 1 (Klasse): der Rest 0,033 ist die Flechte (`LICHEN`, feuchte-getrieben, grün auf Stein) — sie hebt das Grün und schaltet die Klasse noch mit; LP (gate:ankunft) ist am Kopf darum ROT. Der Schnitt: die Flechte als Farbe nach dem Urteil der Wache (oder grün-neutral), Wirt + Faden.
- OFFEN 2 (Spitzen-Ton, nicht gebaut): der Strohton sitzt in den Vertex-Farben der Vorlage (foundry-core `emitGrass`: `c.lerp(stroh, max(trk·(0,4+0,6f), spz·sf))`), je Instanz trägt die Nah-Wiese nur Matrix (die 4. Zeile ist belegt: Fuß x/z, Radius) und Tint. Der Schnitt braucht (a) additiv im Kern ein Attribut des Stroh-Gewichts je Ecke und (b) einen Kanal der Feuchte je Instanz zum Halm-Stoff — beides nicht in meinem Rahmen dieser Sitzung.
- OFFEN 3 (Prüfung): die Feuchte ändert jetzt welt-weit nur die Helligkeit — gegossene Flächen UND nasse Niederungen/Ufer behalten ihre Wiesen-Klasse (vorher braune nasse Erde ohne Gras). Die Soll-Tafel (boden-nah, boden-nah-farbe an der Mess-Wiese mit Bach) und die Bilder am Wasser sind daran nicht gemessen. Die Probe 5787be8a (genesis@0.5, @0.3) läuft; ich habe ihr Bild noch nicht gesehen und gebe nicht ab, solange 1–3 stehen.
- Gates am Kopf: npm run check, playtest:fast GRÜN; der volle Playtest am Vor-Stand (Rasen-Grund) GRÜN, an diesem Stand nicht gefahren.


## 14.11. 14:32 — KOORDINATOR: GEHALTEN (Kopf 87b6b402 über deiner Abgabe). Das Mähen fällt, die Wiese der Ankunft bleibt

Der Schöpfer hat das Bild 0a8074aa genesis@0.5 gesehen: die Ankunft ist HÄSSLICHER — das hohe Gras der Keile war das Lebendige im Bild, jetzt liegt dort ein flacher, verwaschener Fleck. Der Fehler liegt in MEINEM Auftrag vom 12:40 („gemähter Rasen“), nicht in deiner Ausführung; deine Offen-Zeile („Boden-Farbe und Stoppeln, keine dichte Narbe“) hat ihn ehrlich benannt. Der Auftrag ist zurückgenommen:

- **Das Mähen fällt GANZ:** Halm-Höhe der Keile wieder voll (Skala 1,045, 896 Büschel), kein Rasen-Grund in der Boden-Funktion, kein Mäh-Saum, kein mitgemähter Weg. Kein Büschel weniger, kein Halm kürzer als an main.
- **Es bleibt der ursprüngliche Zweck (Gelbstich):** die gepflegte Fläche liest als SATTE, lebendige Wiese — hohes Gras, grün statt strohgelb, BIS IN DIE SPITZE. Du hast die Quelle benannt: der Spitzen-Ton steht in den Vertex-Farben der Vorlage (foundry-core `emitGrass`). Die Spitze folgt der Feuchte aus derselben EINEN Quelle (`_pflegeAt` → Feuchte): trocken strohig, gegossen grün — kein zweiter Ton-Pfad.
- **Die Feuchte ändert die Farbe, nie die Klasse des Grunds:** dein Befund am Anger (Feuchte schob den Boden zur feuchten Erde, die Wiesen-Wache sagte kein Grün, 0 Büschel in 49 Kacheln) heißt: die Pflege darf den Wiesen-Grund nicht zu Erde machen. Wo gegossen wird, steht die Wiese — an der Wurzel heilen (die Stelle, an der die Feuchte die Boden-Klasse wählt), nicht mit Rasen übermalen.
- **Abgabe-Bedingung:** Bildpaar genesis@0.5 und @0.3 gegen main (gpu-probe am Kopf): dieselbe Halm-Höhe und -Dichte wie main (Büschel-Zahl und Dreiecke der Keile gleich, Zahl in der Abgabe), Farbe satt grün bis in die Spitze; Anger Dorf 13 und Park Stadt 21 tragen ihre Büschel (Zahl). Sieh dein Bild selbst an und frage: ist die Ankunft SCHÖNER als main? Wenn nein, nicht abgeben, sondern melden, was fehlt.
- **Dein FUND bleibt ein eigener Fund** (Stufe des Büschels nach Abstand statt Schirmgröße; die Keile kosten 597 k Dreiecke an L1) — nicht in diesem Zweig schneiden, nur als Zeile in der Abgabe.
- **Zweig:** weiter auf `w28-rasen-schnitt` (der Name bleibt, der Betreff sagt die Wahrheit: „Abgabe w28-rasen-schnitt: die Wiese der Ankunft ist satt grün …“). Zuerst `git pull --ff-only` (mein Halte-Commit liegt oben).

## 14.11. 14:08 — GPU-PROBE 0a8074aa auf gtx1050-desktop: GRÜN in 592 s (bild:genesis@0.5 GRÜN 77 s auf gtx1050-desktop · bild:genesis@0.3 GRÜN 80 s auf gtx1050-desktop) → probe-post/w28-rasen-schnitt/0a8074aa.md

ABGABE 0a8074aa2299c6cccb42178104d6c9670e634d1e

## 14.11. 13:58 — w28-rasen-schnitt (Cloud): neu abgegeben — der Weg im Rasen wird mitgemäht, der gepflegte Grund ist Rasen

- Bild f755b94f (gtx1050, genesis@0.5) selbst angesehen: die Keile gemäht, doch hohe Büschel an der weichen Kante der Speichen (dort trug die Speiche, der Term gab 0) → die Pflege ist jetzt der Abstand zum nächsten Rasen (1 auf ihm und allem in ihm, Saum 1,5 m nach außen): Speichen- und Ring-Rand 31 Büschel gemäht, hoch 0.
- Befund am Weg (playtest voll ROT, 0 Büschel in 49 Kacheln): die Feuchte des Gießens schob den Boden zur feuchten Erde, die Wiesen-Wache sagte kein Grün — wo die Wege-Karte keinen Rasen malt (der Anger kanal −1, der Park), wuchs keine Wiese. Schnitt: die Boden-Funktion (Wirt + Faden) mischt den Wiesen-Grund mit max(Wache · Fleck, Pflege). playtest voll GRÜN (81 Büschel), Anger Dorf 13: 107 Büschel gemäht, Grund grün.
- Darum ist die Abgabe **w28-beet-feuchte zurückgezogen** (Kopf d7a9f6b2 WIP): allein gelandet läge der Anger als nasse Erde ohne Gras. w28-rasen-schnitt enthält sie ganz.
- Gates am Kopf: check, playtest:fast, playtest voll, gate:v1-pfad, gate:fern-ring GRÜN; gate:ankunft LP GRÜN (913 Büschel Skala 0,073, Mutante 1,046), L2a wie an main.


## 14.11. 13:19 — GPU-PROBE f755b94f auf gtx1050-desktop: GRÜN in 377 s (bild:genesis@0.5 GRÜN 82 s auf gtx1050-desktop · bild:genesis@0.3 GRÜN 78 s auf gtx1050-desktop) → probe-post/w28-rasen-schnitt/f755b94f.md

ABGABE f755b94fbddf11a86f32bac5146ace039499d377

## 14.11. 13:14 — w28-rasen-schnitt (Cloud): die Pflege mäht

- Geschnitten: `_pflegeAt` (stamm/gelaende-boden.js) ist der EINE Pflege-Term ∈ [0, 1] — 1 auf dem Rasen eines Orts, 0 auf Weg/Pflaster/Grundriss, in Feld und Wildwiese der Saum 1,5 m vom nächsten Rasen (smoothstep). Ihn lesen das Feuchte-Feld (× 1 − p/2), der Faden-Spiegel und die Höhe des Halms (Nah-Wiese samt Ferne über `b.s`; die Karte der Schale: EINE Lese-Stelle in `_wieseSchaleDaten`, für w28-wiese-schale genannt) × 1 − w · (1 − `NAH_WIESE.rasenSchnitt` 0,07 = 5 cm gegen 0,72 m). Zweigt von w28-beet-feuchte fe64931c ab (der Term baut auf dessen Pflege).
- Gemessen: Keile 896 Büschel, Skala 1,045 → 0,074; Saum w 0,90 · 0,50 · 0,10 bei +0,3 · +0,75 · +1,2 m; Faden = Wirt (Δ 0); Dreiecke der Keile 597 k (L1) / 57 k (L2) vorher → nachher gleich. gate:ankunft LP: main ROT „die Halme stehen hoch“, Kopf GRÜN, Mutante GEFANGEN; playtest voll, gate:v1-pfad, check GRÜN.
- Ehrlich offen: der Spitzen-Ton steht in den Vertex-Farben der Vorlage (foundry-core `emitGrass`) und schrumpft nur mit; FUND: die Stufe nach Abstand statt Schirmgröße (gemähte Büschel tragen L1, 597 k → 57 k möglich). Bild-Paar: die Probe am Kopf (genesis@0.5, @0.3) gegen 5e8a5d31.

