# C2b2, Bericht (19.11.) — Kopf `leben-leser` a946501198e295209751fd0ee8af1b3e7041767c; Urteil des Koordinators am Bildpaar: Konsum GRÜN, Bild ROT

Bildpaar im echten Spiel (Radeon 890M, 1920×1080, Kamera −283,85 +2,6 −1085,79 → −274,25 +0,9 −1076,65): vorher leere Wiese mit
Blüten, nachher rund neun sichtbare Hirsche eines Verbands (10 Leiber, `g0,0/b886`, Revier −2,−6).
MEIN AUGE: die Tiere sind da, das Bild trägt nicht — ein Knäuel (10 Leiber in 3,5 m Radius), jeder Kopf oben, kein Tier äst, ein
flacher Rotbraun-Ton ohne Licht-Form, die Beine im Gras, Mutter und Kalb nicht zuzuordnen, im Bild etwa 40 von 720 Zeilen hoch; die
Blüten der Wiese sind weg, das Gras ist nicht kürzer. Das ist die Klasse des Entscheids `vision/leben/herde/entscheid-herde.md` (H1).

| Rang | Soll | Ist | Urteil |
|---|---|---|---|
| 1 Herde | ≥ 4 Hirsche eines Verbands, Mutter mit Kalb | 10 Leiber, laut Daten 4 Kälber bei der Mutter; vorher 0 | Zahl GRÜN, Bild ROT |
| 1 Rudel | Bildpaar | kein Bild; Rudel r7 1 752–2 028 m vom Spawn | ROT |
| 2 Konsum | N Köpfe = N Leiber, Mutant halbiert | Verband 10 = 10; am Ort 24 Köpfe ↔ 12 Hirsch-Leiber (Kappe 20); Mutant 15 → 7–8 | ROT am Ort |
| 3 Äsung | drei Zahlen an einer Zelle | `auraAt.lebendig` 0,633–0,639 (bcdcc4f1) · 0,767 (569bbeb0) · 0,25–0,28 (Kopf) | GRÜN |
| 4 erster Ruf | nicht in einem Frame, ≤ 1 ms | im Spiel ungemessen, headless 2,02 ms | ROT |
| 4 Takt p95 | keine Verschlechterung | 9,4 / 9,3 / 9,7 → 7,3 / 12,2 / 13,0 ms | ROT, +2,8 ms im Median |
| 5–8 | Linsen, Tore, Laden/Sprung/Grenze | nicht begonnen; die drei `.deer.K`-Stellen der Linse werfen weiter | offen |

Funde: (1) der Fraß des Gaus liegt rund viermal tiefer als der des alten Takts (−0,50 gegen −0,13 an derselben Zelle) · (2) der Fraß
eines Reviers gilt nur, solange das Revier im Bild des Gaus steht (0,767 ohne, 0,25 mit) · (3) springt die Fraß-Stufe, wachsen rund
140 Kacheln neu, Takt-p95 21,8–25,3 ms · (4) die Herde stand zwischen zwei Lesungen rund 100 m weiter (ungelesen) · der erste
`_gauTakt` fällt immer nach dem ersten Weltbild, also in einen Frame · Vorfall: eine Sitzung hielt das GPU-Schloss bis zum Deckel 1 500 s.

Entscheide des Koordinators:
- Kein Stempel, kein Zusammenfügen: das Bild ist ROT.
- Funde 2 + 3 sind EINE Wurzel und der wahrscheinliche Täter am Takt-p95: der Fraß ist eine Eigenschaft der ZELLE im Feld des Gaus,
  stetig in Ort und Zeit, unabhängig davon, welche Reviere der Leser gerade im Bild hat. Ein Fraß, der mit dem Bild-Ausschnitt
  springt, ist der Bruch (und frisst die Blüten). Schnitt an der Lese-Naht, nach Epoche und Stand.
- Fund 1 (viermal tiefer): erst lesen, welche der zwei Zahlen das Gesetz trägt (E3: der Fraß gehört dem Gau); kein Stellwert.
- Die Kappe schneidet nie einen Verband (H1) — fällt mit der Herden-Welle, nicht hier.
- Nachfolger C2b3 erst, wenn die Bühne ihren VORHER-Bogen hat und Epoche/Stand stehen: Rang 5–8, erster Ruf außerhalb eines Frames,
  Fraß an der Zelle. Fahrplan: `paket2.sh`, `A2_SPIELER.txt`, `A2_KAM.txt`, `s-zahl.cjs` im Ordner `c2b\`.
