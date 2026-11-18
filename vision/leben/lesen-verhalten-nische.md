# Lesen: Verhalten und Nische (main 18058dba)

Feld: stamm/kreatur-verhalten.js (ganz gelesen, 1–3986), stamm/kreatur-furcht.js (ganz gelesen, 1–232).
Was die beiden Dateien aufrufen, habe ich gezielt in der Quelle nachgelesen: kreatur-leben.js 615–914, 1380–1400, 1680–2300, 2366–2455, 3150–3250;
koerper-leib.js 1005–1032, 2543–2557, 2871–2930; studio-glieder.js 222; tetrapoda-core.js 62, 99–296, 1959–1963, 1990–1998, 2059,
2072–2100, 2117–2230, 3943, 3952–3959; daten.js 174–320.

Ergebnis vorab: Das Verhalten ist PHYSIK-gebunden (Masse, Hüft-Höhe, Gestalt, Wind, Magen in kg). Die ART dagegen ist ein
String-Schlüssel (wolf · fox · bear · deer) in rund zehn Tafeln mit je vier Zeilen. Das Individuum besteht aus der Art und
EINER gewürfelten Zahl (bodySize). Selektion gibt es: Hunger, Riss und Alter töten, aber das Opfer ist immer das ÄLTESTE
Tier, nie das schwächste. Ein Erbe hätte heute nichts, was es auslesen könnte.

## (1) WAS TRÄGT — Gesetze im Spiel, je mit Leser

