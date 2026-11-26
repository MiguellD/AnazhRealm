# rueckfall-drei-2 — Stand-Blatt (Basis main 3bbd1e8f + `buendel-wetter-2` bda2db88, Post 05:27; gemessen an main eae94514)

Status: ZWISCHENSTAND · Karte 2 gebucht 120 von 1 718 (die Buchung c23e7c1d im Zweig `punkte-maschine`) · beanspruchte Sprossen:
`karte2.leben.tiere.masse#1`, `karte2.planet.kopplung.gegenwart#1`; dazu DRUCK-SCHLAF der Nachwache (die Klasse kraft, keine eigene
Sprosse) und die Klasse der Wind-Linsen (Post 05:27). `karte2.leben.pflanzen.kraft#2` steht im Zweig `rueckfall-drei` (Kopf 32f800a5,
im Bündel `buendel-wetter-2` bda2db88).

**Geschnitten.** masse#1: der Umkreis der Kreatur-Proben fragt das Gesetz der Geburt (`scripts/lib/kreatur-proben.cjs` `imUmkreisLand` →
`_kreaturGrundFrei`). gegenwart#1: die Ursache der Station IST das Gesetz `ortEisZeit` (ein Stations-Kandidat unter
`cloud-post/rueckfall-drei-station/`, im Spiel-Zweig keine Station). DRUCK-SCHLAF: der freie Körper liest den Wind in seiner Höhe über
dem Grund (`stamm/koerper-frei.js` `_freiLuftPacken` → `_rauchWindAt`, das Profil des Kerns). Wind-Linsen: F3 trägt den Selbsttest des
Täters von 06307c10 (`scripts/diag-kopplung.cjs`, die Ebene am fremden Ort).

**Gemessen.** masse#1 Glieder 1 / 1, Φ null über 0 Takte → 5 / 5, Φ 0,996 über 1 193 Takte · gegenwart#1 99,9 % (1 088 / 1 089) →
100 % (1 089 / 1 089) · DRUCK-SCHLAF bei 8,6 m/s am Ort 4,333 s → 1,067 s (Soll ≤ 3 s), bei 2 und 5 m/s 1,233 / 0,967 → 1,300 / 1,267 s · Wind-Linsen: 18 Rufe `_windAt(` in 6 Dateien gelesen, 1 Vergleich zweier
Orte zur selben Uhr (F3, geheilt in bda2db88), der gepflanzte Drift-Täter an F3 GRÜN → ROT.

**Kopf.** Der eine Commit dieses Zweigs auf `buendel-wetter-2` bda2db88 (Betreff „Vorprüfung rueckfall-drei-2 1 (auf main 3bbd1e8f +
buendel-wetter-2 bda2db88) …“, `git rev-parse origin/rueckfall-drei-2`); gegen main e71f2721 (`buendel-jagd`) ohne Konflikt gemischt.

## 2 · karte2.leben.tiere.masse#1 — der Ort der Herde fragt das Gesetz der Geburt

**Täter-Zahl (node, Null-Welt, gleiche Bedingungen).** Das Spiel kippte im Fenster e1a54023..2da17e2e NICHT: die Herde-Probe nach der
Gründung von stadt-voll („dorf 7 300“ am Anker) mit dem Spieler in der Gasse 842,3/452,5 (die Pose, an der `mensch.stadt.form#2` ihn lässt)
misst am Baum e1a54023 und am Baum main gleich — Glieder 1 / 1, Φ null über 0 Takte (der Wurf an 842,3/522,5: `_kreaturGrundFrei` false,
im Reich). Es kippte die Reihe der warmen Sitzung: an e1a54023 lief keine Station der Stadt-Leitern (Sitzung: `/umstellen wiese` vor masse),
an 2da17e2e liefen `mensch.wirtschaft.energie#2` (Abdruck 6b0d7fff) und `mensch.stadt.form#2` auf beiden Geräten unmittelbar vor masse.

- Commit im Zweig `punkte-maschine` (der einzige an den Stadt-Leitern zwischen beiden Runden): `205de11b376bfdb072f6511d3350a3f8bf3792ec`
  „Station energie#1: der Rennofen misst am Messort dorf — Holzstapel je Schmelze, Barren ohne Kohle, Ofenreisen in 7 Tagen [skip ci]“.
