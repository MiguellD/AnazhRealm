# Stand-Blatt tier-bewegung (dritte Sitzung der Bahn Wanderung/Tiere, 27.11.)

Sprosse: `karte2.leben.tiere.bewegung#2` · Basis main 52937c92 (V18.546.451) · Karte 2 gebucht 149 von 1 718 · Status ZWISCHENSTAND.

## Die rote Zeile — wörtlich, beide Akten gleich (Zweig `punkte-maschine`, `vision/richter/leben.tiere.bewegung.2.486a6685-gtx.json` und `…2.b1f0de0e-radeon.json`)

„S2 Umfang nicht erzeugbar: kein Laufvogel, der Fisch ein starrer Leib ohne Körperwelle (gezeichnet 0); Massen des Bestands über 1.354 Dekaden · fussfallAbw 0 Takt gegen Soll ≤ 0,05 Takt ✓ · strouhal ungemessen gegen Soll 0,2–0,4 ✗ · Täter: tetrapoda-core.js FISCH_GESETZ (starrer Leib) / kein Laufvogel“ — GTX 1060 am 486a6685, Radeon 890M am b1f0de0e, beide ROT.

Karte (Zweig `punkte-maschine`, `vision/MEISTERKARTE-2.md:1238`), wörtlich: Umfang „3 Dekaden 1–10³ kg: Vierbeiner, Laufvogel, Fisch mit Körperwelle“ · Tiefe „Fußfall gegen Muybridge ±0,05; Strouhal 0,2–0,4“ · Preis „P · Schwarm von 300 im Bild“ · Richter „Fußfall-Diagramm und St = f·A/U aus dem Ausgabe-Bild“.

Die rote Zeile gilt am main 52937c92 weiter: `FISCH_GESETZ` ist unverändert.

## Der Täter mit Datei:Zeile und Zahl

- `tetrapoda-core.js:2954` `FISCH_GESETZ` — `schlagHz: 2.5` und `schlagRad: 0.1` sind freie Zahlen, die nur die GIER des ganzen starren Leibs wippen lassen (`fischSchritt` :3006, „die Gier des Bilds, nie die des Gesetzes“); keine Welle läuft den Leib entlang, Frequenz und Ausschlag hängen weder am Tempo noch an der Länge.
- Täter-Zahl (aus dem Kern gerechnet, L = 0,3 m): Schwanz-Ausschlag Spitze–Spitze A = 2 · 0,1 rad · L/2 = 0,030 m; St = f·A/U = 2,5 · 0,030 / 0,7 = **0,107** beim Ziehen (`tempoMs` 0,7), **0,161** auf der Flucht (7,5 Hz, 0,060 m, 2,8 m/s) — beide unter dem Band 0,2–0,4; die Station liest gar keinen Strouhal (k2-leben.js:2269 `nimm(2, { fussfallAbw, massDekaden }, …)`, Stations-Sache).
- „kein Laufvogel“: der Bestand der Gang-Linse sind vier Vierbeiner (wolf · fuchs · baer · wesen, k2-leben.js:2240) — Massen 1,354 Dekaden; das Gang-Gesetz `gangSchritt`/`gangFuss` (tetrapoda-core.js:1421) trägt laut eigenem Kopf schon Zweibeiner.
- „gezeichnet 0“: `s.fischPool.mesh.count` am Messort der Station (kein Wasser in Sicht des Spielers).

## Plan (EINE Wurzel)

Der Fisch schwimmt nach dem Gesetz der Körperwelle: Frequenz aus Tempo und Länge (Bainbridge 1958: U = L/4·(3f − 4)), Schwanz-Ausschlag ≈ 0,2 L (Bainbridge 1958), die Welle läuft mit Wellenlänge ≈ L den Leib entlang (karangiform) — St = f·A/U folgt daraus und landet im Band (Taylor, Nudds & Thomas 2003: 0,2–0,4). Gelesen an der EINEN Stelle `fischSchritt`, gezeichnet vom Leib im Pool. Laufvogel und Massen-Dekaden folgen im selben Kopf, sofern die Zeit trägt — sonst ehrlich offen mit Prozent.

Messort der Station: die Gang-Linse fährt an der Pose des Spielers (Preis-Pose der Station), kein `stadt-voll`.
