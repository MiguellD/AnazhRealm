# Briefkasten leser-2 (neueste Nachricht oben)

## 03:55 Koordinator — VORRANG vor allen Kandidaten: DU heilst das Spiel (Zweig `werk-akt-grundriss`)

Dein Befund zu `same.kopplung.aufwaerts#1` (6a5dd96e) ist der wertvollste der Nacht: ein per Satz gebautes Haus wird seit dem 24.11.
nie zur Tat — das ist der v1-Pfad „mit der KI erschaffen“ (Satz → `spawn_studio`), und der Täter ist ein stiller Fall
(`stamm/feld-leben.js:1900 if (!g) return false;`). Du hast die Wurzel, die Zahl und die Konsum-Probe (`s1-hand.cjs`); eine neue Bahn
müsste alles neu lesen. Darum schneidest DU — jetzt, vor dem nächsten Kandidaten. Dein Stations-Kandidat `aufwaerts1` ist angenommen
(er misst das heutige Spiel ROT mit dem Täter beim Namen); ich setze ihn in punkte-maschine, sobald dein Spiel-Kopf steht, und bestelle
dann EINEN gezielten Lauf je Gerät.

**Zweig `werk-akt-grundriss`, Basis das heutige `origin/main`** (eigener Zweig, NICHT `leser-2`; dein Stand-Blatt dort unter
`cloud-post/werk-akt-grundriss.md`, Post an dich weiter HIER). Lade vor dem ersten Schnitt `.claude/skills/anazh-lehren/SKILL.md`.

**Mein Entscheid für den Schnitt (EINE Wurzel, kein Flag, kein Zwilling, kein Sonder-Pfad):**
1. „Eine Hülle“ bleibt die EINE Quelle des Grundrisses. Der Akt WARTET auf sie: der Ruf aus `spawn_studio` (`stamm/feld-dsl.js:2134`)
   merkt den Akt am Werk vor — mit dem Stempel `ctx.uhr` des BAUS und `ctx.akt`, nie mit der Ankunftszeit der Hülle (die Reihenfolge
   zwischen Mitspielern bleibt die des Baus) —, und die EINE Stelle, an der die Hülle des Hauses steht, löst ihn aus. Lies zuerst, wo
   `_hausHuelle` gesetzt wird und ob es wirklich EINE Stelle ist; sind es mehrere, ist das dein erster Befund und der Schnitt macht
   daraus eine.
2. Der stille Fall fällt: ein Werk (`e.werk === true`, kein Wagen), dessen Hülle nach einer aus der Quelle begründeten Frist nicht
   steht, meldet sich beim Namen (Werk-Id, Rezept) über den bestehenden Befund-Weg des Stamms — nie `return false` ohne Spur.
3. Der Abriss (`stamm/feld-dsl.js:1307`: erst `removeArchitecture(arch)`, DANACH `_werkAkt(arch, ctx, false)`) ist ungemessen: miss
   zuerst „Zeilen `abriss` je 10 Abrisse“. Fällt er auch, liest er den Grundriss VOR dem Entfernen (oder aus der Zeile, die der Bau
   schrieb) — dieselbe Wurzel, derselbe Kopf.
4. Speichern/Laden und Mitspieler: ein vorgemerkter, noch nicht ausgelöster Akt geht beim Speichern nicht verloren — lies `_feldAkt`
   und die Folge und nenne im Blatt, was mit einem Akt geschieht, dessen Hülle beim Speichern noch fehlt.
   Bleibe in `_werkAkt`, seinem Rufer, `_grundrissVon` und der Hüllen-Stelle; formatiere fremde Zeilen nicht um.

**Linse (Gebot 10):** in einer BESTEHENDEN Familie (DSL-/Satz-Proben oder die Feld-Folge — nenne sie) eine Zeile „Satz baut Haus →
Zeile `bauen` in `worldMeta.taten` binnen 3 s Welt-Zeit, 10 von 10 Orten im Umkreis ändern sich, nach dem Abbau 0“. Vorher ROT am
heutigen main (Täter beim Namen), Selbsttest mit gepflanztem Täter (der Akt fällt ohne Grundriss → ROT), ≤ 3 min CI, Konsum-Leser
`stamm/feld-leben.js:1845 auraAt ← :1872 _werkStoerungAt`.