| Gesetz (Quelle) | Leser (Funktion, Zeile) | Was es beobachtbar ändert |
|---|---|---|
| DIE EINE MASSE: Volumen der gegossenen Gestalt × Skala³ × ρ(fleisch) (`_leibMasse`, kreatur-verhalten.js:770; ρ über `_stoffRho`; MASSSTAB.dichteKgM3 1000, tetrapoda-core.js:3943) | Beute-Urteil `_kreaturIstBeute` :330, Biss-Stoß `_bissStoss` :808, Leib-an-Leib `_leibPaar` :967/`_stossPaar` :872, Temperament (kreatur-leben.js:636), Kampf-Größe (kreatur-leben.js:747–753), Magen `_kreaturMagenVoll` (kreatur-leben.js:3155) | Der Wolf (64 kg) jagt Hirsch (94) und Fuchs (15), nie den Bären (335). Der Fuchs prallt am Bären ab. |
| Beute = nicht wild UND Masse ≤ beuteMasse 2,0 × die eigene (VERHALTEN.jagd.beuteMasse, tetrapoda-core.js:166) | `_kreaturIstBeute` :330–335; die Zahl-Seite `_bestandJagd` (kreatur-leben.js:2165) | Wer wen frisst, folgt aus kg (Nahrungsnetz aus Masse) |
| Temperament = f(diet, kg): wild · wehrhaft · sanft · scheu (`temperamentDerGattung`, tetrapoda-core.js:1959–1963; Schwellen jagdKg 21,5 · wehrKg 200 · kolossKg 600) | `_creatureTemperament` (kreatur-leben.js:622) → Jagd-Pforte `_kreaturJagdBereit` :242, Beute :332, Mut `_kreaturMut` (kreatur-leben.js:647) → Leine :554 und Wariness furcht.js:140; Gegenwehr (kreatur-leben.js:804–831) | Der Bär wird erst ab Größe 0,84 wehrhaft, der Wolf erst ab 0,7 wild; ein Gigant-Hirsch (ab 1,86) wehrt sich |
| Tempo-Einheit √(g·L) an der Hüft-Höhe L = tb.beinL × Skala (`tempoEinheit`, `_kreaturHueftL` :682) | Grund-Tempo in `updateCreatures` :3248–3252; Sprint `_kreaturSprint` :465 (sprintTempo × wundTempo); Ansprung `_kreaturBissTempo` :1601 | Große Tiere laufen schneller, Wunden bremsen Flucht und Hetze |
| Steuer-Schritt (Wende-, Anfahr- und Brems-Grenze) `steuerSchritt` | `updateCreatures` :3482–3484 | Die Gier ist die Laufrichtung (kein Krebsgang) |
| Witterung über das Geruch-Feld mit Wind (`_scentAt`, koerper-seele.js:1614; Reichweite jagd.scentRangeM 50) | Jagd-Sinn `_creatureScentHuntDir` :190, Kadaver `_kreaturAasZug` :257 | Beute und Kadaver werden mit dem Wind gerochen; der Spieler ist ein Leib wie jedes Tier |
| Magen in kg: magenAnteil 0,2 × Masse, leert sich in verdauSec 600, füllt sich in fressSec 60; satt ab hungerAnteil 0,5 (VERHALTEN.aas, tetrapoda-core.js:175–181) | `_kreaturSatt` / `_kreaturMagen` (kreatur-leben.js:3159–3173) → `_kreaturJagdBereit` :246, `_kreaturAasZug` :263–264 (Biss :309), Äsung `_kreaturTaetigkeit` (kreatur-leben.js:2053–2054) | Wer satt ist, jagt nicht. Der Kadaver wird kg-genau leer gefressen und sinkt erst danach (`_tickLeichname`, kreatur-leben.js:3202–3204) |
| Kadaver-Fleisch = fleischAnteil 0,6 × Masse | `_kreaturAasZug` :273–313 | Der Riss nährt die Jäger. Pflanzenfresser (diet ≤ pflanzDiet 0,25) gehen nicht hin (:265) |
| Jagd-Ende: dauerS 45, danach ruheS 120 Erschöpfung (JAGD_GESETZ, tetrapoda-core.js:2059) | `_kreaturJagdEndet` :439, `_kreaturErschoepft` :460 | Jagden brechen ab, der Jäger ruht |
| Rudel-Ring `rudelPlatz` + umstellt; Hetze im Sprint; Pirsch unbemerkt bis pirschSichtM 5 | `_kreaturJagdZug` :347–429; Beute-Wariness furcht.js:62–82 | Ein Rudel umstellt seine Beute, die Beute bemerkt die Pirsch spät |
| Verband (Leittier = Erstgeborener des Wurfs, `verbandZug`) | `_kreaturVerbandZug` :144, Alarm furcht.js:7–29, Fluchtradius :3318, Leittier-Tätigkeit (kreatur-leben.js:2061–2062) | Die Herde zieht, flieht und ruht beisammen |
| Furcht: Aura-Bedrohung × Mut + Gedächtnis (geschlagen/gefüttert) + Furcht des Orts (Riss-Abdruck) + Glut | `_creatureWarinessEigen` furcht.js:44, `_creatureWarinessSpieler` :107, `_kreaturFurchtOrt` :197, `_kreaturGlutNah` :87 | Gebissene, gebrannte oder gerissene Orte werden gemieden |
| Fluchtdistanz vor dem Menschen je Gattung (FURCHT_GESETZ.fluchtDistanzM deer 120 · wolf 106 · bear 55 · fox 40, tetrapoda-core.js:1998), aktiv erst ab Näherung naeherungMS | `_kreaturMenschFlucht` furcht.js:164–182 | Der Hirsch flieht ab 120 m, wenn der Spieler auf ihn zugeht |
| Ethogramm: Ruhe-Pegel, Lichtphase, Magen → ruhen · nahrung · ziehen (ETHOGRAMM_GESETZ, tetrapoda-core.js:2117–2131) | `_kreaturTaetigkeit` (kreatur-leben.js:2039), Tempo :3385, Wandern :1417 | Wolf und Fuchs sind nachts aktiv, der Hirsch in der Dämmerung, der Bär am Tag |
| Durst: durstS 1200, suchPauseS 300 (DURST_GESETZ, tetrapoda-core.js:2099) | `_kreaturDurstig` (kreatur-leben.js:2017) → `updateCreatures` :3286–3293 → `_tickCreatureDrink` :1803 | Die Herde zieht zum Ufer und trinkt Seite an Seite |
| Lebensraum: Boden-Klasse × Eignung je Gattung (LEBENSRAUM_GESETZ, tetrapoda-core.js:2072–2083) | Revier `_kreaturRevier` (kreatur-leben.js:3228) über `_creatureCharacterWander` :1406, Wander-Ziel :1423, Seelen-Wahl `_pickFaunaSoulAtPlayer` (kreatur-leben.js:1687) | Wolf im Wald, Bär an Fluss und Hang |
| Bestand je Region: logistische Bilanz, Kapazität K aus Lebensraum × Nahrung (Äsung oder Beute nach diet), Riss nach Holling, Fraß senkt Jungwuchs (BESTAND_GESETZ, tetrapoda-core.js:2197–2230) | `_kreaturBestand` (kreatur-leben.js:2114), `_bestandTakt` :2401, `_kreaturFrass` :2191 | Die Zahl der Tiere je Revier und der Jungwuchs des Felds |
| Wasser: Archimedes (ρ fleisch gegen Wasser), Wasserlinie an der Schultergelenk-Höhe | `_kreaturSchwimmt` :1220, `_leibGetragen` :762 | Schwimmen, Waten, Strömungs-Drift :3492–3497 |

