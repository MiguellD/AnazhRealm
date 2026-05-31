# Die epische Tiefe — was die Ghibli-Referenzen WIRKLICH haben (V17-Diagnose)

> Schoepfer zeigte zwei Ghibli-Referenzbilder (Zauberer im Schaukelstuhl ueber
> Bucht/Stadt; Schwert in Blumenwiese vor Schloss/Bergen) + fragte: "fehlt eine
> fraktale Tiefe, Wachstum wilder/natuerlicher/dichter aber energieeffizient -
> kiesel, halme, waelder, rinde, steine, wolken. Hilft PBR? Sind die Naehte das
> Problem? Was ist der brillante Weg?"

## Die ehrliche Kern-Erkenntnis
**Die Ghibli-Bilder sind NICHT PBR, NICHT fotoreal.** Sie sind gemalt: flache
Farben, weiche Uebergaenge, KEINE Roughness/Metalness/Normal-Maps. Sie
begeistern NICHT wegen Textur-Realismus — sondern wegen vier ANDEREN Dingen.
PBR (MeshStandardNodeMaterial existiert in Three.js r184) wuerde (a) den Toon/
Ghibli-Stil ZERSTOEREN und (b) ohne GB-Foto-Texturen SCHLECHTER aussehen + (c)
genau das Naht-/Tiling-Problem bringen, das der Schoepfer instinktiv nennt.
**PBR ist der Holzweg.** Der Weg zu "episch" ist STILISIERTE Fuelle, nicht Foto.

## Was die Referenzen WIRKLICH haben (gemessen gegen unseren Stand)

| Hebel | Ghibli-Referenz | AnazhRealm heute | Wurzel |
|---|---|---|---|
| **1. DICHTE/Fuelle** | Wiese randvoll: Gras+Blumen+Steine+Buesche bis in jede Ecke | spaerlich, vereinzelte Halme auf nacktem Boden | DAS ist "fraktale Tiefe/wilder/dichter" — der V16-Bogen |
| **2. VOLUMETRISCHE WOLKEN** | gewaltige plastische Wolkentuerme, halber Bild-Eindruck | flacher lila/blau-Himmel, `cloudCover`=EIN Wert, keine Wolken | Himmel = halbe epische Wirkung, fehlt komplett |
| **3. GEMALTE FARBE** | satte harmonische Paletten, NICHTS ist grau | "tuerme/waende grau", Strukturen ungetoent | Farb-Grading + getoente Materialien |
| **4. ATMOSPHAERISCHE TIEFE** | ferne Berge blau-verhangen, Dunst-Schichten | V15.4 Aerial begonnen, dezent | mehr Tiefen-Staffelung |

## Was NICHT das Problem ist (Schoepfer-Fragen geklaert)
- **PBR/Textur-Realismus**: Holzweg (siehe oben). Die Referenzen sind gemalt.
- **Naehte/Tiling**: nur ein Problem WENN man Texturen kachelt — wir tun das
  nicht (prozedurales Noise + Vertex-Farben). Der Schoepfer-Instinkt ist
  richtig: PBR-Texturen WUERDEN das Problem bringen. Also: nicht den Weg gehen.
- **Polygone/Geometrie-Detail**: nicht der Hebel (Ghibli ist flach gemalt).

## Der brillante Weg (stilisierte Fuelle, energieeffizient)
1. **DICHTE** (groesster Hebel = "fraktale Tiefe"): den V16-Streuer voll
   aufdrehen — Gras dichter, + Blumen/Farne/Buesche/Kiesel/Felsbrocken aus
   worldFieldAt als GPU-Instanzen (eigene Caps, r184 traegt es). Bis die Wiese
   RANDVOLL ist wie die Referenz. Das ist die wahre Antwort auf "wilder/dichter".
2. **WOLKEN** (zweiter halber Eindruck): volumetrische/geschichtete Wolken im
   Himmel statt flacher cloudCover-Wert — entweder Noise-Wolken-Schicht im
   Skybox-Shader oder Billboard-Wolken-Bank. Stil-treu (gemalt-weich, kein PBR).
3. **FARBE** (kein Grau): Strukturen/Tuerme getoent (Stein warm, nicht grau) +
   das V17.0-Grading kraeftiger/harmonischer.
4. **PERFORMANCE EHRLICH**: FPS fiel auf 23 (96 Kreaturen + 12105 Bauten 2.6km
   ausserhalb der ±1024-Worldgen-Region). Dichte MUSS GPU-instanziert + LOD-
   gestaffelt sein, sonst killt sie die FPS. Das ist der "energieeffizient"-
   Teil — Instancing + Distanz-LOD + Billboards fuer die Ferne.

## Reihenfolge (Sub-Wellen-Disziplin, Schoepfer waehlt)
- **V17.1**: DICHTE — den Vegetations-Streuer voll aufdrehen (Gras + arten-
  reiche Klein-Vegetation aus worldFieldAt). Groesster "es lebt/fuellt"-Sprung.
- **V17.2**: WOLKEN — echter Wolken-Himmel (gemalt-volumetrisch, stil-treu).
- **V17.3**: FARBE — Strukturen entgrauen + Grading harmonisieren.
- PBR bleibt VERWORFEN (Stil-Bruch + Naht-Problem + braucht Foto-Texturen).