- Die Wurzel im Spiel-Zweig, die er sichtbar machte: `scripts/lib/kreatur-proben.cjs:180` (main) `imUmkreisLand` — der Umkreis der Orte
  aller Proben fragt einen Zwilling (Land + `_imGrundriss`), nicht das Gesetz des Geburts-Orts `_kreaturGrundFrei`
  (`stamm/kreatur-leben.js:1861`: Wildnis, Grundriss, Box der Wege-Karte, Reich eines kommenden Orts, Land); älter als die geholte
  Geschichte (10.11.).

**Mechanismus.** Die Probe wählt den Platz der Herde relativ zum Spieler (`frei(0, 70, 40)`), und die warme Sitzung lässt ihn, wo die
Station davor ihn ließ — nach der Gründung der Metropole lag der Platz des Zwillings im Reich der Stadt. Der Wurf (`_kreaturWurf`) fragt
für jeden Geworfenen nach dem ersten das Gesetz und warf nur den Erstgeborenen: Glieder 1 / 1, Φ null über 0 Takte.

**Schnitt an der Wurzel (die Reihe der Runde bleibt).** `imUmkreisLand` fragt an der Mitte und auf 2 × 8 Orten des Rings `_kreaturGrundFrei`
— dieselbe Frage wie der Wurf. In der gegründeten Stadt wählte der Zwilling 14 von 17 Orten aller Proben (jagd ×3, herde, zufall, 2846,
jagdkreis ×5 von 8, 3196, rudel, 3816) gegen das Gesetz; an der Boot-Stelle wählen Zwilling und Gesetz 17 von 17 gleich (die headless Läufe
von jagd, jagdkreis und rudel bleiben byte-gleich, das Jagd-Gesetz ist nicht angefasst).

**Zahl vorher → nachher** (Null-Welt, stadt-voll gegründet): Gasse 842,3/452,5 Glieder 1 / 1, Φ null über 0 Takte → 5 / 5, Φ 0,996 über
1 193 Takte; Anker 836,1/438,2 1 / 1, null über 0 → 5 / 5, Φ 0,997 über 1 200 Takte. Gegenproben ohne Wirkung: nach der Gründung an der
Wiese 5 / 5 (Φ 0,999), am Dorf 5 / 5 (Φ 0,996).

**Linse.** Familie herde der Kreatur-Linse (`scripts/diag-kreatur-takt.cjs --proben herde`, Leser `gate:kreatur-takt` Teil 1–3, 45 s): die
Bühne trägt immer einen kommenden Ort am Platz, den die Herde ohne ihn wählte (ein Dorf nH 7, Reich des Gesetzes fachwerk
`siedlungsReich` 88,2 m, gelesen am EINEN Leser `_imReichEinesOrts`) — die Herde steht außerhalb, Grund GRÜN (5 / 5, Φ 0,999 über 941
Takte, 4 aus zweiter Hand, Fluchtweg 33 m). Täter `herde-stadt` = der Umkreis des Zwillings von main (am Täter-Stand die Wurzel selbst): er
bleibt am Platz im Reich → ROT „Probe vakuös: Glieder 1 / 1“. Selbsttest: 10 von 10 Tätern ✅ beim Namen, Grund ✅.

**Die Bild-Serie „Herde am Hang“ (das zweite Rot) — NICHT derselbe Täter.** Sie war schon an e1a54023 rot: Glieder im Pulk je Schuss
5 / 0 / 0, Schuss 2 „verdeckt von an Punkt 1 Gelände in 49,93 m“; an 2da17e2e 5 / 0 / 5, 49,95 m (Radeon 50,07 m). Die Szene des Hangs
(−550,6/−889,6, 21,2°) wirft ihre Herde selbst mit 5 von 5 und fragt `frei` nicht; ihr Rot ist das Gelände zwischen Kamera und Herde.

**Offen (mit Grund und Messname).** Der Ort, an dem der Spieler auf dem Gerät vor masse stand, ist im Zweig nicht geloggt (der Kopf der
Runde trägt nur die letzte Sitzung; Gerät fremd 1, die Gasse fremd 5) — Messname `sitzung.orte` der Runde. Die Bild-Serie „Herde am Hang“
Schuss 2 (Gelände in 49,95 m, Messname `karte2.leben.tiere.masse#1` Bild-Serie). Das Messgerät `herde-bild` (`werkbank lauf --buehne herde`,
nur an der echten GPU) liest denselben Umkreis, sein Ort ist nach dem Schnitt nicht gemessen.

## 3 · karte2.planet.kopplung.gegenwart#1 — die Ursache IST das Gesetz (ein Stations-Kandidat)

