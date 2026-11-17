# w28-tor-nacht — ZWISCHENSTAND (GTX 1050, 17.11., gestapelt auf w28-rauch-bild b815623a)

Anlass: Entscheidung des Koordinators — EIN Schuss eines Tors bei Nacht gegen Tag an gleicher Kamera; zeigt er die
Entsättigung sichtbar, dann als eigener kleiner Kopf (ein Ruf, Bildpaar, die Linse (j) um das Tor erweitert).

## Befund

Das Zielbild der Tor-Membran ist ein Ton am BILD (÷ Belichtung der Heimat), kein beleuchteter Stoff: das Auge der Nacht
(`_nachtAuge` in der Post-Kette) nahm ihm die Farbe wie einer Wiese im Mondlicht. Am Genesis-Tor (Pose
`-13.5 92.6 -1.9 → -21.8 93.3 -3.1`) trägt das Zielbild am Tag Dunkelrot, Grün und Gold, nachts stand es grauweiß
(`tor-tag-vor` ↔ `tor-nacht-vor`).

## Geschnitten

`stamm/siedlung-tor.js` `_membranGraph`: das Zielbild steht über die Umkehr des EINEN Auges vor der Post-Kette
(`this._nachtAuge(zielTex.rgb.mul(Z.uBelicht), true)`) — derselbe Ruf wie an der Flamme, keine zweite Zahl.

## Gemessen

- Bilder, alle vier angesehen: `tor-tag-vor` ↔ `tor-tag-nach` unverändert; `tor-nacht-vor` ↔ `tor-nacht-nach`: das GOLD
  des Zielbilds kehrt nachts zurück.
- Linse `gate:post-kette` Fall (j), Teil TOR (echter Renderer, der echte Ziel-Knoten `ohneFilm` am echten Stoff der Membran,
  eigener Atlas über `_torZiele` / `_torZielEinsetzen`; swiftshader, zwei Läufe gleich; GTX 1050 ein Lauf, ± 1):
  GOLD Tag [235,198,125] ↔ Nacht [235,198,125], Δ 0 — MUTANTE-TOR (die Umkehr reicht den Ton durch) [228,202,159], Δ 34,
  Sättigung 0,468 → 0,303 (Band Δ ≤ 6).
  DUNKELROT Tag [93,9,2] (Sättigung 0,978) ↔ Nacht [111,35,35] (0,685) — MUTANTE-TOR [50,17,16] (0,68): die Umkehr gibt dem
  dunklen Ton die Helle zurück (größter Kanal 111 statt 50, Wand `nachtHell` ≥ 85), NICHT die Sättigung (`nachtSatt` ≥ 0,6
  ist eine Ratsche am Gemessenen, sie fängt die Mutante nicht).
  EINE QUELLE: ein Mithörer an `_nachtAuge` zählt beim Bau des Graphen die Rufe der Umkehr (1, Soll ≥ 1).
  15 Selbsttest-Fälle; die Familie läuft 68 s (vorher 66 s).

## Ehrlich offen

- **Dunkle gesättigte Töne bleiben nachts ohne ihre Farbe** (rote Kuppel, grüne Wand im Zielbild: im Bild nachher schwarz
  bis grau-rot): Grün und Blau liegen unter Leuchtdichte × Stäbchen-Anteil, die Umkehr klemmt bei 0 — dieselbe Grenze wie am
  Mantel der Flamme (0,57 ↔ 0,91). Ganz fiele es nur mit „das Auge erkennt Quellen" (Marke im Szenen-Ziel), vom
  Koordinator als kein Schnitt jetzt entschieden.
- Der Seifenfilm der Membran (`colorNode`) ist nicht gemessen, nur das Zielbild darunter.
- Der Fall „der Stamm ruft die Umkehr gar nicht" hat keine echte Mutante im Lauf (nur den Selbsttest am Urteil); im Lauf steht
  dafür die Bild-Mutante.
- Die Probe kann dem Bogen-Atlas der Tore eine Zeile `drachentor` hinzufügen, die nach der Probe stehen bleibt (nur in der
  Linsen-Welt).
