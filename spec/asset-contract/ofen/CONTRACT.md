# Ofen-Vertrag — der Tier- und Mensch-Bake je Stoff-Klasse × Gelenk

> **NORMATIV.** Die Naht zwischen den MESHFREI-Gesetzbüchern (`tetrapoda-core.js` `__tetrapodaCore`,
> `koerper-core.js` `__koerperCore` — ihre Daten friert v7 ein) und dem OFEN, der aus ihnen gießt:
> `foundry-core.js` `BAKERS_BY_KIND.kreatur` (`bakeTierInstance`) und `BAKERS_BY_KIND.koerper`
> (`bakeMenschInstance`) — dieselben Bäcker, die der Foundry-Worker (`build-asset`) und der Wirt rufen.
> Jeder Guss MUSS die eingefrorenen Goldens in `golden/bake.json` byte-genau treffen
> (`npm run gate:ofen-contract`). EINGEFROREN — ein Re-Mint ist `MINT_FORCE=1` und ein benannter
> Vertrags-Akt im Commit (Ursache, Zahl je Klasse).
>
> Eingefroren S1 Wände (07.10.2026): der Handbeweis aus `3a0248e8` (das Fell folgt der Haut, „sha256 je
> Stoff-Klasse × Gelenk, 189 Klassen") und `8e6f628c` (die Hand-Mitte, „Mensch-Bake byte-gleich, 53
> Klassen") als Datei.
>
> Vertrags-Akt Welle LF (08.10.2026, der ferne Gang): die Tier-Stufe 1 (das Fern-Bild) ist geskinnt — die Haut
> trägt Gelenk-Gewichte wie Stufe 0, jedes starre Teil hängt starr (Gewicht 1) an seinem Gelenk, `skinJoints`
> reist im Beipack. 28 Klassen neu geprägt (je Art `L1|fell · straehneD · nase · dunkel · tierauge · pupille`
> am Gelenk `wolf` und `L1|beipack`); Beweis: ohne `skinIndex`/`skinWeight` im Fingerabdruck trifft jede
> L1-Stoff-Klasse ihr altes Golden byte-genau (Lage · Normale · Farbe · Index · Stoff), Stufe 0, alle 142
> Gelenke und der Mensch bleiben unberührt. In V18.538 (Integration mit S3 kreatur) aufgegangen: die Werte der
> `*-L1|*`-Schlüssel trägt allein die S3-Prägung unten (gelenkige Grobstufe für Tier UND Mensch, Fell-Muster über
> die Bone-Gewichte, `__aufsNiveau`) — der Tier-Sonderweg `fernStarr` des Gelenk-Gusses fiel, EIN Golden.

## Fälle

Jede Art des Tier-Gesetzbuchs (`wolf · fox · bear · deer`) und der Mensch (`mensch`), je deklarierte
Stufe (`PORTAL_RENDER_CONFIG.lod.kindStages`: kreatur `[0, 1]`, koerper `[0, 1]`) = 10 Güsse, Samen 1.
Die Fälle kommen aus den Gesetzbüchern selbst: eine neue Art oder Stufe erscheint als `neu (nicht im
Golden)` — rot, bis der Akt sie prägt.

## Die Klassen (golden/bake.json)

| Schlüssel | Inhalt des sha256 |
|---|---|
| `<art>-L<lod>\|<klasse>\|<gelenk>` | alle Meshes der Stoff-Klasse (`material.userData.__klasse`) am Gelenk (`userData.__assetJoint`) in traverse-Reihenfolge: Typ · `matrixWorld` (Float64) · Stoff-Signatur (Farbe · Emissiv · Rauheit · Metall · Deckkraft · durchsichtig · übrige Stoff-userData, z. B. `__seh`, `__webe`) · alle Attribute (Name sortiert, itemSize + rohe Bytes) · Index; dazu `meshes · verts · tris` |
| `<art>-L<lod>\|gelenk\|<name>` | das Gelenk des Skelett-Beipacks: `[parent, pos, quat, scale]` |
| `<art>-L<lod>\|beipack` | der übrige Beipack: `root · art · base · skinJoints · tailSegs · masse · handMitte` |

Stand der Prägung: 136 Stoff-Klassen × Gelenk Tier + 53 Mensch = 189 (= der Handbeweis), 284 Gelenke,
10 Beipacks. Seit K45-2 (14.10.): Mensch 31 — 461 Klassen; seit A4 (16.10.): Mensch 30 — 460 Klassen.

Vertrags-Akt S3 kreatur (08.10.2026, Lehre 19 — die Grobstufe ist gelenkig): Stufe 1 bindet ihre Haut an die
Gelenke wie Stufe 0 (Gewichte aus derselben Vorauswahl, das Fell-Muster über die Bone-Gewichte), jedes starre Teil
hängt mit Gewicht 1 an seinem Gelenk (skinIndex/skinWeight im Wurzel-Raum der Ruhe-Pose), die Bone-Ordnung reist im
Beipack (`skinJoints` wolf 31 · fox 33 · bear 25 · deer 26 · mensch 23; bis dahin trug Stufe 1 des Tiers keine).
Neu geprägt NUR die 40 Schlüssel `*-L1|*` (35 Stoff-Klassen + 5 Beipacks); L0 297/297 byte-gleich, die Klassen-Menge,
die Gelenke und die Dreiecke je Klasse unverändert.

Vertrags-Akt S3 kreatur, Nachbesserung (09.10.2026, Spike-Urteil am echten Renderer — Lehre 18): die Grobstufe wirft für
die feine, ihr Umriss muss deren Umriss tragen. Die Laplace-Glättung zog die Hülle auf dem doppelt so groben Raster nach
innen (dünne Läufe bis zur halben Dicke); jetzt kehrt jede geglättete Ecke der Grobstufe auf die Niveau-Fläche ihres Felds
zurück (`__aufsNiveau`, Tier und Mensch). Neu geprägt NUR die 8 Hüllen-Schlüssel `wolf|fox|bear|deer-L1|fell|wolf` und
`mensch-L1|haut|mensch` · `mensch-L1|stoff_*|mensch` (3); Ecken, Dreiecke und Meshes je Klasse unverändert, alle übrigen
475 Klassen byte-gleich (L0 297/297).

Vertrags-Akt K45-2 (14.10.2026, Labor = Welt beim Menschen — die Kleid-Gewichte und der Kleid-Schnitt ziehen in den Ofen):
(1) DER STOFF AUS DER HAUT (das Lab-Gesetz `_garmentFromSkin`, `__stoffAusHaut`): eine Kleid-Zone mit `dicke` (koerper-core
`kleidZonen`: Oberteil 0,032 außer dem Poncho, Hose 0,024, ohne Hose die Unterhose 0,012) ist die Haut-Region ihrer Teile, um die
Dicke entlang der Haut-Normale gehoben, mit IDENTISCHEN Gewichten, gespannt über die Mulden der Haut (24 Schritte Laplace, nie
näher als die Dicke), der Saum liegt auf der Haut; die Haut darunter fällt; die Grobstufe hebt ihren Stoff um das halbe
Raster-Mehr (0,015), damit ihr Wurf den Umriss der feinen trägt (der Band `checkBandKreaturKosten` des vollen Playtests, DECKUNG mensch IoU min 0,947, Basis 0,949). (2) DER LEIB unter dem Stoff: die gemalten Shorts
und die Gelenk-Kugeln sind Volumen der Haut (`leibV` 5,10 → 5,76, das Becken war kein Leib). (3) Der Poncho (weit, Lab-Drapé)
blieb eine Hülle, die die Gewichte der Haut erbte — bis w28-leib-nah (unten): er ist Stoff aus der Haut.
Neu geprägt NUR die 16 Mensch-Schlüssel: `mensch-L0|haut|{mensch,head,hand1,hand-1}` · `mensch-L0|stoff_{233047,2a2c30,e8e6e0}|mensch`
· `mensch-L1|haut|mensch` · `mensch-L1|stoff_{233047,2a2c30,e8e6e0}|mensch` · beide Beipacks (`leibV`); es fallen
`mensch-L0|joint|arm1` · `mensch-L0|joint|arm-1` · `mensch-L1|joint|mensch` (die Kugeln liegen in der Haut). Die Stufen tragen
ihre Zeile (L0 39 995 → 39 996, L1 13 994 → 13 997); was unter dem Stoff fiel, trägt jetzt Kopf und Hände (Kopf-Haut 4 214 →
4 926, Hände 3 264/3 222 → 3 816/3 768 Dreiecke). Alle übrigen 448 Klassen byte-gleich (jedes Tier, jedes Gelenk). Zahl
(`artifacts/profiband/welle-95/labor-welt-mensch/naht-{vorher,nachher}.json`, sieben ROM-Posen des Labors, L0): Haut-Ecken, die
aus ihrem Stoff treten, 1 749 → 26.

Vertrags-Akt A4 (16.10.2026, KOPF_SOLL — der Kopf hält sein Gesetz, Soll-Tafel mensch-kopf gesicht 0,5 → 1): (1) DIE HÖHLE IST
HAUT: die Höhlen-Kugeln (Klasse socket) werden nicht mehr gegossen, ihr Ton liegt als Vertex-Farbe auf der Kopf-Haut (koerper
`kopfHaut.hoehleSaum`) — es fällt `mensch-L0|socket|head` (672 Dreiecke), die Stufe L0 verteilt sie im Budget neu (39 994 →
39 994: Kopf-Haut 6 960 → 7 106, Hände 4 632/4 574 → 4 718/4 660, Haut 2 494 → 2 540, Stoffe 7 884/7 052/1 478 → 8 032/7 184/1 506).
(2) Die Lider an den Limbus (koerper `auge.lid`): je Stufe die vier Lid-Gelenke. (3) Der Mund an der Farkas-Lage (`gesicht.mundTiefer`)
und der Haut-Saum (`HAUT_LOOK.sssAmt`): `mensch-L1|{skin,shadow,lips}|mensch` (Dreiecke gleich). Neu geprägt NUR diese 18 Schlüssel,
461 → 460 Klassen; alle übrigen 442 byte-gleich (jedes Tier, beide Mensch-Beipacks mit `leibV`), Ratsche `ofen` 461 → 460 Fälle.

Vertrags-Akt mensch.K4 (30.10.2026, die Farbe folgt dem Samen, das Gesicht auf 6 m — Stationen mensch.K4#1/#2): (1) DER TON JE
ECKE: jede Ecke des Menschen trägt `aTon` (koerper `MENSCH_TON`/`menschTon`: Haut · Lippe · Höhle · Braue · Haar · drei
Kleid-Zonen · fest), der Stoff jedes Bewohners färbt sie nach der Palette seines Samens (`menschPalette`, die Ton-Tafel des
Stamms). (2) DAS GESICHT: die Iris kreisförmig und vor dem Augapfel (`auge.iris`), der Augapfel 2 mm vor (`auge.zurueck`
0,04 → 0,03), der Lid-Schatten auf Sklera und Iris (`auge.schatten`), der Rand der Lider am Augapfel 6 mm bei 0,25 ihres Tons
(`auge.lidRand`), die Braue als Ton der Kopf-Haut (`brauTon`, `brauSaum`), die Höhle unter dem Brauen-Bogen (`brauBogen`) bei
−8/+5 (ΔL*/Δa*), die Lippe −13 L* mit roter Mund-Linie (`KOPF_TON.mundLinie` [0,6, 0,2, 0,2], `mundSpalt` 0,45), die Verdeckung
der Kopf-Haut aus ihrem Feld entlang des Gradienten und zum Himmel (`kopfHaut.verdeckung`, `oben` 1, `staerke` 2). Neu geprägt
NUR die 64 Mensch-Schlüssel (L0 26 · L1 20 · L2 9 · L3 9, mit den Gelenken von Augapfel, Iris und Lidern), Dreiecke gleich, Ecken
gleich bis auf den Leib der Mengen-Stufe (L2 952 → 951); alle übrigen 446 Klassen byte-gleich (jedes Tier, beide Mensch-Beipacks),
510 → 510 Klassen.

Vertrags-Akt haar.K2 (01.11.2026, das Haar liegt — Station haar.K2#1): die Strähnen der Schalen-Zeilen (koerper `HAAR_STRICH`)
liegen je als EIN Band auf der Kappe, in der Zone, in der die Kopf-Haut den Ton der Kappe trägt (foundry-core `__streuGeo`
`liegt`, `zone`). Neu geprägt NUR acht Klassen der L0: `mensch-L0|hair|head` 4 896/2 568 → 5 740/2 990 Ecken/Dreiecke und die
sieben Hüllen, die die Zeile 40 000 am selben Anteil hält (je −1,2 %); 502 Klassen byte-gleich.

Vertrags-Akt w28-mensch-samen (12.11.2026, die Folge der Lagen unter dem Arm — gate:mensch-anatomie RUHE `durch`): die Anlage
(koerper `armAnlage`) legt die Hüllen des Rumpfs unter dem ruhenden Arm in ihre Folge — die äußerste Lage weicht um ihre Lage
(wie bisher), jede Lage darunter um ihren Rest zu ihr mehr, die Haut am tiefsten; bis hier wich jeder Stoff um SEINE Lage und
die Haut um nichts (die Haut lag in der Mulde ÜBER dem Hemd, die Hose über dem Saum des Hemds: 49 / 36 Ecken der Rumpf-Haut
über dem Stoff an den schweren Körpern von ARM_RUHE.koerper → 0). Neu geprägt NUR zwei Klassen: `mensch-L0|stoff_2a2c30|mensch`
und `mensch-L1|stoff_2a2c30|mensch` (die Hose der Start-Tracht: 0,024 → 0,040 E unter dem Arm, unter dem Hemd); 508 Klassen
byte-gleich (das Hemd ist die äußerste Lage, die Haut der Start-Tracht trägt keine Rumpf-Ecke an der Anlage).

Vertrags-Akt w28-leib-nah (13.11.2026, das Kleid-Gesetz — gate:mensch-anatomie KLEID): Saum und Bund sind LINIEN des Kleids
(koerper `kleidZonen` `saum`, `bund`; der Ofen schneidet die Haut-Region an ihrer Ebene, `__stoffAusHaut`) — bis hier war
jeder Rand die Grenze der Haut-Region seiner Teile (der untere Rand des Hemds lief als zwei Ringe um die Schenkel, der Bund
der Hose 1 cm wellig). Das Hemd endet 0,3 E unter dem Bund als EIN Ring (Streuung der Höhe 0,25 → 0,009 E), die Hose endet
unter ihm 0,12 E über seinem Saum und läuft dort zur Haut aus (`unter`; 57 Ecken der Hose über dem Hemd in der Mulde unter
dem ruhenden Arm → 0), der Relief-Leser liest jeden Stoff an der Soll-Hebung seiner Ecken (`leibRelief` `heb`). Der Poncho
ist Stoff aus der Haut mit Weite (keine Klasse des Goldens trägt ihn: die Start-Tracht ist das Hemd). Neu geprägt NUR acht
Klassen: `mensch-L0|{haut,stoff_233047,stoff_2a2c30,stoff_e8e6e0}|mensch` und dieselben vier der L1 (Hemd 7 178 → 7 472,
Hose 8 762 → 8 444, Haut des Leibs 3 782 → 3 745, Schuh 2 274 → 2 334 Dreiecke: die Zeile 40 000 hält ihren Anteil); 502
Klassen byte-gleich (jedes Tier, jedes Gelenk, Kopf und Hände).

Vertrags-Akt w28-leib-nah, zweiter (13.11.2026, der Schuh — gate:mensch-anatomie KLEID `schuhLage` · `schuhSohle` ·
`schuhSchaft`): der Schuh ist der Guss des Fußes, jede Form um die Dicke seiner Zone gehoben (koerper `kleidZonen`: `dicke`
0,05, die Linie `schaft` 0,06 E über dem Gelenk, `sohle`; der Ofen gießt ihn bei der Fuß-Haut auf ihrem Raster, die Sohle
über `__sohleFlach`) — bis hier die letzte Voxel-Hülle über Teil-Punkten (`backeHuelle`: EIN Netz beider Füße an den
Gewichten der Beine). Mit ihm fielen der Weg und seine Maschine (Kern: dilatieren, erodieren, füllen, weichzeichnen) und die
Zonen-Zahlen `inflate` und `abstand`; eine Zone ohne Dicke wirft. Der Satz der Menge las diese Auflage schon (0,05): die
Stufen 2 und 3 sind byte-gleich. Elf Zeilen des Goldens (acht neu geprägt, eine fiel, zwei neu): `mensch-L0|stoff_e8e6e0|mensch` fiel (2 334 Dreiecke), neu
`mensch-L0|stoff_e8e6e0|{ankle1,ankle-1}` (je Fuß am Gelenk, 1 000 und 998 — der Deckel des Fußes, koerper `haushalt`; über
der Linie des Schafts staucht der Guss wie an der Sohle auf 2 %: als Ebene kippte `ankle-1` an ±1 ULP von hypot);
`mensch-L0|{haut,stoff_233047,stoff_2a2c30}|mensch` tragen den freien Anteil der Zeile (3 745 → 3 809, 7 472 → 7 598,
8 444 → 8 588); in der L1 der Schuh 956 → 700 (derselbe Deckel), `skin|mensch` 4 192 → 4 032 (die Fessel stand unter dem
Schuh als rohe Kugel), Haut, Hemd und Hose mit dem freien Anteil (1 841 → 1 943, 2 696 → 2 844, 3 032 → 3 198); 501 Klassen
byte-gleich, das Golden trägt 511.

Vertrags-Akt w28-kopf-kalotte (14.11.2026, die Kalotte — gate:mensch-anatomie KALOTTE `kalotteBreite` · `kalotteHalt` ·
`scheitelHalt` · `ohrStand`): die Kopfbreite gehört der Kalotte (koerper `MENSCH_GESTALT.schaedel`: `breit` 1,165 — die
Kugel des Schädels trägt die Breite, `hinten` 0,02 — ihre Mitte hinter der Mitte des Kopfs, `schlaefe` 0,955 — die Schläfe
liegt in ihr; `ohr.ab` 0,02 und `ohr.neig` 0,18 — das Ohr setzt an ihrer Seite an und steht oben ab; die Kappe des Haars
trägt Breite und Lage der Kalotte). Bis hier trug die Schläfe die Breite: das spitze Ei mit Schläfen-Lappen — am kahlen
Guss hielt die Kuppel auf 0,76–0,80 kH 0,760 ihrer Breite und auf 0,86–0,90 kH 0,628; jetzt 0,882 und 0,715.
Sechzehn Zeilen des Goldens neu geprägt, alle am Menschen, die Klassen-Zahl bleibt 511 und jede Stufe hält ihre Zeile
(39 990/40 000 · 13 997/14 000 · 1 700 · 360): in der L0 `hair|head` 2 654 → 2 694 und `haut|head` 7 665 → 7 625 (zusammen
10 319 davor wie danach: der Kopf hält seinen Anteil der Zeile), `haut|mensch`, `stoff_233047|mensch`
und der Beipack bei gleicher Dreieck-Zahl; in der L1 `skin|mensch` 4 032 → 4 192, dafür `haut` 1 943 →
1 915, `stoff_233047` 2 844 → 2 782 und `stoff_2a2c30` 3 198 → 3 128 (der freie Anteil der Zeile), `socket`, `hair` und
der Beipack bei gleicher Zahl; der Satz der Menge `mensch-L2|leib` und `mensch-L3|leib` bei 1 700 und 360 (der Kopf der
Hülle ist breiter) samt Beipack. 495 Klassen byte-gleich. Die Neigung des Ohrs trägt die Gruppe seiner Haut-Formen
(Muschel, Tragus, Läppchen); mit der Mulde gedreht kippte `mensch-L1|socket|mensch` an ±1 ULP von cos und sin (273 > 272,
234 > 233) — die Ratsche steht unverändert (cos 272 · sin 233).

Vertrags-Akt w28-gesicht (14.11.2026, das Gesicht — gate:mensch-anatomie KOPF `lidSpalt` · `haarHaube` · `hautFleck`):
das Lid ist eine Schale hinter dem Augapfel (koerper `auge.lid` = { oben, unten, winkel, hinten }, `_lidSchale`: ihr Schnitt
mit ihm ist der Rand des Lids), der Lidschlag wandert (`lidLage`, Wirt und Labor lesen ihn); die Verdeckung der Kopf-Haut
zählt halb (`kopfHaut.verdeckung.staerke` 2 → 1, `hoehleSaum` 0,8 → 0,4, `KOPF_TON.hoehle`); das Lippenrot ist schmaler und
ruhiger (`gesicht.lippe` 0,55 → 0,4, `KOPF_TON.lippe`); die Nase trägt Wurzel, Rücken, Spitze und Flügel (`gesicht.naseRuecken`
· `naseSpitze` · `naseFluegel`); die Kappe des Haars zählt nur über der Linie von Schläfe und Nacken (koerper `HAAR_GRENZE`,
foundry `__unterHaarGrenze`) — in der Kopf-Haut der Nah-Stufe, im Leib der Menge und als Netz der Grobstufe. Bis hier lagen
zwei flache Ellipsoide über und unter dem Augapfel (die Lidspalte Höhe / Breite 0,61, jetzt 0,44), die Haut-Ecken neben dem
Mund standen zu 15,7 % unter 60 % des hellen Tons (jetzt 0,4 %), und der Afro trug seinen Ton über Wange, Kiefer und Hals
(`haarHaube` 0,40, jetzt 0). 44 Zeilen des Goldens neu geprägt, alle am Menschen, die Klassen-Zahl bleibt 511 und jede Stufe
hält ihre Zeile (39 990/40 000 · 13 996/14 000 · 1 700 · 360): 37 Zeilen bei gleicher Dreieck-Zahl (Augapfel, Iris, Lider,
Haut, Stoff, die Gelenke der Lider und der Beipack jeder Stufe: Form und Lage der Lider, die Töne), sieben mit anderer — in
der L0 `hair|head` 2 694 → 2 654 und `haut|head` 7 625 → 7 665 (zusammen 10 319 davor wie danach); in der L1 `skin|mensch`
4 192 → 3 952 (die vier Lider fallen: die Grobstufe gießt keine), `hair` 272 → 259 (die Dreiecke der Kappe unter der
Haar-Grenze), dafür `haut` 1 915 → 1 971, `stoff_233047` 2 782 → 2 874 und `stoff_2a2c30` 3 128 → 3 232 (der freie Anteil
der Zeile). 467 Klassen byte-gleich, die Plattform-Ratsche steht unverändert (cos 272 · sin 233).

## Invarianten des Gates

- **Determinismus:** ein frischer Ofen (neuer vm-Kontext) gießt jede Klasse byte-gleich.
- **Samen-Invarianz:** Samen 7 == Samen 1 je Klasse — der Ofen liest den Samen nie (Synthese §2.3
  „Gestalten ehrlich"). Wird der Samen eine Achse, bricht das Golden bewusst (Vertrags-Akt).
- **Plattform:** Math.pow ±1 ULP kippt keine Klasse (seit dem Raster des Schädel-Radius in
  `tetrapoda-core.js`, `skullR`, S1); sin/cos stehen benannt in `spec/asset-contract/plattform-ratsche.json`
  (Satz `ofen`, Soll 0). Node 22 (CI) und Node 24 (lokal) gießen dieselben Bytes.
- **Selbst-Test** (`--selftest`): ein verschobenes Gelenk (wolf L0 `earL` +1 cm, Skelett und Haut am
  Gelenk) ist rot genau an `gelenk|earL` und den Klassen am Gelenk `earL`; eine falsche Stoff-Zuordnung
  (der Zahn am Kopf als `zahnfleisch`) ist rot an `zahn|headGroup` (fehlt) und `zahnfleisch|headGroup`;
  ein korruptes Golden ist rot an genau seiner Klasse.

## Laufzeit

Node-DIREKT im vm-Kontext wie der Foundry-Worker (three r128 · phyto-core · koerper-core · tetrapoda-core ·
foundry-core), das Math des Gates (die Plattform-Probe erreicht den Guss). Kein Browser.
