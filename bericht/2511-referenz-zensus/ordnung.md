# Zensus Referenz-Szenen: Ordnung (Vollender)

Gelesen habe ich nur Dateien, nichts gefahren. Quellen: `origin/punkte-maschine` vision/meisterkarte-2.json (253 Leitern),
vision/front-tafel.md (Stand 25.11. 06:17), vision/karte-2-stand.json (gebucht 105 von 1 718), vision/kapitel/*.json,
meisterkarte-quelle/punkte/stationen/*; auf main spec/profiband/haushalt.json und scripts/werkbank.cjs.
Geprüft habe ich ALLE 191 genannten Kennungen, keine Stichprobe: Prüfskript `_pruef.cjs` (Leiter, Sprosse, Front, Anspruch).

## 1. Prüfung als Gegner

**(i) Existenz.** Von 191 Kennungen fallen 2, die Leiter steht nicht in meisterkarte-2.json:
`karte2.leben.tiere`-Szenen nennen `leben.kopplung.kaskade#2` und `#3`, die Leiter gibt es nur in der veralteten
vision/kapitel/leben.json. Umgekehrt gilt: `mensch.zeit.erde#1` und `mensch.kultur.strassenleben#1/#2` fehlen in
kapitel/mensch.json, stehen aber in meisterkarte-2.json und in der Front-Tafel. Sie gelten.
Es gibt zwei falsche Orte: der „Messort tier (haushalt.json:588)“ ist eine Haushalt-**Klasse** (`klassen` ab :434), kein
Messort. Die Messorte sind haushalt.json:42–421 (wiese, genesis, dorf, buehne, stadt, stadt-voll, ort-zeichen, hochhaus-dach,
gipfel-blick). Einen Messort „ufer“ oder „kueste“ gibt es nicht.

**(ii) Front.** Von 191 Kennungen liegen 97 an der Front ihrer Leiter, 86 darüber, 6 sind schon gebucht und 2 existieren nicht.
Von den 97 Front-Sprossen haben 27 KEINE STATION, 17 sind von einem gelandeten Zweig beansprucht und zählen also nicht für einen
zweiten Macher.
Schon gebucht, also 0 Punkte: `planet.kopplung.land-meer-luft#1` und `#2`, `planet.kopplung.gegenwart#1` und `#3`,
`mensch.netz.verkehr#1` und `mensch.nahrung.strom#1`.
Gekürzt habe ich die Zahl jeder Welle, deren Ziel-Sprosse nicht hält:
- Alpental 1 → **0**: Die Welle zielt auf land-meer-luft#1, und die ist gebucht (Front #5 verlangt eine Hebung über 10⁶ a).
- Himmel S1 Mond 1 → **0**: Der Mond richtet himmelsmechanik#3, die Front ist #1 und von w28-licht-stetig beansprucht.
- Himmel S2 Wolken 1 → **0**: Der Richter von wolken#1 verlangt wörtlich „2AFC ≤ 85 %“, das ist ein Panel (R11).
- Werktag 2 → **0 geprüft**: Die Karte sagt bei rhythmus#2 wörtlich „zwei Spitzen“, also darf kein NHTS-Band mit 4 Spitzen
  an ihre Stelle. Für tag#2 sagt die Karte „ATUS-Profil ≤ 20 %“, also nicht ZVE. Der Leser selbst nennt die relativen 20 %
  an kleinen Kategorien unerfüllbar.
- Mischwald 2 → **1**: Bei dichte#1 heißt es wörtlich „gegen Foto; Bildpaar gegen REF“. Das ist ein Panel, ein LAI-Band
  ersetzt es nicht. lebenslauf#1 („gegen Ertragstafel“) trägt ein Band, braucht aber stehendes Totholz.
- Watt 2 → **2** bleibt: gezeiten#2 liegt über der Front, ist aber dieselbe Funktion (Spring-Nipp 14,8 d) und rückt mit #1 nach.
- Knoten 2 → **1**: lenker#1 verlangt wörtlich „Reisetempo ≥ 80 % des erlaubten“. Den Richter kann der Leser darum nicht
  streichen, und lenker#1 ist unsicher.
- Gutsdorf 2 → **1**: stoffstrom#1 verlangt „Werkzeug in der Hand“, der Rennofen gibt nur den Barren.
- Rom-Stadt 1–2 → **1**: kreislauf#1 misst „Mahl bis Feld ≥ 90 %“, nicht den Brunnen.
- Gnu, Mammut, Augusta, London: **0**. Die Leser nannten das schon selbst.

**(iii) Quellen.** Die Bänder, die Wellen tragen, haben Autor und Zahl (MacNulty, Beschta & Ripple, Box2D v3, Gordon, HCM/IDM,
Wealden, BSC 9110, Pompeji). URLs stehen in den Einzelberichten. Was nur aus Suchauszügen stammt, trägt „ungeprüft“: Turner,
Kashian, Kummu, Martin & Moyce, die ZVE-Zahlen, Fruin, die Kinderquote 1910 und die Albedo einer Brandfläche.
In den Stationen trägt kein Soll eine Quelle: 0 URLs in k2-erleben.js (564 `wortlaut`), k2-same.js (402), k2-kosmos.js (127).

**(iv) Feature-Stopp.** Die 12 Wellen vertiefen bestehende Gesetzbücher: koerper-frei, koerper-seele, feld-brand, den
Meer-Körper in gelaende-core, VERKEHR_GESETZ, die Schmiede und _kreaturFrass. Weggelassen sind die Szenen, die Neues verlangen:
ein Erd-Samen mit Geografie (das ist selbst die Leiter `planet.erde.gestalt`, Front #1 KEINE STATION), Bison und Löwe als neue
Gattungen, der Großbau Arena als neuer Bautyp, der Flächenbrand über 25 Spieljahre und die Fauna je Zeitalter.

## 2. Rangliste (geprüfte Sprossen je Stunde, bei Gleichstand Gestalt vor Kopplung)

| Rang | Welle (Szene · Gruppe) | Der EINE Schnitt · Dateien | Sprossen (geprüft) | h | Gerät | Bildbeweis | Risiko |
|---|---|---|---|---|---|---|---|
| 1 | Toter Himmels-Leser (Gipfel-Blick S1 · himmel) | Die Station liest `userData.mags` statt des toten `geometry.attributes.aMag` (k2-kosmos.js:242, :348); ein Leser misst die Himmels-Leuchtdichte in cd/m² über EINHEIT_LX 16 090 (welt-licht.js:76), k2-erleben.js:4179 | planet.kosmos.sternhimmel#2, erleben.bild.himmel#1 (2) | 3 | Cloud + Radeon | gipfel-blick Ego Neumond-Nacht, Zählkurve gegen BSC 9110; Mittag klar gegen 8 kcd/m² (ungeprüft) | sternhimmel#2 verlangt dazu einen rückläufigen Planeten; der Himmel kann außerhalb ±0,3 EV liegen |
| 2 | Fall- und Stoß-Hof (same) | Relax-Gang ohne Bias nach Box2D v3 Soft Step, nur in stamm/koerper-frei.js `_freiSchritt`/`_freiKontakt`; flug#1 am heutigen main nachmessen (FREI.luft steht) | same.physik.koerper#1, same.physik.flug#1 (2) | 4 | Cloud + Radeon | Wiese Ego 1,7 m: Fass aus 4,5 m, Aufprall +2 s vorher/nachher; Ruhe 2,283 → ≤ 2 s | Zittern ≤ 1 cm und Spalt ≤ 5 cm sind ungemessen |
| 3 | Rotwild bei Querwind (same/leben) | Die Witterung reicht nur windab, gegen den Wind ist sie 0: stamm/koerper-seele.js `_scentAt`, windMod :1578–1636 | erleben.sinne.geruch#1 (1) | 2 | Cloud + Radeon | Third aus 20 m, Wind gedreht: die Bahn des Wolfs vorher gerade, nachher quer; Suchzeit ≥ 3× | gering |
| 4 | Wolfstal, Aufenthalt (tiere) | Das Soll 0,5·π·r² steht nicht in der Karte (Richter „Aufenthaltsfläche über 1 Spieltag im Fenster“, Umfang Leine 10 m); an seine Stelle tritt der Wortlaut (Fläche innerhalb der Leine, im Lebensraum) | leben.tiere.wanderung#1 (1) | 2 | Cloud + Radeon | Spur eines Hirschs über 1 Spieltag im Fenster | Ein Feld-Band für den Tages-Aufenthalt fehlt (ungeprüft); Leine Kern 18 m gegen Karte 10 m |
| 5 | Trockene Wiese bei Wind (same) | Das EINE Brand-Feld zeichnet sich selbst: Flammen-Instanzen je brennender Zelle, Aschen-Albedo am Boden; stamm/feld-brand.js, der Albedo-Leser des Bodens | same.kopplung.kaskade#1, same.kopplung.stoerung#1 (2) | 6 | Cloud + Radeon + GTX 1060 (Karte: beide Geräte) | Ego vor dem Herd: 60 s trocken gegen 60 s Regen; die Zelle vor/nach dem Brand | Die Front wandert 1 Zelle in 60 s; Bild-p95 im Brand ist nie gemessen |
| 6 | Nordsee-Watt (planet) | Der Meer-Spiegel liest die Welt-Uhr als M2 12,42 h + S2 12,00 h (gelaende-core.js wasserSpiegel :7773 / L.waterLevel), stamm/wasser-hydro.js, voxel-worker.js; Messort `kueste` in haushalt.json | planet.wasser.gezeiten#1, #2 (2) | 8 | Cloud + Radeon + GTX 1060 | die Bucht bei Ebbe gegen Flut +6,2 h, gleiche Kamera | Bucht 11 km vom Spawn; Preis P über 24 h Spielzeit |
| 7 | Bach unter Wasser (pflanzen) | Station bild#1 im Fenster an drei festen Posen (Bach, See, Fluss) gegen die Bänder 5–20 / 2–16 / 1–1,5 m (k2-leben.js:4318–4320) | leben.wasser.bild#1 (1) | 4 | Cloud + Radeon | Unter-Wasser-Blick an fester Pose | Der See-Körper zeichnet auch das Meer, darum treffen See und Fluss ihr Band vielleicht nicht |
| 8 | Markt der Metropole (himmel) | Der Hörort der Klang-Stationen wechselt von der Wiese im Regen nach stadt-voll (k2-erleben.js); die Musik-Duck wird im Mischer ≤ 12 dB (Karten-Wortlaut, gemessen 13,27) | erleben.klang.getuemmel#1 (1) | 4 | Cloud + Radeon | Abgriff am Markt über 10 min, 7 Stimmen, Spitze ≤ 0 dBFS | die 10 min im 60-s-Rahmen der Stationen |
| 9 | Mischwald (pflanzen) | ohneZahl (k2-leben.js:26–33) fällt für lebenslauf#1: das Höhenhistogramm aus dem Bild gegen die Ertragstafel (Reineke −1,605 ±10 %, k2-leben.js:873) | leben.pflanzen.lebenslauf#1 (1) | 5 | Cloud + Radeon | Ego 30 m im Bestand hinter der Mess-Wiese | Der Umfang verlangt stehendes Totholz, doch Totholz wächst nicht |
| 10 | Knoten der Großstadt (netz) | Folge und Vorfahrt aus EINEM VERKEHR_GESETZ (IDM T 1,5 s, s0 2 m; HCM t_c, t_f; Rang aus WEGE_KLASSE); der feste abstandM 2,5 fällt (stamm/siedlung-verkehr.js:2536, fachwerk-core.js:5998); dazu Station verkehr#2 | mensch.netz.verkehr#2 (1, lenker#1 möglich) | 7 | Cloud + Radeon | stadt-voll Third 25 m über dem Knoten 8>9 um 10 Uhr: vorher Bug an Bug, nachher fließt der Strom | lenker#1 verlangt ≥ 80 % Reisetempo; die gebuchte verkehr#1 wackelt |
| 11 | Gutsdorf um 1300 (netz) | Der Rennofen hat zwei Bestände, Erz-Halde und Holzkohle-Stapel; die Luppe wiegt 10 % der Erzmasse (Wealden); ohne Brennstoff gibt es keinen Barren (stamm/feld-leben.js:2499, :3121) | mensch.wirtschaft.energie#1 (1, stoffstrom#1 mit Werkzeug) | 7 | Cloud + Radeon | 6 m vor der Schmiede, Tag 0 gegen Tag 7: Halde und Stapel kleiner, Barren am Ofen | Das Werkzeug in der Hand fehlt |
| 12 | Wolfstal-Ufer (tiere) | `_kreaturFrass` (stamm/kreatur-leben.js) liest den Ufer-Jungwuchs des phyto-Bestands und schreibt ihn zurück; Messort `ufer` | leben.oeko.dynamik#2 (1) | 8 | Cloud + Radeon | Ufer, 10 Spieljahre ohne Wolf gegen Gegenlauf, Deckung −≥ 20 % (Beschta & Ripple 2016) | Tiere leben 35 Spielminuten (stamm/daten.js:176); der Zeitraffer über 10 Jahre ist unbewiesen |

Summe: **16 geprüfte Sprossen in ≈ 60 h.** Die Leser meldeten 25, nach der Prüfung bleiben 17 (eine davon als Welle 13 unten).
Die GTX 1050 trägt keine dieser Wellen.

**Weggelassen** (Rang 13 und tiefer, oder 0 an der Front):
- Garküchen der Gasse, strassenleben#1: 1 in 10 h.
- Grand Canyon, archiv#2: 1 in 10 h; der Richter „gegen Fotos“ ist ein Panel-Risiko.
- Arena, arena#2: 1 in 16 h; dafür braucht es einen neuen Großbau.
- Yellowstone-Brand, sukzession#2: 1 in 16 h; Richter Fotoreihe.
- Werktag: 0 geprüft.
- Gnu, Mammutsteppe, Augusta, London (das Augen-Urteil fehlt), Alpental (die Sprosse ist gebucht), Mond, Wolken (Panel): je 0.
**Nicht gedeckt:** `leben.oeko.vielfalt#1` (Ego 0 Sichtungen in 601 s) ist „Tiere im Blick“, die Klage des Schöpfers. Keine
Szene liefert dafür einen Schnitt. `_bestandErscheint` steht nicht auf main, und `masse#1` (die Herde ist ungezeichnet) ist von
landungen-2211 und pm-seite-ohne-m beansprucht.

## 3. Richter-Bilanz (96 Urteile aus 8 Gruppen)

| Herkunft | aussen | gesetz | erfunden | unklar |
|---|---|---|---|---|
| Zahl | 26 | 16 | 45 | 9 |

Urteile der Leser: bleibt 50 · band 35 · nur-bericht 7 · faellt 4.

**Meine Korrekturen.** Zwei „faellt“ der Leser sind Wortlaut der Karte, und eine Leiter setzt nur der Schöpfer. Sie gelten
deshalb als **bleibt**: getuemmel#1 „Duck 8–12 dB“ und lenker#1 „Reisetempo ≥ 80 %“.
Zehn „band“ widersprechen dem Wortlaut der Karte. Ein Arbeiter darf sie nicht tauschen, sie gehen als Befund an den Schöpfer:
rhythmus#2 („zwei Spitzen“), geist.tag#2 (ATUS, nicht ZVE), partner#1 (r ≥ 0,5), dichte#1 (Foto), fluid#2/#3 (Ritter ±15 %),
zerfall#3 (10–30 %), land-meer-luft#1 (≥ 2:1, gebucht), siedlungslage#3 (≥ 70 %), klimageschichte#1 (+300 m) und
himmelsmechanik#3 (≥ 2 EV).
Danach sind es bleibt 52 · band 25 zulässig + 10 an die Karte · nur-bericht 7 · faellt 2.

**faellt** (legal): Station wanderung#1 0,5·π·r² (tiere; die Karte nennt keine Zahl) und die zielplan-Spitzenzeile (alltag;
ein Zwilling der Station rhythmus#2).
**nur-bericht** (7): rudel Umstellen 540°/n, mahl 40 %/120 s (tiere), VK Arbeit 0,25, VK Warte-Graph-Tiefe 12, VK Ohr (netz),
die Panel-Sprossen stadt.groesse#1, stadt.breite#1, stadt.messlatte#1, bau.bedarf#1, bau.huelle#1 und kultur.verstaendigung#1
(rom), preis.speicher#1 400 MB (same).

**band** zulässig (Band ← Szene):
- tiere: jagdkreis Riss 0,2–0,4 + Plateau ← Wolfstal (MacNulty 2012) · verhalten#2 Feld-Ethogramm Wapiti-Winter ← Wolfstal ·
  dynamik#2 −20 % ← Wolfstal-Ufer (Beschta & Ripple).
- pflanzen: lebenslauf#1 Ertragstafel ← Mischwald · ohneZahl jahreslauf#4/kraft#3/#4 ← Mischwald (Zahl je Quelle offen).
- planet: seegang#1 Fresnel 2–100 % ← Watt · einschlag#1 Tiefe/D mit Alter (Meteor Crater 0,143) ← Colorado.
- himmel: himmelsmechanik#1 Sprung ≤ 3× Ref-Steigung ← S1 (tag-ref USNO 171) · sternhimmel#2 BSC 9110 ← S1 ·
  bild.himmel#1 8 kcd/m² ← S1 · raum#2 RT60 Sabine ← S3 Markt · landschaft#2 Pkw 65–70 dB in 10 m ← S3.
- alltag: menge.bild#2 Fußgängerzählung je Stunde ← Werktag (Quelle ungelesen) · leib.spur#1 Altersaufbau der Epoche ←
  Werktag · generationen#1 Kinderquote nach Epoche ← Werktag/Augusta (gebucht, nur Lesart).
- netz: VK Frist Route ÷ Tempo + Knoten × t_f ← Knoten (HCM) · VK fahrend/min ← Knoten (IDM/HCM) · lenker Zeitlücke 1–3 s ←
  Knoten (sitzt an der falschen Sprosse) · medium#2 Bremsweg ← Knoten (ADAC).
- rom: krieg#2 Sterblichkeit 19/100, Kampf 10–15 min ← Arena · stand#1 Gini der Wohnfläche 0,35–0,48 (Kohler 2017) ←
  Pompeji/Ostia · strassenleben#1 eine Garküche je ~115 Bewohner ← Pompeji.
- same: koerper#1 Ruhezeit aus dem Stoßgesetz + Schlaf 0,05 m/s ← Hof · kaskade#1 Front 20 % des Winds × Flammenfläche ← Wiese ·
  stoerung#1 Albedo der Brandfläche ← Wiese (ungeprüft).

**Befund für die These.** 52 Richter bleiben, und die meisten von ihnen fanden echte Spiel-Fehler. Falsch geschärft sind
höchstens 9, nämlich die 2 legalen „faellt“ und die 7 „nur-bericht“. Dazu kommen 10 Zahlen, die in der KARTE selbst stehen.
Am Messgerät liegt die Zeitverschwendung selten. Sie liegt am Messort (Klang an der Wiese im Regen, dynamik#2 am Ort ohne
nahWiese), an toten Lesern (aMag) und an fehlender Mechanik.

## 4. Das gemeinsame Gesetz

Allen 22 Szenen ist dasselbe gemeinsam: **eine Szene ist ein Messort mit Ort, Zeit (Uhr, Tag, Jahr/Epoche), Wetter und den
Bändern mit Quelle, und EIN Leser stellt ihn für Station, Linse und Bildpaar auf.**
- **Steht:** spec/profiband/haushalt.json `messorte` :42–421 (9 Orte mit spieler, blick, ortPose, gruendung.wort, imBild).
  Der Leser dazu ist werkbank.cjs:901ff (`umstellen --ort`, :4110), band-urteil.cjs:45. Die Abnahme liest imBild
  (scripts/lib/abnahme-urteil.cjs:38). Die Epoche ist schon über das Wort erreichbar („dorf 7 300 antike“,
  stamm/feld-leben.js:1027).
  Die Bänder: sollText kennt Spanne und Toleranz (meisterkarte-quelle/punkte/stationen/k2-mensch.js:170), das Wort steht als
  `wortlaut`.
- **Fehlt:** Kein Messort trägt Uhr, Tag, Wetter oder Jahr. Jede Station stellt sie selbst (ungeprüft je Station), und so
  messen Klang und dynamik#2 am falschen Ort. Kein Soll trägt eine Quelle (0 URLs in k2-erleben, k2-same und k2-kosmos).
  `ufer` und `kueste` fehlen als Orte.
- **Kleinster Schnitt:** Der Messort bekommt ein Feld `zeit: {uhr, tag, wetter, wort}`, und `umstellen --ort` liest es als
  EINZIGER Leser. Die Station nennt nur noch die Ort-Id. Der Soll-Eintrag bekommt `quelle: "Autor Jahr URL"`, ein Feld im Schema
  von K.soll und sollText. Dazu kommen die Orte `kueste` (Welle 6) und `ufer` (Welle 12). Das sind etwa 2 h Cloud, kein Gerät.
  Die Sprossen fließen erst über die Wellen 6, 8 und 12.

## 5. Einwand

1. **Die Front frisst die datenreichen Szenen.** 86 von 191 Kennungen liegen über der Front. Gnu (10⁶ Tiere) und Mammutsteppe
   treffen masse#3–5 und arten#5, also 0 Punkte, solange masse#1 (beansprucht) und arten#1 (2 Arten, Uhr in Wand-Takten
   k2-leben.js:1837) nicht stehen. Die These hebt die DECKE, denn die oberen Sprossen verlangen einen Umfang, den echte Daten
   beschreiben. Die heutige Zahl hebt sie nicht.
2. **Den Erd-Samen gibt es nicht, er ist selbst Scope.** `planet.erde.gestalt` (6 Sprossen, Front #1 KEINE STATION) und
   `same.kopplung.erdsaat` (Front #1) sind die Leitern der These. „An den richtigen Ort gehen“ heißt heute, ein Klima- oder
   Epochen-Analog zu bauen. Die Welt staucht die Höhe auf 0,11 K/m (gelaende-core.js:1300–1320), darum tragen nur
   dimensionslose Bänder.
3. **Bänder heilen keine fehlenden Macher.** 160 von 296 Zeilen der Front-Tafel sind KEINE STATION (74), Umfang nicht
   erzeugbar (60) oder Leser fehlt (26). Ein Band aus Domesday baut keine Mühle. Die Arena berührt 9 Sprossen, an der Front zählt davon 1.
4. **Das Panel bestimmt die Decke.** Mindestens 25 Front-Sprossen der Szenen urteilen per 2AFC oder Foto (wolken#1, dichte#1,
   gestalt#1, zeit.erde#1, die stadt-Panels …). Ohne Panel R11 bleibt die Decke bei 963–1 219 von 1 718 (Stand-Notiz 24.11.),
   und keine Referenz-Szene hebt sie.
5. **Zehn falsche Zahlen stehen in der Karte selbst** („zwei Spitzen“, Duck 12 dB, Ritter ±15 %, Reisetempo 80 %, +300 m bei
   gestauchter Höhe …). Ein Arbeiter darf sie nicht ändern. Sie sind der wahre Teil der Schöpfer-Kritik „auf Falsches schärfen“
   und brauchen sein Wort zur Leiter.
6. **Tier gegen Mensch im Kolosseum ist keine Sprosse.** leben.tiere.mensch#2 ist die Fährte, krieg#1 ist Mensch gegen Mensch.
   Die Szene eicht Bau, Stand und Gewalt-Band (krieg#2, stand#1), Verhalten von Tier gegen Mensch nicht.

## 6. Gestrichene Kennungen

- `karte2.leben.kopplung.kaskade#2`, `karte2.leben.kopplung.kaskade#3`: Die Leiter steht nicht in meisterkarte-2.json, nur in
  der veralteten kapitel/leben.json.
- Gebucht, also ohne Punkt (aus den Szenen gestrichen): `planet.kopplung.land-meer-luft#1`, `#2`, `planet.kopplung.gegenwart#1`,
  `#3`, `mensch.netz.verkehr#1`, `mensch.nahrung.strom#1`.
- Falscher Ort: „Messort tier (haushalt.json:588)“, das ist eine Klasse.
