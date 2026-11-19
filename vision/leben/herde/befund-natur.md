Ebene Natur: Mess-Zahlen für Hirsch- und Wolfsrudel im Bild, mit dem Kern-Stand daneben (gelesen in AnazhRealm-probe2, Kopf a946501198, Zweig leben-leser)

**Kern-Stand, unterste Ebene (Einheit · Anker · Leser)**
- Gangart aus der Froude-Zahl: Trab ab Fr 0,5, Galopp ab Fr 2,5, Hysterese ±20 %. Ort: `tetrapoda-core.js:1369–1388`. Leser: `gangSchritt` (`:1403`).
- Schrittlänge: λ/L = 1,4 + 1,0·v̂ (`:1329–1330`). Gedeckelt durch den Bein-Winkel 0,42 rad, im Galopp 0,48 rad (`:1413`, `:1427`, `:1433`).
  - Der Kopf-Kommentar `:1316` nennt noch 1,2 + 2·v̂. Er ist veraltet.
- Tastgrad (Anteil des Stands am Takt): 0,65 im Schritt, 0,5 im Trab, 0,3 im Galopp (`:1335`, `:1336`, `:1353`). Ein Wert für alle Arten.
- Tempo: Verhaltens-Einheit 0,34·√(gL), Sprint 3,0·√(gL) (`:1612`, `:1616`).
  - Hirsch L 0,92 m: 1,0 m/s und 9,0 m/s. Wolf L 0,63 m: 0,85 m/s und 7,5 m/s.
  - Gemüt „happy“ verdoppelt das Tempo (`stamm/kreatur-verhalten.js:3259`).
  - Folgen 4,0 m/s, Trinken 3,0 m/s, Sammeln 3,0 m/s als feste Literale ohne Körper-Anker (`tetrapoda-core.js:265–274`).
- Wende: ω = 1,1·√(g/L) rad/s, ohne Grenze der Querbeschleunigung (`:1617`, `:1639`).
  - Hirsch: 3,6 rad/s. Im Sprint (9 m/s) heißt das Radius 2,5 m und Querbeschleunigung 32 m/s² (3,3 g). Im Schritt (1 m/s) Radius 0,28 m.
- Kopf: `headGroup.rotation.x = headX + 0,04·sin(1,7·t)` (`:3676`). Das ist ein Wanduhr-Sinus mit 0,27 Hz und 0,04 rad, nicht an den Tritt gebunden. **Ein Kopf-Nicken je Schritt gibt es nicht.**
- Rumpf-Federn: `P.bob·sin(takt2)` (`:3292`). Das ist an den Takt gebunden, aber die Amplitude kommt aus dem Gefühls-Profil, nicht aus der Gangart.
  - idle 0,002 rad, joy 0,020, flee 0,030 (`:70–73`).
  - Welches Profil im ruhigen Gehen fährt: ungelesen.
- Stand-Schlupf laut Kommentaren: 0,062 beim Halten (`:3595`), 0,03–0,06 am Querhang (`:1365`). Ein heutiger Mess-Wert: ungelesen.
- Herde:
  - Persönlicher Raum = 1,3 × Körper-Kugel (`:260`).
  - Die Schar zieht nur bis 2,5 × Paar-Raum zusammen, mit Gewicht 0,5 × Tempo, höchstens 6 Nachbarn (`:279–281`).
  - Wurf: Hirsch 3–7 Köpfe, Wolf 3–6 Köpfe (`:282`).
  - Im Gau stehen 31 Köpfe in 4 Herden, also im Mittel 7,8 je Herde (Commit 3440aa6900). Wie viele Tiere die Kamera wirklich sieht: ungelesen.
- Ethogramm Hirsch: ruhen 0,4, Nahrung 0,5, Rest 0,1 ziehen. Takt 360 s, aktiv in der Dämmerung (`:2127`).
  - **„Sichern“ ist kein Zustand.** Es ist eine Geste per Hash-Wahl (`verhaltenWahl`, `:3134–3157`, laut `lesen-bauplan-tier.md:51`).
- Fluchtdistanz vor dem Menschen: Hirsch 120 m, Wolf 106 m (`:1998`). Leittier ist der Erstgeborene des Wurfs (`lesen-verhalten-nische.md:27`).

**Tafel: Größe · Wert oder Band · Einheit · Quelle · Messung am Bild oder in der Simulation**

