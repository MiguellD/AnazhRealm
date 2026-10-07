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
10 Beipacks.

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
