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
bleibt eine Hülle und ERBT die Gewichte der Haut (`__stoffErbtHaut`, das Lab-Gesetz `_inheritWeights` + `_smoothInfl`).
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