| Größe | Natur | Einheit | Quelle | Messung |
|---|---|---|---|---|
| Wechsel Schritt → Trab | Fr ≈ 0,5; Pferd ≈ 0,35 | – | Alexander & Jayes 1983; Griffin et al. 2004 (Pferd, ungeprüft) | Fr = v²/(gL); v aus der Wurzel-Spur, L = Hüfthöhe; Gangart aus dem Phasen-Versatz der Diagonalen (Trab ≈ 0) |
| Wechsel Trab → Galopp | Fr 2–3 | – | Heglund, Taylor & McMahon 1974; Alexander & Jayes 1983 | wie oben; Galopp: Vorder- bzw. Hinterpaar je um 0,1–0,2 Takt versetzt |
| Schrittlänge | λ/L = 2,3·Fr^0,3 | – | Alexander 1976 (Nature 261:129) | λ = Weg der Wurzel je Zyklus eines Fußes |
| Gleiche Formel, Hirsch L 0,92 m | v̂ 0,34: 1,20 L (Kern 1,37 L, +14 %) · v̂ 1,2: 2,57 L (Kern 2,6 L) · v̂ 3,0: 4,45 L (Kern 3,48 L, −22 %, Winkel-Deckel) | L | aus den Formeln gerechnet | Natur-Formel gegen `gangSchritt` (`:1403`) bei gleichem v |
| Schritt-Frequenz am Wechsel Trab → Galopp | f = 4,48·M^−0,14: Hirsch 94 kg 2,4 Hz, Wolf 64 kg 2,5 Hz | Hz | Heglund & Taylor 1988 (269·M^−0,14 je min) | Fußaufsätze je Sekunde eines Beins |
| Frequenz im Schritt, Hirsch 1 m/s | Natur ≈ 0,9 Hz (aus λ 1,10 m), Kern 0,80 Hz | Hz | gerechnet | wie oben |
| Tastgrad | Schritt 0,6–0,75 · Trab 0,4–0,5 · Galopp 0,2–0,4 | Anteil des Takts | Hildebrand 1965; Alexander 1984; Walter & Carrier 2007 | Anteil des Zyklus mit Fußtempo < 0,05·v |
| Kopf-Nicken im Schritt (Huftier) | 2 Schwingungen je Zyklus, an den Vorderfuß-Tritt gebunden, einige cm senkrecht; im Trab fast ruhig | cm, Phase | Buchner et al. 1996 (Pferd; Ziffern ungeprüft) | Höhe des Kopf-Knotens als Spektrum: Gipfel bei 2·f_Schritt, Phase gegen den Vorderfuß-Aufsatz |
| Fuß-Schlupf im Stand | 0 (fester Boden) | m je Stand; Anteil von λ | Physik der Haftung | Welt-Weg des Fußes zwischen Aufsatz und Abheben ÷ λ; Ziel < 0,02 |
| Wende-Radius | r ≥ v²/a, a ≈ 0,5–1 g dauerhaft, Gepard-Spitze ≈ 1,3 g | m | Wilson et al. 2013 (Nature 498:185, Gepard); Band für Huftiere: Lehrbuch, ungeprüft | Krümmung der Wurzel-Spur gegen v; a = v·ω ≤ 1 g, also Hirsch bei 9 m/s r ≥ 8 m |
| Hirsch: Rudel-Größe | Wald 3–20, offenes Land bis über 100 | Köpfe | Clutton-Brock, Guinness & Albon 1982 (Band ungeprüft) | Köpfe je Zusammenhangs-Gruppe (Abstand < 3 × Nachbar-Mittel) |
| Hirsch: Abstand beim Äsen | nächster Nachbar ≈ 2–10 m, weiter auf offener Fläche | m | Lehrbuch, ungeprüft | Verteilung der Nachbar-Abstände (p10/p50/p90); kein Gitter, keine Klumpen < 1 Körperlänge |
| Hirsch: Zeitbudget | Äsen ≈ 40–60 %, Liegen und Wiederkauen ≈ 30–40 %, Ziehen ≈ 5–10 % je 24 h; Wechsel alle ≈ 2–3 h | Anteil, h | Clutton-Brock et al. 1982 (Ziffern ungeprüft) | Zustands-Anteile je Tier über die Spiel-Zeit; Kern rafft auf 360 s |
| Hirsch: Sichern | Kopf hoch ≈ 2–5 s, alle ≈ 10–30 s; Anteil 5–20 %, sinkt mit der Gruppengröße; Abstände zufällig, nicht periodisch | s, Anteil | Pulliam 1973; Elgar 1989; Lima 1995 (Ziffern ungeprüft) | Kopf-Höhe über der Schulter je Tier: Anteil, Verteilung der Abstände (CV ≈ 1), Gleichtakt der Nachbarn ≈ 0 |
| Hirsch: Flucht-Distanz | bejagt 100–300 m, geschützt < 50 m; die Alarm-Distanz liegt davor | m | Stankowich 2008 (Meta-Analyse Huftiere; Ziffern ungeprüft) | Abstand Spieler–Tier beim ersten Kopf-hoch und beim ersten Sprint |
| Hirsch: Flucht-Formation | geschlossen, alte Kuh führt; 100–300 m Flucht, dann Halt und Rückblick | m, Rang | Clutton-Brock et al. 1982 (Ziffern ungeprüft) | Streuung der Gruppe im Sprint (schrumpft), Reihenfolge, Halt-Weg, Blick zurück |
| Hirsch: Mutter–Kalb | Ablieger 1–2 Wochen: Kalb liegt, Kuh ≈ bis 100 m entfernt; danach Folger ≈ 1–5 m | m | Lent 1974; Clutton-Brock et al. 1982 (Ziffern ungeprüft) | Abstand Kuh–Kalb über das Alter des Kalbs (der Kern führt jetzt Alter, `leben-core.js:83–85`) |
| Wolf: Reisegang | Trab ≈ 8 km/h (2,2 m/s), Band 7–10 km/h; Hetze 50–60 km/h kurz | m/s | Mech 1970; Mech & Boitani 2003 | Gangart im Zug; Kern bei L 0,63 m: Trab erst ab 1,93 m/s (Fr 0,6), Grund-Tempo 0,85 m/s, mit „happy“ 1,7 m/s (Fr 0,46) = Schritt |
| Wolf: Lauf-Linie | im Schnee und auf Pfaden hintereinander in einer Spur, Abstand einige Meter | m | Mech 1970 (Ziffern ungeprüft) | Quer-Streuung der Spuren ÷ Längs-Abstand; Spur-Deckung der Folger |
| Wolf: Tagesstrecke | 20–50 km | km/d | Mech & Boitani 2003 (Band ungeprüft) | Weg je Spiel-Tag nach Raffung |

