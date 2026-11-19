# Zensus C — der Bestand des Stamms gegen den Bestand-Kern (Kopf 48ddfa5832, gelesen 19.11.)

Dateien ohne Präfix liegen in `stamm/`. Kern = `leben-core.js` `bestand(wirt, gesetz)` (:346).

## 1 Einheit — Köpfe je was

| | Stamm (Zwilling) | Kern |
|---|---|---|
| Kopf | Tier-Datensatz `{id, soul, g, a, e, m, alterS, x, z, v, name, gehege, leib, snap, zu}` (feld-leben.js:2215) | Tier `{id, g, a, e, m, w, M, tau, tod, reif, eig, alterS, kg, r, jl, ab}` (leben-core.js:426) — ohne Ort x/z, Seele, Name, Verband |
| Gattungen | VIER: deer · fox · wolf · bear (tetrapoda `LEBENSRAUM_GESETZ.gattung`; diet 0 · 1 · 1 · 0,5) | ZWEI Rollen: `beute`, `jaeger` (der Treiber reicht deer und wolf) |
| Behälter | `state.faunaBestand.regionen[key] = { t, tiere[] }` (kreatur-leben.js:2257, :2331) | `z.beute[i][]` je Revier, `z.rudel[].tiere[]` über `reviere[]` (leben-core.js:683, :521) |
| Tragfähigkeit | je Gattung je Region: `kopfJeHa × Σ Zellen lebensraum(g, klasse) × ha × nahrung(diet, äsung, beute)` (kreatur-leben.js:2170–2181) | `welt.futter(i)` — nur für die Beute; der Jäger hat keine K, er hängt an V und D |
| Bilanz | je Gattung je Region je Takt EINE Chance Geburt, EINE Hungertod, EIN Riss (`bestandBilanz`, kreatur-leben.js:2453–2462) — der Deckel, den Satz 2 verbietet | je Kopf |
| Verband | Feld `v` am Tier (Wurf = Verband, herde.wurf) | Beute: die Köpfe EINES Reviers · Jäger: das Rudel |
| Geschlecht | keines (Mutter und Vater aus `_lebenZug`) | `w` je Kopf |

## 2 Anker — Schlüssel der Region

- Stamm: `key = floor(x/S) + "," + floor(z/S)` an WELT-Koordinaten, unbegrenzt (kreatur-leben.js:2265); S = revierM 113 × √π = 200,29 m
  (:2263, :3823). Je Region 4 × 4 Zellen zu 50 m (`BESTAND_REGION.zellen`, :3824). Kein Tier und kein Jäger quert eine Regions-Grenze:
  `_bestandJagd` liest nur die Tiere EINER Region (:2205).
- Kern: `i = y·W + x` in einem GESCHLOSSENEN Raster W × H (Rand geschlossen, leben-core.js:477), `wirt.revierSeiteM` = dieselben 200,29 m.
  Ein Rudel-Revier reicht bis `RAUM.deckel` = floor(24 850 m × 6 ÷ 200,29) = 744 Reviere (:377) — ein Gau muss ≥ 28 × 28 sein, 48 × 48 trägt drei Deckel.
- Brücke: Region (ix, iz) ↔ Revier (ix − gx·N, iz − gz·N) im Gau (gx, gz) = floor(ix ÷ N), floor(iz ÷ N). Eindeutig, ohne Rest.

## 3 Zeit

- Takt: beide 10 s Spiel-Zeit (`BESTAND_GESETZ.taktS`, der Treiber reicht es als `wirt.taktS`). Kern: 26,25 Takte je Jahr → 1 Jahr = 262,5 s
  Spiel-Zeit, 1 Wolfs-Leben (8 a) = 2 100 s = 35 min.
- `R.t` lebt in `state.faunaBestand.regionen[key].t` (Vielfaches von taktS, Welt-Uhr `state.spielZeit`; `_bestandSchritt` :2432 stellt die
  Uhr für den Takt auf R.t). Eine nie gelesene Region beginnt LEER bei `jetzt − aufholS` (3 600 s = 360 Takte = 13,7 Kern-Jahre; in
  einer jungen Welt bei −3 600), holt höchstens die letzte Stunde nach (`_bestandRegion` :2325), 20 Takte je Spiel-Takt (`aufholJeTakt` :3826).