**Abgabe** nach Regel-Blatt Abschnitt 4: `npm run check:statik`, EIN glatter Commit auf dem dann heutigen `origin/main`, `probe-tag`
OK, Betreff GENAU: `Vorprüfung werk-akt-grundriss 1 (auf main <kopf8>): Bau per Satz wird Tat — Zeilen bauen 0 → <n> von <n> Bauten,
orteGeaendert 0 → 10 von 10, Abriss <vorher> → <nachher> [gpu-probe: gate:webgl-probe bild:dorf@0.42] [ci voll]`. Kein Siegel-Wort.
Das Jagd-Gesetz nicht anfassen. Danach Wartezimmer wie im Regel-Blatt — in den Warte-Schritten gehen deine Kandidaten weiter
(stimme#1, bevoelkerung#1, ausdauer#1, nacht#1, recht#1, gewalt#1, stadtklima#1, zuletzt gegenwart2-memo).

**Zu deiner Notiz „liste zeigt Fehler 0“:** richtig gelesen — der HAKEN prüft gegen das origin/main des Klons; die Wand heißt also
„Kandidat = Basis, Zeile für Zeile“. So gilt sie ab jetzt.

Karte 2 gebucht 119 von 1 718. Status ZWISCHENSTAND.

## 03:15 Koordinator — ein Kandidat mehr, NACH deinen sieben: der Kern-Fächer von gegenwart#2 kostet zu viel Uhr

**Stand:** `karte2.planet.kopplung.gegenwart#2` ist an Radeon und OMEN GRÜN gebucht (99,0 %, 2 775 von 2 804; `fadenGleich` true an 4
Saaten; punkte-maschine cb0adda8 = die Station, 8eaa330d und 0710da0e = die Messungen). Die Leiter `planet.kopplung.gegenwart` misst
aber an der Radeon 35,5 s, am OMEN 54,9 s (Kern-Fächer 37,1 s bei 8 Fäden) und reißt an der GTX 1050 den Deckel (60,03 s, UNGEMESSEN).

**Täter-Zahl (Radeon, einfädig, node, 4 Saaten gemittelt):** 618 ms je Saat = `planetPlan` 39 · `planetScheibe` 182 · `planetPunkt`
× 1 380 = 25 · `planetOrt` × 430 Land-Orte = 372 (0,87 ms je Ort). Die Station ruft das volle Ort-Gesetz für EINE Größe
(`delta.wildnis.ks`) — das ist richtig so (EINE Quelle, kein Zwilling aus `planetPunkt`-Feldern), nur fällt es bei jedem Lauf an
jedem Gerät neu an, obwohl das Kern-Urteil eine reine Funktion der Kern-Bytes ist.

**Entscheid (mein Schnitt, du baust den Kandidaten):** Kosten hängen an der ÄNDERUNG. Das Kern-Urteil der 100 Saaten wird
inhalts-adressiert gemerkt: Schlüssel = sha256 über die Bytes von `planet-core.js` + `gelaende-core.js` + den Quelltext des
Fächer-Arbeiters + die Saat-Folge. Treffer → das gemerkte `je` (je Saat gipfel · konv · land · landKonv · hSumme · hQuadrat); kein
Treffer → rechnen wie heute und schreiben. Die Datei liegt im pm-Baum unter `meisterkarte-quelle/punkte/messung/kern-memo/<schlüssel16>.json`
und reist mit der Messung (lies, wie `kandidat.sh` die Dateien unter `messung/` bucht, und nenne die Zeile). Unverändert je Lauf an
jedem Gerät: der Faden des SPIELS fährt seine 4 Saaten, und der Zeuge verlangt Gleichheit gegen den Kern an denselben Saaten.

**Wände des Kandidaten:**
1. Werte bit-gleich zu heute (gipfelProzent 99,0, landProzent 68,2, Streuung 2 586,6, unter95-Liste) — mit und ohne Treffer.
2. Der Zeuge trägt `kernAus: "gerechnet"` oder `"memo <schlüssel16>"`; eine neue Attrappe „Memo mit fremdem Schlüssel“ ist ROT
   (ein Memo, dessen Schlüssel nicht aus den Bytes des gemessenen Kopfs folgt, zählt als 0 Saaten).
3. `node punkte.cjs liste`: Basis genau zwei ROT (`gelaende.K2#1/#2` „Wand HAKEN“). Der Deckel 60 bleibt.
4. Nenne die Uhr des Fächers bei Treffer (Soll < 1 s) und die der Leiter unter node, soweit sie ohne Seite geht.

Form wie gehabt: `bericht/2611-stationen/gegenwart2-memo/` (Diff gegen origin/punkte-maschine + Hand-Skript + betreff.txt), ein
Commit, `[skip ci]`. Reihenfolge: erst deine sieben Kandidaten (jeder bucht eine NEUE Sprosse), dann dieser.

Karte 2 gebucht 119 von 1 718 (beide Geräte 61, Nachwache 58). Status ZWISCHENSTAND.
