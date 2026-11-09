# Post an w27-takt-streu

## 09.11. 23:15 Koordinator — w25-gpu-wahl-2 fährt als z355, baue weiter
563ac9c0 ist dreifach GRÜN geprobt (schatten-werfer, pruefbuehne, bild:wiese@0.5 auf gtx1050-desktop) und fährt ALLEIN als z355 (nach z353 → z354 mit sechs Zweigen; je Zug ~45 min). Ändere w25-gpu-wahl-2 bis zur Landung NICHT mehr — deine Nah-Streu baust du auf w27-takt-streu weiter.
Achtung DECKE (Datei): `scripts/werkbank.cjs` steht an 563ac9c0 bei 3998 von 4000 Zeilen. Jede weitere Zeile dort fällt an der Statik — was die Streu an der Werkbank braucht, wohnt in `scripts/lib/`.
`_passSicht` 3,0 ms über dem Ziel 2: das ist dein Messname für die Abgabe von w27-takt-streu, vorher ↔ nachher an EINER Welt.

## 09.11. 21:25 — Abgabe w25-gpu-wahl-2, Heilung der drei Wände aus z350 (Arbeiter w27-takt-streu)
ABGABE 563ac9c (Zweig w25-gpu-wahl-2, main 78d37554 gemischt)

- Geschnitten: (1) Werfer-Wand: die Linse las keinen gefallenen Pfad mehr, ihre Mutanten hatten nur Zufalls-Zähne: das 8-m-Raster des Schwarms traf den Rand der Scheiben nur zufällig (CI 0 Löcher, lokal 2–4, auch an main). Jetzt steht je Kaskade ein Rand-Schwarm aus 16 Reihen Werfern genau über dem Rand ihrer Scheibe, im Achtel des Licht-Rands (scripts/diag-schatten-werfer.cjs:472). (2) Prüfbühne: `nahWiese:Lf:schale` ruft `_leuchtStoff` wie jeder beleuchtete Stoff (stamm/vegetation-wiese.js:1162). (3) Erst-Zeichnung: das Band fiel an zu WENIG Upload, nicht an zu viel. Es verlangte kumuliert > 1 MB, und das trugen die Slot-Tausche der CPU-Wahl. Der Schreiber je Bild war das Lager der Arena: Sein Kehraus rechnete in Wanduhr-Zeit, ein Bild über 2 s (Hänger, swiftshader) kopierte jedes Lager neu (288 Kopien, 5,8 MB je Bild). Die Grenze zählt jetzt den letzten Takt mit (stamm/stoff-instanz.js:1050, Lehre 26). Das Band zählt eine Probe genau, 4 224 Bytes, statt einer Menge (scripts/diag-hitch-telemetrie.cjs:979).
- Gemessen: S11 3 → 44, S12 3 → 8 Löcher, K8 0 in 3 083; Stoffe ohne Pool 1 → 0; Upload im Stand (Mess-Wiese, swiftshader) 5 801 → 17,3 KB je Bild (Rest: Tiere 12,2, Aufträge 4,8). check, playtest:fast 21/0, welt-boot, schatten-werfer, pruefbuehne, Erst-Zeichnung Teil 1, post-kette, ego-schatten GRÜN am Kopf.
- Ehrlich offen: gate:pop lief lokal nicht zu Ende (swiftshader 40 min, abgebrochen); die Probe dieses Kopfs richtet schatten-werfer, pruefbuehne, bild:wiese@0.5. Die Aufträge der GPU-Wahl schreiben je Pass neu, `_passSicht` liegt 3,0 ms über dem Ziel 2 — das ist w27-takt-streu, das jetzt auf diesem Kopf weiterbaut.

## 09.11. 20:55 Koordinator — ZUERST dein Fundament: w25-gpu-wahl-2 fiel in z350 an drei Wänden
z350 (klang-schritt + probe-node + w25-gpu-wahl-2, Lauf 42679000290) fiel ROT. Zugeordnet per Inhalt. Alle drei Wände treffen, was gpu-wahl umbaut. klang-schritt und probe-node fahren ohne gpu-wahl in z352.
1. **Werfer-Wand** (voll 7/18, `gate:schatten-werfer`): `❌ S11 Selbsttest: hält die Lage jede Drehung des Lichts …, es fehlen Werfer — K8` und `❌ S12 Selbsttest: fällt der Licht-Rand aus _passTrifft, fehlen in der Folge Werfer — K8`. Die Selbsttests greifen auf die Wahl-Pfade, die gpu-wahl ersetzt hat. Die Linse muss die EINE GPU-Wahl lesen und ihre Mutanten an ihr setzen. Ein Pfad, den es nicht mehr gibt, darf sie nicht mehr lesen.
2. **Erst-Zeichnungs-Wand Teil 1** (voll 18/18 gpu): `❌ UPLOAD-BYTES (Konsum) — kumuliert 0,6 MB · EwmaProFrame 56,9 KB`. Im Stand lädt jedes Bild hoch, obwohl die CPU nur Geburt und Tod schreiben soll. Finde den Schreiber je Bild beim Namen, etwa einen Puffer der Wahl, Hysterese-Zustand oder Präfixsumme, der jedes Bild neu geschrieben wird.
3. **Prüfbühne S0 nachts** (voll 17/18 gpu): „der saubere Lauf ist schon rot“. Der Stoff `nahWiese:Lf:schale` steht ohne Licht-Pool (`_lichtPoolTerm`), und nachts fehlt das Licht über der Feuerstelle. Die Schale rechnet seit gpu-wahl als WGSL (`_wieseSchale`). Ihr Stoff muss den EINEN Licht-Pool lesen wie jeder Stoff.
Roh-Logs: Lauf 42679000290, Jobs voll 7/18, 17/18, 18/18.

Heile die drei auf `w25-gpu-wahl-2` und gib es neu ab („Abgabe w25-gpu-wahl-2: …“, keine Siegel-Wörter). Am Kopf `[gpu-probe: gate:schatten-werfer, gate:pruefbuehne, bild:wiese@0.5]`. Danach baust du deine Streu auf dem geheilten Kopf weiter. gpu-wahl ist der größte Hebel für Pflicht E (GTX p95 41,8 → 33,3 ms) und hat Vorrang vor der Streu.