## (2) WÜRFE UND TABELLEN

Würfe ohne Gesetz dahinter (Hash oder Zufall):
- **Körpergröße**: `_creatureBodySize` (koerper-leib.js:2545) würfelt `_rollGenome(id,"creature-size")` in die Bänder VERHALTEN.groessen
  (tetrapoda-core.js:253–260: 0,6–0,82 · 0,85–1,18 · 1,25–1,75 · 1,9–2,7). Bestand-Geburt mit `_creatureBodySize("b"+key+"."+rng·1e9)`
  (kreatur-leben.js:1993). Die Größe ist der EINE individuelle Wert, und er steuert alles: Masse ∝ bs³, also Beute, Temperament,
  Biss, Magen, Leine (:554 × bs) und Tempo (√L). **Wirkung:** Ein Gigant-Hirsch (bs ≥ 1,86) springt in den Zustand „wehrhaft",
  ein kleiner Wolf (< 0,7) wird „scheu" und jagt nicht. Eltern gibt es keine, der Wurf ist das ganze Erbe.
- **Kopfzahl des Wurfs**: `zeile[0] + floor(rng·(max−min+1))` (kreatur-leben.js:1873, 1988), aus herde.wurf.
- **Seele bei der Geburt**: `LG.wahl(klasse, rng(), L)` (kreatur-leben.js:1691). Der Zufall ist hier nach Lebensraum × Häufigkeit
  GEWICHTET, also nur halb ungebunden.
- **Gemüt beim Boot**: `rng()<0.7 ? (nass?"sad":"happy") : …` (kreatur-verhalten.js:2367). **Wirkung:** `emotion==="happy"` verdoppelt
  das Tempo (freude.tempoMul 2, :3250). Wer das Gemüt ausklingen lässt, fällt auf „happy" zurück (:3524). Damit läuft jedes ruhige
  Tier mit ×2.
- **Wander-Kurs ohne Ziel**: `sin((idNum·131+slot)·12.9898)·43758.5453` (:1424). Es ist ein Rauschen aus der netId, nur wenn
  `_kreaturWanderZiel` nichts liefert.
- **Erster Ruhe-Pegel**: `_verhaltenHash(id,4099)` (kreatur-leben.js:2058). Er entkoppelt nur die Phase und ist harmlos.
- **Aktion je Stimmung**: `verhaltenWahl` mit Hash aus Index und Zeit-Bucket (koerper-leib.js:2926; Tafel VERHALTEN.stimmung,
  tetrapoda-core.js:116–123). **Wirkung:** welche Geste (scan/shake/yawn/playbow …) wann spielt.
- **Gegenwehr**: `_faunaRng()() < strikeChance` (kreatur-leben.js:825), Chance aus dem Profil des Temperaments.
- **Geburt und Tod im Bestand**: `rng() < bilanz.geburt / tod / riss` (kreatur-leben.js:2412, 2416, 1979). Die Chance ist gesetzlich,
  das OPFER aber `_bestandAeltester` (:2372): **trait-blind**.

