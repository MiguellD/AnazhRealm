# Abgabe saat-im-lauf (19.11.2026)

## Kopf
- Zweig `saat-im-lauf` = **0646f771c39b0422ed16c310764b6d4f1162e871** (`git ls-remote origin saat-im-lauf`), Basis origin/main 986eff04e9.
- EIN Commit: `stamm/speicher-welten.js` (+1 Zeile, Decke 4000 gehalten), `stamm/feld-leben.js` (der Satz der Konsole), `scripts/diag-weltgrenze.cjs` (Weg „saat" + Selbsttest 4/5).
- Abdruck `werkbank abdruck --gegen 986eff04e9`: ANDERS 0, alle neun Domänen (Lauf 2; Lauf 1 hatte einen Wackler mit 4 Dingen in D4 Tiere `dorf|bestand|tier:wolf`, im zweiten Lauf am selben Kopf 0). Die Boot-Welt ändert sich nicht, weil ohne `saat` der Zufall bleibt.

## Zensus (Datei:Zeile am Zweig)
**Quelle der Saat**
- `stamm/speicher-welten.js:416` `_generateFreshWorldMeta(slug, saat)`: der EINE Ort, an dem die Saat einer neuen Welt entsteht. Bis jetzt hat er immer gewürfelt (`w-<uuid12>-<zufall>`), nun nimmt er die Saat, die der Schöpfer nennt (`:438`).
- `stamm/speicher-welten.js:63-64` `_weltMetaHeil`: eine Welt ohne Saat bekommt `anazh-realm-seed` (die Boot-Welt).
- `stamm/netz-portal.js:681/697` `_reiseBetreten`: die Ort-Saat einer Reise-Welt (`<Samen>@<Ort>`), ein eigener Erzeuger, unverändert.
- Rufer: `createNewWorld` `stamm/speicher-welten.js:539` (UI-Dialog `stamm/werkstatt-sozial.js:84/99`, Konsole `stamm/feld-leben.js:1169-1191`), Welt-Tor `stamm/netz-portal.js:629`, Reise `:692`.

**Leser** (alle lesen `state.worldMeta.seed` beim Lesen, keiner kopiert sie)
- `stamm/gelaende-boden.js:770-776` `_gelaende().seed/.noise`, `:413` (genesisSaat), `stamm/gelaende-chunks.js:366`, `:672` `_planetSamen`, `:680` `_planetAnker`
- Vegetation `stamm/vegetation-baum.js:54/1080/1365/1657/1698/1706`, `stamm/vegetation-streu.js:28/2376/2410/2710`, `stamm/vegetation-wiese.js:2408/2424/2438/2532/2611`
- Siedlung `stamm/siedlung-ort.js:1352/1416/1572/1622/1940/3270`, `stamm/siedlung-satz.js:897`, `stamm/siedlung-bewohner.js:94`
- Himmel/Klang/Leben `stamm/bild-himmel.js:323/1769/2847`, `stamm/klang.js:138/1204`, `stamm/kreatur-fauna.js:19/86/471`, `stamm/kreatur-leben.js:1761`, `stamm/feld-leben.js:1794`, `stamm/feld-dsl.js:802`, `stamm/dirigent-takt.js:1752`, `stamm/stoff-material.js:215`, `stamm/bau-vorlagen.js:854/913`
- Fäden: `voxel-worker.js:1552-1556` `applyStateSnapshot` (setzt `state.seed` und baut den Rausch neu, wenn die Saat wechselt), `voxel-worker.js:1404/1513`

**Halter einer einmal erzeugten Welt**
- `this._voxelNoise` (`stamm/gelaende-boden.js:774`): der Rausch-Strom, faul gebaut. Er fällt im Abschied, weil er nicht in `WELT_GRENZE.wirt` steht (`stamm/speicher-laden.js:1593`). **Die Linse nennt ihn beim Namen.**
- `this._planetAnkerJe` (`stamm/gelaende-chunks.js:682`): eine Map je Samen, fällt im Abschied, und weil sie nach Samen geschlüsselt ist, wäre sie auch ohne das korrekt.
- `this._gelaendeSaat` (`stamm/gelaende-boden.js:753`): fällt im Abschied.
- `WELT_GRENZE.wirt` `stamm/speicher-welten.js:3493` `_planetFadenStand`: reist mit, ist aber nach Samen geschlüsselt (Plan und Scheiben je Samen), hält also keine fremde Saat.
- `WELT_GRENZE.gedaechtnis` (`:3561`, `_ortPlaene`, `_bewohnerSiedlungen`, `_erbgutCache` …): auf null gesetzt (`stamm/speicher-laden.js:1594`).
- Voxel-Faden: der Zustand des Fadens wechselt mit der Saat (`voxel-worker.js:1554`). Neben-Fäden bekommen ihn vom Voxel-Faden.
- `gelaende-core.js:2736` `LAGE_GRUND`: ein Modul-Konstant der Grundlage, keine Welt-Saat.
- Speicher: jede Welt liegt unter ihrer Id. Eine verlassene, frisch erzeugte Welt belegt 1 021–1 047 B Platz (headless gemessen), 50 Saaten also etwa 50 KB.

**Richter** (punkte-maschine 5e46351d): `meisterkarte-quelle/punkte/stationen/k2-*.js`. Die 35 Stationen rufen `L.umfang(n, 1, …)` fest mit `erzeugt = 1`, zum Beispiel `k2-erleben.js:58` (praesenz#2), `:459` (wegfindung#1), `:499` (wegfindung#7), `:210`. Keine dieser Stationen versucht heute einen Saat-Wechsel.

## Gesetz
**Die Saat ist eine Eingabe der Geburt: eine Welt wächst aus der Saat, die der Schöpfer nennt („neue welt saat <Saat>"), am Ort und ohne Reload. Dieselbe Saat ergibt dieselbe Welt, und nach dem Wechsel trägt kein Leser die alte Saat.**

## Soll (vor der Messung gesetzt) und Messung
SOLL: In EINER Sitzung trägt nach jedem Wechsel per Satz jeder Leser (worldMeta, Voxel-Faden, `_planetSamen`, `_planetAnker`, `this._voxelNoise`) die genannte Saat. Zweimal dieselbe Saat ergibt byte-gleiche Kennzahlen (25 Höhen auf einem 1,6-km-Raster, Rausch an 3 Punkten, Anker, Genesis-Ort, Plan des Start-Dorfs [Saat, nH, x, z], Spieler, Tierzahl). Eine andere Saat ergibt andere Höhen. Kein Reload.

| | vorher (986eff04e9) | nachher (0646f771c3) |
|---|---|---|
| verlangte Saat erreicht | 0 von 2 (Geburt würfelte `w-…`) | 5 von 5 Wechseln (A → B → B → A → C → B) |
| dieselbe Saat byte-gleich | nicht messbar | 3 von 3 Wiederholungen (B, A gegen den Boot, B) |
| Leser mit fremder Saat | — | 0 |
| Dauer je Wechsel am Ort (headless) | 3,5–4,2 s | 3,3–3,7 s |

Spike-Skript: `…\scratchpad\saat-spike.cjs` mit `spike-vergleich.cjs`. Die Kennzahlen sind dünn, weil headless null Landmarken und null Bauten ins Bild kommen. Der Plan des Start-Dorfs und der Genesis-Ort folgen der Saat (anazh-realm-seed nH 17 bei (−53,5|−182,3), saat-b nH 10 bei (−33,8|−180,7)).

## Linse (bestehende Familie gate:weltgrenze, `scripts/diag-weltgrenze.cjs`)
- Der Weg „saat": A → B → B → A über `processChatCommand("neue welt saat …")`. Er nennt jeden Leser mit fremder Saat beim Namen, jedes abweichende Feld derselben Saat und eine Saat, die nicht wirkt. Ergebnis: 0 Befunde.
- SELBSTTEST 4 (Mutant „die Geburt verwirft die Saat", also das Verhalten vor dem Schnitt): ROT `worldMeta.seed trägt w-541dac8a8742-5mcvc9 statt der Saat grenze-saat-b`.
- SELBSTTEST 5 (Mutant „der Rausch-Strom überlebt den Abschied"): ROT `this._voxelNoise (der Rausch-Strom) trägt ein Strom einer anderen Saat`.
- Laufzeit: das ganze Gate mit Selbsttest 169 s (ruhig) bzw. 250 s unter der Last anderer Arbeiter. Der Weg „saat" kostet 6–12 s, die beiden Scheine je etwa 6–12 s. **Ehrlich:** unter Last liegt das Gate über der 3-min-Marke, ruhig darunter.
- `check:statik` EXIT 0, `gate:betriebsgesetz` GRÜN, prettier sauber.

## Welche der 35 Stationen könnten jetzt ein Urteil bekommen (hergeleitet am Richter-Code, UNBELEGT bis zur Fahrt an der Karte)
Für alle 35 gilt dieselbe Voraussetzung: der Richter auf punkte-maschine muss seinen festen Aufruf `L.umfang(n, 1, …)` durch eine Schleife `neue welt saat <i>` ersetzen und je Saat messen. Die Welt kann das jetzt, kein Richter tut es bisher. Frist: auf der GPU ist ein Wechsel gewiss länger als 3,5 s, und die Stationen haben `sek: 45`.

**A — der Umfang ist erzeugbar, die verlangte Zahl liegt in der Frist (10–50 Saaten):**
1. erleben.spieler.praesenz#2 (10 Saaten)
2. erleben.sinn.ziele#3 (10)
3. erleben.spieler.wegfindung#1 (50; je Saat Landmarken an der Wiese, an anazh-realm-seed 0 in 1–3 km)
4. mensch.menge.bevoelkerung#3 (10⁴ Bewohner in 20 Saaten; heute 1 211 je Saat, 20 Saaten × ~1 200 ≥ 10⁴, falls jede Saat ihre Stadt trägt)

**B — die Saat-Zahl ist erzeugbar, aber der Inhalt fehlt (das Urteil kommt, es wird wohl ROT am Inhalt statt ROT am Umfang):**
5. erleben.sinne.genom#4 (20; keine Evolution der Sinne)
6. erleben.sinne.gesehen#4 (20; keine Färbung durch Selektion)
7. erleben.sinne.geruch#6 (20; kein Duft im Fluss)
8. erleben.sinne.signale#3 (20; kein Gesang je Population)
9. erleben.bild.kamera#7 (20; keine Kinofahrt)
10. erleben.sinne.sicht#6 (20 Planeten = 20 Saaten, weil `_planetSamen` die Saat ist; planetPlan trägt keinen Stern-Typ)
11. erleben.sinne.feld#6 (20 Planeten; kein Dynamo)
12. erleben.sinne.gesehen#6 (20 Planeten; kein fremder Stern)
13. erleben.sinne.hoeren#6 (100; keine echo-ortende Art)
14. erleben.klang.landschaft#8 (100; 4 Gattungen fest, `tetrapoda-core.js:62`)
15. erleben.klang.stimme#5 (100; kein fremdes Sprechorgan)
16. erleben.klang.raum#7 (100; c und Dämpfung fest, `klang-core.js:1757`)
17. erleben.sinn.entdeckung#4 (100)
18. same.entfaltung.gleichheit#5 (100)
19. erleben.spieler.forscher#7 (100 Paare aus Saat und Instrument = 100 Saaten × 1 Instrument)
20. erleben.spieler.hand#6 (1 000 Tupel = 167 Saaten × 6)
21. mensch.sport.regeln#4 (10² Saaten; 0 Arten wählen)
22. same.entfaltung.akte#5 (100 Saaten; dazu fehlt der Schritt der Gesetzes-Version N → N+1)
23. erleben.spieler.wegfindung#7 (100 Saaten; dazu fehlen Nachbarplanet und Bahn)

Die Gruppe B mit 100–167 Saaten passt nur, wenn der Richter die Frist streckt oder mehrere Sitzungen fährt (headless ~6–10 min).

**C — die Saat allein reicht nicht:**
24. erleben.klang.musik#7 (1 000 Saaten, headless ~1 h)
25. planet.kosmos.himmelsmechanik#8 (1 000 Saaten, headless ~1 h; eine Sonne, ein Mond je Saat)
26. mensch.sport.regeln#7 (1 000 Saaten auf 10 Welten fremder Physik; `createNewWorld({saat})` setzt kein Gesetz, das Welt-Tor kein Saat)
27. planet.kosmos.systeme#4 (1 000 Systeme; die Saat gibt kein System mit Planeten)
28. erleben.klang.ereignis#7 (10⁶ Saaten)
29. planet.kosmos.systeme#5 (10⁶)
30. planet.kosmos.systeme#7 (10¹¹)
31. erleben.sinne.genom#6 (10⁶ Arten)
32. erleben.sinne.genom#3 (1 000 Arten JE Saat; der Wechsel hilft nicht)
33. planet.kosmos.systeme#1 (Planet mit eigener Bahn; die Saat hilft nicht)
34. planet.kosmos.systeme#2 (3 Planeten im System; die Saat hilft nicht)
35. planet.kosmos.eigengesetz#7 (1 000 Welten mit eigenem Gesetz; die Saat ist kein Gesetz)

Zusammen: 23 von 35 Stationen (A + B, 21 von 26 Leitern) könnten ihren Saat-Umfang erzeugen, sobald ihr Richter die Saat wechselt. Davon tragen 4 (A) danach nur noch ihr eigenes Soll. Die 19 aus B urteilen danach am Inhalt, der ihnen fehlt (Art, Stern, Evolution, Instrument, Gesetzes-Schritt …) und nicht in diesem Auftrag liegt, oder sie brauchen eine längere Frist. 12 (C) bleiben ohne Urteil.

## Unbelegt
- Kein GPU-Lauf und kein Bild. Ob die Ankunft einer neuen Saat an der echten Karte (Ring, Vegetation, Dorf, Ferne) vollständig neu erwächst und wie lange ein Wechsel dort dauert, ist UNBELEGT.
- Landmarken und Siedlungen kommen headless nicht ins Bild, daher ist ihre Saat-Treue nur am Plan (Start-Dorf, Genesis) gemessen, nicht an den gebauten Felstürmen.
- Kein Richter auf punkte-maschine ist umgebaut. Die 35 Gründe bleiben „Umfang nicht erzeugbar", bis eine Station die Schleife fährt.
- Der UI-Dialog „Neue Welt" hat kein Saat-Feld. Der Spielpfad ist die Konsole.

## Befehl für das Bildpaar (Gerät / Koordinator, am Kopf 0646f771c3, `--echt`)
```
node scripts/werkbank.cjs start --echt --ort wiese
node scripts/werkbank.cjs umstellen --ort wiese --sicht ego
node scripts/werkbank.cjs bild 0 0 0 0 0 0 --spieler --datei saat-a.png
node scripts/werkbank.cjs eval 'r.processChatCommand("neue welt saat saat-b"); return r.erwacht.then(() => r.state.worldMeta.seed);'
node scripts/werkbank.cjs umstellen --ort wiese --sicht ego
node scripts/werkbank.cjs bild 0 0 0 0 0 0 --spieler --datei saat-b.png
node scripts/werkbank.cjs eval 'r.processChatCommand("neue welt saat anazh-realm-seed"); return r.erwacht.then(() => r.state.worldMeta.seed);'
node scripts/werkbank.cjs umstellen --ort wiese --sicht ego
node scripts/werkbank.cjs bild 0 0 0 0 0 0 --spieler --datei saat-a2.png
```
Die Befehlsfolge ist nicht am Gerät gefahren. Die Pose von `bild` stellt der Fahrer an `umstellen` (Spieler-Blick, `--spieler`). Soll: saat-a.png ≈ saat-a2.png (dieselbe Welt), saat-b.png zeigt eine andere Landschaft, und keine Reste von A sind sichtbar.
