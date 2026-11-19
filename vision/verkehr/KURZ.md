# KURZ — Pflicht C, Verkehr · ZWISCHENSTAND 19.11. (Zweig `zensus-verkehr`, gegen main b7ed84194)

**Zensus** (`zensus.md`):
- Die Stadt ist eine Funktion von Kacheln zu 256 m. Bei Same 7: nH 1 641 → 25 Kacheln, 10⁵ → 1 597, 10⁶ → 15 965.
- Je Kachel 60 Kanten: Hauptstraße gen 0 mit 5 m (eine je Reihe und Spalte), Gassen gen 1 mit 3,9 m.
- Die Wagen von heute: `ceil(slots/15)`, Ziel gewürfelt, gehaltene Liste (`_tickVerkehr` 0,866 ms je Schritt, O(n)).
- `TAGES_GESETZ` ist schon eine Funktion: 19 200 von 19 200 Rufen bit-gleich.

**Gesetz** (`gesetz.md`) in fünf Sätzen:
1. Der Haushalt ist eine Adresse der Kachel-Funktion; sein Wagen gehört ihm, Person 0 sitzt am Steuer, ihr Tag folgt `TAGES_GESETZ`.
2. Eine Fahrt ist (Person, Uhr) → Ziel (Gravitation, Zuteilung nach Resten) → Route → Lage s(t). Die Hauptstraße einer Route ist EINE Linie Tor → Ecke → Tor mit einem Profil für jedes Paar.
3. Der Zustand der Stadt wird nie gehalten: der Schirm fragt die Umkehrung, je Paar die Ränge in O(1).
4. Nah folgt der Fahr-Schritt des Kerns s(t), fern ist der Wagen eine Lage auf der Kante.
5. Vorfahrt, Abstand und Stau folgen aus EINER Regel je Kante: Newell über das Fundamentaldiagramm.

**Spike** (`spike.md`, Zahlen in `spike/lauf.txt`):

| Probe | gemessen (Soll) | Urteil |
|---|---|---|
| (a) Kosten | warm p95 6,13 ms (≤ 2) · kalt 1 271 ms (≤ 500) · Heap 45 MB · Wachstum 10⁵ → 10⁶ < 1 | FÄLLT: der Index baut 3 375 Profile (86 % von kalt); die Spitzen sind der faule Bau der Gassen |
| (b) Erhaltung | 43 % der Fahrt auf Gassen < `breiteM` · 4 913 Proben neben der Fahrbahn · Fluss ✓ · 0 im Haus | FÄLLT, im Kern |
| (c) nah ↔ fern | Ort 2,43 m (≤ 1) | FÄLLT: die Rampe ist enger als der Wendekreis, dem Fahrer fehlt die Krümmung |
| (d) Stau | Kante −0,15 m/s = Theorie · die Attrappe überholt 711 354-mal | TRÄGT |
| (e) Determinismus | sha256 dreimal gleich (JIT, jitless, kalt rückwärts) | TRÄGT |

**Was FÄLLT: Satz 2.**
- Die Route „Tür → Gasse → Tor“ fährt, wo der Kern keinen Wagen führt: `wegArt` macht die Gasse zur `pflastergasse` (fwc:4347, 4912, 10109).
- Die Fahrstraße der Kachel-Stadt hat keinen Stellplatz. Von der Mitte gemessen endet der Gehweg bei 4,3 m, die Fassade steht bei 4,8 m; `parkB` braucht 2,3 m.
- (b) fällt damit im Kern. Nach dem Auftrag endet die Sitzung mit dem Befund.

**Bahn:**
- Nicht gebaut. `verkehr-gesetz` ist nicht angelegt, die Zeile C in `docs/PFLICHT-OFFEN.md` ist unberührt.
- Der kleinste Kern-Schnitt liegt als Diff vor, nicht angewandt: `spike/kern-schnitt.diff` (Parkstreifen im Querschnitt, die Bauflucht der Kachel-Stadt folgt ihm). Die Probe dazu ist `spike/kern-probe.cjs`.
- Gemessen: mit `parkB` 0 ist `kachelMassen` byte-gleich zu main. Mit 2,3 m stehen 18 Häuser in der Trasse, gegen 19 schon heute in main.
- Nicht gemessen: die Plan-Stadt, die Maler und das Bild.

**Am Gerät ansehen** (main, ohne den Diff): `dorf 7 4750`, Kachel (0, 0), Knoten 0 (die Kreuzung der Hauptstraßen) bei lokal (2,6 | 47,8) von der Kachel-Mitte, 12:00 Uhr, Ego.
1. Auf dem Gehweg an der inneren Ecke stehen, Blick längs der Hauptstraße: hinter dem Gehweg 0,5 m bis zur Fassade, kein Platz für einen stehenden Wagen.
2. Blick diagonal über die Kreuzung: die Ecke ist scharf, ohne Bogen für `kurveR` 5,5.
3. Blick in eine Gasse: 3,9 m Pflaster ohne Bord. Auf dieser Straße fuhr das Gesetz, obwohl der Kern dort keinen Wagen führt.

**Pflicht-OFFEN Rest:**
- C bleibt offen: die Bahn, die Station und der Beweis am Gerät.
- A, B, E und F sind unberührt.