Tafeln je Art (Schlüssel = Gattungs-String, jeweils 4 Zeilen):
- `GATTUNGEN` {size, neck, leg, diet, build} (tetrapoda-core.js:62). Das ist das Art-Genom von heute: 5 Dials.
- `FURCHT_GESETZ.fluchtDistanzM` (:1998). Die Gültigkeits-Wand verlangt eine Zeile je GATTUNGEN-Schlüssel (kreatur-verhalten.js:3831):
  **eine neue Art ohne Zeile ist ein Kern-Pflicht-Bruch.**
- `VERHALTEN.herde.wurf` {wolf [3,6], deer [3,7], fox [1,1], bear [1,1]} (:289).
- `ETHOGRAMM_GESETZ.gattung` {ruhen, nahrung, ruheTaktS, aktiv[]} (:2126–2131).
- `LEBENSRAUM_GESETZ.gattung` + `haeufigkeit` (:2077–2083).
- `TETRAPODA_SOUL_MAP` (Seele → Gattung) und `CREATURE_SOULS` (bodyParts: Loot, Größen-Symmetrie in `computeCreatureStats`,
  kreatur-leben.js:723–735).
- Art-unabhängige Stellwerte ohne Anker im Körper: VERHALTEN.jagd (hetzM 6, pirschSichtM 5, speedBoost 1,45), furcht (noticeRadius 22,
  fleeRadius 14, Schwellen), wandern (leashBaseM 18, leashSpanM 10, strideSec 2,5), separation, aufgaben (Tempi in m/s ohne Körper),
  temperament.profile (strike/fleeMul je Temperament-Klasse, tetrapoda-core.js:215–220). Alle gelten für jede Art gleich.

Nicht-physikalische Größe im Physik-Pfad:
- `_creatureMoveCharacter` speedMul = `computeCreatureStats.speed / base` (:549; kreatur-leben.js:1388) kommt aus Substanz-Tags, und
  die sind für alle Tiere gleich (Lehre 8, kreatur-leben.js:629–631). Er wirkt also nur über die Größen-Symmetrie `_compoundSizeFactor`.
- Das Leben (hpMax) ist Leben-der-Substanz × (m/refKg)^(2/3) (kreatur-leben.js:752). Der Substanz-Teil ist ebenfalls tag-gleich.

Zwillinge an der Art-Quelle:
- `_kreaturDiet` (koerper-leib.js:2873) liest `_tetrapodaStudioDials(recId)` OHNE GATTUNGEN-Basis und ohne `ud.gussDials`, mit 1
  als Ersatz. `_creatureTemperament` liest dagegen `_ofenKreaturDials(gattung, ud.gussDials)` (kreatur-leben.js:632) und
  `_bestandDiet` liest `_ofenKreaturDials(g)` (:2155). Das sind drei Leser der Kost auf zwei Wegen. Trägt ein Individuum eine
  eigene diet, urteilen Jagd und Aas nach dem Buch, das Temperament nach dem Individuum.

## (3) GRÖSSEN mit Einheit, die ein Erbe-Gesetz lesen könnte

Liegen vor (je Individuum, aus der Gestalt):
- Masse m [kg] `_leibMasse` :770. Hüft-Höhe L [m] :682. Körperlänge [m] :2661. Quer-Radien rad[0..2] [m], halb, Höhe, Reichweite
  [m] `_kreaturLeib` :731. Wasserlinie [m] :1224. Raum [m] :633.
- Tempo [m/s] (tempoEinheit √(gL), Sprint, Ansprung), Biss-Reichweite [m] :1604, Biss-Impuls J [N·s] :821.
- Magen voll [kg] = 0,2·m, Verdau-Rate [kg/s] = voll/600, Fress-Rate [kg/s] = voll/60, Fleisch eines Kadavers [kg] = 0,6·m.
- Fluchtdistanz [m] je Art, Witterung 50 m, Jagd-Dauer 45 s und Ruhe 120 s, Durst-Periode 1200 s, Alter `alterS` [s] mit Grenze
  FAUNA_MAX_AGE_MS 35 min (daten.js:176).
- Bestand: Kapazität [Köpfe] = kopfJeHa 25 × Σ Lebensraum × Fläche [ha] × Nahrung; Fraß je Takt; taktS 10 s.
- hp/hpMax, damage, defense (Exponenten 2/3 · 1/3 · 2/3 der Masse, KAMPF tetrapoda-core.js:3959).