**Täter-Zahl (node, Null-Welt am Spiel-Baum main eae94514, Saat anazh-realm-seed, 4 320 Orte im Raster 2° × 4,5° polwärts 36°, 1 705
Land).** Das Spiel kippte nicht, es kippte die STATION — der Commit im Zweig `punkte-maschine`:
`b698b28633d57ff666f9309b84055d7ab2253f77` „Station planet.kopplung.gegenwart S1: die Ursache liest die Geschichte des Orts, wie das
Gesetz sie liest — Ortshöhe, EIS_ZEITEN und KLIMA.tEisC aus dem Kern des Kopfs, kein eigener Zeitsatz, kein auf Meereshöhe reduziertes
Klima“ (44,1 % → 99,9 %, seine Nachricht nannte 100 %).

- Der Findling ohne Eis-Geschichte: Saat anazh-realm-seed · Adresse 70°/−130,5° · Land (hoeheM 283,6 m in Kern und Faden) · tJahr
  −10,00157 °C, das Minimum über den EIS_ZEITEN liegt heute.
- Die Regel, die ihn setzt: planet-core `ortEisZeit` (−10,0016 < KLIMA.tEisC −10 → o.eis.zeit 1) → der Faden reicht delta.eis.zeit 1 →
  gelaende-core ort.eis → `_rockGeologyClass` (`stamm/vegetation-baum.js`) legt den Findling. Das Gesetz hat am Ort Eis.

**Mechanismus.** Die Station urteilte die Ursache an einem eigenen Zwilling des Gesetzes — das Minimum mit Math.sin selbst gerechnet und
auf 0,01 K gerundet —, nicht an `ortEisZeit`, das der Findling liest. Am Rand der Eis-Linie fiel die Rundung auf −10,00, der Zwilling sagte
„kein Eis“, Gesetz und Welt „Eis“: 1 088 von 1 089 Relikten.

**Schnitt (die Regel, nicht die Rundung, nicht das Soll).** S1: die Ursache am Ort ist `PCk.ortEisZeit(plan, Breite, tJahrC, 0)` —
dieselbe Funktion mit denselben Argumenten, die planetOrt im Faden für o.eis rechnet; der eigene Gang, das gerundete tMin und die Schwelle
fallen. S6 (die Heimat, dieselbe Klasse in derselben Welle): die Eis-Zeit des Ankers aus EINEM planetOrt des Kerns statt eines zweiten
Zwillings auf der Seite. Der Kandidat (Diff gegen den Kopf c23e7c1d im Zweig `punkte-maschine`, BEGRUENDUNG.txt mit den drei Wänden)
liegt unter `cloud-post/rueckfall-drei-station/`.

**Zahl vorher → nachher.** ursacheProzent 99,9 % → 100 % · Zwist Kern ↔ Faden 1 (70°/−130,5°) → 0 · ohneFindlingOrte 0 → 0 · S6
ohneUrsache 0 → 0 (die Heimat −50,5°/−98,3° ohne Eis in Zwilling und Gesetz).

**Linse.** Familie: der Zeuge der Sprosse und ihr Selbsttest gruen/attrappen (Leser: Fall PROBEN des `selbsttest` über den Kern
`meisterkarte-quelle/punkte/stationen/k2-planet.js` im Zweig `punkte-maschine`). DER ZEUGE DER GLEICHHEIT zählt je Land-Ort die Ursache des Kerns gegen die Eis-Zeit, die das Spiel im Faden
liest (`zwist`, die ersten drei Orte beim Namen). Am Täter (die Regel von b698b286 im selben Lauf) ROT „die Ursache der Station weicht an 1
Orten vom Faden des Spiels ab (70°/−130,5°)“, nach dem Schnitt zwist 0. Selbsttest: gemessen im Soll ✅ GRÜN · Attrappe „Mutant
b698b286“ ✅ ist ROT · Attrappe „100 % ohne Zeugen der Gleichheit“ ✅ ist ROT (fail-closed); am Kopf c23e7c1d urteilen alle 2 007 Proben
der Datei wie erwartet.

**Die drei Wände.** (1) `meisterkarte-quelle/punkte/punkte.cjs liste` im Zweig `punkte-maschine`: 1 976 Stationen · 420 Kriterien · Fehler 0. (2) die Leiter: der Teil S1 in 5,7 s (Kern 1,0 s,
Faden 4,7 s). (3) jeder der 4 320 Orte fährt durch den Faden des Spiels (planet-ort); der Zeuge verlangt Gleichheit an denselben Orten
derselben Saat (zwist 0).

