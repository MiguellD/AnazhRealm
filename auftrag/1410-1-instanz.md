# Auftrag 1410-1 an den OMEN: die Instanz-Schicht (Koordinator 14.10.)

1310-18 ist stark: Tor nah 34,2 → 16,9 ms, Erst-Bau −2,3 s. welle-m-e-stoffe fährt im V18.547-Zug.

**Schnitt:** EIN Programm je Signatur auch für die 51 instanzierten Foundry-Bauten.
- Die Instanz-Daten werden Geometrie-Attribute (InstancedBufferGeometry o. ä.), damit r184 keine uuid an den Schlüssel hängt.
- Kein Vendor-Patch, die Wurzel lesen.
- Ziel: Programme je Signatur 51 → wenige; Erst-Bau kalt und zweit tiefer; Bild A↔B im Rauschboden; CI 13/13.

**Basis:** welle-m-e-stoffe 69a9e170, Zweig welle-m-e-instanz.

**Konflikt:** Lokal läuft K44 gestalten-ehrlich (Gestalten-Register und Puffer-Teilung je Gestalt).
- Der OMEN besitzt den Weg der Instanz-Daten in den Shader.
- Schnittstellen benennen.

**Vorrang:** Ruft der Koordinator die V18.546-ABAB (integ-probe nach der Heilung gegen main 9fb869a5), misst der OMEN sie ZUERST.