Fehlen (keine Zahl mit Einheit, kein Leser):
- **Energie-Haushalt** in J oder W: kein Grundumsatz (Kleiber m^0,75), keine Kosten für Laufen, Sprint oder Jagd. Die Hetze kostet
  nur die feste Uhr dauerS. Der Magen leert sich linear nach Masse, nicht nach Stoffwechsel.
- **Temperatur und Kälte**: kein Leser, kein Tod durch Kälte, keine Fell-Isolation im Verhalten (die Fell-Höhe [m] existiert nur
  als LOD-Maß, kreatur-verhalten.js:3966).
- **Sinne als Größe des Leibs**: Witterung 50 m, Sicht noticeRadius 22 m und pirschSichtM 5 m sind für alle Arten gleich, ohne
  Bezug zu Kopf, Nase oder Auge.
- **Fortpflanzung des Individuums**: keine Eltern, kein Geschlecht, keine Wurfgröße aus der Masse, keine Tragzeit. Die Geburt ist
  eine Bestands-Chance je Gattung (kreatur-leben.js:1979).
- **Fitness je Individuum**: weder Lebensenergie noch Zahl der Nachkommen. Wer stirbt, entscheidet das Alter.
- **Lebensspanne aus der Masse**: eine Grenze (35 min) für jede Art und Größe.

## (4) NAHT

**`_ofenKreaturDials(recId, ovOpt)` — stamm/koerper-leib.js:1022–1031.** Hier entsteht heute das Art-Genom eines Leibs:
`dials = GATTUNGEN[recId] ⊕ Buch (_tetrapodaStudioDials) ⊕ ovOpt` (ovOpt = `ud.gussDials`, heute nur aus der Studio-Prägung und
der Übergabe, kreatur-leben.js:163–168).

- **Was dort steht**: eine der 4 Zeilen von GATTUNGEN (tetrapoda-core.js:62) nach dem Namen gewählt, ohne Abstammung, ohne Variation
  je Individuum. Die einzige individuelle Variation ist bodySize und läuft daneben über `_creatureBodySize` (koerper-leib.js:2545).
- **Wer es liest**: der Guss jedes Leibs (Memo-Key `_ofenKreaturKey` recId|lod|dials, koerper-leib.js:1033). Daraus folgt die
  Gestalt, also leibV, beinL und quer. Die tragen alle physikalischen Leser aus (1): Masse, Tempo, Biss, Raum, Wasser, Magen. Weiter
  `_creatureTemperament` (kreatur-leben.js:632), `_bestandDiet` (kreatur-leben.js:2155) und `_tetrapodaSoulParts`
  (koerper-leib.js:1012).
- **Was ein Genom-Gesetz dort brauchte**: ovOpt (bzw. die Basis) als Funktion (Samen, Eltern, Mutation) statt als Zeilen-Wahl, und
  bodySize als Teil desselben Vektors statt als zweiten Wurf.
- **Was dafür vorher fallen muss**, damit JEDER Leser das Genom liest:
  - Der Zwilling `_kreaturDiet` (koerper-leib.js:2873) muss auf dieselbe Quelle gehen.
  - Die Gattungs-Tafeln, die nach dem String greifen (fluchtDistanzM, herde.wurf, ETHOGRAMM.gattung, LEBENSRAUM.gattung/haeufigkeit,
    TETRAPODA_SOUL_MAP), müssen aus den Dials und der Masse ABGELEITET werden. Sonst trägt eine neue Art keine Zeile und bricht
    (Gültigkeits-Wand kreatur-verhalten.js:3831).
- **Zweiter Eintritt, gleich wichtig**: der Bestand-Datensatz `{id, soul, g, bs, alterS, x, z, v}` (kreatur-leben.js:1996). Er ist
  das Individuum fern als Zahl. Ein Genom muss dort mitreisen, sonst kennt es nur der gezeichnete Leib.

## (5) PREIS

Je Art (je Gattung × Dials, einmal):
- Guss der Vorlage auf dem Haupt-Faden: GTX 1050, 4 Tiere aus 2 Arten = 4 Güsse, 2,9–3,0 s am Stück (Kommentar :2382–2383). Daher
  wartet die Geburt auf den Ofen-Vorrat `_kreaturenBereit` :2471.