- Wer rechnet wann: `tickFaunaLifecycle` (:2779, gerufen dirigent-takt.js:167) → `_feldTakt` (:2842) → `_bestandSchritt` → `_bestandTakt` (:2444)
  — auf dem Haupt-Faden, nur die 1–4 nahen Regionen (`_bestandNah` :2281).
- Der Spielstand speichert (`_lebenImStand`, feld-leben.js:2203): die nahen Regionen + die Region jedes gezeichneten Tiers (`_bestandReist`
  :2303) als `{t, tiere[]}`, das Leben-Feld um sie, die offenen Feld-Akte, `seite`. Jede andere Region ist vergessen und beginnt wieder leer.
- Kern: `z.takt` ganzzahlig ab 0, `anfang` setzt einen VOLLEN Gründer-Bestand (kein Aufholen aus leer).

## 4 Schreiber des Stamm-Bestands (Datei:Zeile)

| Schreiber | Ort | was |
|---|---|---|
| `_bestandRegion` | kreatur-leben.js:2325 | legt die Region an, hebt `R.t` |
| `_bestandTakt` | :2444 | Alter, Hunger, Riss, Geburt, Alters-Tod — DIE BILANZ JE TAKT |
| `_creatureNaturalBirth` | :1952 | Geburt (Mutter, Vater, Erbe, Wurf) |
| `_bestandStirbt` | :2475 | Tod + Gabe ans Feld |
| `_kreaturFrass` | :2232 | Fraß ins Leben-Feld (`_depositLife`) |
| `_bestandAdoptieren` → `_feldAkt` „annahme“ | :2524 | ein Leib ohne Tier tritt ein (Boot-Wurf, Ruf, Hof) — EINGABE DER SEITE |
| `_bestandAus` → `_feldAkt` „aus“ | :2582 | ein Leib fällt im Spiel (Kampf, Spieler) — EINGABE DER SEITE |
| `_feldAktWirkt` | feld-leben.js:2347 | die Akte wirken im Lockstep |
| `_lebenAusStand` | feld-leben.js:2244 | Laden |
| `_gehegeEinsetzen` · `_gehegeSchritt` | kreatur-gehege.js:42 · :136 | Zoo: eigene Raten, ruft `_bestandHungerOpfer` (:146), `_bestandRissOpfer` (:151), `_bestandJagd` (:148) |

## 5 Leser

`_kreaturBestand` (:2153, die Bilanz) · `_bestandVerkoerpern` (:2594) · `_bestandReist` (:2303) · `_lebenImStand` (feld-leben.js:2203) ·
`_annahmeKennung` (:2550) · `_bestandLeibWieder` (:2569) · `_gehegeTiere` (kreatur-gehege.js:85) · das Halter-Register (gelaende-fern.js:2491).
Linsen: `scripts/diag-kreatur-leben.cjs` :258–384, :899, :932, :1192, :1310–1319, :1399–1441 (19 Stellen) · `scripts/diag-mp-sync.cjs` :183–269, :1417
(Gleichlauf zweier Seiten) · `scripts/lib/kreatur-proben.cjs` :81.

## 6 Wer macht aus dem Bestand ein gezeichnetes Tier

`_bestandVerkoerpern` (:2594): Gruppen = `key|v` der nahen Regionen, nah zuerst, bis `maxCreatures` → `_bestandLeiber` (:2709) → Ort
`_bestandLeibOrt` (:2720, fern, außer Blick, im Lebensraum) → `_kreaturWurf` → `_bestandLeib` (:2740: `spawnCreatureAt` oder
`_restoreCreatureFromSnapshot`, netId aus `t.id`, Anker `t.x/t.z`) → `_kreaturVerbinden` (der Verband der Gezeichneten). Je Takt wächst der
Leib mit seinem Tier (`_bestandBs`, :2643). Tod: `_bestandTode` (:2489) fällt den Leib. Gehege: `_gehegeGruppen` / `_gehegeLeiber`.
Für das Bild: „≥ 4 Hirsche EINES Verbands“ = eine Gruppe `key|v`; „Mutter mit Kalb“ = Tier mit `m` = id eines gezeichneten Tiers derselben Gruppe.

