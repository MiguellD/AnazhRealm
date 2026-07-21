# PFLICHT-OFFEN — die Frozen-Liste (max 5; LEER = SCOPE ZU)

> Das EINZIGE Offen-Dokument (BETRIEBSGESETZ, CLAUDE.md). Gesetzt vom Schöpfer am 21.07.:
> „niemals wurde gesagt wiese entfernen · alles mit raymarch, einheitlich · nahe dinge
> brauchen eine höhere auflösung als ferne." Einträge fallen GANZ (Zeile stirbt im
> Beweis-Commit) oder bleiben. `gate:betriebsgesetz` liest diese Datei.

A) DIE AUFLÖSUNGS-LEITER + MARCH-GLÄTTUNG: nahe Felder backen FEIN (64³-Tier je Glied/Bau, Distanz-Tick mit Hysterese und Budget), ferne grob (32³) — die Voxel-Winkelgröße ist das Gesetz; dazu die Glättung im March (trilineare Dichte-Abtastung + Treffer-Verfeinerung statt Nearest-Klötzchen). Beweis: Bild-Paar Kreatur/Bau nah vorher↔nachher.
B) DIE WIESE KEHRT SICHTBAR ZURÜCK — als Funktion MIT TIEFE: nah Halm-Relief/Parallaxe (räumliche Halme, nicht flache Noise-Tönung), fern trägt der Meadow-Grund; einheitlich im Funktions-Paradigma, keine Rückkehr der Kegel-Instanzen. Beweis: Screenshot der Wiese gegen den Studio-Look.
C) NAHE BÄUME + STREU auf die Feld-Bahn — ERST NACH A (nie wieder Klötzchen nah): Dedup-Bricks je Vorlage (`_weltFeldSpawn`) mit der Leiter, der Instanz-Default fällt (Grep-Beweis, Lifecycle byte-konsistent).
D) BEWEIS-PAKET: dieselbe Boot-Sonde (echtes WebGPU) vorher↔nachher — Tris + dc + weltMarch-Zahlen im Commit, Bild-Paare (Kreatur nah · Bau 30 m · Wiese) gesehen.
