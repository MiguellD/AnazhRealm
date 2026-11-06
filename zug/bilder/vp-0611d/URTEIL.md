# vp-0611d — GTX-Bild-Vorprüfung w13-pegel-heil (OMEN, GTX 1060, 06.11. 03:45–03:53)

Verglichen wurden zwei Bäume, damit nur der Pegel den Unterschied macht:
- **Basis da53773f:** main ff79cba4 + `merge --no-edit origin/w13-bach-klar`.
- **Kandidat 40a17d9b:** dieselbe Basis + `merge --no-edit origin/w13-pegel-heil` (1102ee55).

Je Seite lief eine warme Welt (`werkbank start --echt`, Ort Mess-Wiese), am Bach −309,8/−822,5:
1. klar (sonnig, Nässe am Fixpunkt);
2. 20 min Sturm mit den Rümpfen der Station wetter.K3#2 (240 × `spielZeit` +5 s und `_tickRain`, danach `_pegelTakt` und `_drainDirtyVoxelChunks`, die Welt steht);
3. 2 Spielstunden später (sonnig, je 30 s ein Stempel);
4. 14 Spieltage Sonne (der Grund der Stempel, die Welt-Uhr +14 Tage).

Je Zustand gibt es einen Blick vom Ufer (die Kamera der Station: 7 m quer zum Lauf, 1,7 m über dem Ufer) und einen von oben (14 m). Danach kamen die Tiere am Bach und am See 1816/−6168. Jedes Paar habe ich selbst angesehen.

## Urteil: w13-pegel-heil 1102ee55 GRÜN

### Pegel

Spiegel am Bach (`_hydroRiverAt.surfaceY`):

| Zustand | Basis | Kandidat |
|---|---|---|
| klar | 26,345 | 26,345 |
| nach 20 min Sturm | 26,345 | **26,545 (+0,20 m)** |
| 2 Spielstunden später | 26,345 | 26,545 |
| nach 14 Spieltagen Sonne | 26,345 | **26,135 (−0,21 m)** |

- Der Anstieg ist im Bild sichtbar. Vom Ufer aus wird der Wasserspiegel breiter und glänzt (`kand-seite-klar-sturm2h.jpg`). Von oben deckt das Wasser das Schilf im Lauf, die Basis zeigt dort Schilf über dem Wasser (`bach-oben-sturm2h.jpg`).
- Das Wasser bleibt im Gerinne: Über dem Ufer-Gelände steht kein Wasser. Der Rand ist so gestuft wie an der Basis.
- Flimmern kann ich an Standbildern nicht beurteilen.

### Dürre

- Nach 14 Spieltagen ist der Bach von oben schmaler, das Schilf steht wieder frei. Das Bett ist nicht leer gezeichnet, zwischen den Pflanzen liegt dunkles Wasser (`bach-oben-14tage.jpg`, `kand-seite-klar-14tage.jpg`).
- Am See fällt nach der Dürre eine flache Bucht vorn trocken, dort steht Schilf statt Wasser (`see-ufer-tiere.jpg`). Das passt zur gesenkten Seefläche.

### Tiere

- Im Wasser zählte ich keines (je Tier: `_landAt` an seinem Ort):
  - am Bach (120 m) beide Seiten 0 von 0;
  - am See (200 m) Basis 0 von 1, Kandidat 0 von 0.
- Im Bild der Basis steht ein Tier am Rand der flachen Bucht, im Kandidaten keines.
- Der Geburtsweg `_kreaturGrundFrei` fragt jetzt `_landAt` (stamm/kreatur-leben.js:1812).
- Meine Gegenprobe `spawnCreatureAt` auf einem Raster über dem See (40 Punkte, 16 davon Wasser) setzt auf beiden Seiten 16 Tiere ins Wasser. Diese direkte Setzung geht aber am Geburtsweg vorbei und sagt über die Geburt nichts.

### Ehrlich offen

- Den Lag sehe ich am Bild nicht. Der Hub steht schon direkt nach dem Sturm auf +0,20 m und nach 2 Spielstunden gleich; einen Anstieg erst nach ~1 h gibt es so nicht zu sehen. Lag und Bilanz trägt die headless-Hälfte von wetter.K3#2.
- Flimmern am Rand ist an Standbildern nicht prüfbar.

Rohdaten und Treiber auf der OMEN: `p3/n0611/vpp2/{basis,kand}/{erg.json,vp.log}` und `p3/n0611/vp-pegel.cjs`.
