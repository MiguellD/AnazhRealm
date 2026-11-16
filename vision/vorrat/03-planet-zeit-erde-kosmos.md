# Vorrat 03 — planet · zeit · erde · kosmos (Kopf e4eeee08)

**Zählung:** A 1 · T 1 · F 1 · R 1 · B 8 (12 Leitern) — gelesen ~80 %: alle 12 Ziel-Sprossen gegen den Code am Kopf, dazu die
Stationen licht.K1/K2, ultiversum.K1 und karte2.himmelsmechanik#1 samt ihrer letzten Akten (Radeon 105c9bd3, GTX e4eeee08);
tore.K1/K3 nicht gelesen (sie tragen keine Ziel-Sprosse). Alles gelesen, nichts gemessen.

## Die fünf billigsten Sprossen

1. **planet.kosmos.sternhimmel S1 (T, 0 GPU-min, Bau S).** Die Probe TAG_PROBE der Himmelsmechanik zählt schon die Sterne im
   Ausgabe-Bild je Sonnenhöhe gegen die Grenzgröße (stationen/g3.js:810-832, Urteil :3598-3607); es fehlt eine eigene Station
   `karte2.planet.kosmos.sternhimmel#1` als zweites Urteil über dieselbe Fahrt plus die Tafel-Zeile. Gelesen rot an 2 von 4 Kurven
   (Radeon: genesis ≥−3° max 4 > 3, wiese:third γ 0,73) — der Spiel-Schnitt folgt danach.
2. **planet.kosmos.welten S1 (F, 4 GPU-min, Bau S).** licht.K2#1 misst die Kugel-Bilanz als Sitzungs-Probe an beiden GPUs, aber nur in der
   Heimat; ultiversum.K1#1 misst den roten Zenit der Ferne (Blau÷Rot 0,3846) nur headless. Die Kugel-Probe hinter das Tor in die Ferne
   tragen (Muster g5.js:4988) und den Zenit aus dem Ausgabe-Bild lesen — eine Station urteilt beide Welten.
3. **planet.zeit.archiv S1 (R, 4 GPU-min, Bau S).** Das Schicht-Gesetz baut Kliff und Schutthang (gelaende-core.js:374-396), `schichtOrt`
   (:2058) findet die Treppe im 16-km-Feld um die Wiese, `hangBaender` (:3260) zählt die Bänder — beide exportiert. Neuer Richter: Teleport
   wie scripts/lib/fahr-proben.cjs:2976, Bänder aus dem Höhenfeld plus Ego-Bild; Preis-Risiko Heap nach dem Gang.
4. **planet.kosmos.himmelsmechanik S1 (A).** Der Richter steht und fährt (g3.js:3549); gelesen ROT am Sprung 0,41–0,63 EV am Horizont
   (Uhr 0,248→0,25 und 0,31→0,32). Es fehlt der Spiel-Schnitt an der Tag-Kurve, kein Richter.
5. **planet.kosmos.sterne S1 (B, Bau M).** Der Gough-Fluss steht schon im Planeten (planet-core.js:1889), nur liest die Sonne im Bild ihn
   nicht (stamm/bild-himmel.js:1873), und die Reise endet bei +1 000 Ma (feld-leben.js:1426). Zwei Leser-Schnitte plus die Kugel-Bilanz
   an der Reise-Welt +5 Ga.

Danach in der Reihenfolge der Kosten: klimageschichte S1 (B-M), systeme S1 (B-M, Bahn + Mondphase), ereignisse S1 (B-M, Meteore im
Sternfeld), eigengesetz S1 (B-M), erde.gestalt / kunstwelten / galaxien S1 (B-L).

## Funde über das Paket hinaus

- **Beleg veraltet — die Reise durch Raum und Zeit steht.** `reise <Breite> <Länge> [<Ma>]` (stamm/feld-leben.js:1419-1476) gebiert eine
  Welt am Ort des Planeten zur Zeit −4 000 … +1 000 Ma, mit Klima, Meer, Schneegrenze, Wuchs und Siedlung aus planet-core
  (`ortGesetz(teil)`, gelaende-core.js:5843-5930). Die Belege „das Jahr wiederholt sich ohne Drift; Meeresspiegel fest“
  (klimageschichte) und „die Sonne hat kein Alter“ (sterne: im Klima hat sie eins) stimmen am Kopf nicht mehr.
- **Eine Reise-Probe trüge mehrere Leitern:** ein Sitzungs-Schritt „reise B L t, warten bis die Welt steht“ ist die Pose für
  klimageschichte (zwei Zeiten, gleicher Ort), sterne (+5 Ga), archiv (zweite Tafelland-Saat) und vermutlich mensch.zeit.erde und
  planet.geologie.platten (anderes Paket). Ihr Preis ist die Ankunft der Reise-Welt (PFLICHT-OFFEN B, kalt 12–17 s gegen Sprung ≤ 5 s).
- **Eine Fahrt, zwei Akten:** TAG_PROBE (g3.js:849) trägt himmelsmechanik S1 und sternhimmel S1; die Kugel-Probe licht.K2#1 hinter dem
  Tor trüge welten S1 und Staffel 2 von ultiversum.K1 (das Bild).
- **Maßstab-Konflikt im Richter klimageschichte S1:** „+2 °C → Schneegrenze +300 m“ ist die Erd-Rate 6,5 K/km; die Welt kühlt
  0,11 K/m (gelaende-core.js:1305, die gestauchte Höhe), +2 °C sind dort 18 m. Der Richter muss die Stauchung s_v
  (planet-core.js:48) lesen, sonst ist er unerfüllbar.
- **Zwillinge der Schwere stehen noch** (vehicle-core.js:3080 G 9,8, stamm/koerper-seele.js:911 SEIL_GESETZ.schwere) — sie brechen
  welten S2 und eigengesetz S1 (Pendel) zugleich.