## 4 · DRUCK-SCHLAF der Nachwache — der freie Körper im Wind seiner Höhe (die Klasse kraft)

**Täter-Zahl (Null-Welt, `scripts/diag-stand-takt.cjs`, der Betrag des EINEN Winds am Ort fest, Richtung, Form und Böe aus dem Gesetz;
die letzte der 70 Scherben, Soll ≤ 3 s).**

| Wind am Ort | main eae94514 (der Körper liest den Wind in 10 m) | nach dem Schnitt (der Wind seiner Höhe) |
| --- | --- | --- |
| 2 m/s | 1,233 s | 1,300 s |
| 5 m/s | 0,967 s | 1,267 s |
| 8,6 m/s | 4,333 s ROT | 1,067 s |

Sie hängt am Wind — die Klasse kraft, an der Quelle geschnitten. Der Commit, der den Wind in den Löser legte:
`8653a311063f2e97dc3c969555b9433d2f4c3643` „WIP front-klang-koerper: Luftwiderstand im Loeser (Quer-Flaeche der Huelle, rho FAHR.luft,
der EINE Wind); Feder in stiller Luft 2260 % -> 0,44 %, Stein 0,28 %; Linse frei-fass-ruhe in gate:fahr-leben“ (21.11.).

**Mechanismus.** Der freie Körper las am Boden den Wind am Ort (`_windAt`), und der gilt in 10 m; die liegende Scherbe trug so den vollen
Wind statt des Profils des Kerns (in 1 m das 0,72-fache, phyto-core `windProfil`). Bei 8,6 m/s hielt der Zug des 10-m-Winds die letzten
zehn Scherben im Haufen über der Ruhe (0,002–0,013 m/s, auf Grund und vier Körpern): sie schliefen erst nach 4,333 s.

**Schnitt an der Wurzel.** `_freiLuftPacken` fragt den EINEN Leser des Winds in der Höhe (`_rauchWindAt`, derselbe wie Rauch, Fahne und
Staub) in der Höhe des Körpers über seinem Grund (die Ebene `K.grund` des Lösers, ohne sie die Höhe des Gesetzes); kein Soll gelockert.

**Linse.** Familie Haufen der Stand-Linse (`gate:stand-takt`, Marke `druck`; das Urteil `druckUrteil` in `scripts/lib/stand-linse.cjs`).
DER HAUFEN IM WIND DER NACHWACHE: dieselben sechs Quarz-Platten je Saat im Wind `DRUCK_WIND_MS` 8,6 m/s längs x, der Löser im festen Schritt
— zuerst die Mutante wind10 (der freie Körper liest den Wind in 10 m), bis eine Saat das Soll reißt (Saat 111: 3,017 s), dann das Gesetz
über dieselben Saaten; fehlt der Mutante ihr Anker, geht das Gesetz alle 300. Nach dem Schnitt GRÜN: das Gesetz über 112 Saaten ≤ 0,667 s,
die Welle 1,317 s bei 8,6 m/s, Kosten 2,7 s. Am Täter-Baum main eae94514 ROT „HAUFEN-WIND: im Wind 8.6 m/s schliefen von 300 Haufen 0 nie,
der späteste nach 3.533 s (Saat 277 …)“ beim Namen `_freiLuftPacken` und BLIND „die Mutante wind10 … lief nicht“ (ihr Anker fehlt). Über
300 Saaten (Sonde ohne Abbruch): die Mutante reißt 4, das Gesetz keine (≤ 0,833 s). Die Welle selbst bricht jetzt im Wind der
Nachwache (der Betrag fest, sonst LEER), richtet den Täter aber nicht: ihre Scherben liegen je Lauf anders — am Täter-Baum bei 8,6 m/s
4,333 s und 1,683 s. Dazu ein Riss derselben Familie: der späteste Schlaf des Gesetzes las die erste reißende Saat nicht (sie fiel nur in
`bruch`), jetzt jede. Selbsttest (`--selftest`, GRÜN): „der freie Körper liest den Wind in 10 m (der Täter)“ ✅ → rot HAUFEN-WIND · „die
Mutante wind10 schläft überall im Soll“ ✅ → rot BLIND · „die Mutante wind10 läuft nicht“ ✅ → rot BLIND · „kein Haufen im Wind“ ✅ → rot
LEER · „die Welle bricht im Wind der Uhr“ ✅ → rot LEER. Auf der Basis (main e71f2721 + bda2db88, die Drift zieht mit der Böe):
`gate:stand-takt` GRÜN — die Welle 0,883 s bei 8,6 m/s am Ort, der Haufen im Wind 112 Saaten ≤ 0,667 s, die Mutante Saat 111 3,017 s.