- Kalte Gattung zerlegt synchron: Maul des Wolfs 21,2 ms, Gestalt eines Fuchses 4,9 ms (Kommentar :1644–1645; heute hinter
  `_kreaturBissGrob`).
- Glied-Kapseln je Gattung × Glied einmal gepasst (`_gliedKapselMemo`, Kommentar :2803–2808); Fell-Höhe je Geometrie einmal (:3966).
- **Mit der Zahl der Arten wächst**:
  - der Ofen-Vorrat (Vorlagen und Programme je Gattung, :2384–2385);
  - `_bestandDiet` und `_kreaturBestand` mit O(Zellen × Gattungen) je Takt und Region (kreatur-leben.js:2131–2139);
  - jede der ~10 Tafeln um eine Zeile;
  - und der Memo-Key: er trägt die Dials. **Eigene Dials je Individuum sind ein Guss je Individuum.** Das ist der harte Preis eines
    Genoms an der Naht.

Je Individuum:
- Ein Klon aus dem Memo. maxCreatures 20 (dirigent-kern.js:280) deckelt die gezeichneten Leiber, der Bestand ist eine Zahl.
- Takt: 10 ferne Tiere außer Bild 0,72 ms Kreatur-Takt plus 0,23 ms Matrix-Gang vor K59 (Kommentar :2951–2953). Mit fernen Läufern
  0,78 statt 0,41 ms (39 Tiere, :3631–3632). Biss-Wahl einst 1,29–2,35 ms je Jäger bei 15 Tieren (:1617).
- O(n²) je Takt: Separation :476, freier Weg :651, Leib-Kontakte × LEIB_GAENGE 8 :911–928, Bestand-Jagd (kreatur-leben.js:2171–2180).
- Geburt: ein Wurf je BOOT_PHASE3_SPAWN_MS 280 ms (:3941). Wiederkehr GTX 1050 mit 13–17 Wesen: 25–38 ms (:2488).
- Tris, MB und Draw-Calls je Tier nennt mein Feld nicht. Die einzige Zahl ist die Rand-Tafel tetrapoda-core.js:46 (tris 7000,
  draws 5 auf einer Stufe), deren Kontext ich nicht gelesen habe.

## (6) OFFEN

- Ob ein im Nah-Kreis per Biss getöteter Leib (damageCreature, `_creatureCombatDeath`) sein Tier auch aus dem Bestand-Verzeichnis
  streicht. Den Rest von `_creatureCombatDeath` ab kreatur-leben.js:914 habe ich nicht gelesen. Davon hängt ab, ob die echte Jagd
  (schneller, größer, gesünder überlebt) überhaupt eine Selektion ist oder ob nur die Bestand-Zahl (das Älteste stirbt) zählt.
- Wie `_rollGenome` (Wurf der Größe) gebaut ist und ob er weitere Achsen trägt.
- `verhaltenWahl`, `wundTempo`, `fluchtRadius`, `fluchtDistanz`, `bedrohung`, `furchtOrt`, `zielWunsch`, `verbandZug` im Kern habe
  ich nur am Aufruf gelesen.
- Ob die Rand-Tafel tetrapoda-core.js:46 je Gattung gilt (Tris je Art).
- `_kreaturWanderZiel` und `_kreaturWanderKurs` (Lebensraum-Ziel) habe ich nicht gelesen; wie oft der Hash-Kurs :1424 im Spiel
  wirklich fährt, weiß ich nicht.
- Selektions-Kräfte heute, ehrlich:
  - Hunger: Tod je Gattung über K, Opfer das Älteste.
  - Riss: Chance nach Holling, Opfer das Älteste der Beute.
  - Alter: 35 min.
  - Nah zusätzlich der echte Biss (hp ≤ 0).
  - Kälte: KEINE. Verhungern des Individuums bei leerem Magen: KEINE (der Magen steuert nur satt/jagt/äst).
  - Ein Erbe könnte nur der echte Biss im Nah-Kreis auslesen. Ob der die Zahl berührt, ist der erste Punkt oben.
