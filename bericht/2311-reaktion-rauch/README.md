# bericht/2311-reaktion-rauch — Auftrag 3 (same.physik.reaktion #1 und #2), GTX 1050, 23.11.

ZWISCHENSTAND. Spiel-Baum der Messung: 720259315 (Brand-Code, Kern und Orte = main 5b36f69a7). Stations-Kopf: `pm-reaktion` 6cd473f28
(EINE Datei `meisterkarte-quelle/punkte/stationen/k2-same.js` auf punkte-maschine 8a0983a38). Kein Spiel-Schnitt, keine Vorprüfung
`reaktion-rauch`: beide Thesen des Auftrags halten an der Quelle nicht, der Täter stand in der Station.

## #1 Rauch-Masse

| Lauf | Auge | Holz kg | Asche kg | Rauch kg | masse_abw_pct | rauch_prop_abw_pct |
| --- | --- | --- | --- | --- | --- | --- |
| Radeon f0a89f7e (Akte) | unbekannt | 23,172 | 1,286 | 0 | 94,45 | — |
| GTX `f1` (alte Probe, Auge am Startplatz) | 1 093 m vom Herd | 23,172 | 1,286 | 0 | 94,45 | — |
| GTX `s1` (neue Probe, fernes Auge) | 1 093 m | — | — | — | kein Urteil (Messort beim Namen) | — |
| GTX `s1` (neue Probe am Messort) | 37 m | 21,692 | 1,204 | 20,645 | 0,725 | 7,269 |
| GTX `s2` (neue Probe am Messort) | 37 m | 21,978 | 1,22 | 20,916 | 0,72 | 6,104 |

Ein ganzes Leben EINER Gras-Zelle (`l1.leben.json`, 23,172 kg, Soll Rauch 21,886 kg, Ausbrand nach 548–598 s):

| Auge vom Herd | geborene Rauch-Masse | es fehlen | optische Fläche je kg | Schuld beim Ausbrand |
| --- | --- | --- | --- | --- |
| 120 m | 21,879 kg | 0,032 % | 72,187 m² | 0,001 kg |
| 150 m | 21,868 kg | 0,082 % | 72,151 m² | 0 |
| 200 m | 0 Ballen | 100 % | — | — |
| 1 093 m | 0 Ballen | 100 % | — | — |

Das Bild des Brands lebt bis `BRAND.bild.weiteM` 160 m um das Auge der Stufen (`stamm/feld-brand.js:720` `_brandBild`).
Bild-Zeuge der dünnen, lesbaren Fahne am Messort: `v1-steil.png`, `v1-flach.png` (lebender Grasbrand, Auge 36 m; kein Paar vorher ↔
nachher, weil das Spiel nicht geschnitten wurde).

## #2 Druckwelle (`s2.druck.json`, zweistufig; `s1.druck.json` grob)

| Maß | Energie | Scheiben (gebrochen) | fernste gebrochene | nächste stehende | Radius | R ÷ ∛W |
| --- | --- | --- | --- | --- | --- | --- |
| 0,4 | 3,879 MJ | 46 (20) | 7,613 m | 7,669 m | 7,641 m | 0,04863 |
| 0,63 | 15,157 MJ | 46 (24) | 15,85 m | 15,964 m | 15,907 m | 0,06428 |
| 1 | 60,617 MJ | 46 (26) | 29,772 m | 29,987 m | 29,879 m | 0,07606 |

radius_abw_pct 22,8 (Soll ≤ 25) · Exponent der Welt 0,496 (R ∝ W^0,496) · 70 Scheiben gebrochen · kein Bau bleibt · 1,0 s.
Grob allein (Leiter im Verhältnis 1,1): 25,55 — die Auflösung trug ±4 Punkte, darum die zweite Stufe.

## Der Deckel

`umstellen --ort wiese` vom Startplatz: kalt 67,6 s (`s1`) · 56,7 s (`s2`), warm 3,5–6,5 s; die Frist der Probe ist 54 s. Die Sitzung
stellt den Ort vor dem Deckel, seit die Leiter `messort("wiese")` nennt (`ort-pruef.cjs`: probeOrt vorher null, nachher wiese).
Im Deckel: S1 2,0 s · S2 2,2 s Wand an der GTX 1050.

## Dateien

- `k2-same-reaktion-rr.patch` — der Diff des Kopfs pm-reaktion gegen Blob 897e19ec; `pm-patch-rr.cjs` + `seite-druck.js` erzeugen ihn.
- `f1.*`, `l1.*`, `s1.*`, `s2.*` — die Läufe (Auge, Masse fern, Masse am Messort, Druck, umstellen).
- `lade-pruef.cjs` / `lade-pruef.txt` — die gepatchte Station im Scratch-Baum der Maschine: 49 von 49 Selbsttest-Fällen richtig.
- `ort-klasse.cjs` / `ort-klasse.txt` — 25 Leitern stellen ihren Ort mit `L.ort("…")` im eigenen Deckel, die Sitzung liest keinen.

## Offen

- Die Station selbst (`punkte.cjs run --nur`) und der volle `selbsttest` der Maschine liefen an der GTX 1050 nicht.
- Das Bild eines Brands in 200 m (keine Flamme, keine Fahne) hat niemand gesehen — nur die Zahl.
- Der Exponent 0,496 gegen den Wortlaut der Karte (W^(1/3)): die 22,8 % hängen an der Spanne der drei Ladungen (× 15,6).