**Ungelesen:**
- welches Tempo das Ethogramm im Zustand „ziehen“ fährt;
- welches Gefühls-Profil im Schritt trägt;
- der heutige Stand-Schlupf;
- der heutige Nachbar-Abstand;
- die Zahl der Tiere im Kamera-Bild;
- wie der Gau seine Köpfe am Boden setzt.

**Die fünf Größen, an denen ein Betrachter „lebendig“ von „Animation“ unterscheidet, in Rang:**
1. **Fuß-Schlupf 0.** Ein rutschender Stand-Fuß bricht das Bild sofort.
2. **Nebenbewegung im Tritt.** Kopf-Nicken, Federn und Wiegen müssen an den Tritt gebunden sein. Der Kern-Kopf schwingt heute am Wanduhr-Sinus 0,04 rad (`:3676`) und nickt nie im Schritt.
3. **Unregelmäßigkeit ohne Gleichtakt.** Sichern, Schritt-Takt und Zustands-Wechsel sind zufällig verteilt, Nachbarn nie synchron. Der Kern wählt die Gesten per Hash aus Index × Zeit-Bucket.
4. **Kinematik passt zur Physik.**
   - Schrittlänge und Frequenz folgen der Froude-Zahl: im Kern bis 22 % daneben.
   - Gangart passt zum Tempo: der Wolf trabt im Kern nicht im Zug.
   - Die Kurve ist durch die Querbeschleunigung begrenzt: der Kern erlaubt 3,3 g im Sprint.
5. **Sozialer Raum und gekoppelte Aufmerksamkeit.** Verteilung der Nachbar-Abstände, gleiche Blickrichtung, eine Flucht, die als Welle durch die Gruppe läuft. Im Kern ist „Sichern“ kein Zustand.