## 7 Die Setzung des Koordinators gegen diese Tafel

Setzung: Bestand = FUNKTION von (Welt-Samen, Gau, Takt), feste Gaue N × N an Welt-Koordinaten, ab Takt 0 gerechnet, Stütz-Zustände, nur Gaue am Schirm.

- HÄLT: fester Gau an Welt-Koordinaten (§ 2: die Brücke ist eindeutig, dieselbe Seite); N = 48 (drei Rudel-Deckel, der Gesetz-Beweis lief
  an 48 × 48); Kosten im Worker (87 ms je Jahr je Gau = 0,33 ms Worker-Zeit je Spiel-Sekunde; der Kern ist frei von DOM und THREE).
- FÄLLT in der reinen Form, mit Grund: der Bestand hat EINGABEN, die keine Funktion von (Samen, Takt) sind — die Feld-Akte „annahme“ und
  „aus“ (der Spieler tötet, ruft, bindet; :2524, :2582) und das Leben-Feld, das die Taten des Spielers schreiben und das K liest
  (`_kreaturNahrung` :2140). Wahr ist: Bestand = f(Samen, Gau, Takt, Akte des Gaus). Stütz-Zustände sind dann STAND (sie reisen im
  Spielstand und zum Mitspieler), kein Cache — sonst vergisst der Neu-Boot jede Tat. C3 („derselbe Samen, Ort, Takt → derselbe Bestand“)
  gilt nur für eine Welt ohne Akte.
- DREI BEFUNDE, die der Schnitt entscheiden muss, bevor er öffnet (keiner steht im Auftrag):
  1. **Fuchs und Bär haben im Kern kein Gesetz.** Der Kern trägt zwei Rollen; fällt die Stamm-Bilanz mit Absenz 0, steht für fox und
     bear kein Gesetz mehr. Entweder ein zweites Rollen-Paar im Kern (neues Gesetz: Zensus + Spike) oder fox/bear fallen offen aus dem
     Bestand — beides ist Scope, kein Handgriff.
  2. **Das Gehege ruft den Zwilling** (kreatur-gehege.js:132–152: `_bestandHungerOpfer`, `_bestandRissOpfer`, `_bestandJagd`, eigene Raten
     `G.raten`). Absenz 0 von `_bestandHungerOpfer` verlangt ein Gehege-Gesetz im Kern oder den Fall des Zoo-Takts (Pflicht F trägt den Zoo).
  3. **Der Fraß koppelt zurück ins EINE Leben-Feld des Haupt-Fadens** (`_depositLife`), das der Boden und die Taten lesen und schreiben.
     Ein Gau im Worker ab Takt 0 braucht das Feld des GANZEN Gaus ab Takt 0 (2 304 × 16 Zellen) — das Leben-Feld des Stamms ist eine
     dünne Karte um den Spieler (nur das Nahe reist im Stand). Der Fraß des Gaus gehört als Schicht in den Gau-Zustand, das nahe
     Leben-Feld liest sie; das ist ein Schnitt in feld-leben.js (Leser `auraAt`), nicht nur in kreatur-leben.js.
- Dazu die Wanderung der Linsen (Lehre 6): 19 Stellen in diag-kreatur-leben.cjs, die Kaskade (:252–412), gate:mp-sync (f) und
  kreatur-proben treiben `_kreaturBestand` und `faunaBestand` direkt — sie fallen mit dem Zwilling und müssen am Kern neu urteilen.

## 8 Eigene Setzungen dieser Tafel (das Gesetz nennt sie nicht)

- „Land“ eines Reviers für B4 = mindestens eine der 16 Zellen trägt Lebensraum des Rotwilds > 0 (wie der Treiber: `C[i] > 0`).
- K je Revier für B4 = die Formel des Stamms für deer (`kopfJeHa × Σ lebensraum × ha × bestandNahrung(diet, äsung, 0)`), Äsung = Substrat
  + Fraß-Schicht des Laufs mit den Zahlen von `LIFE_FIELD` (Zerfall, Klemme) — dieselbe Rückkopplung wie im Gesetz-Beweis.
- Gau-Raster für B4: 48 × 48 Regionen, die Region des Start-Ankers ist Revier (24, 24).