## 5 · Die Klasse der Wind-Linsen — zwei Orte zur selben Uhr (Post 05:27)

**Gelesen** (`git grep -n "_windAt\|uWindStrength\|\.staerke" scripts/` auf der Basis, dazu `_rauchWindAt`, `_fahrWind` und jede Leihe von
`_windAt`): 18 Rufe `_windAt(` in 6 Dateien (kopplung 7 · stand-takt 4 · kreatur-proben 4 · wetter-wache 1 · playtest/bild 1 · werkbank 1).
EINER teilte die Stärke zweier Orte zur selben Uhr: F3 die Tal-Düse (8, 8) gegen die Ebene bei (104, 8), geheilt in bda2db88. Die übrigen
17 tragen den Fehler nicht: die Richtung allein (stand-takt 1242 · 1279, kreatur-proben 3098 · 3136 · 3209 · 3410) · derselbe Ort (F3 Lee
104 ↔ 104, die sechs Leser ×0 am Spieler, F7 die Gasse mit ↔ ohne Siedlung an 1000/1000 und 1200/1000) · die Böe statt der Stärke (F5:
`.boe` trägt keine Drift, zwei Halme wiegen im Verhältnis der Böe) · ein Ort über die Uhr (werkbank 2137, die Spur playtest/bild 1602) ·
der Wind fest gesetzt (stand-takt 3927 · 4008 · 4340) · die Laufzeit selbst (wetter-wache 901: zwei Orte über 240 Uhren, die
Kreuzkorrelation MISST die Drift zweier Orte). In der Station liest S5 der kraft (k2-leben im Zweig `punkte-maschine`) den Wind an 200 Orten
zur Uhr 100 — nur Zeuge des Blindtests (Trefferquote), kein Urteil.

**Selbsttest** (Familie F3 der Kopplung, Leser `gate:kopplung`, 6 s): F3 rechnet neben der Düse des Gesetzes die des Täters (die Ebene am
fremden Ort x 104) und verlangt, dass sie die Drift sieht — unter dem Gesetz +45 % gegen +20 %. Gepflanzt „die Drift an der Uhr allein“
(`wob = this._windWob(tt)`, der Täter vor rueckfall-drei) → ROT „F3-Selbsttest: die Düse gegen die Ebene am fremden Ort (x 104) bleibt
unerkannt (0.19999999999999996) — die Böen-Drift trägt an zwei Orten dieselbe Uhr (`_windAt` wob ohne die Lage)“; derselbe Täter fällt an der
Laufzeit-Station ROT (`gate:wetter-wache` Ö, Selbsttest „die Drift an der Uhr allein“ 12,6–23,9 %). Das Gesetz: GRÜN, Düse +20 %.

## Offen (mit Grund und Messname)

- Der Wagen (`_fahrWind`, `stamm/koerper-fahrt.js`) legt den Wind in 10 m auf seine Flanke — dasselbe Muster, nicht geschnitten: die Höhe der
  Flanke (Länge × Dach) lebt nur im Satz des Kerns (`vehicle-core.js` `kFlanke`), der Leser bekommt sie nicht. Messname wetter.K5 (der
  Wind am Wagen). Das Haar (`stamm/koerper-leib.js`) liest die Stärke des Wiegens, ein anderes Gesetz (`_windWiegen`), nicht diese Klasse.
- Die Luft der liegenden Platte: `_freiLuftPacken` nimmt für jede Richtung die größte Fläche (cwA max), die liegende Scherbe fängt den
  waagrechten Wind auf ihrer Fläche statt ihrer Kante — nicht geschnitten, Messname DRUCK-SCHLAF.
- gegenwart S3 (Fjord „ohne Eis heute und −20 ka“) urteilt an tj gegen das Literal −10 statt KLIMA.tEisC — eine andere Frage (zwei Zeiten,
  nicht die Geschichte), Messname `karte2.planet.kopplung.gegenwart#3`.
- Der Selbsttest der Station (`meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c` im Zweig `punkte-maschine`) trägt ROT BEFEHL TRÄGT — an der Basis ohne den Kandidaten ebenso, dieselben
  zwei Namen `karte2.mensch.kopplung.antwort#1`, `karte2.mensch.zeit.kausal#1` — und WACHE ×2 (der Tod des Läufers unter Windows-Exit-Codes;
  an der Basis nicht eigens gefahren).
