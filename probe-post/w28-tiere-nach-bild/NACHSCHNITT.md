# w28-tiere-nach-bild, Nachschnitt — die Wiederkehr je Gattung, erst wenn die Programme ihrer Leiber stehen

GTX 1050, 13.11. 03:37–04:05, echter Renderer ohne DevTools (`frei-sonde.cjs`), Wiederkehr im vollen Profil, Stand mit 19–20
Wesen aus 3 Arten (Wolf, Wesen, Bär). Vergleichs-Eingriff `tiere-im-blick.js`: drei Wölfe des Stands stehen 8 · 11 · 14 m vor dem
Spieler in Blickrichtung, die Uhr auf Mittag; die Sonde bewegt nichts, alle Bilder dieselbe Pose. Die alten Bilder dieses Ordners
(`1-erstbild.jpg` … `7-nach-12000.jpg`, `LIESMICH.md`) sind der Stand der ruhenden Abgabe 0916311a: da, aber 1,4–5,7 s ungezeichnet.

## Die Zahlen (ohne Bild-Eingriff, je 4 Boots im Wechsel am selben Kopf e8f15405; „vorher" = die Sofort-Wiederkehr von main)

| | vorher | nachher |
|---|---|---|
| Bild − Renderer | 13,46 s (13,23–13,80) | 7,87 s (7,66–8,13) |
| längste Aufgabe vor dem Bild | 4,35–4,50 s | 0,44–0,47 s |
| Güsse im Haupt-Faden | 6 | 0 |
| Bild → erste Gattung sichtbar | 0 s (im ersten Bild) | 4,27–4,62 s |
| Bild → letzte Gattung sichtbar | 0 s | 5,97–6,18 s |
| Renderer → erste / letzte Gattung sichtbar | 13,46 s | 12,4 s / 13,9 s |
| wiedergekehrt und nicht gezeichnet | 0 Bilder | 0 Bilder (ruhende Abgabe: bis 5,7 s) |

## Die Bilder

| Bild | was es zeigt |
|---|---|
| `v-erstbild.jpg` | VORHER (Sofort-Wiederkehr): das erste Weltbild, 14,5 s nach dem Renderer — die drei Wölfe und ein Reh stehen darin |
| `n1-erstbild.jpg` | NACHHER: das erste Weltbild, 8,4 s nach dem Renderer — noch kein Wesen in der Welt |
| `n2-vor.jpg` | das letzte Bild vor dem ersten Zug |
| `n3-zug-0000.jpg` | das Bild des ersten Zugs (die Wölfe, die Gattung des nächsten Wesens): alle acht Teile des Leibs tragen Bau und Pipeline und sind gezeichnet (Erst-Zeichnung: 0 Bilder ungezeichnet) — am Schirm sind sie in diesem einen Bild noch nicht zu lesen |
| `n4-zug-0500.jpg` · `n5-zug-1000.jpg` | 0,5 · 1 s danach: der vorderste Wolf tritt hervor |
| `n6-zug-2000.jpg` | 2 s danach: der Wolf bei 5,5 m als Gestalt, das Reh der zweiten Gattung steht fest im Bild |
| `n7-zug-4000.jpg` · `n8-zug-8000.jpg` | 4 · 8 s danach: Wölfe bei 3,1 · 5,1 · 6,8 m, dann 1,6 · 3,5 · 5 m |

(In den Läufen mit Bild-Eingriff kommt der erste Zug später, 6,2–7,9 s nach dem Bild: die Aufnahme jedes Bilds bremst den Takt.)

## Wie sie erscheinen

MIT ÜBERGANG, und nie ungezeichnet. Ein Wesen ist vom ersten Bild seines Daseins an gezeichnet; ein stehendes (das Reh) steht
sofort fest im Bild, ein laufendes (die Wölfe, sie laufen auf den Spieler zu) tritt über etwa eine Sekunde hervor und bleibt
gerastert, solange es läuft. Dasselbe Raster tragen die laufenden Wölfe im Vergleichs-Fall VORHER in den Bildern nach dem ersten
(dort standen sie 12 s unter dem Ladeschirm, das erste Bild zeigt sie fest): meine Lesart ist die zeitliche Glättung des Bilds in
dieser Phase (wenige Bilder je Sekunde nach dem Ladeschirm) — im Code nachgelesen habe ich das nicht, es ist kein Teil des Schnitts.

## Was dafür nötig war

1. Je Gattung des Stands gehen zwei Leiber als Gäste des Vorbaus in die Szene (`_ofenStandVorbau`, einer je Stufe der
   Gelenk-Gestalt): die Erst-Zeichnung baut ihre Programme ohne Draw, in ihrer Frist (ERST_BAU_MS je Aufruf).
2. Die Gattungen kehren einzeln wieder, die des nächsten Wesens am Spieler zuerst (`_wesenKehrenWieder`); solange welche
   ausstehen, entsteht kein anderes Wesen (`_kreaturenBereit`), und der Stand trägt Wiedergekehrte und Ausstehende zusammen.
3. Der Schatten-Werfer eines Leibs trägt je Kaskade ein Render-Objekt; der Gast baut das erste, die anderen kommen ohne Leib in
   ihrem Kegel nie an die Reihe. Für die Wiederkehr steht ein Teil, sobald EINES seiner Render-Objekte Bau und Pipeline trägt
   (`_vorbauFehlt(…, einer)`) — sonst wartete sie bis VORBAU_TAKTE (gemessen: 22 s je Gattung).
