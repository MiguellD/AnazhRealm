# Auftrag 0710-12 an den OMEN — Werkplatz (nach 0710-11): kein Tier wirft einen sichtbaren Schatten

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**Befund (Studio-Welle S3, Familie kreatur, studio-s3-kreatur 168965b9):** `atmosphere.shadowBias` setzt einen **normalBias von
1,0 m** (r184 rechnet normalBias in Welt-Metern) → kein Werfer unter ~1 m Höhe erreicht den Boden: der Wolf wirft im Spielbild
vorher wie nachher keine erkennbare Silhouette (Spiel-Schuss Boden-IoU ≈ 0). Betroffen ist jede kleine Gestalt (Tiere, Büsche,
Zäune, Steine, Kisten, die Beine des Spielers) — das ist ein sichtbarer Bild-Bruch (fühlbar im Spiel), kein Kosten-Posten.

**Basis:** main (V18.536 76c9624d — oder neuer, `git ls-remote origin main`). Branch `welle-m-schatten`, Ports 7900–7909.
**Auftrag:**
1. Linse zuerst: eine Schatten-Wand am echten Renderer (GTX 1060 und headless swiftshader, falls tragfähig): kleine Werfer
   (Wolf, Fuchs, Busch, Zaun-Pfosten, Spieler-Bein) auf ebenem Boden in Sonne seitlich → Boden-Schatten-IoU gegen die erwartete
   Projektion; vorher ROT (≈ 0), Akne-Probe (keine Streifen auf großen Flächen, Dächern, Hängen) als zweite Seite derselben Wand.
2. Wurzel: der Bias ist ein Gesetz aus der Texel-Größe der jeweiligen Kaskade (Welt-Meter je Texel × Faktor), nicht ein fester
   Meter-Wert für alle Kaskaden; slope-skalierter Bias statt eines großen normalBias, wo r184 es trägt (Vendor-Quelle lesen und
   zitieren). EINE Quelle (`atmosphere.shadowBias`), kein zweiter Wert je Material.
3. Bild-Paare aus dem Ausgabe-Pfad: Wolf/Fuchs/Busch vorher/nachher, nah (k0) und mittel (k1), Mittag und tiefe Sonne; dazu eine
   Akne-Kontrolle auf Hausdach und Hang.
4. Zeit: Schatten-Pass-Kosten vorher/nachher (zerlegen --nur schatten) — keine Mehrkosten erwartet.
**Wände/Handwerk/Bericht:** wie bisher; `bericht/0710-12-schatten-bias.md` + Kopf.
